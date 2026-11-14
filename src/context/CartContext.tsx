import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CartItem,
  Product,
  Deal,
  ProductSize,
  ProductAddon,
  DeliveryZone,
  RestaurantSettings,
  VerifiedLocationState
} from '../types';
import { storageService } from '../services/storageService';
import { subscribeDeliveryConfigFromFirestore } from '../services/deliveryFirestoreService';
import { subscribeCatalogFromFirestore } from '../services/catalogFirestoreService';

const CONFIRMED_LOCATION_KEY = 'asp_confirmed_delivery_location_v1';
const POPUP_SEEN_KEY = 'asp_delivery_popup_seen_v1';

interface CartContextType {
  items: CartItem[];
  addToCart: (
    item: Product | Deal,
    options?: { size?: ProductSize; selectedAddons?: ProductAddon[]; specialInstructions?: string },
    quantity?: number,
    isDeal?: boolean
  ) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  couponCode: string;
  couponDiscount: number;
  couponError: string;
  couponSuccess: string;
  applyCoupon: (
    code: string,
    customerInfo?: { customerPhone?: string; customerEmail?: string }
  ) => boolean;
  removeCoupon: () => void;
  deliveryType: 'delivery' | 'pickup';
  setDeliveryType: (type: 'delivery' | 'pickup') => void;
  activeZones: DeliveryZone[];
  restaurantSettings: RestaurantSettings;
  selectedZone: DeliveryZone | null;
  setSelectedZone: (zone: DeliveryZone | null) => void;
  verifiedLocation: VerifiedLocationState | null;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  openLocationModal: () => void;
  dismissLocationModal: () => void;
  confirmManualZone: (zone: DeliveryZone) => void;
  confirmGpsLocation: (
    distanceKm: number,
    insideRadius: boolean,
    matchedZone?: DeliveryZone | null
  ) => void;
  resetLocationConfirmation: () => void;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadStoredLocation(): VerifiedLocationState | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(CONFIRMED_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      localStorage.removeItem(CONFIRMED_LOCATION_KEY);
      return null;
    }
    return parsed as VerifiedLocationState;
  } catch {
    try {
      localStorage.removeItem(CONFIRMED_LOCATION_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return null;
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('asp_cart_items');
      if (!stored) return [];
      const parsed = JSON.parse(stored) as unknown;
      if (!Array.isArray(parsed)) {
        localStorage.removeItem('asp_cart_items');
        return [];
      }
      return parsed.filter(
        (item): item is CartItem =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as CartItem).id === 'string' &&
          typeof (item as CartItem).name === 'string' &&
          Number.isFinite(Number((item as CartItem).price)) &&
          Number.isFinite(Number((item as CartItem).quantity))
      );
    } catch {
      try {
        localStorage.removeItem('asp_cart_items');
      } catch {
        // Ignore cleanup errors
      }
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');

  const [activeZones, setActiveZones] = useState<DeliveryZone[]>(() =>
    storageService.getActiveDeliveryZones()
  );
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>(() =>
    storageService.getRestaurantSettings()
  );

  const [verifiedLocation, setVerifiedLocation] = useState<VerifiedLocationState | null>(() => {
    const saved = loadStoredLocation();
    if (!saved) return null;
    if (saved.method === 'manual' && saved.selectedZoneId) {
      const stillActive = storageService
        .getActiveDeliveryZones()
        .find((z) => z.id === saved.selectedZoneId);
      if (!stillActive) return null;
    }
    return saved;
  });

  const [selectedZone, setSelectedZoneState] = useState<DeliveryZone | null>(() => {
    const zones = storageService.getActiveDeliveryZones();
    const saved = loadStoredLocation();
    if (saved?.selectedZoneId) {
      const found = zones.find((z) => z.id === saved.selectedZoneId);
      if (found) return found;
    }
    return zones.length > 0 ? zones[0] : null;
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash === 'admin' || hash.startsWith('admin/')) return false;
    try {
      const seen = localStorage.getItem(POPUP_SEEN_KEY);
      return !seen;
    } catch {
      return true;
    }
  });

  // Persist verified location
  useEffect(() => {
    try {
      if (verifiedLocation) {
        localStorage.setItem(CONFIRMED_LOCATION_KEY, JSON.stringify(verifiedLocation));
      } else {
        localStorage.removeItem(CONFIRMED_LOCATION_KEY);
      }
    } catch (e) {
      console.error('Failed to persist delivery location:', e);
    }
  }, [verifiedLocation]);

  // Reconcile delivery zones and settings whenever storage or Firestore updates
  const refreshDeliveryData = useCallback(() => {
    const nextZones = storageService.getActiveDeliveryZones();
    const nextSettings = storageService.getRestaurantSettings();
    setActiveZones(nextZones);
    setRestaurantSettings(nextSettings);

    setSelectedZoneState((current) => {
      if (current) {
        const refreshed = nextZones.find((z) => z.id === current.id);
        if (refreshed) return refreshed;
      }
      return nextZones.length > 0 ? nextZones[0] : null;
    });

    setVerifiedLocation((current) => {
      if (!current) return null;
      if (current.method === 'manual' && current.selectedZoneId) {
        const updatedZone = nextZones.find((z) => z.id === current.selectedZoneId);
        if (!updatedZone) {
          return null;
        }
        if (updatedZone.name !== current.selectedAreaName) {
          return { ...current, selectedAreaName: updatedZone.name };
        }
      }
      if (current.method === 'gps' && current.selectedZoneId) {
        const updatedZone = nextZones.find((z) => z.id === current.selectedZoneId);
        if (!updatedZone) {
          return {
            ...current,
            selectedZoneId: undefined,
            selectedAreaName: `Within ${nextSettings.deliveryRadiusKm ?? 10} KM Radius (Verified GPS)`
          };
        }
      }
      return current;
    });
  }, []);

  useEffect(() => {
    const handleStorageUpdate = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail || ['zones', 'settings', 'all'].includes(detail.entity)) {
        refreshDeliveryData();
      }
    };
    window.addEventListener('asp_data_updated', handleStorageUpdate);

    const unsubscribeFirestore = subscribeDeliveryConfigFromFirestore(
      (remoteZones) => {
        storageService.applyRemoteDeliveryZones(remoteZones);
      },
      (remoteSettings) => {
        storageService.applyRemoteRestaurantSettings(remoteSettings);
      }
    );

    const unsubscribeCatalog = subscribeCatalogFromFirestore({
      onDeals: (remoteDeals) => storageService.applyRemoteDeals(remoteDeals),
      onCoupons: (remoteCoupons) => storageService.applyRemoteCoupons(remoteCoupons),
      onApprovedReviews: (remoteReviews) => storageService.applyRemoteReviews(remoteReviews)
    });

    return () => {
      window.removeEventListener('asp_data_updated', handleStorageUpdate);
      unsubscribeFirestore();
      unsubscribeCatalog();
    };
  }, [refreshDeliveryData]);

  const markPopupSeen = () => {
    try {
      localStorage.setItem(POPUP_SEEN_KEY, '1');
    } catch {
      // Ignore storage failures
    }
  };

  const openLocationModal = () => {
    setIsLocationModalOpen(true);
  };

  const dismissLocationModal = () => {
    markPopupSeen();
    setIsLocationModalOpen(false);
  };

  const setSelectedZone = (zone: DeliveryZone | null) => {
    setSelectedZoneState(zone);
    if (zone && zone.isActive && !zone.isDeleted) {
      setVerifiedLocation({
        confirmed: true,
        method: 'manual',
        selectedZoneId: zone.id,
        selectedAreaName: zone.name,
        insideRadius: true,
        checkedAt: new Date().toISOString()
      });
    }
  };

  const confirmManualZone = (zone: DeliveryZone) => {
    if (!zone.isActive || zone.isDeleted) return;
    setSelectedZoneState(zone);
    setDeliveryType('delivery');
    setVerifiedLocation({
      confirmed: true,
      method: 'manual',
      selectedZoneId: zone.id,
      selectedAreaName: zone.name,
      insideRadius: true,
      checkedAt: new Date().toISOString()
    });
    markPopupSeen();
    setIsLocationModalOpen(false);
  };

  const confirmGpsLocation = (
    distanceKm: number,
    insideRadius: boolean,
    matchedZone?: DeliveryZone | null
  ) => {
    const radiusKm = restaurantSettings.deliveryRadiusKm ?? 10;
    if (insideRadius) {
      if (matchedZone && matchedZone.isActive && !matchedZone.isDeleted) {
        setSelectedZoneState(matchedZone);
      }
      setDeliveryType('delivery');
      setVerifiedLocation({
        confirmed: true,
        method: 'gps',
        selectedZoneId: matchedZone?.id,
        selectedAreaName: matchedZone
          ? matchedZone.name
          : `Within ${radiusKm} KM Radius (${distanceKm} KM away)`,
        distanceKm,
        insideRadius: true,
        checkedAt: new Date().toISOString()
      });
      markPopupSeen();
      setIsLocationModalOpen(false);
    } else {
      setVerifiedLocation({
        confirmed: false,
        method: 'gps',
        distanceKm,
        insideRadius: false,
        checkedAt: new Date().toISOString()
      });
    }
  };

  const resetLocationConfirmation = () => {
    setVerifiedLocation(null);
    setSelectedZoneState(activeZones[0] || null);
  };

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('asp_cart_items', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart items:', e);
    }
  }, [items]);

  const addToCart = (
    item: Product | Deal,
    options?: { size?: ProductSize; selectedAddons?: ProductAddon[]; specialInstructions?: string },
    quantity = 1,
    isDeal = false
  ) => {
    let unitPrice = isDeal ? (item as Deal).price : (item as Product).basePrice;

    if (!isDeal && options?.size) {
      unitPrice = options.size.price;
    }

    if (!isDeal && options?.selectedAddons && options.selectedAddons.length > 0) {
      const addonsSum = options.selectedAddons.reduce((sum, a) => sum + a.price, 0);
      unitPrice += addonsSum;
    }

    const sizePart = options?.size?.name || 'standard';
    const addonsPart = options?.selectedAddons?.map((a) => a.id).sort().join('_') || 'none';
    const cartItemId = `${item.id}-${sizePart}-${addonsPart}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.id === cartItemId);
      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex].quantity += quantity;
        return next;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: item.id,
          name: isDeal ? `${(item as Deal).dealNumber}: ${(item as Deal).title}` : (item as Product).name,
          category: isDeal ? 'Regular Deals' : (item as Product).category,
          price: unitPrice,
          quantity,
          image: item.image,
          options,
          isDeal
        };
        return [...prevItems, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponError('');
    setCouponSuccess('');
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Recalculate coupon if subtotal or items change
  useEffect(() => {
    if (couponCode && subtotal > 0) {
      const res = storageService.validateCoupon(couponCode, subtotal, { items });
      if (res.valid) {
        setCouponDiscount(res.discount);
        setCouponSuccess(res.message);
        setCouponError('');
      } else {
        setCouponDiscount(0);
        setCouponError(res.message);
        setCouponSuccess('');
      }
    } else {
      setCouponDiscount(0);
    }
  }, [subtotal, items, couponCode]);

  const applyCoupon = (
    code: string,
    customerInfo?: { customerPhone?: string; customerEmail?: string }
  ) => {
    if (!code.trim()) {
      setCouponError('Please enter a coupon code.');
      return false;
    }
    const res = storageService.validateCoupon(code, subtotal, {
      items,
      customerPhone: customerInfo?.customerPhone,
      customerEmail: customerInfo?.customerEmail
    });
    if (res.valid) {
      setCouponCode(res.coupon?.code || code.trim().toUpperCase());
      setCouponDiscount(res.discount);
      setCouponSuccess(res.message);
      setCouponError('');
      return true;
    } else {
      setCouponError(res.message);
      setCouponSuccess('');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponError('');
    setCouponSuccess('');
  };

  const deliveryFee =
    deliveryType === 'pickup'
      ? 0
      : restaurantSettings.freeDeliveryThreshold > 0 &&
        subtotal >= restaurantSettings.freeDeliveryThreshold
      ? 0
      : selectedZone?.fee ?? restaurantSettings.defaultDeliveryFee;

  const tax =
    restaurantSettings.taxPercentage > 0
      ? Math.round((subtotal * restaurantSettings.taxPercentage) / 100)
      : 0;
  const total = Math.max(0, subtotal - couponDiscount + deliveryFee + tax);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        couponCode,
        couponDiscount,
        couponError,
        couponSuccess,
        applyCoupon,
        removeCoupon,
        deliveryType,
        setDeliveryType,
        activeZones,
        restaurantSettings,
        selectedZone,
        setSelectedZone,
        verifiedLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        openLocationModal,
        dismissLocationModal,
        confirmManualZone,
        confirmGpsLocation,
        resetLocationConfirmation,
        subtotal,
        deliveryFee,
        tax,
        total,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
