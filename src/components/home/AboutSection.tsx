import React, { useState } from 'react';
import { MapPin, Phone, Clock, MessageSquare, Star, Send, ShieldCheck, Heart, Award, Utensils, Navigation } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useCart } from '../../context/CartContext';
import { Review } from '../../types';

export const AboutSection: React.FC = () => {
  const { restaurantSettings: settings, activeZones, openLocationModal } = useCart();
  const reviews = storageService.getReviews().filter((r) => r.isApproved);

  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [itemOrdered, setItemOrdered] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      customerName: customerName.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      isApproved: true,
      itemOrdered: itemOrdered.trim() || 'Menu Item'
    };

    storageService.saveReview(newRev);
    setSubmitted(true);
    setCustomerName('');
    setComment('');
    setItemOrdered('');
  };

  return (
    <section className="py-16 bg-neutral-950 border-t border-neutral-900" id="about-section">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-16">
        {/* Why Choose Us */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Unmatched Culinary Standards</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Why Lahore Chooses Arabian Shawarma & Pizza
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              We bring together traditional Middle Eastern vertical spit roasting and Italian-style hand-tossed artisan pizzas right here in Walton Cantt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base font-display">
                Original Arabian Marinade & Toum
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Authentic rotating vertical spit roasted chicken shaved to perfection and paired with our house-made velvety garlic toum sauce, crunchy dill pickles, and soft flatbread.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base font-display">
                100% Mozzarella & Stuffed Crusts
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Never compromised with analogue cheese. We use 100% pure mozzarella, freshly rolled hand-tossed dough, and our signature Crown Crust and Cheese Lower stuffed pockets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base font-display">
                Late Night Hot Food Until 3:00 AM
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Craving late night pizza, zinger burgers, or jumbo shawarmas? Our kitchen ovens stay blazing until 3:00 AM every single night of the week with insulated thermal delivery bags.
              </p>
            </div>
          </div>
        </div>

        {/* Location & Direct Contact Card */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Visit Our Cavalry Ground Branch</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Dine In, Takeaway & Rapid Home Delivery
              </h2>
              <div className="space-y-2 text-xs sm:text-sm text-neutral-300">
                <p>
                  <strong>Address:</strong> {settings.address}, {settings.city}
                </p>
                <p>
                  <strong>Timings:</strong> 1:00 PM – 3:00 AM (Open 7 Days a week)
                </p>
                <p className="font-mono">
                  <strong>Direct Delivery Hotlines:</strong>{' '}
                  <a href={`tel:${settings.phone1}`} className="text-amber-400 hover:underline">
                    {settings.phone1}
                  </a>{' '}
                  / {' '}
                  <a href={`tel:${settings.phone2}`} className="text-amber-400 hover:underline">
                    {settings.phone2}
                  </a>
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/923222222461?text=Hello%20Arabian%20Shawarma,%20I%20would%20like%20to%20order.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Order Directly via WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 bg-neutral-950/80 border border-neutral-800 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold uppercase tracking-wider text-[11px] text-neutral-400">
                  Delivery Areas Covered ({settings.deliveryRadiusKm ?? 10} KM)
                </h3>
                <button
                  type="button"
                  onClick={openLocationModal}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Check My Location</span>
                </button>
              </div>
              {activeZones.length === 0 ? (
                <p className="text-neutral-400 leading-relaxed">
                  We deliver within a {settings.deliveryRadiusKm ?? 10} KM radius around {settings.address}. Click{' '}
                  <button
                    type="button"
                    onClick={openLocationModal}
                    className="text-amber-400 underline cursor-pointer"
                  >
                    Check My Location
                  </button>{' '}
                  to verify eligibility.
                </p>
              ) : (
                <ul className="space-y-2 text-neutral-300 max-h-48 overflow-y-auto pr-1">
                  {activeZones.map((zone) => (
                    <li key={zone.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        {zone.name}
                        {zone.city ? ` (${zone.city})` : ''}
                      </span>
                      <span className="font-mono text-amber-400 font-semibold shrink-0">
                        {zone.estimatedMinutes} · Rs. {zone.fee}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-500">
                All food delivered in heated thermal bags within {settings.deliveryRadiusKm ?? 10} KM to guarantee piping hot crusts and juicy burgers.
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Testimonials */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-900">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>Verified Customer Feedback</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
                What Our Customers Say
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center text-amber-400 text-sm">
                    {'★'.repeat(rev.rating)}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-semibold text-white block">{rev.customerName}</span>
                    <span className="text-neutral-500 font-mono">{rev.date}</span>
                  </div>
                  <span className="text-neutral-400">{rev.itemOrdered}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Review Form */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm font-display">
                Leave a Dining Review
              </h3>
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5 hover:scale-110 transition-transform"
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {submitted ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl text-center">
                Thank you! Your review has been added and published.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name *"
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={itemOrdered}
                    onChange={(e) => setItemOrdered(e.target.value)}
                    placeholder="Dish Ordered (e.g. Tikka Pizza)"
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <textarea
                  required
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with our food and delivery..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
                <div className="text-right">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
