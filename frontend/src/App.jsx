import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { MainLayout } from './layouts/MainLayout';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';

// Pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AnnouncementsPage } from './pages/admin/AnnouncementsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StockEntryPage } from './pages/staff/StockEntryPage';

// Viewer Pages
import { ViewerHomePage } from './pages/viewer/ViewerHomePage';
import { BrowseProductsPage } from './pages/viewer/BrowseProductsPage';
import { CartPage } from './pages/viewer/CartPage';
import { MyOrdersPage } from './pages/viewer/MyOrdersPage';
import { TrackOrderPage } from './pages/viewer/TrackOrderPage';
import { ProfilePage } from './pages/viewer/ProfilePage';

// Shared Management Pages
import { InventoryPage } from './pages/shared/InventoryPage';
import { CategoriesPage } from './pages/shared/CategoriesPage';
import { SuppliersPage } from './pages/shared/SuppliersPage';
import { OrdersPage } from './pages/shared/OrdersPage';
import { ReturnsPage } from './pages/shared/ReturnsPage';
import { StockMovementsPage } from './pages/shared/StockMovementsPage';
import { MessagingPage } from './pages/shared/MessagingPage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { ReportsPage } from './pages/shared/ReportsPage';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <LoadingSkeleton variant="card" height={100} width={200} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

const HomeRedirect = () => {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'STAFF') return <Navigate to="/staff/dashboard" replace />;
  return <Navigate to="/viewer/home" replace />;
};

export const App = () => {
  const theme = useSelector((state) => state.ui?.theme) || 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Root Redirect according to Role */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/dashboard" element={<HomeRedirect />} />

        {/* Authenticated Layout Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Admin Dedicated Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/inventory" element={<InventoryPage />} />
              <Route path="/admin/categories" element={<CategoriesPage />} />
              <Route path="/admin/suppliers" element={<SuppliersPage />} />
              <Route path="/admin/orders" element={<OrdersPage />} />
              <Route path="/admin/returns" element={<ReturnsPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/stock-movements" element={<StockMovementsPage />} />
              <Route path="/admin/stock-history" element={<StockMovementsPage />} />
              <Route path="/admin/messages" element={<MessagingPage />} />
              <Route path="/admin/notifications" element={<NotificationsPage />} />
              <Route path="/admin/alerts" element={<NotificationsPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/admin/announcements" element={<AnnouncementsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
            </Route>

            {/* Staff Dedicated Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/inventory" element={<InventoryPage />} />
              <Route path="/staff/stock-entry" element={<StockEntryPage />} />
              <Route path="/staff/orders" element={<OrdersPage />} />
              <Route path="/staff/returns" element={<ReturnsPage />} />
              <Route path="/staff/reports" element={<ReportsPage />} />
              <Route path="/staff/stock-movements" element={<StockMovementsPage />} />
              <Route path="/staff/stock-history" element={<StockMovementsPage />} />
              <Route path="/staff/messages" element={<MessagingPage />} />
              <Route path="/staff/notifications" element={<NotificationsPage />} />
              <Route path="/staff/alerts" element={<NotificationsPage />} />
            </Route>

            {/* Viewer Dedicated Routes */}
            <Route element={<ProtectedRoute allowedRoles={['VIEWER']} />}>
              <Route path="/viewer" element={<Navigate to="/viewer/home" replace />} />
              <Route path="/viewer/home" element={<ViewerHomePage />} />
              <Route path="/viewer/products" element={<BrowseProductsPage />} />
              <Route path="/viewer/browse" element={<BrowseProductsPage />} />
              <Route path="/viewer/categories" element={<CategoriesPage />} />
              <Route path="/viewer/cart" element={<CartPage />} />
              <Route path="/viewer/orders" element={<MyOrdersPage />} />
              <Route path="/viewer/returns" element={<ReturnsPage />} />
              <Route path="/viewer/track-order" element={<TrackOrderPage />} />
              <Route path="/viewer/messages" element={<MessagingPage />} />
              <Route path="/viewer/notifications" element={<NotificationsPage />} />
              <Route path="/viewer/alerts" element={<NotificationsPage />} />
              <Route path="/viewer/profile" element={<ProfilePage />} />
            </Route>

            {/* Shared Operations Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />}>
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/stock-movements" element={<StockMovementsPage />} />
              <Route path="/stock-history" element={<StockMovementsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Universally Accessible Authenticated Pages */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'VIEWER']} />}>
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/messages" element={<MessagingPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/alerts" element={<NotificationsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
