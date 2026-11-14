import React, { useState, useEffect } from 'react';
import { Tag, Plus, Check, Search } from 'lucide-react';
import { Deal } from '../../types';
import { storageService } from '../../services/storageService';
import { useCart } from '../../context/CartContext';
import { resolveAssetUrl, handleImageFallback } from '../../utils/assetUrl';

interface DealsSectionProps {
  onBackToMenu?: () => void;
}

export const DealsSection: React.FC<DealsSectionProps> = () => {
  const [deals, setDeals] = useState<Deal[]>(() => storageService.getPublicActiveDeals());
  const { addToCart } = useCart();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'solo_duo' | 'family' | 'mega'>('all');
  const [addedDealId, setAddedDealId] = useState<string | null>(null);

  useEffect(() => {
    const refreshDeals = () => {
      setDeals(storageService.getPublicActiveDeals());
    };
    window.addEventListener('asp_data_updated', refreshDeals);
    return () => window.removeEventListener('asp_data_updated', refreshDeals);
  }, []);

  const filteredDeals = deals.filter((deal) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      deal.dealNumber.toLowerCase().includes(q) ||
      deal.title.toLowerCase().includes(q) ||
      (deal.category || '').toLowerCase().includes(q) ||
      deal.items.some((i) => i.toLowerCase().includes(q));

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
              <span>Official Menu Deals</span>
              <span className="text-neutral-600">·</span>
              <span>{deals.length} Active Deals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-1 font-display">
              Regular Deals &amp; Family Combos
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
              className={`px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filterType === 'all'
                  ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All {deals.length} Deals
            </button>
            <button
              onClick={() => setFilterType('solo_duo')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filterType === 'solo_duo'
                  ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Budget &amp; Duo (Under Rs. 1,000)
            </button>
            <button
              onClick={() => setFilterType('family')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filterType === 'family'
                  ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Family Combos (Rs. 1,050 – 3,500)
            </button>
            <button
              onClick={() => setFilterType('mega')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filterType === 'mega'
                  ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Mega Feasts (Rs. 3,500+)
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

        {/* Deals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => {
            const isAdded = addedDealId === deal.id;
            const discountTag = deal.discountLabel || deal.badge;
            const savingsAmount =
              deal.originalPrice && deal.originalPrice > deal.price
                ? deal.originalPrice - deal.price
                : 0;
            return (
              <div
                key={deal.id}
                className="group relative bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 flex flex-col justify-between"
              >
                <div>
                  {/* Deal Photo */}
                  {deal.image && (
                    <div className="relative aspect-16/9 bg-neutral-950 overflow-hidden">
                      <img
                        src={resolveAssetUrl(deal.image)}
                        alt={`${deal.dealNumber} - ${deal.title}`}
                        onError={(e) => handleImageFallback(e)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/30 opacity-85" />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="font-mono font-bold text-xs tracking-wider text-amber-300 bg-neutral-950/90 px-2.5 py-1 rounded-md border border-amber-500/30">
                          {deal.dealNumber}
                        </span>
                        {deal.isFeatured && (
                          <span className="text-[10px] font-bold text-neutral-950 bg-amber-400 px-2 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                      {discountTag && (
                        <span className="absolute top-3 right-3 text-[11px] font-semibold text-white bg-red-600/90 px-2.5 py-0.5 rounded shadow">
                          {discountTag}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-5 pb-0 space-y-2">
                    {!deal.image && (
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                        <span className="font-mono font-bold text-sm tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                          {deal.dealNumber}
                        </span>
                        {discountTag && (
                          <span className="text-[11px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                            {discountTag}
                          </span>
                        )}
                      </div>
                    )}

                    {deal.category && (
                      <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                        {deal.category}
                      </div>
                    )}
                    <h3 className="font-bold text-white text-base font-display group-hover:text-amber-300 transition-colors leading-snug">
                      {deal.title}
                    </h3>
                    {deal.description && (
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {deal.description}
                      </p>
                    )}

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
                <div className="p-5 mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 uppercase">Special Deal Price</span>
                      {savingsAmount > 0 && (
                        <span className="text-[10px] font-semibold text-emerald-400">
                          Save Rs. {savingsAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
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
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
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
              className="mt-2 text-xs text-amber-400 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
