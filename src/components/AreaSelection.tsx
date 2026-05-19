import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { useSettings } from '../contexts/SettingsContext';

export const AreaSelection: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="mb-8 text-center text-3xl font-serif font-bold text-slate-800">
        In which area do you want to stay?
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
        {settings.areas.map((area) => (
          <motion.div
            key={area.id}
            whileHover={{ y: -8, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            onClick={() => navigate(`/search?area=${area.searchParam}`)}
            className="group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-xl"
          >
            <img
              src={area.imageUrl}
              alt={area.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800';
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-transparent" />
            <div className="absolute bottom-4 left-0 w-full text-center px-2 flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F5A623]">{area.name}</span>
              <span className="text-sm font-bold text-white">{area.tagline}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
