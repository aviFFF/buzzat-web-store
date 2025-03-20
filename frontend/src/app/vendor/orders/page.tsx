/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns'

// Mock order data
const initialOrders = [
  {
    id: 1,
    customer: 'John Doe',
    date: '2023-03-10T10:30:00',
    total: 45.97,
    status: 'pending',
    items: [
      { id: 1, name: 'Fresh Apples', quantity: 2, price: 2.99 },
      { id: 2, name: 'Organic Milk', quantity: 1, price: 3.49 },
      { id: 3, name: 'Whole Wheat Bread', quantity: 2, price: 2.29 },
      { id: 4, name: 'Chicken Breast', quantity: 1, price: 5.99 }
    ]
  },
  {
    id: 2,
    customer: 'Jane Smith',
    date: '2023-03-10T09:15:00',
    total: 32.45,
    status: 'processing',
    items: [
      { id: 5, name: 'Bananas', quantity: 1, price: 1.99 },
      { id: 6, name: 'Yogurt', quantity: 2, price: 4.49 },
      { id: 7, name: 'Pasta', quantity: 1, price: 1.99 }
    ]
  },
  {
    id: 3,
    customer: 'Robert Johnson',
    date: '2023-03-09T16:45:00',
    total: 78.32,
    status: 'shipped',
    items: [
      { id: 8, name: 'Salmon Fillet', quantity: 1, price: 12.99 },
      { id: 9, name: 'Rice', quantity: 1, price: 3.49 },
      { id: 10, name: 'Olive Oil', quantity: 1, price: 8.99 }
    ]
  }
];

export default function VendorOrders() {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const router = useRouter();

  // Check if vendor is logged in
  useEffect(() => {
    const storedVendorInfo = localStorage.getItem('vendorInfo');
    if (!storedVendorInfo) {
      toast.error('Please login to access the vendor dashboard');
      router.push('/vendor');
      return;
    }

    try {
      const parsedVendorInfo = JSON.parse(storedVendorInfo);
      setVendorInfo(parsedVendorInfo);
    } catch (error) {
      console.error('Error parsing vendor info:', error);
      handleLogout();
    }
  }, [router]);

  // Simulate receiving a new order notification
  useEffect(() => {
    const timer = setTimeout(() => {
      const newOrder = {
        id: 4,
        customer: 'Emily Wilson',
        date: new Date().toISOString(),
        total: 53.75,
        status: 'pending',
        items: [
          { id: 11, name: 'Fresh Oranges', quantity: 2, price: 3.99 },
          { id: 12, name: 'Cheese', quantity: 1, price: 5.49 },
          { id: 13, name: 'Cereal', quantity: 1, price: 4.29 }
        ]
      };

      setOrders(prev => [newOrder, ...prev]);
      setNotifications(prev => [`New order #${newOrder.id} from ${newOrder.customer}`, ...prev]);
      setShowNotification(true);

      // Hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }, 10000); // Show notification after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    setNotifications(prev => [`Order #${orderId} status updated to ${newStatus}`, ...prev]);
    setShowNotification(true);

    // Hide notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const handleLogout = () => {
    // Clear vendor info from localStorage
    const data = ['vendorInfo', 'token'];
    data.forEach(item => localStorage.removeItem(item));

    // Show success message
    toast.success('Logged out successfully');

    // Redirect to vendor login page
    router.replace('/vendor');
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          {vendorInfo && (
            <p className="mt-1 text-sm text-gray-500">
              Logged in as: {vendorInfo.name} ({vendorInfo.phone})
            </p>
          )}
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/vendor/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Dashboard
          </Link>
          <Link
            href="/vendor/products"
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Products
          </Link>
          <button
            onClick={handleLogout}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Notification */}
      {showNotification && notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notifications[0]}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setShowNotification(false)}
                  className="inline-flex text-white focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {orders.map((order) => (
            <li key={order.id}>
              <div className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        Order #{order.id}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <button
                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {order.customer}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>
                        {/* {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()} */}
                        {format(new Date(order.date), 'dd/MM/yyyy')} at {format(new Date(order.date), 'HH:mm')}

                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {selectedOrder === order.id && (
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Items</dt>
                        <dd className="mt-1">
                          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                            {order.items.map((item) => (
                              <li key={item.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                <div className="w-0 flex-1 flex items-center">
                                  <span className="ml-2 flex-1 w-0 truncate">
                                    {item.name} x {item.quantity}
                                  </span>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                        <dd className="mt-1 text-sm text-gray-900">${order.total.toFixed(2)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Update Status</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Notifications History */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Notification History</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 bg-white shadow overflow-hidden sm:rounded-md">
            {notifications.map((notification
              , index) => (
              <li key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">{notification}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 