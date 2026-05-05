import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useSearchParams, useParams } from 'react-router-dom';
import { Card, Button } from '../components/UI';
import { Heart, Star, MapPin, X, ChevronDown, Map, List, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useHotels } from '../contexts/HotelsContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { WishlistButton } from '../components/WishlistButton';
import { SEOHead } from '../components/SEOHead';
import { generateSlug } from '../utils/seo';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import { BackButton } from '../components/BackButton';

import { PROPERTY_AREAS } from '../constants';

const createMarkerIcon = (price: string) => {
  return divIcon({
    html: `<div class="bg-white px-2 py-1 rounded-full border-2 border-[#fbbf24] shadow-md font-bold text-xs text-[#1e293b]">€${price}</div>`,
    className: 'bg-transparent border-none',
    iconSize: [40, 24],
    iconAnchor: [20, 12]
  });
};

export const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { area: areaParam } = useParams();
  const [searchParams] = useSearchParams();
  const areaQuery = areaParam || searchParams.get('area');
  
  const { hotels, selectedAreas, setSelectedAreas, priceRange, setPriceRange, setSearchDates, searchDates: contextSearchDates } = useHotels();
  const { formatPrice } = useCurrency();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Extract state from location or set defaults
  const state = React.useMemo(() => (location.state as any) || {}, [location.state]);
  const search = state.search || '';
  
  // Use useMemo for default dates to avoid new object references on every render
  const dates = React.useMemo(() => {
    if (state.dates && state.dates[0]) return state.dates;
    
    // If context has dates, use them
    if (contextSearchDates?.startDate && contextSearchDates?.endDate) {
      return [{ 
        startDate: contextSearchDates.startDate, 
        endDate: contextSearchDates.endDate,
        key: 'selection'
      }];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return [{ startDate: today, endDate: tomorrow, key: 'selection' }];
  }, [state.dates, contextSearchDates]);
  
  // Sync context dates with state dates
  useEffect(() => {
    if (dates && dates[0] && dates[0].startDate && dates[0].endDate) {
      const newStart = dates[0].startDate.getTime();
      const newEnd = dates[0].endDate.getTime();
      const currentStart = contextSearchDates?.startDate?.getTime();
      const currentEnd = contextSearchDates?.endDate?.getTime();

      // Only update if dates are valid and actually different to prevent infinite loops
      const isDifferent = newStart !== currentStart || newEnd !== currentEnd;

      if (isDifferent) {
        setSearchDates({
          startDate: dates[0].startDate,
          endDate: dates[0].endDate
        });
      }
    }
  }, [dates, contextSearchDates, setSearchDates]);

  const guestOptions = state.guestOptions || { adults: 2, children: 0 };
  const initialFilters = state.activeFilters || {
    propertyTypes: [],
    facilities: [],
    roomFacilities: [],
    policies: [],
    priceRanges: [],
    starRatings: []
  };

  const priceOptions = [
    { id: '80-120', label: '€80 - €120', min: 80, max: 120 },
    { id: '120-160', label: '€120 - €160', min: 120, max: 160 },
    { id: '160-200', label: '€160 - €200', min: 160, max: 200 },
    { id: '200+', label: '€200+', min: 200, max: 1000000 },
  ];

  const [sortBy, setSortBy] = useState('price-high');
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Scroll to top on mount or when URL changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  // Sync area from URL to context
  useEffect(() => {
    if (areaQuery) {
      const match = PROPERTY_AREAS.find(a => a.toLowerCase().includes(areaQuery.toLowerCase().split('(')[0].trim()));
      if (match && !selectedAreas.includes(match)) {
        setSelectedAreas([match]);
      } else if (!match && selectedAreas.length > 0) {
        setSelectedAreas([]);
      }
    } else if (selectedAreas.length > 0) {
      setSelectedAreas([]);
    }
  }, [areaQuery]); // Intentionally not including selectedAreas to prevent loops

  // Filter logic
  const searchResults = React.useMemo(() => {
    // hotels is already filtered by area, price, etc. in context
    if (!search) return hotels;
    
    return hotels.filter(h => {
      const searchLower = search.toLowerCase();
      const hType = h.category === 'holiday_house' ? 'holiday house' : 'bed breakfast';
      return h.name.toLowerCase().includes(searchLower) || 
             h.city.toLowerCase().includes(searchLower) ||
             h.country.toLowerCase().includes(searchLower) ||
             h.type?.toLowerCase().includes(searchLower) ||
             hType.includes(searchLower);
    });
  }, [hotels, search]);

  const getResultsHeading = () => {
    const areaText = selectedAreas.length > 0 
      ? selectedAreas.join(', ') 
      : areaQuery 
        ? areaQuery 
        : search;
    
    if (areaText) {
      return `Found ${searchResults.length} properties in ${areaText}`;
    }
    return `Featured Properties`;
  };

  const sortedResults = React.useMemo(() => {
    let results = [...searchResults];

    // Apply Sidebar Filters
    if (activeFilters.propertyTypes.length > 0) {
      results = results.filter(h => {
        const hType = h.category === 'holiday_house' ? 'Holiday House' : 'Bed & Breakfast';
        return activeFilters.propertyTypes.includes(hType);
      });
    }
    if (activeFilters.facilities.length > 0) {
      results = results.filter(h => activeFilters.facilities.every(f => h.amenities?.includes(f)));
    }
    if (activeFilters.roomFacilities.length > 0) {
      results = results.filter(h => activeFilters.roomFacilities.every(f => h.amenities?.includes(f)));
    }
    if (activeFilters.policies && activeFilters.policies.length > 0) {
      results = results.filter(h => activeFilters.policies.every(p => h.policies?.includes(p)));
    }
    if (activeFilters.starRatings && activeFilters.starRatings.length > 0) {
      results = results.filter(h => activeFilters.starRatings.includes(Math.round(h.rating || 5)));
    }

    if (sortBy === 'price-low') {
      return results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      return results.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      return results.sort((a, b) => b.rating - a.rating);
    }
    return results;
  }, [searchResults, sortBy, activeFilters]);

  const filterCounts = React.useMemo(() => {
    const counts: any = {
      propertyTypes: {},
      facilities: {},
      roomFacilities: {},
      policies: {}
    };

    searchResults.forEach(h => {
      if (h.category) {
        const hType = h.category === 'holiday_house' ? 'Holiday House' : 'Bed & Breakfast';
        counts.propertyTypes[hType] = (counts.propertyTypes[hType] || 0) + 1;
      }
      h.amenities?.forEach((a: string) => {
        if (['WiFi', 'Fitness Center', 'Parking', 'Room Service', 'Swimming Pool'].includes(a)) {
          counts.facilities[a] = (counts.facilities[a] || 0) + 1;
        }
        if (['Air Conditioning', 'Flat-screen TV', 'Shower', 'Streaming Services (Netflix)'].includes(a)) {
          counts.roomFacilities[a] = (counts.roomFacilities[a] || 0) + 1;
        }
      });
      h.policies?.forEach((p: string) => {
        counts.policies[p] = (counts.policies[p] || 0) + 1;
      });
    });

    return counts;
  }, [searchResults]);

  const typeLabel = activeFilters.propertyTypes.length === 1 ? activeFilters.propertyTypes[0] : 'Places to Stay';
  const areaLabel = selectedAreas.length === 1 ? selectedAreas[0] : (areaQuery || 'Naples');
  const typeSlug = generateSlug(typeLabel);
  const areaSlug = generateSlug(areaLabel);
  const canonical = `/naples/${typeSlug}/${areaSlug}`;

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 relative">
      <BackButton className="fixed top-20 left-4 md:absolute md:top-24 md:left-6" variant="dark" />
      <SEOHead 
        title={`${typeLabel} in ${areaLabel} Naples`}
        canonical={canonical}
      />
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {getResultsHeading()}
            </h2>
            <p className="text-neutral-500">
              {dates[0]?.startDate && dates[0]?.endDate ? `${format(dates[0].startDate, 'MMM dd')} — ${format(dates[0].endDate, 'MMM dd')} · ` : ''}
              {guestOptions.adults + guestOptions.children} guests
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-900"
            >
              <List className="w-4 h-4" />
              Filters
            </button>
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                <Map className="w-4 h-4" />
                Map
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-neutral-500 hidden sm:block">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-lg border border-neutral-200 bg-white px-4 py-2 pr-10 text-sm font-bold text-neutral-900 outline-none transition-all hover:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="rating">User Rating: High to Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filter Sidebar - Hidden on Mobile */}
          <aside className="hidden lg:block w-full shrink-0 lg:w-64">
            <div className="sticky top-24 space-y-8">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h3 className="text-lg font-bold text-neutral-900">Filters</h3>
                <button 
                  onClick={() => {
                    setActiveFilters({
                      propertyTypes: [],
                      facilities: [],
                      roomFacilities: [],
                      policies: [],
                      priceRanges: [],
                      starRatings: []
                    });
                    setSelectedAreas([]);
                    setPriceRange(null);
                  }}
                  className="text-xs font-bold text-amber-600 hover:underline"
                >
                  Clear all
                </button>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-3 border-b border-neutral-100 pb-6">
                <h4 className="text-sm font-bold text-neutral-900">Price Range (per night)</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400">Min Price</label>
                    <input 
                      type="number" 
                      min="0"
                      value={priceRange?.min || 0}
                      onChange={(e) => setPriceRange({ min: Number(e.target.value), max: priceRange?.max || 1000 })}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm font-bold mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400">Max Price</label>
                    <input 
                      type="number" 
                      min="0"
                      value={priceRange?.max || 1000}
                      onChange={(e) => setPriceRange({ min: priceRange?.min || 0, max: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm font-bold mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-neutral-900">Star Rating</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => {
                    const isSelected = activeFilters.starRatings?.includes(star);
                    return (
                      <button
                        key={star}
                        onClick={() => {
                          setActiveFilters(prev => ({
                            ...prev,
                            starRatings: isSelected 
                              ? (prev.starRatings || []).filter(s => s !== star)
                              : [...(prev.starRatings || []), star]
                          }));
                        }}
                        className={`flex h-10 flex-1 items-center justify-center rounded-lg border transition-all ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-500 text-white shadow-sm' 
                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-amber-500'
                        }`}
                      >
                        <span className="text-xs font-bold">{star}</span>
                        <Star className={`ml-1 h-3 w-3 ${isSelected ? 'fill-current' : ''}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Your budget per night */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-neutral-900">Your budget (per night)</h4>
                <div className="space-y-2">
                  {priceOptions.map(option => (
                    <label key={option.id} className="flex cursor-pointer items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          priceRange?.min === option.min && priceRange?.max === option.max ? 'border-amber-500 bg-amber-500' : 'border-neutral-300 group-hover:border-amber-500'
                        }`}>
                          {priceRange?.min === option.min && priceRange?.max === option.max && <X className="h-3 w-3 text-white" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={priceRange?.min === option.min && priceRange?.max === option.max}
                          onChange={() => {
                            if (priceRange?.min === option.min && priceRange?.max === option.max) {
                              setPriceRange(null);
                            } else {
                              setPriceRange({ min: option.min, max: option.max });
                            }
                          }}
                        />
                        <span className="text-sm text-neutral-700">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Areas */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-neutral-900">Area</h4>
                <div className="space-y-2">
                  {PROPERTY_AREAS.map(area => (
                    <label key={area} className="flex cursor-pointer items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          selectedAreas.includes(area) ? 'border-amber-500 bg-amber-500' : 'border-neutral-300 group-hover:border-amber-500'
                        }`}>
                          {selectedAreas.includes(area) && <X className="h-3 w-3 text-white" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={selectedAreas.includes(area)}
                          onChange={() => {
                            setSelectedAreas(
                              selectedAreas.includes(area)
                                ? selectedAreas.filter(a => a !== area)
                                : [...selectedAreas, area]
                            );
                          }}
                        />
                        <span className="text-sm text-neutral-700">{area}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-neutral-900">Property Type</h4>
                <div className="space-y-2">
                  {['Holiday House', 'Bed & Breakfast'].map(type => (
                    <label key={type} className="flex cursor-pointer items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          activeFilters.propertyTypes.includes(type) ? 'border-amber-500 bg-amber-500' : 'border-neutral-300 group-hover:border-amber-500'
                        }`}>
                          {activeFilters.propertyTypes.includes(type) && <X className="h-3 w-3 text-white" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={activeFilters.propertyTypes.includes(type)}
                          onChange={() => {
                            setActiveFilters(prev => ({
                              ...prev,
                              propertyTypes: prev.propertyTypes.includes(type) 
                                ? prev.propertyTypes.filter(t => t !== type)
                                : [...prev.propertyTypes, type]
                            }));
                          }}
                        />
                        <span className="text-sm text-neutral-700">{type}</span>
                      </div>
                      <span className="text-xs text-neutral-400">{filterCounts.propertyTypes[type] || 0}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-neutral-900">Facilities</h4>
                <div className="space-y-2">
                  {['WiFi', 'Fitness Center', 'Parking', 'Room Service', 'Swimming Pool'].map(item => (
                    <label key={item} className="flex cursor-pointer items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          activeFilters.facilities.includes(item) ? 'border-amber-500 bg-amber-500' : 'border-neutral-300 group-hover:border-amber-500'
                        }`}>
                          {activeFilters.facilities.includes(item) && <X className="h-3 w-3 text-white" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={activeFilters.facilities.includes(item)}
                          onChange={() => {
                            setActiveFilters(prev => ({
                              ...prev,
                              facilities: prev.facilities.includes(item) 
                                ? prev.facilities.filter(t => t !== item)
                                : [...prev.facilities, item]
                            }));
                          }}
                        />
                        <span className="text-sm text-neutral-700">{item}</span>
                      </div>
                      <span className="text-xs text-neutral-400">{filterCounts.facilities[item] || 0}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Room Facilities */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-neutral-900">Room Facilities</h4>
                <div className="space-y-2">
                  {['Air Conditioning', 'Flat-screen TV', 'Shower', 'Streaming Services (Netflix)'].map(item => (
                    <label key={item} className="flex cursor-pointer items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          activeFilters.roomFacilities.includes(item) ? 'border-amber-500 bg-amber-500' : 'border-neutral-300 group-hover:border-amber-500'
                        }`}>
                          {activeFilters.roomFacilities.includes(item) && <X className="h-3 w-3 text-white" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={activeFilters.roomFacilities.includes(item)}
                          onChange={() => {
                            setActiveFilters(prev => ({
                              ...prev,
                              roomFacilities: prev.roomFacilities.includes(item) 
                                ? prev.roomFacilities.filter(t => t !== item)
                                : [...prev.roomFacilities, item]
                            }));
                          }}
                        />
                        <span className="text-sm text-neutral-700">{item}</span>
                      </div>
                      <span className="text-xs text-neutral-400">{filterCounts.roomFacilities[item] || 0}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-[200] flex flex-col bg-white lg:hidden">
              <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                <h3 className="text-xl font-bold text-neutral-900">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="h-6 w-6 text-neutral-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Redefine filter sections for mobile - or reuse components if possible */}
                {/* Simplified for mobile drawer */}
                <div className="space-y-8 pb-32">
                   {/* Star Rating (Mobile) */}
                   <div className="space-y-4">
                    <h4 className="font-bold text-neutral-900">Star Rating</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map(star => {
                        const isSelected = activeFilters.starRatings?.includes(star);
                        return (
                          <button
                            key={star}
                            onClick={() => {
                              setActiveFilters(prev => ({
                                ...prev,
                                starRatings: isSelected 
                                  ? (prev.starRatings || []).filter(s => s !== star)
                                  : [...(prev.starRatings || []), star]
                              }));
                            }}
                            className={`flex h-12 items-center justify-center rounded-xl border transition-all ${
                              isSelected 
                                ? 'border-[#fbbf24] bg-[#fbbf24] text-neutral-900 shadow-sm' 
                                : 'border-neutral-200 bg-white text-neutral-600'
                            }`}
                          >
                            <span className="text-sm font-bold">{star}</span>
                            <Star className={`ml-1 h-4 w-4 ${isSelected ? 'fill-current' : ''}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Ranges (Mobile) */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-neutral-900">Price per night</h4>
                    <div className="grid gap-3">
                      {priceOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => {
                            if (priceRange?.min === option.min && priceRange?.max === option.max) {
                              setPriceRange(null);
                            } else {
                              setPriceRange({ min: option.min, max: option.max });
                            }
                          }}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            priceRange?.min === option.min && priceRange?.max === option.max
                              ? 'border-[#fbbf24] bg-[#fbbf24]/5'
                              : 'border-neutral-100'
                          }`}
                        >
                          <span className="font-bold text-neutral-900">{option.label}</span>
                          {priceRange?.min === option.min && priceRange?.max === option.max && <X className="h-5 w-5 text-[#fbbf24]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Areas (Mobile) */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-neutral-900">Area</h4>
                    <div className="grid gap-3">
                      {PROPERTY_AREAS.map(area => (
                        <button
                          key={area}
                          onClick={() => {
                            setSelectedAreas(
                              selectedAreas.includes(area)
                                ? selectedAreas.filter(a => a !== area)
                                : [...selectedAreas, area]
                            );
                          }}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            selectedAreas.includes(area)
                              ? 'border-[#fbbf24] bg-[#fbbf24]/5'
                              : 'border-neutral-100'
                          }`}
                        >
                          <span className="font-bold text-neutral-900 text-sm">{area}</span>
                          {selectedAreas.includes(area) && <X className="h-5 w-5 text-[#fbbf24]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Property Type (Mobile) */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-neutral-900">Property Type</h4>
                    <div className="grid gap-3">
                      {['Holiday House', 'Bed & Breakfast'].map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            setActiveFilters(prev => ({
                              ...prev,
                              propertyTypes: prev.propertyTypes.includes(type) 
                                ? prev.propertyTypes.filter(t => t !== type)
                                : [...prev.propertyTypes, type]
                            }));
                          }}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            activeFilters.propertyTypes.includes(type)
                              ? 'border-[#fbbf24] bg-[#fbbf24]/5'
                              : 'border-neutral-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                             <span className="font-bold text-neutral-900 text-sm">{type}</span>
                             <span className="text-xs text-neutral-400">({filterCounts.propertyTypes[type] || 0})</span>
                          </div>
                          {activeFilters.propertyTypes.includes(type) && <X className="h-5 w-5 text-[#fbbf24]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="fixed bottom-0 left-0 right-0 p-6 border-t border-neutral-100 bg-white">
                <Button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full h-14 bg-[#0f172a] text-white font-black uppercase tracking-widest rounded-2xl"
                >
                  Show {sortedResults.length} Results
                </Button>
              </div>
            </div>
          )}

          {/* Results Grid / Map */}
          <div className="flex-1">
            {viewMode === 'map' ? (
              <div className={`w-full rounded-2xl bg-neutral-100 overflow-hidden border border-neutral-200 relative z-0 ${
                window.innerWidth < 1024 
                  ? 'fixed inset-0 z-[250] !rounded-none !border-none' 
                  : 'h-[calc(100vh-200px)] sticky top-24'
              }`}>
                {window.innerWidth < 1024 && (
                  <div className="absolute top-4 left-4 z-[300] flex items-center gap-2">
                    <button 
                      onClick={() => setViewMode('list')}
                      className="p-3 rounded-full bg-white shadow-xl border border-neutral-100 text-neutral-900"
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div className="bg-white px-4 py-2 rounded-full shadow-xl border border-neutral-100 text-xs font-bold text-neutral-900">
                      {sortedResults.length} properties found
                    </div>
                  </div>
                )}
                <MapContainer 
                  center={[40.8518, 14.2681]} 
                  zoom={13} 
                  className="w-full h-full"
                >
                  <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {sortedResults.map(hotel => {
                    if (!hotel.lat || !hotel.lng) return null;
                    return (
                      <Marker 
                        key={hotel.id} 
                        position={[hotel.lat, hotel.lng]}
                        icon={createMarkerIcon(hotel.price.toString())}
                      >
                        <Popup className="rounded-xl overflow-hidden border-none shadow-2xl">
                          <div className="p-0 min-w-[200px]">
                            <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-24 object-cover mb-2" />
                            <div className="p-2">
                              <h3 className="font-bold text-sm text-[#1e293b] mb-1">{hotel.name}</h3>
                              <p className="text-xs text-neutral-500 mb-2">{hotel.area}</p>
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-[#fbbf24]">€{hotel.price}</p>
                                <Link 
                                  to={`/hotel/${hotel.id}`}
                                  className="text-[10px] font-black uppercase tracking-widest text-[#1e293b] underline"
                                >
                                  View
                                </Link>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {sortedResults.length > 0 ? (
                  sortedResults.map((hotel) => (
                  <motion.div
                    key={hotel.id}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Link to={`/hotel/${hotel.id}`}>
                      <Card className="h-full overflow-hidden border-neutral-100 p-0 shadow-sm transition-shadow hover:shadow-md">
                        <div className="relative aspect-[4/3]">
                          <img
                            src={hotel.imageUrl}
                            alt={hotel.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <div className="absolute right-3 top-3 z-10">
                            <WishlistButton propertyId={hotel.id} className="p-2 sm:px-2 sm:py-2 rounded-full backdrop-blur-md shadow-sm transition-all hover:bg-neutral-50 flex items-center gap-2" iconClassName="h-4 w-4" />
                          </div>
                          <div className="absolute left-3 top-3 flex flex-col gap-1">
                            {hotel.badges?.map((badge: string, i: number) => (
                              <span key={i} className={`w-fit rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${
                                badge === 'Genius' ? 'bg-blue-600' : 
                                badge === 'Getaway Deal' ? 'bg-green-600' :
                                'bg-amber-600'
                              }`}>
                                {badge}
                              </span>
                            ))}
                            {/* Limited-time Deal badge for discounts over 15% */}
                            {hotel.badges?.includes('Getaway Deal') && (
                              <span className="w-fit rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                Limited-time Deal
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="mb-1 flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`h-3 w-3 ${s <= (hotel.rating > 9.5 ? 5 : 4) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}`} />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-neutral-500">{hotel.type}</span>
                          </div>
                          <h3 className="mb-1 text-lg font-bold text-neutral-900">{hotel.name}</h3>
                          <p className="mb-1 text-sm text-neutral-500">{hotel.city}, {hotel.country}</p>
                          <div className="mb-3 flex items-center gap-1 text-xs text-neutral-400">
                            <MapPin className="h-3 w-3" />
                            <span>{hotel.distance}</span>
                          </div>
                          
                          <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#003580] text-sm font-bold text-white">
                              {hotel.rating}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-neutral-900 leading-none">
                                {hotel.rating >= 9.5 ? 'Exceptional' : hotel.rating >= 9.0 ? 'Wonderful' : 'Very Good'}
                              </p>
                              <p className="text-xs text-neutral-400">{hotel.reviews} reviews</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <p className="text-xs text-neutral-500">Price per night</p>
                            <div className="flex items-center gap-2">
                              {hotel.badges?.includes('Getaway Deal') && (
                                <span className="text-sm text-red-500 line-through">
                                  {formatPrice(hotel.price * 1.25)}
                                </span>
                              )}
                              <span className="text-xl font-bold text-neutral-900">
                                {formatPrice(hotel.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-neutral-500">No properties found matching your search. Try a different destination.</p>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
