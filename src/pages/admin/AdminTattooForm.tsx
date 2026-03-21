import { useState, useRef, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../store';
import { TATTOO_STYLES } from '../../types';
import ImageCropper from '../../components/ImageCropper';
import { uploadImage, uploadImages } from '../../lib/uploadImage';

const inputCls = 'w-full bg-transparent border border-white/15 px-4 py-2.5 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors';
const labelCls = 'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2';

// ── Batch item type ─────────────────────────────────────────────────────────
type BatchItem = {
  id: string;
  rawSrc: string;
  imageUrl: string;
  title: string;
  description: string;
  style: string;
  price: string;
  artistId: string;
  status: 'available' | 'archived';
};

function makeBatchItem(src: string): BatchItem {
  return {
    id: Math.random().toString(36).slice(2),
    rawSrc: src,
    imageUrl: src,
    title: '',
    description: '',
    style: TATTOO_STYLES[0],
    price: '',
    artistId: '',
    status: 'available',
  };
}

// ── Step badge ──────────────────────────────────────────────────────────────
function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold font-body transition-colors border ${
        done ? 'bg-white text-black border-white' :
        active ? 'bg-amber-400 text-black border-amber-400' :
        'border-white/20 text-gray-600'
      }`}>
        {done ? '✓' : n}
      </div>
      <span className={`font-body text-[10px] tracking-widest uppercase font-semibold transition-colors ${
        active ? 'text-white' : done ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {label}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function AdminTattooForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tattoos = useStore((s) => s.tattoos);
  const artists = useStore((s) => s.artists);
  const addTattoo = useStore((s) => s.addTattoo);
  const updateTattoo = useStore((s) => s.updateTattoo);
  const existing = id ? tattoos.find((t) => t.id === id) : null;

  // ── Shared upload state ───────────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);

  // ── Edit mode state ───────────────────────────────────────────────────────
  const editFileRef = useRef<HTMLInputElement>(null);
  const [editCropSrc, setEditCropSrc] = useState('');
  const [editForm, setEditForm] = useState({
    title: existing?.title ?? '',
    description: existing?.description ?? '',
    imageUrl: existing?.imageUrl ?? '',
    style: existing?.style ?? TATTOO_STYLES[0],
    price: existing?.price ?? '',
    artistId: existing?.artistId ?? '',
    status: existing?.status ?? 'available',
  });

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }
  function handleEditFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditCropSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }
  function onEditCropConfirm(dataUrl: string) {
    setEditForm((f) => ({ ...f, imageUrl: dataUrl }));
    setEditCropSrc('');
    if (editFileRef.current) editFileRef.current.value = '';
  }
  function onEditCropCancel() {
    if (!editForm.imageUrl && editCropSrc) setEditForm((f) => ({ ...f, imageUrl: editCropSrc }));
    setEditCropSrc('');
    if (editFileRef.current) editFileRef.current.value = '';
  }
  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    setUploading(true);
    const imageUrl = await uploadImage(editForm.imageUrl);
    setUploading(false);
    updateTattoo(existing!.id, {
      ...editForm,
      imageUrl,
      artistId: editForm.artistId || null,
      status: editForm.status as 'available' | 'archived',
    });
    navigate('/admin/tatuagens');
  }

  // ── Batch wizard state ────────────────────────────────────────────────────
  const batchFileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [phase, setPhase] = useState<'upload' | 'details' | 'review'>('upload');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [cropItemId, setCropItemId] = useState<string | null>(null);

  function addFiles(files: FileList) {
    const arr = Array.from(files);
    const newItems: BatchItem[] = new Array(arr.length);
    let loaded = 0;
    arr.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newItems[i] = makeBatchItem(ev.target?.result as string);
        loaded++;
        if (loaded === arr.length) setItems((prev) => [...prev, ...newItems]);
      };
      reader.readAsDataURL(file);
    });
  }

  function onBatchCropConfirm(dataUrl: string) {
    setItems((prev) => prev.map((it) => it.id === cropItemId ? { ...it, imageUrl: dataUrl } : it));
    setCropItemId(null);
  }

  function updateItem(itemId: string, patch: Partial<BatchItem>) {
    setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, ...patch } : it));
  }

  function applyToAll(field: keyof BatchItem, value: string) {
    setItems((prev) => prev.map((it) => ({ ...it, [field]: value })));
  }

  async function saveAll() {
    setUploading(true);
    setUploadProgress({ done: 0, total: items.length });
    const urls = await uploadImages(
      items.map((it) => it.imageUrl),
      (done, total) => setUploadProgress({ done, total }),
    );
    setUploading(false);
    setUploadProgress(null);
    items.forEach((item, i) => {
      addTattoo({
        title: item.title || 'Sem título',
        description: item.description || '',
        imageUrl: urls[i],
        style: item.style,
        price: item.price,
        artistId: item.artistId || null,
        status: item.status,
      });
    });
    navigate('/admin/tatuagens');
  }

  const current = items[currentIdx];
  const croppingItem = cropItemId ? items.find((it) => it.id === cropItemId) : null;

  // ══════════════════════════════════════════════════════════════════════════
  // EDIT MODE (existing tattoo)
  // ══════════════════════════════════════════════════════════════════════════
  if (existing) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <Link to="/admin/tatuagens" className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors inline-flex items-center gap-2 mb-4">
            ← Tatuagens
          </Link>
          <h1 className="font-display text-4xl text-white uppercase tracking-wide leading-none">Editar Arte</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT: form */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <form onSubmit={handleEditSubmit} className="border border-white/10 p-6 space-y-5">
              <div>
                <label className={labelCls}>Título *</label>
                <input name="title" value={editForm.title} onChange={handleEditChange} required className={inputCls} placeholder="Ex: Leão Realista" />
              </div>
              <div>
                <label className={labelCls}>Descrição *</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} required rows={4} className={`${inputCls} resize-none`} placeholder="Descreva a tatuagem..." />
              </div>
              {!editForm.imageUrl.startsWith('data:') && (
                <div>
                  <label className={labelCls}>URL da Imagem</label>
                  <div className="flex gap-2">
                    <input name="imageUrl" value={editForm.imageUrl} onChange={handleEditChange} className={inputCls} placeholder="https://..." />
                    {editForm.imageUrl && (
                      <button type="button" onClick={() => setEditCropSrc(editForm.imageUrl)}
                        className="flex-shrink-0 px-3 border border-amber-400/40 hover:border-amber-400 text-amber-400/60 hover:text-amber-400 font-body text-[10px] tracking-widest uppercase transition-colors whitespace-nowrap">
                        Cortar
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Estilo *</label>
                  <select name="style" value={editForm.style} onChange={handleEditChange} className={`${inputCls} bg-zinc-950`}>
                    {TATTOO_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Preço</label>
                  <input name="price" value={editForm.price} onChange={handleEditChange} className={inputCls} placeholder="R$ 500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Artista</label>
                  <select name="artistId" value={editForm.artistId ?? ''} onChange={handleEditChange} className={`${inputCls} bg-zinc-950`}>
                    <option value="">Estúdio</option>
                    {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select name="status" value={editForm.status} onChange={handleEditChange} className={`${inputCls} bg-zinc-950`}>
                    <option value="available">Disponível</option>
                    <option value="archived">Arquivada</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={uploading}
                  className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-wait text-black font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors">
                  {uploading ? 'Enviando…' : 'Salvar'}
                </button>
                <Link to="/admin/tatuagens" className="px-6 py-3 border border-white/15 hover:border-white text-gray-500 hover:text-white font-body font-bold text-xs tracking-widest uppercase transition-colors text-center">
                  Cancelar
                </Link>
              </div>
            </form>
          </div>

          {/* RIGHT: image panel */}
          <div className="flex-1 min-w-0 lg:sticky lg:top-8">
            <p className={labelCls}>Imagem da tatuagem</p>
            {editCropSrc ? (
              <ImageCropper src={editCropSrc} onConfirm={onEditCropConfirm} onCancel={onEditCropCancel} />
            ) : (
              <div className="border border-white/10 p-4 space-y-4">
                <input ref={editFileRef} type="file" accept="image/*" onChange={handleEditFile} className="hidden" />
                <button type="button" onClick={() => editFileRef.current?.click()}
                  className="w-full border border-dashed border-white/25 hover:border-amber-400/50 py-5 flex flex-col items-center gap-2 text-gray-500 hover:text-amber-400/80 transition-colors">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="font-body text-xs font-semibold tracking-widest uppercase">Selecionar do dispositivo</span>
                </button>
                {editForm.imageUrl ? (
                  <div className="space-y-3">
                    <div className="relative w-1/2">
                      <img src={editForm.imageUrl} alt="Preview" className="w-full aspect-[3/4] object-cover border border-white/10"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <button type="button" onClick={() => { setEditForm((f) => ({ ...f, imageUrl: '' })); if (editFileRef.current) editFileRef.current.value = ''; }}
                        className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white/60 hover:text-white p-1.5 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <button type="button" onClick={() => setEditCropSrc(editForm.imageUrl)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-amber-400/10 border border-amber-400/50 hover:bg-amber-400/20 hover:border-amber-400 text-amber-400 font-body text-xs font-bold tracking-widest uppercase transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                      Ajustar recorte da imagem
                    </button>
                  </div>
                ) : (
                  <div className="w-1/2 aspect-[3/4] border border-dashed border-white/10 flex items-center justify-center">
                    <p className="font-body text-[10px] text-gray-700 tracking-widest uppercase">Sem imagem</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BATCH WIZARD — NEW MODE
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/tatuagens" className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hover:text-white transition-colors inline-flex items-center gap-2 mb-4">
          ← Tatuagens
        </Link>
        <h1 className="font-display text-4xl text-white uppercase tracking-wide leading-none">Nova Arte</h1>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-8">
        <StepBadge n={1} label="Fotos"    active={phase === 'upload'}  done={phase === 'details' || phase === 'review'} />
        <div className="flex-1 h-px bg-white/10 max-w-16" />
        <StepBadge n={2} label="Detalhes" active={phase === 'details'} done={phase === 'review'} />
        <div className="flex-1 h-px bg-white/10 max-w-16" />
        <StepBadge n={3} label="Salvar"   active={phase === 'review'}  done={false} />
      </div>

      {/* ── PHASE 1: UPLOAD ─────────────────────────────────────────────────── */}
      {phase === 'upload' && (
        croppingItem ? (
          <div className="max-w-lg">
            <p className={`${labelCls} mb-3`}>
              Recortando foto {items.findIndex((i) => i.id === cropItemId) + 1} de {items.length}
            </p>
            <ImageCropper
              src={croppingItem.rawSrc}
              onConfirm={onBatchCropConfirm}
              onCancel={() => setCropItemId(null)}
            />
          </div>
        ) : (
          <div>
            {/* Drop zone */}
            <input
              ref={batchFileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && addFiles(e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => batchFileRef.current?.click()}
              className="w-full border border-dashed border-white/25 hover:border-amber-400/50 py-12 flex flex-col items-center gap-3 text-gray-500 hover:text-amber-400/80 transition-colors"
            >
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-center">
                <p className="font-body text-sm font-semibold tracking-widest uppercase">
                  Selecionar fotos
                </p>
                <p className="font-body text-[10px] text-gray-600 mt-1">
                  Pode selecionar várias fotos de uma vez
                </p>
              </div>
            </button>

            {items.length > 0 && (
              <div className="mt-6 space-y-5">
                {/* Thumbnails grid */}
                <div className="flex items-center justify-between">
                  <p className="font-body text-[10px] text-gray-500 tracking-widest uppercase">
                    {items.length} foto{items.length !== 1 ? 's' : ''} selecionada{items.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    type="button"
                    onClick={() => batchFileRef.current?.click()}
                    className="font-body text-[10px] text-amber-400/70 hover:text-amber-400 tracking-widest uppercase transition-colors"
                  >
                    + Adicionar mais
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {items.map((item, idx) => (
                    <div key={item.id} className="relative group">
                      <img
                        src={item.imageUrl}
                        alt={`Foto ${idx + 1}`}
                        className="w-full aspect-[3/4] object-cover border border-white/10"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCropItemId(item.id)}
                          className="font-body text-[10px] font-bold tracking-widest uppercase text-amber-400 border border-amber-400/60 px-3 py-1 hover:bg-amber-400/20 transition-colors"
                        >
                          Recortar
                        </button>
                      </div>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                        className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-black border border-white/20 text-white/60 hover:text-white p-1 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {/* Photo number */}
                      <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white font-body text-[9px] px-1.5 py-0.5">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Next step button */}
                <button
                  type="button"
                  onClick={() => { setCurrentIdx(0); setPhase('details'); }}
                  className="w-full py-3.5 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                >
                  Próximo: Preencher detalhes
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )
      )}

      {/* ── PHASE 3: REVIEW & SAVE ──────────────────────────────────────────── */}
      {phase === 'review' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="font-body text-sm text-gray-400">
              Confira as <span className="text-white font-bold">{items.length} arte{items.length !== 1 ? 's' : ''}</span> antes de salvar
            </p>
            <button
              type="button"
              onClick={() => { setPhase('details'); setCurrentIdx(items.length - 1); }}
              className="font-body text-[10px] text-gray-600 hover:text-white tracking-widest uppercase transition-colors"
            >
              ← Voltar e editar
            </button>
          </div>

          {/* Review grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
            {items.map((item, idx) => {
              const artist = artists.find((a) => a.id === item.artistId);
              return (
                <div key={item.id} className="relative group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
                    <img src={item.imageUrl} alt={item.title || `Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <button
                        type="button"
                        onClick={() => { setCurrentIdx(idx); setPhase('details'); }}
                        className="w-full py-1.5 border border-white/40 text-white font-body text-[9px] tracking-widest uppercase hover:border-white transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    <p className="font-display text-xs text-white uppercase tracking-wide leading-tight truncate">
                      {item.title || <span className="text-gray-600 italic normal-case font-body">Sem título</span>}
                    </p>
                    <p className="font-body text-[10px] text-gray-600 truncate">{item.style}</p>
                    {item.price && <p className="font-body text-[10px] text-gray-500">{item.price}</p>}
                    {artist && <p className="font-body text-[10px] text-gray-600 truncate">{artist.name}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save button */}
          <div className="border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={saveAll}
              disabled={uploading}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 disabled:cursor-wait text-black font-body font-bold text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {uploadProgress
                    ? `Enviando ${uploadProgress.done}/${uploadProgress.total}…`
                    : 'Salvando…'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar {items.length} arte{items.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
            <p className="text-center font-body text-[10px] text-gray-700 mt-3 tracking-widest uppercase">
              As imagens serão salvas no localStorage e sincronizadas com o Supabase
            </p>
          </div>
        </div>
      )}

      {/* ── PHASE 2: DETAILS ────────────────────────────────────────────────── */}
      {phase === 'details' && current && (
        <div className="flex flex-col xl:flex-row gap-6">

          {/* Thumbnail strip (top on mobile, left on desktop) */}
          <div className="flex xl:flex-col gap-2 overflow-x-auto xl:overflow-y-auto xl:overflow-x-hidden pb-2 xl:pb-0 xl:w-20 xl:max-h-[600px] flex-shrink-0">
            {items.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                title={`Foto ${idx + 1}`}
                className={`relative flex-shrink-0 w-14 xl:w-full border-2 transition-all ${
                  idx === currentIdx ? 'border-amber-400 opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                }`}
              >
                <img src={item.imageUrl} className="w-full aspect-[3/4] object-cover block" />
                <div className={`absolute bottom-0 inset-x-0 h-4 flex items-center justify-center font-body text-[8px] font-bold ${
                  idx === currentIdx ? 'bg-amber-400 text-black' : 'bg-black/60 text-white/60'
                }`}>
                  {idx + 1}
                </div>
              </button>
            ))}
          </div>

          {/* Main panel */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-w-0">

            {/* Image preview */}
            <div className="lg:w-56 flex-shrink-0">
              <img
                src={current.imageUrl}
                alt={`Foto ${currentIdx + 1}`}
                className="w-full aspect-[3/4] object-cover border border-white/10"
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="font-body text-[10px] text-gray-600 tracking-widest uppercase">
                  Foto {currentIdx + 1} / {items.length}
                </p>
                <button
                  type="button"
                  onClick={() => { setCropItemId(current.id); setPhase('upload'); }}
                  className="font-body text-[10px] text-amber-400/60 hover:text-amber-400 tracking-widest uppercase transition-colors"
                >
                  Recortar
                </button>
              </div>
              {/* Progress dots */}
              <div className="flex gap-1 mt-3 flex-wrap">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-2 h-2 transition-colors ${
                      idx === currentIdx ? 'bg-amber-400' : items[idx].title ? 'bg-white/40' : 'bg-white/15'
                    }`}
                  />
                ))}
              </div>
              <p className="font-body text-[9px] text-gray-700 mt-1.5">
                ● preenchido &nbsp; ○ pendente
              </p>
            </div>

            {/* Form fields */}
            <div className="flex-1 min-w-0">
              <div className="border border-white/10 p-5 space-y-4">

                {/* Progress header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="font-body text-[10px] text-gray-500 tracking-widest uppercase">
                    Foto {currentIdx + 1} de {items.length}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const val = window.confirm('Aplicar estilo, artista e status desta foto para todas as outras?');
                        if (val) {
                          applyToAll('style', current.style);
                          applyToAll('artistId', current.artistId);
                          applyToAll('status', current.status);
                        }
                      }}
                      className="font-body text-[9px] text-gray-600 hover:text-amber-400 tracking-widest uppercase transition-colors"
                    >
                      Aplicar estilo/artista/status para todas
                    </button>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Título</label>
                  <input
                    value={current.title}
                    onChange={(e) => updateItem(current.id, { title: e.target.value })}
                    className={inputCls}
                    placeholder="Ex: Leão Realista"
                  />
                </div>

                <div>
                  <label className={labelCls}>Descrição</label>
                  <textarea
                    value={current.description}
                    onChange={(e) => updateItem(current.id, { description: e.target.value })}
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder="Descreva a tatuagem..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Estilo</label>
                    <select
                      value={current.style}
                      onChange={(e) => updateItem(current.id, { style: e.target.value })}
                      className={`${inputCls} bg-zinc-950`}
                    >
                      {TATTOO_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Preço</label>
                    <input
                      value={current.price}
                      onChange={(e) => updateItem(current.id, { price: e.target.value })}
                      className={inputCls}
                      placeholder="R$ 500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Artista</label>
                    <select
                      value={current.artistId}
                      onChange={(e) => updateItem(current.id, { artistId: e.target.value })}
                      className={`${inputCls} bg-zinc-950`}
                    >
                      <option value="">Estúdio</option>
                      {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select
                      value={current.status}
                      onChange={(e) => updateItem(current.id, { status: e.target.value as 'available' | 'archived' })}
                      className={`${inputCls} bg-zinc-950`}
                    >
                      <option value="available">Disponível</option>
                      <option value="archived">Arquivada</option>
                    </select>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setPhase('upload'); setCurrentIdx(0); }}
                    className="px-4 py-3 border border-white/15 hover:border-white text-gray-500 hover:text-white font-body font-bold text-xs tracking-widest uppercase transition-colors"
                    title="Voltar para seleção de fotos"
                  >
                    ←
                  </button>

                  {currentIdx > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentIdx((i) => i - 1)}
                      className="px-5 py-3 border border-white/15 hover:border-white text-gray-500 hover:text-white font-body font-bold text-xs tracking-widest uppercase transition-colors"
                    >
                      Anterior
                    </button>
                  )}

                  {currentIdx < items.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIdx((i) => i + 1)}
                      className="flex-1 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase py-3 transition-colors"
                    >
                      Próxima foto →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPhase('review')}
                      className="flex-1 py-3 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                    >
                      Revisar e salvar →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
