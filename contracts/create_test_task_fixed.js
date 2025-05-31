const { ethers } = require("hardhat");

// Your addresses
const USER_ADDRESS = "0x59524219693A999Fa9087db79b485b99aC935606";
const AGENT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Mock agent for testing

// CORRECT Contract ABI (matching the actual deployed contract)
const ESCROW_ABI = [
  "function createTask(string description, address[] allowedAgents) external payable",
  "function completeTask(uint256 taskId) external",
  "function verifyAndPay(uint256 taskId) external", 
  "function cancelTask(uint256 taskId) external",
  "function claimPayment(uint256 taskId) external",
  "function nextTaskId() external view returns (uint256)",
  "function getTask(uint256 taskId) external view returns (tuple(address user, address agent, uint256 amount, string description, bool completed, bool verified, bool paid, uint256 createdAt, uint256 completedAt, address[] allowedAgents))",
  "function canUserCancel(uint256) external view returns (bool canCancel, string reason)",
  "function canAgentClaim(uint256) external view returns (bool canClaim, string reason)",
  "function isAllowedAgent(uint256 taskId, address agent) external view returns (bool)",
  "event TaskCreated(uint256 taskId, string description, uint256 amount, address[] allowedAgents)"
];

async function main() {
  console.log("🚀 Creating Test Task (FIXED)");
  console.log(`👤 User: ${USER_ADDRESS}`);
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`🌐 Network: ${network.name} (${network.chainId})`);
  
  let contractAddress;
  let tokenName;
  
  // Determine contract address based on network
  if (network.chainId === 31) {
    contractAddress = "0xD0691D231a04E747E6813B0d05471EAC8B4961B1";
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
  
  // Get signer (assumes you have private key in env)
  const [signer] = await ethers.getSigners();
  console.log(`💳 Signer: ${signer.address}`);
  
  // Connect to contract
  const escrow = new ethers.Contract(contractAddress, ESCROW_ABI, signer);
  
  try {
    // Check current task count
    const nextTaskId = await escrow.nextTaskId();
    const currentTasks = nextTaskId.sub(1);
    console.log(`📊 Current tasks: ${currentTasks.toString()}`);
    console.log(`📊 Next task will be ID: ${nextTaskId.toString()}`);
    
    // Create a test task
    const taskAmount = ethers.utils.parseEther("0.01"); // Small amount for testing
    const description = `Test task from CLI - ${new Date().toISOString()}`;
    
    console.log(`\n💰 Creating task with ${ethers.utils.formatEther(taskAmount)} ${tokenName}`);
    console.log(`📝 Description: ${description}`);
    
    const tx = await escrow.createTask(
      description,
      [], // Open to all agents
      { value: taskAmount }
    );
    
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Task created! Gas used: ${receipt.gasUsed.toString()}`);
    
    // Get the new task details
    const newNextTaskId = await escrow.nextTaskId();
    const taskId = newNextTaskId.sub(1);
    const task = await escrow.getTask(taskId);
    
    console.log(`\n📋 New Task (ID: ${taskId.toString()}):`);
    console.log(`   User: ${task.user}`);
    console.log(`   Agent: ${task.agent === '0x0000000000000000000000000000000000000000' ? 'None (Open)' : task.agent}`);
    console.log(`   Amount: ${ethers.utils.formatEther(task.amount)} ${tokenName}`);
    console.log(`   Description: ${task.description}`);
    console.log(`   Completed: ${task.completed}`);
    console.log(`   Verified: ${task.verified}`);
    console.log(`   Paid: ${task.paid}`);
    console.log(`   Created: ${new Date(task.createdAt * 1000).toLocaleString()}`);
    
    // Check cancellation ability
    const [canCancel, reason] = await escrow.canUserCancel(taskId);
    console.log(`   Can cancel: ${canCancel} ${reason ? `(${reason})` : ''}`);
    
    console.log(`\n🔗 View on explorer:`);
    if (network.chainId === 31) {
      console.log(`   https://explorer.testnet.rootstock.io/tx/${tx.hash}`);
    } else if (network.chainId === 14) {
      console.log(`   https://flare-explorer.flare.network/tx/${tx.hash}`);
    } else if (network.chainId === 747) {
      console.log(`   https://evm.flowscan.io/tx/${tx.hash}`);
    }
    
    console.log(`\n📌 Task is ready for agents! Any agent can:`);
    console.log(`   1. Call completeTask(${taskId}) when work is done`);
    console.log(`   2. You can then call verifyAndPay(${taskId}) to release payment`);
    console.log(`   3. Or agent can claim after 3 days if you don't verify`);
    
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