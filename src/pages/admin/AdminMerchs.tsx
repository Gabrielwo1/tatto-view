import { useState } from 'react';
import { useStore } from '../../store';
import type { Merch } from '../../types';
import { uploadImage } from '../../lib/uploadImage';

const inputCls =
  'w-full bg-zinc-900 border border-white/10 focus:border-white/40 outline-none px-3 py-2.5 font-body text-sm text-white placeholder-gray-700 transition-colors';
const labelCls =
  'block font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1.5';

const emptyForm = { name: '', description: '', price: '', imageUrl: '', link: '' };

function MerchFormModal({
  initial,
  onSubmit,
  onCancel,
  title,
  submitLabel,
}: {
  initial: typeof emptyForm;
  onSubmit: (data: typeof emptyForm) => void;
  onCancel: () => void;
  title: string;
  submitLabel: string;
}) {
  const [form, setForm] = useState(initial);
  const [uploading, setUploading] = useState(false);

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim()) return;
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-zinc-950 z-10">
          <h2 className="font-display text-xl uppercase tracking-wide">{title}</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">
          <div>
            <label className={labelCls}>Nome *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className={inputCls}
              placeholder="Ex: Camiseta El Dude"
            />
          </div>
          <div>
            <label className={labelCls}>Preço *</label>
            <input
              type="text"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className={inputCls}
              placeholder="Ex: R$ 89,90"
            />
          </div>
          <div>
            <label className={labelCls}>Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Descrição do produto..."
            />
          </div>

          {/* Image section */}
          <div>
            <label className={labelCls}>Imagem do Produto</label>
            {form.imageUrl && (
              <div className="mb-3 relative w-32 aspect-square border border-white/10 overflow-hidden">
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                  className="absolute top-1 right-1 bg-black/70 text-white p-0.5 hover:bg-black"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer border border-white/20 hover:border-white/50 px-4 py-2.5 w-fit transition-colors">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="font-body text-xs font-semibold tracking-widest uppercase text-gray-400">
                {uploading ? 'Enviando...' : 'Enviar Imagem'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <div className="mt-2">
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className={inputCls}
                placeholder="Ou cole a URL da imagem aqui"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Link de Compra</label>
            <input
              type="url"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className={inputCls}
              placeholder="https://loja.com/produto"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-white/20 text-white/60 hover:text-white hover:border-white font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminMerchs() {
  const merchs       = useStore((s) => s.merchs);
  const addMerch     = useStore((s) => s.addMerch);
  const updateMerch  = useStore((s) => s.updateMerch);
  const deleteMerch  = useStore((s) => s.deleteMerch);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Merch | null>(null);

  function handleAdd(data: typeof emptyForm) {
    addMerch({ ...data, link: data.link || undefined });
    setShowAdd(false);
  }

  function handleEdit(data: typeof emptyForm) {
    if (!editing) return;
    updateMerch(editing.id, { ...data, link: data.link || undefined });
    setEditing(null);
  }

  function handleDelete(id: string, name: string) {
    if (confirm(`Excluir "${name}"?`)) deleteMerch(id);
  }

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Gerenciar</p>
          <h1 className="font-display text-4xl uppercase tracking-wide leading-none text-white">Loja</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase px-5 py-3 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Novo Produto
        </button>
      </div>

      {/* Stats bar */}
      <div className="border border-white/10 px-5 py-3 mb-6 flex items-center gap-2">
        <span className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600">Total:</span>
        <span className="font-body text-sm font-bold text-white">{merchs.length} produto{merchs.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Product list */}
      {merchs.length === 0 ? (
        <div className="border border-white/10 py-24 text-center">
          <svg className="w-10 h-10 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="font-display text-xl text-gray-700 uppercase tracking-widest">Nenhum produto ainda</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-6 font-body text-xs font-semibold tracking-widest uppercase text-gray-500 hover:text-white transition-colors underline"
          >
            Adicionar primeiro produto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/10">
          {merchs.map((m) => (
            <div key={m.id} className="bg-zinc-950 group relative flex flex-col">
              {/* Image */}
              {m.imageUrl ? (
                <div className="aspect-square overflow-hidden">
                  <img
                    src={m.imageUrl}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div className="aspect-square bg-zinc-900 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col">
                <h2 className="font-display text-base uppercase tracking-wide leading-tight mb-1 text-white">{m.name}</h2>
                {m.description && (
                  <p className="font-body text-xs text-gray-500 mb-3 line-clamp-2">{m.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className="font-body text-sm font-bold text-white">{m.price}</span>
                  <div className="flex items-center gap-1.5">
                    {m.link && (
                      <a
                        href={m.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 border border-white/10 text-white/30 hover:text-white hover:border-white/60 transition-colors"
                        title="Ver produto"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    <button
                      onClick={() => setEditing(m)}
                      className="p-1.5 border border-white/10 text-white/30 hover:text-white hover:border-white/60 transition-colors"
                      title="Editar"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      className="p-1.5 border border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/50 transition-colors"
                      title="Excluir"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <MerchFormModal
          initial={emptyForm}
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          title="Novo Produto"
          submitLabel="Adicionar"
        />
      )}

      {editing && (
        <MerchFormModal
          initial={{
            name: editing.name,
            description: editing.description,
            price: editing.price,
            imageUrl: editing.imageUrl,
            link: editing.link ?? '',
          }}
          onSubmit={handleEdit}
          onCancel={() => setEditing(null)}
          title="Editar Produto"
          submitLabel="Salvar"
        />
      )}
    </div>
  );
}
