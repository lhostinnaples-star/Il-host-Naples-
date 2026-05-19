import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import { toast } from 'sonner';

interface SiteSettings {
  siteName: string;
  tagline: string;
  logo: string;
  primaryColor: string;
  contactEmail: string;
  supportPhone: string;
  heroTitle: string;
  heroSubtitle: string;
  homepage: {
    heroTitle: string;
    heroSubtitle: string;
    featuredPropertiesTitle: string;
    featuredPropertiesSubtitle: string;
    experiencesSectionTitle: string;
    experiencesSubtitle: string;
    bookingPoolTitle: string;
    bookingPoolSubtitle: string;
    verifiedTitle: string;
    testimonialsTitle: string;
    cityGuideTitle: string;
    joinTitle: string;
  };
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    text: string;
    rating: number;
    avatar?: string;
  }>;
  areas: Array<{
    id: string;
    name: string;
    tagline: string;
    icon: string;
    imageUrl: string;
    searchParam: string;
  }>;
  footer: {
    tagline: string;
    facebookUrl: string;
    instagramUrl: string;
    copyrightText: string;
  };
  cityGuide: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    linkUrl: string;
  }>;
  joinSection: Array<{
    id: string;
    title: string;
    description: string;
    buttonText: string;
    role: string;
  }>;
  sections: {
    hero: boolean;
    featuredProperties: boolean;
    featuredExperiences: boolean;
    areas: boolean;
    newsletter: boolean;
  };
  seo: {
    title: string;
    description: string;
    allowIndexing?: boolean;
  };
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Il Host in Naples',
  tagline: 'Made with ❤️ in Naples',
  logo: '',
  primaryColor: '#fbbf24',
  contactEmail: 'contact@ilhostinnaples.it',
  supportPhone: '+39 081 123 4567',
  heroTitle: 'Discover Authentic Naples',
  heroSubtitle: 'Luxury apartments and unique experiences curated for the discerning traveler.',
  homepage: {
    heroTitle: 'Live Naples Like a Local',
    heroSubtitle: 'Authentic stays, real experiences, trusted local hosts in Naples',
    featuredPropertiesTitle: 'Handpicked Stays in Naples',
    featuredPropertiesSubtitle: 'Hand-picked stays...',
    experiencesSectionTitle: 'Authentic Naples Experiences',
    experiencesSubtitle: 'Discover what Naples...',
    bookingPoolTitle: 'Never Lose a Booking Again',
    bookingPoolSubtitle: '...',
    verifiedTitle: 'Every Stay is Il Host Verified',
    testimonialsTitle: 'What Our Community Says',
    cityGuideTitle: 'Naples City Guide',
    joinTitle: 'Become Part of the Ecosystem'
  },
  testimonials: [
    {
      id: '1',
      name: 'Marco Rossi',
      role: 'Guest',
      text: 'Amazing experience in Naples...',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?u=marco'
    },
    {
      id: '2',
      name: 'Sofia Esposito',
      role: 'Lister',
      text: 'Best platform for Naples hosts...',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?u=sofia'
    },
    {
      id: '3',
      name: 'Anna Bianchi',
      role: 'Service Provider',
      text: 'Great community of professionals...',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?u=anna'
    }
  ],
  areas: [
    {
      id: '1',
      name: 'Islands (Ischia & Procida)',
      tagline: 'Island Escape',
      icon: 'anchor',
      imageUrl: 'https://images.unsplash.com/photo-1591930444969-9e3f3f8b5e8a?w=800',
      searchParam: 'Islands (Ischia & Procida)'
    },
    {
      id: '2',
      name: 'Center (Centro Storico)',
      tagline: 'The Soul of Naples',
      icon: 'landmark',
      imageUrl: 'https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?w=800',
      searchParam: 'Center (Centro Storico)'
    },
    {
      id: '3',
      name: 'Seafront (Chiaia - Posillipo)',
      tagline: 'Sea & Luxury',
      icon: 'waves',
      imageUrl: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=800',
      searchParam: 'Seafront (Chiaia - Posillipo)'
    },
    {
      id: '4',
      name: 'Station (Piazza Garibaldi)',
      tagline: 'Transport Hub',
      icon: 'train',
      imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800',
      searchParam: 'Station (Piazza Garibaldi)'
    },
    {
      id: '5',
      name: 'Stadium (Fuorigrotta - Fair)',
      tagline: 'Events & Sports',
      icon: 'trophy',
      imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
      searchParam: 'Stadium (Fuorigrotta - Fair)'
    },
    {
      id: '6',
      name: 'Vomero',
      tagline: 'Local Daily Life',
      icon: 'home',
      imageUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
      searchParam: 'Vomero'
    },
    {
      id: '7',
      name: 'Mergellina',
      tagline: 'Romantic Naples',
      icon: 'heart',
      imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800',
      searchParam: 'Mergellina'
    },
    {
      id: '8',
      name: 'Pozzuoli',
      tagline: 'Authentic Fishing Town',
      icon: 'fish',
      imageUrl: 'https://images.unsplash.com/photo-1569230919100-d3fd5e1132f4?w=800',
      searchParam: 'Pozzuoli'
    }
  ],
  footer: {
    tagline: 'The first comprehensive ecosystem for Neapolitan hospitality...',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    copyrightText: '© 2026 IL HOST IN NAPLES. MADE WITH LOVE IN NAPLES.'
  },
  cityGuide: [
    {
      id: '1',
      title: 'Best Areas to Stay in Naples 2026',
      description: 'From historic center...',
      imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=600',
      linkUrl: '/search?area=Center (Centro Storico)'
    },
    {
      id: '2',
      title: 'Top 10 Authentic Naples Experiences',
      description: 'Discover the best...',
      imageUrl: 'https://images.unsplash.com/photo-1591873117462-fd826bbd5663?auto=format&fit=crop&q=80&w=600',
      linkUrl: '/services'
    },
    {
      id: '3',
      title: 'Naples Food Guide',
      description: 'Pizza, pasta and more...',
      imageUrl: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&q=80&w=600',
      linkUrl: '/search'
    }
  ],
  joinSection: [
    {
      id: '1',
      title: 'Become an Il Host Lister',
      description: 'List your property...',
      buttonText: 'Start Listing',
      role: 'lister'
    },
    {
      id: '2',
      title: 'Share Your Naples',
      description: 'Offer experiences...',
      buttonText: 'Become a Provider',
      role: 'provider'
    },
    {
      id: '3',
      title: 'Supply to Top Hosts',
      description: 'Grow your B2B business...',
      buttonText: 'Join Network',
      role: 'supplier'
    }
  ],
  sections: {
    hero: true,
    featuredProperties: true,
    featuredExperiences: true,
    areas: true,
    newsletter: true,
  },
  seo: {
    title: 'Il Host in Naples - Luxury Property Management',
    description: 'Find authentic holiday houses, B&Bs and experiences in Naples, Italy',
    allowIndexing: true,
  }
};

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('site_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        homepage: { ...DEFAULT_SETTINGS.homepage, ...(parsed.homepage || {}) },
        footer: { ...DEFAULT_SETTINGS.footer, ...(parsed.footer || {}) },
        testimonials: parsed.testimonials || DEFAULT_SETTINGS.testimonials,
        areas: parsed.areas || DEFAULT_SETTINGS.areas,
        cityGuide: parsed.cityGuide || DEFAULT_SETTINGS.cityGuide,
        joinSection: parsed.joinSection || DEFAULT_SETTINGS.joinSection,
      };
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('site_settings', JSON.stringify(settings));
    
    // Apply primary color to CSS variable if needed
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    
    // Update document title
    document.title = settings.seo.title || settings.siteName;
  }, [settings]);

  useEffect(() => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (!isDemoMode) {
      const settingsRef = doc(db, 'site_settings', 'global');
      const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSettings(prev => ({
            ...prev,
            ...data,
            homepage: { ...prev.homepage, ...(data.homepage || {}) },
            footer: { ...prev.footer, ...(data.footer || {}) },
            sections: { ...prev.sections, ...(data.sections || {}) },
            seo: { ...prev.seo, ...(data.seo || {}) },
            testimonials: data.testimonials || prev.testimonials,
            areas: data.areas || prev.areas,
            cityGuide: data.cityGuide || prev.cityGuide,
            joinSection: data.joinSection || prev.joinSection,
          }));
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'site_settings/global');
      });
      return () => unsubscribe();
    }
  }, []);

  const updateSettings = React.useCallback(async (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      homepage: newSettings.homepage ? { ...prev.homepage, ...newSettings.homepage } : prev.homepage,
      footer: newSettings.footer ? { ...prev.footer, ...newSettings.footer } : prev.footer,
      sections: newSettings.sections ? { ...prev.sections, ...newSettings.sections } : prev.sections,
      seo: newSettings.seo ? { ...prev.seo, ...newSettings.seo } : prev.seo
    }));

    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (!isDemoMode) {
      try {
        const settingsRef = doc(db, 'site_settings', 'global');
        await setDoc(settingsRef, newSettings, { merge: true });
      } catch (e) {
        console.error("Error saving settings to Firestore:", e);
        toast.warning("Offline mode: Settings saved locally");
      }
    }
  }, []);

  const resetSettings = React.useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);

    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (!isDemoMode) {
      try {
        const settingsRef = doc(db, 'site_settings', 'global');
        await setDoc(settingsRef, DEFAULT_SETTINGS);
      } catch (e) {
        console.error("Error resetting settings in Firestore:", e);
        toast.warning("Offline mode: Settings reset locally");
      }
    }
  }, []);

  const value = React.useMemo(() => ({ 
    settings, 
    updateSettings, 
    resetSettings 
  }), [settings, updateSettings, resetSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
