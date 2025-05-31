const { ethers } = require("hardhat");

// Task details
const TASK_ID = 4; // NEW TASK ID!
const USER_ADDRESS = "0x59524219693A999Fa9087db79b485b99aC935606";

// Create agent from specific private key
const AGENT_PRIVATE_KEY = "0xe576075755787c7ff88d89ea2e7cb0656156b074c7947a99f8a4cb4a6f22995d"; // DIFFERENT KEY!
// This generates address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (ACTUALLY DIFFERENT!)

// CORRECT Contract ABI
const ESCROW_ABI = [
  "function completeTask(uint256 taskId) external",
  "function verifyAndPay(uint256 taskId) external", 
  "function getTask(uint256 taskId) external view returns (tuple(address user, address agent, uint256 amount, string description, bool completed, bool verified, bool paid, uint256 createdAt, uint256 completedAt, address[] allowedAgents))",
  "function canUserCancel(uint256) external view returns (bool canCancel, string reason)",
  "function canAgentClaim(uint256) external view returns (bool canClaim, string reason)",
  "event TaskCompleted(uint256 taskId)",
  "event TaskPaid(uint256 taskId, uint256 amount)"
];

async function main() {
  console.log("🤖 Agent Completing Task with Custom Private Key (INTERACT System)");
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
  
  // Create agent wallet from private key
  const agent = new ethers.Wallet(AGENT_PRIVATE_KEY, ethers.provider);
  console.log(`👤 User (task creator): ${USER_ADDRESS}`);
  console.log(`🤖 Agent (from private key): ${agent.address}`);
  
  // Check agent balance
  const agentBalance = await ethers.provider.getBalance(agent.address);
  console.log(`💰 Agent balance: ${ethers.utils.formatEther(agentBalance)} ${tokenName}`);
  
  if (agentBalance.eq(0)) {
    console.log("❌ Agent has no balance for gas fees!");
    console.log("💡 Transfer some tokens to agent address for gas");
    return;
  }
  
  // Connect to contract with agent
  const escrow = new ethers.Contract(contractAddress, ESCROW_ABI, agent);
  
  try {
    // Check task before completion
    console.log("\n📊 Task status before completion:");
    const taskBefore = await escrow.getTask(TASK_ID);
    console.log(`   User: ${taskBefore.user}`);
    console.log(`   Agent: ${taskBefore.agent === '0x0000000000000000000000000000000000000000' ? 'None (Open)' : taskBefore.agent}`);
    console.log(`   Amount: ${ethers.utils.formatEther(taskBefore.amount)} ${tokenName}`);
    console.log(`   Description: ${taskBefore.description}`);
    console.log(`   Completed: ${taskBefore.completed}`);
    console.log(`   Paid: ${taskBefore.paid}`);
    
    if (taskBefore.completed) {
      console.log("❌ Task already completed!");
      return;
    }
    
    // Agent completes the task
    console.log(`\n🚀 Agent completing task...`);
    const tx = await escrow.completeTask(TASK_ID);
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Task completed! Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check task after completion
    console.log("\n📊 Task status after completion:");
    const taskAfter = await escrow.getTask(TASK_ID);
    console.log(`   User: ${taskAfter.user}`);
    console.log(`   Agent: ${taskAfter.agent}`);
    console.log(`   Amount: ${ethers.utils.formatEther(taskAfter.amount)} ${tokenName}`);
    console.log(`   Description: ${taskAfter.description}`);
    console.log(`   Completed: ${taskAfter.completed}`);
    console.log(`   Paid: ${taskAfter.paid}`);
    console.log(`   Completed at: ${new Date(taskAfter.completedAt * 1000).toLocaleString()}`);
    
    // Check payment status
    const [canClaim, claimReason] = await escrow.canAgentClaim(TASK_ID);
    console.log(`   Can agent claim: ${canClaim} ${claimReason ? `(${claimReason})` : ''}`);
    
    console.log(`\n🔗 View on explorer:`);
    if (network.chainId === 31) {
      console.log(`   https://explorer.testnet.rootstock.io/tx/${tx.hash}`);
    } else if (network.chainId === 14) {
      console.log(`   https://flare-explorer.flare.network/tx/${tx.hash}`);
    } else if (network.chainId === 747) {
      console.log(`   https://evm.flowscan.io/tx/${tx.hash}`);
    }
    
    console.log(`\n📌 Next steps:`);
    console.log(`   1. 👤 User can call verifyAndPay(${TASK_ID}) to release payment immediately`);
    console.log(`   2. ⏰ Or agent can claim after 3 days if user doesn't verify`);
    console.log(`   3. 💰 Payment (${ethers.utils.formatEther(taskAfter.amount)} ${tokenName}) will go to agent wallet: ${taskAfter.agent}`);
    
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