import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  deleteDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { handleFirestoreError, OperationType } from './deliveryFirestoreService';
import { Coupon, CouponRedemption, Deal, Review } from '../types';

const DEALS_COLLECTION = 'deals';
const COUPONS_COLLECTION = 'coupons';
const REDEMPTIONS_COLLECTION = 'couponRedemptions';
const REVIEWS_COLLECTION = 'reviews';

function sanitizeDealForFirestore(deal: Deal): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: String(deal.id).slice(0, 128),
    dealNumber: String(deal.dealNumber).trim().slice(0, 40),
    title: String(deal.title).trim().slice(0, 160),
    description: String(deal.description || '').trim().slice(0, 600),
    category: String(deal.category || 'Regular Deals').trim().slice(0, 80),
    items: Array.isArray(deal.items) ? deal.items.slice(0, 40) : [],
    price: Math.max(1, Number(deal.price) || 1),
    image: String(deal.image || '').slice(0, 1800000),
    isActive: Boolean(deal.isActive),
    isFeatured: Boolean(deal.isFeatured),
    isArchived: Boolean(deal.isArchived),
    isDeleted: Boolean(deal.isDeleted)
  };
  if (Array.isArray(deal.includedItems)) {
    payload.includedItems = deal.includedItems.slice(0, 40);
  }
  if (typeof deal.originalPrice === 'number' && Number.isFinite(deal.originalPrice) && deal.originalPrice >= 0) {
    payload.originalPrice = deal.originalPrice;
  }
  if (deal.discountLabel) payload.discountLabel = String(deal.discountLabel).slice(0, 80);
  if (typeof deal.displayOrder === 'number' && Number.isFinite(deal.displayOrder) && deal.displayOrder >= 0) {
    payload.displayOrder = deal.displayOrder;
  }
  if (deal.badge) payload.badge = String(deal.badge).slice(0, 60);
  if (deal.startDate) payload.startDate = String(deal.startDate).slice(0, 64);
  if (deal.expiryDate) payload.expiryDate = String(deal.expiryDate).slice(0, 64);
  if (deal.archivedAt) payload.archivedAt = String(deal.archivedAt).slice(0, 64);
  if (deal.createdAt) payload.createdAt = String(deal.createdAt).slice(0, 64);
  if (deal.updatedAt) payload.updatedAt = String(deal.updatedAt).slice(0, 64);
  if (deal.deletedAt) payload.deletedAt = String(deal.deletedAt).slice(0, 64);
  if (deal.deletedBy) payload.deletedBy = String(deal.deletedBy).slice(0, 128);
  return payload;
}

function sanitizeCouponForFirestore(coupon: Coupon): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    code: String(coupon.code).trim().toUpperCase().slice(0, 64),
    discountType: coupon.discountType === 'fixed' ? 'fixed' : 'percentage',
    discountValue: Math.max(1, Number(coupon.discountValue) || 1),
    minOrderValue: Math.max(0, Number(coupon.minOrderValue) || 0),
    timesUsed: Math.max(0, Number(coupon.timesUsed) || 0),
    isActive: Boolean(coupon.isActive),
    isDeleted: Boolean(coupon.isDeleted)
  };
  if (coupon.title) payload.title = String(coupon.title).trim().slice(0, 140);
  if (coupon.description) payload.description = String(coupon.description).trim().slice(0, 500);
  if (typeof coupon.maxDiscount === 'number' && coupon.maxDiscount >= 0) {
    payload.maxDiscount = coupon.maxDiscount;
  }
  if (coupon.startDate) payload.startDate = String(coupon.startDate).slice(0, 64);
  if (coupon.expiryDate) payload.expiryDate = String(coupon.expiryDate).slice(0, 64);
  if (typeof coupon.usageLimit === 'number' && coupon.usageLimit >= 1) {
    payload.usageLimit = coupon.usageLimit;
  }
  if (typeof coupon.perCustomerLimit === 'number' && coupon.perCustomerLimit >= 1) {
    payload.perCustomerLimit = coupon.perCustomerLimit;
  }
  if (Array.isArray(coupon.applicableCategories) && coupon.applicableCategories.length > 0) {
    payload.applicableCategories = coupon.applicableCategories.slice(0, 40);
  }
  if (Array.isArray(coupon.applicableProductIds) && coupon.applicableProductIds.length > 0) {
    payload.applicableProductIds = coupon.applicableProductIds.slice(0, 100);
  }
  if (coupon.createdAt) payload.createdAt = String(coupon.createdAt).slice(0, 64);
  if (coupon.updatedAt) payload.updatedAt = String(coupon.updatedAt).slice(0, 64);
  if (coupon.deletedAt) payload.deletedAt = String(coupon.deletedAt).slice(0, 64);
  if (coupon.deletedBy) payload.deletedBy = String(coupon.deletedBy).slice(0, 128);
  return payload;
}

function sanitizeReviewForFirestore(review: Review): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: String(review.id).slice(0, 128),
    customerName: String(review.customerName).trim().slice(0, 120),
    rating: Math.min(5, Math.max(1, Math.round(Number(review.rating) || 5))),
    comment: String(review.comment).trim().slice(0, 1200),
    date: String(review.date).slice(0, 32),
    status: review.status || (review.isApproved ? 'approved' : 'pending'),
    isApproved: Boolean(review.isApproved)
  };
  if (review.orderId) payload.orderId = String(review.orderId).slice(0, 64);
  if (review.createdAt) payload.createdAt = String(review.createdAt).slice(0, 64);
  if (review.itemOrdered) payload.itemOrdered = String(review.itemOrdered).slice(0, 200);
  if (review.moderatedAt) payload.moderatedAt = String(review.moderatedAt).slice(0, 64);
  if (review.moderatedBy) payload.moderatedBy = String(review.moderatedBy).slice(0, 128);
  return payload;
}

export async function syncDealToFirestore(deal: Deal): Promise<boolean> {
  if (typeof window === 'undefined' || !auth.currentUser) return false;
  const path = `${DEALS_COLLECTION}/${deal.id}`;
  try {
    await setDoc(doc(db, DEALS_COLLECTION, deal.id), sanitizeDealForFirestore(deal), { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
    return false;
  }
}

export async function syncDealsBatchToFirestore(deals: Deal[]): Promise<boolean> {
  if (typeof window === 'undefined' || !auth.currentUser || deals.length === 0) return false;
  try {
    const batch = writeBatch(db);
    deals.forEach((deal) => {
      batch.set(doc(db, DEALS_COLLECTION, deal.id), sanitizeDealForFirestore(deal), { merge: true });
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, DEALS_COLLECTION, false);
    return false;
  }
}

export async function deleteDealFromFirestore(dealId: string): Promise<boolean> {
  if (typeof window === 'undefined' || !auth.currentUser) return false;
  const path = `${DEALS_COLLECTION}/${dealId}`;
  try {
    await deleteDoc(doc(db, DEALS_COLLECTION, dealId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path, false);
    return false;
  }
}

export async function syncCouponToFirestore(coupon: Coupon): Promise<boolean> {
  if (typeof window === 'undefined' || !auth.currentUser) return false;
  const code = coupon.code.trim().toUpperCase();
  const path = `${COUPONS_COLLECTION}/${code}`;
  try {
    await setDoc(doc(db, COUPONS_COLLECTION, code), sanitizeCouponForFirestore(coupon), { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
    return false;
  }
}

export async function deleteCouponFromFirestore(code: string): Promise<boolean> {
  if (typeof window === 'undefined' || !auth.currentUser) return false;
  const norm = code.trim().toUpperCase();
  const path = `${COUPONS_COLLECTION}/${norm}`;
  try {
    await deleteDoc(doc(db, COUPONS_COLLECTION, norm));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path, false);
    return false;
  }
}

export async function syncCouponRedemptionToFirestore(redemption: CouponRedemption): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const path = `${REDEMPTIONS_COLLECTION}/${redemption.id}`;
  try {
    await setDoc(doc(db, REDEMPTIONS_COLLECTION, redemption.id), {
      id: String(redemption.id).slice(0, 128),
      couponCode: String(redemption.couponCode).toUpperCase().slice(0, 64),
      orderId: String(redemption.orderId).slice(0, 64),
      customerPhone: String(redemption.customerPhone).slice(0, 40),
      ...(redemption.customerEmail ? { customerEmail: String(redemption.customerEmail).slice(0, 160) } : {}),
      discountAmount: Math.max(0, Number(redemption.discountAmount) || 0),
      orderSubtotal: Math.max(1, Number(redemption.orderSubtotal) || 1),
      redeemedAt: String(redemption.redeemedAt).slice(0, 64)
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path, false);
    return false;
  }
}

export async function syncReviewToFirestore(review: Review): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const path = `${REVIEWS_COLLECTION}/${review.id}`;
  try {
    await setDoc(doc(db, REVIEWS_COLLECTION, review.id), sanitizeReviewForFirestore(review), { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
    return false;
  }
}

export async function deleteReviewFromFirestore(reviewId: string): Promise<boolean> {
  if (typeof window === 'undefined' || !auth.currentUser) return false;
  const path = `${REVIEWS_COLLECTION}/${reviewId}`;
  try {
    await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path, false);
    return false;
  }
}

export function subscribeCatalogFromFirestore(callbacks: {
  onDeals?: (deals: Deal[]) => void;
  onCoupons?: (coupons: Coupon[]) => void;
  onApprovedReviews?: (reviews: Review[]) => void;
}): () => void {
  if (typeof window === 'undefined') return () => {};

  const unsubs: Array<() => void> = [];

  if (callbacks.onDeals) {
    unsubs.push(
      onSnapshot(
        collection(db, DEALS_COLLECTION),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ ...(d.data() as Deal), id: d.id }));
            callbacks.onDeals?.(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, DEALS_COLLECTION, false);
        }
      )
    );
  }

  if (callbacks.onCoupons) {
    unsubs.push(
      onSnapshot(
        collection(db, COUPONS_COLLECTION),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ ...(d.data() as Coupon), code: d.id }));
            callbacks.onCoupons?.(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, COUPONS_COLLECTION, false);
        }
      )
    );
  }

  if (callbacks.onApprovedReviews) {
    const approvedQuery = query(collection(db, REVIEWS_COLLECTION), where('isApproved', '==', true));
    unsubs.push(
      onSnapshot(
        approvedQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ ...(d.data() as Review), id: d.id }));
            callbacks.onApprovedReviews?.(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, REVIEWS_COLLECTION, false);
        }
      )
    );
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}
