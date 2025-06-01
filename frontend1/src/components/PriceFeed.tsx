'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useTheme } from '@/app/providers';

const FTSO_MAINNET = "0x7BDE3Df0624114eDB3A67dFe6753e62f4e7c1d20";
const FTSO_TESTNET = "0x3d893C53D9e8056135C26C8c638B76C8b60Df726";

// Feed IDs from FTSO documentation
const HBAR_USD = "0x01484241522f555344000000000000000000000000";
const FLR_USD = "0x01464c522f55534400000000000000000000000000";

interface PriceData {
  price: string;
  lastUpdated: number;
  error?: string;
}

export function PriceFeed() {
  const { theme, themeColors } = useTheme();
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getFeedId = () => {
    switch (theme) {
      case 'hedera':
        return { feedId: HBAR_USD, symbol: 'HBAR', name: 'Hedera' };
      case 'flare':
        return { feedId: FLR_USD, symbol: 'FLR', name: 'Flare' };
      default:
        return null;
    }
  };

  const fetchPrice = async () => {
    const feedConfig = getFeedId();
    if (!feedConfig) return;

    setIsLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider("https://flare-api.flare.network/ext/C/rpc");
      const ftso = new ethers.Contract(
        FTSO_MAINNET, 
        ["function getFeedByIdInWei(bytes21) external view returns (uint256, uint64)"], 
        provider
      );
      
      const [priceWei, timestamp] = await ftso.getFeedByIdInWei(feedConfig.feedId);
      const price = ethers.formatEther(priceWei);
      
      setPriceData({
        price: parseFloat(price).toFixed(4),
        lastUpdated: Number(timestamp),
        error: undefined
      });
    } catch (error) {
      console.error('Error fetching price:', error);
      setPriceData({
        price: '0.0000',
        lastUpdated: Date.now() / 1000,
        error: 'Failed to fetch price'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const feedConfig = getFeedId();
    if (!feedConfig) {
      setPriceData(null);
      return;
    }

    fetchPrice();
    
    // Update price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [theme]);

  // Don't show price feed for Flow theme
  if (theme === 'flow' || !getFeedId()) {
    return null;
  }

  const feedConfig = getFeedId()!;

  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
      style={{
        backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A',
        borderColor: themeColors.primary + '40',
        color: themeColors.text
      }}
    >
      <div className="flex items-center gap-1">
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: themeColors.primary }}
        />
        <span className="font-medium">{feedConfig.symbol}/USD</span>
      </div>
      
      {isLoading ? (
        <span className="animate-pulse">Loading...</span>
      ) : priceData?.error ? (
        <span className="text-red-500 text-xs">{priceData.error}</span>
      ) : (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold" style={{ color: themeColors.primary }}>
            ${priceData?.price}
          </span>
          <span className="text-xs opacity-60">
            {priceData?.lastUpdated && new Date(priceData.lastUpdated * 1000).toLocaleTimeString()}
          </span>
        </div>
      )}
      
      <span className="text-xs opacity-40">FTSO</span>
    </div>
  );
} 