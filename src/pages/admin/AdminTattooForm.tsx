import { useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../store';
import { TATTOO_STYLES } from '../../types';

export default function AdminTattooForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
  const addTattoo = useStore((s) => s.addTattoo);
  const updateTattoo = useStore((s) => s.updateTattoo);

  const existing = id ? tattoos.find((t) => t.id === id) : null;

  const [form, setForm] = useState({
    title: existing?.title ?? '',
    description: existing?.description ?? '',
    imageUrl: existing?.imageUrl ?? '',
    style: existing?.style ?? TATTOO_STYLES[0],
    price: existing?.price ?? '',
    artistId: existing?.artistId ?? '',
    status: existing?.status ?? 'available',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
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

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/tatuagens" className="text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {existing ? 'Editar Tatuagem' : 'Nova Tatuagem'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-5">
        <div>
          <label className="block text-gray-400 text-sm mb-1.5">Título *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            placeholder="Ex: Leão Realista"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1.5">Descrição *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 resize-none"
            placeholder="Descreva a tatuagem..."
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1.5">URL da Imagem *</label>
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            placeholder="https://picsum.photos/seed/exemplo/600/400"
          />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="Preview"
              className="mt-2 w-full h-40 object-cover rounded-lg border border-gray-700"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Estilo *</label>
            <select
              name="style"
              value={form.style}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              {TATTOO_STYLES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Preço</label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
              placeholder="R$ 500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Artista</label>
            <select
              name="artistId"
              value={form.artistId ?? ''}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Estúdio (sem artista)</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="available">Disponível</option>
              <option value="archived">Arquivada</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-2.5 rounded-lg transition-colors"
          >
            {existing ? 'Salvar Alterações' : 'Criar Tatuagem'}
          </button>
          <Link
            to="/admin/tatuagens"
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
