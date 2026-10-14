import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { AuthModal } from './components/AuthModal.js';
import { HomePage } from './pages/HomePage.js';
import { FindDonorsPage } from './pages/FindDonorsPage.js';
import { RequestBloodPage } from './pages/RequestBloodPage.js';
import { CampaignsPage } from './pages/CampaignsPage.js';
import { DonationGuidePage } from './pages/DonationGuidePage.js';
import { AboutUsPage } from './pages/AboutUsPage.js';
import { ContactUsPage } from './pages/ContactUsPage.js';
import { DonorDashboard } from './pages/DonorDashboard.js';
import { RequesterDashboard } from './pages/RequesterDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';

// Route Guard for Protected Roles
const ProtectedRoute: React.FC<{
  allowedRoles: Array<'ADMIN' | 'DONOR' | 'REQUESTER'>;
  children: React.ReactNode;
  onOpenAuth: (tab: 'login' | 'register') => void;
}> = ({ allowedRoles, children, onOpenAuth }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-xs text-neutral-500">
        Verifying secure session...
      </div>
    );
  }

  if (!user) {
    onOpenAuth('login');
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'DONOR') return <Navigate to="/donor/dashboard" replace />;
    return <Navigate to="/requester/dashboard" replace />;
  }

  return <>{children}</>;
};

const MainLayout: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const location = useLocation();

  const isDashboardRoute = location.pathname.includes('/dashboard');

  const handleOpenAuth = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {!isDashboardRoute && <Navbar onOpenAuth={handleOpenAuth} />}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenAuth={handleOpenAuth} />} />
          <Route path="/find-donors" element={<FindDonorsPage onOpenAuth={handleOpenAuth} />} />
          <Route path="/request-blood" element={<RequestBloodPage onOpenAuth={handleOpenAuth} />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/donation-guide" element={<DonationGuidePage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />

          {/* Protected Dashboards */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['DONOR']} onOpenAuth={handleOpenAuth}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requester/dashboard"
            element={
              <ProtectedRoute allowedRoles={['REQUESTER']} onOpenAuth={handleOpenAuth}>
                <RequesterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']} onOpenAuth={handleOpenAuth}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isDashboardRoute && <Footer />}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}
