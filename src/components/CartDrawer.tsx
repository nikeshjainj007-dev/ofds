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
  Heart,
  Sparkles,
  MapPin,
  Loader2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { initiateRazorpayPayment } from '../lib/razorpay';
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
    deliveryFee, 
    platformFee, 
    gst, 
    tip, 
    setTip, 
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

  const [couponInput, setCouponInput] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [specialInstruction, setSpecialInstruction] = useState('');

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

    // Require Auth before payment
    if (!user) {
      showToast('Please log in with OTP to complete your order', 'info', 'Authentication Required');
      openAuthModal();
      return;
    }

    setIsProcessingPayment(true);

    try {
      await initiateRazorpayPayment({
        amountInRupees: grandTotal,
        userName: user.user_metadata?.name || 'Satvik Customer',
        userEmail: user.email || 'customer@satvikbite.com',
        userPhone: user.phone || '9876543210',
        description: `SatvikBite Pure Veg Order (${items.length} items)`,
        onSuccess: (paymentId) => {
          setIsProcessingPayment(false);
          placeOrder(paymentId);
          setIsCartOpen(false);
          // Trigger celebration confetti
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch (e) {
            // ignore
          }
          showToast(`Order placed successfully! Payment ID: ${paymentId}`, 'success', 'Payment Received');
          onOrderSuccess();
        },
        onFailure: (err) => {
          setIsProcessingPayment(false);
          showToast(err?.message || 'Payment was cancelled or could not be completed.', 'error', 'Payment Unsuccessful');
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
                <h3 className="font-extrabold text-base leading-tight">My Veg Platter</h3>
                <p className="text-[11px] text-emerald-300">
                  {items.length} {items.length === 1 ? 'item' : 'items'} • 100% Pure Veg
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
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h4 className="font-extrabold text-gray-900 text-lg">Your cart is empty</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Good food is always cooking! Add delicious pure veg dishes from our menu to begin.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Explore Pure Veg Menu
                </button>
              </div>
            ) : (
              <>
                {/* 1. Item List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Selected Items
                    </span>
                    <button
                      onClick={clearCart}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1"
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
                                Jain Preparation
                              </span>
                            )}
                            {item.spiceLevel && (
                              <span className="bg-gray-100 text-gray-700 text-[10px] font-medium px-1.5 py-0.5 rounded">
                                {item.spiceLevel} spice
                              </span>
                            )}
                            {item.specialNote && (
                              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-medium px-1.5 py-0.5 rounded italic">
                                "{item.specialNote}"
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

                {/* 2. Special Instructions for Restaurant */}
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Cooking / Delivery Instructions
                  </label>
                  <input
                    type="text"
                    value={specialInstruction}
                    onChange={(e) => setSpecialInstruction(e.target.value)}
                    placeholder="e.g. Ring doorbell, keep cutlery separate, extra napkins"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-600"
                  />
                </div>

                {/* 3. Promo Coupons Section */}
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2 text-xs font-black text-emerald-950">
                    <Tag className="w-4 h-4 text-emerald-700" />
                    <span>Apply Promo Coupon</span>
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
                            Saved ₹{discount} with this coupon
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700"
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
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Apply
                        </button>
                      </div>

                      {/* Quick Available Coupon Chips */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {COUPONS.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => handleApplyCoupon(c.code)}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors"
                          >
                            🏷️ {c.code} ({c.title})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Tip Delivery Partner */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      Tip your Pure Veg Rider
                    </span>
                    <span className="text-[11px] text-gray-500">100% goes to rider</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 20, 30, 50].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setTip(amount)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          tip === amount
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {amount === 0 ? 'No tip' : `₹${amount}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Bill Details */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
                  <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] pb-1 border-b border-gray-200">
                    Bill Details
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Item Total</span>
                    <span className="font-semibold text-gray-900">₹{itemTotal}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Coupon Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Partner Fee</span>
                    <span>{deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Platform Fee</span>
                    <span className="font-semibold text-gray-900">₹{platformFee}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Govt Taxes & Restaurant GST (5%)</span>
                    <span className="font-semibold text-gray-900">₹{gst}</span>
                  </div>

                  {tip > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Rider Tip</span>
                      <span className="font-semibold text-gray-900">₹{tip}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-black text-gray-900">
                    <span>To Pay</span>
                    <span className="text-base text-emerald-700">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Delivery Address Preview */}
                <div className="bg-white rounded-2xl p-3 border border-gray-200 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-gray-900">{selectedAddress.title}: </span>
                    <span className="text-gray-600">{selectedAddress.addressLine}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  Razorpay Secure Test Gateway
                </span>
                <span className="font-bold text-gray-900">
                  Total: ₹{grandTotal}
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={isProcessingPayment}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-between transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? (
                  <div className="w-full flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting Razorpay...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-left">
                      <div className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
                        {user ? 'Proceed to Payment' : 'Login & Pay'}
                      </div>
                      <div className="text-base font-black">₹{grandTotal}</div>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-xl font-bold text-xs backdrop-blur-sm">
                      <span>Pay with Razorpay</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted 256-bit payment • Instant Pure Veg Confirmation</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
