import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Clock, 
  Bike, 
  CheckCircle2, 
  ChefHat, 
  Navigation, 
  Eye, 
  Sparkles, 
  Printer, 
  User, 
  Phone, 
  MapPin
} from 'lucide-react';

import { useDashboard } from '../../context/DashboardContext';
import { DISHES } from '../../data/mockData';
import type { Order } from '../../types';

export const OrdersTab: React.FC = () => {
  const { 
    orders, 
    updateOrderStatus, 
    assignRiderToOrder, 
    cancelOrder, 
    addManualOrder, 
    riders, 
    setActiveTrackingOrderId, 
    setActiveTab 
  } = useDashboard();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [assigningRiderOrderId, setAssigningRiderOrderId] = useState<string | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Order Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newSelectedDishId, setNewSelectedDishId] = useState(DISHES[0].id);
  const [newDishQuantity, setNewDishQuantity] = useState(1);
  const [newIsJain, setNewIsJain] = useState(true);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'Razorpay' | 'UPI' | 'Cash on Delivery'>('UPI');
  const [newNotes, setNewNotes] = useState('');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Status filter
      if (statusFilter !== 'ALL' && ord.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = ord.id.toLowerCase().includes(query);
        const matchesCustomer = (ord.customerName || ord.deliveryAddress.title).toLowerCase().includes(query);
        const matchesPhone = (ord.customerPhone || '').includes(query);
        const matchesItems = ord.items.some((i) => i.dish.name.toLowerCase().includes(query));
        if (!matchesId && !matchesCustomer && !matchesPhone && !matchesItems) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleCreateNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const dish = DISHES.find(d => d.id === newSelectedDishId) || DISHES[0];
    const itemTotal = dish.price * newDishQuantity;
    const gst = Math.round(itemTotal * 0.05);
    const grandTotal = itemTotal + gst + 5; // platform fee

    addManualOrder({
      customerName: newCustomerName || 'Walk-in Guest',
      customerPhone: newCustomerPhone || '+91 98450 11223',
      deliveryAddress: {
        id: 'addr-' + Date.now(),
        type: 'Home',
        title: newCustomerName || 'Counter Pickup / Delivery',
        addressLine: newAddress || 'Counter Pickup - Indiranagar Kitchen Hub',
        landmark: 'HAL 2nd Stage'
      },
      items: [
        {
          dish,
          quantity: newDishQuantity,
          isJainOption: newIsJain,
          spiceLevel: 'Medium',
          specialNote: newNotes
        }
      ],
      itemTotal,
      deliveryFee: 0,
      grandTotal,
      paymentMethod: newPaymentMethod,
      paymentStatus: newPaymentMethod === 'Cash on Delivery' ? 'PENDING' : 'PAID',
      status: 'PLACED',
      notes: newNotes,
      restaurantName: dish.restaurantName
    });

    setIsNewOrderModalOpen(false);
    // Reset form
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewAddress('');
    setNewNotes('');
  };

  const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
    PLACED: { label: 'Placed', bg: 'bg-amber-100', text: 'text-amber-800' },
    KITCHEN_PREPARING: { label: 'In Kitchen', bg: 'bg-orange-100', text: 'text-orange-800' },
    RIDER_ASSIGNED: { label: 'Rider Assigned', bg: 'bg-blue-100', text: 'text-blue-800' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-indigo-100', text: 'text-indigo-800' },
    DELIVERED: { label: 'Delivered', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-rose-100', text: 'text-rose-800' },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Orders Management</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {filteredOrders.length} of {orders.length}
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            View, advance cooking stages, assign delivery fleet, or manage order cancellations
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Walk-in / Phone Order
        </button>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Orders', count: orders.length },
              { id: 'PLACED', label: 'Placed', count: orders.filter(o => o.status === 'PLACED').length },
              { id: 'KITCHEN_PREPARING', label: 'In Kitchen', count: orders.filter(o => o.status === 'KITCHEN_PREPARING').length },
              { id: 'RIDER_ASSIGNED', label: 'Rider Assigned', count: orders.filter(o => o.status === 'RIDER_ASSIGNED').length },
              { id: 'OUT_FOR_DELIVERY', label: 'On Way', count: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length },
              { id: 'DELIVERED', label: 'Delivered', count: orders.filter(o => o.status === 'DELIVERED').length },
              { id: 'CANCELLED', label: 'Cancelled', count: orders.filter(o => o.status === 'CANCELLED').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order #, Customer, Item..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. Orders List Table / Card Grid */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <Clock className="w-10 h-10 text-gray-300 mx-auto" />
            <div className="text-sm font-bold text-gray-800">No orders match the selected filter</div>
            <p className="text-xs text-gray-400">Try changing status filter or clearing search criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => {
              const badge = statusBadges[order.status] || { label: order.status, bg: 'bg-gray-100', text: 'text-gray-700' };

              return (
                <div 
                  key={order.id} 
                  className="p-5 hover:bg-gray-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  {/* Left Column: Order details & items */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-black text-gray-900 tracking-tight">#{order.id}</span>
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">🕒 {order.createdAt}</span>
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                        {order.restaurantName || 'SatvikBite Kitchen'}
                      </span>
                      {order.items.some(i => i.isJainOption) && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" /> Pure Jain
                        </span>
                      )}
                    </div>

                    {/* Customer & Address */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1 font-bold text-gray-800">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{order.customerName || order.deliveryAddress.title}</span>
                      </div>
                      {order.customerPhone && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.customerPhone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-500 truncate max-w-sm">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        <span className="truncate">{order.deliveryAddress.addressLine}</span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex flex-wrap gap-2 items-center">
                      <span className="font-bold text-gray-500 uppercase text-[10px]">Items:</span>
                      {order.items.map((it, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded border border-gray-200 text-xs font-medium">
                          {it.quantity}x {it.dish.name}
                          {it.isJainOption && <span className="text-[10px] text-amber-600 font-bold ml-1">(Jain)</span>}
                        </span>
                      ))}
                      {order.notes && (
                        <span className="text-[11px] text-amber-700 italic ml-2">
                          Note: "{order.notes}"
                        </span>
                      )}
                    </div>

                    {/* Assigned Rider & ETA */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5 text-blue-600" />
                        <span>Rider: <strong className="text-gray-800">{order.riderName}</strong></span>
                        {order.riderPhone && order.riderPhone !== '--' && (
                          <span className="text-gray-400">({order.riderPhone})</span>
                        )}
                      </div>
                      {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                        <div className="flex items-center gap-1 text-amber-700 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>ETA: ~{order.estimatedMinutes} mins</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Price & Quick Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 min-w-[220px] pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                    <div className="text-right">
                      <div className="text-lg font-black text-gray-900">₹{order.grandTotal}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 justify-end">
                        <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span>{order.paymentMethod || 'Razorpay'} ({order.paymentStatus})</span>
                      </div>
                    </div>

                    {/* Dynamic Action Buttons depending on status */}
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      {order.status === 'PLACED' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'KITCHEN_PREPARING')}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                            Send to Kitchen
                          </button>
                          <button
                            onClick={() => cancelOrder(order.id, 'Cancelled by kitchen dispatch manager')}
                            className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {order.status === 'KITCHEN_PREPARING' && (
                        <div className="relative">
                          {assigningRiderOrderId === order.id ? (
                            <div className="flex items-center gap-1 bg-white border border-gray-300 p-1 rounded-xl shadow-lg z-20">
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    assignRiderToOrder(order.id, e.target.value);
                                    setAssigningRiderOrderId(null);
                                  }
                                }}
                                defaultValue=""
                                className="text-xs p-1 outline-none font-medium bg-transparent"
                              >
                                <option value="" disabled>Choose Delivery Boy...</option>
                                {riders.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name} ({r.vehicleType} - {r.status === 'available' ? '🟢 Ready' : '🟡 On Trip'})
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => setAssigningRiderOrderId(null)}
                                className="text-gray-400 hover:text-gray-600 text-xs p-1"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAssigningRiderOrderId(order.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1"
                            >
                              <Bike className="w-3.5 h-3.5" />
                              Assign Delivery Boy
                            </button>
                          )}
                        </div>
                      )}

                      {order.status === 'RIDER_ASSIGNED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Dispatch / Out for Delivery
                        </button>
                      )}

                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <>
                          <button
                            onClick={() => {
                              setActiveTrackingOrderId(order.id);
                              setActiveTab('tracking');
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            Live Track
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark Delivered
                          </button>
                        </>
                      )}

                      {/* Detail View button */}
                      <button
                        onClick={() => setSelectedOrderForDetails(order)}
                        className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Full Bill & Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Order Details Modal */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in zoom-in-95">
            <div className="p-6 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-extrabold text-emerald-200 tracking-wider">
                  Order Invoice & Dispatch Receipt
                </div>
                <h3 className="text-xl font-black mt-0.5">Order #{selectedOrderForDetails.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="text-white/80 hover:text-white bg-black/20 p-2 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
                <div className="font-extrabold text-gray-900 text-sm">
                  {selectedOrderForDetails.customerName || selectedOrderForDetails.deliveryAddress.title}
                </div>
                <div className="text-gray-500">{selectedOrderForDetails.customerPhone || 'Phone: Not provided'}</div>
                <div className="text-gray-600 font-medium">📍 {selectedOrderForDetails.deliveryAddress.addressLine}</div>
                {selectedOrderForDetails.deliveryAddress.landmark && (
                  <div className="text-gray-400">Landmark: {selectedOrderForDetails.deliveryAddress.landmark}</div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kitchen Order Items</div>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                  {selectedOrderForDetails.items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{it.quantity}x</span>
                        <span className="font-semibold text-gray-800">{it.dish.name}</span>
                        {it.isJainOption && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">Jain</span>
                        )}
                      </div>
                      <div className="font-extrabold text-gray-900">₹{it.dish.price * it.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Breakup */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Item Subtotal:</span>
                  <span>₹{selectedOrderForDetails.itemTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge:</span>
                  <span>₹{selectedOrderForDetails.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee:</span>
                  <span>₹{selectedOrderForDetails.platformFee}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (5% Pure Veg Food):</span>
                  <span>₹{selectedOrderForDetails.gst}</span>
                </div>
                {selectedOrderForDetails.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Coupon:</span>
                    <span>-₹{selectedOrderForDetails.discount}</span>
                  </div>
                )}
                {selectedOrderForDetails.tip > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Partner Tip:</span>
                    <span>₹{selectedOrderForDetails.tip}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between font-black text-sm text-gray-900">
                  <span>Grand Total:</span>
                  <span>₹{selectedOrderForDetails.grandTotal}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>Payment Ref: <code className="font-mono text-[11px] text-gray-700">{selectedOrderForDetails.paymentId}</code></span>
                <span className="font-bold text-emerald-600">{selectedOrderForDetails.paymentMethod || 'Razorpay'} ({selectedOrderForDetails.paymentStatus})</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Kitchen Slip
              </button>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Create Walk-in / Phone Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in zoom-in-95">
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-green-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">New Walk-in / Phone Order</h3>
                <p className="text-xs text-emerald-200">Generate order directly into kitchen queue</p>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-white/80 hover:text-white bg-black/20 p-2 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewOrder} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Shah"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Dish</label>
                <select
                  value={newSelectedDishId}
                  onChange={(e) => setNewSelectedDishId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-medium"
                >
                  {DISHES.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — ₹{d.price} ({d.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newDishQuantity}
                    onChange={(e) => setNewDishQuantity(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e: any) => setNewPaymentMethod(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="UPI">UPI (Instant)</option>
                    <option value="Razorpay">Razorpay Card</option>
                    <option value="Cash on Delivery">Cash at Counter</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="jainCheck"
                  checked={newIsJain}
                  onChange={(e) => setNewIsJain(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="jainCheck" className="text-gray-700 font-semibold cursor-pointer">
                  Strict Jain Recipe (No Onion, No Garlic, No Roots)
                </label>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Delivery Address or Counter Desk</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. Counter Pickup / Indiranagar 100ft Road"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Cooking / Packaging Instructions</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Extra hot chutney, double paper packing"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Send to Kitchen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
