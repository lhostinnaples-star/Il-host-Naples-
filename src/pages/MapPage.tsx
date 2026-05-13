import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useHotels } from '../contexts/HotelsContext';
import { ArrowRight, CheckCircle2, Clock, Briefcase, Luggage, Activity, Car, ShoppingBag } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

const areas = [
  { id: 'Everyone', label: 'Everyone', activeBg: 'bg-[#1e293b]', activeText: 'text-[#fbbf24]' },
  { id: 'Center (Centro Storico)', label: 'Center', activeBg: 'bg-[#fbbf24]', activeText: 'text-[#1e293b]' },
  { id: 'Seafront (Chiaia - Posillipo)', label: 'Seafront', activeBg: 'bg-[#0284c7]', activeText: 'text-white' },
  { id: 'Stadium (Fuorigrotta - Fair)', label: 'Stadium', activeBg: 'bg-[#10b981]', activeText: 'text-white' },
  { id: 'Station (Piazza Garibaldi)', label: 'Station', activeBg: 'bg-[#ef4444]', activeText: 'text-white' },
  { id: 'Islands (Ischia & Procida)', label: 'Islands', activeBg: 'bg-[#14b8a6]', activeText: 'text-white' },
  { id: 'Vomero', label: 'Vomero', activeBg: 'bg-[#8b5cf6]', activeText: 'text-white' }
];

const services = [
  { icon: CheckCircle2, title: 'Housekeeping', desc: 'Daily cleaning service' },
  { icon: Clock, title: 'Long stays', desc: 'Special rates for extended visits' },
  { icon: Briefcase, title: 'Check-in', desc: '24/7 reception and support' },
  { icon: Luggage, title: 'Luggage storage', desc: 'Secure storage before/after stay' },
  { icon: Activity, title: 'Activities', desc: 'Guided tours and local experiences' },
  { icon: Car, title: 'Transfer', desc: 'Airport and station transfers' },
  { icon: ShoppingBag, title: 'Food Bag', desc: 'Local delicacies delivered to you' }
];

// Custom marker icon based on area
const getAreaColor = (areaId: string) => {
  switch(areaId) {
    case 'Center (Centro Storico)': return '#fbbf24'; // Gold
    case 'Seafront (Chiaia - Posillipo)': return '#0284c7'; // Deep Blue
    case 'Stadium (Fuorigrotta - Fair)': return '#10b981'; // Emerald
    case 'Station (Piazza Garibaldi)': return '#ef4444'; // Red
    case 'Islands (Ischia & Procida)': return '#14b8a6'; // Teal
    case 'Vomero': return '#8b5cf6'; // Purple
    default: return '#1e293b'; // Deep Slate
  }
};

const createMarkerIcon = (areaId: string) => {
  const color = getAreaColor(areaId);
  const svg = `<svg viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 11.2 16 26 16 26s16-14.8 16-26C32 7.163 24.837 0 16 0zm0 22c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
  </svg>`;
  
  return divIcon({
    html: svg,
    className: 'bg-transparent border-none drop-shadow-md',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40]
  });
};

export const MapPage: React.FC = () => {
  const { hotels } = useHotels();
  const [selectedArea, setSelectedArea] = useState('Everyone');

  const filteredHotels = useMemo(() => {
    if (selectedArea === 'Everyone') return hotels;
    return hotels.filter(h => h.area === selectedArea);
  }, [hotels, selectedArea]);

  return (
    <>
      <SEOHead 
        title="Naples Property Map" 
        description="Find holiday houses and B&Bs on the interactive Naples map."
      />
      <div className="min-h-screen bg-white">
      
      {/* Header Section */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-display text-[#1e293b] mb-6">Map</h1>
        <div className="flex justify-center mb-8">
          <svg width="100" height="20" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10" stroke="#fbbf24" strokeWidth="3" fill="none" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-slate-600 leading-relaxed">
            Our Naples accommodation map will allow you to view the vast selection of our properties. 
            Zoom in to discover the exact locations and explore nearby public services, attractions, and transport links.
          </p>
        </div>
      </div>

      {/* Area Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-16 px-4">
        {areas.map(area => {
          const isActive = selectedArea === area.id;
          return (
            <button
              key={area.id}
              onClick={() => setSelectedArea(area.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                isActive 
                  ? `${area.activeBg} ${area.activeText} border-transparent shadow-lg` 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#fbbf24] hover:text-[#1e293b]'
              }`}
            >
              {area.label}
            </button>
          );
        })}
      </div>

      {/* Map Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-32">
        <div className="max-w-[1600px] mx-auto h-[700px] rounded-2xl shadow-[0_20px_50px_-12px_rgba(30,41,59,0.25)] overflow-hidden border border-slate-100 relative z-0">
          <MapContainer 
            center={[40.8518, 14.2681]} 
            zoom={12} 
            scrollWheelZoom={false}
            className="w-full h-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            <MarkerClusterGroup chunkedLoading>
              {filteredHotels.map(hotel => {
                if (!hotel.lat || !hotel.lng) return null;
                return (
                  <Marker 
                    key={hotel.id} 
                    position={[hotel.lat, hotel.lng]}
                    icon={createMarkerIcon(hotel.area || 'Everyone')}
                  >
                    <Popup className="rounded-xl border-0 shadow-xl">
                        <div className="p-1">
                          <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-36 object-cover rounded-lg mb-4" />
                          <h3 className="font-display font-bold text-lg text-[#1e293b] mb-1">{hotel.name}</h3>
                          <p className="text-sm text-slate-500 mb-3">{hotel.area}</p>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-[#fbbf24] text-lg">€{hotel.price} <span className="text-sm text-slate-500 font-normal">/ night</span></p>
                            <button 
                              onClick={() => {
                                const typeSlug = (hotel.type || 'Holiday House').toLowerCase().replace(/\s+/g, '-');
                                const areaSlug = (hotel.area || 'Napoli').toLowerCase().replace(/\s+/g, '-');
                                const nameSlug = hotel.name.toLowerCase().replace(/\s+/g, '-');
                                window.location.href = `/hotel/${hotel.id}`;
                              }}
                              className="text-xs font-black uppercase text-[#1e293b] underline"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </div>

      {/* Our Services Section */}
      <div className="bg-slate-50 py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display text-[#1e293b] mb-4">Our Services</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              We offer a comprehensive range of services designed to make your stay in Naples as comfortable and memorable as possible.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="group bg-white p-8 rounded-2xl border border-slate-100 hover:border-[#fbbf24]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col">
                <service.icon className="w-10 h-10 text-[#fbbf24] mb-6 stroke-[1.5]" />
                <h3 className="text-xl font-display text-[#1e293b] mb-3">{service.title}</h3>
                <p className="text-slate-500 mb-8 flex-grow leading-relaxed">{service.desc}</p>
                <div className="flex items-center text-[#1e293b] font-medium text-sm mt-auto">
                  <span className="group-hover:text-[#fbbf24] transition-colors">Find out more</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform text-[#fbbf24]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="relative py-32 bg-[url('https://images.unsplash.com/photo-1534445867742-43195f401b6c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-[#1e293b]/80 backdrop-blur-[2px]"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <h2 className="text-4xl md:text-5xl font-display text-white mb-6">What are you waiting for?</h2>
          <p className="text-xl text-slate-200 mb-10 font-light">Experience the magic of Naples with our premium accommodations.</p>
          <button className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e293b] font-bold text-lg px-10 py-4 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] hover:-translate-y-1">
            FIND YOUR ACCOMMODATION
          </button>
        </div>
      </div>

    </div>
    </>
  );
};
