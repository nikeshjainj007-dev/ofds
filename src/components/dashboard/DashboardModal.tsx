import React, { useEffect } from 'react';
import { 
  X, 
  LayoutDashboard, 
  ShoppingBag, 
  CreditCard, 
  Navigation, 
  Bike, 
  Users, 
  Settings, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';

import { useDashboard, type DashboardTab } from '../../context/DashboardContext';
import { OverviewTab } from './OverviewTab';
import { OrdersTab } from './OrdersTab';
import { PaymentsTab } from './PaymentsTab';
import { TrackingTab } from './TrackingTab';
import { DeliveryBoysTab } from './DeliveryBoysTab';
import { CanteenStaffTab } from './CanteenStaffTab';
import { KitchenSettingsTab } from './KitchenSettingsTab';

export const DashboardModal: React.FC = () => {
  const { 
    isDashboardOpen, 
    setIsDashboardOpen, 
    activeTab, 
    setActiveTab, 
    orders, 
    riders, 
    canteenStaff 
  } = useDashboard();

  // Prevent body scrolling when dashboard is open
  useEffect(() => {
    if (isDashboardOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDashboardOpen]);

  if (!isDashboardOpen) return null;

  // Active counts for badges
  const pendingOrdersCount = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  ).length;

  const availableRidersCount = riders.filter((r) => r.status === 'available').length;
  const onDutyStaffCount = canteenStaff.filter((s) => s.status === 'on_duty').length;

  const navItems: { id: DashboardTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'tracking', label: 'Live Tracking', icon: Navigation },
    { id: 'riders', label: 'Delivery Boys', icon: Bike, badge: availableRidersCount },
    { id: 'staff', label: 'Canteen Staff', icon: Users, badge: onDutyStaffCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-gray-900/80 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* 1. Top Navbar Header */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
          {/* Back to store button */}
          <button
            onClick={() => setIsDashboardOpen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>

          {/* Canteen Hub Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-600 flex items-center justify-center text-white shadow-sm">
              <div className="w-4 h-4 rounded-md border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-900">
                  Satvik<span className="text-emerald-600">Bite</span> Manager
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider hidden md:inline">
                  Admin & Operations
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Ticker & Close */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 text-xs text-gray-500 font-semibold bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Kitchen: LIVE
            </div>
            <span>{pendingOrdersCount} Active Orders</span>
            <span>{availableRidersCount} Fleet Ready</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Pure Veg
            </span>
          </div>

          <button
            onClick={() => setIsDashboardOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            title="Close Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Main Body with Sidebar + Tab Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#F8FAF9]">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-3 md:p-4 flex-shrink-0 overflow-x-auto md:overflow-y-auto scrollbar-none flex md:flex-col justify-between gap-1 md:gap-2">
          <div className="flex md:flex-col gap-1 w-full">
            <div className="text-[10px] uppercase font-bold text-gray-400 px-3 py-2 hidden md:block tracking-wider">
              Management Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/10'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ml-2 ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Hub Status in sidebar bottom */}
          <div className="p-3 bg-gradient-to-tr from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 text-[11px] text-emerald-950 hidden md:block space-y-1">
            <div className="font-extrabold flex items-center gap-1.5 text-emerald-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Indiranagar Hub
            </div>
            <p className="text-gray-500 leading-snug">
              Serving Indiranagar, Koramangala, Domlur & Old Airport Rd.
            </p>
          </div>
        </aside>

        {/* Main Tab Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'payments' && <PaymentsTab />}
            {activeTab === 'tracking' && <TrackingTab />}
            {activeTab === 'riders' && <DeliveryBoysTab />}
            {activeTab === 'staff' && <CanteenStaffTab />}
            {activeTab === 'settings' && <KitchenSettingsTab />}
          </div>
        </main>
      </div>
    </div>
  );
};
