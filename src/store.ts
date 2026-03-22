import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tattoo, Artist, Merch } from './types';
import type { ThemeId } from './lib/themes';
import { supabase } from './lib/supabase';

// ── Sobre Nós Content ────────────────────────────────────────────────────────
export interface SobreNosContent {
  hero: {
    title1: string;
    title2: string;
    description: string;
  };
  collective: {
    title: string;
    body1: string;
    body2: string;
    body3: string;
    ctaLabel: string;
    imageCaption: string;
  };
  quote: string;
  studio: {
    title: string;
    street: string;
    city: string;
    cep: string;
    mapLat: string;
    mapLng: string;
    mapZoom: string;
    mapLabel: string;
    hours: Array<{ days: string; time: string; closed: boolean }>;
  };
}

const defaultSobreNosContent: SobreNosContent = {
  hero: {
    title1: 'PERMANENCE',
    title2: 'BY DESIGN',
    description:
      'We are a sanctuary for those who view the body as a canvas for high-art and architectural precision. EL DUDE TATTOO is more than a studio. It is a collective of visionaries dedicated to the permanence of creative intent.',
  },
  collective: {
    title: 'THE COLLECTIVE',
    body1:
      'At the heart of El Dude is an artistic collective — a curated group of creators who believe that every line serves a purpose. We reject the generic, opting instead for a connection-first approach that transforms ideas into timeless icons.',
    body2:
      'Our space in São Paulo was designed to bridge the gap between traditional craft and modern minimalism. It is a sterile yet soulful environment where creativity is nurtured through raw expression and technical mastery.',
    body3: '',
    ctaLabel: 'Meet the Artists',
    imageCaption: 'BOTANICAL SERIES 04',
  },
  quote: '"The beauty of the needle lies in its definitive nature."',
  studio: {
    title: 'THE STUDIO',
    street: 'Av. Dr. Arnaldo, 128',
    city: 'Sumaré, São Paulo — SP',
    cep: '01255-000',
    mapLat: '-23.5505',
    mapLng: '-46.6333',
    mapZoom: '15',
    mapLabel: 'Sumaré District',
    hours: [
      { days: 'Tue — Fri', time: '11:00 — 20:00', closed: false },
      { days: 'Saturday', time: '10:00 — 18:00', closed: false },
      { days: 'Sun — Mon', time: 'Closed', closed: true },
    ],
  },
};

// ── Guest Page Content ───────────────────────────────────────────────────────
export interface GuestContent {
  hero: {
    tagline: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    description: string;
    location: string;
  };
  commission: {
    sectionTagline: string;
    cardTagline: string;
    percentage: string;
    splitLabel: string;
    includedLabel: string;
    includedItems: string[];
    studioTitle: string;
    studioDescription: string;
    studioFeatures: Array<{ icon: string; text: string }>;
  };
  environment: {
    sectionTagline: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    description1: string;
    description2: string;
    stats: Array<{ value: string; label: string }>;
  };
  profiles: {
    sectionTagline: string;
    items: Array<{ n: string; title: string; body: string }>;
  };
  cta: {
    tagline: string;
    titleLine1: string;
    titleLine2: string;
    footnote: string;
    whatsapp: string;
    email: string;
  };
}

const defaultGuestContent: GuestContent = {
  hero: {
    tagline: 'Oportunidades — Artistas',
    titleBefore: 'Tatue',
    titleHighlight: 'com',
    titleAfter: 'a gente',
    description:
      'Artistas tatuadores que querem crescer, colaborar e deixar sua marca num coletivo comprometido com excelência artística. Tatue por temporada e integre uma rede que valoriza o seu trabalho.',
    location: 'São Paulo, Brasil',
  },
  commission: {
    sectionTagline: 'Transparência — Condições',
    cardTagline: 'Estrutura de comissão transparente',
    percentage: '30%',
    splitLabel: 'Split do estúdio',
    includedLabel: 'Incluso',
    includedItems: [
      'Ficha de anamnese digital',
      'Esterilização e insumos básicos',
      'Divulgação no perfil do estúdio',
      'Apoio no agendamento',
    ],
    studioTitle: 'Estúdio Estruturado',
    studioDescription:
      'Espaço com recepção, banheiros, impressoras térmicas e ambiente climatizado para seu conforto e precisão.',
    studioFeatures: [
      { icon: '◈', text: 'Wi-Fi de alta velocidade' },
      { icon: '◉', text: 'Estação individual equipada' },
      { icon: '◆', text: 'Iluminação profissional' },
    ],
  },
  environment: {
    sectionTagline: 'Ambiente — Excelência',
    titleBefore: 'O ambiente',
    titleHighlight: 'define',
    titleAfter: 'a arte',
    description1:
      'Acreditamos que o espaço onde você trabalha reflete diretamente na qualidade do que você produz. Nosso estúdio é curado para eliminar distrações e maximizar a concentração.',
    description2:
      'Cada artista guest tem uma estação dedicada com tecnologia necessária para entregar o melhor trabalho da sua carreira.',
    stats: [
      { value: '+5', label: 'Anos de estúdio' },
      { value: '100%', label: 'Agenda digital' },
      { value: '48h', label: 'Resposta garantida' },
      { value: '1:1', label: 'Estação por artista' },
    ],
  },
  profiles: {
    sectionTagline: 'Perfil — Quem buscamos',
    items: [
      {
        n: '01',
        title: 'Portfólio sólido',
        body: 'Mínimo de 2 anos de experiência e portfólio consistente com pelo menos 10 peças concluídas.',
      },
      {
        n: '02',
        title: 'Comprometimento',
        body: 'Disponibilidade mínima de 2 semanas por temporada, com agenda organizada e clientes confirmados.',
      },
      {
        n: '03',
        title: 'Postura profissional',
        body: 'Respeito ao ambiente coletivo, pontualidade e cuidado com os espaços compartilhados.',
      },
    ],
  },
  cta: {
    tagline: 'Pronto para evoluir?',
    titleLine1: 'Submeta seu',
    titleLine2: 'portfólio',
    footnote:
      'Certifique-se de que seu portfólio inclua pelo menos 10 exemplos de trabalhos concluídos. Respondemos a todos os candidatos aprovados em até 48 horas.',
    whatsapp: 'https://wa.me/5511999999999',
    email: 'contato@eldude.com',
  },
};

// ── Row → App type converters (snake_case → camelCase) ──────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTattoo(r: any): Tattoo {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    imageUrl: r.image_url,
    style: r.style,
    price: r.price ?? '',
    artistId: r.artist_id ?? null,
    status: r.status,
    createdAt: r.created_at,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toArtist(r: any): Artist {
  return {
    id: r.id,
    name: r.name,
    bio: r.bio ?? '',
    photoUrl: r.photo_url,
    specialties: r.specialties ?? [],
    instagram: r.instagram ?? undefined,
    whatsapp: r.whatsapp ?? undefined,
    createdAt: r.created_at,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMerch(r: any): Merch {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    imageUrl: r.image_url,
    link: r.link ?? undefined,
    createdAt: r.created_at,
  };
}

// ── Seed data (used as fallback when Supabase is not configured) ─────────────
const seedArtists: Artist[] = [
  { id: 'artist-1', name: 'Braian Otovicz',     bio: '', photoUrl: '/braiansite.jpeg',  specialties: [], createdAt: new Date('2025-01-01').toISOString() },
  { id: 'artist-2', name: 'Luiz Balestro',      bio: '', photoUrl: '/luiisite.jpeg',    specialties: [], createdAt: new Date('2025-01-02').toISOString() },
  { id: 'artist-3', name: 'Matheus de Oliveira',bio: '', photoUrl: '/douglastatt.jpeg', specialties: [], createdAt: new Date('2025-01-03').toISOString() },
  { id: 'artist-4', name: 'Ana Biasi',           bio: '', photoUrl: 'https://picsum.photos/seed/ana-biasi/400/400', specialties: [], createdAt: new Date('2025-01-04').toISOString() },
  { id: 'artist-5', name: 'João Vitor',          bio: '', photoUrl: 'https://raw.githubusercontent.com/Gabrielwo1/tatto-view/claude/tattoo-shop-app-AunfI/public/jaummmm.jpeg', specialties: [], createdAt: new Date('2025-01-05').toISOString() },
  { id: 'artist-6', name: 'Marlon Torture',      bio: '', photoUrl: 'https://picsum.photos/seed/marlon-torture/400/400', specialties: [], createdAt: new Date('2025-01-06').toISOString() },
];

const seedTattoos: Tattoo[] = [
  { id: 'tattoo-1',  title: 'Leão Realista',           description: 'Impressionante leão em realismo preto e cinza.', imageUrl: 'https://picsum.photos/seed/tattoo1/600/400',  style: 'Realismo',       price: 'R$ 1.200', artistId: null, status: 'available', createdAt: new Date('2024-01-10').toISOString() },
  { id: 'tattoo-2',  title: 'Mandala Geométrica',       description: 'Mandala elaborada com padrões geométricos precisos.', imageUrl: 'https://picsum.photos/seed/tattoo2/600/400',  style: 'Geométrico',     price: 'R$ 800',   artistId: null, status: 'available', createdAt: new Date('2024-01-20').toISOString() },
  { id: 'tattoo-3',  title: 'Flor de Cerejeira',        description: 'Delicadas flores de cerejeira em estilo aquarela.', imageUrl: 'https://picsum.photos/seed/tattoo3/600/400',  style: 'Aquarela',       price: 'R$ 950',   artistId: null, status: 'available', createdAt: new Date('2024-02-05').toISOString() },
  { id: 'tattoo-4',  title: 'Âncora Old School',        description: 'Âncora clássica no estilo old school americano.', imageUrl: 'https://picsum.photos/seed/tattoo4/600/400',  style: 'Old School',     price: 'R$ 600',   artistId: null, status: 'available', createdAt: new Date('2024-02-15').toISOString() },
  { id: 'tattoo-5',  title: 'Serpente Blackwork',       description: 'Cobra enrolada em estilo blackwork com padrões tribais.', imageUrl: 'https://picsum.photos/seed/tattoo5/600/400',  style: 'Blackwork',      price: 'R$ 750',   artistId: null, status: 'available', createdAt: new Date('2024-03-01').toISOString() },
  { id: 'tattoo-6',  title: 'Lobo Tribal',              description: 'Lobo majestuoso em estilo tribal com linhas fortes.', imageUrl: 'https://picsum.photos/seed/tattoo6/600/400',  style: 'Tribal',         price: 'R$ 900',   artistId: null, status: 'available', createdAt: new Date('2024-03-10').toISOString() },
  { id: 'tattoo-7',  title: 'Retrato Realista',         description: 'Retrato hiper-realista em preto e cinza.', imageUrl: 'https://picsum.photos/seed/tattoo7/600/400',  style: 'Realismo',       price: 'R$ 1.800', artistId: null, status: 'available', createdAt: new Date('2024-03-20').toISOString() },
  { id: 'tattoo-8',  title: 'Pássaro Minimalista',      description: 'Pássaro em voo com design minimalista e linhas finas.', imageUrl: 'https://picsum.photos/seed/tattoo8/600/400',  style: 'Minimalista',    price: 'R$ 400',   artistId: null, status: 'available', createdAt: new Date('2024-04-01').toISOString() },
  { id: 'tattoo-9',  title: 'Crânio Neo-Tradicional',   description: 'Crânio decorado com flores e padrões neo-tradicionais.', imageUrl: 'https://picsum.photos/seed/tattoo9/600/400',  style: 'Neo-Tradicional',price: 'R$ 1.100', artistId: null, status: 'archived',  createdAt: new Date('2023-11-15').toISOString() },
  { id: 'tattoo-10', title: 'Rosa Aquarela',            description: 'Rosa em aquarela com degradê de cores quentes.', imageUrl: 'https://picsum.photos/seed/tattoo10/600/400', style: 'Aquarela',       price: 'R$ 700',   artistId: null, status: 'archived',  createdAt: new Date('2023-12-01').toISOString() },
  { id: 'tattoo-11', title: 'Dragão Oriental',          description: 'Dragão oriental em blackwork cobrindo o braço inteiro.', imageUrl: 'https://picsum.photos/seed/tattoo11/600/400', style: 'Blackwork',      price: 'R$ 2.500', artistId: null, status: 'available', createdAt: new Date('2024-04-10').toISOString() },
  { id: 'tattoo-12', title: 'Bússola Geométrica',       description: 'Bússola com design geométrico e detalhes intrincados.', imageUrl: 'https://picsum.photos/seed/tattoo12/600/400', style: 'Geométrico',     price: 'R$ 650',   artistId: null, status: 'archived',  createdAt: new Date('2023-10-20').toISOString() },
];

// ── Store interface ──────────────────────────────────────────────────────────
interface AppState {
  tattoos: Tattoo[];
  artists: Artist[];
  merchs: Merch[];
  isAdmin: boolean;
  /** True once Supabase data has been loaded (or if Supabase is not configured). */
  dataLoaded: boolean;
  /** Theme chosen by the studio admin. null = use subdomain default. */
  themeId: ThemeId | null;
  setTheme: (id: ThemeId | null) => void;
  /** Sobre Nós page content editable by admin */
  sobreNosContent: SobreNosContent;
  setSobreNosContent: (content: SobreNosContent) => void;
  /** Guest page content editable by admin */
  guestContent: GuestContent;
  setGuestContent: (content: GuestContent) => void;
  loadData: () => Promise<void>;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addTattoo: (tattoo: Omit<Tattoo, 'id' | 'createdAt'>) => void;
  updateTattoo: (id: string, updates: Partial<Tattoo>) => void;
  deleteTattoo: (id: string) => void;
  archiveTattoo: (id: string) => void;
  reorderTattoos: (orderedIds: string[]) => void;
  reorderArtists: (orderedIds: string[]) => void;
  addArtist: (artist: Omit<Artist, 'id' | 'createdAt'>) => void;
  updateArtist: (id: string, updates: Partial<Artist>) => void;
  deleteArtist: (id: string) => void;
  addMerch: (merch: Omit<Merch, 'id' | 'createdAt'>) => void;
  updateMerch: (id: string, updates: Partial<Merch>) => void;
  deleteMerch: (id: string) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tattoos: seedTattoos,
      artists: seedArtists,
      merchs: [],
      isAdmin: false,
      dataLoaded: false,
      themeId: null,
      setTheme: (id) => set({ themeId: id }),
      sobreNosContent: defaultSobreNosContent,
      setSobreNosContent: (content) => set({ sobreNosContent: content }),
      guestContent: defaultGuestContent,
      setGuestContent: (content) => set({ guestContent: content }),

      // ── Load from Supabase ───────────────────────────────────────────────
      loadData: async () => {
        if (!supabase) {
          set({ dataLoaded: true });
          return;
        }
        try {
          const [{ data: t, error: te }, { data: a, error: ae }, { data: m, error: me }] =
            await Promise.all([
              supabase.from('tattoos').select('*').order('created_at', { ascending: false }),
              supabase.from('artists').select('*').order('created_at', { ascending: true }),
              supabase.from('merchs').select('*').order('created_at', { ascending: false }),
            ]);
          if (te) throw te;
          if (ae) throw ae;
          if (me) throw me;
          set({
            tattoos: (t ?? []).map(toTattoo),
            artists: (a ?? []).map(toArtist),
            merchs: (m ?? []).map(toMerch),
            dataLoaded: true,
          });
        } catch (err) {
          console.error('[store] Supabase loadData failed, using cached data:', err);
          set({ dataLoaded: true });
        }
      },

      // ── Auth ─────────────────────────────────────────────────────────────
      login: (username, password) => {
        if (username === 'admin' && password === 'tatto123') {
          set({ isAdmin: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAdmin: false }),

      // ── Tattoos ──────────────────────────────────────────────────────────
      addTattoo: (data) => {
        const tattoo: Tattoo = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        set((s) => ({ tattoos: [tattoo, ...s.tattoos] }));
        supabase?.from('tattoos').insert({
          id: tattoo.id, title: tattoo.title, description: tattoo.description,
          image_url: tattoo.imageUrl, style: tattoo.style, price: tattoo.price,
          artist_id: tattoo.artistId, status: tattoo.status, created_at: tattoo.createdAt,
        }).then(({ error }) => { if (error) console.error('[store] addTattoo:', error); });
      },

      updateTattoo: (id, updates) => {
        set((s) => ({ tattoos: s.tattoos.map((t) => t.id === id ? { ...t, ...updates } : t) }));
        const row: Record<string, unknown> = {};
        if (updates.title       !== undefined) row.title       = updates.title;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.imageUrl    !== undefined) row.image_url   = updates.imageUrl;
        if (updates.style       !== undefined) row.style       = updates.style;
        if (updates.price       !== undefined) row.price       = updates.price;
        if (updates.artistId    !== undefined) row.artist_id   = updates.artistId;
        if (updates.status      !== undefined) row.status      = updates.status;
        supabase?.from('tattoos').update(row).eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] updateTattoo:', error); });
      },

      deleteTattoo: (id) => {
        set((s) => ({ tattoos: s.tattoos.filter((t) => t.id !== id) }));
        supabase?.from('tattoos').delete().eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] deleteTattoo:', error); });
      },

      archiveTattoo: (id) => {
        const tattoo = get().tattoos.find((t) => t.id === id);
        if (!tattoo) return;
        const status = tattoo.status === 'available' ? 'archived' : 'available';
        set((s) => ({ tattoos: s.tattoos.map((t) => t.id === id ? { ...t, status } : t) }));
        supabase?.from('tattoos').update({ status }).eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] archiveTattoo:', error); });
      },

      reorderTattoos: (orderedIds) => {
        set((s) => {
          const map = new Map(s.tattoos.map((t) => [t.id, t]));
          const reordered = orderedIds.map((id) => map.get(id)).filter((t): t is Tattoo => !!t);
          const rest = s.tattoos.filter((t) => !orderedIds.includes(t.id));
          return { tattoos: [...reordered, ...rest] };
        });
      },

      reorderArtists: (orderedIds) => {
        set((s) => {
          const map = new Map(s.artists.map((a) => [a.id, a]));
          const reordered = orderedIds.map((id) => map.get(id)).filter((a): a is Artist => !!a);
          const rest = s.artists.filter((a) => !orderedIds.includes(a.id));
          return { artists: [...reordered, ...rest] };
        });
      },

      // ── Artists ──────────────────────────────────────────────────────────
      addArtist: (data) => {
        const artist: Artist = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        set((s) => ({ artists: [...s.artists, artist] }));
        supabase?.from('artists').insert({
          id: artist.id, name: artist.name, bio: artist.bio, photo_url: artist.photoUrl,
          specialties: artist.specialties, instagram: artist.instagram, whatsapp: artist.whatsapp,
          created_at: artist.createdAt,
        }).then(({ error }) => { if (error) console.error('[store] addArtist:', error); });
      },

      updateArtist: (id, updates) => {
        set((s) => ({ artists: s.artists.map((a) => a.id === id ? { ...a, ...updates } : a) }));
        const row: Record<string, unknown> = {};
        if (updates.name         !== undefined) row.name        = updates.name;
        if (updates.bio          !== undefined) row.bio         = updates.bio;
        if (updates.photoUrl     !== undefined) row.photo_url   = updates.photoUrl;
        if (updates.specialties  !== undefined) row.specialties = updates.specialties;
        if (updates.instagram    !== undefined) row.instagram   = updates.instagram;
        if (updates.whatsapp     !== undefined) row.whatsapp    = updates.whatsapp;
        supabase?.from('artists').update(row).eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] updateArtist:', error); });
      },

      deleteArtist: (id) => {
        set((s) => ({ artists: s.artists.filter((a) => a.id !== id) }));
        supabase?.from('artists').delete().eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] deleteArtist:', error); });
      },

      // ── Merchs ───────────────────────────────────────────────────────────
      addMerch: (data) => {
        const merch: Merch = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        set((s) => ({ merchs: [merch, ...s.merchs] }));
        supabase?.from('merchs').insert({
          id: merch.id, name: merch.name, description: merch.description,
          price: merch.price, image_url: merch.imageUrl, link: merch.link,
          created_at: merch.createdAt,
        }).then(({ error }) => { if (error) console.error('[store] addMerch:', error); });
      },

      updateMerch: (id, updates) => {
        set((s) => ({ merchs: s.merchs.map((m) => m.id === id ? { ...m, ...updates } : m) }));
        const row: Record<string, unknown> = {};
        if (updates.name        !== undefined) row.name        = updates.name;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.price       !== undefined) row.price       = updates.price;
        if (updates.imageUrl    !== undefined) row.image_url   = updates.imageUrl;
        if (updates.link        !== undefined) row.link        = updates.link;
        supabase?.from('merchs').update(row).eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] updateMerch:', error); });
      },

      deleteMerch: (id) => {
        set((s) => ({ merchs: s.merchs.filter((m) => m.id !== id) }));
        supabase?.from('merchs').delete().eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] deleteMerch:', error); });
      },
    }),
    {
      name: 'tattoo-shop-storage-v3',
      // Persist everything locally as fallback — Supabase is the source of truth
      // but localStorage ensures data survives if Supabase is unavailable
      partialize: (state) => ({
        isAdmin: state.isAdmin,
        themeId: state.themeId,
        tattoos: state.tattoos,
        artists: state.artists,
        merchs: state.merchs,
        sobreNosContent: state.sobreNosContent,
        guestContent: state.guestContent,
      }),
    }
  )
);
