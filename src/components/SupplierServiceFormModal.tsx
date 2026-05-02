import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronLeft, ChevronRight, Check, Wrench, 
  Settings, Info, Image as ImageIcon, Briefcase,
  Clock, Package, Map
} from 'lucide-react';
import { Button, Input } from './UI';
import { ImageUpload } from './ImageUpload';
import { toast } from 'sonner';

interface SupplierServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

import { SUPPLIER_CATEGORIES } from '../constants';

import { PROPERTY_AREAS } from '../constants';

const priceUnits = [
  'per session', 'per set', 'per item', 'per month'
];

export const SupplierServiceFormModal: React.FC<SupplierServiceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    name: '',
    category: SUPPLIER_CATEGORIES[0].id,
    description: '',
    price: '',
    priceUnit: 'per session',
    minOrder: '',
    turnaroundTime: '',
    areas: [],
    images: [],
    imageUrl: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.category) {
        toast.error('Please fill in name and category');
        return;
      }
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleToggleArea = (area: string) => {
    setFormData((prev: any) => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter((a: string) => a !== area)
        : [...prev.areas, area]
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      toast.error('Missing required fields');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e293b]">
                {initialData ? 'Edit B2B Service' : 'List New B2B Service'}
              </h2>
              <p className="text-xs text-neutral-500 font-medium">B2B Portal - Step {currentStep} of 3</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X className="h-6 w-6 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Service/Item Name</label>
                    <Input 
                      placeholder="e.g. Professional Linen Set" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Category</label>
                    <select 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {SUPPLIER_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Detailed Description</label>
                    <textarea 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none min-h-[100px]"
                      placeholder="Specify your professional offering for Listers..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Price (€)</label>
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Billing Unit</label>
                    <select 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
                      value={formData.priceUnit}
                      onChange={(e) => setFormData({...formData, priceUnit: e.target.value})}
                    >
                      {priceUnits.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Minimum Order</label>
                    <Input 
                      placeholder="e.g. 5 sets / €100 min"
                      value={formData.minOrder}
                      onChange={(e) => setFormData({...formData, minOrder: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Turnaround Time</label>
                    <Input 
                      placeholder="e.g. 24 hours"
                      value={formData.turnaroundTime}
                      onChange={(e) => setFormData({...formData, turnaroundTime: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 block">Service Area Coverage</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PROPERTY_AREAS.map(area => (
                        <button
                          key={area}
                          onClick={() => handleToggleArea(area)}
                          className={`px-3 py-2 rounded-xl border-2 font-bold text-[10px] uppercase tracking-widest transition-all ${
                            formData.areas.includes(area)
                              ? 'border-yellow-500 bg-amber-50 text-amber-700'
                              : 'border-neutral-100 bg-white text-neutral-400'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Portfolio/Product Images (Max 5)</label>
                    <ImageUpload 
                      maxImages={5}
                      storagePath="supplier-portal"
                      initialImages={formData.images}
                      onImagesChange={(imgs) => setFormData({
                        ...formData, 
                        images: imgs, 
                        imageUrl: imgs.length > 0 ? imgs[0] : formData.imageUrl
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Internal Notes for Listers</label>
                    <textarea 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none min-h-[120px]"
                      placeholder="Any specific professional requirements or details..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-neutral-100 flex items-center justify-between bg-neutral-50 shrink-0">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            disabled={currentStep === 1}
            className="text-neutral-500 font-black uppercase tracking-widest text-[10px]"
          >
             Back
          </Button>
          
          <div className="flex gap-3">
             {currentStep < 3 ? (
               <Button 
                 onClick={handleNext}
                 className="bg-[#1e293b] text-white px-10 font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl"
               >
                 Next Step
               </Button>
             ) : (
               <Button 
                 onClick={handleSubmit}
                 className="bg-yellow-500 hover:bg-yellow-600 text-black px-12 font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl shadow-xl shadow-yellow-500/20"
               >
                 {initialData ? 'Update Details' : 'Publish to B2B'}
               </Button>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
