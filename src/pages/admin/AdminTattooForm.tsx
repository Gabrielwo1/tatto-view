import { useState, useRef, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../store';
import { TATTOO_STYLES } from '../../types';
import ImageCropper from '../../components/ImageCropper';

const inputCls = 'w-full bg-transparent border border-white/15 px-4 py-2.5 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors';
const labelCls = 'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2';

export default function AdminTattooForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
  const addTattoo = useStore((s) => s.addTattoo);
  const updateTattoo = useStore((s) => s.updateTattoo);

  const existing = id ? tattoos.find((t) => t.id === id) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: existing?.title ?? '',
    description: existing?.description ?? '',
    imageUrl: existing?.imageUrl ?? '',
    style: existing?.style ?? TATTOO_STYLES[0],
    price: existing?.price ?? '',
    artistId: existing?.artistId ?? '',
    status: existing?.status ?? 'available',
  });

  // cropSrc triggers the inline cropper on the right panel
  const [cropSrc, setCropSrc] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropSrc(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function onCropConfirm(dataUrl: string) {
    setForm((f) => ({ ...f, imageUrl: dataUrl }));
    setCropSrc('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function onCropCancel() {
    if (!form.imageUrl && cropSrc) {
      setForm((f) => ({ ...f, imageUrl: cropSrc }));
    }
    setCropSrc('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = {
      ...form,
      artistId: form.artistId || null,
      status: form.status as 'available' | 'archived',
    };
    if (existing) {
      updateTattoo(existing.id, data);
    } else {
      addTattoo(data);
    }
    navigate('/admin/tatuagens');
  }

  const showCropper = Boolean(cropSrc);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin/tatuagens"
          className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors inline-flex items-center gap-2 mb-4"
        >
          ← Tatuagens
        </Link>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide leading-none">
          {existing ? 'Editar Arte' : 'Nova Arte'}
        </h1>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── LEFT: Form fields ─────────────────────────────── */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <form onSubmit={handleSubmit} className="border border-white/10 p-6 space-y-5">
            <div>
              <label className={labelCls}>Título *</label>
              <input name="title" value={form.title} onChange={handleChange} required
                className={inputCls} placeholder="Ex: Leão Realista" />
            </div>

            <div>
              <label className={labelCls}>Descrição *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                className={`${inputCls} resize-none`} placeholder="Descreva a tatuagem..." />
            </div>

            {/* URL da imagem — URL-only when no file loaded */}
            {!form.imageUrl.startsWith('data:') && (
              <div>
                <label className={labelCls}>URL da Imagem *</label>
                <div className="flex gap-2">
                  <input
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    required={!form.imageUrl}
                    className={inputCls}
                    placeholder="https://picsum.photos/seed/exemplo/600/600"
                  />
                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setCropSrc(form.imageUrl)}
                      className="flex-shrink-0 px-3 border border-amber-400/40 hover:border-amber-400 text-amber-400/60 hover:text-amber-400 font-body text-[10px] tracking-widest uppercase transition-colors whitespace-nowrap"
                    >
                      Cortar
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Estilo *</label>
                <select name="style" value={form.style} onChange={handleChange}
                  className={`${inputCls} bg-zinc-950`}>
                  {TATTOO_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Preço</label>
                <input name="price" value={form.price} onChange={handleChange}
                  className={inputCls} placeholder="R$ 500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Artista</label>
                <select name="artistId" value={form.artistId ?? ''} onChange={handleChange}
                  className={`${inputCls} bg-zinc-950`}>
                  <option value="">Estúdio</option>
                  {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className={`${inputCls} bg-zinc-950`}>
                  <option value="available">Disponível</option>
                  <option value="archived">Arquivada</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit"
                className="flex-1 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors">
                {existing ? 'Salvar' : 'Criar Arte'}
              </button>
              <Link to="/admin/tatuagens"
                className="px-6 py-3 border border-white/15 hover:border-white text-gray-500 hover:text-white font-body font-bold text-xs tracking-widest uppercase transition-colors text-center">
                Cancelar
              </Link>
            </div>
          </form>
        </div>

        {/* ── RIGHT: Image panel ────────────────────────────── */}
        <div className="flex-1 min-w-0 lg:sticky lg:top-8">
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">
            Imagem da tatuagem
          </p>

          {showCropper ? (
            /* ─ Cropper active ─ */
            <ImageCropper
              src={cropSrc}
              onConfirm={onCropConfirm}
              onCancel={onCropCancel}
            />
          ) : (
            /* ─ Upload / Preview ─ */
            <div className="border border-white/10 p-4 space-y-4">
              {/* File upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-white/25 hover:border-amber-400/50 py-5 flex flex-col items-center gap-2 text-gray-500 hover:text-amber-400/80 transition-colors"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="font-body text-xs font-semibold tracking-widest uppercase">
                  Selecionar do dispositivo
                </span>
                <span className="font-body text-[10px] text-gray-600">
                  Abre o recortador automaticamente
                </span>
              </button>

              {/* Preview */}
              {form.imageUrl ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full aspect-square object-cover border border-white/10"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, imageUrl: '' }));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white/60 hover:text-white p-1.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Prominent crop button */}
                  <button
                    type="button"
                    onClick={() => setCropSrc(form.imageUrl)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-amber-400/10 border border-amber-400/50 hover:bg-amber-400/20 hover:border-amber-400 text-amber-400 font-body text-xs font-bold tracking-widest uppercase transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    Ajustar recorte da imagem
                  </button>
                </div>
              ) : (
                <div className="aspect-square border border-dashed border-white/10 flex items-center justify-center">
                  <p className="font-body text-[10px] text-gray-700 tracking-widest uppercase">
                    Sem imagem
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
