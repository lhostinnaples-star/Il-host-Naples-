import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, UserRole } from './contexts/AuthContext';
import { HotelsProvider } from './contexts/HotelsContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Navbar } from './components/Navbar';
import { Toaster } from 'sonner';
import { StatusGate } from './components/StatusGate';
import { Footer } from './components/Footer';

const LandingPage = React.lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const SearchResultsPage = React.lazy(() => import('./pages/SearchResultsPage').then(m => ({ default: m.SearchResultsPage })));
const HotelDetailsPage = React.lazy(() => import('./pages/HotelDetailsPage').then(m => ({ default: m.HotelDetailsPage })));
const MapPage = React.lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })));
const ExperienceDetailsPage = React.lazy(() => import('./pages/ExperienceDetailsPage').then(m => ({ default: m.ExperienceDetailsPage })));
const LoginPage = React.lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/AuthPages').then(m => ({ default: m.RegisterPage })));
const CustomerDashboard = React.lazy(() => import('./pages/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
const OwnerDashboard = React.lazy(() => import('./pages/OwnerDashboard').then(m => ({ default: m.OwnerDashboard })));
const SupplierDashboard = React.lazy(() => import('./pages/SupplierDashboard').then(m => ({ default: m.SupplierDashboard })));
const ServiceProviderDashboard = React.lazy(() => import('./pages/ServiceProviderDashboard').then(m => ({ default: m.ServiceProviderDashboard })));
const ServiceDirectory = React.lazy(() => import('./pages/ServiceDirectory').then(m => ({ default: m.ServiceDirectory })));
const SupplierDirectory = React.lazy(() => import('./pages/SupplierDirectory').then(m => ({ default: m.SupplierDirectory })));
const SharedBookingPool = React.lazy(() => import('./pages/SharedBookingPool').then(m => ({ default: m.SharedBookingPool })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const HelpCenterPage = React.lazy(() => import('./pages/HelpCenterPage').then(m => ({ default: m.HelpCenterPage })));
const SafetyCenterPage = React.lazy(() => import('./pages/SafetyCenterPage').then(m => ({ default: m.SafetyCenterPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const InsurancePage = React.lazy(() => import('./pages/InsurancePage').then(m => ({ default: m.InsurancePage })));
const HostGuidelinesPage = React.lazy(() => import('./pages/HostGuidelinesPage').then(m => ({ default: m.HostGuidelinesPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const HowItWorksPage = React.lazy(() => import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-neutral-950 text-white">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return <StatusGate>{children}</StatusGate>;
};

function AppContent() {
  const location = useLocation();
  
  const showFooter = [
    '/',
    '/search',
    '/services',
    '/map',
    '/help',
    '/safety',
    '/terms',
    '/privacy',
    '/insurance',
    '/guidelines',
    '/about',
    '/how-it-works',
  ].includes(location.pathname) || 
  location.pathname.startsWith('/hotel/') || 
  location.pathname.startsWith('/experiences/') ||
  location.pathname.startsWith('/naples/');

  return (
    <div className="min-h-screen">
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F5A623]"></div>
        </div>
      }>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        
        {/* SEO Friendly Area Pages */}
        <Route path="/naples/:area" element={<SearchResultsPage />} />
        
        {/* SEO Friendly Property Pages */}
        <Route path="/naples/:type/:area/:slugWithId" element={<HotelDetailsPage />} />
        <Route path="/hotel/:id" element={<HotelDetailsPage />} />
        
        {/* SEO Friendly Experience Pages */}
        <Route path="/experiences/naples/:category/:slugWithId" element={<ExperienceDetailsPage />} />
        
        <Route path="/map" element={<MapPage />} />
        <Route path="/services" element={<ServiceDirectory />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/safety" element={<SafetyCenterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/insurance" element={<InsurancePage />} />
        <Route path="/guidelines" element={<HostGuidelinesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute roles={[UserRole.CUSTOMER]}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/owner" element={
          <ProtectedRoute roles={[UserRole.HOTEL_OWNER]}>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/supplier" element={
          <ProtectedRoute roles={[UserRole.SUPPLIER]}>
            <SupplierDashboard />
          </ProtectedRoute>
        } />

        <Route path="/service-dashboard" element={
          <ProtectedRoute roles={[UserRole.SERVICE_PROVIDER]}>
            <ServiceProviderDashboard />
          </ProtectedRoute>
        } />

        <Route path="/supplier-directory" element={
          <ProtectedRoute roles={[UserRole.HOTEL_OWNER, UserRole.ADMIN]}>
            <SupplierDirectory />
          </ProtectedRoute>
        } />

        <Route path="/shared-pool" element={
          <ProtectedRoute roles={[UserRole.HOTEL_OWNER]}>
            <SharedBookingPool />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute roles={[UserRole.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      {showFooter && <Footer />}
    </div>
  );
}

import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <SettingsProvider>
          <CurrencyProvider>
            <AuthProvider>
              <HotelsProvider>
                <WishlistProvider>
                  <Router>
                    <Toaster position="top-center" richColors />
                    <AppContent />
                  </Router>
                </WishlistProvider>
              </HotelsProvider>
            </AuthProvider>
          </CurrencyProvider>
        </SettingsProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}
