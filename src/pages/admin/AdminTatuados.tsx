import { useState, useRef } from 'react';
import { useStore } from '../../store';
import type { TatuadosContent } from '../../store';
import type { TatuadoPost } from '../../types';
import { uploadImage } from '../../lib/uploadImage';

const inputCls =
  'w-full bg-transparent border border-white/15 px-4 py-2.5 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors';
const labelCls =
  'block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2';

function generateId() {
  return `tp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const emptyForm: Omit<TatuadoPost, 'id' | 'createdAt'> = {
  imageUrl: '',
  caption: '',
  artistId: null,
  size: 'medium',
};

export default function AdminTatuados() {
  const tatuadosContent    = useStore((s) => s.tatuadosContent);
  const setTatuadosContent = useStore((s) => s.setTatuadosContent);
  const posts              = useStore((s) => s.tatuadoPosts);
  const addPost            = useStore((s) => s.addTatuadoPost);
  const updatePost         = useStore((s) => s.updateTatuadoPost);
  const deletePost         = useStore((s) => s.deleteTatuadoPost);
  const artists            = useStore((s) => s.artists);

  // Page header form
  const [headerForm, setHeaderForm] = useState<TatuadosContent>(tatuadosContent);
  const [headerSaved, setHeaderSaved] = useState(false);

  // Post form
  const [form, setForm] = useState<Omit<TatuadoPost, 'id' | 'createdAt'>>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [postSaved, setPostSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function saveHeader() {
    setTatuadosContent(headerForm);
    setHeaderSaved(true);
    setTimeout(() => setHeaderSaved(false), 2000);
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      const url = await uploadImage(base64);
      setForm((f) => ({ ...f, imageUrl: url }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function handleSavePost() {
    if (!form.imageUrl) return;
    if (editing) {
      updatePost({ ...form, id: editing, createdAt: posts.find((p) => p.id === editing)!.createdAt });
    } else {
      addPost({ ...form, id: generateId(), createdAt: new Date().toISOString() });
    }
    setForm(emptyForm);
    setEditing(null);
    setPostSaved(true);
    setTimeout(() => setPostSaved(false), 2000);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleEdit(post: TatuadoPost) {
    setEditing(post.id);
    setForm({ imageUrl: post.imageUrl, caption: post.caption, artistId: post.artistId, size: post.size });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancel() {
    setEditing(null);
    setForm(emptyForm);
    if (fileRef.current) fileRef.current.value = '';
  }

  const sizeLabels: Record<TatuadoPost['size'], string> = {
    small: 'Pequeno (1×1)',
    medium: 'Médio (1×2 — alto)',
    large: 'Grande (2×2)',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">

      {/* ── Page header settings ── */}
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide text-white mb-1">Tatuados</h1>
        <p className="font-body text-xs text-gray-500 mb-6">Gerencie o arquivo de fotos de tatuagens.</p>

        <div className="border border-white/10 p-6 space-y-4">
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-2">Cabeçalho da página</p>
          <div>
            <label className={labelCls}>Título</label>
            <input type="text" value={headerForm.title} onChange={(e) => setHeaderForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Subtítulo</label>
            <textarea rows={2} value={headerForm.subtitle} onChange={(e) => setHeaderForm((f) => ({ ...f, subtitle: e.target.value }))} className={inputCls + ' resize-none'} />
          </div>
          <div className="flex items-center gap-4 pt-1">
            <button onClick={saveHeader} className="px-6 py-2.5 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase transition-colors">
              Salvar cabeçalho
            </button>
            {headerSaved && <span className="font-body text-xs text-green-400 tracking-widest uppercase">Salvo!</span>}
          </div>
        </div>
      </div>

      {/* ── Add / edit post ── */}
      <div className="border border-white/10 p-6 space-y-5">
        <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600">
          {editing ? 'Editar publicação' : 'Nova publicação'}
        </p>

        {/* Image upload */}
        <div>
          <label className={labelCls}>Foto *</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
          {form.imageUrl ? (
            <div className="relative w-full max-h-56 overflow-hidden border border-white/10 bg-black">
              <img src={form.imageUrl} alt="preview" className="w-full max-h-56 object-contain" />
              <button
                onClick={() => { setForm((f) => ({ ...f, imageUrl: '' })); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-2 right-2 bg-black/70 border border-white/20 text-white/50 hover:text-white p-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-white/15 hover:border-ink-500/50 py-8 flex flex-col items-center gap-2 text-gray-500 hover:text-ink-500 transition-colors"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="font-body text-xs tracking-widest uppercase">{uploading ? 'Enviando...' : 'Escolher foto'}</span>
            </button>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className={labelCls}>Legenda</label>
          <textarea rows={2} value={form.caption} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))} className={inputCls + ' resize-none'} placeholder="Descrição da tatuagem..." />
        </div>

        {/* Artist */}
        <div>
          <label className={labelCls}>Artista</label>
          <select value={form.artistId ?? ''} onChange={(e) => setForm((f) => ({ ...f, artistId: e.target.value || null }))} className={inputCls + ' bg-zinc-900'}>
            <option value="">— Nenhum —</option>
            {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {/* Size */}
        <div>
          <label className={labelCls}>Tamanho no mosaico</label>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as TatuadoPost['size'][]).map((s) => (
              <button
                key={s}
                onClick={() => setForm((f) => ({ ...f, size: s }))}
                className={`py-2.5 border font-body text-xs tracking-widest uppercase transition-colors ${form.size === s ? 'border-ink-500 text-ink-500' : 'border-white/15 text-gray-500 hover:border-white/40'}`}
              >
                {sizeLabels[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSavePost}
            disabled={!form.imageUrl || uploading}
            className="px-6 py-2.5 bg-white hover:bg-gray-100 disabled:opacity-40 text-black font-body font-bold text-xs tracking-widest uppercase transition-colors"
          >
            {editing ? 'Atualizar' : 'Publicar'}
          </button>
          {editing && (
            <button onClick={handleCancel} className="px-4 py-2.5 border border-white/15 text-gray-500 hover:text-white font-body text-xs tracking-widest uppercase transition-colors">
              Cancelar
            </button>
          )}
          {postSaved && <span className="font-body text-xs text-green-400 tracking-widest uppercase">Salvo!</span>}
        </div>
      </div>

      {/* ── Posts list ── */}
      {posts.length > 0 && (
        <div>
          <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-4">
            {posts.length} {posts.length === 1 ? 'publicação' : 'publicações'}
          </p>
          <div className="space-y-2">
            {[...posts].reverse().map((post) => (
              <div key={post.id} className="flex items-center gap-4 border border-white/10 p-3">
                <img src={post.imageUrl} alt="" className="w-14 h-14 object-cover flex-shrink-0 bg-zinc-900" />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-white truncate">{post.caption || '—'}</p>
                  <p className="font-body text-[10px] text-gray-600 mt-0.5 uppercase tracking-widest">
                    {artists.find((a) => a.id === post.artistId)?.name ?? 'Sem artista'} · {post.size}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(post)} className="px-3 py-1.5 border border-white/15 text-gray-500 hover:text-white font-body text-[10px] tracking-widest uppercase transition-colors">
                    Editar
                  </button>
                  <button onClick={() => { if (confirm('Remover esta publicação?')) deletePost(post.id); }} className="px-3 py-1.5 border border-red-500/20 text-red-500/60 hover:text-red-400 font-body text-[10px] tracking-widest uppercase transition-colors">
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
