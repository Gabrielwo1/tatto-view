import { useState, useEffect, useRef } from 'react';

/* ─── tiny visibility hook ─── */
function useVisible(threshold = 0.12) {
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

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useVisible();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── data ─── */
const PAGES = [
  { icon: '🖼️', title: 'Vitrine / Portfólio', desc: 'Galeria de tatuagens com filtros por estilo, layout responsivo e atribuição por artista.' },
  { icon: '👥', title: 'Equipe de Artistas', desc: 'Perfis individuais com bio, especialidades, Instagram e WhatsApp direto.' },
  { icon: '🛍️', title: 'Loja de Merch', desc: 'Catálogo de produtos com imagem, preço e link de compra.' },
  { icon: '🎨', title: 'Página de Guests', desc: 'Atração de artistas convidados com informações de comissão e ambiente do estúdio.' },
  { icon: '💉', title: 'Guia de Aftercare', desc: 'Instruções de cuidado pré e pós-sessão editáveis pelo admin.' },
  { icon: '📍', title: 'Sobre Nós', desc: 'Localização com Google Maps, horários de funcionamento e redes sociais.' },
  { icon: '🚀', title: 'Landing Page', desc: 'Página de captação com manifesto, processo, tabela de preços e FAQ.' },
  { icon: '⚙️', title: 'Painel Admin', desc: 'Gestão completa de todo conteúdo sem precisar de programador.' },
];

const ADMIN_FEATURES = [
  { icon: '📸', label: 'Upload de imagens com recorte' },
  { icon: '↕️', label: 'Reordenação por drag-and-drop' },
  { icon: '✅', label: 'Seleção e arquivamento em lote' },
  { icon: '🔄', label: 'Sincronização com a nuvem (Supabase)' },
  { icon: '💾', label: 'Backup e restauração JSON' },
  { icon: '🎨', label: '7 temas de cor personalizáveis' },
  { icon: '📝', label: 'Edição de todos os textos do site' },
  { icon: '🗺️', label: 'Mapa, horários e contatos editáveis' },
  { icon: '💬', label: 'FAQ e preços configuráveis' },
  { icon: '🔐', label: 'Acesso protegido por senha' },
];

const THEMES = [
  { name: 'Ember',   color: '#ff4500', desc: 'Laranja intenso' },
  { name: 'Violet',  color: '#7c3aed', desc: 'Roxo profundo' },
  { name: 'Chrome',  color: '#06b6d4', desc: 'Ciano moderno' },
  { name: 'Blood',   color: '#dc2626', desc: 'Vermelho clássico' },
  { name: 'Gold',    color: '#f59e0b', desc: 'Dourado luxo' },
  { name: 'Neon',    color: '#22c55e', desc: 'Verde underground' },
  { name: 'Rose',    color: '#ec4899', desc: 'Rosa marcante' },
];

const STEPS = [
  { n: '01', title: 'Você contrata', desc: 'Entre em contato, escolha seu tema e envie as informações do estúdio.' },
  { n: '02', title: 'Configuramos', desc: 'Subimos o site no domínio vitrink.app com seu subdomínio exclusivo.' },
  { n: '03', title: 'Você gerencia', desc: 'Acesse o painel admin e atualize tudo sozinho, quando quiser.' },
];

export default function VitrinLandingPage() {
  const [activeTheme, setActiveTheme] = useState(0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight">
            VITRINK<span className="text-orange-500">.APP</span>
          </span>
          <a
            href="https://eldude.vitrink.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold px-4 py-2 rounded-full border border-zinc-700 hover:border-orange-500 hover:text-orange-400 transition-colors"
          >
            Ver demo →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,69,0,0.18) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Plataforma para estúdios de tatuagem
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6">
            O site profissional<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #ff4500, #ff8c00)' }}>
              que seu estúdio merece
            </span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Site completo, com portfólio, perfis de artistas, loja, painel de gestão e muito mais —
            tudo pronto para usar e personalizar sem saber programar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://eldude.vitrink.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #ff4500, #ff8c00)', color: '#fff' }}
            >
              🎨 Ver site demo
            </a>
            <a
              href="https://wa.me/5500000000000?text=Olá! Quero saber mais sobre o Vitrink.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg border border-zinc-700 hover:border-orange-500 transition-colors"
            >
              💬 Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <div className="border-y border-zinc-800 py-6 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-12 gap-y-4 text-center">
          {[
            { n: '8+', label: 'Páginas incluídas' },
            { n: '7', label: 'Temas de cor' },
            { n: '100%', label: 'Editável pelo dono' },
            { n: '∞', label: 'Tatuagens cadastradas' },
            { n: '☁️', label: 'Backup na nuvem' },
            { n: '📱', label: 'Mobile-first' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-black text-orange-500">{s.n}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAGES GRID ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Section>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Tudo que seu estúdio precisa</h2>
              <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                8 páginas profissionais incluídas, todas editáveis pelo painel de administração.
              </p>
            </div>
          </Section>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PAGES.map((p, i) => (
              <Section key={p.title}>
                <div
                  className="h-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-3 hover:border-orange-500/50 transition-colors group"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="text-3xl">{p.icon}</div>
                  <h3 className="font-bold text-white group-hover:text-orange-400 transition-colors">{p.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{p.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADMIN FEATURES ── */}
      <section className="py-24 px-6 bg-zinc-900">
        <div className="max-w-6xl mx-auto">
          <Section>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Painel admin completo</h2>
              <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                Você controla absolutamente tudo. Sem depender de programador para atualizar preço, foto ou texto.
              </p>
            </div>
          </Section>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* feature list */}
            <Section>
              <ul className="grid gap-3">
                {ADMIN_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-center gap-3 text-sm text-zinc-300">
                    <span className="text-xl w-8 shrink-0">{f.icon}</span>
                    {f.label}
                  </li>
                ))}
              </ul>
            </Section>
            {/* mock admin card */}
            <Section>
              <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-6 font-mono text-xs space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-zinc-600 ml-2">painel admin</span>
                </div>
                {[
                  { k: 'artistas', v: '6 cadastrados', c: 'text-orange-400' },
                  { k: 'tatuagens', v: '42 no portfólio', c: 'text-cyan-400' },
                  { k: 'merchs', v: '8 produtos', c: 'text-green-400' },
                  { k: 'tema', v: 'Ember (laranja)', c: 'text-pink-400' },
                  { k: 'último backup', v: 'agora há pouco', c: 'text-violet-400' },
                ].map((row) => (
                  <div key={row.k} className="flex justify-between">
                    <span className="text-zinc-500">{row.k}</span>
                    <span className={row.c}>{row.v}</span>
                  </div>
                ))}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex gap-2">
                  <div className="flex-1 text-center py-2 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs cursor-pointer hover:bg-orange-500/30 transition-colors">
                    + Nova Tatuagem
                  </div>
                  <div className="flex-1 text-center py-2 rounded-lg bg-zinc-800 text-zinc-400 font-bold text-xs cursor-pointer hover:bg-zinc-700 transition-colors">
                    Sync ↑ Nuvem
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ── THEMES ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Section>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black mb-4">7 temas de cor</h2>
              <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                Escolha a paleta que combina com a identidade do seu estúdio — e troque quando quiser.
              </p>
            </div>
          </Section>
          <Section>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {THEMES.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setActiveTheme(i)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                    activeTheme === i
                      ? 'border-white/40 bg-white/5 scale-105'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full shadow-lg"
                    style={{ backgroundColor: t.color, boxShadow: activeTheme === i ? `0 0 16px ${t.color}80` : undefined }}
                  />
                  <span className="text-xs font-semibold text-zinc-300">{t.name}</span>
                  <span className="text-[10px] text-zinc-600">{t.desc}</span>
                </button>
              ))}
            </div>
            {/* preview strip */}
            <div
              className="rounded-2xl border border-zinc-800 overflow-hidden transition-all duration-500"
              style={{ borderColor: `${THEMES[activeTheme].color}40` }}
            >
              <div
                className="h-2 w-full"
                style={{ background: `linear-gradient(90deg, ${THEMES[activeTheme].color}, ${THEMES[activeTheme].color}80)` }}
              />
              <div className="bg-zinc-900 p-6 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <div className="text-lg font-black" style={{ color: THEMES[activeTheme].color }}>
                    NOME DO ESTÚDIO
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Tatuagens · Piercing · Merch</div>
                </div>
                <div className="flex gap-3">
                  {['Vitrine', 'Artistas', 'Merchs', 'Sobre Nós'].map((nav) => (
                    <span key={nav} className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer">
                      {nav}
                    </span>
                  ))}
                </div>
                <div
                  className="px-4 py-2 rounded-full text-xs font-bold text-white"
                  style={{ background: THEMES[activeTheme].color }}
                >
                  Ver portfólio →
                </div>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-zinc-900">
        <div className="max-w-4xl mx-auto">
          <Section>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Como funciona</h2>
              <p className="text-zinc-400 text-lg">Em 3 passos simples seu site está no ar.</p>
            </div>
          </Section>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <Section key={s.n}>
                <div className="text-center md:text-left">
                  <div
                    className="text-5xl font-black mb-4"
                    style={{ color: '#ff4500', opacity: 0.4 }}
                  >
                    {s.n}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Section>
            <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-zinc-900 to-zinc-950 p-10 md:p-16 text-center relative overflow-hidden">
              {/* glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(255,69,0,0.12) 0%, transparent 70%)',
                }}
              />
              <div className="relative">
                <h2 className="text-3xl md:text-5xl font-black mb-4">
                  Quer ver na prática?
                </h2>
                <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8">
                  Acesse o site demo do estúdio <strong className="text-white">El Dude</strong> e explore todas
                  as páginas e funcionalidades que seu estúdio vai receber.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://eldude.vitrink.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #ff4500, #ff8c00)', color: '#fff' }}
                  >
                    🔗 Acessar eldude.vitrink.app
                  </a>
                  <a
                    href="https://wa.me/5500000000000?text=Olá! Vi o Vitrink.app e quero um site para meu estúdio."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg border border-zinc-600 hover:border-orange-500 transition-colors"
                  >
                    💬 Quero o meu agora
                  </a>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ── INCLUDED ── */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="max-w-4xl mx-auto">
          <Section>
            <h2 className="text-center text-2xl md:text-4xl font-black mb-10">O que está incluído</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                '✅ Domínio no vitrink.app (ex: seuestudio.vitrink.app)',
                '✅ 8 páginas profissionais completas',
                '✅ Painel de administração exclusivo',
                '✅ Upload ilimitado de imagens de tatuagens',
                '✅ Cadastro ilimitado de artistas',
                '✅ Loja de merch integrada',
                '✅ Guia de aftercare editável',
                '✅ Landing page com preços e FAQ',
                '✅ 7 temas de cor para escolher',
                '✅ Backup e sincronização na nuvem',
                '✅ Design responsivo (mobile + desktop)',
                '✅ Suporte para configuração inicial',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-zinc-300 bg-zinc-950 rounded-xl p-3 border border-zinc-800">
                  {item}
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-800 py-10 px-6 text-center">
        <div className="text-2xl font-black mb-2">
          VITRINK<span className="text-orange-500">.APP</span>
        </div>
        <p className="text-zinc-500 text-sm mb-6">Sites profissionais para estúdios de tatuagem.</p>
        <div className="flex justify-center gap-6 text-sm text-zinc-500">
          <a
            href="https://eldude.vitrink.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-400 transition-colors"
          >
            Ver demo
          </a>
          <a
            href="https://wa.me/5500000000000?text=Olá! Quero saber mais sobre o Vitrink.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-400 transition-colors"
          >
            WhatsApp
          </a>
        </div>
        <p className="text-zinc-700 text-xs mt-8">© {new Date().getFullYear()} Vitrink.app</p>
      </footer>
    </div>
  );
}
