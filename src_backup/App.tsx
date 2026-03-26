import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { trackPageView } from './lib/analytics';
import { useStore } from './store';
import { applyTheme, applyCustomColors, getThemeForHostname, THEMES } from './lib/themes';
import Navbar from './components/Navbar';
import ShowcasePage from './pages/ShowcasePage';
import ArchivedPage from './pages/ArchivedPage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistDetailPage from './pages/ArtistDetailPage';
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
import AftercareePage from './pages/AftercareePage';
import SobreNosPage from './pages/SobreNosPage';
import AdminSobreNos from './pages/admin/AdminSobreNos';
import AdminAftercare from './pages/admin/AdminAftercare';
import AdminLandingPage from './pages/admin/AdminLandingPage';
import AdminFichaAnamnese from './pages/admin/AdminFichaAnamnese';
import AdminFichaSubmissions from './pages/admin/AdminFichaSubmissions';
import AdminMyProfile from './pages/admin/AdminMyProfile';
import SiteFooter from './components/SiteFooter';
import VitrinLandingPage from './pages/VitrinLandingPage';
import FichaAnamnesePage from './pages/FichaAnamnesePage';

// Returns true when the current hostname is the root vitrink.app marketing domain.
function isMarketingDomain() {
  const h = window.location.hostname.toLowerCase().replace(/^www\./, '');
  return h === 'vitrink.app' || h === 'localhost.vitrink' /* dev convenience */;
}

// Requires super admin
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((state) => state.isAdmin);
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

// Allows both super admin and artist users
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((state) => state.isAdmin);
  const isArtist = useStore((state) => state.isArtist);
  const isMerchManager = useStore((state) => state.isMerchManager);
  if (!isAdmin && !isArtist && !isMerchManager) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

// Allows admin or merch manager only
function ProtectedMerchRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((state) => state.isAdmin);
  const isMerchManager = useStore((state) => state.isMerchManager);
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

  // Apply custom favicon dynamically
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) link.href = customFavicon ?? '/dudeicone.png';
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
    <BrowserRouter>
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
          path="/artistas/:id"
          element={
            <PublicLayout>
              <ArtistDetailPage />
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
              <AftercareePage />
            </PublicLayout>
          }
        />
        <Route
          path="/sobre-nos"
          element={
            <PublicLayout>
              <SobreNosPage />
            </PublicLayout>
          }
        />

        {/* Landing page */}
        <Route path="/landingpage" element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        } />

        {/* Ficha de Anamnese */}
        <Route path="/ficha-anamnese" element={
          <PublicLayout>
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
          <Route path="sobre-nos" element={<ProtectedAdminRoute><AdminSobreNos /></ProtectedAdminRoute>} />
          <Route path="landing" element={<ProtectedAdminRoute><AdminLandingPage /></ProtectedAdminRoute>} />
          <Route path="ficha-anamnese" element={<ProtectedAdminRoute><AdminFichaAnamnese /></ProtectedAdminRoute>} />
          <Route path="fichas" element={<ProtectedAdminRoute><AdminFichaSubmissions /></ProtectedAdminRoute>} />
          <Route path="configuracoes" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
