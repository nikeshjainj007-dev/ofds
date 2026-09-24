import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ChefHat, 
  Bike, 
  Home, 
  Clock, 
  Phone, 
  MapPin, 
  CreditCard,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Order } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  order: propOrder,
}) => {
  const { activeOrder, pastOrders } = useCart();
  const order = propOrder || activeOrder || pastOrders[0];

  const [activeStep, setActiveStep] = useState<number>(2); // 1: Confirmed, 2: Kitchen, 3: Rider assigned, 4: Out for delivery

  // Simulate progress step progression over time for active orders
  useEffect(() => {
    if (!isOpen || !order) return;
    const timer1 = setTimeout(() => setActiveStep(2), 2000);
    const timer2 = setTimeout(() => setActiveStep(3), 8000);
    const timer3 = setTimeout(() => setActiveStep(4), 16000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const steps = [
    { id: 1, title: 'Order Confirmed', desc: 'Received & verified by restaurant', icon: CheckCircle2 },
    { id: 2, title: 'Satvik Kitchen Preparing', desc: 'Freshly cooked with pure veg hygiene', icon: ChefHat },
    { id: 3, title: 'Rider Assigned', desc: `${order.riderName} is at restaurant`, icon: Bike },
    { id: 4, title: 'Out for Delivery', desc: `On the way to ${order.deliveryAddress.title}`, icon: Home },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="veg-badge bg-white">
              <span className="veg-badge-dot"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full">
              Live Satvik Delivery Tracking
            </span>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-black tracking-tight">
              Order #{order.id}
            </h2>
            <div className="flex items-center gap-1.5 bg-emerald-500/30 border border-emerald-400/40 px-3 py-1 rounded-xl text-xs font-bold text-emerald-100">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Arriving in approx {Math.max(12, order.estimatedMinutes - (activeStep * 3))} mins</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Live Step Tracker */}
          <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/80">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-200">
              {steps.map((st) => {
                const IconComponent = st.icon;
                const isCompleted = activeStep >= st.id;
                const isCurrent = activeStep === st.id;

                return (
                  <div key={st.id} className="relative flex items-start gap-4">
                    {/* Step Icon Badge */}
                    <div
                      className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-white'
                          : 'bg-gray-200 text-gray-400 ring-4 ring-white'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-extrabold ${
                            isCurrent
                              ? 'text-emerald-800'
                              : isCompleted
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {st.title}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Rider Details Card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
                🛵
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold">Delivery Partner</div>
                <div className="text-sm font-extrabold text-gray-900">{order.riderName}</div>
                <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Thermal Insulated Bag • 100% Pure Veg Care
                </div>
              </div>
            </div>

            <a
              href={`tel:${order.riderPhone}`}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-emerald-200"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Rider</span>
            </a>
          </div>

          {/* 3. Items Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider pb-2 border-b border-gray-200">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                Items In This Order
              </span>
              <span>₹{order.grandTotal}</span>
            </div>

            <div className="divide-y divide-gray-200/60">
              {order.items.map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="veg-badge">
                      <span className="veg-badge-dot"></span>
                    </span>
                    <span className="font-bold text-gray-900">{it.quantity}x {it.dish.name}</span>
                    {it.isJainOption && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                        Jain
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-700">₹{it.dish.price * it.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Payment & Delivery Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-gray-500 font-semibold mb-1">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payment Details</span>
              </div>
              <div className="text-gray-900 font-bold text-sm flex items-center gap-2">
                <span>₹{order.grandTotal} Paid via Razorpay</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                  SUCCESS
                </span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono mt-1 truncate">
                Ref ID: {order.paymentId}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-gray-500 font-semibold mb-1">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>Delivery Address</span>
              </div>
              <div className="text-gray-900 font-bold text-xs">
                {order.deliveryAddress.title}
              </div>
              <div className="text-[11px] text-gray-500 truncate mt-0.5">
                {order.deliveryAddress.addressLine}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
