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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHotels } from '../contexts/HotelsContext';
import { toast } from 'sonner';

import { SUPPLIER_CATEGORIES } from '../constants';

const MOCK_SUPPLIERS = [
  {
    id: 'demo-supplier-1',
    name: 'Pulizie Napoli Pro',
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

  const myProperties = allHotels.filter(h => h.ownerId === user?.id);

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
      customerName: user?.name || 'Hotel Owner',
      customerEmail: user?.email || 'owner@example.com',
      customerPhone: '+39333000000',
      ownerId: selectedSupplier.originalProviderId || 'demo-supplier',
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
    <div className="min-h-screen bg-neutral-50 pt-32 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <button 
            onClick={() => navigate('/owner')} 
            className="flex items-center gap-2 group mb-6 transition-all hover:opacity-70"
          >
            <ArrowLeft className="h-4 w-4 text-[#fbbf24] transition-transform group-hover:-translate-x-1" />
            <span className="text-[#1e293b] font-bold text-sm transition-colors group-hover:text-[#fbbf24]">Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-2">Supplier Directory</h1>
          <p className="text-neutral-500">Find local professionals to support your property management in Naples.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="sticky top-20 z-30 bg-neutral-50/80 backdrop-blur-md py-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input 
                placeholder="Search by name or area..." 
                className="pl-12 h-14 rounded-2xl border-none shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:pb-0">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`whitespace-nowrap px-6 h-14 rounded-2xl font-bold transition-all border-2 ${
                  !selectedCategory ? 'bg-[#1e293b] text-white border-[#1e293b]' : 'bg-white text-neutral-500 border-white shadow-sm'
                }`}
              >
                All Services
              </button>
              {SUPPLIER_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap flex items-center gap-2 px-6 h-14 rounded-2xl font-bold transition-all border-2 ${
                    selectedCategory === cat.id ? 'bg-[#1e293b] text-white border-[#1e293b]' : 'bg-white text-neutral-500 border-white shadow-sm'
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
              className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col h-full bg-white rounded-3xl group"
              onClick={() => setSelectedSupplier(supplier)}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#fbbf24]" />
                    <span className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-wider">Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold uppercase">
                    <MapPin className="h-3.5 w-3.5" />
                    {supplier.area}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#1e293b] mb-1 group-hover:text-[#fbbf24] transition-colors">{supplier.name}</h3>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  {SUPPLIER_CATEGORIES.find(c => c.id === supplier.category)?.label || supplier.category}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 pt-0 flex-1">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1e293b]">€{supplier.price}</span>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{supplier.priceUnit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{supplier.rating} rating</span>
                  </div>
                </div>
                <p className="text-neutral-500 text-sm line-clamp-2 mb-6 leading-relaxed">{supplier.bio}</p>
                
                {/* 3-Image Preview Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {supplier.portfolio.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-neutral-100">
                      <img src={img} alt="Portfolio" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer / Contact Bar */}
              <div className="p-4 bg-neutral-50 flex items-center gap-2 border-t border-neutral-100" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 pr-2 border-r border-neutral-200">
                  <a 
                    href={`https://wa.me/${supplier.phone.replace('+', '')}`}
                    target="_blank"
                    className="w-10 flex items-center justify-center h-10 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all shadow-lg shadow-green-500/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                  <a 
                    href={`tel:${supplier.phone}`}
                    className="w-10 flex items-center justify-center h-10 rounded-xl bg-[#1e293b] hover:bg-neutral-800 text-white transition-all shadow-lg shadow-[#1e293b]/10"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                  <a 
                    href={`mailto:supplier@example.com`}
                    className="w-10 flex items-center justify-center h-10 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e293b] transition-all shadow-lg shadow-amber-500/10"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedSupplier(supplier);
                    setIsRequestModalOpen(true);
                  }}
                  className="flex-1 bg-[#1e293b] hover:bg-neutral-800 text-white font-bold h-10 rounded-xl text-xs uppercase tracking-widest"
                >
                  Request Service
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#1e293b]/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-4xl max-h-full overflow-y-auto bg-white rounded-[2rem] shadow-2xl relative"
              >
                <button 
                  onClick={() => setSelectedSupplier(null)}
                  className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left: Info */}
                  <div className="p-8 md:p-12 space-y-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-[#fbbf24]" />
                        <span className="text-xs font-bold text-[#fbbf24] uppercase tracking-[0.2em]">Verified Partner</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">{selectedSupplier.name}</h2>
                      <p className="text-neutral-500 leading-relaxed text-lg">{selectedSupplier.bio}</p>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-neutral-100">
                      <div>
                        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Service Coverage</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedSupplier.coverage.map(area => (
                            <span key={area} className="px-4 py-1.5 bg-neutral-50 rounded-full text-xs font-bold text-[#1e293b] border border-neutral-100">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Working Hours</h4>
                          <p className="text-sm font-bold text-[#1e293b]">{selectedSupplier.workingHours}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Base Area</h4>
                          <p className="text-sm font-bold text-[#1e293b]">{selectedSupplier.area}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => window.open(`https://wa.me/${selectedSupplier.phone.replace('+', '')}`, '_blank')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold h-14 rounded-2xl"
                        >
                          <MessageCircle className="h-5 w-5 mr-2" /> WhatsApp
                        </Button>
                        <Button 
                          onClick={() => window.location.href = `tel:${selectedSupplier.phone}`}
                          className="flex-1 bg-[#1e293b] text-white font-bold h-14 rounded-2xl"
                        >
                          <Phone className="h-5 w-5 mr-2" /> Direct Call
                        </Button>
                      </div>
                      <Button 
                        onClick={() => setIsRequestModalOpen(true)}
                        className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e293b] font-bold h-14 rounded-2xl"
                      >
                        Request Service
                      </Button>
                    </div>
                  </div>

                  {/* Right: Portfolio Grid */}
                  <div className="bg-neutral-50 p-6 md:p-8 lg:p-12">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6 block lg:hidden">Full Portfolio</h4>
                    <div className="grid grid-cols-2 gap-4 h-fit">
                      {selectedSupplier.portfolio.map((img, idx) => (
                        <div key={idx} className={`aspect-square rounded-3xl overflow-hidden bg-white shadow-sm border-2 border-white transition-all hover:border-[#fbbf24] ${idx === 0 ? 'col-span-2' : ''}`}>
                          <img src={img} alt="Work" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
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
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-[#1e293b]/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl relative"
              >
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-[#1e293b]">Request Service</h2>
                      <p className="text-neutral-500">From {selectedSupplier.name}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsRequestModalOpen(false);
                        setSelectedSupplier(null);
                      }}
                      className="h-10 w-10 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleRequestService} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Service Total</label>
                      <div className="h-14 bg-neutral-50 rounded-2xl flex items-center px-4 font-bold text-[#1e293b]">
                        €{selectedSupplier.price} {selectedSupplier.priceUnit}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Select Property</label>
                      <select 
                        required
                        className="w-full h-14 bg-neutral-100 rounded-2xl px-4 font-bold text-[#1e293b] outline-none focus:ring-2 focus:ring-[#fbbf24]"
                        value={selectedPropertyId}
                        onChange={e => setSelectedPropertyId(e.target.value)}
                      >
                        <option value="">Choose a property...</option>
                        {myProperties.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Date Needed</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <Input 
                          type="datetime-local" 
                          required
                          className="pl-12 h-14 rounded-2xl border-none shadow-sm"
                          value={requestDate}
                          onChange={e => setRequestDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Special Requirements / Notes</label>
                      <textarea 
                        className="w-full bg-neutral-100 rounded-2xl p-4 text-[#1e293b] outline-none focus:ring-2 focus:ring-[#fbbf24] placeholder:text-neutral-400"
                        rows={4}
                        placeholder="Any special instructions for the supplier..."
                        value={requestNotes}
                        onChange={e => setRequestNotes(e.target.value)}
                      />
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-2xl bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e293b] font-bold text-lg mt-4">
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
