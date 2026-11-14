import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Archive,
  ArchiveRestore,
  DollarSign,
  Upload,
  Check,
  AlertTriangle,
  Star,
  Tag,
  X,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Deal, DealIncludedItem } from '../../types';
import { storageService } from '../../services/storageService';
import { uploadImageToStorage } from '../../firebase/config';
import { resolveAssetUrl } from '../../utils/assetUrl';

interface AdminDealsPanelProps {
  deals: Deal[];
  categories: string[];
  adminEmail: string;
  onDeleteDeal: (deal: Deal) => void;
  onFeedback: (message: string, type?: 'success' | 'info' | 'error') => void;
  onDealsChanged: () => void;
}

const DEAL_CATEGORIES = [
  'Regular Deals',
  'Budget & Solo',
  'Duo Combos',
  'Family Combos',
  'Mega Feasts',
  'Pizza Deals',
  'Burger & Shawarma Combos'
];

function parseItemsToStructured(deal: Deal): DealIncludedItem[] {
  if (Array.isArray(deal.includedItems) && deal.includedItems.length > 0) {
    return deal.includedItems.map((it) => ({
      name: it.name,
      quantity: Math.max(1, Number(it.quantity) || 1)
    }));
  }
  if (Array.isArray(deal.items) && deal.items.length > 0) {
    return deal.items.map((raw) => {
      const match = raw.trim().match(/^(\d+)\s*[xX]?\s+(.+)$/);
      if (match) {
        return { quantity: Math.max(1, parseInt(match[1], 10)), name: match[2].trim() };
      }
      return { quantity: 1, name: raw.trim() };
    });
  }
  return [{ name: '', quantity: 1 }];
}

function getNextSuggestedDealNumber(deals: Deal[]): string {
  const maxNum = deals.reduce((max, d) => {
    const n = parseInt(d.dealNumber.replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  const next = maxNum + 1;
  return `DEAL ${next < 10 ? `0${next}` : next}`;
}

export const AdminDealsPanel: React.FC<AdminDealsPanelProps> = ({
  deals,
  categories,
  adminEmail,
  onDeleteDeal,
  onFeedback,
  onDealsChanged
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived' | 'featured'>('all');
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);

  // Add / Edit Deal Modal
  const [dealModalMode, setDealModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [dealNumberInput, setDealNumberInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Regular Deals');
  const [priceInput, setPriceInput] = useState<string>('');
  const [originalPriceInput, setOriginalPriceInput] = useState<string>('');
  const [discountLabelInput, setDiscountLabelInput] = useState('');
  const [displayOrderInput, setDisplayOrderInput] = useState<string>('1');
  const [imageInput, setImageInput] = useState('');
  const [isActiveInput, setIsActiveInput] = useState(true);
  const [isFeaturedInput, setIsFeaturedInput] = useState(false);
  const [includedItemsInput, setIncludedItemsInput] = useState<DealIncludedItem[]>([
    { name: '', quantity: 1 }
  ]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dealFormError, setDealFormError] = useState('');

  // Change Prices Modal (Individual + Bulk)
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceMode, setPriceMode] = useState<'individual' | 'bulk'>('individual');
  const [singleTargetDeal, setSingleTargetDeal] = useState<Deal | null>(null);
  const [singleNewPrice, setSingleNewPrice] = useState('');
  const [singleNewOriginalPrice, setSingleNewOriginalPrice] = useState('');

  const [bulkDealIds, setBulkDealIds] = useState<string[]>([]);
  const [bulkOperation, setBulkOperation] = useState<'inc_pct' | 'dec_pct' | 'inc_pkr' | 'dec_pkr'>('inc_pct');
  const [bulkAmount, setBulkAmount] = useState<string>('10');
  const [roundToTen, setRoundToTen] = useState(false);
  const [bulkConfirmStep, setBulkConfirmStep] = useState(false);

  const availableCategories = useMemo(() => {
    const merged = new Set([...DEAL_CATEGORIES, ...categories]);
    return Array.from(merged);
  }, [categories]);

  const orderRefCountMap = useMemo(() => {
    const map = new Map<string, number>();
    deals.forEach((d) => {
      map.set(d.id, storageService.getDealOrderReferenceCount(d.id));
    });
    return map;
  }, [deals]);

  const filteredDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deals.filter((deal) => {
      if (statusFilter === 'active' && (!deal.isActive || deal.isArchived)) return false;
      if (statusFilter === 'inactive' && (deal.isActive || deal.isArchived)) return false;
      if (statusFilter === 'archived' && !deal.isArchived) return false;
      if (statusFilter === 'featured' && (!deal.isFeatured || deal.isArchived)) return false;

      if (!q) return true;
      return (
        deal.dealNumber.toLowerCase().includes(q) ||
        deal.title.toLowerCase().includes(q) ||
        (deal.category || '').toLowerCase().includes(q) ||
        deal.items.some((i) => i.toLowerCase().includes(q))
      );
    });
  }, [deals, search, statusFilter]);

  const openCreateDealModal = () => {
    setDealModalMode('create');
    setEditingDealId(null);
    setDealNumberInput(getNextSuggestedDealNumber(deals));
    setTitleInput('');
    setDescriptionInput('');
    setCategoryInput('Regular Deals');
    setPriceInput('');
    setOriginalPriceInput('');
    setDiscountLabelInput('');
    setDisplayOrderInput(String(deals.length + 1));
    setImageInput('/assets/images/family_combo_feast_1794391295864.jpg');
    setIsActiveInput(true);
    setIsFeaturedInput(false);
    setIncludedItemsInput([{ name: '', quantity: 1 }]);
    setDealFormError('');
  };

  const openEditDealModal = (deal: Deal) => {
    setDealModalMode('edit');
    setEditingDealId(deal.id);
    setDealNumberInput(deal.dealNumber);
    setTitleInput(deal.title);
    setDescriptionInput(deal.description || '');
    setCategoryInput(deal.category || 'Regular Deals');
    setPriceInput(String(deal.price));
    setOriginalPriceInput(deal.originalPrice ? String(deal.originalPrice) : '');
    setDiscountLabelInput(deal.discountLabel || deal.badge || '');
    setDisplayOrderInput(
      String(
        typeof deal.displayOrder === 'number'
          ? deal.displayOrder
          : parseInt(deal.dealNumber.replace(/\D/g, ''), 10) || 1
      )
    );
    setImageInput(deal.image || '/assets/images/family_combo_feast_1794391295864.jpg');
    setIsActiveInput(deal.isActive);
    setIsFeaturedInput(Boolean(deal.isFeatured));
    setIncludedItemsInput(parseItemsToStructured(deal));
    setDealFormError('');
  };

  const handleDealImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setDealFormError('');
    try {
      const url = await uploadImageToStorage(file, 'deals');
      setImageInput(url);
      onFeedback('Deal image uploaded cleanly.');
    } catch (err) {
      setDealFormError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveDeal = (e: React.FormEvent) => {
    e.preventDefault();
    setDealFormError('');

    const cleanTitle = titleInput.trim();
    const cleanNumber = dealNumberInput.trim().toUpperCase() || getNextSuggestedDealNumber(deals);
    const parsedPrice = Number(priceInput);
    const parsedOriginal = originalPriceInput.trim() ? Number(originalPriceInput) : undefined;
    const cleanIncluded = includedItemsInput
      .map((it) => ({
        name: it.name.trim(),
        quantity: Math.max(1, Math.floor(Number(it.quantity) || 1))
      }))
      .filter((it) => it.name.length > 0);

    if (!cleanTitle) {
      setDealFormError('Deal name is required.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setDealFormError('Deal price must be a valid positive amount in PKR.');
      return;
    }
    if (parsedOriginal !== undefined && (!Number.isFinite(parsedOriginal) || parsedOriginal <= parsedPrice)) {
      setDealFormError('Original price must be higher than the deal price (or leave blank).');
      return;
    }
    if (cleanIncluded.length === 0) {
      setDealFormError('Please include at least one item in this deal.');
      return;
    }

    const existing = editingDealId ? deals.find((d) => d.id === editingDealId) : undefined;

    const dealToSave: Deal = {
      ...(existing || {}),
      id: existing?.id || `deal-${Date.now()}`,
      dealNumber: cleanNumber,
      title: cleanTitle,
      description: descriptionInput.trim() || `${cleanIncluded.map((i) => `${i.quantity}x ${i.name}`).join(', ')}`,
      category: categoryInput,
      items: cleanIncluded.map((it) => (it.quantity > 1 ? `${it.quantity}x ${it.name}` : it.name)),
      includedItems: cleanIncluded,
      price: Math.round(parsedPrice),
      originalPrice: parsedOriginal ? Math.round(parsedOriginal) : undefined,
      discountLabel: discountLabelInput.trim() || undefined,
      badge: discountLabelInput.trim() || existing?.badge,
      displayOrder: Math.max(1, parseInt(displayOrderInput, 10) || deals.length + 1),
      image: imageInput.trim() || '/assets/images/family_combo_feast_1794391295864.jpg',
      isActive: isActiveInput,
      isFeatured: isFeaturedInput,
      isArchived: existing?.isArchived || false
    };

    storageService.saveDeal(dealToSave);
    setDealModalMode(null);
    onDealsChanged();
    onFeedback(
      dealModalMode === 'create'
        ? `Deal "${dealToSave.dealNumber}: ${dealToSave.title}" created and published!`
        : `Deal "${dealToSave.dealNumber}: ${dealToSave.title}" updated!`
    );
  };

  // Price Modal helpers
  const openSinglePriceModal = (deal: Deal) => {
    setPriceMode('individual');
    setSingleTargetDeal(deal);
    setSingleNewPrice(String(deal.price));
    setSingleNewOriginalPrice(deal.originalPrice ? String(deal.originalPrice) : '');
    setBulkConfirmStep(false);
    setPriceModalOpen(true);
  };

  const openBulkPriceModal = () => {
    setPriceMode('bulk');
    setBulkDealIds(
      selectedDealIds.length > 0
        ? selectedDealIds
        : filteredDeals.filter((d) => !d.isArchived).map((d) => d.id)
    );
    setBulkOperation('inc_pct');
    setBulkAmount('10');
    setBulkConfirmStep(false);
    setPriceModalOpen(true);
  };

  const handleSaveSinglePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleTargetDeal) return;
    const nextPrice = Number(singleNewPrice);
    const nextOrig = singleNewOriginalPrice.trim() ? Number(singleNewOriginalPrice) : undefined;

    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      onFeedback('Price must be greater than Rs. 0.', 'error');
      return;
    }
    if (nextOrig !== undefined && (!Number.isFinite(nextOrig) || nextOrig <= nextPrice)) {
      onFeedback('Original price must be higher than current deal price (or left empty).', 'error');
      return;
    }

    storageService.saveDeal({
      ...singleTargetDeal,
      price: Math.round(nextPrice),
      originalPrice: nextOrig ? Math.round(nextOrig) : undefined
    });
    setPriceModalOpen(false);
    onDealsChanged();
    onFeedback(`Updated price for ${singleTargetDeal.dealNumber} to Rs. ${Math.round(nextPrice).toLocaleString()}.`);
  };

  const bulkPreviewRows = useMemo(() => {
    const val = Number(bulkAmount) || 0;
    return deals
      .filter((d) => bulkDealIds.includes(d.id))
      .map((deal) => {
        let computed = deal.price;
        if (bulkOperation === 'inc_pct') computed = deal.price * (1 + val / 100);
        else if (bulkOperation === 'dec_pct') computed = deal.price * (1 - val / 100);
        else if (bulkOperation === 'inc_pkr') computed = deal.price + val;
        else if (bulkOperation === 'dec_pkr') computed = deal.price - val;

        if (roundToTen) {
          computed = Math.round(computed / 10) * 10;
        } else {
          computed = Math.round(computed);
        }

        const isValid = Number.isFinite(computed) && computed > 0;
        return {
          deal,
          oldPrice: deal.price,
          newPrice: computed,
          delta: computed - deal.price,
          isValid
        };
      });
  }, [deals, bulkDealIds, bulkOperation, bulkAmount, roundToTen]);

  const hasInvalidBulkPrices = bulkPreviewRows.some((r) => !r.isValid);

  const handleApplyBulkPrices = () => {
    if (bulkPreviewRows.length === 0 || hasInvalidBulkPrices) {
      onFeedback('Ensure at least one deal is selected and all new prices are positive.', 'error');
      return;
    }

    storageService.bulkUpdateDealPrices(
      bulkPreviewRows.map((row) => ({
        id: row.deal.id,
        price: row.newPrice
      })),
      adminEmail
    );

    setPriceModalOpen(false);
    setBulkConfirmStep(false);
    setSelectedDealIds([]);
    onDealsChanged();
    onFeedback(`Successfully updated prices for ${bulkPreviewRows.length} deal(s)!`);
  };

  const toggleDealSelection = (id: string) => {
    setSelectedDealIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredDeals.map((d) => d.id);
    const allSelected =
      filteredIds.length > 0 && filteredIds.every((id) => selectedDealIds.includes(id));
    if (allSelected) {
      setSelectedDealIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedDealIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-5">
      {/* Header & Top Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-white text-base font-display">
            Deals &amp; Combos Management ({deals.length})
          </h2>
          <p className="text-xs text-neutral-400">
            Create new combos, edit deals individually, apply safe individual or bulk price updates, or archive historical offers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openBulkPriceModal}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>
              {selectedDealIds.length > 0
                ? `Bulk Edit Prices (${selectedDealIds.length})`
                : 'Change Prices (Bulk)'}
            </span>
          </button>

          <button
            type="button"
            onClick={openCreateDealModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/15 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Deal</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-neutral-800">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(
            [
              { key: 'all', label: `All (${deals.length})` },
              {
                key: 'active',
                label: `Active (${deals.filter((d) => d.isActive && !d.isArchived).length})`
              },
              {
                key: 'featured',
                label: `Featured (${deals.filter((d) => d.isFeatured && !d.isArchived).length})`
              },
              {
                key: 'inactive',
                label: `Inactive (${deals.filter((d) => !d.isActive && !d.isArchived).length})`
              },
              {
                key: 'archived',
                label: `Archived (${deals.filter((d) => d.isArchived).length})`
              }
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectAllFiltered}
            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl text-[11px] font-medium cursor-pointer whitespace-nowrap"
          >
            {filteredDeals.length > 0 && filteredDeals.every((d) => selectedDealIds.includes(d.id))
              ? 'Deselect Visible'
              : 'Select Visible'}
          </button>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals or items..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Deals Cards Grid */}
      {filteredDeals.length === 0 ? (
        <div className="text-center py-12 bg-neutral-950/60 rounded-2xl border border-neutral-800 text-xs text-neutral-400">
          No deals match your current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDeals.map((deal) => {
            const isSelected = selectedDealIds.includes(deal.id);
            const refCount = orderRefCountMap.get(deal.id) || 0;
            return (
              <div
                key={deal.id}
                className={`p-4 bg-neutral-950/80 border rounded-xl space-y-3 flex flex-col justify-between transition-colors ${
                  isSelected
                    ? 'border-amber-500/70 bg-amber-500/5'
                    : deal.isArchived
                    ? 'border-neutral-800 opacity-75'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Top Bar: Checkbox, Deal Number, Order & Price */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleDealSelection(deal.id)}
                        className="w-4 h-4 accent-amber-500 cursor-pointer"
                        title="Select deal for bulk pricing"
                      />
                      <span className="font-mono font-bold text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {deal.dealNumber}
                      </span>
                      {deal.isFeatured && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-300" />
                          Featured
                        </span>
                      )}
                      {deal.isArchived && (
                        <span className="text-[10px] font-bold text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded">
                          Archived
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-sm text-white">
                        Rs. {deal.price.toLocaleString()}
                      </div>
                      {deal.originalPrice && deal.originalPrice > deal.price && (
                        <div className="font-mono text-[10px] text-neutral-500 line-through">
                          Rs. {deal.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image + Title */}
                  <div className="flex items-start gap-3">
                    {deal.image && (
                      <img
                        src={resolveAssetUrl(deal.image)}
                        alt={deal.title}
                        className="w-16 h-16 rounded-lg object-cover border border-neutral-800 shrink-0 bg-neutral-900"
                      />
                    )}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="font-bold text-white text-xs leading-snug line-clamp-2">
                        {deal.title}
                      </h4>
                      <div className="text-[10px] text-neutral-500 flex flex-wrap items-center gap-1.5">
                        <span>{deal.category || 'Regular Deals'}</span>
                        <span>·</span>
                        <span>Order #{deal.displayOrder ?? '—'}</span>
                        {(deal.discountLabel || deal.badge) && (
                          <>
                            <span>·</span>
                            <span className="text-red-400 font-semibold">
                              {deal.discountLabel || deal.badge}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Included Items */}
                  <ul className="text-[11px] text-neutral-400 space-y-0.5 bg-neutral-900/60 rounded-lg p-2.5 border border-neutral-800/60">
                    {deal.items.map((item, idx) => (
                      <li key={idx}>· {item}</li>
                    ))}
                  </ul>

                  {refCount > 0 && (
                    <div className="text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 shrink-0 text-blue-400" />
                      <span>
                        Referenced by {refCount} historical order{refCount === 1 ? '' : 's'} (history protected)
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="pt-2.5 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditDealModal(deal)}
                      className="text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit Deal</span>
                    </button>

                    <span className="text-neutral-700">|</span>

                    <button
                      type="button"
                      onClick={() => openSinglePriceModal(deal)}
                      className="text-neutral-300 hover:text-amber-400 hover:underline cursor-pointer"
                    >
                      Change Price
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!deal.isArchived && (
                      <button
                        type="button"
                        onClick={() => {
                          storageService.saveDeal({ ...deal, isActive: !deal.isActive });
                          onDealsChanged();
                          onFeedback(
                            `${deal.dealNumber} is now ${!deal.isActive ? 'Active on storefront' : 'Disabled'}.`
                          );
                        }}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                          deal.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {deal.isActive ? 'Active' : 'Disabled'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (deal.isArchived) {
                          storageService.unarchiveDeal(deal.id, adminEmail);
                          onFeedback(`Restored "${deal.dealNumber}" from archive.`);
                        } else {
                          storageService.archiveDeal(deal.id, adminEmail);
                          onFeedback(`Archived "${deal.dealNumber}" while preserving all order history.`);
                        }
                        onDealsChanged();
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-900 cursor-pointer"
                      title={deal.isArchived ? 'Unarchive Deal' : 'Archive Deal (Safe Hide)'}
                    >
                      {deal.isArchived ? (
                        <ArchiveRestore className="w-3.5 h-3.5" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteDeal(deal)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-900 cursor-pointer"
                      title="Delete Deal (Moves to Recycle Bin)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT DEAL MODAL */}
      {dealModalMode && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDeal}
            className="bg-neutral-900 border border-neutral-800 max-w-2xl w-full rounded-2xl p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm font-display">
                  {dealModalMode === 'create'
                    ? 'Add New Deal / Combo'
                    : `Edit ${dealNumberInput || 'Deal'}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDealModalMode(null)}
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-neutral-300 font-medium">Deal Name *</label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. Family Crown Crust Feast"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Deal Number</label>
                <input
                  type="text"
                  value={dealNumberInput}
                  onChange={(e) => setDealNumberInput(e.target.value.toUpperCase())}
                  placeholder="DEAL 30"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-amber-400 font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-medium">Deal Description</label>
              <textarea
                rows={2}
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Describe what makes this deal special..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Deal Price (PKR) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="1450"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Original Price (Opt)</label>
                <input
                  type="number"
                  min={0}
                  value={originalPriceInput}
                  onChange={(e) => setOriginalPriceInput(e.target.value)}
                  placeholder="1850"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Category</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={displayOrderInput}
                  onChange={(e) => setDisplayOrderInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Discount Badge / Info (Optional)</label>
                <input
                  type="text"
                  value={discountLabelInput}
                  onChange={(e) => setDiscountLabelInput(e.target.value)}
                  placeholder="e.g. Save 20% / Includes 1.5 Ltr Drink"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Deal Image Upload or URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://... or upload image"
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <label className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-semibold rounded-xl cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDealImageUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
              </div>
            </div>

            {imageInput && (
              <div className="flex items-center gap-3 p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                <img
                  src={resolveAssetUrl(imageInput)}
                  alt="Deal preview"
                  className="w-16 h-12 rounded-lg object-cover border border-neutral-800"
                />
                <span className="text-[11px] text-neutral-400">
                  Live Deal Thumbnail Preview
                </span>
              </div>
            )}

            {/* Structured Included Items & Quantities */}
            <div className="space-y-2 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="text-neutral-200 font-bold">
                  Items Included &amp; Quantities *
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setIncludedItemsInput((prev) => [...prev, { name: '', quantity: 1 }])
                  }
                  className="text-amber-400 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item Row</span>
                </button>
              </div>

              <div className="space-y-2">
                {includedItemsInput.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={row.quantity}
                      onChange={(e) => {
                        const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setIncludedItemsInput((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, quantity: qty } : item))
                        );
                      }}
                      aria-label="Item quantity"
                      className="w-16 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-center font-mono text-white"
                    />
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setIncludedItemsInput((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                        );
                      }}
                      placeholder="e.g. Medium Crown Pizza or Regular Drink"
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-white"
                    />
                    {includedItemsInput.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setIncludedItemsInput((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 text-neutral-500 hover:text-red-400 cursor-pointer"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Availability & Featured Toggles */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-neutral-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActiveInput}
                  onChange={(e) => setIsActiveInput(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span>Available (Active on Storefront)</span>
              </label>

              <label className="flex items-center gap-2 text-neutral-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeaturedInput}
                  onChange={(e) => setIsFeaturedInput(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span>Featured Deal (Highlight on Home Page)</span>
              </label>
            </div>

            {dealFormError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{dealFormError}</span>
              </div>
            )}

            <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDealModalMode(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploadingImage}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold rounded-xl cursor-pointer"
              >
                Save Deal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INDIVIDUAL & BULK CHANGE PRICES MODAL */}
      {priceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-3xl w-full rounded-2xl p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm font-display">
                  Change Deal Prices
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPriceModalOpen(false);
                  setBulkConfirmStep(false);
                }}
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800 w-fit">
              {singleTargetDeal && (
                <button
                  type="button"
                  onClick={() => {
                    setPriceMode('individual');
                    setBulkConfirmStep(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    priceMode === 'individual'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Individual ({singleTargetDeal.dealNumber})
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setPriceMode('bulk');
                  if (bulkDealIds.length === 0) {
                    setBulkDealIds(deals.filter((d) => !d.isArchived).map((d) => d.id));
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                  priceMode === 'bulk'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Bulk Price Adjustment
              </button>
            </div>

            {priceMode === 'individual' && singleTargetDeal ? (
              <form onSubmit={handleSaveSinglePrice} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="font-mono font-bold text-amber-400">{singleTargetDeal.dealNumber}</div>
                  <div className="font-bold text-white text-sm mt-0.5">{singleTargetDeal.title}</div>
                  <div className="text-neutral-400 mt-0.5">
                    Current Price: Rs. {singleTargetDeal.price.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-neutral-300 font-medium">New Deal Price (PKR) *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={singleNewPrice}
                      onChange={(e) => setSingleNewPrice(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-300 font-medium">Compare-at Original Price (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={singleNewOriginalPrice}
                      onChange={(e) => setSingleNewOriginalPrice(e.target.value)}
                      placeholder="Optional"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPriceModalOpen(false)}
                    className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold rounded-xl cursor-pointer"
                  >
                    Update Deal Price
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Adjustment Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="space-y-1">
                    <label className="text-neutral-300 font-medium">Adjustment Rule</label>
                    <select
                      value={bulkOperation}
                      onChange={(e) => {
                        setBulkOperation(e.target.value as typeof bulkOperation);
                        setBulkConfirmStep(false);
                      }}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="inc_pct">Increase by Percentage (%)</option>
                      <option value="dec_pct">Decrease by Percentage (%)</option>
                      <option value="inc_pkr">Increase by Fixed PKR</option>
                      <option value="dec_pkr">Decrease by Fixed PKR</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-300 font-medium">
                      {bulkOperation.endsWith('pct') ? 'Percentage (%)' : 'Amount (PKR)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={bulkAmount}
                      onChange={(e) => {
                        setBulkAmount(e.target.value);
                        setBulkConfirmStep(false);
                      }}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div className="flex items-end pb-1.5">
                    <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roundToTen}
                        onChange={(e) => {
                          setRoundToTen(e.target.checked);
                          setBulkConfirmStep(false);
                        }}
                        className="accent-amber-500"
                      />
                      <span>Round to nearest Rs. 10</span>
                    </label>
                  </div>
                </div>

                {/* Quick Deal Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300 font-semibold">
                      Selected Deals ({bulkDealIds.length} of {deals.length})
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkDealIds(deals.filter((d) => !d.isArchived).map((d) => d.id));
                          setBulkConfirmStep(false);
                        }}
                        className="text-amber-400 hover:underline cursor-pointer"
                      >
                        Select All Active
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkDealIds([]);
                          setBulkConfirmStep(false);
                        }}
                        className="text-neutral-400 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-32 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl">
                    {deals.map((d) => {
                      const checked = bulkDealIds.includes(d.id);
                      return (
                        <label
                          key={d.id}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer truncate ${
                            checked ? 'bg-amber-500/10 text-amber-300' : 'text-neutral-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setBulkDealIds((prev) =>
                                prev.includes(d.id)
                                  ? prev.filter((id) => id !== d.id)
                                  : [...prev, d.id]
                              );
                              setBulkConfirmStep(false);
                            }}
                            className="accent-amber-500"
                          />
                          <span className="truncate font-mono text-[11px]">{d.dealNumber}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Preview Table */}
                <div className="space-y-1.5">
                  <div className="font-semibold text-neutral-300">
                    Price Change Preview ({bulkPreviewRows.length} deals)
                  </div>
                  <div className="max-h-52 overflow-y-auto border border-neutral-800 rounded-xl bg-neutral-950">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-neutral-900 text-neutral-400 sticky top-0">
                        <tr>
                          <th className="p-2.5">Deal</th>
                          <th className="p-2.5 text-right">Current</th>
                          <th className="p-2.5 text-right">New Price</th>
                          <th className="p-2.5 text-right">Difference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/70">
                        {bulkPreviewRows.map((row) => (
                          <tr key={row.deal.id}>
                            <td className="p-2.5 text-white">
                              <span className="font-mono text-amber-400 mr-1.5">{row.deal.dealNumber}</span>
                              {row.deal.title}
                            </td>
                            <td className="p-2.5 text-right font-mono text-neutral-400">
                              Rs. {row.oldPrice.toLocaleString()}
                            </td>
                            <td
                              className={`p-2.5 text-right font-mono font-bold ${
                                row.isValid ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              Rs. {row.newPrice.toLocaleString()}
                            </td>
                            <td className="p-2.5 text-right font-mono text-neutral-400">
                              {row.delta >= 0 ? `+${row.delta}` : row.delta}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {hasInvalidBulkPrices && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      One or more computed prices are zero or negative. Reduce the discount amount before applying.
                    </span>
                  </div>
                )}

                {bulkConfirmStep && !hasInvalidBulkPrices && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Confirmation Required:</strong> You are about to update prices for{' '}
                      <strong>{bulkPreviewRows.length} deals</strong>. Click{' '}
                      <strong>Confirm &amp; Apply Updates</strong> to save immediately.
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPriceModalOpen(false);
                      setBulkConfirmStep(false);
                    }}
                    className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>

                  {!bulkConfirmStep ? (
                    <button
                      type="button"
                      disabled={bulkPreviewRows.length === 0 || hasInvalidBulkPrices}
                      onClick={() => setBulkConfirmStep(true)}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-extrabold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Review &amp; Confirm</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyBulkPrices}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold rounded-xl cursor-pointer"
                    >
                      Confirm &amp; Apply Updates
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
