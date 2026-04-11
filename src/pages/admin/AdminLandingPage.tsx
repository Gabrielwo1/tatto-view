import { useState } from 'react';
import { useStore } from '../../store';
import type { LandingContent } from '../../store';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../lib/useLang';

const T = {
  pt: {
    title: 'Landing Page',
    subtitle: 'Edite o conteúdo da página inicial de apresentação',
    heroSection: 'Hero',
    heroTaglineLabel: 'Título principal (use \\n para quebra de linha)',
    heroDescLabel: 'Subtítulo (use \\n para quebra de linha)',
    manifestoSection: 'Manifesto',
    title1Label: 'Título linha 1', title2Label: 'Título linha 2',
    body1Label: 'Parágrafo 1', body2Label: 'Parágrafo 2',
    processoSection: 'Como Funciona (Processo)',
    titleLabel: 'Título', descLabel: 'Descrição',
    precosSection: 'Tabela de Preços',
    styleLabel: 'Estilo', valueLabel: 'Valor', detailLabel: 'Detalhe',
    addRow: '+ Adicionar linha',
    faqSection: 'Perguntas Frequentes (FAQ)',
    questionLabel: 'Pergunta', answerLabel: 'Resposta',
    addQuestion: '+ Adicionar pergunta',
    estilosSection: 'Estilos (Ícone e Descrição)',
    iconLabel: 'Ícone (caractere único)', shortDescLabel: 'Descrição curta',
    ctaSection: 'CTA Final',
    ctaTaglineLabel: 'Tagline (texto pequeno acima)',
    ctaTitle1Label: 'Título linha 1', ctaTitle2Label: 'Título linha 2',
    ctaDescLabel: 'Descrição',
    save: 'Salvar alterações',
    saveError: 'Erro ao salvar no servidor. Verifique sua conexão e tente novamente.',
    savedTitle: 'Salvo com sucesso', savedMsg: 'As alterações já estão publicadas',
    errorTitle: 'Erro ao salvar',
    removeTitle: 'Remover',
  },
  en: {
    title: 'Landing Page',
    subtitle: 'Edit the main landing page content',
    heroSection: 'Hero',
    heroTaglineLabel: 'Main title (use \\n for line breaks)',
    heroDescLabel: 'Subtitle (use \\n for line breaks)',
    manifestoSection: 'Manifesto',
    title1Label: 'Title line 1', title2Label: 'Title line 2',
    body1Label: 'Paragraph 1', body2Label: 'Paragraph 2',
    processoSection: 'How It Works (Process)',
    titleLabel: 'Title', descLabel: 'Description',
    precosSection: 'Pricing Table',
    styleLabel: 'Style', valueLabel: 'Price', detailLabel: 'Detail',
    addRow: '+ Add row',
    faqSection: 'FAQ',
    questionLabel: 'Question', answerLabel: 'Answer',
    addQuestion: '+ Add question',
    estilosSection: 'Styles (Icon & Description)',
    iconLabel: 'Icon (single character)', shortDescLabel: 'Short description',
    ctaSection: 'Final CTA',
    ctaTaglineLabel: 'Tagline (small text above)',
    ctaTitle1Label: 'Title line 1', ctaTitle2Label: 'Title line 2',
    ctaDescLabel: 'Description',
    save: 'Save changes',
    saveError: 'Error saving to server. Check your connection and try again.',
    savedTitle: 'Saved successfully', savedMsg: 'Changes are now published',
    errorTitle: 'Save error',
    removeTitle: 'Remove',
  },
};

const inputCls =
  'w-full bg-transparent border border-white/15 px-4 py-2.5 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors';
const labelCls =
  'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2';
const textareaCls = inputCls + ' resize-none';

export default function AdminLandingPage() {
  const { lang } = useLang();
  const tr = T[lang];
  const landingContent = useStore((s) => s.landingContent);
  const setLandingContent = useStore((s) => s.setLandingContent);

  const [form, setForm] = useState<LandingContent>(landingContent);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  function setHero(field: keyof LandingContent['hero'], value: string) {
    setForm((f) => ({ ...f, hero: { ...f.hero, [field]: value } }));
  }

  function setManifesto(field: keyof LandingContent['manifesto'], value: string) {
    setForm((f) => ({ ...f, manifesto: { ...f.manifesto, [field]: value } }));
  }

  function setCta(field: keyof LandingContent['cta'], value: string) {
    setForm((f) => ({ ...f, cta: { ...f.cta, [field]: value } }));
  }

  function setProcesso(index: number, field: 'title' | 'desc', value: string) {
    setForm((f) => {
      const processo = f.processo.map((s, i) => i === index ? { ...s, [field]: value } : s);
      return { ...f, processo };
    });
  }

  function setPreco(index: number, field: 'label' | 'range' | 'detail', value: string) {
    setForm((f) => {
      const precos = f.precos.map((p, i) => i === index ? { ...p, [field]: value } : p);
      return { ...f, precos };
    });
  }

  function addPreco() {
    setForm((f) => ({
      ...f,
      precos: [...f.precos, { label: '', range: '', detail: '' }],
    }));
  }

  function removePreco(index: number) {
    setForm((f) => ({ ...f, precos: f.precos.filter((_, i) => i !== index) }));
  }

  function setFaq(index: number, field: 'q' | 'a', value: string) {
    setForm((f) => {
      const faq = f.faq.map((item, i) => i === index ? { ...item, [field]: value } : item);
      return { ...f, faq };
    });
  }

  function addFaq() {
    setForm((f) => ({ ...f, faq: [...f.faq, { q: '', a: '' }] }));
  }

  function removeFaq(index: number) {
    setForm((f) => ({ ...f, faq: f.faq.filter((_, i) => i !== index) }));
  }

  async function handleSave() {
    try {
      setLandingContent(form);
      if (supabase) {
        const { error } = await supabase.from('site_config').upsert({
          key: 'landingContent',
          value: form,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
      setSaved(true);
      setSaveError('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[AdminLandingPage] save failed:', err);
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
              <label className={labelCls}>{tr.heroTaglineLabel}</label>
              <textarea
                className={textareaCls}
                rows={2}
                value={form.hero.tagline}
                onChange={(e) => setHero('tagline', e.target.value)}
                placeholder={'Sua história\nna pele'}
              />
            </div>
            <div>
              <label className={labelCls}>{tr.heroDescLabel}</label>
              <textarea
                className={textareaCls}
                rows={3}
                value={form.hero.description}
                onChange={(e) => setHero('description', e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── MANIFESTO ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            {tr.manifestoSection}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{tr.title1Label}</label>
                <input
                  className={inputCls}
                  value={form.manifesto.title1}
                  onChange={(e) => setManifesto('title1', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>{tr.title2Label}</label>
                <input
                  className={inputCls}
                  value={form.manifesto.title2}
                  onChange={(e) => setManifesto('title2', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>{tr.body1Label}</label>
              <textarea
                className={textareaCls}
                rows={3}
                value={form.manifesto.body1}
                onChange={(e) => setManifesto('body1', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>{tr.body2Label}</label>
              <textarea
                className={textareaCls}
                rows={3}
                value={form.manifesto.body2}
                onChange={(e) => setManifesto('body2', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            PROCESSO (COMO FUNCIONA)
        ══════════════════════════════════════════════════ */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            {tr.processoSection}
          </h2>
          <div className="space-y-4">
            {form.processo.map((step, i) => (
              <div key={step.n} className="border border-white/10 p-4 space-y-3">
                <p className="font-display text-white/30 text-sm uppercase">{step.n}</p>
                <div>
                  <label className={labelCls}>{tr.titleLabel}</label>
                  <input
                    className={inputCls}
                    value={step.title}
                    onChange={(e) => setProcesso(i, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>{tr.descLabel}</label>
                  <textarea
                    className={textareaCls}
                    rows={2}
                    value={step.desc}
                    onChange={(e) => setProcesso(i, 'desc', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── PREÇOS ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            {tr.precosSection}
          </h2>
          <div className="space-y-3">
            {form.precos.map((preco, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>{tr.styleLabel}</label>
                    <input
                      className={inputCls}
                      placeholder="Minimalista"
                      value={preco.label}
                      onChange={(e) => setPreco(i, 'label', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{tr.valueLabel}</label>
                    <input
                      className={inputCls}
                      placeholder="R$ 250 – R$ 500"
                      value={preco.range}
                      onChange={(e) => setPreco(i, 'range', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{tr.detailLabel}</label>
                    <input
                      className={inputCls}
                      placeholder="Peças pequenas"
                      value={preco.detail}
                      onChange={(e) => setPreco(i, 'detail', e.target.value)}
                    />
                  </div>
                </div>
                <button
                  onClick={() => removePreco(i)}
                  className="mt-6 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                  title={tr.removeTitle}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={addPreco}
              className="mt-2 font-body text-xs tracking-widest uppercase text-gray-500 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 transition-colors"
            >
              {tr.addRow}
            </button>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── FAQ ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            {tr.faqSection}
          </h2>
          <div className="space-y-4">
            {form.faq.map((item, i) => (
              <div key={i} className="border border-white/10 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className={labelCls}>{tr.questionLabel}</label>
                      <input
                        className={inputCls}
                        value={item.q}
                        onChange={(e) => setFaq(i, 'q', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>{tr.answerLabel}</label>
                      <textarea
                        className={textareaCls}
                        rows={2}
                        value={item.a}
                        onChange={(e) => setFaq(i, 'a', e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeFaq(i)}
                    className="mt-6 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                    title={tr.removeTitle}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addFaq}
              className="mt-2 font-body text-xs tracking-widest uppercase text-gray-500 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 transition-colors"
            >
              {tr.addQuestion}
            </button>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── ESTILOS ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            {tr.estilosSection}
          </h2>
          <div className="space-y-3">
            {Object.entries(form.estilos ?? {}).map(([style, info]) => (
              <div key={style} className="border border-white/10 p-4">
                <p className="font-display text-sm text-white/50 uppercase mb-3">{style}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{tr.iconLabel}</label>
                    <input
                      className={inputCls}
                      value={info.icon}
                      maxLength={2}
                      onChange={(e) => setForm((f) => ({
                        ...f,
                        estilos: { ...f.estilos, [style]: { ...info, icon: e.target.value } },
                      }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{tr.shortDescLabel}</label>
                    <input
                      className={inputCls}
                      value={info.desc}
                      onChange={(e) => setForm((f) => ({
                        ...f,
                        estilos: { ...f.estilos, [style]: { ...info, desc: e.target.value } },
                      }))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── CTA FINAL ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            {tr.ctaSection}
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{tr.ctaTaglineLabel}</label>
              <input
                className={inputCls}
                value={form.cta.tagline}
                onChange={(e) => setCta('tagline', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{tr.ctaTitle1Label}</label>
                <input
                  className={inputCls}
                  value={form.cta.title1}
                  onChange={(e) => setCta('title1', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>{tr.ctaTitle2Label}</label>
                <input
                  className={inputCls}
                  value={form.cta.title2}
                  onChange={(e) => setCta('title2', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>{tr.ctaDescLabel}</label>
              <textarea
                className={textareaCls}
                rows={2}
                value={form.cta.description}
                onChange={(e) => setCta('description', e.target.value)}
              />
            </div>
          </div>
        </section>

      </div>

      {/* ── SAVE ── */}
      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-white text-black font-body text-xs font-semibold tracking-widest uppercase hover:bg-gray-200 transition-colors"
        >
          {tr.save}
        </button>
      </div>

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
