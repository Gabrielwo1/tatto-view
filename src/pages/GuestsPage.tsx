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
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
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
      <section className="px-6 lg:px-10 pt-16 md:pt-24 pb-16 md:pb-20 border-b border-white/8">
        <p className="font-body text-[10px] font-semibold tracking-[0.4em] uppercase text-white/30 mb-8">
          Oportunidades — Artistas
        </p>
        <div className="grid md:grid-cols-2 gap-12 items-end">
          <h1 className="font-display text-[clamp(3rem,10vw,7.5rem)] uppercase leading-none tracking-tight text-white">
            Tatue<br />
            <span style={{ color: 'rgb(var(--ink-500))' }}>com</span><br />
            a gente
          </h1>
          <div className="pb-1">
            <div className="w-8 h-px bg-white/20 mb-6" />
            <p className="font-body text-sm text-white/50 leading-relaxed max-w-sm">
              Artistas tatuadores que querem crescer, colaborar e deixar sua marca
              num coletivo comprometido com excelência artística. Tatue por temporada
              e integre uma rede que valoriza o seu trabalho.
            </p>
            <div className="flex items-center gap-2 text-white/25 mt-6">
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="font-body text-[10px] font-semibold tracking-[0.3em] uppercase">
                São Paulo, Brasil
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 COMISSÃO ────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-10 py-20 md:py-24 border-b border-white/8">
        <Fade>
          <p className="font-body text-[10px] font-semibold tracking-[0.4em] uppercase text-white/30 mb-12">
            Transparência — Condições
          </p>
        </Fade>

        <div className="grid md:grid-cols-5 gap-px bg-white/8">
          {/* Split comissão */}
          <div className="md:col-span-3 bg-zinc-950 p-8 md:p-10">
            <Fade>
              <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-5">
                Estrutura de comissão transparente
              </p>
              <div className="flex items-end gap-4 mb-6">
                <span
                  className="font-display leading-none"
                  style={{ fontSize: 'clamp(4rem,12vw,7rem)', color: 'rgb(var(--ink-500))' }}
                >
                  30%
                </span>
                <span className="font-body text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 mb-3">
                  Split do estúdio
                </span>
              </div>
              <div className="w-8 h-px bg-white/10 mb-6" />
              <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-4">
                Incluso
              </p>
              <ul className="space-y-3">
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

          {/* Estúdio estruturado */}
          <div className="md:col-span-2 bg-black p-8 md:p-10">
            <Fade delay={80}>
              <div className="mb-6" style={{ color: 'rgb(var(--ink-400))' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <p className="font-body text-xs font-semibold tracking-widest uppercase text-white mb-3">
                Estúdio Estruturado
              </p>
              <p className="font-body text-xs text-white/40 leading-relaxed mb-8">
                Espaço com recepção, banheiros, impressoras térmicas e ambiente
                climatizado para seu conforto e precisão.
              </p>
              <div className="border-t border-white/8 pt-6 space-y-3">
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

      {/* ── 03 O AMBIENTE ──────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-10 py-20 md:py-24 border-b border-white/8">
        <Fade>
          <p className="font-body text-[10px] font-semibold tracking-[0.4em] uppercase text-white/30 mb-12">
            Ambiente — Excelência
          </p>
        </Fade>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <Fade>
            <h2 className="font-display text-3xl md:text-5xl uppercase tracking-tight text-white leading-none mb-8">
              O ambiente<br />
              <span style={{ color: 'rgb(var(--ink-500))' }}>define</span><br />
              a arte
            </h2>
            <p className="font-body text-sm text-white/50 leading-relaxed mb-4">
              Acreditamos que o espaço onde você trabalha reflete diretamente na
              qualidade do que você produz. Nosso estúdio é curado para eliminar
              distrações e maximizar a concentração.
            </p>
            <p className="font-body text-sm text-white/35 leading-relaxed">
              Cada artista guest tem uma estação dedicada com tecnologia
              necessária para entregar o melhor trabalho da sua carreira.
            </p>
          </Fade>

          {/* Stats informativos */}
          <Fade delay={80}>
            <div className="grid grid-cols-2 gap-px bg-white/8">
              {[
                { value: '+5', label: 'Anos de estúdio' },
                { value: '100%', label: 'Agenda digital' },
                { value: '48h', label: 'Resposta garantida' },
                { value: '1:1', label: 'Estação por artista' },
              ].map((stat) => (
                <div key={stat.label} className="bg-zinc-950 p-6">
                  <span
                    className="font-display text-3xl block leading-none mb-2"
                    style={{ color: 'rgb(var(--ink-500))' }}
                  >
                    {stat.value}
                  </span>
                  <span className="font-body text-[10px] font-semibold tracking-widest uppercase text-white/30">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ── 04 QUEM BUSCAMOS ──────────────────────────────────────────────── */}
      <section className="px-6 lg:px-10 py-20 md:py-24 border-b border-white/8">
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
          ].map((item, i) => (
            <Fade key={item.n} delay={i * 60}>
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

      {/* ── 05 CTA ─────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-10 py-20 md:py-28 text-center">
        <Fade>
          <p className="font-body text-[10px] font-semibold tracking-[0.4em] uppercase text-white/30 mb-8">
            Pronto para evoluir?
          </p>
          <h2 className="font-display text-[clamp(2.5rem,8vw,6rem)] uppercase leading-none tracking-tight text-white mb-10">
            Submeta seu<br />portfólio
          </h2>
        </Fade>

        <Fade delay={80}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
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

            <a
              href="mailto:contato@eldude.com"
              className="flex items-center gap-2 border border-white/20 hover:border-white text-white font-body font-bold text-xs tracking-widest uppercase px-10 py-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              E-mail Estúdio
            </a>

            <Link
              to="/artistas"
              className="flex items-center gap-2 border border-white/10 hover:border-white/30 text-white/50 hover:text-white font-body font-bold text-xs tracking-widest uppercase px-8 py-4 transition-colors"
            >
              Ver artistas
            </Link>
          </div>
        </Fade>

        <Fade delay={160}>
          <p className="font-body text-[10px] text-white/20 leading-relaxed max-w-sm mx-auto">
            Certifique-se de que seu portfólio inclua pelo menos 10 exemplos de trabalhos concluídos.
            Respondemos a todos os candidatos aprovados em até 48 horas.
          </p>
        </Fade>
      </section>

    </div>
  );
}
