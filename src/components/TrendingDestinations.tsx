import React from 'react';
import { motion } from 'motion/react';

interface Destination {
  id: string;
  name: string;
  country: string;
  flag: string;
  image: string;
}

const destinations: Destination[] = [
  {
    id: 'd1',
    name: 'Naples',
    country: 'Italy',
    flag: 'it',
    image: 'https://images.unsplash.com/photo-1590603740183-980e7f6920eb?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'd2',
    name: 'Rome',
    country: 'Italy',
    flag: 'it',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'd3',
    name: 'Florence',
    country: 'Italy',
    flag: 'it',
    image: 'https://images.unsplash.com/photo-1541085388130-975971954316?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'd4',
    name: 'Venice',
    country: 'Italy',
    flag: 'it',
    image: 'https://images.unsplash.com/photo-1514890547357-a9ee2887ad8e?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'd5',
    name: 'Milan',
    country: 'Italy',
    flag: 'it',
    image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&q=80&w=600',
  },
];

export const TrendingDestinations: React.FC = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900">Trending destinations</h2>
        <p className="text-neutral-500">Most popular choices for travelers in Italy</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {/* Top Row: 2 Large Cards */}
        {destinations.slice(0, 2).map((dest) => (
          <motion.div
            key={dest.id}
            whileHover={{ scale: 1.02 }}
            className="group relative h-64 cursor-pointer overflow-hidden rounded-xl md:col-span-3"
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            {/* Top Gradient Overlay */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
            
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="text-xl font-bold text-white drop-shadow-md">{dest.name}</span>
              <img
                src={`https://flagcdn.com/w20/${dest.flag}.png`}
                alt={dest.country}
                className="h-3 w-5 rounded-sm object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        ))}

        {/* Bottom Row: 3 Smaller Cards */}
        {destinations.slice(2).map((dest) => (
          <motion.div
            key={dest.id}
            whileHover={{ scale: 1.02 }}
            className="group relative h-64 cursor-pointer overflow-hidden rounded-xl md:col-span-2"
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            {/* Top Gradient Overlay */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
            
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="text-xl font-bold text-white drop-shadow-md">{dest.name}</span>
              <img
                src={`https://flagcdn.com/w20/${dest.flag}.png`}
                alt={dest.country}
                className="h-3 w-5 rounded-sm object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
