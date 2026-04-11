import { useLang } from '../lib/useLang';

export default function LangToggle() {
  const { lang, setLanguage } = useLang();

  return (
    <div className="fixed bottom-28 right-6 z-[9999] flex rounded-full border border-white/20 bg-zinc-900/90 backdrop-blur-md overflow-hidden shadow-lg">
      <button
        onClick={() => setLanguage('pt')}
        className={`px-3 py-2 text-[11px] font-bold tracking-widest uppercase transition-colors ${
          lang === 'pt' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
        }`}
      >
        PT
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-2 text-[11px] font-bold tracking-widest uppercase transition-colors ${
          lang === 'en' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
}
