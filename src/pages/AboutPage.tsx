import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Users, Star, ArrowRight, MessageSquare } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { BackButton } from '../components/BackButton';

export const AboutPage: React.FC = () => {
  const stats = [
    { label: 'Verified Hosts', value: '50+' },
    { label: 'Properties', value: '100+' },
    { label: 'Happy Guests', value: '1000+' },
    { label: 'Neighborhoods', value: '8' }
  ];

  const values = [
    { icon: <Heart className="text-red-500" />, title: 'Authenticity', description: 'Real Naples experiences that connect you with the local culture and soul of the city.' },
    { icon: <Shield className="text-blue-500" />, title: 'Trust', description: 'Strict verification for every host and property to ensure your safety and comfort.' },
    { icon: <Users className="text-green-500" />, title: 'Community', description: 'A collaborative ecosystem where hosts help hosts to provide better service.' },
    { icon: <Star className="text-amber-500" />, title: 'Quality', description: 'The "Il Host Verified" standard means premium hospitality in every neighborhood.' }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-24">
      <SEOHead 
        title="About Us - Il Host in Naples" 
        description="Discover the story, mission, and values behind the first Neapolitan hospitality ecosystem." 
      />
      
      <div className="max-w-7xl mx-auto px-6">
        <BackButton />
        
        <header className="max-w-4xl mb-24">
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight mb-8 italic">
            About <span className="text-amber-500">Il Host</span> <br />
            in Naples
          </h1>
          <p className="text-xl md:text-2xl text-[#94a3b8] leading-relaxed font-medium">
            We are building the first comprehensive ecosystem for Neapolitan hospitality, designed to elevate the standard of hosting while preserving the authentic local spirit.
          </p>
        </header>

        <section className="grid lg:grid-cols-2 gap-24 mb-32">
          <div className="space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-tight italic">
              Our <span className="text-amber-500">Story</span>
            </h2>
            <div className="space-y-6 text-[#94a3b8] text-lg leading-relaxed font-medium">
              <p>
                Il Host in Naples was created with a clear vision: to connect travelers with authentic Neapolitan hospitality through a network of trusted professionals.
              </p>
              <p>
                We believe that every guest deserves a truly local experience, every host deserves professional support, and Naples deserves to be discovered properly—not just as a destination, but as a community.
              </p>
            </div>
            
            <div className="pt-8">
              <h2 className="text-3xl font-black uppercase tracking-tight italic mb-8">
                Our <span className="text-amber-500">Mission</span>
              </h2>
              <p className="text-[#f8fafc] text-xl font-bold bg-[#1e293b] p-8 rounded-3xl border-l-8 border-amber-500 shadow-xl">
                "To create the most trusted and efficient hospitality ecosystem in Naples, Italy, by empowering local hosts and delighting global guests."
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#1e293b] rounded-[2rem] p-8 border border-[#334155] flex flex-col justify-center items-center text-center group hover:border-amber-500/30 transition-all duration-500"
              >
                <span className="text-4xl md:text-5xl font-black text-amber-500 mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-[#64748b]">
                  {stat.label}
                </span>
              </motion.div>
            ))}
            <div className="col-span-2 bg-amber-500 rounded-[2rem] p-8 flex flex-col justify-center items-center text-[#0f172a]">
              <span className="text-sm font-black uppercase tracking-widest mb-2 italic">Based in</span>
              <span className="text-3xl font-black uppercase tracking-tight italic">Naples, Italy</span>
            </div>
          </div>
        </section>

        <section className="mb-32">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-12 italic text-center">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-[#1e293b] rounded-[2rem] p-8 border border-[#334155] hover:translate-y-[-8px] transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-[#0f172a] flex items-center justify-center mb-6 text-2xl shadow-inner">
                  {value.icon}
                </div>
                <h3 className="text-white font-black uppercase tracking-tight mb-4 italic">{value.title}</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#1e293b] rounded-[3rem] p-12 md:p-20 border border-[#334155] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 italic">
            Get in <span className="text-amber-500">Touch</span>
          </h2>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto mb-12">
            Whether you're a potential guest, a prospective host, or interested in partnership, we'd love to hear from you.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <a href="mailto:info@ilhostinnaples.com" className="bg-white text-[#0f172a] px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-neutral-200 transition-all flex items-center justify-center gap-2">
              Email Us <ArrowRight className="h-4 w-4" />
            </a>
            <button className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-amber-500 hover:text-[#0f172a] transition-all flex items-center justify-center gap-2">
              WhatsApp Support <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
