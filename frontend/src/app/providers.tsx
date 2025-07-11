'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type Theme = 'flow' | 'flare' | 'hedera' | 'ethglobal';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeColors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
    gradient: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeConfig = {
  flow: {
    primary: '#00CC7A',
    secondary: '#00AA6A',
    background: '#F8F8F8',
    text: '#000000',
    accent: '#00CC7A',
    gradient: 'linear-gradient(135deg, #00CC7A 0%, #00AA6A 100%)'
  },
  flare: {
    primary: '#E51556',
    secondary: '#E51556',
    background: '#F8F8F8',
    text: '#000000',
    accent: '#E51556',
    gradient: 'linear-gradient(135deg, #E51556 0%, #CC134D 100%)'
  },
  hedera: {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    background: '#0A0A0A',
    text: '#FFFFFF',
    accent: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #CCCCCC 100%)'
  },
  ethglobal: {
    primary: '#ff008c',
    secondary: '#ff008c',
    background: '#0A0A0A',
    text: '#FFFFFF',
    accent: '#ff008c',
    gradient: 'linear-gradient(135deg, #ff008c 0%, #ff4da6 100%)'
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('ethglobal');

  const themeColors = themeConfig[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeColors }}>
      <div style={{ backgroundColor: themeColors.background, minHeight: '100vh' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}