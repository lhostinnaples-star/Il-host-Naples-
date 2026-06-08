import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useHotels } from '../contexts/HotelsContext';
import { Card, Button, Input } from '../components/UI';
import { 
  Plus, Edit2, Trash2, Map as MapIcon, Calendar,
  Star, User, CheckCircle2, XCircle, Clock,
  Search, Filter, ChevronRight, Package, LayoutGrid, AlertCircle,
  Phone, Mail, FileText, Building2, MessageSquare, Globe, Upload, Image as ImageIcon
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { ServiceFormModal } from '../components/ServiceFormModal';
import { ImageUpload } from '../components/ImageUpload';
import { motion, AnimatePresence } from 'motion/react';
import { UserStatus } from '../contexts/AuthContext';
import { PendingApprovalScreen } from '../components/PendingApprovalScreen';
import { SEOHead } from '../components/SEOHead';

export const ServiceProviderDashboard: React.FC = () => {
  const { user, token, isDemoMode, updateUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { allServices, addService, updateService, deleteService, bookings: allBookings, updateBooking } = useHotels();

  if (user?.status === UserStatus.PENDING_APPROVAL || user?.status === UserStatus.REJECTED) {
    return <PendingApprovalScreen status={user.status} rejectionReason={user.rejectionReason} />;
  }

  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';
  
  const myServices = allServices.filter(s => s.providerId === user?.id || (isDemoMode && !s.providerId));
  
  // Filter for my service bookings
  const myBookings = allBookings.filter(b => 
    b.bookingType === 'SERVICE' && 
    (b.ownerId === user?.id || (isDemoMode && !b.ownerId))
  );

  const [activeTab, setActiveTab] = useState<'services' | 'requests'>('services');
  const [activeRequestTab, setActiveRequestTab] = useState<'pending' | 'confirmed' | 'past'>('pending');

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    photoUrl: user?.roleDetails?.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    businessName: user?.roleDetails?.businessName || '',
    description: user?.roleDetails?.description || '',
    serviceAreas: user?.roleDetails?.serviceAreas || [],
    whatsappSameAsPhone: user?.roleDetails?.whatsappSameAsPhone ?? true,
    whatsappNumber: user?.roleDetails?.whatsappNumber || '',
    website: user?.roleDetails?.website || '',
    experience: user?.roleDetails?.experience || '',
    licenseUrl: user?.roleDetails?.licenseUrl || '',
    insuranceUrl: user?.roleDetails?.insuranceUrl || ''
  });

  const handleProfileSave = () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.phone || !profileData.businessName) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updates = {
      name: `${profileData.firstName} ${profileData.lastName}`,
      phone: profileData.phone,
      roleDetails: {
        ...user?.roleDetails,
        ...profileData
      }
    };

    updateUser(updates);
    toast.success('Profile updated successfully');
  };

  const toggleServiceArea = (area: string) => {
    setProfileData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter(a => a !== area)
        : [...prev.serviceAreas, area]
    }));
  };

  const renderProfile = () => (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Personal Information */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-[#fbbf24] rounded-full" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Personal Information</h2>
        </div>
        
        <Card className="p-8 border-[#334155] bg-[#1e293b] space-y-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-[#334155] group-hover:border-[#F5A623]/50 transition-all">
                {profileData.photoUrl ? (
                  <img src={profileData.photoUrl} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-[#0f172a]">
                    <ImageIcon className="h-8 w-8 text-[#334155]" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">First Name</label>
                  <Input 
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    placeholder="John"
                    className="bg-[#1e293b] border-[#334155] text-white placeholder:text-[#64748b] focus:border-[#F5A623] focus:ring-[#F5A623]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Last Name</label>
                  <Input 
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    placeholder="Doe"
                    className="bg-[#1e293b] border-[#334155] text-white placeholder:text-[#64748b] focus:border-[#F5A623] focus:ring-[#F5A623]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Profile Photo</label>
                <ImageUpload 
                  maxImages={1}
                  storagePath="profiles/services"
                  initialImages={profileData.photoUrl ? [profileData.photoUrl] : []}
                  onImagesChange={(imgs) => {
                    setProfileData({...profileData, photoUrl: imgs[0] || ''});
                    console.log("Image ready for Firebase Storage");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Email Address</label>
              <div className="flex items-center gap-3 bg-[#0f172a] border border-[#334155] px-4 py-3 rounded-xl text-[#94a3b8]">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">{profileData.email}</span>
                <span className="ml-auto text-[8px] font-black uppercase bg-white/10 px-1.5 py-0.5 rounded text-neutral-500 italic">Read Only</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Phone Number *</label>
              <div className="relative">
                <Input 
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="+39 XXX XXXXXXX"
                  className="bg-[#1e293b] border-[#334155] text-white pl-10 placeholder:text-[#64748b] focus:border-[#F5A623] focus:ring-[#F5A623]"
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Business Details */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-[#F5A623] rounded-full" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Business Details</h2>
        </div>
        
        <Card className="p-8 border-white/5 bg-[#1e293b] space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Business Name *</label>
              <div className="relative">
                <Input 
                  value={profileData.businessName}
                  onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                  placeholder="Company LLC"
                  className="bg-[#1e293b] border-[#334155] text-white pl-10 placeholder:text-[#64748b] focus:border-[#F5A623] focus:ring-[#F5A623]"
                />
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Years of Experience</label>
              <Input 
                type="number"
                value={profileData.experience}
                onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                placeholder="0"
                className="bg-[#1e293b] border-[#334155] text-white placeholder:text-[#64748b] focus:border-[#F5A623] focus:ring-[#F5A623]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Service Categories</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {['Transport', 'Tours & Leisure', 'Food & Lifestyle'].map(area => (
                <button
                  key={area}
                  onClick={() => toggleServiceArea(area)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-xs font-bold",
                    profileData.serviceAreas.includes(area)
                      ? "bg-[#F5A623] border-[#F5A623] text-black"
                      : "bg-[#0f172a] border-[#334155] text-[#ffffff] hover:border-[#F5A623]/50"
                  )}
                >
                  <div className={cn(
                    "h-4 w-4 rounded-md border flex items-center justify-center transition-colors",
                    profileData.serviceAreas.includes(area) ? "bg-black border-black" : "border-[#334155]"
                  )}>
                    {profileData.serviceAreas.includes(area) && <CheckCircle2 className="h-3 w-3 text-[#F5A623]" />}
                  </div>
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Business Description</label>
            <textarea 
              value={profileData.description}
              onChange={(e) => setProfileData({...profileData, description: e.target.value})}
              placeholder="Tell visitors about your experience services..."
              rows={4}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#F5A623] transition-all placeholder:text-[#64748b] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">WhatsApp Number</label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={profileData.whatsappSameAsPhone}
                    onChange={(e) => setProfileData({...profileData, whatsappSameAsPhone: e.target.checked})}
                    className="sr-only"
                  />
                  <div className={cn(
                    "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                    profileData.whatsappSameAsPhone ? "bg-[#F5A623] border-[#F5A623]" : "border-[#334155]"
                  )}>
                    {profileData.whatsappSameAsPhone && <CheckCircle2 className="h-3 w-3 text-black" />}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8] group-hover:text-white transition-colors">Same as phone</span>
                </label>
              </div>
              {!profileData.whatsappSameAsPhone && (
                <div className="relative animate-in slide-in-from-top-2 duration-300">
                  <Input 
                    value={profileData.whatsappNumber}
                    onChange={(e) => setProfileData({...profileData, whatsappNumber: e.target.value})}
                    placeholder="+39 XXX XXXXXXX"
                    className="bg-[#1e293b] border-[#334155] text-white pl-10 placeholder:text-[#64748b] focus:border-[#F5A623] focus:ring-[#F5A623]"
                  />
                  <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Website URL (Optional)</label>
              <div className="relative">
                <Input 
                  value={profileData.website}
                  onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  placeholder="https://www.yoursite.com"
                  className="bg-[#1e293b] border-[#334155] text-white pl-10 placeholder:text-[#64748b] focus:border-[#F5A623] focus:ring-[#F5A623]"
                />
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Documents */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-[#F5A623] rounded-full" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Verification Documents</h2>
        </div>
        
        <Card className="p-8 border-white/5 bg-[#1e293b] space-y-6">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
             <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
             <p className="text-xs text-amber-200/70 font-medium">Please provide links to your digital permits or uploaded documentation for account verification.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">License / Permit URL *</label>
              <div className="relative">
                <Input 
                  value={profileData.licenseUrl}
                  onChange={(e) => setProfileData({...profileData, licenseUrl: e.target.value})}
                  placeholder="Link to PDF/Image"
                  className="bg-[#1e293b] border-[#334155] text-white pl-10 placeholder:text-[#64748b] focus:border-[#F5A623] focus:ring-[#F5A623]"
                />
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Insurance Policy (Optional)</label>
              <div className="relative">
                <Input 
                  value={profileData.insuranceUrl}
                  onChange={(e) => setProfileData({...profileData, insuranceUrl: e.target.value})}
                  placeholder="Link to PDF/Image"
                  className="bg-[#1e293b] border-[#334155] text-white pl-10 placeholder:text-[#64748b] focus:border-[#F5A623] focus:ring-[#F5A623]"
                />
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Save Action */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleProfileSave}
          className="bg-[#F5A623] text-black h-14 px-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#F5A623]/10 hover:shadow-[#F5A623]/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          Save Profile Changes
        </Button>
      </div>
    </div>
  );

  const averageRating = useMemo(() => {
    const ratings = myServices.map(s => s.rating || 5);
    if (ratings.length === 0) return 0;
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  }, [myServices]);

  const handleAddService = () => {
    if (isDemoMode) {
      setEditingService({
        name: 'Capri Boat Tour',
        category: 'Boat Tour',
        price: 85,
        priceUnit: 'per person',
        isDemoDummy: true
      });
    } else {
      setEditingService(null);
    }
    setIsServiceModalOpen(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = (data: any) => {
    if (editingService?.isDemoDummy) {
      toast.success('Service added successfully');
      setIsServiceModalOpen(false);
      return;
    }
    if (editingService) {
      updateService(editingService.id, data);
      toast.success('Service updated successfully');
    } else {
      const newService = {
        ...data,
        id: `service-${Date.now()}`,
        providerId: user?.id,
        ownerId: user?.id || '',
        ownerEmail: user?.email || '',
        status: 'approved' as const,
        rating: 5
      };
      addService(newService);
      toast.success('Service added successfully');
    }
    setIsServiceModalOpen(false);
  };

  const handleDeleteService = (id: string) => {
    deleteService(id);
    toast.success('Service removed successfully');
    setServiceToDelete(null);
  };

  const pendingCount = myBookings.filter(b => b.status === 'PENDING').length;

  const handleBookingAction = useCallback((bookingId: string, action: 'CONFIRMED' | 'CANCELLED') => {
    let reason = '';
    if (action === 'CANCELLED') {
      reason = window.prompt('Please provide a reason for cancellation:') || 'Service unavailable';
    }
    
    updateBooking(bookingId, { status: action as any, rejectionReason: reason });
    toast.success(`Booking ${action.toLowerCase()} successfully`);
    
    const booking = myBookings.find(b => b.id === bookingId);
    if (booking) {
      if (action === 'CONFIRMED') {
        console.log('EMAIL TO CUSTOMER:', `Your experience ${booking.itemName} is CONFIRMED! Ref: ${booking.reference}`);
      } else {
        console.log('EMAIL TO CUSTOMER:', `Your experience request ${booking.reference} was rejected. Reason: ${reason}`);
      }
    }
  }, [myBookings, updateBooking]);

  const renderRequests = () => (
    <div className="space-y-6">
      <div className="flex bg-[#0f172a] p-1 rounded-xl border border-[#334155] self-start overflow-x-auto scrollbar-hide max-w-full">
        {(['pending', 'confirmed', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveRequestTab(tab)}
            className={cn(
              "px-4 md:px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              activeRequestTab === tab 
                ? "bg-[#F5A623] text-black shadow-lg" 
                : "text-[#94a3b8] hover:text-white"
            )}
          >
            {tab} {tab === 'pending' && pendingCount > 0 && `(${pendingCount})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {myBookings
          .filter(b => {
            if (activeRequestTab === 'pending') return b.status === 'PENDING';
            if (activeRequestTab === 'confirmed') return b.status === 'CONFIRMED' || b.status === 'ACCEPTED';
            if (activeRequestTab === 'past') return b.status === 'CLOSED';
            return false;
          })
          .map(booking => (
            <Card key={booking.id} className="p-4 md:p-6 border-[#334155] bg-[#1e293b] hover:border-[#F5A623]/30 transition-all">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="h-20 w-full sm:w-24 rounded-xl overflow-hidden bg-[#0f172a]">
                    <img src={booking.itemImage} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{booking.customerName}</h3>
                      <span className="text-[10px] font-bold text-[#94a3b8] bg-white/5 px-2 py-0.5 rounded">#{booking.reference}</span>
                      {booking.status === 'PENDING' && (
                        <span className="text-[10px] font-black text-[#F5A623] bg-[#F5A623]/10 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                           <Clock className="h-3 w-3" /> 23h 48m left
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#94a3b8] mb-1 font-bold">{booking.itemName}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(booking.startDate).toLocaleDateString()}</span>
                      {booking.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.time}</span>}
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {booking.guests} People</span>
                    </div>
                    {booking.notes && (
                      <div className="mt-2 p-2 rounded-lg bg-[#0f172a] border border-[#334155]">
                        <p className="text-[10px] font-bold text-[#F5A623] uppercase mb-1">Special Notes:</p>
                        <p className="text-[10px] text-[#94a3b8] italic leading-tight">"{booking.notes}"</p>
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="w-full flex gap-4 text-xs font-medium text-white mb-2">
                         <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {booking.customerEmail}</span>
                         <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {booking.customerPhone}</span>
                      </div>
                      <a href={`tel:${booking.customerPhone}`} className="bg-green-600 text-white rounded-xl px-3 py-1 text-sm flex items-center gap-1 font-bold"><Phone className="h-4 w-4" /> Call</a>
                      <a href={`mailto:${booking.customerEmail}`} className="bg-blue-600 text-white rounded-xl px-3 py-1 text-sm flex items-center gap-1 font-bold"><Mail className="h-4 w-4" /> Email</a>
                      <a href={`https://wa.me/${booking.customerPhone}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white rounded-xl px-3 py-1 text-sm flex items-center gap-1 font-bold"><MessageSquare className="h-4 w-4" /> WhatsApp</a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col justify-between lg:justify-center lg:items-end gap-3 min-w-[120px]">
                  <p className="text-xl lg:text-2xl font-black text-white">{formatPrice(booking.totalPrice)}</p>
                  
                  {booking.status === 'PENDING' ? (
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        size="sm" 
                        onClick={() => handleBookingAction(booking.id, 'CONFIRMED')}
                        className="bg-green-600 text-white font-black uppercase text-[10px] tracking-widest h-9 px-4"
                      >
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBookingAction(booking.id, 'CANCELLED')}
                        className="border-[#334155] text-red-500 font-black uppercase text-[10px] tracking-widest h-9 px-4 hover:bg-red-500/10"
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      booking.status === 'CONFIRMED' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {booking.status}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        }
        {myBookings.filter(b => {
            if (activeRequestTab === 'pending') return b.status === 'PENDING';
            if (activeRequestTab === 'confirmed') return b.status === 'CONFIRMED' || b.status === 'ACCEPTED';
            if (activeRequestTab === 'past') return b.status === 'CLOSED';
            return false;
          }).length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
             <Calendar className="h-10 w-10 text-neutral-700 mx-auto mb-4" />
             <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No {activeRequestTab} requests found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="flex bg-[#1e293b] p-1 rounded-2xl border border-[#334155] self-start mb-4 overflow-x-auto scrollbar-hide max-w-full">
        <button
          onClick={() => setActiveTab('services')}
          className={cn(
            "px-6 md:px-8 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'services' 
              ? "bg-[#F5A623] text-black shadow-xl" 
              : "text-[#94a3b8] hover:text-white"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          My Services
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            "px-6 md:px-8 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 relative whitespace-nowrap",
            activeTab === 'requests' 
              ? "bg-[#F5A623] text-black shadow-xl" 
              : "text-[#94a3b8] hover:text-white"
          )}
        >
          <Calendar className="h-4 w-4" />
          Booking Requests
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'requests' ? renderRequests() : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-4 md:p-6 border-[#334155] bg-[#1e293b] flex items-center justify-between cursor-pointer hover:border-[#F5A623]/30 transition-all">
             <div className="space-y-0.5 md:space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Active Services</p>
               <h3 className="text-xl md:text-3xl font-bold text-white leading-none">{myServices.length}</h3>
             </div>
             <div className="p-2 md:p-4 rounded-xl md:rounded-2xl bg-green-500/10"><MapIcon className="h-4 w-4 md:h-6 md:w-6 text-green-500" /></div>
          </Card>
          <Card 
            onClick={() => setActiveTab('requests')}
            className="p-4 md:p-6 border-[#334155] bg-[#1e293b] flex items-center justify-between cursor-pointer hover:border-[#F5A623]/30 transition-all"
          >
             <div className="space-y-0.5 md:space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Incoming Requests</p>
               <h3 className="text-xl md:text-3xl font-bold text-white leading-none">{myBookings.filter(b => b.status === 'PENDING').length}</h3>
             </div>
             <div className="p-2 md:p-4 rounded-xl md:rounded-2xl bg-blue-500/10"><Calendar className="h-4 w-4 md:h-6 md:w-6 text-blue-500" /></div>
          </Card>
          <Card className="p-4 md:p-6 border-[#334155] bg-[#1e293b] flex items-center justify-between cursor-pointer hover:border-[#F5A623]/30 transition-all col-span-2 lg:col-span-1">
             <div className="space-y-0.5 md:space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Revenue Month</p>
               <h3 className="text-xl md:text-3xl font-bold text-white leading-none">{formatPrice(myBookings.filter(b => b.status === 'CONFIRMED').reduce((acc, curr) => acc + curr.totalPrice, 0))}</h3>
             </div>
             <div className="p-2 md:p-4 rounded-xl md:rounded-2xl bg-[#F5A623]/10"><Star className="h-4 w-4 md:h-6 md:w-6 text-[#F5A623]" /></div>
          </Card>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Service List</h2>
              <Button size="sm" onClick={handleAddService} className="h-9 bg-[#F5A623] text-black font-black uppercase tracking-widest gap-2 shadow-lg shadow-[#F5A623]/20">
                <Plus className="h-4 w-4" /> New Service
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {myServices.map(service => (
                <Card key={service.id} className="p-4 border-[#334155] bg-[#1e293b] hover:border-[#F5A623]/30 transition-all group overflow-hidden">
                  <div className="flex flex-col sm:flex-row lg:flex-row gap-4">
                     <div className="h-32 sm:h-20 w-full sm:w-24 rounded-lg overflow-hidden shrink-0 relative">
                       <img src={service.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       <div className="absolute top-1 right-1">
                         <span className={cn(
                           "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                           service.status === 'approved' ? "bg-green-500 text-white border-green-400" : 
                           service.status === 'rejected' ? "bg-red-500 text-white border-red-400" :
                           "bg-amber-500 text-white border-amber-400"
                         )}>
                           {service.status === 'approved' ? 'Live' : service.status === 'rejected' ? 'Rejected' : 'Pending'}
                         </span>
                       </div>
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex flex-col h-full justify-between">
                          <div className="space-y-1">
                            <div className="flex items-start justify-between">
                              <h3 className="font-bold text-white group-hover:text-[#F5A623] transition-colors leading-tight line-clamp-1">{service.name}</h3>
                              <p className="text-[#F5A623] font-black text-sm">{formatPrice(service.price)}</p>
                            </div>
                            {service.status === 'rejected' && service.rejectionReason && (
                              <p className="text-[9px] text-red-500 italic line-clamp-1">"{service.rejectionReason}"</p>
                            )}
                          </div>
                          <div className="flex items-end justify-between mt-2">
                             <p className="text-[10px] text-[#64748b] uppercase tracking-widest font-black truncate max-w-[150px]">{service.category}</p>
                             <div className="flex items-center gap-1">
                               <Button variant="ghost" size="icon" onClick={() => handleEditService(service)} className="h-8 w-8 text-[#94a3b8] hover:text-white hover:bg-white/5" aria-label="Edit"><Edit2 className="h-3.5 w-3.5" /></Button>
                               <Button variant="ghost" size="icon" onClick={() => setServiceToDelete(service.id)} className="h-8 w-8 text-[#94a3b8] hover:text-red-500 hover:bg-red-500/10" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                             </div>
                          </div>
                        </div>
                     </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Performance Overview</h2>
            <Card className="p-8 border-[#334155] bg-[#1e293b] h-[300px] md:h-[400px] flex items-center justify-center text-center rounded-[2rem]">
              <div className="space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-[#F5A623]/10 flex items-center justify-center mx-auto border border-[#F5A623]/20">
                   <Star className="h-10 w-10 text-[#F5A623]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{averageRating}/5 Rating</h3>
                  <p className="text-[#94a3b8] text-sm mt-1 max-w-[200px] mx-auto font-medium">Average across your {myServices.length} activities.</p>
                </div>
                <div className="flex justify-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={cn("h-4 w-4", i <= Math.round(Number(averageRating)) ? "text-[#F5A623] fill-[#F5A623]" : "text-[#334155]")} />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <SEOHead noindex />
      <DashboardLayout title={section === 'overview' ? 'Performance' : section.charAt(0).toUpperCase() + section.slice(1)}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Experience Provider</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage your tours, transfers and activities for Naples visitors.</p>
        </div>

        {section === 'overview' && renderOverview()}
        {section === 'bookings' && renderRequests()}
        {section === 'profile' && renderProfile()}
        {section !== 'overview' && section !== 'bookings' && section !== 'profile' && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Package className="h-10 w-10 text-neutral-600" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{section.toUpperCase()} Module</h2>
             <p className="text-neutral-500 max-w-sm">This professional service management interface is coming soon.</p>
           </div>
        )}

        <ServiceFormModal 
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onSubmit={handleServiceSubmit}
          initialData={editingService}
        />

        {/* Delete Confirmation */}
        <AnimatePresence>
          {serviceToDelete && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setServiceToDelete(null)}
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
                <h3 className="text-xl font-bold text-white text-center mb-2">Delete Service?</h3>
                <p className="text-[#94a3b8] text-center mb-8">
                  This service will be permanently removed from the catalog.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] border-[#334155]"
                    onClick={() => setServiceToDelete(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] border-none"
                    onClick={() => handleDeleteService(serviceToDelete)}
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
    </>
  );
};
