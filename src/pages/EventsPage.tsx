import { useRef, useEffect, useState } from 'react';
import { useStore } from '../store';
import type { EventItem } from '../store';

/* ── scroll-fade hook ─────────────────────────────────────────────────── */
function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Fade({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
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

/* ── Type icons ──────────────────────────────────────────────────────── */
function EventTypeIcon({ type }: { type: string }) {
  const cls = 'w-5 h-5';
  if (type === 'flash') return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  );
  if (type === 'guest') return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
  if (type === 'workshop') return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  );
  // default: calendar
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
    </svg>
  );
}

/* ── Single event card ──────────────────────────────────────────────── */
function EventCard({ event }: { event: EventItem }) {
  return (
    <Fade>
      <article className="border-t border-white/10 pt-8 pb-10">
        {/* Date row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="font-display text-3xl md:text-4xl uppercase tracking-tight text-ink-500 leading-none">
              {event.date}
            </p>
            <p className="font-body text-[11px] font-semibold tracking-widest uppercase text-white/40 mt-1">
              {event.timeLabel}
            </p>
          </div>
          <div className="text-ink-500 mt-1">
            <EventTypeIcon type={event.type} />
          </div>
        </div>

        {/* Event image */}
        {event.image && (
          <div className="w-full aspect-[4/3] overflow-hidden mb-5 bg-zinc-800">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover grayscale contrast-110"
            />
          </div>
        )}
        {!event.image && (
          <div className="w-full aspect-[4/3] bg-zinc-800 mb-5 flex items-center justify-center">
            <span className="font-body text-[10px] tracking-widest uppercase text-white/20">
              {event.title}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-display text-2xl md:text-3xl uppercase tracking-tight text-white leading-tight mb-3">
          {event.title}
        </h3>

        {/* Description */}
        <p className="font-body text-sm text-white/50 leading-relaxed mb-5 max-w-sm">
          {event.description}
        </p>

        {/* CTA */}
        {(event.ctaLabel || event.ctaUrl) && (
          event.ctaUrl ? (
            <a
              href={event.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-body text-xs font-semibold tracking-widest uppercase px-5 py-3 border border-white text-white hover:bg-white hover:text-black transition-colors"
            >
              {event.ctaLabel || 'SAIBA MAIS'}
            </a>
          ) : (
            <span className="inline-block font-body text-xs font-semibold tracking-widest uppercase px-5 py-3 border border-white/30 text-white/30 cursor-default">
              {event.ctaLabel || 'SAIBA MAIS'}
            </span>
          )
        )}
      </article>
    </Fade>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function EventsPage() {
  const ec = useStore((s) => s.eventsContent);

  const activeEvents = ec.events.filter((e) => e.title);

  return (
    <div className="bg-zinc-900 min-h-screen">

      {/* ── HERO ── */}
      <section className="px-6 lg:px-10 pt-12 pb-0">
        <div className="max-w-lg mx-auto lg:max-w-2xl">
          <Fade>
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-ink-500 mb-4">
              {ec.hero.tagline || 'UPCOMING EXPERIENCES'}
            </p>
            <h1
              className="font-display text-[clamp(3rem,10vw,6rem)] uppercase leading-none tracking-tight text-white mb-6 whitespace-pre-line"
            >
              {ec.hero.title || 'CULTURE &\nPERMANENCE'}
            </h1>
          </Fade>
        </div>

        {/* Hero image */}
        {ec.hero.heroImage && (
          <Fade delay={100}>
            <div className="w-full max-w-lg mx-auto lg:max-w-2xl aspect-[3/2] overflow-hidden bg-zinc-800 mb-0">
              <img
                src={ec.hero.heroImage}
                alt="Events hero"
                className="w-full h-full object-cover grayscale"
              />
            </div>
          </Fade>
        )}
        {!ec.hero.heroImage && (
          <div className="w-full max-w-lg mx-auto lg:max-w-2xl aspect-[3/2] bg-zinc-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        {/* Description */}
        {ec.hero.description && (
          <Fade delay={150}>
            <div className="max-w-lg mx-auto lg:max-w-2xl py-8">
              <p className="font-body text-sm text-white/60 leading-relaxed">
                {ec.hero.description}
              </p>
            </div>
          </Fade>
        )}
      </section>

      {/* ── EVENTS LIST ── */}
      <section className="px-6 lg:px-10 pb-20">
        <div className="max-w-lg mx-auto lg:max-w-2xl">
          {activeEvents.length > 0 ? (
            activeEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="border-t border-white/10 pt-16 pb-20 text-center">
              <p className="font-body text-sm text-white/30 tracking-widest uppercase">
                Nenhum evento programado
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
