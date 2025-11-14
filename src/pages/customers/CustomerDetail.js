import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, PlusIcon,EyeIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../components/ConfirmationModal';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isLoading, setIsLoading] = useState(true);
  
  // Tags state
  const [tags, setTags] = useState([
    { id: 1, name: 'High Spender', createdAt: '2024-01-10' },
    { id: 2, name: 'Frequent Buyer', createdAt: '2024-01-05' }
  ]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState({ name: '' });
  
  // Preferences state
  const [preferences, setPreferences] = useState([
    { id: 1, kitchen: 'Pizza Palace', dishes: ['Margherita Pizza', 'Pepperoni Pizza'], orderCount: 5, createdAt: '2024-01-08' },
    { id: 2, kitchen: 'Burger House', dishes: ['Classic Burger'], orderCount: 3, createdAt: '2024-01-12' }
  ]);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [editingPreference, setEditingPreference] = useState(null);
  const [preferenceForm, setPreferenceForm] = useState({ kitchen: '', dishes: [], orderCount: '' });
  const [selectedKitchen, setSelectedKitchen] = useState('');
  
  // Confirmation modal state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [confirmationComment, setConfirmationComment] = useState('');
  
  // Special Notes state
  const [notes, setNotes] = useState([
    { 
      id: 1, 
      category: 'Preference', 
      subcategory: 'Spice Low', 
      tags: ['Low Spice', 'Mild'], 
      note: 'Customer prefers mild spice level in all dishes',
      isPrivate: false,
      createdAt: '2024-01-10'
    },
    { 
      id: 2, 
      category: 'Allergy', 
      subcategory: 'Nuts', 
      tags: ['Allergy', 'Severe'], 
      note: 'Severe nut allergy - ensure no cross contamination',
      isPrivate: true,
      createdAt: '2024-01-08'
    }
  ]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showViewNoteModal, setShowViewNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    category: '',
    subcategory: '',
    tags: [],
    note: '',
    isPrivate: false
  });
  const [currentTag, setCurrentTag] = useState('');

  // Customer discounts state
  const [customerDiscounts, setCustomerDiscounts] = useState([
    {
      id: 1,
      kitchenName: 'Pizza Palace',
      discountName: 'Weekend Special',
      status: 'availed',
      amount: 150,
      availedDate: '2024-01-10',
      discountType: '20% Off'
    },
    {
      id: 2,
      kitchenName: 'Burger House',
      discountName: 'Buy 1 Get 1',
      status: 'pending',
      amount: 200,
      availedDate: null,
      discountType: 'BOGO'
    },
    {
      id: 3,
      kitchenName: 'Sushi Master',
      discountName: 'First Order',
      status: 'availed',
      amount: 300,
      availedDate: '2024-01-08',
      discountType: 'Fixed Amount'
    }
  ]);

  // Loyalty points state
  const [loyaltyData, setLoyaltyData] = useState({
    totalPoints: 2450,
    availablePoints: 1850,
    usedPoints: 600,
    tierLevel: 'Gold',
    nextTierPoints: 550,
    pointsHistory: [
      {
        id: 1,
        date: '2024-01-12',
        type: 'earned',
        points: 125,
        description: 'Order from Pizza Palace',
        orderId: 'ORD-001'
      },
      {
        id: 2,
        date: '2024-01-10',
        type: 'redeemed',
        points: -200,
        description: 'Discount on Burger House order',
        orderId: 'ORD-002'
      },
      {
        id: 3,
        date: '2024-01-08',
        type: 'earned',
        points: 180,
        description: 'Order from Sushi Master',
        orderId: 'ORD-003'
      },
      {
        id: 4,
        date: '2024-01-05',
        type: 'bonus',
        points: 500,
        description: 'Birthday bonus points',
        orderId: null
      }
    ]
  });

  // Customer engagement data
  const [engagementData, setEngagementData] = useState([
    {
      id: 1,
      type: 'query',
      title: 'Send a Query',
      message: 'Customer inquired about delivery time for their order from Pizza Palace. They wanted to know if they could get faster delivery.',
      dateTime: '2024-01-12 14:30:00',
      status: 'resolved'
    },
    {
      id: 2,
      type: 'message',
      title: 'Send a Message',
      message: 'Welcome message sent to customer after their first successful order. Included information about loyalty program and upcoming offers.',
      dateTime: '2024-01-10 10:15:00',
      status: 'sent'
    },
    {
      id: 3,
      type: 'query',
      title: 'Send a Query',
      message: 'Customer asked about vegetarian options available at Sushi Master. Provided detailed menu information and dietary preferences.',
      dateTime: '2024-01-08 16:45:00',
      status: 'resolved'
    },
    {
      id: 4,
      type: 'message',
      title: 'Send a Message',
      message: 'Birthday wishes and special discount code sent to customer. Included personalized offer for their favorite kitchen.',
      dateTime: '2024-01-05 09:00:00',
      status: 'sent'
    },
    {
      id: 5,
      type: 'query',
      title: 'Send a Query',
      message: 'Customer reported issue with missing items in their Burger House order. Issue was resolved with refund and replacement.',
      dateTime: '2024-01-03 19:20:00',
      status: 'resolved'
    }
  ]);

  // Categories and subcategories data
  const categoriesData = {
    'Occasion': ['Eid', 'Ramadan', 'Birthday', 'Anniversary', 'Other'],
    'Preference': ['Spice Low', 'Spice High', 'Extra Raita', 'No Onion', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Other'],
    'Feedback': ['Positive', 'Neutral', 'Negative'],
    'Complaint': ['Late Delivery', 'Wrong Order', 'Quality Issue', 'Missing Items', 'Other'],
    'Allergy': ['Nuts', 'Dairy', 'Gluten', 'Seafood', 'Other'],
    'Delivery Instruction': ['Leave at Door', 'Call Before Delivery', 'Specific Time', 'Other'],
    'Other': []
  };

  // Mock data for kitchens and dishes
  const mockKitchens = [
    { 
      id: 1, 
      name: 'Pizza Palace',
      dishes: [
        { id: 101, name: 'Margherita Pizza' },
        { id: 102, name: 'Pepperoni Pizza' },
        { id: 103, name: 'Veggie Supreme' }
      ]
    },
    { 
      id: 2, 
      name: 'Burger House',
      dishes: [
        { id: 201, name: 'Classic Burger' },
        { id: 202, name: 'Chicken Burger' },
        { id: 203, name: 'Veggie Burger' }
      ]
    },
    { 
      id: 3, 
      name: 'Sushi Master',
      dishes: [
        { id: 301, name: 'California Roll' },
        { id: 302, name: 'Salmon Nigiri' },
        { id: 303, name: 'Tuna Sashimi' }
      ]
    }
  ];

  useEffect(() => {
    // This would be replaced with an API call in production
    const fetchCustomer = () => {
      // Mock data for a single customer
      const mockCustomer = {
        id: parseInt(id),
        name: 'Ahmed Khan',
        email: 'ahmed@example.com',
        phone: '+92 300 1234567',
        city: 'Lahore',
        address: '123 Main Street, Block F, Gulberg III, Lahore',
        status: 'active',
        orders: 12,
        totalSpent: 15000,
        joinedDate: '2023-01-15',
        lastOrderDate: '2023-06-25',
        recentOrders: [
          {
            id: 'ORD-001',
            date: '2023-06-25',
            kitchen: 'Lahori Delights',
            total: 1250,
            status: 'delivered'
          },
          {
            id: 'ORD-002',
            date: '2023-06-15',
            kitchen: 'Karachi Flavors',
            total: 850,
            status: 'delivered'
          },
          {
            id: 'ORD-003',
            date: '2023-06-05',
            kitchen: 'Peshawar Tikka House',
            total: 1800,
            status: 'delivered'
          }
        ]
      };

      setCustomer(mockCustomer);
      setIsLoading(false);
    };

    fetchCustomer();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-neutral-600">Working on it...</div>
    );
  }

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Inactive
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Delivered
          </span>
        );
      default:

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};
  

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'info' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">{customer.email}</p>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">{customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="mt-1 text-gray-900">{customer.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">City</p>
                    <p className="mt-1 text-gray-900">{customer.city}</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Joined Date</p>
                    <p className="mt-1 text-gray-900">{customer.joinedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="mt-1 text-gray-900">{customer.orders}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Spent</p>
                    <p className="mt-1 text-gray-900">PKR {customer.totalSpent}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Order</p>
                    <p className="mt-1 text-gray-900">{customer.lastOrderDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kitchen
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customer.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.kitchen}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        PKR {order.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Link
                to={`/orders?customer=${customer.id}`}
                className="text-primary-600 hover:text-primary-900"
              >
                View all orders
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Customer Engagement</h2>
            <div className="space-y-4">
              {engagementData.map((engagement) => (
                <div
                  key={engagement.id}
                  className={`border rounded-lg p-4 ${
                    engagement.type === 'query'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className={`flex-shrink-0 h-2 w-2 rounded-full mr-3 ${
                          engagement.type === 'query' ? 'bg-blue-400' : 'bg-green-400'
                        }`}></div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {engagement.title}
                        </h3>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          engagement.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {engagement.status === 'resolved' ? 'Resolved' : 'Sent'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        {engagement.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(engagement.dateTime).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })} at {new Date(engagement.dateTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <Link
                          to={`/engagement/${engagement.id}`}
                          className={`text-sm font-medium hover:underline ${
                            engagement.type === 'query'
                              ? 'text-blue-600 hover:text-blue-800'
                              : 'text-green-600 hover:text-green-800'
                          }`}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {engagementData.length === 0 && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No engagement history</h3>
                  <p className="mt-1 text-sm text-gray-500">No messages or queries have been exchanged with this customer yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Segmentation & Tags Tab */}
        {activeTab === 'tags' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Customer Tags</h2>
              <button
                onClick={() => {
                  setEditingTag(null);
                  setTagForm({ name: '' });
                  setShowTagModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                Create Tag
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tag Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tags.map((tag) => (
                    <tr key={tag.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tag.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tag.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setEditingTag(tag);
                              setTagForm({ name: tag.name });
                              setShowTagModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmationAction('delete-tag');
                              setPendingAction(tag);
                              setShowConfirmationModal(true);
                              setConfirmationComment('');
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
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
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Customer Preferences</h2>
              <button
                onClick={() => {
                  setEditingPreference(null);
                  setPreferenceForm({ kitchen: '', dishes: [], orderCount: '' });
                  setSelectedKitchen('');
                  setShowPreferenceModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                Create Preference
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kitchen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preferred Dishes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preferences.map((preference) => (
                    <tr key={preference.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {preference.kitchen}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {preference.dishes.map((dish, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {dish}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {preference.orderCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(preference.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setEditingPreference(preference);
                              setPreferenceForm({
                                kitchen: preference.kitchen,
                                dishes: preference.dishes,
                                orderCount: preference.orderCount
                              });
                              setSelectedKitchen(preference.kitchen);
                              setShowPreferenceModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmationAction('delete-preference');
                              setPendingAction(preference);
                              setShowConfirmationModal(true);
                              setConfirmationComment('');
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
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
        )}

        {/* Special Notes Tab */}
        {activeTab === 'notes' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Special Notes</h2>
              <button
                onClick={() => {
                  setEditingNote(null);
                  setNoteForm({ category: '', subcategory: '', tags: [], note: '', isPrivate: false });
                  setCurrentTag('');
                  setShowNoteModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                Create Note
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subcategory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                   
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Privacy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notes.map((note) => (
                    <tr key={note.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {note.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {note.subcategory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{note.tags.length - 2} more</span>
                          )}
                        </div>
                      </td>
                     
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {note.isPrivate ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Private
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Public
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setViewingNote(note);
                              setShowViewNoteModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="View note"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingNote(note);
                              setNoteForm({
                                category: note.category,
                                subcategory: note.subcategory,
                                tags: note.tags,
                                note: note.note,
                                isPrivate: note.isPrivate
                              });
                              setShowNoteModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit note"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmationAction('delete-note');
                              setPendingAction(note);
                              setShowConfirmationModal(true);
                              setConfirmationComment('');
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete note"
                          >
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
        )}

        {/* Quick Actions Tab */}
        {activeTab === 'actions' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="mb-4">
                  <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l10.607-10.607c.391-.391 1.024-.391 1.414 0l2.828 2.828c.391.391.391 1.024 0 1.414L8.172 11.414c-.391.391-1.024.391-1.414 0L4.828 8.414c-.391-.391-.391-1.024 0-1.414z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Send Push Notification</h3>
                <p className="text-sm text-gray-600 mb-4">Send targeted push notifications to this customer</p>
                <button
                  onClick={() => {
                    // TODO: Implement push notification functionality
                    alert('Push notification feature will be implemented');
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Send Notification
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="mb-4">
                  <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Send WhatsApp</h3>
                <p className="text-sm text-gray-600 mb-4">Send WhatsApp message to customer's registered number</p>
                <button
                  onClick={() => {
                    // TODO: Implement WhatsApp functionality
                    alert('WhatsApp messaging feature will be implemented');
                  }}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Send WhatsApp
                </button>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                <div className="mb-4">
                  <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Apply Voucher</h3>
                <p className="text-sm text-gray-600 mb-4">Apply discount voucher to customer's account</p>
                <button
                  onClick={() => {
                    // TODO: Implement voucher application functionality
                    alert('Voucher application feature will be implemented');
                  }}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Apply Voucher
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Discounts Tab */}
        {activeTab === 'discounts' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Customer Discounts</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kitchen Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availed Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerDiscounts.map((discount) => (
                    <tr key={discount.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {discount.kitchenName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {discount.discountName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {discount.discountType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {discount.status === 'availed' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Availed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        PKR {discount.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {discount.availedDate ? new Date(discount.availedDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loyalty Points Tab */}
        {activeTab === 'loyalty' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Loyalty Points</h2>
            
            {/* Points Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Points</p>
                    <p className="text-2xl font-semibold text-gray-900">{loyaltyData.totalPoints}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Available Points</p>
                    <p className="text-2xl font-semibold text-gray-900">{loyaltyData.availablePoints}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Used Points</p>
                    <p className="text-2xl font-semibold text-gray-900">{loyaltyData.usedPoints}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tier Level</p>
                    <p className="text-2xl font-semibold text-gray-900">{loyaltyData.tierLevel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tier Progress */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tier Progress</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Progress to Platinum</span>
                <span className="text-sm font-medium text-gray-900">{loyaltyData.nextTierPoints} points needed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${((3000 - loyaltyData.nextTierPoints) / 3000) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Points History */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Points History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loyaltyData.pointsHistory.map((history) => (
                      <tr key={history.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(history.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {history.type === 'earned' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Earned
                            </span>
                          )}
                          {history.type === 'redeemed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Redeemed
                            </span>
                          )}
                          {history.type === 'bonus' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Bonus
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {history.points > 0 ? '+' : ''}{history.points}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {history.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {history.orderId || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTag ? 'Edit Tag' : 'Create Tag'}
              </h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={tagForm.name}
                  onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter tag name"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (tagForm.name.trim()) {
                    setConfirmationAction(editingTag ? 'save-tag' : 'create-tag');
                    setPendingAction({ ...tagForm, id: editingTag?.id });
                    setShowConfirmationModal(true);
                    setConfirmationComment('');
                  }
                }}
                disabled={!tagForm.name.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300"
              >
                {editingTag ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preference Modal */}
      {showPreferenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingPreference ? 'Edit Preference' : 'Create Preference'}
              </h3>
              <button
                onClick={() => setShowPreferenceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kitchen Name
                </label>
                <select
                  value={selectedKitchen}
                  onChange={(e) => {
                    setSelectedKitchen(e.target.value);
                    setPreferenceForm({ ...preferenceForm, kitchen: e.target.value, dishes: [] });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Kitchen</option>
                  {mockKitchens.map((kitchen) => (
                    <option key={kitchen.id} value={kitchen.name}>
                      {kitchen.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedKitchen && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Dishes
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {mockKitchens
                      .find(k => k.name === selectedKitchen)?.dishes
                      .map((dish) => (
                        <label key={dish.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferenceForm.dishes.includes(dish.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPreferenceForm({
                                  ...preferenceForm,
                                  dishes: [...preferenceForm.dishes, dish.name]
                                });
                              } else {
                                setPreferenceForm({
                                  ...preferenceForm,
                                  dishes: preferenceForm.dishes.filter(d => d !== dish.name)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{dish.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Orders
                </label>
                <input
                  type="number"
                  value={preferenceForm.orderCount}
                  onChange={(e) => setPreferenceForm({ ...preferenceForm, orderCount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter number of orders"
                  min="1"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPreferenceModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (preferenceForm.kitchen && preferenceForm.dishes.length > 0 && preferenceForm.orderCount) {
                    setConfirmationAction(editingPreference ? 'save-preference' : 'create-preference');
                    setPendingAction({ ...preferenceForm, id: editingPreference?.id });
                    setShowConfirmationModal(true);
                    setConfirmationComment('');
                  }
                }}
                disabled={!preferenceForm.kitchen || preferenceForm.dishes.length === 0 || !preferenceForm.orderCount}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300"
              >
                {editingPreference ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingNote ? 'Edit Note' : 'Create Note'}
              </h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={noteForm.category}
                    onChange={(e) => {
                      setNoteForm({ ...noteForm, category: e.target.value, subcategory: '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Category</option>
                    {Object.keys(categoriesData).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory
                  </label>
                  <select
                    value={noteForm.subcategory}
                    onChange={(e) => setNoteForm({ ...noteForm, subcategory: e.target.value })}
                    disabled={!noteForm.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Subcategory</option>
                    {noteForm.category && categoriesData[noteForm.category]?.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="space-y-2">
                  <div className="flex">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && currentTag.trim()) {
                          e.preventDefault();
                          if (!noteForm.tags.includes(currentTag.trim())) {
                            setNoteForm({
                              ...noteForm,
                              tags: [...noteForm.tags, currentTag.trim()]
                            });
                          }
                          setCurrentTag('');
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (currentTag.trim() && !noteForm.tags.includes(currentTag.trim())) {
                          setNoteForm({
                            ...noteForm,
                            tags: [...noteForm.tags, currentTag.trim()]
                          });
                          setCurrentTag('');
                        }
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  {noteForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {noteForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setNoteForm({
                                ...noteForm,
                                tags: noteForm.tags.filter((_, i) => i !== index)
                              });
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  rows={4}
                  value={noteForm.note}
                  onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your note here..."
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={noteForm.isPrivate}
                    onChange={(e) => setNoteForm({ ...noteForm, isPrivate: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Private Note</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (noteForm.category && noteForm.subcategory && noteForm.note.trim()) {
                    setConfirmationAction(editingNote ? 'save-note' : 'create-note');
                    setPendingAction({ ...noteForm, id: editingNote?.id });
                    setShowConfirmationModal(true);
                    setConfirmationComment('');
                  }
                }}
                disabled={!noteForm.category || !noteForm.subcategory || !noteForm.note.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300"
              >
                {editingNote ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Note Modal */}
      {showViewNoteModal && viewingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">View Note</h3>
              <button
                onClick={() => setShowViewNoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-sm text-gray-900">{viewingNote.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <p className="text-sm text-gray-900">{viewingNote.subcategory}</p>
                </div>
              </div>
              
              {viewingNote.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {viewingNote.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewingNote.note}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
                  {viewingNote.isPrivate ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Private
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Public
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-sm text-gray-900">{new Date(viewingNote.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewNoteModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <ConfirmationModal
          isOpen={showConfirmationModal}
          title={getConfirmationTitle()}
          message={getConfirmationMessage()}
          confirmText={getConfirmationText()}
          cancelText="Cancel"
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setShowConfirmationModal(false);
            setConfirmationAction('');
            setPendingAction(null);
            setConfirmationComment('');
          }}
          comment={confirmationComment}
          onCommentChange={setConfirmationComment}
          variant={confirmationAction.includes('delete') ? 'danger' : 'primary'}
        />
      )}
    
}

  // Helper functions for confirmation modal
  function getConfirmationTitle() {
    switch (confirmationAction) {
      case 'create-tag': return 'Create Tag';
      case 'save-tag': return 'Update Tag';
      case 'delete-tag': return 'Delete Tag';
      case 'create-preference': return 'Create Preference';
      case 'save-preference': return 'Update Preference';
      case 'delete-preference': return 'Delete Preference';
      case 'create-note': return 'Create Note';
      case 'save-note': return 'Update Note';
      case 'delete-note': return 'Delete Note';
      default: return 'Confirm Action';
    }
  }

  function getConfirmationMessage() {
    switch (confirmationAction) {
      case 'create-tag': return `Are you sure you want to create the tag "${pendingAction?.name}"?`;
      case 'save-tag': return `Are you sure you want to update the tag "${pendingAction?.name}"?`;
      case 'delete-tag': return `Are you sure you want to delete the tag "${pendingAction?.name}"? This action cannot be undone.`;
      case 'create-preference': return `Are you sure you want to create this preference for "${pendingAction?.kitchen}"?`;
      case 'save-preference': return `Are you sure you want to update this preference for "${pendingAction?.kitchen}"?`;
      case 'delete-preference': return `Are you sure you want to delete the preference for "${pendingAction?.kitchen}"? This action cannot be undone.`;
      case 'create-note': return `Are you sure you want to create this note for "${pendingAction?.category}" - "${pendingAction?.subcategory}"?`;
      case 'save-note': return `Are you sure you want to update this note for "${pendingAction?.category}" - "${pendingAction?.subcategory}"?`;
      case 'delete-note': return `Are you sure you want to delete the note for "${pendingAction?.category}" - "${pendingAction?.subcategory}"? This action cannot be undone.`;
      default: return 'Are you sure you want to perform this action?';
    }
  }

  function getConfirmationText() {
    switch (confirmationAction) {
      case 'create-tag': return 'Create Tag';
      case 'save-tag': return 'Update Tag';
      case 'delete-tag': return 'Delete Tag';
      case 'create-preference': return 'Create Preference';
      case 'save-preference': return 'Update Preference';
      case 'delete-preference': return 'Delete Preference';
      case 'create-note': return 'Create Note';
      case 'save-note': return 'Update Note';
      case 'delete-note': return 'Delete Note';
      default: return 'Confirm';
    }
  }

  function handleConfirmAction() {
    if (!confirmationComment.trim()) return;

    switch (confirmationAction) {
      case 'create-tag':
        setTags(prev => [...prev, {
          id: Date.now(),
          name: pendingAction.name,
          createdAt: new Date().toISOString().split('T')[0]
        }]);
        setShowTagModal(false);
        break;
        
      case 'save-tag':
        setTags(prev => prev.map(tag => 
          tag.id === pendingAction.id 
            ? { ...tag, name: pendingAction.name }
            : tag
        ));
        setShowTagModal(false);
        break;
        
      case 'delete-tag':
        setTags(prev => prev.filter(tag => tag.id !== pendingAction.id));
        break;
        
      case 'create-preference':
        setPreferences(prev => [...prev, {
          id: Date.now(),
          kitchen: pendingAction.kitchen,
          dishes: pendingAction.dishes,
          orderCount: parseInt(pendingAction.orderCount),
          createdAt: new Date().toISOString().split('T')[0]
        }]);
        setShowPreferenceModal(false);
        break;
        
      case 'save-preference':
        setPreferences(prev => prev.map(pref => 
          pref.id === pendingAction.id 
            ? {
                ...pref,
                kitchen: pendingAction.kitchen,
                dishes: pendingAction.dishes,
                orderCount: parseInt(pendingAction.orderCount)
              }
            : pref
        ));
        setShowPreferenceModal(false);
        break;
        
      case 'delete-preference':
        setPreferences(prev => prev.filter(pref => pref.id !== pendingAction.id));
        break;
        
      case 'create-note':
        setNotes(prev => [...prev, {
          id: Date.now(),
          category: pendingAction.category,
          subcategory: pendingAction.subcategory,
          tags: pendingAction.tags,
          note: pendingAction.note,
          isPrivate: pendingAction.isPrivate,
          createdAt: new Date().toISOString().split('T')[0]
        }]);
        setShowNoteModal(false);
        break;
        
      case 'save-note':
        setNotes(prev => prev.map(note => 
          note.id === pendingAction.id 
            ? {
                ...note,
                category: pendingAction.category,
                subcategory: pendingAction.subcategory,
                tags: pendingAction.tags,
                note: pendingAction.note,
                isPrivate: pendingAction.isPrivate
              }
            : note
        ));
        setShowNoteModal(false);
        break;
        
      case 'delete-note':
        setNotes(prev => prev.filter(note => note.id !== pendingAction.id));
        break;
    }

    setShowConfirmationModal(false);
    setConfirmationAction('');
    setPendingAction(null);
    setConfirmationComment('');
  }
}
export default CustomerDetail;
