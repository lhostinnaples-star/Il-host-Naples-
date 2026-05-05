import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const RecentlyViewedProperties: React.FC = () => {
  const [recent, setRecent] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      if (Array.isArray(stored)) {
        setRecent(stored.filter(h => h && typeof h === 'object' && h.id));
      }
    } catch (e) {
      console.error('Failed to load recently viewed', e);
    }
  }, []);

  if (recent.length === 0) return null;

  return (
    <section className="py-16 px-6 bg-neutral-50 overflow-hidden border-t border-neutral-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-[#0f172a]">Recently Viewed</h2>
          <button 
            onClick={() => {
              localStorage.removeItem('recentlyViewed');
              setRecent([]);
            }}
            className="text-xs font-bold text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-widest"
          >
            Clear All
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {recent.map((hotel: any, index: number) => (
            <div 
              key={hotel.id || `viewed-${index}`} 
              className="w-72 shrink-0 cursor-pointer group bg-white p-2 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-all"
              onClick={() => {
                if (hotel.id) {
                  navigate(`/hotel/${hotel.id}`);
                }
              }}
            >
              <div className="w-full h-40 rounded-xl overflow-hidden mb-3 relative">
                <img 
                  src={hotel.imageUrl || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} 
                  alt={hotel.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="px-2 pb-2">
                <h3 className="font-bold text-[#1e293b] truncate text-sm mb-1">{hotel.name}</h3>
                <p className="text-xs font-bold text-[#fbbf24] truncate">
                  €{hotel.price || hotel.rooms?.[0]?.price} /night
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
