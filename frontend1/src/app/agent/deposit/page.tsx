'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { SiMetabase } from 'react-icons/si';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from "@/app/providers";
import Footer from '@/app/components/Footer';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OnRampCard() {
  const router = useRouter();
  const { themeColors, theme } = useTheme();
  const [amount, setAmount] = useState('0.1');
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const getTokenInfo = () => {
    switch (theme) {
      case 'flare':
        return {
          name: 'FLR',
          minAmount: '0.1',
          network: 'Flare Network',
          poweredBy: 'Flare'
        };
      case 'rootstock':
        return {
          name: 'RBTC',
          minAmount: '0.1',
          network: 'Rootstock Network',
          poweredBy: 'Rootstock'
        };
      case 'flow':
        return {
          name: 'FLOW',
          minAmount: '0.1',
          network: 'Flow Network',
          poweredBy: 'Flow'
        };
      default:
        return {
          name: 'ETH',
          minAmount: '0.1',
          network: 'Base Network',
          poweredBy: 'EthGlobal'
        };
    }
  };

  const tokenInfo = getTokenInfo();

  const handleBack = () => {
    router.push('/agent/choice');
  };

  const handleNext = () => {
    // Get the selected service from localStorage
    const selectedService = localStorage.getItem('selectedService');
    if (selectedService) {
      const servicePath = selectedService.toLowerCase().replace(' ', '-');
      router.push(`/services/${servicePath}`);
      // Clear the selected service from localStorage
      localStorage.removeItem('selectedService');
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask to continue');
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Add a small delay to ensure network is stable
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      console.log('Current network:', network);

      // Check if we're on Base network (chainId: 8453)
      if (network.chainId !== BigInt(8453)) {
        try {
          // Try to switch to Base network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], // 8453 in hex
          });
        } catch (switchError: any) {
          // If Base network is not added to MetaMask, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x2105',
                  chainName: 'Base',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org']
                }]
              });
            } catch (addError) {
              console.error('Error adding Base network:', addError);
              alert('Please add Base network to MetaMask manually');
              return;
            }
          } else {
            console.error('Error switching to Base network:', switchError);
            alert('Please switch to Base network in MetaMask');
            return;
          }
        }
      }

      const signer = await provider.getSigner();
      const address = accounts[0];
      
      // Get balance with more detailed logging
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      
      console.log('Connected wallet:', address);
      console.log('Raw balance:', balance.toString());
      console.log('Formatted balance:', formattedBalance);
      
      setWalletAddress(address);
      setWalletBalance(formattedBalance);

      // Set up balance refresh
      const refreshBalance = async () => {
        try {
          const newBalance = await provider.getBalance(address);
          const newFormattedBalance = ethers.formatEther(newBalance);
          console.log('Refreshed balance:', newFormattedBalance);
          setWalletBalance(newFormattedBalance);
        } catch (error) {
          console.error('Error refreshing balance:', error);
        }
      };

      // Refresh balance every 5 seconds
      const balanceInterval = setInterval(refreshBalance, 5000);

      // Clean up interval on component unmount
      return () => clearInterval(balanceInterval);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length > 0) {
        connectWallet();
      } else {
        setWalletAddress('');
        setWalletBalance('0');
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed to:', chainId);
      // Add a small delay before reconnecting to ensure network is stable
      setTimeout(() => {
        connectWallet();
      }, 1000);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleDeposit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const depositAmount = parseFloat(amount);
    const currentBalance = parseFloat(walletBalance);

    if (depositAmount > currentBalance) {
      alert('Insufficient funds in your wallet. Please enter an amount less than or equal to your balance.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate deposit process
      await new Promise(resolve => setTimeout(resolve, 2000));
      handleNext();
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Deposit failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: themeColors.background }}>
      <div className="flex flex-col items-center mb-20 relative">
        <h1 className="text-5xl font-bold tracking-tight mb-6 text-center" style={{ color: themeColors.text }}>
          <b>Inter</b>act
          <img
            src="https://i.imgur.com/ZjRjDD6.png"
            alt="icon"
            className="inline-block w-18 h-18 ml-3 mb-3"
          />
        </h1>

        <div className="relative w-[400px]">
          {/* Back Arrow */}
          <button
            onClick={handleBack}
            className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
            style={{ color: themeColors.text }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <Card className="w-full" style={{ backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A' }}>
            <CardHeader className="z-10">
              <CardTitle className="text-2xl" style={{ color: themeColors.text }}>Deposit Funds</CardTitle>
              <CardDescription style={{ color: themeColors.text + 'CC' }}>
                Deposit ETH to your wallet to get started with Interact.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {!walletAddress ? (
                <Button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="flex items-center justify-center gap-2"
                  style={{ 
                    background: themeColors.gradient,
                    color: themeColors.background
                  }}
                >
                  <SiMetabase className="w-5 h-5" />
                  {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                </Button>
              ) : (
                <>
                  <div className="text-sm mb-2" style={{ color: themeColors.text + 'CC' }}>
                    Connected Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    <br />
                    Balance: {walletBalance} ETH
                    <br />
                    <span className="text-xs" style={{ color: themeColors.text + '99' }}>on Base Network</span>
                  </div>

                  <div className="w-full">
                    <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                      Deposit Amount (ETH)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A',
                        borderColor: themeColors.primary + '40',
                        color: themeColors.text
                      }}
                      placeholder="Enter amount"
                      step="0.01"
                      min="0.01"
                    />
                    <div className="text-sm mt-1" style={{ color: themeColors.text + '99' }}>
                      Minimum deposit: 0.00001 ETH
                    </div>
                  </div>

                  <Button 
                    onClick={handleDeposit}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2"
                    style={{ 
                      background: themeColors.gradient,
                      color: themeColors.background
                    }}
                  >
                    <SiMetabase className="w-5 h-5" />
                    {isLoading ? 'Processing...' : 'Confirm Deposit'}
                  </Button>

                  <div className="text-sm text-center mt-2" style={{ color: themeColors.text + '99' }}>
                    Make sure you have enough ETH in your MetaMask wallet to cover the deposit amount plus gas fees.
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            disabled={!walletAddress}
            className={`absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
              walletAddress 
                ? 'hover:bg-gray-100' 
                : 'cursor-not-allowed'
            }`}
            style={{ 
              color: walletAddress ? themeColors.text : themeColors.text + '40'
            }}
            aria-label="Go next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
