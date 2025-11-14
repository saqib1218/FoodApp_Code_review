import React, { useState } from 'react';
import { useGetFeedbackQuery, useLazyGetFeedbackByIdQuery } from '../../store/api/modules/feedback/feedbackApi';
import { usePermissions } from '../../hooks/usePermissions';
import { Link, useNavigate } from 'react-router-dom';
import { 
  EyeIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Feedback = () => {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // removed delete flow
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [mobileFilter, setMobileFilter] = useState('');
  const [kitchenFilter, setKitchenFilter] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [customerNameFilter, setCustomerNameFilter] = useState('');
  const [customerEmailFilter, setCustomerEmailFilter] = useState('');
  const [kitchenIdFilter, setKitchenIdFilter] = useState('');
  const [feedbackDateFilter, setFeedbackDateFilter] = useState(''); // yyyy-mm-dd
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const { hasPermission } = usePermissions();
  const canViewFeedbackList = hasPermission('admin.feedback.list.view');
  const canViewFeedbackDetail = hasPermission('admin.feedback.detail.view');
  const navigate = useNavigate();
  const [triggerGetDetail] = useLazyGetFeedbackByIdQuery();

  const { data: feedbackResp, isLoading, isError, refetch } = useGetFeedbackQuery({ page: 1, limit: 20 }, { skip: !canViewFeedbackList });
  // API returns { data: { feedbacks: [...] } }
  const apiFeedbacksRaw = feedbackResp?.data?.feedbacks || [];
  const apiFeedbacks = apiFeedbacksRaw.map(f => ({
    id: f.id,
    customerName: f.customerName || '-',
    customerPhone: f.customerPhone || '',
    customerEmail: f.customerEmail || '',
    customerId: f.customerId || '',
    kitchenId: f.kitchenId || '',
    kitchenName: f.kitchenName || '-',
    orderId: f.orderId || f.orderName || null,
    dishName: f.orderName || null,
    status: f.status || '', // preserve original for display
    statusLower: (f.status || '').toLowerCase(), // for filtering/sorting
    rating: Number(f.feedbackRating) || 0,
    createdAt: f.createdAt || ''
  }));

  // Use API data exclusively
  const sourceList = apiFeedbacks;

  // Filter feedbacks based on requested filters only
  const filteredFeedbacks = sourceList.filter(feedback => {
    const matchesSearch = (feedback.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomerName = (feedback.customerName || '').toLowerCase().includes(customerNameFilter.toLowerCase());
    const matchesCustomerEmail = (feedback.customerEmail || '').toLowerCase().includes(customerEmailFilter.toLowerCase());
    const matchesMobile = (feedback.customerPhone || '').includes(mobileFilter);
    const matchesKitchen = (feedback.kitchenName || '').toLowerCase().includes(kitchenFilter.toLowerCase());
    const matchesKitchenId = (feedback.kitchenId || '').toLowerCase().includes(kitchenIdFilter.toLowerCase());
    const matchesOrderId = feedback.orderId ? String(feedback.orderId).toLowerCase().includes(orderIdFilter.toLowerCase()) : true;
    const matchesStatus = statusFilter === 'all' || (feedback.statusLower || '') === statusFilter.toLowerCase();
    const matchesFeedbackDate = (() => {
      if (!feedbackDateFilter) return true;
      if (!feedback.createdAt) return false;
      const fDate = new Date(feedback.createdAt);
      if (Number.isNaN(fDate.getTime())) return false;
      const yyyy = fDate.getFullYear();
      const mm = String(fDate.getMonth() + 1).padStart(2, '0');
      const dd = String(fDate.getDate()).padStart(2, '0');
      const onlyDate = `${yyyy}-${mm}-${dd}`;
      return onlyDate === feedbackDateFilter;
    })();
    
    return matchesSearch && matchesCustomerName && matchesCustomerEmail && matchesMobile && matchesKitchen && matchesKitchenId && matchesOrderId && matchesStatus && matchesFeedbackDate;
  }).sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'rating') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    } else if (sortField === 'status') {
      aValue = a.statusLower;
      bValue = b.statusLower;
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (statusRaw) => {
    const sUpper = String(statusRaw || '').toUpperCase();
    if (sUpper === 'PENDING_AT_KITCHEN') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{statusRaw}</span>;
    if (sUpper === 'INITIATED' || sUpper === 'PENDING') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{statusRaw}</span>;
    if (['APPROVED','RESOLVED','COMPLETED','DONE'].includes(sUpper)) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{statusRaw}</span>;
    if (['REJECTED','CLOSED'].includes(sUpper)) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{statusRaw}</span>;
    if (['IN_PROGRESS','IN PROGRESS','PROCESSING'].includes(sUpper)) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{statusRaw}</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{statusRaw || 'Unknown'}</span>;
  };

  // delete handlers removed

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4 inline ml-1" /> : 
      <ChevronDownIcon className="h-4 w-4 inline ml-1" />;
  };

  // Apply and reset filters (UI parity with KitchensList)
  const applyFiltersNow = () => {
    // Filters are already live-bound; keep this to mirror UX and close panel
    setShowAdvancedFilters(false);
  };
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setShowAdvancedFilters(false);
    setMobileFilter('');
    setKitchenFilter('');
    setOrderIdFilter('');
    setCustomerNameFilter('');
    setCustomerEmailFilter('');
    setKitchenIdFilter('');
    setFeedbackDateFilter('');
  };

  if (!canViewFeedbackList) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
          <p className="text-neutral-500">You don't have permission to view the feedback list.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-sm text-neutral-500">Loading feedbacks...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Error Loading Feedbacks</h3>
          <p className="text-neutral-500 mb-4">Failed to load feedback data. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default Feedback;