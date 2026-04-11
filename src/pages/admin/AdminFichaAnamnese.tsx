import { useState } from 'react';
import { useStore } from '../../store';
import { useLang } from '../../lib/useLang';

const T = {
  pt: {
    label: 'Admin', title: 'Ficha de Anamnese',
    subtitle: 'Configure os tatuadores e condições de saúde exibidos na ficha.',
    citySection: 'Cidade padrão da assinatura',
    cityDesc: (city: string) => `Aparece no campo "${city || 'CIDADE'}, DATA *" no final da ficha.`,
    tattooersSection: 'Tatuadores',
    conditionsSection: 'Condições de saúde',
    editTitle: 'Clique para editar',
    moveUpTitle: 'Mover para cima', moveDownTitle: 'Mover para baixo', removeTitle: 'Remover',
    tattooerPlaceholder: 'Nome do tatuador',
    conditionPlaceholder: 'Nome da condição',
    add: 'Adicionar', save: 'Salvar alterações', saved: 'Salvo!',
  },
  en: {
    label: 'Admin', title: 'Consent Form',
    subtitle: 'Configure the tattoo artists and health conditions shown on the form.',
    citySection: 'Default signature city',
    cityDesc: (city: string) => `Shown in the "${city || 'CITY'}, DATE *" field at the end of the form.`,
    tattooersSection: 'Tattoo artists',
    conditionsSection: 'Health conditions',
    editTitle: 'Click to edit',
    moveUpTitle: 'Move up', moveDownTitle: 'Move down', removeTitle: 'Remove',
    tattooerPlaceholder: 'Artist name',
    conditionPlaceholder: 'Condition name',
    add: 'Add', save: 'Save changes', saved: 'Saved!',
  },
};

export default function AdminFichaAnamnese() {
  const { lang } = useLang();
  const tr = T[lang];
  const fichaConfig = useStore((s) => s.fichaConfig);
  const setFichaConfig = useStore((s) => s.setFichaConfig);

  const [tatuadores, setTatuadores] = useState<string[]>(fichaConfig.tatuadores);
  const [conditions, setConditions] = useState<string[]>(fichaConfig.conditions);
  const [cidade, setCidade] = useState(fichaConfig.cidade ?? 'São Paulo');
  const [newTatuador, setNewTatuador] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [editingTatuador, setEditingTatuador] = useState<number | null>(null);
  const [editingCondition, setEditingCondition] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setFichaConfig({ tatuadores, conditions, cidade });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addTatuador() {
    const v = newTatuador.trim();
    if (v) setTatuadores((p) => [...p, v]);
    setNewTatuador('');
  }

  function renameTatuador(i: number, value: string) {
    const v = value.trim();
    if (v) setTatuadores((p) => p.map((t, idx) => idx === i ? v : t));
    setEditingTatuador(null);
  }

  function removeTatuador(i: number) {
    setTatuadores((p) => p.filter((_, idx) => idx !== i));
  }

  function addCondition() {
    const v = newCondition.trim();
    if (v) setConditions((p) => [...p, v]);
    setNewCondition('');
  }

  function renameCondition(i: number, value: string) {
    const v = value.trim();
    if (v) setConditions((p) => p.map((c, idx) => idx === i ? v : c));
    setEditingCondition(null);
  }

  function removeCondition(i: number) {
    setConditions((p) => p.filter((_, idx) => idx !== i));
  }

  function moveUp(list: string[], i: number, setter: (l: string[]) => void) {
    if (i === 0) return;
    const next = [...list];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setter(next);
  }

  function moveDown(list: string[], i: number, setter: (l: string[]) => void) {
    if (i === list.length - 1) return;
    const next = [...list];
    [next[i + 1], next[i]] = [next[i], next[i + 1]];
    setter(next);
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">{tr.label}</p>
        <h1 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wide leading-none">
          {tr.title}
        </h1>
        <p className="text-xs text-gray-500 mt-2">{tr.subtitle}</p>
      </div>

      {/* Cidade */}
      <section className="mb-10">
        <h2 className="font-body text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4 flex items-center gap-2">
          <span className="text-red-500">00.</span> {tr.citySection}
        </h2>
        <p className="text-xs text-gray-600 mb-3">{tr.cityDesc(cidade)}</p>
        <input
          type="text"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Ex: São Paulo"
          className="bg-transparent border border-white/15 px-3 py-2 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors w-64"
        />
      </section>

      {/* Tatuadores */}
      <section className="mb-10">
        <h2 className="font-body text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4 flex items-center gap-2">
          <span className="text-red-500">01.</span> {tr.tattooersSection}
        </h2>

        <div className="flex flex-col gap-1 mb-4">
          {tatuadores.map((t, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2">
              {editingTatuador === i ? (
                <input
                  autoFocus
                  defaultValue={t}
                  onBlur={(e) => renameTatuador(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') renameTatuador(i, e.currentTarget.value);
                    if (e.key === 'Escape') setEditingTatuador(null);
                  }}
                  className="flex-1 bg-transparent border-b border-white/40 text-white text-sm outline-none focus:border-white py-0.5"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingTatuador(i)}
                  className="flex-1 text-sm text-white text-left hover:text-white/70 transition-colors"
                  title={tr.editTitle}
                >
                  {t}
                </button>
              )}
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => moveUp(tatuadores, i, setTatuadores)} disabled={i === 0}
                  className="p-1 text-gray-600 hover:text-white disabled:opacity-20 transition-colors" title={tr.moveUpTitle}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button onClick={() => moveDown(tatuadores, i, setTatuadores)} disabled={i === tatuadores.length - 1}
                  className="p-1 text-gray-600 hover:text-white disabled:opacity-20 transition-colors" title={tr.moveDownTitle}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button onClick={() => removeTatuador(i)}
                  className="p-1 text-gray-600 hover:text-red-400 transition-colors" title={tr.removeTitle}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input type="text" value={newTatuador} onChange={(e) => setNewTatuador(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTatuador())}
            placeholder={tr.tattooerPlaceholder}
            className="flex-1 bg-transparent border border-white/20 text-white text-sm px-3 py-2 outline-none focus:border-white/50 placeholder:text-gray-600" />
          <button type="button" onClick={addTatuador}
            className="px-4 py-2 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors">
            {tr.add}
          </button>
        </div>
      </section>

      {/* Condições */}
      <section className="mb-10">
        <h2 className="font-body text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4 flex items-center gap-2">
          <span className="text-red-500">02.</span> {tr.conditionsSection}
        </h2>

        <div className="flex flex-col gap-1 mb-4">
          {conditions.map((c, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2">
              {editingCondition === i ? (
                <input
                  autoFocus
                  defaultValue={c}
                  onBlur={(e) => renameCondition(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') renameCondition(i, e.currentTarget.value);
                    if (e.key === 'Escape') setEditingCondition(null);
                  }}
                  className="flex-1 bg-transparent border-b border-white/40 text-white text-sm outline-none focus:border-white py-0.5"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingCondition(i)}
                  className="flex-1 text-sm text-white text-left hover:text-white/70 transition-colors"
                  title={tr.editTitle}
                >
                  {c}
                </button>
              )}
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => moveUp(conditions, i, setConditions)} disabled={i === 0}
                  className="p-1 text-gray-600 hover:text-white disabled:opacity-20 transition-colors" title={tr.moveUpTitle}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button onClick={() => moveDown(conditions, i, setConditions)} disabled={i === conditions.length - 1}
                  className="p-1 text-gray-600 hover:text-white disabled:opacity-20 transition-colors" title={tr.moveDownTitle}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button onClick={() => removeCondition(i)}
                  className="p-1 text-gray-600 hover:text-red-400 transition-colors" title={tr.removeTitle}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input type="text" value={newCondition} onChange={(e) => setNewCondition(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
            placeholder={tr.conditionPlaceholder}
            className="flex-1 bg-transparent border border-white/20 text-white text-sm px-3 py-2 outline-none focus:border-white/50 placeholder:text-gray-600" />
          <button type="button" onClick={addCondition}
            className="px-4 py-2 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors">
            {tr.add}
          </button>
        </div>
      </section>

      {/* Save */}
      <button onClick={handleSave}
        className="flex items-center gap-2 bg-white text-black font-body font-bold text-xs tracking-widest uppercase px-6 py-3 hover:bg-gray-100 transition-colors">
        {saved ? (
          <>
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {tr.saved}
          </>
        ) : (
          tr.save
        )}
      </button>
    </div>
  );
}
