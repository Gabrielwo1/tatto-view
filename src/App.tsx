import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { trackPageView } from './lib/analytics';
import { useStore } from './store';
import { applyTheme, applyCustomColors, getThemeForHostname, THEMES } from './lib/themes';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import SiteFooter from './components/SiteFooter';
import WhatsAppButton from './components/WhatsAppButton';

// Eagerly loaded - critical pages
import ShowcasePage from './pages/ShowcasePage';
import VitrinLandingPage from './pages/VitrinLandingPage';

// Lazy loaded - non-critical pages
const ArchivedPage = lazy(() => import('./pages/ArchivedPage'));
const ArtistsPage = lazy(() => import('./pages/ArtistsPage'));
const ArtistDetailPage = lazy(() => import('./pages/ArtistDetailPage'));
const ArtistGuestTripPage = lazy(() => import('./pages/ArtistGuestTripPage'));
const AddressPage = lazy(() => import('./pages/AddressPage'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminResetPassword = lazy(() => import('./pages/admin/AdminResetPassword'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTattoos = lazy(() => import('./pages/admin/AdminTattoos'));
const AdminTattooForm = lazy(() => import('./pages/admin/AdminTattooForm'));
const AdminArtists = lazy(() => import('./pages/admin/AdminArtists'));
const AdminArtistForm = lazy(() => import('./pages/admin/AdminArtistForm'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminMerchs = lazy(() => import('./pages/admin/AdminMerchs'));
const AdminGuestPage = lazy(() => import('./pages/admin/AdminGuestPage'));
const AdminEventsPage = lazy(() => import('./pages/admin/AdminEventsPage'));
const GuestsPage = lazy(() => import('./pages/GuestsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const MerchsPage = lazy(() => import('./pages/MerchsPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AftercarePage = lazy(() => import('./pages/AftercarePage'));
const AdminAftercare = lazy(() => import('./pages/admin/AdminAftercare'));
const AdminLandingPage = lazy(() => import('./pages/admin/AdminLandingPage'));
const AdminFichaAnamnese = lazy(() => import('./pages/admin/AdminFichaAnamnese'));
const AdminFichaSubmissions = lazy(() => import('./pages/admin/AdminFichaSubmissions'));
const AdminMyProfile = lazy(() => import('./pages/admin/AdminMyProfile'));
const AdminFinanceiro = lazy(() => import('./pages/admin/AdminFinanceiro'));
const BillingPage = lazy(() => import('./pages/admin/BillingPage'));
const FichaAnamnesePage = lazy(() => import('./pages/FichaAnamnesePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 bg-ink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-3 h-3 bg-ink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-3 h-3 bg-ink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

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
  if (!authChecked) return <PageLoader />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

// Allows both super admin and artist users
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((state) => state.isAdmin);
  const isArtist = useStore((state) => state.isArtist);
  const isMerchManager = useStore((state) => state.isMerchManager);
  const authChecked = useStore((state) => state.authChecked);
  if (!authChecked) return <PageLoader />;
  if (!isAdmin && !isArtist && !isMerchManager) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

// Allows admin or artist with showFinanceiro=true
function ProtectedFinanceiroRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((s) => s.isAdmin);
  const showFinanceiro = useStore((s) => s.showFinanceiro);
  const authChecked = useStore((s) => s.authChecked);
  if (!authChecked) return <PageLoader />;
  if (!isAdmin && !showFinanceiro) return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
}

// Allows admin or merch manager only
function ProtectedMerchRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((state) => state.isAdmin);
  const isMerchManager = useStore((state) => state.isMerchManager);
  const authChecked = useStore((state) => state.authChecked);
  if (!authChecked) return <PageLoader />;
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

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}

// Lazy layout wrapper
function LazyPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-ink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-ink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-ink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>}>
        {children}
      </Suspense>
    </PublicLayout>
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

  // Show marketing landing page on vitrink.app root domain
  if (isMarketingDomain()) {
    return <VitrinLandingPage />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RecoveryRedirect />
        <PageTracker />
        <Routes>
        {/* Public routes - Critical (eagerly loaded) */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <ShowcasePage />
            </PublicLayout>
          }
        />

        {/* Public routes - Non-critical (lazy loaded) */}
        <Route
          path="/arquivadas"
          element={
            <LazyPublicLayout>
              <ArchivedPage />
            </LazyPublicLayout>
          }
        />
        <Route
          path="/artistas"
          element={
            <LazyPublicLayout>
              <ArtistsPage />
            </LazyPublicLayout>
          }
        />
        <Route
          path="/artistas/:slug"
          element={
            <LazyPublicLayout>
              <ArtistDetailPage />
            </LazyPublicLayout>
          }
        />
        <Route
          path="/artistas/:slug/guest-trip"
          element={
            <LazyPublicLayout>
              <ArtistGuestTripPage />
            </LazyPublicLayout>
          }
        />
        <Route
          path="/guests"
          element={
            <LazyPublicLayout>
              <GuestsPage />
            </LazyPublicLayout>
          }
        />
        <Route
          path="/events"
          element={
            <LazyPublicLayout>
              <EventsPage />
            </LazyPublicLayout>
          }
        />
        <Route
          path="/loja"
          element={
            <LazyPublicLayout>
              <MerchsPage />
            </LazyPublicLayout>
          }
        />
        <Route
          path="/aftercare"
          element={
            <LazyPublicLayout>
              <AftercarePage />
            </LazyPublicLayout>
          }
        />
        <Route
          path="/endereco"
          element={
            <LazyPublicLayout>
              <AddressPage />
            </LazyPublicLayout>
          }
        />

        {/* Public user auth */}
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />

        {/* Wishlist & Cart */}
        <Route path="/lista-de-desejos" element={<LazyPublicLayout><WishlistPage /></LazyPublicLayout>} />
        <Route path="/carrinho" element={<LazyPublicLayout><CartPage /></LazyPublicLayout>} />
        <Route path="/checkout/sucesso" element={<Suspense fallback={<PageLoader />}><CheckoutSuccessPage /></Suspense>} />

        {/* Landing page */}
        <Route path="/landingpage" element={
          <LazyPublicLayout>
            <LandingPage />
          </LazyPublicLayout>
        } />

        {/* Ficha de Anamnese */}
        <Route path="/ficha-anamnese" element={
          <LazyPublicLayout>
            <FichaAnamnesePage />
          </LazyPublicLayout>
        } />

        {/* Admin routes */}
        <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
        <Route path="/admin/reset-password" element={<Suspense fallback={<PageLoader />}><AdminResetPassword /></Suspense>} />
        
        <Route
          path="/admin"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            </Suspense>
          }
        >
          {/* Artist users land on /admin/tatuagens; admin lands on /admin/dashboard */}
          <Route index element={<Suspense fallback={<div />}><AdminIndexRedirect /></Suspense>} />

          {/* ── Available to both admin and artist ── */}
          <Route path="tatuagens" element={<Suspense fallback={<div />}><AdminTattoos /></Suspense>} />
          <Route path="tatuagens/nova" element={<Suspense fallback={<div />}><AdminTattooForm /></Suspense>} />
          <Route path="tatuagens/:id/editar" element={<Suspense fallback={<div />}><AdminTattooForm /></Suspense>} />
          <Route path="meu-perfil" element={<Suspense fallback={<div />}><AdminMyProfile /></Suspense>} />

          {/* ── Admin and merch manager ── */}
          <Route path="merchs" element={<Suspense fallback={<div />}>
            <ProtectedMerchRoute><AdminMerchs /></ProtectedMerchRoute>
          </Suspense>} />

          {/* ── Admin only ── */}
          <Route path="dashboard" element={<Suspense fallback={<div />}>
            <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>
          </Suspense>} />
          <Route path="artistas" element={<Suspense fallback={<div />}>
            <ProtectedAdminRoute><AdminArtists /></ProtectedAdminRoute>
          </Suspense>} />
          <Route path="artistas/novo" element={<Suspense fallback={<div />}>
            <ProtectedAdminRoute><AdminArtistForm /></ProtectedAdminRoute>
          </Suspense>} />
          <Route path="artistas/:id/editar" element={<Suspense fallback={<div />}>
            <ProtectedAdminRoute><AdminArtistForm /></ProtectedAdminRoute>
          </Suspense>} />
          <Route path="guests" element={<Suspense fallback={<div />}>
            <ProtectedAdminRoute><AdminGuestPage /></ProtectedAdminRoute>
          </Suspense>} />
          <Route path="events" element={<Suspense fallback={<div />}>
            <ProtectedAdminRoute><AdminEventsPage /></ProtectedAdminRoute>
          </Suspense>} />
          <Route path="aftercare" element={<Suspense fallback={<div />}>
            <ProtectedAdminRoute><AdminAftercare /></ProtectedAdminRoute>
          </Suspense>} />

          <Route path="landing" element={<Suspense fallback={<div />}>
            <ProtectedAdminRoute><AdminLandingPage /></ProtectedAdminRoute>
          </Suspense>} />
          <Route path="ficha-anamnese" element={<Suspense fallback={<div />}>
            <ProtectedAdminRoute><AdminFichaAnamnese /></ProtectedAdminRoute>
          </Suspense>} />
          <Route path="fichas" element={<Suspense fallback={<div />}>
            <ProtectedAdminRoute><AdminFichaSubmissions /></ProtectedAdminRoute>
          </Suspense>} />
          <Route path="configuracoes" element={<Suspense fallback={<div />}>
            <ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>
          </Suspense>} />
          <Route path="financeiro" element={<Suspense fallback={<div />}>
            <ProtectedFinanceiroRoute><AdminFinanceiro /></ProtectedFinanceiroRoute>
          </Suspense>} />
          <Route path="billing" element={<Suspense fallback={<div />}><BillingPage /></Suspense>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
  );
}
