import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Dish, Address, Order } from '../types';
import { COUPONS, DEFAULT_CAMPUS_ADDRESS } from '../data/mockData';
import { INITIAL_ORDERS } from '../data/dashboardMockData';

interface CartContextType {
  items: CartItem[];
  addItem: (dish: Dish, options?: { isJain?: boolean; spiceLevel?: 'Mild' | 'Medium' | 'Spicy'; specialNote?: string }) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  itemTotal: number;
  discount: number;
  deliveryFee: number; // Always ₹0 on campus
  platformFee: number; // ₹0
  gst: number;
  tip: number;
  setTip: (tip: number) => void;
  grandTotal: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedAddress: Address;
  setSelectedAddress: (addr: Address) => void;
  addresses: Address[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  pastOrders: Order[];
  placeOrder: (paymentId: string, userMeta?: { name?: string; phone?: string; email?: string; role?: 'Student' | 'Teacher'; usn?: string; pickupZone?: string }) => Order;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('CAMPUSFREE');
  const [tip, setTip] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [addresses] = useState<Address[]>([
    DEFAULT_CAMPUS_ADDRESS,
    {
      id: 'campus-desk-2',
      type: 'Lab',
      title: 'Computer Lab 2 (Wing B)',
      pickupZone: '1st Floor - Wing B (Computer Labs 1 & 2)',
      addressLine: '1st Floor Wing B, Room 108',
      landmark: 'Next to Server Room',
    },
    {
      id: 'campus-desk-3',
      type: 'Faculty Room',
      title: 'Faculty Lounge Wing B',
      pickupZone: '5th Floor - Wing B (Faculty Lounge)',
      addressLine: '5th Floor Wing B, Cabin 502',
      landmark: 'Opposite Library Extension',
    }
  ]);
  const [selectedAddress, setSelectedAddress] = useState<Address>(DEFAULT_CAMPUS_ADDRESS);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [pastOrders, setPastOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_past_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  useEffect(() => {
    localStorage.setItem('satvik_cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('satvik_past_orders', JSON.stringify(pastOrders));
  }, [pastOrders]);

  // Synchronize orders when changed by Dashboard
  useEffect(() => {
    const handleOrdersUpdated = () => {
      try {
        const saved = localStorage.getItem('satvik_past_orders');
        if (saved) {
          const parsed: Order[] = JSON.parse(saved);
          setPastOrders(parsed);
          setActiveOrder((prev) => {
            if (!prev) return parsed[0] || null;
            const found = parsed.find((o) => o.id === prev.id);
            return found || prev;
          });
        }
      } catch (e) {
        console.error('Failed to sync past orders', e);
      }
    };

    window.addEventListener('satvik_orders_updated', handleOrdersUpdated);
    return () => window.removeEventListener('satvik_orders_updated', handleOrdersUpdated);
  }, []);

  const addItem = (dish: Dish, options?: { isJain?: boolean; spiceLevel?: 'Mild' | 'Medium' | 'Spicy'; specialNote?: string }) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.dish.id === dish.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        if (options?.isJain !== undefined) next[existingIndex].isJainOption = options.isJain;
        if (options?.spiceLevel) next[existingIndex].spiceLevel = options.spiceLevel;
        return next;
      }
      return [
        ...prev,
        {
          dish,
          quantity: 1,
          isJainOption: options?.isJain ?? dish.isJainFriendly ?? false,
          spiceLevel: options?.spiceLevel ?? 'Medium',
          specialNote: options?.specialNote,
        },
      ];
    });
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.dish.id === dishId ? { ...item, quantity } : item))
    );
  };

  const removeItem = (dishId: string) => {
    setItems((prev) => prev.filter((item) => item.dish.id !== dishId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const totalCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const itemTotal = items.reduce((acc, curr) => acc + curr.dish.price * curr.quantity, 0);

  // Calculate Discount
  let discount = 0;
  if (appliedCoupon && itemTotal > 0) {
    const couponObj = COUPONS.find((c) => c.code === appliedCoupon);
    if (couponObj) {
      if (itemTotal >= (couponObj.minOrder || 0)) {
        if (couponObj.discountPercent) {
          const calc = Math.round((itemTotal * couponObj.discountPercent) / 100);
          discount = couponObj.maxDiscount ? Math.min(calc, couponObj.maxDiscount) : calc;
        } else if (couponObj.flatDiscount) {
          discount = couponObj.flatDiscount;
        }
      }
    }
  }

  // Delivery Fee is strictly ₹0 (Campus Policy: No Delivery Charges)
  const deliveryFee = 0;
  const platformFee = 0;
  const gst = itemTotal === 0 ? 0 : Math.round(itemTotal * 0.05); // 5% GST
  const grandTotal = Math.max(0, itemTotal - discount + deliveryFee + platformFee + gst + tip);

  const applyCoupon = (code: string) => {
    const upper = code.trim().toUpperCase();
    const coupon = COUPONS.find((c) => c.code === upper);
    if (!coupon) {
      return { success: false, message: 'Invalid campus promo code.' };
    }
    if (itemTotal < coupon.minOrder) {
      return { success: false, message: `Minimum order value for ${upper} is ₹${coupon.minOrder}` };
    }
    setAppliedCoupon(upper);
    return { success: true, message: `Campus code ${upper} applied!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const placeOrder = (
    paymentId: string,
    userMeta?: { name?: string; phone?: string; email?: string; role?: 'Student' | 'Teacher'; usn?: string; pickupZone?: string }
  ): Order => {
    const targetPickupZone = userMeta?.pickupZone || selectedAddress.pickupZone || '4th Floor - Wing A (ECE & Telecom Dept)';
    const assignedRunner = targetPickupZone.includes('Wing B')
      ? 'Rohan Deshmukh (Wing B Floor Runner)'
      : 'Karthik Gowda (Wing A Floor Runner)';

    const newOrder: Order = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      items: [...items],
      itemTotal,
      deliveryFee: 0, // ₹0 No Delivery Charges
      platformFee: 0,
      gst,
      discount,
      tip,
      grandTotal,
      deliveryAddress: {
        ...selectedAddress,
        pickupZone: targetPickupZone,
      },
      pickupZone: targetPickupZone,
      paymentId,
      paymentStatus: 'PAID',
      paymentMethod: 'Razorpay',
      status: 'PLACED',
      createdAt: new Date().toISOString(),
      riderName: assignedRunner,
      riderPhone: '+91 98450 12345',
      estimatedMinutes: 15,
      customerName: userMeta?.name || 'Campus Student',
      customerPhone: userMeta?.phone || '+91 98450 00000',
      customerEmail: userMeta?.email || 'student@campus.edu',
      customerRole: userMeta?.role || 'Student',
      customerUsn: userMeta?.usn || '1RV23CS001',
      orderSlot: new Date().getHours() < 12 ? 'Breakfast' : 'Lunch',
      restaurantName: items[0]?.dish.restaurantName || 'Campus Canteen Main Counter',
    };

    setPastOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();

    // Notify Dashboard
    try {
      const existingDashOrders = localStorage.getItem('satvik_dashboard_orders');
      const parsedOrders: Order[] = existingDashOrders ? JSON.parse(existingDashOrders) : [];
      const updatedDash = [newOrder, ...parsedOrders];
      localStorage.setItem('satvik_dashboard_orders', JSON.stringify(updatedDash));
      window.dispatchEvent(new CustomEvent('satvik_orders_updated'));
    } catch (e) {
      console.error('Failed to notify dashboard of new order', e);
    }

    return newOrder;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
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
        setSelectedAddress,
        addresses,
        activeOrder,
        setActiveOrder,
        pastOrders,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
