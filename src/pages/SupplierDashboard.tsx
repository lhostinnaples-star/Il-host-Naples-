import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useHotels } from '../contexts/HotelsContext';
import { Card, Button, Input } from '../components/UI';
import { 
  Wrench, Calendar, BarChart3, User, Plus,
  Edit2, Trash2, CheckCircle2, Search, Filter,
  ChevronRight, Package, LayoutGrid, Briefcase, AlertCircle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { SupplierServiceFormModal } from '../components/SupplierServiceFormModal';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import { SUPPLIER_CATEGORIES } from '../constants';

export const SupplierDashboard: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const { formatPrice } = useCurrency();
  const { allHotels, allServices, addService, updateService, deleteService, bookings } = useHotels();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'overview';
  
  const myServices = allServices.filter(s => s.providerId === user?.id || (isDemoMode && s.serviceType === 'B2B'));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  // Use allBookings to count active orders for my services
  const myActiveOrders = bookings.filter(b => 
    b.status === 'PENDING' && 
    myServices.some(s => s.id === b.itemId)
  ).length;

  const handleAddService = () => {
    if (isDemoMode) {
      setEditingService({
        name: 'Premium Cleaning Naples',
        category: SUPPLIER_CATEGORIES[0].id,
        price: 80,
        priceUnit: 'per session',
        isDemoDummy: true
      });
    } else {
      setEditingService(null);
    }
    setIsModalOpen(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleServiceSubmit = (data: any) => {
    if (editingService?.isDemoDummy) {
      toast.success('B2B service published to catalog');
      setIsModalOpen(false);
      return;
    }
    if (editingService) {
      updateService(editingService.id, data);
      toast.success('B2B service updated');
    } else {
      const newService = {
        ...data,
        id: `supply-${Date.now()}`,
        providerId: user?.id,
        status: 'approved' as const,
        serviceType: 'B2B',
        rating: 5
      };
      addService(newService);
      toast.success('B2B service published to catalog');
    }
    setIsModalOpen(false);
  };

  const handleDeleteService = (id: string) => {
    deleteService(id);
    toast.success('B2B service removed');
    setServiceToDelete(null);
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between hover:border-[#fbbf24]/30 transition-all cursor-pointer">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">My Catalog</p>
             <h3 className="text-3xl font-bold text-white">{myServices.length}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-yellow-500/10"><Wrench className="h-6 w-6 text-yellow-500" /></div>
        </Card>
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between hover:border-[#fbbf24]/30 transition-all cursor-pointer">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Active Orders</p>
             <h3 className="text-3xl font-bold text-white">{myActiveOrders}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-blue-500/10"><Calendar className="h-6 w-6 text-blue-500" /></div>
        </Card>
        <Card className="p-6 border-white/5 bg-white/5 flex items-center justify-between hover:border-[#fbbf24]/30 transition-all cursor-pointer">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Lister Connections</p>
             <h3 className="text-3xl font-bold text-white">{Math.max(14, myServices.length * 3)}</h3>
           </div>
           <div className="p-4 rounded-2xl bg-purple-500/10"><Briefcase className="h-6 w-6 text-purple-500" /></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Service Catalog</h2>
            <Button size="sm" onClick={handleAddService} className="h-9 bg-[#fbbf24] text-black font-black uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> Add Service
            </Button>
          </div>
          <div className="space-y-4">
            {myServices.map(service => (
              <Card key={service.id} className="p-4 border-white/5 bg-white/5 hover:border-[#fbbf24]/30 transition-all group">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-xl text-neutral-500 group-hover:text-[#fbbf24] transition-colors">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{service.name}</h3>
                        <p className="text-[10px] font-black uppercase text-neutral-500 tracking-tighter mt-0.5">{SUPPLIER_CATEGORIES.find(c => c.id === service.category)?.label || service.category}</p>
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

        <SupplierServiceFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
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
                <h3 className="text-xl font-bold text-[#0f172a] text-center mb-2">Delete B2B Service?</h3>
                <p className="text-neutral-500 text-center mb-8">
                  This service will be removed from the B2B catalog for Listers.
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
