import React from 'react';
import { Clock, RefreshCw, Sparkles, Building } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useToast } from '../../context/ToastContext';

export const KitchenSettingsTab: React.FC = () => {
  const { canteenSettings, updateCanteenSettings, resetToCleanState } = useDashboard();
  const { showToast } = useToast();

  const handleToggleKitchen = () => {
    updateCanteenSettings({ isKitchenOpen: !canteenSettings.isKitchenOpen });
    showToast(
      canteenSettings.isKitchenOpen ? 'Campus Canteen is now marked CLOSED' : 'Campus Canteen is now OPEN FOR ORDERS',
      canteenSettings.isKitchenOpen ? 'info' : 'success'
    );
  };

  const handleToggleAutoAccept = () => {
    updateCanteenSettings({ autoAcceptOrders: !canteenSettings.autoAcceptOrders });
    showToast('Auto-accept setting updated', 'info');
  };

  const handleToggleDemoBypass = () => {
    const nextVal = !canteenSettings.demoBypassTiming;
    updateCanteenSettings({ demoBypassTiming: nextVal });
    showToast(
      nextVal
        ? 'Demo mode enabled: Orders can be placed at any time of day for testing!'
        : 'Strict campus timing enforced (Breakfast cutoff 9:40 AM, Lunch cutoff 2:10 PM).',
      nextVal ? 'success' : 'info'
    );
  };

  const handleResetData = () => {
    if (confirm('Reset all previous test data and restore clean campus initial menu & orders?')) {
      resetToCleanState();
      showToast('All previous test data cleared. Restored clean campus readymade state!', 'success', 'Data Reset');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span>Campus Canteen & Timing Settings</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure meal slot timings, 20-minute pre-order cutoffs, floor dispatch buffer, and demo modes (Phase 4)
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        {/* Toggle 1: Kitchen Operational State */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-gray-900">Live Canteen Order Intake</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                canteenSettings.isKitchenOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {canteenSettings.isKitchenOpen ? 'CANTEEN OPEN' : 'CANTEEN CLOSED'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              When turned off, student storefront will display kitchen pause notice and disallow cart checkouts.
            </p>
          </div>

          <button
            onClick={handleToggleKitchen}
            className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
              canteenSettings.isKitchenOpen ? 'bg-emerald-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                canteenSettings.isKitchenOpen ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* Phase 4 Slot Timing Policy Card */}
        <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
              <Clock className="w-5 h-5 text-emerald-700" />
              <span>Campus Meal Slots & 20-Minute Pre-Order Cutoff (Phase 4)</span>
            </div>
            <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full uppercase">
              Schedule Enforced
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-white rounded-xl border border-emerald-100 space-y-1.5">
              <div className="font-bold text-gray-900 flex items-center justify-between">
                <span>🥞 Breakfast Slot</span>
                <span className="text-emerald-700 font-extrabold">9:30 AM – 10:00 AM</span>
              </div>
              <p className="text-gray-500 text-[11px]">
                Orders accepted until <strong>9:40 AM</strong> (20 mins before 10:00 AM close). After 9:40 AM, orders cannot be placed.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-emerald-100 space-y-1.5">
              <div className="font-bold text-gray-900 flex items-center justify-between">
                <span>🍛 Lunch Slot</span>
                <span className="text-emerald-700 font-extrabold">1:20 PM – 2:30 PM</span>
              </div>
              <p className="text-gray-500 text-[11px]">
                Orders accepted until <strong>2:10 PM</strong> (20 mins before 2:30 PM close). After 2:10 PM, orders cannot be placed.
              </p>
            </div>
          </div>

          {/* Demo Bypass Toggle */}
          <div className="pt-2 border-t border-emerald-200/50 flex items-center justify-between">
            <div>
              <div className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Demo Mode: Allow 24/7 Ordering for Evaluation</span>
              </div>
              <p className="text-[11px] text-emerald-800/80">
                When enabled, examiners and testers can place orders at any hour of the day to verify all phases.
              </p>
            </div>

            <button
              onClick={handleToggleDemoBypass}
              className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
                canteenSettings.demoBypassTiming ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  canteenSettings.demoBypassTiming ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>

        {/* Toggle 2: Auto-Accept incoming orders */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="space-y-1">
            <span className="font-extrabold text-sm text-gray-900">Auto-Accept Incoming Orders</span>
            <p className="text-xs text-gray-500">
              Immediately transition new orders to "Kitchen Preparing" status without manual approval.
            </p>
          </div>

          <button
            onClick={handleToggleAutoAccept}
            className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
              canteenSettings.autoAcceptOrders ? 'bg-emerald-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                canteenSettings.autoAcceptOrders ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* Floor Dispatch Hub info */}
        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-gray-900 font-extrabold text-sm">
            <Building className="w-5 h-5 text-emerald-600" />
            <span>Campus Pickup Zone Fleet Service (Ground Floor to 9th Floor)</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Floor runners operate insulated food trolleys and carts covering Wing A & Wing B across all 9 floors. Deliveries are 100% free of delivery charges (₹0 fee).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 pt-1">
            <div>FSSAI Campus License: <strong>{canteenSettings.fssaiLicenseNumber}</strong></div>
            <div>Pure Veg & Jain Audit: <strong className="text-emerald-700">100% Certified</strong></div>
            <div>Helpdesk Phone: <strong>{canteenSettings.contactSupportPhone}</strong></div>
            <div>Central Canteen: <strong>Ground Floor Central Block</strong></div>
          </div>
        </div>

        {/* Clean Up Test Data ("Remove all Test Data as like Readymade") */}
        <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-xs text-rose-900">Restore Clean Campus Readymade State</h4>
            <p className="text-[11px] text-rose-700/80 mt-0.5">
              Purges any accumulated test data from browser cache and resets canteen menu, fresh orders, and settings.
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Test Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
