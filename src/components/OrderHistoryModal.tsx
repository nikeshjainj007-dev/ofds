import React from 'react';
import { X, Clock, ShoppingBag, ChevronRight, CheckCircle2, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Order } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrderToTrack: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectOrderToTrack,
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
            <h3 className="font-extrabold text-lg">My Past Orders</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {pastOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-300" />
              <p className="font-bold text-sm text-gray-800">No past orders yet</p>
              <p className="text-xs text-gray-400">Your delicious veg deliveries will show up here.</p>
            </div>
          ) : (
            pastOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => {
                  onSelectOrderToTrack(ord);
                  onClose();
                }}
                className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900 group-hover:text-emerald-700">
                      Order #{ord.id}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      PAID ₹{ord.grandTotal}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{ord.createdAt}</span>
                </div>

                <div className="text-xs text-gray-600 mb-2">
                  {ord.items.map((it) => `${it.quantity}x ${it.dish.name}`).join(', ')}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 text-gray-500">
                  <span className="flex items-center gap-1 truncate max-w-[250px]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    {ord.deliveryAddress.title}
                  </span>
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    <span>Track Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
