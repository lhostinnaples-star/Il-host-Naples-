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
  status?: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  description: string;
  price: number;
  priceUnit: string;
  location?: string;
  imageUrl?: string;
  ownerId?: string; // Legacy
  providerId?: string;
  rating?: number;
  status?: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'SHARED' | 'ACCEPTED' | 'CLOSED' | 'EXPIRED';

export interface Booking {
  id: string;
  reference: string;
  propertyId: string;
  propertyName: string;
  propertyImage?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ownerId: string;
  startDate: string; // ISO
  endDate: string; // ISO
  nights: number;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  notes?: string;
  rejectionReason?: string;
  sharedAt?: string;
  sharedBy?: string;
  originalListerId?: string;
}

export interface HotelsContextType {
  hotels: Hotel[];
  allHotels: Hotel[];
  services: Service[];
  allServices: Service[];
  bookings: Booking[];
  isLoading: boolean;
  refreshHotels: () => Promise<void>;
  addHotel: (hotel: Hotel) => void;
  updateHotel: (id: string, updates: Partial<Hotel>) => void;
  addService: (service: Service) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalCategory, setGlobalCategoryState] = useState<string | null>(null);
  const [selectedAreas, setSelectedAreasState] = useState<string[]>([]);
  const [priceRange, setPriceRangeState] = useState<{ min: number; max: number } | null>(null);
  const [searchDates, setSearchDatesState] = useState<{ startDate: Date; endDate: Date } | null>(null);

  const setGlobalCategory = useCallback((category: string | null) => {
    setGlobalCategoryState(category);
  }, []);

  const setSelectedAreas = useCallback((areas: string[]) => {
    setSelectedAreasState(areas);
  }, []);

  const setPriceRange = useCallback((range: { min: number; max: number } | null) => {
    setPriceRangeState(range);
  }, []);

  const setSearchDates = useCallback((dates: { startDate: Date; endDate: Date } | null) => {
    setSearchDatesState(dates);
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try local storage first
      const savedHotels = localStorage.getItem('stay_ease_hotels');
      const savedServices = localStorage.getItem('stay_ease_services');
      const savedBookings = localStorage.getItem('stay_ease_bookings');

      if (savedHotels) {
        setAllHotels(JSON.parse(savedHotels));
      } else {
        // Fallback to fetch or mock
        const hotelsRes = await fetch('/api/hotels');
        if (hotelsRes.ok) {
          const data = await hotelsRes.json();
          setAllHotels(data);
          localStorage.setItem('stay_ease_hotels', JSON.stringify(data));
        }
      }

      if (savedServices) {
        setAllServices(JSON.parse(savedServices));
      } else {
        const servicesRes = await fetch('/api/services');
        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setAllServices(data);
          localStorage.setItem('stay_ease_services', JSON.stringify(data));
        }
      }

      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addHotel = useCallback((hotel: Hotel) => {
    setAllHotels(prev => {
      const updated = [...prev, hotel];
      localStorage.setItem('stay_ease_hotels', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateHotel = useCallback((id: string, updates: Partial<Hotel>) => {
    setAllHotels(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, ...updates } : h);
      localStorage.setItem('stay_ease_hotels', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addService = useCallback((service: Service) => {
    setAllServices(prev => {
      const updated = [...prev, service];
      localStorage.setItem('stay_ease_services', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateService = useCallback((id: string, updates: Partial<Service>) => {
    setAllServices(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      localStorage.setItem('stay_ease_services', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addBooking = useCallback((booking: Booking) => {
    setBookings(prev => {
      const updated = [booking, ...prev];
      localStorage.setItem('stay_ease_bookings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateBooking = useCallback((id: string, updates: Partial<Booking>) => {
    setBookings(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, ...updates } : b);
      localStorage.setItem('stay_ease_bookings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshHotels = refreshData;

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const hotels = useMemo(() => {
    let filtered = allHotels;
    
    // Default filter for public view: only approved properties
    // In a real app, this would be more complex (e.g. admin sees all)
    // For now, let's keep allHotels available in context for Dashboards
    
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

  const approvedServices = useMemo(() => 
    allServices.filter(s => s.status === 'approved'),
    [allServices]
  );

  const contextValue = useMemo(() => ({ 
    hotels, 
    allHotels,
    services: approvedServices,
    allServices,
    bookings,
    isLoading, 
    refreshHotels, 
    addHotel, 
    updateHotel,
    addService,
    updateService,
    addBooking,
    updateBooking,
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
    allHotels,
    approvedServices,
    allServices, 
    bookings,
    isLoading, 
    refreshHotels, 
    addHotel, 
    updateHotel,
    addService, 
    updateService,
    addBooking,
    updateBooking,
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
