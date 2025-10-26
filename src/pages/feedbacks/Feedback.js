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
    <div className="">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Customer Feedbacks</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and review customer feedback for dishes and overall experience.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
            Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Mobile</label>
              <input type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Search mobile..." value={mobileFilter} onChange={(e) => setMobileFilter(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
              <input type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Search email..." value={customerEmailFilter} onChange={(e) => setCustomerEmailFilter(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Search name..." value={customerNameFilter} onChange={(e) => setCustomerNameFilter(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Search order ID..." value={orderIdFilter} onChange={(e) => setOrderIdFilter(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kitchen Name</label>
              <input type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Search kitchen..." value={kitchenFilter} onChange={(e) => setKitchenFilter(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kitchen ID</label>
              <input type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" placeholder="Search kitchen ID..." value={kitchenIdFilter} onChange={(e) => setKitchenIdFilter(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="initiated">Initiated</option>
                <option value="pending">Pending</option>
                <option value="pending_at_kitchen">Pending at Kitchen</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Date</label>
              <input type="date" className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" value={feedbackDateFilter} onChange={(e) => setFeedbackDateFilter(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
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

      {/* Feedback Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kitchen
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('status')}
                    >
                      Status {getSortIcon('status')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('rating')}
                    >
                      Rating {getSortIcon('rating')}
                    </th>
                    {canViewFeedbackDetail && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFeedbacks.map((feedback) => (
                    <tr key={feedback.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{feedback.customerName || '-'}</div>
                          <div className="text-xs text-gray-500">{feedback.customerPhone || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium">{feedback.kitchenName || '-'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium">{feedback.orderId || '-'}</div>
                          <div className="text-xs text-gray-400">{feedback.dishName || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getStatusBadge(feedback.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${i < (Number(feedback.rating) || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-1 text-xs text-gray-600">({Number(feedback.rating) || 0})</span>
                        </div>
                      </td>
                      {canViewFeedbackDetail && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end">
                            <button
                              className="text-primary-600 hover:text-primary-900"
                              title="View Feedback"
                              onClick={async () => {
                                try {
                                  await triggerGetDetail(feedback.id).unwrap();
                                } catch (e) {
                                  // ignore error here; detail page will handle error state
                                }
                                navigate(`/feedback/${feedback.id}`);
                              }}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {filteredFeedbacks.length === 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No feedbacks found</h3>
          <p className="mt-1 text-sm text-gray-500">No feedbacks match your current search criteria.</p>
        </div>
      )}

      {/* Detail shown on dedicated page; inline preview removed */}
    </div>
  );
};

export default Feedback;