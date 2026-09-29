import React, { useEffect } from 'react';
import { 
  X, 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed,
  CreditCard, 
  Navigation, 
  Bike, 
  Users, 
  AlertTriangle,
  Star,
  Settings, 
  ArrowLeft, 
  ShieldCheck, 
  Building
} from 'lucide-react';

import { useDashboard, type DashboardTab } from '../../context/DashboardContext';
import { OverviewTab } from './OverviewTab';
import { OrdersTab } from './OrdersTab';
import { FoodsTab } from './FoodsTab';
import { PaymentsTab } from './PaymentsTab';
import { TrackingTab } from './TrackingTab';
import { DeliveryBoysTab } from './DeliveryBoysTab';
import { CanteenStaffTab } from './CanteenStaffTab';
import { ComplaintsTab } from './ComplaintsTab';
import { FeedbackTab } from './FeedbackTab';
import { KitchenSettingsTab } from './KitchenSettingsTab';

export const DashboardModal: React.FC = () => {
  const { 
    isDashboardOpen, 
    setIsDashboardOpen, 
    activeTab, 
    setActiveTab, 
    orders, 
    riders, 
    canteenStaff,
    complaints,
    feedbacks
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

  const pendingComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;
  const availableRidersCount = riders.filter((r) => r.status === 'available').length;
  const onDutyStaffCount = canteenStaff.filter((s) => s.status === 'on_duty').length;

  const navItems: { id: DashboardTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'foods', label: 'Menu & Food Controls', icon: UtensilsCrossed },
    { id: 'payments', label: 'Payments (Razorpay)', icon: CreditCard },
    { id: 'tracking', label: 'Floor Delivery Tracking', icon: Navigation },
    { id: 'riders', label: 'Floor Runners', icon: Bike, badge: availableRidersCount },
    { id: 'staff', label: 'Canteen Staff', icon: Users, badge: onDutyStaffCount },
    { id: 'complaints', label: 'Food Complaints', icon: AlertTriangle, badge: pendingComplaintsCount },
    { id: 'feedback', label: 'Customer Reviews', icon: Star, badge: feedbacks.length },
    { id: 'settings', label: 'Settings & Timers', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-gray-900/80 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* 1. Top Navbar Header */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDashboardOpen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Storefront</span>
          </button>

          <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>

          {/* Canteen Hub Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-600 flex items-center justify-center text-white shadow-sm">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-900">
                  Campus <span className="text-emerald-600">Canteen Operations</span>
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider hidden md:inline">
                  Admin & Floor Dispatch Hub
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
              Canteen Kitchen: LIVE
            </div>
            <span>{pendingOrdersCount} Active Orders</span>
            <span>Ground to 9th Floor</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Pure Veg & Jain
            </span>
          </div>

          <button
            onClick={() => setIsDashboardOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            title="Close Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Main Body with Sidebar + Tab Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#F8FAF9]">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-3 md:p-4 flex-shrink-0 overflow-x-auto md:overflow-y-auto scrollbar-none flex md:flex-col justify-between gap-1 md:gap-2">
          <div className="flex md:flex-col gap-1 w-full">
            <div className="text-[10px] uppercase font-bold text-gray-400 px-3 py-2 hidden md:block tracking-wider">
              Canteen Management (Phases 5 & 6)
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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

          {/* Pure Veg Campus License Note */}
          <div className="hidden md:block p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Campus Pure Veg & Jain</span>
            </div>
            <p className="text-[11px] text-emerald-700/80 leading-normal">
              FSSAI Campus Approved. Subsidized student/faculty pricing and ₹0 delivery fee.
            </p>
          </div>
        </aside>

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'foods' && <FoodsTab />}
            {activeTab === 'payments' && <PaymentsTab />}
            {activeTab === 'tracking' && <TrackingTab />}
            {activeTab === 'riders' && <DeliveryBoysTab />}
            {activeTab === 'staff' && <CanteenStaffTab />}
            {activeTab === 'complaints' && <ComplaintsTab />}
            {activeTab === 'feedback' && <FeedbackTab />}
            {activeTab === 'settings' && <KitchenSettingsTab />}
          </div>
        </main>
      </div>
    </div>
  );
};
