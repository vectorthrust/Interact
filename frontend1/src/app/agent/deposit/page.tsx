'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { SiMetabase } from 'react-icons/si';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from "@/app/providers";
import Footer from '@/app/components/Footer';
import { PriceFeed } from '@/components/PriceFeed';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Simplified ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

// TaskEscrow ABI
const TASK_ESCROW_ABI = [
  "function createTask(string description, address[] allowedAgents) external payable returns (uint256)",
  "function getTask(uint256 taskId) external view returns (tuple(address user, address agent, uint256 amount, string description, bool completed, bool verified, bool paid, uint256 createdAt, uint256 completedAt, address[] allowedAgents))"
];

export default function OnRampCard() {
  const router = useRouter();
  const { themeColors, theme } = useTheme();
  const [amount, setAmount] = useState('0.1');
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isNetworkCorrect, setIsNetworkCorrect] = useState(false);

  const getTokenInfo = () => {
    switch (theme) {
      case 'flare':
        return {
          name: 'FLR',
          minAmount: '0.1',
          network: 'Flare Network',
          chainId: '0xE', // Chain ID 14
          rpcUrl: 'https://flare-api.flare.network/ext/C/rpc',
          escrowContract: '0x698AeD7013796240EE7632Bde5f67A7f2A2aA6A5',
          isNative: true // FLR is native token on Flare
        };
      case 'hedera':
        return {
          name: 'HBAR',
          minAmount: '1',
          network: 'Hedera Testnet',
          chainId: '0x128', // Chain ID 296
          rpcUrl: 'https://testnet.hashio.io/api',
          escrowContract: '0x0Cba9f72f0b55b59E9F92432626E9D9A9Bc419e8',
          isNative: true
        };
      case 'flow':
        return {
          name: 'FLOW',
          minAmount: '0.01',
          network: 'Flow Mainnet',
          chainId: '0x2EB', // Chain ID 747
          rpcUrl: 'https://mainnet.evm.nodes.onflow.org',
          escrowContract: '0x63Ba4C892bD1910b2DD4F13F9B0a86f6E650A788',
          isNative: true
        };
      default:
        return {
          name: 'ETH',
          minAmount: '0.001',
          network: 'Base',
          chainId: '0x2105', // Chain ID 8453
          rpcUrl: 'https://mainnet.base.org',
          escrowContract: '',
          isNative: true
        };
    }
  };

  const tokenInfo = getTokenInfo();

  const checkNetwork = async () => {
    if (!window.ethereum) return false;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chainId:', chainId, 'Expected:', tokenInfo.chainId);
      const isCorrect = chainId.toLowerCase() === tokenInfo.chainId.toLowerCase();
      setIsNetworkCorrect(isCorrect);
      return isCorrect;
    } catch (error) {
      console.error('Failed to check network:', error);
      return false;
    }
  };

  const switchNetwork = async () => {
    if (!window.ethereum) {
      return false;
    }

    try {
      setIsLoading(true);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: tokenInfo.chainId }],
      });
      
      // Wait a bit for the network to switch
      await new Promise(resolve => setTimeout(resolve, 1500));
      const switched = await checkNetwork();
      if (switched) {
        console.log('Successfully switched to', tokenInfo.network);
      }
      return switched;
    } catch (switchError: any) {
      // If network doesn't exist, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: tokenInfo.chainId,
              chainName: tokenInfo.network,
              rpcUrls: [tokenInfo.rpcUrl],
              nativeCurrency: {
                name: tokenInfo.name,
                symbol: tokenInfo.name,
                decimals: 18,
              },
            }],
          });
          await new Promise(resolve => setTimeout(resolve, 1500));
          const added = await checkNetwork();
          if (added) {
            console.log('Successfully added and switched to', tokenInfo.network);
          }
          return added;
        } catch (addError) {
          console.error('Failed to add network:', addError);
          return false;
        }
      } else if (switchError.code === 4001) {
        // User rejected
        console.log('User rejected network switch');
        return false;
      } else {
        console.error('Failed to switch network:', switchError);
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        
        // Check network and auto-switch if needed
        const isCorrect = await checkNetwork();
        if (!isCorrect) {
          console.log('Auto-switching to', tokenInfo.network);
          await switchNetwork();
        }
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) < parseFloat(tokenInfo.minAmount)) {
      alert(`Minimum amount is ${tokenInfo.minAmount} ${tokenInfo.name}`);
      return;
    }

    // For Hedera, skip wallet connection and network checks
    if (theme === 'hedera') {
      const proceed = confirm(`Deposit ${amount} ${tokenInfo.name} to escrow using Hedera private key?`);
      if (!proceed) return;

      setIsLoading(true);
      try {
        await createTask(parseFloat(amount));
        alert(`Success! ${amount} ${tokenInfo.name} deposited to escrow.`);
        handleNext();
      } catch (error: any) {
        console.error('Deposit failed:', error);
        let message = 'Transaction failed. ';
        
        if (error.message.includes('insufficient funds')) {
          message += 'Insufficient balance or gas.';
        } else if (error.message.includes('execution reverted')) {
          message += 'Contract execution failed. The escrow contract may not exist or have issues.';
        } else if (error.code === -32603) {
          message += 'RPC error. Please try again.';
        } else {
          message += error.message || 'Unknown error occurred.';
        }
        alert(message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // For non-Hedera networks: Auto-switch network if needed
    if (!isNetworkCorrect) {
      console.log('Auto-switching network before deposit...');
      const switched = await switchNetwork();
      if (!switched) {
        alert(`Failed to switch to ${tokenInfo.network}. Please switch manually.`);
        return;
      }
    }

    const proceed = confirm(`Deposit ${amount} ${tokenInfo.name} to escrow?`);
    if (!proceed) return;

    setIsLoading(true);
    try {
      await createTask(parseFloat(amount));
      alert(`Success! ${amount} ${tokenInfo.name} deposited to escrow.`);
      handleNext();
    } catch (error: any) {
      console.error('Deposit failed:', error);
      let message = 'Transaction failed. ';
      
      if (error.message.includes('insufficient funds')) {
        message += 'Insufficient balance or gas.';
      } else if (error.message.includes('user rejected')) {
        message += 'Transaction was cancelled.';
      } else if (error.message.includes('execution reverted')) {
        message += 'Contract execution failed. The escrow contract may not exist or have issues.';
      } else if (error.code === -32603) {
        message += 'RPC error. Please try again.';
      } else {
        message += error.message || 'Unknown error occurred.';
      }
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (depositAmount: number) => {
    if (theme === 'hedera') {
      // For Hedera: Use hardcoded private key instead of MetaMask
      const HEDERA_PRIVATE_KEY = "e359cbe13b7a9f96a74e31c89a1010267c1b44f1a349197b762262e2ed12a56d";
      const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
      const wallet = new ethers.Wallet(HEDERA_PRIVATE_KEY, provider);
      
      const escrow = new ethers.Contract(tokenInfo.escrowContract, TASK_ESCROW_ABI, wallet);
      const amountWei = ethers.parseEther(depositAmount.toString());
      
      console.log('Creating task on Hedera with private key...');
      const tx = await escrow.createTask(
        `Task for ${depositAmount} ${tokenInfo.name}`,
        [], // allowedAgents - empty array means anyone can complete the task
        { 
          value: amountWei,
          gasLimit: BigInt(200000),
          gasPrice: ethers.parseUnits("540", "gwei")
        }
      );
      
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('Task created successfully on Hedera');
      return tx;
    } else {
      // For other networks: Use MetaMask as before
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      
      // Check user balance first
      const balance = await provider.getBalance(walletAddress);
      const amountWei = ethers.parseEther(depositAmount.toString());
      
      // More accurate gas estimation per network
      let estimatedGasCost;
      switch (theme) {
        case 'flow':
          estimatedGasCost = ethers.parseEther("0.015"); // Higher gas cost for Flow
          break;
        case 'flare':
          estimatedGasCost = ethers.parseEther("0.005"); // Moderate for Flare
          break;
        default:
          estimatedGasCost = ethers.parseEther("0.001"); // Default
      }
      
      if (balance < amountWei + estimatedGasCost) {
        const needed = ethers.formatEther(amountWei + estimatedGasCost);
        const current = ethers.formatEther(balance);
        throw new Error(`Insufficient balance. You have ${current} ${tokenInfo.name} but need at least ${needed} ${tokenInfo.name} (including gas fees)`);
      }
      
      // Create escrow contract instance
      const escrow = new ethers.Contract(tokenInfo.escrowContract, TASK_ESCROW_ABI, signer);
      
      // Estimate gas for the transaction
      let gasLimit;
      try {
        gasLimit = await escrow.createTask.estimateGas(
          `Task for ${depositAmount} ${tokenInfo.name}`,
          [], // allowedAgents - empty array means anyone can complete the task
          { value: amountWei }
        );
        // Add 20% buffer to gas limit
        gasLimit = gasLimit * BigInt(120) / BigInt(100);
      } catch (error) {
        console.warn('Gas estimation failed, using default:', error);
        // Fallback gas limits per network
        switch (theme) {
          case 'flare':
            gasLimit = BigInt(300000);
            break;
          case 'flow':
            gasLimit = BigInt(500000); // Higher gas limit for Flow
            break;
          default:
            gasLimit = BigInt(250000);
        }
      }

      // Get current gas price
      const feeData = await provider.getFeeData();
      let gasPrice = feeData.gasPrice;
      
      // Adjust gas price for Flow network
      if (theme === 'flow' && gasPrice) {
        gasPrice = gasPrice * BigInt(120) / BigInt(100); // 20% higher gas price for Flow
      }

      const txOptions: any = {
        value: amountWei,
        gasLimit: gasLimit,
      };

      // Set gas price if available
      if (gasPrice) {
        txOptions.gasPrice = gasPrice;
      }

      console.log('Transaction options:', {
        value: ethers.formatEther(amountWei),
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice ? ethers.formatUnits(gasPrice, 'gwei') + ' gwei' : 'auto'
      });

      // Execute transaction
      const tx = await escrow.createTask(
        `Task for ${depositAmount} ${tokenInfo.name}`,
        [], // allowedAgents - empty array means anyone can complete the task
        txOptions
      );
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      return receipt;
    }
  };

  const handleBack = () => router.push('/agent/choice');
  const handleNext = () => {
    const selectedService = localStorage.getItem('selectedService');
    if (selectedService) {
      // Use the URL-safe slug directly (no encoding needed)
      router.push(`/services/${selectedService}`);
    }
  };

  // Check network on wallet connection
  useEffect(() => {
    if (walletAddress) {
      checkNetwork();
    }
  }, [walletAddress, theme]);

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: themeColors.background }}>
      <div className="flex flex-col items-center mb-20 relative">
        <h1 className="text-5xl font-bold tracking-tight mb-6 text-center" style={{ color: themeColors.text }}>
          <b>Inter</b>act
          <img src="https://i.imgur.com/ZjRjDD6.png" alt="icon" className="inline-block w-18 h-18 ml-3 mb-3" />
        </h1>

        {(theme === 'hedera' || theme === 'flare') && (
          <div className="mb-4"><PriceFeed /></div>
        )}

        <div className="relative w-[400px]">
          <button
            onClick={handleBack}
            className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: themeColors.text }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <Card className="w-full" style={{ backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A' }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: themeColors.text }}>Deposit Funds</CardTitle>
              <CardDescription style={{ color: themeColors.text + 'CC' }}>
                Deposit {tokenInfo.name} to create an escrow task.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {theme === 'hedera' ? (
                <>
                  <div className="text-sm mb-2" style={{ color: themeColors.text + 'CC' }}>
                    Network: {tokenInfo.network}
                    <div className="text-green-600 mt-1 flex items-center gap-1">
                      ✅ Using Hedera private key
                    </div>
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
                      placeholder={`Min: ${tokenInfo.minAmount}`}
                      step="0.01"
                      min={tokenInfo.minAmount}
                    />
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
                    {isLoading ? 'Processing...' : 'Create Escrow Task'}
                  </Button>

                  <div className="text-sm text-center mt-2" style={{ color: themeColors.text + '99' }}>
                    Funds held securely until task completion
                  </div>
                </>
              ) : !walletAddress ? (
                <Button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="flex items-center justify-center gap-2"
                  style={{ background: themeColors.gradient, color: themeColors.background }}
                >
                  <SiMetabase className="w-5 h-5" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              ) : (
                <>
                  <div className="text-sm mb-2" style={{ color: themeColors.text + 'CC' }}>
                    Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    <br />
                    Network: {tokenInfo.network}
                    {!isNetworkCorrect && !isLoading && (
                      <div className="text-yellow-600 mt-1 flex items-center gap-1">
                        <span className="animate-spin">⚡</span>
                        Switching to {tokenInfo.network}...
                      </div>
                    )}
                    {isNetworkCorrect && (
                      <div className="text-green-600 mt-1 flex items-center gap-1">
                        ✅ Connected to {tokenInfo.network}
                      </div>
                    )}
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
                      placeholder={`Min: ${tokenInfo.minAmount}`}
                      step="0.01"
                      min={tokenInfo.minAmount}
                    />
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
                    {isLoading ? 'Processing...' : 'Create Escrow Task'}
                  </Button>

                  <div className="text-sm text-center mt-2" style={{ color: themeColors.text + '99' }}>
                    Funds held securely until task completion
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <button
            onClick={handleNext}
            disabled={theme !== 'hedera' && !walletAddress}
            className={`absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
              (theme === 'hedera' || walletAddress) ? 'hover:bg-gray-100' : 'cursor-not-allowed'
            }`}
            style={{ color: (theme === 'hedera' || walletAddress) ? themeColors.text : themeColors.text + '40' }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <Footer />
      </div>
    </div>
  );
}
