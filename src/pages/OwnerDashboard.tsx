import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useHotels } from '../contexts/HotelsContext';
import { Card, Button, Input } from '../components/UI';
import { 
  Home, Calendar, Wrench, BarChart3, Star, User,
  Plus, Edit2, Trash2, CheckCircle2, XCircle, Clock,
  MoreVertical, ExternalLink, Filter, Search, ChevronRight,
  TrendingUp, ArrowUpRight, ArrowDownRight, MapPin, Users as UsersIcon,
  Package, LayoutGrid
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';

export const OwnerDashboard: React.FC = () => {
  const { token, isDemoMode } = useAuth();
  const { formatPrice } = useCurrency();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';
  
  const [hotels, setHotels] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [pool, setPool] = useState<any[]>([]);

  useEffect(() => {
    if (isDemoMode) {
      import('../utils/mockData').then(({ MOCK_PROPERTIES, MOCK_BOOKINGS, MOCK_BOOKING_POOL }) => {
        setHotels(MOCK_PROPERTIES);
        setBookings(MOCK_BOOKINGS);
        setPool(MOCK_BOOKING_POOL);
      });
    }
  }, [isDemoMode]);

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between group">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">My Properties</p>
             <h3 className="text-3xl font-bold text-white">{hotels.length}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-purple-500/10"><Home className="h-6 w-6 text-purple-500" /></div>
        </Card>
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between group">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Bookings</p>
             <h3 className="text-3xl font-bold text-white">{bookings.length}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-blue-500/10"><Calendar className="h-6 w-6 text-blue-500" /></div>
        </Card>
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between group">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">In Pool</p>
             <h3 className="text-3xl font-bold text-white">{pool.length}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-[#fbbf24]/10"><LayoutGrid className="h-6 w-6 text-[#fbbf24]" /></div>
        </Card>
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between group">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Earnings</p>
             <h3 className="text-3xl font-bold text-white">{formatPrice(12400)}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-green-500/10"><BarChart3 className="h-6 w-6 text-green-500" /></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Property Management</h2>
            <Button size="sm" className="h-9 bg-[#fbbf24] text-black font-black uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </div>
          <div className="space-y-4">
            {hotels.map(hotel => (
              <Card key={hotel.id} className="p-4 border-white/5 bg-white/5 hover:border-[#fbbf24]/30 transition-all group">
                <div className="flex gap-6">
                  <div className="h-24 w-32 rounded-xl overflow-hidden shrink-0">
                    <img src={hotel.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[#fbbf24] transition-colors">{hotel.name}</h3>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {hotel.area}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-white"><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase">
                        <UsersIcon className="h-3 w-3" /> {hotel.guests} Guests
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase">
                        <TrendingUp className="h-3 w-3" /> {formatPrice(hotel.price)}/night
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Recent Inquiries</h2>
          <Card className="border-white/5 bg-white/5 divide-y divide-white/5 overflow-hidden">
            {bookings.slice(0, 4).map(booking => (
              <div key={booking.id} className="p-4 hover:bg-white/[0.02] cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-white">{booking.User?.name || 'Inquiry Group'}</p>
                  <span className="text-[10px] font-black text-[#fbbf24] uppercase tracking-tighter">{formatPrice(booking.totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-neutral-500 uppercase font-medium">{new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}</p>
                  <Button variant="ghost" size="sm" className="h-6 text-[8px] font-black uppercase tracking-widest border border-white/5 text-neutral-500 hover:text-white group-hover:border-[#fbbf24]/30 transition-all">Moderate</Button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title={section === 'overview' ? 'Property Stats' : section.charAt(0).toUpperCase() + section.slice(1)}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
             <h1 className="text-3xl font-bold text-white capitalize">Lister Dashboard</h1>
             <p className="text-neutral-500 text-sm mt-1">Manage your properties and bookings effectively.</p>
           </div>
        </div>

        {section === 'overview' && renderOverview()}
        {section !== 'overview' && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Package className="h-10 w-10 text-neutral-600" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{section.toUpperCase()} module</h2>
             <p className="text-neutral-500 max-w-sm">This professional management module is being refined for WordPress style control.</p>
           </div>
        )}
      </div>
    </DashboardLayout>
  );
};
