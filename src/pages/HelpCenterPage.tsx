import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, MessageSquare, Phone as WhatsApp, Mail, Send } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { BackButton } from '../components/BackButton';
import { toast } from 'sonner';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#334155]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-amber-500 transition-colors group"
      >
        <span className="font-bold text-lg">{question}</span>
        <ChevronDown 
          className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-500' : 'text-[#64748b]'}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[#94a3b8] leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'contact_requests'), {
        name: formState.name,
        email: formState.email,
        message: formState.message,
        createdAt: serverTimestamp(),
        status: 'unread'
      });
      toast.success('Message sent! Our team will contact you soon.');
      setFormState({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send message. Please try again later.');
    }
  };

  const sections = [
    {
      title: 'FOR GUESTS',
      faqs: [
        {
          question: 'How do I book a property?',
          answer: 'Browse properties, click "Request to Book", fill in your details and submit. The host will respond within 24 hours.'
        },
        {
          question: 'Can I cancel my booking?',
          answer: 'Yes, you can cancel from your dashboard. Cancellation policy depends on the host.'
        },
        {
          question: 'How do I contact my host?',
          answer: 'After booking is confirmed, host contact details are visible in your dashboard.'
        }
      ]
    },
    {
      title: 'FOR LISTERS',
      faqs: [
        {
          question: 'How do I list my property?',
          answer: 'Register as a Lister, complete verification, get approved by admin, then add your property.'
        },
        {
          question: 'What is the Booking Pool?',
          answer: 'When your property is full, share the booking to our pool. Other listers can accept the guest.'
        },
        {
          question: 'What documents do I need?',
          answer: 'CIR code (Italian tourist registration) and valid ID document.'
        }
      ]
    },
    {
      title: 'FOR SERVICE PROVIDERS',
      faqs: [
        {
          question: 'How do I list my service?',
          answer: 'Register as Service Provider, get approved, then add your experiences from dashboard.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-12">
      <SEOHead 
        title="Help Center - Il Host in Naples" 
        description="Find answers to common questions and contact our support team." 
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <BackButton />
        
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 italic italic">
            Help <span className="text-amber-500">Center</span>
          </h1>
          <p className="text-[#94a3b8] text-lg mb-8">How can we help you today?</p>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748b]" />
            <input 
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </header>

        <div className="space-y-16 mb-24">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-8 italic">
                {section.title}
              </h2>
              <div className="bg-[#1e293b]/50 rounded-3xl border border-[#334155] overflow-hidden px-8">
                {section.faqs.map((faq, idx) => (
                  <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <section id="contact" className="bg-[#1e293b] rounded-[2rem] border border-[#334155] p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-4 italic">
                Still need <span className="text-amber-500">help?</span>
              </h2>
              <p className="text-[#94a3b8] mb-8">
                Can't find what you're looking for? Our team is available to assist you with any questions or concerns.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#64748b] uppercase tracking-widest">Email</p>
                    <p className="font-bold">info@ilhostinnaples.com</p>
                  </div>
                </div>
                
                <button className="flex items-center gap-4 w-full text-left group">
                  <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#64748b] uppercase tracking-widest">WhatsApp</p>
                    <p className="font-bold">Chat with us</p>
                  </div>
                </button>
              </div>
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
                <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState({...formState, message: e.target.value})}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3 focus:border-amber-500 outline-none transition-colors resize-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-amber-500 text-[#0f172a] rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors shadow-[0_8px_24px_rgba(245,166,35,0.2)]"
              >
                Send Message <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
