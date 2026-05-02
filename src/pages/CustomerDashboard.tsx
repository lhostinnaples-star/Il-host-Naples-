import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, Button, Input } from '../components/UI';
import { 
  Calendar, Star, MapPin, User, LogOut, 
  Settings, Heart, Map, Clock, 
  ChevronRight, ExternalLink, MessageSquare, Plus,
  Camera, Briefcase, Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';
import { useHotels } from '../contexts/HotelsContext';
import { useWishlist } from '../contexts/WishlistContext';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'motion/react';
import { ReviewModal } from '../components/ReviewModal';

export const CustomerDashboard: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const { formatPrice } = useCurrency();
  const { hotels, services, bookings: allBookings, updateBooking } = useHotels();
  const { wishlist } = useWishlist();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';

  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'past' | 'cancelled'>('upcoming');
  const [bookingTypeFilter, setBookingTypeFilter] = useState<'PROPERTY' | 'SERVICE'>('PROPERTY');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<any>(null);

  const myBookings = allBookings.filter(b => b.customerId === user?.id || (isDemoMode && !b.customerId));

  const reviewsWrittenCount = useMemo(() => {
    let count = 0;
    hotels.forEach(h => {
      if (Array.isArray(h.reviews) && h.reviews.some((r: any) => r.userId === user?.id)) count++;
    });
    services.forEach(s => {
      if (Array.isArray((s as any).reviews) && (s as any).reviews.some((r: any) => r.userId === user?.id)) count++;
    });
    return count || (isDemoMode ? 2 : 0);
  }, [hotels, services, user?.id, isDemoMode]);

  const filteredBookings = myBookings.filter(b => {
    // Type filter
    if (b.bookingType !== bookingTypeFilter) return false;
    
    // Status filter
    if (activeTab === 'upcoming') return b.status === 'CONFIRMED' || b.status === 'ACCEPTED';
    if (activeTab === 'pending') return b.status === 'PENDING' || b.status === 'SHARED';
    if (activeTab === 'past') return b.status === 'CLOSED';
    if (activeTab === 'cancelled') return b.status === 'CANCELLED' || b.status === 'EXPIRED';
    return true;
  });

  const handleCancelRequest = (bookingId: string) => {
    updateBooking(bookingId, { status: 'CANCELLED' });
    toast.success('Booking request cancelled');
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 border-none relative overflow-hidden group">
           <div className="relative z-10 space-y-4">
              <div className="p-3 bg-white/10 rounded-xl w-fit"><Calendar className="h-6 w-6 text-white" /></div>
              <div>
                <h3 className="text-3xl font-bold text-white">{myBookings.length}</h3>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">Total Bookings</p>
              </div>
           </div>
           <Calendar className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </Card>
         <Card className="p-6 bg-gradient-to-br from-orange-500 to-pink-500 border-none relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
               <div className="p-3 bg-white/10 rounded-xl w-fit"><Heart className="h-6 w-6 text-white" /></div>
               <div>
                 <h3 className="text-3xl font-bold text-white">{wishlist.length}</h3>
                 <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mt-1">Saved Items</p>
               </div>
            </div>
            <Heart className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
         </Card>
         <Card className="p-6 bg-gradient-to-br from-[#fbbf24] to-yellow-600 border-none relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
               <div className="p-3 bg-white/10 rounded-xl w-fit"><Star className="h-6 w-6 text-white" /></div>
               <div>
                 <h3 className="text-3xl font-bold text-white">{reviewsWrittenCount}</h3>
                 <p className="text-yellow-100 text-xs font-bold uppercase tracking-widest mt-1">Reviews Written</p>
               </div>
            </div>
            <Star className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
         </Card>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-white">{bookingTypeFilter === 'PROPERTY' ? 'My Trips' : 'My Experiences'}</h2>
          
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start">
            <button
              onClick={() => setBookingTypeFilter('PROPERTY')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                bookingTypeFilter === 'PROPERTY' ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white"
              )}
            >
              Stays
            </button>
            <button
              onClick={() => setBookingTypeFilter('SERVICE')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                bookingTypeFilter === 'SERVICE' ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white"
              )}
            >
              Experiences
            </button>
          </div>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start">
          {(['upcoming', 'pending', 'past', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab 
                  ? "bg-[#fbbf24] text-black shadow-lg" 
                  : "text-neutral-500 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-0 border-white/5 bg-white/5 overflow-hidden flex flex-col group hover:border-[#fbbf24]/30 transition-all">
              <div className="h-48 relative">
                <img 
                  src={booking.itemImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt={booking.itemName}
                />
                <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg",
                    (booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED') ? "bg-green-500/80 text-white" : 
                    (booking.status === 'PENDING' || booking.status === 'SHARED') ? "bg-amber-500/80 text-white" :
                    "bg-red-500/80 text-white"
                  )}>
                    {booking.status}
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-black/40 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded font-black uppercase tracking-tighter shadow-sm border border-white/10">#{booking.reference}</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#fbbf24] transition-colors">{booking.itemName}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Dates</p>
                    <p className="text-xs font-bold text-white">{new Date(booking.startDate).toLocaleDateString()} {booking.endDate ? `— ${new Date(booking.endDate).toLocaleDateString()}` : ''}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Total</p>
                    <p className="text-sm font-black text-[#fbbf24]">{formatPrice(booking.totalPrice)}</p>
                  </div>
                </div>

                {booking.rejectionReason && (
                   <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                     <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Cancellation Reason:</p>
                     <p className="text-xs text-neutral-400 italic">"{booking.rejectionReason}"</p>
                   </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-white/10 hover:bg-white/5">Details</Button>
                  {(booking.status === 'PENDING' || booking.status === 'SHARED') && (
                    <Button onClick={() => handleCancelRequest(booking.id)} className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-white/10 text-red-500 border border-white/10">Cancel Request</Button>
                  )}
                  {booking.status === 'CLOSED' && (
                    <Button 
                      onClick={() => { setReviewTarget(booking); setReviewModalOpen(true); }}
                      className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    >
                      Write Review
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {filteredBookings.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
              <Calendar className="h-12 w-12 text-neutral-700 mx-auto mb-4" />
              <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No {bookingTypeFilter.toLowerCase().replace('property', 'stay')} bookings found in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title={section === 'overview' ? 'Overview' : section.charAt(0).toUpperCase() + section.slice(1)}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
             <h1 className="text-3xl font-bold text-white capitalize">Welcome, {user?.name.split(' ')[0]}!</h1>
             <p className="text-neutral-500 text-sm mt-1">Manage your trips and wishlist from your custom dashboard.</p>
           </div>
        </div>

        {section === 'overview' && renderOverview()}
        {section !== 'overview' && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Star className="h-10 w-10 text-neutral-600" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{section.toUpperCase()} under construction</h2>
             <p className="text-neutral-500 max-w-sm">We're building out this part of your personal travel dashboard.</p>
           </div>
        )}

        {reviewTarget && (
          <ReviewModal 
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            item={reviewTarget}
            onSuccess={() => {
               toast.success('Review submitted! Thank you for sharing your experience.');
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};
