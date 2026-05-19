import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { useLanguage, languages, suggestedLanguages } from '../contexts/LanguageContext';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguage } = useLanguage();

  const handleSelect = (code: string) => {
    setLanguage(code);
    onClose();
  };

  const suggested = languages.filter(l => suggestedLanguages.includes(l.code));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative h-full max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-8 py-6">
              <h2 className="text-2xl font-bold text-neutral-900">Select your language</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
               aria-label="Close"><X className="h-6 w-6" /></button>
            </div>

            {/* Content */}
            <div className="h-full overflow-y-auto px-8 py-8 pb-24">
              {/* Suggested Section */}
              <div className="mb-12">
                <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-neutral-400">
                  Suggested for you
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {suggested.map((lang) => (
                    <LanguageItem
                      key={lang.code}
                      lang={lang}
                      isActive={currentLanguage.code === lang.code}
                      onClick={() => handleSelect(lang.code)}
                    />
                  ))}
                </div>
              </div>

              {/* All Languages Section */}
              <div>
                <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-neutral-400">
                  All languages
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {languages.map((lang) => (
                    <LanguageItem
                      key={lang.code}
                      lang={lang}
                      isActive={currentLanguage.code === lang.code}
                      onClick={() => handleSelect(lang.code)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface LanguageItemProps {
  lang: {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
  };
  isActive: boolean;
  onClick: () => void;
}

const LanguageItem: React.FC<LanguageItemProps> = ({ lang, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-start rounded-2xl p-4 text-left transition-all duration-200 hover:bg-neutral-50 ${
        isActive ? 'bg-neutral-50 ring-1 ring-amber-500/20' : ''
      }`}
    >
      <div className="mb-3 flex items-center gap-3">
        <img
          src={`https://flagcdn.com/w40/${lang.flag}.png`}
          alt={lang.name}
          className="h-5 w-7 rounded-sm object-cover shadow-sm"
          referrerPolicy="no-referrer"
        />
        {isActive && <Check className="h-4 w-4 text-amber-500" />}
      </div>
      <div>
        <p className="text-sm font-bold text-neutral-900 group-hover:text-amber-600 transition-colors">
          {lang.nativeName}
        </p>
        <p className="text-xs text-neutral-500">{lang.name}</p>
      </div>
    </button>
  );
};
