import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { PROPERTY_AREAS } from '../constants';

const areas = [
  { id: 'islands', name: 'Islands (Ischia & Procida)', title: '🌋 Island Escape', search: 'Islands (Ischia & Procida)', image: 'https://images.unsplash.com/photo-1591930444969-9e3f3f8b5e8a?w=800' },
  { id: 'center', name: 'Center (Centro Storico)', title: '🍕 The Soul of Naples', search: 'Center (Centro Storico)', image: 'https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?w=800' },
  { id: 'seafront', name: 'Seafront (Chiaia - Posillipo)', title: '🌊 Sea & Luxury', search: 'Seafront (Chiaia - Posillipo)', image: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=800' },
  { id: 'station', name: 'Station (Piazza Garibaldi)', title: '🚉 Transport Hub', search: 'Station (Piazza Garibaldi)', image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800' },
  { id: 'stadium', name: 'Stadium (Fuorigrotta - Fair)', title: '⚽ Events & Sports', search: 'Stadium (Fuorigrotta - Fair)', image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800' },
  { id: 'vomero', name: 'Vomero', title: '☕ Local Daily Life', search: 'Vomero', image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800' },
  { id: 'mergellina', name: 'Mergellina', title: '🎭 Romantic Naples', search: 'Mergellina', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800' },
  { id: 'pozzuoli', name: 'Pozzuoli', title: '⚓ Authentic Fishing Town', search: 'Pozzuoli', image: 'https://images.unsplash.com/photo-1569230919100-d3fd5e1132f4?w=800' },
];

export const AreaSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="mb-8 text-center text-3xl font-serif font-bold text-slate-800">
        In which area do you want to stay?
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
        {areas.map((area) => (
          <motion.div
            key={area.id}
            whileHover={{ y: -8, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            onClick={() => navigate(`/search?area=${area.search}`)}
            className="group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-xl"
          >
            <img
              src={area.image}
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
              <span className="text-sm font-bold text-white">{area.title}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
