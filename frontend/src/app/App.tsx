import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/app/theme';
import { AuthProvider } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import PublicLayout from '@/components/PublicLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LandingPage from '@/pages/landing/LandingPage';
import UploadPage from '@/pages/datasets/UploadPage';
import DashboardPage from '@/pages/analytics/DashboardPage';
import AppstoreDashboardPage from '@/pages/analytics/AppstoreDashboardPage';
import InsightsPage from '@/pages/analytics/InsightsPage';
import ForecastPage from '@/pages/forecast/ForecastPage';
import ChatPage from '@/pages/analytics/ChatPage';
import AdminPage from '@/pages/admin/AdminPage';
import LoginPage from '@/pages/login/LoginPage';
import RegisterPage from '@/pages/register/RegisterPage';
import ApiPage from '@/pages/public/ApiPage';
import DocsPage from '@/pages/public/DocsPage';
import AboutPage from '@/pages/public/AboutPage';
import ContactPage from '@/pages/public/ContactPage';
import PrivacyPage from '@/pages/public/PrivacyPage';
import TermsPage from '@/pages/public/TermsPage';
import CookiesPage from '@/pages/public/CookiesPage';
import './App.css';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Public pages with navbar + footer */}
            <Route path="/api" element={<PublicLayout><ApiPage /></PublicLayout>} />
            <Route path="/docs" element={<PublicLayout><DocsPage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
            <Route path="/cookies" element={<PublicLayout><CookiesPage /></PublicLayout>} />

            {/* Protected app routes (with dashboard layout) */}
            <Route path="/app" element={
              <ProtectedRoute>
                <DashboardLayout><UploadPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/dashboard/:id" element={
              <ProtectedRoute>
                <DashboardLayout><DashboardPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/analytics/:id" element={
              <ProtectedRoute>
                <DashboardLayout><AppstoreDashboardPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/insights/:id" element={
              <ProtectedRoute>
                <DashboardLayout><InsightsPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/forecast/:id" element={
              <ProtectedRoute>
                <DashboardLayout><ForecastPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/chat/:id" element={
              <ProtectedRoute>
                <DashboardLayout><ChatPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/admin" element={
              <ProtectedRoute>
                <DashboardLayout><AdminPage /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Backward compat: redirect old protected routes */}
            <Route path="/dashboard/:id" element={<Navigate to={`/app/dashboard/${window.location.pathname.split('/')[2]}`} replace />} />
            <Route path="/analytics/:id" element={<Navigate to={`/app/analytics/${window.location.pathname.split('/')[2]}`} replace />} />
            <Route path="/insights/:id" element={<Navigate to={`/app/insights/${window.location.pathname.split('/')[2]}`} replace />} />
            <Route path="/forecast/:id" element={<Navigate to={`/app/forecast/${window.location.pathname.split('/')[2]}`} replace />} />
            <Route path="/admin" element={<Navigate to="/app/admin" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
