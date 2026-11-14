import React, { useState, useEffect } from 'react';
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
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { currentUser, isAdmin } = useAuth();

  // Tab State with GitHub Pages Hash Routing support
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (['home', 'menu', 'deals', 'checkout', 'track', 'account', 'auth', 'admin', 'about'].includes(hash)) {
        return hash;
      }
    }
    return 'home';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');

  // Sync hash with activeTab
  useEffect(() => {
    window.location.hash = `#/${activeTab}`;
  }, [activeTab]);

  // Listen to hash changes from back/forward browser buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash && ['home', 'menu', 'deals', 'checkout', 'track', 'account', 'auth', 'admin', 'about'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handlers
  const handleOrderNow = () => {
    setActiveTab('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreDeals = () => {
    setActiveTab('deals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToCheckout = () => {
    setActiveTab('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (orderId: string) => {
    setTrackingOrderId(orderId);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackSpecificOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If activeTab is admin, render secure admin flow
  if (activeTab === 'admin') {
    if (isAdmin) {
      return (
        <AdminDashboard
          onBackToStore={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    } else {
      return (
        <div className="min-h-screen bg-neutral-950 flex flex-col justify-between">
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <AdminLogin
            onSuccess={() => {
              setActiveTab('admin');
            }}
            onBackToStore={() => {
              setActiveTab('home');
            }}
          />
          <Footer
            setActiveTab={setActiveTab}
          />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500 selection:text-neutral-950">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'auth') {
            setIsAuthModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Main Pages */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            {/* Scroll-based 3D Rotating Burger Hero Section */}
            <HeroSection
              onOrderNow={handleOrderNow}
              onExploreDeals={handleExploreDeals}
            />
            {/* Front Page Food Discovery (Circular Category Bar, Best Sellers, Featured Deals, Full Food Collection) */}
            <FoodDiscoverySection
              onExploreAllDeals={handleExploreDeals}
            />
            {/* Restaurant Story, Hours & Walton Cantt Map Section */}
            <AboutSection />
          </>
        )}

        {activeTab === 'menu' && (
          <div className="pt-4">
            <MenuSection />
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="pt-4">
            <DealsSection onBackToMenu={handleOrderNow} />
          </div>
        )}

        {activeTab === 'checkout' && (
          <CheckoutPage
            onBackToMenu={() => setActiveTab('menu')}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {activeTab === 'track' && (
          <OrderTrackingPage
            initialOrderId={trackingOrderId}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'account' && (
          <CustomerAccountPage
            onTrackOrder={handleTrackSpecificOrder}
            onExploreMenu={handleOrderNow}
          />
        )}

        {activeTab === 'about' && (
          <div className="pt-4">
            <AboutSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
      />

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
          setActiveTab('account');
        }}
      />

      {/* First-Visit & Change-Location 10 KM Delivery Area Modal */}
      <DeliveryAreaModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
