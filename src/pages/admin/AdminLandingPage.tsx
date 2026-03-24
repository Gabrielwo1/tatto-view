import { useState } from 'react';
import { useStore } from '../../store';
import type { LandingContent } from '../../store';
import { supabase } from '../../lib/supabase';

const inputCls =
  'w-full bg-transparent border border-white/15 px-4 py-2.5 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors';
const labelCls =
  'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2';
const textareaCls = inputCls + ' resize-none';

export default function AdminLandingPage() {
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
      setSaveError('Erro ao salvar no servidor. Verifique sua conexão e tente novamente.');
      setTimeout(() => setSaveError(''), 6000);
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl uppercase tracking-wide text-white">Landing Page</h1>
        <p className="font-body text-xs text-gray-500 mt-1">Edite o conteúdo da página inicial de apresentação</p>
      </div>

      <div className="space-y-10">

        {/* ── HERO ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            Hero
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Título principal (use \n para quebra de linha)</label>
              <textarea
                className={textareaCls}
                rows={2}
                value={form.hero.tagline}
                onChange={(e) => setHero('tagline', e.target.value)}
                placeholder={'Sua história\nna pele'}
              />
            </div>
            <div>
              <label className={labelCls}>Subtítulo (use \n para quebra de linha)</label>
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
            Manifesto
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Título linha 1</label>
                <input
                  className={inputCls}
                  value={form.manifesto.title1}
                  onChange={(e) => setManifesto('title1', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Título linha 2</label>
                <input
                  className={inputCls}
                  value={form.manifesto.title2}
                  onChange={(e) => setManifesto('title2', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Parágrafo 1</label>
              <textarea
                className={textareaCls}
                rows={3}
                value={form.manifesto.body1}
                onChange={(e) => setManifesto('body1', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Parágrafo 2</label>
              <textarea
                className={textareaCls}
                rows={3}
                value={form.manifesto.body2}
                onChange={(e) => setManifesto('body2', e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── PROCESSO ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            Como Funciona (Processo)
          </h2>
          <div className="space-y-4">
            {form.processo.map((step, i) => (
              <div key={step.n} className="border border-white/10 p-4 space-y-3">
                <p className="font-display text-white/30 text-sm uppercase">{step.n}</p>
                <div>
                  <label className={labelCls}>Título</label>
                  <input
                    className={inputCls}
                    value={step.title}
                    onChange={(e) => setProcesso(i, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Descrição</label>
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
            Tabela de Preços
          </h2>
          <div className="space-y-3">
            {form.precos.map((preco, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Estilo</label>
                    <input
                      className={inputCls}
                      placeholder="Minimalista"
                      value={preco.label}
                      onChange={(e) => setPreco(i, 'label', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Valor</label>
                    <input
                      className={inputCls}
                      placeholder="R$ 250 – R$ 500"
                      value={preco.range}
                      onChange={(e) => setPreco(i, 'range', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Detalhe</label>
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
                  title="Remover"
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
              + Adicionar linha
            </button>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── FAQ ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            Perguntas Frequentes (FAQ)
          </h2>
          <div className="space-y-4">
            {form.faq.map((item, i) => (
              <div key={i} className="border border-white/10 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className={labelCls}>Pergunta</label>
                      <input
                        className={inputCls}
                        value={item.q}
                        onChange={(e) => setFaq(i, 'q', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Resposta</label>
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
                    title="Remover"
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
              + Adicionar pergunta
            </button>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── CTA FINAL ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            CTA Final
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Tagline (texto pequeno acima)</label>
              <input
                className={inputCls}
                value={form.cta.tagline}
                onChange={(e) => setCta('tagline', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Título linha 1</label>
                <input
                  className={inputCls}
                  value={form.cta.title1}
                  onChange={(e) => setCta('title1', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Título linha 2</label>
                <input
                  className={inputCls}
                  value={form.cta.title2}
                  onChange={(e) => setCta('title2', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Descrição</label>
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
          Salvar alterações
        </button>
      </div>

      {saved && (
        <div className="fixed bottom-6 left-6 z-[9999] flex items-center gap-3 bg-zinc-900 border border-green-500/50 px-5 py-4 shadow-2xl">
          <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-body text-xs font-semibold tracking-widest uppercase text-green-400">Salvo com sucesso</p>
            <p className="font-body text-[10px] text-gray-500 mt-0.5">As alterações já estão publicadas</p>
          </div>
        </div>
      )}

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
