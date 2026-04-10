import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { trackPageView } from './lib/analytics';
import { useStore } from './store';
import { applyTheme, applyCustomColors, getThemeForHostname, THEMES } from './lib/themes';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import ShowcasePage from './pages/ShowcasePage';
import ArchivedPage from './pages/ArchivedPage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistDetailPage from './pages/ArtistDetailPage';
import ArtistGuestTripPage from './pages/ArtistGuestTripPage';
import AddressPage from './pages/AddressPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminResetPassword from './pages/admin/AdminResetPassword';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTattoos from './pages/admin/AdminTattoos';
import AdminTattooForm from './pages/admin/AdminTattooForm';
import AdminArtists from './pages/admin/AdminArtists';
import AdminArtistForm from './pages/admin/AdminArtistForm';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMerchs from './pages/admin/AdminMerchs';
import AdminGuestPage from './pages/admin/AdminGuestPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import GuestsPage from './pages/GuestsPage';
import EventsPage from './pages/EventsPage';
import MerchsPage from './pages/MerchsPage';
import LandingPage from './pages/LandingPage';
import AftercarePage from './pages/AftercarePage';

import AdminAftercare from './pages/admin/AdminAftercare';
import AdminLandingPage from './pages/admin/AdminLandingPage';
import AdminFichaAnamnese from './pages/admin/AdminFichaAnamnese';
import AdminFichaSubmissions from './pages/admin/AdminFichaSubmissions';
import AdminMyProfile from './pages/admin/AdminMyProfile';
import AdminFinanceiro from './pages/admin/AdminFinanceiro';
import BillingPage from './pages/admin/BillingPage';
import SiteFooter from './components/SiteFooter';
import WhatsAppButton from './components/WhatsAppButton';
import VitrinLandingPage from './pages/VitrinLandingPage';
import FichaAnamnesePage from './pages/FichaAnamnesePage';

import LoginPage from './pages/LoginPage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import StudioSignupPage from './pages/StudioSignupPage';

// Returns true when the current hostname is the root vitrink.app marketing domain.
function isMarketingDomain() {
  const h = window.location.hostname.toLowerCase().replace(/^www\./, '');
  return h === 'vitrink.app' || h === 'localhost.vitrink' /* dev convenience */;
}

// Detects Supabase password recovery tokens in the URL and redirects to the reset page.
function RecoveryRedirect() {
  const hash = window.location.hash;
  const search = window.location.search;
  const isRecovery = hash.includes('type=recovery') || new URLSearchParams(search).has('code');
  if (isRecovery) {
    window.location.replace('/admin/reset-password' + search + hash);
    return null;
  }
  return null;
}

// Requires super admin
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((state) => state.isAdmin);
  const authChecked = useStore((state) => state.authChecked);
  if (!authChecked) return <div className="min-h-screen bg-zinc-950" />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

// Allows both super admin and artist users
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((state) => state.isAdmin);
  const isArtist = useStore((state) => state.isArtist);
  const isMerchManager = useStore((state) => state.isMerchManager);
  const authChecked = useStore((state) => state.authChecked);
  if (!authChecked) return <div className="min-h-screen bg-zinc-950" />;
  if (!isAdmin && !isArtist && !isMerchManager) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

// Allows admin or artist with showFinanceiro=true
function ProtectedFinanceiroRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((s) => s.isAdmin);
  const showFinanceiro = useStore((s) => s.showFinanceiro);
  const authChecked = useStore((s) => s.authChecked);
  if (!authChecked) return <div className="min-h-screen bg-zinc-950" />;
  if (!isAdmin && !showFinanceiro) return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
}

// Allows admin or merch manager only
function ProtectedMerchRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((state) => state.isAdmin);
  const isMerchManager = useStore((state) => state.isMerchManager);
  const authChecked = useStore((state) => state.authChecked);
  if (!authChecked) return <div className="min-h-screen bg-zinc-950" />;
  if (!isAdmin && !isMerchManager) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function AdminIndexRedirect() {
  const isAdmin = useStore((state) => state.isAdmin);
  const isMerchManager = useStore((state) => state.isMerchManager);
  if (isMerchManager) return <Navigate to="/admin/merchs" replace />;
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/admin/tatuagens'} replace />;
}

function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    // Don't track admin pages
    if (!location.pathname.startsWith('/admin')) {
      trackPageView(location.pathname);
    }
  }, [location.pathname]);
  return null;
}

function PublicLayout({ children, hideFooter = false }: { children: React.ReactNode, hideFooter?: boolean }) {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && <SiteFooter />}
      <WhatsAppButton />
    </div>
  );
}

function StudioSuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const subdomain = params.get('subdomain') ?? '';
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 text-center gap-6">
      <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide text-white mb-2">Studio criado!</h1>
        <p className="font-body text-sm text-gray-400 max-w-sm">
          Verifique seu email — enviamos um link para você definir sua senha e acessar o painel.
        </p>
      </div>
      {subdomain && (
        <a
          href={`https://${subdomain}.vitrink.app/admin/login`}
          className="font-body text-xs font-bold tracking-widest uppercase bg-white text-black px-8 py-3 hover:bg-white/90 transition-colors"
        >
          Acessar {subdomain}.vitrink.app →
        </a>
      )}
    </div>
  );
}

export default function App() {
  const loadData       = useStore((s) => s.loadData);
  const initAuth       = useStore((s) => s.initAuth);
  const themeId        = useStore((s) => s.themeId);
  const customPrimary  = useStore((s) => s.customPrimary);
  const customSecondary = useStore((s) => s.customSecondary);
  const customFavicon  = useStore((s) => s.customFavicon);

  // Apply theme + custom overrides on mount and whenever they change
  useEffect(() => {
    const id = (themeId && THEMES[themeId]) ? themeId : getThemeForHostname(window.location.hostname);
    applyTheme(id);
    applyCustomColors(customPrimary, customSecondary);
  }, [themeId, customPrimary, customSecondary]);

  // Apply custom favicon + og:image dynamically
  useEffect(() => {
    const faviconUrl = customFavicon ?? '/dudeicone.png';
    const cacheBuster = 'v=' + Date.now();
    const fullUrl = faviconUrl + (faviconUrl.includes('?') ? '&' : '?') + cacheBuster;
    
    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="mask-icon"]',
    ];
    selectors.forEach((selector) => {
      document.querySelectorAll<HTMLLinkElement>(selector).forEach((link) => {
        link.href = fullUrl;
      });
    });

    // og:image is served by /api/og-image (server-side, always up-to-date)
  }, [customFavicon]);

  useEffect(() => {
    initAuth();
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show marketing pages on vitrink.app root domain
  if (isMarketingDomain()) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VitrinLandingPage />} />
          <Route path="/criar-studio" element={<StudioSignupPage />} />
          <Route path="/checkout/studio-sucesso" element={<StudioSuccessPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RecoveryRedirect />
        <PageTracker />
        <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <ShowcasePage />
            </PublicLayout>
          }
        />
        <Route
          path="/arquivadas"
          element={
            <PublicLayout>
              <ArchivedPage />
            </PublicLayout>
          }
        />
        <Route
          path="/artistas"
          element={
            <PublicLayout>
              <ArtistsPage />
            </PublicLayout>
          }
        />
        <Route
          path="/artistas/:slug"
          element={
            <PublicLayout>
              <ArtistDetailPage />
            </PublicLayout>
          }
        />
        <Route
          path="/artistas/:slug/guest-trip"
          element={
            <PublicLayout>
              <ArtistGuestTripPage />
            </PublicLayout>
          }
        />
        <Route
          path="/guests"
          element={
            <PublicLayout>
              <GuestsPage />
            </PublicLayout>
          }
        />
        <Route
          path="/events"
          element={
            <PublicLayout>
              <EventsPage />
            </PublicLayout>
          }
        />
        <Route
          path="/loja"
          element={
            <PublicLayout>
              <MerchsPage />
            </PublicLayout>
          }
        />
        <Route
          path="/aftercare"
          element={
            <PublicLayout>
              <AftercarePage />
            </PublicLayout>
          }
        />
        <Route
          path="/endereco"
          element={
            <PublicLayout>
              <AddressPage />
            </PublicLayout>
          }
        />

        {/* Public user auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Wishlist & Cart */}
        <Route path="/lista-de-desejos" element={<PublicLayout><WishlistPage /></PublicLayout>} />
        <Route path="/carrinho" element={<PublicLayout><CartPage /></PublicLayout>} />
        <Route path="/checkout/sucesso" element={<CheckoutSuccessPage />} />



        {/* Landing page */}
        <Route path="/landingpage" element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        } />

{/* Ficha de Anamnese */}
        <Route path="/ficha-anamnese" element={
          <PublicLayout hideFooter>
            <FichaAnamnesePage />
          </PublicLayout>
        } />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Artist users land on /admin/tatuagens; admin lands on /admin/dashboard */}
          <Route index element={<AdminIndexRedirect />} />

          {/* ── Available to both admin and artist ── */}
          <Route path="tatuagens" element={<AdminTattoos />} />
          <Route path="tatuagens/nova" element={<AdminTattooForm />} />
          <Route path="tatuagens/:id/editar" element={<AdminTattooForm />} />
          <Route path="meu-perfil" element={<AdminMyProfile />} />

          {/* ── Admin and merch manager ── */}
          <Route path="merchs" element={<ProtectedMerchRoute><AdminMerchs /></ProtectedMerchRoute>} />

          {/* ── Admin only ── */}
          <Route path="dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="artistas" element={<ProtectedAdminRoute><AdminArtists /></ProtectedAdminRoute>} />
          <Route path="artistas/novo" element={<ProtectedAdminRoute><AdminArtistForm /></ProtectedAdminRoute>} />
          <Route path="artistas/:id/editar" element={<ProtectedAdminRoute><AdminArtistForm /></ProtectedAdminRoute>} />
          <Route path="guests" element={<ProtectedAdminRoute><AdminGuestPage /></ProtectedAdminRoute>} />
          <Route path="events" element={<ProtectedAdminRoute><AdminEventsPage /></ProtectedAdminRoute>} />
          <Route path="aftercare" element={<ProtectedAdminRoute><AdminAftercare /></ProtectedAdminRoute>} />

          <Route path="landing" element={<ProtectedAdminRoute><AdminLandingPage /></ProtectedAdminRoute>} />
          <Route path="ficha-anamnese" element={<ProtectedAdminRoute><AdminFichaAnamnese /></ProtectedAdminRoute>} />
          <Route path="fichas" element={<ProtectedRoute><AdminFichaSubmissions /></ProtectedRoute>} />
          <Route path="configuracoes" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
          <Route path="financeiro" element={<ProtectedFinanceiroRoute><AdminFinanceiro /></ProtectedFinanceiroRoute>} />
          <Route path="billing" element={<BillingPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
  );
}
