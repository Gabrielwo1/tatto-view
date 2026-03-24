import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tattoo, Artist, Merch } from './types';
import type { ThemeId, LogoColorMode } from './lib/themes';
import { supabase } from './lib/supabase';

// ── Landing Page Content ──────────────────────────────────────────────────────
export interface LandingContent {
  hero: { tagline: string; description: string };
  manifesto: { title1: string; title2: string; body1: string; body2: string };
  processo: Array<{ n: string; title: string; desc: string }>;
  precos: Array<{ label: string; range: string; detail: string }>;
  faq: Array<{ q: string; a: string }>;
  cta: { tagline: string; title1: string; title2: string; description: string };
}

const defaultLandingContent: LandingContent = {
  hero: {
    tagline: 'Sua história\nna pele',
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
    galleryImages: [string, string, string, string];
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
    galleryImages: ['', '', '', ''],
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

// ── Ficha de Anamnese Config ──────────────────────────────────────────────────
export interface FichaConfig {
  tatuadores: string[];
  conditions: string[];
}

// ── Ficha de Anamnese Submission ──────────────────────────────────────────────
export interface FichaSubmission {
  id: string;
  submittedAt: string;
  // Identificação
  email: string;
  nome: string;
  dataNascimento: string;
  cpf: string;
  endereco: string;
  cidade: string;
  cep: string;
  telefone: string;
  // Procedimento
  tatuadoresSelecionados: string[];
  outroTatuador: string;
  localCorpo: string;
  valorAcordado: string;
  // Histórico clínico
  conditions: Record<string, 'sim' | 'nao' | null>;
  detalhesCondicoes: string;
  telefoneEmergencia: string;
  // Assinatura
  dataAssinatura: string;
}

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
  /** Custom primary hex color (overrides preset primary). null = use preset. */
  customPrimary: string | null;
  /** Custom secondary hex color (overrides preset secondary). null = use preset. */
  customSecondary: string | null;
  setCustomColors: (primary: string | null, secondary: string | null) => void;
  /** How the logo is colorized. */
  logoColorMode: LogoColorMode;
  setLogoColorMode: (mode: LogoColorMode) => void;
  /** Styles hidden from the public vitrine filter. */
  hiddenStyles: string[];
  setHiddenStyles: (styles: string[]) => void;
  /** Custom logo image URL. null = use default /logosemo-3.png */
  customLogo: string | null;
  setCustomLogo: (url: string | null) => void;
  /** Events page content editable by admin */
  eventsContent: EventsContent;
  setEventsContent: (content: EventsContent) => void;
  /** Landing page content editable by admin */
  landingContent: LandingContent;
  setLandingContent: (content: LandingContent) => void;
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
      setTheme: (id) => {
        set({ themeId: id });
        supabase?.from('site_config').upsert({ key: 'themeId', value: id, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[store] setTheme:', error); });
      },
      customPrimary: null,
      customSecondary: null,
      setCustomColors: (primary, secondary) => {
        set({ customPrimary: primary, customSecondary: secondary });
        supabase?.from('site_config').upsert({ key: 'customColors', value: { primary, secondary }, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[store] setCustomColors:', error); });
      },
      logoColorMode: 'original',
      setLogoColorMode: (mode) => {
        set({ logoColorMode: mode });
        supabase?.from('site_config').upsert({ key: 'logoColorMode', value: mode, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[store] setLogoColorMode:', error); });
      },
      hiddenStyles: [],
      setHiddenStyles: (styles) => {
        set({ hiddenStyles: styles });
        supabase?.from('site_config').upsert({ key: 'hiddenStyles', value: styles, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[store] setHiddenStyles:', error); });
      },
      customLogo: null,
      setCustomLogo: (url) => {
        set({ customLogo: url });
        supabase?.from('site_config').upsert({ key: 'customLogo', value: url, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[store] setCustomLogo:', error); });
      },
      eventsContent: defaultEventsContent,
      setEventsContent: (content) => {
        set({ eventsContent: content });
        supabase?.from('site_config').upsert({ key: 'eventsContent', value: content, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[store] setEventsContent:', error); });
      },
      landingContent: defaultLandingContent,
      setLandingContent: (content) => {
        set({ landingContent: content });
        supabase?.from('site_config').upsert({ key: 'landingContent', value: content, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[store] setLandingContent:', error); });
      },
      sobreNosContent: defaultSobreNosContent,
      setSobreNosContent: (content) => {
        set({ sobreNosContent: content });
        supabase?.from('site_config').upsert({ key: 'sobreNosContent', value: content, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[store] setSobreNosContent:', error); });
      },
      guestContent: defaultGuestContent,
      setGuestContent: (content) => {
        set({ guestContent: content });
        supabase?.from('site_config').upsert({ key: 'guestContent', value: content, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[store] setGuestContent:', error); });
      },
      aftercareContent: defaultAftercareContent,
      setAftercareContent: (content) => {
        set({ aftercareContent: content });
        supabase?.from('site_config').upsert({ key: 'aftercareContent', value: content, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[store] setAftercareContent:', error); });
      },
      fichaConfig: defaultFichaConfig,
      setFichaConfig: (config) => {
        set({ fichaConfig: config });
        supabase?.from('site_config').upsert({ key: 'fichaConfig', value: config, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[store] setFichaConfig:', error); });
      },
      fichaSubmissions: [],
      addFichaSubmission: (data) => {
        const submission: FichaSubmission = {
          ...data,
          id: crypto.randomUUID(),
          submittedAt: new Date().toISOString(),
        };
        set((s) => ({ fichaSubmissions: [submission, ...s.fichaSubmissions] }));
        supabase?.from('ficha_submissions').insert({
          id: submission.id,
          submitted_at: submission.submittedAt,
          data: submission,
        }).then(({ error }) => { if (error) console.error('[store] addFichaSubmission:', error); });
      },
      deleteFichaSubmission: (id) => {
        set((s) => ({ fichaSubmissions: s.fichaSubmissions.filter((f) => f.id !== id) }));
        supabase?.from('ficha_submissions').delete().eq('id', id)
          .then(({ error }) => { if (error) console.error('[store] deleteFichaSubmission:', error); });
      },

      // ── Load from Supabase ───────────────────────────────────────────────
      loadData: async () => {
        if (!supabase) {
          set({ dataLoaded: true });
          return;
        }
        try {
          const [{ data: t, error: te }, { data: a, error: ae }, { data: m, error: me }, { data: cfg, error: cfge }, { data: fs, error: fse }] =
            await Promise.all([
              supabase.from('tattoos').select('*').order('created_at', { ascending: false }),
              supabase.from('artists').select('*').order('created_at', { ascending: true }),
              supabase.from('merchs').select('*').order('created_at', { ascending: false }),
              supabase.from('site_config').select('*'),
              supabase.from('ficha_submissions').select('*').order('submitted_at', { ascending: false }),
            ]);
          if (te) throw te;
          if (ae) throw ae;
          if (me) throw me;
          if (fse) console.error('[store] ficha_submissions load error:', fse);
          // site_config may not exist yet — ignore error silently
          const config: Record<string, unknown> = {};
          if (!cfge && cfg) {
            for (const row of cfg) config[row.key] = row.value;
          }
          // Apply saved artists order if present
          const rawArtists = (a ?? []).map(toArtist);
          const artistsOrder = config.artistsOrder as string[] | undefined;
          const orderedArtists = artistsOrder?.length
            ? [
                ...artistsOrder.map((id) => rawArtists.find((x) => x.id === id)).filter((x): x is Artist => !!x),
                ...rawArtists.filter((x) => !artistsOrder.includes(x.id)),
              ]
            : rawArtists;

          set({
            tattoos:          (t ?? []).map(toTattoo),
            artists:          orderedArtists,
            merchs:           (m ?? []).map(toMerch),
            // Always sync fichas from Supabase (source of truth for cross-device)
            ...(!fse ? { fichaSubmissions: (fs ?? []).map((r) => r.data as FichaSubmission) } : {}),
            ...(config.eventsContent    ? { eventsContent:    config.eventsContent    as EventsContent }                  : {}),
            ...(config.landingContent   ? { landingContent:   config.landingContent   as typeof defaultLandingContent }   : {}),
            ...(config.sobreNosContent  ? { sobreNosContent:  config.sobreNosContent  as typeof defaultSobreNosContent }  : {}),
            ...(config.guestContent ? (() => {
              const stored = config.guestContent as GuestContent;
              return {
                guestContent: {
                  ...defaultGuestContent,
                  ...stored,
                  hero:        { ...defaultGuestContent.hero,        ...stored.hero },
                  commission:  { ...defaultGuestContent.commission,  ...stored.commission,
                    includedItems:  stored.commission?.includedItems  ?? defaultGuestContent.commission.includedItems,
                    studioFeatures: stored.commission?.studioFeatures ?? defaultGuestContent.commission.studioFeatures,
                  },
                  environment: { ...defaultGuestContent.environment, ...stored.environment,
                    stats: stored.environment?.stats ?? defaultGuestContent.environment.stats,
                  },
                  profiles:    { ...defaultGuestContent.profiles,    ...stored.profiles,
                    items: stored.profiles?.items ?? defaultGuestContent.profiles.items,
                  },
                  cta:         { ...defaultGuestContent.cta,         ...stored.cta },
                  nextGuest:   { ...defaultGuestContent.nextGuest,   ...stored.nextGuest,
                    portfolioImages: stored.nextGuest?.portfolioImages ?? defaultGuestContent.nextGuest.portfolioImages,
                  },
                  showcase: {
                    ...defaultGuestContent.showcase,
                    ...stored.showcase,
                    galleryImages: (stored.showcase as { galleryImages?: unknown })?.galleryImages as [string,string,string,string] ?? defaultGuestContent.showcase.galleryImages,
                  },
                } as GuestContent,
              };
            })() : {}),
            ...(config.aftercareContent ? { aftercareContent: config.aftercareContent as typeof defaultAftercareContent } : {}),
            ...(config.fichaConfig      ? { fichaConfig:      config.fichaConfig      as FichaConfig }                   : {}),
            ...(config.themeId !== undefined ? { themeId: config.themeId as ThemeId | null } : {}),
            ...(config.customColors !== undefined ? {
              customPrimary: (config.customColors as { primary: string | null }).primary ?? null,
              customSecondary: (config.customColors as { secondary: string | null }).secondary ?? null,
            } : {}),
            ...(config.logoColorMode !== undefined ? { logoColorMode: config.logoColorMode as LogoColorMode } : {}),
            ...(config.customLogo !== undefined ? { customLogo: config.customLogo as string | null } : {}),
            ...(config.hiddenStyles !== undefined ? { hiddenStyles: config.hiddenStyles as string[] } : {}),
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
        supabase?.from('site_config').upsert({ key: 'artistsOrder', value: orderedIds, updated_at: new Date().toISOString() })
          .then(({ error }) => { if (error) console.error('[store] reorderArtists:', error); });
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
      name: 'tattoo-shop-storage-v4',
      partialize: (state) => ({
        isAdmin: state.isAdmin,
        themeId: state.themeId,
        customPrimary: state.customPrimary,
        customSecondary: state.customSecondary,
        logoColorMode: state.logoColorMode,
        customLogo: state.customLogo,
        tattoos: state.tattoos,
        artists: state.artists,
        merchs: state.merchs,
        fichaSubmissions: state.fichaSubmissions,
        fichaConfig: state.fichaConfig,
        eventsContent: state.eventsContent,
        landingContent: state.landingContent,
        sobreNosContent: state.sobreNosContent,
        guestContent: state.guestContent,
        aftercareContent: state.aftercareContent,
      }),
      // Deep-merge nested content objects so new fields always get their defaults
      // even when localStorage has an older version without those fields
      merge: (persisted, current) => {
        const ps = persisted as Partial<AppState>;
        return {
          ...current,
          ...ps,
          landingContent: {
            ...current.landingContent,
            ...ps.landingContent,
            hero:      { ...current.landingContent.hero,      ...ps.landingContent?.hero },
            manifesto: { ...current.landingContent.manifesto, ...ps.landingContent?.manifesto },
            cta:       { ...current.landingContent.cta,       ...ps.landingContent?.cta },
          },
          sobreNosContent: {
            ...current.sobreNosContent,
            ...ps.sobreNosContent,
            hero:       { ...current.sobreNosContent.hero,       ...ps.sobreNosContent?.hero },
            collective: { ...current.sobreNosContent.collective, ...ps.sobreNosContent?.collective,
              galleryImages: ps.sobreNosContent?.collective?.galleryImages ?? current.sobreNosContent.collective.galleryImages,
            },
            studio:     { ...current.sobreNosContent.studio,     ...ps.sobreNosContent?.studio },
            contact:    { ...current.sobreNosContent.contact,    ...ps.sobreNosContent?.contact },
          },
          aftercareContent: {
            ...current.aftercareContent,
            ...ps.aftercareContent,
            hero:        { ...current.aftercareContent.hero,        ...ps.aftercareContent?.hero },
            postSession: { ...current.aftercareContent.postSession, ...ps.aftercareContent?.postSession },
            cta:         { ...current.aftercareContent.cta,         ...ps.aftercareContent?.cta },
          },
          eventsContent: {
            ...current.eventsContent,
            ...ps.eventsContent,
            hero: { ...current.eventsContent.hero, ...ps.eventsContent?.hero },
            events: ps.eventsContent?.events ?? current.eventsContent.events,
          },
        };
      },
    }
  )
);
