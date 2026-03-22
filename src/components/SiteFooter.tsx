import { Link } from 'react-router-dom';
import { useStore } from '../store';

export default function SiteFooter() {
  const { studio, contact } = useStore((s) => s.sobreNosContent);

  return (
    <footer className="bg-zinc-950 border-t border-white/10">

      {/* ── Contact + Social row ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Contato + Endereço */}
        <div>
          <p className="font-display text-base uppercase tracking-widest text-white mb-5">Contato</p>
          <div className="space-y-2 font-body text-sm text-white/50 mb-6">
            {contact.email && (
              <p>
                E-mail:{' '}
                <a href={`mailto:${contact.email}`} className="text-ink-500 hover:text-white transition-colors">
                  {contact.email}
                </a>
              </p>
            )}
            {contact.phone1 && (
              <p>
                Telefone:{' '}
                <a href={contact.phone1Url || `tel:${contact.phone1}`} className="text-ink-500 hover:text-white transition-colors">
                  {contact.phone1}
                </a>
                {contact.phone2 && (
                  <> · <a href={contact.phone2Url || `tel:${contact.phone2}`} className="text-ink-500 hover:text-white transition-colors">{contact.phone2}</a></>
                )}
              </p>
            )}
          </div>

          {(studio.street || studio.city) && (
            <div>
              <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">Endereço</p>
              {studio.street && <p className="font-body text-sm text-white/50">{studio.street}</p>}
              {studio.city   && <p className="font-body text-sm text-white/50">{studio.city}</p>}
              {studio.cep    && <p className="font-body text-sm text-white/50">{studio.cep}</p>}
            </div>
          )}
        </div>

        {/* Redes Sociais */}
        <div>
          <p className="font-display text-base uppercase tracking-widest text-white mb-5">Redes Sociais</p>
          <div className="flex flex-wrap gap-6">
            {contact.instagram && (
              <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-ink-500 hover:text-white transition-colors font-body text-sm">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
                {contact.instagram}
              </a>
            )}
            {contact.tiktok && (
              <a href={contact.tiktokUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-ink-500 hover:text-white transition-colors font-body text-sm">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                </svg>
                {contact.tiktok}
              </a>
            )}
            {contact.twitter && (
              <a href={contact.twitterUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-ink-500 hover:text-white transition-colors font-body text-sm">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                {contact.twitter}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/landingpage">
            <img src="/logosemo-3.png" alt="El Dude" className="h-7 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity" />
          </Link>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            {[
              { to: '/',           label: 'Vitrine' },
              { to: '/artistas',   label: 'Artistas' },
              { to: '/sobre-nos',  label: 'Estúdio' },
              { to: '/aftercare',  label: 'Cuidados' },
              { to: '/guests',     label: 'Guests' },
              { to: '/merchs',     label: 'Merchs' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="font-body text-[10px] font-semibold tracking-widest uppercase text-white/30 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          <p className="font-body text-[10px] tracking-widest uppercase text-white/20">
            © {new Date().getFullYear()} El Dude Tattoo
          </p>
        </div>
      </div>

    </footer>
  );
}
