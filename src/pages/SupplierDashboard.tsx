import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useHotels } from '../contexts/HotelsContext';
import { Card, Button, Input } from '../components/UI';
import { 
  Wrench, Calendar, BarChart3, User, Plus,
  Edit2, Trash2, CheckCircle2, Search, Filter,
  ChevronRight, Package, LayoutGrid, Briefcase, AlertCircle,
  Mail, Phone, Image as ImageIcon, Building2, Globe, FileText, Check
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { SupplierServiceFormModal } from '../components/SupplierServiceFormModal';
import { Checkbox, Textarea } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { ImageUpload } from '../components/ImageUpload';
import { UserStatus } from '../contexts/AuthContext';
import { PendingApprovalScreen } from '../components/PendingApprovalScreen';
import { SEOHead } from '../components/SEOHead';

import { SUPPLIER_CATEGORIES } from '../constants';

export const SupplierDashboard: React.FC = () => {
  const { user, isDemoMode, updateUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { allHotels, allServices, addService, updateService, deleteService, bookings } = useHotels();

  if (user?.status === UserStatus.PENDING_APPROVAL || user?.status === UserStatus.REJECTED) {
    return <PendingApprovalScreen status={user.status} rejectionReason={user.rejectionReason} />;
  }

  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';
  
  const myServices = allServices.filter(s => s.providerId === user?.id || (isDemoMode && s.serviceType === 'B2B'));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
    photoUrl: user?.roleDetails?.photoUrl || '',
    companyName: user?.roleDetails?.companyName || '',
    vatNumber: user?.roleDetails?.vatNumber || '',
    description: user?.roleDetails?.description || '',
    categories: user?.roleDetails?.categories || [] as string[],
    areas: user?.roleDetails?.areas || [] as string[],
    whatsapp: user?.roleDetails?.whatsapp || false,
    website: user?.roleDetails?.website || '',
    licenseUrl: user?.roleDetails?.licenseUrl || '',
    insuranceUrl: user?.roleDetails?.insuranceUrl || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Validate required fields
      if (!profileForm.phone || !profileForm.companyName) {
        toast.error('Please fill in all required fields (Phone and Company Name)');
        setIsSaving(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim();
      updateUser({
        name: fullName || user?.name || '',
        phone: profileForm.phone,
        roleDetails: {
          ...user?.roleDetails,
          ...profileForm
        }
      });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setProfileForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const toggleArea = (area: string) => {
    setProfileForm(prev => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter(a => a !== area)
        : [...prev.areas, area]
    }));
  };

  const SUPPLIER_CATEGORY_OPTIONS = [
    'Cleaning & Housekeeping',
    'Linen & Towels',
    'Welcome Kits',
    'Furniture & Decor',
    'Maintenance & Repairs',
    'Laundry Service',
    'Other'
  ];

  const SERVICE_AREAS = [
    'Center, Seafront, Vomero',
    'Station, Stadium, Islands',
    'Mergellina, Pozzuoli'
  ];

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
                placeholder="John" 
                className="bg-black/20 border-white/5 text-white placeholder:text-white/20 h-14 rounded-2xl focus:border-[#F5A623]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Last Name</label>
              <Input 
                value={profileForm.lastName}
                onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                placeholder="Doe" 
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
                    storagePath="profiles/suppliers"
                    initialImages={profileForm.photoUrl ? [profileForm.photoUrl] : []}
                    onImagesChange={(imgs) => {
                      setProfileForm({ ...profileForm, photoUrl: imgs[0] || '' });
                      console.log("Image ready for Firebase Storage");
                    }}
                  />
                  <p className="text-[10px] text-[#64748b] font-medium mt-2">External image for your profile avatar.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Business info */}
        <Card className="p-8 bg-[#1e293b] border border-[#334155] rounded-[2rem]">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-[#F5A623]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Business Information</h2>
              <p className="text-[#94a3b8] text-sm font-medium">How other partners see your company</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Company Name *</label>
              <Input 
                required
                value={profileForm.companyName}
                onChange={e => setProfileForm({ ...profileForm, companyName: e.target.value })}
                placeholder="Pulizie Excellence Srl" 
                className="bg-black/20 border-white/5 text-white placeholder:text-white/20 h-14 rounded-2xl focus:border-[#F5A623]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">VAT Number (P. IVA)</label>
              <Input 
                value={profileForm.vatNumber}
                onChange={e => setProfileForm({ ...profileForm, vatNumber: e.target.value })}
                placeholder="IT12345678901" 
                className="bg-black/20 border-white/5 text-white placeholder:text-white/20 h-14 rounded-2xl focus:border-[#F5A623]"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Business Description</label>
              <Textarea 
                value={profileForm.description}
                onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                placeholder="Tell us about your services and experience..." 
                className="bg-black/20 border-white/5 text-white placeholder:text-white/20 rounded-2xl focus:border-[#F5A623]"
              />
            </div>
            
            {/* Service Categories */}
            <div className="md:col-span-2 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Service Categories</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUPPLIER_CATEGORY_OPTIONS.map(cat => (
                  <Checkbox 
                    key={cat}
                    label={cat}
                    checked={profileForm.categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Service Areas</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SERVICE_AREAS.map(area => (
                  <Checkbox 
                    key={area}
                    label={area}
                    checked={profileForm.areas.includes(area)}
                    onChange={() => toggleArea(area)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <Checkbox 
                label="WhatsApp (Same as phone)"
                checked={profileForm.whatsapp}
                onChange={e => setProfileForm({ ...profileForm, whatsapp: e.target.checked })}
              />
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                <Input 
                  value={profileForm.website}
                  onChange={e => setProfileForm({ ...profileForm, website: e.target.value })}
                  placeholder="https://www.yourcompany.com" 
                  className="bg-black/20 border-white/5 text-white placeholder:text-white/20 h-14 rounded-2xl pl-12 focus:border-[#F5A623]"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Documents */}
        <Card className="p-8 bg-[#1e293b] border border-[#334155] rounded-[2rem]">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#F5A623]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Documents</h2>
              <p className="text-[#94a3b8] text-sm font-medium">Compliance and legal verification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Business License URL</label>
              <Input 
                value={profileForm.licenseUrl}
                onChange={e => setProfileForm({ ...profileForm, licenseUrl: e.target.value })}
                placeholder="https://cloud.storage/license.pdf" 
                className="bg-black/20 border-white/5 text-white placeholder:text-white/20 h-14 rounded-2xl focus:border-[#F5A623]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Insurance URL (Optional)</label>
              <Input 
                value={profileForm.insuranceUrl}
                onChange={e => setProfileForm({ ...profileForm, insuranceUrl: e.target.value })}
                placeholder="https://cloud.storage/insurance.pdf" 
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

  // Use allBookings to count active orders for my services
  const myActiveOrders = bookings.filter(b => 
    b.status === 'PENDING' && 
    myServices.some(s => s.id === b.itemId)
  ).length;

  const handleAddService = () => {
    if (isDemoMode) {
      setEditingService({
        name: 'Premium Cleaning Naples',
        category: SUPPLIER_CATEGORIES[0].id,
        price: 80,
        priceUnit: 'per session',
        isDemoDummy: true
      });
    } else {
      setEditingService(null);
    }
    setIsModalOpen(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleServiceSubmit = (data: any) => {
    if (editingService?.isDemoDummy) {
      toast.success('B2B service published to catalog');
      setIsModalOpen(false);
      return;
    }
    if (editingService) {
      updateService(editingService.id, data);
      toast.success('B2B service updated');
    } else {
      const newService = {
        ...data,
        id: `supply-${Date.now()}`,
        providerId: user?.id,
        status: 'approved' as const,
        serviceType: 'B2B',
        rating: 5
      };
      addService(newService);
      toast.success('B2B service published to catalog');
    }
    setIsModalOpen(false);
  };

  const handleDeleteService = (id: string) => {
    deleteService(id);
    toast.success('B2B service removed');
    setServiceToDelete(null);
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="p-4 md:p-6 bg-[#1e293b] border border-[#334155] flex items-center justify-between hover:border-[#F5A623]/30 transition-all cursor-pointer">
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">My Catalog</p>
                 <h3 className="text-2xl md:text-3xl font-bold text-white leading-none">{myServices.length}</h3>
               </div>
               <div className="p-2 md:p-3 rounded-xl bg-[#F5A623]/10"><Wrench className="h-4 w-4 md:h-6 md:w-6 text-[#F5A623]" /></div>
            </div>
        <Card className="p-4 md:p-6 bg-[#1e293b] border border-[#334155] flex items-center justify-between hover:border-[#F5A623]/30 transition-all cursor-pointer">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Active Orders</p>
             <h3 className="text-2xl md:text-3xl font-bold text-white leading-none">{myActiveOrders}</h3>
           </div>
           <div className="p-2 md:p-3 rounded-xl bg-blue-500/10"><Calendar className="h-4 w-4 md:h-6 md:w-6 text-blue-500" /></div>
        </Card>
        <Card className="p-4 md:p-6 bg-[#1e293b] border border-[#334155] flex items-center justify-between hover:border-[#F5A623]/30 transition-all cursor-pointer col-span-2 md:col-span-1">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Lister Connections</p>
             <h3 className="text-2xl md:text-3xl font-bold text-white leading-none">{Math.max(14, myServices.length * 3)}</h3>
           </div>
           <div className="p-2 md:p-3 rounded-xl bg-purple-500/10"><Briefcase className="h-4 w-4 md:h-6 md:w-6 text-purple-500" /></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Service Catalog</h2>
            <Button size="sm" onClick={handleAddService} className="h-9 bg-[#F5A623] text-black font-black uppercase tracking-widest gap-2 shadow-lg shadow-[#F5A623]/20">
              <Plus className="h-4 w-4" /> Add Service
            </Button>
          </div>
          <div className="space-y-4">
            {myServices.map(service => (
              <Card key={service.id} className="p-4 border-[#334155] bg-[#1e293b] hover:border-[#F5A623]/30 transition-all group">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
            <div className="p-3 bg-[#0f172a] rounded-xl text-[#94a3b8] group-hover:text-[#F5A623] transition-colors relative">
              <Wrench className="h-5 w-5" />
              <div className="absolute -top-1 -right-1">
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border",
                  service.status === 'approved' ? "bg-green-500 text-white border-green-400" : 
                  service.status === 'rejected' ? "bg-red-500 text-white border-red-400" :
                  "bg-amber-500 text-white border-amber-400"
                )}>
                   {service.status === 'approved' ? 'L' : service.status === 'rejected' ? 'R' : 'P'}
                </span>
              </div>
            </div>
                      <div>
                        <h3 className="font-bold text-white leading-tight">{service.name}</h3>
                        <p className="text-[10px] font-black uppercase text-[#94a3b8] tracking-tighter mt-0.5">{SUPPLIER_CATEGORIES.find(c => c.id === service.category)?.label || service.category}</p>
                        {service.status === 'rejected' && service.rejectionReason && (
                          <p className="text-[8px] text-red-500 italic mt-0.5 max-w-[200px] truncate">"{service.rejectionReason}"</p>
                        )}
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-[#F5A623]">{formatPrice(service.price)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#94a3b8] hover:text-white"><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#94a3b8] hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                   </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Recent Orders</h2>
          <div className="space-y-4">
            <Card className="p-4 border-[#334155] bg-[#1e293b] space-y-4">
                <div className="flex justify-between items-start">
                   <div>
                     <p className="text-sm font-bold text-white">Full Linen Refresh</p>
                     <p className="text-[10px] text-[#64748b] uppercase tracking-widest mt-1">Order #8821</p>
                   </div>
                   <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full uppercase">New</span>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-[#334155]">
                   <div className="h-8 w-8 rounded-lg bg-[#0f172a] flex items-center justify-center font-bold text-xs text-[#F5A623]">V</div>
                   <div className="text-xs">
                     <p className="text-white font-medium">Villa Roma</p>
                     <p className="text-[#94a3b8]">Delivery: tomorrow 10:00</p>
                   </div>
                </div>
                <Button className="w-full h-10 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] border-none">Accept Order</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead noindex />
      <DashboardLayout title={section === 'overview' ? 'Supply Center' : section.charAt(0).toUpperCase() + section.slice(1)}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Supplier Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage your B2B services and professional maintenance catalog.</p>
        </div>

        {section === 'overview' && renderOverview()}
        {section === 'profile' && renderProfile()}
        {(section !== 'overview' && section !== 'profile') && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Package className="h-10 w-10 text-neutral-600" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{section.toUpperCase()} Command</h2>
             <p className="text-neutral-500 max-w-sm">Advanced supplier logistics for this module are coming in the next update.</p>
           </div>
        )}

        <SupplierServiceFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
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
                <h3 className="text-xl font-bold text-white text-center mb-2">Delete B2B Service?</h3>
                <p className="text-[#94a3b8] text-center mb-8">
                  This service will be removed from the B2B catalog for Listers.
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
