import { useState } from 'react';
import { useStore } from '../../store';
import type { AftercareContent } from '../../store';
import { useLang } from '../../lib/useLang';

const T = {
  pt: {
    title: 'Pós Tattoo',
    subtitle: 'Edite o conteúdo da página de cuidados pós-tatuagem',
    heroSection: 'Hero',
    taglineLabel: 'Tagline (ex: Guia de Cuidados)',
    descLabel: 'Descrição',
    preSessionSection: '01 — Pré-Sessão (4 cards)',
    cardLabel: (n: number) => `Card ${n}`,
    titleLabel: 'Título', bodyLabel: 'Texto',
    daySessionSection: '02 — Dia da Sessão (Etiqueta do Estúdio)',
    itemLabel: (n: string) => `Item ${n}`,
    postSessionSection: '03 — Pós-Sessão',
    hygieneTitleLabel: 'Título do bloco de Higiene',
    hygieneBodyLabel: 'Texto de Higiene & Hidratação',
    forbiddenTitleLabel: 'Título das Zonas Proibidas',
    forbiddenItemsLabel: 'Itens proibidos (4 linhas)',
    alertTextLabel: 'Texto de alerta',
    ctaSection: 'CTA Final',
    ctaTaglineLabel: 'Tagline',
    ctaTitle1Label: 'Título linha 1',
    ctaTitle2Label: 'Título linha 2 (destaque)',
    ctaDescLabel: 'Descrição',
    save: 'Salvar alterações',
    saveError: 'Erro ao salvar. Tente novamente.',
    savedTitle: 'Salvo com sucesso', savedMsg: 'As alterações já estão publicadas',
    errorTitle: 'Erro ao salvar',
  },
  en: {
    title: 'Aftercare',
    subtitle: 'Edit the aftercare page content',
    heroSection: 'Hero',
    taglineLabel: 'Tagline (e.g. Care Guide)',
    descLabel: 'Description',
    preSessionSection: '01 — Pre-Session (4 cards)',
    cardLabel: (n: number) => `Card ${n}`,
    titleLabel: 'Title', bodyLabel: 'Body',
    daySessionSection: '02 — Session Day (Studio Etiquette)',
    itemLabel: (n: string) => `Item ${n}`,
    postSessionSection: '03 — Post-Session',
    hygieneTitleLabel: 'Hygiene section title',
    hygieneBodyLabel: 'Hygiene & Moisturizing text',
    forbiddenTitleLabel: 'Forbidden Zones title',
    forbiddenItemsLabel: 'Forbidden items (4 lines)',
    alertTextLabel: 'Alert text',
    ctaSection: 'Final CTA',
    ctaTaglineLabel: 'Tagline',
    ctaTitle1Label: 'Title line 1',
    ctaTitle2Label: 'Title line 2 (highlight)',
    ctaDescLabel: 'Description',
    save: 'Save changes',
    saveError: 'Error saving. Please try again.',
    savedTitle: 'Saved successfully', savedMsg: 'Changes are now published',
    errorTitle: 'Save error',
  },
};

const inputCls =
  'w-full bg-transparent border border-white/15 px-4 py-2.5 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors';
const labelCls =
  'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2';
const textareaCls = inputCls + ' resize-none';

export default function AdminAftercare() {
  const { lang } = useLang();
  const tr = T[lang];
  const aftercareContent = useStore((s) => s.aftercareContent);
  const setAftercareContent = useStore((s) => s.setAftercareContent);

  const [form, setForm] = useState<AftercareContent>(aftercareContent);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  function setHero(field: keyof AftercareContent['hero'], value: string) {
    setForm((f) => ({ ...f, hero: { ...f.hero, [field]: value } }));
  }

  function setPreSession(index: number, field: 'title' | 'body', value: string) {
    setForm((f) => {
      const preSession = f.preSession.map((c, i) => i === index ? { ...c, [field]: value } : c);
      return { ...f, preSession };
    });
  }

  function setDaySession(index: number, value: string) {
    setForm((f) => {
      const daySession = f.daySession.map((item, i) => i === index ? value : item);
      return { ...f, daySession };
    });
  }

  function setPostSession(field: keyof Omit<AftercareContent['postSession'], 'forbiddenItems'>, value: string) {
    setForm((f) => ({ ...f, postSession: { ...f.postSession, [field]: value } }));
  }

  function setForbiddenItem(index: number, value: string) {
    setForm((f) => {
      const forbiddenItems = f.postSession.forbiddenItems.map((item, i) => i === index ? value : item);
      return { ...f, postSession: { ...f.postSession, forbiddenItems } };
    });
  }

  function setCta(field: keyof AftercareContent['cta'], value: string) {
    setForm((f) => ({ ...f, cta: { ...f.cta, [field]: value } }));
  }

  function handleSave() {
    try {
      setAftercareContent(form);
      const stored = localStorage.getItem('tattoo-shop-storage-v3');
      if (!stored) throw new Error('localStorage vazio após salvar');
      setSaved(true);
      setSaveError('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[AdminAftercare] save failed:', err);
      setSaveError(tr.saveError);
      setTimeout(() => setSaveError(''), 6000);
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl uppercase tracking-wide text-white">{tr.title}</h1>
        <p className="font-body text-xs text-gray-500 mt-1">{tr.subtitle}</p>
      </div>

      <div className="space-y-10">

        {/* ── HERO ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            {tr.heroSection}
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{tr.taglineLabel}</label>
              <input className={inputCls} value={form.hero.tagline}
                onChange={(e) => setHero('tagline', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{tr.descLabel}</label>
              <textarea className={textareaCls} rows={3} value={form.hero.description}
                onChange={(e) => setHero('description', e.target.value)} />
            </div>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── PRÉ-SESSÃO ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            {tr.preSessionSection}
          </h2>
          <div className="space-y-5">
            {form.preSession.map((card, i) => (
              <div key={i} className="border border-white/8 p-4 space-y-3">
                <p className="font-body text-[10px] text-gray-600 uppercase tracking-widest">{tr.cardLabel(i + 1)}</p>
                <div>
                  <label className={labelCls}>{tr.titleLabel}</label>
                  <input className={inputCls} value={card.title}
                    onChange={(e) => setPreSession(i, 'title', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>{tr.bodyLabel}</label>
                  <textarea className={textareaCls} rows={2} value={card.body}
                    onChange={(e) => setPreSession(i, 'body', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── DIA DA SESSÃO ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            {tr.daySessionSection}
          </h2>
          <div className="space-y-3">
            {form.daySession.map((item, i) => (
              <div key={i}>
                <label className={labelCls}>{tr.itemLabel((['I', 'II', 'III', 'IV', 'V'][i] ?? String(i + 1)))}</label>
                <textarea className={textareaCls} rows={2} value={item}
                  onChange={(e) => setDaySession(i, e.target.value)} />
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── PÓS-SESSÃO ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            {tr.postSessionSection}
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{tr.hygieneTitleLabel}</label>
              <input className={inputCls} value={form.postSession.hygieneTitle}
                onChange={(e) => setPostSession('hygieneTitle', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{tr.hygieneBodyLabel}</label>
              <textarea className={textareaCls} rows={3} value={form.postSession.hygieneBody}
                onChange={(e) => setPostSession('hygieneBody', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{tr.forbiddenTitleLabel}</label>
              <input className={inputCls} value={form.postSession.forbiddenTitle}
                onChange={(e) => setPostSession('forbiddenTitle', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>{tr.forbiddenItemsLabel}</label>
              {form.postSession.forbiddenItems.map((item, i) => (
                <input key={i} className={inputCls} value={item}
                  onChange={(e) => setForbiddenItem(i, e.target.value)} />
              ))}
            </div>
            <div>
              <label className={labelCls}>{tr.alertTextLabel}</label>
              <input className={inputCls} value={form.postSession.alertText}
                onChange={(e) => setPostSession('alertText', e.target.value)} />
            </div>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── CTA ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            {tr.ctaSection}
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{tr.ctaTaglineLabel}</label>
              <input className={inputCls} value={form.cta.tagline}
                onChange={(e) => setCta('tagline', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{tr.ctaTitle1Label}</label>
                <input className={inputCls} value={form.cta.title1}
                  onChange={(e) => setCta('title1', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>{tr.ctaTitle2Label}</label>
                <input className={inputCls} value={form.cta.title2}
                  onChange={(e) => setCta('title2', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>{tr.ctaDescLabel}</label>
              <textarea className={textareaCls} rows={2} value={form.cta.description}
                onChange={(e) => setCta('description', e.target.value)} />
            </div>
          </div>
        </section>

      </div>

      {/* ── SAVE ── */}
      <div className="mt-10">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-white text-black font-body text-xs font-semibold tracking-widest uppercase hover:bg-gray-200 transition-colors"
        >
          {tr.save}
        </button>
      </div>

      {/* ── SUCCESS TOAST ── */}
      {saved && (
        <div className="fixed bottom-6 left-6 z-[9999] flex items-center gap-3 bg-zinc-900 border border-green-500/50 px-5 py-4 shadow-2xl">
          <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-body text-xs font-semibold tracking-widest uppercase text-green-400">{tr.savedTitle}</p>
            <p className="font-body text-[10px] text-gray-500 mt-0.5">{tr.savedMsg}</p>
          </div>
        </div>
      )}

      {/* ── ERROR TOAST ── */}
      {saveError && (
        <div className="fixed bottom-6 left-6 z-[9999] flex items-center gap-3 bg-zinc-900 border border-red-500/50 px-5 py-4 shadow-2xl max-w-sm">
          <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="font-body text-xs font-semibold tracking-widest uppercase text-red-400">{tr.errorTitle}</p>
            <p className="font-body text-[10px] text-gray-400 mt-0.5">{saveError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
