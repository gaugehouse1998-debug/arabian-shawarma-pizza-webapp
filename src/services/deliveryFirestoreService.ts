import {
  collection,
  doc,
  getDocFromServer,
  getDocs,
  onSnapshot,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { DeliveryZone, RestaurantSettings } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  rethrow = false
): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  if (rethrow) {
    throw new Error(JSON.stringify(errInfo));
  }
  return errInfo;
}

let connectionTested = false;

/**
 * Validates initial Firestore server connectivity on application boot.
 */
export async function testFirestoreConnection(): Promise<void> {
  if (connectionTested || typeof window === 'undefined') return;
  connectionTested = true;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return;
  }
  try {
    await getDocFromServer(doc(db, 'restaurantSettings', 'main'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore operating in offline cache mode until backend connection resumes.');
    }
  }
}

const ZONES_COLLECTION = 'deliveryZones';
const SETTINGS_COLLECTION = 'restaurantSettings';
const MAIN_SETTINGS_DOC = 'main';

function sanitizeZoneForFirestore(zone: DeliveryZone): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: String(zone.id).slice(0, 128),
    name: String(zone.name).trim().slice(0, 140),
    city: String(zone.city || 'Lahore').trim().slice(0, 80),
    fee: Math.max(0, Number(zone.fee) || 0),
    estimatedMinutes: String(zone.estimatedMinutes || '30-40 mins').trim().slice(0, 60),
    minOrder: Math.max(0, Number(zone.minOrder) || 0),
    instructions: String(zone.instructions || '').trim().slice(0, 400),
    isActive: Boolean(zone.isActive),
    isDeleted: Boolean(zone.isDeleted)
  };
  if (typeof zone.latitude === 'number' && Number.isFinite(zone.latitude)) {
    payload.latitude = zone.latitude;
  }
  if (typeof zone.longitude === 'number' && Number.isFinite(zone.longitude)) {
    payload.longitude = zone.longitude;
  }
  if (typeof zone.radiusKm === 'number' && Number.isFinite(zone.radiusKm) && zone.radiusKm > 0) {
    payload.radiusKm = zone.radiusKm;
  }
  if (zone.deletedAt) payload.deletedAt = String(zone.deletedAt).slice(0, 64);
  if (zone.deletedBy) payload.deletedBy = String(zone.deletedBy).slice(0, 128);
  return payload;
}

function sanitizeSettingsForFirestore(settings: RestaurantSettings): Record<string, unknown> {
  return {
    name: String(settings.name).slice(0, 140),
    tagline: String(settings.tagline).slice(0, 240),
    address: String(settings.address).slice(0, 300),
    city: String(settings.city).slice(0, 80),
    latitude: typeof settings.latitude === 'number' && Number.isFinite(settings.latitude) ? settings.latitude : 31.4882,
    longitude: typeof settings.longitude === 'number' && Number.isFinite(settings.longitude) ? settings.longitude : 74.3652,
    deliveryRadiusKm:
      typeof settings.deliveryRadiusKm === 'number' && settings.deliveryRadiusKm > 0
        ? settings.deliveryRadiusKm
        : 10,
    phone1: String(settings.phone1).slice(0, 40),
    phone2: String(settings.phone2).slice(0, 40),
    whatsapp: String(settings.whatsapp).slice(0, 40),
    email: String(settings.email).slice(0, 120),
    openingTime: String(settings.openingTime).slice(0, 20),
    closingTime: String(settings.closingTime).slice(0, 20),
    isOpen: Boolean(settings.isOpen),
    currency: String(settings.currency).slice(0, 10),
    currencySymbol: String(settings.currencySymbol).slice(0, 10),
    taxPercentage: Number(settings.taxPercentage) || 0,
    defaultDeliveryFee: Number(settings.defaultDeliveryFee) || 0,
    freeDeliveryThreshold: Number(settings.freeDeliveryThreshold) || 0,
    minimumOrderAmount: Number(settings.minimumOrderAmount) || 0,
    deliveryAvailable: Boolean(settings.deliveryAvailable),
    pickupAvailable: Boolean(settings.pickupAvailable),
    heroHeadline: String(settings.heroHeadline).slice(0, 240),
    heroSubheadline: String(settings.heroSubheadline).slice(0, 400),
    announcement: String(settings.announcement).slice(0, 300)
  };
}

export async function syncDeliveryZoneToFirestore(zone: DeliveryZone): Promise<boolean> {
  if (typeof window === 'undefined' || !auth.currentUser) {
    return false;
  }
  const path = `${ZONES_COLLECTION}/${zone.id}`;
  try {
    await setDoc(doc(db, ZONES_COLLECTION, zone.id), sanitizeZoneForFirestore(zone), { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
    return false;
  }
}

export async function deleteDeliveryZoneFromFirestore(zoneId: string): Promise<boolean> {
  if (typeof window === 'undefined' || !auth.currentUser) {
    return false;
  }
  const path = `${ZONES_COLLECTION}/${zoneId}`;
  try {
    await deleteDoc(doc(db, ZONES_COLLECTION, zoneId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path, false);
    return false;
  }
}

export async function syncRestaurantSettingsToFirestore(settings: RestaurantSettings): Promise<boolean> {
  if (typeof window === 'undefined' || !auth.currentUser) {
    return false;
  }
  const path = `${SETTINGS_COLLECTION}/${MAIN_SETTINGS_DOC}`;
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, MAIN_SETTINGS_DOC), sanitizeSettingsForFirestore(settings), {
      merge: true
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
    return false;
  }
}

export async function fetchDeliveryZonesFromFirestore(): Promise<DeliveryZone[] | null> {
  if (typeof window === 'undefined') return null;
  try {
    const snap = await getDocs(collection(db, ZONES_COLLECTION));
    if (snap.empty) return null;
    return snap.docs.map((d) => ({ ...(d.data() as DeliveryZone), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ZONES_COLLECTION, false);
    return null;
  }
}

export function subscribeDeliveryConfigFromFirestore(
  onZones: (zones: DeliveryZone[]) => void,
  onSettings: (settings: Partial<RestaurantSettings>) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  testFirestoreConnection();

  const unsubZones = onSnapshot(
    collection(db, ZONES_COLLECTION),
    (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ ...(d.data() as DeliveryZone), id: d.id }));
        onZones(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, ZONES_COLLECTION, false);
    }
  );

  const unsubSettings = onSnapshot(
    doc(db, SETTINGS_COLLECTION, MAIN_SETTINGS_DOC),
    (snapshot) => {
      if (snapshot.exists()) {
        onSettings(snapshot.data() as Partial<RestaurantSettings>);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${MAIN_SETTINGS_DOC}`, false);
    }
  );

  return () => {
    unsubZones();
    unsubSettings();
  };
}
