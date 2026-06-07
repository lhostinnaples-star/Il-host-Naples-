import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { BackButton } from '../components/BackButton';

export const TermsPage: React.FC = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using the L Host in Naples platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.'
    },
    {
      title: '2. Platform Description',
      content: 'L Host in Naples acts as a marketplace and ecosystem connecting property owners (Listers), service providers, and guests. We do not own the properties or provide the services directly, except where explicitly stated.'
    },
    {
      title: '3. User Responsibilities',
      content: 'Users are responsible for providing accurate information and maintaining the security of their accounts. Any illegal or unauthorized use of the platform and its services is strictly prohibited.'
    },
    {
      title: '4. Lister Obligations',
      content: 'Listers must strictly adhere to Italian laws, including possessing a valid CIR code for their property. Properties must meet the safety and quality standards defined by our community guidelines.'
    },
    {
      title: '5. Guest Obligations',
      content: 'Guests must respect the house rules of the properties they book and interact respectfully with hosts and service providers.'
    },
    {
      title: '6. Booking Policy',
      content: 'Our platform currently operates on a request-based system. A booking is only confirmed when the Lister explicitly accepts the request through the platform. No payments are processed through the platform directly at this time.'
    },
    {
      title: '7. Cancellation Policy',
      content: 'Cancellation policies are set by individual Listers. It is the responsibility of the Guest to review these policies before submitting a booking request.'
    },
    {
      title: '8. Prohibited Activities',
      content: 'Users may not use the platform for fraudulent purposes, to harass others, or to bypass our connecting system for commercial benefit without authorization.'
    },
    {
      title: '9. Limitation of Liability',
      content: 'L Host in Naples is not liable for disputes between users, property damage, or service quality issues, though we will provide assistance in dispute resolution where possible.'
    },
    {
      title: '10. Governing Law',
      content: 'These terms are governed by Italian law. Any disputes shall be subject to the exclusive jurisdiction of the courts of Naples, Italy.'
    },
    {
      title: '11. Contact Information',
      content: 'For questions regarding these terms, please contact legal@ilhostinnaples.com.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-24">
      <SEOHead 
        title="Terms & Conditions - L Host in Naples" 
        description="Read the terms and conditions for using the L Host in Naples platform." 
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <BackButton />
        
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 italic">
            Terms & <span className="text-amber-500">Conditions</span>
          </h1>
          <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-[#64748b]">
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">Last Updated: January 2026</span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">Language: English</span>
          </div>
        </header>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-[#1e293b]/50 rounded-[2rem] p-8 border border-[#334155]">
              <h2 className="text-lg font-black uppercase tracking-widest text-amber-500 mb-4 italic">
                {section.title}
              </h2>
              <p className="text-[#94a3b8] leading-relaxed font-medium">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <footer className="mt-16 text-center text-[#64748b] text-sm italic">
          Disclaimer: This is a demo template for educational purposes. For a live platform, always consult with legal professionals.
        </footer>
      </div>
    </div>
  );
};
