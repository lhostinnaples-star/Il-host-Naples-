import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { BackButton } from '../components/BackButton';
import { CheckCircle2, AlertCircle, Info, Star, MessageSquare, Tag } from 'lucide-react';

export const HostGuidelinesPage: React.FC = () => {
  const sections = [
    {
      icon: <Info className="h-5 w-5 text-amber-500" />,
      title: '1. CIR Code Requirements',
      content: 'In Italy, and specifically in Campania, every short-term rental property must have a Codice Identificativo Regionale (CIR). We strictly require this code for all listings to ensure legal compliance and professional standards.'
    },
    {
      icon: <Star className="h-5 w-5 text-amber-500" />,
      title: '2. Property Standards',
      content: 'Maintain high standards of cleanliness and comfort. Amenities must be accurate to the listing description. Basic essentials (towels, linens, soap, toilet paper) should always be provided and refreshed for each guest.'
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-amber-500" />,
      title: '3. Response Time Requirements',
      content: 'Hosts are expected to respond to booking requests within 24 hours. Consistent delays in response time may affect search visibility and lister status.'
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-amber-500" />,
      title: '4. Guest Communication',
      content: 'Interact with guests professionally and hospitably. Provide clear check-in instructions and be available for support during their stay. Naples is famous for its welcome; let your hosting reflect that.'
    },
    {
      icon: <Tag className="h-5 w-5 text-amber-500" />,
      title: '5. Pricing Guidelines',
      content: 'Prices should be competitive for the area and property type. Be transparent about any additional fees (cleaning, local tourist tax) and ensure they are clearly communicated in your listing.'
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-amber-500" />,
      title: '6. Booking Pool Participation',
      content: 'When your property is unavailable, help our ecosystem by sharing booking requests to the Manual Pool. This ensures guests find high-quality alternatives and supports our sister hosts.'
    },
    {
      icon: <Star className="h-5 w-5 text-amber-500" />,
      title: '7. Review Policy',
      content: 'Feedback is vital for our community. We encourage hosts to review guests and to learn from guest reviews. Targeted or retaliatory reviews are strictly prohibited.'
    },
    {
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      title: '8. Violation Consequences',
      content: 'Failure to adhere to these guidelines can result in listing suspension, lowered ranking, or permanent removal from the Il Host in Naples platform.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-24">
      <SEOHead 
        title="Host Guidelines - Il Host in Naples" 
        description="Professional standards and community guidelines for hosts in Naples." 
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <BackButton />
        
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 italic">
            Host <span className="text-amber-500">Guidelines</span>
          </h1>
          <p className="text-[#94a3b8] text-lg max-w-2xl">
            Success on our platform is built on professional standards and the authentic Neapolitan spirit of hospitality. These guidelines help ensure a premium experience for every guest.
          </p>
        </header>

        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-[#1e293b] rounded-3xl p-8 border border-[#334155] flex flex-col md:flex-row gap-8 group hover:border-amber-500/30 transition-all duration-300">
              <div className="h-14 w-14 rounded-2xl bg-[#0f172a] flex items-center justify-center shrink-0 border border-[#334155] shadow-inner group-hover:bg-amber-500/10 group-hover:border-amber-500/20 group-hover:text-amber-500 transition-all">
                {section.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-black uppercase tracking-widest text-[#f8fafc] mb-3 italic">
                  {section.title}
                </h2>
                <p className="text-[#94a3b8] leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
