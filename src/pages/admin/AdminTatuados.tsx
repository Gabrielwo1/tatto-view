import { useState } from 'react';
import { useStore } from '../../store';
import type { TatuadosContent } from '../../store';

const inputCls =
  'w-full bg-transparent border border-white/15 px-4 py-2.5 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors';
const labelCls =
  'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2';

export default function AdminTatuados() {
  const tatuadosContent = useStore((s) => s.tatuadosContent);
  const setTatuadosContent = useStore((s) => s.setTatuadosContent);

  const [form, setForm] = useState<TatuadosContent>(tatuadosContent);
  const [saved, setSaved] = useState(false);

  function handleChange(field: keyof TatuadosContent, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSave() {
    setTatuadosContent(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide text-white mb-1">Tatuados</h1>
        <p className="font-body text-xs text-gray-500">Edite o título e subtítulo da página de arquivo.</p>
      </div>

      <div className="border border-white/10 p-6 space-y-5">
        <div>
          <label className={labelCls}>Título</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={inputCls}
            placeholder="THE ARCHIVE"
          />
        </div>

        <div>
          <label className={labelCls}>Subtítulo</label>
          <textarea
            value={form.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            rows={3}
            className={inputCls + ' resize-none'}
            placeholder="Descrição da página..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase transition-colors"
        >
          Salvar
        </button>
        {saved && (
          <span className="font-body text-xs text-green-400 tracking-widest uppercase">Salvo!</span>
        )}
      </div>

      <div className="border border-white/5 p-4 bg-zinc-900/50">
        <p className="font-body text-[10px] text-gray-600 tracking-widest uppercase mb-2">Nota</p>
        <p className="font-body text-xs text-gray-500 leading-relaxed">
          As tatuagens exibidas na página são gerenciadas em <strong className="text-white/50">Tatuagens</strong>.
          Todas as tatuagens com status "disponível" aparecem automaticamente no arquivo.
        </p>
      </div>
    </div>
  );
}
