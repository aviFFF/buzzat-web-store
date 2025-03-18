'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Image from 'next/image';

// Sample order data
const sampleOrders = [
  {
    id: 'ORD123456',
    date: '15 Jun 2023',
    status: 'Delivered',
    total: 450,
    items: [
      {
        id: 1,
        name: 'Organic Tomatoes',
        price: 80,
        quantity: 2,
        image: 'https://via.placeholder.com/80'
      },
      {
        id: 2,
        name: 'Fresh Spinach Bundle',
        price: 45,
        quantity: 1,
        image: 'https://via.placeholder.com/80'
      },
      {
        id: 3,
        name: 'Brown Eggs (6 pcs)',
        price: 85,
        quantity: 1,
        image: 'https://via.placeholder.com/80'
      }
    ]
  },
  {
    id: 'ORD123455',
    date: '10 Jun 2023',
    status: 'Delivered',
    total: 320,
    items: [
      {
        id: 4,
        name: 'Whole Wheat Bread',
        price: 45,
        quantity: 1,
        image: 'https://via.placeholder.com/80'
      },
      {
        id: 5,
        name: 'Organic Milk 1L',
        price: 65,
        quantity: 2,
        image: 'https://via.placeholder.com/80'
      }
    ]
  }
];

export default function MyOrdersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Dispatch event to open auth popup
      window.dispatchEvent(new Event('open-auth-popup'));
      // Redirect to home
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  // Default pincode state for Header
  const [pincode, setPincode] = useState<string | null>('110001');
  const [isServiceable, setIsServiceable] = useState(true);
  const [deliveryMessage, setDeliveryMessage] = useState('Delivery available');
  
  const handlePincodeChange = (newPincode: string, newIsServiceable: boolean, newMessage: string) => {
    setPincode(newPincode);
    setIsServiceable(newIsServiceable);
    setDeliveryMessage(newMessage);
  };
  
  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };
  
  return (
    <>
      <Header 
        pincode={pincode}
        isServiceable={isServiceable}
        deliveryMessage={deliveryMessage}
        onPincodeChange={handlePincodeChange}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
          
          {sampleOrders.length > 0 ? (
            <div className="space-y-4">
              {sampleOrders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div 
                    className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer"
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-800">{order.id}</h3>
                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                          order.status === 'Delivered' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Ordered on {order.date}</p>
                    </div>
                    
                    <div className="mt-2 sm:mt-0 flex items-center">
                      <span className="font-medium text-gray-800 mr-3">₹{order.total}</span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Order Details */}
                  {expandedOrder === order.id && (
                    <div className="p-4 bg-gray-50 animate-fade-in">
                      <h4 className="font-medium text-gray-700 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center">
                            <div className="w-16 h-16 rounded-lg bg-white p-1 border border-gray-200 flex-shrink-0 overflow-hidden relative">
                              <Image 
                                src={item.image} 
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-grow">
                              <h5 className="font-medium text-gray-800">{item.name}</h5>
                              <div className="flex justify-between mt-1">
                                <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                                <span className="text-blue-600 font-medium">₹{item.price * item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">₹{order.total - 40}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Delivery Fee</span>
                          <span className="font-medium">₹40</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>₹{order.total}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Reorder
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
              <button 
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
} 