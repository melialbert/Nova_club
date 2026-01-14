import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';
import { api } from '../services/api';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('fr');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguageFromClub();
  }, []);

  const loadLanguageFromClub = async () => {
    try {
      const clubData = await api.getClub();
      if (clubData && clubData.language) {
        setLanguage(clubData.language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      await api.updateClub({ language: newLanguage });
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
      }
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
