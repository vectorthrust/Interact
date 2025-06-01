'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { FaRobot, FaHistory, FaPlane } from 'react-icons/fa';
import { ChevronLeft } from 'lucide-react';
import { useTheme } from "@/app/providers";
import Footer from '@/app/components/Footer';

interface Message {
  type: 'user' | 'ai';
  content: string;
}

export default function FlightBookingPage() {
  const router = useRouter();
  const { themeColors } = useTheme();
  const [selectedOption, setSelectedOption] = useState<'past' | 'ai' | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'ai',
      content: "I'm your AI travel assistant! I can help you find the perfect flights based on your preferences, budget, and schedule. Whether you're looking for the best deals, specific routes, or travel recommendations, I'm here to help. Where would you like to go?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.push('/agent/choice');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      type: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response with loading
    setTimeout(() => {
      const aiMessage: Message = {
        type: 'ai',
        content: 'Loading...'
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const renderOptions = () => (
    <Card className="w-full max-w-2xl mx-auto" style={{ backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A' }}>
      <CardHeader>
        <CardTitle className="text-2xl" style={{ color: themeColors.text }}>Flight Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <Card 
            className="cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => setSelectedOption('past')}
            style={{ backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A' }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)` }}
                >
                  <FaHistory className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: themeColors.text }}>Past Bookings</h3>
                  <p className="text-sm" style={{ color: themeColors.text + 'CC' }}>View and manage your flight history</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => setSelectedOption('ai')}
            style={{ backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A' }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)` }}
                >
                  <FaRobot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: themeColors.text }}>AI Assistant</h3>
                  <p className="text-sm" style={{ color: themeColors.text + 'CC' }}>Let AI help you find the perfect flight</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );

  const renderChat = () => (
    <Card className="w-full max-w-2xl mx-auto" style={{ backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A' }}>
      <CardHeader className="border-b" style={{ borderColor: themeColors.text + '20' }}>
        <div className="flex items-center gap-2">
          <FaRobot className="w-5 h-5" style={{ color: themeColors.primary }} />
          <CardTitle className="text-xl" style={{ color: themeColors.text }}>Chat with AI</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Messages */}
        <div className="h-[400px] overflow-y-auto space-y-4 mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'text-white'
                    : themeColors.background === '#F8F8F8' ? 'text-gray-800' : 'text-gray-100'
                }`}
                style={{
                  background: message.type === 'user' 
                    ? `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`
                    : themeColors.background === '#F8F8F8' ? '#F0F0F0' : '#2A2A2A'
                }}
              >
                {message.content === 'Loading...' ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    Loading...
                  </div>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full focus:outline-none focus:ring-2"
            style={{
              backgroundColor: themeColors.background === '#F8F8F8' ? '#F0F0F0' : '#2A2A2A',
              color: themeColors.text,
              borderColor: themeColors.text + '20',
              borderWidth: '1px'
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 text-white rounded-full transition-colors"
            style={{ 
              background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
              opacity: isLoading ? 0.7 : 1
            }}
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.background }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
            style={{ 
              color: themeColors.text,
              backgroundColor: themeColors.text + '10'
            }}
            aria-label="Go back"
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
          <div className="w-10" /> {/* Spacer to balance the back button */}
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {selectedOption === null ? renderOptions() : renderChat()}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}