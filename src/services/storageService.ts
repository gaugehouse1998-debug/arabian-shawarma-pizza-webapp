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
  VerifiedLocationState,
  CartItem,
  CouponRedemption,
  ReviewStatus
} from '../types';
import {
  syncDeliveryZoneToFirestore,
  deleteDeliveryZoneFromFirestore,
  syncRestaurantSettingsToFirestore
} from './deliveryFirestoreService';
import {
  syncDealToFirestore,
  syncDealsBatchToFirestore,
  deleteDealFromFirestore,
  syncCouponToFirestore,
  deleteCouponFromFirestore,
  syncCouponRedemptionToFirestore,
  syncReviewToFirestore,
  deleteReviewFromFirestore
} from './catalogFirestoreService';

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
    imageUrl: '/assets/images/artisan_tikka_pizza_1794391294077.jpg',
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
    imageUrl: '/assets/images/family_combo_feast_1794391295864.jpg',
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
    imageUrl: '/assets/images/hero_3d_burger_1794391292664.jpg',
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
  AUDIT_LOGS: 'asp_audit_logs_v1',
  COUPON_REDEMPTIONS: 'asp_coupon_redemptions_v1'
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
    try {
      broadcastChannel?.postMessage({ type: 'DATA_UPDATED', entity });
    } catch {
      // Ignore BroadcastChannel closed/restricted context errors
    }
  }
}

// In-memory cache fallback for SSR and test execution
const inMemoryCache: Record<string, string> = {};

function matchesExpectedShape<T>(parsed: unknown, defaultValue: T): parsed is T {
  if (parsed === null || parsed === undefined) return false;
  if (Array.isArray(defaultValue)) {
    return Array.isArray(parsed);
  }
  if (typeof defaultValue === 'object' && defaultValue !== null) {
    return typeof parsed === 'object' && !Array.isArray(parsed);
  }
  return typeof parsed === typeof defaultValue;
}

// Helper to get with shape-safe fallback
function getStored<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item) as unknown;
        if (matchesExpectedShape(parsed, defaultValue)) {
          return parsed;
        }
        console.warn(`Corrupted shape for ${key}, resetting to default.`);
        localStorage.removeItem(key);
      }
      return defaultValue;
    }
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore cleanup errors
    }
  }
  if (inMemoryCache[key]) {
    try {
      const parsed = JSON.parse(inMemoryCache[key]) as unknown;
      if (matchesExpectedShape(parsed, defaultValue)) {
        return parsed;
      }
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
  getDeals(includeDeleted = false, includeArchived = true): Deal[] {
    const all = getStored<Deal[]>(STORAGE_KEYS.DEALS, initialDeals);
    const filtered = all.filter((d) => {
      if (!includeDeleted && d.isDeleted) return false;
      if (!includeArchived && d.isArchived) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      const orderA =
        typeof a.displayOrder === 'number'
          ? a.displayOrder
          : parseInt(a.dealNumber.replace(/\D/g, ''), 10) || 9999;
      const orderB =
        typeof b.displayOrder === 'number'
          ? b.displayOrder
          : parseInt(b.dealNumber.replace(/\D/g, ''), 10) || 9999;
      if (orderA !== orderB) return orderA - orderB;
      return a.dealNumber.localeCompare(b.dealNumber);
    });
  },

  getPublicActiveDeals(): Deal[] {
    const now = Date.now();
    return this.getDeals(false, false).filter((d) => {
      if (!d.isActive) return false;
      if (d.startDate) {
        const startMs = new Date(`${d.startDate}T00:00:00`).getTime();
        if (!Number.isNaN(startMs) && now < startMs) return false;
      }
      if (d.expiryDate) {
        const endMs = new Date(`${d.expiryDate}T23:59:59.999`).getTime();
        if (!Number.isNaN(endMs) && now > endMs) return false;
      }
      return true;
    });
  },

  getAllDealsRaw(): Deal[] {
    return getStored<Deal[]>(STORAGE_KEYS.DEALS, initialDeals);
  },

  getDealById(id: string): Deal | undefined {
    return this.getDeals(true, true).find((d) => d.id === id);
  },

  getDealOrderReferenceCount(dealId: string): number {
    return this.getOrders().filter((o) =>
      o.items.some((item) => item.productId === dealId)
    ).length;
  },

  applyRemoteDeals(remoteDeals: Deal[]): void {
    if (!Array.isArray(remoteDeals) || remoteDeals.length === 0) return;
    setStored(STORAGE_KEYS.DEALS, remoteDeals, 'deals');
  },

  saveDeal(deal: Deal): Deal {
    const deals = this.getAllDealsRaw();
    const index = deals.findIndex((d) => d.id === deal.id);
    const now = new Date().toISOString();

    const normalizedItems =
      Array.isArray(deal.includedItems) && deal.includedItems.length > 0
        ? deal.includedItems
            .filter((it) => it.name.trim())
            .map((it) => (it.quantity > 1 ? `${it.quantity}x ${it.name.trim()}` : it.name.trim()))
        : Array.isArray(deal.items)
        ? deal.items.filter((s) => s.trim())
        : [];

    const normalizedPrice = Math.max(1, Math.round(Number(deal.price) || 1));
    const normalizedOriginal =
      typeof deal.originalPrice === 'number' && deal.originalPrice > normalizedPrice
        ? Math.round(deal.originalPrice)
        : deal.originalPrice && deal.originalPrice > 0
        ? Math.round(deal.originalPrice)
        : undefined;

    const normalizedDeal: Deal = {
      ...deal,
      dealNumber: deal.dealNumber.trim().toUpperCase(),
      title: deal.title.trim(),
      description: deal.description?.trim() || '',
      category: deal.category?.trim() || 'Regular Deals',
      items: normalizedItems,
      price: normalizedPrice,
      originalPrice: normalizedOriginal,
      displayOrder:
        typeof deal.displayOrder === 'number' && Number.isFinite(deal.displayOrder)
          ? deal.displayOrder
          : index >= 0 && typeof deals[index].displayOrder === 'number'
          ? deals[index].displayOrder
          : parseInt(deal.dealNumber.replace(/\D/g, ''), 10) || deals.length + 1,
      image:
        deal.image?.trim() ||
        '/assets/images/family_combo_feast_1794391295864.jpg',
      isDeleted: Boolean(deal.isDeleted),
      isArchived: Boolean(deal.isArchived),
      createdAt: index >= 0 ? deals[index].createdAt || now : deal.createdAt || now,
      updatedAt: now
    };

    if (index >= 0) {
      deals[index] = { ...deals[index], ...normalizedDeal };
    } else {
      deals.push(normalizedDeal);
    }

    setStored(STORAGE_KEYS.DEALS, deals, 'deals');
    this.addAuditLog(
      index >= 0 ? 'UPDATE_DEAL' : 'CREATE_DEAL',
      'deal',
      normalizedDeal.id,
      `Deal "${normalizedDeal.dealNumber}: ${normalizedDeal.title}" saved (Rs. ${normalizedDeal.price}).`
    );
    void syncDealToFirestore(normalizedDeal);
    return normalizedDeal;
  },

  bulkUpdateDealPrices(
    updates: Array<{ id: string; price: number; originalPrice?: number }>,
    performedBy = 'arabianshawarma@admin'
  ): Deal[] {
    const deals = this.getAllDealsRaw();
    const now = new Date().toISOString();
    const updatedDeals: Deal[] = [];
    const updateMap = new Map(updates.map((u) => [u.id, u]));

    const nextDeals = deals.map((deal) => {
      const upd = updateMap.get(deal.id);
      if (!upd) return deal;
      const safePrice = Math.max(1, Math.round(Number(upd.price)));
      const nextDeal: Deal = {
        ...deal,
        price: safePrice,
        ...(upd.originalPrice !== undefined
          ? { originalPrice: upd.originalPrice > safePrice ? Math.round(upd.originalPrice) : undefined }
          : {}),
        updatedAt: now
      };
      updatedDeals.push(nextDeal);
      return nextDeal;
    });

    if (updatedDeals.length > 0) {
      setStored(STORAGE_KEYS.DEALS, nextDeals, 'deals');
      this.addAuditLog(
        'BULK_UPDATE_DEAL_PRICES',
        'deal',
        updatedDeals.map((d) => d.id).join(','),
        `Bulk updated prices for ${updatedDeals.length} deal(s).`,
        performedBy
      );
      void syncDealsBatchToFirestore(updatedDeals);
    }

    return updatedDeals;
  },

  archiveDeal(id: string, performedBy = 'arabianshawarma@admin'): Deal | null {
    const deals = this.getAllDealsRaw();
    const index = deals.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const deal: Deal = {
      ...deals[index],
      isArchived: true,
      isActive: false,
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    deals[index] = deal;
    setStored(STORAGE_KEYS.DEALS, deals, 'deals');
    this.addAuditLog(
      'ARCHIVE_DEAL',
      'deal',
      id,
      `Archived deal "${deal.dealNumber}: ${deal.title}" while preserving historical orders.`,
      performedBy
    );
    void syncDealToFirestore(deal);
    return deal;
  },

  unarchiveDeal(id: string, performedBy = 'arabianshawarma@admin'): Deal | null {
    const deals = this.getAllDealsRaw();
    const index = deals.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const deal: Deal = {
      ...deals[index],
      isArchived: false,
      archivedAt: undefined,
      isActive: true,
      updatedAt: new Date().toISOString()
    };
    deals[index] = deal;
    setStored(STORAGE_KEYS.DEALS, deals, 'deals');
    this.addAuditLog(
      'UNARCHIVE_DEAL',
      'deal',
      id,
      `Unarchived deal "${deal.dealNumber}: ${deal.title}".`,
      performedBy
    );
    void syncDealToFirestore(deal);
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
    void syncDealToFirestore(deal);
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
    void syncDealToFirestore(deal);
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
      `Permanently purged deal "${target?.dealNumber || id}". Historical order snapshots remain intact.`
    );
    void deleteDealFromFirestore(id);
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

  // COUPONS & REDEMPTIONS
  getCoupons(includeDeleted = false): Coupon[] {
    const all = getStored<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
    return includeDeleted ? all : all.filter((c) => !c.isDeleted);
  },

  getAllCouponsRaw(): Coupon[] {
    return getStored<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
  },

  applyRemoteCoupons(remoteCoupons: Coupon[]): void {
    if (!Array.isArray(remoteCoupons) || remoteCoupons.length === 0) return;
    setStored(STORAGE_KEYS.COUPONS, remoteCoupons, 'coupons');
  },

  getCouponRedemptions(): CouponRedemption[] {
    return getStored<CouponRedemption[]>(STORAGE_KEYS.COUPON_REDEMPTIONS, []);
  },

  saveCoupon(coupon: Coupon, previousCode?: string): Coupon {
    const coupons = this.getAllCouponsRaw();
    const normalizedCode = coupon.code.trim().toUpperCase();
    const lookupCode = (previousCode || normalizedCode).trim().toUpperCase();
    const index = coupons.findIndex((c) => c.code.toUpperCase() === lookupCode);
    const now = new Date().toISOString();

    const normalized: Coupon = {
      ...coupon,
      code: normalizedCode,
      title: coupon.title?.trim() || undefined,
      description: coupon.description?.trim() || undefined,
      discountValue: Math.max(1, Number(coupon.discountValue) || 1),
      minOrderValue: Math.max(0, Number(coupon.minOrderValue) || 0),
      maxDiscount:
        coupon.maxDiscount && Number(coupon.maxDiscount) > 0
          ? Number(coupon.maxDiscount)
          : undefined,
      startDate: coupon.startDate?.trim() || undefined,
      expiryDate: coupon.expiryDate?.trim() || undefined,
      usageLimit:
        coupon.usageLimit && Number(coupon.usageLimit) > 0
          ? Math.floor(Number(coupon.usageLimit))
          : undefined,
      perCustomerLimit:
        coupon.perCustomerLimit && Number(coupon.perCustomerLimit) > 0
          ? Math.floor(Number(coupon.perCustomerLimit))
          : undefined,
      applicableCategories:
        coupon.applicableCategories && coupon.applicableCategories.length > 0
          ? coupon.applicableCategories
          : undefined,
      applicableProductIds:
        coupon.applicableProductIds && coupon.applicableProductIds.length > 0
          ? coupon.applicableProductIds
          : undefined,
      timesUsed: Math.max(0, Number(coupon.timesUsed) || 0),
      isActive: Boolean(coupon.isActive),
      isDeleted: Boolean(coupon.isDeleted),
      createdAt: index >= 0 ? coupons[index].createdAt || now : coupon.createdAt || now,
      updatedAt: now
    };

    if (index >= 0) {
      coupons[index] = { ...coupons[index], ...normalized };
      if (previousCode && previousCode.toUpperCase() !== normalizedCode) {
        void deleteCouponFromFirestore(previousCode);
      }
    } else {
      coupons.push({ ...normalized, isDeleted: false });
    }

    setStored(STORAGE_KEYS.COUPONS, coupons, 'coupons');
    this.addAuditLog(
      index >= 0 ? 'UPDATE_COUPON' : 'CREATE_COUPON',
      'coupon',
      normalized.code,
      `Coupon code "${normalized.code}" (${normalized.discountValue}${
        normalized.discountType === 'percentage' ? '%' : ' PKR'
      } off) saved.`
    );
    void syncCouponToFirestore(normalized);
    return normalized;
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
    void syncCouponToFirestore(coupon);
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
    void syncCouponToFirestore(coupon);
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
    void deleteCouponFromFirestore(code);
    return true;
  },

  deleteCoupon(code: string): boolean {
    return Boolean(this.softDeleteCoupon(code));
  },

  validateCoupon(
    code: string,
    subtotal: number,
    options?: { items?: CartItem[]; customerPhone?: string; customerEmail?: string }
  ): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const normalizedInput = code.trim().toUpperCase();
    if (!normalizedInput) {
      return { valid: false, discount: 0, message: 'Please enter a coupon code.' };
    }

    const coupon = this.getCoupons(false).find(
      (c) => c.code.trim().toUpperCase() === normalizedInput
    );

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid coupon code. Please check and try again.' };
    }

    if (!coupon.isActive) {
      return { valid: false, discount: 0, message: `Coupon "${coupon.code}" is currently inactive.` };
    }

    const nowMs = Date.now();
    if (coupon.startDate) {
      const startMs = new Date(`${coupon.startDate}T00:00:00`).getTime();
      if (!Number.isNaN(startMs) && nowMs < startMs) {
        return {
          valid: false,
          discount: 0,
          message: `Coupon "${coupon.code}" is not active yet. Starts on ${coupon.startDate}.`
        };
      }
    }

    if (coupon.expiryDate) {
      const expiryMs = new Date(`${coupon.expiryDate}T23:59:59.999`).getTime();
      if (!Number.isNaN(expiryMs) && nowMs > expiryMs) {
        return {
          valid: false,
          discount: 0,
          message: `Coupon "${coupon.code}" expired on ${coupon.expiryDate}.`
        };
      }
    }

    if (
      typeof coupon.usageLimit === 'number' &&
      coupon.usageLimit > 0 &&
      (coupon.timesUsed || 0) >= coupon.usageLimit
    ) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon "${coupon.code}" has reached its maximum usage limit.`
      };
    }

    if (typeof coupon.perCustomerLimit === 'number' && coupon.perCustomerLimit > 0) {
      const cleanPhone = (options?.customerPhone || '').replace(/[^0-9]/g, '');
      const cleanEmail = (options?.customerEmail || '').trim().toLowerCase();
      if (cleanPhone || cleanEmail) {
        const redemptions = this.getCouponRedemptions().filter(
          (r) => r.couponCode.toUpperCase() === coupon.code.toUpperCase()
        );
        const customerUses = redemptions.filter((r) => {
          const rPhone = r.customerPhone.replace(/[^0-9]/g, '');
          const rEmail = (r.customerEmail || '').trim().toLowerCase();
          return (cleanPhone && rPhone === cleanPhone) || (cleanEmail && rEmail === cleanEmail);
        }).length;

        if (customerUses >= coupon.perCustomerLimit) {
          return {
            valid: false,
            discount: 0,
            message: `You have already reached the per-customer limit (${coupon.perCustomerLimit}) for "${coupon.code}".`
          };
        }
      }
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of Rs. ${coupon.minOrderValue.toLocaleString()} required for "${coupon.code}".`
      };
    }

    // Category / product eligibility filtering
    const hasCategoryRestrictions = Boolean(coupon.applicableCategories?.length);
    const hasProductRestrictions = Boolean(coupon.applicableProductIds?.length);
    let eligibleSubtotal = subtotal;

    if ((hasCategoryRestrictions || hasProductRestrictions) && options?.items) {
      const catSet = new Set((coupon.applicableCategories || []).map((c) => c.toLowerCase()));
      const prodSet = new Set(coupon.applicableProductIds || []);
      const eligibleItems = options.items.filter(
        (item) => prodSet.has(item.productId) || catSet.has(item.category.toLowerCase())
      );

      if (eligibleItems.length === 0) {
        return {
          valid: false,
          discount: 0,
          message: `Coupon "${coupon.code}" does not apply to the items currently in your cart.`
        };
      }

      eligibleSubtotal = eligibleItems.reduce(
        (sum, item) => sum + Math.max(0, Number(item.price) || 0) * Math.max(1, Number(item.quantity) || 1),
        0
      );
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((eligibleSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    const finalDiscount = Math.max(0, Math.min(discount, eligibleSubtotal, subtotal));

    return {
      valid: true,
      discount: finalDiscount,
      coupon,
      message: `Promo code "${coupon.code}" applied! You saved Rs. ${finalDiscount.toLocaleString()}.`
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
    let appliedCouponCode: string | undefined;

    if (orderData.couponCode && orderData.couponCode.trim()) {
      const couponRes = this.validateCoupon(orderData.couponCode, computedSubtotal, {
        items: orderData.items,
        customerPhone: orderData.customer.phone,
        customerEmail: orderData.customer.email
      });
      if (!couponRes.valid) {
        throw new Error(couponRes.message || 'Promo code is invalid or no longer eligible.');
      }
      authoritativeDiscount = couponRes.discount;
      appliedCouponCode = couponRes.coupon?.code || orderData.couponCode.trim().toUpperCase();
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
      couponCode: appliedCouponCode,
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

    // Atomic redemption tracking & usage limit enforcement right before persisting order
    if (appliedCouponCode) {
      const allCoupons = this.getAllCouponsRaw();
      const couponIdx = allCoupons.findIndex(
        (c) => c.code.toUpperCase() === appliedCouponCode && !c.isDeleted
      );
      if (couponIdx === -1 || !allCoupons[couponIdx].isActive) {
        throw new Error(`Coupon "${appliedCouponCode}" is no longer available.`);
      }
      const targetCoupon = allCoupons[couponIdx];
      if (
        typeof targetCoupon.usageLimit === 'number' &&
        targetCoupon.usageLimit > 0 &&
        (targetCoupon.timesUsed || 0) >= targetCoupon.usageLimit
      ) {
        throw new Error(`Coupon "${appliedCouponCode}" has reached its maximum usage limit.`);
      }

      targetCoupon.timesUsed = (targetCoupon.timesUsed || 0) + 1;
      targetCoupon.updatedAt = now;
      allCoupons[couponIdx] = targetCoupon;
      setStored(STORAGE_KEYS.COUPONS, allCoupons, 'coupons');
      void syncCouponToFirestore(targetCoupon);

      const redemption: CouponRedemption = {
        id: `red-${newOrder.id}`,
        couponCode: appliedCouponCode,
        orderId: newOrder.id,
        customerPhone: newOrder.customer.phone,
        customerEmail: newOrder.customer.email,
        discountAmount: authoritativeDiscount,
        orderSubtotal: computedSubtotal,
        redeemedAt: now
      };
      const redemptions = this.getCouponRedemptions();
      redemptions.unshift(redemption);
      setStored(STORAGE_KEYS.COUPON_REDEMPTIONS, redemptions, 'coupon_redemptions');
      void syncCouponRedemptionToFirestore(redemption);
    }

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
    const raw = getStored<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews);
    return raw
      .map((r) => {
        const status: ReviewStatus = r.status
          ? r.status
          : r.isApproved
          ? 'approved'
          : 'pending';
        return {
          ...r,
          status,
          isApproved: status === 'approved'
        };
      })
      .sort((a, b) => {
        const tA = new Date(a.createdAt || a.date).getTime() || 0;
        const tB = new Date(b.createdAt || b.date).getTime() || 0;
        return tB - tA;
      });
  },

  getApprovedReviews(): Review[] {
    return this.getReviews().filter((r) => r.isApproved && r.status === 'approved');
  },

  hasReviewForOrder(orderId: string): boolean {
    if (!orderId) return false;
    const norm = orderId.trim().toLowerCase();
    return this.getReviews().some((r) => (r.orderId || '').trim().toLowerCase() === norm);
  },

  getReviewByOrderId(orderId: string): Review | undefined {
    const norm = orderId.trim().toLowerCase();
    return this.getReviews().find((r) => (r.orderId || '').trim().toLowerCase() === norm);
  },

  applyRemoteReviews(remoteReviews: Review[]): void {
    if (!Array.isArray(remoteReviews) || remoteReviews.length === 0) return;
    const existing = this.getReviews();
    const map = new Map(existing.map((r) => [r.id, r]));
    remoteReviews.forEach((r) => map.set(r.id, r));
    setStored(STORAGE_KEYS.REVIEWS, Array.from(map.values()), 'reviews');
  },

  submitOrderReview(input: {
    orderId?: string;
    customerName: string;
    rating: number;
    comment: string;
    itemOrdered?: string;
  }): Review {
    const cleanName = input.customerName.trim();
    const cleanComment = input.comment.trim();
    const cleanRating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 0)));

    if (!cleanName) {
      throw new Error('Please enter your name before submitting.');
    }
    if (!cleanRating || cleanRating < 1 || cleanRating > 5) {
      throw new Error('Please select a star rating from 1 to 5.');
    }
    if (!cleanComment) {
      throw new Error('Please write a short review about your experience.');
    }
    if (input.orderId && this.hasReviewForOrder(input.orderId)) {
      throw new Error('A review has already been submitted for this order.');
    }

    const now = new Date().toISOString();
    const review: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderId: input.orderId?.trim() || undefined,
      customerName: cleanName,
      rating: cleanRating,
      comment: cleanComment,
      date: now.split('T')[0],
      createdAt: now,
      status: 'pending',
      isApproved: false,
      itemOrdered: input.itemOrdered?.trim() || undefined
    };

    const reviews = this.getReviews();
    reviews.unshift(review);
    setStored(STORAGE_KEYS.REVIEWS, reviews, 'reviews');
    this.addAuditLog(
      'SUBMIT_REVIEW',
      'review',
      review.id,
      `New ${review.rating}-star review submitted by "${review.customerName}"${
        review.orderId ? ` for order #${review.orderId}` : ''
      }.`,
      review.customerName
    );
    void syncReviewToFirestore(review);
    return review;
  },

  moderateReview(
    id: string,
    status: ReviewStatus,
    adminEmail = 'arabianshawarma@admin'
  ): Review | null {
    const reviews = this.getReviews();
    const index = reviews.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated: Review = {
      ...reviews[index],
      status,
      isApproved: status === 'approved',
      moderatedAt: new Date().toISOString(),
      moderatedBy: adminEmail
    };
    reviews[index] = updated;
    setStored(STORAGE_KEYS.REVIEWS, reviews, 'reviews');
    this.addAuditLog(
      'MODERATE_REVIEW',
      'review',
      id,
      `Review by "${updated.customerName}" marked as "${status}".`,
      adminEmail
    );
    void syncReviewToFirestore(updated);
    return updated;
  },

  saveReview(review: Review): Review {
    const reviews = this.getReviews();
    const normalized: Review = {
      ...review,
      status: review.status || (review.isApproved ? 'approved' : 'pending'),
      isApproved:
        review.status !== undefined ? review.status === 'approved' : Boolean(review.isApproved),
      createdAt: review.createdAt || new Date().toISOString()
    };
    const index = reviews.findIndex((r) => r.id === normalized.id);
    if (index >= 0) {
      reviews[index] = normalized;
    } else {
      reviews.unshift(normalized);
    }
    setStored(STORAGE_KEYS.REVIEWS, reviews, 'reviews');
    void syncReviewToFirestore(normalized);
    return normalized;
  },

  deleteReview(id: string): boolean {
    const target = this.getReviews().find((r) => r.id === id);
    const reviews = this.getReviews().filter((r) => r.id !== id);
    setStored(STORAGE_KEYS.REVIEWS, reviews, 'reviews');
    this.addAuditLog(
      'DELETE_REVIEW',
      'review',
      id,
      `Deleted review by "${target?.customerName || id}".`
    );
    void deleteReviewFromFirestore(id);
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
