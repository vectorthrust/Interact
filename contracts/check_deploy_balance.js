const { ethers } = require("hardhat");

// Address that corresponds to your private key for deployment
const DEPLOY_ADDRESS = "0xC67C47f6901eC96A645bd1144D83E47A89258709";

async function main() {
  console.log("💰 Checking Deployment Address Balance");
  
  try {
    // Connect to Hedera testnet
    const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api");
    
    console.log(`👤 Deploy Address: ${DEPLOY_ADDRESS}`);
    
    // Get balance
    const balance = await provider.getBalance(DEPLOY_ADDRESS);
    const formattedBalance = ethers.utils.formatEther(balance);
    
    console.log(`💎 Balance: ${formattedBalance} HBAR`);
    
    // Check if sufficient for deployment
    const minRequired = ethers.utils.parseEther("0.1");
    const hasSufficientBalance = balance.gte(minRequired);
    
    if (hasSufficientBalance) {
      console.log(`✅ Sufficient for deployment!`);
      console.log(`🚀 Ready to deploy: npx hardhat run scripts/deploy.js --network hedera-testnet`);
    } else {
      console.log(`❌ Need more HBAR (0.1+ needed for deployment)`);
      console.log(`💸 Transfer 1 HBAR from HashPack to this address`);
    }
    
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