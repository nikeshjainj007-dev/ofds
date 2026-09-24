import React from 'react';
import { ShieldCheck, Tag, Utensils, Award, Clock } from 'lucide-react';

interface HeroBannerProps {
  onSelectCategory: (cat: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 text-white p-6 sm:p-10 my-6 shadow-2xl shadow-emerald-950/20">
      {/* Background Decorative Circles & Food patterns */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-700/20 blur-3xl pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-60 h-60 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="max-w-2xl text-center lg:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
            <span className="veg-badge bg-white">
              <span className="veg-badge-dot"></span>
            </span>
            <span>100% Certified Pure Vegetarian & Satvik Kitchens</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Craving Pure Veg Delights? <br />
            <span className="text-amber-400">Delivered Hot in 25 Mins.</span>
          </h1>

          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            From slow-simmered Dal Makhani and piping-hot Mysore Masala Dosa to Shahi Paneer and authentic royal Jain Thalis — crafted with pure ingredients and zero cross-contamination.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-medium text-emerald-100">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Non-Veg Kitchens</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Superfast Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <Award className="w-4 h-4 text-emerald-300" />
              <span>FSSAI Certified Veg</span>
            </div>
          </div>
        </div>

        {/* Right Promo Card */}
        <div className="w-full lg:w-auto flex-shrink-0">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-xl shadow-orange-950/30 max-w-sm mx-auto transform hover:rotate-1 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-black/20 px-2.5 py-1 rounded-lg">
                <Tag className="w-3.5 h-3.5" />
                Special Offer
              </div>
              <span className="text-xs font-bold text-amber-100">Code: VEG50</span>
            </div>

            <div className="text-2xl font-black mb-1">
              50% OFF UP TO ₹100
            </div>
            <p className="text-xs text-amber-100 mb-4">
              Celebrate pure food with delicious discounts on your favorite veg meals!
            </p>

            <button
              onClick={() => onSelectCategory('all')}
              className="w-full py-2.5 bg-white hover:bg-amber-50 text-orange-700 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Utensils className="w-3.5 h-3.5" />
              Explore Pure Veg Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
