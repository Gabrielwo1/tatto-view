import { useState, useMemo } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

const navItems = [
  {
    to: '/admin/merchs',
    label: 'Loja',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ),
  },
  {
    to: '/admin/tatuagens',
    label: 'Tatuagens',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/admin/artistas',
    label: 'Artistas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/admin/guests',
    label: 'Guests',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    to: '/admin/events',
    label: 'Events',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/admin/aftercare',
    label: 'Pós Tattoo',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    to: '/admin/landing',
    label: 'Landing Page',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/admin/tatuados',
    label: 'Tatuados',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    to: '/admin/sobre-nos',
    label: 'Sobre Nós',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    to: '/admin/ficha-anamnese',
    label: 'Ficha Anamnese',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/admin/fichas',
    label: 'Fichas Recebidas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h3l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
  },
  {
    to: '/admin/configuracoes',
    label: 'Configurações',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  // Artist-only item
  {
    to: '/admin/meu-perfil',
    label: 'Meu Perfil',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// Items shown only to the super admin
const adminOnlyItems = [
  '/admin/dashboard',
  '/admin/artistas',
  '/admin/guests',
  '/admin/events',
  '/admin/aftercare',
  '/admin/landing',
  '/admin/tatuados',
  '/admin/sobre-nos',
  '/admin/ficha-anamnese',
  '/admin/fichas',
  '/admin/configuracoes',
];

// Item shown only to artists (not admin)
const artistOnlyItem = '/admin/meu-perfil';

// Item shown only to merch managers and admins (hidden from artists)
const merchItem = '/admin/merchs';

export default function AdminLayout() {
  const isAdmin          = useStore((s) => s.isAdmin);
  const isArtist         = useStore((s) => s.isArtist);
  const isMerchManager   = useStore((s) => s.isMerchManager);
  const currentArtistId  = useStore((s) => s.currentArtistId);
  const currentUserEmail = useStore((s) => s.currentUserEmail);
  const artists          = useStore((s) => s.artists);
  const logout           = useStore((s) => s.logout);
  const logoColorMode    = useStore((s) => s.logoColorMode);
  const customLogo       = useStore((s) => s.customLogo);
  const logoSrc          = customLogo ?? '/logosemo-3.png';

  const artistName = artists.find((a) => a.id === currentArtistId)?.name ?? null;
  const displayName = artistName ?? (currentUserEmail ? currentUserEmail.split('@')[0] : 'Admin');
  const location  = useLocation();
  const navigate  = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  const items = useMemo(() => {
    if (isAdmin) return navItems.filter((item) => item.to !== artistOnlyItem);
    if (isArtist) return navItems.filter((item) => !adminOnlyItems.includes(item.to) && item.to !== merchItem);
    if (isMerchManager) return navItems.filter((item) => item.to === merchItem);
    return [];
  }, [isAdmin, isArtist, isMerchManager]);

  const currentLabel = useMemo(
    () => navItems.find((n) => location.pathname.startsWith(n.to))?.label ?? 'Admin',
    [location.pathname],
  );

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>

      {/* ── Desktop Sidebar (RIGHT) ── */}
      <aside className="hidden md:flex w-52 bg-black border-l border-white/10 flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative h-8 flex-shrink-0">
              <img
                src={logoSrc}
                alt="El Dude"
                className="h-full w-auto object-contain"
                style={{
                  filter: (logoColorMode === 'primary' || logoColorMode === 'secondary') 
                    ? 'brightness(0)' 
                    : (logoColorMode === 'white' ? 'brightness(0) invert(1)' : 'none')
                }}
              />
              {(logoColorMode === 'primary' || logoColorMode === 'secondary') && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: logoColorMode === 'primary' ? 'rgb(var(--ink-500))' : 'rgb(var(--ink2-500))',
                    mixBlendMode: 'screen'
                  }}
                />
              )}
            </div>
            <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 truncate max-w-[100px]">{displayName}</p>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-xs font-body font-semibold tracking-widest uppercase transition-all border-r-2 ${
                  isActive
                    ? 'text-white bg-white/8 border-white'
                    : 'text-gray-600 hover:text-white hover:bg-white/5 border-transparent'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 flex flex-col gap-1">
          <Link to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-xs font-body font-semibold tracking-widest uppercase text-gray-600 hover:text-white hover:bg-white/5 transition-all rounded">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Vitrine
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-xs font-body font-semibold tracking-widest uppercase text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all rounded"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* ── Mobile: Top Bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black border-b border-white/10 h-14">
        {/* Logo — absolute centered */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Link to="/" className="pointer-events-auto flex items-center h-7">
            <div className="relative h-full">
              <img
                src={logoSrc}
                alt="El Dude"
                className="h-full w-auto object-contain"
                style={{
                  filter: (logoColorMode === 'primary' || logoColorMode === 'secondary') 
                    ? 'brightness(0)' 
                    : (logoColorMode === 'white' ? 'brightness(0) invert(1)' : 'none')
                }}
              />
              {(logoColorMode === 'primary' || logoColorMode === 'secondary') && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: logoColorMode === 'primary' ? 'rgb(var(--ink-500))' : 'rgb(var(--ink2-500))',
                    mixBlendMode: 'screen'
                  }}
                />
              )}
            </div>
          </Link>
        </div>
        {/* Left: section label */}
        <div className="absolute left-0 top-0 h-14 flex items-center px-4">
          <span className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500">{currentLabel}</span>
        </div>
        {/* Right: hamburger */}
        <div className="absolute right-0 top-0 h-14 flex items-center px-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile: Drawer (RIGHT) ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70" onClick={closeDrawer} />
          <aside className="relative ml-auto w-64 bg-black border-l border-white/10 flex flex-col h-full">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <Link to="/" onClick={closeDrawer} className="flex items-center gap-3">
                <div className="relative h-8 flex-shrink-0">
                  <img
                    src={logoSrc}
                    alt="El Dude"
                    className="h-full w-auto object-contain"
                    style={{
                      filter: (logoColorMode === 'primary' || logoColorMode === 'secondary') 
                        ? 'brightness(0)' 
                        : (logoColorMode === 'white' ? 'brightness(0) invert(1)' : 'none')
                    }}
                  />
                  {(logoColorMode === 'primary' || logoColorMode === 'secondary') && (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: logoColorMode === 'primary' ? 'rgb(var(--ink-500))' : 'rgb(var(--ink2-500))',
                        mixBlendMode: 'screen'
                      }}
                    />
                  )}
                </div>
                <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-gray-600 truncate max-w-[100px]">{displayName}</p>
              </Link>
              <button onClick={closeDrawer} className="p-1 text-gray-600 hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-body font-semibold tracking-widest uppercase transition-all border-r-2 ${
                      isActive
                        ? 'text-white bg-white/8 border-white'
                        : 'text-gray-600 hover:text-white hover:bg-white/5 border-transparent'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10 flex flex-col gap-1">
              <Link to="/" onClick={closeDrawer}
                className="flex items-center gap-3 px-4 py-3 text-sm font-body font-semibold tracking-widest uppercase text-gray-600 hover:text-white hover:bg-white/5 transition-all rounded">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Ver Vitrine
              </Link>
              <button
                onClick={() => { closeDrawer(); handleLogout(); }}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-body font-semibold tracking-widest uppercase text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all rounded"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
