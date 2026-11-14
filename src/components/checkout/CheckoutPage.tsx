import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Store,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Lock,
  Phone,
  Clock,
  QrCode,
  Building,
  Smartphone,
  MapPin,
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { PaymentMethodType, Order } from '../../types';
import { uploadImageToStorage } from '../../firebase/config';

interface CheckoutPageProps {
  onBackToMenu: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToMenu, onOrderSuccess }) => {
  const {
    items,
    clearCart,
    deliveryType,
    setDeliveryType,
    activeZones,
    restaurantSettings: settings,
    selectedZone,
    setSelectedZone,
    verifiedLocation,
    openLocationModal,
    subtotal,
    deliveryFee,
    tax,
    total,
    couponCode,
    couponDiscount
  } = useCart();

  const { currentUser } = useAuth();
  const paymentSettings = storageService.getPaymentSettings();

  // Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city] = useState(settings.city || 'Lahore');
  const [instructions, setInstructions] = useState('');

  const resolvedAreaName =
    deliveryType === 'pickup'
      ? 'Counter Pickup'
      : selectedZone?.name ||
        verifiedLocation?.selectedAreaName ||
        '';

  const effectiveMinOrder =
    deliveryType === 'pickup'
      ? 0
      : Math.max(settings.minimumOrderAmount || 0, selectedZone?.minOrder || 0);

  const deliveryValidation = storageService.validateDeliveryEligibility(
    deliveryType,
    subtotal,
    resolvedAreaName,
    selectedZone?.id || verifiedLocation?.selectedZoneId,
    verifiedLocation
  );

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cod');
  const [selectedBankId, setSelectedBankId] = useState(
    paymentSettings.bankAccounts[0]?.id || ''
  );
  const [transactionId, setTransactionId] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white font-display">No items in your cart</h2>
        <p className="text-sm text-neutral-400">
          Your cart is currently empty. Please select food items from our menu first.
        </p>
        <button
          onClick={onBackToMenu}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  // Handle Screenshot Upload
  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Screenshot file size exceeds 5MB limit.');
        return;
      }
      try {
        const url = await uploadImageToStorage(file, 'payment_screenshots');
        setScreenshotPreview(url);
        setErrorMessage('');
      } catch (err) {
        setErrorMessage('Failed to read image file.');
      }
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Form validations
    if (!name.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage('Please provide a valid Pakistani contact phone number (e.g. 0321-1234567).');
      return;
    }
    if (deliveryType === 'delivery') {
      if (!address.trim()) {
        setErrorMessage('Please enter your complete delivery street address.');
        return;
      }
      const check = storageService.validateDeliveryEligibility(
        'delivery',
        subtotal,
        resolvedAreaName,
        selectedZone?.id || verifiedLocation?.selectedZoneId,
        verifiedLocation
      );
      if (!check.valid) {
        setErrorMessage(
          check.error ||
            'Please verify your delivery area or location before placing a delivery order.'
        );
        return;
      }
    }

    // Payment validation for non-COD
    if (paymentMethod !== 'cod' && !transactionId.trim() && !screenshotPreview) {
      setErrorMessage(
        'Please enter the Transaction ID (TID) or upload your payment transfer screenshot to proceed.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Find selected bank details if bank transfer
      const bankInfo = paymentSettings.bankAccounts.find((b) => b.id === selectedBankId);

      // Create Order with server/service-level authoritative fee & eligibility checks
      const newOrder: Omit<Order, 'id' | 'createdAt' | 'statusHistory'> = {
        orderType: deliveryType,
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: deliveryType === 'delivery' ? address.trim() : 'Pickup from Restaurant Counter',
          area: resolvedAreaName || 'Within Delivery Radius',
          city,
          instructions: instructions.trim() || undefined
        },
        items,
        subtotal,
        discount: couponDiscount,
        couponCode: couponCode || undefined,
        deliveryFee,
        tax,
        total,
        status: 'order_placed',
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'unpaid' : 'pending_verification',
          transactionId: transactionId.trim() || undefined,
          screenshotUrl: screenshotPreview || undefined,
          bankName: paymentMethod === 'bank_transfer' ? bankInfo?.bankName : undefined,
          bankAccountTitle: paymentMethod === 'bank_transfer' ? bankInfo?.accountTitle : undefined,
          accountNumber: paymentMethod === 'bank_transfer' ? bankInfo?.accountNumber : undefined
        },
        notes: instructions.trim() || undefined
      };

      const placedOrder = storageService.createOrder(newOrder, {
        selectedZoneId: selectedZone?.id || verifiedLocation?.selectedZoneId,
        verifiedLocation
      });

      // Trigger Confetti Celebratory Burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignore in environments where canvas is restricted
      }

      // Clear cart
      clearCart();

      // Navigate to order tracking
      onOrderSuccess(placedOrder.id);
    } catch (err) {
      console.error('Order creation error:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while placing your order. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  const activeBank = paymentSettings.bankAccounts.find((b) => b.id === selectedBankId) || paymentSettings.bankAccounts[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
      {/* Top back link */}
      <button
        onClick={onBackToMenu}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continue Browsing Menu</span>
      </button>

      <div className="pb-6 mb-6 border-b border-neutral-900">
        <h1 className="text-3xl font-extrabold text-white font-display">
          Complete Your Order
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Review your delicious meal details, select payment method, and confirm dispatch.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Details & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Contact Info */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Contact & Delivery Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-300 font-medium">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ali Ahmed"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-300 font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0321-1234567"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-medium">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For digital order invoice"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {deliveryType === 'delivery' ? (
                <>
                  {/* Delivery Area & 10 KM Radius Verification Box */}
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      deliveryValidation.valid
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          {verifiedLocation?.confirmed
                            ? `Verified Location: ${verifiedLocation.selectedAreaName || resolvedAreaName}`
                            : selectedZone
                            ? `Selected Area: ${selectedZone.name}`
                            : 'Delivery Location Verification Required'}
                        </span>
                      </div>
                      <div className="text-[11px] opacity-90">
                        {deliveryValidation.valid
                          ? `Delivery radius: ${settings.deliveryRadiusKm ?? 10} KM · Min order: Rs. ${effectiveMinOrder.toLocaleString()}`
                          : deliveryValidation.error}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={openLocationModal}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Change / Check {settings.deliveryRadiusKm ?? 10} KM</span>
                      </button>
                      {settings.pickupAvailable && (
                        <button
                          type="button"
                          onClick={() => setDeliveryType('pickup')}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-[11px] font-medium cursor-pointer"
                        >
                          Pickup
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-300 font-medium">
                        Delivery Area *
                      </label>
                      {activeZones.length > 0 ? (
                        <select
                          value={selectedZone?.id || ''}
                          onChange={(e) => {
                            const found = activeZones.find((z) => z.id === e.target.value);
                            if (found) setSelectedZone(found);
                          }}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          {!selectedZone && (
                            <option value="">-- Select Active Delivery Area --</option>
                          )}
                          {activeZones.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.name} (Rs. {zone.fee} · Min Rs. {zone.minOrder})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          readOnly
                          value={resolvedAreaName || 'Verify location via GPS check above'}
                          className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-300"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-300 font-medium">City</label>
                      <input
                        type="text"
                        disabled
                        value={selectedZone?.city || city}
                        className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-400 font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {selectedZone?.instructions && (
                    <div className="text-[11px] text-neutral-400 bg-neutral-950/70 border border-neutral-800 rounded-xl px-3 py-2">
                      <strong>Area Note:</strong> {selectedZone.instructions}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs text-neutral-300 font-medium">Complete Street Address *</label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/Apartment #, Street, Nearby Landmark..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">Counter Pickup Selected</div>
                    <div>Please collect your order at: {settings.address}, {settings.city}</div>
                  </div>
                  {settings.deliveryAvailable && (
                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 text-[11px] font-semibold shrink-0 cursor-pointer"
                    >
                      Switch to Delivery
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-medium">Delivery / Kitchen Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Ring bell twice, deliver to security gate, extra sauce..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Step 2: Payment Method (CRITICAL: COD, Easypaisa, JazzCash, Bank Transfer) */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Payment Method</span>
                </h2>
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Manual Verified</span>
                </span>
              </div>

              {/* Payment Method Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'cod'
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Truck className="w-4 h-4 text-emerald-400 mb-1" />
                  <div className="text-xs font-bold leading-tight">Cash on Delivery</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Pay at Doorstep</div>
                </button>

                {/* Easypaisa */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('easypaisa')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'easypaisa'
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-green-400 mb-1" />
                  <div className="text-xs font-bold leading-tight">Easypaisa</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Mobile Transfer</div>
                </button>

                {/* JazzCash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('jazzcash')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'jazzcash'
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-red-400 mb-1" />
                  <div className="text-xs font-bold leading-tight">JazzCash</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Mobile Transfer</div>
                </button>

                {/* Bank Transfer */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <Building className="w-4 h-4 text-blue-400 mb-1" />
                  <div className="text-xs font-bold leading-tight">Bank Transfer</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Online / ATM / IBAN</div>
                </button>
              </div>

              {/* Dynamic Payment Instruction Panel */}
              {paymentMethod === 'easypaisa' && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-green-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400 font-bold uppercase tracking-wider">
                      Easypaisa Account Information
                    </span>
                    <span className="font-mono text-neutral-400">TID Required</span>
                  </div>

                  <div className="p-3 bg-neutral-900 rounded-lg space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Account Title:</span>
                      <strong className="text-white">{paymentSettings.easypaisa.accountTitle}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Mobile Number:</span>
                      <strong className="font-mono text-amber-400 font-bold text-sm">
                        {paymentSettings.easypaisa.mobileNumber}
                      </strong>
                    </div>
                    <div className="flex justify-between border-t border-neutral-800 pt-1.5">
                      <span className="text-neutral-400">Payable Total:</span>
                      <strong className="font-mono text-white text-sm">Rs. {total.toLocaleString()}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {paymentSettings.easypaisa.instructions}
                  </p>

                  <div className="space-y-3 pt-2 border-t border-neutral-800">
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-300 font-medium">
                        Easypaisa Transaction ID (TID) *
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. EP84920194821"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-neutral-300 font-medium">
                        Upload Transfer Screenshot (Optional / Recommended)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="w-full text-xs text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 cursor-pointer"
                      />
                      {screenshotPreview && (
                        <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Screenshot loaded successfully</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'jazzcash' && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-red-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-400 font-bold uppercase tracking-wider">
                      JazzCash Account Information
                    </span>
                    <span className="font-mono text-neutral-400">TID Required</span>
                  </div>

                  <div className="p-3 bg-neutral-900 rounded-lg space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Account Title:</span>
                      <strong className="text-white">{paymentSettings.jazzcash.accountTitle}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Mobile Number:</span>
                      <strong className="font-mono text-amber-400 font-bold text-sm">
                        {paymentSettings.jazzcash.mobileNumber}
                      </strong>
                    </div>
                    <div className="flex justify-between border-t border-neutral-800 pt-1.5">
                      <span className="text-neutral-400">Payable Total:</span>
                      <strong className="font-mono text-white text-sm">Rs. {total.toLocaleString()}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {paymentSettings.jazzcash.instructions}
                  </p>

                  <div className="space-y-3 pt-2 border-t border-neutral-800">
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-300 font-medium">
                        JazzCash Transaction ID (TID) *
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. JC99812480112"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-neutral-300 font-medium">
                        Upload Transfer Screenshot (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="w-full text-xs text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 cursor-pointer"
                      />
                      {screenshotPreview && (
                        <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Screenshot loaded successfully</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-blue-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400 font-bold uppercase tracking-wider">
                      Official Bank Transfer Details
                    </span>
                    <span className="font-mono text-neutral-400">Multiple Accounts</span>
                  </div>

                  {/* Bank Account Selector */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400">Select Bank Account:</label>
                    <select
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {paymentSettings.bankAccounts.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} – {b.accountTitle}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeBank && (
                    <div className="p-3 bg-neutral-900 rounded-lg space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Bank Name:</span>
                        <strong className="text-white">{activeBank.bankName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Account Title:</span>
                        <strong className="text-white">{activeBank.accountTitle}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Account Number:</span>
                        <strong className="font-mono text-amber-400 font-bold">{activeBank.accountNumber}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">IBAN:</span>
                        <strong className="font-mono text-white text-[11px]">{activeBank.iban}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] text-neutral-400">
                        <span>Branch:</span>
                        <span>{activeBank.branchName}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pt-2 border-t border-neutral-800">
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-300 font-medium">
                        Bank Transaction / Reference ID *
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. FT2611082194821"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-neutral-300 font-medium">
                        Upload Transfer Receipt Screenshot (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="w-full text-xs text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 cursor-pointer"
                      />
                      {screenshotPreview && (
                        <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Receipt loaded successfully</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-1">
                  <div className="font-semibold text-white">Cash on Delivery Policy</div>
                  <p>
                    Please have exact cash ready (Rs. {total.toLocaleString()}) upon arrival of our delivery rider.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Right Column: Order Review & Confirmation (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 sticky top-24 space-y-5">
              <h2 className="text-base font-bold text-white font-display border-b border-neutral-800 pb-3">
                Order Summary ({items.length} items)
              </h2>

              {/* Items recap */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">
                        {item.quantity}x {item.name}
                      </div>
                      {item.options?.size && (
                        <div className="text-[11px] text-amber-400">
                          {item.options.size.name}
                        </div>
                      )}
                      {item.options?.selectedAddons && item.options.selectedAddons.length > 0 && (
                        <div className="text-[10px] text-neutral-400">
                          +{item.options.selectedAddons.map((a) => a.name).join(', ')}
                        </div>
                      )}
                    </div>
                    <span className="font-mono font-semibold text-neutral-300 shrink-0">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary Calculations */}
              <div className="space-y-2 text-xs text-neutral-300 pt-3 border-t border-neutral-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">Rs. {subtotal.toLocaleString()}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Promo ({couponCode})</span>
                    <span className="font-mono">-Rs. {couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery ({deliveryType === 'delivery' ? (resolvedAreaName || 'Unselected') : 'Pickup'})</span>
                  <span className="font-mono">
                    {deliveryFee === 0 ? <span className="text-emerald-400">FREE</span> : `Rs. ${deliveryFee}`}
                  </span>
                </div>

                {tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-mono">Rs. {tax}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-neutral-800">
                  <span>Grand Total</span>
                  <span className="font-mono text-xl text-amber-400">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit Button with Duplicate Click Prevention */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                }`}
              >
                {isSubmitting ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Place Order · Rs. {total.toLocaleString()}</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-neutral-500 text-center space-y-1 pt-1">
                <p>By placing order, you agree to restaurant terms and manual verification.</p>
                <p className="text-neutral-400 font-mono">Instant Dispatch: 0322-2222461</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
