const { ethers } = require("hardhat");

async function main() {
  console.log("💸 HBAR Transfer Instructions");
  console.log("=" .repeat(50));
  
  console.log(`📤 FROM (HashPack EVM): 0x00000000000000000000000000000000005cfcb5`);
  console.log(`📥 TO (Deploy Address): 0xC67C47f6901eC96A645bd1144D83E47A89258709`);
  console.log(`💰 Amount needed: 1 HBAR (for deployment)`);
  
  console.log("\n🔧 How to transfer in HashPack:");
  console.log("1. Open HashPack wallet");
  console.log("2. Go to Send/Transfer");
  console.log("3. Send 1 HBAR to: 0xC67C47f6901eC96A645bd1144D83E47A89258709");
  console.log("4. Confirm transaction");
  
  console.log("\n⏳ After transfer, run:");
  console.log("npx hardhat run check_deploy_balance.js --network hedera-testnet");
  
  console.log("\n🚀 Then deploy with:");
  console.log("npx hardhat run scripts/deploy.js --network hedera-testnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 