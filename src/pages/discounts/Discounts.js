import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, EyeIcon, XMarkIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../components/ConfirmationModal';
import DialogueBox from '../../components/DialogueBox';
import { useGetPromotionsQuery, useCreatePromotionMutation, useLazyGetPromotionByIdQuery } from '../../store/api/modules/discounts/discountsApi';

const Discounts = () => {
  const navigate = useNavigate();

  const [isLoading] = useState(false);
  // API: Promotions list
  const { data: promotionsResp, isLoading: promotionsLoading, isError: promotionsError, refetch: refetchPromotions } = useGetPromotionsQuery({ page: 1, limit: 20 });
  const promotions = promotionsResp?.data?.items || [];

  const [createPromotion, { isLoading: creatingPromotion }] = useCreatePromotionMutation();
  const [triggerGetPromotionById] = useLazyGetPromotionByIdQuery();

  // Simplified create promotion modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Dialogue box state for feedback
  const [dialogueBox, setDialogueBox] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const showDialogue = (type, title, message) => setDialogueBox({ isOpen: true, type, title, message });
  const closeDialogue = () => setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });
  const [createForm, setCreateForm] = useState({
    nameDisplay: '',
    nameInternal: '',
    campaignLabel: '',
    descriptionInternal: '',
    promotionType: 'standard',
  });
  const [editingId, setEditingId] = useState(null);

  // Delete confirmation modal state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [confirmationComment, setConfirmationComment] = useState('');
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [createConfirmComment, setCreateConfirmComment] = useState('');

  // Search and Filters
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const defaultFilters = {
    kitchenName: '',
    internalName: '',
    status: 'all', // all | active | inactive | draft
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState(defaultFilters);
  const applyFiltersNow = () => {
    setFilters({ ...pendingFilters });
  };
  const resetFilters = () => {
    setPendingFilters(defaultFilters);
    setFilters(defaultFilters);
    setSearchText('');
    setStatusHeaderToggle(null);
    setSort({ key: 'createdAt', direction: 'desc' });
  };

  // Sorting: default by createdAt desc (latest first)
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' });
  // Status header toggle (cycles active <-> inactive)
  const [statusHeaderToggle, setStatusHeaderToggle] = useState(null); // null | 'active' | 'inactive'

  const handleCreatePromotion = () => {
    setEditingId(null);
    setCreateForm({ nameDisplay: '', nameInternal: '', campaignLabel: '', descriptionInternal: '', promotionType: 'standard' });
    setShowCreateModal(true);
  };

  // Derived: filtered list
  const baseFiltered = promotions.filter((d) => {
    // Search by Discount Name
    const matchesSearch = !searchText || (d.nameDisplay || '').toLowerCase().includes(searchText.toLowerCase());
    // Filter by Kitchen Name (if present on object)
    const matchesKitchen = !filters.kitchenName || (d.kitchenName || '').toLowerCase().includes(filters.kitchenName.toLowerCase());
    // Filter by Internal Name (map to idea/description as internal name surrogate)
    const internal = (d.internalName || d.idea || d.description || '');
    const matchesInternal = !filters.internalName || internal.toLowerCase().includes(filters.internalName.toLowerCase());
    // Status filter
    const matchesStatus = filters.status === 'all' || (d.status || '').toLowerCase() === filters.status.toLowerCase();
    return matchesSearch && matchesKitchen && matchesInternal && matchesStatus;
  });

  // Apply header status toggle filter if set
  const headerStatusFiltered = useMemo(() => {
    if (!statusHeaderToggle) return baseFiltered;
    return baseFiltered.filter(d => (d.status || '').toLowerCase() === statusHeaderToggle);
  }, [baseFiltered, statusHeaderToggle]);

  // Normalize createdAt value (fallback to startDate or id timestamp)
  const getCreatedAt = (d) => {
    if (d.createdAt) return new Date(d.createdAt).getTime();
    if (d.startDate) return new Date(d.startDate).getTime();
    return Number(d.id) || 0;
  };

  const filteredPromotions = useMemo(() => {
    const arr = [...headerStatusFiltered];
    if (sort.key === 'createdAt') {
      arr.sort((a, b) => {
        const av = getCreatedAt(a);
        const bv = getCreatedAt(b);
        return sort.direction === 'asc' ? av - bv : bv - av;
      });
    }
    return arr;
  }, [headerStatusFiltered, sort]);

  const handleSavePromotion = async () => {
    try {
      const payload = {
        nameDisplay: createForm.nameDisplay,
        promotionType: createForm.promotionType,
        campaignLabel: createForm.campaignLabel,
        descriptionInternal: createForm.descriptionInternal,
        nameInternal: createForm.nameInternal,
      };
      const res = await createPromotion(payload).unwrap();
      showDialogue('success', res?.i18n_key || 'Success', res?.message || 'Promotion created successfully.');
      setShowCreateModal(false);
      setCreateForm({ nameDisplay: '', nameInternal: '', campaignLabel: '', descriptionInternal: '', promotionType: 'standard' });
      setEditingId(null);
      refetchPromotions();
    } catch (err) {
      const msg = err?.data?.message || err?.error || 'Failed to create promotion.';
      showDialogue('error', 'Error', msg);
    }
  };

  const handleCancelPromotion = () => {
    setShowCreateModal(false);
    setCreateForm({ nameDisplay: '', nameInternal: '', campaignLabel: '', promotionType: 'standard' });
    setEditingId(null);
  };

  // Match DishesList spinner behavior: full-page spinner while loading
  if (promotionsLoading) {
    return (
      <div className="p-6 text-center text-neutral-600">Working on it...</div>
    );
  }

  const handleDeleteDiscount = (discountId) => {
    const target = promotions.find(d => d.id === discountId);
    setPendingAction({ discountId, discountName: target?.nameDisplay || '' });
    setShowConfirmationModal(true);
    setConfirmationComment('');
  };

  const handleConfirmDelete = () => {
    if (!pendingAction) return;
    // setDiscounts(prev => prev.filter(d => d.id !== pendingAction.discountId));
    setShowConfirmationModal(false);
    setPendingAction(null);
    setConfirmationComment('');
  };

  const getStatusBadge = (status) => (
    status === 'active' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>
    )
  );

  const getTypeBadge = (type) => {
    const typeConfig = {
      percentage: { label: 'Percentage', color: 'bg-blue-100 text-blue-800' },
      amount: { label: 'Amount', color: 'bg-green-100 text-green-800' },
      bogo: { label: 'BOGO', color: 'bg-purple-100 text-purple-800' },
      promo: { label: 'Promo Code', color: 'bg-yellow-100 text-yellow-800' },
      minOrder: { label: 'Min Order', color: 'bg-indigo-100 text-indigo-800' }
    };
    const cfg = typeConfig[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
  };

  const formatDiscountValue = (discount) => {
    switch (discount.type) {
      case 'percentage':
        return `${discount.value}%`;
      case 'amount':
        return `Rs. ${discount.value}`;
      case 'bogo':
        return `Buy ${discount.value} Get ${discount.value} Free`;
      default:
        return discount.value;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-neutral-600">Working on it...</div>
    );
  }

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default Discounts;

