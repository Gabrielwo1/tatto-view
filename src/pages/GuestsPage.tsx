import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─── scroll visibility hook ─────────────────────────────────────────────── */
function useVisible(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Fade({ children, delay = 0, className = '' }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useVisible();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── main page ──────────────────────────────────────────────────────────── */
export default function GuestsPage() {
  return (
    <div className="bg-black text-white overflow-x-hidden">

      {/* ── 01 HERO ────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-10 pt-16 md:pt-24 pb-16 md:pb-20">
        <p className="font-body text-[10px] font-semibold tracking-[0.4em] uppercase text-white/30 mb-8">
          Oportunidades — Artistas
        </p>
        <h1 className="font-display text-[clamp(3rem,12vw,9rem)] uppercase leading-none tracking-tight text-white mb-8">
          Tatue<br />
          <span style={{ color: 'rgb(var(--ink-500))' }}>com</span><br />
          a gente
        </h1>
        <div className="max-w-md">
          <div className="w-8 h-px bg-white/20 mb-6" />
          <p className="font-body text-sm text-white/50 leading-relaxed">
            Artistas tatuadores que querem crescer, colaborar e deixar sua marca
            num coletivo comprometido com excelência artística.
          </p>
        </div>
      </section>

      {/* ── 02 INTRO SPLIT ─────────────────────────────────────────────────── */}
      <section className="grid md:grid-cols-2 min-h-[50vh]">
        {/* Image */}
        <div className="relative overflow-hidden bg-zinc-900 min-h-[320px] md:min-h-0">
          <img
            src="/braiansite.jpeg"
            alt="Estúdio El Dude"
            className="w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.6) contrast(1.1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
        </div>

        {/* Text */}
        <div className="bg-zinc-950 border-l border-white/8 flex flex-col justify-center px-8 md:px-12 py-14">
          <Fade>
            <p className="font-body text-sm text-white/50 leading-relaxed mb-8 max-w-sm">
              Tatue por temporada em nosso estúdio e integre nosso coletivo
              artístico. Troque experiências, amplie seu networking e abra novas
              oportunidades no mercado da tatuagem.
            </p>
            <div className="w-8 h-px bg-white/15 mb-8" />
            <div className="flex items-center gap-2 text-white/30">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="font-body text-[10px] font-semibold tracking-[0.3em] uppercase">
                São Paulo, Brasil
              </span>
            </div>
          </Fade>
        </div>
      </section>

      {/* ── 03 ESTRUTURA & COMISSÃO ─────────────────────────────────────────── */}
      <section className="px-6 lg:px-10 py-20 md:py-28">
        <Fade>
          <p className="font-body text-[10px] font-semibold tracking-[0.4em] uppercase text-white/30 mb-12">
            Transparência — Condições
          </p>
        </Fade>

        <div className="grid md:grid-cols-5 gap-px bg-white/8">
          {/* Main: comissão */}
          <div className="md:col-span-3 bg-zinc-950 p-8 md:p-10">
            <Fade>
              <p className="font-body text-xs font-semibold tracking-widest uppercase text-white/40 mb-6">
                Estrutura de Comissão Transparente
              </p>
              <div className="flex items-end gap-3 mb-2">
                <span
                  className="font-display leading-none"
                  style={{ fontSize: 'clamp(4rem, 14vw, 8rem)', color: 'rgb(var(--ink-500))' }}
                >
                  30%
                </span>
                <span className="font-body text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 mb-4">
                  Split do estúdio
                </span>
              </div>
              <div className="w-8 h-px bg-white/15 my-6" />
              <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-4">
                Incluso
              </p>
              <ul className="space-y-2.5">
                {[
                  'Ficha de anamnese digital',
                  'Esterilização e insumos básicos',
                  'Divulgação no perfil do estúdio',
                  'Apoio no agendamento',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{ backgroundColor: 'rgb(var(--ink-500))' }}
                    />
                    <span className="font-body text-xs text-white/50">{item}</span>
                  </li>
                ))}
              </ul>
            </Fade>
          </div>

          {/* Secondary: estúdio estruturado */}
          <div className="md:col-span-2 bg-black p-8 md:p-10 flex flex-col justify-between">
            <Fade delay={100}>
              <div
                className="w-8 h-8 mb-6 flex items-center justify-center"
                style={{ color: 'rgb(var(--ink-400))' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <div>
                <p className="font-body text-xs font-semibold tracking-widest uppercase text-white mb-4">
                  Estúdio Estruturado
                </p>
                <p className="font-body text-xs text-white/40 leading-relaxed">
                  Espaço personalizado com recepção, banheiros, impressoras térmicas e
                  ambiente totalmente climatizado para seu conforto e precisão.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/8 space-y-3">
                {[
                  { icon: '◈', text: 'Wi-Fi de alta velocidade' },
                  { icon: '◉', text: 'Estação individual equipada' },
                  { icon: '◆', text: 'Iluminação profissional' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-[10px]" style={{ color: 'rgb(var(--ink-500))' }}>{item.icon}</span>
                    <span className="font-body text-[11px] text-white/40">{item.text}</span>
                  </div>
                ))}
              </div>
            </Fade>
          </div>
        </div>
      </section>

      {/* ── 04 O AMBIENTE ──────────────────────────────────────────────────── */}
      <section className="grid md:grid-cols-2 gap-px bg-white/8 min-h-[480px]">
        {/* Text */}
        <div className="bg-black px-8 md:px-12 py-14 flex flex-col justify-center">
          <Fade>
            <p className="font-body text-[10px] font-semibold tracking-[0.4em] uppercase text-white/30 mb-6">
              Ambiente — Excelência
            </p>
            <h2 className="font-display text-3xl md:text-5xl uppercase tracking-tight text-white leading-none mb-8">
              O ambiente<br />
              <span style={{ color: 'rgb(var(--ink-500))' }}>define</span><br />
              a arte
            </h2>
            <p className="font-body text-sm text-white/50 leading-relaxed mb-4 max-w-sm">
              Acreditamos que o espaço onde você trabalha reflete diretamente na
              qualidade do que você produz. Nosso estúdio é curado para eliminar
              distrações e maximizar a concentração.
            </p>
            <p className="font-body text-sm text-white/40 leading-relaxed max-w-sm">
              Cada artista guest tem uma estação dedicada com a tecnologia
              necessária para entregar o melhor trabalho da sua carreira.
            </p>
          </Fade>
        </div>

        {/* Images split */}
        <div className="grid grid-rows-2 min-h-[400px] md:min-h-0">
          <div className="relative overflow-hidden bg-zinc-900">
            <img
              src="/douglastatt.jpeg"
              alt="Artista trabalhando"
              className="w-full h-full object-cover object-center"
              style={{ filter: 'brightness(0.55) contrast(1.15)' }}
            />
          </div>
          <div className="relative overflow-hidden bg-zinc-900">
            <img
              src="/luiisite.jpeg"
              alt="Equipamentos do estúdio"
              className="w-full h-full object-cover object-center"
              style={{ filter: 'brightness(0.5) contrast(1.2) saturate(0)' }}
            />
          </div>
        </div>
      </section>

      {/* ── 05 QUEM BUSCAMOS ──────────────────────────────────────────────── */}
      <section className="px-6 lg:px-10 py-20 md:py-28">
        <Fade>
          <p className="font-body text-[10px] font-semibold tracking-[0.4em] uppercase text-white/30 mb-10">
            Perfil — Quem buscamos
          </p>
        </Fade>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8">
          {[
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
          ].map((item) => (
            <Fade key={item.n}>
              <div className="bg-zinc-950 p-7 md:p-8 h-full">
                <span
                  className="font-display text-4xl leading-none block mb-5"
                  style={{ color: 'rgb(var(--ink-800))' }}
                >
                  {item.n}
                </span>
                <p className="font-body text-xs font-semibold tracking-widest uppercase text-white mb-3">
                  {item.title}
                </p>
                <p className="font-body text-xs text-white/40 leading-relaxed">{item.body}</p>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ── 06 CTA ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10">
        <div className="px-6 lg:px-10 py-20 md:py-28 text-center">
          <Fade>
            <p className="font-body text-[10px] font-semibold tracking-[0.4em] uppercase text-white/30 mb-8">
              Pronto para evoluir?
            </p>
            <h2 className="font-display text-[clamp(2.5rem,8vw,6rem)] uppercase leading-none tracking-tight text-white mb-10">
              Submeta seu<br />portfólio
            </h2>
          </Fade>

          <Fade delay={100}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              {/* Primary CTA */}
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white hover:bg-white/90 text-black font-body font-bold text-xs tracking-widest uppercase px-10 py-4 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>

              {/* Email */}
              <a
                href="mailto:contato@eldude.com"
                className="flex items-center gap-2 border border-white/20 hover:border-white text-white font-body font-bold text-xs tracking-widest uppercase px-10 py-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                E-mail Estúdio
              </a>

              {/* Portfolio link */}
              <Link
                to="/artistas"
                className="flex items-center gap-2 border border-white/10 hover:border-white/30 text-white/50 hover:text-white font-body font-bold text-xs tracking-widest uppercase px-8 py-4 transition-colors"
              >
                Ver artistas
              </Link>
            </div>
          </Fade>

          <Fade delay={200}>
            <p className="font-body text-[10px] text-white/20 leading-relaxed max-w-sm mx-auto">
              Certifique-se de que seu portfólio inclua pelo menos 10 exemplos de trabalhos concluídos.
              Respondemos a todos os candidatos aprovados em até 48 horas.
            </p>
          </Fade>
        </div>
      </section>

    </div>
  );
}
