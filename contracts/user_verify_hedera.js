const { ethers } = require("hardhat");

// Hedera Testnet Contract
const CONTRACT_ADDRESS = "0x0Cba9f72f0b55b59E9F92432626E9D9A9Bc419e8";

async function main() {
  console.log("✅ User Verifying and Paying on Hedera Testnet");
  console.log("=" .repeat(50));
  
  try {
    const [user] = await ethers.getSigners();
    console.log(`👤 User: ${user.address}`);
    
    const balance = await user.getBalance();
    console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} HBAR`);
    
    // Connect to deployed contract
    const taskEscrow = await ethers.getContractAt("TaskEscrow", CONTRACT_ADDRESS);
    
    // Get the latest task ID
    const nextTaskId = await taskEscrow.nextTaskId();
    const taskId = nextTaskId.sub(1);
    
    console.log(`\n🔍 Checking Task ID: ${taskId}`);
    
    // Get task details - use getTask() for full structure
    const task = await taskEscrow.getTask(taskId);
    console.log(`👤 User: ${task.user}`);
    console.log(`🤖 Agent: ${task.agent}`);
    console.log(`💰 Amount: ${ethers.utils.formatEther(task.amount)} HBAR`);
    console.log(`📝 Description: ${task.description}`);
    console.log(`✅ Completed: ${task.completed}`);
    console.log(`✅ Verified: ${task.verified}`);
    console.log(`💰 Paid: ${task.paid}`);
    
    if (!task.completed) {
      console.log(`❌ Task is not completed yet`);
      console.log(`💡 Agent needs to complete the task first`);
      return;
    }
    
    if (task.verified) {
      console.log(`✅ Task already verified and paid!`);
      return;
    }
    
    if (task.user.toLowerCase() !== user.address.toLowerCase()) {
      console.log(`❌ You are not the task creator`);
      console.log(`👤 Task creator: ${task.user}`);
      console.log(`👤 Your address: ${user.address}`);
      return;
    }
    
    console.log(`\n💳 User verifying and paying agent...`);
    
    const tx = await taskEscrow.verifyAndPay(taskId, {
      gasLimit: 200000,
      gasPrice: ethers.utils.parseUnits("540", "gwei"), // Hedera minimum
    });
    
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    
    console.log(`✅ Payment sent to agent!`);
    console.log(`🔍 Explorer: https://hashscan.io/testnet/transaction/${tx.hash}`);
    console.log(`💵 Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check updated task status
    const updatedTask = await taskEscrow.getTask(taskId);
    console.log(`\n📋 Final Task Status:`);
    console.log(`✅ Completed: ${updatedTask.completed}`);
    console.log(`✅ Verified: ${updatedTask.verified}`);
    console.log(`💰 Paid: ${updatedTask.paid}`);
    console.log(`💰 Amount paid to agent: ${ethers.utils.formatEther(task.amount)} HBAR`);
    console.log(`🤖 Agent wallet: ${task.agent}`);
    
    console.log(`\n🎉 WORKFLOW COMPLETE!`);
    console.log(`✅ User created task`);
    console.log(`✅ Agent completed task`);
    console.log(`✅ User verified and paid agent`);
    console.log(`💰 Agent received ${ethers.utils.formatEther(task.amount)} HBAR`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("Not your task")) {
      console.log("💡 Only the task creator can verify and pay");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 