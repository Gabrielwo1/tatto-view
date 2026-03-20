import { useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../store';

const inputCls = 'w-full bg-transparent border border-white/15 px-4 py-2.5 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors';
const labelCls = 'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2';

export default function AdminArtistForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const artists = useStore((s) => s.artists);
  const addArtist = useStore((s) => s.addArtist);
  const updateArtist = useStore((s) => s.updateArtist);

  const existing = id ? artists.find((a) => a.id === id) : null;

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = {
      name: form.name,
      bio: form.bio,
      photoUrl: form.photoUrl || `https://picsum.photos/seed/${Date.now()}/400/400`,
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
    <div className="p-4 md:p-8 max-w-2xl">
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

      <form onSubmit={handleSubmit} className="border border-white/10 p-6 space-y-5">
        <div>
          <label className={labelCls}>Nome *</label>
          <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="Ex: Rafael Mendes" />
        </div>

        <div>
          <label className={labelCls}>Biografia</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
            className={`${inputCls} resize-none`} placeholder="Sobre o artista..." />
        </div>

        <div>
          <label className={labelCls}>URL da Foto</label>
          <input name="photoUrl" value={form.photoUrl} onChange={handleChange} className={inputCls}
            placeholder="https://picsum.photos/seed/exemplo/400/400" />
          {form.photoUrl && (
            <img src={form.photoUrl} alt="Preview"
              className="mt-2 w-16 h-16 object-cover border border-white/10"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          )}
        </div>

        <div>
          <label className={labelCls}>
            Especialidades
            <span className="text-gray-700 ml-1 normal-case tracking-normal font-normal">(separadas por vírgula)</span>
          </label>
          <input name="specialties" value={form.specialties} onChange={handleChange} className={inputCls}
            placeholder="Realismo, Blackwork, Aquarela" />
        </div>

        <div>
          <label className={labelCls}>Instagram</label>
          <input name="instagram" value={form.instagram} onChange={handleChange} className={inputCls} placeholder="@artista.ink" />
        </div>

        <div>
          <label className={labelCls}>WhatsApp</label>
          <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className={inputCls} placeholder="5511999999999" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="flex-1 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors">
            {existing ? 'Salvar' : 'Criar Artista'}
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
