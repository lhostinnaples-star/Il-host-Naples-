import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card, Button, Input } from '../components/UI';
import { 
  Plus, Car, Bike, Ship, Palmtree, UserCheck, Utensils, 
  ChefHat, Sparkles, ShieldCheck, Star, MapPin, 
  Trash2, Edit, X, CheckCircle2, Search, Info, TrendingUp,
  Calendar, Users, Briefcase, MessageSquare, Clock, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { SERVICE_CATEGORIES } from '../constants';
import { ImageUpload } from '../components/ImageUpload';

export const ServiceProviderDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [services, setServices] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'requests'>('requests');
  
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formStep, setFormStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [servicesRes, requestsRes] = await Promise.all([
        fetch('/api/services/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/services/requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (servicesRes.ok) setServices(await servicesRes.json());
      if (requestsRes.ok) setRequests(await requestsRes.json());
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const initialFormState = {
    name: '',
    category: 'Transport',
    subCategory: 'rent_car',
    description: '',
    price: '',
    priceUnit: 'per day',
    location: 'Naples',
    imageUrl: '',
    features: [] as string[],
    availability: 'Instant',
    gmbLink: ''
  };

  const [newService, setNewService] = useState(initialFormState);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newService,
          price: Number(newService.price)
        })
      });

      if (res.ok) {
        toast.success(editingService ? 'Service updated successfully!' : 'Service listed successfully!');
        fetchDashboardData();
        handleCloseModal();
      } else {
        toast.error('Failed to save service');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      const res = await fetch(`/api/services/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        toast.success(`Request ${status} successfully`);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to update request');
    }
  };

  const handleCloseModal = () => {
    setShowAddService(false);
    setEditingService(null);
    setFormStep(1);
    setNewService(initialFormState);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-[#1e293b] mb-2">Service Dashboard</h1>
            <p className="text-neutral-500 text-lg">Manage your tourist services and customer requests</p>
          </div>
          <Button 
            onClick={() => setShowAddService(true)} 
            className="w-full sm:w-auto bg-[#1e293b] text-white hover:bg-[#fbbf24] hover:text-[#1e293b] font-bold h-12 px-8 rounded-xl transition-all shadow-lg shadow-[#1e293b]/10"
          >
            <Plus className="mr-2 h-5 w-5 text-[#fbbf24]" /> List New Service
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === 'requests' ? 'bg-[#1e293b] text-white shadow-xl shadow-[#1e293b]/20' : 'bg-white text-neutral-400 hover:text-[#1e293b]'}`}
          >
            Client Requests ({requests.length})
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === 'services' ? 'bg-[#1e293b] text-white shadow-xl shadow-[#1e293b]/20' : 'bg-white text-neutral-400 hover:text-[#1e293b]'}`}
          >
            My Listings ({services.length})
          </button>
        </div>

        {activeTab === 'requests' ? (
          <div className="space-y-6">
            {requests.map(request => (
              <Card key={request.id} className="p-8 border-none shadow-sm hover:shadow-xl transition-all bg-white rounded-3xl">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-100">
                    <img src={request.Service?.imageUrl || `https://picsum.photos/seed/${request.serviceId}/200`} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#1e293b] mb-1">{request.Service?.name || 'Unknown Service'}</h3>
                        <p className="text-sm font-bold text-[#fbbf24] uppercase tracking-widest">{request.Service?.category}</p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                        request.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-600' :
                        'bg-neutral-100 text-neutral-500'
                      }`}>
                        {request.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div className="flex items-start gap-3">
                         <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#1e293b] shadow-sm">
                           <Users className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Requested By</p>
                            <p className="font-bold text-[#1e293b]">{request.Customer?.name}</p>
                            <p className="text-xs text-neutral-500">{request.Customer?.email}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#fbbf24] shadow-sm">
                           <Calendar className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Preferred Date</p>
                            <p className="font-bold text-[#1e293b]">{format(new Date(request.date), 'MMMM dd, yyyy')}</p>
                         </div>
                      </div>
                    </div>

                    {request.details && (
                      <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-sm text-[#1e293b] italic">
                         "{request.details}"
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex gap-3 pt-2">
                        <Button 
                          onClick={() => handleStatusUpdate(request.id, 'accepted')}
                          className="flex-1 bg-[#1e293b] text-white hover:bg-green-600 h-12 rounded-xl font-bold"
                        >
                          Accept Request
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                          variant="outline" 
                          className="flex-1 border-neutral-200 hover:border-red-500 hover:text-red-500 h-12 rounded-xl font-bold"
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {requests.length === 0 && (
              <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-neutral-100">
                <AlertCircle className="h-16 w-16 mx-auto text-neutral-100 mb-6" />
                <h3 className="text-2xl font-bold text-[#1e293b] mb-2">No service requests yet</h3>
                <p className="text-neutral-400">Requests from customers will appear here.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {services.map(service => (
              <Card key={service.id} className="p-6 border-none shadow-sm hover:shadow-xl transition-all group flex gap-6 bg-white rounded-3xl">
                <div className="h-40 w-40 rounded-3xl overflow-hidden shrink-0 bg-neutral-100">
                  <img src={service.imageUrl || `https://picsum.photos/seed/${service.id}/300/300`} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-widest">{service.category} / {service.subCategory.replace('_', ' ')}</p>
                      <div className="flex items-center gap-1 text-xs font-bold text-[#fbbf24]">
                        <Star className="h-3 w-3 fill-[#fbbf24]" /> 5.0
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#1e293b] mb-2">{service.name}</h3>
                    <p className="text-2xl font-bold text-[#1e293b]">{formatPrice(Number(service.price))}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl h-10 font-bold border-neutral-200">Edit</Button>
                    <Button variant="outline" size="sm" className="border-neutral-200 hover:text-red-500 hover:border-red-500 rounded-xl px-4 h-10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal part updated for multi-step form and subcategories */}
      <AnimatePresence>
        {showAddService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
               <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto">
                 {/* Sidebar */}
                 <div className="w-full md:w-64 bg-neutral-50 p-10 border-r border-neutral-100 shrink-0">
                    <div className="flex flex-col gap-8">
                       {[1, 2, 3].map(s => (
                         <div key={s} className="flex items-center gap-4">
                            <div className={`h-10 w-10 flex items-center justify-center rounded-2xl font-bold shadow-lg shadow-neutral-200 ${formStep === s ? 'bg-[#fbbf24] text-[#1e293b]' : 'bg-white text-neutral-300'}`}>
                              {s}
                            </div>
                            <div className="hidden md:block">
                               <p className={`text-[10px] font-bold uppercase tracking-widest ${formStep === s ? 'text-[#1e293b]' : 'text-neutral-400'}`}>
                                 {s === 1 ? 'Category' : s === 2 ? 'Details' : 'Media'}
                               </p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 {/* Form Content */}
                 <div className="flex-1 p-10">
                    <h2 className="text-3xl font-bold text-[#1e293b] mb-8">List New Service</h2>
                    <form onSubmit={handleAddService} className="space-y-8">
                       {formStep === 1 && (
                         <div className="space-y-8">
                            <div className="space-y-6">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Select Category</label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {SERVICE_CATEGORIES.map(cat => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setNewService({ ...newService, category: cat.id, subCategory: cat.subCategories[0].id })}
                                    className={`p-6 rounded-[2rem] border-2 transition-all font-bold ${
                                      newService.category === cat.id ? 'border-[#fbbf24] bg-amber-50 text-[#1e293b]' : 'border-neutral-100 text-neutral-400'
                                    }`}
                                  >
                                    {cat.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-6">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Select Service Type</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {SERVICE_CATEGORIES.find(c => c.id === newService.category)?.subCategories.map(sub => (
                                  <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => setNewService({ ...newService, subCategory: sub.id })}
                                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all font-bold group ${
                                      newService.subCategory === sub.id ? 'border-[#fbbf24] bg-white text-[#1e293b]' : 'border-neutral-100 text-neutral-400'
                                    }`}
                                  >
                                    <sub.icon className={`h-6 w-6 ${newService.subCategory === sub.id ? 'text-[#fbbf24]' : 'text-neutral-300'}`} />
                                    <span>{sub.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <Button type="button" onClick={() => setFormStep(2)} className="w-full h-14 bg-[#1e293b] text-white rounded-2xl font-bold">Next</Button>
                         </div>
                       )}
                       {formStep === 2 && (
                         <div className="space-y-6">
                            <div className="space-y-2">
                               <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Service Name</label>
                               <Input placeholder="e.g. Luxury Private Boat Tour" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="h-14 rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Price (€)</label>
                               <Input placeholder="Price" type="number" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="h-14 rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Tell us more</label>
                               <textarea placeholder="Description" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="w-full h-40 p-5 rounded-2xl border border-neutral-100 outline-none focus:border-[#fbbf24]" />
                            </div>
                            <div className="flex gap-4">
                               <Button type="button" variant="outline" onClick={() => setFormStep(1)} className="flex-1 h-14 rounded-2xl font-bold">Back</Button>
                               <Button type="button" onClick={() => setFormStep(3)} className="flex-1 h-14 bg-[#1e293b] text-white rounded-2xl font-bold">Next</Button>
                            </div>
                         </div>
                       )}
                       {formStep === 3 && (
                         <div className="space-y-6">
                            <div className="space-y-4">
                               <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Service Photos</label>
                               <ImageUpload
                                maxImages={3}
                                storagePath={`services/${user?.id || 'new'}`}
                                initialImages={newService.imageUrl ? [newService.imageUrl] : []}
                                onImagesChange={(images) => {
                                  setNewService((prev: any) => ({
                                    ...prev,
                                    imageUrl: images[0] || ''
                                  }));
                                }}
                               />
                            </div>
                            <div className="flex gap-4 mt-8">
                               <Button type="button" variant="outline" onClick={() => setFormStep(2)} className="flex-1 h-14 rounded-2xl font-bold">Back</Button>
                               <Button type="submit" className="flex-1 h-14 bg-[#fbbf24] text-[#1e293b] rounded-2xl font-bold shadow-xl shadow-amber-200/20">Publish Listing</Button>
                            </div>
                         </div>
                       )}
                    </form>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
