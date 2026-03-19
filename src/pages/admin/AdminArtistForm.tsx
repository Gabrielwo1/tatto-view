import { useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../store';

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
      specialties: form.specialties
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      instagram: form.instagram || undefined,
    };
    if (existing) {
      updateArtist(existing.id, data);
    } else {
      addArtist(data);
    }
    navigate('/admin/artistas');
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/artistas" className="text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {existing ? 'Editar Artista' : 'Novo Artista'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-5">
        <div>
          <label className="block text-gray-400 text-sm mb-1.5">Nome *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            placeholder="Ex: Rafael Mendes"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1.5">Biografia</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 resize-none"
            placeholder="Sobre o artista..."
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1.5">URL da Foto</label>
          <input
            name="photoUrl"
            value={form.photoUrl}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            placeholder="https://picsum.photos/seed/exemplo/400/400"
          />
          {form.photoUrl && (
            <img
              src={form.photoUrl}
              alt="Preview"
              className="mt-2 w-20 h-20 object-cover rounded-full border-2 border-gray-700"
            />
          )}
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1.5">
            Especialidades
            <span className="text-gray-600 ml-1">(separadas por vírgula)</span>
          </label>
          <input
            name="specialties"
            value={form.specialties}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            placeholder="Ex: Realismo, Blackwork, Aquarela"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1.5">Instagram</label>
          <input
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            placeholder="@artista.ink"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-2.5 rounded-lg transition-colors"
          >
            {existing ? 'Salvar Alterações' : 'Criar Artista'}
          </button>
          <Link
            to="/admin/artistas"
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
