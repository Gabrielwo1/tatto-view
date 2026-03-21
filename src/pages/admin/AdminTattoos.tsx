import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { TATTOO_STYLES, type Tattoo } from '../../types';

const inputCls = 'w-full bg-transparent border border-white/15 px-3 py-2 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white/60 transition-colors';
const labelCls = 'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5';

// ── Inline edit modal ────────────────────────────────────────────────────────
function InlineEditModal({ tattoo, onClose }: { tattoo: Tattoo; onClose: () => void }) {
  const artists = useStore((s) => s.artists);
  const updateTattoo = useStore((s) => s.updateTattoo);

  const [form, setForm] = useState({
    title: tattoo.title,
    description: tattoo.description,
    style: tattoo.style,
    price: tattoo.price ?? '',
    artistId: tattoo.artistId ?? '',
    status: tattoo.status,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSave() {
    updateTattoo(tattoo.id, {
      ...form,
      artistId: form.artistId || null,
      status: form.status as 'available' | 'archived',
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <div
        className="bg-zinc-950 border border-white/15 w-full max-w-2xl flex flex-col sm:flex-row overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: image */}
        <div className="sm:w-52 flex-shrink-0 relative">
          <img
            src={tattoo.imageUrl}
            alt={tattoo.title}
            className="w-full h-48 sm:h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tattoo.id}/400/400`; }}
          />
          <div className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] font-body font-bold tracking-widest uppercase ${
            form.status === 'available' ? 'bg-white text-black' : 'bg-white/20 text-white/60'
          }`}>
            {form.status === 'available' ? 'Disponível' : 'Arquivada'}
          </div>
        </div>

        {/* Right: form */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600">Editar arte</p>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <label className={labelCls}>Título</label>
            <input name="title" value={form.title} onChange={handleChange} className={inputCls} placeholder="Ex: Leão Realista" />
          </div>

          <div>
            <label className={labelCls}>Descrição</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${inputCls} resize-none`} placeholder="Descreva a tatuagem..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Estilo</label>
              <select name="style" value={form.style} onChange={handleChange} className={`${inputCls} bg-zinc-950`}>
                {TATTOO_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Preço</label>
              <input name="price" value={form.price} onChange={handleChange} className={inputCls} placeholder="R$ 500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Artista</label>
              <select name="artistId" value={form.artistId} onChange={handleChange} className={`${inputCls} bg-zinc-950`}>
                <option value="">Estúdio</option>
                {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={`${inputCls} bg-zinc-950`}>
                <option value="available">Disponível</option>
                <option value="archived">Arquivada</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase transition-colors"
            >
              Salvar
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-white/15 hover:border-white text-gray-500 hover:text-white font-body font-bold text-xs tracking-widest uppercase transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AdminTattoos() {
  const tattoos = useStore((s) => s.tattoos);
  const deleteTattoo = useStore((s) => s.deleteTattoo);
  const archiveTattoo = useStore((s) => s.archiveTattoo);
  const reorderTattoos = useStore((s) => s.reorderTattoos);
  const [filter, setFilter] = useState<'all' | 'available' | 'archived'>('all');
  const [styleFilter, setStyleFilter] = useState('Todos');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  // IDs being deleted — removed from view instantly on confirm, before store re-renders
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  const dragIdRef = useRef<string | null>(null);

  const filtered = tattoos
    .filter((t) => !pendingDeleteIds.has(t.id))
    .filter((t) => filter === 'all' || t.status === filter)
    .filter((t) => styleFilter === 'Todos' || t.style === styleFilter);

  const editingTattoo = editingId ? tattoos.find((t) => t.id === editingId) ?? null : null;

  function handleDelete(id: string, title: string) {
    if (confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) {
      setPendingDeleteIds((prev) => { const n = new Set(prev); n.add(id); return n; });
      deleteTattoo(id);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((t) => t.id)));
    }
  }

  function exitSelecting() {
    setSelecting(false);
    setSelected(new Set());
  }

  function confirmDeleteSelected() {
    const ids = new Set(selected);
    setPendingDeleteIds((prev) => new Set([...prev, ...ids]));
    ids.forEach((id) => deleteTattoo(id));
    setSelected(new Set());
    setSelecting(false);
    setConfirmDeleteOpen(false);
  }

  function confirmArchiveSelected() {
    selected.forEach((id) => archiveTattoo(id));
    setSelected(new Set());
    setSelecting(false);
    setConfirmArchiveOpen(false);
  }

  function handleDrop(targetId: string) {
    const sourceId = dragIdRef.current;
    if (!sourceId || sourceId === targetId) { setDragOverId(null); return; }
    // Reorder within the filtered view, then rebuild the full order
    const filteredIds = filtered.map((t) => t.id);
    const from = filteredIds.indexOf(sourceId);
    const to = filteredIds.indexOf(targetId);
    if (from === -1 || to === -1) { setDragOverId(null); return; }
    filteredIds.splice(from, 1);
    filteredIds.splice(to, 0, sourceId);
    // Map back to full tattoos order
    const filteredSet = new Set(filtered.map((t) => t.id));
    let fi = 0;
    const newFullIds = tattoos.map((t) => (filteredSet.has(t.id) ? filteredIds[fi++] : t.id));
    reorderTattoos(newFullIds);
    setDragOverId(null);
    dragIdRef.current = null;
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Admin</p>
          <h1 className="font-display text-3xl md:text-5xl text-white uppercase tracking-wide leading-none">Tatuagens</h1>
        </div>
        <div className="flex items-center gap-2">
          {selecting ? (
            <button
              onClick={exitSelecting}
              className="flex items-center gap-2 bg-transparent border border-white/30 hover:border-white text-white/70 hover:text-white font-body font-bold text-xs tracking-widest uppercase px-5 py-3 transition-colors"
            >
              Cancelar
            </button>
          ) : (
            <button
              onClick={() => setSelecting(true)}
              className="flex items-center gap-2 bg-transparent border border-white/20 hover:border-white/60 text-white/50 hover:text-white font-body font-bold text-xs tracking-widest uppercase px-5 py-3 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Selecionar
            </button>
          )}
          <Link
            to="/admin/tatuagens/nova"
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase px-5 py-3 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Nova Arte
          </Link>
        </div>
      </div>

      {/* Select all bar */}
      {selecting && (
        <div className="flex items-center gap-4 mb-4 px-3 py-2 bg-white/5 border border-white/10">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-body tracking-widest uppercase text-white/70 hover:text-white transition-colors"
          >
            <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${
              selected.size === filtered.length && filtered.length > 0 ? 'bg-white border-white' : 'border-white/40'
            }`}>
              {selected.size === filtered.length && filtered.length > 0 && (
                <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            Selecionar todas
          </button>
          <span className="text-xs font-body text-gray-500">
            {selected.size} selecionada{selected.size !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'available', 'archived'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 text-xs font-body font-semibold tracking-widest uppercase transition-all border ${
              filter === s ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-700 hover:border-white hover:text-white'
            }`}
          >
            {s === 'all' ? 'Todas' : s === 'available' ? 'Disponíveis' : 'Arquivadas'}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-6 md:mb-8">
        {['Todos', ...TATTOO_STYLES].map((s) => (
          <button
            key={s}
            onClick={() => setStyleFilter(s)}
            className={`px-3 py-1 text-[10px] font-body font-semibold tracking-widest uppercase transition-all border ${
              styleFilter === s ? 'bg-white/20 text-white border-white/40' : 'bg-transparent text-gray-600 border-gray-800 hover:border-gray-600 hover:text-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="border border-white/10 py-20 text-center">
          <p className="font-display text-2xl text-gray-700 uppercase tracking-widest">Nenhuma encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 md:gap-2">
          {filtered.map((t) => {
            const isSelected = selected.has(t.id);
            const isDragOver = dragOverId === t.id;
            return (
              <div
                key={t.id}
                className={`flex flex-col bg-zinc-900 transition-[box-shadow,transform] duration-150 ${isDragOver ? 'ring-2 ring-white/60 scale-[0.97]' : ''}`}
                draggable={!selecting}
                onDragStart={() => { dragIdRef.current = t.id; }}
                onDragOver={(e) => { e.preventDefault(); if (dragIdRef.current && dragIdRef.current !== t.id) setDragOverId(t.id); }}
                onDragLeave={() => setDragOverId(null)}
                onDrop={() => handleDrop(t.id)}
                onDragEnd={() => { dragIdRef.current = null; setDragOverId(null); }}
              >
                {/* Image */}
                <div
                  className={`relative aspect-[3/4] overflow-hidden ${selecting ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
                  onClick={selecting ? () => toggleSelect(t.id) : undefined}
                >
                  <img
                    src={t.imageUrl}
                    alt={t.title}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      selecting
                        ? isSelected ? 'scale-105 brightness-50' : 'hover:brightness-75'
                        : ''
                    }`}
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${t.id}/400/400`; }}
                  />

                  {/* Selection overlay */}
                  {selecting && (
                    <div className={`absolute inset-0 transition-colors duration-200 ${isSelected ? 'bg-blue-500/20' : ''}`}>
                      <div className={`absolute top-2.5 left-2.5 w-5 h-5 border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-white border-white' : 'border-white/70 bg-black/30'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status dot */}
                  {!selecting && (
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${t.status === 'available' ? 'bg-white' : 'bg-white/30'}`} />
                  )}
                </div>

                {/* Always-visible action bar */}
                {!selecting && (
                  <div className="flex items-center border-t border-white/8 bg-zinc-900">
                    {/* Title */}
                    <p className="flex-1 px-2 py-2 font-display text-[12px] text-white/60 uppercase tracking-wide truncate">
                      {t.title}
                    </p>
                    {/* Archive / Unarchive */}
                    <button
                      onClick={() => archiveTattoo(t.id)}
                      title={t.status === 'available' ? 'Arquivar' : 'Disponibilizar'}
                      className="p-2 text-white/30 hover:text-white transition-colors border-l border-white/8"
                    >
                      {t.status === 'available' ? (
                        // archive icon
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      ) : (
                        // unarchive icon
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v4m0 0l-2-2m2 2l2-2" />
                        </svg>
                      )}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => setEditingId(t.id)}
                      title="Editar informações"
                      className="p-2 text-white/30 hover:text-white transition-colors border-l border-white/8"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(t.id, t.title)}
                      title="Excluir"
                      className="p-2 text-white/20 hover:text-red-400 transition-colors border-l border-white/8"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating action bar (multi-select) */}
      {selecting && selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 border border-white/20 px-6 py-3 shadow-2xl">
          <span className="font-body text-sm text-white/70">
            <span className="text-white font-bold">{selected.size}</span> selecionada{selected.size !== 1 ? 's' : ''}
          </span>
          <div className="w-px h-5 bg-white/20" />
          {/* Archive selected */}
          <button
            onClick={() => setConfirmArchiveOpen(true)}
            className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white font-body font-bold text-xs tracking-widest uppercase px-5 py-2 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Arquivar
          </button>
          {/* Delete selected */}
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-body font-bold text-xs tracking-widest uppercase px-5 py-2 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Excluir
          </button>
        </div>
      )}

      {/* Confirm archive modal */}
      {confirmArchiveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-zinc-900 border border-white/20 p-8 max-w-sm w-full mx-4">
            <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-2">Arquivar selecionadas</h2>
            <p className="font-body text-sm text-gray-400 mb-6">
              Arquivar{' '}
              <span className="text-white font-bold">{selected.size} tatuagem{selected.size !== 1 ? 's' : ''}</span>?
              Você pode reativar depois.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmArchiveOpen(false)} className="flex-1 py-3 border border-white/20 text-white/70 hover:text-white hover:border-white font-body font-bold text-xs tracking-widest uppercase transition-colors">
                Cancelar
              </button>
              <button onClick={confirmArchiveSelected} className="flex-1 py-3 bg-zinc-600 hover:bg-zinc-500 text-white font-body font-bold text-xs tracking-widest uppercase transition-colors">
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-zinc-900 border border-white/20 p-8 max-w-sm w-full mx-4">
            <h2 className="font-display text-2xl text-white uppercase tracking-wide mb-2">Confirmar exclusão</h2>
            <p className="font-body text-sm text-gray-400 mb-6">
              Você está prestes a excluir{' '}
              <span className="text-white font-bold">{selected.size} tatuagem{selected.size !== 1 ? 's' : ''}</span>.
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteOpen(false)} className="flex-1 py-3 border border-white/20 text-white/70 hover:text-white hover:border-white font-body font-bold text-xs tracking-widest uppercase transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDeleteSelected} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-body font-bold text-xs tracking-widest uppercase transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline edit modal */}
      {editingTattoo && (
        <InlineEditModal tattoo={editingTattoo} onClose={() => setEditingId(null)} />
      )}
    </div>
  );
}
