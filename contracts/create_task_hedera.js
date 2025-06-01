const { ethers } = require("hardhat");

// Hedera Testnet Contract
const CONTRACT_ADDRESS = "0x0Cba9f72f0b55b59E9F92432626E9D9A9Bc419e8";

async function main() {
  console.log("🔥 Creating Test Task on Hedera Testnet");
  console.log("=" .repeat(50));
  
  try {
    const [user] = await ethers.getSigners();
    console.log(`👤 User: ${user.address}`);
    
    const balance = await user.getBalance();
    console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} HBAR`);
    
    // Connect to deployed contract
    const taskEscrow = await ethers.getContractAt("TaskEscrow", CONTRACT_ADDRESS);
    
    // Create task with 0.01 HBAR
    const taskAmount = ethers.utils.parseEther("0.01");
    const description = "Test task on Hedera - Order pizza from Joe's Pizza";
    
    console.log(`\n💼 Creating task...`);
    console.log(`📝 Description: ${description}`);
    console.log(`💎 Amount: ${ethers.utils.formatEther(taskAmount)} HBAR`);
    
    const tx = await taskEscrow.createTask(description, [], {
      value: taskAmount,
      gasLimit: 300000,
      gasPrice: ethers.utils.parseUnits("540", "gwei"), // Hedera minimum
    });
    
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    
    // Get task ID from event
    const event = receipt.events?.find(e => e.event === 'TaskCreated');
    const taskId = event?.args?.taskId;
    
    console.log(`✅ Task created!`);
    console.log(`🆔 Task ID: ${taskId}`);
    console.log(`🔍 Explorer: https://hashscan.io/testnet/transaction/${tx.hash}`);
    console.log(`💵 Gas used: ${receipt.gasUsed.toString()}`);
    
    // Get task details
    const task = await taskEscrow.tasks(taskId);
    console.log(`\n📋 Task Details:`);
    console.log(`👤 User: ${task.user}`);
    console.log(`🤖 Agent: ${task.agent} (0x0 = open to all)`);
    console.log(`💰 Amount: ${ethers.utils.formatEther(task.amount)} HBAR`);
    console.log(`📝 Description: ${task.description}`);
    console.log(`📊 Status: ${task.status} (0=Open)`);
    
    console.log(`\n🎯 Next Steps:`);
    console.log(`1. Agent completes: npx hardhat run agent_complete_hedera.js --network hedera-testnet`);
    console.log(`2. User verifies: npx hardhat run user_verify_hedera.js --network hedera-testnet`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("insufficient funds")) {
      console.log("💡 Need more HBAR? Transfer from your HashPack wallet!");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 