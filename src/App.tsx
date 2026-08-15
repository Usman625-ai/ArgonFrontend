import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { CustomerLayout, DashboardLayout, ProtectedRoute } from './components/layout';
import LandingPage from './pages/auth/LandingPage';
import SlowLoadingOverlay from './components/shared/SlowLoadingOverlay';
import ServerStatusGate from './components/shared/ServerStatusGate';
import ScrollToTop from './components/shared/ScrollToTop';

// Auth pages — LandingPage stays eager (it's the "/" entry route for every
// visitor), everything else is lazy so the first paint on "/" stays light.
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const UnauthorizedPage = lazy(() => import('./pages/auth/UnauthorizedPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const SellersPage = lazy(() => import('./pages/admin/SellersPage'));
const CustomersPage = lazy(() => import('./pages/admin/CustomersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/OrdersPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const CouponsPage = lazy(() => import('./pages/admin/CouponsPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/ReportsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/ProfilePage'));

// Seller pages
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));
const SellerProductsPage = lazy(() => import('./pages/seller/ProductsPage'));
const SellerOrdersPage = lazy(() => import('./pages/seller/OrdersPage'));
const RevenuePage = lazy(() => import('./pages/seller/RevenuePage'));
const SellerSettingsPage = lazy(() => import('./pages/seller/SettingsPage'));
const SellerReportsPage = lazy(() => import('./pages/seller/ReportsPage'));
const SellerProfilePage = lazy(() => import('./pages/seller/ProfilePage'));

// Shop pages
const HomePage = lazy(() => import('./pages/shop/HomePage'));
const ProductsPage = lazy(() => import('./pages/shop/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/shop/ProductDetailPage'));
const AboutPage = lazy(() => import('./pages/shop/AboutPage'));
const SellerStorefrontPage = lazy(() => import('./pages/shop/SellerStorefrontPage'));
const ReviewerProfilePage = lazy(() => import('./pages/shop/ReviewerProfilePage'));
const CartPage = lazy(() => import('./pages/shop/CartPage'));
const CheckoutPage = lazy(() => import('./pages/shop/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/shop/OrdersPage'));
const ProfilePage = lazy(() => import('./pages/shop/ProfilePage'));
const WishlistPage = lazy(() => import('./pages/shop/WishlistPage'));
const NotificationsPage = lazy(() => import('./pages/shop/NotificationsPage'));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

// Stable layout references — created ONCE, not on every App render
const AdminLayoutElement = (
  <ProtectedRoute allowedRoles={['ADMIN']}>
    <DashboardLayout />
  </ProtectedRoute>
);

const SellerLayoutElement = (
  <ProtectedRoute allowedRoles={['SELLER']}>
    <DashboardLayout />
  </ProtectedRoute>
);

// CustomerLayout renders for everyone — browsing is public. Only specific
// sub-routes (cart, checkout, orders, profile, wishlist, notifications) require
// a logged-in CUSTOMER; those are wrapped individually below.

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <ServerStatusGate />
      <SlowLoadingOverlay />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <LoginPage
                onBack={() => window.history.back()}
                onSwitchToRegister={() => {
                  window.location.href = '/register';
                }}
              />
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={AdminLayoutElement}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="sellers" element={<SellersPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>

          {/* Seller Routes */}
          <Route path="/seller" element={SellerLayoutElement}>
            <Route index element={<Navigate to="/seller/dashboard" replace />} />
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="products" element={<SellerProductsPage />} />
            <Route path="orders" element={<SellerOrdersPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="settings" element={<SellerSettingsPage />} />
            <Route path="reports" element={<SellerReportsPage />} />
            <Route path="profile" element={<SellerProfilePage />} />
          </Route>

          {/* Shop Routes — public browsing, gated personal routes */}
          <Route path="/shop" element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="product/:slug" element={<ProductDetailPage />} />
            <Route path="seller/:id" element={<SellerStorefrontPage />} />
            <Route path="reviewer/:id" element={<ReviewerProfilePage />} />

            {/* Requires a logged-in customer */}
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']}><Outlet /></ProtectedRoute>}>
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}