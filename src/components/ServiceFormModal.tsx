import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronLeft, ChevronRight, Check, MapPin, 
  Settings, Info, Image as ImageIcon, Calendar,
  Clock, Users, Map
} from 'lucide-react';
import { Button, Input } from './UI';
import { ImageUpload } from './ImageUpload';
import { toast } from 'sonner';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

import { PROPERTY_AREAS, SERVICE_CATEGORIES } from '../constants';

const priceUnits = [
  'per person', 'per trip', 'per day', 'per hour'
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    name: '',
    category: SERVICE_CATEGORIES[0].id,
    subCategory: '',
    description: '',
    price: '',
    priceUnit: 'per person',
    maxPeople: 2,
    duration: '',
    meetingPoint: '',
    areas: [],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    images: [],
    imageUrl: '',
    coverImage: '',
    included: '',
    notIncluded: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.category || !formData.subCategory) {
        toast.error('Please fill in name, category and subcategory');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.duration && !formData.meetingPoint && formData.availableDays.length === 0 && formData.areas.length === 0 && !formData.maxPeople) {
        toast.error('Please fill in at least one service detail');
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

  const handleToggleDay = (day: string) => {
    setFormData((prev: any) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d: string) => d !== day)
        : [...prev.availableDays, day]
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
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e293b]">
                {initialData ? 'Edit Service' : 'Add New Service'}
              </h2>
              <p className="text-xs text-neutral-500 font-medium">Step {currentStep} of 3</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors" aria-label="Close"><X className="h-6 w-6 text-neutral-400" /></button>
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
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Service Name</label>
                    <Input 
                      placeholder="e.g. Private Amalfi Tour" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Main Category</label>
                    <select 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value, subCategory: ''})}
                    >
                      {SERVICE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Sub Category</label>
                    <select 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
                      value={formData.subCategory}
                      onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                    >
                      <option value="" disabled>Select sub category</option>
                      {SERVICE_CATEGORIES.find(c => c.id === formData.category)?.subCategories.map(sub => (
                        <option key={sub.id} value={sub.label}>{sub.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Description</label>
                    <textarea 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none min-h-[100px]"
                      placeholder="Describe what you offer..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Starting Price (€)</label>
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Price Unit</label>
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
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Max People</label>
                    <Input 
                      type="number"
                      value={formData.maxPeople}
                      onChange={(e) => setFormData({...formData, maxPeople: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Duration (e.g. 3 hours)</label>
                    <Input 
                      placeholder="e.g. 4 hours"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Meeting Point</label>
                    <Input 
                      placeholder="Full address or location name"
                      value={formData.meetingPoint}
                      onChange={(e) => setFormData({...formData, meetingPoint: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 block">Availability Days</label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`px-4 py-2 rounded-xl border-2 font-bold text-xs transition-all ${
                            formData.availableDays.includes(day)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-neutral-100 bg-white text-neutral-400'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 block">Areas Covered</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PROPERTY_AREAS.map(area => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => handleToggleArea(area)}
                          className={`px-3 py-2 rounded-xl border-2 font-bold text-[10px] uppercase tracking-widest transition-all ${
                            formData.areas.includes(area)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
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
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Cover Image (Required)</label>
                    <ImageUpload 
                      maxImages={1}
                      storagePath="services/covers"
                      initialImages={formData.coverImage ? [formData.coverImage] : []}
                      onImagesChange={(imgs) => setFormData({
                        ...formData, 
                        coverImage: imgs[0] || ''
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Service Images (Max 3)</label>
                    <ImageUpload 
                      maxImages={3}
                      storagePath="services"
                      initialImages={formData.images}
                      onImagesChange={(imgs) => setFormData({
                        ...formData, 
                        images: imgs, 
                        imageUrl: imgs.length > 0 ? imgs[0] : formData.imageUrl
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-neutral-400">What's Included</label>
                      <textarea 
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none min-h-[100px]"
                        value={formData.included}
                        onChange={(e) => setFormData({...formData, included: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-neutral-400">What's Not Included</label>
                      <textarea 
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none min-h-[100px]"
                        value={formData.notIncluded}
                        onChange={(e) => setFormData({...formData, notIncluded: e.target.value})}
                      />
                    </div>
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
                 className="bg-blue-600 text-white px-10 font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl"
               >
                 Next Step
               </Button>
             ) : (
               <Button 
                 onClick={handleSubmit}
                 className="bg-green-600 hover:bg-green-700 text-white px-12 font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl shadow-xl shadow-green-500/20"
               >
                 {initialData ? 'Update Service' : 'Add Service'}
               </Button>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
