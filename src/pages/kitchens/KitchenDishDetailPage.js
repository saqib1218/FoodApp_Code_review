import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useGetKitchenDishByIdQuery, useUpdateDishMutation } from '../../store/api/modules/kitchens/kitchensApi';
import { useAuth } from '../../hooks/useAuth';
import ConfirmationModal from '../../components/ConfirmationModal';

const KitchenDishDetailPage = () => {
  const { kitchenId, dishId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // RTK Query hooks
  const {
    data: dish,
    isLoading,
    error
  } = useGetKitchenDishByIdQuery({ kitchenId, dishId }, {
    skip: !kitchenId || !dishId
  });

  const [updateDish] = useUpdateDishMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      // TODO: Replace with RTK Query delete mutation
      console.warn("TODO: Replace with RTK Query delete mutation");
      navigate(`/kitchens/${kitchenId}?tab=dishes`);
    } catch (error) {
      console.error('Error deleting dish:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Dish not found'}</p>
          <button
            onClick={() => navigate(`/kitchens/${kitchenId}?tab=dishes`)}
            className="text-primary-600 hover:text-primary-500"
          >
            Back to Dishes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/kitchens/${kitchenId}?tab=dishes`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dishes
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{dish.name}</h1>
              <div className="flex items-center gap-4">
                {getStatusBadge(dish.status)}
                <span className="text-sm text-gray-500">ID: {dish.id}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {hasPermission('kitchen_dishes.edit') && (
                <button
                  onClick={() => navigate(`/kitchens/${kitchenId}/dishes/${dishId}/edit`)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </button>
              )}
              {hasPermission('kitchen_dishes.delete') && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image and Basic Info */}
          <div className="space-y-6">
            {/* Dish Image */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img
                src={dish.image || '/api/placeholder/500/400'}
                alt={dish.name}
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>
            
            {/* Price and Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Price</h3>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(dish.price)}</span>
              </div>
              {dish.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600 leading-relaxed">{dish.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{dish.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Dish Type</span>
                  <span className="font-medium text-gray-900">{dish.dishType || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Preparation Time</span>
                  <span className="font-medium text-gray-900">
                    {dish.preparationTime ? `${dish.preparationTime} minutes` : 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Status</span>
                  <div>{getStatusBadge(dish.status)}</div>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            {dish.ingredients && dish.ingredients.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
                <div className="space-y-2">
                  {dish.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">
                    {new Date(dish.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium text-gray-900">
                    {new Date(dish.lastStatusChange || dish.updatedAt || dish.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Dish"
        message={`Are you sure you want to delete "${dish.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default KitchenDishDetailPage;
