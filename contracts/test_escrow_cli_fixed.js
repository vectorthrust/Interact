const { ethers } = require("hardhat");

// Contract addresses and network configs
const CONTRACTS = {
  rootstock: {
    address: "0x63Ba4C892bD1910b2DD4F13F9B0a86f6E650A788",
    rpc: "https://public-node.testnet.rsk.co",
    name: "Rootstock Testnet",
    token: "tRBTC",
    chainId: 31
  },
  flare: {
    address: "0x698AeD7013796240EE7632Bde5f67A7f2A2aA6A5", 
    rpc: "https://flare-api.flare.network/ext/C/rpc",
    name: "Flare Mainnet",
    token: "FLR",
    chainId: 14
  },
  flow: {
    address: "0x63Ba4C892bD1910b2DD4F13F9B0a86f6E650A788",
    rpc: "https://mainnet.evm.nodes.onflow.org",
    name: "Flow Mainnet", 
    token: "FLOW",
    chainId: 747
  }
};

// Test addresses
const USER_ADDRESS = "0x59524219693A999Fa9087db79b485b99aC935606";
const AGENT_ADDRESS = "0x1234567890123456789012345678901234567890";

// CORRECT Contract ABI (matching the actual deployed contract)
const ESCROW_ABI = [
  "function createTask(string description, address[] allowedAgents) external payable",
  "function completeTask(uint256 taskId) external",
  "function verifyAndPay(uint256 taskId) external", 
  "function cancelTask(uint256 taskId) external",
  "function claimPayment(uint256 taskId) external",
  "function nextTaskId() external view returns (uint256)",
  "function tasks(uint256) external view returns (address user, address agent, uint256 amount, string description, bool completed, bool verified, bool paid, uint256 createdAt, uint256 completedAt, address[] allowedAgents)",
  "function getTask(uint256 taskId) external view returns (tuple(address user, address agent, uint256 amount, string description, bool completed, bool verified, bool paid, uint256 createdAt, uint256 completedAt, address[] allowedAgents))",
  "function canUserCancel(uint256) external view returns (bool canCancel, string reason)",
  "function canAgentClaim(uint256) external view returns (bool canClaim, string reason)",
  "function isAllowedAgent(uint256 taskId, address agent) external view returns (bool)",
  "event TaskCreated(uint256 taskId, string description, uint256 amount, address[] allowedAgents)",
  "event TaskCompleted(uint256 taskId)",
  "event TaskPaid(uint256 taskId, uint256 amount)"
];

async function testContract(network) {
  console.log(`\n🧪 Testing ${network.name} (${network.token})`);
  console.log(`📍 Contract: ${network.address}`);
  console.log(`🔗 Explorer: https://${network.name.includes('Testnet') ? 'explorer.testnet.rootstock.io' : network.name.includes('Flare') ? 'flare-explorer.flare.network' : 'evm.flowscan.io'}/address/${network.address}`);
  
  try {
    // Connect to network
    const provider = new ethers.providers.JsonRpcProvider(network.rpc);
    const contract = new ethers.Contract(network.address, ESCROW_ABI, provider);
    
    // Test 1: Get next task ID (this tells us how many tasks exist)
    console.log("\n📊 Reading contract state...");
    const nextTaskId = await contract.nextTaskId();
    const totalTasks = nextTaskId.sub(1);
    console.log(`   Next task ID: ${nextTaskId.toString()}`);
    console.log(`   Total tasks created: ${totalTasks.toString()}`);
    
    // Test 2: Check latest task (if any exist)
    if (totalTasks.gt(0)) {
      const latestTaskId = totalTasks;
      
      try {
        const task = await contract.getTask(latestTaskId);
        console.log(`\n📋 Latest Task (ID: ${latestTaskId.toString()}):`);
        console.log(`   User: ${task.user}`);
        console.log(`   Agent: ${task.agent === '0x0000000000000000000000000000000000000000' ? 'None' : task.agent}`);
        console.log(`   Amount: ${ethers.utils.formatEther(task.amount)} ${network.token}`);
        console.log(`   Description: ${task.description}`);
        console.log(`   Completed: ${task.completed}`);
        console.log(`   Verified: ${task.verified}`);
        console.log(`   Paid: ${task.paid}`);
        console.log(`   Created: ${new Date(task.createdAt * 1000).toLocaleString()}`);
        
        if (task.completedAt > 0) {
          console.log(`   Completed: ${new Date(task.completedAt * 1000).toLocaleString()}`);
        }
        
        // Test cancellation ability
        const [canCancel, cancelReason] = await contract.canUserCancel(latestTaskId);
        console.log(`   Can user cancel: ${canCancel} ${cancelReason ? `(${cancelReason})` : ''}`);
        
        // Test agent claim ability  
        const [canClaim, claimReason] = await contract.canAgentClaim(latestTaskId);
        console.log(`   Can agent claim: ${canClaim} ${claimReason ? `(${claimReason})` : ''}`);
        
      } catch (error) {
        console.log(`   ❌ Error reading task ${latestTaskId}: ${error.message.split('(')[0]}`);
      }
    } else {
      console.log(`   📝 No tasks created yet`);
    }
    
    // Test 3: Simulate task creation (estimate gas)
    console.log("\n⛽ Gas estimation for task creation:");
    try {
      const taskAmount = ethers.utils.parseEther("0.01"); // Small amount for testing
      const gasEstimate = await contract.estimateGas.createTask(
        "Test task from CLI", 
        [], // Open to all agents
        { value: taskAmount }
      );
      console.log(`   Estimated gas: ${gasEstimate.toString()}`);
      const gasCost = gasEstimate.mul(ethers.utils.parseUnits("20", "gwei"));
      console.log(`   Cost: ~${ethers.utils.formatEther(gasCost)} ${network.token} (at 20 gwei)`);
    } catch (error) {
      console.log(`   ❌ Gas estimation failed: ${error.message.split('(')[0]}`);
    }
    
    console.log(`\n✅ ${network.name} contract is responsive!`);
    
  } catch (error) {
    console.log(`\n❌ Error testing ${network.name}: ${error.message.split('(')[0]}`);
  }
}

// Main function
async function main() {
  console.log("🚀 TaskEscrow Multi-Chain Testing (FIXED)");
  console.log(`👤 User Address: ${USER_ADDRESS}`);
  console.log(`🤖 Agent Address: ${AGENT_ADDRESS}`);
  
  // Test all networks
  for (const [key, network] of Object.entries(CONTRACTS)) {
    await testContract(network);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
  
  console.log("\n💡 Next Steps:");
  console.log("1. Get testnet tokens from faucets");
  console.log("2. Create tasks with: npx hardhat run create_test_task_fixed.js --network <network>");
  console.log("3. Monitor contracts via explorer links above");
  
  console.log("\n🔑 Agent Token Requirements:");
  console.log("❌ Agents DON'T need the native token (tRBTC/FLR/FLOW) to call functions");
  console.log("✅ Agents only need gas fees to pay for transactions");
  console.log("💰 Payments go directly to agent's wallet when tasks complete");
}

// Run the tests
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testContract, CONTRACTS, ESCROW_ABI }; 