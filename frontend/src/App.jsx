import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, ProviderRoute, CustomerRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import NearbyServicesPage from './pages/NearbyServicesPage';
import BookingCreatePage from './pages/BookingCreatePage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import ProviderBookingsPage from './pages/ProviderBookingsPage';
import MyServicesPage from './pages/MyServicesPage';
import ServiceFormPage from './pages/ServiceFormPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/services/nearby" element={<NearbyServicesPage />} />
                <Route path="/services/:id" element={<ServiceDetailPage />} />
                <Route
                  path="/services/:id/book"
                  element={<CustomerRoute><BookingCreatePage /></CustomerRoute>}
                />
                <Route
                  path="/my-bookings"
                  element={<CustomerRoute><MyBookingsPage /></CustomerRoute>}
                />
                <Route
                  path="/bookings/:id"
                  element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>}
                />
                <Route
                  path="/dashboard"
                  element={<ProviderRoute><ProviderDashboardPage /></ProviderRoute>}
                />
                <Route
                  path="/provider-bookings"
                  element={<ProviderRoute><ProviderBookingsPage /></ProviderRoute>}
                />
                <Route
                  path="/my-services"
                  element={<ProviderRoute><MyServicesPage /></ProviderRoute>}
                />
                <Route
                  path="/my-services/new"
                  element={<ProviderRoute><ServiceFormPage /></ProviderRoute>}
                />
                <Route
                  path="/my-services/:id/edit"
                  element={<ProviderRoute><ServiceFormPage /></ProviderRoute>}
                />
                <Route
                  path="/profile"
                  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
                />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
