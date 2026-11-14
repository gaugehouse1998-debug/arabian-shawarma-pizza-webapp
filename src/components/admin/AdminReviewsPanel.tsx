import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  CheckCircle2,
  XCircle,
  EyeOff,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { Review, ReviewStatus } from '../../types';
import { storageService } from '../../services/storageService';

interface AdminReviewsPanelProps {
  reviews: Review[];
  adminEmail: string;
  onDeleteReview: (rev: Review) => void;
  onFeedback: (message: string, type?: 'success' | 'info' | 'error') => void;
  onReviewsChanged: () => void;
}

const STATUS_BADGE: Record<ReviewStatus, string> = {
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  hidden: 'bg-neutral-800 text-neutral-300 border-neutral-700'
};

export const AdminReviewsPanel: React.FC<AdminReviewsPanelProps> = ({
  reviews,
  adminEmail,
  onDeleteReview,
  onFeedback,
  onReviewsChanged
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const stats = useMemo(() => {
    const approved = reviews.filter((r) => (r.status || (r.isApproved ? 'approved' : 'pending')) === 'approved');
    const pending = reviews.filter((r) => (r.status || (r.isApproved ? 'approved' : 'pending')) === 'pending');
    const hiddenOrRejected = reviews.filter((r) => {
      const s = r.status || (r.isApproved ? 'approved' : 'pending');
      return s === 'rejected' || s === 'hidden';
    });
    const avgApproved =
      approved.length > 0
        ? (approved.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / approved.length).toFixed(1)
        : null;
    return {
      total: reviews.length,
      approved: approved.length,
      pending: pending.length,
      hiddenOrRejected: hiddenOrRejected.length,
      avgApproved
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((rev) => {
      const revStatus: ReviewStatus = rev.status || (rev.isApproved ? 'approved' : 'pending');
      if (statusFilter !== 'all' && revStatus !== statusFilter) return false;
      if (ratingFilter !== 'all' && rev.rating !== ratingFilter) return false;

      if (!q) return true;
      return (
        rev.customerName.toLowerCase().includes(q) ||
        rev.comment.toLowerCase().includes(q) ||
        (rev.orderId || '').toLowerCase().includes(q) ||
        (rev.itemOrdered || '').toLowerCase().includes(q)
      );
    });
  }, [reviews, search, statusFilter, ratingFilter]);

  const handleModerate = (rev: Review, status: ReviewStatus) => {
    storageService.moderateReview(rev.id, status, adminEmail);
    onReviewsChanged();
    const labelMap: Record<ReviewStatus, string> = {
      approved: 'approved and published to website',
      rejected: 'rejected',
      hidden: 'hidden from public website',
      pending: 'moved to pending moderation'
    };
    onFeedback(`Review by "${rev.customerName}" ${labelMap[status]}.`);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-5">
      {/* Header & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-white text-base font-display">
            Customer Reviews Moderation ({reviews.length})
          </h2>
          <p className="text-xs text-neutral-400">
            Only approved reviews are displayed on the public storefront. Moderate customer order reviews below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
            Pending: {stats.pending}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
            Approved: {stats.approved}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-semibold">
            Hidden/Rejected: {stats.hiddenOrRejected}
          </span>
          {stats.avgApproved && (
            <span className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-amber-500/30 text-amber-400 font-mono font-bold inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {stats.avgApproved} Avg
            </span>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-neutral-800">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(['all', 'pending', 'approved', 'rejected', 'hidden'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize cursor-pointer transition-colors ${
                statusFilter === status
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={ratingFilter}
            onChange={(e) =>
              setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Star Ratings</option>
            <option value={5}>5 Stars (★★★★★)</option>
            <option value={4}>4 Stars (★★★★☆)</option>
            <option value={3}>3 Stars (★★★☆☆)</option>
            <option value={2}>2 Stars (★★☆☆☆)</option>
            <option value={1}>1 Star (★☆☆☆☆)</option>
          </select>

          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, text, or #ASP-..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Review List */}
      {filteredReviews.length === 0 ? (
        <div className="p-10 text-center bg-neutral-950/60 border border-neutral-800 rounded-2xl space-y-2">
          <MessageSquare className="w-6 h-6 text-neutral-600 mx-auto" />
          <p className="text-xs text-neutral-400">
            No customer reviews match your filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => {
            const currentStatus: ReviewStatus =
              rev.status || (rev.isApproved ? 'approved' : 'pending');
            return (
              <div
                key={rev.id}
                className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-xs">{rev.customerName}</span>
                    <span className="text-amber-400 font-mono text-xs">
                      {'★'.repeat(rev.rating)}
                      <span className="text-neutral-700">{'★'.repeat(Math.max(0, 5 - rev.rating))}</span>
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${STATUS_BADGE[currentStatus]}`}
                    >
                      {currentStatus}
                    </span>
                    {rev.orderId && (
                      <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Order #{rev.orderId}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-neutral-500 font-mono">
                    {rev.createdAt
                      ? new Date(rev.createdAt).toLocaleString()
                      : rev.date}
                  </div>
                </div>

                <p className="text-xs text-neutral-200 leading-relaxed">"{rev.comment}"</p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-neutral-800/80 text-[11px]">
                  <div className="text-neutral-500">
                    Ordered: <span className="text-neutral-300">{rev.itemOrdered || 'Menu Order'}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {currentStatus !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleModerate(rev, 'approved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                    )}

                    {currentStatus !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => handleModerate(rev, 'rejected')}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    )}

                    {currentStatus !== 'hidden' && (
                      <button
                        type="button"
                        onClick={() => handleModerate(rev, 'hidden')}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <EyeOff className="w-3 h-3" />
                        <span>Hide</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteReview(rev)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-neutral-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      title="Delete Review Permanently"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
