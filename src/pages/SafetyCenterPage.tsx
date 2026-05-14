import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, UserCheck, AlertTriangle, Send } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { BackButton } from '../components/BackButton';
import { toast } from 'sonner';

export const SafetyCenterPage: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', concernType: 'safety', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Safety Concern Form Submitted:', formState);
    toast.success('Your report has been received. Our safety team will investigate immediately.');
    setFormState({ name: '', email: '', concernType: 'safety', description: '' });
  };

  const safetyFeatures = [
    {
      icon: <CheckCircle2 className="h-6 w-6 text-amber-500" />,
      title: 'VERIFIED HOSTS',
      points: [
        'All hosts verified by Il Host Naples team',
        'CIR code checked',
        'ID document verified',
        'In-person property inspection'
      ]
    },
    {
      icon: <UserCheck className="h-6 w-6 text-amber-500" />,
      title: 'GUEST SAFETY',
      points: [
        'Secure booking system',
        '24/7 support available',
        'Emergency contacts provided',
        'Clear cancellation policies'
      ]
    },
    {
      icon: <Shield className="h-6 w-6 text-amber-500" />,
      title: 'HOST SAFETY',
      points: [
        'Guest profile verification',
        'Booking history visible',
        'Community reviews system',
        'Report a concern option'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-12">
      <SEOHead 
        title="Safety Center - Il Host in Naples" 
        description="Your safety is our priority. Learn about our verification process and safety standards." 
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <BackButton />
        
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-[2rem] bg-amber-500/10 text-amber-500 mb-8 border border-amber-500/20 shadow-[0_0_50px_rgba(245,166,35,0.1)]">
            <Shield className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 italic">
            Safety <span className="text-amber-500">Center</span>
          </h1>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            Our commitment to your safety and peace of mind is at the core of everything we do. Naples hospitality is built on trust, and we ensure that trust is preserved.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {safetyFeatures.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#1e293b] rounded-[2rem] p-8 border border-[#334155]"
            >
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6 italic">{feature.title}</h3>
              <ul className="space-y-4">
                {feature.points.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-3 text-sm text-[#94a3b8]">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <section className="bg-[#1e293b] rounded-[2rem] border border-[#334155] p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest mb-6">
                <AlertTriangle className="h-3 w-3" /> Urgent Concern
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-4 italic">
                Report <span className="text-amber-500">a Concern</span>
              </h2>
              <p className="text-[#94a3b8] mb-8 leading-relaxed">
                If you encounter any safety issues, suspicious activity, or property quality concerns, please let us know immediately. Your report is confidential and will be reviewed by our safety specialists.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Name</label>
                  <input 
                    required
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3 focus:border-amber-500 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Email</label>
                  <input 
                    required
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3 focus:border-amber-500 outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Concern Type</label>
                <select 
                  value={formState.concernType}
                  onChange={(e) => setFormState({...formState, concernType: e.target.value})}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3 focus:border-amber-500 outline-none transition-colors appearance-none"
                >
                  <option value="safety">Safety Issue</option>
                  <option value="suspicious">Suspicious Activity</option>
                  <option value="quality">Property Quality</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={formState.description}
                  onChange={(e) => setFormState({...formState, description: e.target.value})}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3 focus:border-amber-500 outline-none transition-colors resize-none"
                  placeholder="Tell us what happened..."
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
              >
                Submit Report <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
