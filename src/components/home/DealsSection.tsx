import React, { useState } from 'react';
import { Tag, Plus, Check, Search, Sparkles, Flame, Users, Wine } from 'lucide-react';
import { Deal } from '../../types';
import { storageService } from '../../services/storageService';
import { useCart } from '../../context/CartContext';

interface DealsSectionProps {
  onBackToMenu?: () => void;
}

export const DealsSection: React.FC<DealsSectionProps> = () => {
  const deals = storageService.getDeals().filter((d) => d.isActive);
  const { addToCart } = useCart();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'solo_duo' | 'family' | 'mega'>('all');
  const [addedDealId, setAddedDealId] = useState<string | null>(null);

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.dealNumber.toLowerCase().includes(search.toLowerCase()) ||
      deal.title.toLowerCase().includes(search.toLowerCase()) ||
      deal.items.some((i) => i.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'solo_duo') return deal.price <= 1000;
    if (filterType === 'family') return deal.price > 1000 && deal.price <= 3500;
    if (filterType === 'mega') return deal.price > 3500;
    return true;
  });

  const handleAddDeal = (deal: Deal) => {
    addToCart(deal, undefined, 1, true);
    setAddedDealId(deal.id);
    setTimeout(() => {
      setAddedDealId(null);
    }, 1500);
  };

  return (
    <section className="py-16 bg-neutral-950/60 border-y border-neutral-900" id="deals-section">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-neutral-900">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" />
              <span>Extracted Menu Deals</span>
              <span className="text-neutral-600">·</span>
              <span>Deals 01 to 29</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-1 font-display">
              Regular Deals & Family Combos
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl mt-1">
              Every deal includes chilled soft drinks (Next Cola / Pepsi / 7Up) and is hand-crafted with premium roasted chicken and fresh pizza toppings.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Segmented Filter Buttons (Clean, Zero-Pill) */}
          <div className="flex items-center p-1 bg-neutral-900/90 rounded-xl border border-neutral-800 text-xs w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All 29 Deals
            </button>
            <button
              onClick={() => setFilterType('solo_duo')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === 'solo_duo'
                  ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Budget & Duo (Under Rs. 1,000)
            </button>
            <button
              onClick={() => setFilterType('family')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === 'family'
                  ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Family Combos (Rs. 1,050 – 3,500)
            </button>
            <button
              onClick={() => setFilterType('mega')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === 'mega'
                  ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Mega Feasts (Rs. 4,200 – 8,500)
            </button>
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals (e.g. Zinger, Deal 28)..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Deals Cards Grid (3D Hover Effect, Balanced Elevation) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => {
            const isAdded = addedDealId === deal.id;
            return (
              <div
                key={deal.id}
                className="group relative bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header: Deal Number & Drink Badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                    <span className="font-mono font-bold text-sm tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                      {deal.dealNumber}
                    </span>
                    {deal.badge && (
                      <span className="text-[11px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        {deal.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Items */}
                  <div className="mt-3 space-y-2">
                    <h3 className="font-bold text-white text-base font-display group-hover:text-amber-300 transition-colors leading-snug">
                      {deal.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {deal.description}
                    </p>

                    {/* Breakdown of items */}
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Includes:
                      </div>
                      <ul className="space-y-1 text-xs text-neutral-300">
                        {deal.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 text-sm leading-none mt-0.5">·</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Footer: Price & Add to Cart */}
                <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase">Special Deal Price</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold font-mono text-amber-400">
                        Rs. {deal.price.toLocaleString()}
                      </span>
                      {deal.originalPrice && deal.originalPrice > deal.price && (
                        <span className="text-xs text-neutral-400 line-through font-mono">
                          Rs. {deal.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddDeal(deal)}
                    disabled={isAdded}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-95 whitespace-nowrap ${
                      isAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/10'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Deal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800">
            <p className="text-sm text-neutral-400">No deals match your search.</p>
            <button
              onClick={() => {
                setSearch('');
                setFilterType('all');
              }}
              className="mt-2 text-xs text-amber-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
