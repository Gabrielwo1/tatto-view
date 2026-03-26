import { useState } from 'react';
import { generateTattooPreview } from '../lib/generateTattooPreview';
import { TATTOO_STYLES } from '../types';

const PLACEMENTS = [
  'braço', 'antebraço', 'ombro', 'costas', 'peito', 'perna', 'panturrilha',
  'costela', 'pescoço', 'mão', 'pé', 'coxa',
];

type State = 'idle' | 'loading' | 'done' | 'error';

export default function TattooPreviewPage() {
  const [style, setStyle]           = useState(TATTOO_STYLES[0]);
  const [description, setDescription] = useState('');
  const [placement, setPlacement]   = useState('');
  const [state, setState]           = useState<State>('idle');
  const [imageUrl, setImageUrl]     = useState<string | null>(null);
  const [error, setError]           = useState('');

  async function handleGenerate() {
    if (!description.trim()) return;
    setState('loading');
    setError('');
    setImageUrl(null);
    try {
      const url = await generateTattooPreview(style, description, placement);
      setImageUrl(url);
      setState('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido.');
      setState('error');
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 pt-16 pb-10">
        <p className="font-body text-[10px] font-bold tracking-widest uppercase text-ink2-500 mb-4">
          Tecnologia + Arte
        </p>
        <h1 className="font-display text-5xl sm:text-7xl uppercase leading-none text-white mb-4">
          Prévia de<br />Tatuagem
        </h1>
        <p className="font-body text-sm text-white/50 max-w-md">
          Descreva sua ideia, escolha o estilo e veja uma prévia gerada por IA em segundos.
        </p>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 pb-20">
        <div className="border border-white/10 p-8 space-y-7">

          {/* Descrição */}
          <div>
            <label className="block font-body text-xs font-semibold tracking-widest uppercase text-white/50 mb-2">
              Descreva sua tatuagem
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Ex: uma rosa com espinhos envolvendo uma caveira, fundo escuro..."
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-ink-500/60 transition-colors resize-none"
            />
          </div>

          {/* Estilo + Local */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-body text-xs font-semibold tracking-widest uppercase text-white/50 mb-2">
                Estilo
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-black border border-white/20 px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-ink-500/60 transition-colors"
              >
                {TATTOO_STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-body text-xs font-semibold tracking-widest uppercase text-white/50 mb-2">
                Local do corpo <span className="text-white/20 normal-case">(opcional)</span>
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                className="w-full bg-black border border-white/20 px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-ink-500/60 transition-colors"
              >
                <option value="">— qualquer lugar —</option>
                {PLACEMENTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão */}
          <button
            onClick={handleGenerate}
            disabled={state === 'loading' || !description.trim()}
            className="w-full py-4 bg-white hover:bg-gray-100 disabled:opacity-40 text-black font-body font-bold text-xs tracking-widest uppercase transition-colors"
          >
            {state === 'loading' ? 'Gerando prévia...' : 'Gerar prévia'}
          </button>

          {/* Erro */}
          {state === 'error' && (
            <p className="font-body text-xs text-red-400 tracking-wide">{error}</p>
          )}
        </div>

        {/* Resultado */}
        {state === 'loading' && (
          <div className="mt-10 border border-white/10 aspect-square flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-ink-500 rounded-full animate-spin" />
            <p className="font-body text-xs tracking-widest uppercase text-white/30">
              Gerando sua prévia...
            </p>
          </div>
        )}

        {state === 'done' && imageUrl && (
          <div className="mt-10 space-y-4">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink2-500">
              Prévia gerada
            </p>
            <img
              src={imageUrl}
              alt="Prévia de tatuagem gerada por IA"
              className="w-full border border-white/10"
            />
            <p className="font-body text-[10px] text-white/20 tracking-wide">
              Esta é uma prévia conceitual gerada por IA. O design final será criado pelo seu artista.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href={imageUrl}
                download="previa-tatuagem.png"
                className="px-6 py-2.5 border border-white/20 hover:border-white text-white/60 hover:text-white font-body text-xs font-semibold tracking-widest uppercase transition-colors"
              >
                Baixar imagem
              </a>
              <button
                onClick={handleGenerate}
                className="px-6 py-2.5 border border-ink-500/40 hover:border-ink-500 text-ink-400 font-body text-xs font-semibold tracking-widest uppercase transition-colors"
              >
                Gerar novamente
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
