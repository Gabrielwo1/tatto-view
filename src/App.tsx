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
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTattoos from './pages/admin/AdminTattoos';
import AdminTattooForm from './pages/admin/AdminTattooForm';
import AdminArtists from './pages/admin/AdminArtists';
import AdminArtistForm from './pages/admin/AdminArtistForm';
import AdminSettings from './pages/admin/AdminSettings';
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
import SiteFooter from './components/SiteFooter';
import VitrinLandingPage from './pages/VitrinLandingPage';
import FichaAnamnesePage from './pages/FichaAnamnesePage';

// Returns true when the current hostname is the root vitrink.app marketing domain.
function isMarketingDomain() {
  const h = window.location.hostname.toLowerCase().replace(/^www\./, '');
  return h === 'vitrink.app' || h === 'localhost.vitrink' /* dev convenience */;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((state) => state.isAdmin);
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
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
  const themeId        = useStore((s) => s.themeId);
  const customPrimary  = useStore((s) => s.customPrimary);
  const customSecondary = useStore((s) => s.customSecondary);

  // Apply theme + custom overrides on mount and whenever they change
  useEffect(() => {
    const id = (themeId && THEMES[themeId]) ? themeId : getThemeForHostname(window.location.hostname);
    applyTheme(id);
    applyCustomColors(customPrimary, customSecondary);
  }, [themeId, customPrimary, customSecondary]);

  useEffect(() => {
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
          path="/merchs"
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
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tatuagens" element={<AdminTattoos />} />
          <Route path="tatuagens/nova" element={<AdminTattooForm />} />
          <Route path="tatuagens/:id/editar" element={<AdminTattooForm />} />
          <Route path="artistas" element={<AdminArtists />} />
          <Route path="artistas/novo" element={<AdminArtistForm />} />
          <Route path="artistas/:id/editar" element={<AdminArtistForm />} />
          <Route path="guests" element={<AdminGuestPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="aftercare" element={<AdminAftercare />} />
          <Route path="sobre-nos" element={<AdminSobreNos />} />
          <Route path="landing" element={<AdminLandingPage />} />
          <Route path="ficha-anamnese" element={<AdminFichaAnamnese />} />
          <Route path="fichas" element={<AdminFichaSubmissions />} />
          <Route path="configuracoes" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
