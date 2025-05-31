'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiMetabase } from 'react-icons/si';
import { ethers } from 'ethers';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CardWithForm() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        alert('Please install MetaMask to use this feature!');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        // Store the connected account in localStorage or your preferred state management
        localStorage.setItem('connectedAccount', accounts[0]);
        router.push('/agent/deposit');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    localStorage.removeItem('connectedAccount');
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleNext = () => {
    if (account) {
      router.push('/agent/deposit');
    }
  };

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    };
    checkConnection();
  }, []);

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
            <CardHeader>
              <CardTitle className="text-2xl">
                {account
                  ? `Welcome ${account.slice(0, 6)}...${account.slice(-4)}`
                  : 'Connect with MetaMask'}
              </CardTitle>
              <CardDescription>
                {account
                  ? 'Your wallet is connected and ready to use.'
                  : 'Connect your MetaMask wallet to continue using Interact.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {!account ? (
                <Button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-[#ff008c] hover:bg-[#ff008c]/90 flex items-center justify-center gap-2"
                >
                  <SiMetabase className="w-5 h-5" />
                  {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={disconnectWallet}
                  className="border-[#ff008c] text-[#ff008c] hover:bg-[#ff008c]/10"
                >
                  Disconnect Wallet
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            disabled={!account}
            className={`absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
              account 
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
