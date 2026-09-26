import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useToast } from '../../context/ToastContext';

export const KitchenSettingsTab: React.FC = () => {
  const { canteenSettings, updateCanteenSettings } = useDashboard();
  const { showToast } = useToast();

  const handleToggleKitchen = () => {
    updateCanteenSettings({ isKitchenOpen: !canteenSettings.isKitchenOpen });
    showToast(
      canteenSettings.isKitchenOpen ? 'Kitchen is now marked CLOSED' : 'Kitchen is now LIVE & ACCEPTING ORDERS',
      canteenSettings.isKitchenOpen ? 'info' : 'success'
    );
  };


  const handleToggleAutoAccept = () => {
    updateCanteenSettings({ autoAcceptOrders: !canteenSettings.autoAcceptOrders });
    showToast('Auto-accept setting updated', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span>Kitchen & Canteen Settings</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure operational state, dispatch thresholds, buffer prep times, and pure veg compliance
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        {/* Toggle 1: Kitchen Operational State */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-gray-900">Live Kitchen Order Intake</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                canteenSettings.isKitchenOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {canteenSettings.isKitchenOpen ? 'OPEN FOR ORDERS' : 'KITCHEN CLOSED'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              When turned off, customer storefront will display kitchen pause notice and disallow new cart checkouts.
            </p>
          </div>

          <button
            onClick={handleToggleKitchen}
            className={`w-14 h-8 rounded-full transition-colors relative p-1 ${
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

        {/* Toggle 2: Auto-Accept incoming orders */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="space-y-1">
            <span className="font-extrabold text-sm text-gray-900">Auto-Accept Incoming Orders</span>
            <p className="text-xs text-gray-500">
              Automatically transition new placed orders to "Kitchen Preparing" status immediately without manual manager approval.
            </p>
          </div>

          <button
            onClick={handleToggleAutoAccept}
            className={`w-14 h-8 rounded-full transition-colors relative p-1 ${
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

        {/* Prep Time & Delivery Radius Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <label className="block font-bold text-xs text-gray-700">
              Default Cooking Prep Time Buffer (Minutes)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="5"
                max="60"
                value={canteenSettings.defaultPrepMinutes}
                onChange={(e) => updateCanteenSettings({ defaultPrepMinutes: Number(e.target.value) })}
                className="w-24 p-2 bg-white border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-emerald-600"
              />
              <span className="text-xs text-gray-500">Estimated kitchen prep time added to customer ETA</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <label className="block font-bold text-xs text-gray-700">
              Fleet Delivery Service Radius (Kilometers)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.5"
                min="1"
                max="25"
                value={canteenSettings.deliveryRadiusKm}
                onChange={(e) => updateCanteenSettings({ deliveryRadiusKm: Number(e.target.value) })}
                className="w-24 p-2 bg-white border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-emerald-600"
              />
              <span className="text-xs text-gray-500">Maximum radial distance from Indiranagar Kitchen</span>
            </div>
          </div>
        </div>

        {/* Compliance & Pure Veg Info */}
        <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Sacred Pure Vegetarian & FSSAI Standards Verification</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
            <div>
              FSSAI License: <strong>{canteenSettings.fssaiLicenseNumber}</strong>
            </div>
            <div>
              Pure Veg Audit: <strong className="text-emerald-700">Passed with 100% Score (Bi-Weekly Audit)</strong>
            </div>
            <div>
              Central Support Phone: <strong>{canteenSettings.contactSupportPhone}</strong>
            </div>
            <div>
              Dispatch Hub: <strong>100ft Road, Indiranagar, Bengaluru 560038</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
