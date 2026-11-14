import React, { useState, useEffect, useCallback } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { FoodDiscoverySection } from './components/home/FoodDiscoverySection';
import { DealsSection } from './components/home/DealsSection';
import { MenuSection } from './components/menu/MenuSection';
import { AboutSection } from './components/home/AboutSection';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderTrackingPage } from './components/tracking/OrderTrackingPage';
import { CustomerAuthModal } from './components/customer/CustomerAuthModal';
import { CustomerAccountPage } from './components/customer/CustomerAccountPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DeliveryAreaModal } from './components/delivery/DeliveryAreaModal';
import { ReviewPromptModal } from './components/reviews/ReviewPromptModal';
import { storageService } from './services/storageService';
import { Order } from './types';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const REVIEW_PROMPT_STATE_KEY = 'asp_review_prompt_state_v1';

const ADMIN_ROUTE_TO_TAB: Record<string, string> = {
  overview: 'overview',
  deals: 'deals',
  categories: 'categories',
  banners: 'banners',
  orders: 'orders',
  analytics: 'reports',
  reports: 'reports',
  customers: 'crm',
  crm: 'crm',
  'delivery-settings': 'delivery',
  delivery: 'delivery',
  settings: 'settings',
  tracking: 'tracking',
  products: 'products',
  payments: 'payments',
  verification: 'verification',
  coupons: 'coupons',
  reviews: 'reviews',
  content: 'content',
  notifications: 'notifications',
  recycle_bin: 'recycle_bin',
  staff: 'staff',
  security: 'security',
  profile: 'profile'
};

const ADMIN_TAB_TO_ROUTE: Record<string, string> = {
  overview: '',
  reports: 'analytics',
  crm: 'customers',
  delivery: 'delivery-settings'
};

function resolveActiveTabFromPath(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean || clean === 'home') return 'home';
  if (clean === 'admin' || clean.startsWith('admin/')) return 'admin';
  if (clean === 'cart') return 'menu';
  if (['menu', 'deals', 'checkout', 'track', 'account', 'about'].includes(clean)) {
    return clean;
  }
  return 'home';
}

function resolveAdminSectionFromPath(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean.startsWith('admin/')) return 'overview';
  const sub = clean.slice('admin/'.length).split('/')[0];
  return ADMIN_ROUTE_TO_TAB[sub] || 'overview';
}

function getReviewPromptState(): Record<string, 'dismissed' | 'submitted'> {
  try {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(REVIEW_PROMPT_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setReviewPromptStatus(orderId: string, status: 'dismissed' | 'submitted'): void {
  try {
    if (typeof window === 'undefined') return;
    const state = getReviewPromptState();
    state[orderId] = status;
    localStorage.setItem(REVIEW_PROMPT_STATE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

function AppContent() {
  const { isAdmin } = useAuth();
  const { isCartOpen, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');
  const [pendingReviewOrder, setPendingReviewOrder] = useState<Order | null>(null);

  const activeTab = resolveActiveTabFromPath(location.pathname);
  const adminSection = resolveAdminSectionFromPath(location.pathname);

  // Sync `/#/cart` route cleanly with slide-over CartDrawer
  useEffect(() => {
    const clean = location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (clean === 'cart') {
      setIsCartOpen(true);
    }
  }, [location.pathname, setIsCartOpen]);

  useEffect(() => {
    const clean = location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (clean === 'cart' && !isCartOpen) {
      navigate('/menu', { replace: true });
    }
  }, [isCartOpen, location.pathname, navigate]);

  const handleSetActiveTab = useCallback(
    (tab: string) => {
      if (tab === 'auth') {
        setIsAuthModalOpen(true);
        return;
      }
      const target = tab === 'home' ? '/' : `/${tab}`;
      navigate(target);
    },
    [navigate]
  );

  // Handlers
  const handleOrderNow = () => {
    navigate('/menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreDeals = () => {
    navigate('/deals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (orderId: string) => {
    setTrackingOrderId(orderId);
    navigate('/track');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Open review prompt strictly after createOrder() succeeded and only if not already dismissed/reviewed
    const promptState = getReviewPromptState();
    const placed = storageService.getOrderById(orderId);
    if (
      placed &&
      !promptState[orderId] &&
      !storageService.hasReviewForOrder(orderId)
    ) {
      setTimeout(() => {
        setPendingReviewOrder(placed);
      }, 650);
    }
  };

  const handleTrackSpecificOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    navigate('/track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminSectionChange = (sectionId: string) => {
    const routeSegment =
      sectionId in ADMIN_TAB_TO_ROUTE ? ADMIN_TAB_TO_ROUTE[sectionId] : sectionId;
    navigate(routeSegment ? `/admin/${routeSegment}` : '/admin');
  };

  // Secure Admin Route Rendering
  if (activeTab === 'admin') {
    if (isAdmin) {
      return (
        <AdminDashboard
          initialSection={adminSection}
          onSectionChange={handleAdminSectionChange}
          onBackToStore={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-between">
        <Navbar activeTab={activeTab} setActiveTab={handleSetActiveTab} />
        <AdminLogin
          onSuccess={() => {
            if (location.pathname === '/' || !location.pathname.startsWith('/admin')) {
              navigate('/admin');
            }
          }}
          onBackToStore={() => {
            navigate('/');
          }}
        />
        <Footer setActiveTab={handleSetActiveTab} />
      </div>
    );
  }

  const renderHomePage = () => (
    <>
      {/* Scroll-based 3D Rotating Burger Hero Section */}
      <HeroSection onOrderNow={handleOrderNow} onExploreDeals={handleExploreDeals} />
      {/* Front Page Food Discovery (Circular Category Bar, Best Sellers, Featured Deals, Full Food Collection) */}
      <FoodDiscoverySection onExploreAllDeals={handleExploreDeals} />
      {/* Restaurant Story, Hours & Walton Cantt Map Section */}
      <AboutSection />
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500 selection:text-neutral-950">
      {/* Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={handleSetActiveTab} />

      {/* Main Pages */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={renderHomePage()} />
          <Route path="/home" element={renderHomePage()} />
          <Route
            path="/menu"
            element={
              <div className="pt-4">
                <MenuSection />
              </div>
            }
          />
          <Route
            path="/cart"
            element={
              <div className="pt-4">
                <MenuSection />
              </div>
            }
          />
          <Route
            path="/deals"
            element={
              <div className="pt-4">
                <DealsSection onBackToMenu={handleOrderNow} />
              </div>
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                onBackToMenu={() => navigate('/menu')}
                onOrderSuccess={handleOrderSuccess}
              />
            }
          />
          <Route
            path="/track"
            element={
              <OrderTrackingPage
                initialOrderId={trackingOrderId}
                onNavigateHome={() => navigate('/')}
              />
            }
          />
          <Route
            path="/account"
            element={
              <CustomerAccountPage
                onTrackOrder={handleTrackSpecificOrder}
                onExploreMenu={handleOrderNow}
              />
            }
          />
          <Route
            path="/about"
            element={
              <div className="pt-4">
                <AboutSection />
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer setActiveTab={handleSetActiveTab} />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={handleProceedToCheckout}
        onExploreMenu={handleOrderNow}
      />

      {/* Customer Registration / Sign In Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          navigate('/account');
        }}
      />

      {/* First-Visit & Change-Location 10 KM Delivery Area Modal */}
      <DeliveryAreaModal />

      {/* Post-Order Customer Review Popup */}
      {pendingReviewOrder && (
        <ReviewPromptModal
          order={pendingReviewOrder}
          isOpen={Boolean(pendingReviewOrder)}
          onDismiss={() => {
            setReviewPromptStatus(pendingReviewOrder.id, 'dismissed');
            setPendingReviewOrder(null);
          }}
          onSubmitted={(reviewedOrderId) => {
            setReviewPromptStatus(reviewedOrderId, 'submitted');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  );
}
