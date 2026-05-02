import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useHotels } from '../contexts/HotelsContext';
import { Card, Button, Input } from '../components/UI';
import { 
  Plus, Edit2, Trash2, Map as MapIcon, Calendar,
  Star, User, CheckCircle2, XCircle, Clock,
  Search, Filter, ChevronRight, Package, LayoutGrid, AlertCircle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { ServiceFormModal } from '../components/ServiceFormModal';
import { motion, AnimatePresence } from 'motion/react';

export const ServiceProviderDashboard: React.FC = () => {
  const { user, token, isDemoMode } = useAuth();
  const { formatPrice } = useCurrency();
  const { allServices, addService, updateService, deleteService, bookings: allBookings, updateBooking } = useHotels();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';
  
  const myServices = allServices.filter(s => s.providerId === user?.id || (isDemoMode && !s.providerId));
  
  // Filter for my service bookings
  const myBookings = allBookings.filter(b => 
    b.bookingType === 'SERVICE' && 
    (b.ownerId === user?.id || (isDemoMode && !b.ownerId))
  );

  const [activeTab, setActiveTab] = useState<'services' | 'requests'>('services');
  const [activeRequestTab, setActiveRequestTab] = useState<'pending' | 'confirmed' | 'past'>('pending');

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const averageRating = useMemo(() => {
    const ratings = myServices.map(s => s.rating || 5);
    if (ratings.length === 0) return 0;
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  }, [myServices]);

  const handleAddService = () => {
    if (isDemoMode) {
      setEditingService({
        name: 'Capri Boat Tour',
        category: 'Boat Tour',
        price: 85,
        priceUnit: 'per person',
        isDemoDummy: true
      });
    } else {
      setEditingService(null);
    }
    setIsServiceModalOpen(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = (data: any) => {
    if (editingService?.isDemoDummy) {
      toast.success('Service added successfully');
      setIsServiceModalOpen(false);
      return;
    }
    if (editingService) {
      updateService(editingService.id, data);
      toast.success('Service updated successfully');
    } else {
      const newService = {
        ...data,
        id: `service-${Date.now()}`,
        providerId: user?.id,
        status: 'approved' as const,
        rating: 5
      };
      addService(newService);
      toast.success('Service added successfully');
    }
    setIsServiceModalOpen(false);
  };

  const handleDeleteService = (id: string) => {
    deleteService(id);
    toast.success('Service removed successfully');
    setServiceToDelete(null);
  };

  const pendingCount = myBookings.filter(b => b.status === 'PENDING').length;

  const handleBookingAction = useCallback((bookingId: string, action: 'CONFIRMED' | 'CANCELLED') => {
    let reason = '';
    if (action === 'CANCELLED') {
      reason = window.prompt('Please provide a reason for cancellation:') || 'Service unavailable';
    }
    
    updateBooking(bookingId, { status: action as any, rejectionReason: reason });
    toast.success(`Booking ${action.toLowerCase()} successfully`);
    
    const booking = myBookings.find(b => b.id === bookingId);
    if (booking) {
      if (action === 'CONFIRMED') {
        console.log('EMAIL TO CUSTOMER:', `Your experience ${booking.itemName} is CONFIRMED! Ref: ${booking.reference}`);
      } else {
        console.log('EMAIL TO CUSTOMER:', `Your experience request ${booking.reference} was rejected. Reason: ${reason}`);
      }
    }
  }, [myBookings, updateBooking]);

  const renderRequests = () => (
    <div className="space-y-6">
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start overflow-x-auto scrollbar-hide">
        {(['pending', 'confirmed', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveRequestTab(tab)}
            className={cn(
              "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              activeRequestTab === tab 
                ? "bg-[#fbbf24] text-black shadow-lg" 
                : "text-neutral-500 hover:text-white"
            )}
          >
            {tab} {tab === 'pending' && pendingCount > 0 && `(${pendingCount})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {myBookings
          .filter(b => {
            if (activeRequestTab === 'pending') return b.status === 'PENDING';
            if (activeRequestTab === 'confirmed') return b.status === 'CONFIRMED' || b.status === 'ACCEPTED';
            if (activeRequestTab === 'past') return b.status === 'CLOSED';
            return false;
          })
          .map(booking => (
            <Card key={booking.id} className="p-6 border-white/5 bg-white/5 hover:border-white/10 transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4">
                  <div className="h-20 w-24 rounded-xl overflow-hidden bg-white/5">
                    <img src={booking.itemImage} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{booking.customerName}</h3>
                      <span className="text-[10px] font-bold text-neutral-500 bg-white/5 px-2 py-0.5 rounded">#{booking.reference}</span>
                      {booking.status === 'PENDING' && (
                        <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                           <Clock className="h-3 w-3" /> 23h 48m left
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mb-1 font-bold">{booking.itemName}</p>
                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(booking.startDate).toLocaleDateString()}</span>
                      {booking.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.time}</span>}
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {booking.guests} People</span>
                    </div>
                    {booking.notes && (
                      <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-[10px] font-bold text-[#fbbf24] uppercase mb-1">Special Notes:</p>
                        <p className="text-[10px] text-neutral-400 italic">"{booking.notes}"</p>
                      </div>
                    )}
                    {booking.meetingPoint && (
                       <p className="text-[10px] text-blue-400 font-bold flex items-center gap-1 mt-2">
                         <MapIcon className="h-3 w-3" /> Pickup: {booking.meetingPoint}
                       </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-center items-end gap-3 min-w-[120px]">
                  <p className="text-xl font-black text-white">{formatPrice(booking.totalPrice)}</p>
                  
                  {booking.status === 'PENDING' ? (
                    <div className="flex gap-2 w-full">
                      <Button 
                        size="sm" 
                        onClick={() => handleBookingAction(booking.id, 'CONFIRMED')}
                        className="flex-1 bg-green-500 text-white font-black uppercase text-[10px] tracking-widest h-9"
                      >
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBookingAction(booking.id, 'CANCELLED')}
                        className="flex-1 border-white/10 text-red-500 font-black uppercase text-[10px] tracking-widest h-9 hover:bg-red-500/10"
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      booking.status === 'CONFIRMED' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {booking.status}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        }
        {myBookings.filter(b => {
            if (activeRequestTab === 'pending') return b.status === 'PENDING';
            if (activeRequestTab === 'confirmed') return b.status === 'CONFIRMED' || b.status === 'ACCEPTED';
            if (activeRequestTab === 'past') return b.status === 'CLOSED';
            return false;
          }).length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
             <Calendar className="h-10 w-10 text-neutral-700 mx-auto mb-4" />
             <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No {activeRequestTab} requests found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 self-start mb-4">
        <button
          onClick={() => setActiveTab('services')}
          className={cn(
            "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
            activeTab === 'services' 
              ? "bg-white text-black shadow-xl" 
              : "text-neutral-500 hover:text-white"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          My Services
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 relative",
            activeTab === 'requests' 
              ? "bg-white text-black shadow-xl" 
              : "text-neutral-500 hover:text-white"
          )}
        >
          <Calendar className="h-4 w-4" />
          Booking Requests
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'requests' ? renderRequests() : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between cursor-pointer hover:border-[#fbbf24]/30 transition-all">
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Active Services</p>
               <h3 className="text-3xl font-bold text-white">{myServices.length}</h3>
             </div>
             <div className="p-4 rounded-2xl bg-green-500/10"><MapIcon className="h-6 w-6 text-green-500" /></div>
          </Card>
          <Card 
            onClick={() => setActiveTab('requests')}
            className="p-6 border-white/5 bg-white/5 flex items-center justify-between cursor-pointer hover:border-[#fbbf24]/30 transition-all"
          >
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Incoming Requests</p>
               <h3 className="text-3xl font-bold text-white">{myBookings.filter(b => b.status === 'PENDING').length}</h3>
             </div>
             <div className="p-4 rounded-2xl bg-blue-500/10"><Calendar className="h-6 w-6 text-blue-500" /></div>
          </Card>
          <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between cursor-pointer hover:border-[#fbbf24]/30 transition-all">
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Revenue Month</p>
               <h3 className="text-3xl font-bold text-white">{formatPrice(myBookings.filter(b => b.status === 'CONFIRMED').reduce((acc, curr) => acc + curr.totalPrice, 0))}</h3>
             </div>
             <div className="p-4 rounded-2xl bg-yellow-500/10"><Star className="h-6 w-6 text-yellow-500" /></div>
          </Card>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Service List</h2>
              <Button size="sm" onClick={handleAddService} className="h-9 bg-[#fbbf24] text-black font-black uppercase tracking-widest gap-2">
                <Plus className="h-4 w-4" /> New Service
              </Button>
            </div>
            <div className="space-y-4">
              {myServices.map(service => (
                <Card key={service.id} className="p-4 border-white/5 bg-white/5 hover:border-[#fbbf24]/30 transition-all group">
                  <div className="flex gap-4">
                     <div className="h-20 w-24 rounded-lg overflow-hidden shrink-0">
                       <img src={service.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="font-bold text-white group-hover:text-[#fbbf24] transition-colors">{service.name}</h3>
                          <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" onClick={() => handleEditService(service)} className="h-7 w-7 text-neutral-500 hover:text-white"><Edit2 className="h-3.5 w-3.5" /></Button>
                             <Button variant="ghost" size="icon" onClick={() => setServiceToDelete(service.id)} className="h-7 w-7 text-neutral-500 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                             <p className="text-[#fbbf24] font-black ml-2">{formatPrice(service.price)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">{service.category} - {service.subCategory}</p>
                     </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Performance Overview</h2>
            <Card className="p-8 border-white/5 bg-white/5 h-[400px] flex items-center justify-center text-center">
              <div className="space-y-4">
                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                   <Star className="h-10 w-10 text-[#fbbf24]" />
                </div>
                <h3 className="text-xl font-bold text-white">{averageRating}/5 Rating</h3>
                <p className="text-neutral-500 text-sm max-w-[200px]">Average rating from your {myServices.length} active experiences.</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout title={section === 'overview' ? 'Performance' : section.charAt(0).toUpperCase() + section.slice(1)}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Experience Provider</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage your tours, transfers and activities for Naples visitors.</p>
        </div>

        {section === 'overview' && renderOverview()}
        {section !== 'overview' && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Package className="h-10 w-10 text-neutral-600" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{section.toUpperCase()} Module</h2>
             <p className="text-neutral-500 max-w-sm">This professional service management interface is coming soon.</p>
           </div>
        )}

        <ServiceFormModal 
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onSubmit={handleServiceSubmit}
          initialData={editingService}
        />

        {/* Delete Confirmation */}
        <AnimatePresence>
          {serviceToDelete && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setServiceToDelete(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md bg-white rounded-3xl p-8"
              >
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] text-center mb-2">Delete Service?</h3>
                <p className="text-neutral-500 text-center mb-8">
                  This service will be permanently removed from the catalog.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px]"
                    onClick={() => setServiceToDelete(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[10px]"
                    onClick={() => handleDeleteService(serviceToDelete)}
                  >
                    Yes, Delete
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};
