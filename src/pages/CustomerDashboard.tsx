import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, Button, Input } from '../components/UI';
import { 
  Calendar, Star, MapPin, User, LogOut, 
  Settings, Heart, Map, Clock, 
  ChevronRight, ExternalLink, MessageSquare, Plus,
  Camera, Briefcase, Bell, Mail, Phone, Globe, DollarSign
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useHotels } from '../contexts/HotelsContext';
import { useWishlist } from '../contexts/WishlistContext';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'motion/react';
import { ReviewModal } from '../components/ReviewModal';
import { BookingDetailModal } from '../components/BookingDetailModal';
import { ImageUpload } from '../components/ImageUpload';
import { SEOHead } from '../components/SEOHead';

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isDemoMode, updateUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { currentLanguage, setLanguage } = useLanguage();
  const { hotels, services, bookings: allBookings, updateBooking } = useHotels();
    const { wishlist, removeFromWishlist } = useWishlist();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';
  
  const [profileForm, setProfileForm] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ')[1] || '',
    phone: user?.phone || '',
    photoUrl: ''
  });

  const [settingsForm, setSettingsForm] = useState({
    currency: 'EUR',
    language: currentLanguage.code,
    notifications: true
  });

  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'past' | 'cancelled'>('upcoming');
  const [bookingTypeFilter, setBookingTypeFilter] = useState<'PROPERTY' | 'SERVICE'>('PROPERTY');

  useEffect(() => {
    if (section === 'experiences') {
      setBookingTypeFilter('SERVICE');
    } else if (section === 'trips' || section === 'overview') {
      setBookingTypeFilter('PROPERTY');
    }
  }, [section]);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<any>(null);

  const myBookings = allBookings.filter(b => b.customerId === user?.id || (isDemoMode && !b.customerId));

  const reviewsWrittenCount = useMemo(() => {
    let count = 0;
    hotels.forEach(h => {
      if (Array.isArray(h.reviews) && h.reviews.some((r: any) => r.userId === user?.id)) count++;
    });
    services.forEach(s => {
      if (Array.isArray((s as any).reviews) && (s as any).reviews.some((r: any) => r.userId === user?.id)) count++;
    });
    return count;
  }, [hotels, services, user?.id]);

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

  const renderSettings = () => (
    <Card className="p-6 bg-[#1e293b] border-[#334155]">
      <h2 className="text-xl font-bold text-white mb-6">Preferences</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Language</label>
          <select 
            value={settingsForm.language} 
            onChange={(e) => setSettingsForm({...settingsForm, language: e.target.value})} 
            className="w-full p-3 rounded-xl bg-[#0f172a] text-white border border-[#334155] focus:border-[#F5A623] outline-none"
          >
             <option value="en-GB" className="bg-[#1e293b]">English (UK)</option>
             <option value="en-US" className="bg-[#1e293b]">English (US)</option>
             <option value="it" className="bg-[#1e293b]">Italiano</option>
          </select>
        </div>
        <Button onClick={() => { setLanguage(settingsForm.language); toast.success('Settings updated'); }}>Save Preferences</Button>
      </div>
    </Card>
  );

  const renderWishlist = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wishlist.map(id => {
            const item = hotels.find(h => h.id === id);
            if (!item) return null;
            return (
              <Card key={id} className="p-0 bg-[#1e293b] border-[#334155] flex flex-col gap-0 overflow-hidden relative group">
                 <img src={item.imageUrl} alt={item.name} className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="p-6 space-y-4">
                    <h3 className="font-bold text-white text-lg group-hover:text-[#F5A623] transition-colors">{item.name}</h3>
                    <p className="text-[#F5A623] font-black text-xl">{formatPrice(item.price)}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-[#334155]" onClick={() => { removeFromWishlist(id); toast.success('Removed from wishlist') }}>Remove</Button>
                        <Button size="sm" className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest bg-[#F5A623]" onClick={() => window.location.href = `/hotel/${id}`}>Book Now</Button>
                    </div>
                 </div>
              </Card>
            )
        })}
    </div>
  );
  
  const renderProfile = () => (
    <Card className="p-6 bg-[#1e293b] border border-[#334155]">
      <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>
      <div className="space-y-6">
        <div className="space-y-4 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Profile Photo</label>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="h-24 w-24 rounded-3xl overflow-hidden bg-[#0f172a] border border-[#334155] shrink-0">
                {profileForm.photoUrl ? (
                  <img src={profileForm.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-8 w-8 text-[#334155]" />
                  </div>
                )}
              </div>
              <div className="flex-1 w-full">
                <ImageUpload 
                  maxImages={1}
                  storagePath="profiles/customers"
                  initialImages={profileForm.photoUrl ? [profileForm.photoUrl] : []}
                  onImagesChange={(imgs) => {
                    setProfileForm({ ...profileForm, photoUrl: imgs[0] || '' });
                  }}
                />
                <p className="text-[10px] text-[#64748b] font-medium mt-2">External image for your profile avatar.</p>
              </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">First Name</label>
           <Input 
             value={profileForm.firstName} 
             onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
             className="bg-[#1e293b] border-[#334155] text-white placeholder:text-[#64748b] focus:border-[#F5A623] focus:ring-[#F5A623]"
           />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Last Name</label>
           <Input 
             value={profileForm.lastName} 
             onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
             className="bg-[#1e293b] border-[#334155] text-white placeholder:text-[#64748b] focus:border-[#F5A623] focus:ring-[#F5A623]"
           />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Email</label>
           <Input value={user?.email || ''} readOnly className="bg-[#1e293b] border-[#334155] text-white opacity-50" />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Phone</label>
           <Input 
             value={profileForm.phone} 
             onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
             className="bg-[#1e293b] border-[#334155] text-white placeholder:text-[#64748b] focus:border-[#F5A623] focus:ring-[#F5A623]"
           />
        </div>
        </div>
        <Button onClick={() => { updateUser({ name: `${profileForm.firstName} ${profileForm.lastName}`, phone: profileForm.phone, roleDetails: { photoUrl: profileForm.photoUrl } }); toast.success('Profile updated'); }} className="w-full md:w-auto bg-[#F5A623] text-black font-black uppercase tracking-widest h-12 px-8 rounded-xl shadow-lg shadow-[#F5A623]/20">Save Profile</Button>
      </div>
    </Card>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-4 md:p-6 bg-[#1e293b] border border-[#334155] relative overflow-hidden group">
           <div className="relative z-10 space-y-3 md:space-y-4">
              <div className="p-2 md:p-3 bg-white/5 rounded-xl w-fit"><Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" /></div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#F5A623]">{myBookings.length}</h3>
                <p className="text-[#94a3b8] text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Total Bookings</p>
              </div>
           </div>
           <Calendar className="absolute -right-4 -bottom-4 h-24 w-24 md:h-32 md:w-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </Card>
         <Card className="p-4 md:p-6 bg-[#1e293b] border border-[#334155] relative overflow-hidden group">
            <div className="relative z-10 space-y-3 md:space-y-4">
               <div className="p-2 md:p-3 bg-[#0f172a] rounded-xl w-fit"><Heart className="h-5 w-5 md:h-6 md:w-6 text-white" /></div>
               <div>
                 <h3 className="text-2xl md:text-3xl font-bold text-[#F5A623]">{wishlist.length}</h3>
                 <p className="text-[#94a3b8] text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Saved Items</p>
               </div>
            </div>
            <Heart className="absolute -right-4 -bottom-4 h-24 w-24 md:h-32 md:w-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
         </Card>
         <Card className="p-4 md:p-6 bg-[#1e293b] border border-[#334155] relative overflow-hidden group col-span-2 lg:col-span-1">
            <div className="relative z-10 space-y-3 md:space-y-4">
               <div className="p-2 md:p-3 bg-[#0f172a] rounded-xl w-fit"><Star className="h-5 w-5 md:h-6 md:w-6 text-white" /></div>
               <div>
                 <h3 className="text-2xl md:text-3xl font-bold text-[#F5A623]">{reviewsWrittenCount}</h3>
                 <p className="text-[#94a3b8] text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Reviews Written</p>
               </div>
            </div>
            <Star className="absolute -right-4 -bottom-4 h-24 w-24 md:h-32 md:w-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
         </Card>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">{bookingTypeFilter === 'PROPERTY' ? 'My Trips' : 'My Experiences'}</h2>
            {bookingTypeFilter === 'PROPERTY' ? (
              <button
                onClick={() => navigate('/search')}
                className="text-[#F5A623] text-sm font-bold hover:underline"
              >
                View All Properties →
              </button>
            ) : (
              <button
                onClick={() => navigate('/services')}
                className="text-[#F5A623] text-sm font-bold hover:underline"
              >
                View All Experiences →
              </button>
            )}
          </div>
          
          <div className="flex bg-[#1e293b] p-1 rounded-xl border border-[#334155] self-start">
            <button
              onClick={() => setBookingTypeFilter('PROPERTY')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                bookingTypeFilter === 'PROPERTY' ? "bg-[#F5A623] text-black shadow-lg" : "text-[#94a3b8] hover:text-white"
              )}
            >
              Stays
            </button>
            <button
              onClick={() => setBookingTypeFilter('SERVICE')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                bookingTypeFilter === 'SERVICE' ? "bg-[#F5A623] text-black shadow-lg" : "text-[#94a3b8] hover:text-white"
              )}
            >
              Experiences
            </button>
          </div>
        </div>
        
        <div className="flex bg-[#1e293b] p-1 rounded-xl border border-[#334155] self-start max-w-full overflow-x-auto scrollbar-hide">
          {(['upcoming', 'pending', 'past', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab 
                  ? "bg-[#F5A623] text-black shadow-lg" 
                  : "text-[#94a3b8] hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-0 border-[#334155] bg-[#1e293b] overflow-hidden flex flex-col group hover:border-[#F5A623]/30 transition-all">
              <div className="h-48 relative">
                <img 
                  src={booking.itemImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt={booking.itemName}
                />
                <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg",
                    (booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED') ? "bg-green-500/20 text-green-400" : 
                    (booking.status === 'PENDING' || booking.status === 'SHARED') ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
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
                
                <div className="flex flex-col gap-4 pt-4 border-t border-[#334155]">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Dates</p>
                      <p className="text-xs font-bold text-white">{new Date(booking.startDate).toLocaleDateString()} {booking.endDate ? `— ${new Date(booking.endDate).toLocaleDateString()}` : ''}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Reference</p>
                      <p className="text-xs font-bold text-white">#{booking.reference}</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-[#334155]/50">
                    <div className="flex justify-between items-center text-xs text-[#94a3b8]">
                      <span>Base price</span>
                      <span>{formatPrice(booking.totalPrice / (booking.endDate ? Math.max(1, Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))) : 1))} × {booking.endDate ? Math.max(1, Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))) : 1} nights</span>
                    </div>
                    <div className="flex justify-between items-center font-black">
                      <span className="text-[10px] text-[#94a3b8] uppercase tracking-widest">Total Price</span>
                      <span className="text-sm text-[#F5A623]">{formatPrice(booking.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {booking.rejectionReason && (
                   <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                     <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Cancellation Reason:</p>
                     <p className="text-xs text-neutral-400 italic">"{booking.rejectionReason}"</p>
                   </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-white/10 hover:bg-white/5" onClick={() => { setDetailTarget(booking); setDetailModalOpen(true); }}>Details</Button>
                  {(booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED') && (
                     <Button variant="outline" className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-white/10 hover:bg-white/5" onClick={() => { setDetailTarget(booking); setDetailModalOpen(true); }}>Contact Host</Button>
                  )}
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
              {bookingTypeFilter === 'SERVICE' ? (
                 <Button className="mt-4 bg-[#fbbf24] text-black hover:bg-white" onClick={() => navigate('/services')}>Explore Naples Experiences</Button>
              ) : (
                 <button
                   onClick={() => navigate('/search')}
                   className="bg-[#F5A623] text-[#0f172a] px-4 py-2 rounded-xl font-bold text-sm mt-4"
                 >
                   Explore Naples Properties
                 </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead noindex />
      <DashboardLayout title={section === 'overview' ? 'Overview' : section.charAt(0).toUpperCase() + section.slice(1)}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
             <h1 className="text-3xl font-bold text-white capitalize">Welcome, {user?.name.split(' ')[0]}!</h1>
             <p className="text-neutral-500 text-sm mt-1">Manage your trips and wishlist from your custom dashboard.</p>
           </div>
        </div>

        {section === 'overview' && renderOverview()}
        {section === 'trips' && renderOverview()}
        {section === 'experiences' && renderOverview()}
        {section === 'profile' && renderProfile()}
        {section === 'settings' && renderSettings()}
        {section === 'wishlist' && renderWishlist()}
        {!['overview', 'trips', 'profile', 'settings', 'wishlist', 'experiences'].includes(section) && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Star className="h-10 w-10 text-neutral-600" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{section.toUpperCase()} under construction</h2>
             <p className="text-neutral-500 max-w-sm">We're building out this part of your personal travel dashboard.</p>
           </div>
        )}

        {detailTarget && (
          <BookingDetailModal 
            booking={detailTarget}
            onClose={() => setDetailModalOpen(false)}
          />
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
    </>
  );
};
