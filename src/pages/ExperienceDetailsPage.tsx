
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, Button, Input } from '../components/UI';
import { 
  MapPin, Star, Calendar, CheckCircle2, 
  ArrowLeft, Clock, Share, Heart, Phone, Info,
  Car, Bike, Ship, Palmtree, UserCheck, Utensils, ChefHat, Sparkles, Send, Loader2,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useHotels } from '../contexts/HotelsContext';
import { SEOHead } from '../components/SEOHead';
import { generateExperienceSchema, generateSlug, generateBreadcrumbSchema } from '../utils/seo';

export const ExperienceDetailsPage: React.FC = () => {
  const { slugWithId } = useParams();
  const id = slugWithId ? slugWithId.split('-').pop() : null;
  const navigate = useNavigate();
  const { services, refreshHotels } = useHotels();
  const { token, user } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [service, setService] = useState<any>(null);
  const [requestDetails, setRequestDetails] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please login to request a service');
      navigate('/login');
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
          serviceId: service.id,
          details: requestDetails,
          date: requestDate
        })
      });

      if (res.ok) {
        toast.success('Request sent! The provider will contact you soon.');
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
    <div className="min-h-screen bg-white pt-32 pb-20">
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
        <ol className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <li><Link to="/" className="hover:text-black transition-colors">Home</Link></li>
          <li><ChevronRight className="h-3 w-3" /></li>
          <li><Link to="/services" className="hover:text-black transition-colors">Experiences</Link></li>
          <li><ChevronRight className="h-3 w-3" /></li>
          <li><Link to={`/services?category=${categorySlug}`} className="hover:text-black transition-colors">{service.serviceType || 'Service'}</Link></li>
          <li><ChevronRight className="h-3 w-3 text-neutral-300" /></li>
          <li className="text-black truncate max-w-[150px] md:max-w-none">{service.name}</li>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-video w-full rounded-3xl overflow-hidden bg-neutral-100 shadow-xl">
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

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32 p-8 shadow-2xl border-neutral-100 bg-white rounded-[32px]">
              <div className="mb-8">
                <p className="text-neutral-500 text-sm mb-1 uppercase tracking-widest font-bold">From</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-neutral-900">{formatPrice(service.price)}</span>
                  <span className="text-neutral-500 font-medium">/ person</span>
                </div>
              </div>

              <form onSubmit={handleRequest} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Preferred Date</label>
                  <Input 
                    type="date"
                    required
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    className="rounded-2xl border-neutral-200 focus:border-[#fbbf24] h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Special Requirements</label>
                  <textarea 
                    className="w-full rounded-2xl border border-neutral-200 p-4 text-sm outline-none focus:border-[#fbbf24] transition-all"
                    rows={4}
                    placeholder="Tell us about special requests, dietary needs, or group size..."
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full h-14 bg-[#0f172a] text-white hover:bg-neutral-800 rounded-2xl font-bold text-lg group"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (
                    <div className="flex items-center justify-center gap-2">
                      <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      <span>Request Booking</span>
                    </div>
                  )}
                </Button>
                <p className="text-[10px] text-center text-neutral-400 font-medium px-4">
                  Requesting doesn't charge your card yet. The provider will confirm availability and details with you.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
