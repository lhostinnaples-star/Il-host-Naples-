import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronLeft, ChevronRight, Check, MapPin, 
  Home, Star, Info, Image as ImageIcon, Calendar,
  Wifi, Wind, Coffee, Car, Waves, Tv, Layout, Users
} from 'lucide-react';
import { Button, Input } from './UI';
import { ImageUpload } from './ImageUpload';
import { toast } from 'sonner';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

import { PROPERTY_AREAS } from '../constants';

const steps = [
  { id: 1, title: 'Basic Info', icon: Home },
  { id: 2, title: 'Details', icon: Info },
  { id: 3, title: 'Amenities', icon: Star },
  { id: 4, title: 'Description', icon: Layout },
  { id: 5, title: 'Images', icon: ImageIcon },
  { id: 6, title: 'Availability', icon: Calendar },
];

const amenityOptions = [
  { id: 'WiFi', icon: Wifi },
  { id: 'AC', icon: Wind },
  { id: 'Kitchen', icon: Coffee },
  { id: 'Parking', icon: Car },
  { id: 'Pool', icon: Waves },
  { id: 'Washer', icon: Layout },
  { id: 'TV', icon: Tv },
  { id: 'Balcony', icon: Layout },
  { id: 'Sea View', icon: Waves },
  { id: 'Elevator', icon: ArrowUpCircle },
  { id: 'Pet Friendly', icon: Users },
  { id: 'BBQ', icon: Layout },
];

// Helper icon for elevator since I missed it in primary imports
function ArrowUpCircle(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/>
    </svg>
  );
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isFetchingGMB, setIsFetchingGMB] = useState(false);
  const [fetchedGMBData, setFetchedGMBData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [formData, setFormData] = useState<any>({
    name: '',
    type: 'Holiday House',
    area: PROPERTY_AREAS[0],
    address: '',
    city: 'Naples',
    country: 'Italy',
    cirCode: '',
    price: '',
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    singleBeds: 0,
    doubleBeds: 1,
    sofaBeds: 0,
    sqm: '',
    amenities: [],
    houseRules: '',
    cancellationPolicy: 'Moderate',
    description: '',
    spaceDescription: '',
    accessDescription: '',
    localTipsDescription: '',
    images: [],
    imageUrl: '',
    unavailableDates: [],
    gmbLink: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  const handleNext = () => {
    const errors: any = {};
    if (currentStep === 1) {
      if (!formData.name) errors.name = "Property Name is required";
      if (!formData.address) errors.address = "Address is required";
      setValidationErrors(errors);
      if (Object.keys(errors).length > 0) {
        toast.error('Please fix the errors before proceeding');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
        errors.price = "Price must be a number > 0";
      }
      setValidationErrors(errors);
      if (Object.keys(errors).length > 0) {
        toast.error('Please fix the errors before proceeding');
        return;
      }
    }
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleToggleAmenity = (amenityId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a: string) => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const fetchGMBData = async () => {
    if (!formData.gmbLink) {
        toast.error('Please enter a GMB link first');
        return;
    }
    setIsFetchingGMB(true);
    // Simulate GMB fetch
    setTimeout(() => {
       setFetchedGMBData({
          name: "Demo Property Naples",
          address: "Via Toledo 100, Naples, Italy",
          phone: "+39 081 000 0000",
          rating: 4.8,
          imageUrl: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=400',
          lat: 40.8518,
          lng: 14.2681
       });
       setIsFetchingGMB(false);
       console.log("GMB fetch simulated");
    }, 2000);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.address || !formData.price) {
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
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center">
              <Home className="h-5 w-5 text-[#fbbf24]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e293b]">
                {initialData ? 'Edit Property' : 'Add New Property'}
              </h2>
              <p className="text-xs text-neutral-500 font-medium">Step {currentStep} of {steps.length}: {steps[currentStep-1].title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors" aria-label="Close"><X className="h-6 w-6 text-neutral-400" /></button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-neutral-100 shrink-0">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            className="h-full bg-[#fbbf24]"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Property Name</label>
                    <Input 
                      placeholder="e.g. Luxury Suite Toledo" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Property Type</label>
                    <select 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option>BnB</option>
                      <option>Holiday House</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Area</label>
                    <select 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                    >
                      {PROPERTY_AREAS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Address</label>
                    <Input 
                      placeholder="Full street address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">CIR Code</label>
                    <Input 
                      placeholder="Codice Identificativo Regionale"
                      value={formData.cirCode}
                      onChange={(e) => setFormData({...formData, cirCode: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Starting Price per Night (€)</label>
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Max Guests</label>
                    <Input 
                      type="number"
                      value={formData.guests}
                      onChange={(e) => setFormData({...formData, guests: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Size (sqm)</label>
                    <Input 
                      type="number"
                      value={formData.sqm}
                      onChange={(e) => setFormData({...formData, sqm: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Bedrooms</label>
                    <Input type="number" value={formData.bedrooms} onChange={(e) => setFormData({...formData, bedrooms: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Bathrooms</label>
                    <Input type="number" value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: Number(e.target.value)})} />
                  </div>
                  <div className="md:grid md:grid-cols-3 md:gap-4 md:col-span-3">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Single Beds</label>
                        <Input type="number" value={formData.singleBeds} onChange={(e) => setFormData({...formData, singleBeds: Number(e.target.value)})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Double Beds</label>
                        <Input type="number" value={formData.doubleBeds} onChange={(e) => setFormData({...formData, doubleBeds: Number(e.target.value)})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Sofa Beds</label>
                        <Input type="number" value={formData.sofaBeds} onChange={(e) => setFormData({...formData, sofaBeds: Number(e.target.value)})} />
                     </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 block">Select Amenities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {amenityOptions.map((amenity) => (
                        <button
                          key={amenity.id}
                          onClick={() => handleToggleAmenity(amenity.id)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                            formData.amenities.includes(amenity.id)
                              ? 'border-[#fbbf24] bg-amber-50 text-[#1e293b]'
                              : 'border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200'
                          }`}
                        >
                          <amenity.icon className={`h-5 w-5 ${formData.amenities.includes(amenity.id) ? 'text-[#fbbf24]' : 'text-neutral-300'}`} />
                          <span className="text-xs font-bold leading-none">{amenity.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">House Rules</label>
                    <textarea 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none min-h-[100px]"
                      placeholder="No smoking, no parties..."
                      value={formData.houseRules}
                      onChange={(e) => setFormData({...formData, houseRules: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Cancellation Policy</label>
                    <select 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
                      value={formData.cancellationPolicy}
                      onChange={(e) => setFormData({...formData, cancellationPolicy: e.target.value as any})}
                    >
                      <option>Flexible</option>
                      <option>Moderate</option>
                      <option>Strict</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Main Description</label>
                    <textarea 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none min-h-[120px]"
                      placeholder="Tell guests what makes your place special..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-neutral-400">The Space</label>
                      <textarea 
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none min-h-[100px]"
                        value={formData.spaceDescription}
                        onChange={(e) => setFormData({...formData, spaceDescription: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Guest Access</label>
                      <textarea 
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none min-h-[100px]"
                        value={formData.accessDescription}
                        onChange={(e) => setFormData({...formData, accessDescription: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Local Area Tips</label>
                    <textarea 
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none min-h-[80px]"
                      value={formData.localTipsDescription}
                      onChange={(e) => setFormData({...formData, localTipsDescription: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Property Images (Max 5)</label>
                    <ImageUpload 
                      maxImages={5}
                      storagePath="properties"
                      initialImages={formData.images}
                      onImagesChange={(imgs) => setFormData({
                        ...formData, 
                        images: imgs, 
                        imageUrl: imgs.length > 0 ? imgs[0] : formData.imageUrl
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2 p-6 rounded-3xl bg-neutral-50 border border-neutral-100">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Google My Business Integration</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://g.page/your-business"
                        value={formData.gmbLink}
                        onChange={(e) => setFormData({...formData, gmbLink: e.target.value})}
                      />
                      <Button onClick={fetchGMBData} disabled={isFetchingGMB} className="shrink-0">
                        {isFetchingGMB ? 'Fetching...' : 'Fetch Data'}
                      </Button>
                    </div>

                    {fetchedGMBData && (
                      <div className="mt-4 p-4 bg-white rounded-xl border border-neutral-200">
                        <div className="flex items-center gap-3 mb-2">
                            <img src={fetchedGMBData.imageUrl} alt="preview" className="w-12 h-12 object-cover rounded-md" />
                            <div>
                                <p className="font-bold text-sm">{fetchedGMBData.name}</p>
                                <p className="text-xs text-neutral-500">{fetchedGMBData.address}</p>
                            </div>
                        </div>
                        <Button 
                          onClick={() => {
                              setFormData({
                                  ...formData,
                                  name: fetchedGMBData.name,
                                  address: fetchedGMBData.address,
                                  imageUrl: fetchedGMBData.imageUrl,
                                  lat: fetchedGMBData.lat,
                                  lng: fetchedGMBData.lng,
                                  rating: fetchedGMBData.rating
                              });
                              alert("Data applied!");
                          }}
                          className="w-full mt-2"
                        >
                          Use This Data
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-8">
                  <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100">
                    <div className="flex items-center gap-4 mb-6">
                      <Calendar className="h-6 w-6 text-[#fbbf24]" />
                      <h3 className="font-bold text-[#1e293b]">Calendar Management</h3>
                    </div>
                    <p className="text-sm text-neutral-500 mb-6">
                      Select dates to block from your availability. Currently blocked dates:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.unavailableDates.length > 0 ? (
                        formData.unavailableDates.map((date: string) => (
                          <div key={date} className="px-3 py-1 bg-white border border-neutral-200 rounded-full flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-700">{date}</span>
                            <button 
                              onClick={() => setFormData({
                                ...formData, 
                                unavailableDates: formData.unavailableDates.filter((d: string) => d !== date)
                              })}
                              className="text-neutral-400 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs italic text-neutral-400">No dates blocked yet.</p>
                      )}
                    </div>
                    <div className="mt-8">
                      <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 block">Block a manual date</label>
                      <div className="flex gap-2">
                        <Input 
                          type="date" 
                          className="flex-1"
                          onChange={(e) => {
                            if (e.target.value && !formData.unavailableDates.includes(e.target.value)) {
                              setFormData({
                                ...formData,
                                unavailableDates: [...formData.unavailableDates, e.target.value].sort()
                              });
                            }
                          }}
                        />
                      </div>
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
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          
          <div className="flex gap-3">
             {currentStep < steps.length ? (
               <Button 
                 onClick={handleNext}
                 className="bg-[#0f172a] text-white px-10 font-black uppercase tracking-widest text-[10px] h-12"
               >
                 Next Step <ChevronRight className="h-4 w-4 ml-2" />
               </Button>
             ) : (
               <Button 
                 onClick={handleSubmit}
                 className="bg-green-600 hover:bg-green-700 text-white px-12 font-black uppercase tracking-widest text-[10px] h-12 shadow-xl shadow-green-500/20"
               >
                 {initialData ? 'Update Property' : 'Publish Property'} <Check className="h-4 w-4 ml-2" />
               </Button>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
