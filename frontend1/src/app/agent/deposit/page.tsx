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
  "function createTask(string description, uint256 depositAmount) external payable returns (uint256)"
];

export default function OnRampCard() {
  const router = useRouter();
  const { themeColors, theme } = useTheme();
  const [amount, setAmount] = useState('0.1');
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const getTokenInfo = () => {
    switch (theme) {
      case 'flare':
        return {
          name: 'FLR',
          minAmount: '0.1',
          network: 'Flare Network',
          chainId: '0xE',
          rpcUrl: 'https://flare-api.flare.network/ext/C/rpc',
          escrowContract: '0x698AeD7013796240EE7632Bde5f67A7f2A2aA6A5'
        };
      case 'hedera':
        return {
          name: 'HBAR',
          minAmount: '1',
          network: 'Hedera Testnet',
          chainId: '0x128',
          rpcUrl: 'https://testnet.hashio.io/api',
          escrowContract: '0x0Cba9f72f0b55b59E9F92432626E9D9A9Bc419e8'
        };
      case 'flow':
        return {
          name: 'FLOW',
          minAmount: '0.1',
          network: 'Flow Mainnet',
          chainId: '0x2EB',
          rpcUrl: 'https://mainnet.evm.nodes.onflow.org',
          escrowContract: '0x63Ba4C892bD1910b2DD4F13F9B0a86f6E650A788'
        };
      default:
        return {
          name: 'ETH',
          minAmount: '0.001',
          network: 'Base',
          chainId: '0x2105',
          rpcUrl: 'https://mainnet.base.org',
          escrowContract: ''
        };
    }
  };

  const tokenInfo = getTokenInfo();

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
      } else {
        message += error.message;
      }
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (depositAmount: number) => {
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    
    if (theme === 'flare') {
      // For Flare, approve FLR token first
      const flrContract = new ethers.Contract(
        '0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d',
        ERC20_ABI,
        signer
      );
      
      const amountWei = ethers.parseEther(depositAmount.toString());
      
      // Approve
      const approveTx = await flrContract.approve(tokenInfo.escrowContract, amountWei);
      await approveTx.wait();
      
      // Create task
      const escrow = new ethers.Contract(tokenInfo.escrowContract, TASK_ESCROW_ABI, signer);
      const tx = await escrow.createTask(
        `Task for ${depositAmount} FLR`,
        amountWei,
        { gasLimit: 500000 }
      );
      await tx.wait();
    } else {
      // For HBAR/FLOW (native tokens)
      const escrow = new ethers.Contract(tokenInfo.escrowContract, TASK_ESCROW_ABI, signer);
      const amountWei = ethers.parseEther(depositAmount.toString());
      
      const tx = await escrow.createTask(
        `Task for ${depositAmount} ${tokenInfo.name}`,
        amountWei,
        { 
          value: amountWei,
          gasLimit: theme === 'hedera' ? 200000 : 300000,
          ...(theme === 'hedera' && { gasPrice: ethers.parseUnits("540", "gwei") })
        }
      );
      await tx.wait();
    }
  };

  const handleBack = () => router.push('/agent/choice');
  const handleNext = () => {
    const selectedService = localStorage.getItem('selectedService');
    if (selectedService) router.push(`/services/${selectedService}`);
  };

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
              {!walletAddress ? (
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
                    style={{ background: themeColors.gradient, color: themeColors.background }}
                  >
                    <SiMetabase className="w-5 h-5" />
                    {isLoading ? 'Creating Task...' : 'Create Escrow Task'}
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
            disabled={!walletAddress}
            className={`absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
              walletAddress ? 'hover:bg-gray-100' : 'cursor-not-allowed'
            }`}
            style={{ color: walletAddress ? themeColors.text : themeColors.text + '40' }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <Footer />
      </div>
    </div>
  );
}
