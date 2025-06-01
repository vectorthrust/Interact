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

// ERC20 Token ABI - only the functions we need
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

export default function OnRampCard() {
  const router = useRouter();
  const { themeColors, theme } = useTheme();
  const [amount, setAmount] = useState('0.1');
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isNetworkChanging, setIsNetworkChanging] = useState(false);

  const getTokenInfo = () => {
    switch (theme) {
      case 'flare':
        return {
          name: 'FLR',
          minAmount: '0.1',
          network: 'Flare Network',
          poweredBy: 'Flare',
          chainId: '0xE', // 14 in hex
          rpcUrl: 'https://flare-api.flare.network/ext/C/rpc',
          explorer: 'https://flare-explorer.flare.network',
          tokenAddress: '0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d', // FLR token contract
          isNative: false
        };
      case 'hedera':
        return {
          name: 'HBAR',
          minAmount: '0.1',
          network: 'Hedera Mainnet',
          poweredBy: 'Hedera',
          chainId: '0x128', // 296 in hex
          rpcUrl: 'https://mainnet.hashio.io/api',
          explorer: 'https://hashscan.io/mainnet',
          tokenAddress: '0x0000000000000000000000000000000000000000', // HBAR is native
          isNative: true
        };
      case 'flow':
        return {
          name: 'FLOW',
          minAmount: '0.1',
          network: 'Flow Mainnet',
          poweredBy: 'Flow',
          chainId: '0x2EB', // 747 in hex
          rpcUrl: 'https://mainnet.evm.nodes.onflow.org',
          explorer: 'https://evm.flowscan.io',
          tokenAddress: '0x0000000000000000000000000000000000000000', // FLOW is native
          isNative: true
        };
      default:
        return {
          name: 'ETH',
          minAmount: '0.00001',
          network: 'Base Mainnet',
          poweredBy: 'EthGlobal',
          chainId: '0x2105', // 8453 in hex
          rpcUrl: 'https://mainnet.base.org',
          explorer: 'https://basescan.org',
          tokenAddress: '0x0000000000000000000000000000000000000000', // ETH is native
          isNative: true
        };
    }
  };

  const tokenInfo = getTokenInfo();

  const getTokenBalance = async (provider: ethers.BrowserProvider, address: string) => {
    if (isNetworkChanging) {
      console.log('Network is changing, skipping balance check');
      return '0';
    }

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      // Check if we're on the correct network
      const network = await provider.getNetwork();
      console.log('Current network:', network.chainId.toString());
      console.log('Expected network:', tokenInfo.chainId);

      if (network.chainId !== BigInt(tokenInfo.chainId)) {
        setIsNetworkChanging(true);
        console.log('Wrong network, attempting to switch...');
        try {
          // Try to switch to the correct network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: tokenInfo.chainId }],
          });

          // Wait for network switch to complete
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Get new provider after network switch
          const newProvider = new ethers.BrowserProvider(window.ethereum as any);
          provider = newProvider;

          // Verify we're on the correct network
          const newNetwork = await provider.getNetwork();
          if (newNetwork.chainId !== BigInt(tokenInfo.chainId)) {
            throw new Error('Failed to switch to correct network');
          }
        } catch (switchError: any) {
          console.error('Switch error:', switchError);
          if (switchError.code === 4902) {
            // Network not added to MetaMask
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: tokenInfo.chainId,
                  chainName: tokenInfo.network,
                  nativeCurrency: {
                    name: tokenInfo.name,
                    symbol: tokenInfo.name,
                    decimals: 18
                  },
                  rpcUrls: [tokenInfo.rpcUrl],
                  blockExplorerUrls: [tokenInfo.explorer]
                }]
              });

              // Wait for network addition to complete
              await new Promise(resolve => setTimeout(resolve, 2000));

              // Get new provider after network addition
              const newProvider = new ethers.BrowserProvider(window.ethereum as any);
              provider = newProvider;

              // Verify we're on the correct network
              const newNetwork = await provider.getNetwork();
              if (newNetwork.chainId !== BigInt(tokenInfo.chainId)) {
                throw new Error('Failed to add and switch to correct network');
              }
            } catch (addError) {
              console.error('Add network error:', addError);
              throw new Error(`Failed to add ${tokenInfo.network} to MetaMask`);
            }
          } else {
            throw new Error(`Failed to switch to ${tokenInfo.network}`);
          }
        } finally {
          setIsNetworkChanging(false);
        }
      }

      // Now that we're on the correct network, get the balance
      if (tokenInfo.isNative) {
        // For native tokens (ETH, HBAR, FLOW)
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
      } else {
        // For ERC20 tokens (FLR)
        const tokenContract = new ethers.Contract(tokenInfo.tokenAddress, ERC20_ABI, provider);
        const balance = await tokenContract.balanceOf(address);
        const decimals = await tokenContract.decimals();
        return ethers.formatUnits(balance, decimals);
      }
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  };

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

      // Check if we're on the correct network
      if (network.chainId !== BigInt(tokenInfo.chainId)) {
        try {
          // Try to switch to the correct network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: tokenInfo.chainId }],
          });
        } catch (switchError: any) {
          // If network is not added to MetaMask, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: tokenInfo.chainId,
                  chainName: tokenInfo.network,
                  nativeCurrency: {
                    name: tokenInfo.name,
                    symbol: tokenInfo.name,
                    decimals: 18
                  },
                  rpcUrls: [tokenInfo.rpcUrl],
                  blockExplorerUrls: [tokenInfo.explorer]
                }]
              });
            } catch (addError) {
              console.error(`Error adding ${tokenInfo.network}:`, addError);
              alert(`Please add ${tokenInfo.network} to MetaMask manually`);
              return;
            }
          } else {
            console.error(`Error switching to ${tokenInfo.network}:`, switchError);
            alert(`Please switch to ${tokenInfo.network} in MetaMask`);
            return;
          }
        }
      }

      const address = accounts[0];
      
      // Get token balance
      const balance = await getTokenBalance(provider, address);
      
      console.log('Connected wallet:', address);
      console.log('Token balance:', balance);
      
      setWalletAddress(address);
      setWalletBalance(balance);

      // Set up balance refresh
      const refreshBalance = async () => {
        try {
          const newBalance = await getTokenBalance(provider, address);
          console.log('Refreshed balance:', newBalance);
          setWalletBalance(newBalance);
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

  // Update the useEffect for network changes
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

    const handleChainChanged = async (chainId: string) => {
      console.log('Chain changed to:', chainId);
      setIsNetworkChanging(true);
      
      // Add a longer delay to ensure network is stable
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        await connectWallet();
      } catch (error) {
        console.error('Error reconnecting after chain change:', error);
      } finally {
        setIsNetworkChanging(false);
      }
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
                Deposit {tokenInfo.name} to your wallet to get started with Interact.
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
                    Balance: {walletBalance} {tokenInfo.name}
                    <br />
                    <span className="text-xs" style={{ color: themeColors.text + '99' }}>on {tokenInfo.network}</span>
                  </div>

                  <div className="w-full">
                    <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                      Deposit Amount ({tokenInfo.name})
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
                      min={tokenInfo.minAmount}
                    />
                    <div className="text-sm mt-1" style={{ color: themeColors.text + '99' }}>
                      Minimum deposit: {tokenInfo.minAmount} {tokenInfo.name}
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
                    Make sure you have enough {tokenInfo.name} in your MetaMask wallet to cover the deposit amount plus gas fees.
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
