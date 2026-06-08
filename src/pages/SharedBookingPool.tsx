import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Calendar, MapPin, Share2, 
  MessageCircle, ArrowLeft, Info,
  Search, ClipboardList, CheckCircle2,
  Clock, Phone, Mail, MessageSquare
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
    const expiresAt = new Date(sharedAt || Date.now()).getTime() + (6 * 60 * 60 * 1000); // 6 hours
    if (expiresAt < currentTime) return 'Expired';
    const diff = expiresAt - currentTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
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
            <span className="text-white font-bold text-sm transition-colors group-hover:text-[#F5A623]">Back to Dashboard</span>
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Share2 className="h-8 w-8 text-[#F5A623]" />
                Referral Booking Pool
              </h1>
              <p className="text-[#94a3b8]">Claim overflow bookings from other listers in Naples.</p>
            </div>
            
            <div className="bg-[#1e293b] text-white p-6 rounded-3xl flex items-start gap-4 max-w-md shadow-xl border border-[#334155]">
              <div className="h-10 w-10 rounded-xl bg-[#F5A623]/20 flex items-center justify-center shrink-0">
                <Info className="h-6 w-6 text-[#F5A623]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#F5A623] uppercase tracking-widest">Privacy Guard</p>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Customer contact details are hidden until you accept the referral. Once accepted, you have 6 hours to coordinate and close the booking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#F5A623]" />
              Available Referrals
            </h2>
            <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">
              {poolBookings.length} Potential Referrals
            </div>
          </div>

          <div className="grid gap-6">
            {poolBookings.map((booking) => (
              <Card key={booking.id} className="relative overflow-hidden border-[#334155] shadow-lg hover:shadow-xl transition-all group p-6 flex flex-col lg:flex-row lg:items-center gap-6 bg-[#1e293b] rounded-[2rem]">
                {/* Status Indicator */}
                <div className="absolute top-0 left-0 w-2 h-full bg-[#F5A623]" />
                
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-[#0f172a] flex items-center justify-center border border-[#334155]">
                        <Share2 className="h-6 w-6 text-[#F5A623]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-[#F5A623] transition-colors">{booking.itemName || 'Property'}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="rounded-full bg-[#0f172a] px-2.5 py-0.5 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider border border-[#334155]">
                            {booking.bookingType === 'PROPERTY' ? 'Stay' : 'Experience'}
                          </span>
                          <span className="text-xs font-medium text-[#64748b]">Shared via Referral Pool</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-widest">Shared On</p>
                      <p className="text-sm font-bold text-white">{booking.sharedAt ? format(new Date(booking.sharedAt), 'MMM dd, HH:mm') : 'Recently'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#334155]">
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Stay Period
                      </p>
                      <p className="text-sm font-bold text-white">
                        {format(new Date(booking.startDate), 'MMM dd')}{booking.endDate ? ` - ${format(new Date(booking.endDate), 'MMM dd')}` : ''}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest flex items-center gap-1">
                        <Users className="h-3 w-3" /> Guests
                      </p>
                      <p className="text-sm font-bold text-white">{booking.guests || 2} People</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Area
                      </p>
                      <p className="text-sm font-bold text-white">{booking.area || 'Naples'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest">Est. Value</p>
                      <p className="text-sm font-bold text-[#F5A623]">€{booking.totalPrice}</p>
                    </div>
                  </div>

                    <div className="flex items-center gap-6 pt-4 border-t border-[#334155]">
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-full bg-[#0f172a] flex items-center justify-center border border-[#334155]">
                          <Users className="h-4 w-4 text-[#94a3b8]" />
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest leading-none">Guest Info</p>
                          <p className="text-xs font-bold text-white tracking-wider">{booking.customerName}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-full bg-[#0f172a] flex items-center justify-center border border-[#334155]">
                          <Clock className="h-4 w-4 text-[#94a3b8]" />
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest leading-none">Response Window</p>
                          <p className="text-xs font-bold text-white tracking-wider">{getCountdown(booking.sharedAt || '')}</p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="lg:border-l border-[#334155] lg:pl-6 shrink-0 space-y-3">
                  <Button 
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowModal(true);
                    }}
                    className="w-full bg-[#F5A623] text-black hover:bg-white hover:text-black font-black uppercase tracking-widest h-14 px-8 rounded-2xl transition-all shadow-lg shadow-[#F5A623]/10 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Review Details
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleRelease(booking.id)}
                    className="w-full border-[#334155] text-[#94a3b8] font-bold h-10 px-8 rounded-2xl transition-all flex items-center justify-center text-[10px] uppercase tracking-widest hover:bg-white/5"
                  >
                    Release Referral
                  </Button>
                  <p className="text-[10px] text-center text-[#64748b] italic">No penalty for not closing within 6h</p>
                </div>
              </Card>
            ))}

            {poolBookings.length === 0 && (
              <div className="text-center py-20 bg-[#1e293b] rounded-[2rem] border-2 border-dashed border-[#334155]">
                <Search className="mx-auto h-16 w-16 opacity-10 mb-6 text-white" />
                <h3 className="text-xl font-bold text-white mb-2">The shared pool is empty</h3>
                <p className="text-[#94a3b8]">Collaborate with others when business is booming!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pool Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e293b] border border-[#334155] rounded-[2rem] w-full max-w-lg p-8 shadow-2xl relative"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Referral Details</h2>
            <div className="space-y-4 mb-8 text-[#94a3b8]">
               <div className="flex justify-between border-b border-[#334155] pb-2">
                 <span className="text-[10px] font-black uppercase tracking-widest">Property</span>
                 <span className="text-sm font-bold text-white">{selectedBooking.itemName}</span>
               </div>
               <div className="flex justify-between border-b border-[#334155] pb-2">
                 <span className="text-[10px] font-black uppercase tracking-widest">Dates</span>
                 <span className="text-sm font-bold text-white">
                  {format(new Date(selectedBooking.startDate), 'MMM dd, yyyy')}{selectedBooking.endDate ? ` - ${format(new Date(selectedBooking.endDate), 'MMM dd, yyyy')}` : ''}
                 </span>
               </div>
               <div className="flex justify-between border-b border-[#334155] pb-2">
                 <span className="text-[10px] font-black uppercase tracking-widest">Estimated Value</span>
                 <span className="text-sm font-bold text-[#F5A623]">€{selectedBooking.totalPrice}</span>
               </div>

               <div className="mt-8 p-4 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/20 text-xs text-[#F5A623]">
                 <p className="font-black uppercase tracking-widest flex items-center gap-2 mb-2"><Info className="h-4 w-4" /> Professional Handover</p>
                 <p className="leading-relaxed mb-4">By accepting this booking, you agree to contact the referring party quickly. Customer satisfaction is paramount for community trust.</p>
               </div>
               
               {selectedBooking.status === 'ACCEPTED' && (
                 <div className="mt-6 border-t border-[#334155] pt-6">
                    <h4 className="text-white font-bold mb-4">Customer Contact Info Revealed</h4>
                    <div className="flex flex-col gap-2 text-xs font-medium text-white mb-4">
                       <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#F5A623]" /> {selectedBooking.customerEmail || 'Guest Email'}</span>
                       <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#F5A623]" /> {selectedBooking.customerPhone || 'Guest Phone'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       <a href={`tel:${selectedBooking.customerPhone || ''}`} className="bg-green-600 text-white rounded-xl px-3 py-1 text-sm flex items-center gap-1 font-bold"><Phone className="h-4 w-4" /> Call</a>
                       <a href={`mailto:${selectedBooking.customerEmail || ''}`} className="bg-blue-600 text-white rounded-xl px-3 py-1 text-sm flex items-center gap-1 font-bold"><Mail className="h-4 w-4" /> Email</a>
                       <a href={`https://wa.me/${selectedBooking.customerPhone || ''}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white rounded-xl px-3 py-1 text-sm flex items-center gap-1 font-bold"><MessageSquare className="h-4 w-4" /> WhatsApp</a>
                    </div>
                 </div>
               )}
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1 border-[#334155] text-white rounded-xl h-12 uppercase tracking-widest text-[10px] font-black">Cancel</Button>
              <Button onClick={() => handleAccept(selectedBooking)} className="flex-1 bg-[#F5A623] text-black rounded-xl h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#F5A623]/20">
                Confirm Accept
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
