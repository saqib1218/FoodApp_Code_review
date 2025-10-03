import React, { useContext, useMemo, useState } from 'react';
import { EyeIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DishContext } from './index';
import DialogueBox from '../../../components/DialogueBox';
import ConfirmationModal from '../../../components/ConfirmationModal';
import dishDropdownData from '../../../data/dishDropdown/dishDropdownData.json';

const rowsConfig = [
  { key: 'tags', label: 'Dish Tags', dropdownKey: 'dishTags' },
  { key: 'cuisine', label: 'Dish Cuisine', dropdownKey: 'dishCuisines' },
  { key: 'dietaryFlags', label: 'Dish Dietary', dropdownKey: 'dishDietaryFlags' },
  { key: 'course', label: 'Dish Course', dropdownKey: 'dishCourseTypes', single: true },
];

const DishSegmentTab = () => {
  const { dish, setDish } = useContext(DishContext);

  const [dialogueBox, setDialogueBox] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewKey, setViewKey] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [pendingValues, setPendingValues] = useState([]);
  // Drag & drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null); // 'available' | 'selected'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteKey, setDeleteKey] = useState(null);

  const showDialogue = (type, title, message) => setDialogueBox({ isOpen: true, type, title, message });
  const closeDialogue = () => setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });

  const getRowValue = (key) => {
    if (!dish) return [];
    const value = dish[key];
    if (key === 'course') return value || '';
    return Array.isArray(value) ? value : [];
  };

  const openView = (key) => {
    setViewKey(key);
    setShowViewModal(true);
  };

  const openEdit = (key) => {
    const config = rowsConfig.find(r => r.key === key);
    const current = getRowValue(key);
    // Initialize pending with current values (arrays for multi-select, or single string for course)
    setPendingValues(config.single ? (current ? [current] : []) : [...current]);
    setEditKey(key);
    setShowEditModal(true);
  };

  // Compute available list based on dropdown minus selected
  const getAvailable = (key) => {
    const config = rowsConfig.find(r => r.key === key);
    return (dishDropdownData[config.dropdownKey] || []).map(i => i.name);
  };
  const availableItems = useMemo(() => {
    if (!editKey) return [];
    const all = getAvailable(editKey);
    return all.filter(v => !pendingValues.includes(v));
  }, [editKey, pendingValues]);

  // Drag handlers (match permission UI behavior)
  const handleDragStart = (e, item, from) => {
    setDraggedItem(item);
    setDraggedFrom(from);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDropToAvailable = (e) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (draggedFrom === 'selected') {
      setPendingValues(prev => prev.filter(v => v !== draggedItem));
    }
    setDraggedItem(null);
    setDraggedFrom(null);
  };
  const handleDropToSelected = (e) => {
    e.preventDefault();
    if (!draggedItem) return;
    const isSingle = rowsConfig.find(r => r.key === editKey)?.single;
    setPendingValues(prev => {
      if (isSingle) {
        // Only keep the last dropped item
        return draggedFrom === 'selected' ? prev : [draggedItem];
      }
      if (prev.includes(draggedItem)) return prev;
      return [...prev, draggedItem];
    });
    setDraggedItem(null);
    setDraggedFrom(null);
  };

  const handleSaveEdit = () => {
    setDish(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (editKey === 'course') {
        updated.course = pendingValues[0] || '';
      } else {
        updated[editKey] = pendingValues;
      }
      return updated;
    });
    setShowEditModal(false);
    showDialogue('success', 'Updated', 'Dish segment has been updated.');
  };

  const openDelete = (key) => {
    setDeleteKey(key);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setDish(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (deleteKey === 'course') {
        updated.course = '';
      } else {
        updated[deleteKey] = [];
      }
      return updated;
    });
    setShowDeleteModal(false);
    setDeleteKey(null);
    showDialogue('success', 'Cleared', 'Values cleared successfully.');
  };

  const renderValue = (key) => {
    const value = getRowValue(key);
    if (key === 'course') return value || '-';
    if (!value || value.length === 0) return '-';
    return (
      <div className="inline-flex flex-wrap gap-1">
        {value.map((v, i) => (
          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800">
            {v}
          </span>
        ))}
      </div>
    );
  };

  

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Dish Segment</h3>
        <p className="mt-1 text-sm text-neutral-500">Manage tags, cuisine, dietary and course values.</p>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {rowsConfig.map(row => (
                <tr key={row.key} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{row.label}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{renderValue(row.key)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => openView(row.key)} className="text-green-600 hover:text-green-900" title="View">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(row.key)} className="text-primary-600 hover:text-primary-800" title="Edit">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => openDelete(row.key)} className="text-red-600 hover:text-red-900" title="Clear">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">View Values</h3>
              <button onClick={() => setShowViewModal(false)} className="text-neutral-500 hover:text-neutral-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {renderValue(viewKey)}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (drag & drop dual lists) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h3 className="text-lg font-medium text-neutral-900">Edit {rowsConfig.find(r => r.key === editKey)?.label}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-neutral-500 hover:text-neutral-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
                {/* Available */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Available</h4>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 h-[300px] overflow-y-auto"
                    onDragOver={handleDragOver}
                    onDrop={handleDropToAvailable}
                  >
                    <div className="space-y-2">
                      {availableItems.map((item) => (
                        <div
                          key={item}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item, 'available')}
                          className="bg-white p-3 rounded-md border border-gray-200 cursor-move hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-900">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Selected</h4>
                  <div
                    className="border-2 border-dashed border-primary-300 rounded-lg p-4 bg-primary-50 h-[300px] overflow-y-auto"
                    onDragOver={handleDragOver}
                    onDrop={handleDropToSelected}
                  >
                    <div className="space-y-2">
                      {pendingValues.map((item) => (
                        <div
                          key={item}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item, 'selected')}
                          className="bg-white p-3 rounded-md border border-primary-200 cursor-move hover:bg-primary-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-900">{item}</span>
                        </div>
                      ))}
                      {pendingValues.length === 0 && (
                        <p className="text-gray-500 text-center py-8">Drag items here to select them</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 text-sm font-medium">Cancel</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear confirmation */}
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Clear Values"
          description="Are you sure you want to clear all values? This action cannot be undone."
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          confirmText="Clear"
        />
      )}

      <DialogueBox isOpen={dialogueBox.isOpen} onClose={closeDialogue} type={dialogueBox.type} title={dialogueBox.title} message={dialogueBox.message} />
    </div>
  );
};

export default DishSegmentTab;
