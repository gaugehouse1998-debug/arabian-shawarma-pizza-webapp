import React, { useState } from 'react';
import { Sparkles, Flame, Plus, Star, Tag, Check, ArrowRight, Layers } from 'lucide-react';
import { Product, Deal, Category } from '../../types';
import { storageService } from '../../services/storageService';
import { useCart } from '../../context/CartContext';
import { CategoryCircularBar } from './CategoryCircularBar';
import { ProductDetailModal } from '../menu/ProductDetailModal';

interface FoodDiscoverySectionProps {
  onExploreAllDeals: () => void;
}

export const FoodDiscoverySection: React.FC<FoodDiscoverySectionProps> = ({ onExploreAllDeals }) => {
  const { addToCart } = useCart();
  const categories = storageService.getCategories().filter((c) => c.isActive && c.id !== 'cat-deals');
  const allProducts = storageService.getProducts();
  const allDeals = storageService.getDeals().filter((d) => d.isActive);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProductForModal, setActiveProductForModal] = useState<Product | null>(null);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  // Sections
  const bestSellers = allProducts.filter((p) => p.isBestSeller).slice(0, 4);
  const featuredProducts = allProducts.filter((p) => p.isFeatured && !p.isBestSeller).slice(0, 4);
  const specialDeals = allDeals.slice(0, 3);
  const recentDishes = allProducts.slice(0, 4);

  // Filtered collection based on category selection
  const collectionProducts = selectedCategory === 'All'
    ? allProducts
    : allProducts.filter((p) => p.category === selectedCategory);

  const handleQuickAdd = (product: Product) => {
    // If product has sizes, open modal so user can pick size
    if (product.sizes && product.sizes.length > 0) {
      setActiveProductForModal(product);
    } else {
      addToCart(product, undefined, 1, false);
      setAddedItemId(product.id);
      setTimeout(() => setAddedItemId(null), 1200);
    }
  };

  const handleAddDeal = (deal: Deal) => {
    addToCart(deal, undefined, 1, true);
    setAddedItemId(deal.id);
    setTimeout(() => setAddedItemId(null), 1200);
  };

  return (
    <div className="space-y-16 py-8">
      {/* 1. Circular Category Icons Bar */}
      <CategoryCircularBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(catName) => {
          setSelectedCategory(catName);
          const el = document.getElementById('full-menu-collection');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. Best Sellers & Popular Food Items */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex items-end justify-between pb-3 border-b border-neutral-900">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
              Best Sellers & Popular Dishes
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('All');
              const el = document.getElementById('full-menu-collection');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>View All Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => {
            const isAdded = addedItemId === product.id;
            return (
              <div
                key={product.id}
                className="group bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 bg-neutral-950 overflow-hidden cursor-pointer" onClick={() => setActiveProductForModal(product)}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold text-amber-300 bg-amber-500/20 backdrop-blur-md px-2.5 py-1 rounded border border-amber-500/30">
                      Best Seller
                    </span>
                  </div>

                  <div className="p-4 space-y-1 cursor-pointer" onClick={() => setActiveProductForModal(product)}>
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      {product.category}
                    </div>
                    <h3 className="font-bold text-white text-sm font-display group-hover:text-amber-300 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-neutral-800/60 mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Starting at</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      Rs. {product.basePrice.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleQuickAdd(product)}
                    disabled={isAdded}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      isAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                    }`}
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAdded ? 'Added' : 'Order'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Special Deals Highlights */}
      <section className="bg-neutral-900/40 border-y border-neutral-900 py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">
          <div className="flex items-end justify-between pb-3 border-b border-neutral-850">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>Special Combos</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
                Featured Value Deals
              </h2>
            </div>
            <button
              onClick={onExploreAllDeals}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Explore All 29 Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialDeals.map((deal) => {
              const isAdded = addedItemId === deal.id;
              return (
                <div
                  key={deal.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {deal.dealNumber}
                      </span>
                      {deal.badge && (
                        <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                          {deal.badge}
                        </span>
                      )}
                    </div>
                    <div className="aspect-16/9 rounded-xl overflow-hidden bg-neutral-950">
                      <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold text-white text-sm font-display leading-tight">{deal.title}</h3>
                    <ul className="text-xs text-neutral-400 space-y-0.5">
                      {deal.items.map((it, idx) => (
                        <li key={idx}>· {it}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-amber-400">
                      Rs. {deal.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleAddDeal(deal)}
                      disabled={isAdded}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        isAdded
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                      }`}
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isAdded ? 'Added' : 'Add Deal'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Complete Food Product Collection (With Category Tabs & Search) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6" id="full-menu-collection">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-neutral-900">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Full Store Menu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
              Food Product Listings ({collectionProducts.length} items)
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'All'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === c.name
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collectionProducts.map((product) => {
            const isAdded = addedItemId === product.id;
            const hasSizes = product.sizes && product.sizes.length > 0;
            return (
              <div
                key={product.id}
                className="group bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div
                    className="relative aspect-4/3 bg-neutral-950 overflow-hidden cursor-pointer"
                    onClick={() => setActiveProductForModal(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />
                    <span className="absolute top-3 left-3 text-[10px] font-semibold text-neutral-300 bg-neutral-950/80 px-2 py-0.5 rounded border border-neutral-800">
                      {product.category}
                    </span>
                  </div>

                  <div
                    className="p-4 space-y-1 cursor-pointer"
                    onClick={() => setActiveProductForModal(product)}
                  >
                    <h3 className="font-bold text-white text-sm font-display group-hover:text-amber-400 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    {hasSizes && (
                      <div className="text-[10px] text-amber-400 pt-1">
                        {product.sizes?.length} Available Sizes
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-neutral-800/60 mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">
                      {hasSizes ? 'From' : 'Price'}
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      Rs. {product.basePrice.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleQuickAdd(product)}
                    disabled={isAdded || !product.isAvailable}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      !product.isAvailable
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : isAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                    }`}
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{hasSizes ? 'Customize' : isAdded ? 'Added' : 'Order'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Product Detail Modal */}
      {activeProductForModal && (
        <ProductDetailModal
          product={activeProductForModal}
          onClose={() => setActiveProductForModal(null)}
        />
      )}
    </div>
  );
};
