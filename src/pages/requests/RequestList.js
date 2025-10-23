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
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-neutral-900">Requests</h1>
          <p className="mt-2 text-sm text-neutral-700">Manage and review requests.</p>
        </div>
      </div>

      {/* Filters and Search (match KitchensList) */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search by id, customer, type, order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request ID</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={pendingFilters.id}
                onChange={(e) => setPendingFilters({ ...pendingFilters, id: e.target.value })}
                placeholder="e.g. REQ-1001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={pendingFilters.customerName}
                onChange={(e) => setPendingFilters({ ...pendingFilters, customerName: e.target.value })}
                placeholder="Search customer..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={pendingFilters.type}
                onChange={(e) => setPendingFilters({ ...pendingFilters, type: e.target.value })}
              >
                <option value="">All Types</option>
                {filterOptions.types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={pendingFilters.status}
                onChange={(e) => setPendingFilters({ ...pendingFilters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                {filterOptions.statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={pendingFilters.orderId}
                onChange={(e) => setPendingFilters({ ...pendingFilters, orderId: e.target.value })}
                placeholder="e.g. ORD-2001"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={applyFiltersNow}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
            >
              Search
            </button>
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setSort('status')}>Status {sortBy.key==='status' ? (sortBy.dir==='asc'? <ChevronUpIcon className="h-3 w-3 inline"/> : <ChevronDownIcon className="h-3 w-3 inline"/>) : null}</th>
                    {canViewRequestDetail && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.requestedByRole}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.entityName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStatusBadge(r.status)}</td>
                      {canViewRequestDetail && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end">
                            <button
                              className="text-primary-600 hover:text-primary-900"
                              title="View"
                              onClick={async () => {
                                try { await triggerPrefetch(r.id).unwrap(); } catch (e) {}
                                navigate(`/requests/${r.id}`);
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
    </div>
  );
};

export default RequestList;
