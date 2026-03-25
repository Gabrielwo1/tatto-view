import { useState, useRef } from 'react';
import { useStore } from '../../store';
import type { GuestContent } from '../../store';
import { uploadImage } from '../../lib/uploadImage';
import { supabase } from '../../lib/supabase';

/* ── small reusable field components ─────────────────────────────────────── */
function Field({
  label,
  value,
  onChange,
  multiline = false,
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const base =
    'w-full bg-zinc-900 border border-white/10 text-white font-body text-sm px-3 py-2 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20';
  return (
    <div>
      <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
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

/* ── main page ──────────────────────────────────────────────────────────── */
export default function AdminGuestPage() {
  const guestContent = useStore((s) => s.guestContent);
  const setGuestContent = useStore((s) => s.setGuestContent);

  const [draft, setDraft] = useState<GuestContent>(guestContent);
  const [saved, setSaved] = useState(false);

  function patch<K extends keyof GuestContent>(section: K, updates: Partial<GuestContent[K]>) {
    setDraft((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
    setSaved(false);
  }

  async function handleSave() {
    try {
      setGuestContent(draft);
      if (supabase) {
        const { error } = await supabase.from('site_config').upsert({
          key: 'guestContent',
          value: draft,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('[AdminGuestPage] save failed:', err);
      alert('Erro ao salvar no servidor. Verifique sua conexão e tente novamente.');
    }
  }

  function handleReset() {
    setDraft(guestContent);
    setSaved(false);
  }

  /* ── included items helpers ─────────────────────────────────────── */
  function updateIncludedItem(idx: number, value: string) {
    const items = [...draft.commission.includedItems];
    items[idx] = value;
    patch('commission', { includedItems: items });
  }
  function addIncludedItem() {
    patch('commission', { includedItems: [...draft.commission.includedItems, ''] });
  }
  function removeIncludedItem(idx: number) {
    const items = draft.commission.includedItems.filter((_, i) => i !== idx);
    patch('commission', { includedItems: items });
  }

  /* ── studio features helpers ─────────────────────────────────────── */
  function updateFeature(idx: number, field: 'icon' | 'text', value: string) {
    const features = draft.commission.studioFeatures.map((f, i) =>
      i === idx ? { ...f, [field]: value } : f
    );
    patch('commission', { studioFeatures: features });
  }

  /* ── stats helpers ────────────────────────────────────────────────── */
  function updateStat(idx: number, field: 'value' | 'label', value: string) {
    const stats = draft.environment.stats.map((s, i) =>
      i === idx ? { ...s, [field]: value } : s
    );
    patch('environment', { stats });
  }

  /* ── nextGuest image helpers ─────────────────────────────────────── */
  function readImageFile(file: File): Promise<string> {
    return new Promise((res) => {
      const reader = new FileReader();
      reader.onload = (e) => res(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  async function handleGuestImage(file: File) {
    const dataUrl = await readImageFile(file);
    const url = await uploadImage(dataUrl);
    setDraft((prev) => ({ ...prev, nextGuest: { ...prev.nextGuest, guestImage: url } }));
    setSaved(false);
  }

  async function handlePortfolioImage(idx: number, file: File) {
    const dataUrl = await readImageFile(file);
    const url = await uploadImage(dataUrl);
    const imgs = [...draft.nextGuest.portfolioImages] as [string, string, string, string];
    imgs[idx] = url;
    setDraft((prev) => ({ ...prev, nextGuest: { ...prev.nextGuest, portfolioImages: imgs } }));
    setSaved(false);
  }

  function clearPortfolioImage(idx: number) {
    const imgs = [...draft.nextGuest.portfolioImages] as [string, string, string, string];
    imgs[idx] = '';
    setDraft((prev) => ({ ...prev, nextGuest: { ...prev.nextGuest, portfolioImages: imgs } }));
    setSaved(false);
  }

  /* ── profile items helpers ───────────────────────────────────────── */
  function updateProfile(idx: number, field: 'title' | 'body', value: string) {
    const items = draft.profiles.items.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    patch('profiles', { items });
  }

  /* ── showcase image helpers ─────────────────────────────────────── */
  const showcaseHeroRef = useRef<HTMLInputElement>(null);
  const showcaseGalleryRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleShowcaseHero(file: File) {
    const dataUrl = await readImageFile(file);
    const url = await uploadImage(dataUrl);
    setDraft((p) => ({ ...p, showcase: { ...p.showcase, heroImage: url } }));
    setSaved(false);
  }

  async function handleShowcaseGallery(idx: number, file: File) {
    const dataUrl = await readImageFile(file);
    const url = await uploadImage(dataUrl);
    const imgs = [...(draft.showcase?.galleryImages ?? ['','','',''])] as [string,string,string,string];
    imgs[idx] = url;
    setDraft((p) => ({ ...p, showcase: { ...p.showcase, galleryImages: imgs } }));
    setSaved(false);
  }

  function clearShowcaseGallery(idx: number) {
    const imgs = [...(draft.showcase?.galleryImages ?? ['','','',''])] as [string,string,string,string];
    imgs[idx] = '';
    setDraft((p) => ({ ...p, showcase: { ...p.showcase, galleryImages: imgs } }));
    setSaved(false);
  }

  const guestImageRef = useRef<HTMLInputElement>(null);
  const portfolioRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(guestContent);

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Conteúdo</p>
          <h1 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wide leading-none">
            Página Guests
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors"
            >
              Descartar
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className={`font-body text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 transition-all ${
              isDirty
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {saved ? '✓ Salvo' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <SectionCard title="Hero">
          <Field
            label="Tagline (topo)"
            value={draft.hero.tagline}
            onChange={(v) => patch('hero', { tagline: v })}
          />
          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Título — linha 1"
              value={draft.hero.titleBefore}
              onChange={(v) => patch('hero', { titleBefore: v })}
            />
            <Field
              label="Título — destaque (cor)"
              value={draft.hero.titleHighlight}
              onChange={(v) => patch('hero', { titleHighlight: v })}
            />
            <Field
              label="Título — linha 3"
              value={draft.hero.titleAfter}
              onChange={(v) => patch('hero', { titleAfter: v })}
            />
          </div>
          <Field
            label="Descrição"
            value={draft.hero.description}
            onChange={(v) => patch('hero', { description: v })}
            multiline
          />
          <Field
            label="Localização"
            value={draft.hero.location}
            onChange={(v) => patch('hero', { location: v })}
          />
        </SectionCard>

        {/* ── SHOWCASE ─────────────────────────────────────────────────── */}
        <SectionCard title="Galeria de Destaque">

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Título da seção"
              value={draft.showcase?.sectionTitle ?? ''}
              onChange={(v) => setDraft((p) => ({ ...p, showcase: { ...p.showcase, sectionTitle: v } }))}
              placeholder="GALERIA DE DESTAQUE"
            />
            <Field
              label="Subtítulo / chamada"
              value={draft.showcase?.sectionSubtitle ?? ''}
              onChange={(v) => setDraft((p) => ({ ...p, showcase: { ...p.showcase, sectionSubtitle: v } }))}
              placeholder="Conheça o próximo artista..."
            />
          </div>

          <Field
            label="Nome do artista"
            value={draft.showcase?.guestName ?? ''}
            onChange={(v) => setDraft((p) => ({ ...p, showcase: { ...p.showcase, guestName: v } }))}
            placeholder="Nome do artista"
          />

          {/* Foto do artista */}
          <div>
            <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
              Foto do artista
            </label>
            <div className="flex gap-3 items-start">
              {draft.showcase?.heroImage ? (
                <div className="relative w-28 h-28 shrink-0">
                  <img src={draft.showcase.heroImage} alt="Hero" className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => setDraft((p) => ({ ...p, showcase: { ...p.showcase, heroImage: '' } }))}
                    className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors">
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-28 h-28 shrink-0 border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
                  onClick={() => showcaseHeroRef.current?.click()}>
                  <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <button type="button" onClick={() => showcaseHeroRef.current?.click()}
                  className="font-body text-[10px] font-semibold tracking-widest uppercase px-4 py-2 border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-colors">
                  {draft.showcase?.heroImage ? 'Trocar foto' : 'Selecionar foto'}
                </button>
                <input ref={showcaseHeroRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleShowcaseHero(f); e.target.value = ''; }} />
              </div>
            </div>
          </div>

          <Field
            label="Descrição / bio do artista"
            value={draft.showcase?.guestDescription ?? ''}
            onChange={(v) => setDraft((p) => ({ ...p, showcase: { ...p.showcase, guestDescription: v } }))}
            multiline
            placeholder="Fale sobre o estilo, trajetória e o que o artista vai oferecer no estúdio..."
          />

          <Field
            label="Instagram (@handle)"
            value={draft.showcase?.instagramHandle ?? ''}
            onChange={(v) => setDraft((p) => ({ ...p, showcase: { ...p.showcase, instagramHandle: v } }))}
            placeholder="@artista"
          />

          {/* 4 fotos do portfólio */}
          <div>
            <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">
              Portfólio de trabalhos (4 fotos)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([0,1,2,3] as const).map((idx) => {
                const img = draft.showcase?.galleryImages?.[idx] ?? '';
                return (
                  <div key={idx} className="relative aspect-square">
                    {img ? (
                      <>
                        <img src={img} alt={`Galeria ${idx+1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => clearShowcaseGallery(idx)}
                          className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors">✕</button>
                      </>
                    ) : (
                      <div className="w-full h-full border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-white/40 transition-colors"
                        onClick={() => showcaseGalleryRefs.current[idx]?.click()}>
                        <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-body text-[9px] text-white/20">{idx+1}</span>
                      </div>
                    )}
                    <input ref={(el) => { showcaseGalleryRefs.current[idx] = el; }} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleShowcaseGallery(idx, f); e.target.value = ''; }} />
                  </div>
                );
              })}
            </div>
            <p className="font-body text-[10px] text-gray-700 mt-2">
              Clique em cada célula para adicionar uma foto de trabalho do artista.
            </p>
          </div>
        </SectionCard>

        {/* ── COMISSÃO ─────────────────────────────────────────────────── */}
        <SectionCard title="Comissão">
          <Field
            label="Tagline da seção"
            value={draft.commission.sectionTagline}
            onChange={(v) => patch('commission', { sectionTagline: v })}
          />
          <Field
            label="Tagline do card"
            value={draft.commission.cardTagline}
            onChange={(v) => patch('commission', { cardTagline: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Percentual (%)"
              value={draft.commission.percentage}
              onChange={(v) => patch('commission', { percentage: v })}
              placeholder="30%"
            />
            <Field
              label="Label do split"
              value={draft.commission.splitLabel}
              onChange={(v) => patch('commission', { splitLabel: v })}
            />
          </div>
          <div>
            <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
              Label &quot;Incluso&quot;
            </label>
            <Field
              label=""
              value={draft.commission.includedLabel}
              onChange={(v) => patch('commission', { includedLabel: v })}
            />
          </div>
          <div>
            <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
              Itens inclusos
            </label>
            <div className="space-y-2">
              {draft.commission.includedItems.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateIncludedItem(idx, e.target.value)}
                    className="flex-1 bg-zinc-900 border border-white/10 text-white font-body text-sm px-3 py-2 focus:outline-none focus:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => removeIncludedItem(idx)}
                    className="px-3 text-gray-600 hover:text-red-400 border border-white/10 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIncludedItem}
                className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors mt-1"
              >
                + Adicionar item
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── ESTÚDIO ──────────────────────────────────────────────────── */}
        <SectionCard title="Card — Estúdio Estruturado">
          <Field
            label="Título do card"
            value={draft.commission.studioTitle}
            onChange={(v) => patch('commission', { studioTitle: v })}
          />
          <Field
            label="Descrição"
            value={draft.commission.studioDescription}
            onChange={(v) => patch('commission', { studioDescription: v })}
            multiline
          />
          <div>
            <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
              Recursos do estúdio
            </label>
            <div className="space-y-2">
              {draft.commission.studioFeatures.map((feat, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={feat.icon}
                    onChange={(e) => updateFeature(idx, 'icon', e.target.value)}
                    className="w-16 bg-zinc-900 border border-white/10 text-white font-body text-sm px-3 py-2 text-center focus:outline-none focus:border-white/30"
                    placeholder="◈"
                  />
                  <input
                    type="text"
                    value={feat.text}
                    onChange={(e) => updateFeature(idx, 'text', e.target.value)}
                    className="flex-1 bg-zinc-900 border border-white/10 text-white font-body text-sm px-3 py-2 focus:outline-none focus:border-white/30"
                  />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── AMBIENTE ─────────────────────────────────────────────────── */}
        <SectionCard title="O Ambiente">
          <Field
            label="Tagline da seção"
            value={draft.environment.sectionTagline}
            onChange={(v) => patch('environment', { sectionTagline: v })}
          />
          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Título — linha 1"
              value={draft.environment.titleBefore}
              onChange={(v) => patch('environment', { titleBefore: v })}
            />
            <Field
              label="Título — destaque (cor)"
              value={draft.environment.titleHighlight}
              onChange={(v) => patch('environment', { titleHighlight: v })}
            />
            <Field
              label="Título — linha 3"
              value={draft.environment.titleAfter}
              onChange={(v) => patch('environment', { titleAfter: v })}
            />
          </div>
          <Field
            label="Descrição 1"
            value={draft.environment.description1}
            onChange={(v) => patch('environment', { description1: v })}
            multiline
          />
          <Field
            label="Descrição 2"
            value={draft.environment.description2}
            onChange={(v) => patch('environment', { description2: v })}
            multiline
          />
          <div>
            <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
              Estatísticas (4 cards)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {draft.environment.stats.map((stat, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(idx, 'value', e.target.value)}
                    className="w-20 bg-zinc-900 border border-white/10 text-white font-body text-sm px-3 py-2 text-center focus:outline-none focus:border-white/30"
                    placeholder="+5"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(idx, 'label', e.target.value)}
                    className="flex-1 bg-zinc-900 border border-white/10 text-white font-body text-sm px-3 py-2 focus:outline-none focus:border-white/30"
                    placeholder="Anos de estúdio"
                  />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── PERFIL / QUEM BUSCAMOS ────────────────────────────────────── */}
        <SectionCard title="Quem Buscamos">
          <Field
            label="Tagline da seção"
            value={draft.profiles.sectionTagline}
            onChange={(v) => patch('profiles', { sectionTagline: v })}
          />
          <div className="space-y-4">
            {draft.profiles.items.map((profile, idx) => (
              <div key={profile.n} className="border border-white/8 p-4 space-y-3">
                <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600">
                  Card {profile.n}
                </p>
                <Field
                  label="Título"
                  value={profile.title}
                  onChange={(v) => updateProfile(idx, 'title', v)}
                />
                <Field
                  label="Descrição"
                  value={profile.body}
                  onChange={(v) => updateProfile(idx, 'body', v)}
                  multiline
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── PRÓXIMO GUEST ────────────────────────────────────────────── */}
        <SectionCard title="Próximo Guest">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Título da seção"
              value={draft.nextGuest?.sectionTitle ?? ''}
              onChange={(v) => setDraft((p) => ({ ...p, nextGuest: { ...p.nextGuest, sectionTitle: v } }))}
              placeholder="PRÓXIMO GUEST"
            />
            <Field
              label="Subtítulo / chamada"
              value={draft.nextGuest?.sectionSubtitle ?? ''}
              onChange={(v) => setDraft((p) => ({ ...p, nextGuest: { ...p.nextGuest, sectionSubtitle: v } }))}
              placeholder="Conheça o próximo artista..."
            />
          </div>

          <Field
            label="Nome do artista"
            value={draft.nextGuest?.guestName ?? ''}
            onChange={(v) => setDraft((p) => ({ ...p, nextGuest: { ...p.nextGuest, guestName: v } }))}
            placeholder="Nome do Guest"
          />

          {/* Foto do guest */}
          <div>
            <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
              Foto do artista
            </label>
            <div className="flex gap-3 items-start">
              {draft.nextGuest?.guestImage ? (
                <div className="relative w-28 h-28 shrink-0">
                  <img src={draft.nextGuest.guestImage} alt="Guest" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, nextGuest: { ...p.nextGuest, guestImage: '' } }))}
                    className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >✕</button>
                </div>
              ) : (
                <div
                  className="w-28 h-28 shrink-0 border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
                  onClick={() => guestImageRef.current?.click()}
                >
                  <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => guestImageRef.current?.click()}
                  className="font-body text-[10px] font-semibold tracking-widest uppercase px-4 py-2 border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-colors"
                >
                  {draft.nextGuest?.guestImage ? 'Trocar foto' : 'Selecionar foto'}
                </button>
                <input
                  ref={guestImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGuestImage(f); e.target.value = ''; }}
                />
              </div>
            </div>
          </div>

          <Field
            label="Descrição / bio do guest"
            value={draft.nextGuest?.guestDescription ?? ''}
            onChange={(v) => setDraft((p) => ({ ...p, nextGuest: { ...p.nextGuest, guestDescription: v } }))}
            multiline
            placeholder="Fale sobre o estilo, trajetória e o que o guest vai oferecer no estúdio..."
          />

          <Field
            label="Instagram (@handle)"
            value={draft.nextGuest?.instagramHandle ?? ''}
            onChange={(v) => setDraft((p) => ({ ...p, nextGuest: { ...p.nextGuest, instagramHandle: v } }))}
            placeholder="@artista"
          />

          {/* Portfolio de trabalhos */}
          <div>
            <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">
              Portfólio de trabalhos (4 fotos)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(draft.nextGuest?.portfolioImages ?? ['','','','']).map((img, idx) => (
                <div key={idx} className="relative aspect-square">
                  {img ? (
                    <>
                      <img src={img} alt={`Trabalho ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => clearPortfolioImage(idx)}
                        className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >✕</button>
                    </>
                  ) : (
                    <div
                      className="w-full h-full border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-white/40 transition-colors"
                      onClick={() => portfolioRefs.current[idx]?.click()}
                    >
                      <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-body text-[9px] text-white/20">{idx + 1}</span>
                    </div>
                  )}
                  <input
                    ref={(el) => { portfolioRefs.current[idx] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePortfolioImage(idx, f); e.target.value = ''; }}
                  />
                </div>
              ))}
            </div>
            <p className="font-body text-[10px] text-gray-700 mt-2">
              Clique em cada célula para adicionar uma foto de trabalho do guest.
            </p>
          </div>
        </SectionCard>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <SectionCard title="CTA — Submissão">
          <Field
            label="Tagline"
            value={draft.cta.tagline}
            onChange={(v) => patch('cta', { tagline: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Título — linha 1"
              value={draft.cta.titleLine1}
              onChange={(v) => patch('cta', { titleLine1: v })}
            />
            <Field
              label="Título — linha 2"
              value={draft.cta.titleLine2}
              onChange={(v) => patch('cta', { titleLine2: v })}
            />
          </div>
          <Field
            label="Nota de rodapé"
            value={draft.cta.footnote}
            onChange={(v) => patch('cta', { footnote: v })}
            multiline
          />
          <Field
            label="Link WhatsApp (ex: https://wa.me/5511999999999)"
            value={draft.cta.whatsapp}
            onChange={(v) => patch('cta', { whatsapp: v })}
            placeholder="https://wa.me/55..."
          />
          <Field
            label="E-mail de contato"
            value={draft.cta.email}
            onChange={(v) => patch('cta', { email: v })}
            placeholder="contato@estudio.com"
          />
        </SectionCard>

      </div>

      {/* Sticky save bar */}
      {isDirty && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-zinc-900 border border-white/10 px-5 py-3 shadow-2xl">
          <span className="font-body text-xs text-white/50">Alterações não salvas</span>
          <button
            type="button"
            onClick={handleReset}
            className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="font-body text-[10px] font-bold tracking-widest uppercase bg-white text-black px-4 py-2 hover:bg-white/90 transition-colors"
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}
