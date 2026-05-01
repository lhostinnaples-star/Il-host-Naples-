import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, Button, Input } from '../components/UI';
import { 
  Plus, Hotel, Bed, Calendar, Users, TrendingUp, X, 
  CheckCircle2, MapPin, Globe, Edit, Trash2, Search,
  Wifi, Wind, UtensilsCrossed, ArrowUpCircle, Waves,
  ShieldCheck, Info, Star, Coffee, Home,
  Car, Bike, Ship, Palmtree, UserCheck, Utensils, ChefHat, Sparkles,
  Briefcase, Share2, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format, isSameDay, parseISO } from 'date-fns';
import { Calendar as DatePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import { useHotels } from '../contexts/HotelsContext';

export const OwnerDashboard: React.FC = () => {
  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const { addHotel, hotels: allHotels } = useHotels();
  const [hotels, setHotels] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [formStep, setFormStep] = useState(1);
  const [isGmbLoading, setIsGmbLoading] = useState(false);
  
  const initialFormState = { 
    name: '', 
    businessName: '',
    description: '', 
    address: '', 
    city: 'Naples', 
    country: 'Italy',
    price: '',
    amenities: [] as string[],
    imageUrl: '',
    images: [] as string[],
    sqm: '',
    guests: '',
    bedrooms: '',
    bathrooms: '',
    singleBeds: '0',
    doubleBeds: '0',
    sofaBeds: '0',
    cancellationPolicy: 'Moderate',
    cirCode: '',
    spaceDescription: '',
    accessDescription: '',
    localTipsDescription: '',
    area: 'Center',
    category: 'holiday_house',
    gmbLink: '',
    unavailableDates: [] as string[],
    extraServices: [] as string[],
    rooms: [] as any[],
    phoneNumber: ''
  };

  const [newHotel, setNewHotel] = useState(initialFormState);

  const areaOptions = ['Center', 'Islands', 'Seafront', 'Station', 'Stadium', 'Vomero'];
  const amenityOptions = [
    'WiFi', 'Netflix', 'Air Conditioning', 'Parking', 'Kitchen', 
    'Elevator', 'Washing Machine', 'Pet Friendly', 'Smoking Allowed',
    'Heating', 'TV', 'Hair Dryer', 'Iron'
  ];

  const handleToggleAmenity = (amenity: string) => {
    setNewHotel(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

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
    setNewHotel(prev => ({
      ...prev,
      extraServices: prev.extraServices.includes(serviceId)
        ? prev.extraServices.filter(s => s !== serviceId)
        : [...prev.extraServices, serviceId]
    }));
  };

  const handleGmbFetch = async () => {
    if (!newHotel.gmbLink) {
      toast.error('Please enter a GMB link first');
      return;
    }
    
    setIsGmbLoading(true);
    // Mock GMB Fetch
    setTimeout(() => {
      setNewHotel(prev => ({
        ...prev,
        name: 'GMB Fetched: Luxury Neapolitan Stay',
        address: 'Via Toledo, 123',
        city: 'Naples',
        description: 'Automatically fetched from Google My Business. This property offers premium comfort.',
      }));
      setIsGmbLoading(false);
      toast.success('Property details fetched from Google!');
    }, 1500);
  };

  const fetchBookings = React.useCallback(() => {
    fetch('/api/bookings/owner', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      const demoAccepted = {
        id: 'demo-accepted-1',
        status: 'accepted',
        acceptedAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
        checkIn: '2024-05-20',
        checkOut: '2024-05-25',
        guests: 3,
        totalPrice: 850,
        Room: {
          type: 'Panoramic Suite',
          Hotel: { name: 'Naples View Residences' }
        },
        User: {
          name: 'Francesco Esposito',
          email: 'f.esposito@example.com'
        }
      };

      if (Array.isArray(data)) {
        setBookings([demoAccepted, ...data]);
      } else {
        setBookings([demoAccepted]);
      }
    })
    .catch(err => {
      console.error('Failed to fetch bookings:', err);
      // Even if fetch fails, show the demo
      setBookings([{
        id: 'demo-accepted-1',
        status: 'accepted',
        acceptedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        checkIn: '2024-05-20',
        checkOut: '2024-05-25',
        guests: 3,
        totalPrice: 850,
        Room: {
          type: 'Panoramic Suite',
          Hotel: { name: 'Naples View Residences' }
        },
        User: {
          name: 'Francesco Esposito',
          email: 'f.esposito@example.com'
        }
      }]);
    });
  }, [token]);

  const handleBookingAction = async (id: string, action: 'confirm' | 'reject' | 'share' | 'close' | 'release') => {
    try {
      let url = `/api/bookings/${id}/status`;
      let method = 'PUT';
      let body: any = {};

      if (action === 'confirm') body.status = 'confirmed';
      if (action === 'reject') body.status = 'rejected';
      if (action === 'share') url = `/api/bookings/${id}/share`;
      if (action === 'close') url = `/api/bookings/${id}/close`;
      if (action === 'release') url = `/api/bookings/${id}/release`;

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: action === 'confirm' || action === 'reject' ? JSON.stringify(body) : undefined
      });

      if (res.ok) {
        const updated = await res.json();
        if (action === 'release') {
          // Remove from local state immediately
          setBookings(bookings.filter(b => b.id !== id));
          toast.success('Referral released back to pool');
        } else {
          setBookings(bookings.map(b => b.id === id ? { ...b, ...updated } : b));
          toast.success(`Booking ${action === 'share' ? 'referred to pool' : action + 'ed'} successfully`);
        }
        fetchBookings();
      } else {
        const error = await res.json();
        toast.error(error.error || `Failed to ${action} booking`);
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  useEffect(() => {
    fetch('/api/hotels/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setHotels(data);
      } else {
        setHotels([]);
      }
    })
    .catch(err => {
      setHotels([]);
    });

    fetchBookings();
  }, [token, fetchBookings]);

  const handleBookingStatus = (id: string, status: string) => {
    handleBookingAction(id, status === 'confirmed' ? 'confirm' : 'reject');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 5MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setNewHotel(prev => ({
          ...prev,
          images: [...prev.images, url],
          imageUrl: prev.imageUrl || url
        }));
      };
      reader.readAsDataURL(file);
    });
    toast.success('Images processing...');
  };

  const handleAddHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newHotel.cirCode) {
      toast.error('CIR/CIN Code is mandatory for Italian listings');
      return;
    }

    if (newHotel.rooms.length === 0) {
      toast.error('Please add at least one room type');
      setFormStep(2);
      return;
    }

    const method = editingHotel ? 'PUT' : 'POST';
    const url = editingHotel ? `/api/hotels/${editingHotel.id}` : '/api/hotels';

    // Calculate min price from rooms
    const minPrice = Math.min(...newHotel.rooms.map(r => Number(r.price)));

    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...newHotel,
        price: minPrice,
        rooms: newHotel.rooms.map(r => ({
          ...r,
          price: Number(r.price),
          capacity: Number(r.capacity),
          singleBeds: Number(r.singleBeds),
          doubleBeds: Number(r.doubleBeds),
          sofaBeds: Number(r.sofaBeds)
        }))
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (editingHotel) {
        setHotels(hotels.map(h => h.id === data.id ? data : h));
        toast.success('Property updated successfully!');
      } else {
        setHotels([...hotels, data]);
        addHotel(data);
        toast.success('Property listed successfully!');
      }
      handleCloseModal();
    } else {
      toast.error('Failed to save listing');
    }
  };

  const handleEdit = (hotel: any) => {
    setEditingHotel(hotel);
    setNewHotel({
      ...hotel,
      price: hotel.price.toString(),
      sqm: (hotel.sqm || '').toString(),
      guests: (hotel.guests || '').toString(),
      bedrooms: (hotel.bedrooms || '').toString(),
      bathrooms: (hotel.bathrooms || '').toString(),
      singleBeds: (hotel.singleBeds || '0').toString(),
      doubleBeds: (hotel.doubleBeds || '0').toString(),
      sofaBeds: (hotel.sofaBeds || '0').toString(),
      amenities: hotel.amenities || [],
      unavailableDates: hotel.unavailableDates || [],
      extraServices: hotel.extraServices || [],
      rooms: hotel.rooms || [],
      phoneNumber: hotel.phoneNumber || ''
    });
    setShowAddHotel(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCloseModal = () => {
    setShowAddHotel(false);
    setEditingHotel(null);
    setFormStep(1);
    setNewHotel(initialFormState);
  };

  const toggleDateAvailability = (date: Date) => {
    const dateStr = date.toISOString();
    setNewHotel(prev => {
      const exists = prev.unavailableDates.some(d => isSameDay(parseISO(d), date));
      if (exists) {
        return {
          ...prev,
          unavailableDates: prev.unavailableDates.filter(d => !isSameDay(parseISO(d), date))
        };
      } else {
        return {
          ...prev,
          unavailableDates: [...prev.unavailableDates, dateStr]
        };
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1e293b]">Host Dashboard</h1>
            <p className="text-neutral-500 text-lg">Manage your BnBs and Holiday Houses in Naples</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/shared-pool" className="w-full sm:w-auto">
              <Button className="w-full bg-[#1e293b] text-white hover:bg-[#fbbf24] hover:text-[#1e293b] font-bold h-12 px-8 rounded-xl transition-all shadow-lg shadow-[#1e293b]/10">
                <Share2 className="mr-2 h-5 w-5 text-[#fbbf24]" /> Referral Booking Pool
              </Button>
            </Link>
            <Link to="/supplier-directory" className="w-full sm:w-auto">
              <Button className="w-full bg-[#1e293b] text-white hover:bg-[#fbbf24] hover:text-[#1e293b] font-bold h-12 px-8 rounded-xl transition-all shadow-lg shadow-[#1e293b]/10">
                <Briefcase className="mr-2 h-5 w-5 text-[#fbbf24]" /> Property Support & Services
              </Button>
            </Link>
            <Button onClick={() => setShowAddHotel(true)} className="w-full sm:w-auto bg-[#1e293b] text-white hover:bg-[#fbbf24] hover:text-[#1e293b] font-bold h-12 px-8 rounded-xl transition-all shadow-lg shadow-[#1e293b]/10">
              <Plus className="mr-2 h-5 w-5 text-[#fbbf24]" /> List Your Property
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 md:mb-12 grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-[#1e293b] text-white border-none shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm opacity-60 font-bold uppercase tracking-widest">Total Properties</p>
                <p className="text-3xl md:text-4xl font-bold mt-1">{hotels.length}</p>
              </div>
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Hotel className="h-6 w-6 md:h-8 md:w-8 text-[#fbbf24]" />
              </div>
            </div>
          </Card>
          <Card className="border-none shadow-xl bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm text-neutral-400 font-bold uppercase tracking-widest">Pending Inquiries</p>
                <p className="text-3xl md:text-4xl font-bold mt-1 text-[#1e293b]">{(Array.isArray(bookings) ? bookings : []).filter(b => b.status === 'pending').length}</p>
              </div>
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-neutral-50 flex items-center justify-center">
                <Calendar className="h-6 w-6 md:h-8 md:w-8 text-neutral-300" />
              </div>
            </div>
          </Card>
          <Card className="border-none shadow-xl bg-white p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-sm text-neutral-400 font-bold uppercase tracking-widest">Estimated Total Revenue</p>
                <p className="text-3xl md:text-4xl font-bold mt-1 text-[#1e293b]">{formatPrice((Array.isArray(bookings) ? bookings : []).filter(b => b.status === 'confirmed').reduce((acc, b) => acc + (b.totalPrice || 0), 0))}</p>
              </div>
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Booking Requests */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#1e293b]">Booking Inquiries</h2>
            <span className="rounded-full bg-[#fbbf24]/10 px-3 md:px-4 py-1 text-[10px] md:text-xs font-bold text-[#fbbf24] uppercase tracking-wider">Action Required</span>
          </div>
          <div className="grid gap-4">
            {(Array.isArray(bookings) ? bookings : []).filter(b => b.status === 'pending').map((booking) => (
              <Card key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 p-4 md:p-6 border-neutral-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-neutral-50 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-neutral-300" />
                  </div>
                  <div>
                    <p className="font-bold text-base md:text-lg text-[#1e293b]">{booking.Room?.Hotel?.name || 'Property'} - {booking.Room?.type || 'Stay'}</p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 text-xs md:text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                        {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 md:h-4 md:w-4" />
                        {booking.guests || 2} Guests
                      </div>
                      {booking.User && (
                        <div className="flex items-center gap-1 text-amber-600 font-bold uppercase tracking-widest text-[10px]">
                          <UserCheck className="h-3 w-3" />
                          {booking.User.name} ({booking.User.email})
                        </div>
                      )}
                    </div>
                    {booking.extraServices && booking.extraServices.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {booking.extraServices.map((sid: string) => {
                          const service = guestServiceCategories.flatMap(c => c.services).find(s => s.id === sid);
                          if (!service) return null;
                          const Icon = service.icon;
                          return (
                            <div key={sid} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-[#fbbf24]">
                              <Icon className="h-3 w-3" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">{service.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row md:flex-row items-center justify-between md:justify-end gap-4 md:gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right md:mr-6">
                    <p className="text-lg md:text-xl font-bold text-[#1e293b]">{formatPrice(booking.totalPrice)}</p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Total Payout</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-amber-200 text-amber-600 hover:bg-amber-50 h-10 px-4 rounded-lg text-xs flex items-center gap-2"
                      onClick={() => handleBookingAction(booking.id, 'share')}
                    >
                      <Share2 className="h-3.5 w-3.5" /> Refer Booking
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-10 px-4 md:px-6 rounded-lg text-xs md:text-sm" onClick={() => handleBookingStatus(booking.id, 'confirmed')}>Confirm</Button>
                    <Button size="sm" variant="outline" className="text-red-500 border-red-100 hover:bg-red-50 h-10 px-4 md:px-6 rounded-lg text-xs md:text-sm" onClick={() => handleBookingStatus(booking.id, 'rejected')}>Reject</Button>
                  </div>
                </div>
              </Card>
            ))}
            {(Array.isArray(bookings) ? bookings : []).filter(b => b.status === 'pending').length === 0 && (
              <div className="rounded-3xl border-2 border-dashed border-neutral-200 py-12 text-center text-neutral-400 bg-white">
                <Search className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p className="font-medium">No pending booking requests at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Accepted from Pool */}
        {(Array.isArray(bookings) ? bookings : []).some(b => b.status === 'accepted') && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#1e293b]">Accepted Referrals</h2>
              <span className="rounded-full bg-blue-100 px-4 py-1 text-xs font-bold text-blue-600 uppercase tracking-wider">6h Response Required</span>
            </div>
            <div className="grid gap-4">
              {bookings.filter(b => b.status === 'accepted').map((booking) => {
                const acceptedDate = new Date(booking.acceptedAt);
                const expiresAt = new Date(acceptedDate.getTime() + 6 * 60 * 60 * 1000);
                
                return (
                  <Card key={booking.id} className="p-6 border-blue-100 bg-blue-50/10 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-white border border-blue-100 flex items-center justify-center shrink-0">
                          <UserCheck className="h-8 w-8 text-blue-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-500 text-white text-[10px] font-bold">POOL TRANSFER</span>
                            <p className="font-bold text-lg text-[#1e293b]">{booking.Room?.Hotel?.name || 'Property'}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-3">
                            <div className="space-y-1">
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Customer Contact</p>
                              <p className="text-sm font-bold text-[#1e293b]">{booking.User?.name || 'Guest'}</p>
                              <p className="text-xs text-blue-600 font-medium underline">{booking.User?.email}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Stay Period</p>
                              <p className="text-sm font-bold text-neutral-600">
                                {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd')}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-500">
                            <Clock className="h-4 w-4 animate-pulse" />
                            Return to pool automatically in: {format(expiresAt, 'HH:mm')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6">
                        <div className="text-right">
                          <p className="text-xl font-bold text-[#1e293b]">{formatPrice(booking.totalPrice)}</p>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Est. Payout</p>
                        </div>
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 px-8 w-full"
                            onClick={() => handleBookingAction(booking.id, 'close')}
                          >
                            Mark as Closed (Deal Done)
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl h-11 px-8 w-full"
                            onClick={() => handleBookingAction(booking.id, 'release')}
                          >
                            Unable to Close (Return to Pool)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Hotel List */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1e293b]">My Properties</h2>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Info className="h-4 w-4" />
            <span>Click 'Edit' to manage availability and pricing</span>
          </div>
        </div>
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
          {(Array.isArray(hotels) ? hotels : []).map((hotel) => (
            <motion.div key={hotel.id} layout>
              <Card className="flex flex-col sm:flex-row gap-4 md:gap-6 p-4 md:p-6 border-neutral-100 hover:shadow-xl transition-all group">
                <div className="h-48 sm:h-40 w-full sm:w-40 shrink-0 overflow-hidden rounded-xl md:rounded-2xl bg-neutral-100 relative">
                  <img 
                    src={hotel.imageUrl || `https://picsum.photos/seed/${hotel.id}/300/300`} 
                    alt={hotel.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="rounded-full bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold text-[#1e293b] uppercase tracking-wider shadow-sm">
                      {hotel.category === 'bnb' ? 'BnB' : 'Holiday House'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-widest">{hotel.businessName || 'Private Host'}</p>
                        <h3 className="text-lg md:text-xl font-bold text-[#1e293b] line-clamp-1">{hotel.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-[#fbbf24]">
                        <Star className="h-3 w-3 fill-[#fbbf24]" />
                        {hotel.rating || 4.9}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs md:text-sm text-neutral-500 mb-4">
                      <MapPin className="h-3 w-3" />
                      {hotel.area}, {hotel.city}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest">
                      <span>{hotel.rooms?.length || 0} Room Types</span>
                      <span>From {formatPrice(hotel.price)}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-neutral-200 hover:border-[#fbbf24] hover:text-[#fbbf24] rounded-xl h-11 md:h-10 font-bold text-xs md:text-sm"
                      onClick={() => handleEdit(hotel)}
                    >
                      Manage Inventory
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-neutral-200 hover:border-red-500 hover:text-red-500 rounded-xl h-11 md:h-10 px-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          {hotels.length === 0 && (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-neutral-200 py-20 text-center text-neutral-400 bg-white">
              <Hotel className="mx-auto h-16 w-16 opacity-10 mb-6" />
              <h3 className="text-xl font-bold text-[#1e293b] mb-2">No properties listed yet</h3>
              <p className="mb-8">Start earning by listing your first BnB or Holiday House in Naples.</p>
              <Button 
                onClick={() => setShowAddHotel(true)} 
                className="bg-[#1e293b] text-white font-bold rounded-xl px-8 hover:bg-[#fbbf24] hover:text-[#1e293b] transition-colors"
              >
                List Your Property Now
              </Button>
            </div>
          )}
        </div>

        {/* Add/Edit Hotel Section (Inline) */}
        <AnimatePresence>
          {showAddHotel && (
            <div id="property-editor" className="mb-12">
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="relative p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white mb-8">
                  <button 
                    onClick={handleCloseModal}
                    className="absolute right-4 top-4 md:right-8 md:top-8 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex flex-col md:flex-row min-h-[600px]">
                    {/* Sidebar Steps */}
                    <div className="w-full md:w-64 bg-neutral-50 p-6 md:p-10 border-b md:border-b-0 md:border-r border-neutral-100 shrink-0">
                      <div className="flex md:flex-col gap-4 md:gap-10 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-hide">
                        {[1, 2, 3, 4, 5, 6].map(step => (
                          <div key={step} className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                            <div className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all ${
                              formStep === step ? 'bg-[#fbbf24] text-[#1e293b] shadow-lg shadow-[#fbbf24]/30 scale-110' : 
                              formStep > step ? 'bg-green-500 text-white' : 'bg-neutral-200 text-neutral-500'
                            }`}>
                              {formStep > step ? <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" /> : step}
                            </div>
                            <div className="hidden sm:block">
                              <p className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest ${formStep === step ? 'text-[#1e293b]' : 'text-neutral-400'}`}>
                                {step === 1 ? 'Category' : step === 2 ? 'Specs' : step === 3 ? 'Details' : step === 4 ? 'Services' : step === 5 ? 'Calendar' : 'Media'}
                              </p>
                              <p className="hidden md:block text-xs font-medium text-neutral-400">
                                {step === 1 ? 'Type & GMB' : step === 2 ? 'Rooms & Price' : step === 3 ? 'Amenities' : step === 4 ? 'Guest Perks' : step === 5 ? 'Availability' : 'Photos'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 p-6 md:p-10 bg-white">
                      <div className="mb-8 md:mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b]">{editingHotel ? `Editing ${newHotel.name || 'Property'}` : 'List Your Property'}</h2>
                        <p className="text-sm md:text-base text-neutral-500 mt-1">Step {formStep} of 6: {
                          formStep === 1 ? 'Category & Location' : 
                          formStep === 2 ? 'Property Specs' : 
                          formStep === 3 ? 'Amenities & Description' : 
                          formStep === 4 ? 'Guest Services' :
                          formStep === 5 ? 'Availability Management' : 'Media & Legal'
                        }</p>
                      </div>

                      <form onSubmit={handleAddHotel} className="space-y-6 md:space-y-8">
                        {formStep === 1 && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-8">
                            <div className="space-y-4">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Property Type</label>
                              <div className="flex flex-col sm:flex-row gap-4">
                                <button 
                                  type="button"
                                  onClick={() => setNewHotel({...newHotel, category: 'bnb'})}
                                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl md:rounded-2xl border-2 transition-all h-14 md:h-auto ${
                                    newHotel.category === 'bnb' ? 'border-[#fbbf24] bg-[#fbbf24]/5 text-[#1e293b]' : 'border-neutral-100 text-neutral-400 hover:border-neutral-200'
                                  }`}
                                >
                                  <div className={`h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl flex items-center justify-center ${newHotel.category === 'bnb' ? 'bg-[#fbbf24] text-[#1e293b]' : 'bg-neutral-100'}`}>
                                    <Coffee className="h-4 w-4 md:h-5 md:w-5" />
                                  </div>
                                  <span className="font-bold text-sm md:text-base">Bed & Breakfast</span>
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setNewHotel({...newHotel, category: 'holiday_house'})}
                                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl md:rounded-2xl border-2 transition-all h-14 md:h-auto ${
                                    newHotel.category === 'holiday_house' ? 'border-[#fbbf24] bg-[#fbbf24]/5 text-[#1e293b]' : 'border-neutral-100 text-neutral-400 hover:border-neutral-200'
                                  }`}
                                >
                                  <div className={`h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl flex items-center justify-center ${newHotel.category === 'holiday_house' ? 'bg-[#fbbf24] text-[#1e293b]' : 'bg-neutral-100'}`}>
                                    <Home className="h-4 w-4 md:h-5 md:w-5" />
                                  </div>
                                  <span className="font-bold text-sm md:text-base">Holiday House</span>
                                </button>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Google My Business Integration</label>
                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                                  <input 
                                    type="text" 
                                    placeholder="Paste GMB Link"
                                    className="w-full rounded-xl md:rounded-2xl border border-neutral-200 py-4 pl-12 pr-4 text-sm outline-none focus:border-[#fbbf24] transition-colors h-14"
                                    value={newHotel.gmbLink}
                                    onChange={e => setNewHotel({...newHotel, gmbLink: e.target.value})}
                                  />
                                </div>
                                <Button 
                                  type="button" 
                                  onClick={handleGmbFetch}
                                  disabled={isGmbLoading}
                                  className="bg-[#1e293b] text-white px-8 rounded-xl md:rounded-2xl h-14"
                                >
                                  {isGmbLoading ? '...' : 'Fetch Info'}
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Business/Host Name</label>
                                <Input 
                                  placeholder="e.g. Naples Luxury Rentals" 
                                  value={newHotel.businessName} 
                                  onChange={e => setNewHotel({...newHotel, businessName: e.target.value})} 
                                  required 
                                  className="h-14 rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Property Name</label>
                                <Input 
                                  placeholder="e.g. Sea View Apartment" 
                                  value={newHotel.name} 
                                  onChange={e => setNewHotel({...newHotel, name: e.target.value})} 
                                  required 
                                  className="h-14 rounded-xl"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Area</label>
                                <select 
                                  className="w-full rounded-xl md:rounded-2xl border border-neutral-200 p-4 text-sm font-bold outline-none focus:border-[#fbbf24] transition-colors bg-white appearance-none h-14"
                                  value={newHotel.area}
                                  onChange={e => setNewHotel({...newHotel, area: e.target.value})}
                                >
                                  {areaOptions.map(area => <option key={area} value={area}>{area}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">City</label>
                                <Input value={newHotel.city} readOnly className="bg-neutral-50 h-14 rounded-xl" />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {formStep === 2 && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Room Types & Inventory</label>
                              <Button 
                                type="button" 
                                size="sm" 
                                className="bg-[#fbbf24] text-[#1e293b] font-bold h-12 md:h-10"
                                onClick={() => {
                                  setNewHotel(prev => ({
                                    ...prev,
                                    rooms: [...prev.rooms, { 
                                      id: Math.random().toString(36).substr(2, 9),
                                      type: 'Standard Room', 
                                      description: '', 
                                      price: '100', 
                                      capacity: '2',
                                      singleBeds: '0',
                                      doubleBeds: '1',
                                      sofaBeds: '0'
                                    }]
                                  }));
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add Room Type
                              </Button>
                            </div>

                            <div className="space-y-4 md:space-y-6">
                              {newHotel.rooms.map((room, index) => (
                                <Card key={room.id} className="p-4 md:p-6 border-neutral-100 bg-neutral-50/50 relative group rounded-xl md:rounded-2xl">
                                  <button 
                                    type="button"
                                    className="absolute top-4 right-4 text-neutral-300 hover:text-red-500 transition-colors h-10 w-10 flex items-center justify-center"
                                    onClick={() => {
                                      setNewHotel(prev => ({
                                        ...prev,
                                        rooms: prev.rooms.filter((_, i) => i !== index)
                                      }));
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Room Title</label>
                                      <Input 
                                        placeholder="e.g. Deluxe Suite" 
                                        value={room.type} 
                                        className="h-12 md:h-10"
                                        onChange={e => {
                                          const updatedRooms = [...newHotel.rooms];
                                          updatedRooms[index].type = e.target.value;
                                          setNewHotel({...newHotel, rooms: updatedRooms});
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Base Price (€)</label>
                                      <Input 
                                        type="number" 
                                        value={room.price} 
                                        className="h-12 md:h-10"
                                        onChange={e => {
                                          const updatedRooms = [...newHotel.rooms];
                                          updatedRooms[index].price = e.target.value;
                                          setNewHotel({...newHotel, rooms: updatedRooms});
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2 mb-4 md:mb-6">
                                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Room Description</label>
                                    <textarea 
                                      className="w-full rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-[#fbbf24] bg-white min-h-[80px]"
                                      rows={2}
                                      value={room.description}
                                      onChange={e => {
                                        const updatedRooms = [...newHotel.rooms];
                                        updatedRooms[index].description = e.target.value;
                                        setNewHotel({...newHotel, rooms: updatedRooms});
                                      }}
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Guests</label>
                                      <Input 
                                        type="number" 
                                        value={room.capacity} 
                                        className="h-12 md:h-10"
                                        onChange={e => {
                                          const updatedRooms = [...newHotel.rooms];
                                          updatedRooms[index].capacity = e.target.value;
                                          setNewHotel({...newHotel, rooms: updatedRooms});
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Single</label>
                                      <Input 
                                        type="number" 
                                        value={room.singleBeds} 
                                        className="h-12 md:h-10"
                                        onChange={e => {
                                          const updatedRooms = [...newHotel.rooms];
                                          updatedRooms[index].singleBeds = e.target.value;
                                          setNewHotel({...newHotel, rooms: updatedRooms});
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Double</label>
                                      <Input 
                                        type="number" 
                                        value={room.doubleBeds} 
                                        className="h-12 md:h-10"
                                        onChange={e => {
                                          const updatedRooms = [...newHotel.rooms];
                                          updatedRooms[index].doubleBeds = e.target.value;
                                          setNewHotel({...newHotel, rooms: updatedRooms});
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Sofa</label>
                                      <Input 
                                        type="number" 
                                        value={room.sofaBeds} 
                                        className="h-12 md:h-10"
                                        onChange={e => {
                                          const updatedRooms = [...newHotel.rooms];
                                          updatedRooms[index].sofaBeds = e.target.value;
                                          setNewHotel({...newHotel, rooms: updatedRooms});
                                        }}
                                      />
                                    </div>
                                  </div>
                                </Card>
                              ))}
                              
                              {newHotel.rooms.length === 0 && (
                                <div className="text-center py-10 rounded-2xl md:rounded-3xl border-2 border-dashed border-neutral-200 text-neutral-400">
                                  <Bed className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                  <p className="text-sm">No room types added yet.</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {formStep === 3 && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-8">
                            <div className="space-y-4">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Amenities Checklist</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                {amenityOptions.map(amenity => (
                                  <label key={amenity} className="flex items-center gap-3 cursor-pointer group p-4 md:p-3 rounded-xl border border-neutral-100 hover:border-[#fbbf24] transition-all min-h-[56px]">
                                    <div 
                                      className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${
                                        newHotel.amenities.includes(amenity) ? 'bg-[#fbbf24] border-[#fbbf24] text-[#1e293b]' : 'border-neutral-200 group-hover:border-[#fbbf24]'
                                      }`}
                                      onClick={() => handleToggleAmenity(amenity)}
                                    >
                                      {newHotel.amenities.includes(amenity) && <CheckCircle2 className="h-4 w-4" />}
                                    </div>
                                    <span className="text-sm font-medium text-neutral-600">{amenity}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">The Space (Detailed Description)</label>
                              <textarea 
                                className="w-full rounded-2xl md:rounded-3xl border border-neutral-200 p-4 md:p-6 text-sm outline-none focus:border-[#fbbf24] transition-colors leading-relaxed min-h-[150px]"
                                placeholder="Describe the unique features of your property..."
                                rows={6}
                                value={newHotel.spaceDescription}
                                onChange={e => setNewHotel({...newHotel, spaceDescription: e.target.value})}
                              />
                            </div>
                          </motion.div>
                        )}

                        {formStep === 4 && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-8">
                            <div className="space-y-2">
                              <h3 className="text-xl md:text-2xl font-bold text-[#1e293b]">Guest Extra Services</h3>
                              <p className="text-sm text-neutral-500">Select the additional services you can provide or arrange for your guests.</p>
                            </div>

                            {guestServiceCategories.map(category => (
                              <div key={category.title} className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-[#fbbf24]">{category.title}</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                  {category.services.map(service => {
                                    const Icon = service.icon;
                                    const isSelected = newHotel.extraServices.includes(service.id);
                                    return (
                                      <button
                                        key={service.id}
                                        type="button"
                                        onClick={() => handleToggleExtraService(service.id)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group ${
                                          isSelected 
                                            ? 'border-[#fbbf24] bg-[#fbbf24]/5 text-[#1e293b]' 
                                            : 'border-neutral-100 text-neutral-500 hover:border-neutral-200'
                                        }`}
                                      >
                                        <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center transition-colors ${
                                          isSelected ? 'bg-[#fbbf24] text-[#1e293b]' : 'bg-neutral-100 group-hover:bg-neutral-200'
                                        }`}>
                                          <Icon className="h-5 w-5 md:h-6 md:w-6" />
                                        </div>
                                        <span className="font-bold text-sm md:text-base leading-tight">
                                          {service.label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}

                        {formStep === 5 && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-8">
                            <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
                              <div className="flex-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 block">Manage Availability</label>
                                <div className="rounded-2xl md:rounded-3xl border border-neutral-100 p-2 md:p-4 shadow-sm inline-block bg-white w-full sm:w-auto overflow-hidden">
                                  <DatePicker
                                    date={new Date()}
                                    onChange={toggleDateAvailability}
                                    minDate={new Date()}
                                    color="#fbbf24"
                                    className="rounded-xl w-full"
                                  />
                                </div>
                                <div className="mt-4 md:mt-6 flex items-center gap-3 text-sm text-neutral-500 bg-neutral-50 p-4 rounded-xl md:rounded-2xl">
                                  <Info className="h-5 w-5 text-[#fbbf24] shrink-0" />
                                  <p className="text-xs md:text-sm">Click on a date to mark it as <strong>Unavailable</strong>. These dates will be disabled for guests.</p>
                                </div>
                              </div>
                              <div className="w-full lg:w-64">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 block">Unavailable Dates</label>
                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                                  {newHotel.unavailableDates.length > 0 ? (
                                    newHotel.unavailableDates.map((d, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100 group">
                                        <span className="text-xs md:text-sm font-bold text-[#1e293b]">{format(parseISO(d), 'MMM dd, yyyy')}</span>
                                        <button 
                                          type="button"
                                          onClick={() => toggleDateAvailability(parseISO(d))}
                                          className="text-neutral-300 hover:text-red-500 transition-colors h-8 w-8 flex items-center justify-center"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-neutral-400 italic">No dates blocked yet.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {formStep === 6 && (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-8">
                            <div className="space-y-4">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Property Photos</label>
                              
                              <div 
                                className="border-2 border-dashed border-neutral-200 rounded-2xl md:rounded-[2rem] p-6 md:p-10 text-center hover:border-[#fbbf24] transition-colors cursor-pointer bg-neutral-50 relative group"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const files = Array.from(e.dataTransfer.files);
                                  files.forEach(file => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const url = reader.result as string;
                                      setNewHotel(prev => ({
                                        ...prev,
                                        images: [...prev.images, url],
                                        imageUrl: prev.imageUrl || url
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                }}
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.multiple = true;
                                  input.accept = 'image/*';
                                  input.onchange = handleFileChange as any;
                                  input.click();
                                }}
                              >
                                <ArrowUpCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 text-neutral-300 group-hover:text-[#fbbf24] transition-colors" />
                                <p className="font-bold text-[#1e293b] text-sm md:text-base">Upload from Phone or Computer</p>
                                <p className="text-xs md:text-sm text-neutral-400">Tap to browse or drag and drop images (Max 5MB)</p>
                              </div>

                              {newHotel.images.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mt-6">
                                  {newHotel.images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden group">
                                      <img src={img} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                      <button 
                                        type="button"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setNewHotel(prev => ({
                                            ...prev,
                                            images: prev.images.filter((_, i) => i !== idx),
                                            imageUrl: prev.imageUrl === img ? (prev.images[idx + 1] || prev.images[idx - 1] || '') : prev.imageUrl
                                          }));
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                      {newHotel.imageUrl === img && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-[#fbbf24] text-[#1e293b] text-[8px] md:text-[10px] font-bold py-1 text-center">
                                          MAIN IMAGE
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <p className="text-[10px] md:text-xs text-neutral-400 italic">Tip: Use high-quality landscape photos for better conversion.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">CIR/CIN Code (Mandatory)</label>
                                <Input placeholder="e.g. CIR-12345-NAP" value={newHotel.cirCode} onChange={e => setNewHotel({...newHotel, cirCode: e.target.value})} required className="h-14 rounded-xl" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Host Phone Number (For direct contact)</label>
                                <Input placeholder="e.g. +39 333 1234567" value={newHotel.phoneNumber} onChange={e => setNewHotel({...newHotel, phoneNumber: e.target.value})} required className="h-14 rounded-xl" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Cancellation Policy</label>
                                <select 
                                  className="w-full rounded-xl md:rounded-2xl border border-neutral-200 p-4 text-sm font-bold outline-none focus:border-[#fbbf24] transition-colors bg-white appearance-none h-14"
                                  value={newHotel.cancellationPolicy}
                                  onChange={e => setNewHotel({...newHotel, cancellationPolicy: e.target.value as any})}
                                >
                                  <option value="Flexible">Flexible</option>
                                  <option value="Moderate">Moderate</option>
                                  <option value="Strict">Strict</option>
                                </select>
                              </div>
                            </div>
                            <div className="p-6 md:p-8 rounded-2xl md:rounded-[2rem] bg-[#1e293b] text-white">
                              <div className="flex items-center gap-4 mb-4">
                                <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-[#fbbf24]" />
                                <h3 className="text-lg md:text-xl font-bold">Host Guarantee</h3>
                              </div>
                              <p className="text-xs md:text-sm opacity-70 leading-relaxed">
                                By listing your property, you agree to our terms of service and quality standards. Lhost in Naples provides full support for your bookings and guest management.
                              </p>
                            </div>
                          </motion.div>
                        )}

                        <div className="flex gap-4 pt-10 border-t border-neutral-100">
                          {formStep > 1 && (
                            <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-neutral-200" type="button" onClick={() => setFormStep(prev => prev - 1)}>
                              Previous Step
                            </Button>
                          )}
                          {formStep < 6 ? (
                            <Button className="flex-1 bg-[#1e293b] text-white h-14 rounded-2xl font-bold" type="button" onClick={() => setFormStep(prev => prev + 1)}>
                              Continue
                            </Button>
                          ) : (
                            <Button className="flex-1 bg-[#fbbf24] text-[#1e293b] h-14 rounded-2xl font-bold shadow-lg shadow-[#fbbf24]/20" type="submit">
                              {editingHotel ? 'Save Changes' : 'Publish Listing'}
                            </Button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
