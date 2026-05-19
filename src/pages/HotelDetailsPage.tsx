import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, Button } from '../components/UI';
import { 
  MapPin, Star, Bed, Users, Calendar, CheckCircle2, 
  Maximize, Bath, Wifi, Wind, UtensilsCrossed, 
  ArrowUpCircle, Waves, ChevronRight, ChevronLeft,
  Info, ShieldCheck, Map as MapIcon, ChevronDown, ChevronUp, X,
  Share, Heart, Phone, Clock,
  Car, Bike, Ship, Palmtree, UserCheck, Utensils, ChefHat, Sparkles, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, isWithinInterval, parseISO, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import { useHotels, Booking } from '../contexts/HotelsContext';
import { WishlistButton } from '../components/WishlistButton';
import { ReviewCard } from '../components/ReviewCard';
import { BackButton } from '../components/BackButton';
import { BookingWidget } from '../components/BookingWidget';
import { SEOHead } from '../components/SEOHead';
import { generatePropertySchema, generateSlug, generateBreadcrumbSchema } from '../utils/seo';
import { Input } from '../components/UI';

const AmenityIcon: React.FC<{ name: string }> = ({ name }) => {
  const lower = name.toLowerCase();
  if (lower.includes('wifi')) return <Wifi className="h-5 w-5" />;
  if (lower.includes('ac') || lower.includes('air conditioning')) return <Wind className="h-5 w-5" />;
  if (lower.includes('kitchen')) return <UtensilsCrossed className="h-5 w-5" />;
  if (lower.includes('elevator')) return <ArrowUpCircle className="h-5 w-5" />;
  if (lower.includes('washing') || lower.includes('laundry')) return <Waves className="h-5 w-5" />;
  return <CheckCircle2 className="h-5 w-5" />;
};

export const HotelDetailsPage: React.FC = () => {
  const { id: idParam, slugWithId } = useParams();
  const id = idParam || (slugWithId ? slugWithId.split('-').pop() : null);
  const { token, user } = useAuth();
  const { formatPrice } = useCurrency();
  const { searchDates, hotels, allHotels, addBooking, isLoading } = useHotels();

  // Find hotel from context instead of API
  const foundHotel = useMemo(() => {
    // try exact id match first
    let hotel = allHotels.find(h => h.id === id);
    if (!hotel) {
      // if not found, it might be a slug that ends with the ID, e.g., "hotel-name-hotel-1"
      // or we can try just looking for a hotel that has this ID in the string.
      // Better: fallback to slug search if id is actually a slug.
      const possibleId = id?.split('-').pop(); // In case of standard slug format
      hotel = allHotels.find(h => h.id === possibleId);
    }
    return hotel;
  }, [allHotels, id]);

  console.log('Hotel ID from UI:', id);
  console.log('Found Hotel:', foundHotel);
  console.log('All Hotels count:', allHotels.length);

  const hotel = useMemo(() => {
    if (!foundHotel) return null;
    return {
      ...foundHotel,
      sqm: foundHotel.sqm || 65,
      guests: foundHotel.guests || 2,
      bedrooms: foundHotel.bedrooms || 1,
      bathrooms: foundHotel.bathrooms || 1,
      rating: foundHotel.rating || 4.5,
      reviews: foundHotel.reviews || 0,
      amenities: foundHotel.amenities || [],
      lat: foundHotel.lat || 40.8518,
      lng: foundHotel.lng || 14.2681,
      images: foundHotel.images || [foundHotel.imageUrl] || [],
      spaceDescription: foundHotel.spaceDescription || "This elegant apartment combines traditional Neapolitan charm with modern amenities. Located in a historic building, it features high ceilings and large windows that flood the rooms with natural light.",
      accessDescription: foundHotel.accessDescription || "Guests have full access to the entire apartment. The building has a 24/7 concierge service and a modern elevator.",
      localTipsDescription: foundHotel.localTipsDescription || "Don't miss the local bakery just around the corner for the best sfogliatella in town. The metro station is a 5-minute walk away, connecting you to all major attractions.",
      cancellationPolicy: foundHotel.cancellationPolicy || 'Moderate',
      cirCode: foundHotel.cirCode || 'CIR-12345-NAP',
      unavailableDates: foundHotel.unavailableDates || [],
      extraServices: (foundHotel.extraServices && foundHotel.extraServices.length > 0) 
        ? foundHotel.extraServices 
        : ['rent_car', 'rent_scooter', 'bike_rental', 'taxi_services', 'ncc_private', 'boat_rental', 'coastline', 'private_tour', 'restaurant_booking', 'private_chef', 'cooking_class', 'spa_massage'],
      rooms: foundHotel.rooms || [],
      houseRules: foundHotel.houseRules || ["No smoking", "No parties", "No pets"],
      owner: foundHotel.owner || { name: 'Professional Host', businessName: 'Lhost Naples', phoneNumber: '+39 081 1234567' }
    } as any;
  }, [foundHotel]);

  // For similar properties
  const similarHotels = hotels.filter(h => h.id !== id).slice(0, 4);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<any[]>([]);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [dateRange, setDateRange] = useState([
    {
      startDate: searchDates?.startDate || new Date(),
      endDate: searchDates?.endDate || addDays(new Date(), 1),
      key: 'selection'
    }
  ]);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [mobileSliderIndex, setMobileSliderIndex] = useState(0);
  const [selectedExtraServices, setSelectedExtraServices] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState(1);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showFullScreenMap, setShowFullScreenMap] = useState(false);
  const [requestDetails, setRequestDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    notes: ''
  });
  const guestServiceCategories = [
    {
      title: 'Transport',
      services: [
        { id: 'rent_car', label: 'Rent a Car', icon: Car },
        { id: 'rent_scooter', label: 'Rent Scooter', icon: Bike },
        { id: 'bike_rental', label: 'Bike Rental', icon: Bike },
        { id: 'taxi_services', label: 'Taxi Services', icon: Car },
        { id: 'ncc_private', label: 'NCC Private', icon: ShieldCheck },
      ]
    },
    {
      title: 'Tours & Leisure',
      services: [
        { id: 'boat_rental', label: 'Boat Rental', icon: Ship },
        { id: 'coastline', label: 'Coastline', icon: Palmtree },
        { id: 'private_tour', label: 'Private Tour', icon: UserCheck },
      ]
    },
    {
      title: 'Food & Lifestyle',
      services: [
        { id: 'restaurant_booking', label: 'Restaurant Table Booking', icon: Utensils },
        { id: 'private_chef', label: 'Private Chef', icon: ChefHat },
        { id: 'cooking_class', label: 'Cooking Class', icon: UtensilsCrossed },
        { id: 'spa_massage', label: 'Spa Massage', icon: Sparkles },
      ]
    }
  ];

  const handleToggleExtraService = (serviceId: string) => {
    setSelectedExtraServices(prev => 
      prev.includes(serviceId) ? prev.filter(s => s !== serviceId) : [...prev, serviceId]
    );
  };

  // Simulated srcset for performance optimization
  const getResponsiveSrc = (url: string, size: 'sm' | 'md' | 'lg') => {
    if (url.includes('picsum.photos')) {
      const width = size === 'sm' ? 400 : size === 'md' ? 800 : 1200;
      const height = Math.round(width * 0.75);
      return `${url.split('?')[0]}?width=${width}&height=${height}`;
    }
    return url;
  };

  useEffect(() => {
    if (!hotel) return;

    // Save to Recently Viewed
    try {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      
      const cardData = {
        id: hotel.id,
        name: hotel.name,
        price: hotel.price,
        imageUrl: hotel.imageUrl,
        images: hotel.images,
        type: hotel.type,
        area: hotel.area,
        category: hotel.category,
        rooms: hotel.rooms ? hotel.rooms.map((r: any) => ({ price: r.price })) : []
      };

      const updated = [cardData, ...viewed.filter((h: any) => h.id !== cardData.id)].slice(0, 5);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recently viewed', e);
    }

    // Demo reviews fallback since API is not present
    setReviews([
      {
        id: 'demo-r1',
        rating: 5,
        comment: "Absolutely loved the authentic Naples vibe here. The host was very helpful with local tips!",
        User: { name: 'Sarah M.' },
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: 'demo-r2',
        rating: 4,
        comment: "Great location and very clean. A bit noisy at night but that's part of the city charm.",
        User: { name: 'John D.' },
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
      }
    ]);
  }, [hotel]);

  const handleBook = async () => {
    // Dates validation
    const { startDate, endDate } = dateRange[0];

    if (isSameDay(startDate, endDate)) {
      toast.error('Please select at least one night');
      return;
    }

    // Check for overlap with unavailable dates
    const isOverlapping = hotel.unavailableDates.some((d: string) => {
      const date = parseISO(d);
      return isWithinInterval(date, { start: startDate, end: endDate });
    });

    if (isOverlapping) {
      toast.error('Selected dates include unavailable days');
      return;
    }

    setShowRequestForm(true);
  };

  const [bookingRef, setBookingRef] = useState('');
  const [requestValidationErrors, setRequestValidationErrors] = useState<any>({});

  const handleSendRequest = async () => {
    const errors: any = {};
    if (!requestDetails.name) errors.name = "Full Name is required";
    if (!requestDetails.email) errors.email = "Email is required";
    if (!requestDetails.phone) errors.phone = "Phone is required";
    
    setRequestValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the errors before proceeding');
      return;
    }

    setBookingStatus('loading');

    const { startDate, endDate } = dateRange[0];
    const nights = nightsCount;
    const pricePerNight = hotel.rooms?.[selectedRoomIdx]?.price || hotel.price;
    const extraTotal = selectedExtraServices.length * 50; // Simple calc for now
    const totalPrice = (pricePerNight * nights) + extraTotal;
    const reference = 'BE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setBookingRef(reference);

    const newBooking = {
      id: `book-${Date.now()}`,
      reference,
      bookingType: 'PROPERTY' as const,
      itemId: hotel.id,
      itemName: hotel.name,
      itemImage: galleryImages[0],
      customerId: user?.id || 'anon',
      customerName: requestDetails.name,
      customerEmail: requestDetails.email,
      customerPhone: requestDetails.phone,
      ownerId: hotel.ownerId || 'admin',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      nights,
      guests: guestCount,
      totalPrice,
      status: 'PENDING' as any,
      createdAt: new Date().toISOString(),
      notes: requestDetails.notes
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addBooking(newBooking as any);
      
      console.log('EMAIL TO CUSTOMER:', `Your request ${reference} has been sent!`);
      console.log('EMAIL TO LISTER:', `New booking request for ${hotel.name} from ${requestDetails.name}`);

      setBookingStatus('success');
      setShowRequestForm(false);
      toast.success('Request sent successfully!');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
      setBookingStatus('idle');
    }
  };

  if (!hotel && !isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white p-6">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-neutral-50 flex items-center justify-center text-[#fbbf24]">
              <Info className="h-10 w-10" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#1e293b] mb-4">Property not found</h2>
          <p className="text-neutral-500 mb-8 font-medium">
            We couldn't find the property you're looking for. It might have been removed or the link is incorrect.
          </p>
          <Button 
            onClick={() => navigate('/search')}
            className="w-full bg-[#fbbf24] text-black hover:bg-[#d9a320] font-black uppercase tracking-widest h-14 rounded-2xl transition-all shadow-lg shadow-[#fbbf24]/20"
          >
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  if (!hotel) return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#fbbf24] border-t-transparent"></div>
    </div>
  );

  const nightsCount = Math.max(1, Math.ceil((dateRange[0].endDate.getTime() - dateRange[0].startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const disabledDates = (hotel.unavailableDates || []).map((d: string) => parseISO(d));

  const galleryImages = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.imageUrl];

  const slug = generateSlug(hotel.name);
  const typeSlug = generateSlug(hotel.type || 'holiday-house');
  const areaSlug = generateSlug(hotel.area || 'naples');
  const canonical = `/naples/${typeSlug}/${areaSlug}/${slug}-${hotel.id}`;
  const seoTitle = `${hotel.name} - ${hotel.type || 'Holiday House'} in ${hotel.area || 'Naples'} Naples`;
  
  const breadcrumbItems = [
    { name: 'Home', item: '/' },
    { name: 'Naples', item: '/search' },
    { name: hotel.area || 'Naples', item: `/naples/${areaSlug}` },
    { name: hotel.name, item: canonical }
  ];

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24 md:pb-0 relative">
      <BackButton className="fixed top-20 left-4 md:absolute md:top-24 md:left-6 z-40" variant="dark" />
      <SEOHead 
        title={seoTitle}
        description={`Book ${hotel.name} in ${hotel.area || 'Naples'}, Naples. ${hotel.bedrooms || 1} bedrooms. From ${formatPrice(hotel.price)}/night. ${hotel.cancellationPolicy || 'Moderate'}.`}
        image={galleryImages[0]}
        type="hotel.room"
        canonical={canonical}
        schema={[
          generatePropertySchema(hotel),
          generateBreadcrumbSchema(breadcrumbItems)
        ]}
      />

      {/* Breadcrumbs */}
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <ol className="flex items-center space-x-2 text-sm text-[#94a3b8]">
          <li><Link to="/" className="hover:text-[#F5A623] transition-colors">Home</Link></li>
          <li>/</li>
          <li><Link to="/search" className="hover:text-[#F5A623] transition-colors">Naples</Link></li>
          <li>/</li>
          <li><Link to={`/naples/${areaSlug}`} className="hover:text-[#F5A623] transition-colors">{hotel.area || 'Naples'}</Link></li>
          <li>/</li>
          <li className="text-white truncate max-w-[150px] md:max-w-none">{hotel.name}</li>
        </ol>
      </nav>

      {/* Hero Gallery - Responsive Layout */}
      <section className="mx-auto max-w-7xl px-0 md:px-6 py-0 md:py-8">
        {/* Mobile Slider / Desktop Grid */}
        <div className="relative group">
          {/* Desktop Grid (Hidden on Mobile) */}
          <div className="hidden md:grid h-[500px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
            <div className="col-span-2 row-span-2 overflow-hidden">
              <img 
                src={galleryImages[0]} 
                className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105" 
                onClick={() => setShowAllPhotos(true)}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="overflow-hidden">
              <img 
                src={galleryImages[1] || galleryImages[0]} 
                className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105" 
                onClick={() => setShowAllPhotos(true)}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="overflow-hidden">
              <img 
                src={galleryImages[2] || galleryImages[0]} 
                className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105" 
                onClick={() => setShowAllPhotos(true)}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="overflow-hidden">
              <img 
                src={galleryImages[3] || galleryImages[0]} 
                className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105" 
                onClick={() => setShowAllPhotos(true)}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="relative overflow-hidden">
              <img 
                src={galleryImages[4] || galleryImages[0]} 
                className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105" 
                onClick={() => setShowAllPhotos(true)}
                referrerPolicy="no-referrer"
              />
              {galleryImages.length > 5 && (
                <button 
                  onClick={() => setShowAllPhotos(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                >
                  + {galleryImages.length - 4} Photos
                </button>
              )}
            </div>
          </div>

          {/* Mobile Slider (Hidden on Desktop) */}
          <div className="md:hidden relative aspect-[4/3] w-full overflow-hidden">
            <motion.div 
              className="flex h-full w-full"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                const threshold = 50;
                if (info.offset.x < -threshold && mobileSliderIndex < galleryImages.length - 1) {
                  setMobileSliderIndex(prev => prev + 1);
                } else if (info.offset.x > threshold && mobileSliderIndex > 0) {
                  setMobileSliderIndex(prev => prev - 1);
                }
              }}
              animate={{ x: `-${mobileSliderIndex * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {galleryImages.map((img: string, idx: number) => (
                <div key={idx} className="h-full w-full flex-shrink-0">
                  <img 
                    src={getResponsiveSrc(img, 'md')} 
                    srcSet={`${getResponsiveSrc(img, 'sm')} 400w, ${getResponsiveSrc(img, 'md')} 800w, ${getResponsiveSrc(img, 'lg')} 1200w`}
                    sizes="(max-width: 768px) 100vw, 800px"
                    className="h-full w-full object-cover" 
                    onClick={() => {
                      setActivePhotoIndex(idx);
                      setShowAllPhotos(true);
                    }}
                    referrerPolicy="no-referrer"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </motion.div>

            {/* Mobile Navigation Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (mobileSliderIndex > 0) setMobileSliderIndex(prev => prev - 1);
                  }}
                  disabled={mobileSliderIndex === 0}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 flex items-center justify-center text-white backdrop-blur-sm transition-opacity ${mobileSliderIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (mobileSliderIndex < galleryImages.length - 1) setMobileSliderIndex(prev => prev + 1);
                  }}
                  disabled={mobileSliderIndex === galleryImages.length - 1}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 flex items-center justify-center text-white backdrop-blur-sm transition-opacity ${mobileSliderIndex === galleryImages.length - 1 ? 'opacity-0' : 'opacity-100'}`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              {mobileSliderIndex + 1} / {galleryImages.length}
            </div>
          </div>
          
          <button 
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 right-4 hidden md:flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#1e293b] shadow-lg transition-all hover:bg-neutral-50"
          >
            <Maximize className="h-4 w-4" /> View All Photos
          </button>
        </div>
      </section>

      {/* Full Photo Overlay - Swipe Navigable Lightbox */}
      <AnimatePresence>
        {showAllPhotos && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col bg-black md:bg-white"
          >
            <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/10 md:border-neutral-100 bg-black md:bg-white text-white md:text-[#1e293b]">
              <h2 className="text-lg md:text-xl font-bold truncate pr-4">{hotel.name}</h2>
              <button 
                onClick={() => setShowAllPhotos(false)}
                className="rounded-full bg-white/10 md:bg-neutral-100 p-2 text-white md:text-neutral-500 hover:bg-white/20 md:hover:bg-neutral-200"
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>
            
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              <motion.div 
                className="flex h-full w-full"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  const threshold = 50;
                  if (info.offset.x < -threshold && activePhotoIndex < galleryImages.length - 1) {
                    setActivePhotoIndex(prev => prev + 1);
                  } else if (info.offset.x > threshold && activePhotoIndex > 0) {
                    setActivePhotoIndex(prev => prev - 1);
                  }
                }}
                animate={{ x: `-${activePhotoIndex * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {galleryImages.map((img: string, idx: number) => (
                  <div key={idx} className="h-full w-full flex-shrink-0 flex items-center justify-center p-4 md:p-12">
                    <img 
                      src={getResponsiveSrc(img, 'lg')} 
                      className="max-h-full max-w-full rounded-xl md:rounded-2xl shadow-2xl object-contain" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                ))}
              </motion.div>

              {/* Desktop Nav Buttons */}
              <button 
                className={`absolute left-8 top-1/2 -translate-y-1/2 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 ${activePhotoIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onClick={() => setActivePhotoIndex(prev => prev - 1)}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                className={`absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 ${activePhotoIndex === galleryImages.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onClick={() => setActivePhotoIndex(prev => prev + 1)}
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Counter */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
                {activePhotoIndex + 1} / {galleryImages.length}
              </div>
            </div>

            {/* Thumbnails (Desktop Only) */}
            <div className="hidden md:flex h-24 items-center justify-center gap-2 bg-neutral-50 border-t p-4 overflow-x-auto">
              {galleryImages.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activePhotoIndex === idx ? 'border-[#fbbf24] scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={getResponsiveSrc(img, 'sm')} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-6 py-8 md:py-12 pb-32 md:pb-12">
        <div className="flex flex-col gap-8 md:gap-12 lg:flex-row">
          {/* Left Content (70%) */}
          <div className="flex-1">
            <div className="mb-6 md:mb-8">
              <div className="mb-4 flex flex-wrap items-center gap-2 md:gap-3">
                <span className="rounded-full bg-[#fbbf24]/10 px-3 py-1 text-[10px] md:text-xs font-bold text-[#fbbf24] uppercase tracking-wider">
                  {hotel.category === 'bnb' ? 'Bed & Breakfast' : 'Holiday House'}
                </span>
                {hotel.area && (
                  <span className="rounded-full bg-[#1e293b]/5 px-3 py-1 text-[10px] md:text-xs font-bold text-[#1e293b] uppercase tracking-wider">
                    Category: {hotel.area}
                  </span>
                )}
                <div className="flex items-center gap-1 text-xs md:text-sm font-bold text-[#1e293b]">
                  <Star className="h-3 w-3 md:h-4 md:w-4 fill-[#fbbf24] text-[#fbbf24]" />
                  {hotel.rating || 4.9} ({hotel.reviews || 120} reviews)
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="mb-4 font-display text-3xl md:text-5xl font-bold text-[#1e293b]">
                  {hotel.name}
                </h1>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-bold shadow-sm transition-all hover:bg-neutral-50 hidden sm:flex">
                    <Share className="h-4 w-4" />
                    Share
                  </button>
                  <WishlistButton propertyId={hotel.id} className="p-2 sm:px-4 sm:py-2 rounded-full border border-neutral-200 shadow-sm transition-all hover:bg-neutral-50 flex items-center gap-2 bg-white" iconClassName="h-4 w-4 text-neutral-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-neutral-500">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-[#fbbf24]" />
                <span className="text-base md:text-lg">{hotel.address}, {hotel.city}</span>
              </div>
            </div>

            {/* Key Specs Bar - Compact on Mobile */}
            <div className="mb-6 md:mb-12 grid grid-cols-2 md:flex md:flex-wrap items-center gap-3 md:gap-8 border-y border-neutral-100 py-4 md:py-8">
              <div className="flex items-center gap-2 md:gap-3">
                <Maximize className="h-4 w-4 md:h-6 md:w-6 text-[#fbbf24]" />
                <div>
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400">Area</p>
                  <p className="text-xs md:text-lg font-bold text-[#1e293b]">{hotel.sqm} m²</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Users className="h-4 w-4 md:h-6 md:w-6 text-[#fbbf24]" />
                <div>
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400">Guests</p>
                  <p className="text-xs md:text-lg font-bold text-[#1e293b]">{hotel.guests} People</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Bed className="h-4 w-4 md:h-6 md:w-6 text-[#fbbf24]" />
                <div>
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400">Bedrooms</p>
                  <p className="text-xs md:text-lg font-bold text-[#1e293b]">{hotel.bedrooms} Rooms</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Bath className="h-4 w-4 md:h-6 md:w-6 text-[#fbbf24]" />
                <div>
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-400">Bathrooms</p>
                  <p className="text-xs md:text-lg font-bold text-[#1e293b]">{hotel.bathrooms} Baths</p>
                </div>
              </div>
            </div>

            {/* Guest Extra Services - Redesigned Section */}
            <div className="mb-8 md:mb-12">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#1e293b]">Guest Extra Services</h2>
                <p className="text-sm text-neutral-500 mt-1">Select the additional services you can provide or arrange for your guests.</p>
              </div>

              <div className="space-y-8">
                {guestServiceCategories.map((category) => {
                  const availableServices = category.services.filter(s => hotel.extraServices?.includes(s.id));
                  if (availableServices.length === 0) return null;

                  return (
                    <div key={category.title}>
                      <h3 className="text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#fbbf24] mb-3 md:mb-4">{category.title}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                        {availableServices.map((service) => (
                          <label 
                            key={service.id} 
                            className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer group ${
                              selectedExtraServices.includes(service.id)
                                ? 'border-[#fbbf24] bg-[#fbbf24]/5 shadow-sm'
                                : 'border-neutral-100 hover:border-neutral-200 bg-white'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={selectedExtraServices.includes(service.id)}
                              onChange={() => handleToggleExtraService(service.id)}
                            />
                            <div className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl transition-colors ${
                              selectedExtraServices.includes(service.id) ? 'bg-[#fbbf24] text-[#1e293b]' : 'bg-neutral-50 text-neutral-400 group-hover:text-[#fbbf24]'
                            }`}>
                              <service.icon className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <span className={`text-xs md:text-sm font-bold transition-colors ${
                              selectedExtraServices.includes(service.id) ? 'text-[#1e293b]' : 'text-neutral-600'
                            }`}>{service.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {(!hotel.extraServices || hotel.extraServices.length === 0) && (
                  <div className="rounded-2xl bg-neutral-50 p-6 text-center">
                    <Sparkles className="h-8 w-8 text-neutral-200 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400 italic font-medium">No specialized extra services are currently active for this property.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8 md:mb-12">
              <h2 className="mb-4 md:mb-6 font-display text-xl md:text-2xl font-bold text-[#1e293b]">About this space</h2>
              <div className={`relative overflow-hidden transition-all duration-500 ${isDescExpanded ? 'max-h-[2000px]' : 'max-h-48'}`}>
                <div className="space-y-4 md:space-y-6 text-base md:text-lg leading-relaxed text-neutral-600">
                  <p>{hotel.description}</p>
                  <div className="space-y-4">
                    <h3 className="font-bold text-[#1e293b]">The Space</h3>
                    <p>{hotel.spaceDescription}</p>
                    <h3 className="font-bold text-[#1e293b]">Access</h3>
                    <p>{hotel.accessDescription}</p>
                    <h3 className="font-bold text-[#1e293b]">Local Tips</h3>
                    <p>{hotel.localTipsDescription}</p>
                  </div>
                </div>
                {!isDescExpanded && (
                  <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
                )}
              </div>
              <button 
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="mt-4 md:mt-6 flex items-center gap-2 font-bold text-[#fbbf24] hover:text-[#f59e0b] transition-colors"
              >
                {isDescExpanded ? (
                  <>Read Less <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Read More <ChevronDown className="h-4 w-4" /></>
                )}
              </button>
            </div>

            {/* Room Types Selection */}
            {hotel.rooms && hotel.rooms.length > 0 && (
              <div className="mb-8 md:mb-12">
                <h2 className="mb-6 md:mb-8 font-display text-xl md:text-2xl font-bold text-[#1e293b]">Choose your room</h2>
                <div className="space-y-4">
                  {hotel.rooms.map((room: any, idx: number) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedRoomIdx(idx)}
                      className={`cursor-pointer rounded-2xl md:rounded-3xl border-2 p-4 md:p-6 transition-all ${
                        selectedRoomIdx === idx 
                          ? 'border-[#fbbf24] bg-[#fbbf24]/5 shadow-lg' 
                          : 'border-neutral-100 hover:border-neutral-200'
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                          <h3 className="text-lg md:text-xl font-bold text-[#1e293b]">{room.type}</h3>
                          <p className="mt-1 text-xs md:text-sm text-neutral-500">{room.description}</p>
                          <div className="mt-4 flex flex-wrap gap-3 md:gap-4 text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {room.capacity} Guests</span>
                            {Number(room.doubleBeds) > 0 && <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {room.doubleBeds} Double</span>}
                            {Number(room.singleBeds) > 0 && <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {room.singleBeds} Single</span>}
                            {Number(room.sofaBeds) > 0 && <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {room.sofaBeds} Sofa</span>}
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-xl md:text-2xl font-bold text-[#1e293b]">{formatPrice(room.price)}</p>
                          <p className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase">per night</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="mb-8 md:mb-12">
              <h2 className="mb-6 md:mb-8 font-display text-xl md:text-2xl font-bold text-[#1e293b]">What this place offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {hotel.amenities?.map((amenity: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 text-neutral-600">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-[#fbbf24]">
                      <AmenityIcon name={amenity} />
                    </div>
                    <span className="font-medium text-sm md:text-base">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Section */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="font-display text-xl md:text-2xl font-bold text-[#1e293b]">Where you'll be</h2>
                <button 
                  onClick={() => setShowFullScreenMap(true)}
                  className="lg:hidden text-[10px] font-black uppercase tracking-widest text-[#fbbf24] bg-[#fbbf24]/10 px-3 py-1.5 rounded-lg"
                >
                  Full Screen
                </button>
              </div>
              <div 
                onClick={() => { if(window.innerWidth < 1024) setShowFullScreenMap(true); }}
                className="h-64 md:h-96 w-full overflow-hidden rounded-2xl md:rounded-3xl border border-neutral-100 shadow-sm relative group cursor-pointer lg:cursor-default"
              >
                <MapContainer 
                  key={`${hotel.lat}-${hotel.lng}`}
                  center={[hotel.lat || 40.8518, hotel.lng || 14.2681]} 
                  zoom={15} 
                  scrollWheelZoom={false}
                  className="h-full w-full z-0"
                >
                  <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[hotel.lat || 40.8518, hotel.lng || 14.2681]}>
                    <Popup>{hotel.name}</Popup>
                  </Marker>
                </MapContainer>
                <div className="lg:hidden absolute inset-0 bg-transparent z-10" /> {/* Click overlay for mobile */}
              </div>
              <div className="mt-4 md:mt-6 flex items-center gap-4 rounded-xl md:rounded-2xl bg-neutral-50 p-4 md:p-6">
                <MapIcon className="h-5 w-5 md:h-6 md:w-6 text-[#fbbf24]" />
                <p className="text-xs md:text-sm text-neutral-600">
                  Located in the heart of {hotel.area || 'Naples'}, just steps away from major landmarks and local favorites.
                </p>
              </div>
            </div>

            {/* Full Screen Map Modal */}
            <AnimatePresence>
              {showFullScreenMap && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[300] bg-white flex flex-col"
                >
                  <div className="p-4 flex items-center gap-4 border-b border-neutral-100 bg-white shadow-sm z-10">
                    <button 
                      onClick={() => setShowFullScreenMap(false)}
                      className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                    >
                      <ArrowLeft className="h-6 w-6 text-neutral-900" />
                    </button>
                    <div>
                      <h3 className="font-bold text-neutral-900">{hotel.name}</h3>
                      <p className="text-xs text-neutral-500">{hotel.city}</p>
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <MapContainer 
                      center={[hotel.lat || 40.8518, hotel.lng || 14.2681]} 
                      zoom={16} 
                      className="h-full w-full"
                    >
                      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[hotel.lat || 40.8518, hotel.lng || 14.2681]}>
                        <Popup>{hotel.name}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <div className="p-6 bg-white border-t border-neutral-100">
                     <p className="text-sm text-neutral-600 mb-4">{hotel.area || 'Naples centro'}</p>
                     <Button 
                       onClick={() => setShowFullScreenMap(false)}
                       className="w-full h-14 bg-[#0f172a] text-white font-black uppercase tracking-widest rounded-2xl"
                     >
                       Back to Details
                     </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Host Info */}
            <div id="host-section" className="mb-8 md:mb-12 border-t border-neutral-100 pt-8 md:pt-12">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="h-12 w-12 md:h-16 md:w-16 overflow-hidden rounded-full bg-neutral-100 border-2 border-[#fbbf24]/20 p-0.5">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${hotel.owner?.name || 'Host'}`} alt="Host" className="h-full w-full rounded-full bg-neutral-100" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-[#1e293b]">Host</h3>
                  <p className="text-sm font-bold text-[#fbbf24]">{hotel.owner?.name || 'Professional Host'}</p>
                  <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                    Joined in 2023 • <Star className="h-3 w-3 fill-current text-[#fbbf24]" /> 4.9 Rating • {hotel.businessName || 'Lhost Naples'}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                {hotel.phoneNumber ? (
                  <a 
                    href={`tel:${hotel.phoneNumber}`}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e293b] font-bold h-12 md:h-14 transition-all shadow-lg shadow-[#fbbf24]/20"
                  >
                    <Phone className="h-5 w-5" />
                    Contact Host
                  </a>
                ) : (
                  <Button variant="outline" className="flex-1 rounded-xl border-neutral-200 font-bold h-12 md:h-14 opacity-50 cursor-not-allowed">
                    Contact Host (No Phone Provided)
                  </Button>
                )}
                <Button variant="outline" className="flex-1 rounded-xl border-neutral-200 font-bold h-12 md:h-14">
                  Send Message
                </Button>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mb-8 md:mb-12 border-t border-neutral-100 pt-8 md:pt-12">
              <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#1e293b]">Guest Reviews</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex text-[#fbbf24]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${Math.round(hotel.rating || 4.9) >= s ? 'fill-current' : 'opacity-20'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-[#1e293b]">{hotel.rating || 4.9} • {reviews.length} reviews</span>
                  </div>
                </div>

                <div className="flex-1 max-w-sm w-full">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(r => Math.round(r.rating) === star).length;
                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-sm justify-end">
                        <span className="w-4 font-medium text-neutral-500">{star}</span>
                        <div className="h-2 w-full max-w-[120px] rounded-full bg-neutral-100 overflow-hidden">
                          <div className="h-full bg-[#fbbf24] rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-6">
                {reviews.length > 0 ? (
                  reviews.map((review, idx) => (
                    <ReviewCard key={review.id || idx} review={review} />
                  ))
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-neutral-100 py-12 text-center text-neutral-400">
                    <Sparkles className="mx-auto mb-3 h-8 w-8 opacity-20" />
                    <p className="text-sm font-medium">No reviews for this property yet. Be the first to share your experience!</p>
                  </div>
                )}
              </div>
            </div>

            {/* House Rules */}
            <div className="mb-8 md:mb-12 border-t border-neutral-100 pt-8 md:pt-12">
              <h2 className="mb-6 md:mb-8 font-display text-xl md:text-2xl font-bold text-[#1e293b]">House Rules</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-neutral-600 bg-neutral-50 p-4 rounded-xl">
                  <Clock className="h-5 w-5 text-[#fbbf24]" />
                  <span className="font-medium">Check-in: 15:00 - 22:00</span>
                </div>
                <div className="flex items-center gap-4 text-neutral-600 bg-neutral-50 p-4 rounded-xl">
                  <Clock className="h-5 w-5 text-[#fbbf24]" />
                  <span className="font-medium">Check-out: 10:00</span>
                </div>
                {hotel.houseRules && hotel.houseRules.map((rule: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 text-neutral-600 bg-neutral-50 p-4 rounded-xl">
                    <Info className="h-5 w-5 text-[#fbbf24]" />
                    <span className="font-medium">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="mb-8 md:mb-12 border-t border-neutral-100 pt-8 md:pt-12">
              <h2 className="mb-6 md:mb-8 font-display text-xl md:text-2xl font-bold text-[#1e293b]">Cancellation Policy</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 text-neutral-600 bg-neutral-50 p-4 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-[#fbbf24] mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[#1e293b]">{hotel.cancellationPolicy || 'Moderate'}</h4>
                    <p className="mt-1 text-sm text-neutral-500">Free cancellation for 48 hours. After that, cancel up to 5 days before check-in and get a full refund, minus the service fee.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Info */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 border-t border-neutral-100 pt-8 text-[10px] md:text-xs text-neutral-400">
              <Info className="h-3 w-3 md:h-4 md:w-4" />
              <span>CIR Code: {hotel.cirCode}</span>
            </div>
          </div>

          {/* Right Sidebar (30%) - Desktop Only */}
          <aside className="hidden lg:block w-full lg:w-[400px]">
            <div className="sticky top-28">
              <BookingWidget
                pricePerNight={hotel.rooms?.[selectedRoomIdx]?.price || hotel.price}
                dates={dateRange}
                onDateChange={(item: any) => setDateRange([item.selection])}
                guestCount={guestCount}
                onGuestChange={setGuestCount}
                onBook={handleBook}
                isBooking={bookingStatus === 'loading'}
                extraServices={selectedExtraServices.map(id => {
                  const svc = guestServiceCategories.flatMap(c => c.services).find(s => s.id === id);
                  return svc ? { label: svc.label, price: 50 /* approximate price */ } : null;
                }).filter((s): s is {label: string; price: number} => s !== null)}
              />

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-1 gap-4">
                <div className="rounded-2xl border border-neutral-100 p-4 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-[#fbbf24]" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Verified Host</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar Properties */}
        <div className="mt-16 md:mt-24 border-t border-neutral-100 pt-12 md:pt-16">
          <h2 className="mb-8 font-display text-2xl font-bold text-[#1e293b]">Similar properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarHotels.map((smHotel) => (
              <div 
                key={smHotel.id} 
                onClick={() => {
                  window.scrollTo(0,0);
                  navigate(`/hotel/${smHotel.id}`);
                }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3">
                  <img src={smHotel.imageUrl || `https://picsum.photos/seed/${smHotel.id}/400/300`} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute top-3 right-3 z-10">
                    <WishlistButton propertyId={smHotel.id} className="p-1.5 rounded-full bg-white/50 backdrop-blur-md" iconClassName="h-4 w-4" />
                  </div>
                </div>
                <h3 className="font-bold text-[#1e293b] line-clamp-1 group-hover:text-[#fbbf24] transition-colors">{smHotel.name}</h3>
                <p className="text-sm text-neutral-500">{smHotel.city}</p>
                <p className="mt-1 font-bold text-[#1e293b]">{formatPrice(smHotel.price)} <span className="text-xs font-normal text-neutral-500">/ night</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-neutral-100 bg-white p-4 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-[#1e293b]">
              {formatPrice((hotel.rooms?.[selectedRoomIdx]?.price || hotel.price) * nightsCount)}
            </p>
            <button 
              onClick={() => setShowDatePicker(true)}
              className="text-xs font-bold text-[#fbbf24] underline"
            >
              {format(dateRange[0].startDate, 'MMM dd')} - {format(dateRange[0].endDate, 'MMM dd')}
            </button>
          </div>
          <Button 
            className="flex-1 bg-[#fbbf24] h-12 text-sm font-bold text-[#1e293b] hover:bg-[#f59e0b]"
            onClick={handleBook}
            disabled={bookingStatus === 'loading'}
          >
            {bookingStatus === 'loading' ? '...' : 'Request to Book'}
          </Button>
        </div>
      </div>

      {/* Mobile Date Picker Overlay */}
      <AnimatePresence>
        {showDatePicker && (
          <div className="fixed inset-0 z-[150] flex items-end bg-[#1e293b]/60 backdrop-blur-sm md:hidden">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full rounded-t-[2rem] bg-white p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#1e293b]">Select Dates</h3>
                <button onClick={() => setShowDatePicker(false)} className="rounded-full bg-neutral-100 p-2">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex justify-center">
                <DateRange
                  editableDateInputs={true}
                  onChange={(item: any) => setDateRange([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={dateRange}
                  minDate={new Date()}
                  disabledDates={disabledDates}
                  rangeColors={['#fbbf24']}
                />
              </div>
              <Button className="mt-8 w-full h-14 bg-[#1e293b] text-white font-bold rounded-2xl" onClick={() => setShowDatePicker(false)}>
                Confirm Dates
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Request Form Modal */}
      <AnimatePresence>
        {showRequestForm && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-[#1e293b]/80 backdrop-blur-sm md:p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-[3rem] bg-white p-6 md:p-12 shadow-2xl overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b]">Booking Request</h2>
                <button onClick={() => setShowRequestForm(false)} className="rounded-full bg-neutral-100 p-2 hover:bg-neutral-200 transition-colors">
                  <X className="h-6 w-6 text-neutral-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                {/* Left: Form */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Full Name <span className="text-red-500">*</span></label>
                    <Input 
                      value={requestDetails.name} 
                      onChange={(e) => setRequestDetails({...requestDetails, name: e.target.value})}
                      placeholder="Your Name"
                      className="h-12 border-neutral-200 rounded-xl"
                    />
                    {requestValidationErrors.name && <p className="text-xs text-red-500">{requestValidationErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Email Address <span className="text-red-500">*</span></label>
                    <Input 
                      type="email"
                      value={requestDetails.email} 
                      onChange={(e) => setRequestDetails({...requestDetails, email: e.target.value})}
                      placeholder="email@example.com"
                      className="h-12 border-neutral-200 rounded-xl"
                    />
                    {requestValidationErrors.email && <p className="text-xs text-red-500">{requestValidationErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Phone Number <span className="text-red-500">*</span></label>
                    <Input 
                      value={requestDetails.phone} 
                      onChange={(e) => setRequestDetails({...requestDetails, phone: e.target.value})}
                      placeholder="+39 ..."
                      className="h-12 border-neutral-200 rounded-xl"
                    />
                    {requestValidationErrors.phone && <p className="text-xs text-red-500">{requestValidationErrors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Special Requests</label>
                    <textarea 
                      value={requestDetails.notes}
                      onChange={(e) => setRequestDetails({...requestDetails, notes: e.target.value})}
                      placeholder="Any notes for the host?"
                      className="w-full h-32 rounded-xl border border-neutral-200 p-4 text-sm outline-none focus:border-[#fbbf24] transition-all"
                    />
                  </div>
                </div>

                {/* Right: Summary */}
                <div className="space-y-8">
                  <div className="rounded-2xl bg-neutral-50 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-[#1e293b]">Booking Summary</h3>
                    <div className="flex gap-4">
                      <img src={galleryImages[0]} className="h-16 w-16 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-sm text-[#1e293b]">{hotel.name}</p>
                        <p className="text-xs text-neutral-500">{hotel.city}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-neutral-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Dates</span>
                        <span className="font-bold text-[#1e293b]">{format(dateRange[0].startDate, 'MMM dd')} - {format(dateRange[0].endDate, 'MMM dd')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Duration</span>
                        <span className="font-bold text-[#1e293b]">{nightsCount} Nights</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Guests</span>
                        <span className="font-bold text-[#1e293b]">{guestCount} Guests</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-neutral-200">
                        <span className="font-bold text-[#1e293b]">Total Estimated</span>
                        <span className="font-bold text-xl text-[#fbbf24]">
                          {formatPrice((hotel.rooms?.[selectedRoomIdx]?.price || hotel.price) * nightsCount + (selectedExtraServices.length * 50))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSendRequest}
                    disabled={bookingStatus === 'loading'}
                    className="w-full h-16 bg-[#fbbf24] text-[#1e293b] font-black uppercase tracking-widest rounded-2xl hover:bg-[#1e293b] hover:text-white transition-all shadow-xl"
                  >
                    {bookingStatus === 'loading' ? 'Sending Request...' : 'Confirm & Send Request'}
                  </Button>
                  <p className="text-[10px] text-center text-neutral-400 uppercase font-bold tracking-widest">No payment required now</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {bookingStatus === 'success' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1e293b]/90 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full h-full md:h-auto md:max-w-md md:rounded-[3rem] p-8 md:p-12 text-center flex flex-col items-center justify-center shadow-2xl"
            >
              <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-black text-[#1e293b] mb-4">Request Sent!</h2>
              <p className="text-neutral-500 text-sm font-medium mb-6">
                Your request for {hotel.name} has been received. 
                Reference: <span className="font-bold text-[#fbbf24]">{bookingRef}</span>
              </p>
              
              <div className="w-full space-y-4">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full h-14 bg-[#1e293b] text-white font-black uppercase tracking-widest rounded-2xl"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full h-14 border-neutral-200 text-neutral-600 font-bold rounded-2xl"
                >
                  Back to Home
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
