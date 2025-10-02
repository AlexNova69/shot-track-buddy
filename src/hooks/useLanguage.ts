import { useEffect, useState } from "react";

type Language = "ru" | "en";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved) return saved;
    
    // Auto-detect system language
    const systemLang = navigator.language.toLowerCase();
    return systemLang.startsWith("ru") ? "ru" : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return { language, setLanguage };
}
