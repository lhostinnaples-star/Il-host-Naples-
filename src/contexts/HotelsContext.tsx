import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AREA_COORDINATES } from '../constants';

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
  gmbLink?: string;
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
  status?: 'pending' | 'approved' | 'rejected' | 'active';
  rejectionReason?: string;
  isFeatured?: boolean;
  rooms?: any[];
  extraServices?: string[];
  houseRules?: string[];
  owner?: {
    name: string;
    businessName?: string;
    phoneNumber?: string;
    email?: string;
  };
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
  status?: 'pending' | 'approved' | 'rejected' | 'active';
  rejectionReason?: string;
  isFeatured?: boolean;
  serviceType?: 'B2C' | 'B2B';
  areas?: string[];
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'SHARED' | 'ACCEPTED' | 'CLOSED' | 'EXPIRED' | 'COMPLETED';

export interface Booking {
  id: string;
  reference: string;
  bookingType: 'PROPERTY' | 'SERVICE';
  itemId: string; // hotelId or serviceId
  itemName: string;
  itemImage?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ownerId: string; // listerId or providerId
  startDate: string; // ISO (also used for service date)
  endDate?: string; // ISO (optional for services)
  nights?: number;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  notes?: string;
  rejectionReason?: string;
  sharedAt?: string;
  sharedBy?: string;
  originalListerId?: string;
  acceptedAt?: string;
  time?: string; // For services
  meetingPoint?: string; // For services
  area?: string; // For pool bookings
}

export interface Review {
  id: string;
  reviewerName: string;
  propertyId: string;
  propertyName: string;
  rating: number;
  text: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface SupplierAccessRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  propertyCount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface GlobalServiceRequest {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  whatsapp?: string;
  serviceNeeded: string;
  area: string;
  submittedAt: string;
}

export interface HotelsContextType {
  hotels: Hotel[];
  allHotels: Hotel[];
  services: Service[];
  allServices: Service[];
  bookings: Booking[];
  reviews: Review[];
  supplierAccessRequests: SupplierAccessRequest[];
  globalServiceRequests: GlobalServiceRequest[];
  isLoading: boolean;
  refreshHotels: () => Promise<void>;
  addHotel: (hotel: Hotel) => void;
  updateHotel: (id: string, updates: Partial<Hotel>) => void;
  addService: (service: Service) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  updateReview: (id: string, updates: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  deleteHotel: (id: string) => void;
  addSupplierAccessRequest: (request: SupplierAccessRequest) => void;
  updateSupplierAccessRequest: (id: string, status: 'pending' | 'approved' | 'rejected') => void;
  addGlobalServiceRequest: (request: GlobalServiceRequest) => void;
  globalCategory: string | null;
  setGlobalCategory: (category: string | null) => void;
  selectedAreas: string[];
  setSelectedAreas: (areas: string[]) => void;
  priceRange: { min: number; max: number } | null;
  setPriceRange: (range: { min: number; max: number } | null) => void;
  searchDates: { startDate: Date; endDate: Date } | null;
  setSearchDates: (dates: { startDate: Date; endDate: Date } | null) => void;
}

import { MOCK_PROPERTIES, MOCK_SERVICES, MOCK_REVIEWS } from '../utils/mockData';
import { toast } from 'sonner';
import { 
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../config/firebase';

const HotelsContext = createContext<HotelsContextType | undefined>(undefined);

export const HotelsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allHotels, setAllHotels] = useState<Hotel[]>(MOCK_PROPERTIES as any);
  const [allServices, setAllServices] = useState<Service[]>(MOCK_SERVICES as any);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [supplierAccessRequests, setSupplierAccessRequests] = useState<SupplierAccessRequest[]>([]);
  const [globalServiceRequests, setGlobalServiceRequests] = useState<GlobalServiceRequest[]>([]);
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
      const isDemoMode = localStorage.getItem('isDemoMode') === 'true';

      if (isDemoMode) {
        const savedHotels = localStorage.getItem('stay_ease_hotels');
        const savedServices = localStorage.getItem('stay_ease_services');
        
        if (savedHotels) {
          const parsed = JSON.parse(savedHotels);
          if (parsed && parsed.length > 0) {
            setAllHotels(parsed);
          } else {
            localStorage.removeItem('stay_ease_hotels');
            setAllHotels(MOCK_PROPERTIES as any);
          }
        } else {
          setAllHotels(MOCK_PROPERTIES as any);
        }

        if (savedServices) {
          const parsed = JSON.parse(savedServices);
          if (parsed && parsed.length > 0) {
            setAllServices(parsed);
          } else {
            localStorage.removeItem('stay_ease_services');
            setAllServices(MOCK_SERVICES as any);
          }
        } else {
          setAllServices(MOCK_SERVICES as any);
        }
      } else {
        try {
          const hotelsRef = collection(db, 'properties');
          const hotelsSnap = await getDocs(hotelsRef);
          if (!hotelsSnap.empty) {
            const fbHotels = hotelsSnap.docs.map(doc => doc.data() as Hotel);
            setAllHotels(fbHotels);
            localStorage.setItem('stay_ease_hotels', JSON.stringify(fbHotels));
          } else {
            setAllHotels(MOCK_PROPERTIES as any);
          }
        } catch (e) {
          console.error("Failed to fetch properties from Firestore", e);
          toast.warning("Using offline mode for properties");
          const savedHotels = localStorage.getItem('stay_ease_hotels');
          if (savedHotels) {
             const parsed = JSON.parse(savedHotels);
             if (parsed && parsed.length > 0) setAllHotels(parsed);
             else setAllHotels(MOCK_PROPERTIES as any);
          } else {
             setAllHotels(MOCK_PROPERTIES as any);
          }
        }

        try {
          const servicesRef = collection(db, 'services');
          const servicesSnap = await getDocs(servicesRef);
          if (!servicesSnap.empty) {
            const fbServices = servicesSnap.docs.map(doc => doc.data() as Service);
            setAllServices(fbServices);
            localStorage.setItem('stay_ease_services', JSON.stringify(fbServices));
          } else {
            setAllServices(MOCK_SERVICES as any);
          }
        } catch (e) {
          console.error("Failed to fetch services from Firestore", e);
          toast.warning("Using offline mode for services");
          const savedServices = localStorage.getItem('stay_ease_services');
          if (savedServices) {
             const parsed = JSON.parse(savedServices);
             if (parsed && parsed.length > 0) setAllServices(parsed);
             else setAllServices(MOCK_SERVICES as any);
          } else {
             setAllServices(MOCK_SERVICES as any);
          }
        }
      }

      const savedBookings = localStorage.getItem('stay_ease_bookings');
      
      if (isDemoMode) {
        if (savedBookings) {
          setBookings(JSON.parse(savedBookings));
        } else {
          const demoBookings: Booking[] = [
            {
              id: 'demo-pool-1',
              reference: 'REF-POOL-1',
              bookingType: 'PROPERTY',
              status: 'SHARED',
              itemId: 'hotel-1',
              itemName: 'Villa Partenope',
              customerId: 'user-guest-1',
              customerName: 'James W.',
              customerEmail: 'james.w@example.com',
              customerPhone: '+44 7700 900077',
              ownerId: 'demo-owner',
              startDate: '2026-06-15T12:00:00Z',
              endDate: '2026-06-19T10:00:00Z',
              guests: 2,
              totalPrice: 720,
              createdAt: new Date().toISOString(),
              area: 'Seafront (Chiaia - Posillipo)',
              sharedAt: new Date().toISOString()
            },
            {
              id: 'demo-pool-2',
              reference: 'REF-POOL-2',
              bookingType: 'PROPERTY',
              status: 'SHARED',
              itemId: 'hotel-2',
              itemName: 'Centro Storico B&B',
              customerId: 'user-guest-2',
              customerName: 'Sophie M.',
              customerEmail: 'sophie.m@example.com',
              customerPhone: '+33 6 12 34 56 78',
              ownerId: 'demo-owner',
              startDate: '2026-07-01T14:00:00Z',
              endDate: '2026-07-05T10:00:00Z',
              guests: 3,
              totalPrice: 450,
              createdAt: new Date().toISOString(),
              area: 'Center (Centro Storico)',
              sharedAt: new Date().toISOString()
            },
            {
              id: 'demo-pool-3',
              reference: 'REF-POOL-3',
              bookingType: 'PROPERTY',
              status: 'SHARED',
              itemId: 'hotel-3',
              itemName: 'Chiaia Sea View',
              customerId: 'user-guest-3',
              customerName: 'Roberto K.',
              customerEmail: 'roberto.k@example.com',
              customerPhone: '+49 151 23456789',
              ownerId: 'demo-owner',
              startDate: '2026-07-10T15:00:00Z',
              endDate: '2026-07-14T11:00:00Z',
              guests: 3,
              totalPrice: 850,
              createdAt: new Date().toISOString(),
              area: 'Seafront (Chiaia - Posillipo)',
              sharedAt: new Date().toISOString()
            }
          ];
          setBookings(demoBookings);
          localStorage.setItem('stay_ease_bookings', JSON.stringify(demoBookings));
        }

        const savedReviews = localStorage.getItem('stay_ease_reviews');
        if (savedReviews) {
          setReviews(JSON.parse(savedReviews));
        } else {
          setReviews(MOCK_REVIEWS as any);
          localStorage.setItem('stay_ease_reviews', JSON.stringify(MOCK_REVIEWS));
        }
      } else {
        // Subscribe to auth state so we reliably know when user is authenticated
        const unsubscribeAuth = import('firebase/auth').then(({ onAuthStateChanged }) => {
          return onAuthStateChanged(auth, async (user) => {
            if (user) {
              // Fetch all bookings normally
              try {
                const bookingsRef = collection(db, 'bookings');
                const bookingsSnap = await getDocs(bookingsRef);
                if (!bookingsSnap.empty) {
                  const fbBookings = bookingsSnap.docs.map(doc => ({id: doc.id, ...doc.data()}) as Booking);
                  setBookings(fbBookings);
                  localStorage.setItem('stay_ease_bookings', JSON.stringify(fbBookings));
                } else {
                  setBookings([]);
                }

                // Real-time Booking Pool Listener
                const poolQuery = query(
                  bookingsRef,
                  where('status', '==', 'SHARED')
                );
                
                const unsubscribePool = onSnapshot(poolQuery, (snapshot) => {
                  const poolBookings = snapshot.docs.map(
                    doc => ({id: doc.id, ...doc.data()}) as Booking
                  );
                  // We just update the state to overlay pool bookings
                  setBookings(prev => {
                    const nonShared = prev.filter(b => b.status !== 'SHARED');
                    return [...nonShared, ...poolBookings];
                  });
                }, (error) => {
                  handleFirestoreError(error, OperationType.GET, 'bookings');
                });
              } catch (e) {
                console.error("Failed to fetch bookings from Firestore", e);
                if (savedBookings) setBookings(JSON.parse(savedBookings));
              }
            } else {
               // Not authenticated, set mock or clear bookings
               if (savedBookings) setBookings(JSON.parse(savedBookings));
            }
          });
        });

        // Fetch all reviews normally
        try {
          const reviewsRef = collection(db, 'reviews');
          const reviewsSnap = await getDocs(reviewsRef);
          if (!reviewsSnap.empty) {
            const fbReviews = reviewsSnap.docs.map(doc => ({id: doc.id, ...doc.data()}) as Review);
            setReviews(fbReviews);
            localStorage.setItem('stay_ease_reviews', JSON.stringify(fbReviews));
          } else {
            setReviews(MOCK_REVIEWS as any);
          }
        } catch (e) {
          console.error("Failed to fetch reviews from Firestore", e);
          const savedReviews = localStorage.getItem('stay_ease_reviews');
          if (savedReviews) setReviews(JSON.parse(savedReviews));
          else setReviews(MOCK_REVIEWS as any);
        }
      }

      const savedSupplierRequests = localStorage.getItem('stay_ease_supplier_requests');
      if (savedSupplierRequests) {
        setSupplierAccessRequests(JSON.parse(savedSupplierRequests));
      }

      const savedGlobalRequests = localStorage.getItem('stay_ease_global_service_requests');
      if (savedGlobalRequests) {
        setGlobalServiceRequests(JSON.parse(savedGlobalRequests));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addHotel = useCallback(async (hotel: Hotel) => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    const hotelWithCoords = { 
      ...hotel, 
      status: hotel.status || 'pending' 
    };
    if ((!hotelWithCoords.lat || !hotelWithCoords.lng) && hotelWithCoords.area && AREA_COORDINATES[hotelWithCoords.area]) {
      hotelWithCoords.lat = AREA_COORDINATES[hotelWithCoords.area].lat;
      hotelWithCoords.lng = AREA_COORDINATES[hotelWithCoords.area].lng;
    }
    
    if (!isDemoMode) {
      try {
        await setDoc(doc(db, 'properties', hotelWithCoords.id), hotelWithCoords);
      } catch (err) {
        console.error('Error adding hotel to Firestore:', err);
        toast.warning('Offline mode: Saved locally');
      }
    }

    setAllHotels(prev => {
      const updated = [...prev, hotelWithCoords];
      localStorage.setItem('stay_ease_hotels', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateHotel = useCallback(async (id: string, updates: Partial<Hotel>) => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (!isDemoMode) {
      try {
        await updateDoc(doc(db, 'properties', id), updates);
      } catch (err) {
        console.error('Error updating hotel in Firestore:', err);
        toast.warning('Offline mode: Updated locally');
      }
    }

    setAllHotels(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, ...updates } : h);
      localStorage.setItem('stay_ease_hotels', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addService = useCallback(async (service: Service) => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    const serviceWithStatus = { ...service, status: service.status || 'pending' };
    
    if (!isDemoMode) {
      try {
        await setDoc(doc(db, 'services', serviceWithStatus.id), serviceWithStatus);
      } catch (err) {
        console.error('Error adding service to Firestore:', err);
        toast.warning('Offline mode: Saved locally');
      }
    }

    setAllServices(prev => {
      const updated = [...prev, serviceWithStatus];
      localStorage.setItem('stay_ease_services', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (!isDemoMode) {
      try {
        await updateDoc(doc(db, 'services', id), updates);
      } catch (err) {
        console.error('Error updating service in Firestore:', err);
        toast.warning('Offline mode: Updated locally');
      }
    }

    setAllServices(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      localStorage.setItem('stay_ease_services', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteService = useCallback(async (id: string) => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (!isDemoMode) {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (err) {
        console.error('Error deleting service in Firestore:', err);
      }
    }

    setAllServices(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('stay_ease_services', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteHotel = useCallback(async (id: string) => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (!isDemoMode) {
      try {
        await deleteDoc(doc(db, 'properties', id));
      } catch (err) {
        console.error('Error deleting hotel in Firestore:', err);
      }
    }

    setAllHotels(prev => {
      const updated = prev.filter(h => h.id !== id);
      localStorage.setItem('stay_ease_hotels', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addBooking = useCallback(async (booking: Booking) => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (!isDemoMode) {
      try {
        const bookingRef = booking.id ? doc(db, 'bookings', booking.id) : doc(collection(db, 'bookings'));
        const bookingData = {
           ...booking,
           id: bookingRef.id,
           createdAt: serverTimestamp()
        };
        await setDoc(bookingRef, bookingData);
        // Replace id with the one generated if missing
        booking.id = bookingRef.id;
      } catch (err) {
        console.error('Error adding booking in Firestore:', err);
      }
    }

    setBookings(prev => {
      const updated = [booking, ...prev];
      localStorage.setItem('stay_ease_bookings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateBooking = useCallback(async (id: string, updates: Partial<Booking>) => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (!isDemoMode) {
      try {
        await updateDoc(doc(db, 'bookings', id), updates);
      } catch (err) {
        console.error('Error updating booking in Firestore:', err);
      }
    }

    setBookings(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, ...updates } : b);
      localStorage.setItem('stay_ease_bookings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteBooking = useCallback(async (id: string) => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (!isDemoMode) {
      try {
        await deleteDoc(doc(db, 'bookings', id));
      } catch (err) {
        console.error('Error deleting booking in Firestore:', err);
      }
    }

    setBookings(prev => {
      const updated = prev.filter(b => b.id !== id);
      localStorage.setItem('stay_ease_bookings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateReview = useCallback(async (id: string, updates: Partial<Review>) => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (!isDemoMode) {
      try {
        await updateDoc(doc(db, 'reviews', id), updates);
      } catch (err) {
        console.error('Error updating review in Firestore:', err);
      }
    }

    setReviews(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      localStorage.setItem('stay_ease_reviews', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (!isDemoMode) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
      } catch (err) {
        console.error('Error deleting review in Firestore:', err);
      }
    }

    setReviews(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('stay_ease_reviews', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addSupplierAccessRequest = useCallback((request: SupplierAccessRequest) => {
    setSupplierAccessRequests(prev => {
      const updated = [request, ...prev];
      localStorage.setItem('stay_ease_supplier_requests', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addGlobalServiceRequest = useCallback((request: GlobalServiceRequest) => {
    setGlobalServiceRequests(prev => {
      const updated = [request, ...prev];
      localStorage.setItem('stay_ease_global_service_requests', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateSupplierAccessRequest = useCallback((id: string, status: 'pending' | 'approved' | 'rejected') => {
    setSupplierAccessRequests(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status } : r);
      localStorage.setItem('stay_ease_supplier_requests', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshHotels = refreshData;

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const hotels = useMemo(() => {
    let filtered = allHotels.filter(h => h.status === 'approved');
    
    if (globalCategory) {
      filtered = filtered.filter(h => h.category === globalCategory);
    }
    
    if (selectedAreas.length > 0) {
      filtered = filtered.filter(h => {
        if (!h.area) return false;
        return selectedAreas.some(area => {
          const areaBase = area.split('(')[0].trim().toLowerCase();
          return h.area!.toLowerCase().includes(areaBase);
        });
      });
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
    allServices.filter(s => 
      s.status === 'approved' || 
      s.status === undefined ||
      s.status === 'active'
    ),
    [allServices]
  );

  console.log('--- HotelsContext Diagnostics ---');
  console.log('allHotels count:', allHotels.length);
  console.log('allServices count:', allServices.length);
  console.log('bookings count:', bookings.length);
  console.log('First Hotel:', allHotels[0]);
  console.log('First Service:', allServices[0]);
  console.log('isLoading:', isLoading);

  const contextValue = useMemo(() => ({ 
    hotels, 
    allHotels,
    services: approvedServices,
    allServices,
    bookings,
    reviews,
    supplierAccessRequests,
    isLoading, 
    refreshHotels, 
    addHotel, 
    updateHotel,
    addService,
    updateService,
    deleteService,
    addBooking,
    updateBooking,
    deleteBooking,
    updateReview,
    deleteReview,
    deleteHotel,
    addSupplierAccessRequest,
    updateSupplierAccessRequest,
    globalServiceRequests,
    addGlobalServiceRequest,
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
    reviews,
    supplierAccessRequests,
    isLoading, 
    refreshHotels, 
    addHotel, 
    updateHotel,
    addService, 
    updateService,
    addBooking,
    updateBooking,
    updateReview,
    deleteReview,
    addSupplierAccessRequest,
    updateSupplierAccessRequest,
    globalCategory, 
    selectedAreas, 
    priceRange, 
    searchDates,
    setGlobalCategory,
    setSelectedAreas,
    setPriceRange,
    setSearchDates
  ]);

  console.log('--- Homepage Diagnostics ---');
  console.log('Featured Properties Filtered:', allHotels.filter(h => h.status === 'approved' && h.isFeatured).length);
  console.log('Featured Experiences Filtered:', allServices.filter(s => s.status === 'approved' && s.serviceType === 'B2C').length);

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
