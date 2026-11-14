import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  Bike,
  Sparkles,
  Phone,
  Printer,
  ExternalLink,
  AlertCircle,
  Star,
  MessageSquareHeart
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Order, OrderStatus } from '../../types';
import { OrderInvoiceModal } from '../invoice/OrderInvoiceModal';
import { ReviewPromptModal } from '../reviews/ReviewPromptModal';

interface OrderTrackingPageProps {
  initialOrderId?: string;
  onNavigateHome: () => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'order_placed', label: 'Order Placed', icon: Clock },
  { status: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
  { status: 'preparing', label: 'In Kitchen', icon: ChefHat },
  { status: 'ready_for_pickup', label: 'Ready for Dispatch', icon: PackageCheck },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
  { status: 'delivered', label: 'Delivered', icon: Sparkles }
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderId = '',
  onNavigateHome
}) => {
  const [searchId, setSearchId] = useState(initialOrderId);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasReviewForActive, setHasReviewForActive] = useState(false);

  // Load initial order if provided or listen for live changes
  useEffect(() => {
    if (initialOrderId) {
      const order = storageService.getOrderById(initialOrderId);
      if (order) {
        setActiveOrder(order);
        setHasSearched(true);
        setHasReviewForActive(storageService.hasReviewForOrder(order.id));
      }
    } else {
      // Find latest order from storage as convenient default
      const orders = storageService.getOrders();
      if (orders.length > 0) {
        setActiveOrder(orders[0]);
        setSearchId(orders[0].id);
        setHasSearched(true);
        setHasReviewForActive(storageService.hasReviewForOrder(orders[0].id));
      }
    }
  }, [initialOrderId]);

  // Listen to storage broadcast updates so status and review status refresh in real-time
  useEffect(() => {
    const handleUpdate = () => {
      if (activeOrder) {
        const refreshed = storageService.getOrderById(activeOrder.id);
        if (refreshed) setActiveOrder(refreshed);
        setHasReviewForActive(storageService.hasReviewForOrder(activeOrder.id));
      }
    };

    window.addEventListener('asp_data_updated', handleUpdate);
    return () => window.removeEventListener('asp_data_updated', handleUpdate);
  }, [activeOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setHasSearched(true);
    const found = storageService.getOrderById(searchId.trim());
    setActiveOrder(found || null);
    setHasReviewForActive(found ? storageService.hasReviewForOrder(found.id) : false);
  };

  const getStepIndex = (currentStatus: OrderStatus) => {
    if (currentStatus === 'cancelled') return -1;
    return STATUS_STEPS.findIndex((s) => s.status === currentStatus);
  };

  const currentStepIndex = activeOrder ? getStepIndex(activeOrder.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12 space-y-8">
      {/* Header & Lookup Bar */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
          <span>Live Order Tracking</span>
          <span className="text-neutral-600">·</span>
          <span>Lahore Dispatch</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Track Your Meal Progress
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
          Enter your 6-digit Order ID (e.g. ASP-103112) to monitor kitchen preparation and rider dispatch in real time.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. ASP-103112"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/10 whitespace-nowrap"
          >
            Track Order
          </button>
        </form>
      </div>

      {/* Active Order Tracking Result */}
      {activeOrder ? (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl backdrop-blur-xl">
          {/* Order Header Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Order ID:</span>
                <span className="font-mono font-bold text-lg text-amber-400">
                  #{activeOrder.id}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase font-mono ${
                    activeOrder.status === 'delivered'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : activeOrder.status === 'cancelled'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {activeOrder.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Placed on {new Date(activeOrder.createdAt).toLocaleDateString()} at{' '}
                {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* WhatsApp direct help */}
              <a
                href={`https://wa.me/923222222461?text=Hello%20Arabian%20Shawarma,%20inquiring%20about%20Order%20%23${activeOrder.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-medium rounded-xl border border-emerald-500/30 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp Kitchen</span>
              </a>

              {/* Print Receipt / Invoice */}
              <button
                onClick={() => setIsInvoiceOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>

          {/* Visual Order Timeline */}
          {activeOrder.status === 'cancelled' ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>This order has been cancelled by the restaurant or administrator.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Live Timeline
              </h3>

              {/* Progress Steps */}
              <div className="relative">
                {/* Connecting track line */}
                <div className="hidden sm:block absolute top-5 left-6 right-6 h-0.5 bg-neutral-800 -z-0" />
                <div
                  className="hidden sm:block absolute top-5 left-6 h-0.5 bg-amber-500 transition-all duration-500 -z-0"
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100))}%`
                  }}
                />

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-2 relative z-10">
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={step.status}
                        className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-amber-500/10 sm:bg-transparent'
                            : ''
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                              : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            isCurrent
                              ? 'text-amber-400 font-bold'
                              : isDone
                              ? 'text-white'
                              : 'text-neutral-500'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Status History & Notes */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Status Activity Log
            </h3>
            <div className="space-y-2">
              {activeOrder.statusHistory.map((history, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 flex items-start justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white capitalize">
                      {history.status.replace(/_/g, ' ')}
                    </div>
                    {history.note && (
                      <div className="text-neutral-400 text-[11px] mt-0.5">{history.note}</div>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500 shrink-0">
                    {new Date(history.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details & Items Recap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-800 text-xs">
            {/* Delivery & Customer Info */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] text-neutral-400">
                Delivery Details
              </h4>
              <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 space-y-1">
                <div>
                  <strong className="text-white">{activeOrder.customer.name}</strong>
                </div>
                <div className="font-mono text-amber-400">{activeOrder.customer.phone}</div>
                <div className="text-neutral-300">{activeOrder.customer.address}</div>
                <div className="text-neutral-400">{activeOrder.customer.area}, {activeOrder.customer.city}</div>
                {activeOrder.customer.instructions && (
                  <div className="text-[11px] text-neutral-500 italic pt-1">
                    "{activeOrder.customer.instructions}"
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Total Breakdown */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] text-neutral-400">
                Payment Verification
              </h4>
              <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment Method:</span>
                  <strong className="uppercase text-white">{activeOrder.payment.method}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment Status:</span>
                  <span
                    className={`font-semibold capitalize ${
                      activeOrder.payment.status === 'verified'
                        ? 'text-emerald-400'
                        : activeOrder.payment.status === 'rejected'
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {activeOrder.payment.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {activeOrder.payment.transactionId && (
                  <div className="flex justify-between font-mono">
                    <span className="text-neutral-400">Transaction ID:</span>
                    <strong className="text-amber-400">{activeOrder.payment.transactionId}</strong>
                  </div>
                )}

                <div className="flex justify-between border-t border-neutral-800 pt-1.5 text-sm font-bold">
                  <span className="text-white">Amount Total:</span>
                  <span className="font-mono text-amber-400">
                    Rs. {activeOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Post-Delivery Review Invitation */}
          {activeOrder.status === 'delivered' && (
            <div className="pt-4 border-t border-neutral-800">
              {hasReviewForActive ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      <strong>Thank you!</strong> Your review for order #{activeOrder.id} has been recorded.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#EA580C]/15 via-[#F59E0B]/10 to-neutral-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <MessageSquareHeart className="w-4 h-4 text-[#EA580C]" />
                      <span>Your Order Has Been Delivered!</span>
                    </div>
                    <p className="text-xs text-neutral-300">
                      Enjoyed your meal from Arabian Shawarma &amp; Pizza? Share a quick rating and help others decide.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#EA580C] to-[#F59E0B] hover:brightness-110 text-neutral-950 font-extrabold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-all"
                  >
                    <Star className="w-3.5 h-3.5 fill-neutral-950" />
                    <span>Rate &amp; Review Order</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : hasSearched ? (
        <div className="text-center py-16 bg-neutral-900/40 rounded-2xl border border-neutral-800 space-y-3">
          <p className="text-sm text-neutral-400">
            No order found matching ID: <span className="font-mono text-white">"{searchId}"</span>
          </p>
          <p className="text-xs text-neutral-500">
            Please check your receipt or contact our helpline at 0322-2222461.
          </p>
        </div>
      ) : null}

      {/* Printable Invoice Modal */}
      {isInvoiceOpen && activeOrder && (
        <OrderInvoiceModal
          order={activeOrder}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}

      {/* Post-Delivery Review Modal */}
      {isReviewModalOpen && activeOrder && (
        <ReviewPromptModal
          order={activeOrder}
          isOpen={isReviewModalOpen}
          onDismiss={() => setIsReviewModalOpen(false)}
          onSubmitted={(orderId) => {
            setHasReviewForActive(true);
            try {
              const raw = localStorage.getItem('asp_review_prompt_state_v1');
              const state = raw ? JSON.parse(raw) : {};
              state[orderId] = 'submitted';
              localStorage.setItem('asp_review_prompt_state_v1', JSON.stringify(state));
            } catch {
              // ignore
            }
          }}
        />
      )}
    </div>
  );
};
