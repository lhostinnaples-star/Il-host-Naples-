import React, { createContext, useContext, useState, useEffect } from 'react';

interface SiteSettings {
  siteName: string;
  tagline: string;
  logo: string;
  primaryColor: string;
  contactEmail: string;
  supportPhone: string;
  heroTitle: string;
  heroSubtitle: string;
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
  };
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'StayEase Naples',
  tagline: 'Authentic Stays in the Heart of Italy',
  logo: '',
  primaryColor: '#fbbf24',
  contactEmail: 'contact@stayease.it',
  supportPhone: '+39 081 123 4567',
  heroTitle: 'Discover Authentic Naples',
  heroSubtitle: 'Luxury apartments and unique experiences curated for the discerning traveler.',
  sections: {
    hero: true,
    featuredProperties: true,
    featuredExperiences: true,
    areas: true,
    newsletter: true,
  },
  seo: {
    title: 'StayEase Naples - Luxury Property Management',
    description: 'Find the best luxury apartments and experiences in Naples, Italy.',
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
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('site_settings', JSON.stringify(settings));
    
    // Apply primary color to CSS variable if needed
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    
    // Update document title
    document.title = settings.seo.title || settings.siteName;
  }, [settings]);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      sections: newSettings.sections ? { ...prev.sections, ...newSettings.sections } : prev.sections,
      seo: newSettings.seo ? { ...prev.seo, ...newSettings.seo } : prev.seo
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
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
