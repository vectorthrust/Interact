const { ethers } = require("hardhat");

async function main() {
  console.log("⚡ Hedera Testnet Deployment (Manual Gas)");
  console.log("=" .repeat(50));
  
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);
  
  const balance = await deployer.getBalance();
  console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} HBAR`);
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    throw new Error("Need at least 0.1 HBAR for deployment");
  }
  
  console.log("\n🔒 Deploying TaskEscrow with manual gas...");
  
  try {
    // Get contract factory
    const TaskEscrow = await ethers.getContractFactory("TaskEscrow");
    
    // Deploy with manual gas settings for Hedera
    const taskEscrow = await TaskEscrow.deploy({
      gasLimit: 3000000,        // 3M gas limit
      gasPrice: ethers.utils.parseUnits("540", "gwei"), // 540 gwei (Hedera minimum)
    });
    
    console.log("⏳ Waiting for deployment...");
    await taskEscrow.deployed();
    
    console.log(`✅ TaskEscrow deployed: ${taskEscrow.address}`);
    console.log(`🔍 Explorer: https://hashscan.io/testnet/contract/${taskEscrow.address}`);
    
    // Save deployment
    const fs = require("fs");
    const deploymentData = {
      network: "Hedera Testnet",
      chainId: 296,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        TaskEscrow: taskEscrow.address,
      },
      gasUsed: "Manual: 3M gas limit, 540 gwei",
    };
    
    fs.mkdirSync("deployments", { recursive: true });
    fs.writeFileSync("deployments/hedera-testnet.json", JSON.stringify(deploymentData, null, 2));
    
    console.log("\n🎉 SUCCESS!");
    console.log(`📄 Contract: ${taskEscrow.address}`);
    console.log(`💾 Saved: deployments/hedera-testnet.json`);
    console.log(`🚀 Ready for testing!`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("execution reverted")) {
      console.log("\n🔧 Possible solutions:");
      console.log("1. Contract might be too large for Hedera");
      console.log("2. Constructor parameters might be invalid");
      console.log("3. Hedera EVM compatibility issues");
      console.log("\n💡 Let's try with a smaller gas limit...");
      
      try {
        console.log("🔄 Retrying with 1.5M gas...");
        const TaskEscrow = await ethers.getContractFactory("TaskEscrow");
        const taskEscrow = await TaskEscrow.deploy({
          gasLimit: 1500000,        // 1.5M gas limit
          gasPrice: ethers.utils.parseUnits("540", "gwei"), // 540 gwei (Hedera minimum)
        });
        
        await taskEscrow.deployed();
        console.log(`✅ SUCCESS with lower gas: ${taskEscrow.address}`);
        
      } catch (retryError) {
        console.error("❌ Retry also failed:", retryError.message);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 