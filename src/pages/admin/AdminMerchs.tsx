import { useState } from 'react';
import { useStore } from '../../store';
import type { Merch, TattooSession } from '../../types';
import { uploadImage } from '../../lib/uploadImage';

const inputCls =
  'w-full bg-zinc-900 border border-white/10 focus:border-white/40 outline-none px-3 py-2.5 font-body text-sm text-white placeholder-gray-700 transition-colors';
const labelCls =
  'block font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1.5';

// ── Merch form modal ─────────────────────────────────────────────────────────
const emptyMerchForm = { name: '', description: '', price: '', imageUrl: '', link: '', sizesRaw: '' };

function MerchFormModal({
  initial,
  onSubmit,
  onCancel,
  title,
  submitLabel,
}: {
  initial: typeof emptyMerchForm;
  onSubmit: (data: typeof emptyMerchForm) => void;
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
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const url = await uploadImage(base64);
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
        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Nome *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputCls} placeholder="Ex: Camiseta El Dude" />
            </div>
            <div>
              <label className={labelCls}>Preço *</label>
              <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className={inputCls} placeholder="R$ 89,90" />
            </div>
            <div>
              <label className={labelCls}>Tamanhos</label>
              <input type="text" value={form.sizesRaw} onChange={(e) => setForm({ ...form, sizesRaw: e.target.value })} className={inputCls} placeholder="P, M, G, GG" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder="Descrição do produto..." />
          </div>
          <div>
            <label className={labelCls}>Imagem do Produto</label>
            {form.imageUrl && (
              <div className="mb-3 relative w-28 aspect-square border border-white/10 overflow-hidden">
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))} className="absolute top-1 right-1 bg-black/70 text-white p-0.5 hover:bg-black">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer border border-white/20 hover:border-white/50 px-4 py-2 w-fit transition-colors mb-2">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-400">{uploading ? 'Enviando...' : 'Upload'}</span>
              <input type="file" accept="image/*" onChange={handleImageFile} disabled={uploading} className="hidden" />
            </label>
            <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={inputCls} placeholder="Ou cole a URL da imagem" />
          </div>
          <div>
            <label className={labelCls}>Link de Compra</label>
            <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={inputCls} placeholder="https://..." />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onCancel} className="flex-1 border border-white/20 text-white/60 hover:text-white hover:border-white font-body font-bold text-xs tracking-widest uppercase py-2.5 transition-colors">Cancelar</button>
            <button type="submit" disabled={uploading} className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-body font-bold text-xs tracking-widest uppercase py-2.5 transition-colors">{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Session form modal ───────────────────────────────────────────────────────
const emptySessionForm = { typeNum: '', title: '', description: '', price: '', bookingLink: '' };

function SessionFormModal({
  initial,
  onSubmit,
  onCancel,
  title,
  submitLabel,
}: {
  initial: typeof emptySessionForm;
  onSubmit: (data: typeof emptySessionForm) => void;
  onCancel: () => void;
  title: string;
  submitLabel: string;
}) {
  const [form, setForm] = useState(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.price.trim()) return;
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-display text-xl uppercase tracking-wide">{title}</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nº do tipo</label>
              <input type="text" value={form.typeNum} onChange={(e) => setForm({ ...form, typeNum: e.target.value })} className={inputCls} placeholder="01" maxLength={2} />
            </div>
            <div>
              <label className={labelCls}>Preço *</label>
              <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className={inputCls} placeholder="R$ 250" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Título *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputCls} placeholder="SMALL SESSION" />
          </div>
          <div>
            <label className={labelCls}>Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="Descreva esta sessão..." />
          </div>
          <div>
            <label className={labelCls}>Link de Agendamento</label>
            <input type="text" value={form.bookingLink} onChange={(e) => setForm({ ...form, bookingLink: e.target.value })} className={inputCls} placeholder="https://wa.me/..." />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onCancel} className="flex-1 border border-white/20 text-white/60 hover:text-white hover:border-white font-body font-bold text-xs tracking-widest uppercase py-2.5 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase py-2.5 transition-colors">{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AdminMerchs() {
  const merchs        = useStore((s) => s.merchs);
  const addMerch      = useStore((s) => s.addMerch);
  const updateMerch   = useStore((s) => s.updateMerch);
  const deleteMerch   = useStore((s) => s.deleteMerch);
  const sessions      = useStore((s) => s.sessions);
  const addSession    = useStore((s) => s.addSession);
  const updateSession = useStore((s) => s.updateSession);
  const deleteSession = useStore((s) => s.deleteSession);

  const [showAddMerch, setShowAddMerch] = useState(false);
  const [editingMerch, setEditingMerch] = useState<Merch | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [editingSession, setEditingSession] = useState<TattooSession | null>(null);

  function handleAddMerch(data: typeof emptyMerchForm) {
    const sizes = data.sizesRaw.split(',').map((s) => s.trim()).filter(Boolean);
    addMerch({ name: data.name, description: data.description, price: data.price, imageUrl: data.imageUrl, link: data.link || undefined, sizes: sizes.length ? sizes : undefined });
    setShowAddMerch(false);
  }

  function handleEditMerch(data: typeof emptyMerchForm) {
    if (!editingMerch) return;
    const sizes = data.sizesRaw.split(',').map((s) => s.trim()).filter(Boolean);
    updateMerch(editingMerch.id, { name: data.name, description: data.description, price: data.price, imageUrl: data.imageUrl, link: data.link || undefined, sizes: sizes.length ? sizes : undefined });
    setEditingMerch(null);
  }

  function handleDeleteMerch(id: string, name: string) {
    if (confirm(`Excluir "${name}"?`)) deleteMerch(id);
  }

  function handleAddSession(data: typeof emptySessionForm) {
    addSession(data);
    setShowAddSession(false);
  }

  function handleEditSession(data: typeof emptySessionForm) {
    if (!editingSession) return;
    updateSession(editingSession.id, data);
    setEditingSession(null);
  }

  function handleDeleteSession(id: string, title: string) {
    if (confirm(`Excluir sessão "${title}"?`)) deleteSession(id);
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Gerenciar</p>
          <h1 className="font-display text-4xl uppercase tracking-wide leading-none text-white">Loja</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddSession(true)}
            className="flex items-center gap-2 border border-white/20 hover:border-white text-white/70 hover:text-white font-body font-bold text-xs tracking-widest uppercase px-4 py-2.5 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Sessão
          </button>
          <button
            onClick={() => setShowAddMerch(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase px-4 py-2.5 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Produto
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-px bg-white/10 mb-6">
        <div className="bg-zinc-950 px-4 py-2.5 flex items-center gap-2">
          <span className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600">Sessões:</span>
          <span className="font-body text-sm font-bold text-white">{sessions.length}</span>
        </div>
        <div className="bg-zinc-950 px-4 py-2.5 flex items-center gap-2">
          <span className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600">Produtos:</span>
          <span className="font-body text-sm font-bold text-white">{merchs.length}</span>
        </div>
      </div>

      {/* ── 3-col grid: Sessions | Products | Config ─────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">

        {/* ── COL 1: Sessions ─────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500">Tattoo Sessions</p>
            <button onClick={() => setShowAddSession(true)} className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors">
              + adicionar
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="border border-white/10 py-12 text-center">
              <p className="font-body text-xs text-gray-700 uppercase tracking-widest">Nenhuma sessão</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="border border-white/10 bg-zinc-950 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      {session.typeNum && (
                        <p className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-600 mb-0.5">TYPE {session.typeNum}</p>
                      )}
                      <p className="font-display text-base uppercase text-white leading-tight truncate">{session.title}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingSession(session)}
                        className="p-1.5 border border-white/10 text-white/30 hover:text-white hover:border-white/50 transition-colors"
                        title="Editar"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id, session.title)}
                        className="p-1.5 border border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/50 transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  {session.description && (
                    <p className="font-body text-xs text-gray-600 line-clamp-2 mb-2">{session.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm font-bold text-white">{session.price}</span>
                    {session.bookingLink && (
                      <span className="font-body text-[9px] text-green-500 tracking-widest uppercase">✓ link</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── COL 2–3: Products (spans 2 cols) ────────────────────────────── */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500">Produtos / Apparel</p>
            <button onClick={() => setShowAddMerch(true)} className="font-body text-[9px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors">
              + adicionar
            </button>
          </div>

          {merchs.length === 0 ? (
            <div className="border border-white/10 py-16 text-center">
              <svg className="w-10 h-10 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="font-display text-xl text-gray-700 uppercase tracking-widest">Nenhum produto ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
              {merchs.map((m) => (
                <div key={m.id} className="bg-zinc-950 group relative flex flex-col">
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
                  <div className="p-3 flex-1 flex flex-col">
                    <p className="font-display text-sm uppercase tracking-wide leading-tight mb-0.5 text-white truncate">{m.name}</p>
                    {m.sizes && m.sizes.length > 0 && (
                      <p className="font-body text-[9px] text-gray-600 mb-1">{m.sizes.join(' · ')}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <span className="font-body text-sm font-bold text-white">{m.price}</span>
                      <div className="flex items-center gap-1">
                        {m.link && (
                          <a href={m.link} target="_blank" rel="noopener noreferrer" className="p-1.5 border border-white/10 text-white/30 hover:text-white hover:border-white/60 transition-colors" title="Ver produto">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        )}
                        <button
                          onClick={() => setEditingMerch(m)}
                          className="p-1.5 border border-white/10 text-white/30 hover:text-white hover:border-white/60 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteMerch(m.id, m.name)}
                          className="p-1.5 border border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/50 transition-colors"
                          title="Excluir"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddMerch && (
        <MerchFormModal
          initial={emptyMerchForm}
          onSubmit={handleAddMerch}
          onCancel={() => setShowAddMerch(false)}
          title="Novo Produto"
          submitLabel="Adicionar"
        />
      )}
      {editingMerch && (
        <MerchFormModal
          initial={{
            name: editingMerch.name,
            description: editingMerch.description,
            price: editingMerch.price,
            imageUrl: editingMerch.imageUrl,
            link: editingMerch.link ?? '',
            sizesRaw: editingMerch.sizes?.join(', ') ?? '',
          }}
          onSubmit={handleEditMerch}
          onCancel={() => setEditingMerch(null)}
          title="Editar Produto"
          submitLabel="Salvar"
        />
      )}
      {showAddSession && (
        <SessionFormModal
          initial={emptySessionForm}
          onSubmit={handleAddSession}
          onCancel={() => setShowAddSession(false)}
          title="Nova Sessão"
          submitLabel="Adicionar"
        />
      )}
      {editingSession && (
        <SessionFormModal
          initial={{
            typeNum: editingSession.typeNum,
            title: editingSession.title,
            description: editingSession.description,
            price: editingSession.price,
            bookingLink: editingSession.bookingLink,
          }}
          onSubmit={handleEditSession}
          onCancel={() => setEditingSession(null)}
          title="Editar Sessão"
          submitLabel="Salvar"
        />
      )}
    </div>
  );
}
