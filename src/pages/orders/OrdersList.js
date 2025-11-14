import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, EyeIcon } from '@heroicons/react/24/outline';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    date: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for orders
  useEffect(() => {
    // This would be replaced with an API call in production
    const mockOrders = [
      {
        id: 'ORD-001',
        customer: 'Ahmed Khan',
        kitchen: 'Lahori Delights',
        items: 3,
        total: 1250,
        status: 'delivered',
        date: '2023-06-27'
      },
      {
        id: 'ORD-002',
        customer: 'Sara Ali',
        kitchen: 'Karachi Flavors',
        items: 2,
        total: 850,
        status: 'preparing',
        date: '2023-06-27'
      },
      {
        id: 'ORD-003',
        customer: 'Bilal Ahmad',
        kitchen: 'Peshawar Tikka House',
        items: 4,
        total: 1800,
        status: 'delivered',
        date: '2023-06-26'
      },
      {
        id: 'ORD-004',
        customer: 'Ayesha Malik',
        kitchen: 'Islamabad Homestyle',
        items: 1,
        total: 450,
        status: 'cancelled',
        date: '2023-06-26'
      },
      {
        id: 'ORD-005',
        customer: 'Zainab Hussain',
        kitchen: 'Quetta Traditional',
        items: 2,
        total: 950,
        status: 'in-transit',
        date: '2023-06-27'
      }
    ];

    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
    setIsLoading(false);
  }, []);

  // Filter orders based on search term and filters
  useEffect(() => {
    let result = orders;

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.kitchen.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter(order => 
        order.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Apply date filter
    if (filters.date) {
      result = result.filter(order => 
        order.date === filters.date
      );
    }

    setFilteredOrders(result);
  }, [searchTerm, filters, orders]);

  // Get unique statuses and dates for filter dropdowns
  const statuses = [...new Set(orders.map(order => order.status))];
  const dates = [...new Set(orders.map(order => order.date))];

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Delivered
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Preparing
          </span>
        );
      case 'in-transit':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            In Transit
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '',
      date: ''
    });
  };

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default OrdersList;
