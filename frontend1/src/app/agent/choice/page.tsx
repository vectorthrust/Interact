'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { FaUtensils, FaPlane, FaTaxi, FaAmazon } from 'react-icons/fa';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ServicePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/agent/deposit');
  };

  const handleNext = () => {
    router.push('/agent/meta');
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

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col items-center mb-20 relative">
        <h1 className="text-5xl font-bold tracking-tight mb-6 text-center">
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
            className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <Card className="w-full overflow-hidden gap-2 relative">
            <CardHeader className="z-10">
              <CardTitle className="text-2xl">Choose Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {services.map((service, index) => (
                  <div
                    key={index}
                    onClick={() => router.push(`/services/${service.title.toLowerCase().replace(' ', '-')}`)}
                    className="cursor-pointer transform transition-all duration-300 hover:scale-105"
                  >
                    <div className={`bg-gradient-to-br ${service.color} ${service.hoverColor} rounded-lg p-3 flex flex-col items-center text-white shadow-md h-[120px]`}>
                      <div className="bg-white/10 rounded-full p-2 mb-2">
                        {service.icon}
                      </div>
                      <h3 className="text-sm font-semibold text-center">{service.title}</h3>
                      <p className="text-xs text-white/90 text-center mt-1">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Go next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center px-8 py-4 bg-white/80 backdrop-blur-sm">
          <div className="text-sm text-gray-500">
            <span><b>Built</b> with ❤️ by Hitarth, Ali & Divyansh</span>
          </div>
          <div className="text-sm text-gray-500">
            <span><b>Powered</b> by EthGlobal</span>
          </div>
        </div>
      </div>
    </div>
  );
}