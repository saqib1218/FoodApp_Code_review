import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  comment = '',
  onCommentChange = () => {},
  onConfirm,
  onCancel,
  confirmButtonText = "Confirm",
  confirmButtonColor = "primary",
  isCommentRequired = true
}) => {
  if (!isOpen) return null;

  // Button color classes
  const getButtonColorClass = () => {
    switch (confirmButtonColor) {
      case 'red':
        return 'bg-red-600 hover:bg-red-700';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'green':
        return 'bg-green-600 hover:bg-green-700';
      case 'primary':
      default:
        return 'bg-primary-600 hover:bg-primary-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-900">
            {title}
          </h3>
          <button
            onClick={onCancel}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-neutral-700 mb-3">
            {message}
          </p>
          
          {isCommentRequired && (
            <>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment ?? ''}
                onChange={(e) => onCommentChange(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg"
                placeholder="Please provide a reason for this action..."
                rows={3}
                required
              />
            </>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isCommentRequired && !String(comment || '').trim()}
            className={`px-4 py-2 text-white rounded-full transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColorClass()}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
