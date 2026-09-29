import React from 'react';
import {
  ArrowRight,
  Clock,
  Sparkles,
  UtensilsCrossed,
  CreditCard,
  Building,
  Leaf,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCampusScheduleStatus } from '../lib/campusSchedule';
import { useDashboard } from '../context/DashboardContext';

interface WelcomePageProps {
  onGetStarted: () => void;
  onExploreMenu: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onGetStarted,
  onExploreMenu,
}) => {
  const { user, openAuthModal } = useAuth();
  const { canteenSettings } = useDashboard();
  const schedule = getCampusScheduleStatus(new Date(), canteenSettings.demoBypassTiming);

  const handleCtaClick = () => {
    if (!user) {
      openAuthModal();
    } else {
      onGetStarted();
    }
  };

  return (
    <div className="w-full space-y-16 animate-in fade-in duration-300">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-emerald-700/50">
        {/* Decorative Background Elements */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-10 top-10 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Status Capsule */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Official College Campus Project</span>
            <span className="text-white/40">•</span>
            <span className="text-white">Ground to 9th Floor Delivery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            Campus Food Delivery, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-amber-200">
              Fresh from Canteen to Your Desk.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl leading-relaxed">
            Order delicious Breakfast & Lunch prepared right in our campus canteen. High quality, 100% Pure Veg & Jain meals at subsidized student rates with <strong>₹0 Delivery Charges</strong> delivered straight to your floor pickup zone!
          </p>

          {/* Schedule Announcement Bar */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-white flex items-center gap-2">
                  <span>Current Campus Slot: {schedule.currentSlotName}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    schedule.statusBadgeType === 'open'
                      ? 'bg-emerald-400 text-emerald-950'
                      : schedule.statusBadgeType === 'closing_soon'
                      ? 'bg-amber-400 text-amber-950 animate-bounce'
                      : 'bg-rose-400 text-rose-950'
                  }`}>
                    {schedule.statusBadgeText}
                  </span>
                </div>
                <p className="text-emerald-200/80 text-[11px] mt-0.5">
                  {schedule.nextSlotMessage} (Cutoff: 20 mins before slot close)
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-white/15 sm:pl-4">
              <span className="text-[11px] text-emerald-200 block">Campus Time</span>
              <span className="font-mono font-bold text-white text-sm">{schedule.currentTimeFormatted}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleCtaClick}
              className="px-8 py-4 bg-white hover:bg-emerald-50 text-emerald-950 font-black text-sm rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 cursor-pointer group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreMenu}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Browse Canteen Menu</span>
            </button>
          </div>

          {/* User Status pill */}
          {user && (
            <div className="flex items-center gap-2 text-xs text-emerald-200 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Logged in as <strong>{user.name}</strong> ({user.role} • {user.usn})</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. Key Pillars Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Campus Advantages
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Designed Exclusively for Our Campus Community
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Convenient, clean, and customized for students and faculty schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-gray-900">Synchronized Meal Slots</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>Breakfast:</strong> 9:30 AM - 10:00 AM (Order till 9:40 AM).<br />
              <strong>Lunch:</strong> 1:20 PM - 2:30 PM (Order till 2:10 PM).<br />
              Orders close 20 minutes prior so meals are cooked fresh and hot!
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-gray-900">Ground to 9th Floor Pickup</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              No need to walk down during crowded breaks. Canteen delivery runners bring orders straight to your designated wing (Wing A or Wing B) across all 9 floors!
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-gray-900">₹0 Delivery & Razorpay Only</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Zero delivery fees, zero hidden packaging surcharges. 100% cashless via secure Razorpay (NO Cash on Delivery) for seamless, contactless pickup.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Pure Veg & Jain Guarantee */}
      <section className="bg-emerald-50 rounded-3xl p-8 sm:p-10 border border-emerald-200/70 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase">
            <Leaf className="w-4 h-4" />
            100% Pure Veg & Pure Jain Guarantee
          </div>
          <h3 className="text-2xl font-black text-emerald-950">
            Sacred Kitchen Hygiene & Pure Vegetarian Diet
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
            Every dish is prepared using fresh ingredients in our certified campus canteen. Pure Jain meals are prepared without onion, garlic, or underground root vegetables in a dedicated kitchen station.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
          <button
            onClick={onExploreMenu}
            className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>View Pure Veg Menu</span>
          </button>
        </div>
      </section>
    </div>
  );
};
