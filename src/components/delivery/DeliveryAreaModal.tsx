import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  X,
  Store,
  Loader2,
  Compass,
  Info
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { DeliveryZone } from '../../types';
import {
  isWithinDeliveryRadius,
  findNearestActiveZone
} from '../../utils/deliveryGeo';
import { LOGO_URL } from '../../utils/assetUrl';

export const DeliveryAreaModal: React.FC = () => {
  const {
    isLocationModalOpen,
    dismissLocationModal,
    activeZones,
    restaurantSettings,
    selectedZone,
    verifiedLocation,
    confirmManualZone,
    confirmGpsLocation,
    setDeliveryType
  } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedZoneId, setHighlightedZoneId] = useState<string>(
    verifiedLocation?.selectedZoneId || selectedZone?.id || activeZones[0]?.id || ''
  );

  // Explicit geolocation check state
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoResult, setGeoResult] = useState<{
    status: 'inside' | 'outside' | 'denied' | 'unsupported';
    distanceKm?: number;
    matchedZone?: DeliveryZone | null;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isLocationModalOpen) {
      setHighlightedZoneId(
        verifiedLocation?.selectedZoneId || selectedZone?.id || activeZones[0]?.id || ''
      );
    }
  }, [isLocationModalOpen, verifiedLocation, selectedZone, activeZones]);

  const radiusKm = restaurantSettings.deliveryRadiusKm ?? 10;

  const filteredZones = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeZones;
    return activeZones.filter(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        (z.city && z.city.toLowerCase().includes(q)) ||
        (z.instructions && z.instructions.toLowerCase().includes(q))
    );
  }, [activeZones, searchQuery]);

  if (!isLocationModalOpen) return null;

  const handleCheckMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoResult({
        status: 'unsupported',
        message:
          'Browser location services are unavailable on this device. Please choose your delivery area manually from the list below.'
      });
      return;
    }

    setGeoLoading(true);
    setGeoResult(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const radiusEval = isWithinDeliveryRadius(latitude, longitude, restaurantSettings);
        const nearest = findNearestActiveZone(latitude, longitude, activeZones);

        if (radiusEval.isWithinRadius) {
          if (nearest) {
            setHighlightedZoneId(nearest.zone.id);
          }
          setGeoResult({
            status: 'inside',
            distanceKm: radiusEval.distanceKm,
            matchedZone: nearest?.zone || null,
            message: 'Great! We deliver to your location.'
          });
        } else {
          setGeoResult({
            status: 'outside',
            distanceKm: radiusEval.distanceKm,
            matchedZone: null,
            message:
              'Sorry! Your current location is outside our regular delivery area. Please check our available delivery locations.'
          });
        }
        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        const deniedMsg =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was declined. No problem — please select your delivery area manually below.'
            : 'Unable to pinpoint your exact GPS coordinates right now. Please select your delivery area manually below.';
        setGeoResult({
          status: 'denied',
          message: deniedMsg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const selectedAreaObject =
    activeZones.find((z) => z.id === highlightedZoneId) || null;

  const handleConfirmSelection = () => {
    if (geoResult?.status === 'inside' && typeof geoResult.distanceKm === 'number') {
      const zoneToApply = selectedAreaObject || geoResult.matchedZone || null;
      confirmGpsLocation(geoResult.distanceKm, true, zoneToApply);
      return;
    }
    if (selectedAreaObject) {
      confirmManualZone(selectedAreaObject);
    }
  };

  const handleSwitchToPickup = () => {
    setDeliveryType('pickup');
    dismissLocationModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-100 my-auto animate-fadeIn">
        {/* Top Accent Banner */}
        <div className="relative bg-gradient-to-br from-red-950/90 via-neutral-900 to-amber-950/50 border-b border-neutral-800 px-5 sm:px-7 pt-6 pb-5">
          <button
            type="button"
            onClick={dismissLocationModal}
            className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-950/70 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            aria-label="Close delivery location popup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-600 via-amber-600 to-amber-500 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden">
                <img
                  src={LOGO_URL}
                  alt={restaurantSettings.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>{radiusKm} KM Delivery Radius</span>
              </div>

              <h2
                id="delivery-modal-title"
                className="text-xl sm:text-2xl font-black tracking-tight text-white font-display"
              >
                WE DELIVER WITHIN {radiusKm} KM!
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Enjoy your favourite food delivered fresh to your doorstep. We currently deliver
                within a <strong className="text-amber-400">{radiusKm} KM</strong> radius and to
                our selected delivery areas.
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-neutral-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>
                    {restaurantSettings.address}, {restaurantSettings.city}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <Truck className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {restaurantSettings.deliveryAvailable
                      ? 'Delivery Active'
                      : 'Delivery Currently Paused'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Step 1: Explicit 10 KM Location Check */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>Check {radiusKm} KM Delivery Availability</span>
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Verify whether your current GPS location is within {radiusKm} KM of our kitchen.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCheckMyLocation}
                disabled={geoLoading}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/10 shrink-0 cursor-pointer"
              >
                {geoLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Checking Distance...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Check My Location</span>
                  </>
                )}
              </button>
            </div>

            {geoResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-fadeIn ${
                  geoResult.status === 'inside'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : geoResult.status === 'outside'
                    ? 'bg-red-500/10 border-red-500/40 text-red-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {geoResult.status === 'inside' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="font-bold text-white">{geoResult.message}</div>
                  {typeof geoResult.distanceKm === 'number' && (
                    <div className="text-[11px] opacity-90 font-mono">
                      Distance from branch: {geoResult.distanceKm} KM (Max radius: {radiusKm} KM)
                    </div>
                  )}
                  {geoResult.status === 'inside' && geoResult.matchedZone && (
                    <div className="text-[11px] text-emerald-200">
                      Nearest Delivery Area: <strong>{geoResult.matchedZone.name}</strong> (Fee: Rs.{' '}
                      {geoResult.matchedZone.fee} · {geoResult.matchedZone.estimatedMinutes})
                    </div>
                  )}
                  {geoResult.status === 'inside' && (
                    <button
                      type="button"
                      onClick={() =>
                        confirmGpsLocation(
                          geoResult.distanceKm || 0,
                          true,
                          selectedAreaObject || geoResult.matchedZone
                        )
                      }
                      className="mt-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Use Verified Location & Order
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Searchable Active Admin Delivery Areas */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Available Delivery Areas ({activeZones.length})
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Select your neighborhood to view exact delivery fee, minimum order, and ETA.
                </p>
              </div>

              {activeZones.length > 0 && (
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search area or city..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {activeZones.length === 0 ? (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-white">
                    Standard {radiusKm} KM Radius Delivery Coverage
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Use <strong>Check My Location</strong> above to verify if your address falls
                    within {radiusKm} KM of {restaurantSettings.address}, or choose{' '}
                    <strong>Takeaway / Counter Pickup</strong>.
                  </p>
                </div>
              </div>
            ) : filteredZones.length === 0 ? (
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-center text-xs text-neutral-400 space-y-2">
                <p>No active delivery area matched "{searchQuery}".</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-amber-400 hover:underline font-medium cursor-pointer"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {filteredZones.map((zone) => {
                  const isSelected = highlightedZoneId === zone.id;
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => setHighlightedZoneId(zone.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-white leading-snug">
                            {zone.name}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {zone.city || restaurantSettings.city} · Available Now
                          </div>
                        </div>
                        <span className="font-mono font-bold text-xs text-amber-400 shrink-0">
                          Rs. {zone.fee}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/80">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          <span>{zone.estimatedMinutes}</span>
                        </span>
                        <span className="font-mono">Min: Rs. {zone.minOrder}</span>
                      </div>

                      {zone.instructions && (
                        <div className="text-[10px] text-neutral-400 line-clamp-2 italic">
                          {zone.instructions}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <button
              type="button"
              onClick={dismissLocationModal}
              className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Browse Menu Only
            </button>
            {restaurantSettings.pickupAvailable && (
              <>
                <span className="text-neutral-700">·</span>
                <button
                  type="button"
                  onClick={handleSwitchToPickup}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Counter Pickup</span>
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleConfirmSelection}
            disabled={!selectedAreaObject && geoResult?.status !== 'inside'}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/15 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Delivery Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
