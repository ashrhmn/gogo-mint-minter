import { getParsedEthersError } from "@enzoferey/ethers-error-parser";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  getCurrentSaleByUid,
  getProjectByUid,
} from "../services/project.service";
import FullScreenSpinner from "../components/FullScreenSpinner";
import { handleError } from "../utils/error.utils";
import { useEffect, useState } from "react";
import { BigNumber, providers } from "ethers";
import { shortenIfAddress, useEthers } from "@usedapp/core";
import {
  JsonRpcProvider,
  StaticJsonRpcProvider,
} from "@ethersproject/providers";
import { RPC_URLS } from "../configs/app.config";
import {
  Collection1155,
  Collection1155__factory,
  Collection721,
  Collection721__factory,
} from "../ContractFactory";
import toast, { LoaderIcon } from "react-hot-toast";
import { formatEther, parseEther } from "ethers/lib/utils";
import { prepareMint } from "../services/mint.service";
import { normalizeString } from "../utils/String.utils";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { multiply } from "../utils/Number.utils";
import { ZodUtils } from "../utils/zod.utils";
import { z } from "zod";

const MintPage = () => {
  const { uid } = useParams();

  const [refetcher, setRefetcher] = useState(false);

  const {
    data: project,
    status: projectFetchStatus,
    error: projectFetchError,
    refetch: refetchProject,
  } = useQuery({
    queryKey: ["project", uid || ""],
    queryFn: () => getProjectByUid(uid || ""),
    enabled: !!uid,
  });

  const {
    data: currentSale,
    status: currentSaleStatus,
    error: currentSaleError,
    refetch: refetchCurrentSale,
  } = useQuery({
    queryKey: ["current-sale", uid || ""],
    queryFn: () => getCurrentSaleByUid(uid || ""),
    enabled: !!uid,
  });

  useEffect(() => {
    const contract = !project
      ? null
      : project.collectionType === "721"
      ? Collection721__factory.connect(
          project.address,
          new StaticJsonRpcProvider(RPC_URLS[project.chainId])
        )
      : null;
    if (contract) {
      contract.on(contract.filters.Transfer(), () => setRefetcher((r) => !r));
    }

    return () => {
      if (contract) {
        contract.removeAllListeners();
      }
    };
  }, []);

  useEffect(() => {
    const contract = !project
      ? null
      : project.collectionType === "1155"
      ? Collection1155__factory.connect(
          project.address,
          new StaticJsonRpcProvider(RPC_URLS[project.chainId])
        )
      : null;
    if (contract) {
      contract.on(contract.filters.TransferSingle(), () =>
        setRefetcher((r) => !r)
      );
    }

    return () => {
      if (contract) {
        contract.removeAllListeners();
      }
    };
  }, []);

  const { account, chainId, library, activateBrowserWallet, activate } =
    useEthers();

  const [mintCount, setMintCount] = useState(1);
  const [mintBgProc, setMintBgProc] = useState(0);
  const [mintConfig, setConfig] = useState({
    userBalance: -1,
    claimedSupply: -1,
  });
  const [userEtherBalance, setUserEtherBalance] = useState<
    BigNumber | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      if (!library || !account) return;
      const signer = (library as JsonRpcProvider).getSigner(account);
      const balance = await signer.getBalance();
      setUserEtherBalance(balance);
    })();
  }, [account, library, chainId, refetcher]);

  useEffect(() => {
    (async () => {
      if (
        !project ||
        !project.address ||
        !project.chainId ||
        !RPC_URLS[project.chainId] ||
        !account ||
        !chainId
      )
        return;
      setConfig((c) => ({ ...c, userBalance: -1 }));
      const contract =
        project.collectionType === "721"
          ? Collection721__factory.connect(
              project.address,
              new providers.StaticJsonRpcProvider(RPC_URLS[project.chainId])
            )
          : Collection1155__factory.connect(
              project.address,
              new providers.StaticJsonRpcProvider(RPC_URLS[project.chainId])
            );
      const [userBalance] = (
        await Promise.all([
          project.collectionType === "721"
            ? (contract as Collection721).balanceOf(account)
            : (contract as Collection1155).balanceOf(account, 0),
        ])
      ).map((v) => +v.toString());
      setConfig((c) => ({
        ...c,
        userBalance,
      }));
    })();
  }, [account, chainId, currentSale, project, refetcher]);

  useEffect(() => {
    (async () => {
      if (
        !project ||
        !project.address ||
        !project.chainId ||
        !RPC_URLS[project.chainId]
      )
        return;
      setConfig((c) => ({ ...c, userBalance: -1 }));
      const contract = Collection721__factory.connect(
        project.address,
        new providers.StaticJsonRpcProvider(RPC_URLS[project.chainId])
      );
      const [claimedSupply] = (
        await Promise.all([
          (contract as Collection721)
            .tokenId()
            .then((v) => v.toNumber() - 1)
            .catch(() => 0),
        ])
      ).map((v) => +v.toString());
      setConfig((c) => ({
        ...c,
        claimedSupply,
      }));
    })();
  }, [account, chainId, currentSale, project, refetcher]);

  useEffect(() => {
    refetchProject();
    refetchCurrentSale();
  }, [refetcher]);

  const handleMintClick = async () => {
    try {
      setMintBgProc((v) => v + 1);
      if (
        !project ||
        !project.address ||
        !project.chainId ||
        !RPC_URLS[project.chainId]
      )
        throw "Error loading project data";
      if (mintCount < 1) throw "Mint Count must be at least 1";
      if (!currentSale) throw "No Sale Running";

      if (!account || !chainId || !library) throw "Please Connect Wallet";

      if (chainId !== project.chainId)
        throw `Please connect to network ID : ${project.chainId}`;

      if (project.collectionType === "1155" && project._count.nfts === 0)
        throw "Supply not Provided";

      if (
        project.collectionType === "721" &&
        project._count.nfts - mintConfig.claimedSupply < mintCount
      )
        throw "Not enough supply";
      if (!userEtherBalance) throw "Error getting user balance";

      if (
        userEtherBalance.lt(
          parseEther((currentSale.mintCharge * mintCount).toFixed(18))
        )
      )
        throw "You do not have enough balance";

      const contract =
        project.collectionType === "721"
          ? new Collection721__factory(
              (library as JsonRpcProvider).getSigner(account)
            ).attach(project.address)
          : new Collection1155__factory(
              (library as JsonRpcProvider).getSigner(account)
            ).attach(project.address);

      const mintData = await toast.promise(
        prepareMint({
          address: account,
          mintCount,
          projectId: project.id,
        }).catch((err) => {
          console.log(err);
          if (
            ZodUtils.followsSchema(
              err,
              z.object({
                response: z.object({
                  data: z.object({
                    message: z.string(),
                  }),
                }),
              })
            )
          )
            toast.error(err.response.data.message);
          return null;
        }),
        {
          error: null,
          loading: "Preparing Mint...",
          success: null,
        },
        {
          success: { style: { display: "none" } },
          error: { style: { display: "none" } },
        }
      );

      if (!mintData) throw "Error preparing mint";

      const {
        config,
        message,
        mintChargeInWei,
        signature,
        whitelistProof,
        whitelistMintLimit,
        saleConfigProof,
      } = mintData;

      const tx = await toast.promise(
        contract.mint(
          {
            saleConfigProof,
            whitelistProof,
            numberOfMint: mintCount,
            message,
            signature,
            config,
            whitelistMintLimit,
          },
          {
            value: mintChargeInWei,
          }
        ),
        {
          error: "Error sending transaction",
          loading: "Sending transaction...",
          success: "Transaction Sent",
        }
      );

      await toast.promise(tx.wait(), {
        error: "Error completing transaction",
        loading: "Mining... (Do not close this window)",
        success: "Transaction Completed",
      });
      setRefetcher((v) => !v);
      setMintBgProc((v) => v - 1);
    } catch (error) {
      setMintBgProc((v) => v - 1);
      console.log("Minting error : ", error);
      const contractError = getParsedEthersError(error as any).context;
      if (!!contractError && typeof contractError === "string")
        toast.error(contractError);
      else if (typeof error === "string") toast.error(error);
      else toast.error("Error minting");
    }
  };

  if (!uid) throw new Error("Invalid UID");
  if (projectFetchStatus === "error") handleError(projectFetchError);
  if (projectFetchStatus === "loading") return <FullScreenSpinner />;
  if (currentSaleStatus === "error") handleError(currentSaleError);
  if (currentSaleStatus === "loading") return <FullScreenSpinner />;
  if (!project || mintConfig.claimedSupply === -1) return <FullScreenSpinner />;

  return (
    <div className="-translate-y-24">
      <div className="relative h-40 sm:h-60 md:h-80 mx-auto transition-all">
        {!!project.bannerUrl && (
          <img
            src={project.bannerUrl}
            alt=""
            // objectFit="cover"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {!project.bannerUrl && <div className="h-full w-full bg-gray-600" />}
      </div>
      <div
        className={`relative h-40 rounded overflow-hidden mx-auto aspect-square shadow-xl transition-all -translate-y-8 md:-translate-y-16 ${
          !!project.bannerUrl ? "" : ""
        }`}
      >
        {!!project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-700 border-2 border-gray-500 rounded" />
        )}
      </div>
      <h1 className="font-bold text-4xl text-center my-4 p-1">
        {project.name}
      </h1>
      <p className="text-center font-medium p-1">{project.description}</p>
      {!!account && chainId !== project.chainId && (
        <h2 className="text-center text-red-600 p-1">
          Please Switch to network ID : {project.chainId}
        </h2>
      )}
      <div className="mx-4">
        <div className="mx-auto max-w-md border-2 border-gray-600 bg-gray-700 rounded-xl p-4 mt-10">
          <div className="divide-y-2 divide-gray-600 space-y-2">
            {account ? (
              <div className="flex justify-between items-center">
                <h1>Wallet</h1>
                <div className="flex">
                  {shortenIfAddress(account)}
                  <span className="flex items-center">
                    ({" "}
                    {!!userEtherBalance ? (
                      (+formatEther(userEtherBalance)).toFixed(2)
                    ) : (
                      <LoaderIcon />
                    )}{" "}
                    ETH )
                  </span>
                </div>
              </div>
            ) : (
              <button
                className="w-full bg-blue-500 rounded text-white min-h-[2.5rem] hover:bg-blue-600 transition-colors"
                onClick={() => {
                  if (!!(window as any).ethereum) {
                    activateBrowserWallet();
                  } else {
                    activate(
                      new WalletConnectConnector({
                        rpc: RPC_URLS,
                        qrcode: true,
                      })
                    )
                      .then(console.log)
                      .catch(console.error);
                  }
                }}
              >
                Connect Wallet
              </button>
            )}
            {project.collectionType === "721" && (
              <>
                <div className="flex justify-between items-center">
                  <h1>Total Supply</h1>
                  <h1>{project._count.nfts}</h1>
                </div>
                <div className="flex justify-between items-center">
                  <h1>Already Claimed</h1>
                  <h1>{mintConfig.claimedSupply}</h1>
                </div>
                <div className="flex justify-between items-center">
                  <h1>Unclaimed</h1>
                  <h1>{project._count.nfts - mintConfig.claimedSupply}</h1>
                </div>
              </>
            )}
            <div className="flex justify-between items-center">
              <h1>You own from this collection</h1>
              <h1>
                {!account ? (
                  "-"
                ) : mintConfig.userBalance === -1 ? (
                  <LoaderIcon />
                ) : (
                  mintConfig.userBalance
                )}
              </h1>
            </div>
            {/* {!!currentSale && !!account && currentSale.saleType !== "public" && (
          <div className="flex justify-between items-center">
            <h1>
              Mint Limit for {shortenIfAddress(account)} in this sale
            </h1>
            <h1>
              {currentSale.whitelist.find((wl) => wl.address === account)
                ?.limit || 0}
            </h1>
          </div>
        )} */}
          </div>
          <div className="flex flex-col justify-between items-center border-2 border-gray-600 rounded p-1 m-1">
            <h1>Sale Status</h1>
            <h1 className="text-center text-lg">
              {!!currentSale
                ? normalizeString(currentSale.saleType)
                : "No Sale is running"}
            </h1>
          </div>

          <div className="flex gap-4 justify-center select-none bg-gray-700 my-4 py-3 text-gray-200 rounded p-2">
            <div className="flex gap-4 justify-center items-center">
              <button
                className="border-2 border-gray-400 rounded-full w-8 h-8 flex justify-center items-center hover:bg-gray-400 hover:text-black transition-colors disabled:cursor-not-allowed"
                onClick={() => setMintCount((v) => (v === 1 ? 1 : v - 1))}
                disabled={mintBgProc > 0}
              >
                -
              </button>
              <input
                type="number"
                className="w-20 text-center text-2xl bg-transparent border-2 border-gray-300 rounded"
                value={mintCount || ""}
                onChange={(e) =>
                  setMintCount(
                    isNaN(e.target.valueAsNumber)
                      ? 0
                      : Math.max(1, +e.target.valueAsNumber.toFixed(0))
                  )
                }
              />
              <button
                className="border-2 border-gray-400 rounded-full w-8 h-8 flex justify-center items-center hover:bg-gray-400 hover:text-black transition-colors disabled:cursor-not-allowed"
                onClick={() => setMintCount((v) => v + 1)}
                disabled={mintBgProc > 0}
              >
                +
              </button>
            </div>
          </div>
          <button
            className="bg-teal-700 font-medium text-4xl text-white rounded hover:bg-teal-600 transition-colors w-full py-4 disabled:bg-teal-400 disabled:text-gray-500 disabled:cursor-not-allowed"
            onClick={handleMintClick}
            disabled={mintBgProc > 0}
          >
            {!account ? "Wallet Not Connected" : "Mint "}
            {!!currentSale && !!account && (
              <span className="text-lg">
                {mintCount < 1 ? (
                  <>Invalid</>
                ) : (
                  <>
                    {+(currentSale.mintCharge * mintCount).toFixed(8) === 0 ? (
                      "(Free)"
                    ) : (
                      <>
                        (
                        {
                          +multiply(currentSale.mintCharge, mintCount).toFixed(
                            8
                          )
                        }{" "}
                        ETH)
                      </>
                    )}
                  </>
                )}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="h-20"></div>
    </div>
  );
};

export default MintPage;
