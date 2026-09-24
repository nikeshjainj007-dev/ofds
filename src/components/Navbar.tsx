import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isJainOnly: boolean;
  setIsJainOnly: (val: boolean) => void;
  onOpenOrderHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  isJainOnly,
  setIsJainOnly,
  onOpenOrderHistory,
}) => {
  const { user, openAuthModal, logout } = useAuth();
  const { totalCount, grandTotal, setIsCartOpen, selectedAddress, setSelectedAddress, addresses } = useCart();
  const { showToast } = useToast();

  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    showToast('Logged out safely. See you soon!', 'info');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* 1. Brand Logo */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <div className="w-7 h-7 rounded-lg border-2 border-white flex items-center justify-center p-0.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-inner"></div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-emerald-700 transition-colors">
                    Satvik<span className="text-emerald-600">Bite</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    100% Pure Veg
                  </span>
                </div>
                <p className="text-[11px] font-medium text-gray-500 hidden sm:block">
                  Fresh • Hygienic • Satvik Delivery
                </p>
              </div>
            </div>

            {/* Location Selector */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                className="flex items-center gap-2 text-left px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="max-w-[180px]">
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1 truncate">
                    {selectedAddress.type}: {selectedAddress.title}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {selectedAddress.addressLine}
                  </div>
                </div>
              </button>

              {/* Address dropdown */}
              {isAddressDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">
                    Deliver To:
                  </div>
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setIsAddressDropdownOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                        selectedAddress.id === addr.id
                          ? 'bg-emerald-50 text-emerald-950 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <MapPin className={`w-4 h-4 mt-0.5 ${selectedAddress.id === addr.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className="text-xs font-bold">{addr.title}</div>
                        <div className="text-[11px] text-gray-500 leading-tight mt-0.5">{addr.addressLine}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. Search & Filter Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Paneer, Dosa, Thali, Biryani, Sweets..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 hover:bg-gray-150 focus:bg-white text-xs md:text-sm rounded-xl border border-transparent focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs bg-gray-200 hover:bg-gray-300 w-4 h-4 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 3. Action Buttons & Profile */}
          <div className="flex items-center gap-3">
            {/* Jain Food Toggle Filter */}
            <button
              onClick={() => setIsJainOnly(!isJainOnly)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                isJainOnly
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              title="Show only dishes strictly without onion and garlic"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Jain Friendly</span>
            </button>

            {/* Auth / User Section */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl transition-colors border border-emerald-200"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    {(user.name?.[0] || user.email?.[0] || 'V').toUpperCase()}
                  </div>
                  <span className="text-xs font-bold max-w-[120px] truncate hidden md:block">
                    Hi, {user.name || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <div className="text-xs font-bold text-gray-900 truncate">
                        {user.name || 'Valued Customer'}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate mt-0.5">
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          📱 {user.phone}
                        </div>
                      )}
                      {user.place && (
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          📍 {user.place} {user.pincode ? `(${user.pincode})` : ''}
                        </div>
                      )}
                      {user.dob && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          🎂 DOB: {user.dob}
                        </div>
                      )}
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Verified Customer
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenOrderHistory();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg flex items-center gap-2 mt-1 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-emerald-600" />
                      Past Orders & Tracking
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 mt-1 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <span>Sign In</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-lg shadow-emerald-600/20 font-bold text-xs transition-all hover:scale-[1.02]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalCount > 0 && (
                <span className="flex items-center gap-1 bg-white text-emerald-800 px-1.5 py-0.5 rounded-md text-[11px] font-black">
                  {totalCount} • ₹{grandTotal}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar & Controls */}
        {isMobileMenuOpen && (
          <div className="py-4 border-t border-gray-100 lg:hidden space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pure veg dishes & sweets..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsJainOnly(!isJainOnly)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border ${
                  isJainOnly
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Strict Jain (No Onion Garlic)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
