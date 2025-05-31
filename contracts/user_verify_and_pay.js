const { ethers } = require("hardhat");

// Task details from the successful completion
const TASK_ID = 4; 
const USER_ADDRESS = "0x59524219693A999Fa9087db79b485b99aC935606";

// CORRECT Contract ABI
const ESCROW_ABI = [
  "function verifyAndPay(uint256 taskId) external", 
  "function getTask(uint256 taskId) external view returns (tuple(address user, address agent, uint256 amount, string description, bool completed, bool verified, bool paid, uint256 createdAt, uint256 completedAt, address[] allowedAgents))",
  "function canUserCancel(uint256) external view returns (bool canCancel, string reason)",
  "function canAgentClaim(uint256) external view returns (bool canClaim, string reason)",
  "event TaskPaid(uint256 taskId, uint256 amount)"
];

async function main() {
  console.log("👤 User Verifying and Paying Agent (INTERACT System)");
  console.log(`📋 Task ID: ${TASK_ID}`);
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`🌐 Network: ${network.name} (${network.chainId})`);
  
  let contractAddress;
  let tokenName;
  
  // Determine contract address based on network
  if (network.chainId === 31) {
    contractAddress = "0xD0691D231a04E747E6813B0d05471EAC8B4961B1"; // NEW CORRECT ADDRESS
    tokenName = "tRBTC";
    console.log("📍 Using Rootstock Testnet contract");
  } else if (network.chainId === 14) {
    contractAddress = "0x698AeD7013796240EE7632Bde5f67A7f2A2aA6A5";
    tokenName = "FLR";
    console.log("📍 Using Flare Mainnet contract");
  } else if (network.chainId === 747) {
    contractAddress = "0x63Ba4C892bD1910b2DD4F13F9B0a86f6E650A788";
    tokenName = "FLOW";
    console.log("📍 Using Flow Mainnet contract");
  } else {
    throw new Error(`Unsupported network: ${network.chainId}`);
  }
  
  // Get signer (this is the "user")
  const [user] = await ethers.getSigners();
  console.log(`👤 User: ${user.address}`);
  
  // Connect to contract
  const escrow = new ethers.Contract(contractAddress, ESCROW_ABI, user);
  
  try {
    // Check task before payment
    console.log("\n📊 Task status before payment:");
    const taskBefore = await escrow.getTask(TASK_ID);
    console.log(`   User: ${taskBefore.user}`);
    console.log(`   Agent: ${taskBefore.agent}`);
    console.log(`   Amount: ${ethers.utils.formatEther(taskBefore.amount)} ${tokenName}`);
    console.log(`   Description: ${taskBefore.description}`);
    console.log(`   Completed: ${taskBefore.completed}`);
    console.log(`   Verified: ${taskBefore.verified}`);
    console.log(`   Paid: ${taskBefore.paid}`);
    
    if (!taskBefore.completed) {
      console.log("❌ Task not completed yet by agent!");
      return;
    }
    
    if (taskBefore.paid) {
      console.log("❌ Task already paid!");
      return;
    }
    
    if (taskBefore.user !== user.address) {
      console.log("❌ You're not the task creator!");
      return;
    }
    
    // Get agent balance before payment
    const provider = ethers.provider;
    const agentBalanceBefore = await provider.getBalance(taskBefore.agent);
    console.log(`   Agent balance before: ${ethers.utils.formatEther(agentBalanceBefore)} ${tokenName}`);
    
    // User verifies and pays
    console.log(`\n💰 User verifying and paying agent...`);
    const tx = await escrow.verifyAndPay(TASK_ID);
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Payment sent! Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check task after payment
    console.log("\n📊 Task status after payment:");
    const taskAfter = await escrow.getTask(TASK_ID);
    console.log(`   User: ${taskAfter.user}`);
    console.log(`   Agent: ${taskAfter.agent}`);
    console.log(`   Amount: ${ethers.utils.formatEther(taskAfter.amount)} ${tokenName}`);
    console.log(`   Description: ${taskAfter.description}`);
    console.log(`   Completed: ${taskAfter.completed}`);
    console.log(`   Verified: ${taskAfter.verified}`);
    console.log(`   Paid: ${taskAfter.paid}`);
    
    // Get agent balance after payment
    const agentBalanceAfter = await provider.getBalance(taskAfter.agent);
    console.log(`   Agent balance after: ${ethers.utils.formatEther(agentBalanceAfter)} ${tokenName}`);
    
    const balanceIncrease = agentBalanceAfter.sub(agentBalanceBefore);
    console.log(`   💰 Agent received: ${ethers.utils.formatEther(balanceIncrease)} ${tokenName}`);
    
    console.log(`\n🔗 View on explorer:`);
    if (network.chainId === 31) {
      console.log(`   https://explorer.testnet.rootstock.io/tx/${tx.hash}`);
    } else if (network.chainId === 14) {
      console.log(`   https://flare-explorer.flare.network/tx/${tx.hash}`);
    } else if (network.chainId === 747) {
      console.log(`   https://evm.flowscan.io/tx/${tx.hash}`);
    }
    
    console.log(`\n🎉 INTERACT Task Workflow Complete!`);
    console.log(`   ✅ Task created by user`);
    console.log(`   ✅ Task completed by agent: ${taskAfter.agent}`);
    console.log(`   ✅ Payment verified and sent: ${ethers.utils.formatEther(taskAfter.amount)} ${tokenName}`);
    console.log(`   ✅ Money transferred directly to agent's wallet`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.reason) {
      console.error(`   Reason: ${error.reason}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 