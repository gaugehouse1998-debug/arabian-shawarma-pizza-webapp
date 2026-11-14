import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, Clock, ShoppingBag, ArrowRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { useCart } from '../../context/CartContext';

interface CustomerAccountPageProps {
  onTrackOrder: (orderId: string) => void;
  onExploreMenu: () => void;
}

export const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({
  onTrackOrder,
  onExploreMenu
}) => {
  const { currentUser, logout, updateCustomerProfile } = useAuth();
  const { addToCart } = useCart();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState(currentUser?.address || '');

  if (!currentUser) return null;

  // Fetch all orders placed by this customer phone
  const cleanPhone = currentUser.phone.replace(/[^0-9]/g, '');
  const customerOrders = storageService
    .getOrders()
    .filter((o) => o.customer.phone.replace(/[^0-9]/g, '') === cleanPhone);

  const customerProfile = storageService.getCustomerByPhone(currentUser.phone);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      name: name.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined
    });
    setIsEditing(false);
  };

  const handleReorder = (order: typeof customerOrders[0]) => {
    order.items.forEach((item) => {
      const product = storageService.getProductById(item.productId);
      const deal = storageService.getDealById(item.productId);
      if (deal) {
        addToCart(deal, undefined, item.quantity, true);
      } else if (product) {
        addToCart(product, item.options, item.quantity, false);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12 space-y-8">
      {/* Top Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
                {currentUser.name}
              </h1>
              {customerProfile?.status === 'vip' && (
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  VIP Patron
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">{currentUser.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-neutral-950 hover:bg-neutral-850 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-medium rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Profile Edit Form if active */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
            Update Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-neutral-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-neutral-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-neutral-300">Default Delivery Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Customer Order History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white font-display">
            Your Past Orders ({customerOrders.length})
          </h2>
          <button
            onClick={onExploreMenu}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Order Something New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {customerOrders.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900/50 rounded-2xl border border-neutral-800 space-y-3">
            <ShoppingBag className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-sm text-neutral-400">You haven't placed any orders yet.</p>
            <button
              onClick={onExploreMenu}
              className="px-4 py-2 bg-amber-500 text-neutral-950 font-semibold text-xs rounded-xl hover:bg-amber-400"
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {customerOrders.map((order) => (
              <div
                key={order.id}
                className="bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">#{order.id}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                        order.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-neutral-500 text-xs">·</span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Items summary */}
                  <p className="text-xs text-neutral-300">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>

                  <div className="text-xs text-neutral-400 flex items-center gap-3">
                    <span>Total: <strong className="font-mono text-white">Rs. {order.total.toLocaleString()}</strong></span>
                    <span>·</span>
                    <span>Payment: <strong className="uppercase text-neutral-300">{order.payment.method}</strong> ({order.payment.status})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>Track Status</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(order)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl transition-colors"
                  >
                    Reorder Items
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
