import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Bike, 
  Users, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  ChevronRight, 
  Sparkles, 
  ChefHat, 
  DollarSign, 
  PlusCircle,
  Navigation
} from 'lucide-react';

import { useDashboard } from '../../context/DashboardContext';

export const OverviewTab: React.FC = () => {
  const { 
    orders, 
    riders, 
    canteenStaff, 
    payments, 
    setActiveTab, 
    setActiveTrackingOrderId 
  } = useDashboard();

  // Calculate live statistics
  const totalRevenue = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeOrders = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  const placedOrders = orders.filter((o) => o.status === 'PLACED');
  const kitchenOrders = orders.filter((o) => o.status === 'KITCHEN_PREPARING');
  const assignedOrders = orders.filter((o) => o.status === 'RIDER_ASSIGNED');
  const outOrders = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY');
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');

  const onDutyRiders = riders.filter((r) => r.status !== 'offline');
  const availableRiders = riders.filter((r) => r.status === 'available');
  const onDutyStaff = canteenStaff.filter((s) => s.status === 'on_duty');

  // Most recent active order to track
  const latestOutOrder = outOrders[0] || assignedOrders[0] || orders[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-emerald-600/60 border border-emerald-400/40 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              Live Canteen Operations • Indiranagar Hub
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Canteen & Delivery Command Center
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Real-time dispatch, kitchen preparation queue, rider fleet telemetry, and pure vegetarian compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('orders')}
              className="px-4 py-2.5 bg-white text-emerald-900 font-bold text-xs rounded-xl shadow hover:bg-emerald-50 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              Manage Orders ({orders.length})
            </button>
            {latestOutOrder && (
              <button
                onClick={() => {
                  setActiveTrackingOrderId(latestOutOrder.id);
                  setActiveTab('tracking');
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow border border-white/20 transition-all flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Track Live Order #{latestOutOrder.id}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Revenue */}
        <div 
          onClick={() => setActiveTab('payments')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Sales Today</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-gray-900">₹{totalRevenue.toLocaleString()}</div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +14.2%
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">100% processed through Razorpay & UPI</p>
        </div>

        {/* Metric 2: Active Orders */}
        <div 
          onClick={() => setActiveTab('orders')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Pipeline</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-gray-900">{activeOrders.length} Orders</div>
            <div className="text-xs font-bold text-amber-600">
              {placedOrders.length} New Needs Action
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {kitchenOrders.length} in kitchen • {outOrders.length} on road
          </p>
        </div>

        {/* Metric 3: Fleet */}
        <div 
          onClick={() => setActiveTab('riders')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Fleet</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bike className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-gray-900">{onDutyRiders.length} Online</div>
            <div className="text-xs font-bold text-emerald-600">
              {availableRiders.length} Available
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">100% EV insulated bags verified</p>
        </div>

        {/* Metric 4: Kitchen Staff */}
        <div 
          onClick={() => setActiveTab('staff')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Canteen Staff</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black text-gray-900">{onDutyStaff.length} On Duty</div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Med Clear
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Morning shift active across 5 stations</p>
        </div>
      </div>

      {/* 3. Real-Time Order Funnel Pipeline */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Order Progress Pipeline
            </h3>
            <p className="text-xs text-gray-500">
              Click any stage to filter orders or take operational action
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('orders')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Open All Orders ({orders.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {/* Stage 1 */}
          <div 
            onClick={() => setActiveTab('orders')}
            className="bg-amber-50 hover:bg-amber-100/70 border border-amber-200/80 rounded-2xl p-4 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-1">
              <span>1. Placed</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            </div>
            <div className="text-2xl font-black text-amber-900">{placedOrders.length}</div>
            <div className="text-[11px] text-amber-700 mt-1">Pending kitchen accept</div>
          </div>

          {/* Stage 2 */}
          <div 
            onClick={() => setActiveTab('orders')}
            className="bg-orange-50 hover:bg-orange-100/70 border border-orange-200/80 rounded-2xl p-4 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-orange-800 mb-1">
              <span>2. In Kitchen</span>
              <ChefHat className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-orange-900">{kitchenOrders.length}</div>
            <div className="text-[11px] text-orange-700 mt-1">Cooking with desi ghee</div>
          </div>

          {/* Stage 3 */}
          <div 
            onClick={() => setActiveTab('orders')}
            className="bg-blue-50 hover:bg-blue-100/70 border border-blue-200/80 rounded-2xl p-4 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-blue-800 mb-1">
              <span>3. Rider Ready</span>
              <Bike className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-900">{assignedOrders.length}</div>
            <div className="text-[11px] text-blue-700 mt-1">At kitchen pickup gate</div>
          </div>

          {/* Stage 4 */}
          <div 
            onClick={() => setActiveTab('tracking')}
            className="bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200/80 rounded-2xl p-4 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-indigo-800 mb-1">
              <span>4. Out for Delivery</span>
              <Navigation className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-900">{outOrders.length}</div>
            <div className="text-[11px] text-indigo-700 mt-1">On the road • Track GPS</div>
          </div>

          {/* Stage 5 */}
          <div 
            onClick={() => setActiveTab('orders')}
            className="bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-2xl p-4 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-1">
              <span>5. Delivered</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-900">{deliveredOrders.length}</div>
            <div className="text-[11px] text-emerald-700 mt-1">Completed successfully</div>
          </div>
        </div>
      </div>

      {/* 4. Two Column Section: Live Active Orders & Fleet Quick Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Priority Orders Queue */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Live Orders Requiring Attention
              </h3>
              <p className="text-xs text-gray-500">Real-time status changes and rider dispatch</p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              View Full Table →
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-700">All current orders have been completed and delivered!</p>
              <p className="text-[11px] text-gray-400 mt-0.5">New orders from web storefront will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-900">#{order.id}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        order.status === 'PLACED' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'KITCHEN_PREPARING' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'RIDER_ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      {order.items.some(i => i.isJainOption) && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.2 rounded-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" /> Jain
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium text-gray-900">{order.customerName || order.deliveryAddress.title}</span> • {order.items.map(i => `${i.quantity}x ${i.dish.name}`).join(', ')}
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-3">
                      <span>🕒 {order.createdAt}</span>
                      <span>🛵 Rider: {order.riderName}</span>
                      <span className="font-bold text-gray-700">₹{order.grandTotal}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setActiveTrackingOrderId(order.id);
                        setActiveTab('tracking');
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5 text-gray-600" />
                      Track
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Fleet & Operations Summary */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Bike className="w-4 h-4 text-emerald-600" />
              Fleet & Kitchen Pulse
            </h3>
            <p className="text-xs text-gray-500">Live roster summary</p>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Delivery Boys</div>
            {riders.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="text-xs font-extrabold text-gray-900">{r.name}</div>
                    <div className="text-[10px] text-gray-500">{r.vehicleType} • {r.vehicleNumber}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    r.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                    r.status === 'on_delivery' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {r.status === 'available' ? 'Ready' : r.status === 'on_delivery' ? 'On Trip' : 'Offline'}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-0.5">⭐ {r.rating}</div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setActiveTab('riders')}
              className="w-full text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 py-1.5"
            >
              View All {riders.length} Delivery Boys →
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Pure Veg Compliance:</span>
              <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Certified
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Staff Health Clearance:</span>
              <span className="font-bold text-gray-900">Valid until Dec 2026</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Daily Sanitization:</span>
              <span className="font-bold text-emerald-700">Completed at 06:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
