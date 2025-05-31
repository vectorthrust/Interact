const { ethers } = require("hardhat");

// Your address
const USER_ADDRESS = "0x59524219693A999Fa9087db79b485b99aC935606";

// Network configs
const NETWORKS = {
  rootstock: {
    rpc: "https://public-node.testnet.rsk.co",
    name: "Rootstock Testnet",
    token: "tRBTC",
    chainId: 31,
    faucet: "https://faucet.rootstock.io/"
  },
  flare: {
    rpc: "https://flare-api.flare.network/ext/C/rpc",
    name: "Flare Mainnet",
    token: "FLR",
    chainId: 14,
    faucet: "Need to buy FLR"
  },
  flow: {
    rpc: "https://mainnet.evm.nodes.onflow.org",
    name: "Flow Mainnet", 
    token: "FLOW",
    chainId: 747,
    faucet: "Need to buy FLOW"
  }
};

async function checkBalance(network) {
  console.log(`\n💰 Checking ${network.name} (${network.token})`);
  
  try {
    const provider = new ethers.providers.JsonRpcProvider(network.rpc);
    const balance = await provider.getBalance(USER_ADDRESS);
    const formattedBalance = ethers.utils.formatEther(balance);
    
    console.log(`   Balance: ${formattedBalance} ${network.token}`);
    
    // Check if balance is sufficient for testing (0.01 + gas)
    const minRequired = ethers.utils.parseEther("0.015"); // 0.01 for task + 0.005 for gas
    const hasSufficientBalance = balance.gte(minRequired);
    
    if (hasSufficientBalance) {
      console.log(`   ✅ Sufficient for testing (${ethers.utils.formatEther(minRequired)}+ needed)`);
    } else {
      console.log(`   ❌ Need more tokens (${ethers.utils.formatEther(minRequired)}+ needed)`);
      console.log(`   💧 Faucet: ${network.faucet}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error checking balance: ${error.message.split('(')[0]}`);
  }
}

async function main() {
  console.log("🔍 Checking Wallet Balances");
  console.log(`👤 Address: ${USER_ADDRESS}`);
  
  for (const [key, network] of Object.entries(NETWORKS)) {
    await checkBalance(network);
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
  }
  
  console.log("\n💡 To get testnet tokens:");
  console.log("1. 🚰 Rootstock Testnet: https://faucet.rootstock.io/");
  console.log("2. 💸 Flare Mainnet: Buy FLR on exchanges");
  console.log("3. 💸 Flow Mainnet: Buy FLOW on exchanges");
  
  console.log("\n🎯 For testing, start with Rootstock Testnet (free tRBTC)!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 