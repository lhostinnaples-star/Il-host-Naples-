import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, MapPin, CheckCircle2, 
  MessageCircle, Phone, Mail, X, 
  Sparkles, Car, Bike, Ship, Palmtree, 
  UserCheck, Utensils, ChefHat, Star,
  Calendar, Info, ArrowLeft, Send, ChevronRight
} from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { ContactForm } from '../components/ContactForm';
import { useNavigate } from 'react-router-dom';
import { useHotels } from '../contexts/HotelsContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';
import { SERVICE_CATEGORIES } from '../constants';
import { SEOHead } from '../components/SEOHead';

export const ServiceDirectory: React.FC = () => {
  const navigate = useNavigate();
  const { services, allServices, isLoading, refreshHotels } = useHotels();
  const { user, token } = useAuth();
  const { formatPrice } = useCurrency();
  
  console.log('Services count:', allServices.length)
  console.log('B2C approved:', allServices.filter(
    s => s.serviceType === 'B2C' && 
    s.status === 'approved'
  ).length)

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [requestDetails, setRequestDetails] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    refreshHotels();
  }, [refreshHotels]);

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    const matchesSubCategory = !selectedSubCategory || s.subCategory === selectedSubCategory;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  const handleCategoryChange = (catId: string | null) => {
    setSelectedCategory(catId);
    setSelectedSubCategory(null);
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to request services');
      navigate('/login');
      return;
    }

    if (!requestDate) {
      toast.error('Please select a date');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/services/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          details: requestDetails,
          date: requestDate
        })
      });

      if (res.ok) {
        toast.success('Service request sent! The provider will contact you soon.');
        setSelectedService(null);
        setRequestDetails('');
        setRequestDate('');
      } else {
        toast.error('Failed to send request');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Naples Experiences & Services" 
        description="Book authentic Naples experiences - boat tours, private chef, car rental and more."
      />
      <div className="min-h-screen bg-neutral-50 pt-32 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 group mb-6 transition-all hover:opacity-70"
          >
            <ArrowLeft className="h-4 w-4 text-[#fbbf24] transition-transform group-hover:-translate-x-1" />
            <span className="text-[#1e293b] font-bold text-sm transition-colors group-hover:text-[#fbbf24]">Back to Home</span>
          </button>
          <h1 className="text-3xl md:text-5xl font-bold text-[#1e293b] mb-4">Naples Experiences</h1>
          <p className="text-neutral-500 text-lg">Book premium transport, tours, and culinary experiences curated for you.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="sticky top-20 z-30 bg-neutral-50/80 backdrop-blur-md py-6 mb-12">
          <div className="flex flex-col gap-6">
            <div className="relative w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input 
                placeholder="What are you looking for? (e.g. boat tour, taxi, chef)" 
                className="pl-14 h-16 rounded-[2rem] border-none shadow-xl shadow-neutral-200/50 text-base md:text-lg"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`whitespace-nowrap px-8 h-12 rounded-[2rem] font-bold transition-all border-2 text-sm ${
                    !selectedCategory ? 'bg-[#1e293b] text-white border-[#1e293b] shadow-xl shadow-[#1e293b]/20' : 'bg-white text-neutral-500 border-white shadow-sm'
                  }`}
                >
                  All Experiences
                </button>
                {SERVICE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`whitespace-nowrap flex items-center gap-3 px-8 h-12 rounded-[2rem] font-bold transition-all border-2 text-sm ${
                      selectedCategory === cat.id ? 'bg-[#1e293b] text-white border-[#1e293b] shadow-xl shadow-[#1e293b]/20' : 'bg-white text-neutral-400 border-white shadow-sm hover:text-[#1e293b]'
                    }`}
                  >
                    <cat.icon className={`h-4 w-4 ${selectedCategory === cat.id ? 'text-[#fbbf24]' : 'text-neutral-400'}`} />
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Subcategories */}
              <AnimatePresence mode="wait">
                {selectedCategory && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-2 flex-wrap pt-2"
                  >
                    <button
                      onClick={() => setSelectedSubCategory(null)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                        !selectedSubCategory ? 'bg-[#fbbf24] text-[#1e293b] border-[#fbbf24]' : 'bg-neutral-100 text-neutral-400 border-transparent hover:bg-neutral-200'
                      }`}
                    >
                      All Types
                    </button>
                    {SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.subCategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubCategory(sub.label)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          selectedSubCategory === sub.label ? 'bg-[#1e293b] text-white border-[#1e293b]' : 'bg-white text-neutral-400 border-neutral-100 hover:border-[#fbbf24] hover:text-[#fbbf24]'
                        }`}
                      >
                        <sub.icon className="h-3.5 w-3.5" />
                        {sub.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map(service => (
            <Card 
              key={service.id} 
              className="overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all cursor-pointer flex flex-col h-full bg-white rounded-[2.5rem] group"
              onClick={() => setSelectedService(service)}
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={service.imageUrl || `https://picsum.photos/seed/${service.id}/600/450`} 
                  alt={service.name} 
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute top-6 right-6">
                  <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-[#fbbf24] fill-[#fbbf24]" />
                    <span className="text-sm font-bold text-[#1e293b]">5.0</span>
                  </div>
                </div>
                <div className="absolute bottom-6 left-6">
                   <div className="bg-[#1e293b]/80 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest">
                     {service.subCategory.replace('_', ' ')}
                   </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-[#1e293b] leading-tight group-hover:text-[#fbbf24] transition-colors">{service.name}</h3>
                </div>
                <p className="text-neutral-500 text-sm line-clamp-2 mb-8 leading-relaxed flex-1">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
                  <div>
                    <p className="text-xl font-bold text-[#1e293b]">Starting from {formatPrice(service.price)} <span className="text-sm text-neutral-400 font-medium">/{service.priceUnit}</span></p>
                  </div>
                  <Button className="rounded-2xl bg-neutral-100 text-[#1e293b] hover:bg-[#fbbf24] font-bold px-6 border-none transition-all group-hover:shadow-lg group-hover:shadow-[#fbbf24]/20">
                    Request to Book
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && !isLoading && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-neutral-100">
            <Sparkles className="h-16 w-16 mx-auto text-neutral-100 mb-6" />
            <h3 className="text-2xl font-bold text-[#1e293b] mb-2">No experiences found</h3>
            <p className="text-neutral-400">Try searching for something else or browse different categories.</p>
          </div>
        )}

        {/* Service Request Modal */}
        <AnimatePresence>
          {selectedService && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedService(null)}
                className="absolute inset-0 bg-[#1e293b]/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] shadow-2xl relative z-10"
              >
                <button 
                  onClick={() => setSelectedService(null)}
                  className="absolute top-8 right-8 h-12 w-12 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors z-20"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left: Product Info */}
                  <div className="h-64 lg:h-auto relative overflow-hidden">
                    <img 
                      src={selectedService.imageUrl || `https://picsum.photos/seed/${selectedService.id}/800/800`} 
                      className="h-full w-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-10">
                       <p className="text-[#fbbf24] font-bold text-sm uppercase tracking-widest mb-2">{selectedService.category}</p>
                       <h2 className="text-3xl md:text-4xl font-bold text-white">{selectedService.name}</h2>
                    </div>
                  </div>

                  {/* Right: Request Form */}
                  <div className="p-10 md:p-14 space-y-10">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Experience Details</h4>
                      <p className="text-neutral-600 leading-relaxed">{selectedService.description}</p>
                      <div className="mt-8 flex items-center justify-between p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
                        <div>
                           <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Price</p>
                           <p className="text-2xl font-bold text-[#1e293b]">{formatPrice(selectedService.price)}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Unit</p>
                           <p className="text-lg font-bold text-[#1e293b]">{selectedService.priceUnit}</p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleRequest} className="space-y-6 pt-10 border-t border-neutral-100">
                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Preferred Date</label>
                        <div className="relative">
                           <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                           <Input 
                             type="date"
                             value={requestDate}
                             onChange={e => setRequestDate(e.target.value)}
                             className="h-14 rounded-2xl pl-12 border-neutral-100 bg-neutral-50 focus:bg-white transition-colors"
                             required
                           />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Special Requests / Requirements</label>
                        <textarea 
                          value={requestDetails}
                          onChange={e => setRequestDetails(e.target.value)}
                          placeholder="Tell us about number of people, specific needs..."
                          className="w-full min-h-[120px] rounded-2xl border border-neutral-100 bg-neutral-50 p-6 text-sm font-medium outline-none focus:border-[#fbbf24] focus:bg-white transition-all resize-none"
                        />
                      </div>

                      <Button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-16 rounded-[2rem] bg-[#fbbf24] text-[#1e293b] hover:bg-[#1e293b] hover:text-white transition-all text-xl font-bold shadow-xl shadow-amber-200/20"
                      >
                        {isSubmitting ? 'Sending Request...' : 'Send Booking Request'}
                        {!isSubmitting && <Send className="ml-2 h-5 w-5" />}
                      </Button>
                      <p className="text-center text-xs text-neutral-400">
                        The service provider will receive your request and contact you via email to finalize the booking.
                      </p>
                    </form>

                    <ContactForm entityId={selectedService.id} entityName={selectedService.name} entityType="service" />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
};
