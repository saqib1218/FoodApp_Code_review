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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Discount Management</h1>
        <p className="mt-1 text-sm text-gray-500">Manage discounts, offers, and promotional codes</p>
      </div>

      {/* Toolbar: Create above, then Search + Filters */}
      <div className="mb-6 flex flex-col gap-3">
        {/* Create button row */}
        <div className="flex items-center justify-end">
          <button
            onClick={handleCreatePromotion}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            Create Promotion
          </button>
        </div>
        {/* Search + Filters row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Discount Name</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search by discount name"
              />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md bg-white hover:bg-neutral-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2 text-neutral-500" />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-neutral-200 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Kitchen Name</label>
              <input
                type="text"
                value={pendingFilters.kitchenName}
                onChange={(e) => setPendingFilters({ ...pendingFilters, kitchenName: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-lg"
                placeholder="e.g., Riwayat DHA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Discount Internal Name</label>
              <input
                type="text"
                value={pendingFilters.internalName}
                onChange={(e) => setPendingFilters({ ...pendingFilters, internalName: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-lg"
                placeholder="e.g., weekend_special_internal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
              <select
                value={pendingFilters.status}
                onChange={(e) => setPendingFilters({ ...pendingFilters, status: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded-lg"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="md:col-span-3 mt-2 flex items-center gap-3">
              <button
                onClick={applyFiltersNow}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
              >
                Search
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Promotions Table (from API) */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name Display</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Promotion Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Campaign Label</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {promotionsLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                      <span className="text-sm text-neutral-600">Loading promotions...</span>
                    </div>
                  </td>
                </tr>
              ) : promotionsError ? (
                <tr><td colSpan={6} className="px-6 py-6 text-center text-sm text-red-600">Failed to load promotions.</td></tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-sm text-neutral-500">No promotions found.</td>
                </tr>
              ) : promotions.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-3 text-sm text-neutral-900">{p.nameDisplay || '-'}</td>
                  <td className="px-6 py-3 text-sm text-neutral-900">{p.promotionType || '-'}</td>
                  <td className="px-6 py-3 text-sm text-neutral-900">{p.campaignLabel || '-'}</td>
                  <td className="px-6 py-3 text-sm">{p.status || '-'}</td>
                  <td className="px-6 py-3 text-sm text-neutral-700">{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={async () => {
                        try {
                          const res = await triggerGetPromotionById(p.id).unwrap();
                          const data = res?.data || {};
                          navigate(`/discounts/${p.id}`, { state: { promotion: {
                            id: data.id || p.id,
                            nameInternal: data.nameInternal ?? null,
                            nameDisplay: data.nameDisplay ?? p.nameDisplay ?? null,
                            promotionType: data.promotionType ?? p.promotionType ?? null,
                            campaignLabel: data.campaignLabel ?? p.campaignLabel ?? null,
                            status: data.status ?? p.status ?? null,
                            descriptionInternal: data.descriptionInternal ?? null,
                          } } });
                        } catch (e) {
                          showDialogue('error', 'Error', e?.data?.message || 'Failed to fetch promotion details.');
                        }
                      }}
                      className="text-primary-600 hover:text-primary-800"
                      title="View promotion"
                    >
                      <EyeIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Promotion Modal - Simplified */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-neutral-900">{editingId ? 'Edit Promotion' : 'Create Promotion'}</h3>
              <button onClick={handleCancelPromotion} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name Display *</label>
                <input
                  type="text"
                  value={createForm.nameDisplay}
                  onChange={(e) => setCreateForm({ ...createForm, nameDisplay: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Enter display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name Internal</label>
                <input
                  type="text"
                  value={createForm.nameInternal}
                  onChange={(e) => setCreateForm({ ...createForm, nameInternal: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Internal reference name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description Internal</label>
                <textarea
                  rows={3}
                  value={createForm.descriptionInternal}
                  onChange={(e) => setCreateForm({ ...createForm, descriptionInternal: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Internal description (not shown to customers)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Campaign Label</label>
                <input
                  type="text"
                  value={createForm.campaignLabel}
                  onChange={(e) => setCreateForm({ ...createForm, campaignLabel: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Label shown in campaign UI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Promotion Type</label>
                <select
                  value={createForm.promotionType}
                  onChange={(e) => setCreateForm({ ...createForm, promotionType: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                >
                  <option value="standard">Standard</option>
                  <option value="pre_order">Pre-Order</option>
                  <option value="target_base">Target Base</option>
                  <option value="voucher">Voucher</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={handleCancelPromotion} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 text-sm font-medium">Cancel</button>
              <button onClick={() => setShowCreateConfirm(true)} className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <ConfirmationModal
          isOpen={showConfirmationModal}
          title="Delete Discount"
          message={`Are you sure you want to permanently delete discount "${pendingAction?.discountName || ''}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => { setShowConfirmationModal(false); setPendingAction(null); setConfirmationComment(''); }}
          comment={confirmationComment}
          onCommentChange={setConfirmationComment}
          variant="danger"
        />
      )}

      {/* Create Promotion Confirmation */}
      {showCreateConfirm && (
        <ConfirmationModal
          isOpen={showCreateConfirm}
          title={editingId ? 'Update Promotion' : 'Create Promotion'}
          message={editingId ? 'Are you sure you want to update this promotion?' : 'Are you sure you want to create this promotion?'}
          comment={createConfirmComment}
          onCommentChange={setCreateConfirmComment}
          onConfirm={() => { setShowCreateConfirm(false); handleSavePromotion(); setCreateConfirmComment(''); }}
          onCancel={() => { setShowCreateConfirm(false); setCreateConfirmComment(''); }}
          confirmButtonText={editingId ? 'Update' : 'Create'}
          confirmButtonColor="primary"
          isCommentRequired={true}
        />
      )}

      {/* DialogueBox for feedback */}
      <DialogueBox
        isOpen={dialogueBox.isOpen}
        onClose={closeDialogue}
        type={dialogueBox.type}
        title={dialogueBox.title}
        message={dialogueBox.message}
      />
    </div>
  );
};

export default Discounts;

