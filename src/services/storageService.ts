import {
  Product,
  Category,
  Deal,
  Order,
  CustomerProfile,
  Coupon,
  PaymentMethodSettings,
  RestaurantSettings,
  DeliveryZone,
  Review,
  NotificationItem,
  BannerItem,
  AuditLogItem,
  RecycleBinItem,
  OrderStatus,
  PaymentStatus,
  VerifiedLocationState
} from '../types';
import {
  syncDeliveryZoneToFirestore,
  deleteDeliveryZoneFromFirestore,
  syncRestaurantSettingsToFirestore
} from './deliveryFirestoreService';

import {
  initialProducts,
  initialCategories,
  initialDeals,
  initialOrders,
  initialCustomers,
  initialCoupons,
  initialPaymentSettings,
  initialRestaurantSettings,
  initialDeliveryZones,
  initialReviews
} from '../data/initialData';

export const initialBanners: BannerItem[] = [
  {
    id: 'banner-1',
    title: 'Midnight Cravings Satisfied',
    subtitle: 'Hot Stone-Baked Pizzas & Juicy Shawarmas Open Daily till 3:00 AM',
    badge: 'Late Night Delivery',
    imageUrl: '/src/assets/images/artisan_tikka_pizza_1794391294077.jpg',
    linkUrl: '#/menu',
    isActive: true,
    order: 1,
    isDeleted: false
  },
  {
    id: 'banner-2',
    title: '29 Mega Value Deals & Combos',
    subtitle: 'Exclusive student, couple, and giant family feast bundles starting at Rs. 700',
    badge: 'Save up to 35%',
    imageUrl: '/src/assets/images/family_combo_feast_1794391295864.jpg',
    linkUrl: '#/deals',
    isActive: true,
    order: 2,
    isDeleted: false
  },
  {
    id: 'banner-3',
    title: 'Free Express Delivery in Walton Cantt',
    subtitle: 'Order above Rs. 2,500 and enjoy free doorstep delivery in Lahore',
    badge: 'Cavalry Ground',
    imageUrl: '/src/assets/images/hero_3d_burger_1794391292664.jpg',
    linkUrl: '#/menu',
    isActive: true,
    order: 3,
    isDeleted: false
  }
];

const STORAGE_KEYS = {
  PRODUCTS: 'asp_products_v1',
  CATEGORIES: 'asp_categories_v1',
  DEALS: 'asp_deals_v1',
  ORDERS: 'asp_orders_v1',
  CUSTOMERS: 'asp_customers_v1',
  COUPONS: 'asp_coupons_v1',
  PAYMENTS: 'asp_payments_v1',
  SETTINGS: 'asp_settings_v1',
  ZONES: 'asp_zones_v1',
  REVIEWS: 'asp_reviews_v1',
  NOTIFICATIONS: 'asp_notifications_v1',
  CURRENT_USER: 'asp_current_user_v1',
  ADMIN_SESSION: 'asp_admin_session_v1',
  BANNERS: 'asp_banners_v1',
  AUDIT_LOGS: 'asp_audit_logs_v1'
};

// Broadcast channel for real-time reactivity
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('asp_data_channel');
  }
} catch {
  // Ignore in restricted environments
}

function notifyDataChange(entity: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('asp_data_updated', { detail: { entity } }));
    broadcastChannel?.postMessage({ type: 'DATA_UPDATED', entity });
  }
}

// In-memory cache fallback for SSR and test execution
const inMemoryCache: Record<string, string> = {};

// Helper to get with fallback
function getStored<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
  }
  if (inMemoryCache[key]) {
    try {
      return JSON.parse(inMemoryCache[key]);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

function setStored<T>(key: string, value: T, entity: string): void {
  const json = JSON.stringify(value);
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, json);
      notifyDataChange(entity);
    }
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
  inMemoryCache[key] = json;
}

// Storage API
export const storageService = {
  // PRODUCTS
  getProducts(includeDeleted = false): Product[] {
    const all = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    return includeDeleted ? all : all.filter((p) => !p.isDeleted);
  },

  getAllProductsRaw(): Product[] {
    return getStored<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  },

  getProductById(id: string): Product | undefined {
    return this.getProducts(true).find((p) => p.id === id);
  },

  saveProduct(product: Product): Product {
    const products = this.getAllProductsRaw();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = { ...products[index], ...product };
    } else {
      products.unshift({
        ...product,
        isDeleted: false
      });
    }
    setStored(STORAGE_KEYS.PRODUCTS, products, 'products');
    this.addAuditLog(
      index >= 0 ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT',
      'product',
      product.id,
      `Product "${product.name}" (${product.category}) saved.`
    );
    return product;
  },

  // Soft delete product with snapshot
  softDeleteProduct(id: string, deletedBy = 'arabianshawarma@admin'): Product | null {
    const products = this.getAllProductsRaw();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const prod = products[index];
    prod.isDeleted = true;
    prod.deletedAt = new Date().toISOString();
    prod.deletedBy = deletedBy;
    prod.deletionSnapshot = { ...prod };

    setStored(STORAGE_KEYS.PRODUCTS, products, 'products');
    this.addAuditLog(
      'SOFT_DELETE_PRODUCT',
      'product',
      id,
      `Soft deleted product "${prod.name}". Moved to Recycle Bin.`,
      deletedBy
    );
    return prod;
  },

  // Undo / Restore product
  restoreProduct(id: string): Product | null {
    const products = this.getAllProductsRaw();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const prod = products[index];
    prod.isDeleted = false;
    prod.deletedAt = undefined;
    prod.deletedBy = undefined;

    setStored(STORAGE_KEYS.PRODUCTS, products, 'products');
    this.addAuditLog(
      'RESTORE_PRODUCT',
      'product',
      id,
      `Restored product "${prod.name}" from Recycle Bin back to active listings.`
    );
    return prod;
  },

  // Permanent Delete product
  permanentlyDeleteProduct(id: string): boolean {
    const products = this.getAllProductsRaw();
    const target = products.find((p) => p.id === id);
    const filtered = products.filter((p) => p.id !== id);
    setStored(STORAGE_KEYS.PRODUCTS, filtered, 'products');
    this.addAuditLog(
      'PERMANENT_DELETE_PRODUCT',
      'product',
      id,
      `Permanently purged product "${target?.name || id}". Note: historical order snapshots remain intact.`
    );
    return true;
  },

  // Backward-compatible deleteProduct (triggers soft delete)
  deleteProduct(id: string): boolean {
    return Boolean(this.softDeleteProduct(id));
  },

  toggleProductAvailability(id: string): boolean {
    const products = this.getAllProductsRaw();
    const prod = products.find((p) => p.id === id);
    if (prod) {
      prod.isAvailable = !prod.isAvailable;
      setStored(STORAGE_KEYS.PRODUCTS, products, 'products');
      this.addAuditLog(
        'TOGGLE_AVAILABILITY',
        'product',
        id,
        `Toggled availability for "${prod.name}" to ${prod.isAvailable ? 'Available' : 'Unavailable'}`
      );
      return true;
    }
    return false;
  },

  // CATEGORIES
  getCategories(includeDeleted = false): Category[] {
    const all = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const filtered = includeDeleted ? all : all.filter((c) => !c.isDeleted);
    return filtered.sort((a, b) => a.order - b.order);
  },

  getAllCategoriesRaw(): Category[] {
    return getStored<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  },

  saveCategory(category: Category): Category {
    const categories = this.getAllCategoriesRaw();
    const index = categories.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      categories[index] = { ...categories[index], ...category };
    } else {
      categories.push({ ...category, isDeleted: false });
    }
    setStored(STORAGE_KEYS.CATEGORIES, categories, 'categories');
    this.addAuditLog(
      index >= 0 ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY',
      'category',
      category.id,
      `Category "${category.name}" saved.`
    );
    return category;
  },

  softDeleteCategory(id: string, deletedBy = 'arabianshawarma@admin'): Category | null {
    const categories = this.getAllCategoriesRaw();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const cat = categories[index];
    cat.isDeleted = true;
    cat.deletedAt = new Date().toISOString();
    cat.deletedBy = deletedBy;

    setStored(STORAGE_KEYS.CATEGORIES, categories, 'categories');
    this.addAuditLog(
      'SOFT_DELETE_CATEGORY',
      'category',
      id,
      `Soft deleted category "${cat.name}". Moved to Recycle Bin.`,
      deletedBy
    );
    return cat;
  },

  restoreCategory(id: string): Category | null {
    const categories = this.getAllCategoriesRaw();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const cat = categories[index];
    cat.isDeleted = false;
    cat.deletedAt = undefined;
    cat.deletedBy = undefined;

    setStored(STORAGE_KEYS.CATEGORIES, categories, 'categories');
    this.addAuditLog(
      'RESTORE_CATEGORY',
      'category',
      id,
      `Restored category "${cat.name}" from Recycle Bin.`
    );
    return cat;
  },

  permanentlyDeleteCategory(id: string): boolean {
    const categories = this.getAllCategoriesRaw();
    const target = categories.find((c) => c.id === id);
    const filtered = categories.filter((c) => c.id !== id);
    setStored(STORAGE_KEYS.CATEGORIES, filtered, 'categories');
    this.addAuditLog(
      'PERMANENT_DELETE_CATEGORY',
      'category',
      id,
      `Permanently deleted category "${target?.name || id}".`
    );
    return true;
  },

  deleteCategory(id: string): boolean {
    return Boolean(this.softDeleteCategory(id));
  },

  // DEALS
  getDeals(includeDeleted = false): Deal[] {
    const all = getStored<Deal[]>(STORAGE_KEYS.DEALS, initialDeals);
    return includeDeleted ? all : all.filter((d) => !d.isDeleted);
  },

  getAllDealsRaw(): Deal[] {
    return getStored<Deal[]>(STORAGE_KEYS.DEALS, initialDeals);
  },

  getDealById(id: string): Deal | undefined {
    return this.getDeals(true).find((d) => d.id === id);
  },

  saveDeal(deal: Deal): Deal {
    const deals = this.getAllDealsRaw();
    const index = deals.findIndex((d) => d.id === deal.id);
    if (index >= 0) {
      deals[index] = { ...deals[index], ...deal };
    } else {
      deals.unshift({ ...deal, isDeleted: false });
    }
    setStored(STORAGE_KEYS.DEALS, deals, 'deals');
    this.addAuditLog(
      index >= 0 ? 'UPDATE_DEAL' : 'CREATE_DEAL',
      'deal',
      deal.id,
      `Deal "${deal.dealNumber}: ${deal.title}" saved.`
    );
    return deal;
  },

  softDeleteDeal(id: string, deletedBy = 'arabianshawarma@admin'): Deal | null {
    const deals = this.getAllDealsRaw();
    const index = deals.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const deal = deals[index];
    deal.isDeleted = true;
    deal.deletedAt = new Date().toISOString();
    deal.deletedBy = deletedBy;

    setStored(STORAGE_KEYS.DEALS, deals, 'deals');
    this.addAuditLog(
      'SOFT_DELETE_DEAL',
      'deal',
      id,
      `Soft deleted deal "${deal.dealNumber}: ${deal.title}". Moved to Recycle Bin.`,
      deletedBy
    );
    return deal;
  },

  restoreDeal(id: string): Deal | null {
    const deals = this.getAllDealsRaw();
    const index = deals.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const deal = deals[index];
    deal.isDeleted = false;
    deal.deletedAt = undefined;
    deal.deletedBy = undefined;

    setStored(STORAGE_KEYS.DEALS, deals, 'deals');
    this.addAuditLog(
      'RESTORE_DEAL',
      'deal',
      id,
      `Restored deal "${deal.dealNumber}: ${deal.title}" from Recycle Bin.`
    );
    return deal;
  },

  permanentlyDeleteDeal(id: string): boolean {
    const deals = this.getAllDealsRaw();
    const target = deals.find((d) => d.id === id);
    const filtered = deals.filter((d) => d.id !== id);
    setStored(STORAGE_KEYS.DEALS, filtered, 'deals');
    this.addAuditLog(
      'PERMANENT_DELETE_DEAL',
      'deal',
      id,
      `Permanently purged deal "${target?.dealNumber || id}".`
    );
    return true;
  },

  deleteDeal(id: string): boolean {
    return Boolean(this.softDeleteDeal(id));
  },

  // BANNERS
  getBanners(includeDeleted = false): BannerItem[] {
    const all = getStored<BannerItem[]>(STORAGE_KEYS.BANNERS, initialBanners);
    const filtered = includeDeleted ? all : all.filter((b) => !b.isDeleted);
    return filtered.sort((a, b) => a.order - b.order);
  },

  getAllBannersRaw(): BannerItem[] {
    return getStored<BannerItem[]>(STORAGE_KEYS.BANNERS, initialBanners);
  },

  saveBanner(banner: BannerItem): BannerItem {
    const banners = this.getAllBannersRaw();
    const index = banners.findIndex((b) => b.id === banner.id);
    if (index >= 0) {
      banners[index] = { ...banners[index], ...banner };
    } else {
      banners.push({ ...banner, isDeleted: false });
    }
    setStored(STORAGE_KEYS.BANNERS, banners, 'banners');
    this.addAuditLog(
      index >= 0 ? 'UPDATE_BANNER' : 'CREATE_BANNER',
      'banner',
      banner.id,
      `Promotional banner "${banner.title}" saved.`
    );
    return banner;
  },

  softDeleteBanner(id: string, deletedBy = 'arabianshawarma@admin'): BannerItem | null {
    const banners = this.getAllBannersRaw();
    const index = banners.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const banner = banners[index];
    banner.isDeleted = true;
    banner.deletedAt = new Date().toISOString();
    banner.deletedBy = deletedBy;

    setStored(STORAGE_KEYS.BANNERS, banners, 'banners');
    this.addAuditLog(
      'SOFT_DELETE_BANNER',
      'banner',
      id,
      `Soft deleted banner "${banner.title}". Moved to Recycle Bin.`,
      deletedBy
    );
    return banner;
  },

  restoreBanner(id: string): BannerItem | null {
    const banners = this.getAllBannersRaw();
    const index = banners.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const banner = banners[index];
    banner.isDeleted = false;
    banner.deletedAt = undefined;
    banner.deletedBy = undefined;

    setStored(STORAGE_KEYS.BANNERS, banners, 'banners');
    this.addAuditLog(
      'RESTORE_BANNER',
      'banner',
      id,
      `Restored promotional banner "${banner.title}" from Recycle Bin.`
    );
    return banner;
  },

  permanentlyDeleteBanner(id: string): boolean {
    const banners = this.getAllBannersRaw();
    const target = banners.find((b) => b.id === id);
    const filtered = banners.filter((b) => b.id !== id);
    setStored(STORAGE_KEYS.BANNERS, filtered, 'banners');
    this.addAuditLog(
      'PERMANENT_DELETE_BANNER',
      'banner',
      id,
      `Permanently deleted banner "${target?.title || id}".`
    );
    return true;
  },

  // COUPONS
  getCoupons(includeDeleted = false): Coupon[] {
    const all = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
    return includeDeleted ? all : all.filter((c) => !c.isDeleted);
  },

  getAllCouponsRaw(): Coupon[] {
    return getStored<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
  },

  saveCoupon(coupon: Coupon): Coupon {
    const coupons = this.getAllCouponsRaw();
    const index = coupons.findIndex((c) => c.code.toUpperCase() === coupon.code.toUpperCase());
    if (index >= 0) {
      coupons[index] = { ...coupons[index], ...coupon };
    } else {
      coupons.push({ ...coupon, isDeleted: false });
    }
    setStored(STORAGE_KEYS.COUPONS, coupons, 'coupons');
    this.addAuditLog(
      index >= 0 ? 'UPDATE_COUPON' : 'CREATE_COUPON',
      'coupon',
      coupon.code,
      `Coupon code "${coupon.code}" (${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : ' PKR'} off) saved.`
    );
    return coupon;
  },

  softDeleteCoupon(code: string, deletedBy = 'arabianshawarma@admin'): Coupon | null {
    const coupons = this.getAllCouponsRaw();
    const index = coupons.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
    if (index === -1) return null;

    const coupon = coupons[index];
    coupon.isDeleted = true;
    coupon.deletedAt = new Date().toISOString();
    coupon.deletedBy = deletedBy;

    setStored(STORAGE_KEYS.COUPONS, coupons, 'coupons');
    this.addAuditLog(
      'SOFT_DELETE_COUPON',
      'coupon',
      code,
      `Soft deleted coupon "${code}". Moved to Recycle Bin.`,
      deletedBy
    );
    return coupon;
  },

  restoreCoupon(code: string): Coupon | null {
    const coupons = this.getAllCouponsRaw();
    const index = coupons.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
    if (index === -1) return null;

    const coupon = coupons[index];
    coupon.isDeleted = false;
    coupon.deletedAt = undefined;
    coupon.deletedBy = undefined;

    setStored(STORAGE_KEYS.COUPONS, coupons, 'coupons');
    this.addAuditLog(
      'RESTORE_COUPON',
      'coupon',
      code,
      `Restored coupon "${code}" from Recycle Bin.`
    );
    return coupon;
  },

  permanentlyDeleteCoupon(code: string): boolean {
    const coupons = this.getAllCouponsRaw();
    const filtered = coupons.filter((c) => c.code.toUpperCase() !== code.toUpperCase());
    setStored(STORAGE_KEYS.COUPONS, filtered, 'coupons');
    this.addAuditLog(
      'PERMANENT_DELETE_COUPON',
      'coupon',
      code,
      `Permanently deleted coupon "${code}".`
    );
    return true;
  },

  deleteCoupon(code: string): boolean {
    return Boolean(this.softDeleteCoupon(code));
  },

  validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string } {
    const coupon = this.getCoupons().find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }
    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of Rs. ${coupon.minOrderValue.toLocaleString()} required for this coupon.`
      };
    }
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }
    return {
      valid: true,
      discount: Math.min(discount, subtotal),
      message: `Promo code "${coupon.code}" applied! You saved Rs. ${discount.toLocaleString()}.`
    };
  },

  // UNIFIED RECYCLE BIN / TRASH SYSTEM
  getRecycleBinItems(): RecycleBinItem[] {
    const items: RecycleBinItem[] = [];

    // Deleted products
    this.getAllProductsRaw()
      .filter((p) => p.isDeleted)
      .forEach((p) => {
        items.push({
          id: p.id,
          recordType: 'product',
          name: p.name,
          category: p.category,
          price: p.basePrice,
          imageUrl: p.image,
          deletedAt: p.deletedAt || new Date().toISOString(),
          deletedBy: p.deletedBy || 'Admin',
          originalData: p
        });
      });

    // Deleted categories
    this.getAllCategoriesRaw()
      .filter((c) => c.isDeleted)
      .forEach((c) => {
        items.push({
          id: c.id,
          recordType: 'category',
          name: c.name,
          imageUrl: c.image,
          deletedAt: c.deletedAt || new Date().toISOString(),
          deletedBy: c.deletedBy || 'Admin',
          originalData: c
        });
      });

    // Deleted deals
    this.getAllDealsRaw()
      .filter((d) => d.isDeleted)
      .forEach((d) => {
        items.push({
          id: d.id,
          recordType: 'deal',
          name: `${d.dealNumber}: ${d.title}`,
          category: 'Regular Deals',
          price: d.price,
          imageUrl: d.image,
          deletedAt: d.deletedAt || new Date().toISOString(),
          deletedBy: d.deletedBy || 'Admin',
          originalData: d
        });
      });

    // Deleted banners
    this.getAllBannersRaw()
      .filter((b) => b.isDeleted)
      .forEach((b) => {
        items.push({
          id: b.id,
          recordType: 'banner',
          name: b.title,
          imageUrl: b.imageUrl,
          deletedAt: b.deletedAt || new Date().toISOString(),
          deletedBy: b.deletedBy || 'Admin',
          originalData: b
        });
      });

    // Deleted coupons
    this.getAllCouponsRaw()
      .filter((c) => c.isDeleted)
      .forEach((c) => {
        items.push({
          id: c.code,
          recordType: 'coupon',
          name: `Coupon ${c.code} (${c.discountValue}${c.discountType === 'percentage' ? '%' : ' PKR'} off)`,
          deletedAt: c.deletedAt || new Date().toISOString(),
          deletedBy: c.deletedBy || 'Admin',
          originalData: c
        });
      });

    // Deleted delivery zones
    this.getAllDeliveryZonesRaw()
      .filter((z) => z.isDeleted)
      .forEach((z) => {
        items.push({
          id: z.id,
          recordType: 'zone',
          name: `${z.name}${z.city ? ` (${z.city})` : ''}`,
          category: 'Delivery Area',
          price: z.fee,
          deletedAt: z.deletedAt || new Date().toISOString(),
          deletedBy: z.deletedBy || 'Admin',
          originalData: z
        });
      });

    // Sort by deletedAt descending (most recently deleted first)
    return items.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  },

  restoreRecycleBinItem(recordType: string, id: string): boolean {
    switch (recordType) {
      case 'product':
        return Boolean(this.restoreProduct(id));
      case 'category':
        return Boolean(this.restoreCategory(id));
      case 'deal':
        return Boolean(this.restoreDeal(id));
      case 'banner':
        return Boolean(this.restoreBanner(id));
      case 'coupon':
        return Boolean(this.restoreCoupon(id));
      case 'zone':
        return Boolean(this.restoreDeliveryZone(id));
      default:
        return false;
    }
  },

  permanentlyDeleteRecycleBinItem(recordType: string, id: string): boolean {
    switch (recordType) {
      case 'product':
        return this.permanentlyDeleteProduct(id);
      case 'category':
        return this.permanentlyDeleteCategory(id);
      case 'deal':
        return this.permanentlyDeleteDeal(id);
      case 'banner':
        return this.permanentlyDeleteBanner(id);
      case 'coupon':
        return this.permanentlyDeleteCoupon(id);
      case 'zone':
        return this.permanentlyDeleteDeliveryZone(id);
      default:
        return false;
    }
  },

  emptyRecycleBin(): void {
    const items = this.getRecycleBinItems();
    items.forEach((item) => {
      this.permanentlyDeleteRecycleBinItem(item.recordType, item.id);
    });
    this.addAuditLog(
      'EMPTY_RECYCLE_BIN',
      'settings',
      'recycle-bin',
      `Purged all ${items.length} items from Recycle Bin.`
    );
  },

  // AUDIT LOGS
  getAuditLogs(): AuditLogItem[] {
    return getStored<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'log-init',
        action: 'SYSTEM_BOOT',
        entityType: 'settings',
        details: 'Arabian Shawarma & Pizza secure CRM audit log initialized.',
        performedBy: 'System',
        timestamp: new Date().toISOString()
      }
    ]);
  },

  addAuditLog(
    action: string,
    entityType: AuditLogItem['entityType'],
    entityId?: string,
    details = '',
    performedBy = 'arabianshawarma@admin'
  ): AuditLogItem {
    const logs = this.getAuditLogs();
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action,
      entityType,
      entityId,
      details,
      performedBy,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep last 250 audit logs
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 250), 'audit_logs');
    return newLog;
  },

  clearAuditLogs(): void {
    setStored(STORAGE_KEYS.AUDIT_LOGS, [], 'audit_logs');
  },

  // IMAGE UPLOADER (converts file to base64 data URL)
  uploadImageFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Selected file must be an image format (JPEG, PNG, WebP).'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image size must be under 5MB for optimized loading.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file.'));
      };
      reader.readAsDataURL(file);
    });
  },

  // ORDERS
  getOrders(): Order[] {
    return getStored<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
  },

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id.toLowerCase() === id.toLowerCase().trim());
  },

  validateDeliveryEligibility(
    orderType: 'delivery' | 'pickup',
    subtotal: number,
    areaName: string,
    selectedZoneId?: string,
    verifiedLocation?: VerifiedLocationState | null
  ): {
    valid: boolean;
    error?: string;
    matchedZone?: DeliveryZone;
    authoritativeFee: number;
    effectiveMinOrder: number;
  } {
    const settings = this.getRestaurantSettings();

    if (orderType === 'pickup') {
      if (!settings.pickupAvailable) {
        return {
          valid: false,
          error: 'Counter pickup is currently unavailable.',
          authoritativeFee: 0,
          effectiveMinOrder: 0
        };
      }
      return {
        valid: true,
        authoritativeFee: 0,
        effectiveMinOrder: 0
      };
    }

    if (!settings.deliveryAvailable) {
      return {
        valid: false,
        error: 'Home delivery is currently paused. You may switch to Counter Pickup.',
        authoritativeFee: 0,
        effectiveMinOrder: settings.minimumOrderAmount || 0
      };
    }

    const activeZones = this.getActiveDeliveryZones();
    const normalizedArea = areaName.trim().toLowerCase();

    const matchedZone =
      (selectedZoneId ? activeZones.find((z) => z.id === selectedZoneId) : undefined) ||
      activeZones.find((z) => z.name.trim().toLowerCase() === normalizedArea);

    const isVerifiedGpsWithinRadius = Boolean(
      verifiedLocation &&
        verifiedLocation.confirmed &&
        verifiedLocation.method === 'gps' &&
        verifiedLocation.insideRadius === true
    );

    if (!matchedZone && !isVerifiedGpsWithinRadius) {
      return {
        valid: false,
        error:
          activeZones.length > 0
            ? 'Please select an active delivery area or verify that your location is within our delivery radius before placing a delivery order.'
            : `Please verify your location is within our ${settings.deliveryRadiusKm ?? 10} KM delivery radius before placing a delivery order.`,
        authoritativeFee: settings.defaultDeliveryFee,
        effectiveMinOrder: settings.minimumOrderAmount || 0
      };
    }

    const effectiveMinOrder = Math.max(
      settings.minimumOrderAmount || 0,
      matchedZone?.minOrder || 0
    );

    if (subtotal < effectiveMinOrder) {
      return {
        valid: false,
        error: `Minimum order for ${matchedZone?.name || 'delivery'} is Rs. ${effectiveMinOrder.toLocaleString()}. Please add Rs. ${(effectiveMinOrder - subtotal).toLocaleString()} more to proceed.`,
        matchedZone,
        authoritativeFee: matchedZone?.fee ?? settings.defaultDeliveryFee,
        effectiveMinOrder
      };
    }

    const baseFee = matchedZone?.fee ?? settings.defaultDeliveryFee;
    const authoritativeFee =
      settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold
        ? 0
        : baseFee;

    return {
      valid: true,
      matchedZone,
      authoritativeFee,
      effectiveMinOrder
    };
  },

  createOrder(
    orderData: Omit<Order, 'id' | 'createdAt' | 'statusHistory'>,
    options?: { selectedZoneId?: string; verifiedLocation?: VerifiedLocationState | null }
  ): Order {
    const settings = this.getRestaurantSettings();
    const computedSubtotal = orderData.items.reduce(
      (sum, item) => sum + Math.max(0, Number(item.price) || 0) * Math.max(1, Number(item.quantity) || 1),
      0
    );

    const deliveryCheck = this.validateDeliveryEligibility(
      orderData.orderType,
      computedSubtotal,
      orderData.customer.area,
      options?.selectedZoneId || options?.verifiedLocation?.selectedZoneId,
      options?.verifiedLocation
    );

    if (!deliveryCheck.valid) {
      throw new Error(deliveryCheck.error || 'Delivery eligibility check failed.');
    }

    let authoritativeDiscount = 0;
    if (orderData.couponCode) {
      const couponRes = this.validateCoupon(orderData.couponCode, computedSubtotal);
      if (couponRes.valid) {
        authoritativeDiscount = couponRes.discount;
      }
    }

    const authoritativeTax =
      settings.taxPercentage > 0
        ? Math.round((computedSubtotal * settings.taxPercentage) / 100)
        : 0;
    const authoritativeTotal = Math.max(
      0,
      computedSubtotal - authoritativeDiscount + deliveryCheck.authoritativeFee + authoritativeTax
    );

    const orders = this.getOrders();
    const newId = `ASP-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      customer: {
        ...orderData.customer,
        area: deliveryCheck.matchedZone?.name || orderData.customer.area
      },
      subtotal: computedSubtotal,
      discount: authoritativeDiscount,
      deliveryFee: deliveryCheck.authoritativeFee,
      tax: authoritativeTax,
      total: authoritativeTotal,
      id: newId,
      createdAt: now,
      statusHistory: [
        {
          status: orderData.status,
          timestamp: now,
          note: 'Order successfully placed by customer'
        }
      ]
    };

    orders.unshift(newOrder);
    setStored(STORAGE_KEYS.ORDERS, orders, 'orders');

    // Update customer CRM profile
    this.updateCustomerAfterOrder(newOrder);

    // Create system notification
    this.addNotification({
      type: 'new_order',
      title: `New Order: ${newOrder.id}`,
      message: `${newOrder.customer.name} ordered Rs. ${newOrder.total.toLocaleString()} (${newOrder.payment.method.toUpperCase()})`,
      link: `#/admin?tab=orders&id=${newOrder.id}`
    });

    this.addAuditLog(
      'ORDER_CREATED',
      'order',
      newOrder.id,
      `New order ${newOrder.id} placed by ${newOrder.customer.name} for Rs. ${newOrder.total}.`,
      newOrder.customer.name
    );

    return newOrder;
  },

  updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string, updatedBy?: string): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = newStatus;
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order marked as ${newStatus.replace(/_/g, ' ')}`,
      updatedBy: updatedBy || 'Administrator'
    });

    setStored(STORAGE_KEYS.ORDERS, orders, 'orders');
    this.addAuditLog(
      'ORDER_STATUS_UPDATED',
      'order',
      orderId,
      `Status changed to "${newStatus}"`,
      updatedBy || 'Administrator'
    );
    return order;
  },

  // PAYMENT VERIFICATION
  verifyPayment(orderId: string, verificationNotes?: string, adminName = 'Admin'): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.payment.status = 'verified';
    order.payment.verifiedAt = new Date().toISOString();
    order.payment.verifiedBy = adminName;
    order.payment.verificationNotes = verificationNotes || 'Payment verified by administrator';

    // If order was placed, promote to confirmed automatically
    if (order.status === 'order_placed') {
      order.status = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        note: `Payment verified. Order confirmed for preparation.`,
        updatedBy: adminName
      });
    }

    setStored(STORAGE_KEYS.ORDERS, orders, 'orders');
    this.addAuditLog(
      'PAYMENT_VERIFIED',
      'order',
      orderId,
      `Manual transfer payment verified for order ${orderId}.`,
      adminName
    );
    return order;
  },

  rejectPayment(orderId: string, rejectionReason: string, adminName = 'Admin'): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.payment.status = 'rejected';
    order.payment.verificationNotes = rejectionReason;
    order.statusHistory.push({
      status: order.status,
      timestamp: new Date().toISOString(),
      note: `Payment rejected: ${rejectionReason}`,
      updatedBy: adminName
    });

    setStored(STORAGE_KEYS.ORDERS, orders, 'orders');
    this.addAuditLog(
      'PAYMENT_REJECTED',
      'order',
      orderId,
      `Payment rejected: "${rejectionReason}"`,
      adminName
    );
    return order;
  },

  // CUSTOMERS / CRM
  getCustomers(): CustomerProfile[] {
    return getStored<CustomerProfile[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  },

  getCustomerById(id: string): CustomerProfile | undefined {
    return this.getCustomers().find((c) => c.id === id);
  },

  getCustomerByPhone(phone: string): CustomerProfile | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    return this.getCustomers().find((c) => c.phone.replace(/[^0-9]/g, '') === clean);
  },

  saveCustomer(customer: CustomerProfile): CustomerProfile {
    const customers = this.getCustomers();
    const index = customers.findIndex((c) => c.id === customer.id);
    if (index >= 0) {
      customers[index] = customer;
    } else {
      customers.push(customer);
    }
    setStored(STORAGE_KEYS.CUSTOMERS, customers, 'customers');
    return customer;
  },

  updateCustomerAfterOrder(order: Order) {
    const customers = this.getCustomers();
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    let customer = customers.find((c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone);

    const now = new Date().toISOString();

    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpend += order.total;
      customer.lastOrderDate = now;
      if (!customer.orders.includes(order.id)) {
        customer.orders.push(order.id);
      }
      if (order.customer.address) customer.address = order.customer.address;
      if (order.customer.email && !customer.email) customer.email = order.customer.email;

      // Auto VIP logic
      if (customer.totalSpend >= 8000 || customer.totalOrders >= 5) {
        customer.status = 'vip';
        if (!customer.tags.includes('VIP')) {
          customer.tags.push('VIP');
        }
      }
    } else {
      const newCust: CustomerProfile = {
        id: `cust-${Date.now()}`,
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email,
        address: order.customer.address,
        registeredAt: now,
        totalOrders: 1,
        totalSpend: order.total,
        lastOrderDate: now,
        status: order.total >= 4000 ? 'vip' : 'active',
        tags: ['New Customer'],
        internalNotes: 'First order placed via store checkout.',
        orders: [order.id]
      };
      customers.unshift(newCust);
    }

    setStored(STORAGE_KEYS.CUSTOMERS, customers, 'customers');
  },

  deleteCustomer(id: string): boolean {
    const customers = this.getCustomers();
    const target = customers.find((c) => c.id === id);
    const filtered = customers.filter((c) => c.id !== id);
    setStored(STORAGE_KEYS.CUSTOMERS, filtered, 'customers');
    this.addAuditLog(
      'DELETE_CUSTOMER',
      'customer',
      id,
      `Removed customer profile "${target?.name || id}". Note: past orders remain safe.`
    );
    return true;
  },

  // PAYMENT SETTINGS
  getPaymentSettings(): PaymentMethodSettings {
    return getStored<PaymentMethodSettings>(STORAGE_KEYS.PAYMENTS, initialPaymentSettings);
  },

  savePaymentSettings(settings: PaymentMethodSettings): PaymentMethodSettings {
    setStored(STORAGE_KEYS.PAYMENTS, settings, 'payments');
    this.addAuditLog(
      'UPDATE_PAYMENT_SETTINGS',
      'settings',
      'payments',
      'Updated payment credentials (Easypaisa/JazzCash/Bank accounts).'
    );
    return settings;
  },

  deleteBankAccount(bankId: string): boolean {
    const settings = this.getPaymentSettings();
    const bank = settings.bankAccounts.find((b) => b.id === bankId);
    settings.bankAccounts = settings.bankAccounts.filter((b) => b.id !== bankId);
    this.savePaymentSettings(settings);
    this.addAuditLog(
      'DELETE_BANK_ACCOUNT',
      'settings',
      bankId,
      `Deleted bank account "${bank?.bankName || bankId}".`
    );
    return true;
  },

  // RESTAURANT SETTINGS
  getRestaurantSettings(): RestaurantSettings {
    const stored = getStored<RestaurantSettings>(STORAGE_KEYS.SETTINGS, initialRestaurantSettings);
    return {
      ...initialRestaurantSettings,
      ...stored,
      latitude:
        typeof stored.latitude === 'number' && Number.isFinite(stored.latitude)
          ? stored.latitude
          : initialRestaurantSettings.latitude ?? 31.4882,
      longitude:
        typeof stored.longitude === 'number' && Number.isFinite(stored.longitude)
          ? stored.longitude
          : initialRestaurantSettings.longitude ?? 74.3652,
      deliveryRadiusKm:
        typeof stored.deliveryRadiusKm === 'number' && stored.deliveryRadiusKm > 0
          ? stored.deliveryRadiusKm
          : initialRestaurantSettings.deliveryRadiusKm ?? 10
    };
  },

  saveRestaurantSettings(settings: RestaurantSettings): RestaurantSettings {
    const normalized: RestaurantSettings = {
      ...initialRestaurantSettings,
      ...settings,
      deliveryRadiusKm:
        typeof settings.deliveryRadiusKm === 'number' && settings.deliveryRadiusKm > 0
          ? settings.deliveryRadiusKm
          : 10
    };
    setStored(STORAGE_KEYS.SETTINGS, normalized, 'settings');
    this.addAuditLog(
      'UPDATE_RESTAURANT_SETTINGS',
      'settings',
      'store-info',
      `Updated store operational hours, coordinates, delivery radius (${normalized.deliveryRadiusKm} KM), or contact info.`
    );
    void syncRestaurantSettingsToFirestore(normalized);
    return normalized;
  },

  applyRemoteRestaurantSettings(remote: Partial<RestaurantSettings>): void {
    const current = this.getRestaurantSettings();
    const merged: RestaurantSettings = { ...current, ...remote };
    setStored(STORAGE_KEYS.SETTINGS, merged, 'settings');
  },

  // DELIVERY ZONES
  getAllDeliveryZonesRaw(): DeliveryZone[] {
    return getStored<DeliveryZone[]>(STORAGE_KEYS.ZONES, initialDeliveryZones);
  },

  getDeliveryZones(includeDeleted = false): DeliveryZone[] {
    const all = this.getAllDeliveryZonesRaw();
    return includeDeleted ? all : all.filter((z) => !z.isDeleted);
  },

  getActiveDeliveryZones(): DeliveryZone[] {
    return this.getDeliveryZones(false).filter((z) => z.isActive);
  },

  applyRemoteDeliveryZones(remoteZones: DeliveryZone[]): void {
    if (!Array.isArray(remoteZones) || remoteZones.length === 0) return;
    setStored(STORAGE_KEYS.ZONES, remoteZones, 'zones');
  },

  saveDeliveryZone(zone: DeliveryZone): DeliveryZone {
    const zones = this.getAllDeliveryZonesRaw();
    const index = zones.findIndex((z) => z.id === zone.id);
    const normalized: DeliveryZone = {
      ...zone,
      city: zone.city?.trim() || 'Lahore',
      fee: Math.max(0, Number(zone.fee) || 0),
      minOrder: Math.max(0, Number(zone.minOrder) || 0),
      estimatedMinutes: zone.estimatedMinutes?.trim() || '30-40 mins',
      isDeleted: Boolean(zone.isDeleted)
    };
    if (index >= 0) {
      zones[index] = { ...zones[index], ...normalized };
    } else {
      zones.push({ ...normalized, isDeleted: false });
    }
    setStored(STORAGE_KEYS.ZONES, zones, 'zones');
    this.addAuditLog(
      index >= 0 ? 'UPDATE_ZONE' : 'CREATE_ZONE',
      'zone',
      normalized.id,
      `Delivery area "${normalized.name}" (${normalized.city}, Rs. ${normalized.fee}, ${normalized.isActive ? 'Active' : 'Inactive'}) saved.`
    );
    void syncDeliveryZoneToFirestore(normalized);
    return normalized;
  },

  toggleDeliveryZoneActive(id: string): DeliveryZone | null {
    const zones = this.getAllDeliveryZonesRaw();
    const index = zones.findIndex((z) => z.id === id);
    if (index === -1) return null;
    zones[index] = { ...zones[index], isActive: !zones[index].isActive };
    setStored(STORAGE_KEYS.ZONES, zones, 'zones');
    this.addAuditLog(
      'TOGGLE_ZONE_STATUS',
      'zone',
      id,
      `Delivery area "${zones[index].name}" marked as ${zones[index].isActive ? 'Active' : 'Inactive'}.`
    );
    void syncDeliveryZoneToFirestore(zones[index]);
    return zones[index];
  },

  softDeleteDeliveryZone(id: string, deletedBy = 'arabianshawarma@admin'): DeliveryZone | null {
    const zones = this.getAllDeliveryZonesRaw();
    const index = zones.findIndex((z) => z.id === id);
    if (index === -1) return null;

    const zone = zones[index];
    zone.isDeleted = true;
    zone.deletedAt = new Date().toISOString();
    zone.deletedBy = deletedBy;
    zone.deletionSnapshot = { ...zone };

    setStored(STORAGE_KEYS.ZONES, zones, 'zones');
    this.addAuditLog(
      'SOFT_DELETE_ZONE',
      'zone',
      id,
      `Soft deleted delivery area "${zone.name}". Moved to Recycle Bin.`,
      deletedBy
    );
    void syncDeliveryZoneToFirestore(zone);
    return zone;
  },

  restoreDeliveryZone(id: string): DeliveryZone | null {
    const zones = this.getAllDeliveryZonesRaw();
    const index = zones.findIndex((z) => z.id === id);
    if (index === -1) return null;

    const zone = zones[index];
    zone.isDeleted = false;
    zone.deletedAt = undefined;
    zone.deletedBy = undefined;

    setStored(STORAGE_KEYS.ZONES, zones, 'zones');
    this.addAuditLog(
      'RESTORE_ZONE',
      'zone',
      id,
      `Restored delivery area "${zone.name}" from Recycle Bin.`
    );
    void syncDeliveryZoneToFirestore(zone);
    return zone;
  },

  permanentlyDeleteDeliveryZone(id: string): boolean {
    const zones = this.getAllDeliveryZonesRaw();
    const target = zones.find((z) => z.id === id);
    const filtered = zones.filter((z) => z.id !== id);
    setStored(STORAGE_KEYS.ZONES, filtered, 'zones');
    this.addAuditLog(
      'PERMANENT_DELETE_ZONE',
      'zone',
      id,
      `Permanently deleted delivery area "${target?.name || id}".`
    );
    void deleteDeliveryZoneFromFirestore(id);
    return true;
  },

  deleteDeliveryZone(id: string): boolean {
    return Boolean(this.softDeleteDeliveryZone(id));
  },

  // REVIEWS
  getReviews(): Review[] {
    return getStored<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews);
  },

  saveReview(review: Review): Review {
    const reviews = this.getReviews();
    const index = reviews.findIndex((r) => r.id === review.id);
    if (index >= 0) {
      reviews[index] = review;
    } else {
      reviews.unshift(review);
    }
    setStored(STORAGE_KEYS.REVIEWS, reviews, 'reviews');
    return review;
  },

  deleteReview(id: string): boolean {
    const reviews = this.getReviews().filter((r) => r.id !== id);
    setStored(STORAGE_KEYS.REVIEWS, reviews, 'reviews');
    return true;
  },

  // NOTIFICATIONS
  getNotifications(): NotificationItem[] {
    return getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif-1',
        type: 'new_order',
        title: 'System Initialized',
        message: 'Arabian Shawarma & Pizza platform online and ready for orders.',
        timestamp: new Date().toISOString(),
        isRead: false
      }
    ]);
  },

  addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): NotificationItem {
    const list = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    list.unshift(newNotif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, list.slice(0, 50), 'notifications');
    return newNotif;
  },

  markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    setStored(STORAGE_KEYS.NOTIFICATIONS, list, 'notifications');
  },

  deleteNotification(id: string): boolean {
    const list = this.getNotifications().filter((n) => n.id !== id);
    setStored(STORAGE_KEYS.NOTIFICATIONS, list, 'notifications');
    return true;
  },

  clearAllNotifications(): boolean {
    setStored(STORAGE_KEYS.NOTIFICATIONS, [], 'notifications');
    return true;
  },

  // REPORTING & ANALYTICS
  getAnalytics() {
    const orders = this.getOrders();
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
    const pendingOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
    const todayRevenue = todayOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingPayments = orders.filter(
      (o) => o.payment.method !== 'cod' && o.payment.status === 'pending_verification'
    ).length;

    const verifiedPayments = orders.filter((o) => o.payment.status === 'verified').length;

    // Best sellers calculation
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((order) => {
        order.items.forEach((item) => {
          const cur = itemMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
          cur.quantity += item.quantity;
          cur.revenue += item.price * item.quantity;
          itemMap.set(item.name, cur);
        });
      });

    const bestSellers = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Payment methods breakdown
    const paymentMethods = {
      cod: orders.filter((o) => o.payment.method === 'cod').length,
      easypaisa: orders.filter((o) => o.payment.method === 'easypaisa').length,
      jazzcash: orders.filter((o) => o.payment.method === 'jazzcash').length,
      bank_transfer: orders.filter((o) => o.payment.method === 'bank_transfer').length
    };

    return {
      totalOrders,
      todayOrders: todayOrders.length,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      totalRevenue,
      todayRevenue,
      pendingPayments,
      verifiedPayments,
      totalCustomers: this.getCustomers().length,
      bestSellers,
      paymentMethods
    };
  },

  // RESET TO FACTORY / SEED
  resetToFactoryData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.DEALS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.COUPONS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ZONES);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.BANNERS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    notifyDataChange('all');
  }
};
