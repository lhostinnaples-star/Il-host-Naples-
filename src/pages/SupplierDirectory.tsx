import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, MapPin, CheckCircle2, 
  MessageCircle, Phone, Mail, X, 
  Sparkles, Hammer, Camera, Paintbrush, 
  HardHat, Truck, ShieldAlert, ArrowLeft
} from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'cleaning', label: 'Cleaning', icon: Sparkles },
  { id: 'laundry', label: 'Laundry', icon: Truck },
  { id: 'plumber', label: 'Plumber', icon: Hammer },
  { id: 'photographer', label: 'Photographer', icon: Camera },
  { id: 'interior_designer', label: 'Interior Designer', icon: Paintbrush },
  { id: 'furniture', label: 'Furniture', icon: Hammer },
  { id: 'construction', label: 'Construction', icon: HardHat },
  { id: 'sos', label: 'SOS Emergency', icon: ShieldAlert, priority: true }
];

const MOCK_SUPPLIERS = [
  {
    id: '1',
    name: 'Naples Sparkling Clean',
    category: 'cleaning',
    bio: 'Premium cleaning services specialized in luxury holiday homes and B&Bs in the historic center.',
    area: 'Center',
    phone: '+393331234567',
    portfolio: [
      'https://picsum.photos/seed/clean1/400/400',
      'https://picsum.photos/seed/clean2/400/400',
      'https://picsum.photos/seed/clean3/400/400'
    ],
    coverage: ['Center', 'Station', 'Vomero'],
    workingHours: '08:00 - 20:00'
  },
  {
    id: '2',
    name: 'Vesuvius Repairs',
    category: 'plumber',
    bio: 'Professional plumbing and emergency repairs. Available 24/7 for SOS requests.',
    area: 'Vomero',
    phone: '+393339876543',
    portfolio: [
      'https://picsum.photos/seed/plumb1/400/400',
      'https://picsum.photos/seed/plumb2/400/400',
      'https://picsum.photos/seed/plumb3/400/400'
    ],
    coverage: ['Center', 'Vomero', 'Seafront', 'Stadium'],
    workingHours: '24/7'
  },
  {
    id: '3',
    name: 'Neapolis Views Studio',
    category: 'photographer',
    bio: 'Commercial real estate photography helping listers maximize their property potential.',
    area: 'Seafront',
    phone: '+393330001111',
    portfolio: [
      'https://picsum.photos/seed/photo1/400/400',
      'https://picsum.photos/seed/photo2/400/400',
      'https://picsum.photos/seed/photo3/400/400'
    ],
    coverage: ['Center', 'Seafront', 'Islands'],
    workingHours: '09:00 - 18:00'
  }
];

export const SupplierDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<typeof MOCK_SUPPLIERS[0] | null>(null);

  const filteredSuppliers = MOCK_SUPPLIERS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              {CATEGORIES.map(cat => (
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
                  {CATEGORIES.find(c => c.id === supplier.category)?.label}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 pt-0 flex-1">
                <p className="text-neutral-500 text-sm line-clamp-2 mb-6 leading-relaxed">{supplier.bio}</p>
                
                {/* 3-Image Preview Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {supplier.portfolio.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-neutral-100">
                      <img src={img} alt="Portfolio" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer / Contact Bar */}
              <div className="p-4 bg-neutral-50 flex items-center gap-2 border-t border-neutral-100" onClick={e => e.stopPropagation()}>
                <a 
                  href={`https://wa.me/${supplier.phone.replace('+', '')}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all shadow-lg shadow-green-500/10"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
                <a 
                  href={`tel:${supplier.phone}`}
                  className="flex-1 flex items-center justify-center h-12 rounded-xl bg-[#1e293b] hover:bg-neutral-800 text-white transition-all shadow-lg shadow-[#1e293b]/10"
                >
                  <Phone className="h-5 w-5" />
                </a>
                <a 
                  href={`sms:${supplier.phone}`}
                  className="flex-1 flex items-center justify-center h-12 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e293b] transition-all shadow-lg shadow-amber-500/10"
                >
                  <Mail className="h-5 w-5" />
                </a>
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

                    <div className="flex items-center gap-3 pt-4">
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
      </div>
    </div>
  );
};
