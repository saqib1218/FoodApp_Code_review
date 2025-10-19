import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PencilIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import DialogueBox from '../../../../components/DialogueBox';
import { useGetPromotionEligibilityQuery, useCreatePromotionEligibilityMutation, useLazyGetPromotionEligibilityByIdQuery, useUpdatePromotionEligibilityMutation } from '../../../../store/api/modules/discounts/discountsApi';

const ALL_DAYS = [
  { key: 'Mon', label: 'Mon' },
  { key: 'Tue', label: 'Tue' },
  { key: 'Wed', label: 'Wed' },
  { key: 'Thu', label: 'Thu' },
  { key: 'Fri', label: 'Fri' },
  { key: 'Sat', label: 'Sat' },
  { key: 'Sun', label: 'Sun' },
];

const emptyForm = {
  minOrderMinor: '',
  minItems: '',
  daysOfWeek: [],
  windowStartLocal: '',
  windowEndLocal: '',
  preorderLeadHours: '',
  blackoutDates: [],
  note: '',
  maxDiscountPercent: '',
};

const EligibilityRuleTab = () => {
  const { id: promotionId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [blackoutCandidate, setBlackoutCandidate] = useState('');
  // Single rule mode: either null or an object
  const [rule, setRule] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmComment, setConfirmComment] = useState('');

  // Dialogue box state
  const [dialogueBox, setDialogueBox] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const showDialogue = (type, title, message) => setDialogueBox({ isOpen: true, type, title, message });
  const closeDialogue = () => setDialogueBox({ isOpen: false, type: 'success', title: '', message: '' });

  // Fetch existing eligibility (items array)
  const { data: eligResp, isLoading: eligLoading, isFetching: eligFetching, isUninitialized, isError: eligError, refetch: refetchEligibility } = useGetPromotionEligibilityQuery(promotionId, { skip: !promotionId });
  const [createEligibility, { isLoading: creatingEligibility }] = useCreatePromotionEligibilityMutation();
  const [updateEligibility, { isLoading: updatingEligibility }] = useUpdatePromotionEligibilityMutation();
  const [triggerGetEligibilityById] = useLazyGetPromotionEligibilityByIdQuery();

  const canSave = useMemo(() => {
    // Minimal validation: require at least one of the numeric fields and proper time window if any time is provided
    const hasMinVals = form.minOrderMinor !== '' || form.minItems !== '';
    const timeOk =
      (form.windowStartLocal === '' && form.windowEndLocal === '') ||
      (form.windowStartLocal !== '' && form.windowEndLocal !== '');
    return hasMinVals && timeOk;
  }, [form]);

  const toggleDay = (key) => {
    setForm((prev) => {
      const exists = prev.daysOfWeek.includes(key);
      return {
        ...prev,
        daysOfWeek: exists
          ? prev.daysOfWeek.filter((d) => d !== key)
          : [...prev.daysOfWeek, key],
      };
    });
  };

  const addBlackoutDate = () => {
    if (!blackoutCandidate) return;
    if (form.blackoutDates.includes(blackoutCandidate)) return;
    setForm((prev) => ({ ...prev, blackoutDates: [...prev.blackoutDates, blackoutCandidate] }));
    setBlackoutCandidate('');
  };

  const removeBlackoutDate = (d) => {
    setForm((prev) => ({ ...prev, blackoutDates: prev.blackoutDates.filter((x) => x !== d) }));
  };

  useEffect(() => {
    const items = eligResp?.data?.items || [];
    if (Array.isArray(items) && items.length > 0) {
      const it = items[0] || {};
      // Normalize blackoutDates to array
      let blackout = it.blackoutDates;
      if (!Array.isArray(blackout)) {
        if (typeof blackout === 'string') {
          // examples: "[2025-12-25,2026-01-01)" or "2025-12-25,2026-01-01"
          const trimmed = blackout.replace(/^\[/, '').replace(/\)$/, '').replace(/\]$/, '');
          blackout = trimmed
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        } else {
          blackout = [];
        }
      }
      const normalized = {
        id: it.id,
        promotionEligibilityId: it.promotionEligibilityId || it.id,
        minOrderMinor: it.minOrderMinor ?? '',
        minItems: it.minItems ?? '',
        daysOfWeek: Array.isArray(it.daysOfWeek) ? it.daysOfWeek : [],
        windowStartLocal: it.windowStartLocal ?? '',
        windowEndLocal: it.windowEndLocal ?? '',
        preorderLeadHours: it.preorderLeadHours ?? '',
        blackoutDates: blackout,
        note: it.extraJson?.note ?? it.note ?? '',
        maxDiscountPercent: it.extraJson?.maxDiscountPercent ?? it.maxDiscountPercent ?? '',
      };
      setRule(normalized);
    } else {
      setRule(null);
    }
  }, [eligResp]);

  const handleSave = async () => {
    if (!canSave || !promotionId) return;
    try {
      const sanitizeDates = (arr) => (Array.isArray(arr) ? arr.map(d => (typeof d === 'string' ? d.slice(0, 10) : d)).filter(Boolean) : []);
      const body = {
        minOrderMinor: form.minOrderMinor ? Number(form.minOrderMinor) : null,
        minItems: form.minItems ? Number(form.minItems) : null,
        daysOfWeek: form.daysOfWeek,
        windowStartLocal: form.windowStartLocal || null,
        windowEndLocal: form.windowEndLocal || null,
        preorderLeadHours: form.preorderLeadHours ? Number(form.preorderLeadHours) : null,
        blackoutDates: sanitizeDates(form.blackoutDates),
        extraJson: { note: form.note || null },
        maxDiscountPercent: form.maxDiscountPercent ? Number(form.maxDiscountPercent) : null,
      };
      const doUpdate = !!(rule && rule.promotionEligibilityId);
      // If updating, merge unchanged fields from existing rule into payload
      const mergedBody = doUpdate ? {
        minOrderMinor: form.minOrderMinor !== '' ? Number(form.minOrderMinor) : (rule.minOrderMinor !== '' ? Number(rule.minOrderMinor) : null),
        minItems: form.minItems !== '' ? Number(form.minItems) : (rule.minItems !== '' ? Number(rule.minItems) : null),
        daysOfWeek: (form.daysOfWeek && form.daysOfWeek.length) ? form.daysOfWeek : (Array.isArray(rule.daysOfWeek) ? rule.daysOfWeek : []),
        windowStartLocal: form.windowStartLocal || rule.windowStartLocal || null,
        windowEndLocal: form.windowEndLocal || rule.windowEndLocal || null,
        preorderLeadHours: form.preorderLeadHours !== '' ? Number(form.preorderLeadHours) : (rule.preorderLeadHours !== '' ? Number(rule.preorderLeadHours) : null),
        blackoutDates: (form.blackoutDates && form.blackoutDates.length) ? sanitizeDates(form.blackoutDates) : sanitizeDates(Array.isArray(rule.blackoutDates) ? rule.blackoutDates : []),
        extraJson: { note: (form.note !== '' ? form.note : (rule.note || null)) },
        maxDiscountPercent: form.maxDiscountPercent !== '' ? Number(form.maxDiscountPercent) : (rule.maxDiscountPercent !== '' ? Number(rule.maxDiscountPercent) : null),
      } : body;
      const res = doUpdate
        ? await updateEligibility({ id: promotionId, eligibilityId: rule.promotionEligibilityId, body: mergedBody }).unwrap()
        : await createEligibility({ id: promotionId, body }).unwrap();
      showDialogue('success', res?.i18n_key || (doUpdate ? 'Updated' : 'Success'), res?.message || (doUpdate ? 'Eligibility rule updated successfully.' : 'Eligibility rule created successfully.'));
      await refetchEligibility();
      setForm(emptyForm);
      setBlackoutCandidate('');
      setShowModal(false);
      setRule((eligResp?.data?.items || [])[0] || body);
    } catch (e) {
      showDialogue('error', 'Error', e?.data?.message || 'Failed to save eligibility rule.');
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setBlackoutCandidate('');
    setShowModal(false);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setBlackoutCandidate('');
    setShowModal(true);
  };
  const openEdit = async () => {
    if (!rule || !promotionId) return;
    try {
      const res = await triggerGetEligibilityById({ id: promotionId, eligibilityId: rule.promotionEligibilityId }).unwrap();
      const d = res?.data || {};
      // Normalize blackoutDates from detail
      let blackout = d.blackoutDates;
      if (!Array.isArray(blackout)) {
        if (typeof blackout === 'string') {
          const trimmed = blackout.replace(/^\[/, '').replace(/\)$/, '').replace(/\]$/, '');
          blackout = trimmed.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          blackout = [];
        }
      }
      setForm({
        minOrderMinor: d.minOrderMinor ?? '',
        minItems: d.minItems ?? '',
        daysOfWeek: Array.isArray(d.daysOfWeek) ? d.daysOfWeek : [],
        windowStartLocal: d.windowStartLocal ?? '',
        windowEndLocal: d.windowEndLocal ?? '',
        preorderLeadHours: d.preorderLeadHours ?? '',
        blackoutDates: blackout,
        note: d.extraJson?.note ?? d.note ?? '',
        maxDiscountPercent: d.extraJson?.maxDiscountPercent ?? d.maxDiscountPercent ?? '',
      });
      setBlackoutCandidate('');
      setShowModal(true);
    } catch (e) {
      showDialogue('error', 'Error', e?.data?.message || 'Failed to fetch eligibility details.');
    }
  };

  const loading = isUninitialized || eligLoading || eligFetching;
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-neutral-900">Eligibility Rule</h3>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-10">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">Eligibility Rule</h3>
        {!rule && (
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm font-medium"
          >
            Add Eligibility Rule
          </button>
        )}
        {rule && (
          <button
            onClick={openEdit}
            className="p-2 border border-neutral-300 rounded-full text-neutral-700 hover:bg-neutral-50"
            title="Edit"
            aria-label="Edit eligibility rule"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {!rule && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 text-sm text-neutral-500 text-center">
          No eligibility rule added yet.
        </div>
      )}

      {rule && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-500">Min Order (minor)</div>
              <div className="text-neutral-900 font-medium">{rule.minOrderMinor || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Min Items</div>
              <div className="text-neutral-900 font-medium">{rule.minItems || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Max Discount %</div>
              <div className="text-neutral-900 font-medium">{rule.maxDiscountPercent || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Preorder Lead (h)</div>
              <div className="text-neutral-900 font-medium">{rule.preorderLeadHours || '-'}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-neutral-500">Days</div>
              <div className="text-neutral-900 font-medium">{rule.daysOfWeek?.length ? rule.daysOfWeek.join(', ') : '-'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Time Window</div>
              <div className="text-neutral-900 font-medium">{rule.windowStartLocal && rule.windowEndLocal ? `${rule.windowStartLocal} - ${rule.windowEndLocal}` : '-'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Blackout Dates</div>
              <div className="text-neutral-900 font-medium">{Array.isArray(rule.blackoutDates) && rule.blackoutDates.length ? rule.blackoutDates.join(', ') : '-'}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-neutral-500">Note</div>
              <div className="text-neutral-900 font-medium">{rule.note || '-'}</div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-neutral-900">Add Eligibility Rule</h3>
              <button onClick={handleCancel} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Min Order (minor)</label>
                <input type="number" value={form.minOrderMinor} onChange={(e) => setForm({ ...form, minOrderMinor: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="e.g. 500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Min Items</label>
                <input type="number" value={form.minItems} onChange={(e) => setForm({ ...form, minItems: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="e.g. 2" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Days of Week</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((d) => {
                    const active = form.daysOfWeek.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => toggleDay(d.key)}
                        className={`px-3 py-1.5 rounded-full border text-sm ${active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'}`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Window Start (local)</label>
                <input type="time" value={form.windowStartLocal} onChange={(e) => setForm({ ...form, windowStartLocal: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Window End (local)</label>
                <input type="time" value={form.windowEndLocal} onChange={(e) => setForm({ ...form, windowEndLocal: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Preorder Lead Hours</label>
                <input type="number" value={form.preorderLeadHours} onChange={(e) => setForm({ ...form, preorderLeadHours: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="e.g. 24" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Max Discount Percent</label>
                <input type="number" value={form.maxDiscountPercent} onChange={(e) => setForm({ ...form, maxDiscountPercent: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="e.g. 20" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Blackout Dates</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={blackoutCandidate} onChange={(e) => setBlackoutCandidate(e.target.value)} className="p-2 border border-neutral-300 rounded-lg" />
                  <button type="button" onClick={addBlackoutDate} className="px-3 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-900 text-sm">Add</button>
                </div>
                {form.blackoutDates.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.blackoutDates.map((d) => (
                      <span key={d} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-sm">
                        {d}
                        <button type="button" onClick={() => removeBlackoutDate(d)} className="text-neutral-500 hover:text-neutral-700">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Note</label>
                <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="Optional note" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleCancel} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 text-sm font-medium">Cancel</button>
              <button onClick={() => setShowConfirm(true)} disabled={!canSave} className={`px-4 py-2 rounded-full text-sm font-medium ${canSave ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'}`}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <ConfirmationModal
          isOpen={showConfirm}
          title={rule ? 'Update Eligibility Rule' : 'Create Eligibility Rule'}
          message={rule ? 'Are you sure you want to update this eligibility rule?' : 'Are you sure you want to create this eligibility rule?'}
          comment={confirmComment}
          onCommentChange={setConfirmComment}
          onConfirm={() => { setShowConfirm(false); handleSave(); setConfirmComment(''); }}
          onCancel={() => { setShowConfirm(false); setConfirmComment(''); }}
          confirmButtonText={rule ? 'Update' : 'Create'}
          confirmButtonColor="primary"
          isCommentRequired={true}
        />
      )}

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

export default EligibilityRuleTab;
