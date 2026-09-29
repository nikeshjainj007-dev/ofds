import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  DeliveryRider, 
  CanteenStaff, 
  Order, 
  PaymentRecord, 
  CanteenSettings, 
  Dish, 
  Complaint, 
  Feedback 
} from '../types';
import { 
  INITIAL_ORDERS, 
  INITIAL_RIDERS, 
  INITIAL_STAFF, 
  INITIAL_PAYMENTS, 
  INITIAL_CANTEEN_SETTINGS,
  INITIAL_COMPLAINTS 
} from '../data/dashboardMockData';
import { DISHES as DEFAULT_DISHES } from '../data/mockData';

export type DashboardTab = 
  | 'overview' 
  | 'orders' 
  | 'foods' 
  | 'payments' 
  | 'tracking' 
  | 'riders' 
  | 'staff' 
  | 'complaints' 
  | 'feedback' 
  | 'settings';

interface DashboardContextType {
  // Navigation & Modal
  isDashboardOpen: boolean;
  setIsDashboardOpen: (open: boolean) => void;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (id: string | null) => void;

  // Dishes / Food Menu Management (Phase 6)
  dishes: Dish[];
  addDish: (dish: Omit<Dish, 'id'>) => Dish;
  updateDish: (id: string, updates: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  toggleDishAvailability: (id: string) => void;

  // Orders (Phase 5)
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  assignRiderToOrder: (orderId: string, riderId: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  addManualOrder: (order: Partial<Order>) => Order;

  // Delivery Riders
  riders: DeliveryRider[];
  addRider: (rider: Omit<DeliveryRider, 'id'>) => void;
  updateRider: (id: string, updates: Partial<DeliveryRider>) => void;
  deleteRider: (id: string) => void;
  toggleRiderStatus: (id: string) => void;

  // Canteen Staff
  canteenStaff: CanteenStaff[];
  addStaff: (staff: Omit<CanteenStaff, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<CanteenStaff>) => void;
  deleteStaff: (id: string) => void;
  toggleStaffDuty: (id: string) => void;
  toggleStaffTempCheck: (id: string) => void;

  // Payments (Razorpay Only)
  payments: PaymentRecord[];
  refundPayment: (paymentId: string) => void;
  verifyPayment: (paymentId: string) => void;

  // Complaints (Phase 8)
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'status'>) => Complaint;
  updateComplaintStatus: (id: string, status: Complaint['status'], resolutionNote?: string) => void;

  // Feedback (Phase 9)
  feedbacks: Feedback[];
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => Feedback;

  // Canteen Settings
  canteenSettings: CanteenSettings;
  updateCanteenSettings: (updates: Partial<CanteenSettings>) => void;

  // Sync bridge with customer storefront
  syncExternalOrder: (order: Order) => void;
  resetToCleanState: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>('ORD-782101');

  // 1. Dishes State (Phase 6: Update price, Add food, Photo of food)
  const [dishes, setDishes] = useState<Dish[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_canteen_dishes');
      return saved ? JSON.parse(saved) : DEFAULT_DISHES;
    } catch {
      return DEFAULT_DISHES;
    }
  });

  useEffect(() => {
    localStorage.setItem('satvik_canteen_dishes', JSON.stringify(dishes));
    window.dispatchEvent(new CustomEvent('satvik_dishes_updated', { detail: dishes }));
  }, [dishes]);

  const addDish = (newDishData: Omit<Dish, 'id'>): Dish => {
    const newDish: Dish = {
      ...newDishData,
      id: 'dish-custom-' + Date.now(),
      rating: 5.0,
      votesCount: 1,
      isAvailable: true,
    };
    setDishes((prev) => [newDish, ...prev]);
    return newDish;
  };

  const updateDish = (id: string, updates: Partial<Dish>) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const deleteDish = (id: string) => {
    setDishes((prev) => prev.filter((d) => d.id !== id));
  };

  const toggleDishAvailability = (id: string) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isAvailable: d.isAvailable === false ? true : false } : d))
    );
  };

  // 2. Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_dashboard_orders');
      if (saved) return JSON.parse(saved);
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  useEffect(() => {
    localStorage.setItem('satvik_dashboard_orders', JSON.stringify(orders));
  }, [orders]);

  // 3. Riders State
  const [riders, setRiders] = useState<DeliveryRider[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_dashboard_riders');
      return saved ? JSON.parse(saved) : INITIAL_RIDERS;
    } catch {
      return INITIAL_RIDERS;
    }
  });

  useEffect(() => {
    localStorage.setItem('satvik_dashboard_riders', JSON.stringify(riders));
  }, [riders]);

  // 4. Staff State
  const [canteenStaff, setCanteenStaff] = useState<CanteenStaff[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_dashboard_staff');
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  useEffect(() => {
    localStorage.setItem('satvik_dashboard_staff', JSON.stringify(canteenStaff));
  }, [canteenStaff]);

  // 5. Payments State (Razorpay Only)
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_dashboard_payments');
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('satvik_dashboard_payments', JSON.stringify(payments));
  }, [payments]);

  // 6. Complaints State (Phase 8)
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_dashboard_complaints');
      return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
    } catch {
      return INITIAL_COMPLAINTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('satvik_dashboard_complaints', JSON.stringify(complaints));
  }, [complaints]);

  const addComplaint = (data: Omit<Complaint, 'id' | 'createdAt' | 'status'>): Complaint => {
    const newComplaint: Complaint = {
      ...data,
      id: 'CMP-' + Math.floor(1000 + Math.random() * 9000),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setComplaints((prev) => [newComplaint, ...prev]);

    // Also link to order if exists
    setOrders((prev) =>
      prev.map((ord) => (ord.id === data.orderId ? { ...ord, complaint: newComplaint } : ord))
    );

    return newComplaint;
  };

  const updateComplaintStatus = (id: string, status: Complaint['status'], resolutionNote?: string) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status, resolutionNote: resolutionNote ?? c.resolutionNote } : c
      )
    );
  };

  // 7. Feedback State (Phase 9)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    const initialFbs: Feedback[] = [];
    INITIAL_ORDERS.forEach((o) => {
      if (o.feedback) initialFbs.push(o.feedback);
    });
    try {
      const saved = localStorage.getItem('satvik_dashboard_feedbacks');
      return saved ? JSON.parse(saved) : initialFbs;
    } catch {
      return initialFbs;
    }
  });

  useEffect(() => {
    localStorage.setItem('satvik_dashboard_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  const addFeedback = (data: Omit<Feedback, 'id' | 'createdAt'>): Feedback => {
    const newFb: Feedback = {
      ...data,
      id: 'fb-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setFeedbacks((prev) => [newFb, ...prev]);

    // Attach to order
    setOrders((prev) =>
      prev.map((ord) => (ord.id === data.orderId ? { ...ord, feedback: newFb } : ord))
    );

    return newFb;
  };

  // 8. Canteen Settings State
  const [canteenSettings, setCanteenSettings] = useState<CanteenSettings>(() => {
    try {
      const saved = localStorage.getItem('satvik_canteen_settings');
      return saved ? JSON.parse(saved) : INITIAL_CANTEEN_SETTINGS;
    } catch {
      return INITIAL_CANTEEN_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('satvik_canteen_settings', JSON.stringify(canteenSettings));
  }, [canteenSettings]);

  const updateCanteenSettings = (updates: Partial<CanteenSettings>) => {
    setCanteenSettings((prev) => ({ ...prev, ...updates }));
  };

  // Order Operations
  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          const estimatedMinutes =
            status === 'DELIVERED'
              ? 0
              : status === 'OUT_FOR_DELIVERY'
              ? 5
              : status === 'KITCHEN_PREPARING'
              ? 12
              : ord.estimatedMinutes;
          return { ...ord, status, estimatedMinutes };
        }
        return ord;
      });

      // Notify customer storefront
      localStorage.setItem('satvik_past_orders', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('satvik_orders_updated'));
      return updated;
    });
  }, []);

  const assignRiderToOrder = (orderId: string, riderId: string) => {
    const rider = riders.find((r) => r.id === riderId);
    if (!rider) return;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            riderId: rider.id,
            riderName: rider.name,
            riderPhone: rider.phone,
            status: ord.status === 'PLACED' ? 'RIDER_ASSIGNED' : ord.status,
          };
        }
        return ord;
      })
    );

    setRiders((prev) =>
      prev.map((r) => (r.id === riderId ? { ...r, status: 'on_delivery', activeOrderId: orderId } : r))
    );
  };

  const cancelOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: 'CANCELLED', cancelReason: reason, paymentStatus: 'REFUNDED' }
          : ord
      )
    );

    setPayments((prev) =>
      prev.map((p) => (p.orderId === orderId ? { ...p, status: 'REFUNDED' } : p))
    );
  };

  const addManualOrder = (orderData: Partial<Order>): Order => {
    const newOrder: Order = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      items: orderData.items || [],
      itemTotal: orderData.itemTotal || 60,
      deliveryFee: 0,
      platformFee: 0,
      gst: 3,
      discount: 0,
      tip: 0,
      grandTotal: orderData.grandTotal || 63,
      deliveryAddress: orderData.deliveryAddress || {
        id: 'addr-temp',
        type: 'Classroom',
        title: 'Classroom Desk',
        pickupZone: orderData.pickupZone || '4th Floor - Wing A (ECE & Telecom Dept)',
        addressLine: '4th Floor Wing A',
        isDefault: true,
      },
      pickupZone: orderData.pickupZone || '4th Floor - Wing A (ECE & Telecom Dept)',
      paymentId: 'pay_manual_' + Date.now(),
      paymentStatus: 'PAID',
      status: 'PLACED',
      createdAt: new Date().toISOString(),
      riderName: 'Karthik Gowda (Wing A Floor Runner)',
      riderPhone: '+91 98450 12345',
      estimatedMinutes: 15,
      customerName: orderData.customerName || 'Walk-in Student',
      customerPhone: orderData.customerPhone || '+91 98000 00000',
      customerRole: orderData.customerRole || 'Student',
      customerUsn: orderData.customerUsn || '1RV23CS001',
      paymentMethod: 'Razorpay',
      restaurantName: orderData.restaurantName || 'Campus Canteen Main Counter',
    };

    setOrders((prev) => [newOrder, ...prev]);

    setPayments((prev) => [
      {
        id: 'pay_rec_' + Date.now(),
        orderId: newOrder.id,
        customerName: newOrder.customerName || 'Campus Customer',
        customerUsn: newOrder.customerUsn,
        customerPhone: newOrder.customerPhone,
        amount: newOrder.grandTotal,
        method: 'Razorpay',
        status: 'PAID',
        transactionRef: newOrder.paymentId,
        timestamp: new Date().toLocaleString('en-IN'),
      },
      ...prev,
    ]);

    return newOrder;
  };

  // Sync external order from customer app
  const syncExternalOrder = (order: Order) => {
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === order.id);
      if (exists) return prev;
      return [order, ...prev];
    });

    setPayments((prev) => {
      const exists = prev.some((p) => p.orderId === order.id);
      if (exists) return prev;
      return [
        {
          id: 'pay_rec_' + Date.now(),
          orderId: order.id,
          customerName: order.customerName || 'Campus Customer',
          customerUsn: order.customerUsn,
          customerPhone: order.customerPhone,
          amount: order.grandTotal,
          method: 'Razorpay',
          status: 'PAID',
          transactionRef: order.paymentId,
          timestamp: new Date().toLocaleString('en-IN'),
        },
        ...prev,
      ];
    });
  };

  // Rider Management
  const addRider = (riderData: Omit<DeliveryRider, 'id'>) => {
    const newRider: DeliveryRider = { ...riderData, id: 'rider-' + Date.now() };
    setRiders((prev) => [...prev, newRider]);
  };

  const updateRider = (id: string, updates: Partial<DeliveryRider>) => {
    setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRider = (id: string) => {
    setRiders((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRiderStatus = (id: string) => {
    setRiders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === 'available' ? 'offline' : 'available';
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  // Staff Management
  const addStaff = (staffData: Omit<CanteenStaff, 'id'>) => {
    const newStaff: CanteenStaff = { ...staffData, id: 'staff-' + Date.now() };
    setCanteenStaff((prev) => [...prev, newStaff]);
  };

  const updateStaff = (id: string, updates: Partial<CanteenStaff>) => {
    setCanteenStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStaff = (id: string) => {
    setCanteenStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleStaffDuty = (id: string) => {
    setCanteenStaff((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'on_duty' ? 'off_duty' : 'on_duty';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const toggleStaffTempCheck = (id: string) => {
    setCanteenStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, dailyTempChecked: !s.dailyTempChecked } : s))
    );
  };

  // Payments Management
  const refundPayment = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'REFUNDED' } : p))
    );
  };

  const verifyPayment = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'PAID' } : p))
    );
  };

  // Reset to Clean Campus State
  const resetToCleanState = () => {
    localStorage.removeItem('satvik_canteen_dishes');
    localStorage.removeItem('satvik_dashboard_orders');
    localStorage.removeItem('satvik_dashboard_riders');
    localStorage.removeItem('satvik_dashboard_staff');
    localStorage.removeItem('satvik_dashboard_payments');
    localStorage.removeItem('satvik_dashboard_complaints');
    localStorage.removeItem('satvik_dashboard_feedbacks');
    localStorage.removeItem('satvik_canteen_settings');
    localStorage.removeItem('satvik_past_orders');
    localStorage.removeItem('satvik_cart_items');

    setDishes(DEFAULT_DISHES);
    setOrders(INITIAL_ORDERS);
    setRiders(INITIAL_RIDERS);
    setCanteenStaff(INITIAL_STAFF);
    setPayments(INITIAL_PAYMENTS);
    setComplaints(INITIAL_COMPLAINTS);
    setCanteenSettings(INITIAL_CANTEEN_SETTINGS);

    const fbs: Feedback[] = [];
    INITIAL_ORDERS.forEach((o) => {
      if (o.feedback) fbs.push(o.feedback);
    });
    setFeedbacks(fbs);
  };

  return (
    <DashboardContext.Provider
      value={{
        isDashboardOpen,
        setIsDashboardOpen,
        activeTab,
        setActiveTab,
        activeTrackingOrderId,
        setActiveTrackingOrderId,

        dishes,
        addDish,
        updateDish,
        deleteDish,
        toggleDishAvailability,

        orders,
        updateOrderStatus,
        assignRiderToOrder,
        cancelOrder,
        addManualOrder,

        riders,
        addRider,
        updateRider,
        deleteRider,
        toggleRiderStatus,

        canteenStaff,
        addStaff,
        updateStaff,
        deleteStaff,
        toggleStaffDuty,
        toggleStaffTempCheck,

        payments,
        refundPayment,
        verifyPayment,

        complaints,
        addComplaint,
        updateComplaintStatus,

        feedbacks,
        addFeedback,

        canteenSettings,
        updateCanteenSettings,

        syncExternalOrder,
        resetToCleanState,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
