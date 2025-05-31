"use client";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers";

export default function Hero() {
    const router = useRouter();
    const { themeColors } = useTheme();
  
    const handleRedirect = () => {
      router.push('/agent/meta');
    };

  return (
    <div 
      className="h-screen w-screen flex items-center justify-center transition-colors duration-300"
      style={{ backgroundColor: themeColors.background }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center mb-8">
          <h1 
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
            style={{ color: themeColors.text }}
          >
            Interact
          </h1>
          <img
            src="https://i.imgur.com/ZjRjDD6.png"
            alt="icon"
            className="w-34 h-34 ml-5 transform hover:scale-110 transition-transform duration-300"
          />
        </div>
        <span 
          className="text-2xl sm:text-3xl lg:text-4xl block mb-10"
          style={{ color: themeColors.primary }}
        >
          Effortless real-world utility
        </span>
        <p 
          className="mx-auto text-lg sm:text-xl mb-10"
          style={{ color: themeColors.text + 'CC' }}
        >
          From crypto to real-world actions and transactions in seconds, all powered by AI.
        </p>
        <Button 
          onClick={handleRedirect} 
          className="relative group px-8 py-6 text-lg hover:opacity-90"
          style={{ 
            background: themeColors.gradient,
            color: themeColors.background
          }}
        >
          <span className="relative z-10">Get started</span>
          <div 
            className="absolute inset-0 blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
            style={{ background: themeColors.gradient }}
          />
        </Button>
      </div>
    </div>
  )
}