import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserRole } from './contexts/AuthContext';
import { HotelsProvider } from './contexts/HotelsContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { HotelDetailsPage } from './pages/HotelDetailsPage';
import { MapPage } from './pages/MapPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { SupplierDashboard } from './pages/SupplierDashboard';
import { ServiceProviderDashboard } from './pages/ServiceProviderDashboard';
import { ServiceDirectory } from './pages/ServiceDirectory';
import { SupplierDirectory } from './pages/SupplierDirectory';
import { SharedBookingPool } from './pages/SharedBookingPool';
import { AdminDashboard } from './pages/AdminDashboard';
import { Toaster } from 'sonner';
import { StatusGate } from './components/StatusGate';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-neutral-950 text-white">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return <StatusGate>{children}</StatusGate>;
};

function AppContent() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/hotel/:id" element={<HotelDetailsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/services" element={<ServiceDirectory />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
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
          <ProtectedRoute roles={[UserRole.HOTEL_OWNER]}>
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
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <AuthProvider>
          <HotelsProvider>
            <Router>
              <Toaster position="top-center" richColors />
              <AppContent />
            </Router>
          </HotelsProvider>
        </AuthProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}
