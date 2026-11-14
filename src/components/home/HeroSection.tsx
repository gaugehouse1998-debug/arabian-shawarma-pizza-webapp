import React, { useState, useEffect } from 'react';
import { ArrowRight, Flame, Sparkles, Truck, ShieldCheck, Clock, Award, Star } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface HeroSectionProps {
  onOrderNow: () => void;
  onExploreDeals: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOrderNow,
  onExploreDeals
}) => {
  const settings = storageService.getRestaurantSettings();

  // Scroll-based 3D Burger Rotation state
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute smooth rotation degrees based on scroll position
  // 1 full turn (360 deg) across approx 900px scroll
  const rotationDeg = (scrollY * 0.4) % 360;
  const tiltY = Math.sin(scrollY * 0.005) * 12;
  const tiltX = Math.cos(scrollY * 0.005) * 8;
  const scaleEffect = Math.max(0.92, 1 - scrollY * 0.0002);

  return (
    <section className="relative overflow-hidden pt-6 pb-16 lg:py-20 bg-radial-gradient">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-amber-600/15 via-red-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Actions (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-amber-400">
              <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Stone-Baked Artisanal Pizzas & Arabian Shawarmas</span>
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">Lahore Walton Cantt</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-display">
              Taste the True <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-red-400 bg-clip-text text-transparent">Arabian Flavour</span> & Gourmet Fast Food.
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed">
              Order fresh stone-oven stuffed crust pizzas, juicy crispy zinger burgers, and rotating-spit Arabian shawarmas with velvety garlic toum sauce. Prepared fresh to order in Lahore.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onOrderNow}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 group"
              >
                <span>Order Online Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreDeals}
                className="px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-white font-semibold text-sm border border-neutral-800 hover:border-neutral-700 transition-all flex items-center gap-2"
              >
                <span>29 Regular Deals & Combos</span>
              </button>
            </div>

            {/* Key Trust Metrics */}
            <div className="pt-6 border-t border-neutral-900 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">100% Fresh</div>
                <div className="text-xs text-neutral-400">Pure Mozzarella Cheese</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">29 Deals</div>
                <div className="text-xs text-neutral-400">Family & Party Combos</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">3:00 AM</div>
                <div className="text-xs text-neutral-400">Late Night Delivery</div>
              </div>
            </div>
          </div>

          {/* Right Column: ROTATING 3D BURGER IN CIRCULAR DESIGN (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center items-center perspective-1000 py-6">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
              {/* Outer Luminous Rotating Circular Rings */}
              <div
                className="absolute inset-0 rounded-full border border-amber-500/30 border-dashed animate-spin"
                style={{ animationDuration: '30s' }}
              />
              <div
                className="absolute inset-4 rounded-full border border-amber-500/20"
              />
              <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-amber-500/10 via-red-500/5 to-transparent blur-xl" />

              {/* Glowing circular frame backdrop */}
              <div className="absolute inset-6 rounded-full bg-neutral-900/90 border border-neutral-800/80 shadow-2xl shadow-black/90 backdrop-blur-xl" />

              {/* 3D BURGER IMAGE CONTAINER — SCROLL ROTATION */}
              <div
                className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 transition-transform duration-75 ease-out transform-style-3d cursor-grab active:cursor-grabbing"
                style={{
                  transform: `scale(${scaleEffect}) rotateZ(${rotationDeg}deg) rotateY(${tiltY}deg) rotateX(${tiltX}deg)`
                }}
              >
                <img
                  src="/src/assets/images/hero_3d_burger_1794391292664.jpg"
                  alt="3D Artisan Double Zinger Burger"
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] hover:scale-105 transition-transform"
                />
              </div>

              {/* Floating 3D Badge 1: Top Left */}
              <div
                className="absolute -top-2 -left-4 z-20 bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-1.5 text-xs text-amber-300 font-semibold"
                style={{
                  transform: `translateY(${Math.sin(scrollY * 0.01) * 6}px)`
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Crispy Double Zinger</span>
              </div>

              {/* Floating 3D Badge 2: Bottom Right */}
              <div
                className="absolute -bottom-2 -right-4 z-20 bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-1.5 text-xs text-white font-semibold"
                style={{
                  transform: `translateY(${-Math.sin(scrollY * 0.01) * 6}px)`
                }}
              >
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span>100% Cheddar Melt</span>
              </div>

              {/* Subtle Scroll Hint */}
              <div className="absolute -bottom-10 inset-x-0 text-center text-[11px] text-neutral-500 font-mono">
                Scroll to rotate 3D visual
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
