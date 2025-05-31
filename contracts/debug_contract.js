const { ethers } = require("hardhat");

const ROOTSTOCK_ADDRESS = "0x63Ba4C892bD1910b2DD4F13F9B0a86f6E650A788";
const USER_ADDRESS = "0x59524219693A999Fa9087db79b485b99aC935606";

async function main() {
  console.log("🔍 Debugging Rootstock Contract");
  console.log(`📍 Address: ${ROOTSTOCK_ADDRESS}`);
  
  const provider = new ethers.providers.JsonRpcProvider("https://public-node.testnet.rsk.co");
  
  // Check if code exists
  const code = await provider.getCode(ROOTSTOCK_ADDRESS);
  console.log(`💻 Contract code exists: ${code !== '0x'}`);
  console.log(`📏 Code length: ${code.length} characters`);
  
  if (code === '0x') {
    console.log("❌ NO CONTRACT DEPLOYED at this address!");
    console.log("🔧 Need to deploy to Rootstock Testnet first");
    return;
  }
  
  // Try different function signatures to see what's available
  const testFunctions = [
    { name: "nextTaskId()", sig: "0x58671730" },
    { name: "taskCounter()", sig: "0x5863f1a0" },
    { name: "owner()", sig: "0x8da5cb5b" },
    { name: "totalSupply()", sig: "0x18160ddd" },
  ];
  
  console.log("\n🧪 Testing function calls:");
  
  for (const func of testFunctions) {
    try {
      const result = await provider.call({
        to: ROOTSTOCK_ADDRESS,
        data: func.sig
      });
      console.log(`   ✅ ${func.name}: ${result !== '0x' ? 'Works' : 'Returns empty'}`);
    } catch (error) {
      console.log(`   ❌ ${func.name}: ${error.message.split('(')[0]}`);
    }
  }
  
  // Check if it's our TaskEscrow by trying the specific createTask signature
  console.log("\n🎯 Testing createTask function:");
  try {
    // This is the encoded function call for createTask with test data
    const createTaskData = "0xc222c7b1" + // createTask selector
      "0000000000000000000000000000000000000000000000000000000000000040" + // offset to description
      "00000000000000000000000000000000000000000000000000000000000000a0" + // offset to allowedAgents array
      "0000000000000000000000000000000000000000000000000000000000000004" + // description length (4 chars)
      "7465737400000000000000000000000000000000000000000000000000000000" + // "test" padded
      "0000000000000000000000000000000000000000000000000000000000000000"; // empty array
    
    const gasEstimate = await provider.estimateGas({
      from: USER_ADDRESS,
      to: ROOTSTOCK_ADDRESS,
      value: ethers.utils.parseEther("0.01").toHexString(),
      data: createTaskData
    });
    
    console.log(`   ✅ createTask gas estimate: ${gasEstimate.toString()}`);
    
  } catch (error) {
    console.log(`   ❌ createTask failed: ${error.message.split('(')[0]}`);
    
    if (error.message.includes("revert")) {
      console.log("   🤔 Contract exists but function reverts - wrong contract?");
    }
  }
  
  console.log("\n💡 Recommendations:");
  console.log("1. ✅ Try Flare Mainnet (you have 5.7 FLR)");
  console.log("2. ✅ Try Flow Mainnet (you have 0.098 FLOW)");
  console.log("3. 🔧 Redeploy to Rootstock Testnet if needed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 