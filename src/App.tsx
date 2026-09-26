import React, { useState, useMemo } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardProvider } from './context/DashboardContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { RestaurantList } from './components/RestaurantList';
import { DishCard } from './components/DishCard';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { DashboardModal } from './components/dashboard/DashboardModal';
import { RESTAURANTS, DISHES } from './data/mockData';

import type { Order } from './types';
import { 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

const MainApp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isJainOnly, setIsJainOnly] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  // Modals state
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  // Filter Dishes
  const filteredDishes = useMemo(() => {
    return DISHES.filter((dish) => {
      // 1. Restaurant filter
      if (selectedRestaurantId && dish.restaurantId !== selectedRestaurantId) {
        return false;
      }
      // 2. Category filter
      if (selectedCategory !== 'all' && dish.category !== selectedCategory) {
        return false;
      }
      // 3. Jain Only filter
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
  }, [selectedRestaurantId, selectedCategory, isJainOnly, searchQuery]);

  const selectedRestaurant = RESTAURANTS.find((r) => r.id === selectedRestaurantId);

  const handleOrderSuccess = () => {
    setIsTrackingModalOpen(true);
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
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <HeroBanner onSelectCategory={(cat) => setSelectedCategory(cat)} />

        {/* Categories Bar */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => setSelectedCategory(id)}
        />

        {/* Selected Restaurant Filter Banner (if any) */}
        {selectedRestaurant && (
          <div className="bg-emerald-800 text-white rounded-2xl p-4 sm:p-5 mb-6 flex items-center justify-between shadow-lg">
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
              className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl transition-colors"
            >
              Clear Filter ✕
            </button>
          </div>
        )}

        {/* Restaurants Showcase (Only show if not filtering a specific restaurant) */}
        {!selectedRestaurantId && (
          <RestaurantList
            restaurants={RESTAURANTS}
            selectedRestaurantId={selectedRestaurantId}
            onSelectRestaurant={(id) => setSelectedRestaurantId(id)}
          />
        )}

        {/* Dishes Grid Section */}
        <section className="my-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span>{selectedRestaurant ? `${selectedRestaurant.name} Dishes` : 'Pure Vegetarian Dishes'}</span>
                <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  {filteredDishes.length} Items
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Prepared with 100% vegetarian ingredients, fresh daily produce, and pure desi ghee
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
                    className="ml-1 text-amber-700 hover:text-amber-900"
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
                Try clearing search terms or turning off the Jain filter to see more delicious vegetarian options.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setIsJainOnly(false);
                  setSelectedRestaurantId(null);
                }}
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
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

        {/* 100% Pure Veg Commitment Banner */}
        <section className="my-16 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-100 rounded-3xl p-8 border border-emerald-200/60 text-emerald-950">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Our Sacred Pure Veg Promise
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
              Why Food Lovers Trust SatvikBite
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We know pure vegetarianism is not just a diet — it is a devotion and a way of life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm">Zero Cross-Contamination</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                We only partner with 100% strictly vegetarian kitchens. No non-veg food enters the cooking premises.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm">Pure Jain & Satvik Food</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Specialized options prepared strictly without onion, garlic, or underground roots upon request.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm">Insulated Veg Fleet</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Dedicated riders carrying sealed, hot food containers straight to your doorstep within 25 minutes.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 3. Footer */}
      <footer className="bg-gray-950 text-gray-400 text-xs py-12 border-t border-gray-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center">
                <div className="w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
              </div>
              <div>
                <span className="text-xl font-black text-white">
                  Satvik<span className="text-emerald-500">Bite</span>
                </span>
                <p className="text-[11px] text-gray-400">100% Pure Veg Online Food Delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-semibold text-gray-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                FSSAI Pure Veg Licensed
              </span>
              <span>Razorpay Verified</span>
              <span>Supabase Auth Protected</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
            <div>
              © {new Date().getFullYear()} SatvikBite Technologies Pvt. Ltd. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Pure Veg Certification</a>
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
      />
      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectOrderToTrack={(ord) => {
          setTrackedOrder(ord);
          setIsTrackingModalOpen(true);
        }}
      />
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

