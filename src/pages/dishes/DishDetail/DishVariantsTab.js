  // Mutations

import React, { useState, useEffect, useContext } from 'react';
import { PlusIcon, PencilIcon, EyeIcon, TrashIcon, XMarkIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import { DishContext } from './index';
import ConfirmationModal from '../../../components/ConfirmationModal';
import DialogueBox from '../../../components/DialogueBox';
import dishDropdownData from '../../../data/dishDropdown/dishDropdownData.json';
import { useGetDishVariantsQuery, useCreateDishVariantMutation, useLazyGetDishVariantByIdQuery, useUpdateDishVariantMutation, useLazyGetDishVariantItemsQuery, useCreateDishVariantItemMutation, useLazyGetDishVariantItemByIdQuery, useUpdateDishVariantItemMutation, useDeleteDishVariantItemMutation } from '../../../store/api/modules/dishes/dishesApi';
import { skipToken } from '@reduxjs/toolkit/query';

const DishVariantsTab = () => {
  const { id: dishId, dish } = useContext(DishContext);
  const { hasPermission } = useAuth();
  // Normalize category to robustly detect Home Catering
  const isHomeCatering = ((dish?.category || '') + '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .trim() === 'home catering';
  
  // Permissions for variants
  const canViewVariants = hasPermission(PERMISSIONS.DISH_VARIANT_LIST_VIEW);
  const canAddVariant = hasPermission(PERMISSIONS.DISH_VARIANT_CREATE);
  const canViewVariantDetail = hasPermission(PERMISSIONS.DISH_VARIANT_DETAIL_VIEW);
  const canEditVariant = hasPermission(PERMISSIONS.DISH_VARIANT_EDIT);
  const canViewVariantItems = hasPermission(PERMISSIONS.DISH_VARIANT_LIST_VIEW);
  const canCreateVariantItem = hasPermission(PERMISSIONS.DISH_VARIANT_ITEM_CREATE);
  const canViewVariantItemDetail = hasPermission(PERMISSIONS.DISH_VARIANT_ITEM_DETAIL_VIEW);
  const canEditVariantItem = hasPermission(PERMISSIONS.DISH_VARIANT_ITEM_EDIT);
  const canDeleteVariantItem = hasPermission(PERMISSIONS.DISH_VARIANT_ITEM_DELETE);
  const [createDishVariant, { isLoading: isCreatingVariant }] = useCreateDishVariantMutation();
  const [triggerGetVariant, { isFetching: isFetchingVariant }] = useLazyGetDishVariantByIdQuery();
  const [updateDishVariant, { isLoading: isUpdatingVariant }] = useUpdateDishVariantMutation();
  const [triggerGetItems, { isFetching: isFetchingItems }] = useLazyGetDishVariantItemsQuery();
  const [createVariantItem, { isLoading: isCreatingVariantItem }] = useCreateDishVariantItemMutation();
  const [triggerGetItemDetail, { isFetching: isFetchingItemDetail }] = useLazyGetDishVariantItemByIdQuery();
  const [updateVariantItem, { isLoading: isUpdatingVariantItem }] = useUpdateDishVariantItemMutation();
  const [deleteVariantItem, { isLoading: isDeletingVariantItem }] = useDeleteDishVariantItemMutation();
  
  // State variables
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [editVariantForm, setEditVariantForm] = useState({
    title: '',
    description: '',
    unit: '',
    unitQuantity: '',
    // Derived UI fields for range/quantity handling in edit modal
    quantity: '',
    minQuantity: '',
    maxQuantity: '',
    minOrderQuantity: '',
    price: '',
    currency: 'PKR',
    perOrderLimit: '',
    dailyLimit: '',
    status: 'active',
    isActive: true,
  });
  const [deleteComment, setDeleteComment] = useState('');
  // 3-dots actions menu state
  const [openMenuFor, setOpenMenuFor] = useState(null); // row index key
  const [openMenuPos, setOpenMenuPos] = useState({ top: 0, left: 0 });
  const handleOpenMenu = (e, rowKey) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 176; // 44 * 4
    const menuHeight = 112; // approx
    const gap = 8;
    const top = rect.top + window.scrollY - menuHeight - gap; // open upward
    const left = rect.right + window.scrollX - menuWidth; // right align
    setOpenMenuPos({ top, left });
    setOpenMenuFor(openMenuFor === rowKey ? null : rowKey);
  };
  
  // Form state
  const [variantForm, setVariantForm] = useState({
    name: '',
    description: '',
    unit: '',
    quantity: '',
    minQuantity: '',
    maxQuantity: '',
    price: '',
    currency: 'PKR',
    perLimit: '',
    dailyLimit: '',
    status: 'active'
  });
  
  // Dialogue box state
  const [dialogueBox, setDialogueBox] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Dialogue box helper functions
  const showDialogue = (type, title, message) => {
    setDialogueBox({
      isOpen: true,
      type,
      title,
      message
    });
  };

  // Home Catering: Items per variant
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedVariantForItem, setSelectedVariantForItem] = useState(null);
  const [editingItemIndex, setEditingItemIndex] = useState(null); // null for add, index for edit
  const [itemModalMode, setItemModalMode] = useState('list'); // 'list' | 'form'
  const [itemForm, setItemForm] = useState({ name: '', description: '', status: 'active' });
  const [editingItemId, setEditingItemId] = useState(null);

  const handleOpenItems = async (variant) => {
    if (!canViewVariantItems) {
      showDialogue('error', 'Access Denied', "You don't have access to view the list of items.");
      return;
    }
    try {
      setSelectedVariantForItem(variant);
      setEditingItemIndex(null);
      setItemForm({ name: '', description: '', status: 'active' });
      setItemModalMode('list');
      const variantId = variant.dishVariantId || variant.id;
      const resp = await triggerGetItems(variantId).unwrap();
      const data = resp?.data || resp;
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setSelectedVariantForItem(prev => ({ ...(prev || variant), items }));
      setShowItemModal(true);
    } catch (error) {
      console.error('Failed to load items:', error);
      showDialogue('error', 'Load Failed', `Failed to load items: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleOpenEditItem = async (variant, itemIndex) => {
    if (!canViewVariantItemDetail) return; // icon will be hidden, but extra safety
    try {
      setSelectedVariantForItem(variant);
      setEditingItemIndex(itemIndex);
      const item = (variant.items || [])[itemIndex];
      const variantId = variant.dishVariantId || variant.id;
      const itemId = item?.dishVariantItemId || item?.id;
      setEditingItemId(itemId || null);
      if (variantId && itemId) {
        const resp = await triggerGetItemDetail({ variantId, itemId }).unwrap();
        const data = resp?.data || resp;
        const detail = data?.item || data; // support {item: {...}} or raw
        setItemForm({
          name: detail?.name || item?.name || '',
          description: detail?.description || item?.description || '',
          status: String(detail?.status || item?.status || 'ACTIVE').toLowerCase() === 'inactive' ? 'inactive' : 'active',
        });
      } else {
        // Fallback to current list item if ids missing
        setItemForm({ name: item?.name || '', description: item?.description || '', status: item?.status || 'active' });
      }
      setItemModalMode('form');
      setShowItemModal(true);
    } catch (error) {
      console.error('Failed to fetch item detail:', error);
      showDialogue('error', 'Load Failed', `Failed to load item details: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleSaveItem = async () => {
    if (!itemForm.name.trim()) {
      showDialogue('error', 'Validation Error', 'Item name is required.');
      return;
    }
    const variantId = selectedVariantForItem?.dishVariantId || selectedVariantForItem?.id;
    const body = {
      name: itemForm.name.trim(),
      description: itemForm.description?.trim() || '',
      status: String(itemForm.status || 'active').toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    };
    try {
      if (editingItemIndex !== null) {
        // Update existing item
        if (!canEditVariantItem) {
          showDialogue('error', 'Access Denied', "You don't have permission to edit items.");
          return;
        }
        await updateVariantItem({ variantId, itemId: editingItemId, body }).unwrap();
        showDialogue('success', 'Item Updated', 'Item has been updated successfully.');
      } else {
        // Create new item
        if (!canCreateVariantItem) {
          showDialogue('error', 'Access Denied', "You don't have permission to create items.");
          return;
        }
        await createVariantItem({ variantId, body }).unwrap();
        showDialogue('success', 'Item Added', 'Item has been added successfully.');
      }
      // Refetch items after create/update
      const resp = await triggerGetItems(variantId).unwrap();
      const data = resp?.data || resp;
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setSelectedVariantForItem(prev => ({ ...(prev || {}), items }));
      setItemModalMode('list');
      setEditingItemIndex(null);
      setEditingItemId(null);
      setItemForm({ name: '', description: '', status: 'active' });
    } catch (error) {
      console.error('Failed to save item:', error);
      showDialogue('error', 'Save Failed', `Failed to save item: ${error?.data?.message || error?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteItem = async (variant, itemIndex) => {
    if (!canDeleteVariantItem) {
      showDialogue('error', 'Access Denied', "You don't have permission to delete items.");
      return;
    }
    try {
      const variantId = variant?.dishVariantId || variant?.id;
      const item = (variant.items || [])[itemIndex];
      const itemId = item?.dishVariantItemId || item?.id;
      if (!variantId || !itemId) {
        showDialogue('error', 'Delete Failed', 'Missing variant or item identifier.');
        return;
      }
      await deleteVariantItem({ variantId, itemId }).unwrap();
      // Refetch items
      const resp = await triggerGetItems(variantId).unwrap();
      const data = resp?.data || resp;
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setSelectedVariantForItem(prev => ({ ...(prev || {}), items }));
      showDialogue('success', 'Item Deleted', 'The item has been deleted successfully.');
    } catch (error) {
      console.error('Failed to delete item:', error);
      showDialogue('error', 'Delete Failed', `Failed to delete item: ${error?.data?.message || error?.message || 'Unknown error'}`);
    }
  };

  const closeDialogue = () => {
    setDialogueBox({
      isOpen: false,
      type: 'success',
      title: '',
      message: ''
    });
  };

  // Fetch variants from API when permitted
  const { data: variantsResp, isLoading: isVariantsLoading } = useGetDishVariantsQuery(
    canViewVariants && dishId ? dishId : skipToken
  );

  useEffect(() => {
    if (!canViewVariants) {
      setIsLoading(false);
      return;
    }
    setIsLoading(isVariantsLoading);
    if (variantsResp) {
      // API may return:
      // - { success, data: { variants: [...] } }
      // - { success, data: [...] }
      // - or raw array
      const dataBlock = variantsResp?.data;
      const list = Array.isArray(dataBlock?.variants)
        ? dataBlock.variants
        : Array.isArray(dataBlock)
          ? dataBlock
          : Array.isArray(variantsResp)
            ? variantsResp
            : [];
      // Normalize minimal fields for UI
      const normalized = list.map(v => ({
        id: v.id || v.dishVariantId,
        dishVariantId: v.dishVariantId ,
        title: v.title || v.name || '-',
        description: v.description || '',
        unit: v.unit || '',
        unitQuantity: v.unitQuantity ?? v.quantity ?? v.defaultQuantity ?? '',
        minOrderQuantity: v.minOrderQuantity ?? v.minQty ?? '',
        price: v.price ?? v.amount ?? '',
        currency: v.currency || 'PKR',
        perOrderLimit: v.perOrderLimit ?? '',
        dailyLimit: v.dailyLimit ?? '',
        status: v.status || (v.isActive ? 'active' : 'inactive'),
        isActive: typeof v.isActive === 'boolean' ? v.isActive : (String(v.status).toLowerCase() === 'active'),
        createdAt: v.createdAt || '',
        items: Array.isArray(v.items) ? v.items : [],
      }));
      setVariants(normalized);
    }
  }, [variantsResp, isVariantsLoading, canViewVariants]);

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // Prevent negative values for numeric fields
    const numericFields = new Set(['price','minQuantity','maxQuantity','quantity','perLimit','dailyLimit']);
    let nextValue = value;
    if (numericFields.has(name)) {
      if (value === '' || value === null || typeof value === 'undefined') {
        nextValue = '';
      } else {
        const num = Number(value);
        nextValue = Number.isNaN(num) ? '' : (num < 0 ? '0' : value);
      }
    }
    setVariantForm(prev => ({
      ...prev,
      [name]: nextValue
    }));
  };

  // Handle add variant
  const handleAddVariant = () => {
    setVariantForm({
      name: '',
      description: '',
      unit: '',
      quantity: '',
      minQuantity: '',
      maxQuantity: '',
      price: '',
      currency: 'PKR',
      perLimit: '',
      dailyLimit: '',
      status: 'active'
    });
    setShowAddModal(true);
  };

  // Handle save variant
  const handleSaveVariant = async () => {
    try {
      // Validation
      if (!variantForm.name.trim()) {
        showDialogue('error', 'Validation Error', 'Variant name is required.');
        return;
      }
      
      if (!variantForm.price.trim()) {
        showDialogue('error', 'Validation Error', 'Price is required.');
        return;
      }

      // Build payload as per requirements
      const useRange = variantForm.unit === 'range' && variantForm.minQuantity && variantForm.maxQuantity;
      const payload = {
        title: variantForm.name.trim(),
        description: variantForm.description?.trim() || '',
        unit: variantForm.unit,
        unitQuantity: useRange ? Number(variantForm.maxQuantity) : Number(variantForm.quantity || 1),
        price: Number(variantForm.price),
        currency: variantForm.currency || 'PKR',
        perOrderLimit: variantForm.perLimit ? Number(variantForm.perLimit) : undefined,
        dailyLimit: variantForm.dailyLimit ? Number(variantForm.dailyLimit) : undefined,
        isActive: (variantForm.status || 'active') === 'active',
        minOrderQuantity: useRange ? Number(variantForm.minQuantity) : Number(variantForm.quantity || 1),
      };

      await createDishVariant({ dishId, body: payload }).unwrap();

      setShowAddModal(false);
      showDialogue('success', 'Variant Added', 'Dish variant has been added successfully!');
      
    } catch (error) {
      console.error('Failed to save variant:', error);
      showDialogue('error', 'Save Failed', `Failed to save variant: ${error.message || 'Unknown error occurred'}`);
    }
  };

  // Handle view variant
  const handleViewVariant = (variant) => {
    // Map list row shape to view modal shape expected by UI
    const viewVariant = {
      name: variant.title || '-',
      description: variant.description || '-',
      unit: variant.unit || '',
      quantity: variant.unitQuantity ?? '',
      minQuantity: variant.minOrderQuantity ?? '',
      maxQuantity: variant.unitQuantity ?? '',
      price: variant.price ?? '',
      currency: variant.currency || 'PKR',
      perLimit: variant.perOrderLimit || '',
      dailyLimit: variant.dailyLimit || '',
      status: variant.status || (variant.isActive ? 'active' : 'inactive'),
      createdAt: variant.createdAt || '',
    };
    setSelectedVariant(viewVariant);
    setShowViewModal(true);
  };

  // Handle edit variant
  const handleEditVariant = async (variant) => {
    try {
      // Fetch latest detail by variant id
      const variantKey = variant.dishVariantId || variant.id;
      const resp = await triggerGetVariant(variantKey).unwrap();
      const data = resp?.data || resp; // supports both {data: {...}} and raw
      const v = data?.variant || data; // supports {variant: {...}}
      const normalized = {
        title: v.title || v.name || '',
        description: v.description || '',
        unit: v.unit || '',
        unitQuantity: v.unitQuantity ?? v.quantity ?? '',
        minOrderQuantity: v.minOrderQuantity ?? '',
        price: v.price ?? '',
        currency: v.currency || 'PKR',
        perOrderLimit: v.perOrderLimit ?? '',
        dailyLimit: v.dailyLimit ?? '',
        status: v.status || (v.isActive ? 'active' : 'inactive'),
        isActive: typeof v.isActive === 'boolean' ? v.isActive : String(v.status).toLowerCase() === 'active',
      };
      // derive UI fields
      const derived = {
        quantity: normalized.unit === 'range' ? '' : String(normalized.unitQuantity || ''),
        minQuantity: normalized.unit === 'range' ? String(normalized.minOrderQuantity || '') : '',
        maxQuantity: normalized.unit === 'range' ? String(normalized.unitQuantity || '') : '',
      };
      setSelectedVariant({ id: v.id || variantKey, dishVariantId: variantKey, ...normalized });
      setEditVariantForm({ ...normalized, ...derived });
      setShowEditModal(true);
    } catch (error) {
      console.error('Failed to fetch variant detail:', error);
      showDialogue('error', 'Load Failed', `Failed to load variant details: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    // Prevent negative values for numeric fields
    const numericFields = new Set(['price','minQuantity','maxQuantity','quantity','perOrderLimit','dailyLimit']);
    let nextValue = value;
    if (numericFields.has(name)) {
      if (value === '' || value === null || typeof value === 'undefined') {
        nextValue = '';
      } else {
        const num = Number(value);
        nextValue = Number.isNaN(num) ? '' : (num < 0 ? '0' : value);
      }
    }
    setEditVariantForm(prev => ({ ...prev, [name]: nextValue }));
  };

  const handleUpdateVariant = async () => {
    if (!selectedVariant?.dishVariantId) return;
    try {
      const useRange = editVariantForm.unit === 'range' && editVariantForm.minQuantity && editVariantForm.maxQuantity;
      const body = {
        title: editVariantForm.title?.trim(),
        description: editVariantForm.description?.trim() || '',
        unit: editVariantForm.unit,
        unitQuantity: useRange ? Number(editVariantForm.maxQuantity) : Number(editVariantForm.quantity || editVariantForm.unitQuantity || 0),
        minOrderQuantity: useRange ? Number(editVariantForm.minQuantity) : undefined,
        price: Number(editVariantForm.price || 0),
        currency: editVariantForm.currency || 'PKR',
        perOrderLimit: editVariantForm.perOrderLimit ? Number(editVariantForm.perOrderLimit) : undefined,
        dailyLimit: editVariantForm.dailyLimit ? Number(editVariantForm.dailyLimit) : undefined,
        isActive: (editVariantForm.status || 'active') === 'active',
      };
      const variantKey = selectedVariant.dishVariantId 
      console.log("variantKey",selectedVariant)
      await updateDishVariant({ dishId, variantId: variantKey, body }).unwrap();
      setShowEditModal(false);
      showDialogue('success', 'Variant Updated', 'Dish variant has been updated successfully!');
    } catch (error) {
      console.error('Failed to update variant:', error);
      showDialogue('error', 'Update Failed', `Failed to update variant: ${error?.message || 'Unknown error'}`);
    }
  };

  // Handle delete variant
  const handleDeleteVariant = (variant) => {
    setSelectedVariant(variant);
    setDeleteComment('');
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      // TODO: Replace with RTK Query mutation
      console.log('Deleting variant:', selectedVariant.id);
      
      // Remove from local state
      setVariants(prev => prev.filter(v => v.id !== selectedVariant.id));
      setShowDeleteModal(false);
      setSelectedVariant(null);
      setDeleteComment('');
      showDialogue('success', 'Variant Deleted', 'Dish variant has been deleted successfully!');
      
    } catch (error) {
      console.error('Failed to delete variant:', error);
      showDialogue('error', 'Delete Failed', `Failed to delete variant: ${error.message || 'Unknown error occurred'}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">Dish Variants</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Manage different variants and pricing options for this dish.
            </p>
          </div>
          {canAddVariant && (
            <button
              onClick={handleAddVariant}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Variant
            </button>
          )}
        </div>
      </div>

      {/* Variants Table */}
      {!canViewVariants ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to access dish variants.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            {variants.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50">
                <p className="text-neutral-500">No variants found for this dish.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Dish ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Dish Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Price / Currency</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Unit / Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {variants.map((variant, index) => (
                    <tr key={variant.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{dishId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">{variant.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {dish?.category || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{variant.price} {variant.currency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{variant.unit || '-'}{variant.unit ? ' / ' : ''}{variant.unitQuantity || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {variant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-full hover:bg-neutral-100 text-neutral-700"
                            onClick={(e) => handleOpenMenu(e, `row-${index}`)}
                            aria-haspopup="menu"
                            aria-expanded={openMenuFor === `row-${index}`}
                          >
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Floating row actions menu */}
      {openMenuFor && (
        <div className="fixed inset-0 z-[70]" onClick={() => setOpenMenuFor(null)}>
          <div
            className="absolute w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
            style={{ top: openMenuPos.top, left: openMenuPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              {(() => {
                const idx = Number(String(openMenuFor).replace('row-',''));
                const row = variants[idx];
                if (!row) return null;
                return (
                  <>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => { handleViewVariant(row); setOpenMenuFor(null); }}
                    >
                      View Variant
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => { handleEditVariant(row); setOpenMenuFor(null); }}
                      disabled={!canEditVariant}
                    >
                      Edit Variant
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Edit Variant Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h3 className="text-lg font-medium text-neutral-900">Edit Variant</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
                disabled={isUpdatingVariant}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={editVariantForm.title}
                    onChange={handleEditFormChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Variant title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editVariantForm.description}
                    onChange={handleEditFormChange}
                    rows={2}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe this variant"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Unit</label>
                    <select
                      name="unit"
                      value={editVariantForm.unit}
                      onChange={handleEditFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select unit</option>
                      {dishDropdownData.dishUnits?.map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                      <option value="range">range</option>
                    </select>
                  </div>
                  {editVariantForm.unit === 'range' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Min Quantity</label>
                        <input
                          type="number"
                          name="minQuantity"
                          value={editVariantForm.minQuantity}
                          onChange={handleEditFormChange}
                          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., 1"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Max Quantity</label>
                        <input
                          type="number"
                          name="maxQuantity"
                          value={editVariantForm.maxQuantity}
                          onChange={handleEditFormChange}
                          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., 10"
                          min="0"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={editVariantForm.quantity}
                        onChange={handleEditFormChange}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., 2"
                        min="0"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={editVariantForm.price}
                    onChange={handleEditFormChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter price"
                    min="0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Currency</label>
                    <input
                      type="text"
                      name="currency"
                      value={editVariantForm.currency}
                      onChange={handleEditFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={editVariantForm.status}
                      onChange={handleEditFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Per Order Limit</label>
                    <input
                      type="number"
                      name="perOrderLimit"
                      value={editVariantForm.perOrderLimit}
                      onChange={handleEditFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Max per order"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Daily Limit</label>
                    <input
                      type="number"
                      name="dailyLimit"
                      value={editVariantForm.dailyLimit}
                      onChange={handleEditFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Max per day"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
                  disabled={isUpdatingVariant}
                >
                  Cancel
                </button>
                {canEditVariant && (
                  <button
                    onClick={handleUpdateVariant}
                    disabled={isUpdatingVariant || isFetchingVariant}
                    className={`px-4 py-2 rounded-full transition-colors text-sm font-medium ${isUpdatingVariant ? 'bg-primary-300 cursor-not-allowed text-white' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
                  >
                    {isUpdatingVariant ? 'Updating...' : 'Update Variant'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Item Modal (Home Catering) */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h3 className="text-lg font-medium text-neutral-900">{itemModalMode === 'list' ? 'Variant Items' : (editingItemIndex === null ? 'Add Item' : 'Edit Item')}</h3>
              <button
                onClick={() => { setShowItemModal(false); setItemModalMode('list'); }}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 pb-6">
              {itemModalMode === 'list' ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-neutral-600">Manage items for this variant.</p>
                    </div>
                    {canCreateVariantItem && (
                      <button
                        onClick={() => { setEditingItemIndex(null); setItemForm({ name: '', description: '', status: 'active' }); setItemModalMode('form'); }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        Add Item
                      </button>
                    )}
                  </div>
                  {(selectedVariantForItem?.items || []).length === 0 ? (
                    <div className="text-center py-8 bg-neutral-50 rounded-lg">No items yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Description</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                          {(selectedVariantForItem?.items || []).map((it, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm text-neutral-900">{it.name}</td>
                              <td className="px-4 py-2 text-sm text-neutral-700">{it.description || '-'}</td>
                              <td className="px-4 py-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${String(it.status || 'active').toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {it.status || 'active'}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right">
                                {canViewVariantItemDetail && (
                                  <button
                                    onClick={() => handleOpenEditItem(selectedVariantForItem, idx)}
                                    className="text-blue-600 hover:text-blue-900 mr-2"
                                    title="Edit item"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                )}
                                {canDeleteVariantItem && (
                                  <button
                                    onClick={() => handleDeleteItem(selectedVariantForItem, idx)}
                                    disabled={isDeletingVariantItem}
                                    className={`transition-colors ${isDeletingVariantItem ? 'text-red-300 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                                    title="Delete item"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Item Name *</label>
                      <input
                        type="text"
                        value={itemForm.name}
                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter item name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                      <textarea
                        value={itemForm.description}
                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                        rows={3}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter item description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                      <select
                        value={itemForm.status}
                        onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => setItemModalMode('list')}
                      className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
                    >
                      Back to List
                    </button>
                    <div className="space-x-3">
                      <button
                        onClick={() => { setShowItemModal(false); setItemModalMode('list'); }}
                        className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveItem}
                        disabled={isCreatingVariantItem}
                        className={`px-4 py-2 rounded-full transition-colors text-sm font-medium ${isCreatingVariantItem ? 'bg-primary-300 cursor-not-allowed text-white' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
                      >
                        {isCreatingVariantItem ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Add Variant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h3 className="text-lg font-medium text-neutral-900">Add Variant</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Variant Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={variantForm.name}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Regular, Large, Family Pack"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Variant Description
                  </label>
                  <textarea
                    name="description"
                    value={variantForm.description}
                    onChange={handleFormChange}
                    rows={2}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe this variant"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Unit
                    </label>
                    <select
                      name="unit"
                      value={variantForm.unit}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select unit</option>
                      {dishDropdownData.dishUnits?.map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  {variantForm.unit === 'range' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Min Quantity
                        </label>
                        <input
                          type="number"
                          name="minQuantity"
                          value={variantForm.minQuantity}
                          onChange={handleFormChange}
                          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., 1"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Max Quantity
                        </label>
                        <input
                          type="number"
                          name="maxQuantity"
                          value={variantForm.maxQuantity}
                          onChange={handleFormChange}
                          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., 10"
                          min="0"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="text"
                        name="quantity"
                        value={variantForm.quantity}
                        onChange={handleFormChange}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., 1, 2"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Price *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    <input
                      type="number"
                      name="price"
                      value={variantForm.price}
                      onChange={handleFormChange}
                      className="col-span-4 p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter price"
                      min="0"
                    />
                    <select
                      name="currency"
                      value={variantForm.currency}
                      disabled
                      className="col-span-1 p-3 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-700"
                    >
                      <option value="PKR">PKR</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Per Order Limit
                    </label>
                    <input
                      type="number"
                      name="perLimit"
                      value={variantForm.perLimit}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Max per order"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Daily Limit
                    </label>
                    <input
                      type="number"
                      name="dailyLimit"
                      value={variantForm.dailyLimit}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Max per day"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVariant}
                  disabled={isCreatingVariant}
                  className={`px-4 py-2 rounded-full transition-colors text-sm font-medium ${isCreatingVariant ? 'bg-primary-300 cursor-not-allowed text-white' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
                >
                  {isCreatingVariant ? 'Saving...' : 'Save Variant'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Variant Modal */}
      {showViewModal && selectedVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Variant Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-neutral-700">Name:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedVariant.name}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Description:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedVariant.description || '-'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Unit/Quantity:</span>
                <span className="ml-2 text-sm text-neutral-900">
                  {selectedVariant.unit === 'serving'
                    ? `${selectedVariant.minQuantity || '-'} - ${selectedVariant.maxQuantity || '-'} serving`
                    : `${selectedVariant.quantity} ${selectedVariant.unit}`}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Price:</span>
                <span className="ml-2 text-sm font-medium text-neutral-900">PKR {selectedVariant.price}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Per Order Limit:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedVariant.perLimit || 'No limit'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Daily Limit:</span>
                <span className="ml-2 text-sm text-neutral-900">{selectedVariant.dailyLimit || 'No limit'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Status:</span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedVariant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedVariant.status}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-700">Created:</span>
                <span className="ml-2 text-sm text-neutral-900">{formatDate(selectedVariant.createdAt)}</span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVariant && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Variant"
          message={`Are you sure you want to permanently delete the variant "${selectedVariant.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedVariant(null);
            setDeleteComment('');
          }}
          comment={deleteComment}
          onCommentChange={setDeleteComment}
          variant="danger"
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

export default DishVariantsTab;
