import React from 'react';
import { 
  X, 
  CheckCircle2, 
  ChefHat, 
  Bike, 
  Building, 
  Clock, 
  Phone, 
  Star, 
  AlertTriangle 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useDashboard } from '../context/DashboardContext';
import type { Order } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  onOpenFeedback?: (order: Order) => void;
  onOpenComplaint?: (orderId: string) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  order: propOrder,
  onOpenFeedback,
  onOpenComplaint,
}) => {
  const { activeOrder, pastOrders } = useCart();
  const { updateOrderStatus } = useDashboard();
  const order = propOrder || activeOrder || pastOrders[0];

  const activeStep = !order ? 1 :
    order.status === 'DELIVERED' ? 4 :
    order.status === 'OUT_FOR_DELIVERY' ? 3 :
    order.status === 'KITCHEN_PREPARING' ? 2 : 1;

  if (!isOpen || !order) return null;

  const steps = [
    { id: 1, title: 'Order Confirmed & Paid', desc: 'Paid via Razorpay • Verified by Canteen Desk', icon: CheckCircle2 },
    { id: 2, title: 'Canteen Kitchen Cooking', desc: 'Prepared with 100% Pure Veg & Jain standards', icon: ChefHat },
    { id: 3, title: 'Floor Runner Dispatched', desc: `${order.riderName} taking lift to your wing`, icon: Bike },
    { id: 4, title: 'Arrived at Pickup Zone', desc: `Handed over at ${order.pickupZone || order.deliveryAddress.pickupZone}`, icon: Building },
  ];

  const handleSimulateDelivery = () => {
    updateOrderStatus(order.id, 'DELIVERED');
  };

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
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="veg-badge bg-white">
              <span className="veg-badge-dot"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full">
              Live Campus Floor Delivery Tracking
            </span>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                Order #{order.id}
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                {order.customerName} ({order.customerRole || 'Student'} • {order.customerUsn || '1RV21CS042'})
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/30 border border-emerald-400/40 px-3 py-1 rounded-xl text-xs font-bold text-emerald-100">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{activeStep === 4 ? 'DELIVERED TO PICKUP ZONE' : 'Arriving in ~8 mins'}</span>
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
                    <div 
                      className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-gray-300 text-gray-300'
                      }`}
                    >
                      {isCompleted && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`w-4 h-4 ${isCurrent ? 'text-emerald-700 animate-bounce' : 'text-gray-400'}`} />
                        <h4 className={`text-sm font-extrabold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {st.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-normal">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivered State: Phase 9 Feedback CTA */}
          {activeStep === 4 && (
            <div className="bg-gradient-to-r from-amber-50 to-emerald-50 p-4 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-700 flex items-center justify-center font-bold">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">Food Delivered! How was your meal?</h4>
                  <p className="text-[11px] text-gray-500">Share your rating with the Canteen team (Phase 9)</p>
                </div>
              </div>

              <button
                onClick={() => onOpenFeedback && onOpenFeedback(order)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Rate & Give Feedback</span>
              </button>
            </div>
          )}

          {/* 2. Pickup Zone Details */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-black text-gray-900">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Destination Floor Pickup Zone:</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                ₹0 Delivery Fee
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200 font-bold text-xs text-gray-800">
              {order.pickupZone || order.deliveryAddress.pickupZone || '4th Floor - Wing A (ECE & Telecom Dept)'}
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-gray-500" />
                <span className="font-bold text-gray-800">{order.riderName}</span>
              </div>
              <a
                href={`tel:${order.riderPhone}`}
                className="flex items-center gap-1 text-emerald-700 font-bold hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{order.riderPhone}</span>
              </a>
            </div>
          </div>

          {/* 3. Items Summary */}
          <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
              Ordered Canteen Items
            </h4>
            <div className="divide-y divide-gray-100 text-xs">
              {order.items.map((it, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 font-black text-[10px] flex items-center justify-center">
                      {it.quantity}x
                    </span>
                    <span className="font-semibold text-gray-800">{it.dish.name}</span>
                    {it.isJainOption && (
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        Jain
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">₹{it.dish.price * it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs font-black">
              <span>Grand Total (Paid via Razorpay)</span>
              <span className="text-sm text-emerald-700">₹{order.grandTotal}</span>
            </div>
          </div>

          {/* File Complaint Option (Phase 8) & Test Deliver Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => onOpenComplaint && onOpenComplaint(order.id)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Issue / File Food Complaint (Phase 8)</span>
            </button>

            {activeStep < 4 && (
              <button
                onClick={handleSimulateDelivery}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 underline transition-colors cursor-pointer"
              >
                ⚡ Mark as Delivered (Testing Preview)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
