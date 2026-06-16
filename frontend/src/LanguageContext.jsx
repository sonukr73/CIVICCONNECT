import React, { createContext, useState, useContext, useEffect } from "react";
import en from "./translations/en.json";
import hi from "./translations/hi.json";

// Create context
const LanguageContext = createContext();

// Dictionary map
const translations = {
  en,
  hi,
};

export const LanguageProvider = ({ children }) => {
  // Read from local storage initially
  const [language, setLanguage] = useState(localStorage.getItem("language"));

  // Expose a change function
  const changeLanguage = (lang) => {
    localStorage.setItem("language", lang);
    setLanguage(lang);
  };

  // Safe translation function
  const t = (key) => {
    if (!language) return key; // fallback if not set
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook so child components can just call `const { t } = useLanguage();`
export const useLanguage = () => useContext(LanguageContext);
