import React, { useState } from 'react';
import { ShoppingBag, Phone, Clock, User, Shield, Menu as MenuIcon, X, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    itemCount,
    setIsCartOpen,
    selectedZone,
    verifiedLocation,
    deliveryType,
    restaurantSettings,
    openLocationModal
  } = useCart();
  const { currentUser, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const deliveryLabel =
    deliveryType === 'pickup'
      ? 'Counter Pickup'
      : verifiedLocation?.confirmed && verifiedLocation.selectedAreaName
      ? verifiedLocation.selectedAreaName
      : selectedZone?.name || `Within ${restaurantSettings.deliveryRadiusKm ?? 10} KM`;

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Announcement & Quick Contact Strip */}
      <div className="bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>Open Daily: 1:00 PM – 3:00 AM</span>
            </span>
            <span className="hidden md:inline-block text-neutral-600">·</span>
            <button
              type="button"
              onClick={openLocationModal}
              className="flex items-center gap-1.5 text-neutral-200 hover:text-amber-400 transition-colors truncate cursor-pointer"
              title="Change delivery location"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate max-w-[220px] sm:max-w-[300px]">
                Delivering to: <strong className="text-white">{deliveryLabel}</strong>
              </span>
              <span className="text-amber-400 underline font-semibold shrink-0 ml-1">
                Change Location
              </span>
            </button>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-neutral-300">
            <a
              href="tel:+923222222461"
              className="flex items-center gap-1 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              <Phone className="w-3 h-3 text-amber-500" />
              <span className="font-mono font-medium">0322-2222461</span>
            </a>
            <span className="text-neutral-700">|</span>
            <a
              href="https://wa.me/923222222461?text=Hello%20Arabian%20Shawarma,%20I%20would%20like%20to%20order."
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 font-medium hover:underline whitespace-nowrap text-xs"
            >
              WhatsApp Order
            </a>
          </div>
        </div>
      </div>

      {/* Main Top Bar (Conforms to Frontend Design 3-Zone Contract) */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-600 to-amber-500 p-0.5 shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center p-1.5 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Arabian Shawarma & Pizza"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
            </div>
            <div className="whitespace-nowrap">
              <span className="text-lg font-bold tracking-tight text-white block group-hover:text-amber-400 transition-colors">
                Arabian Shawarma & Pizza
              </span>
              <span className="text-[11px] text-neutral-400 block -mt-0.5">
                Cavalry Ground & Walton Cantt
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (4-5 single-line clean text links) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-300">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'home' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('menu')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'menu' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Full Menu
            </button>
            <button
              onClick={() => handleNavClick('deals')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'deals' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Regular Deals (29)
            </button>
            <button
              onClick={() => handleNavClick('track')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'track' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Track Order
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'about' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              About & Contact
            </button>
          </nav>

          {/* Zone 3: Primary Action & User Affordances */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Account / Admin quick links */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick(isAdmin ? 'admin' : 'account')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-700/80 transition-colors"
                >
                  {isAdmin ? <Shield className="w-3.5 h-3.5 text-amber-400" /> : <User className="w-3.5 h-3.5 text-neutral-400" />}
                  <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={logout}
                  className="text-xs text-neutral-400 hover:text-neutral-200 px-2 py-1.5 hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800 transition-colors whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-neutral-400" />
                <span>Sign In</span>
              </button>
            )}

            {/* Admin Portal Gateway */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`hidden md:flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                isAdmin
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
              }`}
              title="Admin CRM Dashboard"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold text-xs shadow-md shadow-amber-500/10 active:scale-95 transition-all whitespace-nowrap shrink-0"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="bg-neutral-950 text-amber-400 font-mono text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-neutral-800 flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('menu')}
              className="text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 rounded-lg"
            >
              Full Menu
            </button>
            <button
              onClick={() => handleNavClick('deals')}
              className="text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 rounded-lg"
            >
              Regular Deals (29 Combos)
            </button>
            <button
              onClick={() => handleNavClick('track')}
              className="text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 rounded-lg"
            >
              Track Your Order
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 rounded-lg"
            >
              About & Contact Info
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openLocationModal();
              }}
              className="text-left px-3 py-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between"
            >
              <span className="truncate">Delivering to: {deliveryLabel}</span>
              <span className="font-bold underline shrink-0 ml-2">Change Location</span>
            </button>
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between px-3">
              <button
                onClick={() => handleNavClick('auth')}
                className="text-xs text-neutral-300 hover:text-white"
              >
                Customer Sign In
              </button>
              <button
                onClick={() => handleNavClick('admin')}
                className="text-xs text-amber-400 font-medium flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                Admin Dashboard
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
