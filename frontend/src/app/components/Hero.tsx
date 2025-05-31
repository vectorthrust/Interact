'use client';
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

export default function Hero() {
    const router = useRouter();
  
    const handleRedirect = () => {
      router.push('/'); // Replace with your actual route
    };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
          Interact
          <img
          src="https://i.imgur.com/ZjRjDD6.png"
          alt="icon"
          className="inline-block w-18 h-18 ml-3 mb-3"
        />
          <br />
          <span className="text-[#ff008c]">Effortless real-world utility</span>
        </h1>
        <p className=" mx-auto text-lg sm:text-xl text-gray-400 mb-10">
        From crypto to real-world actions and transactions in seconds, all powered by AI.
        </p>
        <Button onClick={handleRedirect} className="relative group px-8 py-6 text-lg hover:opacity-90">
          <span className="relative z-10">Get started</span>
          <div className="absolute inset-0 bg-white/20 blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
        </Button>
      </div>
    </div>
  )
}
