import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Bike, 
  Phone, 
  ShieldCheck, 
  Compass, 
  Zap, 
  BatteryCharging, 
  ChefHat, 
  Home, 
  CheckCircle2, 
  Play, 
  RotateCcw
} from 'lucide-react';

import { useDashboard } from '../../context/DashboardContext';

export const TrackingTab: React.FC = () => {
  const { 
    orders, 
    riders, 
    activeTrackingOrderId, 
    setActiveTrackingOrderId, 
    updateOrderStatus 
  } = useDashboard();

  // Find active order or fallback to first order
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const targetOrder = orders.find(o => o.id === activeTrackingOrderId) || activeOrders[0] || orders[0];

  // Simulated GPS progression state (0% to 100%)
  const [routeProgress, setRouteProgress] = useState<number>(() => {
    if (!targetOrder) return 30;
    if (targetOrder.status === 'PLACED') return 5;
    if (targetOrder.status === 'KITCHEN_PREPARING') return 20;
    if (targetOrder.status === 'RIDER_ASSIGNED') return 45;
    if (targetOrder.status === 'OUT_FOR_DELIVERY') return 70;
    if (targetOrder.status === 'DELIVERED') return 100;
    return 35;
  });

  const [isSimulating, setIsSimulating] = useState(false);

  // Sync progress when selected order changes
  useEffect(() => {
    if (!targetOrder) return;
    if (targetOrder.status === 'PLACED') setRouteProgress(5);
    else if (targetOrder.status === 'KITCHEN_PREPARING') setRouteProgress(20);
    else if (targetOrder.status === 'RIDER_ASSIGNED') setRouteProgress(45);
    else if (targetOrder.status === 'OUT_FOR_DELIVERY') setRouteProgress(70);
    else if (targetOrder.status === 'DELIVERED') setRouteProgress(100);
  }, [targetOrder?.id, targetOrder?.status]);

  // Simulation timer
  useEffect(() => {
    let interval: any = null;
    if (isSimulating && routeProgress < 100) {
      interval = setInterval(() => {
        setRouteProgress((prev) => {
          if (prev >= 98) {
            setIsSimulating(false);
            if (targetOrder) updateOrderStatus(targetOrder.id, 'DELIVERED');
            return 100;
          }
          return prev + 2;
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isSimulating, routeProgress, targetOrder, updateOrderStatus]);

  if (!targetOrder) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <Navigation className="w-12 h-12 text-gray-300 mx-auto" />
        <h3 className="text-base font-bold text-gray-800">No active orders to track</h3>
        <p className="text-xs text-gray-400">Place an order or choose another tab from the dashboard.</p>
      </div>
    );
  }

  const assignedRider = riders.find(r => r.name === targetOrder.riderName || r.id === targetOrder.riderId) || riders[0];
  const remainingKm = Math.max(0.1, (2.8 * (1 - routeProgress / 100))).toFixed(1);
  const calculatedEtaMins = Math.max(1, Math.round(targetOrder.estimatedMinutes * (1 - routeProgress / 100)));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Order Selection Strip */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Active Fleet GPS Telemetry
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-lg font-black text-gray-900">
                Tracking Order #{targetOrder.id}
              </h2>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                targetOrder.status === 'OUT_FOR_DELIVERY' ? 'bg-indigo-100 text-indigo-800' :
                targetOrder.status === 'RIDER_ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                targetOrder.status === 'KITCHEN_PREPARING' ? 'bg-orange-100 text-orange-800' :
                targetOrder.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {targetOrder.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Selector for other active orders */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap hidden md:inline">
              Switch Order:
            </span>
            <select
              value={targetOrder.id}
              onChange={(e) => setActiveTrackingOrderId(e.target.value)}
              className="text-xs font-bold bg-gray-50 border border-gray-200 text-gray-800 px-3 py-2 rounded-xl outline-none focus:border-emerald-600"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id} — {o.customerName || o.deliveryAddress.title} ({o.status.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Graphical Interactive Map Canvas */}
      <div className="bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-gray-800">
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        ></div>

        {/* Live Status Header inside map */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Live GPS Transit Telemetry
              </div>
              <div className="text-sm font-black text-white mt-0.5">
                {assignedRider.name} is {routeProgress >= 100 ? 'Delivered' : `en route (${remainingKm} km away)`}
              </div>
            </div>
          </div>

          {/* Quick simulation controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow ${
                isSimulating 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              {isSimulating ? 'Pause GPS Motion' : 'Simulate Live Motion'}
            </button>
            <button
              onClick={() => {
                setIsSimulating(false);
                setRouteProgress(20);
                if (targetOrder) updateOrderStatus(targetOrder.id, 'OUT_FOR_DELIVERY');
              }}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-colors"
              title="Reset Route Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Simulated Route Diagram */}
        <div className="relative z-10 my-8 py-4">
          <div className="relative w-full max-w-3xl mx-auto">
            {/* The Route Path Line */}
            <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden relative shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${routeProgress}%` }}
              ></div>
            </div>

            {/* Stage Markers along the line */}
            <div className="flex items-center justify-between -mt-6">
              {/* Point 1: Canteen Kitchen */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-emerald-400">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs font-extrabold text-white">Central Canteen Hub</div>
                  <div className="text-[10px] text-gray-400">Indiranagar 100ft Rd</div>
                </div>
              </div>

              {/* Point 2: Middle Checkpoint */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  routeProgress >= 50
                    ? 'bg-teal-600 border-teal-300 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-500'
                }`}>
                  <Navigation className="w-3.5 h-3.5" />
                </div>
                <div className="text-center mt-2">
                  <div className="text-[11px] font-bold text-gray-300">Transit Corridor</div>
                  <div className="text-[9px] text-gray-500">CMH Road Junction</div>
                </div>
              </div>

              {/* Point 3: Customer Doorstep */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-all ${
                  routeProgress >= 100
                    ? 'bg-emerald-500 border-emerald-300 text-white'
                    : 'bg-indigo-950 border-indigo-700 text-indigo-400'
                }`}>
                  <Home className="w-5 h-5" />
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs font-extrabold text-white">
                    {targetOrder.deliveryAddress.title || 'Customer'}
                  </div>
                  <div className="text-[10px] text-gray-400 max-w-[130px] truncate">
                    {targetOrder.deliveryAddress.addressLine}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Moving Rider Pin Marker */}
            <div 
              className="absolute -top-7 transition-all duration-500 ease-out flex flex-col items-center pointer-events-none"
              style={{ left: `calc(${routeProgress}% - 20px)` }}
            >
              <div className="bg-amber-400 text-gray-950 p-2 rounded-2xl shadow-xl border-2 border-white flex items-center justify-center animate-bounce">
                <Bike className="w-4 h-4" />
              </div>
              <div className="text-[9px] font-black uppercase tracking-wider bg-gray-950/90 text-amber-300 px-2 py-0.5 rounded-full mt-1 border border-amber-400/40">
                {assignedRider.name.split(' ')[0]} ({remainingKm} km)
              </div>
            </div>
          </div>
        </div>

        {/* Live Telemetry Data Ticker */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold">Estimated Arrival</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">
              {routeProgress >= 100 ? 'Delivered' : `~${calculatedEtaMins} Minutes`}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Calculated via live speed</div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold">Distance Remaining</div>
            <div className="text-lg font-black text-white mt-0.5">{remainingKm} km</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Total span: 2.8 km</div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold">Fleet Vehicle</div>
            <div className="text-lg font-black text-white mt-0.5">{assignedRider.vehicleType}</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <Zap className="w-3 h-3" /> Reg: {assignedRider.vehicleNumber}
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold">EV Battery</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">
              {assignedRider.batteryLevel || 84}%
            </div>
            <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
              <BatteryCharging className="w-3 h-3 text-emerald-400" /> Insulated Box: Sealed
            </div>
          </div>
        </div>
      </div>

      {/* 3. Rider & Customer Contact Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rider Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Assigned Delivery Partner
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              ⭐ {assignedRider.rating} Rating
            </span>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={assignedRider.avatar}
              alt={assignedRider.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-100 shadow-sm"
            />
            <div>
              <h4 className="text-base font-black text-gray-900">{assignedRider.name}</h4>
              <p className="text-xs text-gray-500">{assignedRider.vehicleType} • {assignedRider.vehicleNumber}</p>
              <div className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pure Veg Insulated Bag Verified
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
            <div className="text-gray-500">
              Phone: <strong className="text-gray-900">{assignedRider.phone}</strong>
            </div>
            <a
              href={`tel:${assignedRider.phone}`}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Rider
            </a>
          </div>
        </div>

        {/* Customer Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Customer & Drop-off Destination
            </div>
            <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              Order #{targetOrder.id}
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-black text-gray-900">
              {targetOrder.customerName || targetOrder.deliveryAddress.title}
            </h4>
            <p className="text-xs text-gray-600 font-medium">
              📍 {targetOrder.deliveryAddress.addressLine}
            </p>
            {targetOrder.deliveryAddress.landmark && (
              <p className="text-[11px] text-gray-400">
                Landmark: {targetOrder.deliveryAddress.landmark}
              </p>
            )}
            {targetOrder.notes && (
              <p className="text-[11px] text-amber-700 font-medium italic mt-1 bg-amber-50 p-2 rounded-xl border border-amber-100">
                Customer instructions: "{targetOrder.notes}"
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
            <div className="text-gray-500">
              Phone: <strong className="text-gray-900">{targetOrder.customerPhone || targetOrder.riderPhone || '--'}</strong>
            </div>
            {targetOrder.status !== 'DELIVERED' && (
              <button
                onClick={() => updateOrderStatus(targetOrder.id, 'DELIVERED')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center gap-1 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm Delivery
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
