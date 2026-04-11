import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../store';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../lib/useLang';

const T = {
  pt: {
    label: 'Admin', title: 'Lista de Desejos',
    subtitle: 'Itens mais salvos pelos clientes.',
    loading: 'Carregando...',
    noDataTitle: 'Nenhum dado ainda',
    noDataHint: 'Quando clientes salvarem itens, aparecerá aqui.',
    totalSaves: 'Total de saves',
    tattoosSaved: 'Tatuagens salvas',
    productsSaved: 'Produtos salvos',
    topTattoosLabel: 'Tatuagens mais desejadas',
    noTattoos: 'Nenhuma tatuagem salva ainda.',
    topMerchsLabel: 'Produtos mais desejados',
    noMerchs: 'Nenhum produto salvo ainda.',
  },
  en: {
    label: 'Admin', title: 'Wishlist',
    subtitle: 'Most saved items by clients.',
    loading: 'Loading...',
    noDataTitle: 'No data yet',
    noDataHint: 'When clients save items, they will appear here.',
    totalSaves: 'Total saves',
    tattoosSaved: 'Tattoos saved',
    productsSaved: 'Products saved',
    topTattoosLabel: 'Most wished tattoos',
    noTattoos: 'No tattoos saved yet.',
    topMerchsLabel: 'Most wished products',
    noMerchs: 'No products saved yet.',
  },
};

interface WishlistRow {
  item_type: 'tattoo' | 'merch';
  item_id: string;
}

export default function AdminWishlist() {
  const { lang } = useLang();
  const tr = T[lang];
  const tattoos = useStore((s) => s.tattoos);
  const merchs  = useStore((s) => s.merchs);
  const artists = useStore((s) => s.artists);

  const [rows, setRows] = useState<WishlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRows = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('wishlists').select('item_type, item_id');
      if (error) console.error('[AdminWishlist]', error);
      setRows((data as WishlistRow[]) ?? []);
      setLoading(false);
    };
    fetchRows();
  }, []);

  // Count per tattoo
  const tattooCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      if (r.item_type === 'tattoo') map.set(r.item_id, (map.get(r.item_id) ?? 0) + 1);
    }
    return map;
  }, [rows]);

  // Count per merch
  const merchCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      if (r.item_type === 'merch') map.set(r.item_id, (map.get(r.item_id) ?? 0) + 1);
    }
    return map;
  }, [rows]);

  const topTattoos = useMemo(() =>
    tattoos
      .map((t) => ({ tattoo: t, count: tattooCounts.get(t.id) ?? 0 }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count),
    [tattoos, tattooCounts]
  );

  const topMerchs = useMemo(() =>
    merchs
      .map((m) => ({ merch: m, count: merchCounts.get(m.id) ?? 0 }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count),
    [merchs, merchCounts]
  );

  const totalWishlists = rows.length;

  const maxTattooCount = topTattoos[0]?.count ?? 1;
  const maxMerchCount  = topMerchs[0]?.count  ?? 1;

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="font-body text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">{tr.label}</p>
        <h1 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wide leading-none">
          {tr.title}
        </h1>
        <p className="font-body text-xs text-gray-500 mt-2">
          {tr.subtitle}
        </p>
      </div>

      {loading ? (
        <div className="text-gray-600 font-body text-sm">{tr.loading}</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-24 text-gray-600">
          <p className="font-display text-3xl tracking-widest uppercase">{tr.noDataTitle}</p>
          <p className="font-body text-sm mt-2">{tr.noDataHint}</p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            {[
              { label: tr.totalSaves,     value: totalWishlists },
              { label: tr.tattoosSaved,   value: topTattoos.reduce((s, x) => s + x.count, 0) },
              { label: tr.productsSaved,  value: topMerchs.reduce((s, x) => s + x.count, 0) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-zinc-900 border border-white/10 p-4">
                <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 mb-1">{label}</p>
                <p className="font-display text-3xl text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Top tattoos */}
            <section>
              <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-4">
                {tr.topTattoosLabel}
              </p>
              {topTattoos.length === 0 ? (
                <p className="font-body text-xs text-gray-700">{tr.noTattoos}</p>
              ) : (
                <div className="space-y-2">
                  {topTattoos.map(({ tattoo, count }) => {
                    const artist = artists.find((a) => a.id === tattoo.artistId);
                    return (
                      <div key={tattoo.id}
                        className="flex items-center gap-3 bg-zinc-900 border border-white/[0.07] px-3 py-2">
                        <img
                          src={tattoo.imageUrl}
                          alt={tattoo.title}
                          className="w-10 h-10 object-cover flex-shrink-0 bg-zinc-800"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tattoo.id}/80/80`; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm text-white truncate">{tattoo.title}</p>
                          {artist && (
                            <p className="font-body text-[10px] text-gray-600 truncate">{artist.name}</p>
                          )}
                          <div className="mt-1 h-1 bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${(count / maxTattooCount) * 100}%`,
                                backgroundColor: 'rgb(var(--ink-500))',
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                          <span className="font-display text-lg text-white">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Top merchs */}
            <section>
              <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-4">
                {tr.topMerchsLabel}
              </p>
              {topMerchs.length === 0 ? (
                <p className="font-body text-xs text-gray-700">{tr.noMerchs}</p>
              ) : (
                <div className="space-y-2">
                  {topMerchs.map(({ merch, count }) => (
                    <div key={merch.id}
                      className="flex items-center gap-3 bg-zinc-900 border border-white/[0.07] px-3 py-2">
                      <img
                        src={merch.imageUrl ?? ''}
                        alt={merch.name}
                        className="w-10 h-10 object-cover flex-shrink-0 bg-zinc-800"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${merch.id}/80/80`; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-white truncate">{merch.name}</p>
                        <p className="font-body text-[10px] text-gray-600 truncate">
                          {merch.price ? `R$ ${merch.price}` : ''}
                        </p>
                        <div className="mt-1 h-1 bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${(count / maxMerchCount) * 100}%`,
                              backgroundColor: 'rgb(var(--ink2-500))',
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <span className="font-display text-lg text-white">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
