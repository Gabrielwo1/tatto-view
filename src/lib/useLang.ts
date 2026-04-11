import { create } from 'zustand';

export type Lang = 'pt' | 'en';

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem('vitrink_lang');
    if (stored === 'pt' || stored === 'en') return stored;
  } catch { /* ignore */ }
  const lang = navigator.language ?? '';
  if (lang.startsWith('pt')) return 'pt';
  return 'en';
}

interface LangStore {
  lang: Lang;
  setLanguage: (l: Lang) => void;
}

export const useLang = create<LangStore>((set) => ({
  lang: getInitialLang(),
  setLanguage: (l) => {
    try { localStorage.setItem('vitrink_lang', l); } catch { /* ignore */ }
    set({ lang: l });
  },
}));
