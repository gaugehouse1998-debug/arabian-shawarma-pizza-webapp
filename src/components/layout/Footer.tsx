import React, { useState } from 'react';
import { Phone, MapPin, Clock, CreditCard, Shield, ExternalLink, ChevronRight, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const { restaurantSettings: settings, openLocationModal, selectedZone, verifiedLocation } = useCart();

  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 text-sm mt-20">
      {/* Primary Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Col 1: Brand & Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-600 to-amber-500 p-0.5 shadow-lg shadow-red-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center p-1.5 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Arabian Shawarma & Pizza"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-base tracking-tight font-display">
                {settings.name}
              </h3>
              <p className="text-xs text-neutral-400">Authentic Taste & Quality</p>
            </div>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Proudly serving Cavalry Ground, Walton Cantt, and surrounding Lahore neighborhoods with freshly roasted authentic Arabian shawarmas, hand-tossed artisan pizzas, and mouthwatering deals.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('menu')}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-2 rounded-lg transition-colors"
            >
              <span>Explore Online Menu Listings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Col 2: Location & Contact */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider font-display">
            Location & Hours
          </h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                {settings.address}, {settings.city}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Open Daily: 1:00 PM – 3:00 AM (7 Days a week)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex flex-col">
                <a href={`tel:${settings.phone1}`} className="hover:text-amber-400 font-mono">
                  {settings.phone1}
                </a>
                <a href={`tel:${settings.phone2}`} className="hover:text-amber-400 font-mono">
                  {settings.phone2}
                </a>
              </div>
            </li>
            <li className="pt-1">
              <button
                type="button"
                onClick={openLocationModal}
                className="text-amber-400 hover:text-amber-300 font-semibold underline text-left cursor-pointer"
              >
                Delivery Radius: {settings.deliveryRadiusKm ?? 10} KM ·{' '}
                {verifiedLocation?.selectedAreaName || selectedZone?.name || 'Change Location'}
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Quick Navigation */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider font-display">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => setActiveTab('menu')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <ChevronRight className="w-3 h-3 text-neutral-600" />
                <span>Stone-Baked Pizzas</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('deals')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <ChevronRight className="w-3 h-3 text-neutral-600" />
                <span>Regular Deals 01 – 29</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('menu')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <ChevronRight className="w-3 h-3 text-neutral-600" />
                <span>Arabian Shawarma & Platters</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('track')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <ChevronRight className="w-3 h-3 text-neutral-600" />
                <span>Live Order Tracking</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('admin')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1 text-amber-400/90"
              >
                <Shield className="w-3 h-3 text-amber-500" />
                <span>Admin CRM Portal</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Payments & Security */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider font-display">
            Accepted Payments
          </h4>
          <p className="text-xs text-neutral-400">
            Instant manual verification available for all major Pakistani payment networks:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-neutral-200">Cash on Delivery</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-neutral-200">Easypaisa</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-neutral-200">JazzCash</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-neutral-200">Bank Transfer</span>
            </div>
          </div>
          <div className="text-[11px] text-neutral-500 pt-1">
            Meezan Bank & Bank Alfalah accounts configured with instant receipt uploads.
          </div>
        </div>
      </div>

      {/* Bottom Legal Strip */}
      <div className="border-t border-neutral-900 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>
            © {new Date().getFullYear()} {settings.name}. All Rights Reserved. Prepared for GitHub Pages deployment.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLegalModal('privacy')}
              className="hover:text-neutral-200 transition-colors"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => setLegalModal('terms')}
              className="hover:text-neutral-200 transition-colors"
            >
              Terms of Service
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-amber-500 hover:text-amber-400 transition-colors"
            >
              Staff Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Legal Information Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-xl w-full rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white font-display">
                {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <button
                onClick={() => setLegalModal(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-neutral-300 leading-relaxed">
              {legalModal === 'privacy' ? (
                <>
                  <p>
                    <strong>Arabian Shawarma & Pizza</strong> respects your privacy. We collect your delivery name, telephone number, delivery address, and payment transaction references solely to fulfill your meal orders and provide live tracking status.
                  </p>
                  <p>
                    We do not store bank debit/credit card CVV details. All Easypaisa, JazzCash, and bank transfers are processed manually using official transaction identifiers verified by restaurant dispatch staff.
                  </p>
                  <p>
                    For inquiries, contact us directly at {settings.phone1} or visit our location in Cavalry Ground, Walton Cantt, Lahore.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Order Placement & Delivery:</strong> Orders placed through the website are prepared fresh to order. Delivery times typically range between 25–45 minutes depending on location (Cavalry Ground, Walton Cantt, DHA, Gulberg).
                  </p>
                  <p>
                    <strong>Payment Verification:</strong> Orders selecting Easypaisa, JazzCash, or Bank Transfer require entering a valid transaction ID or uploading a screenshot. False or fabricated transaction IDs will result in immediate cancellation.
                  </p>
                  <p>
                    <strong>Pricing:</strong> All menu prices are in Pakistani Rupees (PKR) and match the printed menu rates.
                  </p>
                </>
              )}
            </div>
            <div className="pt-3 border-t border-neutral-800 text-right">
              <button
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 bg-amber-500 text-neutral-950 font-semibold text-xs rounded-lg hover:bg-amber-400"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
