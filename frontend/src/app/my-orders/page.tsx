/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
// import { usePincode } from '@/context/PincodeContext';
// import Header from '@/components/Header';
import Image from 'next/image';
import api from '@/services/api';

// Define proper Order type based on API structure
interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: number;
  attributes: {
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    items: OrderItem[];
    // Add other order attributes as needed
  };
  createdAt: string;
}

export default function MyOrdersPage() {
  const { isAuthenticated, user } = useAuth();
  // const { pincode, isServiceable, deliveryMessage, updatePincode } = usePincode();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const statusMap: { [key: string]: string } = {
    'pending': 'Pending',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
  };
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      window.dispatchEvent(new Event('open-auth-popup'));
      router.push('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        if (user && user.id) {
          const fetchedOrders = await api.fetchOrdersByUserId(Number(user.id));
          setOrders(fetchedOrders);
        } else {
          setError("User ID not found");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, router]);

  const toggleOrderDetails = (orderId: number) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  return (
    <>
      {/* <Header 
        pincode={pincode}
        isServiceable={isServiceable}
        deliveryMessage={deliveryMessage}
        onPincodeChange={updatePincode}
      /> */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

          {loading ? (
            <p>Loading orders...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div
                    className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer"
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-800">Order #{order.id}</h3>
                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                          order.attributes.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {statusMap[order.attributes.status] || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Ordered on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-2 sm:mt-0 flex items-center">
                      <span className="font-medium text-gray-800 mr-3">₹{order.attributes.total}</span>
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
                        {order.attributes.items.map((item) => (
                          <div key={item.productId} className="flex items-center">
                            <div className="w-16 h-16 rounded-lg bg-white p-1 border border-gray-200 flex-shrink-0 overflow-hidden relative">
                              <Image
                                src={item.image || 'https://via.placeholder.com/80'}
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
              <button 
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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