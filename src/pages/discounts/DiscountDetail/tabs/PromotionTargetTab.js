import React, { useMemo, useState } from 'react';

// Mock kitchens and dishes
const KITCHENS = [
  { id: 1, name: 'Pizza Palace' },
  { id: 2, name: 'Burger House' },
  { id: 3, name: 'Sushi Master' },
  { id: 4, name: 'Spice Garden' },
  { id: 5, name: 'Pasta Corner' },
];

const DISHES = [
  { id: 101, name: 'Karahi' },
  { id: 102, name: 'Chicken Roast' },
  { id: 103, name: 'Baryani' },
  { id: 104, name: 'Tikka' },
  { id: 105, name: 'Malai Boti' },
];

const PromotionTargetTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [applyAllKitchens, setApplyAllKitchens] = useState(true);
  const [selectedKitchenIds, setSelectedKitchenIds] = useState([]);
  const [kitchenSelect, setKitchenSelect] = useState('');
  const [targets, setTargets] = useState([]); // [{id, kitchenId, kitchenName, dishes: [dishIds]}] or special entry for all

  // Assign dishes modal
  const [assignForKitchen, setAssignForKitchen] = useState(null); // { kitchenId, kitchenName }
  const [availableDishes, setAvailableDishes] = useState(DISHES);
  const [selectedDishesForKitchen, setSelectedDishesForKitchen] = useState([]); // dishIds

  const canSave = useMemo(() => {
    if (applyAllKitchens) return true;
    return selectedKitchenIds.length > 0;
  }, [applyAllKitchens, selectedKitchenIds]);

  const resetAndClose = () => {
    setApplyAllKitchens(true);
    setSelectedKitchenIds([]);
    setShowModal(false);
  };

  const handleSave = () => {
    if (!canSave) return;
    if (applyAllKitchens) {
      // Represent as a single special row
      setTargets([{ id: 'all', all: true, applyAllDishes: true, dishes: [], active: true }]);
    } else {
      const rows = selectedKitchenIds.map((kid) => {
        const k = KITCHENS.find((x) => x.id === Number(kid));
        return { id: `${kid}-${Date.now()}`, kitchenId: Number(kid), kitchenName: k?.name || `Kitchen ${kid}`, dishes: [], applyAllDishes: true, active: true };
      });
      setTargets(rows);
    }
    resetAndClose();
  };

  const openAssignDishes = (kitchen) => {
    setAssignForKitchen(kitchen);
    // Initialize selected dishes from current target row
    const target = kitchen.all
      ? targets.find((t) => t.all)
      : targets.find((t) => t.kitchenId === kitchen.kitchenId);
    const current = target?.dishes || [];
    setSelectedDishesForKitchen(current);
    setShowAssignModal(true);
  };

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [draggingId, setDraggingId] = useState(null);

  // DnD helpers
  const handleDragStartFromAvailable = (dishId, e) => {
    setDraggingId(dishId);
    try { e.dataTransfer.setData('text/plain', String(dishId)); } catch {}
  };
  const handleDragStartFromSelected = (dishId, e) => {
    setDraggingId(dishId);
    try { e.dataTransfer.setData('text/plain', String(dishId)); } catch {}
  };
  const allowDrop = (e) => {
    e.preventDefault();
  };
  const handleDragOver = allowDrop;
  const handleDropToSelected = (e) => {
    e.preventDefault();
    const payload = Number(e.dataTransfer?.getData('text/plain') || draggingId);
    if (!payload) return;
    addDishToSelection(payload);
    setDraggingId(null);
  };
  const handleDropToAvailable = (e) => {
    e.preventDefault();
    const payload = Number(e.dataTransfer?.getData('text/plain') || draggingId);
    if (!payload) return;
    removeDishFromSelection(payload);
    setDraggingId(null);
  };

  const addDishToSelection = (dishId) => {
    if (!selectedDishesForKitchen.includes(dishId)) {
      setSelectedDishesForKitchen([...selectedDishesForKitchen, dishId]);
    }
  };

  const removeDishFromSelection = (dishId) => {
    setSelectedDishesForKitchen(selectedDishesForKitchen.filter((id) => id !== dishId));
  };

  const saveAssignedDishes = () => {
    if (!assignForKitchen) return;
    setTargets((prev) => prev.map((t) => {
      if (assignForKitchen.all && t.all) {
        return { ...t, dishes: selectedDishesForKitchen, applyAllDishes: selectedDishesForKitchen.length === 0 };
      }
      if (!assignForKitchen.all && t.kitchenId === assignForKitchen.kitchenId) {
        return { ...t, dishes: selectedDishesForKitchen, applyAllDishes: selectedDishesForKitchen.length === 0 };
      }
      return t;
    }));
    setShowAssignModal(false);
    setAssignForKitchen(null);
  };

  const removeTarget = (predicate) => setTargets((prev) => prev.filter((t) => !predicate(t)));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Promotion Targets</h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
        >
          Add Promotion Target
        </button>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Dishes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {targets.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-sm text-neutral-500 text-center">No targets added yet.</td>
                </tr>
              )}

              {/* All Kitchens Row */}
              {targets.length > 0 && targets[0].all && (
                <tr>
                  <td className="px-6 py-4 text-sm text-neutral-900">All Kitchens</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    {targets[0].applyAllDishes ? (
                      <span>All dishes</span>
                    ) : targets[0].dishes.length === 0 ? (
                      <span className="text-neutral-500">No dishes selected</span>
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        {targets[0].dishes.map((dishId) => {
                          const d = DISHES.find((x) => x.id === dishId);
                          return <li key={dishId}>{d?.name || `Dish ${dishId}`}</li>;
                        })}
                      </ul>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={!!targets[0].active}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setTargets(prev => prev.map(t => t.all ? { ...t, active: val } : t));
                        }}
                      />
                      <span className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${targets[0].active ? 'bg-primary-600' : 'bg-neutral-300'}`}>
                        <span className={`bg-white w-4 h-4 rounded-full transform transition-transform ${targets[0].active ? 'translate-x-4' : ''}`}></span>
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => openAssignDishes({ all: true, kitchenName: 'All Kitchens' })}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      Add Dish
                    </button>
                  </td>
                </tr>
              )}

              {/* Selected Kitchens Rows */}
              {targets.filter(t=>!t.all).map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-4 text-sm text-neutral-900">{t.kitchenName}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    {t.applyAllDishes ? (
                      <span>All dishes</span>
                    ) : t.dishes.length === 0 ? (
                      <span className="text-neutral-500">No dishes selected</span>
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        {t.dishes.map((dishId) => {
                          const d = DISHES.find((x) => x.id === dishId);
                          return <li key={dishId}>{d?.name || `Dish ${dishId}`}</li>;
                        })}
                      </ul>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={!!t.active}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setTargets(prev => prev.map(x => x.id === t.id ? { ...x, active: val } : x));
                        }}
                      />
                      <span className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${t.active ? 'bg-primary-600' : 'bg-neutral-300'}`}>
                        <span className={`bg-white w-4 h-4 rounded-full transform transition-transform ${t.active ? 'translate-x-4' : ''}`}></span>
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => openAssignDishes({ kitchenId: t.kitchenId, kitchenName: t.kitchenName })}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      Add Dish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Target Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-neutral-900">Add Promotion Target</h3>
              <button onClick={resetAndClose} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <div className="space-y-5">
              <div className="text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                This target will apply to all dishes by default. You can select specific dishes from the list after saving using the "Add Dish" action in the table.
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">Do you want to apply this for all kitchen?</label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={applyAllKitchens}
                    onChange={(e) => setApplyAllKitchens(e.target.checked)}
                  />
                  <span className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${applyAllKitchens ? 'bg-primary-600' : 'bg-neutral-300'}`}>
                    <span className={`bg-white w-4 h-4 rounded-full transform transition-transform ${applyAllKitchens ? 'translate-x-4' : ''}`}></span>
                  </span>
                </label>
              </div>

              {!applyAllKitchens && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Select Kitchen</label>
                  <select
                    value={kitchenSelect}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setKitchenSelect(v ? String(v) : '');
                      if (!v) return;
                      if (!selectedKitchenIds.includes(v)) {
                        setSelectedKitchenIds([...selectedKitchenIds, v]);
                      }
                      // reset back
                      setKitchenSelect('');
                    }}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="">Select kitchen...</option>
                    {KITCHENS.map((k)=> (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                  {selectedKitchenIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedKitchenIds.map((kid) => {
                        const k = KITCHENS.find((x)=> x.id === kid);
                        return (
                          <span key={kid} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-sm">
                            {k?.name || `Kitchen ${kid}`}
                            <button
                              type="button"
                              onClick={() => setSelectedKitchenIds(selectedKitchenIds.filter((x)=> x !== kid))}
                              className="text-neutral-500 hover:text-neutral-700"
                              aria-label={`Remove ${k?.name || `Kitchen ${kid}`}`}
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetAndClose} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 text-sm font-medium">Cancel</button>
              <button onClick={handleSave} disabled={!canSave} className={`px-4 py-2 rounded-full text-sm font-medium ${canSave ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'}`}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Dishes Modal (dual list) */}
      {showAssignModal && assignForKitchen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-medium text-neutral-900">Assign Dishes</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
                {/* Available Dishes */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Available Dishes</h4>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 h-[300px] overflow-y-auto"
                    onDragOver={handleDragOver}
                    onDrop={handleDropToAvailable}
                  >
                    <div className="space-y-2">
                      {availableDishes.map((d) => (
                        <div
                          key={d.id}
                          draggable
                          onDragStart={(e) => handleDragStartFromAvailable(d.id, e)}
                          className="bg-white p-3 rounded-md border border-gray-200 cursor-move hover:bg-gray-50 transition-colors flex items-center"
                        >
                          <span className="text-sm font-medium text-gray-900">{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Dishes */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Dishes</h4>
                  <div
                    className="border-2 border-dashed border-primary-300 rounded-lg p-4 bg-primary-50 h-[300px] overflow-y-auto"
                    onDragOver={handleDragOver}
                    onDrop={handleDropToSelected}
                  >
                    <div className="space-y-2">
                      {selectedDishesForKitchen.map((id) => {
                        const dish = DISHES.find((x) => x.id === id);
                        return (
                          <div
                            key={id}
                            draggable
                            onDragStart={(e) => handleDragStartFromSelected(id, e)}
                            className="bg-white p-3 rounded-md border border-primary-200 cursor-move hover:bg-primary-50 transition-colors flex items-center"
                          >
                            <span className="text-sm font-medium text-gray-900">{dish?.name || `Dish ${id}`}</span>
                          </div>
                        );
                      })}
                      {selectedDishesForKitchen.length === 0 && (
                        <p className="text-gray-500 text-center py-8">Drag dishes here to assign them</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveAssignedDishes}
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionTargetTab;
