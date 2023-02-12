import { ethers } from 'ethers';
import {
  isAddress,
  keccak256,
  parseEther,
  solidityKeccak256,
} from 'ethers/lib/utils';
import { ISaleConfigInput, ISaleConfigSol, IWhiteList } from 'src/@types/types';
import { bufferTohex } from './String.utils';
import MerkleTree from 'merkletreejs';

export const getWhitelistHash = (wl: IWhiteList) =>
  solidityKeccak256(['address', 'uint256'], [wl.address, wl.limit]);

export const getSolVersionConfig = (
  config: ISaleConfigInput,
): ISaleConfigSol => ({
  saleIdentifier: config.uuid,
  enabled: config.enabled,
  endTime: +config.endTime.toFixed(0),
  startTime: +config.startTime.toFixed(0),
  maxMintInSale: config.maxMintInSale,
  maxMintPerWallet: config.maxMintPerWallet,
  mintCharge: parseEther(config.mintCharge.toString()).toString(),
  whitelistRoot:
    config.saleType === 'public'
      ? ethers.constants.HashZero
      : bufferTohex(
          new MerkleTree(
            config.whitelistAddresses
              .filter((wl) => isAddress(wl.address))
              .map((wl) => keccak256(getWhitelistHash(wl))),
            keccak256,
            { sortPairs: true },
          ).getRoot(),
        ),
  tokenGatedAddress: config.tokenGatedAddress,
});

export const getSaleConfigHash = (conf: ISaleConfigSol) =>
  solidityKeccak256(
    [
      'string',
      'bool',
      'uint256',
      'uint256',
      'uint256',
      'bytes32',
      'uint256',
      'uint256',
      'address',
    ],
    [
      conf.saleIdentifier,
      conf.enabled,
      conf.startTime,
      conf.endTime,
      conf.mintCharge,
      conf.whitelistRoot,
      conf.maxMintPerWallet,
      conf.maxMintInSale,
      conf.tokenGatedAddress,
    ],
  );
