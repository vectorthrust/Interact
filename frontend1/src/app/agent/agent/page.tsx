'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Play, Square, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from "@/app/providers";
import Footer from '@/app/components/Footer';

interface LogUpdate {
  id: string;
  message: string;
  timestamp: Date;
}

export default function AgentPage() {
  const router = useRouter();
  const { themeColors, theme } = useTheme();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogUpdate[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const socketRef = useRef<WebSocket | null>(null);

  const handleBack = () => {
    router.push('/agent/meta');
  };

  const handleNext = () => {
    router.push('/agent/meta');
  };

  const startAgent = () => {
    setIsRunning(true);
    setStatus("running");
    setLogs([]);

    // Get stored order data from localStorage
    const storedOrder = localStorage.getItem('currentOrder');
    if (!storedOrder) {
      const errorLog: LogUpdate = {
        id: `log-${Date.now()}`,
        message: "No order data found. Please place an order first.",
        timestamp: new Date(),
      };
      setLogs((prev) => [...prev, errorLog]);
      setIsRunning(false);
      setStatus("error");
      return;
    }

    const orderData = JSON.parse(storedOrder);

    // Create the websocket connection
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/agent");
    socketRef.current = socket;

    socket.onopen = () => {
      // Send the actual order data
      const initialData = {
        taskType: "food",
        details: {
          address: orderData.address,
          restaurantName: orderData.restaurantName,
          item: orderData.item
        }
      };
      socket.send(JSON.stringify(initialData));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Backend sends either logs or final done message
      if (data.next_goal) {
        const newLog: LogUpdate = {
          id: `log-${Date.now()}`,
          message: data.next_goal,
          timestamp: new Date(),
        };
        setLogs((prev) => [...prev, newLog]);
      }

      if (data.status === "done") {
        const doneLog: LogUpdate = {
          id: `log-${Date.now()}`,
          message: "Agent task completed successfully!",
          timestamp: new Date(),
        };
        setLogs((prev) => [...prev, doneLog]);
        setIsRunning(false);
        setStatus("completed");
        socket.close();
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setIsRunning(false);
      setStatus("error");
      socket.close();
    };

    socket.onclose = () => {
      if (isRunning) {
        setIsRunning(false);
        setStatus("error");
      }
    };
  };

  const stopAgent = () => {
    setIsRunning(false);
    setStatus("idle");
    const stopLog: LogUpdate = {
      id: `log-${Date.now()}`,
      message: "Agent stopped by user",
      timestamp: new Date(),
    };
    setLogs((prev) => [...prev, stopLog]);
    socketRef.current?.close();
  };

  const clearLogs = () => {
    setLogs([]);
    setStatus("idle");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs]);

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

        <div className="relative w-[600px]">
          {/* Back Arrow */}
          <button
            onClick={handleBack}
            className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-opacity-10 transition-colors"
            aria-label="Go back"
            style={{ 
              color: themeColors.text,
              backgroundColor: themeColors.text + '10'
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <Card className="w-full overflow-hidden gap-2 relative" style={{ backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A' }}>
            <CardHeader className="z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle style={{ color: themeColors.text }}>AI Agent</CardTitle>
                  <CardDescription style={{ color: themeColors.text + 'CC' }}>Monitor your agent's progress in real-time</CardDescription>
                </div>
                <Badge variant={status === "completed" ? "secondary" : status === "running" ? "default" : "outline"}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {!isRunning ? (
                  <Button 
                    onClick={startAgent} 
                    className="flex items-center gap-2"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
                      color: theme === 'hedera' ? '#000000' : 'white'
                    }}
                  >
                    <Play className="h-4 w-4" />
                    Start Agent
                  </Button>
                ) : (
                  <Button 
                    onClick={stopAgent} 
                    variant="destructive" 
                    className="flex items-center gap-2"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
                      color: theme === 'hedera' ? '#000000' : 'white'
                    }}
                  >
                    <Square className="h-4 w-4" />
                    Stop Agent
                  </Button>
                )}
                <Button 
                  onClick={clearLogs} 
                  variant="outline" 
                  disabled={isRunning}
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColors.primary}20 0%, ${themeColors.secondary}20 100%)`,
                    borderColor: themeColors.primary,
                    color: themeColors.text,
                    borderWidth: '1px'
                  }}
                >
                  Clear Logs
                </Button>
              </div>

              <div className="border rounded-lg p-6" style={{ backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#2A2A2A' }}>
                <div className="flex flex-col items-center justify-center mb-6">
                  {isRunning ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-12 w-12 animate-spin mb-3" style={{ color: themeColors.primary }} />
                      <p className="font-medium" style={{ color: themeColors.text }}>Agent is working...</p>
                    </div>
                  ) : status === "completed" ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="h-12 w-12 mb-3" style={{ color: themeColors.primary }} />
                      <p className="font-medium" style={{ color: themeColors.text }}>Task completed!</p>
                    </div>
                  ) : status === "error" ? (
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-12 w-12 mb-3" style={{ color: themeColors.primary }} />
                      <p className="font-medium" style={{ color: themeColors.text }}>Error occurred</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full border-2 flex items-center justify-center mb-3" style={{ borderColor: themeColors.text + '20' }}>
                        <Play className="h-6 w-6" style={{ color: themeColors.text + '80' }} />
                      </div>
                      <p className="font-medium" style={{ color: themeColors.text + '80' }}>Ready to start</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4" style={{ borderColor: themeColors.text + '20' }}>
                  <h3 className="text-sm font-medium mb-3" style={{ color: themeColors.text }}>Agent Logs</h3>
                  <ScrollArea ref={scrollAreaRef} className="h-64 pr-4">
                    {logs.length === 0 ? (
                      <p className="text-center py-8" style={{ color: themeColors.text + '80' }}>No logs yet. Start the agent to see updates.</p>
                    ) : (
                      <div className="space-y-2">
                        {logs.map((log) => (
                          <div
                            key={log.id}
                            className="py-2 border-b flex justify-between items-center animate-in fade-in duration-300"
                            style={{ borderColor: themeColors.text + '20' }}
                          >
                            <span style={{ color: themeColors.text }}>{log.message}</span>
                            <span className="text-xs" style={{ color: themeColors.text + '80' }}>{formatTime(log.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-opacity-10 transition-colors"
            style={{ 
              color: themeColors.text,
              backgroundColor: themeColors.text + '10'
            }}
            aria-label="Go next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Coming Soon Toast */}
        {showComingSoon && (
          <div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
              color: theme === 'hedera' ? '#000000' : 'white'
            }}
          >
            Coming Soon!
          </div>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
