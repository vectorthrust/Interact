const { ethers } = require("hardhat");

// Hedera Testnet Contract
const CONTRACT_ADDRESS = "0x0Cba9f72f0b55b59E9F92432626E9D9A9Bc419e8";

async function main() {
  console.log("🔍 Debug Task Reading on Hedera");
  console.log("=" .repeat(50));
  
  try {
    const [user] = await ethers.getSigners();
    
    // Connect to contract with full ABI
    const taskEscrow = await ethers.getContractAt("TaskEscrow", CONTRACT_ADDRESS);
    
    // Get task ID 1 (the one we created)
    const taskId = 1;
    
    console.log(`📋 Reading Task ID: ${taskId}`);
    
    // Try different ways to read task
    console.log("\n1️⃣ Using tasks() function:");
    try {
      const task = await taskEscrow.tasks(taskId);
      console.log("Raw task data:", task);
      console.log("Task user:", task.user || task[0]);
      console.log("Task agent:", task.agent || task[1]);
      console.log("Task amount:", task.amount ? ethers.utils.formatEther(task.amount) : "undefined");
      console.log("Task description:", task.description || task[3]);
      console.log("Task status:", task.status !== undefined ? task.status : "undefined");
    } catch (e) {
      console.log("Error with tasks():", e.message);
    }
    
    console.log("\n2️⃣ Using getTask() function:");
    try {
      const task = await taskEscrow.getTask(taskId);
      console.log("Raw getTask data:", task);
    } catch (e) {
      console.log("Error with getTask():", e.message);
    }
    
    console.log("\n3️⃣ Check contract methods:");
    const nextTaskId = await taskEscrow.nextTaskId();
    console.log("Next task ID:", nextTaskId.toString());
    
    console.log("\n4️⃣ Check with explicit struct reading:");
    try {
      // Read the raw struct
      const taskData = await taskEscrow.callStatic.tasks(taskId);
      console.log("Raw struct:", taskData);
      
      if (Array.isArray(taskData)) {
        console.log("Array elements:");
        taskData.forEach((item, index) => {
          console.log(`  [${index}]:`, item.toString());
        });
      }
    } catch (e) {
      console.log("Error with raw struct:", e.message);
    }
    
  } catch (error) {
    console.error("❌ Debug Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 