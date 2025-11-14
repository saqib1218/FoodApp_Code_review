import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import myCases from '../../data/cases/myCases.json';

const columns = [
  { key: 'caseId', title: 'Case ID' },
  { key: 'category', title: 'Category' },
  { key: 'type', title: 'Type' },
  { key: 'status', title: 'Status' },
  { key: 'priority', title: 'Priority' },
  { key: 'initiator', title: 'Initiator' },
  { key: 'action', title: 'Action' },
];

const MyCasesList = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // pending filters to apply on Search (to mirror Kitchens UX)
  const [pendingStatus, setPendingStatus] = useState('');
  const [pendingPriority, setPendingPriority] = useState('');
  // new pending filters
  const [pendingCaseId, setPendingCaseId] = useState('');
  const [pendingCaseType, setPendingCaseType] = useState('');
  const [pendingCaseSubType, setPendingCaseSubType] = useState('');
  const [pendingFeedbackId, setPendingFeedbackId] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState('');
  const [pendingCustomerId, setPendingCustomerId] = useState('');
  // applied filters
  const [caseIdFilter, setCaseIdFilter] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('');
  const [caseSubTypeFilter, setCaseSubTypeFilter] = useState('');
  const [feedbackIdFilter, setFeedbackIdFilter] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [customerIdFilter, setCustomerIdFilter] = useState('');

  const navigate = useNavigate();
  const filtered = useMemo(() => {
    return myCases.filter(c => {
      const q = query.trim().toLowerCase();
      const matchesQ = !q ||
        c.caseId.toLowerCase().includes(q) ||
        (c.subject || '').toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q) ||
        (c.type || '').toLowerCase().includes(q) ||
        (c.subType || '').toLowerCase().includes(q) ||
        (c.currentActor || '').toLowerCase().includes(q) ||
        (c.initiator || '').toLowerCase().includes(q);
      const matchesStatus = !status || String(c.status).toLowerCase() === status.toLowerCase();
      const matchesPriority = !priority || String(c.priority).toLowerCase() === priority.toLowerCase();
      const matchesCaseId = !caseIdFilter || String(c.caseId || '').toLowerCase().includes(caseIdFilter.toLowerCase());
      const matchesCaseType = !caseTypeFilter || String(c.type || '').toLowerCase().includes(caseTypeFilter.toLowerCase());
      const matchesCaseSubType = !caseSubTypeFilter || String(c.subType || '').toLowerCase().includes(caseSubTypeFilter.toLowerCase());
      const matchesFeedbackId = !feedbackIdFilter || String(c.feedbackId || '').toLowerCase().includes(feedbackIdFilter.toLowerCase());
      const matchesOrderId = !orderIdFilter || String(c.orderId || '').toLowerCase().includes(orderIdFilter.toLowerCase());
      const matchesCustomerId = !customerIdFilter || String(c.customerId || '').toLowerCase().includes(customerIdFilter.toLowerCase());
      return matchesQ && matchesStatus && matchesPriority && matchesCaseId && matchesCaseType && matchesCaseSubType && matchesFeedbackId && matchesOrderId && matchesCustomerId;
    });
  }, [query, status, priority]);

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default MyCasesList;
