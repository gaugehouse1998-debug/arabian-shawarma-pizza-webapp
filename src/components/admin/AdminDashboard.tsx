import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Clock,
  UtensilsCrossed,
  Layers,
  Tag,
  Users,
  CreditCard,
  CheckCircle2,
  Bike,
  TicketPercent,
  MessageSquare,
  Globe,
  Image as ImageIcon,
  Bell,
  BarChart3,
  UserCheck,
  Settings,
  User,
  LogOut,
  Search,
  Plus,
  Edit,
  Trash2,
  Printer,
  ChevronRight,
  Download,
  AlertCircle,
  AlertTriangle,
  Info,
  Eye,
  Check,
  X,
  ExternalLink,
  Shield,
  RotateCcw,
  Upload,
  ImagePlus,
  KeyRound,
  ShieldCheck,
  MapPin,
  Navigation,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { RecycleBinTab } from './RecycleBinTab';
import { SecuritySettingsTab } from './SecuritySettingsTab';
import { MandatoryPasswordChangeModal } from './MandatoryPasswordChangeModal';
import { AdminDealsPanel } from './AdminDealsPanel';
import { AdminCouponsPanel } from './AdminCouponsPanel';
import { AdminReviewsPanel } from './AdminReviewsPanel';
import {
  Order,
  Product,
  Category,
  Deal,
  CustomerProfile,
  Coupon,
  PaymentMethodSettings,
  RestaurantSettings,
  DeliveryZone,
  Review,
  OrderStatus,
  PaymentStatus,
  BankAccount,
  BannerItem,
  NotificationItem
} from '../../types';
import { OrderInvoiceModal } from '../invoice/OrderInvoiceModal';
import { LOGO_URL, resolveAssetUrl } from '../../utils/assetUrl';

interface AdminDashboardProps {
  onBackToStore: () => void;
  initialSection?: string;
  onSectionChange?: (section: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  initialSection = 'overview',
  onSectionChange
}) => {
  const { logout, currentUser, mustChangePassword } = useAuth();

  // Current active sidebar module
  const [activeTab, setActiveTab] = useState<string>(initialSection);

  useEffect(() => {
    if (initialSection && initialSection !== activeTab) {
      setActiveTab(initialSection);
    }
  }, [initialSection]);

  // Reactive state from storageService
  const [analytics, setAnalytics] = useState(storageService.getAnalytics());
  const [orders, setOrders] = useState<Order[]>(storageService.getOrders());
  const [products, setProducts] = useState<Product[]>(storageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(storageService.getCategories());
  const [deals, setDeals] = useState<Deal[]>(storageService.getDeals());
  const [customers, setCustomers] = useState<CustomerProfile[]>(storageService.getCustomers());
  const [coupons, setCoupons] = useState<Coupon[]>(storageService.getCoupons());
  const [paymentSettings, setPaymentSettings] = useState<PaymentMethodSettings>(storageService.getPaymentSettings());
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>(storageService.getRestaurantSettings());
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(storageService.getDeliveryZones());
  const [reviews, setReviews] = useState<Review[]>(storageService.getReviews());
  const [notifications, setNotifications] = useState(storageService.getNotifications());
  const [banners, setBanners] = useState<BannerItem[]>(() => storageService.getBanners());

  // Delete Confirmation Dialog state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    type: 'product' | 'category' | 'deal' | 'coupon' | 'zone' | 'customer' | 'review' | 'bank' | 'banner' | 'notification';
    typeName: string;
    isSoftDelete: boolean;
    onConfirm: () => void;
  } | null>(null);

  // In-app non-blocking feedback toast (replaces window.alert)
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  // Modals & sub-state
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<Order | null>(null);
  const [newStatusInput, setNewStatusInput] = useState<OrderStatus>('confirmed');
  const [statusNoteInput, setStatusNoteInput] = useState('');

  // Payment Verification Modal
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [verificationNote, setVerificationNote] = useState('');

  // Product CRUD Modal
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});

  // Category CRUD Modal
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({});

  // Customer Note Modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [customerNoteText, setCustomerNoteText] = useState('');

  // Delivery Zone CRUD Modal & Search
  const [zoneModalMode, setZoneModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingZone, setEditingZone] = useState<Partial<DeliveryZone>>({});
  const [zoneSearch, setZoneSearch] = useState('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Search & filter states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Sync listener
  const [recycleBinCount, setRecycleBinCount] = useState<number>(() => storageService.getRecycleBinItems().length);
  const [undoToast, setUndoToast] = useState<{
    id: string;
    name: string;
    type: 'product' | 'category' | 'deal' | 'coupon' | 'banner' | 'zone';
    countdown: number;
  } | null>(null);

  // 10-Second Undo Timer Countdown
  useEffect(() => {
    if (!undoToast) return;
    if (undoToast.countdown <= 0) {
      setUndoToast(null);
      return;
    }
    const timer = setTimeout(() => {
      setUndoToast((prev) => (prev ? { ...prev, countdown: prev.countdown - 1 } : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [undoToast]);

  const handleUndoDelete = () => {
    if (!undoToast) return;
    storageService.restoreRecycleBinItem(undoToast.type, undoToast.id);
    const restoredName = undoToast.name;
    setUndoToast(null);
    setProducts(storageService.getProducts());
    setCategories(storageService.getCategories());
    setDeals(storageService.getDeals());
    setCoupons(storageService.getCoupons());
    setBanners(storageService.getBanners());
    setDeliveryZones(storageService.getDeliveryZones());
    setRecycleBinCount(storageService.getRecycleBinItems().length);
    showFeedback(`Successfully restored "${restoredName}" back to active listings!`);
  };

  // 1. Product Deletion
  const handleDeleteProduct = (prod: Product) => {
    setDeleteTarget({
      id: prod.id,
      name: prod.name,
      type: 'product',
      typeName: 'Food Product',
      isSoftDelete: true,
      onConfirm: () => {
        storageService.softDeleteProduct(prod.id, currentUser?.email || 'arabianshawarma@admin');
        setProducts(storageService.getProducts());
        setRecycleBinCount(storageService.getRecycleBinItems().length);
        setUndoToast({
          id: prod.id,
          name: prod.name,
          type: 'product',
          countdown: 10
        });
        showFeedback(`Product "${prod.name}" moved to Recycle Bin.`);
      }
    });
  };

  // 2. Category Deletion
  const handleDeleteCategory = (cat: Category) => {
    setDeleteTarget({
      id: cat.id,
      name: cat.name,
      type: 'category',
      typeName: 'Menu Category',
      isSoftDelete: true,
      onConfirm: () => {
        storageService.softDeleteCategory(cat.id, currentUser?.email || 'arabianshawarma@admin');
        setCategories(storageService.getCategories());
        setRecycleBinCount(storageService.getRecycleBinItems().length);
        setUndoToast({
          id: cat.id,
          name: cat.name,
          type: 'category',
          countdown: 10
        });
        showFeedback(`Category "${cat.name}" moved to Recycle Bin.`);
      }
    });
  };

  // 3. Deal Deletion
  const handleDeleteDeal = (deal: Deal) => {
    const orderRefs = storageService.getDealOrderReferenceCount(deal.id);
    setDeleteTarget({
      id: deal.id,
      name: `${deal.dealNumber}: ${deal.title}${
        orderRefs > 0 ? ` (Used in ${orderRefs} historical order${orderRefs === 1 ? '' : 's'})` : ''
      }`,
      type: 'deal',
      typeName: orderRefs > 0 ? 'Deal (Safe Archive / Soft Delete)' : 'Mega Deal',
      isSoftDelete: true,
      onConfirm: () => {
        storageService.softDeleteDeal(deal.id, currentUser?.email || 'arabianshawarma@admin');
        setDeals(storageService.getDeals());
        setRecycleBinCount(storageService.getRecycleBinItems().length);
        setUndoToast({
          id: deal.id,
          name: `${deal.dealNumber}: ${deal.title}`,
          type: 'deal',
          countdown: 10
        });
        showFeedback(`Deal "${deal.dealNumber}: ${deal.title}" moved to Recycle Bin (order history kept safe).`);
      }
    });
  };

  // 4. Coupon Deletion
  const handleDeleteCoupon = (coupon: Coupon) => {
    setDeleteTarget({
      id: coupon.code,
      name: `Coupon Code "${coupon.code}"`,
      type: 'coupon',
      typeName: 'Promotional Coupon',
      isSoftDelete: true,
      onConfirm: () => {
        storageService.softDeleteCoupon(coupon.code, currentUser?.email || 'arabianshawarma@admin');
        setCoupons(storageService.getCoupons());
        setRecycleBinCount(storageService.getRecycleBinItems().length);
        setUndoToast({
          id: coupon.code,
          name: `Coupon ${coupon.code}`,
          type: 'coupon',
          countdown: 10
        });
        showFeedback(`Coupon code "${coupon.code}" moved to Recycle Bin.`);
      }
    });
  };

  // 5. Delivery Zone Deletion (Soft delete with Recycle Bin & Undo support)
  const handleDeleteDeliveryZone = (zone: DeliveryZone) => {
    setDeleteTarget({
      id: zone.id,
      name: `${zone.name} (Delivery Fee: Rs. ${zone.fee})`,
      type: 'zone',
      typeName: 'Delivery Area',
      isSoftDelete: true,
      onConfirm: () => {
        storageService.softDeleteDeliveryZone(zone.id, currentUser?.email || 'arabianshawarma@admin');
        setDeliveryZones(storageService.getDeliveryZones());
        setRecycleBinCount(storageService.getRecycleBinItems().length);
        setUndoToast({
          id: zone.id,
          name: zone.name,
          type: 'zone',
          countdown: 10
        });
        showFeedback(`Delivery area "${zone.name}" moved to Recycle Bin.`);
      }
    });
  };

  // 6. Customer Deletion
  const handleDeleteCustomer = (cust: CustomerProfile) => {
    setDeleteTarget({
      id: cust.id,
      name: `${cust.name} (${cust.phone})`,
      type: 'customer',
      typeName: 'Customer Profile',
      isSoftDelete: false,
      onConfirm: () => {
        storageService.deleteCustomer(cust.id);
        setCustomers(storageService.getCustomers());
        showFeedback(`Customer profile "${cust.name}" removed from CRM.`);
      }
    });
  };

  // 7. Review Deletion
  const handleDeleteReview = (rev: Review) => {
    setDeleteTarget({
      id: rev.id,
      name: `Review by "${rev.customerName}" (${rev.rating}★)`,
      type: 'review',
      typeName: 'Customer Review',
      isSoftDelete: false,
      onConfirm: () => {
        storageService.deleteReview(rev.id);
        setReviews(storageService.getReviews());
        showFeedback('Customer review deleted successfully.');
      }
    });
  };

  // 8. Bank Account Deletion
  const handleDeleteBankAccount = (bank: BankAccount) => {
    setDeleteTarget({
      id: bank.id,
      name: `${bank.bankName} (${bank.accountNumber})`,
      type: 'bank',
      typeName: 'Bank Account',
      isSoftDelete: false,
      onConfirm: () => {
        storageService.deleteBankAccount(bank.id);
        setPaymentSettings(storageService.getPaymentSettings());
        showFeedback(`Bank account "${bank.bankName}" deleted.`);
      }
    });
  };

  // 9. Banner Deletion
  const handleDeleteBanner = (banner: BannerItem) => {
    setDeleteTarget({
      id: banner.id,
      name: banner.title,
      type: 'banner',
      typeName: 'Promotional Banner',
      isSoftDelete: true,
      onConfirm: () => {
        storageService.softDeleteBanner(banner.id, currentUser?.email || 'arabianshawarma@admin');
        setBanners(storageService.getBanners());
        setRecycleBinCount(storageService.getRecycleBinItems().length);
        setUndoToast({
          id: banner.id,
          name: banner.title,
          type: 'banner',
          countdown: 10
        });
        showFeedback(`Banner "${banner.title}" moved to Recycle Bin.`);
      }
    });
  };

  // 10. Notification Deletion
  const handleDeleteNotification = (notif: NotificationItem) => {
    setDeleteTarget({
      id: notif.id,
      name: notif.title,
      type: 'notification',
      typeName: 'Notification Alert',
      isSoftDelete: false,
      onConfirm: () => {
        storageService.deleteNotification(notif.id);
        setNotifications(storageService.getNotifications());
        showFeedback('Notification removed.');
      }
    });
  };

  // 11. Clear All Notifications
  const handleClearAllNotifications = () => {
    setDeleteTarget({
      id: 'all',
      name: 'All system notification messages',
      type: 'notification',
      typeName: 'System Notifications',
      isSoftDelete: false,
      onConfirm: () => {
        storageService.clearAllNotifications();
        setNotifications([]);
        showFeedback('All notifications cleared.');
      }
    });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await storageService.uploadImageFile(file);
      setEditingProduct((prev) => ({ ...prev, image: dataUrl }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload image.';
      showFeedback(msg, 'error');
    }
  };

  useEffect(() => {
    const handleStorageUpdate = () => {
      setAnalytics(storageService.getAnalytics());
      setOrders(storageService.getOrders());
      setProducts(storageService.getProducts());
      setCategories(storageService.getCategories());
      setDeals(storageService.getDeals());
      setCustomers(storageService.getCustomers());
      setCoupons(storageService.getCoupons());
      setPaymentSettings(storageService.getPaymentSettings());
      setRestaurantSettings(storageService.getRestaurantSettings());
      setDeliveryZones(storageService.getDeliveryZones());
      setReviews(storageService.getReviews());
      setNotifications(storageService.getNotifications());
      setRecycleBinCount(storageService.getRecycleBinItems().length);
    };

    window.addEventListener('asp_data_updated', handleStorageUpdate);
    return () => window.removeEventListener('asp_data_updated', handleStorageUpdate);
  }, []);

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      );
    }
    return true;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Customers
  const filteredCustomers = customers.filter((c) => {
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q));
    }
    return true;
  });

  // Pending verification orders
  const pendingVerificationOrders = orders.filter(
    (o) => o.payment.method !== 'cod' && o.payment.status === 'pending_verification'
  );

  // Status update submit
  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForStatus) return;

    storageService.updateOrderStatus(
      selectedOrderForStatus.id,
      newStatusInput,
      statusNoteInput.trim() || undefined,
      currentUser?.name || 'Administrator'
    );

    setSelectedOrderForStatus(null);
    setStatusNoteInput('');
  };

  // Payment Verification submit
  const handleVerifyPayment = (isApproved: boolean) => {
    if (!verifyingOrder) return;

    if (isApproved) {
      storageService.verifyPayment(
        verifyingOrder.id,
        verificationNote.trim() || 'Payment confirmed by Administrator',
        currentUser?.name || 'Admin'
      );
    } else {
      storageService.rejectPayment(
        verifyingOrder.id,
        verificationNote.trim() || 'Payment verification rejected. Transaction ID mismatch.',
        currentUser?.name || 'Admin'
      );
    }

    setVerifyingOrder(null);
    setVerificationNote('');
  };

  // Export Customers to CSV
  const handleExportCustomersCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Address', 'Status', 'Total Orders', 'Total Spend (PKR)', 'Tags', 'Registered Date'];
    const rows = customers.map((c) => [
      c.id,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      `"${c.address || ''}"`,
      c.status,
      c.totalOrders,
      c.totalSpend,
      `"${c.tags.join('; ')}"`,
      c.registeredAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `arabian_shawarma_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Orders to CSV
  const handleExportOrdersCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Area', 'Type', 'Subtotal', 'Discount', 'Delivery Fee', 'Total (PKR)', 'Status', 'Payment Method', 'Payment Status', 'TID'];
    const rows = orders.map((o) => [
      o.id,
      o.createdAt,
      `"${o.customer.name}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.area}"`,
      o.orderType,
      o.subtotal,
      o.discount,
      o.deliveryFee,
      o.total,
      o.status,
      o.payment.method,
      o.payment.status,
      `"${o.payment.transactionId || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `arabian_shawarma_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Product save
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct.name || !editingProduct.category || editingProduct.basePrice === undefined) {
      showFeedback('Please fill product name, category, and price.', 'error');
      return;
    }

    const newProd: Product = {
      id: editingProduct.id || `prod-${Date.now()}`,
      name: editingProduct.name,
      category: editingProduct.category,
      description: editingProduct.description || '',
      basePrice: Number(editingProduct.basePrice),
      image: editingProduct.image || '/assets/images/hero_3d_burger_1794391292664.jpg',
      sizes: editingProduct.sizes || undefined,
      addons: editingProduct.addons || undefined,
      isAvailable: editingProduct.isAvailable !== false,
      isFeatured: Boolean(editingProduct.isFeatured),
      isBestSeller: Boolean(editingProduct.isBestSeller),
      tags: editingProduct.tags || []
    };

    storageService.saveProduct(newProd);
    setProductModalMode(null);
    setEditingProduct({});
  };

  // Category save
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory.name) return;

    const newCat: Category = {
      id: editingCategory.id || `cat-${Date.now()}`,
      name: editingCategory.name,
      description: editingCategory.description || '',
      order: editingCategory.order || categories.length + 1,
      isActive: editingCategory.isActive !== false
    };

    storageService.saveCategory(newCat);
    setCategoryModalMode(null);
    setEditingCategory({});
  };

  // Save restaurant settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = storageService.saveRestaurantSettings(restaurantSettings);
    setRestaurantSettings(saved);
    showFeedback('Restaurant configuration and delivery radius saved.');
  };

  // Delivery Zone save (Create or Edit)
  const handleSaveDeliveryZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone.name?.trim()) {
      showFeedback('Delivery area name is required.', 'error');
      return;
    }

    const latVal =
      editingZone.latitude !== undefined &&
      editingZone.latitude !== null &&
      String(editingZone.latitude) !== '' &&
      Number.isFinite(Number(editingZone.latitude))
        ? Number(editingZone.latitude)
        : undefined;
    const lngVal =
      editingZone.longitude !== undefined &&
      editingZone.longitude !== null &&
      String(editingZone.longitude) !== '' &&
      Number.isFinite(Number(editingZone.longitude))
        ? Number(editingZone.longitude)
        : undefined;
    const radVal =
      editingZone.radiusKm !== undefined &&
      editingZone.radiusKm !== null &&
      Number(editingZone.radiusKm) > 0
        ? Number(editingZone.radiusKm)
        : undefined;

    const savedZone = storageService.saveDeliveryZone({
      id: editingZone.id || `zone-${Date.now()}`,
      name: editingZone.name.trim(),
      city: editingZone.city?.trim() || restaurantSettings.city || 'Lahore',
      fee: Math.max(0, Number(editingZone.fee) || 0),
      minOrder: Math.max(0, Number(editingZone.minOrder) || 0),
      estimatedMinutes: editingZone.estimatedMinutes?.trim() || '30-40 mins',
      instructions: editingZone.instructions?.trim() || '',
      latitude: latVal,
      longitude: lngVal,
      radiusKm: radVal,
      isActive: editingZone.isActive !== false,
      isDeleted: false
    });

    setDeliveryZones(storageService.getDeliveryZones());
    setZoneModalMode(null);
    setEditingZone({});
    showFeedback(`Delivery area "${savedZone.name}" saved and published to live storefront.`);
  };

  const handleUseBrowserCoordsForRestaurant = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      showFeedback('Browser geolocation is unavailable on this device.', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRestaurantSettings((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6))
        }));
        showFeedback('Captured current GPS coordinates for restaurant branch. Click Save to apply.');
      },
      () => {
        showFeedback('Location permission denied. Enter latitude and longitude manually.', 'error');
      }
    );
  };

  // Save payment settings
  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.savePaymentSettings(paymentSettings);
    showFeedback('Payment gateway and bank account settings saved.');
  };

  // All sidebar items with Recycle Bin and Security & Change Password
  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.filter((o) => o.status === 'order_placed').length },
    { id: 'tracking', label: 'Order Tracking', icon: Clock },
    { id: 'products', label: 'Products', icon: UtensilsCrossed },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'deals', label: 'Deals & Combos', icon: Tag },
    { id: 'crm', label: 'Customers / CRM', icon: Users },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'verification', label: 'Payment Verification', icon: CheckCircle2, badge: pendingVerificationOrders.length },
    { id: 'delivery', label: 'Delivery Zones', icon: Bike },
    { id: 'coupons', label: 'Coupons & Promos', icon: TicketPercent },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'content', label: 'Website Content', icon: Globe },
    { id: 'banners', label: 'Banners & Offers', icon: ImageIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.filter((n) => !n.isRead).length },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'recycle_bin', label: 'Recycle Bin', icon: Trash2, badge: recycleBinCount },
    { id: 'staff', label: 'Staff / Roles', icon: UserCheck },
    { id: 'settings', label: 'General Settings', icon: Settings },
    { id: 'security', label: 'Security & Password', icon: KeyRound },
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'logout', label: 'Logout', icon: LogOut, isAction: true }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0">
        {/* Brand Lockup */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 p-1 flex items-center justify-center shrink-0">
              <img
                src={LOGO_URL}
                alt="Arabian Shawarma & Pizza"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <div className="font-bold text-sm text-white font-display">Arabian Admin</div>
              <div className="text-[10px] text-neutral-400">Walton Cantt, Lahore</div>
            </div>
          </div>
          <button
            onClick={onBackToStore}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
            title="View public website"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isAction && item.id === 'logout') {
                    logout();
                    onBackToStore();
                  } else {
                    setActiveTab(item.id);
                    onSectionChange?.(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-neutral-950 text-amber-400' : 'bg-amber-500 text-neutral-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
          <div className="truncate">
            <div className="font-semibold text-white truncate">{currentUser?.name || 'Administrator'}</div>
            <div className="font-mono text-neutral-500 truncate">{currentUser?.email || 'Owner Session'}</div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-display capitalize">
              {sidebarItems.find((s) => s.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live database state · Real-time synchronized
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToStore}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer Storefront</span>
            </button>
          </div>
        </div>

        {/* 1. OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="text-xs text-neutral-400">Total Revenue</div>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  Rs. {analytics.totalRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-neutral-500">
                  Today: Rs. {analytics.todayRevenue.toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="text-xs text-neutral-400">Total Orders</div>
                <div className="text-2xl font-bold font-mono text-white">
                  {analytics.totalOrders}
                </div>
                <div className="text-[11px] text-amber-400">
                  {analytics.pendingOrders} Active / Preparing
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="text-xs text-neutral-400">Pending Payments</div>
                <div className="text-2xl font-bold font-mono text-red-400">
                  {analytics.pendingPayments}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {analytics.verifiedPayments} Verified
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="text-xs text-neutral-400">Total Customers</div>
                <div className="text-2xl font-bold font-mono text-white">
                  {analytics.totalCustomers}
                </div>
                <div className="text-[11px] text-emerald-400">Registered CRM Profiles</div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Orders Table (8 cols) */}
              <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm font-display">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    View All ({orders.length})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
                        <th className="py-2">Order ID</th>
                        <th className="py-2">Customer</th>
                        <th className="py-2">Amount</th>
                        <th className="py-2">Payment</th>
                        <th className="py-2">Status</th>
                        <th className="py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {orders.slice(0, 6).map((order) => (
                        <tr key={order.id} className="hover:bg-neutral-850/50">
                          <td className="py-2.5 font-mono font-semibold text-amber-400">#{order.id}</td>
                          <td className="py-2.5">
                            <div className="font-semibold text-white truncate max-w-[120px]">{order.customer.name}</div>
                            <div className="text-[10px] text-neutral-500 font-mono">{order.customer.phone}</div>
                          </td>
                          <td className="py-2.5 font-mono text-white">Rs. {order.total.toLocaleString()}</td>
                          <td className="py-2.5">
                            <span className="uppercase text-[10px] font-semibold text-neutral-300">
                              {order.payment.method}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => setSelectedOrderForInvoice(order)}
                              className="text-neutral-400 hover:text-white p-1"
                              title="Print Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Best Selling Items & Quick Links (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-white text-sm font-display">Top Selling Dishes</h3>
                  <div className="space-y-2">
                    {analytics.bestSellers.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                        <span className="font-medium text-white truncate max-w-[140px]">{item.name}</span>
                        <div className="text-right font-mono">
                          <span className="text-amber-400 font-semibold">{item.quantity} sold</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-white text-sm font-display">Pending Tasks</h3>
                  <div className="space-y-2 text-xs">
                    {pendingVerificationOrders.length > 0 ? (
                      <div
                        onClick={() => setActiveTab('verification')}
                        className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 cursor-pointer hover:bg-amber-500/20 flex items-center justify-between"
                      >
                        <span>{pendingVerificationOrders.length} payments waiting verification</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>All mobile wallet transfers verified!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Status Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                {['all', 'order_placed', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {/* Search & CSV Export */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by ID or customer..."
                    className="bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={handleExportOrdersCSV}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
                    <th className="py-2.5">Order ID</th>
                    <th className="py-2.5">Date & Time</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Items Summary</th>
                    <th className="py-2.5">Total</th>
                    <th className="py-2.5">Payment</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-850/40">
                      <td className="py-3 font-mono font-bold text-amber-400">#{order.id}</td>
                      <td className="py-3 font-mono text-neutral-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <div className="text-[10px] text-neutral-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-white">{order.customer.name}</div>
                        <div className="font-mono text-[11px] text-neutral-400">{order.customer.phone}</div>
                        <div className="text-[10px] text-neutral-500 truncate max-w-[140px]">{order.customer.area}</div>
                      </td>
                      <td className="py-3 max-w-xs truncate text-neutral-300">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="py-3 font-mono font-bold text-white">
                        Rs. {order.total.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <div className="uppercase font-semibold text-[11px] text-neutral-200">
                          {order.payment.method}
                        </div>
                        <div
                          className={`text-[10px] capitalize ${
                            order.payment.status === 'verified'
                              ? 'text-emerald-400'
                              : order.payment.status === 'rejected'
                              ? 'text-red-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {order.payment.status.replace(/_/g, ' ')}
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                            order.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : order.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedOrderForStatus(order);
                            setNewStatusInput(order.status);
                          }}
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-[11px] font-medium"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
                          title="Print Customer Invoice & Kitchen KOT"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ORDER TRACKING QUICK UPDATE */}
        {activeTab === 'tracking' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white font-display">
              Kitchen Dispatch & Progress Monitor
            </h2>
            <p className="text-xs text-neutral-400">
              Select an order to quickly transition its state along the live timeline (Placed → Confirmed → Kitchen → Ready → Out for Delivery → Delivered).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.slice(0, 9).map((order) => (
                <div key={order.id} className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-amber-400">#{order.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold bg-neutral-800 text-white">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-white">{order.customer.name} ({order.customer.phone})</div>
                    <div className="text-neutral-400 truncate">{order.customer.address}</div>
                    <div className="font-mono text-amber-400 mt-1">Rs. {order.total.toLocaleString()}</div>
                  </div>
                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedOrderForStatus(order);
                        setNewStatusInput(order.status);
                      }}
                      className="px-3 py-1 bg-amber-500 text-neutral-950 font-bold text-xs rounded-lg hover:bg-amber-400"
                    >
                      Advance Status
                    </button>
                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      KOT Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name or category..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    category: 'Pizza',
                    basePrice: 500,
                    isAvailable: true,
                    isFeatured: false,
                    isBestSeller: false
                  });
                  setProductModalMode('create');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
                    <th className="py-2.5">Product</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Base Price</th>
                    <th className="py-2.5">Sizes</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-850/40">
                      <td className="py-2.5 flex items-center gap-3">
                        <img
                          src={resolveAssetUrl(product.image)}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-950 shrink-0 border border-neutral-800"
                        />
                        <div>
                          <div className="font-semibold text-white">{product.name}</div>
                          <div className="text-[10px] text-neutral-500 line-clamp-1 max-w-xs">{product.description}</div>
                        </div>
                      </td>
                      <td className="py-2.5 font-medium text-neutral-300">{product.category}</td>
                      <td className="py-2.5 font-mono text-amber-400 font-bold">
                        Rs. {product.basePrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-neutral-400 text-[11px]">
                        {product.sizes?.length ? `${product.sizes.length} sizes` : 'Standard'}
                      </td>
                      <td className="py-2.5">
                        <button
                          onClick={() => storageService.toggleProductAvailability(product.id)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                            product.isAvailable
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {product.isAvailable ? 'Available' : 'Sold Out'}
                        </button>
                      </td>
                      <td className="py-2.5 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingProduct({ ...product });
                            setProductModalMode('edit');
                          }}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-1.5 bg-neutral-800 hover:bg-red-900/60 text-neutral-300 hover:text-red-400 rounded-lg cursor-pointer"
                          title="Delete Product (with Undo)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-base font-display">Menu Categories</h2>
                <p className="text-xs text-neutral-400">Order and manage food categories displayed on the customer menu.</p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory({ order: categories.length + 1, isActive: true });
                  setCategoryModalMode('create');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-neutral-800 px-2 py-0.5 rounded text-neutral-300 font-bold">
                        #{cat.order}
                      </span>
                      <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">{cat.description || 'No description provided.'}</p>
                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory({ ...cat });
                        setCategoryModalMode('edit');
                      }}
                      className="p-1.5 text-neutral-400 hover:text-white"
                      title="Edit Category"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 cursor-pointer"
                      title="Delete Category (with Undo)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. DEALS & PROMOTIONS MANAGEMENT */}
        {activeTab === 'deals' && (
          <AdminDealsPanel
            deals={deals}
            categories={categories.map((c) => c.name)}
            adminEmail={currentUser?.email || 'arabianshawarma@admin'}
            onDeleteDeal={handleDeleteDeal}
            onFeedback={showFeedback}
            onDealsChanged={() => setDeals(storageService.getDeals())}
          />
        )}

        {/* 7. CUSTOMERS / CRM */}
        {activeTab === 'crm' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customers by name, phone..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleExportCustomersCSV}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Customers CSV</span>
              </button>
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
                    <th className="py-2.5">Customer Profile</th>
                    <th className="py-2.5">Contact</th>
                    <th className="py-2.5">Orders</th>
                    <th className="py-2.5">Total Spend</th>
                    <th className="py-2.5">Tier & Tags</th>
                    <th className="py-2.5">Internal Notes</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-neutral-850/40">
                      <td className="py-3">
                        <div className="font-semibold text-white">{cust.name}</div>
                        <div className="text-[10px] text-neutral-500 truncate max-w-[140px]">{cust.address || 'Lahore'}</div>
                      </td>
                      <td className="py-3 font-mono text-neutral-300">
                        {cust.phone}
                        {cust.email && <div className="text-[10px] text-neutral-500">{cust.email}</div>}
                      </td>
                      <td className="py-3 font-mono font-semibold text-white">{cust.totalOrders}</td>
                      <td className="py-3 font-mono font-bold text-amber-400">
                        Rs. {cust.totalSpend.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            cust.status === 'vip'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {cust.status}
                        </span>
                      </td>
                      <td className="py-3 text-[11px] text-neutral-400 max-w-xs truncate">
                        {cust.internalNotes || '—'}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setCustomerNoteText(cust.internalNotes || '');
                            }}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-[11px] font-medium transition-colors"
                          >
                            Add Note
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomer(cust)}
                            className="p-1.5 bg-neutral-800 hover:bg-red-950/80 text-neutral-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Customer Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. PAYMENT METHODS SETTINGS */}
        {activeTab === 'payments' && (
          <form onSubmit={handleSavePaymentSettings} className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="font-bold text-white text-base font-display">Payment Gateway & Accounts</h2>
                <p className="text-xs text-neutral-400">
                  Configure Easypaisa, JazzCash, Meezan Bank, and Cash on Delivery details displayed to customers during checkout.
                </p>
              </div>

              {/* Cash on Delivery Toggle */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">Cash on Delivery (COD)</div>
                  <div className="text-xs text-neutral-400">Allow customers to pay physical cash at their doorstep.</div>
                </div>
                <input
                  type="checkbox"
                  checked={paymentSettings.codEnabled}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, codEnabled: e.target.checked })
                  }
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Easypaisa Module */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-green-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-green-400">Easypaisa Mobile Wallet</div>
                  <label className="flex items-center gap-2 text-xs text-neutral-300">
                    <span>Enabled</span>
                    <input
                      type="checkbox"
                      checked={paymentSettings.easypaisa.enabled}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          easypaisa: { ...paymentSettings.easypaisa, enabled: e.target.checked }
                        })
                      }
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-neutral-400">Account Holder Title</label>
                    <input
                      type="text"
                      value={paymentSettings.easypaisa.accountTitle}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          easypaisa: { ...paymentSettings.easypaisa, accountTitle: e.target.value }
                        })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-400">Easypaisa Mobile Number</label>
                    <input
                      type="text"
                      value={paymentSettings.easypaisa.mobileNumber}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          easypaisa: { ...paymentSettings.easypaisa, mobileNumber: e.target.value }
                        })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-neutral-400">Customer Instructions</label>
                  <textarea
                    rows={2}
                    value={paymentSettings.easypaisa.instructions}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        easypaisa: { ...paymentSettings.easypaisa, instructions: e.target.value }
                      })
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* JazzCash Module */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-red-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-red-400">JazzCash Mobile Wallet</div>
                  <label className="flex items-center gap-2 text-xs text-neutral-300">
                    <span>Enabled</span>
                    <input
                      type="checkbox"
                      checked={paymentSettings.jazzcash.enabled}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          jazzcash: { ...paymentSettings.jazzcash, enabled: e.target.checked }
                        })
                      }
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-neutral-400">Account Holder Title</label>
                    <input
                      type="text"
                      value={paymentSettings.jazzcash.accountTitle}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          jazzcash: { ...paymentSettings.jazzcash, accountTitle: e.target.value }
                        })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-400">JazzCash Mobile Number</label>
                    <input
                      type="text"
                      value={paymentSettings.jazzcash.mobileNumber}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          jazzcash: { ...paymentSettings.jazzcash, mobileNumber: e.target.value }
                        })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-neutral-400">Customer Instructions</label>
                  <textarea
                    rows={2}
                    value={paymentSettings.jazzcash.instructions}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        jazzcash: { ...paymentSettings.jazzcash, instructions: e.target.value }
                      })
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Bank Accounts Module */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">Bank Accounts</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newBank: BankAccount = {
                        id: `bank-${Date.now()}`,
                        bankName: 'Standard Chartered Bank',
                        accountTitle: 'Arabian Shawarma & Pizza',
                        accountNumber: '0102948201',
                        iban: 'PK00SCBL0000000102948201',
                        branchName: 'DHA Lahore Branch',
                        isActive: true
                      };
                      setPaymentSettings({
                        ...paymentSettings,
                        bankAccounts: [...paymentSettings.bankAccounts, newBank]
                      });
                    }}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bank Account</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentSettings.bankAccounts.map((bank, index) => (
                    <div key={bank.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-neutral-400">Bank Name</label>
                          <input
                            type="text"
                            value={bank.bankName}
                            onChange={(e) => {
                              const next = [...paymentSettings.bankAccounts];
                              next[index].bankName = e.target.value;
                              setPaymentSettings({ ...paymentSettings, bankAccounts: next });
                            }}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-neutral-400">Account Title</label>
                          <input
                            type="text"
                            value={bank.accountTitle}
                            onChange={(e) => {
                              const next = [...paymentSettings.bankAccounts];
                              next[index].accountTitle = e.target.value;
                              setPaymentSettings({ ...paymentSettings, bankAccounts: next });
                            }}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-neutral-400">Account Number</label>
                          <input
                            type="text"
                            value={bank.accountNumber}
                            onChange={(e) => {
                              const next = [...paymentSettings.bankAccounts];
                              next[index].accountNumber = e.target.value;
                              setPaymentSettings({ ...paymentSettings, bankAccounts: next });
                            }}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-neutral-400">IBAN</label>
                          <input
                            type="text"
                            value={bank.iban}
                            onChange={(e) => {
                              const next = [...paymentSettings.bankAccounts];
                              next[index].iban = e.target.value;
                              setPaymentSettings({ ...paymentSettings, bankAccounts: next });
                            }}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-neutral-400">Branch Name</label>
                          <input
                            type="text"
                            value={bank.branchName}
                            onChange={(e) => {
                              const next = [...paymentSettings.bankAccounts];
                              next[index].branchName = e.target.value;
                              setPaymentSettings({ ...paymentSettings, bankAccounts: next });
                            }}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white"
                          />
                        </div>
                      </div>

                      <div className="text-right pt-2 border-t border-neutral-900">
                        <button
                          type="button"
                          onClick={() => handleDeleteBankAccount(bank)}
                          className="text-xs text-red-400 hover:text-red-300 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Bank Account</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl"
                >
                  Save Payment Settings
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 9. PAYMENT VERIFICATION QUEUE */}
        {activeTab === 'verification' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="font-bold text-white text-base font-display">Payment Verification Queue</h2>
              <p className="text-xs text-neutral-400">
                Review submitted Easypaisa, JazzCash, and Bank Transfer transaction IDs and screenshots. Verify or reject with reason notes.
              </p>
            </div>

            {pendingVerificationOrders.length === 0 ? (
              <div className="text-center py-12 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm text-neutral-300 font-semibold">Zero Pending Verifications</p>
                <p className="text-xs text-neutral-500">All customer payments have been processed and confirmed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVerificationOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 bg-neutral-950/80 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-amber-400">#{order.id}</span>
                        <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-neutral-800 text-white">
                          {order.payment.method}
                        </span>
                        <span className="text-xs text-amber-400 font-mono font-bold">
                          Rs. {order.total.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-300 space-y-0.5">
                        <div>
                          Customer: <strong>{order.customer.name}</strong> ({order.customer.phone})
                        </div>
                        <div className="font-mono text-emerald-400">
                          Transaction ID (TID): <strong>{order.payment.transactionId || 'None Provided'}</strong>
                        </div>
                        {order.payment.verificationNotes && (
                          <div className="text-neutral-400 italic">"{order.payment.verificationNotes}"</div>
                        )}
                      </div>

                      {order.payment.screenshotUrl && (
                        <div className="pt-2">
                          <a
                            href={order.payment.screenshotUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Uploaded Transfer Screenshot</span>
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setVerifyingOrder(order);
                          setVerificationNote('');
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-md shadow-amber-500/10"
                      >
                        Verify / Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 10. DELIVERY RADIUS, COORDINATES & ZONES */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            {/* Restaurant Location & Delivery Radius Settings */}
            <form
              onSubmit={handleSaveSettings}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                <div>
                  <h2 className="font-bold text-white text-base font-display flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Restaurant Coordinates & 10 KM Delivery Radius</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Used to show the first-visit delivery popup and calculate Haversine GPS distance checks.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUseBrowserCoordsForRestaurant}
                  className="px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-amber-400 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Use Current Coordinates</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-neutral-300 font-medium">Branch Location / Address</label>
                  <input
                    type="text"
                    required
                    value={restaurantSettings.address}
                    onChange={(e) =>
                      setRestaurantSettings({ ...restaurantSettings, address: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Delivery Radius (KM)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step="0.5"
                    required
                    value={restaurantSettings.deliveryRadiusKm ?? 10}
                    onChange={(e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        deliveryRadiusKm: Number(e.target.value)
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Default Delivery Fee (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={restaurantSettings.defaultDeliveryFee}
                    onChange={(e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        defaultDeliveryFee: Number(e.target.value)
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Restaurant Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={restaurantSettings.latitude ?? 31.4882}
                    onChange={(e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        latitude: Number(e.target.value)
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Restaurant Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={restaurantSettings.longitude ?? 74.3652}
                    onChange={(e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        longitude: Number(e.target.value)
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-end justify-between gap-3">
                  <label className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={restaurantSettings.deliveryAvailable}
                      onChange={(e) =>
                        setRestaurantSettings({
                          ...restaurantSettings,
                          deliveryAvailable: e.target.checked
                        })
                      }
                      className="accent-amber-500"
                    />
                    <span className="text-neutral-200 font-medium">Home Delivery Enabled</span>
                  </label>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shrink-0 cursor-pointer"
                  >
                    Save Radius Settings
                  </button>
                </div>
              </div>
            </form>

            {/* Managed Delivery Areas List */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-white text-base font-display flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Delivery Areas & Charges ({deliveryZones.length})</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Active areas automatically appear in the visitor delivery popup and checkout selector.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={zoneSearch}
                      onChange={(e) => setZoneSearch(e.target.value)}
                      placeholder="Filter areas..."
                      className="bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 w-44"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingZone({
                        city: restaurantSettings.city || 'Lahore',
                        fee: restaurantSettings.defaultDeliveryFee || 150,
                        minOrder: restaurantSettings.minimumOrderAmount || 400,
                        estimatedMinutes: '30-40 mins',
                        isActive: true
                      });
                      setZoneModalMode('create');
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Delivery Area</span>
                  </button>
                </div>
              </div>

              {deliveryZones.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-2">
                  <p>No active or saved delivery areas yet. Visitors will see the {restaurantSettings.deliveryRadiusKm ?? 10} KM delivery radius checker.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deliveryZones
                    .filter((z) => {
                      const q = zoneSearch.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        z.name.toLowerCase().includes(q) ||
                        (z.city && z.city.toLowerCase().includes(q))
                      );
                    })
                    .map((zone) => (
                      <div
                        key={zone.id}
                        className={`p-4 bg-neutral-950 border rounded-xl space-y-2.5 flex flex-col justify-between ${
                          zone.isActive ? 'border-neutral-800' : 'border-red-900/40 opacity-80'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-white text-sm leading-tight">{zone.name}</h3>
                              <div className="text-[11px] text-neutral-400">{zone.city || 'Lahore'}</div>
                            </div>
                            <span className="font-mono font-bold text-amber-400 text-sm shrink-0">
                              Rs. {zone.fee}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 space-y-0.5">
                            <div>Estimated: {zone.estimatedMinutes}</div>
                            <div>Min Order: Rs. {zone.minOrder}</div>
                            {zone.instructions && (
                              <div className="text-[11px] text-neutral-500 italic line-clamp-2">
                                {zone.instructions}
                              </div>
                            )}
                            {zone.latitude !== undefined && zone.longitude !== undefined && (
                              <div className="text-[10px] font-mono text-neutral-500">
                                GPS: {zone.latitude}, {zone.longitude}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-neutral-800 flex items-center justify-between gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = storageService.toggleDeliveryZoneActive(zone.id);
                              if (updated) {
                                setDeliveryZones(storageService.getDeliveryZones());
                                showFeedback(
                                  `"${zone.name}" is now ${updated.isActive ? 'Active (visible to customers)' : 'Inactive (hidden from customers)'}.`
                                );
                              }
                            }}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                              zone.isActive
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            {zone.isActive ? 'Active' : 'Inactive'}
                          </button>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingZone(zone);
                                setZoneModalMode('edit');
                              }}
                              className="text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDeliveryZone(zone)}
                              className="text-red-400 hover:text-red-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 11. COUPONS & DISCOUNTS */}
        {activeTab === 'coupons' && (
          <AdminCouponsPanel
            coupons={coupons}
            categories={categories}
            products={products}
            onDeleteCoupon={handleDeleteCoupon}
            onFeedback={showFeedback}
            onCouponsChanged={() => setCoupons(storageService.getCoupons())}
          />
        )}

        {/* 12. REVIEWS */}
        {activeTab === 'reviews' && (
          <AdminReviewsPanel
            reviews={reviews}
            adminEmail={currentUser?.email || 'arabianshawarma@admin'}
            onDeleteReview={handleDeleteReview}
            onFeedback={showFeedback}
            onReviewsChanged={() => setReviews(storageService.getReviews())}
          />
        )}

        {/* 13. WEBSITE CONTENT & SETTINGS */}
        {activeTab === 'content' && (
          <form onSubmit={handleSaveSettings} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white text-base font-display">Storefront Branding & Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300">Restaurant Name</label>
                <input
                  type="text"
                  value={restaurantSettings.name}
                  onChange={(e) => setRestaurantSettings({ ...restaurantSettings, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-300">Tagline</label>
                <input
                  type="text"
                  value={restaurantSettings.tagline}
                  onChange={(e) => setRestaurantSettings({ ...restaurantSettings, tagline: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-neutral-300">Address</label>
              <input
                type="text"
                value={restaurantSettings.address}
                onChange={(e) => setRestaurantSettings({ ...restaurantSettings, address: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300">Phone 1</label>
                <input
                  type="text"
                  value={restaurantSettings.phone1}
                  onChange={(e) => setRestaurantSettings({ ...restaurantSettings, phone1: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-300">Phone 2</label>
                <input
                  type="text"
                  value={restaurantSettings.phone2}
                  onChange={(e) => setRestaurantSettings({ ...restaurantSettings, phone2: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-300">WhatsApp Dispatch</label>
                <input
                  type="text"
                  value={restaurantSettings.whatsapp}
                  onChange={(e) => setRestaurantSettings({ ...restaurantSettings, whatsapp: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-neutral-300">Top Announcement Banner</label>
              <input
                type="text"
                value={restaurantSettings.announcement}
                onChange={(e) => setRestaurantSettings({ ...restaurantSettings, announcement: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="text-right pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl"
              >
                Save Storefront Info
              </button>
            </div>
          </form>
        )}

        {/* 14. BANNERS & HOMEPAGE SECTIONS */}
        {activeTab === 'banners' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="font-bold text-white text-base font-display">Promotional Banners & Sliders</h2>
              <p className="text-xs text-neutral-400">
                Manage top announcement strip and interactive hero carousel slides.
              </p>
            </div>

            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs space-y-2">
              <div className="font-semibold text-white">Active Announcement Strip</div>
              <p className="text-neutral-400">{restaurantSettings.announcement}</p>
              <p className="text-[11px] text-amber-400">Displayed at top navigation strip across all pages.</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-neutral-400">
                Homepage Hero Banners ({banners.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between">
                    <div className="aspect-video relative overflow-hidden bg-neutral-900">
                      <img src={resolveAssetUrl(b.imageUrl)} alt={b.title} className="w-full h-full object-cover" />
                      {b.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-neutral-950">
                          {b.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-white text-xs">{b.title}</div>
                        <div className="text-[11px] text-neutral-400 line-clamp-2">{b.subtitle}</div>
                      </div>
                      <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-xs">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${b.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
                          {b.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteBanner(b)}
                          className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 15. NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white text-base font-display">System Notifications ({notifications.length})</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    storageService.markAllNotificationsRead();
                    setNotifications(storageService.getNotifications());
                    showFeedback('All notifications marked as read.');
                  }}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Mark All Read
                </button>
                <span className="text-neutral-600">·</span>
                <button
                  type="button"
                  onClick={handleClearAllNotifications}
                  className="text-xs text-red-400 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  No notifications currently in inbox.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-4 text-xs ${
                      notif.isRead
                        ? 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-white'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white">{notif.title}</div>
                      <div className="text-neutral-300">{notif.message}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-[10px] text-neutral-500">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteNotification(notif)}
                        className="text-neutral-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-neutral-900 cursor-pointer"
                        title="Delete Notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 16. REPORTS & ANALYTICS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-white text-base font-display">Sales & Financial Reporting</h2>
                  <p className="text-xs text-neutral-400">Verified database order calculations and revenue distribution.</p>
                </div>

                <button
                  onClick={handleExportOrdersCSV}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sales Report (CSV)</span>
                </button>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-xs text-neutral-400">Total Net Revenue</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    Rs. {analytics.totalRevenue.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-xs text-neutral-400">Average Order Value (AOV)</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    Rs. {analytics.totalOrders > 0 ? Math.round(analytics.totalRevenue / analytics.totalOrders).toLocaleString() : 0}
                  </div>
                </div>

                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-xs text-neutral-400">Completed Orders</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {analytics.completedOrders} / {analytics.totalOrders}
                  </div>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="space-y-3">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Payment Channels Distribution
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <div className="text-neutral-400">Cash on Delivery</div>
                    <div className="text-lg font-bold text-white mt-0.5">{analytics.paymentMethods.cod}</div>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <div className="text-neutral-400">Easypaisa</div>
                    <div className="text-lg font-bold text-green-400 mt-0.5">{analytics.paymentMethods.easypaisa}</div>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <div className="text-neutral-400">JazzCash</div>
                    <div className="text-lg font-bold text-red-400 mt-0.5">{analytics.paymentMethods.jazzcash}</div>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <div className="text-neutral-400">Bank Transfer</div>
                    <div className="text-lg font-bold text-blue-400 mt-0.5">{analytics.paymentMethods.bank_transfer}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 17. STAFF & ROLES */}
        {activeTab === 'staff' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white text-base font-display">Staff Roles & Access Control</h2>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Master Administrator</div>
                  <div className="text-neutral-400">Authorized Owner Account · Full Permissions</div>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                  Super Admin
                </span>
              </div>
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Kitchen Dispatch Station</div>
                  <div className="text-neutral-400">Kitchen Operations · Order Updates & KOT Printing</div>
                </div>
                <span className="text-[10px] font-bold text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded">
                  Kitchen Operator
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 18. GENERAL SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <h2 className="font-bold text-white text-base font-display">System & Operating Rules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300">Currency Symbol</label>
                <input
                  type="text"
                  value={restaurantSettings.currencySymbol}
                  onChange={(e) => setRestaurantSettings({ ...restaurantSettings, currencySymbol: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-300">Minimum Order (PKR)</label>
                <input
                  type="number"
                  value={restaurantSettings.minimumOrderAmount}
                  onChange={(e) => setRestaurantSettings({ ...restaurantSettings, minimumOrderAmount: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-300">Free Delivery Threshold (PKR)</label>
                <input
                  type="number"
                  value={restaurantSettings.freeDeliveryThreshold}
                  onChange={(e) => setRestaurantSettings({ ...restaurantSettings, freeDeliveryThreshold: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <h3 className="font-bold text-red-400 text-xs">Factory Reset</h3>
              <p className="text-[11px] text-neutral-400">
                Reset all products, deals, and settings back to the exact initial menu extraction.
              </p>
              <button
                type="button"
                onClick={() => setResetConfirmOpen(true)}
                className="px-3.5 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Reset Database to Factory Menu
              </button>
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl"
              >
                Save General Settings
              </button>
            </div>
          </form>
        )}

        {/* RECYCLE BIN / RECENTLY DELETED */}
        {activeTab === 'recycle_bin' && (
          <RecycleBinTab />
        )}

        {/* SECURITY & CHANGE PASSWORD */}
        {activeTab === 'security' && (
          <SecuritySettingsTab />
        )}

        {/* 19. ADMIN PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 max-w-lg">
            <h2 className="font-bold text-white text-base font-display">Administrator Account Profile</h2>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400">Admin Name</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.name || 'Master Admin'}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-400">Email Address / Admin ID</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.email || 'arabianshawarma@admin'}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-400">Security Clearance</label>
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-amber-400 font-semibold">
                  Root Administrator · Full Database Privileges
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Update Order Status Modal */}
      {selectedOrderForStatus && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateStatusSubmit}
            className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-2xl p-6 space-y-4 text-xs animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-white text-sm font-display">
                Update Status for #{selectedOrderForStatus.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrderForStatus(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-medium">New Status</label>
              <select
                value={newStatusInput}
                onChange={(e) => setNewStatusInput(e.target.value as OrderStatus)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white capitalize focus:outline-none focus:border-amber-500"
              >
                {['order_placed', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-medium">Status Change Note (Optional)</label>
              <input
                type="text"
                value={statusNoteInput}
                onChange={(e) => setStatusNoteInput(e.target.value)}
                placeholder="e.g. Dispatched with rider Tariq / Oven delay 5 mins..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setSelectedOrderForStatus(null)}
                className="px-3.5 py-2 bg-neutral-800 text-neutral-300 rounded-xl hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl hover:bg-amber-400"
              >
                Save & Broadcast Status
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Payment Verification Modal */}
      {verifyingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-2xl p-6 space-y-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-white text-sm font-display">
                Verify Payment: Order #{verifyingOrder.id}
              </h3>
              <button
                type="button"
                onClick={() => setVerifyingOrder(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-400">Method:</span>
                <span className="uppercase text-white font-bold">{verifyingOrder.payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Payable Amount:</span>
                <span className="text-amber-400 font-bold">Rs. {verifyingOrder.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Submitted TID:</span>
                <span className="text-white font-bold">{verifyingOrder.payment.transactionId || 'None'}</span>
              </div>
            </div>

            {verifyingOrder.payment.screenshotUrl && (
              <div className="space-y-1">
                <label className="text-neutral-400">Uploaded Screenshot:</label>
                <div className="max-h-56 overflow-auto rounded-lg border border-neutral-800">
                  <img
                    src={verifyingOrder.payment.screenshotUrl}
                    alt="Payment Screenshot"
                    className="w-full object-contain"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-neutral-300 font-medium">Verification / Rejection Note</label>
              <input
                type="text"
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                placeholder="e.g. TID verified against bank account statement / Invalid TID"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleVerifyPayment(false)}
                className="px-4 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl font-bold"
              >
                Reject Payment
              </button>
              <button
                type="button"
                onClick={() => handleVerifyPayment(true)}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-xl font-bold"
              >
                Confirm & Verify Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Product Create / Edit Modal */}
      {productModalMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProduct}
            className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-2xl p-6 space-y-4 text-xs animate-fadeIn max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-white text-sm font-display">
                {productModalMode === 'create' ? 'Add Food Product' : 'Edit Product'}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalMode(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300">Product Name *</label>
              <input
                type="text"
                required
                value={editingProduct.name || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-300">Category *</label>
                <select
                  value={editingProduct.category || 'Pizza'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300">Base Price (PKR) *</label>
                <input
                  type="number"
                  required
                  value={editingProduct.basePrice || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300">Description</label>
              <textarea
                rows={2}
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            {/* Image Preview & Management */}
            <div className="space-y-2 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <label className="text-neutral-300 font-medium block">Product Photograph *</label>

              {editingProduct.image && (
                <div className="relative w-full h-36 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 group">
                  <img
                    src={resolveAssetUrl(editingProduct.image)}
                    alt={editingProduct.name || 'Preview'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-bold"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <label className="flex-1 px-3 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700/80 rounded-xl text-[11px] text-neutral-300 font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload from Computer</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>

                {editingProduct.image && (
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                    className="px-3 py-2 bg-neutral-900 hover:bg-red-950 border border-neutral-800 text-neutral-400 hover:text-red-300 rounded-xl text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-neutral-500 block">Or enter external / CDN image URL:</span>
                <input
                  type="text"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  placeholder="/assets/images/... or https://..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProduct.isAvailable !== false}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                <span>Available</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingProduct.isFeatured)}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                <span>Featured</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingProduct.isBestSeller)}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                <span>Best Seller</span>
              </label>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setProductModalMode(null)}
                className="px-3.5 py-2 bg-neutral-800 text-neutral-300 rounded-xl hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl hover:bg-amber-400"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: Category Modal */}
      {categoryModalMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCategory}
            className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-2xl p-6 space-y-4 text-xs animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-white text-sm font-display">
                {categoryModalMode === 'create' ? 'Add Category' : 'Edit Category'}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModalMode(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300">Category Name *</label>
              <input
                type="text"
                required
                value={editingCategory.name || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300">Display Order</label>
              <input
                type="number"
                value={editingCategory.order || 1}
                onChange={(e) => setEditingCategory({ ...editingCategory, order: Number(e.target.value) })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300">Description</label>
              <input
                type="text"
                value={editingCategory.description || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCategoryModalMode(null)}
                className="px-3.5 py-2 bg-neutral-800 text-neutral-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 6: Customer Note Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-2xl p-6 space-y-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-white text-sm font-display">
                Internal CRM Note: {selectedCustomer.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-medium">Customer Notes & Preferences</label>
              <textarea
                rows={3}
                value={customerNoteText}
                onChange={(e) => setCustomerNoteText(e.target.value)}
                placeholder="e.g. Prefers extra sauce, VIP guest, allergic to cucumbers..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-3.5 py-2 bg-neutral-800 text-neutral-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  storageService.saveCustomer({
                    ...selectedCustomer,
                    internalNotes: customerNoteText.trim()
                  });
                  setSelectedCustomer(null);
                }}
                className="px-5 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl"
              >
                Save CRM Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Order Invoice & KOT Printing */}
      {selectedOrderForInvoice && (
        <OrderInvoiceModal
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}

      {/* MODAL 8: Delivery Area Create / Edit Modal */}
      {zoneModalMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDeliveryZone}
            className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-2xl p-6 space-y-4 text-xs animate-fadeIn max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-white text-sm font-display flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>
                  {zoneModalMode === 'create' ? 'Add Delivery Area' : 'Edit Delivery Area'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setZoneModalMode(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Area / Locality Name *</label>
                <input
                  type="text"
                  required
                  value={editingZone.name || ''}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  placeholder="e.g. Model Town"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">City</label>
                <input
                  type="text"
                  value={editingZone.city || ''}
                  onChange={(e) => setEditingZone({ ...editingZone, city: e.target.value })}
                  placeholder="Lahore"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Delivery Fee (PKR) *</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={editingZone.fee ?? 150}
                  onChange={(e) => setEditingZone({ ...editingZone, fee: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Min Order (PKR) *</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={editingZone.minOrder ?? 400}
                  onChange={(e) => setEditingZone({ ...editingZone, minOrder: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Estimated Time *</label>
                <input
                  type="text"
                  required
                  value={editingZone.estimatedMinutes || ''}
                  onChange={(e) =>
                    setEditingZone({ ...editingZone, estimatedMinutes: e.target.value })
                  }
                  placeholder="30-40 mins"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-medium">Area Instructions (Optional)</label>
              <textarea
                rows={2}
                value={editingZone.instructions || ''}
                onChange={(e) => setEditingZone({ ...editingZone, instructions: e.target.value })}
                placeholder="e.g. Gate pass notice, rider instructions..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={editingZone.latitude ?? ''}
                  onChange={(e) =>
                    setEditingZone({
                      ...editingZone,
                      latitude: e.target.value === '' ? undefined : Number(e.target.value)
                    })
                  }
                  placeholder="31.4882"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  value={editingZone.longitude ?? ''}
                  onChange={(e) =>
                    setEditingZone({
                      ...editingZone,
                      longitude: e.target.value === '' ? undefined : Number(e.target.value)
                    })
                  }
                  placeholder="74.3652"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Area Radius KM (Optional)</label>
                <input
                  type="number"
                  step="0.5"
                  min={0.5}
                  value={editingZone.radiusKm ?? ''}
                  onChange={(e) =>
                    setEditingZone({
                      ...editingZone,
                      radiusKm: e.target.value === '' ? undefined : Number(e.target.value)
                    })
                  }
                  placeholder="10"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-neutral-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={editingZone.isActive !== false}
                onChange={(e) => setEditingZone({ ...editingZone, isActive: e.target.checked })}
                className="accent-amber-500"
              />
              <span>Active (visible to customers in delivery popup and checkout)</span>
            </label>

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setZoneModalMode(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl cursor-pointer"
              >
                {zoneModalMode === 'create' ? 'Create Delivery Area' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 9: In-UI Factory Reset Confirmation */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-500/40 max-w-md w-full rounded-2xl p-6 space-y-4 text-xs shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-display">
                  Reset Database to Factory Menu?
                </h3>
                <p className="text-[11px] text-red-300">
                  All custom products, zones, and settings will revert to initial defaults.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  storageService.resetToFactoryData();
                  setResetConfirmOpen(false);
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Confirm Factory Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory First-Login Password Change Modal */}
      {mustChangePassword && (
        <MandatoryPasswordChangeModal
          onSuccess={() => {
            setActiveTab('overview');
          }}
        />
      )}

      {/* Floating 10-Second Undo Notification */}
      {undoToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-amber-500/80 shadow-2xl rounded-2xl p-4 flex items-center gap-4 text-xs animate-slideUp">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4 animate-spin-reverse" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{undoToast.type.toUpperCase()} deleted successfully.</span>
                <span className="font-mono text-amber-400 font-bold">({undoToast.countdown}s)</span>
              </div>
              <div className="text-[11px] text-neutral-400 line-clamp-1 max-w-[220px]">
                "{undoToast.name}"
              </div>
            </div>
          </div>
          <button
            onClick={handleUndoDelete}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold rounded-xl cursor-pointer shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            UNDO
          </button>
        </div>
      )}

      {/* Unified In-UI Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-500/40 max-w-md w-full rounded-2xl p-6 space-y-4 text-xs shadow-2xl animate-fadeIn text-neutral-100">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-display">
                  Confirm Deletion: {deleteTarget.typeName}
                </h3>
                <p className="text-[11px] text-red-300">
                  Please review the item details before proceeding.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                Target Record
              </div>
              <div className="font-bold text-white text-sm">
                {deleteTarget.name}
              </div>
              <div className="text-[11px] text-neutral-400">
                ID / Code: <span className="font-mono text-neutral-300">{deleteTarget.id}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
              <span>
                {deleteTarget.isSoftDelete ? (
                  <>
                    <strong>Safety & Recovery:</strong> This record will be removed from active public store listings and stored in the <strong>Recycle Bin</strong>. You will have a 10-second window to Undo immediately, or you can recover it anytime from the Recycle Bin tab.
                  </>
                ) : (
                  <>
                    <strong>Order History Protected:</strong> Removing this record will not affect existing customer orders, previous invoices, or kitchen receipts.
                  </>
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = deleteTarget.onConfirm;
                  setDeleteTarget(null);
                  action();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-blocking feedback toast */}
      {feedbackToast && (
        <div className="fixed top-6 right-6 z-50 bg-neutral-900 border border-emerald-500/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn text-xs">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-neutral-200">{feedbackToast.message}</span>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="p-1 text-neutral-400 hover:text-white rounded ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
