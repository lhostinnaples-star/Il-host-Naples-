import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { PROPERTY_AREAS } from '../constants';

const areas = [
  { id: 'islands', name: 'Islands (Ischia & Procida)', title: '🌋 Island Escape', search: 'Islands (Ischia & Procida)', image: 'https://images.unsplash.com/photo-1558223067-872f0af3cbf6?auto=format&fit=crop&q=80&w=600' },
  { id: 'center', name: 'Center (Centro Storico)', title: '🍕 The Soul of Naples', search: 'Center (Centro Storico)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/P.Plebiscito_Napoli.jpg/960px-P.Plebiscito_Napoli.jpg' },
  { id: 'seafront', name: 'Seafront (Chiaia - Posillipo)', title: '🌊 Sea & Luxury', search: 'Seafront (Chiaia - Posillipo)', image: 'https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?auto=format&fit=crop&q=80&w=600' },
  { id: 'station', name: 'Station (Piazza Garibaldi)', title: '🚉 Transport Hub', search: 'Station (Piazza Garibaldi)', image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=600' },
  { id: 'stadium', name: 'Stadium (Fuorigrotta - Fair)', title: '⚽ Events & Sports', search: 'Stadium (Fuorigrotta - Fair)', image: 'https://images.unsplash.com/photo-1600762111309-8d197600778c?auto=format&fit=crop&q=80&w=600' },
  { id: 'vomero', name: 'Vomero', title: '☕ Local Daily Life', search: 'Vomero', image: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&q=80&w=600' },
  { id: 'mergellina', name: 'Mergellina', title: '🎭 Romantic Naples', search: 'Mergellina', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Castel_dell%27_Ovo.jpg/960px-Castel_dell%27_Ovo.jpg' },
  { id: 'pozzuoli', name: 'Pozzuoli', title: '⚓ Authentic Fishing Town', search: 'Pozzuoli', image: 'https://images.unsplash.com/photo-1634594503761-0f7236d8d6dc?auto=format&fit=crop&q=80&w=600' },
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
