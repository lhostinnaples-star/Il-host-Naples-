import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, Button } from '../components/UI';
import { Calendar, MapPin, CreditCard, Clock, CheckCircle2, Info, Car, Bike, Ship, Palmtree, UserCheck, Utensils, ChefHat, Sparkles, ShieldCheck, UtensilsCrossed, Star, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const CustomerDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const { formatPrice } = useCurrency();
  const [bookings, setBookings] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!selectedBooking) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hotelId: selectedBooking.Room.Hotel.id,
          rating,
          comment
        })
      });

      if (res.ok) {
        toast.success('Thank you for your review!');
        setShowReviewModal(false);
        setComment('');
        setRating(5);
        // Refresh bookings or mark as reviewed locally if needed
      } else {
        toast.error('Failed to submit review');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const guestServiceCategories = [
    {
      title: 'Transport',
      services: [
        { id: 'rent_car', label: 'Rent a Car', icon: Car },
        { id: 'rent_scooter', label: 'Rent Scooter', icon: Bike },
        { id: 'bike_rental', label: 'Bike Rental', icon: Bike },
        { id: 'taxi_services', label: 'Taxi Services', icon: Car },
        { id: 'ncc_private', label: 'NCC Private', icon: ShieldCheck },
      ]
    },
    {
      title: 'Tours & Leisure',
      services: [
        { id: 'boat_rental', label: 'Boat Rental', icon: Ship },
        { id: 'coastline', label: 'Coastline', icon: Palmtree },
        { id: 'private_tour', label: 'Private Tour', icon: UserCheck },
      ]
    },
    {
      title: 'Food & Lifestyle',
      services: [
        { id: 'restaurant_booking', label: 'Restaurant Table Booking', icon: Utensils },
        { id: 'private_chef', label: 'Private Chef', icon: ChefHat },
        { id: 'cooking_class', label: 'Cooking Class', icon: UtensilsCrossed },
        { id: 'spa_massage', label: 'Spa Massage', icon: Sparkles },
      ]
    }
  ];

  useEffect(() => {
    fetch('/api/bookings/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        console.error('Expected array for bookings, got:', data);
        setBookings([]);
      }
    })
    .catch(err => {
      console.error('Failed to fetch bookings:', err);
      setBookings([]);
    });
  }, [token]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        toast.success('Booking cancelled successfully');
      } else {
        toast.error('Failed to cancel booking');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled' | 'wishlist' | 'profile'>('upcoming');
  
  // Filter bookings based on activeTab
  const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter(b => {
    const isPast = new Date(b.checkOut) < new Date();
    if (activeTab === 'upcoming') return !isPast && b.status !== 'cancelled' && b.status !== 'rejected';
    if (activeTab === 'past') return isPast && b.status !== 'cancelled' && b.status !== 'rejected';
    if (activeTab === 'cancelled') return b.status === 'cancelled' || b.status === 'rejected';
    return false;
  });

  return (
    <div className="min-h-screen bg-neutral-50 pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Welcome, {user?.name || 'Guest'}</h1>
          <p className="text-neutral-500 text-lg mt-2">Manage your inquiries, saved lists, and profile settings</p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 bg-white p-2 rounded-2xl border border-neutral-100 shadow-sm hide-scrollbar">
          {(['upcoming', 'past', 'cancelled', 'wishlist', 'profile'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-[#1e293b] text-white' : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              {tab === 'upcoming' ? 'Upcoming Inquiries' : tab === 'past' ? 'Past Stays' : tab}
            </button>
          ))}
        </div>

        {['upcoming', 'past', 'cancelled'].includes(activeTab) && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-800 flex items-center gap-3">
            <Info className="h-5 w-5 shrink-0" />
            <p>Our system works by inquiry. The host will receive your request and contact you directly via the email you provided.</p>
          </div>
        )}

        {['upcoming', 'past', 'cancelled'].includes(activeTab) && (
          <div className="grid gap-8">
            {filteredBookings.map((booking) => (
            <motion.div key={booking.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="flex flex-col gap-8 md:flex-row md:items-center">
                <div className="h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-neutral-200 md:w-64">
                  <img 
                    src={booking.Room.Hotel.imageUrl || `https://picsum.photos/seed/${booking.Room.Hotel.id}/600/400`} 
                    alt={booking.Room.Hotel.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
                        booking.status === 'confirmed' ? 'text-green-600' : 
                        booking.status === 'pending' ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {booking.status === 'confirmed' && <CheckCircle2 className="h-3 w-3" />}
                        {booking.status === 'pending' && <Info className="h-3 w-3" />}
                        {booking.status === 'pending' ? 'Waiting for Host Approval' : booking.status}
                      </div>
                      <h3 className="text-2xl font-bold">{booking.Room.Hotel.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <MapPin className="h-4 w-4" />
                        {booking.Room.Hotel.city}, {booking.Room.Hotel.country}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-400 font-medium">Estimated Price</p>
                      <p className="text-2xl font-bold">{formatPrice(booking.totalPrice)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 rounded-xl bg-neutral-50 p-4 md:grid-cols-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Check-in</p>
                      <p className="font-bold">{format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Check-out</p>
                      <p className="font-bold">{format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Room Type</p>
                      <p className="font-bold">{booking.Room.type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Guests</p>
                      <p className="font-bold">{booking.guests || 2} People</p>
                    </div>
                  </div>

                  {booking.extraServices && booking.extraServices.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Requested Services</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.extraServices.map((sid: string) => {
                          const service = guestServiceCategories.flatMap(c => c.services).find(s => s.id === sid);
                          if (!service) return null;
                          const Icon = service.icon;
                          return (
                            <div key={sid} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-100 text-neutral-600 shadow-sm">
                              <Icon className="h-3.5 w-3.5 text-[#fbbf24]" />
                              <span className="text-xs font-bold">{service.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.info(`Lister email sent to ${user?.email}`)}
                    >
                      Contact Host
                    </Button>
                    {booking.status === 'confirmed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-[#fbbf24]/10 border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24] hover:text-white"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowReviewModal(true);
                        }}
                      >
                        <Star className="h-4 w-4 mr-2" /> Leave a Review
                      </Button>
                    )}
                    {booking.status !== 'cancelled' && booking.status !== 'rejected' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleCancel(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        toast.info("Booking details & map opened"); 
                        // Simplified detail opening logic for now
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {(['upcoming', 'past', 'cancelled'].includes(activeTab) && filteredBookings.length === 0) && (
            <div className="rounded-3xl border-2 border-dashed border-neutral-200 py-24 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-neutral-200" />
              <h3 className="text-xl font-bold">No inquiries yet</h3>
              <p className="mb-8 text-neutral-500">Your future adventures will appear here.</p>
              <Button onClick={() => window.location.href = '/'}>Start Exploring</Button>
            </div>
          )}
        </div>
        )}

        {/* Wishlist Section */}
        {activeTab === 'wishlist' && (
          <div className="rounded-3xl border-2 border-dashed border-neutral-200 py-24 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-neutral-200" />
            <h3 className="text-xl font-bold">Your Wishlist is Empty</h3>
            <p className="mb-8 text-neutral-500">Save your favorite properties for later.</p>
            <Button onClick={() => window.location.href = '/'}>Start Exploring</Button>
          </div>
        )}

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">First Name</label>
                  <input type="text" defaultValue={user?.name?.split(' ')[0]} className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:border-[#fbbf24] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Last Name</label>
                  <input type="text" defaultValue={user?.name?.split(' ')[1] || ''} className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:border-[#fbbf24] outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Email Address</label>
                <input type="email" defaultValue={user?.email} className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:border-[#fbbf24] outline-none" disabled />
                <p className="text-xs text-neutral-400 mt-1">Email cannot be changed directly.</p>
              </div>
              <div className="pt-6">
                <Button className="w-full md:w-auto h-12 px-8 bg-[#1e293b] text-white font-bold rounded-xl" onClick={() => toast.success('Profile updated successfully')}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="bg-[#1e293b] p-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Rate your stay</h3>
                  <p className="text-sm text-white/60">{selectedBooking.Room.Hotel.name}</p>
                </div>
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-8">
                <div className="mb-8 text-center">
                  <p className="mb-4 text-sm font-bold uppercase tracking-widest text-neutral-400">Your Rating</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s}
                        onClick={() => setRating(s)}
                        className={`transition-all duration-200 ${rating >= s ? 'scale-110 text-[#fbbf24]' : 'text-neutral-200 hover:text-neutral-300'}`}
                      >
                        <Star className={`h-10 w-10 ${rating >= s ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-lg font-bold text-[#1e293b]">
                    {rating === 5 ? 'Exceptional!' : 
                     rating === 4 ? 'Very Good' : 
                     rating === 3 ? 'Good' : 
                     rating === 2 ? 'Fair' : 'Poor'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Share your experience</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you like or dislike?"
                      className="w-full min-h-[120px] rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm font-medium outline-none focus:border-[#fbbf24] transition-all resize-none"
                    />
                  </div>
                  
                  <Button 
                    className="w-full h-14 rounded-2xl bg-[#fbbf24] text-[#1e293b] font-bold text-lg shadow-xl shadow-[#fbbf24]/20"
                    onClick={handleSubmitReview}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
