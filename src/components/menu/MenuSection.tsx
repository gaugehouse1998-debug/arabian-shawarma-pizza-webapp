import React, { useState } from 'react';
import { Search, Flame, Sparkles, Filter, Plus, ChevronRight, Layers } from 'lucide-react';
import { Product, Category } from '../../types';
import { storageService } from '../../services/storageService';
import { ProductDetailModal } from './ProductDetailModal';
import { resolveAssetUrl } from '../../utils/assetUrl';

interface MenuSectionProps {
  initialCategory?: string;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ initialCategory = 'All' }) => {
  const categories = storageService.getCategories().filter((c) => c.isActive && c.id !== 'cat-deals');
  const allProducts = storageService.getProducts();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'bestsellers' | 'spicy' | 'vegetarian'>('all');
  const [activeProductForModal, setActiveProductForModal] = useState<Product | null>(null);

  // Filter products
  const filteredProducts = allProducts.filter((product) => {
    // Category match
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Secondary filters
    if (activeFilter === 'bestsellers' && !product.isBestSeller) return false;
    if (activeFilter === 'spicy' && !product.dietary?.includes('spicy') && !product.tags?.includes('Spicy')) return false;
    if (activeFilter === 'vegetarian' && !product.dietary?.includes('vegetarian')) return false;

    return true;
  });

  return (
    <section className="py-16 bg-neutral-950" id="menu-section">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-neutral-900">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <span>Fresh Stone Oven & Charcoal Grill</span>
              <span className="text-neutral-600">·</span>
              <span>100% Halal Verified</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-display">
              Complete Online Food Menu
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl mt-1">
              Select your favorite pizza crust, shawarma size, burger with fries, or appetizing sides. Extra cheese & chicken available on all items.
            </p>
          </div>
        </div>

        {/* Category Filter Tabs Bar (Horizontal scrolling with clean zero-pill styling) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-850 border border-neutral-800'
              }`}
            >
              All Items ({allProducts.length})
            </button>
            {categories.map((cat) => {
              const count = allProducts.filter((p) => p.category === cat.name).length;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-850 border border-neutral-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isSelected ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Tag Filter Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            {/* Quick Filters */}
            <div className="flex items-center gap-2 text-xs w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-neutral-800 border-neutral-700 text-white font-medium'
                    : 'border-neutral-900 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('bestsellers')}
                className={`px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'bestsellers'
                    ? 'bg-neutral-800 border-neutral-700 text-amber-400 font-medium'
                    : 'border-neutral-900 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Best Sellers</span>
              </button>
              <button
                onClick={() => setActiveFilter('spicy')}
                className={`px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'spicy'
                    ? 'bg-neutral-800 border-neutral-700 text-red-400 font-medium'
                    : 'border-neutral-900 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span>Spicy Options</span>
              </button>
              <button
                onClick={() => setActiveFilter('vegetarian')}
                className={`px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
                  activeFilter === 'vegetarian'
                    ? 'bg-neutral-800 border-neutral-700 text-emerald-400 font-medium'
                    : 'border-neutral-900 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Vegetarian
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pizzas, burgers, shawarma..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Product Cards Grid (Lead with imagery 65-75% height, single elevation, clean unboxed metadata) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const hasMultipleSizes = Boolean(product.sizes && product.sizes.length > 0);
            return (
              <div
                key={product.id}
                onClick={() => setActiveProductForModal(product)}
                className="group bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 flex flex-col justify-between"
              >
                <div>
                  {/* Card Image Slot (with fallback container and zero broken images) */}
                  <div className="relative aspect-4/3 bg-neutral-950 overflow-hidden">
                    <img
                      src={resolveAssetUrl(product.image)}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />

                    {/* Category kicker */}
                    <div className="absolute top-3 left-3 text-[11px] font-semibold text-neutral-300 bg-neutral-950/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-neutral-800">
                      {product.category}
                    </div>

                    {/* Best Seller / Tag */}
                    {product.isBestSeller && (
                      <div className="absolute top-3 right-3 text-[10px] font-bold text-amber-300 bg-amber-500/20 backdrop-blur-sm px-2 py-0.5 rounded border border-amber-500/30">
                        Popular
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-1.5">
                    <h3 className="font-bold text-white text-base font-display group-hover:text-amber-400 transition-colors leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Size overview if multi-size */}
                    {hasMultipleSizes && (
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 pt-1">
                        <span>Sizes:</span>
                        <span className="text-neutral-300">
                          {product.sizes?.map((s) => s.name.split(' ')[0]).join(' · ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-neutral-800/60 mt-3">
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase">
                      {hasMultipleSizes ? 'Starting at' : 'Price'}
                    </div>
                    <div className="text-base font-bold font-mono text-amber-400">
                      Rs. {product.basePrice.toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-2 rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 group-hover:shadow-md group-hover:shadow-amber-500/20 active:scale-95 transition-all"
                    aria-label={`Configure and add ${product.name}`}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-neutral-900/40 rounded-2xl border border-neutral-800">
            <p className="text-sm text-neutral-400">No dishes match your active filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-2 text-xs text-amber-400 hover:underline"
            >
              Clear filters and show all dishes
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Customization Modal */}
      {activeProductForModal && (
        <ProductDetailModal
          product={activeProductForModal}
          onClose={() => setActiveProductForModal(null)}
        />
      )}
    </section>
  );
};
