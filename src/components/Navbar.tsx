import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import CartDrawer from './CartDrawer';

const topNavClass = 'font-body text-xs font-semibold tracking-widest uppercase transition-colors text-white/50 hover:text-ink-400';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const publicUser = useStore((s) => s.publicUser);
  const publicLogout = useStore((s) => s.publicLogout);
  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);
  const isAdmin        = useStore((s) => s.isAdmin);
  const isArtist       = useStore((s) => s.isArtist);
  const isMerchManager = useStore((s) => s.isMerchManager);
  const currentArtistId = useStore((s) => s.currentArtistId);
  const artists        = useStore((s) => s.artists);
  const logout         = useStore((s) => s.logout);
  const logoColorMode  = useStore((s) => s.logoColorMode);
  const customLogo     = useStore((s) => s.customLogo);
  const logoSrc        = customLogo ?? '/logosemo-3.png';
  const navigate = useNavigate();

  const isLoggedIn = isAdmin || isArtist || isMerchManager;
  const currentArtistName = artists.find((a) => a.id === currentArtistId)?.name ?? null;
  const displayName = isAdmin ? 'Admin' : (currentArtistName ?? (isMerchManager ? 'Loja' : null));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
    <nav className="bg-black border-b border-ink2-500/20 sticky top-0 z-50" onMouseLeave={() => setMenuOpen(false)}>
      <div className="px-6 lg:px-10">
        <div
          className="grid items-center transition-all duration-500 ease-in-out"
          style={{
            height: scrolled ? '64px' : '160px',
            gridTemplateColumns: '1fr auto 1fr',
          }}
        >
          {/* Left group: Menu + Artistas + Guests */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 text-white/50 hover:text-ink-400 transition-colors z-10"
            >
              <div className="flex flex-col gap-1 w-5">
                <span className="block h-px bg-current" />
                <span className="block h-px bg-current" />
                <span className="block h-px bg-current w-3" />
              </div>
              <span className="font-body text-xs font-semibold tracking-widest uppercase">Menu</span>
            </button>

            <div className="hidden lg:flex items-center gap-6 ml-10">
              <Link to="/artistas" className={topNavClass} onClick={() => window.scrollTo(0, 0)}>
                Artistas
              </Link>
              <Link to="/loja" className={topNavClass} onClick={() => window.scrollTo(0, 0)}>
                Loja
              </Link>
              <Link to="/" className={topNavClass} onClick={() => window.scrollTo(0, 0)}>
                Vitrine
              </Link>
              <Link to="/guests" className={topNavClass} onClick={() => window.scrollTo(0, 0)}>
                Guests
              </Link>
            </div>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="flex justify-center">
            {logoColorMode === 'primary' || logoColorMode === 'secondary' ? (
              <div
                className="transition-all duration-500 ease-in-out relative"
                style={{ height: scrolled ? '40px' : '120px', display: 'inline-block' }}
              >
                <img
                  src={logoSrc}
                  alt="El Dude"
                  className="w-auto h-full object-contain"
                  style={{ filter: 'brightness(0)' }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: logoColorMode === 'primary'
                      ? 'rgb(var(--ink-500))'
                      : 'rgb(var(--ink2-500))',
                    mixBlendMode: 'screen',
                  }}
                />
              </div>
            ) : (
              <img
                src={logoSrc}
                alt="El Dude"
                className="w-auto object-contain transition-all duration-500 ease-in-out"
                style={{
                  height: scrolled ? '40px' : '120px',
                  filter: logoColorMode === 'white'
                    ? 'brightness(0) invert(1)'
                    : logoColorMode === 'black'
                    ? 'brightness(0)'
                    : logoColorMode === 'invert'
                    ? 'invert(1)'
                    : 'none',
                }}
              />
            )}
          </Link>

          {/* Right group: Eventos + Pós Tattoo + Endereço + Admin */}
          <div className="flex items-center justify-end gap-6">
            <div className="hidden lg:flex items-center gap-6 mr-10">
              <Link to="/events" className={topNavClass} onClick={() => window.scrollTo(0, 0)}>
                Eventos
              </Link>
              <Link to="/aftercare" className={topNavClass} onClick={() => window.scrollTo(0, 0)}>
                Pós Tattoo
              </Link>
              <Link to="/endereco" className={topNavClass} onClick={() => window.scrollTo(0, 0)}>
                Endereço
              </Link>
            </div>

            {/* Wishlist + Cart icons (always visible) */}
              <div className="flex items-center gap-3">
                <Link to="/lista-de-desejos" title="Lista de desejos" className="relative text-white/40 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-ink-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center leading-none">{wishlist.length}</span>
                  )}
                </Link>
                <button onClick={() => setCartOpen(true)} title="Carrinho" className="relative text-white/40 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-ink-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center leading-none">{cart.length}</span>
                  )}
                </button>
              </div>

            {publicUser ? (
              <div className="flex items-center gap-3">
                <span className="font-body text-xs text-white/40 tracking-widest uppercase hidden lg:block truncate max-w-[100px]">{publicUser.name}</span>
                <button onClick={() => { publicLogout(); navigate('/'); }} title="Sair" className="text-white/30 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link to="/admin" className="font-body text-xs font-semibold tracking-widest uppercase text-white/40 hover:text-white transition-colors">
                  {displayName}
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-1.5 font-body text-xs font-semibold tracking-widest uppercase text-white/40 hover:text-red-400 transition-colors" title="Sair">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </button>
              </div>
            ) : (
              <Link to="/admin" className="text-white/40 hover:text-white transition-colors" title="Admin">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="bg-black border-t border-white/10">
          <div className="px-6 lg:px-10 py-6 flex flex-col gap-1">
            {[
              { to: '/', label: 'Vitrine', end: true },
              { to: '/artistas', label: 'Artistas', end: false },
              { to: '/guests', label: 'Guests', end: false },
              { to: '/events', label: 'Eventos', end: false },
              { to: '/loja', label: 'Loja', end: false },
              { to: '/aftercare', label: 'Pós Tattoo', end: false },
              { to: '/endereco', label: 'Endereço', end: false },
              { to: '/ficha-anamnese', label: 'Ficha de Anamnese', end: false },
            ].map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => { setMenuOpen(false); window.scrollTo(0, 0); }}
                className={({ isActive }) =>
                  `font-display text-3xl sm:text-4xl uppercase tracking-wide transition-colors leading-tight ${
                    isActive ? 'text-ink-500' : 'text-white/50 hover:text-ink-400'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
