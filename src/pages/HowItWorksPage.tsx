import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, Star, Share2, UserCheck, Layout, Gift, Briefcase, ChevronRight } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { BackButton } from '../components/BackButton';

interface Step {
  title: string;
  description: string;
}

interface TabContentProps {
  steps: Step[];
  icon: React.ReactNode;
  role: string;
}

const TabContent: React.FC<TabContentProps> = ({ steps, icon, role }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {steps.map((step, idx) => (
        <div key={idx} className="bg-[#1e293b] rounded-[2rem] p-8 border border-[#334155] relative group hover:border-amber-500/30 transition-all duration-500">
          <div className="absolute -top-4 -right-4 h-12 w-12 rounded-2xl bg-amber-500 text-[#0f172a] flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
            {idx + 1}
          </div>
          <div className="mb-6 h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            {idx === 0 ? <Search /> : idx === 1 ? icon : idx === 2 ? <UserCheck /> : <Star />}
          </div>
          <h3 className="text-white font-bold text-lg mb-3 tracking-tight">{step.title}</h3>
          <p className="text-[#94a3b8] text-sm leading-relaxed">{step.description}</p>
        </div>
      ))}
    </motion.div>
  );
};

export const HowItWorksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guests' | 'listers' | 'providers' | 'suppliers'>('guests');

  const content = {
    guests: {
      role: 'GUEST',
      icon: <Home />,
      steps: [
        { title: 'Search', description: 'Explore premium properties and unique local experiences across 8 Naples neighborhoods.' },
        { title: 'Request', description: 'Click "Request to Book" on your favorite stay. No immediate payment is required.' },
        { title: 'Confirm', description: 'Wait for the host to confirm your request within 24 hours via email.' },
        { title: 'Enjoy', description: 'Arrive in Naples and experience authentic hospitality with our verified local network.' }
      ]
    },
    listers: {
      role: 'LISTER',
      icon: <Layout />,
      steps: [
        { title: 'Register', description: 'Create your account as a Lister and go through our professional verification process.' },
        { title: 'Add Property', description: 'Upload your property details, CIR code, and high-quality photos to our directory.' },
        { title: 'Accept Requests', description: 'Review booking requests from guests and manage your availability via your dashboard.' },
        { title: 'Share Pool', description: 'If you are full, share the booking to our Manual Pool to help other trusted hosts.' }
      ]
    },
    providers: {
      role: 'SERVICE PROVIDER',
      icon: <Gift />,
      steps: [
        { title: 'Apply', description: 'Register as a Service Provider and showcase your expertise in Neapolitan experiences.' },
        { title: 'Create Service', description: 'Add your tours, classes, or local experiences with pricing and availability.' },
        { title: 'Handle Bookings', description: 'Receive and manage guest requests directly through our intuitive dashboard.' },
        { title: 'Deliver Quality', description: 'Provide world-class experiences that earn high ratings and help grow your local business.' }
      ]
    },
    suppliers: {
      role: 'SUPPLIER',
      icon: <Briefcase />,
      steps: [
        { title: 'Join Network', description: 'Register as a B2B Supplier for linens, cleaning, maintenance, or guest kits.' },
        { title: 'List Services', description: 'Outline your specialized services and wholesale pricing for our host community.' },
        { title: 'Connect', description: 'Engage with Listers looking for reliable partners to maintain property standards.' },
        { title: 'Grow', description: 'Scale your operations within the largest hospitality ecosystem in the Naples area.' }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-24">
      <SEOHead 
        title="How it Works - L Host in Naples" 
        description="Learn how to search properties, list your home, or offer services in Naples." 
      />
      
      <div className="max-w-7xl mx-auto px-6">
        <BackButton />
        
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 italic">
            How it <span className="text-amber-500">Works</span>
          </h1>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            Our ecosystem is designed to be simple, secure, and beneficial for everyone involved in Neapolitan hospitality.
          </p>
        </header>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {(Object.keys(content) as Array<keyof typeof content>).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 border ${
                activeTab === tab 
                ? 'bg-amber-500 text-[#0f172a] border-amber-500 scale-105 shadow-[0_10px_30px_rgba(245,166,35,0.2)]' 
                : 'bg-[#1e293b] text-[#64748b] border-[#334155] hover:border-amber-500/50 hover:text-white'
              }`}
            >
              FOR {tab === 'providers' ? 'SERVICE PROVIDERS' : tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="mb-24">
          <AnimatePresence mode="wait">
            <TabContent 
              key={activeTab}
              steps={content[activeTab].steps} 
              icon={content[activeTab].icon}
              role={content[activeTab].role}
            />
          </AnimatePresence>
        </div>

        <section className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-[3rem] p-12 border border-amber-500/20 text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6 italic">
            Ready to <span className="text-amber-500">Start?</span>
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto mb-10 text-lg">
            Join the first comprehensive ecosystem for Neapolitan hospitality today.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="/register" className="bg-amber-500 text-[#0f172a] px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-amber-400 transition-all flex items-center gap-2">
              Join Community <ChevronRight className="h-4 w-4" />
            </a>
            <a href="/search" className="bg-white/5 border border-white/10 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all">
              Browse Stays
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
