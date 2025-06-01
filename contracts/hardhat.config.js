require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

const { PRIVATE_KEY, HEDERA_PRIVATE_KEY, INFURA_API_KEY, ETHERSCAN_API_KEY } = process.env;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    // Flow Networks
    "flow-testnet": {
      url: "https://testnet.evm.nodes.onflow.org",
      chainId: 545,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
    "flow-mainnet": {
      url: "https://mainnet.evm.nodes.onflow.org",
      chainId: 747,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
    // Rootstock Networks
    "rootstock-testnet": {
      url: "https://public-node.testnet.rsk.co",
      chainId: 31,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gasPrice: 60000000, // 0.06 gwei
      gas: 6800000,
    },
    "rootstock-mainnet": {
      url: "https://public-node.rsk.co",
      chainId: 30,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gasPrice: 60000000, // 0.06 gwei
      gas: 6800000,
    },
    // Flare Networks (for FTSO integration)
    "flare-testnet": {
      url: "https://coston2-api.flare.network/ext/C/rpc",
      chainId: 114,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    "flare-mainnet": {
      url: "https://flare-api.flare.network/ext/C/rpc",
      chainId: 14,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // Hedera Testnet
    "hedera-testnet": {
      url: "https://testnet.hashio.io/api",
      chainId: 296,
      accounts: HEDERA_PRIVATE_KEY ? [HEDERA_PRIVATE_KEY] : [],
      gasPrice: 540000000000, // 540 gwei (Hedera minimum)
      gas: 3000000,
    },
  },
  etherscan: {
    apiKey: {
      // Add API keys for block explorers when available
      mainnet: ETHERSCAN_API_KEY,
      rinkeby: ETHERSCAN_API_KEY,
      // Flow and Rootstock explorers don't use Etherscan API yet
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
}; 