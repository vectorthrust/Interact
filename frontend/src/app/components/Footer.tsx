'use client';

import { useTheme } from "@/app/providers";

export default function Footer() {
  const { themeColors, theme } = useTheme();

  const getPoweredBy = () => {
    switch (theme) {
      case 'flare':
        return 'Flare';
      case 'hedera':
        return 'Hedera';
      case 'flow':
        return 'Flow';
      default:
        return 'EthGlobal';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center px-8 py-4" 
      style={{ 
        backgroundColor: themeColors.background
      }}>
      <div className="text-sm" style={{ color: themeColors.text + '99' }}>
        <span><b>Built</b> with ❤️ by Hitarth, Ali & Divyansh</span>
      </div>
      <div className="text-sm" style={{ color: themeColors.text + '99' }}>
        <span><b>Powered</b> by {getPoweredBy()}</span>
      </div>
    </div>
  );
} 