import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  price: number;
  amenities: string[];
  imageUrl?: string;
  images?: string[];
  ownerId?: string;
  rating?: number;
  reviews?: number;
  distance?: string;
  type?: string;
  propertyCategory?: string;
  category?: string;
  area?: string;
  lat?: number;
  lng?: number;
  policies?: string[];
  badges?: string[];
  // Premium Details
  sqm?: number;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  singleBeds?: number;
  doubleBeds?: number;
  sofaBeds?: number;
  cancellationPolicy?: 'Flexible' | 'Moderate' | 'Strict';
  cirCode?: string;
  spaceDescription?: string;
  accessDescription?: string;
  localTipsDescription?: string;
  unavailableDates?: string[]; // ISO date strings
}

interface Service {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  description: string;
  price: number;
  priceUnit: string;
  location: string;
  imageUrl?: string;
  ownerId?: string;
  rating?: number;
}

interface HotelsContextType {
  hotels: Hotel[];
  services: Service[];
  isLoading: boolean;
  refreshHotels: () => Promise<void>;
  addHotel: (hotel: Hotel) => void;
  addService: (service: Service) => void;
  globalCategory: string | null;
  setGlobalCategory: (category: string | null) => void;
  selectedAreas: string[];
  setSelectedAreas: (areas: string[]) => void;
  priceRange: { min: number; max: number } | null;
  setPriceRange: (range: { min: number; max: number } | null) => void;
  searchDates: { startDate: Date; endDate: Date } | null;
  setSearchDates: (dates: { startDate: Date; endDate: Date } | null) => void;
}

const HotelsContext = createContext<HotelsContextType | undefined>(undefined);

export const HotelsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalCategory, setGlobalCategory] = useState<string | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [searchDates, setSearchDates] = useState<{ startDate: Date; endDate: Date } | null>(null);

  const refreshHotels = useCallback(async () => {
    setIsLoading(true);
    try {
      const [hotelsRes, servicesRes] = await Promise.all([
        fetch('/api/hotels'),
        fetch('/api/services')
      ]);
      
      if (hotelsRes.ok) {
        const text = await hotelsRes.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            setAllHotels(data);
          } catch (e) {
            console.error('Failed to parse hotels JSON:', e);
          }
        }
      }
      
      if (servicesRes.ok) {
        const text = await servicesRes.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            setAllServices(data);
          } catch (e) {
            console.error('Failed to parse services JSON:', e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addHotel = useCallback((hotel: Hotel) => {
    setAllHotels(prev => [...prev, hotel]);
  }, []);

  const addService = useCallback((service: Service) => {
    setAllServices(prev => [...prev, service]);
  }, []);

  useEffect(() => {
    refreshHotels();
  }, [refreshHotels]);

  const hotels = useMemo(() => {
    let filtered = allHotels;
    
    if (globalCategory) {
      filtered = filtered.filter(h => h.category === globalCategory);
    }
    
    if (selectedAreas.length > 0) {
      filtered = filtered.filter(h => h.area && selectedAreas.includes(h.area));
    }

    if (priceRange) {
      filtered = filtered.filter(h => h.price >= priceRange.min && h.price <= priceRange.max);
    }

    if (searchDates) {
      filtered = filtered.filter(h => {
        if (!h.unavailableDates || h.unavailableDates.length === 0) return true;
        
        // Check if any date in the range intersects with unavailableDates
        const start = new Date(searchDates.startDate);
        const end = new Date(searchDates.endDate);
        
        // Normalize search dates to start of day for comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          
          if (h.unavailableDates.includes(dateString)) {
            return false;
          }
        }
        return true;
      });
    }

    return filtered;
  }, [allHotels, globalCategory, selectedAreas, priceRange, searchDates]);

  const contextValue = useMemo(() => ({ 
    hotels, 
    services: allServices,
    isLoading, 
    refreshHotels, 
    addHotel, 
    addService,
    globalCategory, 
    setGlobalCategory,
    selectedAreas,
    setSelectedAreas,
    priceRange,
    setPriceRange,
    searchDates,
    setSearchDates
  }), [
    hotels, 
    allServices, 
    isLoading, 
    refreshHotels, 
    addHotel, 
    addService, 
    globalCategory, 
    selectedAreas, 
    priceRange, 
    searchDates,
    setGlobalCategory,
    setSelectedAreas,
    setPriceRange,
    setSearchDates
  ]);

  return (
    <HotelsContext.Provider value={contextValue}>
      {children}
    </HotelsContext.Provider>
  );
};

export const useHotels = () => {
  const context = useContext(HotelsContext);
  if (context === undefined) {
    throw new Error('useHotels must be used within a HotelsProvider');
  }
  return context;
};
