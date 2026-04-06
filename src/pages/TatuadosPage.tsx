import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { toSlug } from '../utils';

export default function TatuadosPage() {
  const { title, subtitle } = useStore((s) => s.tatuadosContent);
  const posts   = useStore((s) => s.tatuadoPosts);
  const artists = useStore((s) => s.artists);
  const navigate = useNavigate();

  // Build list of artists who have at least one post, preserving artist order
  const artistsWithPosts = artists.filter((a) =>
    posts.some((p) => p.artistId === a.id)
  );

  // Posts without an artist
  const unlinkedPosts = posts.filter((p) => !p.artistId);

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Hero */}
      <div className="px-6 md:px-12 pt-16 pb-10 border-b border-white/5">
        <div className="w-1 h-10 bg-ink-500 mb-8" />
        <h1 className="font-display text-[clamp(3rem,12vw,9rem)] uppercase leading-none tracking-tight text-white mb-6">
          {title}
        </h1>
        <p className="font-body text-sm text-white/40 max-w-md leading-relaxed">
          {subtitle}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-body text-xs tracking-widest uppercase text-white/20">
            Nenhuma publicação ainda
          </p>
        </div>
      ) : (
        <div className="px-6 md:px-12 py-12 space-y-20">

          {/* Grouped by artist */}
          {artistsWithPosts.map((artist) => {
            const artistPosts = posts.filter((p) => p.artistId === artist.id);
            const preview = artistPosts.slice(0, 6);
            const slug = toSlug(artist.name);

            return (
              <section key={artist.id}>
                {/* Artist header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={artist.photoUrl}
                      alt={artist.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <h2 className="font-display text-2xl md:text-3xl uppercase tracking-wide text-white leading-none">
                        {artist.name}
                      </h2>
                      <p className="font-body text-xs text-white/30 tracking-widest uppercase mt-0.5">
                        {artistPosts.length} {artistPosts.length === 1 ? 'foto' : 'fotos'}
                      </p>
                    </div>
                  </div>
                  {artistPosts.length > 6 && (
                    <button
                      onClick={() => navigate(`/tatuados/${slug}`)}
                      className="font-body text-xs font-semibold tracking-widest uppercase text-white/40 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5"
                    >
                      Ver todos →
                    </button>
                  )}
                </div>

                {/* Grid — 3 cols on mobile, 6 on desktop, all square */}
                <div
                  className="grid grid-cols-3 md:grid-cols-6 gap-0.5 cursor-pointer"
                  onClick={() => navigate(`/tatuados/${slug}`)}
                >
                  {preview.map((post) => (
                    <div key={post.id} className="relative group aspect-square overflow-hidden bg-zinc-900">
                      <img
                        src={post.imageUrl}
                        alt={post.caption || artist.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      {post.caption && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-end p-2 opacity-0 group-hover:opacity-100">
                          <p className="font-body text-[10px] text-white line-clamp-2 leading-snug">
                            {post.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="mt-10 border-b border-white/5" />
              </section>
            );
          })}

          {/* Posts sem artista */}
          {unlinkedPosts.length > 0 && (
            <section>
              <h2 className="font-display text-2xl uppercase tracking-wide text-white/30 mb-6">
                Outros
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-0.5">
                {unlinkedPosts.map((post) => (
                  <div key={post.id} className="relative group aspect-square overflow-hidden bg-zinc-900">
                    <img
                      src={post.imageUrl}
                      alt={post.caption || 'Tatuado'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
