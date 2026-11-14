import React, { useState } from 'react';
import { X, Printer, ChefHat, FileText } from 'lucide-react';
import { Order } from '../../types';
import { storageService } from '../../services/storageService';
import { LOGO_URL } from '../../utils/assetUrl';

interface OrderInvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, onClose }) => {
  const [viewMode, setViewMode] = useState<'invoice' | 'kot'>('invoice');
  const settings = storageService.getRestaurantSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-fadeIn text-neutral-100">
        {/* Top Controls Bar (Hidden during print) */}
        <div className="no-print p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('invoice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'invoice'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Customer Invoice</span>
            </button>
            <button
              onClick={() => setViewMode('kot')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kot'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen Ticket (KOT)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 bg-white text-neutral-900 font-sans max-h-[75vh] overflow-y-auto">
          {viewMode === 'invoice' ? (
            /* CUSTOMER INVOICE */
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-neutral-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={LOGO_URL}
                      alt="Arabian Shawarma & Pizza"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-neutral-950 tracking-tight">
                      {settings.name}
                    </h2>
                    <p className="text-xs text-neutral-600 max-w-sm mt-0.5">
                      {settings.address}, {settings.city}
                    </p>
                    <p className="text-xs text-neutral-600 font-mono mt-0.5">
                      Phone: {settings.phone1} / {settings.phone2}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase font-bold text-neutral-500">Official Receipt</div>
                  <div className="text-lg font-mono font-bold text-neutral-950">#{order.id}</div>
                  <div className="text-xs text-neutral-600">
                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Customer & Delivery */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-neutral-200 pb-4">
                <div>
                  <div className="font-bold text-neutral-500 uppercase text-[10px]">Customer:</div>
                  <div className="font-semibold text-neutral-900 text-sm">{order.customer.name}</div>
                  <div className="font-mono text-neutral-700">{order.customer.phone}</div>
                  {order.customer.email && <div className="text-neutral-600">{order.customer.email}</div>}
                </div>
                <div>
                  <div className="font-bold text-neutral-500 uppercase text-[10px]">Delivery Info:</div>
                  <div className="font-semibold text-neutral-900 capitalize">{order.orderType} ({order.customer.area})</div>
                  <div className="text-neutral-700">{order.customer.address}</div>
                  {order.customer.instructions && (
                    <div className="text-neutral-500 italic mt-0.5">Note: "{order.customer.instructions}"</div>
                  )}
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-300 text-neutral-500 uppercase text-[10px]">
                      <th className="py-2">Item & Specifications</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5">
                          <div className="font-semibold text-neutral-900">{item.name}</div>
                          {item.options?.size && (
                            <div className="text-[11px] text-neutral-600">
                              Size: {item.options.size.name}
                            </div>
                          )}
                          {item.options?.selectedAddons && item.options.selectedAddons.length > 0 && (
                            <div className="text-[10px] text-neutral-500">
                              Addons: {item.options.selectedAddons.map((a) => a.name).join(', ')}
                            </div>
                          )}
                          {item.options?.specialInstructions && (
                            <div className="text-[10px] text-neutral-500 italic">
                              "{item.options.specialInstructions}"
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 text-center font-mono font-semibold">{item.quantity}</td>
                        <td className="py-2.5 text-right font-mono">Rs. {item.price.toLocaleString()}</td>
                        <td className="py-2.5 text-right font-mono font-semibold">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t border-neutral-300 pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-mono">Rs. {order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount Promo ({order.couponCode})</span>
                    <span className="font-mono">-Rs. {order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Fee</span>
                  <span className="font-mono">
                    {order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee}`}
                  </span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Tax</span>
                    <span className="font-mono">Rs. {order.tax}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-neutral-950 text-base pt-2 border-t border-neutral-300">
                  <span>Payable Amount:</span>
                  <span className="font-mono text-lg">Rs. {order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-neutral-700">Payment Method:</span>
                  <span className="uppercase font-semibold">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-neutral-700">Payment Status:</span>
                  <span className="capitalize font-semibold text-neutral-900">{order.payment.status}</span>
                </div>
                {order.payment.transactionId && (
                  <div className="flex justify-between font-mono">
                    <span className="font-bold text-neutral-700">Transaction ID (TID):</span>
                    <span>{order.payment.transactionId}</span>
                  </div>
                )}
              </div>

              <div className="text-center text-[10px] text-neutral-500 pt-2 border-t border-neutral-200">
                Thank you for ordering with {settings.name}! We look forward to serving you again.
              </div>
            </div>
          ) : (
            /* KITCHEN ORDER TICKET (KOT) */
            <div className="space-y-4 font-mono">
              <div className="border-b-2 border-dashed border-neutral-400 pb-3 text-center">
                <div className="text-xl font-bold uppercase tracking-wider">KITCHEN ORDER TICKET</div>
                <div className="text-2xl font-bold mt-1">ORDER #{order.id}</div>
                <div className="text-xs mt-1">
                  Type: <strong className="uppercase">{order.orderType}</strong> · {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Items checklist */}
              <div className="space-y-3 py-2 border-b-2 border-dashed border-neutral-400">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 border-2 border-black rounded mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-base font-bold">
                        {item.quantity}x {item.name}
                      </div>
                      {item.options?.size && (
                        <div className="text-sm font-semibold text-neutral-800">
                          &gt; SIZE: {item.options.size.name}
                        </div>
                      )}
                      {item.options?.selectedAddons && item.options.selectedAddons.length > 0 && (
                        <div className="text-xs font-semibold text-neutral-700">
                          + EXTRAS: {item.options.selectedAddons.map((a) => a.name).join(', ')}
                        </div>
                      )}
                      {item.options?.specialInstructions && (
                        <div className="text-xs font-bold bg-neutral-100 p-1 mt-1 border border-neutral-300">
                          ! NOTE: {item.options.specialInstructions}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {order.customer.instructions && (
                <div className="p-2 border border-neutral-400 text-xs font-bold">
                  CUSTOMER INSTRUCTION: {order.customer.instructions}
                </div>
              )}

              <div className="text-center text-xs pt-2">
                TOTAL ITEMS: {order.items.reduce((s, i) => s + i.quantity, 0)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
