import { useState, useRef, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../store';
import ImageCropper from '../../components/ImageCropper';
import { uploadImage } from '../../lib/uploadImage';

const inputCls = 'w-full bg-transparent border border-white/15 px-4 py-2.5 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors';
const labelCls = 'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2';

export default function AdminArtistForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const artists = useStore((s) => s.artists);
  const addArtist = useStore((s) => s.addArtist);
  const updateArtist = useStore((s) => s.updateArtist);

  const existing = id ? artists.find((a) => a.id === id) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState('');
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    bio: existing?.bio ?? '',
    photoUrl: existing?.photoUrl ?? '',
    specialties: existing?.specialties.join(', ') ?? '',
    instagram: existing?.instagram ?? '',
    whatsapp: existing?.whatsapp ?? '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCropSrc(ev.target?.result as string); };
    reader.readAsDataURL(file);
  }

  function onCropConfirm(dataUrl: string) {
    setForm((f) => ({ ...f, photoUrl: dataUrl }));
    setCropSrc('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function onCropCancel() {
    if (!form.photoUrl && cropSrc) setForm((f) => ({ ...f, photoUrl: cropSrc }));
    setCropSrc('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setUploading(true);
    const photoUrl = await uploadImage(form.photoUrl || `https://picsum.photos/seed/${Date.now()}/400/400`);
    setUploading(false);
    const data = {
      name: form.name,
      bio: form.bio,
      photoUrl,
      specialties: form.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      instagram: form.instagram || undefined,
      whatsapp: form.whatsapp || undefined,
    };
    if (existing) {
      updateArtist(existing.id, data);
    } else {
      addArtist(data);
    }
    navigate('/admin/artistas');
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin/artistas"
          className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors inline-flex items-center gap-2 mb-4"
        >
          ← Artistas
        </Link>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide leading-none">
          {existing ? 'Editar Artista' : 'Novo Artista'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Coluna esquerda: info principal ── */}
          <div className="lg:col-span-2 border border-white/10 p-6 space-y-5">
            <div>
              <label className={labelCls}>Nome *</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="Ex: Rafael Mendes" />
            </div>

            <div>
              <label className={labelCls}>Biografia</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={6}
                className={`${inputCls} resize-none`} placeholder="Sobre o artista..." />
            </div>

            <div>
              <label className={labelCls}>
                Especialidades
                <span className="text-gray-700 ml-1 normal-case tracking-normal font-normal">(separadas por vírgula)</span>
              </label>
              <input name="specialties" value={form.specialties} onChange={handleChange} className={inputCls}
                placeholder="Realismo, Blackwork, Aquarela" />
            </div>
          </div>

          {/* ── Coluna direita: foto + links ── */}
          <div className="space-y-5">
            <div className="border border-white/10 p-6 space-y-4">
              <label className={labelCls}>Foto do Artista</label>

              {cropSrc ? (
                <ImageCropper src={cropSrc} onConfirm={onCropConfirm} onCancel={onCropCancel} />
              ) : (
                <>
                  {!form.photoUrl.startsWith('data:') && (
                    <div className="flex gap-2">
                      <input name="photoUrl" value={form.photoUrl} onChange={handleChange} className={inputCls}
                        placeholder="https://..." />
                      {form.photoUrl && (
                        <button type="button" onClick={() => setCropSrc(form.photoUrl)}
                          className="flex-shrink-0 px-3 border border-amber-400/40 hover:border-amber-400 text-amber-400/60 hover:text-amber-400 font-body text-[10px] tracking-widest uppercase transition-colors whitespace-nowrap">
                          Cortar
                        </button>
                      )}
                    </div>
                  )}

                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                  {form.photoUrl ? (
                    <div className="relative">
                      <img src={form.photoUrl} alt="Preview"
                        className="w-full aspect-square object-cover border border-white/10"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <button type="button"
                        onClick={() => { setForm((f) => ({ ...f, photoUrl: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="absolute top-2 right-2 bg-black/80 border border-white/20 text-white/50 hover:text-white p-1 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="mt-2 w-full py-2 border border-dashed border-white/15 hover:border-white/40 text-gray-600 hover:text-gray-400 font-body text-[10px] tracking-widest uppercase transition-colors">
                        Trocar foto
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full border border-dashed border-white/20 hover:border-amber-400/50 py-8 flex flex-col items-center gap-2 text-gray-500 hover:text-amber-400/80 transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="font-body text-xs font-semibold tracking-widest uppercase">Selecionar foto</span>
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="border border-white/10 p-6 space-y-4">
              <div>
                <label className={labelCls}>
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </span>
                </label>
                <input name="instagram" value={form.instagram} onChange={handleChange} className={inputCls} placeholder="https://instagram.com/artista" />
              </div>

              <div>
                <label className={labelCls}>
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </span>
                </label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className={inputCls} placeholder="https://wa.me/5511999999999" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Botões de ação ── */}
        <div className="flex gap-3 pt-6">
          <button type="submit" disabled={uploading}
            className="flex-1 lg:flex-none lg:px-12 bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-wait text-black font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors">
            {uploading ? 'Enviando…' : existing ? 'Salvar' : 'Criar Artista'}
          </button>
          <Link to="/admin/artistas"
            className="px-6 py-3 border border-white/15 hover:border-white text-gray-500 hover:text-white font-body font-bold text-xs tracking-widest uppercase transition-colors text-center">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
