import { NFT, Project, RoleIntegration, User } from '@prisma/client';

export interface IDeployConfigSet {
  logo: File | null;
  unrevealedImage: File | null;
  banner: File | null;
  name: string;
  revealTime: number;
  symbol: string;
  description: string;
  feeToAddress: string;
  saleWaves: ISaleConfigInput[];
  maxMintInTotalPerWallet: number;
  roayltyReceiver: string;
  roayltyPercentage: number;
  uid: string;
  collectionType: '721' | '1155';
  maxLimitCap: number;
}

export interface INftTrait {
  uuid: string;
  trait_type: string;
  value: string;
}

export interface INftMetadata {
  name: string;
  description: string;
  file: File | null;
  traits: INftTrait[];
  openSeaBgColor: string;
  openSeaExternalUrl: string;
}

export interface ProjectExtended extends Project {
  nfts: NFT[];
  owner: User;
  roleIntegrations: RoleIntegration[];
}

export interface ISaleConfig {
  status: boolean;
  startTime: number;
  endTime: number;
}

export interface MintPageConfig {
  privateMintCharge: number;
  publicMintCharge: number;
  privateSaleConfig1: ISaleConfig | null;
  privateSaleConfig2: ISaleConfig | null;
  publicSaleConfig: ISaleConfig | null;
  maxMintInPrivate: number;
  maxMintInPublic: number;
}

export interface ISaleConfigSol {
  saleIdentifier: string;
  enabled: boolean;
  startTime: number;
  endTime: number;
  mintCharge: string;
  whitelistRoot: string;
  maxMintPerWallet: number;
  maxMintInSale: number;
  tokenGatedAddress: string;
}

export interface IWhiteList {
  address: string;
  limit: number;
}

export interface ISaleConfigInput {
  uuid: string;
  enabled: boolean;
  saleType: 'private' | 'public';
  startTime: number;
  endTime: number;
  mintCharge: number;
  whitelistAddresses: IWhiteList[];
  maxMintPerWallet: number;
  maxMintInSale: number;
  tokenGatedAddress: string;
}

export interface IGuild {
  guild: {
    id: string;
    name: string;
  };
  botCanManageRole: boolean | undefined;
  guildRoles: {
    id: string;
    name: string;
  }[];
  members: {
    id: string;
    username: string;
    discriminator: string;
    isAdmin: boolean;
    canManageRole: boolean;
    roles: {
      id: string;
      name: string;
    }[];
  }[];
}

export interface IDetailedRoleIntegration {
  id: number;
  guild: {
    id: string;
    name: string;
  };
  role: {
    id: string;
    name: string;
  };
  minValidNfts: number;
  projectId: number;
  addedByUserId: number;
}
