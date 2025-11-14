import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, EyeIcon, PencilIcon, TrashIcon, ChatBubbleLeftIcon, GiftIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../components/ConfirmationModal';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tag: '',
    lastOrderDate: '',
    lifetimeValue: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Confirmation modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingDeleteCustomer, setPendingDeleteCustomer] = useState(null);
  const [confirmationComment, setConfirmationComment] = useState('');

  // Mock data for customers
  useEffect(() => {
    // This would be replaced with an API call in production
    const mockCustomers = [
      {
        id: 101,
        name: 'Ahmed Khan',
        email: 'ahmed@example.com',
        phone: '+92 300 1234567',
        city: 'Lahore',
        status: true,
        orders: 12,
        totalSpend: 15600,
        lastOrderDate: '2024-01-10',
        joinedDate: '2023-01-15',
        tags: ['High spender']
      },
      {
        id: 102,
        name: 'Sara Ali',
        email: 'sara@example.com',
        phone: '+92 301 2345678',
        city: 'Karachi',
        status: true,
        orders: 8,
        totalSpend: 4200,
        lastOrderDate: '2024-01-08',
        joinedDate: '2023-02-20',
        tags: ['Event buyer']
      },
      {
        id: 103,
        name: 'Bilal Ahmad',
        email: 'bilal@example.com',
        phone: '+92 302 3456789',
        city: 'Peshawar',
        status: false,
        orders: 3,
        totalSpend: 890,
        lastOrderDate: '2023-12-15',
        joinedDate: '2023-03-10',
        tags: ['Dormant']
      },
      {
        id: 104,
        name: 'Ayesha Malik',
        email: 'ayesha@example.com',
        phone: '+92 303 4567890',
        city: 'Islamabad',
        status: true,
        orders: 15,
        totalSpend: 22400,
        lastOrderDate: '2024-01-12',
        joinedDate: '2023-01-05',
        tags: ['High spender']
      },
      {
        id: 105,
        name: 'Zainab Hussain',
        email: 'zainab@example.com',
        phone: '+92 304 5678901',
        city: 'Quetta',
        status: false,
        orders: 6,
        totalSpend: 1200,
        lastOrderDate: '2024-01-05',
        joinedDate: '2023-04-12',
        tags: ['New customer']
      },
      {
        id: 106,
        name: 'Hassan Ali',
        email: 'hassan@example.com',
        phone: '+92 305 6789012',
        city: 'Faisalabad',
        status: true,
        orders: 25,
        totalSpend: 35000,
        lastOrderDate: '2024-01-14',
        joinedDate: '2022-11-20',
        tags: ['High spender', 'Event buyer']
      }
    ];

    setCustomers(mockCustomers);
    setFilteredCustomers(mockCustomers);
    setIsLoading(false);
  }, []);

  // Filter customers based on search term and filters
  useEffect(() => {
    let result = customers;

    // Apply search term filter (Name/Phone/Email)
    if (searchTerm) {
      result = result.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }

    // Apply tag filter
    if (filters.tag) {
      result = result.filter(customer => 
        customer.tags.includes(filters.tag)
      );
    }

    // Apply last order date filter
    if (filters.lastOrderDate) {
      const filterDate = new Date(filters.lastOrderDate);
      result = result.filter(customer => {
        const customerOrderDate = new Date(customer.lastOrderDate);
        return customerOrderDate >= filterDate;
      });
    }

    // Apply lifetime value filter
    if (filters.lifetimeValue) {
      const minValue = parseFloat(filters.lifetimeValue);
      result = result.filter(customer => 
        customer.totalSpend >= minValue
      );
    }

    setFilteredCustomers(result);
  }, [searchTerm, filters, customers]);

  // Get unique tags for filter dropdown
  const allTags = customers.flatMap(customer => customer.tags);
  const uniqueTags = [...new Set(allTags)];

  // Handle edit action
  const handleEdit = (customerId) => {
    console.log('Edit customer:', customerId);
    // TODO: Implement edit functionality
  };

  // Handle status toggle
  const handleStatusToggle = (customerId) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === customerId 
        ? { ...customer, status: !customer.status }
        : customer
    ));
  };

  // Handle message action
  const handleMessage = (customerId) => {
    console.log('Message customer:', customerId);
    // TODO: Implement messaging functionality
  };

  // Handle offer action
  const handleOffer = (customerId) => {
    console.log('Send offer to customer:', customerId);
    // TODO: Implement offer functionality
  };

  // Handle delete action
  const handleDelete = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setPendingDeleteCustomer(customer);
    setShowConfirmationModal(true);
    setConfirmationComment('');
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!confirmationComment.trim()) return;

    if (pendingDeleteCustomer) {
      setCustomers(prev => prev.filter(c => c.id !== pendingDeleteCustomer.id));
    }

    setShowConfirmationModal(false);
    setPendingDeleteCustomer(null);
    setConfirmationComment('');
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowConfirmationModal(false);
    setPendingDeleteCustomer(null);
    setConfirmationComment('');
  };

 

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      tag: '',
      lastOrderDate: '',
      lifetimeValue: ''
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get tag badge color
  const getTagBadgeColor = (tag) => {
    const colors = {
      'New customer': 'bg-blue-100 text-blue-800',
      'High spender': 'bg-green-100 text-green-800',
      'Dormant': 'bg-red-100 text-red-800',
      'Event buyer': 'bg-purple-100 text-purple-800'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default CustomersList;
