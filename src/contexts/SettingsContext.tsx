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
  siteName: 'Il Host in Naples',
  tagline: 'Made with ❤️ in Naples',
  logo: '',
  primaryColor: '#fbbf24',
  contactEmail: 'contact@ilhostinnaples.it',
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
    title: 'Il Host in Naples - Luxury Property Management',
    description: 'Find authentic holiday houses, B&Bs and experiences in Naples, Italy',
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

  const updateSettings = React.useCallback((newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      sections: newSettings.sections ? { ...prev.sections, ...newSettings.sections } : prev.sections,
      seo: newSettings.seo ? { ...prev.seo, ...newSettings.seo } : prev.seo
    }));
  }, []);

  const resetSettings = React.useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
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
