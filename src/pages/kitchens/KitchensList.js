import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useGetKitchensQuery } from '../../store/api/modules/kitchens/kitchensApi';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../contexts/PermissionRegistry';
import PaginationUi from '../../components/PaginationUi';

const KitchensList = () => {
  const { hasPermission } = usePermissions();
  const [filteredKitchens, setFilteredKitchens] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const defaultFilters = {
    city: '',
    cuisine: '',
    status: '',
    phoneNumber: '',
    kitchenName: '',
    ownerName: '',
    email: ''
  };
  const [filters, setFilters] = useState(defaultFilters);
  // Pending filters only apply when user clicks Search
  const [pendingFilters, setPendingFilters] = useState(defaultFilters);
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    cuisines: [],
    statuses: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Check if user has permission to view kitchen list
  const canViewKitchens = hasPermission(PERMISSIONS.KITCHEN_LIST_VIEW);

  // RTK Query to fetch kitchens with pagination
  const {
    data: kitchensResponse,
    isLoading,
    error,
    refetch
  } = useGetKitchensQuery({
    page: currentPage
  }, {
    skip: !canViewKitchens
  });

  const kitchens = kitchensResponse?.data || [];
  const paginationMeta = kitchensResponse?.meta?.pagination;

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Reset to top of page when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load filter options when kitchens data is available
  useEffect(() => {
    if (kitchens.length > 0) {
      // Generate filter options from API data
      const statuses = [...new Set(kitchens.map(kitchen => kitchen.status))];
      
      setFilterOptions({
        cities: [], // Not available in current API response
        cuisines: [], // Not available in current API response
        statuses
      });
      
      // Set initial filtered kitchens
      setFilteredKitchens(kitchens);
    }
  }, [kitchens]);

  // Apply filters when search term or APPLIED filters change
  useEffect(() => {
    const applyFilters = () => {
      // Check if any filters are actually applied
      const hasFilters = searchTerm.trim() !== '' ||
        filters.status !== '' ||
        filters.kitchenName !== '' ||
        filters.ownerName !== '' ||
        filters.email !== '' ||
        filters.phoneNumber !== '';

      // If no filters are applied, show all kitchens
      if (!hasFilters) {
        setFilteredKitchens(kitchens);
        return;
      }

      try {
        // Client-side filtering logic
        let filtered = [...kitchens];

        // Apply search term filter
        if (searchTerm.trim()) {
          filtered = filtered.filter(kitchen => 
            kitchen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (kitchen.tagline && kitchen.tagline.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        // Apply status filter
        if (filters.status) {
          filtered = filtered.filter(kitchen => kitchen.status === filters.status);
        }

        // Apply kitchen name filter (exact/contains)
        if (filters.kitchenName) {
          filtered = filtered.filter(k => k.name?.toLowerCase().includes(filters.kitchenName.toLowerCase()));
        }
        // Apply owner name filter
        if (filters.ownerName) {
          filtered = filtered.filter(k => (k.owner?.name || '').toLowerCase().includes(filters.ownerName.toLowerCase()));
        }
        // Apply email filter
        if (filters.email) {
          filtered = filtered.filter(k => (k.email || '').toLowerCase().includes(filters.email.toLowerCase()));
        }
        // Apply phone filter
        if (filters.phoneNumber) {
          filtered = filtered.filter(k => (k.phone || k.phoneNumber || '').toString().includes(filters.phoneNumber));
        }

        setFilteredKitchens(filtered);
      } catch (error) {
        console.error('Error filtering kitchens:', error);
      }
    };

    // Only apply filters if kitchens data is loaded
    if (kitchens.length > 0) {
      applyFilters();
    }
  }, [searchTerm, filters, kitchens]);

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="mr-1 h-4 w-4" />
            Approved
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="mr-1 h-4 w-4" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="mr-1 h-4 w-4" />
            Pending
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="mr-1 h-4 w-4" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
    }
  };

  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort kitchens based on current sort config
  const sortedKitchens = React.useMemo(() => {
    let sortableKitchens = [...filteredKitchens];
    if (sortConfig.key) {
      sortableKitchens.sort((a, b) => {
        if (sortConfig.key === 'name') {
          const aValue = a.name.toLowerCase();
          const bValue = b.name.toLowerCase();
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        if (sortConfig.key === 'status') {
          const statusOrder = { 'active': 1, 'pending': 2, 'suspended': 3 };
          const aValue = statusOrder[a.status] || 999;
          const bValue = statusOrder[b.status] || 999;
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        if (sortConfig.key === 'createdAt') {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (aDate < bDate) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aDate > bDate) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        return 0;
      });
    }
    return sortableKitchens;
  }, [filteredKitchens, sortConfig]);

  // Get sort icon for column headers
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return null;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 ml-1" />
    );
  };

  // Apply and reset filters
  const applyFiltersNow = () => {
    setFilters(pendingFilters);
  };
  const resetFilters = () => {
    setSearchTerm('');
    setFilters(defaultFilters);
    setPendingFilters(defaultFilters);
  };

  // Show unauthorized message if user doesn't have permission
  if (!canViewKitchens) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
          <p className="text-neutral-500">You don't have permission to view the kitchen list.</p>
        </div>
      </div>
    );
  }

  // Show error message if API call failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Error Loading Kitchens</h3>
          <p className="text-neutral-500 mb-4">Failed to load kitchen data. Please try again.</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Kitchens</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Manage and monitor all registered kitchens
        </p>
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
              placeholder="Search by kitchen name or tagline..."
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

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={pendingFilters.city}
                onChange={(e) => setPendingFilters({ ...pendingFilters, city: e.target.value })}
              >
                <option value="">All Cities</option>
                {filterOptions.cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={pendingFilters.cuisine}
                onChange={(e) => setPendingFilters({ ...pendingFilters, cuisine: e.target.value })}
              >
                <option value="">All Cuisines</option>
                {filterOptions.cuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search phone..."
                value={pendingFilters.phoneNumber}
                onChange={(e) => setPendingFilters({ ...pendingFilters, phoneNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kitchen Name
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search kitchen name..."
                value={pendingFilters.kitchenName}
                onChange={(e) => setPendingFilters({ ...pendingFilters, kitchenName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Name
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search owner name..."
                value={pendingFilters.ownerName}
                onChange={(e) => setPendingFilters({ ...pendingFilters, ownerName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search email..."
                value={pendingFilters.email}
                onChange={(e) => setPendingFilters({ ...pendingFilters, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={pendingFilters.status}
                onChange={(e) => setPendingFilters({ ...pendingFilters, status: e.target.value })}
              >
                <option value="">All Status</option>
                {filterOptions.statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
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

      {/* Kitchens List */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-sm text-neutral-500">Loading kitchens...</p>
          </div>
        ) : sortedKitchens.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-neutral-500">No kitchens found matching your criteria.</p>
            <button
              onClick={resetFilters}
              className="mt-2 text-primary-600 hover:text-primary-500"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Kitchen
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Owner</th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Created At
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {sortedKitchens.map((kitchen) => (
                  <tr key={kitchen.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary-600">{kitchen.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-700">{kitchen.owner?.name || 'No Owner'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-700">{kitchen.createdAt ? new Date(kitchen.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(kitchen.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/kitchens/${kitchen.id}`}
                        className="text-neutral-600 hover:text-neutral-800 font-medium inline-flex items-center"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {paginationMeta && paginationMeta.totalPages > 1 && (
          <PaginationUi
            currentPage={currentPage}
            totalPages={paginationMeta.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default KitchensList;
