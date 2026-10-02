import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Search, 
  LogOut, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  Menu, 
  X, 
  LayoutDashboard, 
  Building, 
  AlertTriangle, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useDashboard } from '../context/DashboardContext';
import { getCampusScheduleStatus } from '../lib/campusSchedule';
import { CAMPUS_PICKUP_ZONES } from '../types';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isJainOnly: boolean;
  setIsJainOnly: (val: boolean) => void;
  onOpenOrderHistory: () => void;
  currentView: 'welcome' | 'ordering';
  setCurrentView: (view: 'welcome' | 'ordering') => void;
  onOpenComplaint: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  isJainOnly,
  setIsJainOnly,
  onOpenOrderHistory,
  currentView,
  setCurrentView,
  onOpenComplaint,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  const { user, openAuthModal, logout } = useAuth();
  const { totalCount, setIsCartOpen, selectedAddress, setSelectedAddress } = useCart();
  const { showToast } = useToast();
  const { setIsDashboardOpen, canteenSettings } = useDashboard();

  const schedule = getCampusScheduleStatus(new Date(), canteenSettings.demoBypassTiming);

  const [isPickupDropdownOpen, setIsPickupDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    showToast('Logged out safely. See you soon!', 'info');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      {/* Top Campus Announcement Bar */}
      <div className="bg-emerald-950 text-white text-[11px] px-4 py-1.5 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
            <span className="font-extrabold text-emerald-200">Campus Schedule (Phase 4):</span>
            <span className="text-gray-200 truncate">
              Breakfast (9:30 - 10:00 AM, Closes 9:40 AM) • Lunch (1:20 - 2:30 PM, Closes 2:10 PM)
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              schedule.statusBadgeType === 'open'
                ? 'bg-emerald-500 text-white'
                : schedule.statusBadgeType === 'closing_soon'
                ? 'bg-amber-400 text-amber-950 animate-bounce'
                : 'bg-rose-500 text-white'
            }`}>
              {schedule.statusBadgeText}
            </span>
            <button
              onClick={() => setIsDashboardOpen(true)}
              className="text-emerald-300 hover:text-white font-bold underline cursor-pointer hidden sm:inline"
            >
              Canteen Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* 1. Brand Logo */}
          <div className="flex items-center gap-6">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => setCurrentView('welcome')}
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-700/20 group-hover:scale-105 transition-transform text-white">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 group-hover:text-emerald-700 transition-colors">
                    Campus<span className="text-emerald-600">Canteen</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    100% Pure Veg & Jain
                  </span>
                </div>
                <p className="text-[11px] font-medium text-gray-500 hidden sm:block">
                  Ground to 9th Floor Delivery • ₹0 Delivery Fee
                </p>
              </div>
            </div>

            {/* View Switcher: Welcome vs Menu */}
            <nav className="hidden lg:flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => setCurrentView('welcome')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currentView === 'welcome'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Welcome
              </button>
              <button
                onClick={() => setCurrentView('ordering')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currentView === 'ordering'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Canteen Menu
              </button>
            </nav>

            {/* Pickup Zone Selector Dropdown */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsPickupDropdownOpen(!isPickupDropdownOpen)}
                className="flex items-center gap-2 text-left px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="max-w-[200px]">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">
                    Delivery Pickup Zone
                  </div>
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1 truncate">
                    {user?.pickupZone || selectedAddress.pickupZone}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              </button>

              {isPickupDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in">
                  <div className="text-[10px] font-black uppercase text-gray-400 px-3 py-1.5">
                    Select Campus Pickup Floor / Wing
                  </div>
                  {CAMPUS_PICKUP_ZONES.map((zone) => (
                    <button
                      key={zone}
                      onClick={() => {
                        setSelectedAddress({
                          ...selectedAddress,
                          pickupZone: zone,
                          title: zone.split('(')[0].trim(),
                        });
                        setIsPickupDropdownOpen(false);
                        showToast(`Pickup point set to: ${zone}`, 'info');
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-900 transition-colors flex items-center justify-between ${
                        (user?.pickupZone || selectedAddress.pickupZone) === zone
                          ? 'bg-emerald-100/70 text-emerald-900 font-bold'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="truncate">{zone}</span>
                      {(user?.pickupZone || selectedAddress.pickupZone) === zone && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0 ml-2"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. Middle Search Bar (Visible in ordering view) */}
          {currentView === 'ordering' && (
            <div className="hidden xl:flex items-center flex-1 max-w-sm relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search breakfast, thali, snacks, juices..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          )}

          {/* 3. Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Jain Only Toggle */}
            <button
              onClick={() => setIsJainOnly(!isJainOnly)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isJainOnly
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Jain Only</span>
            </button>

            {/* Canteen Dashboard Button */}
            <button
              onClick={() => setIsDashboardOpen(true)}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Canteen Dashboard</span>
            </button>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer group"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Platter</span>
              {totalCount > 0 && (
                <span className="bg-white text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-inner">
                  {totalCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left pr-1">
                    <div className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold truncate max-w-[100px]">
                      {user.role}: {user.usn}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400 hidden lg:block" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in space-y-1">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="text-xs font-black text-gray-900 truncate">{user.name}</div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        {user.role} • USN: {user.usn}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate mt-0.5">
                        {user.pickupZone}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onOpenOrderHistory();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>My Past Orders</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenComplaint();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Report Complaint (Phase 8)</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenPrivacy();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-gray-500" />
                      <span>Privacy Policy</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenTerms();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span>Terms & Conditions</span>
                    </button>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Log In / Register
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 p-4 space-y-3 shadow-xl animate-in slide-in-from-top">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setCurrentView('welcome');
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl ${
                currentView === 'welcome' ? 'bg-emerald-800 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Welcome Page
            </button>
            <button
              onClick={() => {
                setCurrentView('ordering');
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl ${
                currentView === 'ordering' ? 'bg-emerald-800 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Canteen Menu
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-2 text-xs font-bold text-gray-700">
            <button
              onClick={() => {
                onOpenOrderHistory();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Past Orders</span>
            </button>
            <button
              onClick={() => {
                onOpenComplaint();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 flex items-center gap-2 text-rose-600"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>File Food Complaint (Phase 8)</span>
            </button>
            <button
              onClick={() => {
                onOpenPrivacy();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-gray-500" />
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => {
                onOpenTerms();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-gray-500" />
              <span>Terms & Conditions</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
