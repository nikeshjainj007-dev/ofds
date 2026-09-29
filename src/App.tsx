import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Navbar } from './components/Navbar';
import { WelcomePage } from './components/WelcomePage';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { RestaurantList } from './components/RestaurantList';
import { DishCard } from './components/DishCard';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { DashboardModal } from './components/dashboard/DashboardModal';
import { ComplaintModal } from './components/ComplaintModal';
import { FeedbackModal } from './components/FeedbackModal';
import { PrivacyPolicyModal, TermsModal, CookieBanner } from './components/policies/LegalModals';
import { RESTAURANTS } from './data/mockData';
import { getCampusScheduleStatus } from './lib/campusSchedule';

import type { Order } from './types';
import { 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  Clock, 
  CheckCircle2,
  Building,
  AlertTriangle
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { dishes, canteenSettings } = useDashboard();

  // Navigation View State: 'welcome' (Phase 1) vs 'ordering'
  const [currentView, setCurrentView] = useState<'welcome' | 'ordering'>('welcome');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isJainOnly, setIsJainOnly] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  // Modals state
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintOrderId, setComplaintOrderId] = useState<string | undefined>(undefined);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState<Order | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  const schedule = getCampusScheduleStatus(new Date(), canteenSettings.demoBypassTiming);

  // Filter Dishes from live Dashboard dishes state (Phase 6)
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      // 1. Counter / Station filter
      if (selectedRestaurantId && dish.restaurantId !== selectedRestaurantId) {
        return false;
      }
      // 2. Category filter
      if (selectedCategory !== 'all' && dish.category !== selectedCategory) {
        return false;
      }
      // 3. Jain Only filter (Phase 7)
      if (isJainOnly && !dish.isJainFriendly) {
        return false;
      }
      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = dish.name.toLowerCase().includes(query);
        const matchesDesc = dish.description.toLowerCase().includes(query);
        const matchesRest = dish.restaurantName.toLowerCase().includes(query);
        const matchesCategory = dish.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesRest && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [dishes, selectedRestaurantId, selectedCategory, isJainOnly, searchQuery]);

  const selectedRestaurant = RESTAURANTS.find((r) => r.id === selectedRestaurantId);

  const handleOrderSuccess = () => {
    setIsTrackingModalOpen(true);
  };

  const handleOpenComplaintForOrder = (orderId: string) => {
    setComplaintOrderId(orderId);
    setIsComplaintModalOpen(true);
  };

  const handleOpenFeedbackForOrder = (order: Order) => {
    setFeedbackOrder(order);
    setIsFeedbackModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Header / Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isJainOnly={isJainOnly}
        setIsJainOnly={setIsJainOnly}
        onOpenOrderHistory={() => setIsHistoryModalOpen(true)}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenComplaint={() => setIsComplaintModalOpen(true)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenTerms={() => setIsTermsModalOpen(true)}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* PHASE 1: Welcome Page with "Get Started" Option */}
        {currentView === 'welcome' ? (
          <WelcomePage
            onGetStarted={() => {
              if (!user) {
                openAuthModal();
              } else {
                setCurrentView('ordering');
              }
            }}
            onExploreMenu={() => setCurrentView('ordering')}
          />
        ) : (
          /* PHASES 3 & 4: Canteen Ordering Screen */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Hero Section */}
            <HeroBanner onSelectCategory={(cat) => setSelectedCategory(cat)} />

            {/* Timing Banner Alert */}
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-extrabold text-gray-900">
                  Campus Timetable:
                </span>
                <span className="text-gray-600">
                  Breakfast 9:30–10:00 AM (Orders close 9:40 AM) • Lunch 1:20–2:30 PM (Orders close 2:10 PM)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full font-black text-[11px] ${
                  schedule.statusBadgeType === 'open'
                    ? 'bg-emerald-100 text-emerald-800'
                    : schedule.statusBadgeType === 'closing_soon'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-rose-100 text-rose-900'
                }`}>
                  {schedule.statusBadgeText}
                </span>

                <button
                  onClick={() => setIsComplaintModalOpen(true)}
                  className="text-rose-600 hover:text-rose-700 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report Food Issue</span>
                </button>
              </div>
            </div>

            {/* Categories Bar */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={(id) => setSelectedCategory(id)}
            />

            {/* Selected Canteen Counter Banner (if any) */}
            {selectedRestaurant && (
              <div className="bg-emerald-900 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedRestaurant.image}
                    alt={selectedRestaurant.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white/20"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="veg-badge bg-white">
                        <span className="veg-badge-dot"></span>
                      </span>
                      <h3 className="text-lg font-black">{selectedRestaurant.name}</h3>
                    </div>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      {selectedRestaurant.cuisine.join(', ')} • {selectedRestaurant.address}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRestaurantId(null)}
                  className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filter ✕
                </button>
              </div>
            )}

            {/* Canteen Counters Showcase */}
            {!selectedRestaurantId && (
              <RestaurantList
                restaurants={RESTAURANTS}
                selectedRestaurantId={selectedRestaurantId}
                onSelectRestaurant={(id) => setSelectedRestaurantId(id)}
              />
            )}

            {/* Dishes Grid Section (Phase 7: Only Veg and Jain Food) */}
            <section className="my-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <span>{selectedRestaurant ? `${selectedRestaurant.name} Menu` : 'Campus Canteen Menu'}</span>
                    <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      {filteredDishes.length} Items Available
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    100% Pure Vegetarian & Jain dishes prepared fresh daily • Subsidized rates • ₹0 Delivery Fee
                  </p>
                </div>

                {/* Quick Active Filter Badges */}
                <div className="flex items-center gap-2">
                  {isJainOnly && (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-amber-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Jain Only
                      <button
                        onClick={() => setIsJainOnly(false)}
                        className="ml-1 text-amber-700 hover:text-amber-900 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>
              </div>

              {filteredDishes.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Leaf className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No dishes match your filter</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Try clearing search terms or changing category to view more delicious campus options.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setIsJainOnly(false);
                      setSelectedRestaurantId(null);
                    }}
                    className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Pure Veg Campus Commitment Section */}
        <section className="my-16 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-100 rounded-3xl p-8 border border-emerald-200/60 text-emerald-950">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              100% Pure Veg & Pure Jain Guarantee
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
              Why Campus Loves Our Canteen Delivery
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Subsidized college rates, pure ingredients, zero non-veg contamination, and rapid lift delivery to every floor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Building className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm">Ground to 9th Floor Pickup</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Dedicated runners deliver sealed meals to designated pickup zones in Wing A and Wing B across all 9 floors.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm">Pure Jain & Satvik Food</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Specialized options prepared without onion, garlic, or underground roots in an isolated kitchen section.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm">Strict Campus Timings</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Breakfast orders ready for 9:30 AM slot; lunch orders ready for 1:20 PM slot. 20-min pre-order cutoff ensures hot cooking!
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 3. Footer (Phase 8: Privacy Policy, Terms, Cookies, Complaint) */}
      <footer className="bg-gray-950 text-gray-400 text-xs py-12 border-t border-gray-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center text-white">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white">
                  Campus<span className="text-emerald-500">Canteen</span> Delivery
                </span>
                <p className="text-[11px] text-gray-400">100% Pure Veg & Jain Campus Food Portal</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-gray-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                FSSAI Pure Veg Licensed
              </span>
              <span>Razorpay Verified (NO COD)</span>
              <span>Clerk Auth Protected</span>
              <span>Ground to 9th Floor A/B</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
            <div>
              © {new Date().getFullYear()} College Campus Canteen Online Food Delivery System.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="hover:text-gray-300 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setIsTermsModalOpen(true)}
                className="hover:text-gray-300 transition-colors cursor-pointer"
              >
                Terms and Conditions
              </button>
              <button
                onClick={() => setIsComplaintModalOpen(true)}
                className="hover:text-rose-400 text-rose-500 transition-colors cursor-pointer font-bold"
              >
                Food Complaint Option
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <CartDrawer onOrderSuccess={handleOrderSuccess} />
      <AuthModal />
      <DashboardModal />
      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        order={trackedOrder}
        onOpenFeedback={handleOpenFeedbackForOrder}
        onOpenComplaint={handleOpenComplaintForOrder}
      />
      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectOrderToTrack={(ord) => {
          setTrackedOrder(ord);
          setIsTrackingModalOpen(true);
        }}
        onOpenFeedback={handleOpenFeedbackForOrder}
        onOpenComplaint={handleOpenComplaintForOrder}
      />
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        preselectedOrderId={complaintOrderId}
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        order={feedbackOrder}
      />
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
      <CookieBanner />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DashboardProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </DashboardProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
