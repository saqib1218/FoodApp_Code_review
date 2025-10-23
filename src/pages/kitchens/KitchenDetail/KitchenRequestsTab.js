import React, { useContext, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS, EXTRA_PERMISSIONS } from '../../../contexts/PermissionRegistry';
import { KitchenContext } from './index';
import { useGetKitchenRequestsQuery } from '../../../store/api/modules/kitchens/kitchensApi';

const KitchenRequestsTab = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { kitchen } = useContext(KitchenContext);
  const { id: routeKitchenId } = useParams();
  const kitchenId = routeKitchenId || kitchen?.id;

  const canViewRequests = hasPermission(PERMISSIONS.KITCHEN_REQUEST_LIST_VIEW);

  const { data: resp, isLoading, error, refetch } = useGetKitchenRequestsQuery(kitchenId, {
    skip: !canViewRequests || !kitchenId,
    refetchOnMountOrArgChange: true,
  });

  const requests = useMemo(() => {
    // backend wraps in { success, data: [] }
    return resp?.data || [];
  }, [resp]);

  const [previewItem, setPreviewItem] = useState(null);

  if (!canViewRequests) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
          <p className="text-neutral-500">You don't have permission to view the kitchen requests.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-neutral-900">Failed to load requests</h3>
        <p className="mt-2 text-neutral-600">{error?.data?.message || 'Please try again.'}</p>
        <div className="mt-6">
          <button onClick={() => refetch()} className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Kitchen Requests</h3>
        <p className="mt-1 text-sm text-neutral-500">List of requests for this kitchen.</p>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Requested By Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {requests && requests.length > 0 ? (
                requests.map((req, idx) => (
                  <tr key={req.id || idx} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{req.requestedByRole || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{req.action || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{req.status || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{req.createdAt ? new Date(req.createdAt).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {hasPermission(EXTRA_PERMISSIONS.REQUEST_DETAIL_VIEW) && (
                        <button
                          onClick={() => navigate(`/requests/${req.id}`)}
                          className="text-green-600 hover:text-green-900"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-neutral-500">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Request Detail</h3>
              <button onClick={() => setPreviewItem(null)} className="text-neutral-500 hover:text-neutral-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <pre className="text-xs bg-neutral-50 p-3 rounded border border-neutral-200 overflow-x-auto">{JSON.stringify(previewItem, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenRequestsTab;
