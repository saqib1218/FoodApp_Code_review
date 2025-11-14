import React, { useState, useEffect } from 'react';
import { ChartBarIcon, ChartPieIcon, CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    // This would be replaced with an API call in production
    const fetchReportData = () => {
      // Mock data for reports
      const mockReportData = {
        sales: {
          total: 125000,
          previousPeriod: 110000,
          percentChange: 13.6,
          dailyData: [
            { date: '2023-06-01', value: 3500 },
            { date: '2023-06-02', value: 4200 },
            { date: '2023-06-03', value: 3800 },
            { date: '2023-06-04', value: 4500 },
            { date: '2023-06-05', value: 5100 },
            { date: '2023-06-06', value: 4700 },
            { date: '2023-06-07', value: 3900 }
          ],
          topKitchens: [
            { name: 'Lahori Delights', value: 28000 },
            { name: 'Karachi Flavors', value: 22000 },
            { name: 'Peshawar Tikka House', value: 18000 },
            { name: 'Islamabad Cuisine', value: 15000 },
            { name: 'Quetta BBQ', value: 12000 }
          ]
        },
        orders: {
          total: 850,
          previousPeriod: 720,
          percentChange: 18.1,
          dailyData: [
            { date: '2023-06-01', value: 25 },
            { date: '2023-06-02', value: 32 },
            { date: '2023-06-03', value: 28 },
            { date: '2023-06-04', value: 35 },
            { date: '2023-06-05', value: 40 },
            { date: '2023-06-06', value: 38 },
            { date: '2023-06-07', value: 30 }
          ],
          byStatus: [
            { status: 'delivered', count: 780 },
            { status: 'cancelled', count: 45 },
            { status: 'refunded', count: 25 }
          ]
        },
        customers: {
          total: 320,
          newCustomers: 45,
          returningCustomers: 275,
          percentNew: 14.1,
          topCities: [
            { city: 'Lahore', count: 120 },
            { city: 'Karachi', count: 85 },
            { city: 'Islamabad', count: 55 },
            { city: 'Peshawar', count: 35 },
            { city: 'Quetta', count: 25 }
          ]
        }
      };

      setReportData(mockReportData);
      setIsLoading(false);
    };

    fetchReportData();
  }, [dateRange]);

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'week':
        return 'Last 7 days';
      case 'month':
        return 'Last 30 days';
      case 'quarter':
        return 'Last 3 months';
      case 'year':
        return 'Last 12 months';
      default:
        return '';
    }
  };

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default Reports;
