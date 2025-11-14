import React, { useMemo, useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useGetRequestsQuery, useLazyGetRequestByIdQuery } from '../../store/api/modules/requests/requestApi';
import { Link, useNavigate } from 'react-router-dom';

const getStatusBadge = (status) => {
  const s = String(status || '').toLowerCase();
  if (['pending','initiated'].includes(s)) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
  if (['approved','resolved','completed','done'].includes(s)) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
  if (['rejected','closed'].includes(s)) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
  if (['in_progress','in progress','processing'].includes(s)) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">In Progress</span>;
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status || 'Unknown'}</span>;
};

const RequestList = () => {
  const { hasPermission } = usePermissions();
  const canViewRequests = hasPermission('admin.request.view');
  const canViewRequestList = hasPermission('admin.request.list.view');
  const canViewRequestDetail = hasPermission('admin.request.detail.view');
  const navigate = useNavigate();
  const [triggerPrefetch] = useLazyGetRequestByIdQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState({ key: 'createdAt', dir: 'desc' });
  const defaultFilters = {
    id: '',
    customerName: '',
    type: '',
    status: '',
    orderId: ''
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ types: [], statuses: [] });

  const { data: requestsResp, isLoading, error, refetch } = useGetRequestsQuery({ page: 1, limit: 20 }, { skip: !canViewRequestList });
  const requests = requestsResp?.data || [];

  useEffect(() => {
    if (requests.length > 0) {
      const types = [...new Set(requests.map(r => r.type).filter(Boolean))];
      const statuses = [...new Set(requests.map(r => r.status).filter(Boolean))];
      setFilterOptions({ types, statuses });
    }
  }, [requests]);

  const filtered = useMemo(() => {
    let arr = [...requests];
    // Search term across common fields
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      arr = arr.filter(r =>
        String(r.id).toLowerCase().includes(q) ||
        String(r.customerName || '').toLowerCase().includes(q) ||
        String(r.type || '').toLowerCase().includes(q) ||
        String(r.orderId || '').toLowerCase().includes(q)
      );
    }
    // Applied filters
    if (filters.id) arr = arr.filter(r => String(r.id).toLowerCase().includes(filters.id.toLowerCase()));
    if (filters.customerName) arr = arr.filter(r => String(r.customerName || '').toLowerCase().includes(filters.customerName.toLowerCase()));
    if (filters.type) arr = arr.filter(r => String(r.type || '').toLowerCase() === filters.type.toLowerCase());
    if (filters.status) arr = arr.filter(r => String(r.status || '').toLowerCase() === filters.status.toLowerCase());
    if (filters.orderId) arr = arr.filter(r => String(r.orderId || '').toLowerCase().includes(filters.orderId.toLowerCase()));

    arr.sort((a,b) => {
      const { key, dir } = sortBy;
      const av = a[key];
      const bv = b[key];
      if (av === bv) return 0;
      if (dir === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
    return arr;
  }, [requests, searchTerm, filters, sortBy]);

  const setSort = (key) => {
    setSortBy((prev) => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  if (!canViewRequests || !canViewRequestList) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
          <p className="text-neutral-500">You don't have permission to view the request list.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Error Loading Requests</h3>
          <p className="text-neutral-500 mb-4">Failed to load requests. Please try again.</p>
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

  const applyFiltersNow = () => setFilters(pendingFilters);
  const resetFilters = () => {
    setSearchTerm('');
    setFilters(defaultFilters);
    setPendingFilters(defaultFilters);
  };

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default RequestList;
