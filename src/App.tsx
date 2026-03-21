import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
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
import GuestsPage from './pages/GuestsPage';
import MerchsPage from './pages/MerchsPage';
import LandingPage from './pages/LandingPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((state) => state.isAdmin);
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  const loadData = useStore((s) => s.loadData);

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
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
          path="/merchs"
          element={
            <PublicLayout>
              <MerchsPage />
            </PublicLayout>
          }
        />

        {/* Landing page — standalone, no Navbar */}
        <Route path="/landingpage" element={<LandingPage />} />

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
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
