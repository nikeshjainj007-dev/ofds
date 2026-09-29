import React from 'react';
import { Tag, Utensils, Clock, Building } from 'lucide-react';

interface HeroBannerProps {
  onSelectCategory: (cat: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory }) => {

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white p-6 sm:p-10 my-6 shadow-2xl shadow-emerald-950/20 border border-emerald-800/40">
      {/* Background Decorative Circles */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-60 h-60 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="max-w-2xl text-center lg:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
            <span className="veg-badge bg-white">
              <span className="veg-badge-dot"></span>
            </span>
            <span>Campus Canteen Kitchen • 100% Pure Veg & Pure Jain</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Campus Meal Delivery, <br />
            <span className="text-amber-300">Ground Floor to 9th Floor.</span>
          </h1>

          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Prepared freshly in our college canteen. Subsidized student rates, <strong>₹0 Delivery Charges</strong>, and dedicated floor runners delivering directly to Wing A & Wing B pickup points!
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs font-medium text-emerald-100">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Breakfast (9:30 - 10:00 AM)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>Lunch (1:20 - 2:30 PM)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>₹0 Delivery Fee</span>
            </div>
          </div>
        </div>

        {/* Right Promo Card */}
        <div className="w-full lg:w-auto flex-shrink-0">
          <div className="bg-gradient-to-br from-emerald-800 to-green-700 rounded-2xl p-5 text-white shadow-xl max-w-sm mx-auto border border-emerald-600/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-black/20 px-2.5 py-1 rounded-lg">
                <Tag className="w-3.5 h-3.5 text-amber-300" />
                Student Coupon
              </div>
              <span className="text-xs font-bold text-amber-200">Code: CAMPUSFREE</span>
            </div>

            <div className="text-2xl font-black mb-1">
              10% STUDENT OFF
            </div>
            <p className="text-xs text-emerald-100 mb-4">
              Enjoy freshly made canteen meals delivered straight to your classroom or faculty room.
            </p>

            <button
              onClick={() => onSelectCategory('all')}
              className="w-full py-2.5 bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5 text-emerald-700" />
              <span>View All Canteen Dishes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
