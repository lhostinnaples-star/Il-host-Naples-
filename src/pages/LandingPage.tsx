import React, { useState, useEffect } from 'react';
import { Card, Button } from '../components/UI';
import { 
  Bed, Calendar, User, MapPin, Star, Heart, Plus, Minus, 
  ChevronDown, Home, Euro, Car, Bike, Ship, Plane, 
  ChefHat, Quote, Facebook, Instagram, Twitter, Linkedin, 
  ArrowRight, ShieldCheck, Briefcase, Clock, CheckCircle2,
  Map, UserCheck, ArrowUpCircle
} from 'lucide-react';
import { DateRange, RangeKeyDict } from 'react-date-range';
import { format, addDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../constants';

import { useHotels } from '../contexts/HotelsContext';
import { AreaSelection } from '../components/AreaSelection';
import { WishlistButton } from '../components/WishlistButton';
import { SEOHead } from '../components/SEOHead';
import { generateOrganizationSchema, generateSlug } from '../utils/seo';

const JustBookedTicker: React.FC = () => {
  const properties = ["Villa Napoli", "Vesuvius View Suite", "Centro Storico Loft", "Sorrento Coast Flat", "Pompei Residenza"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % properties.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#1e293b] text-white py-2 z-50 border-t border-[#fbbf24]/20 flex justify-center items-center overflow-hidden">
      <div className="flex items-center gap-2 px-4">
        <CheckCircle2 className="h-4 w-4 text-[#fbbf24]" />
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Just booked:</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm font-bold text-white"
          >
            {properties[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

const RecentlyViewedProperties: React.FC = () => {
  const [recent, setRecent] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecent(stored);
    } catch {}
  }, []);

  if (recent.length === 0) return null;

  return (
    <section className="py-16 px-6 bg-neutral-50 overflow-hidden border-t border-neutral-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-extrabold text-[#0f172a] mb-8">Recently Viewed</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {recent.map((hotel: any) => (
            <div 
              key={hotel.id} 
              className="w-72 shrink-0 cursor-pointer group bg-white p-2 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-all"
              onClick={() => {
                const typeSlug = generateSlug(hotel.type || 'holiday-house');
                const areaSlug = generateSlug(hotel.area || 'naples');
                const slug = generateSlug(hotel.name);
                navigate(`/naples/${typeSlug}/${areaSlug}/${slug}-${hotel.id}`);
              }}
            >
              <div className="w-full h-40 rounded-xl overflow-hidden mb-3 relative">
                <img 
                  src={hotel.imageUrl || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} 
                  alt={hotel.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="px-2 pb-2">
                <h3 className="font-bold text-[#1e293b] truncate text-sm mb-1">{hotel.name}</h3>
                <p className="text-xs font-bold text-[#fbbf24] truncate">
                  €{hotel.price || hotel.rooms?.[0]?.price} /night
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CounterRow: React.FC<{
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
  min: number;
}> = ({ label, value, onDec, onInc, min }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-neutral-900">{label}</span>
    <div className="flex items-center gap-4">
      <button 
        onClick={onDec}
        disabled={value <= min}
        className={`flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-4 text-center text-sm font-bold text-neutral-900">{value}</span>
      <button 
        onClick={onInc}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const ChildAgeDropdown: React.FC<{
  value: number | null;
  onChange: (age: number) => void;
  index: number;
}> = ({ value, onChange, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
        Child {index + 1} age
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm font-medium outline-none transition-all ${
          value === null 
            ? 'border-red-500 ring-1 ring-red-500/20' 
            : 'border-neutral-200 hover:border-amber-500'
        }`}
      >
        <span className={value === null ? 'text-neutral-400' : 'text-neutral-900'}>
          {value === null ? 'Age needed' : `${value} years old`}
        </span>
        <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="custom-scrollbar absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5"
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(i);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-neutral-50 ${
                  value === i ? 'bg-amber-50 font-bold text-amber-600' : 'text-neutral-700'
                }`}
              >
                {i} years old
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const { 
    hotels, 
    selectedAreas, 
    setSelectedAreas, 
    globalCategory, 
    setGlobalCategory,
    priceRange,
    setPriceRange,
    setSearchDates
  } = useHotels();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [showOccupancyModal, setShowOccupancyModal] = useState(false);
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'holiday_house' | 'bnb'>('all');
  const { services: allServices } = useHotels();
  const [guestOptions, setGuestOptions] = useState({
    adults: 2,
    children: 0,
    rooms: 1,
    pets: false,
    childAges: [] as (number | null)[]
  });
  const [dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 2),
      key: 'selection'
    }
  ]);

  const areaOptions = ['Center', 'Islands', 'Seafront', 'Station', 'Vomero'];

  const priceOptions = [
    { label: 'All prices', min: 0, max: 1000000 },
    { label: '€80 - €120', min: 80, max: 120 },
    { label: '€120 - €160', min: 120, max: 160 },
    { label: '€160 - €200', min: 160, max: 200 },
    { label: '€200+', min: 200, max: 1000000 },
  ];

  const handleDateChange = (item: RangeKeyDict) => {
    setDates([item.selection as any]);
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.date-picker-container')) {
        setIsDatePickerOpen(false);
      }
      if (!target.closest('.area-dropdown-container')) {
        setIsAreaDropdownOpen(false);
      }
      if (!target.closest('.type-dropdown-container')) {
        setIsTypeDropdownOpen(false);
      }
      if (!target.closest('.price-dropdown-container')) {
        setIsPriceDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.occupancy-modal-container')) {
        setShowOccupancyModal(false);
      }
    };

    if (showOccupancyModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOccupancyModal]);

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(a => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const getAreaDisplayText = () => {
    if (selectedAreas.length === 0) return 'All areas';
    if (selectedAreas.length === 1) return selectedAreas[0];
    if (selectedAreas.length <= 2) return selectedAreas.join(', ');
    return `${selectedAreas.length} Areas selected`;
  };

  const getTypeDisplayText = () => {
    if (globalCategory === 'holiday_house') return 'Holiday House';
    if (globalCategory === 'bnb') return 'Bed & Breakfast';
    return 'All types';
  };

  const getPriceDisplayText = () => {
    if (!priceRange) return 'All prices';
    const option = priceOptions.find(o => o.min === priceRange.min && o.max === priceRange.max);
    return option ? option.label : 'All prices';
  };

  const handleGuestOptionChange = (name: string, operation: 'inc' | 'dec') => {
    setGuestOptions(prev => {
      const val = prev[name as keyof typeof prev] as any;
      const newVal = operation === 'inc' ? val + 1 : val - 1;
      
      // Constraints
      if (name === 'adults' && newVal < 1) return prev;
      if (name === 'children' && newVal < 0) return prev;
      if (name === 'rooms' && newVal < 1) return prev;
      
      const updatedOptions = { ...prev, [name]: newVal };

      if (name === 'children') {
        if (operation === 'inc') {
          updatedOptions.childAges = [...prev.childAges, null];
        } else {
          updatedOptions.childAges = prev.childAges.slice(0, -1);
        }
      }

      return updatedOptions;
    });
  };

  const handleChildAgeChange = (index: number, age: number) => {
    setGuestOptions(prev => {
      const newAges = [...prev.childAges];
      newAges[index] = age;
      return { ...prev, childAges: newAges };
    });
  };

  const handleSearch = () => {
    const hasMissingAges = guestOptions.childAges.some(age => age === null);
    if (hasMissingAges) {
      setShowOccupancyModal(true);
      return;
    }

    setShowSuggestions(false);
    
    setSearchDates({
      startDate: dates[0].startDate,
      endDate: dates[0].endDate
    });
    
    navigate('/search', {
      state: {
        search,
        dates,
        guestOptions
      }
    });
  };

  const filteredHotels = hotels.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) || 
                         h.city.toLowerCase().includes(search.toLowerCase()) ||
                         h.country.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen pt-32 bg-white">
      <SEOHead 
        schema={generateOrganizationSchema()}
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] px-6 py-24 text-white md:py-32">
        {/* Subtle SVG Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight md:text-7xl">
              Find your next stay
            </h1>
            <p className="text-xl font-light text-neutral-300">
              Search deals on hotels, homes, and much more in Naples...
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative z-30 -mb-48 lg:-mb-32"
          >
            <div className="flex flex-col lg:flex-row bg-white rounded-xl shadow-2xl border border-neutral-100">
              {/* Block 1: Search by Dates */}
              <div 
                className="date-picker-container flex flex-col items-center justify-center p-6 w-full lg:w-48 border-b lg:border-b-0 lg:border-r border-neutral-200 hover:bg-neutral-50 cursor-pointer group transition-colors rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              >
                <Calendar className="h-8 w-8 text-[#1e293b] mb-3 group-hover:text-[#fbbf24] transition-colors" />
                <span className="text-sm font-bold text-[#1e293b] text-center">SEARCH BY DATES</span>
              </div>

              {/* Block 2: Discover the Areas */}
              <div 
                className="flex flex-col items-center justify-center p-6 w-full lg:w-48 border-b lg:border-b-0 lg:border-r border-neutral-200 hover:bg-neutral-50 cursor-pointer group transition-colors"
                onClick={() => {
                  const element = document.getElementById('area-selection-section');
                  if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 80; // 80px offset for fixed navbar
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
              >
                <MapPin className="h-8 w-8 text-[#1e293b] mb-3 group-hover:text-[#fbbf24] transition-colors" />
                <span className="text-sm font-bold text-[#1e293b] text-center">DISCOVER THE AREAS</span>
              </div>

              {/* Block 3: Main Filters */}
              <div className="flex-1 p-6 bg-neutral-50/50 rounded-b-xl lg:rounded-r-xl lg:rounded-bl-none">
                <div className="flex flex-col gap-4">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* All areas */}
                    <div className="area-dropdown-container relative">
                      <div 
                        className={`flex items-center gap-3 bg-white border rounded-md px-4 py-3 transition-colors cursor-pointer group ${isAreaDropdownOpen ? 'border-[#fbbf24]' : 'border-neutral-200 hover:border-[#fbbf24]'}`}
                        onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                      >
                        <MapPin className={`h-5 w-5 transition-colors shrink-0 ${isAreaDropdownOpen ? 'text-[#fbbf24]' : 'text-slate-500 group-hover:text-[#fbbf24]'}`} />
                        <span className={`text-sm font-medium truncate ${selectedAreas.length > 0 ? 'text-neutral-900' : 'text-neutral-500'}`}>
                          {getAreaDisplayText()}
                        </span>
                      </div>

                      <AnimatePresence>
                        {isAreaDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 top-full z-[100] mt-2 w-64 rounded-xl bg-white p-4 shadow-2xl ring-1 ring-black/5 border border-neutral-100"
                          >
                            <div className="space-y-3">
                              {areaOptions.map((area) => (
                                <label 
                                  key={area} 
                                  className="flex items-center gap-3 cursor-pointer group"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="relative flex items-center">
                                    <input 
                                      type="checkbox"
                                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-neutral-300 transition-all checked:bg-[#fbbf24] checked:border-[#fbbf24]"
                                      checked={selectedAreas.includes(area)}
                                      onChange={() => toggleArea(area)}
                                    />
                                    <svg
                                      className="absolute h-3.5 w-3.5 text-[#1e293b] opacity-0 peer-checked:opacity-100 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  </div>
                                  <span className={`text-sm font-medium transition-colors ${selectedAreas.includes(area) ? 'text-[#1e293b]' : 'text-slate-600 group-hover:text-[#1e293b]'}`}>
                                    {area}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* All types */}
                    <div className="type-dropdown-container relative">
                      <div 
                        className={`flex items-center gap-3 bg-white border rounded-md px-4 py-3 transition-colors cursor-pointer group ${isTypeDropdownOpen ? 'border-[#fbbf24]' : 'border-neutral-200 hover:border-[#fbbf24]'}`}
                        onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      >
                        <Home className={`h-5 w-5 transition-colors shrink-0 ${isTypeDropdownOpen || globalCategory ? 'text-[#fbbf24]' : 'text-slate-500 group-hover:text-[#fbbf24]'}`} />
                        <span className={`text-sm font-medium truncate ${globalCategory ? 'text-neutral-900' : 'text-neutral-500'}`}>
                          {getTypeDisplayText()}
                        </span>
                      </div>

                      <AnimatePresence>
                        {isTypeDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 top-full z-[100] mt-2 w-64 rounded-xl bg-white p-4 shadow-2xl ring-1 ring-black/5 border border-neutral-100"
                          >
                            <div className="space-y-1">
                              <button
                                onClick={() => {
                                  setGlobalCategory(null);
                                  setIsTypeDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!globalCategory ? 'bg-amber-50 text-[#1e293b]' : 'text-slate-600 hover:bg-neutral-50'}`}
                              >
                                All types
                              </button>
                              <button
                                onClick={() => {
                                  setGlobalCategory('holiday_house');
                                  setIsTypeDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${globalCategory === 'holiday_house' ? 'bg-amber-50 text-[#1e293b]' : 'text-slate-600 hover:bg-neutral-50'}`}
                              >
                                Holiday House
                              </button>
                              <button
                                onClick={() => {
                                  setGlobalCategory('bnb');
                                  setIsTypeDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${globalCategory === 'bnb' ? 'bg-amber-50 text-[#1e293b]' : 'text-slate-600 hover:bg-neutral-50'}`}
                                >
                                Bed & Breakfast
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* Guests */}
                    <div 
                      className="occupancy-modal-container flex items-center gap-3 bg-white border border-neutral-200 rounded-md px-4 py-3 hover:border-[#fbbf24] transition-colors cursor-pointer group"
                      onClick={() => setShowOccupancyModal(!showOccupancyModal)}
                    >
                      <User className="h-5 w-5 text-slate-500 group-hover:text-[#fbbf24] transition-colors shrink-0" />
                      <span className="text-sm font-medium text-neutral-500">
                        {guestOptions.adults + guestOptions.children} Guests
                      </span>
                    </div>
                    {/* Price Range / Budget */}
                    <div className="price-dropdown-container relative">
                      <div 
                        className={`flex items-center gap-3 bg-white border rounded-md px-4 py-3 transition-colors cursor-pointer group ${isPriceDropdownOpen ? 'border-[#fbbf24]' : 'border-neutral-200 hover:border-[#fbbf24]'}`}
                        onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                      >
                        <Euro className={`h-5 w-5 transition-colors shrink-0 ${isPriceDropdownOpen || (priceRange && priceRange.min > 0) ? 'text-[#fbbf24]' : 'text-slate-500 group-hover:text-[#fbbf24]'}`} />
                        <span className={`text-sm font-medium truncate ${(priceRange && priceRange.min > 0) ? 'text-neutral-900' : 'text-neutral-500'}`}>
                          {getPriceDisplayText()}
                        </span>
                      </div>

                      <AnimatePresence>
                        {isPriceDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 top-full z-[100] mt-2 w-64 rounded-xl bg-white p-4 shadow-2xl ring-1 ring-black/5 border border-neutral-100"
                          >
                            <div className="space-y-1">
                              {priceOptions.map((opt, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setPriceRange(opt.min === 0 && opt.max > 10000 ? null : { min: opt.min, max: opt.max });
                                    setIsPriceDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    (!priceRange && idx === 0) || (priceRange && priceRange.min === opt.min && priceRange.max === opt.max) 
                                      ? 'bg-amber-50 text-[#1e293b]' 
                                      : 'text-slate-600 hover:bg-neutral-50'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
                    {/* Everyone/Rating (kept as is for layout consistency) */}
                    <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-md px-4 py-3 hover:border-[#fbbf24] transition-colors cursor-pointer group">
                      <Star className="h-5 w-5 text-slate-500 group-hover:text-[#fbbf24] transition-colors shrink-0" />
                      <span className="text-sm font-medium text-neutral-500">Everyone</span>
                    </div>
                    {/* SEARCH Button */}
                    <Button
                      className="bg-[#1e293b] text-white font-bold text-lg hover:bg-[#fbbf24] hover:text-[#1e293b] transition-colors h-full py-3 rounded-md w-full"
                      onClick={handleSearch}
                    >
                      SEARCH
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modals (Date Picker & Occupancy) */}
            <AnimatePresence>
              {isDatePickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="date-picker-container absolute left-0 top-full z-[100] mt-4 rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5 lg:left-0"
                >
                  <DateRange
                    editableDateInputs={true}
                    onChange={handleDateChange}
                    moveRangeOnFirstSelection={false}
                    ranges={dates}
                    minDate={new Date()}
                    maxDate={new Date('2027-12-31')}
                    rangeColors={['#fbbf24']}
                    months={windowWidth < 1024 ? 1 : 2}
                    direction={windowWidth < 1024 ? 'vertical' : 'horizontal'}
                    showMonthAndYearPickers={false}
                    className="rounded-xl border-none"
                  />
                  <div className="mt-4 flex justify-end border-t border-neutral-100 pt-4">
                    <Button 
                      size="sm" 
                      className="bg-[#1e293b] text-white"
                      onClick={() => setIsDatePickerOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showOccupancyModal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="occupancy-modal-container absolute right-0 top-full z-[100] mt-4 w-80 rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
                >
                  <div className="space-y-6">
                    <CounterRow 
                      label="Adults" 
                      value={guestOptions.adults} 
                      onDec={() => handleGuestOptionChange('adults', 'dec')}
                      onInc={() => handleGuestOptionChange('adults', 'inc')}
                      min={1}
                    />
                    <CounterRow 
                      label="Children" 
                      value={guestOptions.children} 
                      onDec={() => handleGuestOptionChange('children', 'dec')}
                      onInc={() => handleGuestOptionChange('children', 'inc')}
                      min={0}
                    />
                    <CounterRow 
                      label="Rooms" 
                      value={guestOptions.rooms} 
                      onDec={() => handleGuestOptionChange('rooms', 'dec')}
                      onInc={() => handleGuestOptionChange('rooms', 'inc')}
                      min={1}
                    />

                    {guestOptions.children > 0 && (
                      <div className="space-y-4 border-t border-neutral-100 pt-6">
                        <div className="grid grid-cols-2 gap-3">
                          {guestOptions.childAges.map((age, index) => (
                            <ChildAgeDropdown 
                              key={index}
                              index={index}
                              value={age}
                              onChange={(age) => handleChildAgeChange(index, age)}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] leading-relaxed text-neutral-500">
                          To find you a place to stay that fits your entire group along with correct prices, we need to know how old your child will be at check-out
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
                      <span className="text-sm font-medium text-neutral-900">Traveling with pets?</span>
                      <button 
                        onClick={() => setGuestOptions(prev => ({ ...prev, pets: !prev.pets }))}
                        className={`relative h-6 w-11 rounded-full transition-colors ${guestOptions.pets ? 'bg-[#fbbf24]' : 'bg-neutral-200'}`}
                      >
                        <div className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${guestOptions.pets ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button 
                        size="sm" 
                        className="bg-[#1e293b] text-white"
                        onClick={() => {
                          const hasMissingAges = guestOptions.childAges.some(age => age === null);
                          if (!hasMissingAges) {
                            setShowOccupancyModal(false);
                          }
                        }}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <div id="area-selection-section" className="mt-24">
        <AreaSelection />
      </div>

      {/* Featured Properties Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        className="py-24 px-6 bg-neutral-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Featured Properties</h2>
              <p className="text-neutral-500 max-w-2xl">Hand-picked stays in the most beautiful corners of Naples, from cozy B&Bs to luxury holiday houses.</p>
            </div>
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-neutral-200 self-start">
              {(['all', 'holiday_house', 'bnb'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFeaturedFilter(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    featuredFilter === tab 
                      ? 'bg-[#1e293b] text-white shadow-md' 
                      : 'text-neutral-500 hover:text-[#1e293b]'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'holiday_house' ? 'Holiday House' : 'B&B'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels
              .filter(h => featuredFilter === 'all' || h.category === featuredFilter)
              .slice(0, 6)
              .map((hotel, idx) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
                onClick={() => {
                  const typeSlug = generateSlug(hotel.type || 'holiday-house');
                  const areaSlug = generateSlug(hotel.area || 'naples');
                  const slug = generateSlug(hotel.name);
                  navigate(`/naples/${typeSlug}/${areaSlug}/${slug}-${hotel.id}`);
                }}
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-lg">
                  <img 
                    src={hotel.imageUrl || `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80`} 
                    alt={hotel.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <WishlistButton propertyId={hotel.id} />
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-[#1e293b]/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
                      {hotel.category === 'bnb' ? 'Bed & Breakfast' : 'Holiday House'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-[#1e293b] group-hover:text-[#fbbf24] transition-colors truncate pr-4">{hotel.name}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold">{hotel.rating || 4.8}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="text-xs">{hotel.area || 'Napoli'}, Italy</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-[#1e293b]">€{hotel.price}</span>
                      <span className="text-xs text-neutral-500 font-medium">/night</span>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full text-xs font-bold px-4">Details</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button 
              className="bg-[#1e293b] text-white hover:bg-[#fbbf24] hover:text-[#1e293b] transition-all px-10 py-6 text-lg font-bold rounded-full group shadow-xl"
              onClick={() => navigate('/search')}
            >
              View All Properties
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Recently Viewed Section */}
      <RecentlyViewedProperties />

      {/* Experiences & Services Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        className="py-24 px-6 bg-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] mb-4">Elevate Your Stay</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto italic">More than just a room. Discover our premium services curated for the ultimate Naples experience.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {allServices.slice(0, 6).map((service, idx) => {
              // Find the icon based on subCategory from our constants
              const subCat = SERVICE_CATEGORIES
                .flatMap(c => c.subCategories)
                .find(sc => sc.id === service.subCategory);
              
              const IconComponent = subCat?.icon || Star;
              
              // Dynamic color based on category
              const colorMap: Record<string, string> = {
                'Transport': 'bg-blue-50 text-blue-600',
                'Tours': 'bg-amber-50 text-amber-600',
                'Lifestyle': 'bg-rose-50 text-rose-600',
              };
              const colorClass = colorMap[service.category] || 'bg-neutral-50 text-neutral-600';

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-white border border-neutral-100 rounded-3xl p-6 text-center shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border-b-4 hover:border-b-[#fbbf24] cursor-pointer"
                  onClick={() => navigate('/services')}
                >
                  <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${colorClass}`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-[#1e293b] mb-1 line-clamp-1">{service.name}</h3>
                  <p className="text-xs text-neutral-400 mb-4 font-medium italic">From €{service.price}/{service.priceUnit}</p>
                  <button className="text-[10px] font-extrabold uppercase tracking-widest text-[#fbbf24] group-hover:text-[#1e293b] transition-colors flex items-center justify-center w-full">
                    Book Now
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Booking Pool Teaser Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        className="py-24 px-6 bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-8 italic">Never Lose a Booking Again</h2>
            <div className="space-y-6">
              {[
                { title: 'The Shared Pool', desc: 'When your property is busy, refer your guests to the community pool and help them find an alternative.' },
                { title: 'Earn from Referrals', desc: 'Get rewarded for every booking that comes from your referral.' },
                { title: 'Zero Vacancy', desc: 'Fill your empty dates by accepting referrals from other trust listers.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fbbf24] text-[#0f172a]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-400 mb-1">{item.title}</h3>
                    <p className="text-neutral-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate('/auth?role=lister')}
                className="bg-[#fbbf24] text-[#0f172a] font-black px-8 py-6 rounded-2xl hover:scale-105 transition-transform"
              >
                List Your Property
              </Button>
              <Button 
                variant="outline"
                className="border-white/20 text-white font-bold px-8 py-6 rounded-2xl hover:bg-white/10"
              >
                How Shared Pool Works
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 relative group">
            <div className="absolute -inset-4 bg-amber-500/20 rounded-3xl blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-white/5 border border-white/10 p-2 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80" 
                alt="Booking Pool" 
                className="w-full h-full object-cover rounded-2xl opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <div className="h-12 w-12 rounded-full bg-[#fbbf24] flex items-center justify-center text-[#1e293b]">
                    <Clock className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-amber-400 tracking-widest">Active System</p>
                    <p className="font-bold">Real-time referrals active in your area</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        className="py-24 px-6 bg-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] mb-6">What Our Community Says</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto italic font-medium">Stories from the people who make Il Host in Naples possible.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "Il Host Naples completely changed how I manage my property. The shared pool is a lifesaver during high season!",
                name: "Marco Rossi",
                role: "Lister since 2023",
                avatar: "https://i.pravatar.cc/150?u=marco"
              },
              {
                text: "As a service provider, I've seen my airport transfer business grow by 40% in just six months. The platform is truly seamless.",
                name: "Elena Esposito",
                role: "Supplier (Transfers)",
                avatar: "https://i.pravatar.cc/150?u=elena"
              },
              {
                text: "The best way to experience Naples. I found a beautiful BnB and booked a private food tour in 5 minutes. Amazing!",
                name: "Thomas Muller",
                role: "Guest from Germany",
                avatar: "https://i.pravatar.cc/150?u=thomas"
              }
            ].map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-neutral-50 p-10 rounded-[40px] relative group"
              >
                <Quote className="h-12 w-12 text-[#fbbf24] absolute -top-4 -left-4 opacity-20 group-hover:scale-110 transition-transform" />
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-neutral-700 italic font-medium leading-relaxed mb-8">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} className="h-12 w-12 rounded-full ring-4 ring-white" alt={t.name} />
                  <div>
                    <h4 className="font-bold text-[#1e293b]">{t.name}</h4>
                    <p className="text-xs text-neutral-500 font-medium">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Naples City Guide Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        className="py-24 px-6 bg-neutral-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] italic">Naples City Guide</h2>
            <Button variant="ghost" className="text-amber-600 font-bold hover:bg-amber-50">Explore Blog <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Best Areas to Stay in Naples",
                desc: "From the luxury of Vomero to the historic heart of the Cento Storico, find the perfect base for your trip.",
                img: "https://images.unsplash.com/photo-1590059963351-4043b8bed72a?auto=format&fit=crop&w=800&q=80"
              },
              {
                title: "Top 10 Authentic Experiences",
                desc: "Discover underground ruins, secret catacombs, and the true soul of the city with our local guide.",
                img: "https://images.unsplash.com/photo-1595181781204-7c3fffbebd16?auto=format&fit=crop&w=800&q=80"
              },
              {
                title: "The Ultimate Pizza Guide",
                desc: "Where to find the best Margherita and traditional street food that locals actually eat.",
                img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
              }
            ].map((guide, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all"
              >
                <div className="h-64 overflow-hidden relative">
                  <img src={guide.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={guide.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest">Guide</span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-[#1e293b] mb-3 group-hover:text-amber-500 transition-colors">{guide.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-6">{guide.desc}</p>
                  <button className="flex items-center gap-2 font-black text-xs text-[#1e293b] uppercase tracking-widest hover:gap-4 transition-all">
                    Read More <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Partner/Join Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        className="py-24 px-6 bg-white border-t border-neutral-100"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "List Your Property",
                role: "lister",
                desc: "Manage your homes, rooms, and B&Bs with professional tools.",
                icon: Home,
                cta: "Register as Lister"
              },
              {
                title: "Offer Your Experience",
                role: "service_provider",
                desc: "Share your passion for Naples through tours and activities.",
                icon: Star,
                cta: "Become a Provider"
              },
              {
                title: "Join as Supplier",
                role: "supplier",
                desc: "Offer transfer, rental, and cleaning services to our network.",
                icon: Briefcase,
                cta: "Join Network"
              }
            ].map((p, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8 }}
                className="p-10 rounded-[3rem] bg-[#1e293b] text-white text-center border-b-[8px] border-amber-500 hover:bg-[#0f172a] transition-all"
              >
                <div className="mx-auto w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center mb-8">
                  <p.icon className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="text-2xl font-black mb-4 italic tracking-tight">{p.title}</h3>
                <p className="text-neutral-400 text-sm mb-10 leading-relaxed font-medium">{p.desc}</p>
                <Button 
                  onClick={() => navigate(`/auth?role=${p.role}`)}
                  className="w-full bg-white text-[#1e293b] hover:bg-amber-500 hover:text-white font-black py-4 rounded-2xl transition-all"
                >
                  {p.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer Section */}
      <footer className="bg-[#0f172a] text-white pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1 lg:col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center font-black text-[#0f172a] text-lg italic mt-[-4px]">H</div>
                <span className="text-2xl font-black italic text-white">Il Host <span className="text-amber-500">in</span> Naples</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-8 max-w-sm font-medium">
                The first comprehensive ecosystem for Neapolitan hospitality. We connect guests with the heart of Naples through a network of trusted hosts and premium local service providers.
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-[#0f172a] transition-all">
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-8 italic">Company</h4>
              <ul className="space-y-4 text-sm text-neutral-400 font-medium">
                <li><a href="#" className="hover:text-amber-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-8 italic">For Hosts</h4>
              <ul className="space-y-4 text-sm text-neutral-400 font-medium">
                <li><a href="#" className="hover:text-amber-500 transition-colors">List your Property</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Booking Pool</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Owner Tools</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Insurance</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Host Guidelines</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-8 italic">Support</h4>
              <ul className="space-y-4 text-sm text-neutral-400 font-medium">
                <li><a href="#" className="hover:text-amber-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Safety Center</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-neutral-500 font-bold tracking-widest uppercase mb-10 md:mb-0">
              © 2026 IL HOST IN NAPLES. MADE WITH PASSION IN ITALY.
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-10 md:mb-0">
              <a href="#" className="hover:text-white transition-colors">ITALIANO</a>
              <a href="#" className="hover:text-white transition-colors">ENGLISH</a>
              <a href="#" className="hover:text-white transition-colors">DEUTSCH</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Just Booked Ticker */}
      <JustBookedTicker />
    </div>
  );
};
