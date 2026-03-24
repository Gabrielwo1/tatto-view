import { useState, useRef } from 'react';
import { useStore } from '../../store';
import type { SobreNosContent } from '../../store';
import { uploadImage } from '../../lib/uploadImage';
import { supabase } from '../../lib/supabase';

/** Resize image to max 1200px and re-encode as JPEG 85% to stay within localStorage limits. */
function compressImage(base64: string, maxPx = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64;
  });
}

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
  const [saveError, setSaveError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState<boolean[]>([false, false, false, false]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryRefs = useRef<(HTMLInputElement | null)[]>([]);

  function setHero(field: keyof SobreNosContent['hero'], value: string) {
    setForm((f) => ({ ...f, hero: { ...f.hero, [field]: value } }));
  }

  function setCollective(field: keyof SobreNosContent['collective'], value: string) {
    setForm((f) => ({ ...f, collective: { ...f.collective, [field]: value } }));
  }

  function setStudio(field: keyof Omit<SobreNosContent['studio'], 'hours'>, value: string) {
    setForm((f) => ({ ...f, studio: { ...f.studio, [field]: value } }));
  }

  function setContact(field: keyof SobreNosContent['contact'], value: string) {
    setForm((f) => ({ ...f, contact: { ...f.contact, [field]: value } }));
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
      try {
        let src = ev.target?.result as string;
        // Upload to cloud if possible; otherwise compress before storing locally
        src = await uploadImage(src);
        if (src.startsWith('data:')) {
          src = await compressImage(src);
        }
        setForm((f) => ({ ...f, collective: { ...f.collective, image: src } }));
      } catch (err) {
        console.error('[AdminSobreNos] image upload failed:', err);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleGalleryUpload(idx: number, file: File) {
    setUploadingGallery((prev) => { const n = [...prev]; n[idx] = true; return n; });
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          let src = ev.target?.result as string;
          src = await uploadImage(src);
          if (src.startsWith('data:')) src = await compressImage(src);
          setForm((f) => {
            const imgs = [...(f.collective.galleryImages ?? ['', '', '', ''])] as [string, string, string, string];
            imgs[idx] = src;
            return { ...f, collective: { ...f.collective, galleryImages: imgs } };
          });
        } finally {
          setUploadingGallery((prev) => { const n = [...prev]; n[idx] = false; return n; });
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingGallery((prev) => { const n = [...prev]; n[idx] = false; return n; });
    }
  }

  function clearGalleryImage(idx: number) {
    setForm((f) => {
      const imgs = [...(f.collective.galleryImages ?? ['', '', '', ''])] as [string, string, string, string];
      imgs[idx] = '';
      return { ...f, collective: { ...f.collective, galleryImages: imgs } };
    });
  }

  async function handleSave() {
    try {
      // Update local store/localStorage
      setSobreNosContent(form);

      // Await Supabase directly so we know if it succeeded
      if (supabase) {
        const { error } = await supabase.from('site_config').upsert({
          key: 'sobreNosContent',
          value: form,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      }

      setSaved(true);
      setSaveError('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[AdminSobreNos] save failed:', err);
      setSaveError('Erro ao salvar no servidor. Verifique sua conexão e tente novamente.');
      setTimeout(() => setSaveError(''), 6000);
    }
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

            {/* ── 4 fotos menores ── */}
            <div>
              <label className={labelCls}>4 Fotos Menores (abaixo da foto principal)</label>
              <div className="grid grid-cols-4 gap-2">
                {([0, 1, 2, 3] as const).map((idx) => {
                  const img = form.collective.galleryImages?.[idx] ?? '';
                  return (
                    <div key={idx} className="relative aspect-square">
                      {img ? (
                        <>
                          <img src={img} alt={`Galeria ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => clearGalleryImage(idx)}
                            className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >✕</button>
                        </>
                      ) : (
                        <div
                          className="w-full h-full border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-white/40 transition-colors"
                          onClick={() => galleryRefs.current[idx]?.click()}
                        >
                          {uploadingGallery[idx] ? (
                            <span className="font-body text-[9px] text-white/30">...</span>
                          ) : (
                            <>
                              <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                              <span className="font-body text-[9px] text-white/20">{idx + 1}</span>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        ref={(el) => { galleryRefs.current[idx] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGalleryUpload(idx, f); e.target.value = ''; }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Tamanho da imagem ── */}
            <div>
              <label className={labelCls}>Tamanho da foto na página</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'sm', label: 'Pequena' },
                  { value: 'md', label: 'Média' },
                  { value: 'lg', label: 'Grande' },
                  { value: 'full', label: 'Coluna Inteira' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCollective('imageSize', opt.value)}
                    className={`px-4 py-2 font-body text-xs font-semibold tracking-widest uppercase transition-colors border ${
                      form.collective.imageSize === opt.value
                        ? 'bg-white text-black border-white'
                        : 'border-white/15 text-gray-400 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
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

        {/* ── CONTATO & REDES SOCIAIS ── */}
        <section>
          <h2 className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-5">
            Contato & Redes Sociais
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>E-mail de contato</label>
              <input
                className={inputCls}
                type="email"
                placeholder="contato@studio.com"
                value={form.contact.email}
                onChange={(e) => setContact('email', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Telefone 1 (exibição)</label>
                <input
                  className={inputCls}
                  placeholder="(11) 3031-3881"
                  value={form.contact.phone1}
                  onChange={(e) => setContact('phone1', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Telefone 1 (link tel:)</label>
                <input
                  className={inputCls}
                  placeholder="tel:+551130313881"
                  value={form.contact.phone1Url}
                  onChange={(e) => setContact('phone1Url', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Telefone 2 (exibição)</label>
                <input
                  className={inputCls}
                  placeholder="(11) 98701-6894"
                  value={form.contact.phone2}
                  onChange={(e) => setContact('phone2', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Telefone 2 (link tel:)</label>
                <input
                  className={inputCls}
                  placeholder="tel:+5511987016894"
                  value={form.contact.phone2Url}
                  onChange={(e) => setContact('phone2Url', e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="font-body text-[10px] text-gray-600 mb-3">Redes Sociais</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Instagram (handle)</label>
                    <input
                      className={inputCls}
                      placeholder="@studio"
                      value={form.contact.instagram}
                      onChange={(e) => setContact('instagram', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Instagram (URL)</label>
                    <input
                      className={inputCls}
                      placeholder="https://instagram.com/studio"
                      value={form.contact.instagramUrl}
                      onChange={(e) => setContact('instagramUrl', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>TikTok (handle)</label>
                    <input
                      className={inputCls}
                      placeholder="@studio"
                      value={form.contact.tiktok}
                      onChange={(e) => setContact('tiktok', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>TikTok (URL)</label>
                    <input
                      className={inputCls}
                      placeholder="https://tiktok.com/@studio"
                      value={form.contact.tiktokUrl}
                      onChange={(e) => setContact('tiktokUrl', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Twitter/X (handle)</label>
                    <input
                      className={inputCls}
                      placeholder="@studio"
                      value={form.contact.twitter}
                      onChange={(e) => setContact('twitter', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Twitter/X (URL)</label>
                    <input
                      className={inputCls}
                      placeholder="https://twitter.com/studio"
                      value={form.contact.twitterUrl}
                      onChange={(e) => setContact('twitterUrl', e.target.value)}
                    />
                  </div>
                </div>
              </div>
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
      </div>

      {/* ── SUCCESS TOAST ── bottom-left to avoid the right sidebar */}
      {saved && (
        <div className="fixed bottom-6 left-6 z-[9999] flex items-center gap-3 bg-zinc-900 border border-green-500/50 px-5 py-4 shadow-2xl">
          <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-body text-xs font-semibold tracking-widest uppercase text-green-400">
              Salvo com sucesso
            </p>
            <p className="font-body text-[10px] text-gray-500 mt-0.5">
              As alterações já estão publicadas
            </p>
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
            <p className="font-body text-xs font-semibold tracking-widest uppercase text-red-400">
              Erro ao salvar
            </p>
            <p className="font-body text-[10px] text-gray-400 mt-0.5">
              {saveError}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
