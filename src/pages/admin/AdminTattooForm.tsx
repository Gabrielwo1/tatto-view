import { useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../store';
import { TATTOO_STYLES } from '../../types';

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

      <form onSubmit={handleSubmit} className="border border-white/10 p-6 space-y-5">
        <div>
          <label className={labelCls}>Título *</label>
          <input name="title" value={form.title} onChange={handleChange} required className={inputCls} placeholder="Ex: Leão Realista" />
        </div>

        <div>
          <label className={labelCls}>Descrição *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
            className={`${inputCls} resize-none`} placeholder="Descreva a tatuagem..." />
        </div>

        <div>
          <label className={labelCls}>URL da Imagem *</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} required className={inputCls}
            placeholder="https://picsum.photos/seed/exemplo/600/600" />
          {form.imageUrl && (
            <img src={form.imageUrl} alt="Preview"
              className="mt-2 w-full aspect-square object-cover border border-white/10"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          )}
        </div>

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
            <input name="price" value={form.price} onChange={handleChange} className={inputCls} placeholder="R$ 500" />
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
  );
}
