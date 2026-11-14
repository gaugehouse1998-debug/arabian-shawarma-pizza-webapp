export type OrderStatus =
  | 'order_placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethodType = 'cod' | 'easypaisa' | 'jazzcash' | 'bank_transfer';

export type PaymentStatus =
  | 'unpaid'
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'refunded';

export interface ProductVariation {
  id: string;
  name: string;
  price: number;
}

export interface ProductSize {
  name: string; // e.g. "Small (8\")", "Medium (11\")", "Large (13\")", "Family (17\")", "Regular", "Jumbo"
  price: number;
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  discountPrice?: number;
  image: string;
  galleryImages?: string[];
  sizes?: ProductSize[];
  addons?: ProductAddon[];
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  tags?: string[];
  dietary?: ('spicy' | 'vegetarian' | 'chef_special')[];
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deletionSnapshot?: Record<string, unknown>;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface DealIncludedItem {
  name: string;
  quantity: number;
}

export interface Deal {
  id: string;
  dealNumber: string; // e.g., "DEAL 01", "DEAL 28"
  title: string;
  description: string;
  category?: string;
  items: string[];
  includedItems?: DealIncludedItem[];
  price: number;
  originalPrice?: number;
  discountLabel?: string;
  displayOrder?: number;
  image: string;
  isActive: boolean;
  isFeatured?: boolean;
  isArchived?: boolean;
  archivedAt?: string;
  badge?: string;
  startDate?: string;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface CartItemOption {
  size?: ProductSize;
  selectedAddons?: ProductAddon[];
  specialInstructions?: string;
}

export interface CartItem {
  id: string; // Unique cart item identifier (productId + variations)
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  options?: CartItemOption;
  isDeal?: boolean;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
  area: string;
  city: string;
  instructions?: string;
}

export interface PaymentDetails {
  method: PaymentMethodType;
  status: PaymentStatus;
  transactionId?: string;
  screenshotUrl?: string;
  bankAccountTitle?: string;
  bankName?: string;
  accountNumber?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
}

export interface Order {
  id: string; // e.g. "ASP-928174"
  createdAt: string;
  customer: CustomerDetails;
  items: CartItem[];
  orderType: 'delivery' | 'pickup';
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  payment: PaymentDetails;
  statusHistory: OrderStatusHistoryItem[];
  notes?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  registeredAt: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate?: string;
  status: 'active' | 'inactive' | 'vip';
  tags: string[];
  internalNotes: string;
  orders: string[]; // Order IDs
}

export interface Coupon {
  code: string;
  title?: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit?: number;
  perCustomerLimit?: number;
  applicableCategories?: string[];
  applicableProductIds?: string[];
  timesUsed: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface CouponRedemption {
  id: string;
  couponCode: string;
  orderId: string;
  customerPhone: string;
  customerEmail?: string;
  discountAmount: number;
  orderSubtotal: number;
  redeemedAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branchName: string;
  instructions?: string;
  qrCodeUrl?: string;
  isActive: boolean;
}

export interface PaymentMethodSettings {
  codEnabled: boolean;
  easypaisa: {
    enabled: boolean;
    accountTitle: string;
    mobileNumber: string;
    instructions: string;
    qrCodeUrl?: string;
  };
  jazzcash: {
    enabled: boolean;
    accountTitle: string;
    mobileNumber: string;
    instructions: string;
    qrCodeUrl?: string;
  };
  bankAccounts: BankAccount[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  city?: string;
  fee: number;
  estimatedMinutes: string;
  minOrder: number;
  instructions?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  isActive: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deletionSnapshot?: Record<string, unknown>;
}

export interface VerifiedLocationState {
  confirmed: boolean;
  method: 'gps' | 'manual';
  selectedZoneId?: string;
  selectedAreaName?: string;
  distanceKm?: number;
  insideRadius?: boolean;
  checkedAt?: string;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  deliveryRadiusKm?: number;
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  closedDays: string[];
  currency: string;
  currencySymbol: string;
  taxPercentage: number;
  defaultDeliveryFee: number;
  freeDeliveryThreshold: number;
  minimumOrderAmount: number;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  announcement: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export interface Review {
  id: string;
  orderId?: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  createdAt?: string;
  status?: ReviewStatus;
  isApproved: boolean;
  itemOrdered?: string;
  moderatedAt?: string;
  moderatedBy?: string;
}

export interface NotificationItem {
  id: string;
  type: 'new_order' | 'payment_verification' | 'order_delivered' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: 'product' | 'category' | 'deal' | 'coupon' | 'banner' | 'order' | 'auth' | 'settings' | 'customer' | 'review' | 'zone';
  entityId?: string;
  details: string;
  performedBy: string;
  timestamp: string;
}

export interface RecycleBinItem {
  id: string; // The original record ID
  recordType: 'product' | 'category' | 'deal' | 'coupon' | 'banner' | 'zone';
  name: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  deletedAt: string;
  deletedBy: string;
  originalData: any;
}

export interface AdminCredentialState {
  adminId: string; // "arabianshawarma@admin"
  passwordHash: string; // Salted secure hash
  mustChangePassword: boolean;
  lastPasswordChange?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  activeSessionsCount: number;
}
