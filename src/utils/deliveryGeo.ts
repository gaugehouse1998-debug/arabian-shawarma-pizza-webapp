import { DeliveryZone, RestaurantSettings } from '../types';

export const DEFAULT_RESTAURANT_LAT = 31.4882;
export const DEFAULT_RESTAURANT_LNG = 74.3652;
export const DEFAULT_DELIVERY_RADIUS_KM = 10;

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Computes accurate great-circle Haversine distance in kilometers between two GPS coordinates.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return Infinity;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawKm = EARTH_RADIUS_KM * c;
  return Math.round(rawKm * 100) / 100;
}

export interface RadiusCheckResult {
  distanceKm: number;
  isWithinRadius: boolean;
  radiusKm: number;
  restaurantLat: number;
  restaurantLng: number;
}

/**
 * Evaluates whether customer coordinates lie inside the configured restaurant delivery radius (default 10 KM).
 */
export function isWithinDeliveryRadius(
  userLat: number,
  userLng: number,
  settings: Partial<RestaurantSettings>,
  overrideRadiusKm?: number
): RadiusCheckResult {
  const restaurantLat =
    typeof settings.latitude === 'number' && Number.isFinite(settings.latitude)
      ? settings.latitude
      : DEFAULT_RESTAURANT_LAT;
  const restaurantLng =
    typeof settings.longitude === 'number' && Number.isFinite(settings.longitude)
      ? settings.longitude
      : DEFAULT_RESTAURANT_LNG;
  const radiusKm =
    typeof overrideRadiusKm === 'number' && overrideRadiusKm > 0
      ? overrideRadiusKm
      : typeof settings.deliveryRadiusKm === 'number' && settings.deliveryRadiusKm > 0
      ? settings.deliveryRadiusKm
      : DEFAULT_DELIVERY_RADIUS_KM;

  const distanceKm = calculateDistanceKm(restaurantLat, restaurantLng, userLat, userLng);
  return {
    distanceKm,
    isWithinRadius: distanceKm <= radiusKm,
    radiusKm,
    restaurantLat,
    restaurantLng
  };
}

export function hasZoneCoordinates(zone: DeliveryZone): boolean {
  return (
    typeof zone.latitude === 'number' &&
    Number.isFinite(zone.latitude) &&
    typeof zone.longitude === 'number' &&
    Number.isFinite(zone.longitude)
  );
}

/**
 * Finds the nearest active delivery zone with coordinates relative to user GPS coordinates.
 */
export function findNearestActiveZone(
  userLat: number,
  userLng: number,
  activeZones: DeliveryZone[]
): { zone: DeliveryZone; distanceKm: number } | null {
  let best: { zone: DeliveryZone; distanceKm: number } | null = null;
  for (const zone of activeZones) {
    if (!zone.isActive || zone.isDeleted || !hasZoneCoordinates(zone)) continue;
    const dist = calculateDistanceKm(userLat, userLng, zone.latitude!, zone.longitude!);
    if (!best || dist < best.distanceKm) {
      best = { zone, distanceKm: dist };
    }
  }
  return best;
}
