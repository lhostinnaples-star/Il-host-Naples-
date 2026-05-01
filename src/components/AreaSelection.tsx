import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const areas = [
  { name: 'ISLANDS', image: 'https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?auto=format&fit=crop&q=80&w=600' },
  { name: 'CENTER', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/P.Plebiscito_Napoli.jpg/960px-P.Plebiscito_Napoli.jpg' },
  { name: 'SEAFRONT', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Castel_dell%27_Ovo.jpg/960px-Castel_dell%27_Ovo.jpg' },
  { name: 'STATION', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Gare_ferroviaire_de_Naples-Centrale.jpg/960px-Gare_ferroviaire_de_Naples-Centrale.jpg' },
  { name: 'STADIUM', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Stadio_Maradona_Serie_A.jpg/960px-Stadio_Maradona_Serie_A.jpg' },
  { name: 'VOMERO', image: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&q=80&w=600' },
];

export const AreaSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="mb-8 text-center text-3xl font-serif font-bold text-slate-800">
        In which area do you want to stay?
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {areas.map((area) => (
          <motion.div
            key={area.name}
            whileHover={{ y: -8, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            onClick={() => navigate(`/search?area=${area.name}`)}
            className="group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-xl"
          >
            <img
              src={area.image}
              alt={area.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-transparent" />
            <div className="absolute bottom-4 left-0 w-full text-center">
              <span className="text-sm font-bold tracking-widest text-white">{area.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
