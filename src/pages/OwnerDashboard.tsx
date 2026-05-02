import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useHotels } from '../contexts/HotelsContext';
import { Card, Button, Input } from '../components/UI';
import { cn } from '../lib/utils';
import { 
  Home, Calendar, Wrench, BarChart3, Star, User,
  Plus, Edit2, Trash2, CheckCircle2, XCircle, Clock,
  MoreVertical, ExternalLink, Filter, Search, ChevronRight,
  TrendingUp, ArrowUpRight, ArrowDownRight, MapPin, Users as UsersIcon,
  Package, LayoutGrid
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/DashboardLayout';

export const OwnerDashboard: React.FC = () => {
  const { user, token, isDemoMode } = useAuth();
  const { formatPrice } = useCurrency();
  const { allHotels, addHotel, updateHotel, bookings: allBookings, updateBooking } = useHotels();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';
  
  const myHotels = allHotels.filter(h => h.ownerId === user?.id || (isDemoMode && !h.ownerId));
  const myBookings = allBookings.filter(b => b.ownerId === user?.id || (isDemoMode && !b.ownerId));
  const [pool, setPool] = useState<any[]>([]);
  const [activeBookingTab, setActiveBookingTab] = useState<'pending' | 'confirmed' | 'past' | 'pool'>('pending');

  useEffect(() => {
    // Stale mock loading removed - using HotelsContext bookings
  }, [isDemoMode]);

  const handleAddProperty = () => {
    const newHotel = {
      id: `prop-${Date.now()}`,
      name: "New Luxury Suite " + (myHotels.length + 1),
      description: "A beautiful new property added via dashboard.",
      address: "Via Toledo 123",
      city: "Naples",
      country: "Italy",
      price: 150,
      amenities: ["WiFi", "AC"],
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      ownerId: user?.id,
      status: 'pending' as const,
      area: "Center",
      guests: 2,
      category: 'holiday_house'
    };
    addHotel(newHotel);
  };

  const handleUpdatePrice = (id: string) => {
    const newPrice = Math.floor(Math.random() * 100) + 150;
    updateHotel(id, { price: newPrice });
  };

  const handleBlockDates = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    updateHotel(id, { unavailableDates: [today] });
  };

  const handleBookingAction = (bookingId: string, action: 'CONFIRMED' | 'CANCELLED' | 'SHARED', reason?: string) => {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (action === 'CONFIRMED') {
      // Mark property dates as unavailable
      const property = allHotels.find(h => h.id === booking.propertyId);
      if (property) {
        const unavailable = [...(property.unavailableDates || [])];
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          unavailable.push(d.toISOString().split('T')[0]);
        }
        updateHotel(property.id, { unavailableDates: unavailable });
      }
      console.log('EMAIL TO CUSTOMER:', `Your booking ${booking.reference} has been CONFIRMED!`);
    } else if (action === 'CANCELLED') {
      console.log('EMAIL TO CUSTOMER:', `Your booking ${booking.reference} was CANCELLED. Reason: ${reason}`);
    } else if (action === 'SHARED') {
      console.log('POOL NOTIFICATION:', `Booking ${booking.reference} shared to pool`);
    }

    updateBooking(bookingId, { 
      status: action as any,
      rejectionReason: reason,
      sharedAt: action === 'SHARED' ? new Date().toISOString() : undefined
    });

    toast.success(`Booking ${action.toLowerCase()} successfully`);
  };

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start overflow-x-auto scrollbar-hide">
        {(['pending', 'confirmed', 'past', 'pool'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveBookingTab(tab)}
            className={cn(
              "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              activeBookingTab === tab 
                ? "bg-[#fbbf24] text-black shadow-lg" 
                : "text-neutral-500 hover:text-white"
            )}
          >
            {tab === 'pool' ? 'Booking Pool' : `${tab} Requests`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allBookings
          .filter(b => {
            // My bookings tabs
            if (activeBookingTab === 'pending') return b.ownerId === user?.id && b.status === 'PENDING';
            if (activeBookingTab === 'confirmed') return b.ownerId === user?.id && (b.status === 'CONFIRMED' || b.status === 'ACCEPTED');
            if (activeBookingTab === 'past') return b.ownerId === user?.id && b.status === 'CLOSED';
            
            // Pool tab: bookings shared by OTHERS
            if (activeBookingTab === 'pool') return b.ownerId !== user?.id && b.status === 'SHARED';
            
            return false;
          })
          .map(booking => (
            <Card key={booking.id} className="p-6 border-white/5 bg-white/5 hover:border-white/10 transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4">
                  <div className="h-20 w-24 rounded-xl overflow-hidden bg-white/5">
                    <img src={booking.propertyImage} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{booking.customerName}</h3>
                      <span className="text-[10px] font-bold text-neutral-500 bg-white/5 px-2 py-0.5 rounded">#{booking.reference}</span>
                      {activeBookingTab === 'pool' && (
                        <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                           <Clock className="h-3 w-3" /> 6h left
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mb-2">{booking.propertyName}</p>
                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><UsersIcon className="h-3 w-3" /> {booking.guests} Guests</span>
                      <span className="font-black text-[#fbbf24]">{formatPrice(booking.totalPrice)}</span>
                    </div>
                    {booking.notes && (
                      <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-[10px] font-bold text-[#fbbf24] uppercase mb-1">Notes:</p>
                        <p className="text-xs text-neutral-400 italic">"{booking.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-end gap-2 shrink-0">
                  {booking.status === 'PENDING' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleBookingAction(booking.id, 'CONFIRMED')}
                        className="bg-green-500 text-white font-black uppercase text-[10px] tracking-widest h-9"
                      >
                        Accept Request
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          const reason = prompt('Reason for rejection?');
                          if (reason) handleBookingAction(booking.id, 'CANCELLED', reason);
                        }}
                        className="text-red-500 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-widest h-9 border border-red-500/20"
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleBookingAction(booking.id, 'SHARED')}
                        className="text-amber-500 hover:bg-amber-500/10 font-black uppercase text-[10px] tracking-widest h-9 border border-amber-500/20"
                      >
                        Share to Pool
                      </Button>
                    </>
                  )}
                  {booking.status === 'SHARED' && booking.ownerId !== user?.id && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        updateBooking(booking.id, { status: 'ACCEPTED', ownerId: user?.id, originalListerId: booking.ownerId });
                        toast.success('You have accepted this pool booking!');
                        console.log('POOL ACTION:', `Booking ${booking.reference} taken from pool by ${user?.name}`);
                        console.log('EMAIL TO CUSTOMER:', `Your booking ${booking.reference} is now being handled by ${user?.name}. New details incoming.`);
                      }}
                      className="bg-[#fbbf24] text-black font-black uppercase text-[10px] tracking-widest h-9"
                    >
                      Accept from Pool
                    </Button>
                  )}
                  {booking.status === 'CONFIRMED' && (
                    <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 className="h-4 w-4" /> Confirmed
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        
        {myBookings.filter(b => {
            if (activeBookingTab === 'pending') return b.status === 'PENDING';
            if (activeBookingTab === 'confirmed') return b.status === 'CONFIRMED' || b.status === 'ACCEPTED';
            if (activeBookingTab === 'past') return b.status === 'CLOSED';
            if (activeBookingTab === 'pool') return b.status === 'SHARED';
            return true;
          }).length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <Calendar className="h-12 w-12 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">No bookings found in this category</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between group">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">My Properties</p>
             <h3 className="text-3xl font-bold text-white">{myHotels.length}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-purple-500/10"><Home className="h-6 w-6 text-purple-500" /></div>
        </Card>
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between group">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Bookings</p>
             <h3 className="text-3xl font-bold text-white">{myBookings.length}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-blue-500/10"><Calendar className="h-6 w-6 text-blue-500" /></div>
        </Card>
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between group">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">In Pool</p>
             <h3 className="text-3xl font-bold text-white">{pool.length}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-[#fbbf24]/10"><LayoutGrid className="h-6 w-6 text-[#fbbf24]" /></div>
        </Card>
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between group">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Earnings</p>
             <h3 className="text-3xl font-bold text-white">{formatPrice(12400)}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-green-500/10"><BarChart3 className="h-6 w-6 text-green-500" /></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Property Management</h2>
            <Button size="sm" onClick={handleAddProperty} className="h-9 bg-[#fbbf24] text-black font-black uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </div>
          <div className="space-y-4">
            {myHotels.map(hotel => (
              <Card key={hotel.id} className="p-4 border-white/5 bg-white/5 hover:border-[#fbbf24]/30 transition-all group">
                <div className="flex gap-6">
                  <div className="h-24 w-32 rounded-xl overflow-hidden shrink-0">
                    <img src={hotel.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[#fbbf24] transition-colors">{hotel.name}</h3>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {hotel.area}</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <Button variant="ghost" size="sm" onClick={() => handleBlockDates(hotel.id)} className="h-8 text-[10px] font-bold text-amber-500 hover:bg-amber-500/10">Block Today</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleUpdatePrice(hotel.id)} className="h-8 w-8 text-neutral-500 hover:text-white"><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase">
                        <UsersIcon className="h-3 w-3" /> {hotel.guests} Guests
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase">
                        <TrendingUp className="h-3 w-3" /> {formatPrice(hotel.price)}/night
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <span className={cn("h-2 w-2 rounded-full", hotel.status === 'approved' ? "bg-green-500" : "bg-yellow-500")}></span>
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", hotel.status === 'approved' ? "text-green-500" : "text-yellow-500")}>
                          {hotel.status === 'approved' ? 'Active' : (hotel.status || 'Pending')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Recent Inquiries</h2>
          <Card className="border-white/5 bg-white/5 divide-y divide-white/5 overflow-hidden">
            {myBookings.filter(b => b.status === 'PENDING').slice(0, 4).map(booking => (
              <div key={booking.id} className="p-4 hover:bg-white/[0.02] cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-white">{booking.customerName}</p>
                  <span className="text-[10px] font-black text-[#fbbf24] uppercase tracking-tighter">{formatPrice(booking.totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-neutral-500 uppercase font-medium">{new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}</p>
                  <Button variant="ghost" size="sm" onClick={() => handleBookingAction(booking.id, 'CONFIRMED')} className="h-6 text-[8px] font-black uppercase tracking-widest border border-white/5 text-neutral-500 hover:text-white group-hover:border-[#fbbf24]/30 transition-all">Accept</Button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title={section === 'overview' ? 'Property Stats' : section.charAt(0).toUpperCase() + section.slice(1)}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
             <h1 className="text-3xl font-bold text-white capitalize">Lister Dashboard</h1>
             <p className="text-neutral-500 text-sm mt-1">Manage your properties and bookings effectively.</p>
           </div>
        </div>

        {section === 'overview' && renderOverview()}
        {section === 'bookings' && renderBookings()}
        {(section !== 'overview' && section !== 'bookings') && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Package className="h-10 w-10 text-neutral-600" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{section.toUpperCase()} module</h2>
             <p className="text-neutral-500 max-w-sm">This professional management module is being refined for WordPress style control.</p>
           </div>
        )}
      </div>
    </DashboardLayout>
  );
};
