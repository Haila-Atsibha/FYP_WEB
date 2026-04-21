"use client";

import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { en } from "../locales/en";
import { am } from "../locales/am";

const translations = {
  en,
  am,
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }

  const { language, toggleLanguage } = context;

  const t = (key) => {
    return translations[language][key] || key;
  };

  return { t, language, toggleLanguage };
};
