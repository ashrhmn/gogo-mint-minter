export const RPC_URLS: { [chainId: number]: string } = {
  1: `https://mainnet.infura.io/v3/${
    import.meta.env.NEXT_PUBLIC_INFURA_KEY || "523cf9d9caac42d08bf74057b72a8218"
  }` as string,
  5: `https://goerli.infura.io/v3/${
    import.meta.env.NEXT_PUBLIC_INFURA_KEY || "523cf9d9caac42d08bf74057b72a8218"
  }` as string,
  56: `https://bsc-dataseed.binance.org/`,
  43114: `https://api.avax.network/ext/bc/C/rpc`,
  97: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
  // 80001: `https://matic-mumbai.chainstacklabs.com`,
  // 4002: `https://rpc.testnet.fantom.network`,
  43113: `https://api.avax-test.network/ext/bc/C/rpc`,
  137: `https://polygon-rpc.com`,
  2611: `https://dataseed2.redlightscan.finance/`,
  8457: `https://dataseed-testnet.redlightscan.finance/`,
};
