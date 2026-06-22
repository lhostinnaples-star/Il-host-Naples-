import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, MapPin, CheckCircle2, 
  MessageCircle, Phone, Mail, X, 
  Sparkles, Hammer, Camera, Paintbrush, 
  HardHat, Truck, ShieldAlert, ArrowLeft,
  Calendar, Building2
} from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { ContactForm } from '../components/ContactForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHotels } from '../contexts/HotelsContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';

import { SUPPLIER_CATEGORIES } from '../constants';

const MOCK_SUPPLIERS = [
  {
    id: 'demo-supplier-1',
    name: 'Pulizie Napoli Pro',
    companyName: 'Pulizie Napoli Srl',
    email: 'info@pulizienapoli.it',
    category: 'cleaning',
    bio: 'Premium cleaning services specialized in luxury holiday homes and B&Bs in the historic center.',
    area: 'All Naples',
    phone: '+393331234567',
    price: 80,
    priceUnit: 'per session',
    rating: 4.9,
    portfolio: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400'
    ],
    coverage: ['All Naples'],
    workingHours: '08:00 - 20:00',
    originalProviderId: 'demo-supplier'
  },
  {
    id: 'demo-supplier-2',
    name: 'Biancheria Luxury',
    companyName: 'Biancheria Luxury SRL',
    email: 'contact@biancherialuxury.com',
    category: 'linen',
    bio: 'High-quality bed linen and towel rental with delivery service.',
    area: 'Centro Storico, Chiaia',
    phone: '+393339876543',
    price: 30,
    priceUnit: 'per set',
    rating: 4.8,
    portfolio: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400',
      'https://images.unsplash.com/photo-1615800059530-97424ad4f620?w=400',
      'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=400'
    ],
    coverage: ['Centro Storico', 'Chiaia'],
    workingHours: '09:00 - 18:00',
    originalProviderId: 'demo-supplier'
  },
  {
    id: 'demo-supplier-3',
    name: 'Welcome Naples Kits',
    companyName: 'Welcome Naples SRL',
    email: 'hello@welcomenapleskits.it',
    category: 'welcome_kits',
    bio: 'Curated welcome kits for your guests featuring local products.',
    area: 'All Naples',
    phone: '+393330001111',
    price: 40,
    priceUnit: 'per kit',
    rating: 5.0,
    portfolio: [
      'https://images.unsplash.com/photo-1542841791-0985223c6d71?w=400',
      'https://images.unsplash.com/photo-1555529902-5261145633bf?w=400',
      'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400'
    ],
    coverage: ['All Naples'],
    workingHours: '09:00 - 18:00',
    originalProviderId: 'demo-supplier'
  },
  {
    id: 'demo-supplier-4',
    name: 'Falegname Napoli',
    companyName: 'Falegnameria Artigiana',
    email: 'info@falegnamenapoli.it',
    category: 'furniture',
    bio: 'Custom furniture and quick repairs for your properties.',
    area: 'Posillipo, Vomero',
    phone: '+393335557777',
    price: 150,
    priceUnit: 'per visit',
    rating: 4.7,
    portfolio: [
      'https://images.unsplash.com/photo-1581539250439-c96689b516f1?w=400',
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400',
      'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400'
    ],
    coverage: ['Posillipo', 'Vomero'],
    workingHours: '08:00 - 19:00',
    originalProviderId: 'demo-supplier'
  }
];

export const SupplierDirectory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { allServices, allHotels, addBooking } = useHotels();
  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const realSuppliers = allServices
    .filter(s => s.serviceType === 'B2B')
    .map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      bio: s.description,
      area: s.location || 'Naples',
      phone: '+393330000000', // Provider phone placeholder
      email: (s as any).email || 'supplier@example.com',
      companyName: (s as any).companyName,
      price: s.price,
      priceUnit: s.priceUnit,
      rating: s.rating || 5.0,
      portfolio: s.imageUrl ? [s.imageUrl] : ['https://images.unsplash.com/photo-1542841791-0985223c6d71?w=400'],
      coverage: [s.location || 'Naples'],
      workingHours: '09:00 - 18:00',
      isReal: true,
      originalProviderId: s.providerId
    }));

  const combinedSuppliers = [...realSuppliers, ...MOCK_SUPPLIERS];

  const [selectedSupplier, setSelectedSupplier] = useState<typeof combinedSuppliers[0] | null>(null);
  
  // Request Service Modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  const myProperties = allHotels.filter(h => h.ownerId === user?.id);

  // Global Request Form State
  const { addGlobalServiceRequest } = useHotels();
  const [globalReqForm, setGlobalReqForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    serviceNeeded: '',
    area: '',
  });
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [isSubmittingGlobalReq, setIsSubmittingGlobalReq] = useState(false);

  const handleGlobalRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalReqForm.name || !globalReqForm.phone || !globalReqForm.serviceNeeded || !globalReqForm.area) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmittingGlobalReq(true);
    setTimeout(() => {
      console.log('📧 EMAIL TO ALL SUPPLIERS:\nNew service request!\nFrom:', globalReqForm.name, '\nService needed:', globalReqForm.serviceNeeded, '\nArea:', globalReqForm.area, '\nPhone:', globalReqForm.phone, '\nWhatsApp:', sameAsPhone ? globalReqForm.phone : globalReqForm.whatsapp);
      
      addGlobalServiceRequest({
        id: `greq-${Date.now()}`,
        userId: user?.id || 'unknown',
        userName: globalReqForm.name,
        phone: globalReqForm.phone,
        whatsapp: sameAsPhone ? globalReqForm.phone : globalReqForm.whatsapp,
        serviceNeeded: globalReqForm.serviceNeeded,
        area: globalReqForm.area,
        submittedAt: new Date().toISOString()
      });

      toast.success('✅ Request sent! All suppliers have been notified.');
      setIsSubmittingGlobalReq(false);
      setGlobalReqForm({ name: '', phone: '', whatsapp: '', serviceNeeded: '', area: '' });
      setSameAsPhone(false);
    }, 1500);
  };

  const filteredSuppliers = combinedSuppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRequestService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !selectedPropertyId || !requestDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const prop = myProperties.find(p => p.id === selectedPropertyId);
    
    addBooking({
      id: `req-${Date.now()}`,
      reference: `REQ-${Math.floor(Math.random() * 10000)}`,
      bookingType: 'SERVICE',
      itemId: selectedSupplier.id,
      itemName: selectedSupplier.name,
      itemImage: selectedSupplier.portfolio[0],
      customerId: user?.id || 'demo-owner',
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      guestEmail: customerEmail || '',
      listerEmail: selectedSupplier.email || (selectedSupplier as any).ownerEmail || '',
      ownerId: (selectedSupplier as any).ownerId || (selectedSupplier as any).providerId || selectedSupplier.originalProviderId || '',
      startDate: new Date(requestDate).toISOString(),
      guests: 1,
      totalPrice: selectedSupplier.price,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      notes: `For property: ${prop?.name || 'Local Property'}\n\n${requestNotes}`
    });

    console.log('SUPPLIER PORTAL:', `Order sent to ${selectedSupplier.name} for ${requestDate}`);
    toast.success('Service request sent to supplier!');
    setIsRequestModalOpen(false);
    setSelectedPropertyId('');
    setRequestDate('');
    setRequestNotes('');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] pt-32 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <button 
            onClick={() => navigate('/owner')} 
            className="flex items-center gap-2 group mb-6 transition-all hover:opacity-70"
          >
            <ArrowLeft className="h-4 w-4 text-[#F5A623] transition-transform group-hover:-translate-x-1" />
            <span className="text-white font-bold text-sm transition-colors group-hover:text-[#F5A623]">Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Supplier Directory</h1>
          <p className="text-[#94a3b8]">Find local professionals to support your property management in Naples.</p>
        </div>

        {/* Global Request Form */}
        {((user?.role === 'hotel_owner' && user?.status === 'active') || user?.role === 'admin') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-[800px] mx-auto"
          >
            {user?.supplierAccess === 'approved' || user?.role === 'admin' ? (
              <Card className="bg-[#1e293b] border-[#334155] rounded-2xl p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#F5A623] mb-2">Request a Service</h2>
                  <p className="text-[#94a3b8]">Tell us what you need and all suppliers will be notified</p>
                </div>
                
                <form onSubmit={handleGlobalRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Full Name *</label>
                      <Input
                        required
                        value={globalReqForm.name}
                        onChange={(e) => setGlobalReqForm({ ...globalReqForm, name: e.target.value })}
                        placeholder="Your name"
                        className="bg-[#0f172a] border-[#334155] text-white placeholder:text-[#64748b] focus:border-[#F5A623] h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Phone Number *</label>
                      <Input
                        required
                        value={globalReqForm.phone}
                        onChange={(e) => setGlobalReqForm({ ...globalReqForm, phone: e.target.value })}
                        placeholder="+39 081 000 0000"
                        className="bg-[#0f172a] border-[#334155] text-white placeholder:text-[#64748b] focus:border-[#F5A623] h-12 rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">WhatsApp Number (Optional)</label>
                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="checkbox"
                          id="sameAsPhone"
                          checked={sameAsPhone}
                          onChange={(e) => setSameAsPhone(e.target.checked)}
                          className="rounded bg-[#0f172a] border-[#334155] text-[#F5A623] focus:ring-[#F5A623]"
                        />
                        <label htmlFor="sameAsPhone" className="text-xs text-[#94a3b8] cursor-pointer">Same as phone number</label>
                      </div>
                      {!sameAsPhone && (
                        <Input
                          value={globalReqForm.whatsapp}
                          onChange={(e) => setGlobalReqForm({ ...globalReqForm, whatsapp: e.target.value })}
                          placeholder="+39 081 000 0000"
                          className="bg-[#0f172a] border-[#334155] text-white placeholder:text-[#64748b] focus:border-[#F5A623] h-12 rounded-xl"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Service Needed *</label>
                      <textarea
                        required
                        value={globalReqForm.serviceNeeded}
                        onChange={(e) => setGlobalReqForm({ ...globalReqForm, serviceNeeded: e.target.value })}
                        placeholder="Describe what service you need e.g. Weekly cleaning for 2 bedroom apartment..."
                        rows={4}
                        className="w-full bg-[#0f172a] border border-[#334155] text-white placeholder-[#64748b] focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] rounded-xl p-3 resize-none outline-none transition-all"
                      />
                    </div>
                    
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-1">Area in Naples *</label>
                      <Input
                        required
                        value={globalReqForm.area}
                        onChange={(e) => setGlobalReqForm({ ...globalReqForm, area: e.target.value })}
                        placeholder="e.g. Centro Storico, Posillipo, Vomero..."
                        className="bg-[#0f172a] border-[#334155] text-white placeholder:text-[#64748b] focus:border-[#F5A623] h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={isSubmittingGlobalReq}
                      className="w-full sm:w-auto px-8 h-12 bg-[#F5A623] hover:bg-[#e09400] text-[#0f172a] font-bold rounded-xl flex items-center justify-center"
                    >
                      {isSubmittingGlobalReq ? (
                        <>
                          <div className="h-4 w-4 border-2 border-[#0f172a]/30 border-t-[#0f172a] rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        "Send Request to All Suppliers"
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="bg-[#1e293b] border-[#334155] rounded-2xl p-6 md:p-8 text-center flex flex-col items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-[#F5A623]/10 flex items-center justify-center mb-4">
                  <ShieldAlert className="h-8 w-8 text-[#F5A623]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Request supplier access to use this feature</h2>
                <p className="text-[#94a3b8] max-w-sm mb-6">You need to have approved supplier access to broadcast service requests to all our verified professionals.</p>
                <Button 
                  onClick={() => navigate('/owner?section=suppliers')}
                  className="bg-[#F5A623] hover:bg-[#e09400] text-[#0f172a] font-bold px-8"
                >
                  Request Access
                </Button>
              </Card>
            )}
          </motion.div>
        )}

        {/* Search & Filter Bar */}
        <div className="sticky top-20 z-30 bg-[#0f172a]/80 backdrop-blur-md py-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748b]" />
              <Input 
                placeholder="Search by name or area..." 
                className="pl-12 h-14 rounded-2xl bg-[#1e293b] border-[#334155] text-white focus:border-[#F5A623]"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:pb-0">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`whitespace-nowrap px-6 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border-2 ${
                  !selectedCategory ? 'bg-[#F5A623] text-black border-[#F5A623]' : 'bg-[#1e293b] text-[#94a3b8] border-[#334155] shadow-sm'
                }`}
              >
                All Services
              </button>
              {SUPPLIER_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap flex items-center gap-2 px-6 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border-2 ${
                    selectedCategory === cat.id ? 'bg-[#F5A623] text-black border-[#F5A623]' : 'bg-[#1e293b] text-[#94a3b8] border-[#334155] shadow-sm'
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Supplier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredSuppliers.map(supplier => (
            <Card 
              key={supplier.id} 
              className="overflow-hidden border-[#334155] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col h-full bg-[#1e293b] rounded-[2rem] group"
              onClick={() => setSelectedSupplier(supplier)}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5A623]/10 rounded-full border border-[#F5A623]/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#F5A623]" />
                    <span className="text-[10px] font-black text-[#F5A623] uppercase tracking-wider">Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#94a3b8] text-[10px] font-black uppercase tracking-widest">
                    <MapPin className="h-3.5 w-3.5" />
                    {supplier.area}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#F5A623] transition-colors">{supplier.name}</h3>
                <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest italic">
                  {SUPPLIER_CATEGORIES.find(c => c.id === supplier.category)?.label || supplier.category}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 pt-0 flex-1">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#334155]">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-[#F5A623]">Starting from {formatPrice(supplier.price)}</span>
                    <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest">{supplier.priceUnit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black text-white/40 uppercase tracking-widest">
                    <Sparkles className="h-3.5 w-3.5 text-[#F5A623]" />
                    <span>{supplier.rating} rating</span>
                  </div>
                </div>
                <p className="text-[#94a3b8] text-sm line-clamp-2 mb-6 leading-relaxed italic">"{supplier.bio}"</p>
                
                {/* 3-Image Preview Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {supplier.portfolio.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-[#0f172a] border border-[#334155]">
                      <img src={img} alt="Portfolio" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer / Contact Bar */}
              <div className="p-4 bg-[#0f172a] flex items-center gap-2 border-t border-[#334155]" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col gap-1 pr-2 border-r border-[#334155] flex-1 truncate">
                  <a href={`mailto:${supplier.email}`} className="text-[#F5A623] text-sm truncate block">
                    {supplier.email}
                  </a>
                  <a href={`tel:${supplier.phone}`} className="text-[#F5A623] text-sm truncate block">
                    {supplier.phone}
                  </a>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedSupplier(supplier);
                    setIsRequestModalOpen(true);
                  }}
                  className="flex-1 bg-[#F5A623] text-black hover:bg-white font-black h-10 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-[#F5A623]/10"
                >
                  Book Pro
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-[#1e293b] mb-2">No suppliers found</h3>
            <p className="text-neutral-400">Try adjusting your filters or search term.</p>
          </div>
        )}

        {/* Private Profile Modal */}
        <AnimatePresence>
          {selectedSupplier && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-4xl max-h-full overflow-y-auto bg-[#1e293b] rounded-[2rem] shadow-2xl relative border border-[#334155]"
              >
                <button 
                  onClick={() => setSelectedSupplier(null)}
                  className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-[#0f172a] text-[#94a3b8] hover:text-red-500 transition-colors z-10 border border-[#334155]"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left: Info */}
                  <div className="p-8 md:p-12 space-y-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-[#F5A623]" />
                        <span className="text-xs font-black text-[#F5A623] uppercase tracking-[0.2em]">Verified Partner</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{selectedSupplier.name}</h2>
                      {selectedSupplier.companyName && 
                        <p className="text-[#94a3b8] text-sm mb-4">
                          {selectedSupplier.companyName}
                        </p>
                      }
                      <p className="text-[#94a3b8] leading-relaxed text-lg">{selectedSupplier.bio}</p>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-white/10">
                      <div>
                        <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-3">Service Coverage</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedSupplier.coverage.map(area => (
                            <span key={area} className="px-4 py-1.5 bg-[#0f172a] rounded-full text-xs font-bold text-white border border-[#334155]">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Working Hours</h4>
                          <p className="text-sm font-bold text-white">{selectedSupplier.workingHours}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Base Area</h4>
                          <p className="text-sm font-bold text-white">{selectedSupplier.area}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => window.open(`https://wa.me/${selectedSupplier.phone.replace('+', '')}`, '_blank')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-lg shadow-green-500/10"
                        >
                          <MessageCircle className="h-5 w-5 mr-2" /> WhatsApp
                        </Button>
                        <Button 
                          onClick={() => window.location.href = `tel:${selectedSupplier.phone}`}
                          className="flex-1 bg-white hover:bg-[#F5A623] text-black font-black uppercase tracking-widest h-14 rounded-2xl shadow-lg shadow-white/10"
                        >
                          <Phone className="h-5 w-5 mr-2" /> Direct Call
                        </Button>
                      </div>
                      <Button 
                        onClick={() => setIsRequestModalOpen(true)}
                        className="w-full bg-[#F5A623] hover:bg-white text-black font-black h-14 rounded-2xl shadow-lg shadow-[#F5A623]/20 uppercase tracking-widest h-14"
                      >
                        Request Service
                      </Button>
                      <ContactForm entityId={selectedSupplier.id} entityName={selectedSupplier.name} entityType="supplier" theme="dark" />
                    </div>
                  </div>

                  {/* Right: Portfolio Grid */}
                  <div className="bg-[#0f172a] p-6 md:p-8 lg:p-12">
                    <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-6 block lg:hidden">Full Portfolio</h4>
                    <div className="grid grid-cols-2 gap-4 h-fit">
                      {selectedSupplier.portfolio.map((img, idx) => (
                        <div key={idx} className={`aspect-square rounded-3xl overflow-hidden bg-[#0f172a] shadow-sm border-2 border-[#334155] transition-all hover:border-[#F5A623] ${idx === 0 ? 'col-span-2' : ''}`}>
                          <img src={img} alt="Work" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Request Service Modal */}
        <AnimatePresence>
          {isRequestModalOpen && selectedSupplier && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-[#1e293b] rounded-[2rem] shadow-2xl relative border border-[#334155]"
              >
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Request Service</h2>
                      <p className="text-[#94a3b8]">From {selectedSupplier.name}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsRequestModalOpen(false);
                        setSelectedSupplier(null);
                      }}
                      className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-[#94a3b8] hover:text-red-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleRequestService} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-2">Service Total</label>
                      <div className="h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 font-bold text-[#F5A623]">
                        {formatPrice(selectedSupplier.price)} {selectedSupplier.priceUnit}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-2">Select Property</label>
                      <select 
                        required
                        className="w-full h-14 bg-[#0f172a] rounded-2xl px-4 font-black text-white outline-none focus:ring-2 focus:ring-[#F5A623] border border-[#334155] text-sm"
                        value={selectedPropertyId}
                        onChange={e => setSelectedPropertyId(e.target.value)}
                      >
                        <option value="">Choose a property...</option>
                        {myProperties.map(p => (
                          <option key={p.id} value={p.id} className="bg-[#1e293b]">{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-2">Your Name</label>
                      <Input 
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="pl-4 h-14 rounded-2xl bg-[#0f172a] border-[#334155] text-white focus:border-[#F5A623]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-2">Phone Number</label>
                      <Input 
                        type="tel"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="+39 ..."
                        className="pl-4 h-14 rounded-2xl bg-[#0f172a] border-[#334155] text-white focus:border-[#F5A623]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-2">Email Address</label>
                      <Input 
                        type="email"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        placeholder="owner@example.com"
                        className="pl-4 h-14 rounded-2xl bg-[#0f172a] border-[#334155] text-white focus:border-[#F5A623]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-2">Date Needed</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748b]" />
                        <Input 
                          type="datetime-local" 
                          required
                          className="pl-12 h-14 rounded-2xl bg-[#0f172a] border-[#334155] text-white focus:border-[#F5A623]"
                          value={requestDate}
                          onChange={e => setRequestDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-2">Special Requirements / Notes</label>
                      <textarea 
                        className="w-full bg-[#0f172a] rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-[#F5A623] border border-[#334155] placeholder:text-[#64748b] text-sm"
                        rows={4}
                        placeholder="Any special instructions for the supplier..."
                        value={requestNotes}
                        onChange={e => setRequestNotes(e.target.value)}
                      />
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-2xl bg-[#F5A623] hover:bg-white text-black font-black uppercase tracking-widest text-lg mt-4 shadow-lg shadow-[#F5A623]/10">
                      Submit Request
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
