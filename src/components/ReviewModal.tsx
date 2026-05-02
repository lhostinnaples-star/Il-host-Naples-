import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, MessageSquare, Camera, Share2 } from 'lucide-react';
import { Button } from './UI';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    // In a real app, this would call updateHotel/updateService to add a review
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 lg:p-12 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#1e293b]">Share your experience</h2>
              <p className="text-neutral-500 font-medium italic">"{item?.itemName}"</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
              <X className="h-6 w-6 text-neutral-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
             <div className="space-y-4 text-center pb-4 border-b border-neutral-100">
               <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">How would you rate it?</label>
               <div className="flex items-center justify-center gap-2">
                 {[1, 2, 3, 4, 5].map((s) => (
                   <button
                     key={s}
                     type="button"
                     onMouseEnter={() => setHoverRating(s)}
                     onMouseLeave={() => setHoverRating(0)}
                     onClick={() => setRating(s)}
                     className="p-2 transition-transform hover:scale-110 active:scale-95"
                   >
                     <Star 
                       className={`h-10 w-10 transition-colors ${
                         (hoverRating || rating) >= s 
                           ? 'fill-[#fbbf24] text-[#fbbf24]' 
                           : 'text-neutral-200'
                       }`} 
                     />
                   </button>
                 ))}
               </div>
               <p className="text-xs font-bold text-[#fbbf24] h-4">
                 {rating === 5 ? 'Excellent!' : 
                  rating === 4 ? 'Very Good' : 
                  rating === 3 ? 'Good' : 
                  rating === 2 ? 'Fair' : 
                  rating === 1 ? 'Poor' : ''}
               </p>
             </div>

             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                   <MessageSquare className="h-3 w-3" /> Tell us more
                 </label>
                 <textarea 
                   required
                   value={comment}
                   onChange={e => setComment(e.target.value)}
                   className="w-full min-h-[120px] p-6 rounded-3xl bg-neutral-50 border border-neutral-100 focus:border-[#fbbf24] outline-none transition-all text-sm leading-relaxed"
                   placeholder="Describe your stay or activity..."
                 />
               </div>

               <div className="flex gap-4">
                 <button type="button" className="flex-1 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-neutral-100 transition-colors flex flex-col items-center gap-2">
                    <Camera className="h-5 w-5 text-neutral-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Add Photos</span>
                 </button>
                 <button type="button" className="flex-1 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-neutral-100 transition-colors flex flex-col items-center gap-2">
                    <Share2 className="h-5 w-5 text-neutral-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Post Publicly</span>
                 </button>
               </div>
             </div>

             <Button 
               type="submit"
               className="w-full h-16 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-slate-200"
             >
               Submit Review
             </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
