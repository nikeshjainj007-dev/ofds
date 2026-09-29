export const CAMPUS_PICKUP_ZONES = [
  'Ground Floor - Wing A (Reception / Main Foyer)',
  'Ground Floor - Wing B (Sports Arena & Gym)',
  '1st Floor - Wing A (Classrooms 101 - 110)',
  '1st Floor - Wing B (Computer Labs 1 & 2)',
  '2nd Floor - Wing A (Civil & Mechanical Dept)',
  '2nd Floor - Wing B (Faculty Staff Room 201)',
  '3rd Floor - Wing A (Classrooms 301 - 310)',
  '3rd Floor - Wing B (Central Library & Reading Hall)',
  '4th Floor - Wing A (ECE & Telecom Dept)',
  '4th Floor - Wing B (Seminar Hall 401)',
  '5th Floor - Wing A (Classrooms 501 - 510)',
  '5th Floor - Wing B (Faculty Lounge)',
  '6th Floor - Wing A (CSE Dept Classrooms)',
  '6th Floor - Wing B (AI, ML & Data Science Lab)',
  '7th Floor - Wing A (Classrooms 701 - 710)',
  '7th Floor - Wing B (Dean & HOD Administrative Offices)',
  '8th Floor - Wing A (PG & Research Wing)',
  '8th Floor - Wing B (Main Auditorium & Conference)',
  '9th Floor - Wing A (Campus Innovation & Robotics Hub)',
  '9th Floor - Wing B (Top Floor Terrace Garden)',
  'Campus Canteen Main Counter (Ground Floor Central)'
] as const;

export type CampusPickupZone = typeof CAMPUS_PICKUP_ZONES[number];

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
  mealSlot?: 'breakfast' | 'lunch' | 'all_day';
  isAvailable?: boolean;
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
  type: 'Campus Desk' | 'Classroom' | 'Lab' | 'Faculty Room' | 'Home' | 'Work' | 'Other';
  title: string;
  addressLine: string;
  pickupZone?: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Student' | 'Teacher';
  dob?: string;
  usn: string; // Personal ID / USN for Student or Faculty ID for Teacher
  pickupZone: string; // Ground Floor to 9th Floor in A/B wing
  avatar?: string;
  created_at?: string;
}

export interface Feedback {
  id: string;
  orderId: string;
  customerName: string;
  customerUsn?: string;
  customerRole?: 'Student' | 'Teacher';
  overallRating: number; // 1-5
  qualityRating: number;
  speedRating: number;
  comment: string;
  tags: string[];
  createdAt: string;
}

export interface Complaint {
  id: string;
  orderId: string;
  customerName: string;
  customerUsn?: string;
  customerPhone?: string;
  pickupZone: string;
  category: 'Cold Food' | 'Food Quality & Taste' | 'Delayed Delivery' | 'Missing Item' | 'Packaging Issue' | 'Hygiene Concern' | 'Other';
  description: string;
  status: 'Pending' | 'Investigating' | 'Resolved' | 'Refunded';
  resolutionNote?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  itemTotal: number;
  deliveryFee: number; // ₹0 on campus
  platformFee: number;
  gst: number;
  discount: number;
  tip: number;
  grandTotal: number;
  deliveryAddress: Address;
  pickupZone: string;
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
  customerRole?: 'Student' | 'Teacher';
  customerUsn?: string;
  orderSlot?: 'Breakfast' | 'Lunch' | 'Campus Special';
  paymentMethod?: 'Razorpay' | 'UPI' | 'Credit/Debit Card' | 'Netbanking' | 'Cash on Delivery';
  notes?: string;
  restaurantName?: string;
  cancelReason?: string;
  feedback?: Feedback;
  complaint?: Complaint;
}

export interface DeliveryRider {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'available' | 'on_delivery' | 'offline';
  vehicleType: 'Campus Electric Cart' | 'Insulated Food Trolley' | 'Bicycle' | 'Campus Runner' | 'EV Scooter' | 'Motorcycle' | 'Electric Cargo';
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
  activeOrderId?: string;
  assignedWing?: 'Wing A' | 'Wing B' | 'Both Wings';
  assignedFloors?: string;
  currentZone?: string;
  batteryLevel?: number;
  avatar: string;
  joinedDate: string;
  isPureVegInsulatedBagVerified: boolean;
  emergencyContact: string;
}

export interface CanteenStaff {
  id: string;
  name: string;
  role: 'Head Chef' | 'Sous Chef' | 'Kitchen Manager' | 'Hygiene Inspector' | 'Packing Specialist' | 'Billing Desk';
  phone: string;
  email: string;
  shift: string;
  station: string;
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
  customerUsn?: string;
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
  deliveryRadiusKm?: number;
  breakfastStartTime: string; // "09:30"
  breakfastEndTime: string;   // "10:00"
  breakfastCutoffMinutes: number; // 20 mins before
  lunchStartTime: string;     // "13:20"
  lunchEndTime: string;       // "14:30"
  lunchCutoffMinutes: number; // 20 mins before
  demoBypassTiming: boolean;  // Allow testing at any time
  fssaiLicenseNumber: string;
  pureVegAuditPassed: boolean;
  contactSupportPhone: string;
}
