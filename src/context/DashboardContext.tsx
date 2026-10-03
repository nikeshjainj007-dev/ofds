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
import { storage } from '../lib/storage';

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
  isDashboardOpen: boolean;
  setIsDashboardOpen: (open: boolean) => void;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (id: string | null) => void;

  dishes: Dish[];
  addDish: (dish: Omit<Dish, 'id'>) => Dish;
  updateDish: (id: string, updates: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  toggleDishAvailability: (id: string) => void;

  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  assignRiderToOrder: (orderId: string, riderId: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  addManualOrder: (order: Partial<Order>) => Order;

  riders: DeliveryRider[];
  addRider: (rider: Omit<DeliveryRider, 'id'>) => void;
  updateRider: (id: string, updates: Partial<DeliveryRider>) => void;
  deleteRider: (id: string) => void;
  toggleRiderStatus: (id: string) => void;

  canteenStaff: CanteenStaff[];
  addStaff: (staff: Omit<CanteenStaff, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<CanteenStaff>) => void;
  deleteStaff: (id: string) => void;
  toggleStaffDuty: (id: string) => void;
  toggleStaffTempCheck: (id: string) => void;

  payments: PaymentRecord[];
  refundPayment: (paymentId: string) => void;
  verifyPayment: (paymentId: string) => void;

  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'status'>) => Complaint;
  updateComplaintStatus: (id: string, status: Complaint['status'], resolutionNote?: string) => void;

  feedbacks: Feedback[];
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => Feedback;

  canteenSettings: CanteenSettings;
  updateCanteenSettings: (updates: Partial<CanteenSettings>) => void;

  syncExternalOrder: (order: Order) => void;
  resetToCleanState: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // 1. Dishes State
  const [dishes, setDishes] = useState<Dish[]>(() =>
    storage.get('satvik_canteen_dishes', DEFAULT_DISHES)
  );

  useEffect(() => {
    storage.set('satvik_canteen_dishes', dishes);
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
      prev.map((d) => (d.id === id ? { ...d, isAvailable: !d.isAvailable } : d))
    );
  };

  // 2. Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = storage.get<Order[]>('satvik_dashboard_orders', INITIAL_ORDERS);
    const cleaned = saved.filter((o) => !['ORD-782101', 'ORD-782102', 'ORD-782103'].includes(o.id));
    if (cleaned.length !== saved.length) {
      storage.set('satvik_dashboard_orders', cleaned);
      storage.set('satvik_past_orders', cleaned);
    }
    return cleaned;
  });

  useEffect(() => {
    storage.set('satvik_dashboard_orders', orders);
    storage.set('satvik_past_orders', orders);
  }, [orders]);

  // Synchronize orders when updated from CartContext
  useEffect(() => {
    const handleSyncOrders = () => {
      const saved = storage.get<Order[]>('satvik_dashboard_orders', []);
      const cleaned = saved.filter((o) => !['ORD-782101', 'ORD-782102', 'ORD-782103'].includes(o.id));
      setOrders(cleaned);
    };
    window.addEventListener('satvik_orders_updated', handleSyncOrders);
    return () => window.removeEventListener('satvik_orders_updated', handleSyncOrders);
  }, []);

  // 3. Riders State
  const [riders, setRiders] = useState<DeliveryRider[]>(() =>
    storage.get('satvik_dashboard_riders', INITIAL_RIDERS)
  );

  useEffect(() => {
    storage.set('satvik_dashboard_riders', riders);
  }, [riders]);

  // 4. Staff State
  const [canteenStaff, setCanteenStaff] = useState<CanteenStaff[]>(() =>
    storage.get('satvik_dashboard_staff', INITIAL_STAFF)
  );

  useEffect(() => {
    storage.set('satvik_dashboard_staff', canteenStaff);
  }, [canteenStaff]);

  // 5. Payments State
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = storage.get<PaymentRecord[]>('satvik_dashboard_payments', INITIAL_PAYMENTS);
    const cleaned = saved.filter((p) => !['pay_rec_001', 'pay_rec_002', 'pay_rec_003'].includes(p.id));
    if (cleaned.length !== saved.length) {
      storage.set('satvik_dashboard_payments', cleaned);
    }
    return cleaned;
  });

  useEffect(() => {
    storage.set('satvik_dashboard_payments', payments);
  }, [payments]);

  // 6. Complaints State
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = storage.get<Complaint[]>('satvik_dashboard_complaints', INITIAL_COMPLAINTS);
    const cleaned = saved.filter((c) => !['CMP-101'].includes(c.id));
    if (cleaned.length !== saved.length) {
      storage.set('satvik_dashboard_complaints', cleaned);
    }
    return cleaned;
  });

  useEffect(() => {
    storage.set('satvik_dashboard_complaints', complaints);
  }, [complaints]);

  const addComplaint = (data: Omit<Complaint, 'id' | 'createdAt' | 'status'>): Complaint => {
    const newComplaint: Complaint = {
      ...data,
      id: 'CMP-' + Math.floor(1000 + Math.random() * 9000),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setComplaints((prev) => [newComplaint, ...prev]);

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

  // 7. Feedback State
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    const saved = storage.get<Feedback[]>('satvik_dashboard_feedbacks', []);
    const cleaned = saved.filter(
      (f) => f.id !== 'fb-001' && !['ORD-782101', 'ORD-782102', 'ORD-782103'].includes(f.orderId)
    );
    if (cleaned.length !== saved.length) {
      storage.set('satvik_dashboard_feedbacks', cleaned);
    }
    return cleaned;
  });

  useEffect(() => {
    storage.set('satvik_dashboard_feedbacks', feedbacks);
  }, [feedbacks]);

  const addFeedback = (data: Omit<Feedback, 'id' | 'createdAt'>): Feedback => {
    const newFb: Feedback = {
      ...data,
      id: 'fb-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setFeedbacks((prev) => [newFb, ...prev]);

    setOrders((prev) =>
      prev.map((ord) => (ord.id === data.orderId ? { ...ord, feedback: newFb } : ord))
    );

    return newFb;
  };

  // 8. Canteen Settings State
  const [canteenSettings, setCanteenSettings] = useState<CanteenSettings>(() =>
    storage.get('satvik_canteen_settings', INITIAL_CANTEEN_SETTINGS)
  );

  useEffect(() => {
    storage.set('satvik_canteen_settings', canteenSettings);
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

      storage.set('satvik_past_orders', updated);
      storage.set('satvik_dashboard_orders', updated);
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
      customerName: orderData.customerName || '',
      customerPhone: orderData.customerPhone || '',
      customerRole: orderData.customerRole || 'Student',
      customerUsn: orderData.customerUsn || '',
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

  const syncExternalOrder = (order: Order) => {
    setOrders((prev) => {
      if (prev.some((o) => o.id === order.id)) return prev;
      return [order, ...prev];
    });

    setPayments((prev) => {
      if (prev.some((p) => p.orderId === order.id)) return prev;
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

  const addRider = (riderData: Omit<DeliveryRider, 'id'>) => {
    const newRider: DeliveryRider = {
      ...riderData,
      id: 'rider-' + Date.now(),
      rating: 4.9,
      totalDeliveries: 0,
      joinedDate: 'Today',
      isPureVegInsulatedBagVerified: true,
    };
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
      prev.map((r) => (r.id === id ? { ...r, status: r.status === 'available' ? 'offline' : 'available' } : r))
    );
  };

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
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'on_duty' ? 'off_duty' : 'on_duty' } : s))
    );
  };

  const toggleStaffTempCheck = (id: string) => {
    setCanteenStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, dailyTempChecked: !s.dailyTempChecked } : s))
    );
  };

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

  const resetToCleanState = () => {
    [
      'satvik_canteen_dishes',
      'satvik_dashboard_orders',
      'satvik_dashboard_riders',
      'satvik_dashboard_staff',
      'satvik_dashboard_payments',
      'satvik_dashboard_complaints',
      'satvik_dashboard_feedbacks',
      'satvik_canteen_settings',
      'satvik_past_orders',
      'satvik_cart_items',
    ].forEach((k) => storage.remove(k));

    setDishes(DEFAULT_DISHES);
    setOrders(INITIAL_ORDERS);
    setRiders(INITIAL_RIDERS);
    setCanteenStaff(INITIAL_STAFF);
    setPayments(INITIAL_PAYMENTS);
    setComplaints(INITIAL_COMPLAINTS);
    setCanteenSettings(INITIAL_CANTEEN_SETTINGS);

    setFeedbacks([]);
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
