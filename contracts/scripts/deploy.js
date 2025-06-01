const { ethers, network } = require("hardhat");

// Network-specific configurations - SIMPLIFIED FOR HACKATHON
const NETWORK_CONFIG = {
  // Rootstock Testnet - Primary testing environment
  "rootstock-testnet": {
    name: "Rootstock Testnet",
    isProduction: false,
    currency: "tRBTC",
    explorer: "https://explorer.testnet.rootstock.io/",
    faucet: "https://faucet.rootstock.io/ (Use code: PRAGUE25)",
    chainId: 31,
  },
  // Flow Mainnet - Production deployment
  "flow-mainnet": {
    name: "Flow Mainnet",
    isProduction: true,
    currency: "FLOW",
    explorer: "https://evm.flowscan.io/",
    faucet: "https://faucet.flow.com/fund-account",
    chainId: 747,
  },
  // Flare Mainnet - FTSO Price Oracle deployment
  "flare-mainnet": {
    name: "Flare Mainnet",
    isProduction: true,
    currency: "FLR",
    explorer: "https://flarescan.com/",
    faucet: "https://faucet.flare.network/",
    chainId: 14,
  },
  // Flare Testnet - FTSO testing
  "flare-testnet": {
    name: "Flare Testnet Coston2",
    isProduction: false,
    currency: "C2FLR",
    explorer: "https://coston2.testnet.flarescan.com/",
    chainId: 114,
  },
  // Other networks for reference
  "flow-testnet": {
    name: "Flow Testnet",
    isProduction: false,
    currency: "FLOW",
    explorer: "https://evm-testnet.flowscan.io/",
    chainId: 545,
  },
  "rootstock-mainnet": {
    name: "Rootstock Mainnet", 
    isProduction: true,
    currency: "RBTC",
    chainId: 30,
  },
  // Hedera Testnet - Low-cost deployment option
  "hedera-testnet": {
    name: "Hedera Testnet",
    isProduction: false,
    currency: "HBAR",
    explorer: "https://hashscan.io/testnet/",
    faucet: "https://portal.hedera.com/faucet",
    chainId: 296,
  },
};

// Primary deployment targets
const PRIMARY_NETWORKS = ["rootstock-testnet", "flow-mainnet", "flare-mainnet"];

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = network.name;
  const config = NETWORK_CONFIG[networkName];

  if (!config) {
    throw new Error(`Network ${networkName} not supported. Use: ${Object.keys(NETWORK_CONFIG).join(", ")}`);
  }

  console.log(`\n🚀 Deploying Simple Task Escrow to ${config.name}`);
  console.log("=".repeat(60));
  console.log(`Network: ${config.name} (Chain ID: ${config.chainId})`);
  console.log(`Currency: ${config.currency}`);
  console.log(`Environment: ${config.isProduction ? '🔴 PRODUCTION' : '🟡 TESTNET'}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.utils.formatEther(await deployer.getBalance())} ${config.currency}`);
  
  if (PRIMARY_NETWORKS.includes(networkName)) {
    console.log("✅ PRIMARY NETWORK - Full deployment");
  } else {
    console.log("⚠️  Secondary network");
  }

  // Deploy Simple TaskEscrow  
  console.log(`\n🔒 Deploying Simple TaskEscrow...`);
  const TaskEscrow = await ethers.getContractFactory("TaskEscrow");
  const taskEscrow = await TaskEscrow.deploy(); // No constructor parameters!
  await taskEscrow.deployed();
  
  console.log(`✅ TaskEscrow deployed: ${taskEscrow.address}`);

  let ftsoOracle = null;
  // Deploy FTSO Oracle on Flare networks
  if (networkName.includes("flare")) {
    console.log(`\n🌟 Deploying FTSO Price Oracle...`);
    const FTSOPriceOracle = await ethers.getContractFactory("FTSOPriceOracle");
    ftsoOracle = await FTSOPriceOracle.deploy();
    await ftsoOracle.deployed();
    
    console.log(`✅ FTSO Oracle deployed: ${ftsoOracle.address}`);
  }

  // Deployment Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log(`TaskEscrow: ${taskEscrow.address}`);
  if (ftsoOracle) {
    console.log(`FTSO Oracle: ${ftsoOracle.address}`);
    console.log(`✅ BTC/USD Price Feed: Available via FTSO!`);
  }
  console.log(`No fees, no admins, just simple escrow!`);
  
  // Save deployment data
  const fs = require("fs");
  const deploymentData = {
    network: config.name,
    chainId: config.chainId,
    deployer: deployer.address,
    environment: config.isProduction ? 'production' : 'testnet',
    timestamp: new Date().toISOString(),
    contracts: {
      TaskEscrow: taskEscrow.address,
      FTSOOracle: ftsoOracle ? ftsoOracle.address : null,
    },
    configuration: {
      simpleEscrow: true,
      ftsoIntegration: !!ftsoOracle,
      isPrimaryNetwork: PRIMARY_NETWORKS.includes(networkName),
    }
  };

  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync(`deployments/${networkName}.json`, JSON.stringify(deploymentData, null, 2));
  console.log(`\n💾 Deployment saved: deployments/${networkName}.json`);

  // Network-specific guidance
  console.log("\n" + "=".repeat(60));
  console.log("📋 SUPER SIMPLE USAGE");
  console.log("=".repeat(60));
  
  if (networkName === "rootstock-testnet") {
    console.log("🔧 Rootstock Testnet:");
    console.log("1. 💰 Get tRBTC: https://faucet.rootstock.io/ (Code: PRAGUE25)");
    console.log("2. 🧪 Test with small amounts");
    console.log("3. 🔍 Explorer:", config.explorer);
  }
  
  if (networkName === "flow-mainnet") {
    console.log("🔧 Flow Mainnet:");
    console.log("1. ⚠️  PRODUCTION - Use with caution!");
    console.log("2. 💰 Fund with real FLOW tokens");
    console.log("3. 🔍 Explorer:", config.explorer);
  }

  if (networkName === "flare-mainnet") {
    console.log("🔥 Flare Mainnet (FTSO Integration):");
    console.log("1. 💰 Fund with FLR tokens");
    console.log("2. 📊 Get BTC/USD price: ftsoOracle.getBtcPrice()");
    console.log("3. 💱 Calculate USD amounts: ftsoOracle.calculateBtcAmountForUsd(usdAmount)");
    console.log("4. 🔍 Explorer:", config.explorer);
  }

  if (networkName === "flare-testnet") {
    console.log("🧪 Flare Testnet (FTSO Testing):");
    console.log("1. 💰 Get C2FLR: https://coston2-faucet.towolabs.com/");
    console.log("2. 🧪 Test FTSO price feeds");
    console.log("3. 🔍 Explorer:", config.explorer);
  }

  if (networkName === "hedera-testnet") {
    console.log("⚡ Hedera Testnet (Super Low Cost!):");
    console.log("1. 💰 Get HBAR: https://portal.hedera.com/faucet");
    console.log("2. 💵 Ultra-low gas fees (~$0.0001)");
    console.log("3. 🔍 Explorer:", config.explorer);
  }

  console.log("\n🎯 How It Works (Dead Simple!):");
  console.log("1. createTask('Order pizza', {value: 0.1 ETH})");
  console.log("2. completeTask(taskId) // Agent does this");
  console.log("3. verifyAndPay(taskId) // User does this");
  console.log("4. Agent gets all the money instantly!");

  console.log("\n💡 Features:");
  console.log("✅ No fees");
  console.log("✅ No admin");
  console.log("✅ No complex verification");
  console.log("✅ Just: create → complete → pay");
  console.log("✅ Cancel if no agent assigned yet");

  console.log("\n✅ Ready for ETH Prague 2025! 🏆");
  console.log("Total contract size: ~80 lines vs 423 lines before!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }); 