import React, { useState, useEffect, useContext } from 'react';
import { PlusIcon, EyeIcon, TrashIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import { DishContext } from './index';
import ConfirmationModal from '../../../components/ConfirmationModal';
import DialogueBox from '../../../components/DialogueBox';

const DishMediaTab = () => {
  const { id: dishId } = useContext(DishContext);
  const { hasPermission } = useAuth();
  
  // Check permissions - simplified to only use admin.dish.view
  const canViewMedia = hasPermission(PERMISSIONS.DISH_VIEW);
  const canUploadMedia = hasPermission(PERMISSIONS.DISH_VIEW);
  
  // State variables
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [deleteComment, setDeleteComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form state
  const [mediaForm, setMediaForm] = useState({
    file: null,
    mediaType: 'image',
    categoryType: 'dish',
    caption: ''
  });
  const [mediaPreview, setMediaPreview] = useState('');
  
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

  const closeDialogue = () => {
    setDialogueBox({
      isOpen: false,
      type: 'success',
      title: '',
      message: ''
    });
  };

  // Load media
  useEffect(() => {
    const loadMedia = () => {
      setIsLoading(true);
      
      // Mock media data
      const mockMedia = [
        {
          id: 1,
          mediaType: 'image',
          categoryType: 'dish',
          caption: 'Main dish photo',
          processedUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
          thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          mediaType: 'image',
          categoryType: 'ingredient',
          caption: 'Fresh ingredients',
          processedUrl: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400',
          thumbnailUrl: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=150',
          createdAt: '2024-01-16T11:45:00Z'
        }
      ];
      
      setMedia(mockMedia);
      setIsLoading(false);
    };
    
    if (canViewMedia && dishId) {
      loadMedia();
    }
  }, [dishId, canViewMedia]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaForm(prev => ({ ...prev, file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setMediaPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setMediaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add media
  const handleAddMedia = () => {
    setMediaForm({
      file: null,
      mediaType: 'image',
      categoryType: 'dish',
      caption: ''
    });
    setMediaPreview('');
    setShowAddModal(true);
  };

  // Handle save media
  const handleSaveMedia = async () => {
    try {
      // Validation
      if (!mediaForm.file) {
        showDialogue('error', 'Validation Error', 'Please select a file to upload.');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setShowAddModal(false);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Replace with actual S3 upload logic
      console.log('Uploading media:', mediaForm);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Mock save - add to local state
      const newMedia = {
        id: media.length + 1,
        mediaType: mediaForm.mediaType,
        categoryType: mediaForm.categoryType,
        caption: mediaForm.caption,
        processedUrl: mediaPreview,
        thumbnailUrl: mediaPreview,
        createdAt: new Date().toISOString()
      };
      
      setMedia(prev => [...prev, newMedia]);
      showDialogue('success', 'Media Uploaded', 'Dish media has been uploaded successfully!');
      
    } catch (error) {
      console.error('Failed to upload media:', error);
      showDialogue('error', 'Upload Failed', `Failed to upload media: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle view media
  const handleViewMedia = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setShowViewModal(true);
  };

  // Handle delete media
  const handleDeleteMedia = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setDeleteComment('');
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      // TODO: Replace with RTK Query mutation
      console.log('Deleting media:', selectedMedia.id);
      
      // Remove from local state
      setMedia(prev => prev.filter(m => m.id !== selectedMedia.id));
      setShowDeleteModal(false);
      setSelectedMedia(null);
      setDeleteComment('');
      showDialogue('success', 'Media Deleted', 'Dish media has been deleted successfully!');
      
    } catch (error) {
      console.error('Failed to delete media:', error);
      showDialogue('error', 'Delete Failed', `Failed to delete media: ${error.message || 'Unknown error occurred'}`);
    }
  };

  // Get media type display
  const getMediaTypeDisplay = (type) => {
    switch (type) {
      case 'image': return 'Image';
      case 'video': return 'Video';
      default: return type;
    }
  };

  // Get category type display
  const getCategoryTypeDisplay = (type) => {
    switch (type) {
      case 'dish': return 'Dish Photo';
      case 'ingredient': return 'Ingredient';
      case 'preparation': return 'Preparation';
      default: return type;
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
            <h3 className="text-lg font-medium text-neutral-900">Dish Media</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Manage photos and media files for this dish.
            </p>
          </div>
          {canUploadMedia && (
            <button
              onClick={handleAddMedia}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Media
            </button>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <CloudArrowUpIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">Uploading media...</span>
            </div>
            <span className="text-sm text-blue-700">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Media Table */}
      {!canViewMedia ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to access dish media.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            {media.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50">
                <p className="text-neutral-500">No media found for this dish.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Preview
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Caption
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {media.map((mediaItem) => (
                    <tr key={mediaItem.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="h-12 w-16 bg-neutral-100 rounded cursor-pointer overflow-hidden"
                          onClick={() => handleViewMedia(mediaItem)}
                        >
                          <img
                            src={mediaItem.thumbnailUrl || mediaItem.processedUrl}
                            alt={mediaItem.caption}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/160x120?text=No+Image';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getMediaTypeDisplay(mediaItem.mediaType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                          {getCategoryTypeDisplay(mediaItem.categoryType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900 max-w-xs truncate">
                          {mediaItem.caption || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-500">
                          {formatDate(mediaItem.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewMedia(mediaItem)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="View media"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(mediaItem)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete media"
                          >
                            <TrashIcon className="h-4 w-4" />
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

      {/* Add Media Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h3 className="text-lg font-medium text-neutral-900">Add Media</h3>
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
                    Media File *
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {mediaPreview && (
                    <div className="mt-2">
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Media Type
                  </label>
                  <select
                    name="mediaType"
                    value={mediaForm.mediaType}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    name="categoryType"
                    value={mediaForm.categoryType}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="dish">Dish Photo</option>
                    <option value="ingredient">Ingredient</option>
                    <option value="preparation">Preparation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Caption
                  </label>
                  <input
                    type="text"
                    name="caption"
                    value={mediaForm.caption}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Optional caption for this media"
                  />
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
                  onClick={handleSaveMedia}
                  className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Upload Media
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Media Modal */}
      {showViewModal && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Media Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedMedia.processedUrl}
                  alt={selectedMedia.caption}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-neutral-700">Type:</span>
                  <span className="ml-2 text-neutral-900">{getMediaTypeDisplay(selectedMedia.mediaType)}</span>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Category:</span>
                  <span className="ml-2 text-neutral-900">{getCategoryTypeDisplay(selectedMedia.categoryType)}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-neutral-700">Caption:</span>
                  <span className="ml-2 text-neutral-900">{selectedMedia.caption || '-'}</span>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Created:</span>
                  <span className="ml-2 text-neutral-900">{formatDate(selectedMedia.createdAt)}</span>
                </div>
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
      {showDeleteModal && selectedMedia && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Media"
          message="Are you sure you want to permanently delete this media file? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedMedia(null);
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

export default DishMediaTab;
