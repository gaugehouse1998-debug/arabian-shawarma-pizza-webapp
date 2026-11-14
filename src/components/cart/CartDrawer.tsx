import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, Bike, Store, ShieldCheck, AlertCircle, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreMenu: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout, onExploreMenu }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    couponCode,
    couponDiscount,
    couponError,
    couponSuccess,
    applyCoupon,
    removeCoupon,
    deliveryType,
    setDeliveryType,
    activeZones: deliveryZones,
    restaurantSettings: settings,
    selectedZone,
    setSelectedZone,
    openLocationModal,
    subtotal,
    deliveryFee,
    tax,
    total,
    itemCount
  } = useCart();

  const [inputCode, setInputCode] = useState('');

  if (!isCartOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      applyCoupon(inputCode);
    }
  };

  const amountNeededForFreeDelivery = settings.freeDeliveryThreshold - subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col text-neutral-100">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-white font-display">Your Order</h2>
              <span className="text-xs font-mono font-medium bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-neutral-400 hover:text-red-400 transition-colors px-2 py-1"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery Method Selector (Delivery vs Pickup) */}
          <div className="p-3 bg-neutral-950/60 border-b border-neutral-800">
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setDeliveryType('delivery')}
                className={`py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  deliveryType === 'delivery'
                    ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Home Delivery</span>
              </button>
              <button
                onClick={() => setDeliveryType('pickup')}
                className={`py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  deliveryType === 'pickup'
                    ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Takeaway / Pickup</span>
              </button>
            </div>

            {/* Delivery Zone Selector */}
            {deliveryType === 'delivery' && (
              <div className="mt-2 space-y-1.5 text-xs px-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-neutral-400">Area:</span>
                  {deliveryZones.length > 0 ? (
                    <select
                      value={selectedZone?.id || ''}
                      onChange={(e) => {
                        const found = deliveryZones.find((z) => z.id === e.target.value);
                        if (found) setSelectedZone(found);
                      }}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 max-w-[220px] truncate"
                    >
                      {deliveryZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} (+Rs. {zone.fee})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCartOpen(false);
                        openLocationModal();
                      }}
                      className="text-amber-400 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Verify {settings.deliveryRadiusKm ?? 10} KM Radius</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>
                    Min order: Rs. {Math.max(settings.minimumOrderAmount || 0, selectedZone?.minOrder || 0)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      openLocationModal();
                    }}
                    className="text-amber-400 hover:underline font-medium cursor-pointer"
                  >
                    Check 10 KM / Change Location
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Free delivery threshold bar */}
          {deliveryType === 'delivery' && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-[11px] text-amber-300 flex items-center justify-between">
              {amountNeededForFreeDelivery > 0 ? (
                <span>
                  Add <strong className="font-mono text-white">Rs. {amountNeededForFreeDelivery}</strong> more for <strong>FREE Delivery</strong>
                </span>
              ) : (
                <span className="font-semibold text-emerald-400">
                  🎉 You have unlocked FREE Delivery!
                </span>
              )}
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base font-display">Your bag is empty</h3>
                <p className="text-xs text-neutral-400 max-w-xs">
                  Browse our artisanal pizzas, zinger shawarmas, and regular combos to start ordering.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onExploreMenu();
                  }}
                  className="mt-2 px-4 py-2 bg-amber-500 text-neutral-950 font-semibold text-xs rounded-xl hover:bg-amber-400 transition-colors"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 flex items-start gap-3"
                >
                  {/* Item Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-neutral-900 shrink-0 border border-neutral-800"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-semibold text-xs text-white leading-tight truncate">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-500 hover:text-red-400 p-0.5"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Options: Size & Extras */}
                    {item.options?.size && (
                      <div className="text-[11px] text-amber-400 font-medium mt-0.5">
                        Size: {item.options.size.name}
                      </div>
                    )}

                    {item.options?.selectedAddons && item.options.selectedAddons.length > 0 && (
                      <div className="text-[10px] text-neutral-400 space-x-1 mt-0.5">
                        <span>Extras:</span>
                        <span>{item.options.selectedAddons.map((a) => a.name).join(', ')}</span>
                      </div>
                    )}

                    {item.options?.specialInstructions && (
                      <div className="text-[10px] text-neutral-500 italic truncate mt-0.5">
                        Note: "{item.options.specialInstructions}"
                      </div>
                    )}

                    {/* Quantity & Unit Price */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-semibold px-1 text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-xs text-amber-400">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer: Coupon, Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-neutral-950 border-t border-neutral-800 space-y-4">
              {/* Coupon Form */}
              <div className="space-y-1.5">
                {couponCode ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{couponCode} (-Rs. {couponDiscount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-neutral-400 hover:text-red-400 text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Promo code (e.g. WELCOME10)"
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{couponError}</span>
                  </p>
                )}
                {couponSuccess && (
                  <p className="text-[11px] text-emerald-400">
                    {couponSuccess}
                  </p>
                )}
              </div>

              {/* Order Math Summary */}
              <div className="space-y-1.5 text-xs text-neutral-300 pt-2 border-t border-neutral-850">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">Rs. {subtotal.toLocaleString()}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Promo</span>
                    <span className="font-mono">-Rs. {couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>
                    {deliveryType === 'delivery' ? `Delivery (${selectedZone?.name || 'Standard'})` : 'Pickup'}
                  </span>
                  <span className="font-mono">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400">FREE</span>
                    ) : (
                      `Rs. ${deliveryFee.toLocaleString()}`
                    )}
                  </span>
                </div>

                {tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({settings.taxPercentage}%)</span>
                    <span className="font-mono">Rs. {tax.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                  <span>Total Payable</span>
                  <span className="font-mono text-base text-amber-400">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/10 active:scale-95 transition-all flex items-center justify-between"
              >
                <span>Proceed to Checkout</span>
                <div className="flex items-center gap-1 font-mono">
                  <span>Rs. {total.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
