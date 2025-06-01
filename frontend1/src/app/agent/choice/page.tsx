'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { FaUtensils, FaPlane, FaTaxi, FaAmazon } from 'react-icons/fa';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from "@/app/providers";
import Footer from '@/app/components/Footer';

export default function ServicePage() {
  const router = useRouter();
  const { themeColors, theme } = useTheme();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleBack = () => {
    router.push('/agent/meta');
  };

  const handleNext = () => {
    router.push('/agent/meta');
  };

  const handleServiceClick = (service: string) => {
    if (service === 'Cab Service' || service === 'Amazon') {
      setShowComingSoon(true);
      setTimeout(() => setShowComingSoon(false), 2000);
    } else {
      // Convert service name to URL-safe slug
      const serviceSlug = service.toLowerCase().replace(/\s+/g, '-');
      localStorage.setItem('selectedService', serviceSlug);
      localStorage.setItem('selectedServiceTitle', service); // Store original title for display
      router.push('/agent/deposit');
    }
  };

  const services = [
    {
      title: 'Food Delivery',
      icon: <FaUtensils className="w-5 h-5" />,
      description: 'Order your favorite meals',
      color: 'from-[#ff008c] to-[#ff4d4d]',
      hoverColor: 'hover:from-[#ff4d4d] hover:to-[#ff008c]'
    },
    {
      title: 'Flight Booking',
      icon: <FaPlane className="w-5 h-5" />,
      description: 'Book your next journey',
      color: 'from-[#008cff] to-[#00b3ff]',
      hoverColor: 'hover:from-[#00b3ff] hover:to-[#008cff]'
    },
    {
      title: 'Cab Service',
      icon: <FaTaxi className="w-5 h-5" />,
      description: 'Ride with comfort',
      color: 'from-[#00c853] to-[#00e676]',
      hoverColor: 'hover:from-[#00e676] hover:to-[#00c853]'
    },
    {
      title: 'Amazon',
      icon: <FaAmazon className="w-5 h-5" />,
      description: 'Shop everything',
      color: 'from-[#ffa000] to-[#ffb300]',
      hoverColor: 'hover:from-[#ffb300] hover:to-[#ffa000]'
    }
  ];

  const getServiceBoxStyle = () => {
    if (theme === 'hedera') {
      return {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        color: 'rgba(255, 255, 255, 0.9)'
      };
    }
    return {
      background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
      color: 'rgba(255, 255, 255, 0.85)'
    };
  };

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

          <Card className="w-full overflow-hidden gap-2 relative" style={{ backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A' }}>
            <CardHeader className="z-10">
              <CardTitle className="text-2xl" style={{ color: themeColors.text }}>Choose Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {services.map((service, index) => (
                  <div
                    key={index}
                    onClick={() => handleServiceClick(service.title)}
                    className="cursor-pointer transform transition-all duration-300 hover:scale-105"
                  >
                    <div 
                      className="rounded-lg p-3 flex flex-col items-center shadow-md h-[120px]"
                      style={getServiceBoxStyle()}
                    >
                      <div className="bg-white/10 rounded-full p-2 mb-2">
                        {service.icon}
                      </div>
                      <h3 className="text-sm font-semibold text-center" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>{service.title}</h3>
                      <p className="text-xs text-center mt-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: themeColors.text }}
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
              backgroundColor: themeColors.primary,
              color: themeColors.background
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