import React from 'react';
import { Category } from '../../types';
import { resolveAssetUrl, DEFAULT_BURGER_IMAGE } from '../../utils/assetUrl';

interface CategoryCircularBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export const CategoryCircularBar: React.FC<CategoryCircularBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="py-6 border-b border-neutral-900 bg-neutral-950/40">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between pb-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Explore By Category
          </div>
          <span className="text-xs text-neutral-500 hidden sm:inline">
            Click any dish category to filter instantly
          </span>
        </div>

        {/* Circular Category Icons Scroll Strip */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-3 scrollbar-none">
          {/* "All Menu" circular button */}
          <button
            onClick={() => onSelectCategory('All')}
            className="flex flex-col items-center gap-2 group shrink-0"
          >
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 transition-all duration-300 ${
                selectedCategory === 'All'
                  ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                  : 'ring-1 ring-neutral-800 hover:ring-amber-500/50 hover:scale-105'
              }`}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-neutral-950 font-bold text-xs sm:text-sm font-display shadow-inner">
                All
              </div>
            </div>
            <span
              className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'All' ? 'text-amber-400 font-bold' : 'text-neutral-400 group-hover:text-white'
              }`}
            >
              All Dishes
            </span>
          </button>

          {/* Each Category with its authentic food image in circle */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className="flex flex-col items-center gap-2 group shrink-0"
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 transition-all duration-300 relative ${
                    isSelected
                      ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                      : 'ring-1 ring-neutral-800 hover:ring-amber-500/50 hover:scale-105'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 border border-neutral-800">
                    <img
                      src={resolveAssetUrl(cat.image, DEFAULT_BURGER_IMAGE)}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected ? 'text-amber-400 font-bold' : 'text-neutral-400 group-hover:text-white'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
