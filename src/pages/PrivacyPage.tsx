import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { BackButton } from '../components/BackButton';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const sections = [
    {
      icon: <FileText className="h-5 w-5 text-amber-500" />,
      title: '1. Data We Collect',
      content: 'We collect personal information that you provide to us, including your name, email address, phone number, and property details (for Listers). We also collect technical data about how you interact with our platform.'
    },
    {
      icon: <Eye className="h-5 w-5 text-amber-500" />,
      title: '2. How We Use Your Data',
      content: 'Your data is used to provide and improve our services, facilitate bookings, verify lister identities, and communicate important updates and promotional offers according to your preferences.'
    },
    {
      icon: <Lock className="h-5 w-5 text-amber-500" />,
      title: '3. Data Storage & Security',
      content: 'We use industry-standard security measures to protect your data. Your information is stored on secure servers with encrypted access controls.'
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-amber-500" />,
      title: '4. Your Rights (GDPR)',
      content: 'Under GDPR, you have the right to access, rectify, or delete your personal data. You can also request data portability and object to processing in certain circumstances. Contact us at privacy@ilhostinnaples.com to exercise these rights.'
    },
    {
      icon: <FileText className="h-5 w-5 text-amber-500" />,
      title: '5. Cookies Policy',
      content: 'We use cookies to enhance your browsing experience, remember your settings, and analyze platform traffic. You can manage your cookie preferences through your browser settings.'
    },
    {
      icon: <Lock className="h-5 w-5 text-amber-500" />,
      title: '6. Third Party Services',
      content: 'We may share necessary data with trusted third-party providers such as Firebase (authentication and database), Cloudinary (image storage), and Google Maps (location services) to provide our core features.'
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-amber-500" />,
      title: '7. Contact for Privacy',
      content: 'For any privacy-related inquiries, please reach out to our Data Protection Officer at privacy@ilhostinnaples.com.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-24">
      <SEOHead 
        title="Privacy Policy - Il Host in Naples" 
        description="Learn how we protect your information and comply with GDPR standards." 
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <BackButton />
        
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 italic">
            Privacy <span className="text-amber-500">Policy</span>
          </h1>
          <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-[#64748b]">
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">Last Updated: January 2026</span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">GDPR Compliant</span>
          </div>
        </header>

        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-[#1e293b] rounded-[2rem] p-8 border border-[#334155] flex flex-col md:flex-row gap-6">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                {section.icon}
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-amber-500 mb-3 italic">
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
