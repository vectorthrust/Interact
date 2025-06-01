"use client";

import { useState } from "react";
import { useTheme } from "@/app/providers";

export function ThemeSwitcher() {
  const { theme, setTheme, themeColors } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const themes = [
    { id: 'flow', name: 'Flow', color: '#00EE8A' },
    { id: 'flare', name: 'Flare', color: '#E51556' },
    { id: 'hedera', name: 'Hedera', color: '#FFFFFF' },
    { id: 'ethglobal', name: 'ETHGlobal', color: '#ff008c' }
  ];

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="p-2 rounded-lg transition-all duration-300 flex items-center gap-2"
        style={{
          backgroundColor: themeColors.background === '#FFFFFF' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
          color: themeColors.text,
          border: `1px solid ${themeColors.primary}40`
        }}
      >
        <span>{themes.find(t => t.id === theme)?.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isDropdownOpen && (
        <div 
          className="absolute right-0 mt-2 py-2 rounded-lg shadow-lg"
          style={{
            backgroundColor: themeColors.background === '#FFFFFF' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            border: `1px solid ${themeColors.primary}40`
          }}
        >
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id as any);
                setIsDropdownOpen(false);
              }}
              className={`w-full px-4 py-2 text-left transition-colors flex items-center gap-2 ${
                t.id === theme ? 'bg-opacity-10' : 'hover:bg-opacity-5'
              }`}
              style={{
                color: t.id === theme ? themeColors.primary : '#FFFFFF',
                backgroundColor: t.id === theme ? `${themeColors.primary}20` : 'transparent'
              }}
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: t.color }}
              />
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 