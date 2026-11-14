import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Share2,
  Copy,
  Check,
  MessageSquare,
  X,
  Calendar,
  Tag
} from 'lucide-react';
import { Coupon, Product, Category } from '../../types';
import { storageService } from '../../services/storageService';

interface AdminCouponsPanelProps {
  coupons: Coupon[];
  categories: Category[];
  products: Product[];
  onDeleteCoupon: (coupon: Coupon) => void;
  onFeedback: (message: string, type?: 'success' | 'info' | 'error') => void;
  onCouponsChanged: () => void;
}

export const AdminCouponsPanel: React.FC<AdminCouponsPanelProps> = ({
  coupons,
  categories,
  products,
  onDeleteCoupon,
  onFeedback,
  onCouponsChanged
}) => {
  const [couponModalMode, setCouponModalMode] = useState<'create' | 'edit' | null>(null);
  const [originalCouponCode, setOriginalCouponCode] = useState<string | undefined>(undefined);

  const [codeInput, setCodeInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [discountTypeInput, setDiscountTypeInput] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValueInput, setDiscountValueInput] = useState<string>('10');
  const [minOrderInput, setMinOrderInput] = useState<string>('500');
  const [maxDiscountInput, setMaxDiscountInput] = useState<string>('');
  const [startDateInput, setStartDateInput] = useState('');
  const [expiryDateInput, setExpiryDateInput] = useState('');
  const [usageLimitInput, setUsageLimitInput] = useState<string>('');
  const [perCustomerLimitInput, setPerCustomerLimitInput] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productPickerSearch, setProductPickerSearch] = useState('');
  const [isActiveInput, setIsActiveInput] = useState(true);
  const [timesUsedExisting, setTimesUsedExisting] = useState(0);

  // Share Modal state
  const [sharingCoupon, setSharingCoupon] = useState<Coupon | null>(null);
  const [copiedType, setCopiedType] = useState<'code' | 'message' | null>(null);

  const openCreateCoupon = () => {
    setCouponModalMode('create');
    setOriginalCouponCode(undefined);
    setCodeInput('');
    setTitleInput('');
    setDescriptionInput('');
    setDiscountTypeInput('percentage');
    setDiscountValueInput('10');
    setMinOrderInput('500');
    setMaxDiscountInput('');
    setStartDateInput('');
    setExpiryDateInput('');
    setUsageLimitInput('');
    setPerCustomerLimitInput('');
    setSelectedCategories([]);
    setSelectedProductIds([]);
    setProductPickerSearch('');
    setIsActiveInput(true);
    setTimesUsedExisting(0);
  };

  const openEditCoupon = (coupon: Coupon) => {
    setCouponModalMode('edit');
    setOriginalCouponCode(coupon.code);
    setCodeInput(coupon.code);
    setTitleInput(coupon.title || '');
    setDescriptionInput(coupon.description || '');
    setDiscountTypeInput(coupon.discountType);
    setDiscountValueInput(String(coupon.discountValue));
    setMinOrderInput(String(coupon.minOrderValue || 0));
    setMaxDiscountInput(coupon.maxDiscount ? String(coupon.maxDiscount) : '');
    setStartDateInput(coupon.startDate || '');
    setExpiryDateInput(coupon.expiryDate || '');
    setUsageLimitInput(coupon.usageLimit ? String(coupon.usageLimit) : '');
    setPerCustomerLimitInput(coupon.perCustomerLimit ? String(coupon.perCustomerLimit) : '');
    setSelectedCategories(coupon.applicableCategories || []);
    setSelectedProductIds(coupon.applicableProductIds || []);
    setProductPickerSearch('');
    setIsActiveInput(coupon.isActive);
    setTimesUsedExisting(coupon.timesUsed || 0);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = codeInput.trim().toUpperCase().replace(/\s+/g, '');
    const parsedValue = Number(discountValueInput);

    if (!cleanCode) {
      onFeedback('Coupon code is required.', 'error');
      return;
    }
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      onFeedback('Discount value must be greater than 0.', 'error');
      return;
    }
    if (discountTypeInput === 'percentage' && parsedValue > 100) {
      onFeedback('Percentage discount cannot exceed 100%.', 'error');
      return;
    }

    const couponToSave: Coupon = {
      code: cleanCode,
      title: titleInput.trim() || undefined,
      description: descriptionInput.trim() || undefined,
      discountType: discountTypeInput,
      discountValue: parsedValue,
      minOrderValue: Math.max(0, Number(minOrderInput) || 0),
      maxDiscount: maxDiscountInput.trim() ? Number(maxDiscountInput) : undefined,
      startDate: startDateInput || undefined,
      expiryDate: expiryDateInput || undefined,
      usageLimit: usageLimitInput.trim() ? Math.floor(Number(usageLimitInput)) : undefined,
      perCustomerLimit: perCustomerLimitInput.trim()
        ? Math.floor(Number(perCustomerLimitInput))
        : undefined,
      applicableCategories: selectedCategories.length > 0 ? selectedCategories : undefined,
      applicableProductIds: selectedProductIds.length > 0 ? selectedProductIds : undefined,
      timesUsed: couponModalMode === 'edit' ? timesUsedExisting : 0,
      isActive: isActiveInput
    };

    storageService.saveCoupon(couponToSave, originalCouponCode);
    setCouponModalMode(null);
    onCouponsChanged();
    onFeedback(
      couponModalMode === 'create'
        ? `Promo code "${couponToSave.code}" created!`
        : `Promo code "${couponToSave.code}" updated!`
    );
  };

  const buildShareMessage = (coupon: Coupon): string => {
    const storeUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : '';
    const discountStr =
      coupon.discountType === 'percentage'
        ? `${coupon.discountValue}% OFF`
        : `Rs. ${coupon.discountValue.toLocaleString()} OFF`;
    const parts = [
      `Arabian Shawarma & Pizza — Special Offer!`,
      coupon.title ? `${coupon.title}` : '',
      `Use Promo Code: ${coupon.code} to get ${discountStr}.`,
      coupon.minOrderValue > 0
        ? `Minimum Order: Rs. ${coupon.minOrderValue.toLocaleString()}`
        : '',
      coupon.maxDiscount
        ? `Max Discount Cap: Rs. ${coupon.maxDiscount.toLocaleString()}`
        : '',
      coupon.expiryDate ? `Valid Until: ${coupon.expiryDate}` : '',
      storeUrl ? `Order Online: ${storeUrl}` : ''
    ].filter(Boolean);

    return parts.join('\n');
  };

  const copyText = async (text: string, type: 'code' | 'message') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedType(type);
      onFeedback(
        type === 'code' ? 'Coupon code copied to clipboard!' : 'Full promo message copied!'
      );
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      onFeedback('Unable to copy automatically. Please copy from the box above.', 'info');
    }
  };

  const handleNativeShare = async (coupon: Coupon) => {
    const message = buildShareMessage(coupon);
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: coupon.title || `Promo Code ${coupon.code}`,
          text: message
        });
        return;
      } catch {
        // User cancelled or share failed silently
        return;
      }
    }
    await copyText(message, 'message');
  };

  const filteredProductsForPicker = useMemo(() => {
    const q = productPickerSearch.trim().toLowerCase();
    if (!q) return products.slice(0, 18);
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, productPickerSearch]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-white text-base font-display">
            Coupons &amp; Promo Codes ({coupons.length})
          </h2>
          <p className="text-xs text-neutral-400">
            Configure percentage or flat discounts, date/usage limits, category eligibility, and share live promo codes.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateCoupon}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promo Code</span>
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="p-10 text-center bg-neutral-950/60 border border-neutral-800 rounded-2xl text-xs text-neutral-400">
          No promo codes created yet. Click <strong>Create Promo Code</strong> to add your first offer.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const isExpired =
              coupon.expiryDate &&
              new Date(`${coupon.expiryDate}T23:59:59.999`).getTime() < Date.now();
            return (
              <div
                key={coupon.code}
                className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-sm text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                      {coupon.code}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `Rs. ${coupon.discountValue} OFF`}
                    </span>
                  </div>

                  {(coupon.title || coupon.description) && (
                    <div className="space-y-0.5">
                      {coupon.title && (
                        <div className="text-xs font-bold text-white">{coupon.title}</div>
                      )}
                      {coupon.description && (
                        <div className="text-[11px] text-neutral-400 line-clamp-2">
                          {coupon.description}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-neutral-400 space-y-1 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/70">
                    <div className="flex justify-between">
                      <span>Min Order:</span>
                      <span className="font-mono text-neutral-200">
                        Rs. {coupon.minOrderValue.toLocaleString()}
                      </span>
                    </div>
                    {coupon.maxDiscount && (
                      <div className="flex justify-between">
                        <span>Max Cap:</span>
                        <span className="font-mono text-neutral-200">
                          Rs. {coupon.maxDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Global Uses:</span>
                      <span className="font-mono text-neutral-200">
                        {coupon.timesUsed || 0}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' (Unlimited)'}
                      </span>
                    </div>
                    {coupon.perCustomerLimit && (
                      <div className="flex justify-between">
                        <span>Per Customer:</span>
                        <span className="font-mono text-neutral-200">
                          Max {coupon.perCustomerLimit}
                        </span>
                      </div>
                    )}
                    {(coupon.startDate || coupon.expiryDate) && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Dates:
                        </span>
                        <span className={`font-mono ${isExpired ? 'text-red-400' : 'text-neutral-300'}`}>
                          {coupon.startDate || 'Now'} → {coupon.expiryDate || 'No expiry'}
                        </span>
                      </div>
                    )}
                    {(coupon.applicableCategories?.length || coupon.applicableProductIds?.length) && (
                      <div className="text-[10px] text-amber-300 pt-1 border-t border-neutral-800">
                        Scoped to{' '}
                        {[
                          coupon.applicableCategories?.length
                            ? `${coupon.applicableCategories.length} categories`
                            : '',
                          coupon.applicableProductIds?.length
                            ? `${coupon.applicableProductIds.length} products`
                            : ''
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2.5 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditCoupon(coupon)}
                      className="text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      disabled={!coupon.isActive}
                      onClick={() => setSharingCoupon(coupon)}
                      title={
                        coupon.isActive
                          ? 'Share Coupon via WhatsApp / Link / Copy'
                          : 'Activate coupon before sharing'
                      }
                      className={`inline-flex items-center gap-1 font-semibold ${
                        coupon.isActive
                          ? 'text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer'
                          : 'text-neutral-600 cursor-not-allowed'
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        storageService.saveCoupon({ ...coupon, isActive: !coupon.isActive });
                        onCouponsChanged();
                        onFeedback(
                          `Coupon "${coupon.code}" ${!coupon.isActive ? 'activated' : 'disabled'}.`
                        );
                      }}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                        coupon.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Disabled'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteCoupon(coupon)}
                      className="text-red-400 hover:text-red-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT COUPON MODAL */}
      {couponModalMode && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCoupon}
            className="bg-neutral-900 border border-neutral-800 max-w-2xl w-full rounded-2xl p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm font-display">
                  {couponModalMode === 'create'
                    ? 'Create Promo Code'
                    : `Edit Coupon: ${originalCouponCode}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCouponModalMode(null)}
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ARABIAN20"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-amber-400 font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Promo Title (Optional)</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. Weekend Family Feast Discount"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-medium">Description (Optional)</label>
              <input
                type="text"
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Customer-facing offer details..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Discount Type</label>
                <select
                  value={discountTypeInput}
                  onChange={(e) => setDiscountTypeInput(e.target.value as 'percentage' | 'fixed')}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed PKR</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Discount Value *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={discountValueInput}
                  onChange={(e) => setDiscountValueInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Min Order (PKR)</label>
                <input
                  type="number"
                  min={0}
                  value={minOrderInput}
                  onChange={(e) => setMinOrderInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Max Cap (PKR)</label>
                <input
                  type="number"
                  min={0}
                  value={maxDiscountInput}
                  onChange={(e) => setMaxDiscountInput(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Start Date</label>
                <input
                  type="date"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDateInput}
                  onChange={(e) => setExpiryDateInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Total Usage Limit</label>
                <input
                  type="number"
                  min={1}
                  value={usageLimitInput}
                  onChange={(e) => setUsageLimitInput(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Per-Customer Limit</label>
                <input
                  type="number"
                  min={1}
                  value={perCustomerLimitInput}
                  onChange={(e) => setPerCustomerLimitInput(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Applicable Categories */}
            <div className="space-y-1.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300 font-medium">
                  Applicable Categories (leave empty for all categories)
                </span>
                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="text-amber-400 hover:underline cursor-pointer"
                  >
                    Clear ({selectedCategories.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const checked = selectedCategories.includes(cat.name);
                  return (
                    <label
                      key={cat.id}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer flex items-center gap-1.5 ${
                        checked
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedCategories((prev) =>
                            prev.includes(cat.name)
                              ? prev.filter((c) => c !== cat.name)
                              : [...prev, cat.name]
                          )
                        }
                        className="accent-amber-500"
                      />
                      <span>{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Applicable Specific Products */}
            <div className="space-y-1.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between gap-2">
                <span className="text-neutral-300 font-medium">
                  Applicable Specific Products (optional)
                </span>
                {selectedProductIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds([])}
                    className="text-amber-400 hover:underline cursor-pointer"
                  >
                    Clear ({selectedProductIds.length})
                  </button>
                )}
              </div>
              <input
                type="text"
                value={productPickerSearch}
                onChange={(e) => setProductPickerSearch(e.target.value)}
                placeholder="Search products to restrict..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white"
              />
              <div className="max-h-28 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {filteredProductsForPicker.map((p) => {
                  const checked = selectedProductIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] cursor-pointer truncate ${
                        checked ? 'bg-amber-500/15 text-amber-300' : 'text-neutral-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedProductIds((prev) =>
                            prev.includes(p.id)
                              ? prev.filter((id) => id !== p.id)
                              : [...prev, p.id]
                          )
                        }
                        className="accent-amber-500"
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 text-neutral-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isActiveInput}
                onChange={(e) => setIsActiveInput(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <span>Active (Allow customers to redeem this coupon at checkout)</span>
            </label>

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCouponModalMode(null)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold rounded-xl cursor-pointer"
              >
                {couponModalMode === 'create' ? 'Save Coupon' : 'Update Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SHARE COUPON MODAL */}
      {sharingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-emerald-500/30 max-w-md w-full rounded-2xl p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm font-display">
                  Share Promo Code: {sharingCoupon.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSharingCoupon(null)}
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                Generated Promotional Message
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs text-neutral-200 leading-relaxed">
                {buildShareMessage(sharingCoupon)}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(buildShareMessage(sharingCoupon))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Share</span>
              </a>

              <button
                type="button"
                onClick={() => void handleNativeShare(sharingCoupon)}
                className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Mobile Share</span>
              </button>

              <button
                type="button"
                onClick={() => void copyText(sharingCoupon.code, 'code')}
                className="py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-amber-500/30 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedType === 'code' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedType === 'code' ? 'Code Copied' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                onClick={() => void copyText(buildShareMessage(sharingCoupon), 'message')}
                className="py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedType === 'message' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedType === 'message' ? 'Message Copied' : 'Copy Message'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
