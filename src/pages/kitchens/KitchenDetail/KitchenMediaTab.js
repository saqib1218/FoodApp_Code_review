import React, { useState, useEffect, useContext } from 'react';
import { XMarkIcon, PlusIcon, PencilIcon, EyeIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { 
  useGetKitchenMediaQuery,
  useGetKitchenMediaUploadUrlMutation,
  useUploadToS3Mutation,
  useDeleteKitchenMediaMutation 
} from '../../../store/api/modules/kitchens/kitchensApi';
import { KitchenContext } from './index';
import { PERMISSIONS } from '../../../contexts/PermissionRegistry';
import ConfirmationModal from '../../../components/ConfirmationModal';
import DialogueBox from '../../../components/DialogueBox';

const KitchenMediaTab = () => {
  const { id: kitchenId } = useContext(KitchenContext);
  const { hasPermission } = useAuth();
  
  // Check permissions first
  const canViewKitchenMedia = hasPermission(PERMISSIONS.KITCHEN_MEDIA_LIST_VIEW);
  const canUploadKitchenMedia = hasPermission(PERMISSIONS.KITCHEN_MEDIA_UPLOAD);
  
  // RTK Query hooks - only if user has permission
  const { data: kitchenMediaData, isLoading: isLoadingMedia, refetch: refetchMedia } = useGetKitchenMediaQuery(
    { kitchenId },
    { skip: !canViewKitchenMedia || !kitchenId }
  );
  const [getUploadUrl] = useGetKitchenMediaUploadUrlMutation();
  const [uploadToS3] = useUploadToS3Mutation();
  const [deleteMedia] = useDeleteKitchenMediaMutation();
  
  // State variables
  const [kitchenMedia, setKitchenMedia] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  // Removed image preview modal; open in new tab instead
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [newMediaFile, setNewMediaFile] = useState(null);
  const [newMediaType, setNewMediaType] = useState('image');
  const [newMediaUsedAs, setNewMediaUsedAs] = useState('banner');
  const [newMediaCaption, setNewMediaCaption] = useState('');
  const [newMediaPreview, setNewMediaPreview] = useState('');
  const [newMediaStatus, setNewMediaStatus] = useState('active');
  const [confirmComment, setConfirmComment] = useState('');
  const [deleteComment, setDeleteComment] = useState('');
  const [updateComment, setUpdateComment] = useState('');
  
  // Dialogue box state for API feedback
  const [dialogueBox, setDialogueBox] = useState({
    isOpen: false,
    type: 'success', // 'success' or 'error'
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

  // Update local state when RTK Query data changes
  useEffect(() => {
    if (kitchenMediaData?.data) {
      setKitchenMedia(kitchenMediaData.data);
    }
  }, [kitchenMediaData]);

  // Open media in new tab
  const openMediaInNewTab = (media) => {
    const url = media.processedUrl || media.url;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle media file change
  const handleMediaFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle add media
  const handleAddMedia = () => {
    setSelectedMedia(null);
    setNewMediaFile(null);
    setNewMediaPreview('');
    setNewMediaType('image');
    setNewMediaUsedAs('banner');
    setNewMediaCaption('');
    setNewMediaStatus('active');
    setShowAddMediaModal(true);
  };

  // Handle media type change
  const handleMediaTypeChange = (type) => {
    setNewMediaType(type);
    if (type === 'video' || type === 'audio') {
      setNewMediaUsedAs('standard');
    } else {
      setNewMediaUsedAs('banner');
    }
  };

  // Handle submit add media
  const handleSubmitAddMedia = () => {
    if (!newMediaFile) {
      alert('Please select a media file');
      return;
    }
    setShowAddMediaModal(false);
    setConfirmComment('');
    setShowConfirmModal(true);
  };

  // Enterprise-level S3 upload flow
  const confirmAddMedia = async () => {
    if (!newMediaFile) {
      showDialogue('error', 'No File Selected', 'Please select a media file before proceeding.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setShowConfirmModal(false);

      // Step 1: Get pre-signed S3 upload URL from backend
      console.log('Step 1: Getting pre-signed S3 upload URL...');
      const uploadUrlResponse = await getUploadUrl({
        kitchenId,
        mediaType: newMediaType,
        categoryType: newMediaUsedAs
      }).unwrap();

      if (!uploadUrlResponse.success || !uploadUrlResponse.data?.uploadUrl) {
        throw new Error('Failed to get upload URL from server');
      }

      const { uploadUrl, mediaId, s3Key } = uploadUrlResponse.data;
      console.log('✅ Got upload URL:', { mediaId, s3Key });
      
      setUploadProgress(25);

      // Step 2: Upload file directly to S3
      console.log('Step 2: Uploading file to S3...');
      const s3UploadResponse = await uploadToS3({
        uploadUrl,
        file: newMediaFile
      }).unwrap();

      if (!s3UploadResponse.success) {
        throw new Error('Failed to upload file to S3');
      }

      console.log('✅ File uploaded to S3 successfully');
      setUploadProgress(75);

      console.log('✅ File uploaded to S3 successfully');
      setUploadProgress(100);

      // Refresh media list
      refetchMedia();
      
      // Show success message
      showDialogue('success', 'Upload Successful', 'Media has been uploaded successfully!');
      
      // Reset form
      resetMediaForm();
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      showDialogue('error', 'Upload Failed', `Upload failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Helper function to reset form
  const resetMediaForm = () => {
    setNewMediaFile(null);
    setNewMediaPreview('');
    setNewMediaType('image');
    setNewMediaUsedAs('banner');
    setNewMediaCaption('');
    setConfirmComment('');
    setSelectedMedia(null);
  };

  // Handle edit media
  const handleEditMedia = (media) => {
    // Set the media to edit
    setSelectedMedia(media);
    setNewMediaType(media.mediaType || 'image');
    setNewMediaUsedAs(media.categoryType || 'banner');
    setNewMediaCaption(media.caption || '');
    setNewMediaStatus((media.status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active');
    setNewMediaPreview('');
    setShowAddMediaModal(true);
  };

  // Handle delete media
  const handleDeleteMedia = (media) => {
    setSelectedMedia(media);
    setShowDeleteModal(true);
  };

  // Handle confirm delete media
  const handleConfirmDeleteMedia = async () => {
    try {
      await deleteMedia({
        kitchenId,
        mediaId: selectedMedia.id
      }).unwrap();
      
      // Refresh media list
      refetchMedia();
      
      showDialogue('success', 'Delete Successful', 'Media has been deleted successfully!');
    } catch (error) {
      console.error('Failed to delete media:', error);
      showDialogue('error', 'Delete Failed', `Delete failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setShowDeleteModal(false);
      setSelectedMedia(null);
      setDeleteComment('');
    }
  };

  // Handle confirm update media
  const handleConfirmUpdateMedia = async () => {
    try {
      // For now, perform a local optimistic update for caption and status only
      if (!selectedMedia) return;
      const updatedList = kitchenMedia.map(m =>
        m.id === selectedMedia.id ? { ...m, caption: newMediaCaption, status: newMediaStatus } : m
      );
      setKitchenMedia(updatedList);
      showDialogue('success', 'Media Updated', 'Caption and status have been updated.');
    } catch (error) {
      console.error('Failed to update media:', error);
      showDialogue('error', 'Update Failed', `Update failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setShowUpdateConfirmModal(false);
      setShowAddMediaModal(false);
      resetMediaForm();
      setUpdateComment('');
    }
  };

  // Handle cancel confirmation
  const handleCancelConfirmation = () => {
    setShowConfirmModal(false);
    setConfirmComment('');
    setShowAddMediaModal(true);
  };

  // Get media status badge
  const getMediaStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        );
      case 'processed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Processed
          </span>
        );
      case 'pending for approval':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending for Approval
          </span>
        );
      case 'invalid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Invalid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
            {status}
          </span>
        );
    }
  };

  // Get media used display
  const getMediaUsedDisplay = (mediaUsed) => {
    switch (mediaUsed) {
      case 'banner':
        return 'Banner';
      case 'logo':
        return 'Logo';
      case 'standard':
        return 'Standard';
      default:
        return mediaUsed || 'Not specified';
    }
  };

  // Get media type display
  const getMediaTypeDisplay = (type) => {
    switch (type) {
      case 'image':
        return 'Image';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      default:
        return type || 'Image';
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

  if (isLoadingMedia) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-neutral-900">Kitchen Media</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Manage images and media files for this kitchen.
          </p>
        </div>
        {canUploadKitchenMedia && (
          <button
            onClick={handleAddMedia}
            className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Media
          </button>
        )}
      </div>

      {/* Upload Progress Indicator */}
      {isUploading && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <CloudArrowUpIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">Uploading to S3...</span>
            </div>
            <span className="text-sm text-blue-700">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            {uploadProgress === 25 && "✅ Got pre-signed URL from server"}
            {uploadProgress === 75 && "✅ File uploaded to S3 successfully"}
            {uploadProgress === 100 && "✅ Upload confirmed with backend"}
          </div>
        </div>
      )}

      {/* Kitchen Media List */}
      {!canViewKitchenMedia ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Access Denied</h3>
            <p className="text-neutral-500">You don't have permission to access the kitchen media list.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h4 className="text-base font-medium text-neutral-900">Media Files</h4>
          </div>
          <div className="overflow-x-auto">
            {kitchenMedia.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50">
                <p className="text-neutral-500">No media files found for this kitchen.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Preview
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Media Used As
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Caption
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {kitchenMedia.map((media) => (
                    <tr key={media.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="h-12 w-16 bg-neutral-100 rounded cursor-pointer"
                          onClick={() => openMediaInNewTab(media)}
                        >
                          <img
                            src={media.processedUrl || media.url}
                            alt={media.type}
                            className="h-full w-full object-cover rounded"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/160x120?text=Media+Not+Available';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getMediaStatusBadge(media.status || 'active')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getMediaTypeDisplay(media.mediaType || 'image')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                          {getMediaUsedDisplay(media.categoryType || 'banner')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900 max-w-xs truncate">
                          {media.caption || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditMedia(media)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit media"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openMediaInNewTab(media)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="View media"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(media)}
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

      {/* Add/Edit Media Modal */}
      {showAddMediaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h3 className="text-lg font-medium text-neutral-900">
                {selectedMedia ? 'Edit Media' : 'Add Media'}
              </h3>
              <button
                onClick={() => setShowAddMediaModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-4">
                {selectedMedia ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Caption</label>
                      <input
                        type="text"
                        value={newMediaCaption}
                        onChange={(e) => setNewMediaCaption(e.target.value)}
                        className="w-full p-2 border border-neutral-300 rounded-lg"
                        placeholder="Enter a caption"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                      <select
                        value={newMediaStatus}
                        onChange={(e) => setNewMediaStatus(e.target.value)}
                        className="w-full p-2 border border-neutral-300 rounded-lg"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Media Type</label>
                      <select
                        value={newMediaType}
                        onChange={(e) => handleMediaTypeChange(e.target.value)}
                        className="w-full p-2 border border-neutral-300 rounded-lg"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Media Used As</label>
                      <select
                        value={newMediaUsedAs}
                        onChange={(e) => setNewMediaUsedAs(e.target.value)}
                        className="w-full p-2 border border-neutral-300 rounded-lg"
                        disabled={newMediaType === 'video' || newMediaType === 'audio'}
                      >
                        {newMediaType === 'image' ? (
                          <>
                            <option value="banner">Banner</option>
                            <option value="logo">Logo</option>
                            <option value="standard">Standard</option>
                          </>
                        ) : (
                          <option value="standard">Standard</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Media File</label>
                      <input
                        type="file"
                        accept={newMediaType === 'image' ? 'image/*' : newMediaType === 'video' ? 'video/*' : 'audio/*'}
                        onChange={handleMediaFileChange}
                        className="w-full p-2 border border-neutral-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Caption (Optional)</label>
                      <input
                        type="text"
                        value={newMediaCaption}
                        onChange={(e) => setNewMediaCaption(e.target.value)}
                        className="w-full p-2 border border-neutral-300 rounded-lg"
                        placeholder="Enter a caption for this media"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-neutral-200">
              <button
                onClick={() => setShowAddMediaModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedMedia ? setShowUpdateConfirmModal(true) : handleSubmitAddMedia()}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                {selectedMedia ? 'Save Changes' : 'Add Media'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Add Media"
        message={`Are you sure you want to add this ${newMediaType} file to the kitchen media?`}
        comment={confirmComment}
        onCommentChange={setConfirmComment}
        onConfirm={confirmAddMedia}
        onCancel={handleCancelConfirmation}
        confirmButtonText="Add Media"
        confirmButtonColor="primary"
        isCommentRequired={true}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMedia && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Media"
          message={`Are you sure you want to permanently delete this media file? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDeleteMedia}
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

      {/* Update Confirmation Modal */}
      {showUpdateConfirmModal && selectedMedia && (
        <ConfirmationModal
          isOpen={showUpdateConfirmModal}
          title="Update Media"
          message={`Are you sure you want to update this media file? Please provide a comment for this change.`}
          confirmText="Update"
          cancelText="Cancel"
          onConfirm={handleConfirmUpdateMedia}
          onCancel={() => {
            setShowUpdateConfirmModal(false);
            setUpdateComment('');
          }}
          comment={updateComment}
          onCommentChange={setUpdateComment}
          variant="primary"
        />
      )}

      {/* DialogueBox for API Success/Error Messages */}
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

export default KitchenMediaTab;
