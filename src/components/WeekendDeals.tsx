import React from 'react';
import { motion } from 'motion/react';
import { Heart, ChevronRight } from 'lucide-react';
import { Card } from './UI';
import { useCurrency } from '../contexts/CurrencyContext';
import { useHotels } from '../contexts/HotelsContext';

export const WeekendDeals: React.FC = () => {
  const { formatPrice } = useCurrency();
  const { hotels, isLoading } = useHotels();

  // Take the next 4 hotels for deals
  const displayHotels = hotels.slice(4, 8);

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
          <h2 className="text-2xl font-bold text-neutral-900">Deals for the weekend</h2>
          <p className="text-neutral-500">Save on stays for April 3 - April 5</p>
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
                <div className="absolute left-3 top-3 flex flex-col gap-1">
                  {hotel.badges?.includes('Genius') && (
                    <span className="w-fit rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Genius
                    </span>
                  )}
                  {hotel.badges?.includes('Getaway Deal') && (
                    <span className="w-fit rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Getaway Deal
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="mb-1 text-lg font-bold text-neutral-900">{hotel.name}</h3>
                <p className="mb-3 text-sm text-neutral-500">{hotel.city}, {hotel.country}</p>
                
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#003580] text-sm font-bold text-white">
                    {hotel.rating || 9.0}
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">{hotel.reviews || 0} reviews</p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <p className="text-xs text-neutral-500">2 nights</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-500 line-through">
                      {formatPrice(hotel.price * 1.2)}
                    </span>
                    <span className="text-xl font-bold text-neutral-900">
                      {formatPrice(hotel.price)}
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
