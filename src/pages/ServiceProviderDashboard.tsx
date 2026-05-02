import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, Button, Input } from '../components/UI';
import { 
  Plus, Edit2, Trash2, Map, Calendar,
  Star, User, CheckCircle2, XCircle, Clock,
  Search, Filter, ChevronRight, Package, LayoutGrid
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';

export const ServiceProviderDashboard: React.FC = () => {
  const { user, token, isDemoMode } = useAuth();
  const { formatPrice } = useCurrency();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';
  
  const [services, setServices] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (isDemoMode) {
      import('../utils/mockData').then(({ MOCK_SERVICES }) => {
        setServices(MOCK_SERVICES);
        setRequests([
          {
            id: 'req-1',
            status: 'pending',
            date: new Date().toISOString(),
            Service: MOCK_SERVICES[0],
            Customer: { name: 'Giuseppe Verdi' }
          }
        ]);
      });
      return;
    }
  }, [isDemoMode]);

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between cursor-pointer hover:border-[#fbbf24]/30 transition-all">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">My Experiences</p>
             <h3 className="text-3xl font-bold text-white">{services.length}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-green-500/10"><Map className="h-6 w-6 text-green-500" /></div>
        </Card>
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between cursor-pointer hover:border-[#fbbf24]/30 transition-all">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Pending Requests</p>
             <h3 className="text-3xl font-bold text-white">{requests.length}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-blue-500/10"><Calendar className="h-6 w-6 text-blue-500" /></div>
        </Card>
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between cursor-pointer hover:border-[#fbbf24]/30 transition-all">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Avg Rating</p>
             <h3 className="text-3xl font-bold text-white">4.9</h3>
           </div>
           <div className="p-4 rounded-2xl bg-yellow-500/10"><Star className="h-6 w-6 text-yellow-500" /></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Active Services</h2>
            <Button size="sm" className="h-9 bg-[#fbbf24] text-black font-black uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> New Service
            </Button>
          </div>
          <div className="space-y-4">
            {services.map(service => (
              <Card key={service.id} className="p-4 border-white/5 bg-white/5 hover:border-[#fbbf24]/30 transition-all group">
                <div className="flex gap-4">
                   <div className="h-20 w-24 rounded-lg overflow-hidden shrink-0">
                     <img src={service.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-white group-hover:text-[#fbbf24] transition-colors">{service.name}</h3>
                        <p className="text-[#fbbf24] font-black">{formatPrice(service.price)}</p>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">{service.serviceType}</p>
                   </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Latest Bookings</h2>
          <div className="space-y-4">
            {requests.map(req => (
              <Card key={req.id} className="p-4 border-white/5 bg-white/5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{req.Service?.name}</p>
                  <p className="text-xs text-neutral-500 mt-1">Requested by {req.Customer?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">{req.status}</span>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-white"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
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
      </div>
    </DashboardLayout>
  );
};
