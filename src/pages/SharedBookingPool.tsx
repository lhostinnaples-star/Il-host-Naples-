import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Calendar, MapPin, Share2, 
  MessageCircle, ArrowLeft, Info,
  Search, ClipboardList, CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const SharedBookingPool: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // High-quality demo data for the pool
  const MOCK_DEMO_BOOKINGS = [
    {
      id: 'demo-1',
      Room: { 
        Hotel: { name: 'Naples Grand Hotel', area: 'Seafront', category: 'hotel' },
        type: 'Deluxe Suite'
      },
      checkIn: '2024-05-15',
      checkOut: '2024-05-20',
      guests: 4,
      totalPrice: 1250,
      sharedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      userName: 'Marco R. (Masked)',
      isDemo: true
    },
    {
      id: 'demo-2',
      Room: { 
        Hotel: { name: 'Centro Storico B&B', area: 'Historical Center', category: 'bnb' },
        type: 'Queen Room'
      },
      checkIn: '2024-06-01',
      checkOut: '2024-06-04',
      guests: 2,
      totalPrice: 450,
      sharedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      userName: 'Giulia B. (Masked)',
      isDemo: true
    }
  ];

  const fetchPool = React.useCallback(async () => {
    try {
      const res = await fetch('/api/bookings/pool', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Merge real bookings with demo data
        setBookings([...MOCK_DEMO_BOOKINGS, ...data]);
      } else {
        setBookings(MOCK_DEMO_BOOKINGS);
      }
    } catch (err) {
      setBookings(MOCK_DEMO_BOOKINGS);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  const handleAccept = async (id: string) => {
    // Check if it's a demo booking
    if (id.startsWith('demo-')) {
      toast.success('Referral accepted! Demo details are now simulated in your dashboard.');
      setBookings(bookings.filter(b => b.id !== id));
      setTimeout(() => navigate('/owner'), 1500);
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${id}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Referral accepted! Details are now in your dashboard.');
        setBookings(bookings.filter(b => b.id !== id));
        // Redirect after a short delay
        setTimeout(() => navigate('/owner'), 1500);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to accept referral');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
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
            <span className="text-[#1e293b] font-bold text-sm transition-colors group-hover:text-[#fbbf24]">Back to Dashboard</span>
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-2 flex items-center gap-3">
                <Share2 className="h-8 w-8 text-[#fbbf24]" />
                Referral Booking Pool
              </h1>
              <p className="text-neutral-500">Claim overflow bookings from other listers in Naples.</p>
            </div>
            
            <div className="bg-[#1e293b] text-white p-6 rounded-3xl flex items-start gap-4 max-w-md shadow-xl">
              <div className="h-10 w-10 rounded-xl bg-[#fbbf24]/20 flex items-center justify-center shrink-0">
                <Info className="h-6 w-6 text-[#fbbf24]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#fbbf24] uppercase tracking-widest">Privacy Guard</p>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Customer contact details are hidden until you accept the referral. Once accepted, you have 6 hours to coordinate and close the booking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1e293b] flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Available Referrals
            </h2>
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              {bookings.length} Potential Referrals
            </div>
          </div>

          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-all group p-6 flex flex-col lg:flex-row lg:items-center gap-6 bg-white rounded-3xl">
                {/* Status Badge */}
                <div className="absolute top-0 left-0 w-2 h-full bg-[#fbbf24]" />
                
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <Share2 className="h-6 w-6 text-[#fbbf24]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#1e293b]">{booking.Room?.Hotel?.name || 'Property'} - {booking.Room?.type || 'Stay'}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            {booking.Room?.Hotel?.category === 'bnb' ? 'BnB' : 'Holiday House'}
                          </span>
                          <span className="text-xs font-medium text-neutral-400">Shared via Referral Pool</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Shared On</p>
                      <p className="text-sm font-bold text-neutral-600">{booking.sharedAt ? format(new Date(booking.sharedAt), 'MMM dd, HH:mm') : 'Recently'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-50">
                    <div className="space-y-1">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Stay Period
                      </p>
                      <p className="text-sm font-bold text-[#1e293b]">
                        {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Users className="h-3 w-3" /> Guests
                      </p>
                      <p className="text-sm font-bold text-[#1e293b]">{booking.guests || 2} People</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Area
                      </p>
                      <p className="text-sm font-bold text-[#1e293b]">{booking.Room?.Hotel?.area || 'Naples'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Est. Payout</p>
                      <p className="text-sm font-bold text-green-600">€{booking.totalPrice}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-neutral-50">
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-neutral-400" />
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Guest Info</p>
                          <p className="text-xs font-bold text-[#1e293b] tracking-wider">{booking.userName}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-neutral-400" />
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Response Window</p>
                          <p className="text-xs font-bold text-[#1e293b] tracking-wider">6 HOURS</p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="lg:border-l border-neutral-100 lg:pl-6 shrink-0 space-y-3">
                  <Button 
                    onClick={() => handleAccept(booking.id)}
                    className="w-full bg-[#fbbf24] text-[#1e293b] hover:bg-[#1e293b] hover:text-white font-bold h-14 px-8 rounded-2xl transition-all shadow-lg shadow-[#fbbf24]/10 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Accept Referral
                  </Button>
                  <p className="text-[10px] text-center text-neutral-400 italic">No penalty for not closing within 6h</p>
                </div>
              </Card>
            ))}

            {!isLoading && bookings.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-neutral-100">
                <Search className="mx-auto h-16 w-16 opacity-10 mb-6" />
                <h3 className="text-xl font-bold text-[#1e293b] mb-2">The shared pool is empty</h3>
                <p className="text-neutral-400">Collaborate with others when business is booming!</p>
              </div>
            )}
            
            {isLoading && (
               <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fbbf24] mx-auto"></div>
                  <p className="mt-4 text-neutral-500 font-medium tracking-wide">Loading referrals...</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
