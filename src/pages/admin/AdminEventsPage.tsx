import { useState, useRef } from 'react';
import { useStore } from '../../store';
import type { EventsContent, EventItem } from '../../store';
import { uploadImage } from '../../lib/uploadImage';
import { supabase } from '../../lib/supabase';

/* ── field helpers ─────────────────────────────────────────────────── */
const base =
  'w-full bg-zinc-900 border border-white/10 text-white font-body text-sm px-3 py-2 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20';
const labelCls =
  'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5';

function Field({
  label, value, onChange, multiline = false, placeholder = '', type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      {multiline ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={`${base} resize-none`} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={base} />
      )}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/10 bg-zinc-950 p-6 space-y-4">
      <h3 className="font-display text-lg uppercase tracking-wide text-white leading-none border-b border-white/10 pb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ── type options ──────────────────────────────────────────────────── */
const EVENT_TYPES = [
  { value: 'flash',    label: 'Flash Day' },
  { value: 'guest',    label: 'Guest Spot' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other',    label: 'Outro' },
];

/* ── main component ─────────────────────────────────────────────────── */
export default function AdminEventsPage() {
  const eventsContent = useStore((s) => s.eventsContent);
  const setEventsContent = useStore((s) => s.setEventsContent);

  const [draft, setDraft] = useState<EventsContent>(eventsContent);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingEvent, setUploadingEvent] = useState<string | null>(null);

  const heroImgRef = useRef<HTMLInputElement>(null);
  const eventImgRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const isDirty = JSON.stringify(draft) !== JSON.stringify(eventsContent);

  /* ── helpers ──────────────────────────────────────────────────────── */
  function readFile(file: File): Promise<string> {
    return new Promise((res) => {
      const r = new FileReader();
      r.onload = (e) => res(e.target?.result as string);
      r.readAsDataURL(file);
    });
  }

  function patchHero(field: keyof EventsContent['hero'], value: string) {
    setDraft((p) => ({ ...p, hero: { ...p.hero, [field]: value } }));
    setSaved(false);
  }

  function patchEvent(id: string, updates: Partial<EventItem>) {
    setDraft((p) => ({
      ...p,
      events: p.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    setSaved(false);
  }

  function addEvent() {
    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      date: '',
      timeLabel: '',
      type: 'flash',
      image: '',
      title: '',
      description: '',
      ctaLabel: 'SAIBA MAIS',
      ctaUrl: '',
    };
    setDraft((p) => ({ ...p, events: [...p.events, newEvent] }));
    setSaved(false);
  }

  function removeEvent(id: string) {
    if (!confirm('Remover este evento?')) return;
    setDraft((p) => ({ ...p, events: p.events.filter((e) => e.id !== id) }));
    setSaved(false);
  }

  function moveEvent(id: string, dir: -1 | 1) {
    setDraft((p) => {
      const arr = [...p.events];
      const idx = arr.findIndex((e) => e.id === id);
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return p;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      return { ...p, events: arr };
    });
    setSaved(false);
  }

  /* ── image upload ─────────────────────────────────────────────────── */
  async function handleHeroImage(file: File) {
    setUploadingHero(true);
    try {
      const data = await readFile(file);
      const url = await uploadImage(data);
      patchHero('heroImage', url);
    } catch (err) {
      console.error('[AdminEventsPage] hero image upload failed:', err);
    } finally {
      setUploadingHero(false);
    }
  }

  async function handleEventImage(id: string, file: File) {
    setUploadingEvent(id);
    try {
      const data = await readFile(file);
      const url = await uploadImage(data);
      patchEvent(id, { image: url });
    } catch (err) {
      console.error('[AdminEventsPage] event image upload failed:', err);
    } finally {
      setUploadingEvent(null);
    }
  }

  /* ── save ─────────────────────────────────────────────────────────── */
  async function handleSave() {
    try {
      setEventsContent(draft);
      if (supabase) {
        const { error } = await supabase.from('site_config').upsert({
          key: 'eventsContent',
          value: draft,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
      setSaved(true);
      setSaveError('');
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('[AdminEventsPage] save failed:', err);
      setSaveError('Erro ao salvar no servidor. Verifique sua conexão e tente novamente.');
      setTimeout(() => setSaveError(''), 6000);
    }
  }

  /* ── render ─────────────────────────────────────────────────────────── */
  return (
    <div className="p-4 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Conteúdo</p>
          <h1 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wide leading-none">
            Events
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {isDirty && (
            <button type="button" onClick={() => { setDraft(eventsContent); setSaved(false); }}
              className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors">
              Descartar
            </button>
          )}
          <button type="button" onClick={handleSave} disabled={!isDirty}
            className={`font-body text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 transition-all ${
              isDirty ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}>
            {saved ? '✓ Salvo' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── HERO ── */}
        <SectionCard title="Hero">
          <Field label="Tagline" value={draft.hero.tagline}
            onChange={(v) => patchHero('tagline', v)} placeholder="UPCOMING EXPERIENCES" />
          <div>
            <label className={labelCls}>Título grande <span className="text-gray-700 normal-case font-normal">(use Enter para quebrar linha)</span></label>
            <textarea rows={3} value={draft.hero.title}
              onChange={(e) => patchHero('title', e.target.value)}
              placeholder={'CULTURE &\nPERMANENCE'}
              className={`${base} resize-none`} />
          </div>
          <Field label="Descrição" value={draft.hero.description}
            onChange={(v) => patchHero('description', v)} multiline
            placeholder="We don't just ink; we curate moments..." />

          {/* Hero image */}
          <div>
            <label className={labelCls}>Imagem de fundo do Hero</label>
            <div className="flex gap-3 items-start">
              {draft.hero.heroImage ? (
                <div className="relative w-40 h-28 shrink-0">
                  <img src={draft.hero.heroImage} alt="Hero" className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => patchHero('heroImage', '')}
                    className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors">
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-40 h-28 shrink-0 border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
                  onClick={() => heroImgRef.current?.click()}>
                  <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              )}
              <button type="button" onClick={() => heroImgRef.current?.click()} disabled={uploadingHero}
                className="font-body text-[10px] font-semibold tracking-widest uppercase px-4 py-2 border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-colors disabled:opacity-40">
                {uploadingHero ? 'Enviando...' : draft.hero.heroImage ? 'Trocar imagem' : 'Selecionar imagem'}
              </button>
              <input ref={heroImgRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleHeroImage(f); e.target.value = ''; }} />
            </div>
          </div>
        </SectionCard>

        {/* ── EVENTS ── */}
        <SectionCard title={`Eventos (${draft.events.length})`}>
          <div className="space-y-6">
            {draft.events.map((event, idx) => (
              <div key={event.id} className="border border-white/8 bg-zinc-900 p-4 space-y-4">
                {/* Event header */}
                <div className="flex items-center justify-between">
                  <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600">
                    Evento {idx + 1}
                  </p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => moveEvent(event.id, -1)} disabled={idx === 0}
                      className="p-1 text-gray-700 hover:text-white disabled:opacity-20 transition-colors" title="Mover para cima">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => moveEvent(event.id, 1)} disabled={idx === draft.events.length - 1}
                      className="p-1 text-gray-700 hover:text-white disabled:opacity-20 transition-colors" title="Mover para baixo">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => removeEvent(event.id)}
                      className="p-1 text-gray-700 hover:text-red-400 transition-colors" title="Remover evento">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Date + time + type */}
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Data" value={event.date}
                    onChange={(v) => patchEvent(event.id, { date: v })} placeholder="OUT 31" />
                  <Field label="Horário / Tipo" value={event.timeLabel}
                    onChange={(v) => patchEvent(event.id, { timeLabel: v })} placeholder="20:00 - LATE" />
                  <div>
                    <label className={labelCls}>Ícone</label>
                    <select value={event.type}
                      onChange={(e) => patchEvent(event.id, { type: e.target.value })}
                      className={base}>
                      {EVENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title + description */}
                <Field label="Título" value={event.title}
                  onChange={(v) => patchEvent(event.id, { title: v })} placeholder="FLASH DAY: NEON NIGHTS" />
                <Field label="Descrição" value={event.description}
                  onChange={(v) => patchEvent(event.id, { description: v })} multiline
                  placeholder="Descreva o evento..." />

                {/* CTA */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Texto do botão" value={event.ctaLabel}
                    onChange={(v) => patchEvent(event.id, { ctaLabel: v })} placeholder="SAIBA MAIS" />
                  <Field label="Link do botão (URL)" value={event.ctaUrl}
                    onChange={(v) => patchEvent(event.id, { ctaUrl: v })} placeholder="https://..." />
                </div>

                {/* Event image */}
                <div>
                  <label className={labelCls}>Foto do evento</label>
                  <div className="flex gap-3 items-start">
                    {event.image ? (
                      <div className="relative w-32 h-24 shrink-0">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => patchEvent(event.id, { image: '' })}
                          className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors">✕</button>
                      </div>
                    ) : (
                      <div className="w-32 h-24 shrink-0 border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
                        onClick={() => eventImgRefs.current[event.id]?.click()}>
                        <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    )}
                    <button type="button"
                      onClick={() => eventImgRefs.current[event.id]?.click()}
                      disabled={uploadingEvent === event.id}
                      className="font-body text-[10px] font-semibold tracking-widest uppercase px-4 py-2 border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-colors disabled:opacity-40">
                      {uploadingEvent === event.id ? 'Enviando...' : event.image ? 'Trocar foto' : 'Selecionar foto'}
                    </button>
                    <input
                      ref={(el) => { eventImgRefs.current[event.id] = el; }}
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleEventImage(event.id, f); e.target.value = ''; }} />
                  </div>
                </div>
              </div>
            ))}

            <button type="button" onClick={addEvent}
              className="w-full py-3 border border-dashed border-white/20 text-gray-600 hover:text-white hover:border-white/40 transition-colors font-body text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar evento
            </button>
          </div>
        </SectionCard>

      </div>

      {/* Sticky save bar */}
      {isDirty && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-zinc-900 border border-white/10 px-5 py-3 shadow-2xl z-50">
          <span className="font-body text-xs text-white/50">Alterações não salvas</span>
          <button type="button" onClick={() => { setDraft(eventsContent); setSaved(false); }}
            className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors">
            Descartar
          </button>
          <button type="button" onClick={handleSave}
            className="font-body text-[10px] font-bold tracking-widest uppercase bg-white text-black px-4 py-2 hover:bg-white/90 transition-colors">
            Salvar
          </button>
        </div>
      )}

      {/* Error toast */}
      {saveError && (
        <div className="fixed bottom-6 left-6 z-[9999] flex items-center gap-3 bg-zinc-900 border border-red-500/50 px-5 py-4 shadow-2xl max-w-sm">
          <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="font-body text-xs font-semibold tracking-widest uppercase text-red-400">Erro ao salvar</p>
            <p className="font-body text-[10px] text-gray-400 mt-0.5">{saveError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
