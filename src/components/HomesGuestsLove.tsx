import React from 'react';
import { motion } from 'motion/react';
import { Star, Heart, MapPin, ChevronRight } from 'lucide-react';
import { Card } from './UI';
import { useCurrency } from '../contexts/CurrencyContext';
import { useHotels } from '../contexts/HotelsContext';

export const HomesGuestsLove: React.FC = () => {
  const { formatPrice } = useCurrency();
  const { hotels, isLoading } = useHotels();

  // Filter for high-rated homes or just take the first few
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
          <h2 className="text-2xl font-bold text-neutral-900">Homes guests love</h2>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {displayHotels.map((hotel) => (
          <motion.div
            key={hotel.id}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Card className="h-full overflow-hidden border-neutral-100 p-0 shadow-sm transition-shadow hover:shadow-md">
              <div className="relative aspect-[4/3]">
                <img
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-neutral-600 backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-500">{hotel.type || 'Bed and Breakfast'}</span>
                  <div className="flex">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <h3 className="mb-1 text-lg font-bold text-neutral-900">{hotel.name}</h3>
                <p className="mb-1 text-sm text-neutral-500">{hotel.city}, {hotel.country}</p>
                <div className="mb-3 flex items-center gap-1 text-xs text-neutral-400">
                  <MapPin className="h-3 w-3" />
                  <span>{hotel.distance || '0.5 km from center'}</span>
                </div>
                
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#003580] text-sm font-bold text-white">
                    {hotel.rating || 9.0}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 leading-none">
                      {(hotel.rating || 0) >= 9.5 ? 'Exceptional' : (hotel.rating || 0) >= 9.0 ? 'Wonderful' : 'Very Good'}
                    </p>
                    <p className="text-xs text-neutral-400">{hotel.reviews || 0} reviews</p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <p className="text-xs text-neutral-500">Starting from</p>
                  <span className="text-xl font-bold text-neutral-900">
                    {formatPrice(hotel.price)}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
