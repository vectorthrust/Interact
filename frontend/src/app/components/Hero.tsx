"use client";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers";
import { MouseMoveEffect } from "@/components/mouse-move-effect";
import Footer from "@/app/components/Footer";

export default function Hero() {
    const router = useRouter();
    const { themeColors, theme } = useTheme();
  
    const handleRedirect = () => {
      router.push('/agent/meta');
    };

    const handleGetStarted = () => {
      router.push('/agent/meta');
    };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative" style={{ backgroundColor: themeColors.background }}>
      {/* Mouse Move Effect */}
      <MouseMoveEffect />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo and Title */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <img
              src="https://i.imgur.com/ZjRjDD6.png"
              alt="Interact Logo"
              className="w-30 h-30 animate-float"
            />
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight" style={{ color: themeColors.text }}>
              <b>Inter</b>act
            </h1>
          </div>

          {/* Description */}
          <p className="text-xl sm:text-2xl max-w-2xl mx-auto" style={{ color: themeColors.text + 'CC' }}>
            Your AI-powered service companion for seamless everyday tasks
          </p>

          {/* CTA Button */}
          <div className="mt-12">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 text-lg rounded-xl transition-all hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
                color: theme === 'hedera' ? '#000000' : 'white',
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}