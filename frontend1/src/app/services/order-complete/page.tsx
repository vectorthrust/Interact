"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/providers";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Wallet, CheckCircle, Loader2 } from "lucide-react";
import { ethers } from 'ethers';
import dynamic from "next/dynamic";

// Dynamically import confetti to avoid SSR issues
const ReactConfetti = dynamic(() => import("react-confetti"), {
  ssr: false,
});

// TaskEscrow ABI for user verification
const TASK_ESCROW_ABI = [
  "function verifyAndPay(uint256 taskId) external",
  "function tasks(uint256) external view returns (address user, address agent, uint256 amount, string description, uint8 status, uint256 createdAt, uint256 completedAt)",
  "function getTask(uint256 taskId) external view returns (address user, address agent, uint256 amount, string description, bool completed, bool verified, bool paid, uint256 createdAt, uint256 completedAt)"
];

// Contract addresses
const ESCROW_CONTRACTS = {
  hedera: "0x0Cba9f72f0b55b59E9F92432626E9D9A9Bc419e8",
  flare: "0x698AeD7013796240EE7632Bde5f67A7f2A2aA6A5",
  flow: "0x63Ba4C892bD1910b2DD4F13F9B0a86f6E650A788"
};

export default function OrderComplete() {
  const { themeColors, theme } = useTheme();
  const router = useRouter();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [taskInfo, setTaskInfo] = useState<any>(null);

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    // Load task completion info
    const completionInfo = localStorage.getItem('taskCompleted');
    if (completionInfo) {
      setTaskInfo(JSON.parse(completionInfo));
    }

    return () => clearTimeout(timer);
  }, []);

  const handleVerifyAndPay = async () => {
    if (!taskInfo) {
      alert('No task information found. Please try again.');
      return;
    }

    if (!window.ethereum) {
      alert('Please install MetaMask to verify and pay.');
      return;
    }

    setIsVerifying(true);

    try {
      const contractAddress = ESCROW_CONTRACTS[taskInfo.chain as keyof typeof ESCROW_CONTRACTS];
      if (!contractAddress) {
        throw new Error(`Unsupported chain: ${taskInfo.chain}`);
      }

      // Connect wallet
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const escrow = new ethers.Contract(contractAddress, TASK_ESCROW_ABI, signer);

      console.log(`💰 User verifying and paying for task ${taskInfo.taskId} on ${taskInfo.chain}...`);

      let tx;
      if (taskInfo.chain === 'hedera') {
        // Hedera requires specific gas settings
        tx = await escrow.verifyAndPay(taskInfo.taskId, {
          gasLimit: 200000,
          gasPrice: ethers.parseUnits("540", "gwei")
        });
      } else {
        // Standard gas for other chains
        tx = await escrow.verifyAndPay(taskInfo.taskId);
      }

      console.log(`⏳ User verification transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`✅ User verified and paid for task ${taskInfo.taskId} on ${taskInfo.chain}`);

      // Store verification info
      localStorage.setItem('taskVerified', JSON.stringify({
        ...taskInfo,
        verificationTx: tx.hash,
        verifiedAt: new Date().toISOString()
      }));

      setIsCompleted(true);
      setShowConfetti(true);

      // Show success for a moment then redirect
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (error) {
      console.error('❌ Error verifying and paying:', error);
      alert(`Failed to verify and pay: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: themeColors.background }}>
      {/* Confetti */}
      {showConfetti && (
        <ReactConfetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={500}
          colors={[themeColors.primary, themeColors.secondary, themeColors.accent]}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
            style={{ 
              color: themeColors.text,
              backgroundColor: themeColors.text + '10'
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-center" style={{ color: themeColors.text }}>
            Interact
            <img
              src="https://i.imgur.com/ZjRjDD6.png"
              alt="icon"
              className="inline-block w-18 h-18 ml-3 mb-3"
            />
          </h1>
          <div className="w-10" />
        </div>

        <div className="max-w-md mx-auto">
          <Card style={{ backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A' }}>
            <CardHeader>
              <CardTitle className="text-2xl text-center" style={{ color: themeColors.text }}>
                {isCompleted ? 'Payment Complete! 🎉' : 'Order Complete! 🎉'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isCompleted ? (
                <>
                  <p className="text-center" style={{ color: themeColors.text + 'CC' }}>
                    Thank you for your order! Your AI agent has completed the task successfully.
                  </p>

                  {taskInfo && (
                    <div className="bg-opacity-10 p-4 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
                      <p className="text-sm" style={{ color: themeColors.text + 'CC' }}>
                        <strong>Task ID:</strong> {taskInfo.taskId}
                      </p>
                      <p className="text-sm" style={{ color: themeColors.text + 'CC' }}>
                        <strong>Chain:</strong> {taskInfo.chain.charAt(0).toUpperCase() + taskInfo.chain.slice(1)}
                      </p>
                      <p className="text-sm" style={{ color: themeColors.text + 'CC' }}>
                        <strong>Completed:</strong> {new Date(taskInfo.timestamp).toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleVerifyAndPay}
                    disabled={isVerifying}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-70"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
                      color: theme === 'hedera' ? '#000000' : 'white',
                    }}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        Verify & Pay Agent
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center" style={{ color: themeColors.text + '80' }}>
                    This will release the escrowed funds to the agent's wallet.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-4">
                    <CheckCircle className="w-16 h-16" style={{ color: themeColors.primary }} />
                    <p className="text-center" style={{ color: themeColors.text }}>
                      Payment sent successfully! The agent has been paid for completing your task.
                    </p>
                  </div>
                  
                  <p className="text-center text-sm" style={{ color: themeColors.text + '80' }}>
                    Redirecting to home...
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 