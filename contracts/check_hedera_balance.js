const { ethers } = require("hardhat");

// Your HashPack EVM address
const EVM_ADDRESS = "0x00000000000000000000000000000000005cfcb5";

async function main() {
  console.log("💰 Checking Hedera Testnet Balance");
  
  try {
    // Connect to Hedera testnet
    const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api");
    
    console.log(`👤 HashPack EVM Address: ${EVM_ADDRESS}`);
    
    // Get balance
    const balance = await provider.getBalance(EVM_ADDRESS);
    const formattedBalance = ethers.utils.formatEther(balance);
    
    console.log(`💎 Balance: ${formattedBalance} HBAR`);
    
    // Check if sufficient for deployment (need ~0.1 HBAR for gas)
    const minRequired = ethers.utils.parseEther("0.1");
    const hasSufficientBalance = balance.gte(minRequired);
    
    if (hasSufficientBalance) {
      console.log(`✅ Sufficient for deployment (0.1+ HBAR needed)`);
      console.log(`🚀 Ready to deploy!`);
    } else {
      console.log(`❌ Need more HBAR (0.1+ needed for deployment)`);
      console.log(`💧 Transfer HBAR from your native account to this EVM address`);
      console.log(`   In HashPack: Send HBAR to ${EVM_ADDRESS}`);
    }
    
    // Get network info
    const network = await provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 