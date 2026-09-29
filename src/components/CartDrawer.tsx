import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  Check, 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  CreditCard,
  Sparkles,
  MapPin,
  Loader2,
  Building,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDashboard } from '../context/DashboardContext';
import { initiateRazorpayPayment } from '../lib/razorpay';
import { getCampusScheduleStatus } from '../lib/campusSchedule';
import { COUPONS } from '../data/mockData';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  onOrderSuccess: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderSuccess }) => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart,
    itemTotal, 
    discount, 
    gst, 
    grandTotal, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    isCartOpen, 
    setIsCartOpen,
    selectedAddress,
    placeOrder
  } = useCart();

  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const { canteenSettings } = useDashboard();

  const [couponInput, setCouponInput] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [specialInstruction, setSpecialInstruction] = useState('');

  const schedule = getCampusScheduleStatus(new Date(), canteenSettings.demoBypassTiming);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (code: string) => {
    const res = applyCoupon(code);
    if (res.success) {
      showToast(res.message, 'success', 'Coupon Applied');
      setCouponInput('');
    } else {
      showToast(res.message, 'error', 'Coupon Error');
    }
  };

  const handleProceedToPayment = async () => {
    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    // Require Auth before payment (Phase 2)
    if (!user) {
      showToast('Please log in with your Student/Teacher ID to order', 'info', 'Authentication Required');
      openAuthModal();
      return;
    }

    // Schedule Enforcement (Phase 4): 20 mins cutoff rule
    if (!schedule.canOrderAny && !canteenSettings.demoBypassTiming) {
      showToast(
        schedule.cutoffWarning || 'Ordering is currently closed for this meal slot.',
        'error',
        'Order Cutoff Reached'
      );
      return;
    }

    setIsProcessingPayment(true);

    try {
      await initiateRazorpayPayment({
        amountInRupees: grandTotal,
        userName: user.name || 'Campus Student',
        userEmail: user.email || 'student@campus.edu',
        userPhone: user.phone || '9845012345',
        description: `Campus Canteen Pure Veg Order (${items.length} items to ${user.pickupZone || selectedAddress.pickupZone})`,
        onSuccess: (paymentId) => {
          setIsProcessingPayment(false);
          placeOrder(paymentId, {
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            usn: user.usn,
            pickupZone: user.pickupZone || selectedAddress.pickupZone,
          });
          setIsCartOpen(false);

          // Confetti celebration
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch (e) {
            // ignore
          }
          showToast(`Order placed successfully! Razorpay Ref: ${paymentId}`, 'success', 'Payment Verified');
          onOrderSuccess();
        },
        onFailure: (err) => {
          setIsProcessingPayment(false);
          showToast(err?.message || 'Payment was cancelled or failed.', 'error', 'Payment Unsuccessful');
        }
      });
    } catch (err: any) {
      setIsProcessingPayment(false);
      showToast(err?.message || 'Failed to initialize Razorpay checkout.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 pointer-events-auto">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-gray-100 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/50 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight">Campus Canteen Cart</h3>
                <p className="text-[11px] text-emerald-300">
                  {items.length} {items.length === 1 ? 'item' : 'items'} • 100% Pure Veg & Jain
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Free Delivery & Zero COD Policy Banner (Phase 3 & Context) */}
            <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-black text-emerald-900">
                <Building className="w-4 h-4 text-emerald-700" />
                <span>₹0 Delivery Charge • Ground to 9th Floor (A & B Wings)</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-normal">
                Campus Policy: <strong>Pay online via Razorpay ONLY. NO Cash on Delivery (COD).</strong>
              </p>
            </div>

            {/* Schedule Warning if near or past cutoff */}
            {schedule.cutoffWarning && (
              <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Meal Slot Notice: </span>
                  <span>{schedule.cutoffWarning}</span>
                </div>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h4 className="font-extrabold text-gray-900 text-lg">Your cart is empty</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Add fresh breakfast or lunch dishes from our campus canteen menu to get started!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Browse Canteen Menu
                </button>
              </div>
            ) : (
              <>
                {/* 1. Item List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Selected Canteen Dishes
                    </span>
                    <button
                      onClick={clearCart}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Cart
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div key={item.dish.id} className="py-3 flex items-start gap-3">
                        {/* Veg Badge */}
                        <span className="veg-badge mt-1 flex-shrink-0">
                          <span className="veg-badge-dot"></span>
                        </span>

                        {/* Dish Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-sm text-gray-900 leading-snug truncate">
                            {item.dish.name}
                          </h4>
                          <div className="text-xs font-black text-gray-800 mt-0.5">
                            ₹{item.dish.price * item.quantity}
                            <span className="text-[10px] text-gray-400 font-normal ml-1">
                              (₹{item.dish.price} each)
                            </span>
                          </div>

                          {/* Customizations tags */}
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.isJainOption && (
                              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                Pure Jain
                              </span>
                            )}
                            {item.spiceLevel && (
                              <span className="bg-gray-100 text-gray-700 text-[10px] font-medium px-1.5 py-0.5 rounded">
                                {item.spiceLevel}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stepper & Delete */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-gray-100 rounded-xl p-1 font-bold text-xs">
                            <button
                              onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-emerald-600 hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-black text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-emerald-600 hover:text-white transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.dish.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Special Instructions */}
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Floor Pickup & Kitchen Note
                  </label>
                  <input
                    type="text"
                    value={specialInstruction}
                    onChange={(e) => setSpecialInstruction(e.target.value)}
                    placeholder="e.g. Leave with Lab Assistant, extra green chutney, hot sambar"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-600"
                  />
                </div>

                {/* 3. Promo Coupons Section */}
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2 text-xs font-black text-emerald-950">
                    <Tag className="w-4 h-4 text-emerald-700" />
                    <span>Campus Discount Code</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="bg-white rounded-xl p-3 border border-emerald-200 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-emerald-900 tracking-wider">
                            '{appliedCoupon}' APPLIED
                          </div>
                          <div className="text-[10px] text-emerald-700">
                            Saved ₹{discount} with student code
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 bg-white rounded-xl border border-emerald-200 text-xs uppercase font-bold outline-none focus:border-emerald-600"
                        />
                        <button
                          onClick={() => handleApplyCoupon(couponInput)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {COUPONS.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => handleApplyCoupon(c.code)}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors"
                          >
                            🏷️ {c.code} ({c.discountPercent ? `${c.discountPercent}% OFF` : `₹${c.flatDiscount} OFF`})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Bill Details */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
                  <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] pb-1 border-b border-gray-200 flex justify-between">
                    <span>Canteen Subsidized Bill</span>
                    <span className="text-emerald-700 font-extrabold">Student Rate</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Food Total</span>
                    <span className="font-semibold text-gray-900">₹{itemTotal}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Campus Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Campus Floor Delivery Charge</span>
                    <span className="font-bold text-emerald-700">₹0 (FREE)</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Campus Platform Service Fee</span>
                    <span className="font-bold text-emerald-700">₹0</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Canteen GST (5%)</span>
                    <span className="font-semibold text-gray-900">₹{gst}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-black text-gray-900">
                    <span>Total Amount (Razorpay Only)</span>
                    <span className="text-base text-emerald-700">₹{grandTotal}</span>
                  </div>
                </div>

                {/* 5. Pickup Location Preview */}
                <div className="bg-white rounded-2xl p-3.5 border border-gray-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Delivery Pickup Destination:</span>
                  </div>
                  <p className="text-xs text-gray-600 pl-6">
                    {user?.pickupZone || selectedAddress.pickupZone || '4th Floor - Wing A (ECE & Telecom Dept)'}
                  </p>
                  {user?.usn && (
                    <p className="text-[10px] text-gray-400 pl-6">
                      Recipient: {user.name} ({user.role}: {user.usn})
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1 font-bold text-emerald-800">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  Razorpay Payment • NO Cash On Delivery (COD)
                </span>
                <span className="font-black text-gray-900">
                  Total: ₹{grandTotal}
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={isProcessingPayment}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-between transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessingPayment ? (
                  <div className="w-full flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting Razorpay Gateway...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-left">
                      <div className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
                        {user ? 'Pay with Razorpay (NO COD)' : 'Login & Pay Online'}
                      </div>
                      <div className="text-base font-black">₹{grandTotal}</div>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 px-3.5 py-1.5 rounded-xl font-bold text-xs backdrop-blur-sm">
                      <span>Pay Online via Razorpay</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Cashless Campus • Instant Order Dispatch to Floor</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
