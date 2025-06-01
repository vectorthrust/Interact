"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/providers";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Wallet } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import confetti to avoid SSR issues
const ReactConfetti = dynamic(() => import("react-confetti"), {
  ssr: false,
});

export default function OrderComplete() {
  const { themeColors, theme } = useTheme();
  const router = useRouter();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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
                Order Complete! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center" style={{ color: themeColors.text + 'CC' }}>
                Thank you for your order! Your AI agent has completed the task successfully.
              </p>
              
              <button
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
                  color: theme === 'hedera' ? '#000000' : 'white',
                }}
              >
                <Wallet className="w-5 h-5" />
                Mark as Completed
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 