import { Injectable } from '@nestjs/common';
import { isAddress, keccak256 } from 'ethers/lib/utils';
import MerkleTree from 'merkletreejs';
import { ISaleConfigInput, IWhiteList } from 'src/@types/types';
import {
  getSaleConfigHash,
  getSolVersionConfig,
  getWhitelistHash,
} from 'src/utils/Sol.utils';
import { bufferTohex } from 'src/utils/String.utils';

@Injectable()
export class MerkleTreeService {
  getWhitelistTree = (wls: IWhiteList[]) => {
    try {
      const validWls = wls.filter((wl) => isAddress(wl.address));
      if (wls.length !== validWls.length) throw 'Some addresse(s) are invalid';

      const leaves = validWls.map((wl) => keccak256(getWhitelistHash(wl)));
      return new MerkleTree(leaves, keccak256, { sortPairs: true });
    } catch (error) {
      console.log('Error generating whitelist tree : ', error);
      throw error;
    }
  };

  getWhitelistRoot = (wls: IWhiteList[]) => {
    try {
      const tree = this.getWhitelistTree(wls);
      return bufferTohex(tree.getRoot());
    } catch (error) {
      console.log('Error generating whitelist root : ', error);
      throw error;
    }
  };

  getWhitelistProof = (wls: IWhiteList[], wl: IWhiteList) => {
    try {
      const tree = this.getWhitelistTree(wls);
      return tree
        .getProof(keccak256(getWhitelistHash(wl)))
        .map((p) => bufferTohex(p.data));
    } catch (error) {
      console.log('Error generating proof : ', error);
      throw error;
    }
  };

  getSaleConfigTree = (saleConfigs: ISaleConfigInput[]) => {
    return new MerkleTree(
      saleConfigs.map((saleconfig) =>
        keccak256(getSaleConfigHash(getSolVersionConfig(saleconfig))),
      ),
      keccak256,
      { sortPairs: true },
    );
  };

  getSaleConfigRoot = (saleConfigs: ISaleConfigInput[]) => {
    return bufferTohex(this.getSaleConfigTree(saleConfigs).getRoot());
  };

  getSaleConfigProof = (
    saleConfigs: ISaleConfigInput[],
    saleConfig: ISaleConfigInput,
  ) => {
    return this.getSaleConfigTree(saleConfigs)
      .getProof(keccak256(getSaleConfigHash(getSolVersionConfig(saleConfig))))
      .map((p) => bufferTohex(p.data));
  };
}
