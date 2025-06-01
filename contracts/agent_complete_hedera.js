const { ethers } = require("hardhat");
require("dotenv").config();

// Hedera Testnet Contract
const CONTRACT_ADDRESS = "0x0Cba9f72f0b55b59E9F92432626E9D9A9Bc419e8";

// Agent private key from environment
const AGENT_PRIVATE_KEY = process.env.HEDERA_AGENT_PRIVATE_KEY || "0123456789012345678901234567890123456789012345678901234567890123";

async function main() {
  console.log("🤖 Agent Completing Task on Hedera Testnet");
  console.log("=" .repeat(50));
  
  try {
    // Connect to Hedera testnet
    const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api");
    
    // Create agent wallet
    const agentWallet = new ethers.Wallet(AGENT_PRIVATE_KEY, provider);
    console.log(`🤖 Agent: ${agentWallet.address}`);
    
    const balance = await agentWallet.getBalance();
    console.log(`💰 Agent Balance: ${ethers.utils.formatEther(balance)} HBAR`);
    
    // Connect to contract
    const taskEscrow = new ethers.Contract(CONTRACT_ADDRESS, [
      "function completeTask(uint256 taskId) external",
      "function tasks(uint256) external view returns (address user, address agent, uint256 amount, string description, uint8 status, uint256 createdAt, uint256 completedAt)",
      "function nextTaskId() external view returns (uint256)"
    ], agentWallet);
    
    // Get the latest task ID
    const nextTaskId = await taskEscrow.nextTaskId();
    const taskId = nextTaskId.sub(1);
    
    console.log(`\n🔍 Checking Task ID: ${taskId}`);
    
    // Get task details
    const task = await taskEscrow.tasks(taskId);
    console.log(`👤 User: ${task.user}`);
    console.log(`💰 Amount: ${ethers.utils.formatEther(task.amount)} HBAR`);
    console.log(`📝 Description: ${task.description}`);
    console.log(`📊 Status: ${task.status} (0=Open, 1=Assigned, 2=Completed)`);
    
    if (task.status !== 0) {
      console.log(`❌ Task is not open (status: ${task.status})`);
      return;
    }
    
    console.log(`\n🔧 Agent completing task...`);
    
    const tx = await taskEscrow.completeTask(taskId, {
      gasLimit: 200000,
      gasPrice: ethers.utils.parseUnits("540", "gwei"), // Hedera minimum
    });
    
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    
    console.log(`✅ Task completed by agent!`);
    console.log(`🔍 Explorer: https://hashscan.io/testnet/transaction/${tx.hash}`);
    console.log(`💵 Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check updated task status
    const updatedTask = await taskEscrow.tasks(taskId);
    console.log(`\n📋 Updated Task:`);
    console.log(`🤖 Agent: ${updatedTask.agent}`);
    console.log(`📊 Status: ${updatedTask.status} (2=Completed)`);
    
    console.log(`\n🎯 Next Step:`);
    console.log(`User verifies: npx hardhat run user_verify_hedera.js --network hedera-testnet`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("insufficient funds")) {
      console.log("💡 Agent needs HBAR for gas! Send some from your main wallet.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 