import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DeliveryRider, CanteenStaff, Order, PaymentRecord, CanteenSettings } from '../types';
import { 
  INITIAL_ORDERS, 
  INITIAL_RIDERS, 
  INITIAL_STAFF, 
  INITIAL_PAYMENTS, 
  INITIAL_CANTEEN_SETTINGS 
} from '../data/dashboardMockData';

export type DashboardTab = 'overview' | 'orders' | 'payments' | 'tracking' | 'riders' | 'staff' | 'settings';

interface DashboardContextType {
  // Navigation & Modal
  isDashboardOpen: boolean;
  setIsDashboardOpen: (open: boolean) => void;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (id: string | null) => void;

  // Orders
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

  // Payments
  payments: PaymentRecord[];
  refundPayment: (paymentId: string) => void;
  verifyPayment: (paymentId: string) => void;

  // Settings
  canteenSettings: CanteenSettings;
  updateCanteenSettings: (updates: Partial<CanteenSettings>) => void;

  // Sync bridge with customer app
  syncExternalOrder: (order: Order) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>('SB-849201');

  // 1. Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_dashboard_orders');
      if (saved) return JSON.parse(saved);
      // Fallback check past orders
      const userOrders = localStorage.getItem('satvik_past_orders');
      if (userOrders) {
        const parsed = JSON.parse(userOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge user orders with mock orders
          const combined = [...parsed];
          INITIAL_ORDERS.forEach(io => {
            if (!combined.some(o => o.id === io.id)) {
              combined.push(io);
            }
          });
          return combined;
        }
      }
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // 2. Riders State
  const [riders, setRiders] = useState<DeliveryRider[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_dashboard_riders');
      return saved ? JSON.parse(saved) : INITIAL_RIDERS;
    } catch {
      return INITIAL_RIDERS;
    }
  });

  // 3. Staff State
  const [canteenStaff, setCanteenStaff] = useState<CanteenStaff[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_dashboard_staff');
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  // 4. Payments State
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('satvik_dashboard_payments');
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  // 5. Canteen Settings State
  const [canteenSettings, setCanteenSettings] = useState<CanteenSettings>(() => {
    try {
      const saved = localStorage.getItem('satvik_canteen_settings');
      return saved ? JSON.parse(saved) : INITIAL_CANTEEN_SETTINGS;
    } catch {
      return INITIAL_CANTEEN_SETTINGS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('satvik_dashboard_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('satvik_dashboard_riders', JSON.stringify(riders));
  }, [riders]);

  useEffect(() => {
    localStorage.setItem('satvik_dashboard_staff', JSON.stringify(canteenStaff));
  }, [canteenStaff]);

  useEffect(() => {
    localStorage.setItem('satvik_dashboard_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('satvik_canteen_settings', JSON.stringify(canteenSettings));
  }, [canteenSettings]);

  // Synchronize new customer-placed order into dashboard
  const syncExternalOrder = useCallback((newOrder: Order) => {
    setOrders((prev) => {
      const filtered = prev.filter((o) => o.id !== newOrder.id);
      return [newOrder, ...filtered];
    });

    // Also add to payments if paid
    if (newOrder.paymentId) {
      setPayments((prev) => [
        {
          id: 'pay-txn-' + Math.floor(100000 + Math.random() * 900000),
          orderId: newOrder.id,
          customerName: newOrder.deliveryAddress.title || 'Customer',
          customerPhone: newOrder.riderPhone || '',
          amount: newOrder.grandTotal,
          method: 'Razorpay',
          status: newOrder.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
          transactionRef: newOrder.paymentId,
          timestamp: 'Just now'
        },
        ...prev
      ]);
    }
  }, []);

  // Listen to new orders placed on storefront
  useEffect(() => {
    const handleNewOrder = (e: Event) => {
      const customEvent = e as CustomEvent<Order>;
      if (customEvent.detail) {
        syncExternalOrder(customEvent.detail);
      }
    };
    window.addEventListener('satvik_new_order_placed', handleNewOrder);
    return () => window.removeEventListener('satvik_new_order_placed', handleNewOrder);
  }, [syncExternalOrder]);


  // Sync orders back to customer past_orders in localStorage
  const syncOrdersToCustomerApp = (updatedOrders: Order[]) => {
    try {
      localStorage.setItem('satvik_past_orders', JSON.stringify(updatedOrders));
      // Dispatch custom window event so CartContext updates in real-time
      window.dispatchEvent(new Event('satvik_orders_updated'));
    } catch (e) {
      console.error('Error syncing orders to customer app:', e);
    }
  };

  // Order Actions
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          let updatedMinutes = ord.estimatedMinutes;
          if (status === 'DELIVERED') updatedMinutes = 0;
          if (status === 'OUT_FOR_DELIVERY') updatedMinutes = Math.min(updatedMinutes, 15);
          if (status === 'KITCHEN_PREPARING') updatedMinutes = Math.max(updatedMinutes, 25);
          return {
            ...ord,
            status,
            estimatedMinutes: updatedMinutes
          };
        }
        return ord;
      });
      syncOrdersToCustomerApp(updated);
      return updated;
    });

    // If order was delivered, free up assigned rider
    if (status === 'DELIVERED') {
      const targetOrder = orders.find(o => o.id === orderId);
      if (targetOrder?.riderId) {
        setRiders(prevRiders =>
          prevRiders.map(r =>
            r.id === targetOrder.riderId
              ? { ...r, status: 'available', activeOrderId: undefined, totalDeliveries: r.totalDeliveries + 1 }
              : r
          )
        );
      }
    }
  };

  const assignRiderToOrder = (orderId: string, riderId: string) => {
    const selectedRider = riders.find((r) => r.id === riderId);
    if (!selectedRider) return;

    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            riderId: selectedRider.id,
            riderName: selectedRider.name,
            riderPhone: selectedRider.phone,
            status: 'RIDER_ASSIGNED' as const,
          };
        }
        return ord;
      });
      syncOrdersToCustomerApp(updated);
      return updated;
    });

    // Update rider's active assignment
    setRiders((prev) =>
      prev.map((r) =>
        r.id === riderId
          ? { ...r, status: 'on_delivery', activeOrderId: orderId }
          : r
      )
    );
  };

  const cancelOrder = (orderId: string, reason: string) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'CANCELLED' as const,
            cancelReason: reason,
          };
        }
        return ord;
      });
      syncOrdersToCustomerApp(updated);
      return updated;
    });

    // Mark payment as refunded if it was paid
    setPayments((prev) =>
      prev.map((p) =>
        p.orderId === orderId ? { ...p, status: 'REFUNDED' } : p
      )
    );

    // Free up rider if any
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder?.riderId) {
      setRiders(prev =>
        prev.map(r =>
          r.id === targetOrder.riderId
            ? { ...r, status: 'available', activeOrderId: undefined }
            : r
        )
      );
    }
  };

  const addManualOrder = (orderData: Partial<Order>): Order => {
    const newId = 'SB-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      id: newId,
      items: orderData.items || [],
      itemTotal: orderData.itemTotal || 350,
      deliveryFee: orderData.deliveryFee || 0,
      platformFee: 5,
      gst: Math.round((orderData.itemTotal || 350) * 0.05),
      discount: orderData.discount || 0,
      tip: orderData.tip || 20,
      grandTotal: orderData.grandTotal || 375,
      deliveryAddress: orderData.deliveryAddress || {
        id: 'addr-manual-' + Date.now(),
        type: 'Home',
        title: orderData.customerName || 'Walk-in / Phone Order',
        addressLine: 'Desk / Counter Delivery, HAL 2nd Stage',
        landmark: 'Central Bengaluru',
        isDefault: true
      },
      paymentId: 'pay_MANUAL_' + Date.now(),
      paymentStatus: (orderData.paymentStatus as any) || 'PAID',
      paymentMethod: orderData.paymentMethod || 'UPI',
      status: (orderData.status as any) || 'PLACED',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      riderName: orderData.riderName || 'Pending Rider Assignment',
      riderPhone: orderData.riderPhone || '--',
      estimatedMinutes: orderData.estimatedMinutes || 25,
      customerName: orderData.customerName || 'Phone Order Customer',
      customerPhone: orderData.customerPhone || '+91 98450 00000',
      customerEmail: orderData.customerEmail,
      notes: orderData.notes,
      restaurantName: orderData.restaurantName || 'SatvikBite Kitchen Indiranagar'
    };

    setOrders((prev) => {
      const next = [newOrder, ...prev];
      syncOrdersToCustomerApp(next);
      return next;
    });

    // Add to payments
    setPayments((prev) => [
      {
        id: 'pay-txn-' + Math.floor(100000 + Math.random() * 900000),
        orderId: newOrder.id,
        customerName: newOrder.customerName || 'Customer',
        customerPhone: newOrder.customerPhone,
        amount: newOrder.grandTotal,
        method: newOrder.paymentMethod || 'UPI',
        status: newOrder.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
        transactionRef: newOrder.paymentId,
        timestamp: 'Just now'
      },
      ...prev
    ]);

    return newOrder;
  };

  // Delivery Rider Actions
  const addRider = (riderData: Omit<DeliveryRider, 'id'>) => {
    const newRider: DeliveryRider = {
      ...riderData,
      id: 'rider-' + Date.now(),
    };
    setRiders((prev) => [newRider, ...prev]);
  };

  const updateRider = (id: string, updates: Partial<DeliveryRider>) => {
    setRiders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteRider = (id: string) => {
    setRiders((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRiderStatus = (id: string) => {
    setRiders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === 'offline' ? 'available' : 'offline';
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  // Canteen Staff Actions
  const addStaff = (staffData: Omit<CanteenStaff, 'id'>) => {
    const newStaff: CanteenStaff = {
      ...staffData,
      id: 'staff-' + Date.now(),
    };
    setCanteenStaff((prev) => [newStaff, ...prev]);
  };

  const updateStaff = (id: string, updates: Partial<CanteenStaff>) => {
    setCanteenStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
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
      prev.map((s) =>
        s.id === id ? { ...s, dailyTempChecked: !s.dailyTempChecked } : s
      )
    );
  };

  // Payment Actions
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

  // Settings Actions
  const updateCanteenSettings = (updates: Partial<CanteenSettings>) => {
    setCanteenSettings((prev) => ({ ...prev, ...updates }));
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
        canteenSettings,
        updateCanteenSettings,
        syncExternalOrder,
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
