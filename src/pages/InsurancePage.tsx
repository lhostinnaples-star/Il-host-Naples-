import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Home, UserPlus, Clock, Send } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { BackButton } from '../components/BackButton';
import { toast } from 'sonner';

export const InsurancePage: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Insurance Interest Form Submitted:', formState);
    toast.success("Interest registered! We'll notify you when L Host Protection launches.");
    setFormState({ name: '', email: '' });
  };

  const upcomingFeatures = [
    {
      title: 'Property Damage Protection',
      description: 'Coverage for unexpected damage to your property or personal belongings caused by guests.'
    },
    {
      title: 'Guest Accident Coverage',
      description: 'Protection for your liability in case a guest experiences an injury during their stay.'
    },
    {
      title: 'Liability Insurance',
      description: 'Comprehensive general liability coverage tailored for short-term rental activities.'
    },
    {
      title: '24/7 Emergency Support',
      description: 'Dedicated legal and claims assistance specifically for hosting-related incidents.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-24">
      <SEOHead 
        title="Host Protection - L Host in Naples" 
        description="Coming Soon: Comprehensive insurance and protection for Neapolitan hosts." 
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <BackButton />
        
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest mb-8">
            <Sparkles className="h-3.5 w-3.5" /> Coming Soon
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 italic">
            Host <span className="text-amber-500">Protection</span>
          </h1>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            We are working with leading Neapolitan insurance providers to create the first comprehensive protection package designed specifically for our host community.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-24">
          {upcomingFeatures.map((feature, idx) => (
            <div key={idx} className="bg-[#1e293b] rounded-3xl p-8 border border-[#334155] flex gap-6">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-amber-500">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <section className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-[2rem] p-8 md:p-12 text-[#0f172a] shadow-[0_20px_50px_rgba(245,166,35,0.2)]">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-4 italic">
                Register <span className="text-white">Interest</span>
              </h2>
              <p className="text-[#0f172a]/80 mb-0 font-medium">
                Be the first to know when L Host Protection launches. Early adopters will receive special introductory rates on all coverage packages.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input 
                required
                type="text"
                placeholder="Name"
                value={formState.name}
                onChange={(e) => setFormState({...formState, name: e.target.value})}
                className="flex-1 bg-white/20 border border-white/20 rounded-xl px-4 py-3 placeholder-[#0f172a]/60 outline-none focus:bg-white/30 transition-all font-bold"
              />
              <input 
                required
                type="email"
                placeholder="Email"
                value={formState.email}
                onChange={(e) => setFormState({...formState, email: e.target.value})}
                className="flex-1 bg-white/20 border border-white/20 rounded-xl px-4 py-3 placeholder-[#0f172a]/60 outline-none focus:bg-white/30 transition-all font-bold"
              />
              <button 
                type="submit"
                className="bg-[#0f172a] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Join <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

        <div className="mt-16 flex justify-center gap-12">
          <div className="flex flex-col items-center gap-2">
            <Home className="h-6 w-6 text-amber-500/40" />
            <span className="text-[10px] font-black tracking-widest text-white/20 uppercase italic">Trusted</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500/40" />
            <span className="text-[10px] font-black tracking-widest text-white/20 uppercase italic">Secure</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <UserPlus className="h-6 w-6 text-amber-500/40" />
            <span className="text-[10px] font-black tracking-widest text-white/20 uppercase italic">Local</span>
          </div>
        </div>
      </div>
    </div>
  );
};
