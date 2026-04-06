import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';

export default function AdminArtists() {
  const artists = useStore((s) => s.artists);
  const tattoos = useStore((s) => s.tattoos);
  const deleteArtist = useStore((s) => s.deleteArtist);
  const reorderArtists = useStore((s) => s.reorderArtists);

  // Local order state — mirrors store but allows live preview while dragging
  const [order, setOrder] = useState<string[]>(() => artists.map((a) => a.id));
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  // Keep order in sync when artists change (add/delete)
  const artistIds = artists.map((a) => a.id).join(',');
  const prevIds = useRef(artistIds);
  if (prevIds.current !== artistIds) {
    prevIds.current = artistIds;
    setOrder(artists.map((a) => a.id));
  }

  const artistMap = new Map(artists.map((a) => [a.id, a]));
  const sorted = order.map((id) => artistMap.get(id)).filter(Boolean) as typeof artists;

  function handleDelete(id: string, name: string) {
    if (confirm(`Excluir artista "${name}"? Esta ação não pode ser desfeita.`)) {
      deleteArtist(id);
    }
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────
  function onDragStart(id: string) {
    dragId.current = id;
  }

  function onDragEnter(targetId: string) {
    if (!dragId.current || dragId.current === targetId) return;
    setDragOver(targetId);
    setOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(dragId.current!);
      const to = next.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      next.splice(from, 1);
      next.splice(to, 0, dragId.current!);
      return next;
    });
  }

  function onDragEnd() {
    setDragOver(null);
    dragId.current = null;
    reorderArtists(order);
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-10">
        <div>
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Admin</p>
          <h1 className="font-display text-3xl md:text-5xl text-white uppercase tracking-wide leading-none">Artistas</h1>
        </div>
        <Link
          to="/admin/artistas/novo"
          className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase px-5 py-3 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Novo Artista
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="border border-white/10 py-20 text-center">
          <p className="font-display text-2xl text-gray-700 uppercase tracking-widest">Nenhum artista</p>
        </div>
      ) : (
        <div className="space-y-px">
          {/* Table header */}
          <div className="grid grid-cols-12 px-4 py-2 border-b border-white/10">
            <span className="col-span-1 font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hidden md:block" />
            <span className="col-span-5 md:col-span-4 font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600">Artista</span>
            <span className="col-span-4 font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hidden md:block">Especialidades</span>
            <span className="col-span-1 font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 hidden lg:block">Artes</span>
            <span className="col-span-2 font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 text-right">Ações</span>
          </div>

          {sorted.map((artist) => {
            const artistTattoos = tattoos.filter((t) => t.artistId === artist.id);
            const isDragOver = dragOver === artist.id;

            return (
              <div
                key={artist.id}
                draggable
                onDragStart={() => onDragStart(artist.id)}
                onDragEnter={() => onDragEnter(artist.id)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={onDragEnd}
                className={`grid grid-cols-12 px-4 py-3 border-b transition-colors items-center select-none cursor-grab active:cursor-grabbing ${
                  isDragOver
                    ? 'border-white/40 bg-white/[0.06]'
                    : 'border-white/5 hover:bg-white/[0.03]'
                }`}
              >
                {/* Drag handle */}
                <div className="col-span-1 hidden md:flex items-center text-gray-700 hover:text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                {/* Artist info */}
                <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                  <img
                    src={artist.photoUrl}
                    alt={artist.name}
                    className="w-9 h-9 object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${artist.id}/100/100`;
                    }}
                  />
                  <div className="min-w-0">
                    <p className="font-display text-sm text-white uppercase tracking-wide truncate">{artist.name}</p>
                    {artist.instagram && (
                      <p className="font-body text-[10px] text-gray-600 truncate">{artist.instagram}</p>
                    )}
                  </div>
                </div>

                {/* Specialties */}
                <div className="col-span-4 hidden md:flex flex-wrap gap-1">
                  {artist.specialties.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 border border-white/15 text-white/50 text-[10px] font-body font-semibold tracking-widest uppercase"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Count */}
                <div className="col-span-1 hidden lg:block">
                  <span className="font-display text-2xl text-white/40">{artistTattoos.length}</span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-1.5">
                  <Link
                    to={`/artistas/${artist.id}`}
                    target="_blank"
                    title="Ver vitrine"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-gray-600 hover:text-white hover:bg-white/5 transition-all"
                    draggable={false}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                  <Link
                    to={`/admin/artistas/${artist.id}/editar`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-gray-600 hover:text-white hover:bg-white/5 transition-all"
                    draggable={false}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDelete(artist.id, artist.name)}
                    className="p-1.5 text-gray-700 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 font-body text-[10px] tracking-widest uppercase text-gray-700">
        Arraste as linhas para reordenar
      </p>
    </div>
  );
}
