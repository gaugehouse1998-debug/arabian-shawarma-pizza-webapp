import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle2, MessageSquareHeart, Sparkles } from 'lucide-react';
import { Order } from '../../types';
import { storageService } from '../../services/storageService';

interface ReviewPromptModalProps {
  order: Order;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmitted: (orderId: string) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair Experience',
  3: 'Good Food',
  4: 'Great Experience',
  5: 'Outstanding!'
};

export const ReviewPromptModal: React.FC<ReviewPromptModalProps> = ({
  order,
  isOpen,
  onDismiss,
  onSubmitted
}) => {
  const [customerName, setCustomerName] = useState(order.customer.name || '');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setCustomerName(order.customer.name || '');
    setRating(5);
    setHoverRating(0);
    setComment('');
    setError('');
    setIsSuccess(false);
  }, [order.id, order.customer.name]);

  if (!isOpen) return null;

  const itemsSummary =
    order.items.length > 0
      ? order.items
          .slice(0, 3)
          .map((i) => i.name)
          .join(', ') + (order.items.length > 3 ? ` +${order.items.length - 3} more` : '')
      : 'Menu Order';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating from 1 to 5.');
      return;
    }
    if (!comment.trim()) {
      setError('Please share a quick note about your experience.');
      return;
    }

    setIsSubmitting(true);
    try {
      storageService.submitOrderReview({
        orderId: order.id,
        customerName: customerName.trim(),
        rating,
        comment: comment.trim(),
        itemOrdered: itemsSummary
      });
      setIsSuccess(true);
      onSubmitted(order.id);
      setTimeout(() => {
        onDismiss();
      }, 1700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save review right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStar = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onDismiss();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-prompt-heading"
    >
      <div className="bg-[#191919] border border-amber-500/30 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-[#FFF7ED] relative">
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#EA580C] via-[#F59E0B] to-[#EA580C]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close review popup"
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold font-display text-[#FFF7ED]">
                Shukriya, {customerName}!
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Your feedback for Order <span className="font-mono text-amber-400">#{order.id}</span> has been received and sent for moderation.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
            {/* Header */}
            <div className="space-y-2 pr-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EA580C]/15 border border-[#EA580C]/30 text-[11px] font-semibold text-[#F59E0B]">
                <MessageSquareHeart className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Order #{order.id} Confirmed</span>
              </div>
              <h2
                id="review-prompt-heading"
                className="text-2xl font-extrabold font-display text-[#FFF7ED] tracking-tight"
              >
                Enjoyed Your Experience?
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                We would love to hear your feedback about Arabian Shawarma &amp; Pizza.
              </p>
            </div>

            {/* Order Items Recap */}
            <div className="px-3.5 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between gap-2">
              <span className="truncate">
                <strong className="text-neutral-200">Ordered:</strong> {itemsSummary}
              </span>
              <span className="font-mono text-amber-400 shrink-0">
                Rs. {order.total.toLocaleString()}
              </span>
            </div>

            {/* Interactive Star Rating */}
            <div className="space-y-2 text-center py-2 px-3 rounded-2xl bg-neutral-900/70 border border-neutral-800">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                Tap to Rate Your Meal
              </div>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeStar;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      className="p-1.5 rounded-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isFilled
                            ? 'text-[#F59E0B] fill-[#F59E0B] drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                            : 'text-neutral-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="text-xs font-semibold text-[#F59E0B] flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{RATING_LABELS[activeStar] || 'Select Rating'} ({activeStar}/5)</span>
              </div>
            </div>

            {/* Customer Name (Editable) */}
            <div className="space-y-1.5 text-xs">
              <label htmlFor="review-customer-name" className="text-neutral-300 font-medium block">
                Your Name *
              </label>
              <input
                id="review-customer-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-[#FFF7ED] placeholder-neutral-500 focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            {/* Review Comment */}
            <div className="space-y-1.5 text-xs">
              <label htmlFor="review-comment" className="text-neutral-300 font-medium block">
                Your Review *
              </label>
              <textarea
                id="review-comment"
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with us..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-xs text-[#FFF7ED] placeholder-neutral-500 focus:outline-none focus:border-[#F59E0B] resize-none"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={onDismiss}
                disabled={isSubmitting}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex-[1.5] py-2.5 px-5 bg-gradient-to-r from-[#EA580C] to-[#F59E0B] hover:brightness-110 text-neutral-950 font-extrabold text-xs rounded-xl shadow-lg shadow-[#EA580C]/20 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
