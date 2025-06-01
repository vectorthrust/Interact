'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { FaPlane } from 'react-icons/fa';
import { ChevronLeft } from 'lucide-react';
import { useTheme } from "@/app/providers";
import Footer from '@/app/components/Footer';

interface FlightDetails {
  from: string;
  to: string;
  date: string;
  passengers: string;
  class: string;
}

interface StoredFlight extends FlightDetails {
  timestamp: string;
  status: string;
}

export default function FlightBookingPage() {
  const router = useRouter();
  const { themeColors, theme } = useTheme();
  const [flightDetails, setFlightDetails] = useState<FlightDetails>({
    from: '',
    to: '',
    date: '',
    passengers: '1',
    class: 'Economy'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Get today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toISOString().split('T')[0];

  // Function to get stored flight booking
  const getStoredFlight = (): StoredFlight | null => {
    if (typeof window === 'undefined') return null;
    const storedFlight = localStorage.getItem('currentFlight');
    return storedFlight ? JSON.parse(storedFlight) : null;
  };

  const handleBack = () => {
    router.push('/agent/choice');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightDetails.from || !flightDetails.to || !flightDetails.date) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Store flight details in localStorage
      const flightData: StoredFlight = {
        ...flightDetails,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      localStorage.setItem('currentFlight', JSON.stringify(flightData));

      // Redirect to agent page
      router.push('/agent/agent');
    } catch (error) {
      console.error('Error processing flight booking:', error);
      alert('Failed to process flight booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFlightDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
          <Card className="w-full" style={{ backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A' }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div 
                  className="p-2 rounded-full"
                  style={{ 
                    background: theme === 'hedera' 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)'
                      : `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`
                  }}
                >
                  <FaPlane className="w-5 h-5" style={{ color: theme === 'hedera' ? '#FFFFFF' : '#FFFFFF' }} />
                </div>
                <CardTitle className="text-2xl" style={{ color: themeColors.text }}>Flight Booking</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label 
                      htmlFor="from" 
                      className="block text-sm font-medium mb-1"
                      style={{ color: themeColors.text }}
                    >
                      From
                    </label>
                    <input
                      type="text"
                      id="from"
                      name="from"
                      value={flightDetails.from}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: themeColors.background === '#F8F8F8' ? '#F0F0F0' : '#2A2A2A',
                        color: themeColors.text,
                        borderColor: themeColors.text + '20',
                        borderWidth: '1px'
                      }}
                      placeholder="Enter departure city"
                      required
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="to" 
                      className="block text-sm font-medium mb-1"
                      style={{ color: themeColors.text }}
                    >
                      To
                    </label>
                    <input
                      type="text"
                      id="to"
                      name="to"
                      value={flightDetails.to}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: themeColors.background === '#F8F8F8' ? '#F0F0F0' : '#2A2A2A',
                        color: themeColors.text,
                        borderColor: themeColors.text + '20',
                        borderWidth: '1px'
                      }}
                      placeholder="Enter destination city"
                      required
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="date" 
                      className="block text-sm font-medium mb-1"
                      style={{ color: themeColors.text }}
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={flightDetails.date}
                      onChange={handleInputChange}
                      min={today}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: themeColors.background === '#F8F8F8' ? '#F0F0F0' : '#2A2A2A',
                        color: themeColors.text,
                        borderColor: themeColors.text + '20',
                        borderWidth: '1px'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="passengers" 
                      className="block text-sm font-medium mb-1"
                      style={{ color: themeColors.text }}
                    >
                      Number of Passengers
                    </label>
                    <input
                      type="number"
                      id="passengers"
                      name="passengers"
                      value={flightDetails.passengers}
                      onChange={handleInputChange}
                      min="1"
                      max="9"
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: themeColors.background === '#F8F8F8' ? '#F0F0F0' : '#2A2A2A',
                        color: themeColors.text,
                        borderColor: themeColors.text + '20',
                        borderWidth: '1px'
                      }}
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="class" 
                      className="block text-sm font-medium mb-1"
                      style={{ color: themeColors.text }}
                    >
                      Class
                    </label>
                    <select
                      id="class"
                      name="class"
                      value={flightDetails.class}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: themeColors.background === '#F8F8F8' ? '#F0F0F0' : '#2A2A2A',
                        color: themeColors.text,
                        borderColor: themeColors.text + '20',
                        borderWidth: '1px'
                      }}
                    >
                      <option value="Economy">Economy</option>
                      <option value="Premium Economy">Premium Economy</option>
                      <option value="Business">Business</option>
                      <option value="First">First</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg transition-all hover:scale-[1.02] disabled:opacity-70"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
                    color: theme === 'hedera' ? '#000000' : 'white'
                  }}
                >
                  {isLoading ? 'Processing...' : 'Send to Agent'}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}