import React from 'react';
import { X, Clock, ShoppingBag, ChevronRight, CheckCircle2, Building, Star, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Order } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrderToTrack: (order: Order) => void;
  onOpenFeedback?: (order: Order) => void;
  onOpenComplaint?: (orderId: string) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectOrderToTrack,
  onOpenFeedback,
  onOpenComplaint,
}) => {
  const { pastOrders } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-lg">My Campus Meal Orders</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {pastOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-300" />
              <p className="font-bold text-sm text-gray-800">No campus orders yet</p>
              <p className="text-xs text-gray-400">Order breakfast or lunch to have meals delivered to your floor.</p>
            </div>
          ) : (
            pastOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900">
                      Order #{ord.id}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      PAID ₹{ord.grandTotal} (Razorpay)
                    </span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    ord.status === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs text-gray-600">
                  {ord.items.map((it) => `${it.quantity}x ${it.dish.name}`).join(', ')}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Building className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="font-medium text-gray-700 truncate">
                    {ord.pickupZone || ord.deliveryAddress.pickupZone}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-2">
                    {ord.status === 'DELIVERED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenFeedback) onOpenFeedback(ord);
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Rate Meal (Phase 9)</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenComplaint) onOpenComplaint(ord.id);
                      }}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>Complaint</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onSelectOrderToTrack(ord);
                      onClose();
                    }}
                    className="text-emerald-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Track Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
