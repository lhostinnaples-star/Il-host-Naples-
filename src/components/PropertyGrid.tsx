import React from 'react';
import { motion } from 'motion/react';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from './UI';
import { useCurrency } from '../contexts/CurrencyContext';
import { useHotels } from '../contexts/HotelsContext';

export const PropertyGrid: React.FC = () => {
  const { formatPrice } = useCurrency();
  const { hotels, isLoading } = useHotels();

  // Take the first 4 hotels for unique properties
  const displayHotels = hotels.slice(0, 4);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 mb-8" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Stay at our top unique properties</h2>
          <p className="text-neutral-500">From castles and villas to boats and igloos, we have it all</p>
        </div>
        <div className="hidden gap-2 md:flex">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayHotels.map((property) => (
          <motion.div
            key={property.id}
            whileHover={{ y: -5 }}
            className="min-w-[280px] shrink-0 md:min-w-0"
          >
            <Card className="h-full overflow-hidden border-neutral-100 p-0 shadow-sm transition-shadow hover:shadow-md">
              <div className="relative aspect-[4/3]">
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-neutral-600 backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500" aria-label="Add to wishlist"><Heart className="h-4 w-4" /></button>
              </div>
              <div className="p-4">
                <div className="mb-1 flex items-center gap-2">
                  {property.badges?.includes('Genius') && (
                    <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Genius
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-neutral-500">{property.type || 'Hotel'}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <h3 className="mb-1 text-lg font-bold text-neutral-900">{property.name}</h3>
                <p className="mb-3 text-sm text-neutral-500">{property.city}, {property.country}</p>
                
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#003580] text-sm font-bold text-white">
                    {property.rating || 9.0}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 leading-none">
                      {(property.rating || 0) >= 9.5 ? 'Exceptional' : (property.rating || 0) >= 9.0 ? 'Wonderful' : 'Very Good'}
                    </p>
                    <p className="text-xs text-neutral-400">{property.reviews || 0} reviews</p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <p className="text-xs text-neutral-500">Starting from</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-neutral-900">
                      {formatPrice(property.price)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
