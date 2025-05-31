'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { SiMetabase } from 'react-icons/si';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [amount, setAmount] = useState('0.1');
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleBack = () => {
    router.push('/agent/meta');
  };

  const handleNext = () => {
    if (walletAddress) {
      router.push('/agent/choice');
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
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask to continue');
      return;
    }

    const depositAmount = parseFloat(amount);
    const currentBalance = parseFloat(walletBalance);

    if (depositAmount > currentBalance) {
      alert('Insufficient funds in your wallet. Please add more ETH to your MetaMask wallet.');
      return;
    }

    setIsLoading(true);
    try {
      // For demo purposes, we'll just simulate a successful deposit
      // In a real app, you would interact with your smart contract here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      // Redirect to next page after successful deposit
      router.push('/agent/choice');
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col items-center mb-20 relative">
        <h1 className="text-5xl font-bold tracking-tight mb-6 text-center">
          <b>Inter</b>act
          <img
            src="https://imgur.com/ZjRjDD6"
            alt="icon"
            className="inline-block w-6 h-6 align-super ml-1 mb-1"
          />
        </h1>

        <div className="relative w-[400px]">
          {/* Back Arrow */}
          <button
            onClick={handleBack}
            className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <Card className="w-full">
            <CardHeader className="z-10">
              <CardTitle className="text-2xl">Deposit Funds</CardTitle>
              <CardDescription>
                Deposit ETH to your wallet to get started with Interact.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {!walletAddress ? (
                <Button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-[#ff008c] hover:bg-[#ff008c]/90 flex items-center justify-center gap-2"
                >
                  <SiMetabase className="w-5 h-5" />
                  {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                </Button>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-2">
                    Connected Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    <br />
                    Balance: {walletBalance} ETH
                    <br />
                    <span className="text-xs text-gray-500">on Base Network</span>
                  </div>

                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deposit Amount (ETH)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter amount"
                      step="0.01"
                      min="0.01"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      Minimum deposit: 0.00001 ETH
                    </div>
                  </div>

                  <Button 
                    onClick={handleDeposit}
                    disabled={isLoading}
                    className="bg-[#ff008c] hover:bg-[#ff008c]/90 flex items-center justify-center gap-2"
                  >
                    <SiMetabase className="w-5 h-5" />
                    {isLoading ? 'Processing...' : 'Confirm Deposit'}
                  </Button>

                  <div className="text-sm text-gray-500 text-center mt-2">
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
                ? 'hover:bg-gray-100 text-gray-600' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Go next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center px-8 py-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-gray-500">
            <span><b>Built</b> with ❤️ by Hitarth, Ali & Divyansh</span>
          </div>
          <div className="text-sm text-gray-500">
            <span><b>Powered</b> by EthGlobal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
