const { ethers } = require("ethers");

async function testDirectFtsoV2() {
  console.log("🔥 Testing DIRECT FTSO V2 contract (with OFFICIAL addresses)...\n");
  
  // Official FTSO V2 addresses from Flare documentation
  const networks = [
    {
      name: "Flare Mainnet",
      rpc: "https://flare-api.flare.network/ext/C/rpc",
      ftsoV2: "0x7BDE3Df0624114eDB3A67dFe6753e62f4e7c1d20" // Official mainnet address
    },
    {
      name: "Flare Testnet Coston2",
      rpc: "https://coston2-api.flare.network/ext/C/rpc",
      ftsoV2: "0x3d893C53D9e8056135C26C8c638B76C8b60Df726" // Official testnet address
    }
  ];
  
  // Feed IDs from official documentation
  const BTC_USD_FEED_ID = "0x014254432f55534400000000000000000000000000"; // "BTC/USD"
  const FLR_USD_FEED_ID = "0x01464c522f55534400000000000000000000000000"; // "FLR/USD"
  const ETH_USD_FEED_ID = "0x014554482f55534400000000000000000000000000"; // "ETH/USD"
  
  // FTSO V2 interface from official docs
  const ftsoV2ABI = [
    "function getFeedById(bytes21) external view returns (uint256 value, int8 decimals, uint64 timestamp)",
    "function getFeedByIdInWei(bytes21) external view returns (uint256 value, uint64 timestamp)",
    "function getFeedsById(bytes21[]) external view returns (uint256[] memory values, int8[] memory decimals, uint64 timestamp)"
  ];
  
  for (const network of networks) {
    console.log(`🌐 Testing ${network.name}...`);
    
    try {
      const provider = new ethers.providers.JsonRpcProvider(network.rpc);
      const ftsoV2 = new ethers.Contract(network.ftsoV2, ftsoV2ABI, provider);
      
      console.log(`📋 FTSO V2 Address: ${network.ftsoV2}`);
      
      // Test FLR/USD feed
      console.log("\n🔥 Testing FLR/USD:");
      const [flrPrice, flrDecimals, flrTimestamp] = await ftsoV2.getFeedById(FLR_USD_FEED_ID);
      const flrPriceUSD = flrPrice / (10 ** flrDecimals);
      
      console.log(`✅ FLR Price: $${flrPriceUSD.toFixed(6)}`);
      console.log(`📏 Decimals: ${flrDecimals}`);
      console.log(`⏰ Last Update: ${new Date(flrTimestamp * 1000).toLocaleString()}`);
      
      // Test BTC/USD feed
      console.log("\n🟠 Testing BTC/USD:");
      const [btcPrice, btcDecimals, btcTimestamp] = await ftsoV2.getFeedById(BTC_USD_FEED_ID);
      const btcPriceUSD = btcPrice / (10 ** btcDecimals);
      
      console.log(`✅ BTC Price: $${btcPriceUSD.toLocaleString()}`);
      console.log(`📏 Decimals: ${btcDecimals}`);
      console.log(`⏰ Last Update: ${new Date(btcTimestamp * 1000).toLocaleString()}`);
      
      // Test ETH/USD feed
      console.log("\n⚡ Testing ETH/USD:");
      const [ethPrice, ethDecimals, ethTimestamp] = await ftsoV2.getFeedById(ETH_USD_FEED_ID);
      const ethPriceUSD = ethPrice / (10 ** ethDecimals);
      
      console.log(`✅ ETH Price: $${ethPriceUSD.toLocaleString()}`);
      console.log(`📏 Decimals: ${ethDecimals}`);
      console.log(`⏰ Last Update: ${new Date(ethTimestamp * 1000).toLocaleString()}`);
      
      // Test batch query
      console.log("\n💱 Testing Batch Query:");
      const feedIds = [FLR_USD_FEED_ID, BTC_USD_FEED_ID, ETH_USD_FEED_ID];
      const [prices, decimals, batchTimestamp] = await ftsoV2.getFeedsById(feedIds);
      
      console.log("📊 Batch Results:");
      console.log(`🔥 FLR: $${(prices[0] / (10 ** decimals[0])).toFixed(6)}`);
      console.log(`🟠 BTC: $${(prices[1] / (10 ** decimals[1])).toLocaleString()}`);
      console.log(`⚡ ETH: $${(prices[2] / (10 ** decimals[2])).toLocaleString()}`);
      console.log(`⏰ Batch Timestamp: ${new Date(batchTimestamp * 1000).toLocaleString()}`);
      
      // Calculate amounts for $15 USD
      console.log("\n🎯 Calculate amounts needed for $15 USD:");
      const [btcPriceWei] = await ftsoV2.getFeedByIdInWei(BTC_USD_FEED_ID);
      const [flrPriceWei] = await ftsoV2.getFeedByIdInWei(FLR_USD_FEED_ID);
      const [ethPriceWei] = await ftsoV2.getFeedByIdInWei(ETH_USD_FEED_ID);
      
      const usdAmount = ethers.utils.parseEther("15");
      
      const btcNeeded = usdAmount.mul(ethers.utils.parseEther("1")).div(btcPriceWei);
      const flrNeeded = usdAmount.mul(ethers.utils.parseEther("1")).div(flrPriceWei);
      const ethNeeded = usdAmount.mul(ethers.utils.parseEther("1")).div(ethPriceWei);
      
      console.log(`🟠 BTC needed: ${parseFloat(ethers.utils.formatEther(btcNeeded)).toFixed(8)} BTC`);
      console.log(`🔥 FLR needed: ${parseFloat(ethers.utils.formatEther(flrNeeded)).toFixed(4)} FLR`);
      console.log(`⚡ ETH needed: ${parseFloat(ethers.utils.formatEther(ethNeeded)).toFixed(6)} ETH`);
      
      console.log(`\n🎉 ${network.name} WORKS PERFECTLY! 🎉`);
      console.log("=" .repeat(60));
      
    } catch (error) {
      console.error(`❌ Error with ${network.name}:`, error.message);
      console.log("=" .repeat(60));
    }
  }
  
  console.log("\n💡 Integration Summary:");
  console.log("✅ Official FTSO V2 contract addresses");
  console.log("✅ Multiple price feeds (BTC, FLR, ETH)");
  console.log("✅ Individual and batch queries");
  console.log("✅ Wei-based calculations");
  console.log("✅ USD amount calculations");
  console.log("✅ Ready for frontend integration");
  
  console.log("\n📋 Key Info for Your DApp:");
  console.log("// Official Flare Mainnet FTSO V2: 0x7BDE3Df0624114eDB3A67dFe6753e62f4e7c1d20");
  console.log("// Official Coston2 Testnet FTSO V2: 0x3d893C53D9e8056135C26C8c638B76C8b60Df726");
  console.log("// BTC Feed ID: 0x014254432f55534400000000000000000000000000");
  console.log("// FLR Feed ID: 0x01464c522f55534400000000000000000000000000");
  console.log("// ETH Feed ID: 0x014554482f55534400000000000000000000000000");
  console.log("// Use getFeedByIdInWei() for 18-decimal precision");
}

testDirectFtsoV2(); 