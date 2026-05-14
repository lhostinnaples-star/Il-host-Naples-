import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string;
  User?: { name?: string };
  createdAt?: string;
}

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-neutral-50 p-6 shadow-sm border border-neutral-100 transition-all hover:bg-white hover:shadow-md flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-200 border-2 border-white shadow-sm">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.User?.name || 'Guest'}`} alt="User" />
          </div>
          <div>
            <p className="font-bold text-[#1e293b]">{review.User?.name || 'Anonymous'}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mt-0.5">
              {review.createdAt ? format(new Date(review.createdAt), 'MMM yyyy') : 'Recently'}
            </p>
          </div>
        </div>
        <div className="flex text-[#fbbf24]">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`h-3 w-3 ${Math.round(review.rating) >= s ? 'fill-current' : 'opacity-20'}`} />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-start">
        <p className={`text-sm md:text-base text-neutral-600 leading-relaxed italic ${!isExpanded ? 'line-clamp-3' : ''}`}>
          "{review.comment}"
        </p>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs font-bold text-[#F5A623] hover:text-[#e09400] transition-colors uppercase tracking-widest"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      </div>
    </div>
  );
};
