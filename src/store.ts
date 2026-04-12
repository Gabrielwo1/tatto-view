import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tattoo, Artist, Merch, TattooSession, ShopContent, TatuadoPost, TattooRow, ArtistRow, MerchRow, Expense, ExpenseCategory, FichaSubmission, FichaConfig, PublicUser, WishlistItem, CartItem } from './types';
export type { FichaSubmission, FichaConfig };
import type { ThemeId, LogoColorMode } from './lib/themes';
import { supabase } from './lib/supabase';

// ── Studio detection ──────────────────────────────────────────────────────────
function detectStudioId(): string {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'eldude.vitrink.app';
  const match = host.match(/^([^.]+)\.vitrink\.app$/);
  if (match) return match[1];
  return 'eldude'; // fallback for localhost / preview deployments
}

export const STUDIO_ID = detectStudioId();

// Helper for site_config upserts — always scoped to the current studio
const sc = (key: string, value: unknown) => ({
  studio_id: STUDIO_ID, key, value, updated_at: new Date().toISOString(),
});

// ── Default Sessions ──────────────────────────────────────────────────────────
const defaultSessions: TattooSession[] = [
  {
    id: 'session-1',
    typeNum: '01',
    title: 'SMALL SESSION',
    description: 'Até 5cm. Linework minimalista ou micro-realismo. Perfeito para quem está começando.',
    price: 'R$ 250',
    bookingLink: '',
  },
  {
    id: 'session-2',
    typeNum: '02',
    title: 'MEDIUM SESSION',
    description: '5 – 15cm. Projetos médios com detalhes e sombreamento elaborado.',
    price: 'R$ 500',
    bookingLink: '',
  },
  {
    id: 'session-3',
    typeNum: '03',
    title: 'FULL SESSION',
    description: 'Projetos grandes ou complexos. Área extensa, múltiplas sessões, alto detalhamento.',
    price: 'A combinar',
    bookingLink: '',
  },
];

// ── Default Ficha Config ──────────────────────────────────────────────────────
const defaultFichaConfig: FichaConfig = {
  tatuadores: [
    'Bruna Lopes',
    'Dionatan Lacerda',
    'Kodai Muniz',
    'Lucas Vasconcellos',
    'Luiza Vasconcellos',
    'Marília Garcia',
    'Rafaella Golio',
    'Outro',
  ],
  conditions: [
    'Alteração na pressão',
    'Epilepsia / Convulsão / Desmaio constante',
    'Diabetes / Hipoglicemia',
    'Hemofilia',
    'Soropositivo',
    'Hepatite A B C',
    'Dificuldade de cicatrização',
    'Alergias',
    'Faz uso de medicamentos',
    'Tem alguma doença crônica',
    'Gestante',
    'Alimentou-se bem hoje',
  ],
};

// ── Landing Page Content ──────────────────────────────────────────────────────
export interface LandingContent {
  hero: { tagline: string; description: string };
  manifesto: { title1: string; title2: string; body1: string; body2: string };
  processo: Array<{ n: string; title: string; desc: string }>;
  especialidades: Array<{ style: string; icon: string; desc: string }>;
  precos: Array<{ label: string; range: string; detail: string }>;
  faq: Array<{ q: string; a: string }>;
  cta: { tagline: string; title1: string; title2: string; description: string };
  estilos?: Record<string, { icon: string; desc: string }>;
}

const defaultLandingContent: LandingContent = {
  hero: {
    tagline: 'Sua pele.\nNossa arte,\nnossa tattoo.',
    description: 'Estúdio de tatuagens com artistas especializados em diferentes estilos.\nDo traço à pele — com arte, técnica e respeito pela sua história.',
  },
  manifesto: {
    title1: 'Arte que',
    title2: 'permanece',
    body1: 'No El Dude, cada tatuagem nasce de uma conversa. Ouvimos a sua história, entendemos o que você quer registrar e transformamos isso em arte permanente — feita com técnica, cuidado e respeito pelo seu corpo.',
    body2: 'Trabalhamos com artistas especializados em estilos distintos, garantindo que você encontre o profissional certo para a arte que você imagina. Da primeira consulta ao retoque final, você está em boas mãos.',
  },
  processo: [
    { n: '01', title: 'Consulta',      desc: 'Entre em contato com o artista pelo Instagram ou WhatsApp. Sem compromisso — só uma conversa sobre a sua ideia.' },
    { n: '02', title: 'Briefing',      desc: 'Compartilhe referências, tamanho, local no corpo e orçamento. O artista vai entender o que você precisa.' },
    { n: '03', title: 'Agendamento',   desc: 'Confirmamos data, valor e duração da sessão. Um sinal pode ser solicitado para garantir o horário.' },
    { n: '04', title: 'Sessão & Arte', desc: 'Na data marcada, o artista traz o desenho. Você aprova e a tatuagem começa. Cuidamos de você do início ao fim.' },
  ],
  especialidades: [
    { style: 'Realismo',        icon: '◉', desc: 'Detalhes fotográficos e sombreamento profundo' },
    { style: 'Blackwork',       icon: '◼', desc: 'Linhas fortes, preenchimento sólido em preto' },
    { style: 'Aquarela',        icon: '◈', desc: 'Cores vibrantes e fluxo livre de pigmento' },
    { style: 'Geométrico',      icon: '◇', desc: 'Precisão matemática e simetria perfeita' },
    { style: 'Old School',      icon: '★', desc: 'Linhas marcantes e paleta clássica americana' },
    { style: 'Tribal',          icon: '◆', desc: 'Padrões ancestrais com significado cultural' },
    { style: 'Tradicional',     icon: '◎', desc: 'Estética atemporal com traços precisos' },
    { style: 'Neo-Tradicional', icon: '✦', desc: 'Traços tradicionais com cores contemporâneas' },
    { style: 'Minimalista',     icon: '—', desc: 'Essência pura, menos é mais' },
  ],
  precos: [
    { label: 'Minimalista',               range: 'A partir de R$ 250',   detail: 'Peças pequenas, traço simples' },
    { label: 'Old School · Tribal',       range: 'R$ 400 – R$ 900',     detail: 'Tamanho médio, cores sólidas' },
    { label: 'Blackwork · Geométrico',    range: 'R$ 500 – R$ 1.200',   detail: 'Depende da área e preenchimento' },
    { label: 'Neo-Tradicional · Aquarela', range: 'R$ 600 – R$ 1.500', detail: 'Coloração e detalhamento elevados' },
    { label: 'Realismo',                  range: 'R$ 800 – R$ 2.500+',  detail: 'Alta complexidade, múltiplas sessões' },
  ],
  faq: [
    { q: 'Como funciona a consulta?',             a: 'A consulta é feita pelo Instagram ou WhatsApp do artista escolhido. Explicamos o projeto, discutimos referências e calculamos o valor antes de qualquer compromisso.' },
    { q: 'Quanto tempo leva para fazer uma tatuagem?', a: 'Depende do tamanho e complexidade. Peças pequenas (2–3h), médias (4–6h), e trabalhos grandes podem ser divididos em sessões.' },
    { q: 'A tattoo vai desbotar com o tempo?',    a: 'Com os cuidados corretos — protetor solar, hidratação e retoques periódicos — a tinta mantém a qualidade por muitos anos.' },
    { q: 'Posso trazer minha própria referência?', a: 'Sim, e encorajamos isso! Referências ajudam o artista a entender sua visão. O desenho final será personalizado para o seu corpo e estilo.' },
    { q: 'Fazem retoque após cicatrização?',      a: 'Sim. Retoques da mesma arte (dentro de 6 meses da sessão) têm condições especiais. Consulte seu artista.' },
  ],
  cta: {
    tagline: 'Vamos começar',
    title1: 'Pronto para',
    title2: 'sua arte?',
    description: 'Escolha seu artista, fale sobre sua ideia e dê o próximo passo. A consulta é gratuita e sem compromisso.',
  },
  estilos: {
    Realismo:          { icon: '◉', desc: 'Detalhes fotográficos e sombreamento profundo' },
    Blackwork:         { icon: '◼', desc: 'Linhas fortes, preenchimento sólido em preto' },
    Aquarela:          { icon: '◈', desc: 'Cores vibrantes e fluxo livre de pigmento' },
    Geométrico:        { icon: '◇', desc: 'Precisão matemática e simetria perfeita' },
    'Old School':      { icon: '★', desc: 'Linhas marcantes e paleta clássica americana' },
    Tribal:            { icon: '◆', desc: 'Padrões ancestrais com significado cultural' },
    'Neo-Tradicional': { icon: '✦', desc: 'Traços tradicionais com cores contemporâneas' },
    Minimalista:       { icon: '—', desc: 'Essência pura, menos é mais' },
  },
};

// ── Events Content ───────────────────────────────────────────────────────────
export interface EventItem {
  id: string;
  date: string;       // e.g. "OCT 31"
  timeLabel: string;  // e.g. "20:00 - LATE" or "3 DAY RESIDENCY"
  type: string;       // "flash" | "guest" | "workshop" | custom
  image: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  hidden?: boolean;
}

export interface EventsContent {
  hero: {
    tagline: string;
    title: string;
    heroImage: string;
    description: string;
  };
  events: EventItem[];
}

const defaultEventsContent: EventsContent = {
  hero: {
    tagline: 'UPCOMING EXPERIENCES',
    title: 'CULTURE &\nPERMANENCE',
    heroImage: '',
    description: "We don't just ink; we curate moments. Join our community events designed for collectors and artists alike.",
  },
  events: [
    {
      id: 'event-1',
      date: 'OUT 31',
      timeLabel: '20:00 - LATE',
      type: 'flash',
      image: '',
      title: 'FLASH DAY: NEON NIGHTS',
      description: 'Desenhos exclusivos inspirados em cyber-punk disponíveis por uma noite. Por ordem de chegada. DJs convidados e open bar.',
      ctaLabel: 'SAIBA MAIS',
      ctaUrl: '',
    },
    {
      id: 'event-2',
      date: 'NOV 12',
      timeLabel: 'RESIDÊNCIA 3 DIAS',
      type: 'guest',
      image: '',
      title: 'GUEST SPOT: MARCUS INK',
      description: 'Mestre do fine-line brutalism visita nosso estúdio. Agendamentos extremamente limitados para projetos de blackwork em grande escala.',
      ctaLabel: 'SAIBA MAIS',
      ctaUrl: '',
    },
    {
      id: 'event-3',
      date: 'DEZ 05',
      timeLabel: '14:00 - 18:00',
      type: 'workshop',
      image: '',
      title: 'WORKSHOP DE TATUAGEM',
      description: 'Introdução técnica ao linework de precisão. Aprenda teoria de agulhas e mecânica de máquina em um ambiente prático.',
      ctaLabel: 'SAIBA MAIS',
      ctaUrl: '',
    },
  ],
};


// ── Sobre Nós Content ────────────────────────────────────────────────────────
export interface SobreNosContent {
  hero: {
    title1: string;
    title2: string;
    description: string;
    estLabel: string;
  };
  collective: {
    title: string;
    body1: string;
    body2: string;
    body3: string;
    ctaLabel: string;
    imageCaption: string;
    image: string;
    imageSize: string;
    galleryImages: [string, string, string, string, string, string, string, string, string];
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
  contact: {
    email: string;
    phone1: string;
    phone1Url: string;
    phone2: string;
    phone2Url: string;
    instagram: string;
    instagramUrl: string;
    tiktok: string;
    tiktokUrl: string;
    twitter: string;
    twitterUrl: string;
    663: string;
  };
}

const defaultSobreNosContent: SobreNosContent = {
  hero: {
    title1: 'PERMANÊNCIA',
    title2: 'PELO DESIGN',
    description:
      'Somos um santuário para quem enxerga o corpo como tela para alta arte e precisão arquitetônica. EL DUDE TATTOO é mais do que um estúdio. É um coletivo de visionários dedicados à permanência da intenção criativa.',
    estLabel: 'Est. 2018 — Francisco Beltrão',
  },
  collective: {
    title: 'O COLETIVO',
    body1:
      'No coração do El Dude existe um coletivo artístico — um grupo criterioso de criadores que acreditam que cada traço tem um propósito. Rejeitamos o genérico, optando por uma abordagem que prioriza a conexão e transforma ideias em ícones atemporais.',
    body2:
      'Nosso espaço foi projetado para unir o artesanato tradicional ao minimalismo moderno. Um ambiente ao mesmo tempo preciso e sensível, onde a criatividade é cultivada através da expressão bruta e da maestria técnica.',
    body3: '',
    ctaLabel: 'Conheça os Artistas',
    imageCaption: 'SÉRIE BOTÂNICA 04',
    image: '',
    imageSize: 'md',
    galleryImages: ['', '', '', '', '', '', '', '', ''],
  },
  quote: '"A beleza da agulha está em sua natureza definitiva."',
  contact: {
    email: 'elduderinotattoo@gmail.com',
    phone1: '46 99704747',
    phone1Url: 'tel:+554699704747',
    phone2: '',
    phone2Url: '',
    instagram: '@eldude.tattoo',
    instagramUrl: 'https://instagram.com/eldude.tattoo',
    tiktok: '@eldude.tattoo',
    tiktokUrl: 'https://tiktok.com/@eldude.tattoo',
    twitter: '',
    twitterUrl: '',
  },
  studio: {
    title: 'EL DUDE TATTOO',
    street: 'Rua Antonio Carneiro Neto, 641',
    city: 'Francisco Beltrão — PR',
    cep: '85601-300',
    mapLat: '-26.0822',
    mapLng: '-53.0549',
    mapZoom: '15',
    mapLabel: 'Bairro Sumaré',
    hours: [
      { days: 'Seg — Sex', time: '11:00 — 18:00', closed: false },
      { days: 'Sábado',    time: 'Apenas com hora marcada',  closed: false },
      { days: 'Dom',       time: 'Apenas com hora marcada',  closed: false },
    ],
  },
};

// ── Aftercare Page Content ────────────────────────────────────────────────────
export interface AftercareContent {
  hero: { tagline: string; description: string };
  preSession: Array<{ title: string; body: string }>;
  daySession: string[];
  postSession: {
    hygieneTitle: string;
    hygieneBody: string;
    forbiddenTitle: string;
    forbiddenItems: string[];
    alertText: string;
  };
  cta: { tagline: string; title1: string; title2: string; description: string };
}

const defaultAftercareContent: AftercareContent = {
  hero: {
    tagline: 'Guia de Cuidados',
    description:
      'A arte na pele é um investimento vitalício. Este guia detalha o protocolo necessário para garantir uma cura perfeita e a longevidade da sua nova tatuagem. Siga cada etapa para preservar a qualidade do trabalho.',
  },
  preSession: [
    { title: 'Evite Álcool', body: 'Não consuma bebidas alcoólicas 24 horas antes. O álcool afina o sangue, prejudicando a pigmentação.' },
    { title: 'Hidratação',   body: 'Beba muita água e hidrate a área com loção neutra nos dias que antecedem a sessão para uma pele mais receptiva.' },
    { title: 'Preparação',   body: 'Certifique-se de que a área esteja limpa e livre de irritações ou queimaduras solares. Evite depilação agressiva.' },
    { title: 'Descanso & Nutrição', body: 'Tenha uma noite de sono completa e faça uma refeição reforçada antes da sua sessão de tatuagem.' },
  ],
  daySession: [
    'Chegue pontualmente. O tempo do artista é rigorosamente planejado.',
    'Limite acompanhantes para manter o ambiente de foco e esterilização.',
    'Use roupas confortáveis que permitam fácil acesso à área da tatuagem.',
    'Comunique qualquer desconforto imediatamente ao seu artista.',
    'Mantenha o silêncio no ambiente do estúdio. Todos os artistas precisam de concentração, seja desenhando ou tatuando. Se vier acompanhado, lembre-se que nossa recepção tem tamanho limitado.',
  ],
  postSession: {
    hygieneTitle: 'Higiene & Hidratação',
    hygieneBody: 'Lave com sabonete neutro 2 a 3 vezes ao dia. Seque delicadamente com toalha de papel descartável. Aplique uma camada fina da pomada recomendada pelo estúdio.',
    forbiddenTitle: 'Zonas Proibidas',
    forbiddenItems: [
      'SEM sol direto por 30 dias.',
      'SEM imersão em água (piscinas, mar, banheiras).',
      'SEM coçar ou remover cascas.',
      'SEM roupas apertadas ou sintéticas na área.',
    ],
    alertText: 'Em caso de inflamação severa, contacte o estúdio imediatamente.',
  },
  cta: {
    tagline: 'Pronto para começar?',
    title1: 'Agende sua',
    title2: 'sessão',
    description: 'Nossa equipe está pronta para orientar cada passo do seu processo artístico.',
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
  nextGuest: {
    sectionTitle: string;
    sectionSubtitle: string;
    guestName: string;
    guestImage: string;
    guestDescription: string;
    instagramHandle: string;
    portfolioImages: [string, string, string, string];
  };
  showcase: {
    sectionTitle: string;
    sectionSubtitle: string;
    guestName: string;
    guestDescription: string;
    instagramHandle: string;
    heroImage: string;
    galleryImages: [string, string, string, string];
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
  nextGuest: {
    sectionTitle: 'PRÓXIMO GUEST',
    sectionSubtitle: 'Conheça o próximo artista em residência no El Dude Tattoo.',
    guestName: '',
    guestImage: '',
    guestDescription: '',
    instagramHandle: '',
    portfolioImages: ['', '', '', ''],
  },
  showcase: {
    sectionTitle: '',
    sectionSubtitle: '',
    guestName: '',
    guestDescription: '',
    instagramHandle: '',
    heroImage: '',
    galleryImages: ['', '', '', ''],
  },
};

// ── Row → App type converters (snake_case → camelCase) ──────────────────────
function toTattoo(r: TattooRow): Tattoo {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    imageUrl: r.image_url,
    style: r.style,
    price: r.price ?? '',
    depositAmount: r.deposit_amount ?? undefined,
    artistId: r.artist_id ?? null,
    status: r.status,
    createdAt: r.created_at,
  };
}
function toArtist(r: ArtistRow): Artist {
  return {
    id: r.id,
    name: r.name,
    bio: r.bio ?? '',
    photoUrl: r.photo_url,
    specialties: r.specialties ?? [],
    instagram: r.instagram ?? undefined,
    whatsapp: r.whatsapp ?? undefined,
    preferredContactMethod: r.preferred_contact_method || undefined,
    guestTrip: r.guest_trip 
      ? { 
          ...r.guest_trip, 
          galleryImages: r.guest_trip.galleryImages || ['', '', '', ''] 
        } 
      : undefined,
    createdAt: r.created_at,
    hiddenFromHero: r.hidden_from_hero ?? false,
  };
}
function toMerch(r: MerchRow): Merch {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    imageUrl: r.image_url,
    link: r.link ?? undefined,
    sizes: r.sizes ?? [],
    category: (r.category as Merch['category']) ?? undefined,
    createdAt: r.created_at,
  };
}

// ── Seed data (used as fallback when Supabase is not configured) ─────────────
const seedArtists: Artist[] = [
  { id: 'artist-1', name: 'Braian Otovicz',     bio: '', photoUrl: '/braiansite.jpeg',  specialties: [], createdAt: new Date('2025-01-01').toISOString() },
  { id: 'artist-2', name: 'Luiz Balestro',      bio: '', photoUrl: '/luiisite.jpeg',    specialties: [], createdAt: new Date('2025-01-02').toISOString() },
  { id: 'artist-3', name: 'Matheus de Oliveira',bio: '', photoUrl: '/douglastatt.jpeg', specialties: [], preferredContactMethod: 'instagram', createdAt: new Date('2025-01-03').toISOString() },
  { id: 'artist-4', name: 'Ana Biasi',           bio: '', photoUrl: 'https://picsum.photos/seed/ana-biasi/400/400', specialties: [], createdAt: new Date('2025-01-04').toISOString() },
  { id: 'artist-5', name: 'João Vitor',          bio: '', photoUrl: 'https://raw.githubusercontent.com/Gabrielwo1/tatto-view/claude/tattoo-shop-app-AunfI/public/jaummmm.jpeg', specialties: [], preferredContactMethod: 'instagram', createdAt: new Date('2025-01-05').toISOString() },
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
  { id: 'tattoo-13', title: 'Coruja Blackwork',          description: 'Coruja detalhada em blackwork com plumagem intrincada.', imageUrl: 'https://picsum.photos/seed/tattoo13/600/400', style: 'Blackwork',      price: 'R$ 850',   artistId: null, status: 'available', createdAt: new Date('2024-04-20').toISOString() },
  { id: 'tattoo-14', title: 'Koi Tradicional',           description: 'Carpa koi colorida no estilo tradicional japonês.', imageUrl: 'https://picsum.photos/seed/tattoo14/600/400', style: 'Neo-Tradicional', price: 'R$ 1.350', artistId: null, status: 'available', createdAt: new Date('2024-04-25').toISOString() },
];

// ── Shop Content ─────────────────────────────────────────────────────────────
export const defaultShopContent: ShopContent = {
  hero: {
    title: 'INK MANIFESTO.',
    subtitle: 'HIGH CONTRAST BRUTALISM FOR THE SOUL.',
  },
  sessionsTagline: 'TATTOO SESSIONS',
  sessionsAvailableLabel: 'AVAILABLE NOW',
  apparelTagline: 'APPAREL',
  paymentMethods: [
    { label: 'PIX',    sub: 'INSTANT 5% OFF' },
    { label: 'CREDIT', sub: 'UP TO 12X' },
    { label: 'CRYPTO', sub: 'BTC/ETH' },
  ],
};

// ── Store interface ──────────────────────────────────────────────────────────
interface AppState {
  tattoos: Tattoo[];
  artists: Artist[];
  merchs: Merch[];
  sessions: TattooSession[];
  addSession: (data: Omit<TattooSession, 'id'>) => void;
  updateSession: (id: string, updates: Partial<TattooSession>) => void;
  deleteSession: (id: string) => void;
  shopContent: ShopContent;
  setShopContent: (content: ShopContent) => void;
  isAdmin: boolean;
  /** True once the initial auth check (initAuth) has completed. */
  authChecked: boolean;
  /** True when the logged-in user is a merch manager (not admin or artist). */
  isMerchManager: boolean;
  /** True once Supabase data has been loaded (or if Supabase is not configured). */
  dataLoaded: boolean;
  /** Theme chosen by the studio admin. null = use subdomain default. */
  themeId: ThemeId | null;
  setTheme: (id: ThemeId | null) => void;
  /** Custom primary hex color (overrides preset primary). null = use preset. */
  customPrimary: string | null;
  /** Custom secondary hex color (overrides preset secondary). null = use preset. */
  customSecondary: string | null;
  setCustomColors: (primary: string | null, secondary: string | null) => void;
  /** How the logo is colorized. */
  logoColorMode: LogoColorMode;
  setLogoColorMode: (mode: LogoColorMode) => void;
  /** Styles hidden from the public vitrine filter. Empty = all visible. */
  hiddenStyles: string[];
  setHiddenStyles: (styles: string[]) => void;
  /** Admin-added styles (beyond the default TATTOO_STYLES list). */
  customStyles: string[];
  setCustomStyles: (styles: string[]) => void;
  /** Custom logo image URL. null = use default /logosemo-3.png */
  customLogo: string | null;
  setCustomLogo: (url: string | null) => void;
  /** Custom favicon URL. null = use default /dudeicone.png */
  customFavicon: string | null;
  setCustomFavicon: (url: string | null) => void;
  /** Events page content editable by admin */
  eventsContent: EventsContent;
  setEventsContent: (content: EventsContent) => void;
  /** Landing page content editable by admin */
  landingContent: LandingContent;
  setLandingContent: (content: LandingContent) => void;
  /** Tatuados posts — independent photo posts linked to artists */
  tatuadoPosts: TatuadoPost[];
  addTatuadoPost: (post: TatuadoPost) => void;
  updateTatuadoPost: (post: TatuadoPost) => void;
  deleteTatuadoPost: (id: string) => void;
  /** Sobre Nós page content editable by admin */
  sobreNosContent: SobreNosContent;
  setSobreNosContent: (content: SobreNosContent) => void;
  /** Guest page content editable by admin */
  guestContent: GuestContent;
  setGuestContent: (content: GuestContent) => void;
  /** Aftercare page content editable by admin */
  aftercareContent: AftercareContent;
  setAftercareContent: (content: AftercareContent) => void;
  /** Ficha de Anamnese config editable by admin */
  fichaConfig: FichaConfig;
  setFichaConfig: (config: FichaConfig) => void;
  /** Submitted ficha de anamnese forms */
  fichaSubmissions: FichaSubmission[];
  addFichaSubmission: (submission: Omit<FichaSubmission, 'id' | 'submittedAt'>) => void;
  deleteFichaSubmission: (id: string) => void;
  // ── Financeiro ──────────────────────────────────────────────────────────────
  expenses: Expense[];
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  loadData: () => Promise<void>;
  /** True when the logged-in user is an artist (not super admin). */
  isArtist: boolean;
  /** Whether the current artist user can see the Financeiro page. Always true for admins. */
  showFinanceiro: boolean;
  /** The artist row id linked to the logged-in artist user. null when admin. */
  currentArtistId: string | null;
  /** Email of the currently logged-in user. null when not logged in. */
  currentUserEmail: string | null;
  // ── Public user (customer) auth ───────────────────────────────────────
  publicUser: PublicUser | null;
  publicLogin: (email: string, password: string) => Promise<{ role: 'customer' | 'admin' | 'artist' | 'merch_manager', error: null } | { role: null, error: string }>;
  publicRegister: (email: string, password: string, name: string) => Promise<{ success: boolean, error: string | null }>;
  publicLogout: () => Promise<void>;
  // ── Wishlist ──────────────────────────────────────────────────────────
  wishlist: WishlistItem[];
  loadWishlist: () => Promise<void>;
  addToWishlist: (itemType: 'tattoo' | 'merch', itemId: string) => Promise<void>;
  removeFromWishlist: (itemType: 'tattoo' | 'merch', itemId: string) => Promise<void>;
  // ── Cart ──────────────────────────────────────────────────────────────
  cart: CartItem[];
  loadCart: () => Promise<void>;
  addToCart: (itemType: 'tattoo' | 'merch', itemId: string, selectedSize?: string) => Promise<void>;
  removeFromCart: (itemType: 'tattoo' | 'merch', itemId: string, selectedSize?: string) => Promise<void>;
  moveToCart: (itemType: 'tattoo' | 'merch', itemId: string, selectedSize?: string) => Promise<void>;
  // ── Studio ───────────────────────────────────────────────────────────
  currentStudioId: string;
  // ── Subscription ─────────────────────────────────────────────────────
  subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | null;
  trialEndsAt: string | null;
  /** Maximum number of active artists allowed by the current plan (default 1). */
  maxArtists: number;
  loadSubscription: () => Promise<void>;
  // ── Admin auth ────────────────────────────────────────────────────────
  /** Check existing Supabase session on app load. */
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addTattoo: (tattoo: Omit<Tattoo, 'id' | 'createdAt'>) => void;
  updateTattoo: (id: string, updates: Partial<Tattoo>) => void;
  deleteTattoo: (id: string) => void;
  archiveTattoo: (id: string) => void;
  reorderTattoos: (orderedIds: string[]) => void;
  reorderArtists: (orderedIds: string[]) => void;
  addArtist: (artist: Omit<Artist, 'id' | 'createdAt'>) => void;
  updateArtist: (id: string, updates: Partial<Artist>) => Promise<void>;
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
      sessions: defaultSessions,
      addSession: (data) => {
        const session: TattooSession = { ...data, id: crypto.randomUUID() };
        set((s) => {
          const sessions = [...s.sessions, session];
          supabase?.from('site_config').upsert(sc('sessions', sessions), { onConflict: 'studio_id,key' })
            .then(({ error }) => { if (error) console.error('[store] addSession:', error); });
          return { sessions };
        });
      },
      updateSession: (id, updates) => {
        set((s) => {
          const sessions = s.sessions.map((sess) => sess.id === id ? { ...sess, ...updates } : sess);
          supabase?.from('site_config').upsert(sc('sessions', sessions), { onConflict: 'studio_id,key' })
            .then(({ error }) => { if (error) console.error('[store] updateSession:', error); });
          return { sessions };
        });
      },
      deleteSession: (id) => {
        set((s) => {
          const sessions = s.sessions.filter((sess) => sess.id !== id);
          supabase?.from('site_config').upsert(sc('sessions', sessions), { onConflict: 'studio_id,key' })
            .then(({ error }) => { if (error) console.error('[store] deleteSession:', error); });
          return { sessions };
        });
      },
      shopContent: defaultShopContent,
      setShopContent: (content) => {
        set({ shopContent: content });
        supabase?.from('site_config').upsert(sc('shopContent', content), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setShopContent:', error); });
      },
      publicUser: null,
      wishlist: [],
      cart: [],
      currentStudioId: STUDIO_ID,
      subscriptionStatus: null,
      trialEndsAt: null,
      maxArtists: 1,
      isAdmin: false,
      isArtist: false,
      isMerchManager: false,
      showFinanceiro: true,
      currentArtistId: null,
      currentUserEmail: null,
      authChecked: false,
      dataLoaded: false,
      themeId: null,
      setTheme: (id) => {
        set({ themeId: id });
        supabase?.from('site_config').upsert(sc('themeId', id), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setTheme:', error); });
      },
      customPrimary: null,
      customSecondary: null,
      setCustomColors: (primary, secondary) => {
        set({ customPrimary: primary, customSecondary: secondary });
        supabase?.from('site_config').upsert(sc('customPrimary', primary), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setCustomColors primary:', error); });
        supabase?.from('site_config').upsert(sc('customSecondary', secondary), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setCustomColors secondary:', error); });
      },
      logoColorMode: 'auto',
      setLogoColorMode: (mode) => {
        set({ logoColorMode: mode });
        supabase?.from('site_config').upsert(sc('logoColorMode', mode), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setLogoColorMode:', error); });
      },
      hiddenStyles: [],
      setHiddenStyles: (styles) => {
        set({ hiddenStyles: styles });
        supabase?.from('site_config').upsert(sc('hiddenStyles', styles), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setHiddenStyles:', error); });
      },
      customStyles: [],
      setCustomStyles: (styles) => {
        set({ customStyles: styles });
        supabase?.from('site_config').upsert(sc('customStyles', styles), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setCustomStyles:', error); });
      },
      customLogo: null,
      setCustomLogo: (url) => {
        set({ customLogo: url });
        supabase?.from('site_config').upsert(sc('customLogo', url), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setCustomLogo:', error); });
      },
      customFavicon: null,
      setCustomFavicon: (url) => {
        set({ customFavicon: url });
        supabase?.from('site_config').upsert(sc('customFavicon', url), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setCustomFavicon:', error); });
      },
      eventsContent: defaultEventsContent,
      setEventsContent: (content) => {
        set({ eventsContent: content });
        supabase?.from('site_config').upsert(sc('eventsContent', content), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setEventsContent:', error); });
      },
      landingContent: defaultLandingContent,
      setLandingContent: (content) => {
        set({ landingContent: content });
        supabase?.from('site_config').upsert(sc('landingContent', content), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setLandingContent:', error); });
      },
      tatuadoPosts: [],
      addTatuadoPost: (post) => {
        set((s) => ({ tatuadoPosts: [post, ...s.tatuadoPosts] }));
        supabase?.from('tatuados').insert({
          id: post.id,
          studio_id: STUDIO_ID,
          image_url: post.imageUrl,
          caption: post.caption,
          artist_id: post.artistId,
          size: post.size,
          created_at: post.createdAt,
        }).then(({ error }) => { if (error) console.error('[store] addTatuadoPost:', error); });
      },
      updateTatuadoPost: (post) => {
        set((s) => ({ tatuadoPosts: s.tatuadoPosts.map((p) => p.id === post.id ? post : p) }));
        supabase?.from('tatuados').update({
          image_url: post.imageUrl,
          caption: post.caption,
          artist_id: post.artistId,
          size: post.size,
        }).eq('id', post.id).then(({ error }) => { if (error) console.error('[store] updateTatuadoPost:', error); });
      },
      deleteTatuadoPost: (id) => {
        set((s) => ({ tatuadoPosts: s.tatuadoPosts.filter((p) => p.id !== id) }));
        supabase?.from('tatuados').delete().eq('id', id).then(({ error }) => { if (error) console.error('[store] deleteTatuadoPost:', error); });
      },
      sobreNosContent: defaultSobreNosContent,
      setSobreNosContent: (content) => {
        set({ sobreNosContent: content });
        supabase?.from('site_config').upsert(sc('sobreNosContent', content), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setSobreNosContent:', error); });
      },
      guestContent: defaultGuestContent,
      setGuestContent: (content) => {
        set({ guestContent: content });
        supabase?.from('site_config').upsert(sc('guestContent', content), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setGuestContent:', error); });
      },
      aftercareContent: defaultAftercareContent,
      setAftercareContent: (content) => {
        set({ aftercareContent: content });
        supabase?.from('site_config').upsert(sc('aftercareContent', content), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setAftercareContent:', error); });
      },
      fichaConfig: defaultFichaConfig,
      setFichaConfig: (config) => {
        set({ fichaConfig: config });
        supabase?.from('site_config').upsert(sc('fichaConfig', config), { onConflict: 'studio_id,key' })
          .then(({ error }) => { if (error) console.error('[store] setFichaConfig:', error); });
      },
      fichaSubmissions: [],
      addFichaSubmission: async (data) => {
        const submission: FichaSubmission = {
          ...data,
          id: crypto.randomUUID(),
          submittedAt: new Date().toISOString(),
        };
        set((s) => ({ fichaSubmissions: [submission, ...s.fichaSubmissions] }));
        if (supabase) {
          const { error } = await supabase.from('fichas').insert({
            id: submission.id,
            studio_id: STUDIO_ID,
            submitted_at: submission.submittedAt,
            email: submission.email,
            nome: submission.nome,
            data_nascimento: submission.dataNascimento,
            cpf: submission.cpf,
            endereco: submission.endereco,
            cidade: submission.cidade,
            cep: submission.cep,
            telefone: submission.telefone,
            tatuadores_selecionados: submission.tatuadoresSelecionados,
            outro_tatuador: submission.outroTatuador,
            local_corpo: submission.localCorpo,
            valor_acordado: submission.valorAcordado,
            conditions: submission.conditions,
            detalhes_condicoes: submission.detalhesCondicoes,
            telefone_emergencia: submission.telefoneEmergencia,
            data_assinatura: submission.dataAssinatura,
          });
          if (error) console.error('[store] addFichaSubmission:', error);
        }
      },
      deleteFichaSubmission: (id) => {
        set((s) => ({ fichaSubmissions: s.fichaSubmissions.filter((f) => f.id !== id) }));
        supabase?.from('fichas').delete().eq('id', id).then(({ error }) => { if (error) console.error('[store] deleteFichaSubmission:', error); });
      },
      expenses: [],
      addExpense: async (data) => {
        const expense: Expense = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ expenses: [expense, ...s.expenses] }));
        if (supabase) {
          const { error } = await supabase.from('expenses').insert({
            id: expense.id,
            studio_id: STUDIO_ID,
            description: expense.description,
            amount: expense.amount,
            paid_by: expense.paidBy,
            date: expense.date,
            category: expense.category,
            participants: expense.participants,
            created_at: expense.createdAt,
            receipt_url: expense.receiptUrl,
          });
          if (error) console.error('[store] addExpense:', error);
        }
      },
      updateExpense: async (id, updates) => {
        set((s) => ({ expenses: s.expenses.map((e) => e.id === id ? { ...e, ...updates } : e) }));
        if (supabase) {
          const { error } = await supabase.from('expenses').update({
            description: updates.description,
            amount: updates.amount,
            paid_by: updates.paidBy,
            date: updates.date,
            category: updates.category,
            participants: updates.participants,
            receipt_url: updates.receiptUrl,
          }).eq('id', id);
          if (error) console.error('[store] updateExpense:', error);
        }
      },
      deleteExpense: (id) => {
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
        supabase?.from('expenses').delete().eq('id', id).then(({ error }) => { if (error) console.error('[store] deleteExpense:', error); });
      },
      loadData: async () => {
        if (!supabase) {
          set({ dataLoaded: true });
          return;
        }

        try {
          // 1. Load basic tables (Scoped to studio_id)
          const [
            { data: tattooRows },
            { data: artistRows },
            { data: merchRows },
            { data: tatuadoRows },
            { data: expenseRows },
            { data: fichaRows },
            { data: configRows },
          ] = await Promise.all([
            supabase.from('tattoos').select('*').eq('studio_id', STUDIO_ID).order('created_at', { ascending: false }),
            supabase.from('artists').select('*').eq('studio_id', STUDIO_ID).order('name', { ascending: true }),
            supabase.from('merchs').select('*').eq('studio_id', STUDIO_ID).order('created_at', { ascending: false }),
            supabase.from('tatuados').select('*').eq('studio_id', STUDIO_ID).order('created_at', { ascending: false }),
            supabase.from('expenses').select('*').eq('studio_id', STUDIO_ID).order('date', { ascending: false }),
            supabase.from('fichas').select('*').eq('studio_id', STUDIO_ID).order('submitted_at', { ascending: false }),
            supabase.from('site_config').select('key, value').eq('studio_id', STUDIO_ID),
          ]);

          // Handle config mapping
          const configs: Record<string, unknown> = {};
          configRows?.forEach((c) => { configs[c.key] = c.value; });

          set({
            tattoos: tattooRows ? tattooRows.map(toTattoo) : [],
            artists: artistRows ? artistRows.map(toArtist) : [],
            merchs: merchRows ? merchRows.map(toMerch) : [],
            tatuadoPosts: tatuadoRows 
              ? tatuadoRows.map((r) => ({
                id: r.id,
                imageUrl: r.image_url,
                caption: r.caption,
                artistId: r.artist_id,
                size: r.size,
                createdAt: r.created_at,
              }))
              : [],
            expenses: expenseRows 
              ? expenseRows.map((r) => ({
                id: r.id,
                description: r.description,
                amount: r.amount,
                paidBy: r.paid_by,
                date: r.date,
                category: r.category,
                participants: r.participants,
                createdAt: r.created_at,
                receiptUrl: r.receipt_url,
              }))
              : [],
            fichaSubmissions: fichaRows 
              ? fichaRows.map((r) => ({
                id: r.id,
                submittedAt: r.submitted_at,
                email: r.email,
                nome: r.nome,
                dataNascimento: r.data_nascimento,
                cpf: r.cpf,
                endereco: r.endereco,
                cidade: r.cidade,
                cep: r.cep,
                telefone: r.telefone,
                tatuadoresSelecionados: r.tatuadores_selecionados,
                outroTatuador: r.outro_tatuador,
                localCorpo: r.local_corpo,
                valorAcordado: r.valor_acordado,
                conditions: r.conditions,
                detalhesCondicoes: r.detalhes_condicoes,
                telefoneEmergencia: r.telefone_emergencia,
                dataAssinatura: r.data_assinatura,
              }))
              : [],
            // Scoped config overrides
            sessions: (configs.sessions as TattooSession[]) || defaultSessions,
            shopContent: (configs.shopContent as ShopContent) || defaultShopContent,
            eventsContent: (configs.eventsContent as EventsContent) || defaultEventsContent,
            landingContent: (configs.landingContent as LandingContent) || defaultLandingContent,
            sobreNosContent: (configs.sobreNosContent as SobreNosContent) || defaultSobreNosContent,
            guestContent: (configs.guestContent as GuestContent) || defaultGuestContent,
            aftercareContent: (configs.aftercareContent as AftercareContent) || defaultAftercareContent,
            fichaConfig: (configs.fichaConfig as FichaConfig) || defaultFichaConfig,
            themeId: (configs.themeId as ThemeId) || null,
            customPrimary: (configs.customPrimary as string) || null,
            customSecondary: (configs.customSecondary as string) || null,
            logoColorMode: (configs.logoColorMode as LogoColorMode) || 'auto',
            hiddenStyles: (configs.hiddenStyles as string[]) || [],
            customStyles: (configs.customStyles as string[]) || [],
            customLogo: (configs.customLogo as string) || null,
            customFavicon: (configs.customFavicon as string) || null,
            dataLoaded: true,
          });
        } catch (err) {
          console.error('[store] loadData error:', err);
          set({ dataLoaded: true });
        }
      },
      initAuth: async () => {
        if (!supabase) {
          set({ authChecked: true });
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: profile } = await supabase.from('user_profiles').select('role, artist_id, max_artists').eq('id', session.user.id).single();
          if (profile) {
            set({
              isAdmin: profile.role === 'admin' || profile.role === 'super_admin',
              isArtist: profile.role === 'artist',
              isMerchManager: profile.role === 'merch_manager',
              currentArtistId: profile.artist_id,
              currentUserEmail: session.user.email,
              showFinanceiro: profile.role !== 'artist' || true, // TODO: custom permission
              maxArtists: profile.max_artists ?? 1,
            });
          }
        }
        set({ authChecked: true });
      },
      login: async (email, password) => {
        if (!supabase) return false;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) return false;
        
        const { data: profile } = await supabase.from('user_profiles').select('role, artist_id, max_artists').eq('id', data.user.id).single();
        if (profile) {
          set({
            isAdmin: profile.role === 'admin' || profile.role === 'super_admin',
            isArtist: profile.role === 'artist',
            isMerchManager: profile.role === 'merch_manager',
            currentArtistId: profile.artist_id,
            currentUserEmail: data.user.email,
            maxArtists: profile.max_artists ?? 1,
          });
          return true;
        }
        return false;
      },
      logout: async () => {
        supabase?.auth.signOut();
        set({ isAdmin: false, isArtist: false, isMerchManager: false, currentArtistId: null, currentUserEmail: null });
      },
      addTattoo: async (data) => {
        const tattoo: Tattoo = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ tattoos: [tattoo, ...s.tattoos] }));
        if (supabase) {
          const { error } = await supabase.from('tattoos').insert({
            id: tattoo.id,
            studio_id: STUDIO_ID,
            title: tattoo.title,
            description: tattoo.description,
            image_url: tattoo.imageUrl,
            style: tattoo.style,
            price: tattoo.price,
            deposit_amount: tattoo.depositAmount,
            artist_id: tattoo.artistId,
            status: tattoo.status,
            created_at: tattoo.createdAt,
          });
          if (error) console.error('[store] addTattoo:', error);
        }
      },
      updateTattoo: async (id, updates) => {
        set((s) => ({ tattoos: s.tattoos.map((t) => t.id === id ? { ...t, ...updates } : t) }));
        if (supabase) {
          const { error } = await supabase.from('tattoos').update({
            title: updates.title,
            description: updates.description,
            image_url: updates.imageUrl,
            style: updates.style,
            price: updates.price,
            deposit_amount: updates.depositAmount,
            artist_id: updates.artistId,
            status: updates.status,
          }).eq('id', id);
          if (error) console.error('[store] updateTattoo:', error);
        }
      },
      deleteTattoo: (id) => {
        set((s) => ({ tattoos: s.tattoos.filter((t) => t.id !== id) }));
        supabase?.from('tattoos').delete().eq('id', id).then(({ error }) => { if (error) console.error('[store] deleteTattoo:', error); });
      },
      archiveTattoo: (id) => {
        set((s) => ({ tattoos: s.tattoos.map((t) => t.id === id ? { ...t, status: 'archived' } : t) }));
        supabase?.from('tattoos').update({ status: 'archived' }).eq('id', id).then(({ error }) => { if (error) console.error('[store] archiveTattoo:', error); });
      },
      reorderTattoos: (orderedIds) => {
        // Local update
        const tempMap = new Map();
        get().tattoos.forEach(t => tempMap.set(t.id, t));
        const newArray = orderedIds.map(id => tempMap.get(id)).filter(Boolean);
        set({ tattoos: newArray });
        // NOTE: In a real DB we'd need a 'position' column to persist order correctly.
      },
      reorderArtists: (orderedIds) => {
        const tempMap = new Map();
        get().artists.forEach(a => tempMap.set(a.id, a));
        const newArray = orderedIds.map(id => tempMap.get(id)).filter(Boolean);
        set({ artists: newArray });
      },
      addArtist: async (data) => {
        const artist: Artist = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ artists: [...s.artists, artist] }));
        if (supabase) {
          const { error } = await supabase.from('artists').insert({
            id: artist.id,
            studio_id: STUDIO_ID,
            name: artist.name,
            bio: artist.bio,
            photo_url: artist.photoUrl,
            specialties: artist.specialties,
            instagram: artist.instagram,
            whatsapp: artist.whatsapp,
            preferred_contact_method: artist.preferredContactMethod,
            guest_trip: artist.guestTrip,
            created_at: artist.createdAt,
            hidden_from_hero: artist.hiddenFromHero,
          });
          if (error) console.error('[store] addArtist:', error);
        }
      },
      updateArtist: async (id, updates) => {
        set((s) => ({ artists: s.artists.map((a) => a.id === id ? { ...a, ...updates } : a) }));
        if (supabase) {
          const { error } = await supabase.from('artists').update({
            name: updates.name,
            bio: updates.bio,
            photo_url: updates.photoUrl,
            specialties: updates.specialties,
            instagram: updates.instagram,
            whatsapp: updates.whatsapp,
            preferred_contact_method: updates.preferredContactMethod,
            guest_trip: updates.guestTrip,
            hidden_from_hero: updates.hiddenFromHero,
          }).eq('id', id);
          if (error) console.error('[store] updateArtist:', error);
        }
      },
      deleteArtist: (id) => {
        set((s) => ({ artists: s.artists.filter((a) => a.id !== id) }));
        supabase?.from('artists').delete().eq('id', id).then(({ error }) => { if (error) console.error('[store] deleteArtist:', error); });
      },
      addMerch: async (data) => {
        const merch: Merch = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ merchs: [merch, ...s.merchs] }));
        if (supabase) {
          const { error } = await supabase.from('merchs').insert({
            id: merch.id,
            studio_id: STUDIO_ID,
            name: merch.name,
            description: merch.description,
            price: merch.price,
            image_url: merch.imageUrl,
            link: merch.link,
            sizes: merch.sizes,
            category: merch.category,
            created_at: merch.createdAt,
          });
          if (error) console.error('[store] addMerch:', error);
        }
      },
      updateMerch: async (id, updates) => {
        set((s) => ({ merchs: s.merchs.map((m) => m.id === id ? { ...m, ...updates } : m) }));
        if (supabase) {
          const { error } = await supabase.from('merchs').update({
            name: updates.name,
            description: updates.description,
            price: updates.price,
            image_url: updates.imageUrl,
            link: updates.link,
            sizes: updates.sizes,
            category: updates.category,
          }).eq('id', id);
          if (error) console.error('[store] updateMerch:', error);
        }
      },
      deleteMerch: (id) => {
        set((s) => ({ merchs: s.merchs.filter((m) => m.id !== id) }));
        supabase?.from('merchs').delete().eq('id', id).then(({ error }) => { if (error) console.error('[store] deleteMerch:', error); });
      },
      publicUser: null,
      publicLogin: async (email, password) => {
        if (!supabase) return { role: null, error: 'Database connection failed' };
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) return { role: null, error: error?.message || 'Login failed' };
        
        const { data: profile } = await supabase.from('user_profiles').select('role, name').eq('id', data.user.id).single();
        if (profile) {
          set({ publicUser: { id: data.user.id, email: data.user.email!, name: profile.name } });
          return { role: profile.role, error: null };
        }
        return { role: null, error: 'Profile not found' };
      },
      publicRegister: async (email, password, name) => {
        if (!supabase) return { success: false, error: 'Database connection failed' };
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { name } }
        });
        if (error || !data.user) return { success: false, error: error?.message || 'Registration failed' };
        
        // Wait for profile trigger or create manually if needed
        return { success: true, error: null };
      },
      publicLogout: async () => {
        await supabase?.auth.signOut();
        set({ publicUser: null, wishlist: [], cart: [] });
      },
      loadWishlist: async () => {
        const { publicUser } = get();
        if (!supabase || !publicUser) return;
        const { data } = await supabase.from('wishlist').select('id, item_type, item_id').eq('user_id', publicUser.id);
        if (data) set({ wishlist: data.map(r => ({ id: r.id, itemType: r.item_type, itemId: r.item_id })) });
      },
      addToWishlist: async (itemType, itemId) => {
        const { publicUser } = get();
        if (!supabase || !publicUser) return;
        set((s) => ({ wishlist: [...s.wishlist, { id: crypto.randomUUID(), itemType, itemId }] }));
        await supabase.from('wishlist').insert({ user_id: publicUser.id, item_type: itemType, item_id: itemId });
      },
      removeFromWishlist: async (itemType, itemId) => {
        const { publicUser } = get();
        if (!supabase || !publicUser) return;
        set((s) => ({ wishlist: s.wishlist.filter(w => !(w.itemType === itemType && w.itemId === itemId)) }));
        await supabase.from('wishlist').delete().eq('user_id', publicUser.id).eq('item_type', itemType).eq('item_id', itemId);
      },
      loadCart: async () => {
        const { publicUser } = get();
        if (!supabase || !publicUser) return;
        const { data } = await supabase.from('cart_items').select('id, item_type, item_id, selected_size').eq('user_id', publicUser.id);
        if (data) set({ cart: data.map(r => ({ id: r.id, itemType: r.item_type, itemId: r.item_id, selectedSize: r.selected_size })) });
      },
      addToCart: async (itemType, itemId, selectedSize) => {
        const { publicUser } = get();
        if (!supabase || !publicUser) return;
        set((s) => ({ cart: [...s.cart.filter((c) => !(c.itemType === itemType && c.itemId === itemId && c.selectedSize === selectedSize)), { id: crypto.randomUUID(), itemType, itemId, selectedSize }] }));
        await supabase.from('cart_items').upsert({ user_id: publicUser.id, item_type: itemType, item_id: itemId, selected_size: selectedSize || null });
      },

      removeFromCart: async (itemType, itemId, selectedSize) => {
        const { publicUser } = get();
        if (!supabase || !publicUser) return;
        set((s) => ({ cart: s.cart.filter((c) => !(c.itemType === itemType && c.itemId === itemId && c.selectedSize === selectedSize)) }));
        let query = supabase.from('cart_items').delete().eq('user_id', publicUser.id).eq('item_type', itemType).eq('item_id', itemId);
        if (selectedSize) {
          query = query.eq('selected_size', selectedSize);
        } else {
          query = query.is('selected_size', null);
        }
        await query;
      },

      moveToCart: async (itemType, itemId, selectedSize) => {
        const { removeFromWishlist, addToCart } = get();
        await removeFromWishlist(itemType, itemId);
        await addToCart(itemType, itemId, selectedSize);
      },
      loadSubscription: async () => {
        if (!supabase) return;
        const { data } = await supabase.from('subscriptions').select('status, trial_ends_at').eq('studio_id', STUDIO_ID).single();
        if (data) set({ subscriptionStatus: data.status, trialEndsAt: data.trial_ends_at });
        // Fetch max_artists from user_profiles (requires an active session)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('max_artists')
            .eq('id', session.user.id)
            .single();
          if (profile?.max_artists != null) set({ maxArtists: profile.max_artists });
        }
      },
    }),
    {
      name: `tatto-view-state-${STUDIO_ID}`,
      partialize: (s) => ({
        // themeId: s.themeId, // We persist this via Supabase now
      }),
    }
  )
);
