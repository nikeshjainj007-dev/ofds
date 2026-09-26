export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  votesCount: number;
  image: string;
  category: string;
  restaurantId: string;
  restaurantName: string;
  isBestseller?: boolean;
  isJainFriendly?: boolean;
  prepTimeMinutes: number;
  calories?: number;
  tags?: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  ratingCount: string;
  deliveryTimeMinutes: number;
  distanceKm: number;
  costForTwo: number;
  image: string;
  isPureVeg: true; // 100% pure veg guarantee
  pureJainAvailable: boolean;
  offers: string[];
  featured?: boolean;
  address: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  isJainOption?: boolean;
  spiceLevel?: 'Mild' | 'Medium' | 'Spicy';
  specialNote?: string;
}

export interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  title: string;
  addressLine: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  itemTotal: number;
  deliveryFee: number;
  platformFee: number;
  gst: number;
  discount: number;
  tip: number;
  grandTotal: number;
  deliveryAddress: Address;
  paymentId: string;
  paymentStatus: 'PAID' | 'FAILED' | 'PENDING' | 'REFUNDED';
  status: 'PLACED' | 'KITCHEN_PREPARING' | 'RIDER_ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  riderName: string;
  riderPhone: string;
  riderId?: string;
  estimatedMinutes: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod?: 'Razorpay' | 'UPI' | 'Credit/Debit Card' | 'Netbanking' | 'Cash on Delivery';
  notes?: string;
  restaurantName?: string;
  cancelReason?: string;
}

export interface DeliveryRider {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'available' | 'on_delivery' | 'offline';
  vehicleType: 'EV Scooter' | 'Motorcycle' | 'Bicycle' | 'Electric Cargo';
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
  activeOrderId?: string;
  currentZone: string;
  avatar: string;
  joinedDate: string;
  batteryLevel?: number;
  isPureVegInsulatedBagVerified: boolean;
  emergencyContact: string;
}

export interface CanteenStaff {
  id: string;
  name: string;
  role: 'Head Chef' | 'Sous Chef' | 'Kitchen Manager' | 'Hygiene Inspector' | 'Packing Specialist' | 'Billing Desk';
  phone: string;
  email: string;
  shift: 'Morning (06:00 AM - 02:00 PM)' | 'Evening (02:00 PM - 10:00 PM)' | 'Full Day (09:00 AM - 09:00 PM)';
  station: 'Main Kadai & Tandoor' | 'Thali & Curry Prep' | 'South Indian Dosai' | 'Mithai & Chaat Counter' | 'Hygiene & Quality Control' | 'Dispatch & Packaging';
  status: 'on_duty' | 'off_duty' | 'on_leave';
  joinedDate: string;
  avatar: string;
  hygieneCertified: boolean;
  medicalFitnessValidUntil: string;
  pureVegTrained: boolean;
  emergencyContact: string;
  dailyTempChecked: boolean;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  method: 'Razorpay' | 'UPI' | 'Credit/Debit Card' | 'Netbanking' | 'Cash on Delivery';
  status: 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';
  transactionRef: string;
  timestamp: string;
}

export interface CanteenSettings {
  isKitchenOpen: boolean;
  autoAcceptOrders: boolean;
  defaultPrepMinutes: number;
  deliveryRadiusKm: number;
  fssaiLicenseNumber: string;
  pureVegAuditPassed: boolean;
  contactSupportPhone: string;
}

