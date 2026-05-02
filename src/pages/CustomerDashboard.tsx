import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, Button, Input } from '../components/UI';
import { 
  Calendar, Star, MapPin, User, LogOut, 
  Settings, Heart, Map, Clock, 
  ChevronRight, ExternalLink, MessageSquare, Plus,
  Camera, Briefcase, Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';

export const CustomerDashboard: React.FC = () => {
  const { token, user, isDemoMode } = useAuth();
  const { formatPrice } = useCurrency();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';
  
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (isDemoMode) {
      import('../utils/mockData').then(({ MOCK_BOOKINGS }) => {
        setBookings(MOCK_BOOKINGS);
      });
      return;
    }

    fetch('/api/bookings/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setBookings(Array.isArray(data) ? data : []))
    .catch(err => console.error(err));
  }, [token, isDemoMode]);

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 border-none relative overflow-hidden group">
           <div className="relative z-10 space-y-4">
              <div className="p-3 bg-white/10 rounded-xl w-fit"><Calendar className="h-6 w-6 text-white" /></div>
              <div>
                <h3 className="text-3xl font-bold text-white">{bookings.length}</h3>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">Total Bookings</p>
              </div>
           </div>
           <Calendar className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </Card>
        <Card className="p-6 bg-gradient-to-br from-orange-500 to-pink-500 border-none relative overflow-hidden group">
           <div className="relative z-10 space-y-4">
              <div className="p-3 bg-white/10 rounded-xl w-fit"><Heart className="h-6 w-6 text-white" /></div>
              <div>
                <h3 className="text-3xl font-bold text-white">4</h3>
                <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mt-1">Saved Items</p>
              </div>
           </div>
           <Heart className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </Card>
        <Card className="p-6 bg-gradient-to-br from-[#fbbf24] to-yellow-600 border-none relative overflow-hidden group">
           <div className="relative z-10 space-y-4">
              <div className="p-3 bg-white/10 rounded-xl w-fit"><Star className="h-6 w-6 text-white" /></div>
              <div>
                <h3 className="text-3xl font-bold text-white">2</h3>
                <p className="text-yellow-100 text-xs font-bold uppercase tracking-widest mt-1">Reviews Written</p>
              </div>
           </div>
           <Star className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Upcoming & Past Trips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-0 border-white/5 bg-white/5 overflow-hidden flex flex-col group hover:border-[#fbbf24]/30 transition-all">
              <div className="h-48 relative">
                <img 
                  src={booking.Room?.Hotel?.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt={booking.Room?.Hotel?.name}
                />
                <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg",
                    booking.status === 'confirmed' ? "bg-green-500/80 text-white" : "bg-orange-500/80 text-white"
                  )}>
                    {booking.status}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#fbbf24] transition-colors">{booking.Room?.Hotel?.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <MapPin className="h-3 w-3" />
                    <span>{booking.Room?.Hotel?.city}, {booking.Room?.Hotel?.country}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Dates</p>
                    <p className="text-xs font-bold text-white">{new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Total</p>
                    <p className="text-sm font-black text-[#fbbf24]">{formatPrice(booking.totalPrice)}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest border-white/10 hover:bg-white/5">Details</Button>
                  {booking.status === 'confirmed' && (
                    <Button className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest bg-white/5 hover:bg-white/10 text-white border border-white/10">Rate Trip</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title={section === 'overview' ? 'Overview' : section.charAt(0).toUpperCase() + section.slice(1)}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
             <h1 className="text-3xl font-bold text-white capitalize">Welcome, {user?.name.split(' ')[0]}!</h1>
             <p className="text-neutral-500 text-sm mt-1">Manage your trips and wishlist from your custom dashboard.</p>
           </div>
        </div>

        {section === 'overview' && renderOverview()}
        {section !== 'overview' && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Star className="h-10 w-10 text-neutral-600" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{section.toUpperCase()} under construction</h2>
             <p className="text-neutral-500 max-w-sm">We're building out this part of your personal travel dashboard.</p>
           </div>
        )}
      </div>
    </DashboardLayout>
  );
};
