'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiMetabase } from 'react-icons/si';
import { ethers } from 'ethers';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from "@/app/providers";

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Footer from '@/app/components/Footer';

export default function CardWithForm() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();
  const { themeColors } = useTheme();

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
        router.push('/agent/choice');
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
      router.push('/agent/choice');
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
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: themeColors.text }}>
                {account
                  ? `Welcome ${account.slice(0, 6)}...${account.slice(-4)}`
                  : 'Connect with MetaMask'}
              </CardTitle>
              <CardDescription style={{ color: themeColors.text + 'CC' }}>
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
                <Button 
                  variant="outline" 
                  onClick={disconnectWallet}
                  style={{ 
                    borderColor: themeColors.primary,
                    color: themeColors.primary,
                    backgroundColor: 'transparent'
                  }}
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
                ? 'hover:bg-gray-100' 
                : 'cursor-not-allowed'
            }`}
            style={{ 
              color: account ? themeColors.text : themeColors.text + '40'
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
