import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  UtensilsCrossed,
  Tag,
  ImageIcon,
  TicketPercent,
  CheckCircle,
  Clock,
  ShieldCheck,
  Info,
  MapPin
} from 'lucide-react';
import { RecycleBinItem } from '../../types';
import { storageService } from '../../services/storageService';

export const RecycleBinTab: React.FC = () => {
  const [items, setItems] = useState<RecycleBinItem[]>(storageService.getRecycleBinItems());
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<RecycleBinItem | null>(null);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const refreshItems = () => {
    setItems(storageService.getRecycleBinItems());
  };

  useEffect(() => {
    const handleUpdate = () => refreshItems();
    window.addEventListener('asp_data_updated', handleUpdate);
    return () => window.removeEventListener('asp_data_updated', handleUpdate);
  }, []);

  const showSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleRestore = (item: RecycleBinItem) => {
    const success = storageService.restoreRecycleBinItem(item.recordType, item.id);
    if (success) {
      refreshItems();
      showSuccess(`Successfully restored "${item.name}" back to live store listings.`);
    }
  };

  const handleConfirmPermanentDelete = () => {
    if (!permanentDeleteTarget) return;
    const success = storageService.permanentlyDeleteRecycleBinItem(
      permanentDeleteTarget.recordType,
      permanentDeleteTarget.id
    );
    if (success) {
      refreshItems();
      showSuccess(`Permanently purged "${permanentDeleteTarget.name}". Previous order snapshots remain preserved.`);
      setPermanentDeleteTarget(null);
      setConfirmDeleteText('');
    }
  };

  const [showEmptyConfirmModal, setShowEmptyConfirmModal] = useState(false);

  const handleEmptyAll = () => {
    setShowEmptyConfirmModal(true);
  };

  const confirmEmptyAll = () => {
    storageService.emptyRecycleBin();
    refreshItems();
    showSuccess('Recycle Bin has been completely emptied.');
    setShowEmptyConfirmModal(false);
  };

  // Filter & Search
  const filteredItems = items.filter((item) => {
    if (filterType !== 'all' && item.recordType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        item.recordType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <UtensilsCrossed className="w-4 h-4 text-amber-400" />;
      case 'category':
        return <Layers className="w-4 h-4 text-blue-400" />;
      case 'deal':
        return <Tag className="w-4 h-4 text-red-400" />;
      case 'banner':
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case 'coupon':
        return <TicketPercent className="w-4 h-4 text-emerald-400" />;
      case 'zone':
        return <MapPin className="w-4 h-4 text-cyan-400" />;
      default:
        return <Trash2 className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Audit Assurance */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-200">
            Protected Restore & Historical Snapshot System
          </div>
          <p className="text-amber-300/80 leading-relaxed text-[11px]">
            Items deleted in the admin dashboard are safely held in this Recycle Bin with a 30-day retention window.
            Restoring an item immediately brings it back to the active customer storefront.
            <strong> Critical Protection:</strong> Deleting or permanently purging any food item will <em>never</em> break historical orders or invoices—snapshots are preserved in completed sales records.
          </p>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Control Strip: Filters, Search, Empty Bin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {[
            { id: 'all', label: `All Deleted (${items.length})` },
            { id: 'product', label: `Products (${items.filter((i) => i.recordType === 'product').length})` },
            { id: 'category', label: `Categories (${items.filter((i) => i.recordType === 'category').length})` },
            { id: 'deal', label: `Deals (${items.filter((i) => i.recordType === 'deal').length})` },
            { id: 'banner', label: `Banners (${items.filter((i) => i.recordType === 'banner').length})` },
            { id: 'coupon', label: `Coupons (${items.filter((i) => i.recordType === 'coupon').length})` },
            { id: 'zone', label: `Delivery Areas (${items.filter((i) => i.recordType === 'zone').length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filterType === tab.id
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Bulk Action */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deleted items..."
              className="bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 w-48"
            />
          </div>

          {items.length > 0 && (
            <button
              onClick={handleEmptyAll}
              className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Bin</span>
            </button>
          )}
        </div>
      </div>

      {/* Deleted Items Table / Cards */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-neutral-300">Recycle Bin is Empty</div>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {items.length === 0
              ? 'No accidentally deleted items. Any items deleted from Products, Categories, Deals, Banners, or Coupons will appear here for 1-click restoration.'
              : 'No items match your filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Deletion Date</th>
                  <th className="py-3 px-4">Deleted By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredItems.map((item) => (
                  <tr key={`${item.recordType}-${item.id}`} className="hover:bg-neutral-850/50 transition-colors">
                    {/* Item Name & Visual */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <div className="w-12 h-12 rounded-xl bg-neutral-950 overflow-hidden shrink-0 border border-neutral-800">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
                            {getTypeIcon(item.recordType)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-xs">{item.name}</div>
                          {item.category && (
                            <div className="text-[11px] text-neutral-400">
                              Category: {item.category}
                            </div>
                          )}
                          {item.price !== undefined && (
                            <div className="font-mono text-[11px] text-amber-400 font-bold">
                              Rs. {item.price.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Record Type Badge */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-neutral-950 border border-neutral-800">
                        {getTypeIcon(item.recordType)}
                        <span className="capitalize">{item.recordType}</span>
                      </span>
                    </td>

                    {/* Deletion Date & Time */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{new Date(item.deletedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </td>

                    {/* Deleted By */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        {item.deletedBy}
                      </span>
                    </td>

                    {/* Actions: Restore & Permanent Delete */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(item)}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-neutral-950 border border-emerald-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          title="Restore back to live menu"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => setPermanentDeleteTarget(item)}
                          className="p-1.5 bg-neutral-800 hover:bg-red-950/80 text-neutral-400 hover:text-red-400 border border-neutral-700/60 rounded-xl transition-colors cursor-pointer"
                          title="Permanently Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strong Confirmation Modal for Permanent Delete */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-500/40 max-w-md w-full rounded-2xl p-6 space-y-4 text-xs shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-display">
                  Confirm Permanent Deletion
                </h3>
                <p className="text-[11px] text-red-300">
                  This action is irreversible.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
              <div className="text-[11px] text-neutral-400">Selected Item:</div>
              <div className="font-bold text-white text-xs">{permanentDeleteTarget.name}</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                Type: {permanentDeleteTarget.recordType}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
              <span>
                Safety Assurance: Permanently purging this record will remove it from the active database catalog, but <strong>all historical orders, receipts, and invoices</strong> that already purchased this item will remain 100% intact with their stored item snapshots.
              </span>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPermanentDeleteTarget(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Empty Entire Recycle Bin */}
      {showEmptyConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-500/40 max-w-md w-full rounded-2xl p-6 space-y-4 text-xs shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-display">
                  Empty Entire Recycle Bin?
                </h3>
                <p className="text-[11px] text-red-300">
                  This will permanently erase all {items.length} items currently in the trash.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
              <span>
                Safety Assurance: All historical orders, receipts, and invoices remain 100% intact with their stored item snapshots.
              </span>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEmptyConfirmModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmEmptyAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Recycle Bin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
