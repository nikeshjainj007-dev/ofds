import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Dish, Address, Order } from '../types';
import { COUPONS } from '../data/mockData';

interface CartContextType {
  items: CartItem[];
  addItem: (dish: Dish, options?: { isJain?: boolean; spiceLevel?: 'Mild' | 'Medium' | 'Spicy'; specialNote?: string }) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  itemTotal: number;
  discount: number;
  deliveryFee: number;
  platformFee: number;
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
  placeOrder: (paymentId: string) => Order;
}

const DEFAULT_ADDRESS: Address = {
  id: 'addr-1',
  type: 'Home',
  title: 'Home (Primary)',
  addressLine: 'Flat 402, Shanti Nilayam, 12th Main, HAL 2nd Stage, Indiranagar',
  landmark: 'Near BDA Complex, Bengaluru 560038',
  isDefault: true,
};

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

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('VEG50');
  const [tip, setTip] = useState<number>(30);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [addresses] = useState<Address[]>([
    DEFAULT_ADDRESS,
    {
      id: 'addr-2',
      type: 'Work',
      title: 'Office',
      addressLine: 'Tower B, 5th Floor, Embassy GolfLinks Tech Park',
      landmark: 'Domlur, Bengaluru 560071',
    }
  ]);
  const [selectedAddress, setSelectedAddress] = useState<Address>(DEFAULT_ADDRESS);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [pastOrders, setPastOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_past_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('satvik_cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('satvik_past_orders', JSON.stringify(pastOrders));
  }, [pastOrders]);

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
          isJainOption: options?.isJain ?? false,
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
  let isFreeDeliveryCoupon = false;

  if (appliedCoupon && itemTotal > 0) {
    const couponObj = COUPONS.find((c) => c.code === appliedCoupon);
    if (couponObj) {
      if (itemTotal >= (couponObj.minOrder || 0)) {
        if (couponObj.discountPercent) {
          const calc = (itemTotal * couponObj.discountPercent) / 100;
          discount = couponObj.maxDiscount ? Math.min(calc, couponObj.maxDiscount) : calc;
        } else if (couponObj.flatDiscount) {
          discount = couponObj.flatDiscount;
        } else if (couponObj.freeDelivery) {
          isFreeDeliveryCoupon = true;
        }
      }
    }
  }

  // Delivery Fee
  const deliveryFee = itemTotal === 0 ? 0 : (isFreeDeliveryCoupon || itemTotal >= 399 ? 0 : 35);
  const platformFee = itemTotal === 0 ? 0 : 5;
  const gst = itemTotal === 0 ? 0 : Math.round(itemTotal * 0.05); // 5% GST
  const grandTotal = Math.max(0, itemTotal - discount + deliveryFee + platformFee + gst + tip);

  const applyCoupon = (code: string) => {
    const upper = code.trim().toUpperCase();
    const coupon = COUPONS.find((c) => c.code === upper);
    if (!coupon) {
      return { success: false, message: 'Invalid promo coupon code.' };
    }
    if (itemTotal < coupon.minOrder) {
      return { success: false, message: `Minimum order value for ${upper} is ₹${coupon.minOrder}` };
    }
    setAppliedCoupon(upper);
    return { success: true, message: `Promo code ${upper} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const placeOrder = (paymentId: string): Order => {
    const newOrder: Order = {
      id: 'SB-' + Math.floor(100000 + Math.random() * 900000),
      items: [...items],
      itemTotal,
      deliveryFee,
      platformFee,
      gst,
      discount,
      tip,
      grandTotal,
      deliveryAddress: selectedAddress,
      paymentId,
      paymentStatus: 'PAID',
      status: 'PLACED',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      riderName: 'Ramesh Kumar (Vaccinated & Veg Care)',
      riderPhone: '+91 98450 12345',
      estimatedMinutes: 24,
    };

    setActiveOrder(newOrder);
    setPastOrders((prev) => [newOrder, ...prev]);
    clearCart();
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
