import { Link } from 'react-router-dom';

/* ─── small helpers ──────────────────────────────────────────────────────── */

function SectionNumber({ n }: { n: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-0.5 h-8 bg-white/20" />
      <div className="flex items-baseline gap-3">
        <span
          className="font-display text-2xl leading-none"
          style={{ color: 'rgb(var(--ink-500))' }}
        >
          {n}
        </span>
        <span className="font-body text-xs font-semibold tracking-[0.3em] uppercase text-white/50">
          {n === '01'
            ? 'Pré-Sessão'
            : n === '02'
            ? 'Dia da Sessão'
            : 'Pós-Sessão'}
        </span>
      </div>
    </div>
  );
}

function CardIcon({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-8 h-8 mb-4 flex items-center justify-center"
      style={{ color: 'rgb(var(--ink-400))' }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-white/8 my-16 md:my-24" />;
}

/* ─── icons ──────────────────────────────────────────────────────────────── */

const IconNoDrink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6l1 7H8L9 3z" />
  </svg>
);

const IconDrop = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c0 0-6.75 7.5-6.75 12a6.75 6.75 0 0013.5 0C18.75 9.75 12 2.25 12 2.25z" />
  </svg>
);

const IconScissors = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 4l8 16M16 4L8 20M4.5 8.25a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0zm10.5 7.5a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0z" />
  </svg>
);

const IconRest = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const IconHand = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15" />
  </svg>
);

const IconNoSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
  </svg>
);

const IconNoWater = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c0 0-6.75 7.5-6.75 12a6.75 6.75 0 0013.5 0C18.75 9.75 12 2.25 12 2.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
  </svg>
);

const IconNoScratch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
  </svg>
);

const IconNoTight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
  </svg>
);

/* ─── main page ──────────────────────────────────────────────────────────── */

export default function AftercareePage() {
  return (
    <div className="bg-zinc-900 min-h-screen text-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">

        {/* ── HERO ───────────────────────────────────────────────────── */}
        <div className="pt-16 md:pt-24 pb-16 md:pb-20 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-body text-[10px] font-semibold tracking-[0.4em] uppercase text-white/30 mb-6">
              Guia de Cuidados
            </p>
            <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tight leading-none">
              Pós<br />
              <span style={{ color: 'rgb(var(--ink-500))' }}>Tat</span>too
            </h1>
          </div>
          <div>
            <div className="w-8 h-px bg-white/20 mb-6" />
            <p className="font-body text-base text-white/50 leading-relaxed">
              A arte na pele é um investimento vitalício. Este guia detalha o protocolo
              necessário para garantir uma cura perfeita e a longevidade da sua nova tatuagem.
              Siga cada etapa para preservar a qualidade do trabalho.
            </p>
          </div>
        </div>

        {/* thin rule */}
        <div className="border-t border-white/10" />

        {/* ── 01 PRÉ-SESSÃO ──────────────────────────────────────────── */}
        <div className="pt-16 md:pt-20">
          <SectionNumber n="01" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/8">
            {[
              {
                icon: <IconNoDrink />,
                title: 'Evite Álcool',
                body: 'Não consuma bebidas alcoólicas 24 horas antes. O álcool afina o sangue, prejudicando a pigmentação.',
              },
              {
                icon: <IconDrop />,
                title: 'Hidratação',
                body: 'Beba muita água e hidrate a área com loção neutra nos dias que antecedem a sessão para uma pele mais receptiva.',
              },
              {
                icon: <IconScissors />,
                title: 'Preparação',
                body: 'Certifique-se de que a área esteja limpa e livre de irritações ou queimaduras solares. Evite depilação agressiva.',
              },
              {
                icon: <IconRest />,
                title: 'Descanso & Nutrição',
                body: 'Tenha uma noite de sono completa e faça uma refeição reforçada antes da sua sessão de tatuagem.',
              },
            ].map((card) => (
              <div key={card.title} className="bg-black p-6 md:p-8">
                <CardIcon>{card.icon}</CardIcon>
                <p className="font-body text-xs font-semibold tracking-widest uppercase text-white mb-3">
                  {card.title}
                </p>
                <p className="font-body text-xs text-white/40 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── 02 + 03 ────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">

          {/* 02 DIA DA SESSÃO */}
          <div>
            <SectionNumber n="02" />
            <div className="border border-white/10 p-7 md:p-8">
              <p className="font-body text-xs font-semibold tracking-[0.3em] uppercase text-white mb-1">
                Etiqueta do Estúdio
              </p>
              <div className="w-8 h-px bg-white/20 mb-6" />
              <ol className="space-y-4">
                {[
                  'Chegue pontualmente. O tempo do artista é rigorosamente planejado.',
                  'Limite acompanhantes para manter o ambiente de foco e esterilização.',
                  'Use roupas confortáveis que permitam fácil acesso à área da tatuagem.',
                  'Comunique qualquer desconforto imediatamente ao seu artista.',
                  'Mantenha o silêncio no ambiente do estúdio. Todos os artistas precisam de concentração, seja desenhando ou tatuando. Se vier acompanhado, lembre-se que nossa recepção tem tamanho limitado.',
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span
                      className="font-display text-xs shrink-0 mt-0.5"
                      style={{ color: 'rgb(var(--ink-500))' }}
                    >
                      {['I.', 'II.', 'III.', 'IV.', 'V.'][i]}
                    </span>
                    <p className="font-body text-xs text-white/50 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* 03 PÓS-SESSÃO */}
          <div>
            <SectionNumber n="03" />
            <div className="space-y-px">

              {/* Higiene */}
              <div className="border border-white/10 p-7 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <p className="font-body text-xs font-semibold tracking-[0.3em] uppercase text-white leading-snug">
                    Higiene &<br />Hidratação
                  </p>
                  <CardIcon><IconHand /></CardIcon>
                </div>
                <p className="font-body text-xs text-white/50 leading-relaxed">
                  Lave com sabonete neutro 2 a 3 vezes ao dia. Seque delicadamente com
                  toalha de papel descartável. Aplique uma camada fina da pomada
                  recomendada pelo estúdio.
                </p>
              </div>

              {/* Zonas proibidas */}
              <div className="border border-white/10 p-7 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <p className="font-body text-xs font-semibold tracking-[0.3em] uppercase text-white">
                    Zonas Proibidas
                  </p>
                  <div className="text-red-500/70">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" d="M6 18L18 6" />
                    </svg>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {[
                    { icon: <IconNoSun />, text: 'SEM sol direto por 30 dias.' },
                    { icon: <IconNoWater />, text: 'SEM imersão em água (piscinas, mar, banheiras).' },
                    { icon: <IconNoScratch />, text: 'SEM coçar ou remover cascas.' },
                    { icon: <IconNoTight />, text: 'SEM roupas apertadas ou sintéticas na área.' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="shrink-0 mt-0.5 text-red-500/60">{item.icon}</span>
                      <span className="font-body text-xs text-white/50 leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Alerta */}
              <div
                className="border p-5 flex items-start gap-3"
                style={{ borderColor: 'rgb(var(--ink-700))', backgroundColor: 'rgb(var(--ink-950) / 0.3)' }}
              >
                <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'rgb(var(--ink-400))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p
                  className="font-body text-[10px] font-semibold tracking-widest uppercase leading-relaxed"
                  style={{ color: 'rgb(var(--ink-400))' }}
                >
                  Em caso de inflamação severa, contacte o estúdio imediatamente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA FINAL ──────────────────────────────────────────────── */}
        <div className="mt-24 md:mt-32 pb-20 md:pb-28 text-center">
          <div className="border-t border-white/10 pt-16 md:pt-20">
            <p className="font-body text-[10px] font-semibold tracking-[0.4em] uppercase text-white/30 mb-6">
              Pronto para começar?
            </p>
            <h2 className="font-display text-5xl md:text-7xl uppercase tracking-tight text-white mb-6">
              Agende sua<br />
              <span style={{ color: 'rgb(var(--ink-500))' }}>sessão</span>
            </h2>
            <p className="font-body text-sm text-white/40 max-w-sm mx-auto mb-10 leading-relaxed">
              Nossa equipe está pronta para orientar cada passo do seu processo artístico.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/artistas"
                className="font-body text-xs font-semibold tracking-widest uppercase px-8 py-4 bg-white text-black hover:bg-white/90 transition-colors"
              >
                Ver Artistas
              </Link>
              <Link
                to="/"
                className="font-body text-xs font-semibold tracking-widest uppercase px-8 py-4 border border-white/20 text-white hover:border-white hover:bg-white/5 transition-colors"
              >
                Portfólio
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
