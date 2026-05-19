import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';
import { Logo } from './Logo';
import { useSettings } from '../contexts/SettingsContext';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    // Check if we are on landing page and scroll to contact if it exists
    setTimeout(() => {
      const element = document.getElementById('contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <footer className="bg-[#0f172a] text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <Logo height={48} className="w-auto" />
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-8 max-w-sm font-medium">
              {settings.footer.tagline}
            </p>
            <div className="flex gap-4">
              <a href={settings.footer.facebookUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-[#0f172a] transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href={settings.footer.instagramUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-[#0f172a] transition-all">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-8 italic">Company</h4>
            <ul className="space-y-4 text-sm text-neutral-400 font-medium">
              <li><a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }} className="hover:text-amber-500 transition-colors">About Us</a></li>
              <li><a href="/how-it-works" onClick={(e) => { e.preventDefault(); navigate('/how-it-works'); }} className="hover:text-amber-500 transition-colors">How it Works</a></li>
              <li><a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }} className="hover:text-amber-500 transition-colors">Community</a></li>
              <li><a href="/services" onClick={(e) => { e.preventDefault(); navigate('/services'); }} className="hover:text-amber-500 transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-8 italic">For Hosts</h4>
            <ul className="space-y-4 text-sm text-neutral-400 font-medium">
              <li><a href="/register?role=lister" onClick={(e) => { e.preventDefault(); navigate('/register?role=lister'); }} className="hover:text-amber-500 transition-colors">List your Property</a></li>
              <li><a href="/owner" onClick={(e) => { e.preventDefault(); navigate('/owner'); }} className="hover:text-amber-500 transition-colors">Owner Tools</a></li>
              <li><a href="/insurance" onClick={(e) => { e.preventDefault(); navigate('/insurance'); }} className="hover:text-amber-500 transition-colors">Insurance</a></li>
              <li><a href="/guidelines" onClick={(e) => { e.preventDefault(); navigate('/guidelines'); }} className="hover:text-amber-500 transition-colors">Host Guidelines</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-8 italic">For Guests</h4>
            <ul className="space-y-4 text-sm text-neutral-400 font-medium">
              <li><a href="/search" onClick={(e) => { e.preventDefault(); navigate('/search'); }} className="hover:text-amber-500 transition-colors">Find a Stay</a></li>
              <li><a href="/services" onClick={(e) => { e.preventDefault(); navigate('/services'); }} className="hover:text-amber-500 transition-colors">Experiences</a></li>
              <li><a href="/map" onClick={(e) => { e.preventDefault(); navigate('/map'); }} className="hover:text-amber-500 transition-colors">Map</a></li>
              <li><a href="/search" onClick={(e) => { e.preventDefault(); navigate('/search'); }} className="hover:text-amber-500 transition-colors">Reviews</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-8 italic">Support</h4>
            <ul className="space-y-4 text-sm text-neutral-400 font-medium">
              <li><a href="/help" onClick={(e) => { e.preventDefault(); navigate('/help'); }} className="hover:text-amber-500 transition-colors">Help Center</a></li>
              <li><a href="/safety" onClick={(e) => { e.preventDefault(); navigate('/safety'); }} className="hover:text-amber-500 transition-colors">Safety Center</a></li>
              <li><a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} className="hover:text-amber-500 transition-colors">Terms</a></li>
              <li><a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} className="hover:text-amber-500 transition-colors">Privacy</a></li>
              <li><a href="#contact" onClick={handleContactClick} className="hover:text-amber-500 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#334155] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#64748b] text-sm uppercase font-bold tracking-widest">
            {settings.footer.copyrightText}
          </p>
          <p className="text-[#64748b] text-sm">
            EN | IT
          </p>
        </div>
      </div>
    </footer>
  );
};
