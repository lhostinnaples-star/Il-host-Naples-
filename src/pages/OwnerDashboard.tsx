import React, { useState, useEffect, useMemo } from 'react';
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
  Package, LayoutGrid, AlertCircle, Mail, Phone, Image as ImageIcon,
  FileText, Globe, ShieldCheck, Languages, Check
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/DashboardLayout';
import { PropertyFormModal } from '../components/PropertyFormModal';
import { ImageUpload } from '../components/ImageUpload';
import { Checkbox, Textarea, Select } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { UserStatus } from '../contexts/AuthContext';
import { PendingApprovalScreen } from '../components/PendingApprovalScreen';

const CountdownTimer: React.FC<{ acceptedAt: string, onExpire: () => void }> = ({ acceptedAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number} | null>(null);
  const onExpireRef = React.useRef(onExpire);
  
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    let timeout: ReturnType<typeof setInterval>;
    const calculateTimeLeft = () => {
      const acceptedDate = new Date(acceptedAt);
      const expiryDate = new Date(acceptedDate.getTime() + 6 * 60 * 60 * 1000);
      const diff = expiryDate.getTime() - new Date().getTime();

      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0 });
        if (timeout) clearInterval(timeout);
        onExpireRef.current();
        return;
      }

      setTimeLeft({
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60)
      });
    };

    calculateTimeLeft();
    timeout = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timeout);
  }, [acceptedAt]);

  if (!timeLeft) return null;

  const isUrgent = timeLeft.h === 0;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
      isUrgent ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
    )}>
      <Clock className="h-4 w-4" />
      {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
    </div>
  );
};

export const OwnerDashboard: React.FC = () => {
  const { user, token, isDemoMode, updateUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { allHotels, addHotel, updateHotel, deleteHotel, bookings: allBookings, updateBooking } = useHotels();

  if (user?.status === UserStatus.PENDING_APPROVAL || user?.status === UserStatus.REJECTED) {
    return <PendingApprovalScreen status={user.status} rejectionReason={user.rejectionReason} />;
  }

  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';
  
  const myHotels = allHotels.filter(h => h.ownerId === user?.id || (isDemoMode && !h.ownerId));
  const myBookings = allBookings.filter(b => b.ownerId === user?.id || (isDemoMode && !b.ownerId));
  const [activeBookingTab, setActiveBookingTab] = useState<'pending' | 'confirmed' | 'past' | 'pool' | 'pool_accepted'>('pending');

  // Modal States
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
    photoUrl: user?.roleDetails?.photoUrl || '',
    bio: user?.roleDetails?.bio || '',
    languages: user?.roleDetails?.languages || [] as string[],
    responseTime: user?.roleDetails?.responseTime || 'Within few hours',
    hostSince: user?.roleDetails?.hostSince || new Date().toISOString().split('T')[0],
    whatsapp: user?.roleDetails?.whatsapp || false,
    idDocumentUrl: user?.roleDetails?.idDocumentUrl || '',
    cirCode: user?.roleDetails?.cirCode || '',
    certificateUrl: user?.roleDetails?.certificateUrl || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (!profileForm.phone) {
        toast.error('Phone number is required');
        setIsSaving(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser({
        name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
        phone: profileForm.phone,
        roleDetails: {
          ...user?.roleDetails,
          ...profileForm
        }
      });
      
      toast.success('Owner profile updated!');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setProfileForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const renderProfile = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl"
    >
      <form onSubmit={handleProfileSave} className="space-y-8">
        {/* Personal info */}
        <Card className="p-8 bg-[#1e293b] border border-[#334155] rounded-[2rem]">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center">
              <User className="h-6 w-6 text-[#F5A623]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Personal Information</h2>
              <p className="text-[#94a3b8] text-sm font-medium">Your private contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">First Name</label>
              <Input 
                value={profileForm.firstName}
                onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                placeholder="Sofia" 
                className="bg-black/20 border-white/5 text-white placeholder:text-white/20 h-14 rounded-2xl focus:border-[#F5A623]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Last Name</label>
              <Input 
                value={profileForm.lastName}
                onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                placeholder="Esposito" 
                className="bg-black/20 border-white/5 text-white placeholder:text-white/20 h-14 rounded-2xl focus:border-[#F5A623]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Email (Read Only)</label>
              <Input 
                value={user?.email || ''} 
                readOnly 
                className="bg-black/40 border-white/5 text-[#94a3b8] h-14 rounded-2xl cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                <Input 
                  required
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+39 123 456 7890" 
                  className="bg-black/20 border-white/5 text-white placeholder:text-white/20 h-14 rounded-2xl pl-12 focus:border-[#F5A623]"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Profile Photo</label>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="h-24 w-24 rounded-3xl overflow-hidden bg-black/20 border border-white/5 shrink-0">
                  {profileForm.photoUrl ? (
                    <img src={profileForm.photoUrl} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-[#334155]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <ImageUpload 
                    maxImages={1}
                    storagePath="profiles/owners"
                    initialImages={profileForm.photoUrl ? [profileForm.photoUrl] : []}
                    onImagesChange={(imgs) => {
                      setProfileForm({ ...profileForm, photoUrl: imgs[0] || '' });
                      console.log("Image ready for Firebase Storage");
                    }}
                  />
                  <p className="text-[10px] text-[#64748b] font-medium mt-2">Upload your host profile image (max 5MB).</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Host info */}
        <Card className="p-8 bg-[#1e293b] border border-[#334155] rounded-[2rem]">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center">
              <Globe className="h-6 w-6 text-[#F5A623]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Host Details</h2>
              <p className="text-[#94a3b8] text-sm font-medium">Manage your public bio and host preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Bio / About Me</label>
              <Textarea 
                value={profileForm.bio}
                onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Describe yourself to your guests..." 
                className="bg-black/20 border-white/5 text-white placeholder:text-white/20 rounded-2xl focus:border-[#F5A623]"
              />
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Languages Spoken</label>
              <div className="flex flex-wrap gap-4">
                {['English', 'Italian', 'Other'].map(lang => (
                  <Checkbox 
                    key={lang}
                    label={lang}
                    checked={profileForm.languages.includes(lang)}
                    onChange={() => toggleLanguage(lang)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Response Time</label>
              <div className="relative">
                <Select 
                  value={profileForm.responseTime}
                  onChange={e => setProfileForm({ ...profileForm, responseTime: e.target.value })}
                  className="bg-black/20 border-white/5 text-white h-14 rounded-2xl px-4 focus:border-[#F5A623]"
                >
                  <option className="bg-[#0f172a]" value="Within 1 hour">Within 1 hour</option>
                  <option className="bg-[#0f172a]" value="Within few hours">Within few hours</option>
                  <option className="bg-[#0f172a]" value="Within 24 hours">Within 24 hours</option>
                </Select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8] rotate-90" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Host Since</label>
              <Input 
                type="date"
                value={profileForm.hostSince}
                onChange={e => setProfileForm({ ...profileForm, hostSince: e.target.value })}
                className="bg-black/20 border-white/5 text-white h-14 rounded-2xl focus:border-[#F5A623]"
              />
            </div>

            <div className="flex items-end pb-4">
              <Checkbox 
                label="WhatsApp (Same as phone)"
                checked={profileForm.whatsapp}
                onChange={e => setProfileForm({ ...profileForm, whatsapp: e.target.checked })}
              />
            </div>
          </div>
        </Card>

        {/* Verification */}
        <Card className="p-8 bg-[#1e293b] border border-[#334155] rounded-[2rem]">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-[#F5A623]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Verification & Regulation</h2>
              <p className="text-[#94a3b8] text-sm font-medium">Legal requirements for hosting in Italy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">ID Document URL</label>
              <Input 
                value={profileForm.idDocumentUrl}
                onChange={e => setProfileForm({ ...profileForm, idDocumentUrl: e.target.value })}
                placeholder="https://cloud.storage/passport.jpg" 
                className="bg-black/20 border-white/5 text-white placeholder:text-white/20 h-14 rounded-2xl focus:border-[#F5A623]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">CIR Code (Regional Identification)</label>
              <Input 
                value={profileForm.cirCode}
                onChange={e => setProfileForm({ ...profileForm, cirCode: e.target.value })}
                placeholder="e.g. 15063049EXT0001" 
                className="bg-black/20 border-white/5 text-white placeholder:text-white/20 h-14 rounded-2xl focus:border-[#F5A623]"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Host Certificate URL (Optional)</label>
              <Input 
                value={profileForm.certificateUrl}
                onChange={e => setProfileForm({ ...profileForm, certificateUrl: e.target.value })}
                placeholder="https://cloud.storage/certificate.pdf" 
                className="bg-black/20 border-white/5 text-white placeholder:text-white/20 h-14 rounded-2xl focus:border-[#F5A623]"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-4 pb-12">
          <Button 
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto h-14 px-12 bg-[#F5A623] hover:bg-[#d98c0d] text-black font-black uppercase tracking-widest shadow-xl shadow-[#F5A623]/20 transition-all rounded-2xl flex items-center gap-2 group"
          >
            {isSaving ? (
              <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Check className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );

  const earnings = useMemo(() => {
    return myBookings
      .filter(b => b.status === 'CONFIRMED' || b.status === 'ACCEPTED' || b.status === 'CLOSED')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  }, [myBookings]);

  const handleAddProperty = () => {
    if (isDemoMode) {
      setEditingProperty({
        name: 'Villa Partenope',
        type: 'Holiday House',
        area: 'Posillipo',
        address: 'Via Posillipo 12',
        price: 180,
        isDemoDummy: true
      });
    } else {
      setEditingProperty(null);
    }
    setIsPropertyModalOpen(true);
  };

  const handleEditProperty = (hotel: any) => {
    setEditingProperty(hotel);
    setIsPropertyModalOpen(true);
  };

  const handlePropertySubmit = (data: any) => {
    if (editingProperty?.isDemoDummy) {
      toast.success('Property submitted for approval');
      setIsPropertyModalOpen(false);
      return;
    }
    if (editingProperty) {
      updateHotel(editingProperty.id, data);
      toast.success('Property updated successfully');
    } else {
      const newHotel = {
        ...data,
        id: `prop-${Date.now()}`,
        ownerId: user?.id,
        status: 'pending' as const,
        rating: 5,
        reviews: 0
      };
      addHotel(newHotel);
      toast.success('Property submitted for approval');
    }
    setIsPropertyModalOpen(false);
  };

  const handleDeleteProperty = (id: string) => {
    deleteHotel(id);
    toast.success('Property removed from platform');
    setPropertyToDelete(null);
  };

  const handleBookingAction = (bookingId: string, action: 'CONFIRMED' | 'CANCELLED' | 'SHARED', reason?: string) => {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (action === 'CONFIRMED') {
      // Mark property dates as unavailable
      const property = allHotels.find(h => h.id === booking.itemId);
      if (property) {
        const unavailable = [...(property.unavailableDates || [])];
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate || booking.startDate);
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
      <div className="flex bg-[#0f172a] p-1 rounded-xl border border-[#334155] self-start overflow-x-auto scrollbar-hide">
        {(['pending', 'confirmed', 'past', 'pool', 'pool_accepted'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveBookingTab(tab)}
            className={cn(
              "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              activeBookingTab === tab 
                ? "bg-[#F5A623] text-black shadow-lg" 
                : "text-[#94a3b8] hover:text-white"
            )}
          >
            {tab === 'pool' ? 'Booking Pool' : tab === 'pool_accepted' ? 'Pool Accepted' : `${tab} Requests`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allBookings
          .filter(b => {
            // My bookings tabs
            if (activeBookingTab === 'pending') return b.ownerId === user?.id && b.status === 'PENDING';
            if (activeBookingTab === 'confirmed') return b.ownerId === user?.id && b.status === 'CONFIRMED';
            if (activeBookingTab === 'past') return b.ownerId === user?.id && b.status === 'CLOSED';
            if (activeBookingTab === 'pool_accepted') return b.ownerId === user?.id && b.status === 'ACCEPTED';
            
            // Pool tab: bookings shared by OTHERS
            if (activeBookingTab === 'pool') return b.ownerId !== user?.id && b.status === 'SHARED';
            
            return false;
          })
          .map(booking => (
            <Card key={booking.id} className="p-6 border-[#334155] bg-[#1e293b] hover:border-[#F5A623]/30 transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4">
                  <div className="h-20 w-24 rounded-xl overflow-hidden bg-[#0f172a]">
                    <img src={booking.itemImage} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{booking.customerName}</h3>
                      <span className="text-[10px] font-bold text-[#64748b] bg-[#0f172a] border border-[#334155] px-2 py-0.5 rounded">#{booking.reference}</span>
                      {activeBookingTab === 'pool' && (
                        <span className="text-[10px] font-black text-[#F5A623] bg-[#F5A623]/10 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                           <Clock className="h-3 w-3" /> 6h left
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#e2e8f0] mb-2">{booking.itemName}</p>
                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(booking.startDate).toLocaleDateString()} {booking.endDate ? `- ${new Date(booking.endDate).toLocaleDateString()}` : ''}</span>
                      {booking.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.time}</span>}
                      <span className="flex items-center gap-1"><UsersIcon className="h-3 w-3" /> {booking.guests} {booking.bookingType === 'SERVICE' ? 'People' : 'Guests'}</span>
                      <span className="font-black text-[#F5A623]">{formatPrice(booking.totalPrice)}</span>
                    </div>
                    {booking.notes && (
                      <div className="mt-3 p-3 rounded-lg bg-[#0f172a] border border-[#334155]">
                        <p className="text-[10px] font-bold text-[#F5A623] uppercase mb-1">Notes:</p>
                        <p className="text-xs text-[#94a3b8] italic">"{booking.notes}"</p>
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
                        className="text-[#F5A623] hover:bg-[#F5A623]/10 font-black uppercase text-[10px] tracking-widest h-9 border border-[#F5A623]/20"
                      >
                        Share to Pool
                      </Button>
                    </>
                  )}
                  {booking.status === 'SHARED' && booking.ownerId !== user?.id && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        updateBooking(booking.id, { 
                          status: 'ACCEPTED', 
                          ownerId: user?.id, 
                          originalListerId: booking.ownerId,
                          acceptedAt: new Date().toISOString()
                        });
                        toast.success('You have accepted this pool booking!');
                        console.log('POOL ACTION:', `Booking ${booking.reference} taken from pool by ${user?.name}`);
                        console.log('EMAIL TO CUSTOMER:', `Your booking ${booking.reference} is now being handled by ${user?.name}. New details incoming.`);
                      }}
                      className="bg-[#F5A623] text-[#0f172a] font-black uppercase text-[10px] tracking-widest h-9"
                    >
                      Accept from Pool
                    </Button>
                  )}
                  {booking.status === 'ACCEPTED' && booking.acceptedAt && (
                    <div className="flex flex-col gap-2 items-end">
                      <CountdownTimer 
                        acceptedAt={booking.acceptedAt} 
                        onExpire={() => {
                           updateBooking(booking.id, {
                             status: 'SHARED',
                             ownerId: booking.originalListerId || 'demo-owner',
                             acceptedAt: undefined
                           });
                           toast.error('Pool booking acceptance expired');
                        }} 
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                           updateBooking(booking.id, {
                             status: 'SHARED',
                             ownerId: booking.originalListerId || 'demo-owner',
                             acceptedAt: undefined
                           });
                           toast.success('Booking returned to pool');
                        }}
                        className="text-red-500 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-widest h-9 border border-red-500/20"
                      >
                        Cancel & Return
                      </Button>
                    </div>
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
        
        {allBookings.filter(b => {
            if (activeBookingTab === 'pending') return b.ownerId === user?.id && b.status === 'PENDING';
            if (activeBookingTab === 'confirmed') return b.ownerId === user?.id && b.status === 'CONFIRMED';
            if (activeBookingTab === 'past') return b.ownerId === user?.id && b.status === 'CLOSED';
            if (activeBookingTab === 'pool_accepted') return b.ownerId === user?.id && b.status === 'ACCEPTED';
            if (activeBookingTab === 'pool') return b.ownerId !== user?.id && b.status === 'SHARED';
            return false;
          }).length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-[#334155] rounded-2xl">
            <Calendar className="h-12 w-12 text-[#334155] mx-auto mb-4" />
            <p className="text-[#64748b] font-bold uppercase tracking-widest text-[10px]">No bookings found in this category</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { title: "My Properties", value: myHotels.length, icon: Home, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Bookings", value: myBookings.length, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "In Pool", value: allBookings.filter(b => b.status === 'SHARED' && b.ownerId !== user?.id).length, icon: LayoutGrid, color: "text-[#F5A623]", bg: "bg-[#F5A623]/10" },
          { title: "Earnings", value: formatPrice(earnings), icon: BarChart3, color: "text-green-500", bg: "bg-green-500/10" }
        ].map((stat, i) => (
          <Card key={i} className="p-4 md:p-6 bg-[#1e293b] border border-[#334155] flex items-center justify-between group hover:border-[#F5A623]/30 transition-all">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">{stat.title}</p>
              <h3 className="text-xl md:text-2xl font-bold text-white leading-none">{stat.value}</h3>
            </div>
            <div className={cn("p-2 md:p-3 rounded-xl", stat.bg)}>
              <stat.icon className={cn("h-4 w-4 md:h-5 md:w-5", stat.color)} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Property Management</h2>
            <Button size="sm" onClick={handleAddProperty} className="h-9 bg-[#F5A623] text-black font-black uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {myHotels.map(hotel => (
              <Card key={hotel.id} className="p-0 border-[#334155] bg-[#1e293b] overflow-hidden group hover:border-[#F5A623]/30 transition-all">
                <div className="h-40 relative">
                  <img src={hotel.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border",
                      hotel.status === 'approved' ? "bg-green-500/90 text-white border-green-400" : 
                      hotel.status === 'rejected' ? "bg-red-500/90 text-white border-red-400" :
                      "bg-amber-500/90 text-white border-amber-400"
                    )}>
                      {hotel.status === 'approved' ? '✅ Live' : hotel.status === 'rejected' ? '❌ Rejected' : '🟡 Pending'}
                    </span>
                    {hotel.status === 'rejected' && (
                      <div className="bg-red-600/90 text-white text-[9px] px-2 py-0.5 rounded-lg font-bold shadow-sm">
                        See reason
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  {hotel.status === 'rejected' && hotel.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">Rejection Reason:</p>
                      <p className="text-[10px] text-slate-400 italic">"{hotel.rejectionReason}"</p>
                    </div>
                  )}
                  <h3 className="font-bold text-white text-lg leading-tight mb-1 group-hover:text-[#F5A623] transition-colors">{hotel.name}</h3>
                  <p className="text-[#94a3b8] text-xs flex items-center gap-1.5 mb-4">
                    <MapPin className="h-3 w-3" /> {hotel.area}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setEditingProperty(hotel);
                        setIsPropertyModalOpen(true);
                      }}
                      className="h-9 text-[9px] font-black uppercase border-[#334155] text-white hover:bg-white/5"
                    >
                      Dates
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditProperty(hotel)} className="h-9 text-[9px] font-black uppercase border-[#334155] text-white hover:bg-white/5">Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => setPropertyToDelete(hotel.id)} className="h-9 text-[9px] font-black uppercase border-[#334155] text-red-500 hover:bg-red-500/10">Delete</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Recent Inquiries</h2>
            <Card className="border-[#334155] bg-[#1e293b] divide-y divide-[#334155] overflow-hidden rounded-[2rem]">
              {myBookings.filter(b => b.status === 'PENDING').slice(0, 4).map(booking => (
                <div key={booking.id} className="p-4 hover:bg-white/[0.02] cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-white">{booking.customerName}</p>
                    <span className="text-[10px] font-black text-[#F5A623] uppercase tracking-tighter">{formatPrice(booking.totalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-[#64748b] uppercase font-medium">{new Date(booking.startDate).toLocaleDateString()} {booking.endDate ? `— ${new Date(booking.endDate).toLocaleDateString()}` : ''}</p>
                    <Button variant="ghost" size="sm" onClick={() => handleBookingAction(booking.id, 'CONFIRMED')} className="h-6 text-[8px] font-black uppercase tracking-widest border border-[#334155] text-[#94a3b8] hover:text-white group-hover:border-[#F5A623]/30 transition-all">Accept</Button>
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
             <p className="text-[#94a3b8] text-sm mt-1 font-medium">Manage your properties and bookings effectively.</p>
           </div>
        </div>

        {section === 'overview' && renderOverview()}
        {section === 'bookings' && renderBookings()}
        {section === 'profile' && renderProfile()}
        {(!['overview', 'bookings', 'profile'].includes(section)) && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-20 w-20 rounded-3xl bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center mb-6">
                <Package className="h-10 w-10 text-[#F5A623]" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{section.toUpperCase()} module</h2>
             <p className="text-[#94a3b8] max-w-sm font-medium">This professional management module is being refined for WordPress style control.</p>
           </div>
        )}

        <PropertyFormModal 
          isOpen={isPropertyModalOpen}
          onClose={() => setIsPropertyModalOpen(false)}
          onSubmit={handlePropertySubmit}
          initialData={editingProperty}
        />

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {propertyToDelete && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPropertyToDelete(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md bg-[#1e293b] border border-[#334155] rounded-3xl p-8 shadow-2xl"
              >
                <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">Delete Property?</h3>
                <p className="text-[#94a3b8] text-center mb-8">
                  This action cannot be undone. All associated bookings and data will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] border-[#334155]"
                    onClick={() => setPropertyToDelete(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] border-none"
                    onClick={() => handleDeleteProperty(propertyToDelete)}
                  >
                    Yes, Delete
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};
