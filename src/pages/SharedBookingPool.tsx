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
import { useHotels } from '../contexts/HotelsContext';
import { toast } from 'sonner';

export const SharedBookingPool: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings: allBookings, updateBooking } = useHotels();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Filter for real shared bookings NOT owned by the current user
  const poolBookings = allBookings.filter(b => b.status === 'SHARED' && b.ownerId !== user?.id);

  const handleAccept = async (booking: any) => {
    try {
      // Logic for claiming common pool referral
      updateBooking(booking.id, { 
        status: 'ACCEPTED',
        ownerId: user?.id,
        originalListerId: booking.ownerId,
        acceptedAt: new Date().toISOString()
      });
      
      toast.success('Referral claimed successfully!');
      setShowModal(false);
      setTimeout(() => navigate('/owner'), 1000);
    } catch (err) {
      toast.error('Could not claim booking');
    }
  };

  const handleRelease = (id: string) => {
    // In a real app, this might mark it as ignored for this user
    toast.info('Booking dismissed from your view');
    // For now we just close or filter it out locally if we had local state
    setShowModal(false);
  };

  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const getCountdown = (sharedAt: string) => {
    const expiresAt = new Date(sharedAt).getTime() + (6 * 60 * 60 * 1000); // 6 hours
    if (expiresAt < currentTime) return 'Expired';
    const diff = expiresAt - currentTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
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
              {poolBookings.length} Potential Referrals
            </div>
          </div>

          <div className="grid gap-6">
            {poolBookings.map((booking) => (
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
                        <h3 className="font-bold text-lg text-[#1e293b]">{booking.itemName || 'Property'}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            {booking.bookingType === 'PROPERTY' ? 'Stay' : 'Experience'}
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
                        {format(new Date(booking.startDate), 'MMM dd')}{booking.endDate ? ` - ${format(new Date(booking.endDate), 'MMM dd')}` : ''}
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
                      <p className="text-sm font-bold text-[#1e293b]">{booking.area || 'Naples'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Est. Value</p>
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
                          <p className="text-xs font-bold text-[#1e293b] tracking-wider">{booking.customerName}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-neutral-400" />
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Response Window</p>
                          <p className="text-xs font-bold text-[#1e293b] tracking-wider">{getCountdown(booking.sharedAt)}</p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="lg:border-l border-neutral-100 lg:pl-6 shrink-0 space-y-3">
                  <Button 
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowModal(true);
                    }}
                    className="w-full bg-[#fbbf24] text-[#1e293b] hover:bg-[#1e293b] hover:text-white font-bold h-14 px-8 rounded-2xl transition-all shadow-lg shadow-[#fbbf24]/10 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Review Details
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleRelease(booking.id)}
                    className="w-full text-neutral-500 font-bold h-10 px-8 rounded-2xl transition-all flex items-center justify-center text-xs"
                  >
                    Release Referral
                  </Button>
                  <p className="text-[10px] text-center text-neutral-400 italic">No penalty for not closing within 6h</p>
                </div>
              </Card>
            ))}

            {poolBookings.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-neutral-100">
                <Search className="mx-auto h-16 w-16 opacity-10 mb-6" />
                <h3 className="text-xl font-bold text-[#1e293b] mb-2">The shared pool is empty</h3>
                <p className="text-neutral-400">Collaborate with others when business is booming!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pool Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e293b]/80 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4">Referral Details</h2>
            <div className="space-y-4 mb-8 text-neutral-600">
               <p><strong>Property:</strong> {selectedBooking.itemName}</p>
               <p><strong>Dates:</strong> {format(new Date(selectedBooking.startDate), 'MMM dd, yyyy')} {selectedBooking.endDate ? `- ${format(new Date(selectedBooking.endDate), 'MMM dd, yyyy')}` : ''}</p>
               <p><strong>Guests:</strong> {selectedBooking.guests || 2}</p>
               <p><strong>Estimated Value:</strong> €{selectedBooking.totalPrice}</p>
               <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-800">
                 <p className="font-bold flex items-center gap-2 mb-1"><Info className="h-4 w-4" /> Next Steps</p>
                 <p>By accepting this booking, you agree to contact the referring party quickly. If you fail to successfully fulfill the booking, the party will seek someone else.</p>
               </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1 rounded-xl h-12">Cancel</Button>
              <Button onClick={() => handleAccept(selectedBooking)} className="flex-1 bg-[#fbbf24] text-[#1e293b] rounded-xl h-12 hover:bg-[#1e293b] hover:text-white transition-colors">
                Confirm Accept
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
