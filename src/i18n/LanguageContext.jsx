import { createContext, useContext, useEffect, useState } from "react";
import en from "./en.json";
import it from "./it.json";

const TRANSLATIONS = { it, en };
const STORAGE_KEY = "nte-language";

function detectDefaultLanguage() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && TRANSLATIONS[stored]) return stored;

  const browserLang = (navigator.language || "it").slice(0, 2).toLowerCase();
  return TRANSLATIONS[browserLang] ? browserLang : "it";
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(detectDefaultLanguage);

  function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
  }

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: TRANSLATIONS[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslations() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslations must be used within a LanguageProvider");
  }
  return ctx;
}
