// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Official Flare imports for mainnet
    interface IFtsoV2Interface {
        function getFeedById(bytes21 _feedId) external view returns (
            uint256 _feedValue,
            int8 _decimals,
            uint64 _timestamp
        );
    
    function getFeedByIdInWei(bytes21 _feedId) external view returns (
        uint256 _feedValue,
        uint64 _timestamp
    );
    }

// Simplified ContractRegistry interface
interface IContractRegistry {
    function getFtsoV2() external view returns (IFtsoV2Interface);
}

/**
 * @title OfficialBTCPriceOracle
 * @dev Official Flare FTSO integration for BTC/USD prices
 * Follows Flare's recommended patterns for mainnet deployment
 */
contract FTSOPriceOracle {
    
    // Official Flare ContractRegistry on mainnet
    IContractRegistry public constant FLARE_CONTRACT_REGISTRY = IContractRegistry(0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019);
    
    // Official BTC/USD feed ID from Flare docs
    bytes21 public constant BTC_USD_FEED_ID = 0x014254432f55534400000000000000000000000000; // "BTC/USD"
    
    // Max age for price data (1 hour)
    uint256 public constant MAX_PRICE_AGE = 1 hours;
    
    // Events
    event PriceRequested(uint256 price, uint64 timestamp);

    /**
     * @dev Get BTC/USD price using official Flare FTSO
     * @return price The price in USD
     * @return decimals Number of decimal places
     * @return timestamp Last update timestamp
     */
    function getBtcPrice() external view returns (
        uint256 price, 
        int8 decimals, 
        uint64 timestamp
    ) {
        IFtsoV2Interface ftsoV2 = FLARE_CONTRACT_REGISTRY.getFtsoV2();
        return ftsoV2.getFeedById(BTC_USD_FEED_ID);
    }

    /**
     * @dev Get BTC/USD price in Wei (18 decimals)
     * @return price The price in USD (18 decimals)
     * @return timestamp Last update timestamp
     */
    function getBtcPriceWei() external view returns (
        uint256 price,
        uint64 timestamp
    ) {
        IFtsoV2Interface ftsoV2 = FLARE_CONTRACT_REGISTRY.getFtsoV2();
        return ftsoV2.getFeedByIdInWei(BTC_USD_FEED_ID);
    }

    /**
     * @dev Get fresh BTC price (reverts if too old)
     * @return price The price in USD
     * @return decimals Number of decimal places
     * @return timestamp Last update timestamp
     */
    function getFreshBtcPrice() external view returns (
        uint256 price,
        int8 decimals,
        uint64 timestamp
    ) {
        IFtsoV2Interface ftsoV2 = FLARE_CONTRACT_REGISTRY.getFtsoV2();
        (price, decimals, timestamp) = ftsoV2.getFeedById(BTC_USD_FEED_ID);
        require((block.timestamp - timestamp) <= MAX_PRICE_AGE, "BTC price too old");
        return (price, decimals, timestamp);
    }

    /**
     * @dev Check if BTC price is fresh
     * @return isFresh Whether the price is recent enough
     */
    function isBtcPriceFresh() external view returns (bool isFresh) {
        IFtsoV2Interface ftsoV2 = FLARE_CONTRACT_REGISTRY.getFtsoV2();
        (, , uint64 timestamp) = ftsoV2.getFeedById(BTC_USD_FEED_ID);
        return (block.timestamp - timestamp) <= MAX_PRICE_AGE;
    }

    /**
     * @dev Calculate USD value for BTC amount using Wei price
     * @param btcAmount Amount of BTC (18 decimals)
     * @return usdValue USD value (18 decimals)
     */
    function calculateBtcUsdValue(uint256 btcAmount) external view returns (uint256 usdValue) {
        IFtsoV2Interface ftsoV2 = FLARE_CONTRACT_REGISTRY.getFtsoV2();
        (uint256 priceWei, ) = ftsoV2.getFeedByIdInWei(BTC_USD_FEED_ID);
        
        // Both are in 18 decimals, simple multiplication
        usdValue = (btcAmount * priceWei) / 1e18;
        return usdValue;
    }

    /**
     * @dev Calculate BTC amount needed for USD value
     * @param usdValue USD value desired (18 decimals)
     * @return btcAmount BTC amount needed (18 decimals)
     */
    function calculateBtcAmountForUsd(uint256 usdValue) external view returns (uint256 btcAmount) {
        IFtsoV2Interface ftsoV2 = FLARE_CONTRACT_REGISTRY.getFtsoV2();
        (uint256 priceWei, ) = ftsoV2.getFeedByIdInWei(BTC_USD_FEED_ID);
        require(priceWei > 0, "Invalid BTC price");
        
        // Calculate BTC needed: usdValue / btcPrice
        btcAmount = (usdValue * 1e18) / priceWei;
        return btcAmount;
    }

    /**
     * @dev Get BTC feed ID (for reference)
     * @return feedId The BTC/USD feed identifier
     */
    function getBtcFeedId() external pure returns (bytes21 feedId) {
        return BTC_USD_FEED_ID;
    }
} 