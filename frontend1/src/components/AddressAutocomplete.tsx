'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers';

type Place = {
  display_name: string;
  lat: string;
  lon: string;
};

type Props = {
  onSelect: (address: string, coords: [number, number]) => void;
  placeholder?: string;
};

export const AddressAutocomplete: React.FC<Props> = ({ onSelect, placeholder = "Search for an address" }) => {
  const { themeColors } = useTheme();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        
        const data: Place[] = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (place: Place) => {
    const coords: [number, number] = [parseFloat(place.lat), parseFloat(place.lon)];
    onSelect(place.display_name, coords);
    setQuery(place.display_name);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
        style={{ 
          backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A',
          borderColor: themeColors.primary + '40',
          color: themeColors.text
        }}
      />
      
      {loading && (
        <div 
          className="absolute top-full left-0 right-0 p-2 text-center text-sm border-x border-b rounded-b-md z-50"
          style={{
            backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A',
            borderColor: themeColors.primary + '40',
            color: themeColors.text + 'CC'
          }}
        >
          Loading...
        </div>
      )}
      
      {suggestions.length > 0 && (
        <ul 
          className="absolute top-full left-0 right-0 border-x border-b rounded-b-md z-50 max-h-48 overflow-y-auto"
          style={{
            backgroundColor: themeColors.background === '#F8F8F8' ? '#FFFFFF' : '#1A1A1A',
            borderColor: themeColors.primary + '40'
          }}
        >
          {suggestions.map((place, index) => (
            <li
              key={index}
              onClick={() => handleSelect(place)}
              className="px-3 py-2 cursor-pointer transition-colors hover:opacity-80"
              style={{ 
                color: themeColors.text,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.primary + '10';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 