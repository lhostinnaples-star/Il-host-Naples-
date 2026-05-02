import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, Button, Input } from '../components/UI';
import { 
  Wrench, Calendar, BarChart3, User, Plus,
  Edit2, Trash2, CheckCircle2, Search, Filter,
  ChevronRight, Package, LayoutGrid, Briefcase
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';

export const SupplierDashboard: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const { formatPrice } = useCurrency();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';
  
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    if (isDemoMode) {
      import('../utils/mockData').then(({ MOCK_SUPPLIER_SERVICES }) => {
        setServices(MOCK_SUPPLIER_SERVICES);
      });
    }
  }, [isDemoMode]);

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between hover:border-[#fbbf24]/30 transition-all cursor-pointer">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">My Catalog</p>
             <h3 className="text-3xl font-bold text-white">{services.length}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-yellow-500/10"><Wrench className="h-6 w-6 text-yellow-500" /></div>
        </Card>
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between hover:border-[#fbbf24]/30 transition-all cursor-pointer">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Active Orders</p>
             <h3 className="text-3xl font-bold text-white">2</h3>
           </div>
           <div className="p-4 rounded-2xl bg-blue-500/10"><Calendar className="h-6 w-6 text-blue-500" /></div>
        </Card>
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between hover:border-[#fbbf24]/30 transition-all cursor-pointer">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Lister Connections</p>
             <h3 className="text-3xl font-bold text-white">14</h3>
           </div>
           <div className="p-4 rounded-2xl bg-purple-500/10"><Briefcase className="h-6 w-6 text-purple-500" /></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Service Catalog</h2>
            <Button size="sm" className="h-9 bg-[#fbbf24] text-black font-black uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> Add Service
            </Button>
          </div>
          <div className="space-y-4">
            {services.map(service => (
              <Card key={service.id} className="p-4 border-white/5 bg-white/5 hover:border-[#fbbf24]/30 transition-all group">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-xl text-neutral-500 group-hover:text-[#fbbf24] transition-colors">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{service.name}</h3>
                        <p className="text-[10px] font-black uppercase text-neutral-500 tracking-tighter mt-0.5">{service.category}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-[#fbbf24]">{formatPrice(service.price)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-600 hover:text-white"><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-600 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                   </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Recent Orders</h2>
          <div className="space-y-4">
             <Card className="p-4 border-white/5 bg-white/5 space-y-4">
                <div className="flex justify-between items-start">
                   <div>
                     <p className="text-sm font-bold text-white">Full Linen Refresh</p>
                     <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Order #8821</p>
                   </div>
                   <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full uppercase">New</span>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                   <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs">V</div>
                   <div className="text-xs">
                     <p className="text-white font-medium">Villa Roma</p>
                     <p className="text-neutral-500">Delivery: tomorrow 10:00</p>
                   </div>
                </div>
                <Button className="w-full h-10 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px]">Accept Order</Button>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title={section === 'overview' ? 'Supply Center' : section.charAt(0).toUpperCase() + section.slice(1)}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Supplier Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage your B2B services and professional maintenance catalog.</p>
        </div>

        {section === 'overview' && renderOverview()}
        {section !== 'overview' && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Package className="h-10 w-10 text-neutral-600" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{section.toUpperCase()} Command</h2>
             <p className="text-neutral-500 max-w-sm">Advanced supplier logistics for this module are coming in the next update.</p>
           </div>
        )}
      </div>
    </DashboardLayout>
  );
};
