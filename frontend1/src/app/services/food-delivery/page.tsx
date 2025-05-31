'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { FaUtensils, FaPaperPlane } from 'react-icons/fa';
import { ChevronLeft } from 'lucide-react';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

export default function FoodDeliveryPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: 'Hey! What would you like to order today?'
    }
  ]);
  const [input, setInput] = useState('');

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

    // Simulate bot response (this will be replaced with your NLP backend)
    setTimeout(() => {
      const botMessage: Message = {
        type: 'bot',
        content: 'I understand you want to order food. Let me help you with that...'
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center mb-20 relative">
        <h1 className="text-5xl font-bold tracking-tight mb-6 text-center text-white">
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
            className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <Card className="w-full overflow-hidden bg-gray-800 border-gray-700">
            <CardHeader className="bg-gradient-to-r from-[#ff008c] to-[#ff4d4d] text-white">
              <div className="flex items-center gap-2">
                <FaUtensils className="w-5 h-5" />
                <CardTitle className="text-xl">Food Delivery</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Chat Messages */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-800">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-[#ff008c] text-white'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-700 p-4 bg-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff008c] bg-gray-700 text-white placeholder-gray-400"
                  />
                  <button
                    onClick={handleSend}
                    className="p-2 rounded-full bg-[#ff008c] text-white hover:bg-[#ff008c]/90 transition-colors"
                  >
                    <FaPaperPlane className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center px-8 py-4 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700">
          <div className="text-sm text-gray-400">
            <span><b>Built</b> with ❤️ by Hitarth, Ali & Divyansh</span>
          </div>
          <div className="text-sm text-gray-400">
            <span><b>Powered</b> by EthGlobal</span>
          </div>
        </div>
      </div>
    </div>
  );
} 