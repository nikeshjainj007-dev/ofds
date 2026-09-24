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
  paymentStatus: 'PAID' | 'FAILED' | 'PENDING';
  status: 'PLACED' | 'KITCHEN_PREPARING' | 'RIDER_ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  createdAt: string;
  riderName: string;
  riderPhone: string;
  estimatedMinutes: number;
}
