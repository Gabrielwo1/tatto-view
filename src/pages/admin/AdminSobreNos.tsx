import { useState, useRef } from 'react';
import { useStore } from '../../store';
import type { SobreNosContent } from '../../store';
import { uploadImage } from '../../lib/uploadImage';

const inputCls =
  'w-full bg-transparent border border-white/15 px-4 py-2.5 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors';
const labelCls =
  'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2';
const textareaCls = inputCls + ' resize-none';

export default function AdminSobreNos() {
  const sobreNosContent = useStore((s) => s.sobreNosContent);
  const setSobreNosContent = useStore((s) => s.setSobreNosContent);

  const [form, setForm] = useState<SobreNosContent>(sobreNosContent);
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function setHero(field: keyof SobreNosContent['hero'], value: string) {
    setForm((f) => ({ ...f, hero: { ...f.hero, [field]: value } }));
  }

  function setCollective(field: keyof SobreNosContent['collective'], value: string) {
    setForm((f) => ({ ...f, collective: { ...f.collective, [field]: value } }));
  }

  function setStudio(field: keyof Omit<SobreNosContent['studio'], 'hours'>, value: string) {
    setForm((f) => ({ ...f, studio: { ...f.studio, [field]: value } }));
  }

  function setHour(index: number, field: 'days' | 'time' | 'closed', value: string | boolean) {
    setForm((f) => {
      const hours = f.studio.hours.map((h, i) =>
        i === index ? { ...h, [field]: value } : h
      );
      return { ...f, studio: { ...f.studio, hours } };
    });
  }

  function addHour() {
    setForm((f) => ({
      ...f,
      studio: {
        ...f.studio,
        hours: [...f.studio.hours, { days: '', time: '', closed: false }],
      },
    }));
  }

  function removeHour(index: number) {
    setForm((f) => ({
      ...f,
      studio: { ...f.studio, hours: f.studio.hours.filter((_, i) => i !== index) },
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      const url = await uploadImage(base64);
      setForm((f) => ({ ...f, collective: { ...f.collective, image: url } }));
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleSave() {
    setSobreNosContent(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const mapAddress = encodeURIComponent([form.studio.street, form.studio.city, form.studio.cep].filter(Boolean).join(', '));
  const mapPreviewSrc = `https://maps.google.com/maps?q=${mapAddress}&z=${form.studio.mapZoom || 15}&output=embed`;

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl uppercase tracking-wide text-white">Sobre Nós</h1>
        <p className="font-body text-xs text-gray-500 mt-1">Edite o conteúdo da página "Sobre Nós"</p>
      </div>

      <div className="space-y-10">

        {/* ── HERO ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            Hero
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Título linha 1</label>
              <input
                className={inputCls}
                value={form.hero.title1}
                onChange={(e) => setHero('title1', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Título linha 2</label>
              <input
                className={inputCls}
                value={form.hero.title2}
                onChange={(e) => setHero('title2', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Descrição</label>
              <textarea
                className={textareaCls}
                rows={3}
                value={form.hero.description}
                onChange={(e) => setHero('description', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Linha de fundação (Ex: Est. 2018 — Francisco Beltrão)</label>
              <input
                className={inputCls}
                value={form.hero.estLabel}
                onChange={(e) => setHero('estLabel', e.target.value)}
                placeholder="Est. 2018 — Francisco Beltrão"
              />
            </div>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── THE COLLECTIVE ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            The Collective
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Título da seção</label>
              <input
                className={inputCls}
                value={form.collective.title}
                onChange={(e) => setCollective('title', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Parágrafo 1</label>
              <textarea
                className={textareaCls}
                rows={3}
                value={form.collective.body1}
                onChange={(e) => setCollective('body1', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Parágrafo 2</label>
              <textarea
                className={textareaCls}
                rows={3}
                value={form.collective.body2}
                onChange={(e) => setCollective('body2', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Parágrafo 3 (opcional)</label>
              <textarea
                className={textareaCls}
                rows={2}
                value={form.collective.body3}
                onChange={(e) => setCollective('body3', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Texto do botão CTA</label>
                <input
                  className={inputCls}
                  value={form.collective.ctaLabel}
                  onChange={(e) => setCollective('ctaLabel', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Legenda da imagem</label>
                <input
                  className={inputCls}
                  value={form.collective.imageCaption}
                  onChange={(e) => setCollective('imageCaption', e.target.value)}
                />
              </div>
            </div>

            {/* ── Imagem do Estúdio ── */}
            <div>
              <label className={labelCls}>Foto do Estúdio</label>
              <div className="flex gap-4 items-start">
                {/* Preview */}
                <div className="w-28 aspect-[3/4] bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center border border-white/10">
                  {form.collective.image ? (
                    <img src={form.collective.image} alt="Estúdio" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-body text-[9px] tracking-widest uppercase text-white/20 text-center px-2">
                      Sem imagem
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2 border border-white/20 text-white font-body text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? 'Enviando...' : 'Selecionar foto'}
                  </button>
                  {form.collective.image && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, collective: { ...f.collective, image: '' } }))}
                      className="px-4 py-2 border border-white/10 text-gray-500 font-body text-xs font-semibold tracking-widest uppercase hover:border-red-500/50 hover:text-red-400 transition-colors"
                    >
                      Remover foto
                    </button>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── QUOTE ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            Frase de Destaque
          </h2>
          <div>
            <label className={labelCls}>Citação</label>
            <textarea
              className={textareaCls}
              rows={2}
              value={form.quote}
              onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
            />
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── STUDIO / ADDRESS ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            O Estúdio — Endereço
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Título da seção</label>
              <input
                className={inputCls}
                value={form.studio.title}
                onChange={(e) => setStudio('title', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Rua / Número</label>
              <input
                className={inputCls}
                value={form.studio.street}
                onChange={(e) => setStudio('street', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Cidade — Estado</label>
                <input
                  className={inputCls}
                  value={form.studio.city}
                  onChange={(e) => setStudio('city', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>CEP</label>
                <input
                  className={inputCls}
                  value={form.studio.cep}
                  onChange={(e) => setStudio('cep', e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── MAP ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-2">
            Mapa — Localização
          </h2>
          <p className="font-body text-[10px] text-gray-600 mb-5">
            O mapa usa automaticamente o endereço preenchido acima. Ajuste o zoom se necessário.
          </p>
          <div className="space-y-4">
            <div className="w-32">
              <label className={labelCls}>Zoom (1–20)</label>
              <input
                className={inputCls}
                placeholder="15"
                value={form.studio.mapZoom}
                onChange={(e) => setStudio('mapZoom', e.target.value)}
              />
            </div>

            {/* Map preview */}
            <div className="mt-4">
              <p className={labelCls}>Pré-visualização do mapa</p>
              <div className="w-full aspect-video bg-zinc-900 overflow-hidden border border-white/10">
                <iframe
                  key={mapPreviewSrc}
                  src={mapPreviewSrc}
                  title="Pré-visualização"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(0.9)' }}
                  loading="lazy"
                />
              </div>
              <p className="font-body text-[10px] text-gray-600 mt-2">
                Salve as alterações para atualizar o mapa na página pública.
              </p>
            </div>
          </div>
        </section>

        <div className="border-t border-white/8" />

        {/* ── HOURS ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            Horário de Funcionamento
          </h2>
          <div className="space-y-3">
            {form.studio.hours.map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  className={inputCls + ' flex-1'}
                  placeholder="Seg — Sex"
                  value={h.days}
                  onChange={(e) => setHour(i, 'days', e.target.value)}
                />
                <input
                  className={inputCls + ' flex-1'}
                  placeholder="11:00 — 20:00"
                  value={h.time}
                  onChange={(e) => setHour(i, 'time', e.target.value)}
                />
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={h.closed}
                    onChange={(e) => setHour(i, 'closed', e.target.checked)}
                    className="accent-ink-500 w-4 h-4"
                  />
                  <span className="font-body text-[10px] uppercase tracking-widest text-gray-500">Fechado</span>
                </label>
                <button
                  onClick={() => removeHour(i)}
                  className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                  title="Remover"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={addHour}
              className="mt-2 font-body text-xs tracking-widest uppercase text-gray-500 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 transition-colors"
            >
              + Adicionar horário
            </button>
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
        {saved && (
          <span className="font-body text-xs tracking-widest uppercase text-green-400">
            Salvo com sucesso
          </span>
        )}
      </div>
    </div>
  );
}
