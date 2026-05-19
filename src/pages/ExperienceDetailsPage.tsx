
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, Button, Input } from '../components/UI';
import { 
  MapPin, Star, Calendar, CheckCircle2, 
  ArrowLeft, Clock, Share, Heart, Phone, Info,
  Car, Bike, Ship, Palmtree, UserCheck, Utensils, ChefHat, Sparkles, Send, Loader2,
  ChevronRight, X, Users as UsersIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useHotels, Booking } from '../contexts/HotelsContext';
import { SEOHead } from '../components/SEOHead';
import { generateExperienceSchema, generateSlug, generateBreadcrumbSchema } from '../utils/seo';
import { BackButton } from '../components/BackButton';
import { format } from 'date-fns';

export const ExperienceDetailsPage: React.FC = () => {
  const { slugWithId } = useParams();
  const id = slugWithId ? slugWithId.split('-').pop() : null;
  const navigate = useNavigate();
  const { services, refreshHotels, addBooking } = useHotels();
  const { token, user } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [service, setService] = useState<any>(null);
  const [requestDate, setRequestDate] = useState('');
  const [requestTime, setRequestTime] = useState('10:00');
  const [numPeople, setNumPeople] = useState(1);
  const [pickupLocation, setPickupLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  
  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });

  useEffect(() => {
    if (!services.length) {
      refreshHotels();
    }
  }, [services.length, refreshHotels]);

  useEffect(() => {
    if (id && services.length) {
      const found = services.find(s => s.id === id);
      if (found) setService(found);
    }
  }, [id, services]);

  const handleOpenForm = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRequestForm(true);
  };

  const [bookingRef, setBookingRef] = useState('');

  const handleSendRequest = async () => {
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !requestDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setBookingStatus('loading');
    setIsSubmitting(true);

    const reference = 'EXP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setBookingRef(reference);
    const totalPrice = service.price * numPeople;

    const newBooking: Partial<Booking> = {
      id: `book-${Date.now()}`,
      reference,
      bookingType: 'SERVICE',
      itemId: service.id,
      itemName: service.name,
      itemImage: service.imageUrl,
      customerId: user?.id || 'anon',
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      ownerId: service.ownerId || service.providerId || 'admin',
      startDate: requestDate,
      guests: numPeople,
      totalPrice,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      notes,
      time: requestTime,
      meetingPoint: pickupLocation || service.location || 'Naples'
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addBooking(newBooking as any);
      
      console.log('EMAIL TO CUSTOMER:', `Your experience request ${reference} has been sent!`);
      console.log('EMAIL TO PROVIDER:', `New experience request for ${service.name} from ${customerDetails.name}`);

      setBookingStatus('success');
      setShowRequestForm(false);
      toast.success('Request sent successfully!');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
      setBookingStatus('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-[#fbbf24]" />
    </div>
  );

  const slug = generateSlug(service.name);
  const categorySlug = generateSlug(service.serviceType || 'city-tour');
  const canonical = `/experiences/naples/${categorySlug}/${slug}-${service.id}`;
  
  const breadcrumbItems = [
    { name: 'Home', item: '/' },
    { name: 'Experiences', item: '/services' },
    { name: service.serviceType || 'Service', item: `/services?category=${categorySlug}` },
    { name: service.name, item: canonical }
  ];

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-20 relative">
      <BackButton className="fixed top-20 left-4 md:absolute md:top-24 md:left-6 z-40" variant="dark" />
      <SEOHead 
        title={`${service.name} in Naples`}
        description={`Book ${service.name} in Naples. From ${formatPrice(service.price)}. ${service.description || service.shortDescription}.`}
        image={service.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'}
        canonical={canonical}
        schema={[
          generateExperienceSchema(service),
          generateBreadcrumbSchema(breadcrumbItems)
        ]}
      />

      <nav className="mx-auto max-w-7xl px-6 py-4">
        <ol className="flex items-center space-x-2 text-sm text-[#94a3b8]">
          <li><Link to="/" className="hover:text-[#F5A623] transition-colors">Home</Link></li>
          <li>/</li>
          <li><Link to="/services" className="hover:text-[#F5A623] transition-colors">Experiences</Link></li>
          <li>/</li>
          <li><Link to={`/services?category=${categorySlug}`} className="hover:text-[#F5A623] transition-colors">{service.serviceType || 'Service'}</Link></li>
          <li>/</li>
          <li className="text-white truncate max-w-[150px] md:max-w-none">{service.name}</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-neutral-500 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Experiences</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-24 lg:pb-0">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-video w-full rounded-2xl md:rounded-3xl overflow-hidden bg-neutral-100 shadow-xl">
              <img 
                src={service.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} 
                alt={service.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider">
                  {service.serviceType}
                </span>
                <div className="flex items-center gap-1 text-sm font-bold text-neutral-900">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{service.rating || '4.9'}</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] tracking-tight">{service.name}</h1>
              <div className="flex items-center gap-2 text-neutral-500">
                <MapPin className="h-5 w-5" />
                <span>Available in {service.serviceAreas?.join(', ') || 'All Naples'}</span>
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-xl font-bold text-[#0f172a] mb-4">About the Experience</h3>
              <p className="text-neutral-600 leading-relaxed text-lg">
                {service.description || service.shortDescription || 'Experience the authentic charm of Naples with our curated local services.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Clock className="h-6 w-6 text-neutral-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Duration</p>
                  <p className="font-bold text-neutral-900">2-4 Hours</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-neutral-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Instant Approval</p>
                  <p className="font-bold text-neutral-900">Verified Provider</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card - Hidden on Mobile, Fixed Bar instead */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-32 p-8 shadow-2xl border-neutral-100 bg-white rounded-[32px]">
              <div className="mb-8">
                <p className="text-neutral-500 text-sm mb-1 uppercase tracking-widest font-bold">From</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-neutral-900">{formatPrice(service.price)}</span>
                  <span className="text-neutral-500 font-medium">/ person</span>
                </div>
              </div>

              <form onSubmit={handleOpenForm} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Date</label>
                    <Input 
                      type="date"
                      required
                      value={requestDate}
                      onChange={(e) => setRequestDate(e.target.value)}
                      className="rounded-2xl border-neutral-200 focus:border-[#fbbf24] h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Time</label>
                    <Input 
                      type="time"
                      required
                      value={requestTime}
                      onChange={(e) => setRequestTime(e.target.value)}
                      className="rounded-2xl border-neutral-200 focus:border-[#fbbf24] h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Guests</label>
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200">
                    <button 
                      type="button"
                      onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                      className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-neutral-900">{numPeople} People</span>
                    <button 
                      type="button"
                      onClick={() => setNumPeople(numPeople + 1)}
                      className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Pickup Location</label>
                  <Input 
                    placeholder="Hotel Name or Address"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="rounded-2xl border-neutral-200 focus:border-[#fbbf24] h-12"
                  />
                </div>

                <Button 
                  className="w-full h-14 bg-[#0f172a] text-white hover:bg-neutral-800 rounded-2xl font-bold text-lg group"
                  type="submit"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    <span>Request to Book</span>
                  </div>
                </Button>
                <p className="text-[10px] text-center text-neutral-400 font-medium px-4">
                  Requesting doesn't charge your card. No payment required now.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-100 bg-white p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total Price</p>
            <p className="text-xl font-extrabold text-neutral-900">{formatPrice(service.price * numPeople)}</p>
          </div>
          <Button 
            onClick={() => setShowRequestForm(true)}
            className="h-12 flex-1 rounded-xl bg-[#0f172a] text-sm font-black uppercase tracking-widest text-white"
          >
            Request to Book
          </Button>
        </div>
      </div>

      {/* Booking Request Form Modal */}
      <AnimatePresence>
        {showRequestForm && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm md:p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-[3rem] bg-white p-6 md:p-12 shadow-2xl overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-[#0f172a]">Complete Request</h2>
                <button onClick={() => setShowRequestForm(false)} className="rounded-full bg-neutral-100 p-2 hover:bg-neutral-200 transition-colors">
                  <X className="h-6 w-6 text-neutral-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
                {/* Left: Form */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Your Name</label>
                      <Input 
                        value={customerDetails.name} 
                        onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                        placeholder="John Doe"
                        className="h-14 border-neutral-200 rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Phone Number</label>
                      <Input 
                        value={customerDetails.phone} 
                        onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                        placeholder="+39 ..."
                        className="h-14 border-neutral-200 rounded-2xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Email Address</label>
                    <Input 
                      type="email"
                      value={customerDetails.email} 
                      onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                      placeholder="email@example.com"
                      className="h-14 border-neutral-200 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Additional Notes</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific requests or info?"
                      className="w-full h-32 rounded-2xl border border-neutral-200 p-4 text-sm outline-none focus:border-[#fbbf24] transition-all"
                    />
                  </div>
                </div>

                {/* Right: Summary */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="rounded-[2rem] bg-neutral-50 p-8 space-y-6">
                    <h3 className="text-xl font-black text-[#0f172a]">Summary</h3>
                    <div className="flex gap-4">
                      <img src={service.imageUrl} className="h-20 w-20 rounded-2xl object-cover" />
                      <div>
                        <p className="font-bold text-[#0f172a]">{service.name}</p>
                        <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">{service.serviceType}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-neutral-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-neutral-500">Date & Time</span>
                        <span className="text-sm font-black text-[#0f172a]">{requestDate} @ {requestTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-neutral-500">People</span>
                        <span className="text-sm font-black text-[#0f172a]">{numPeople} People</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                        <span className="font-black text-[#0f172a] uppercase tracking-widest text-xs">Total Estimated</span>
                        <span className="font-black text-2xl text-[#fbbf24]">
                          {formatPrice(service.price * numPeople)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSendRequest}
                    disabled={isSubmitting}
                    className="w-full h-16 bg-[#fbbf24] text-[#0f172a] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-[#0f172a] hover:text-white transition-all shadow-xl"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Request Now'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {bookingStatus === 'success' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0f172a]/90 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full h-full md:h-auto md:max-w-sm md:rounded-[3rem] p-8 md:p-12 text-center flex flex-col items-center justify-center shadow-2xl"
            >
              <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-black text-[#0f172a] mb-4">Request Sent!</h2>
              <p className="text-neutral-500 text-sm font-medium mb-6">
                Your request has been received. 
                Reference: <span className="font-bold text-[#fbbf24]">{bookingRef}</span>
              </p>
              
              <div className="w-full space-y-4">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full h-14 bg-[#0f172a] text-white font-black uppercase tracking-widest rounded-2xl"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full h-14 border-neutral-200 text-neutral-600 font-bold rounded-2xl"
                >
                  Back to Home
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
