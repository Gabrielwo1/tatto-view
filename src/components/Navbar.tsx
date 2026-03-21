import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="bg-black border-b border-white/10 sticky top-0 z-50">
      <div className="px-6 lg:px-10">
        <div
          className="relative flex items-center justify-between transition-all duration-500 ease-in-out"
          style={{ height: scrolled ? '64px' : '192px' }}
        >
          {/* Left: Menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 text-white/50 hover:text-white transition-colors z-10"
          >
            <div className="flex flex-col gap-1 w-5">
              <span className="block h-px bg-current" />
              <span className="block h-px bg-current" />
              <span className="block h-px bg-current w-3" />
            </div>
            <span className="font-body text-xs font-semibold tracking-widest uppercase">Menu</span>
          </button>

          {/* Center: Logo */}
          <Link to="/" className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <img
              src="/eldude logo.png"
              alt="El Dude"
              className="h-auto object-contain pointer-events-auto transition-all duration-500 ease-in-out"
              style={{ width: scrolled ? '5cm' : '15cm' }}
            />
          </Link>

          {/* Right: Admin */}
          <Link
            to="/admin"
            className="font-body text-xs font-semibold tracking-widest uppercase text-white/40 hover:text-white transition-colors z-10"
          >
            Admin
          </Link>
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
              { to: '/merchs', label: 'Merchs', end: false },
              { to: '/aftercare', label: 'Pós Tattoo', end: false },
            ].map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `font-display text-4xl uppercase tracking-wide transition-colors leading-tight ${
                    isActive ? 'text-white' : 'text-white/50 hover:text-white'
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
  );
}
