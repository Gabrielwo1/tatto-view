import { useState, type FormEvent } from 'react';
import { useStore } from '../../store';
import { uploadImage } from '../../lib/uploadImage';
import ImageCropper from '../../components/ImageCropper';

const inputCls = 'w-full bg-transparent border border-white/15 px-4 py-2.5 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors';
const labelCls = 'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2';

export default function AdminMyProfile() {
  const artists         = useStore((s) => s.artists);
  const currentArtistId = useStore((s) => s.currentArtistId);
  const isAdmin         = useStore((s) => s.isAdmin);
  const updateArtist    = useStore((s) => s.updateArtist);

  const artist = artists.find((a) => a.id === currentArtistId);

  const [form, setForm] = useState({
    name:        artist?.name        ?? '',
    bio:         artist?.bio         ?? '',
    photoUrl:    artist?.photoUrl    ?? '',
    instagram:   artist?.instagram   ?? '',
    whatsapp:    artist?.whatsapp    ?? '',
    specialties: artist?.specialties?.join(', ') ?? '',
  });

  const [cropSrc, setCropSrc]   = useState('');
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved]       = useState(false);

  if (isAdmin) {
    return (
      <div className="p-8 text-gray-500 font-body text-sm">
        Esta página é exclusiva para artistas. Como admin, use a seção <strong className="text-white">Artistas</strong> para editar perfis.
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="p-8 text-gray-500 font-body text-sm">
        Perfil não encontrado. Entre em contato com o administrador.
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function onCropConfirm(dataUrl: string) {
    setForm((f) => ({ ...f, photoUrl: dataUrl }));
    setCropSrc('');
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setUploading(true);
    const photoUrl = await uploadImage(form.photoUrl);
    setUploading(false);
    updateArtist(artist!.id, {
      name:        form.name,
      bio:         form.bio,
      photoUrl,
      instagram:   form.instagram || undefined,
      whatsapp:    form.whatsapp  || undefined,
      specialties: form.specialties
        ? form.specialties.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    });
    setSaved(true);
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onConfirm={onCropConfirm}
          onCancel={() => setCropSrc('')}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Artista</p>
        <h1 className="font-display text-3xl md:text-5xl text-white uppercase tracking-wide leading-none">
          Meu Perfil
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Coluna esquerda: info principal ── */}
          <div className="lg:col-span-2 border border-white/10 p-6 space-y-6">
            {/* Name */}
            <div>
              <label className={labelCls}>Nome</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="Seu nome artístico" />
            </div>

            {/* Bio */}
            <div>
              <label className={labelCls}>Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={6} className={`${inputCls} resize-none`} placeholder="Fale sobre você e seu estilo..." />
            </div>

            {/* Specialties */}
            <div>
              <label className={labelCls}>Especialidades (separe por vírgula)</label>
              <input name="specialties" value={form.specialties} onChange={handleChange} className={inputCls} placeholder="Realismo, Blackwork, Old School" />
            </div>
          </div>

          {/* ── Coluna direita: foto + redes sociais ── */}
          <div className="space-y-5">
            {/* Photo */}
            <div className="border border-white/10 p-6 space-y-4">
              <label className={labelCls}>Foto</label>
              <div className="w-full aspect-square overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center">
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt={form.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
              <label className="cursor-pointer w-full inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white px-4 py-2.5 text-xs font-body font-semibold tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Alterar Foto
                <input type="file" accept="image/*" onChange={handlePhotoFile} className="hidden" />
              </label>
            </div>

            {/* Social */}
            <div className="border border-white/10 p-6 space-y-4">
              <div>
                <label className={labelCls}>Instagram</label>
                <input name="instagram" value={form.instagram} onChange={handleChange} className={inputCls} placeholder="@seuinstagram" />
              </div>
              <div>
                <label className={labelCls}>WhatsApp</label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className={inputCls} placeholder="5511999999999" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-6">
          <button
            type="submit"
            disabled={uploading}
            className="bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-body font-bold text-xs tracking-widest uppercase px-8 py-3 transition-colors"
          >
            {uploading ? 'Salvando...' : 'Salvar Perfil'}
          </button>
          {saved && (
            <span className="font-body text-xs text-green-400 tracking-widest uppercase">Salvo!</span>
          )}
        </div>
      </form>
    </div>
  );
}
