import React, { useState } from 'react';
import { X, Plus, Minus, Check, Sparkles, Flame, Info } from 'lucide-react';
import { Product, ProductSize, ProductAddon } from '../../types';
import { useCart } from '../../context/CartContext';
import { resolveAssetUrl } from '../../utils/assetUrl';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<ProductSize>(() => {
    if (product.sizes && product.sizes.length > 0) {
      // Default to medium if available or first
      return product.sizes.find((s) => s.name.includes('Medium')) || product.sizes[0];
    }
    return { name: 'Standard', price: product.basePrice };
  });

  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Toggle Addon
  const toggleAddon = (addon: ProductAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  // Calculate current unit price
  const basePrice = product.sizes && product.sizes.length > 0 ? selectedSize.price : product.basePrice;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(
      product,
      {
        size: product.sizes && product.sizes.length > 0 ? selectedSize : undefined,
        selectedAddons: selectedAddons.length > 0 ? selectedAddons : undefined,
        specialInstructions: specialInstructions.trim() || undefined
      },
      quantity
    );

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-fadeIn text-neutral-100">
        {/* Modal Top Bar */}
        <div className="relative h-48 sm:h-56 bg-neutral-950 overflow-hidden">
          <img
            src={resolveAssetUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-950/70 text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category & Tags */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <span>{product.category}</span>
              {product.tags && product.tags.length > 0 && (
                <>
                  <span className="text-neutral-500">·</span>
                  <span className="text-neutral-300">{product.tags.join(' · ')}</span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {product.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {product.description}
          </p>

          {/* 1. Size Selection (If applicable) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                <span>Select Size</span>
                <span className="text-amber-400 font-normal">Required</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize.name === size.name;
                  return (
                    <button
                      key={size.name}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight truncate">{size.name}</div>
                      <div className="text-xs font-mono font-semibold text-amber-400 mt-1">
                        Rs. {size.price}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Add-ons & Extra Charges */}
          {product.addons && product.addons.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                <span>Customize & Extras</span>
                <span className="text-neutral-500 font-normal">Optional</span>
              </label>

              <div className="space-y-2">
                {product.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors text-xs ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500/80 text-white'
                          : 'bg-neutral-950/40 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked
                              ? 'bg-amber-500 border-amber-500 text-neutral-950'
                              : 'border-neutral-700 bg-neutral-900'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-medium">{addon.name}</span>
                      </div>
                      <span className="font-mono font-semibold text-amber-400">
                        +Rs. {addon.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Special Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Special Cooking Instructions
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Mild spice, extra crispy, no cucumber/pickles..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Modal Footer: Quantity Stepper & Add to Cart */}
        <div className="p-4 sm:p-6 bg-neutral-950 border-t border-neutral-800/80 flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-sm w-5 text-center text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable}
            className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-amber-500/10 active:scale-95 transition-all ${
              !product.isAvailable
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
            }`}
          >
            <span>{justAdded ? 'Added to Cart!' : 'Add to Order'}</span>
            <span className="font-mono font-bold">
              Rs. {totalPrice.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
