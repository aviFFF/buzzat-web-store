'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCartItems, getCartTotals, clearCart, CartItem } from '@/utils/cartUtils';
import { toast } from 'sonner';
import { createOrder } from '@/services/api';
import { data } from 'framer-motion/client';

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotals, setCartTotals] = useState({
    totalItems: 0,
    subtotal: 0,
    deliveryFee: 40,
    total: 0
  });
  
  // Address state
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // Default pincode state for Header
  const [pincode, setPincode] = useState<string | null>('110001');
  const [isServiceable, setIsServiceable] = useState(true);
  const [deliveryMessage, setDeliveryMessage] = useState('Delivery available');
  
  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Dispatch event to open auth popup
      window.dispatchEvent(new Event('open-auth-popup'));
      // Redirect to home
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  // Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      const items = getCartItems();
      if (items.length === 0) {
        // Redirect to home if cart is empty
        router.push('/');
        return;
      }
      
      setCartItems(items);
      setCartTotals(getCartTotals());
    };
    
    loadCart();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCart();
    };
    
    window.addEventListener('cart-updated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [router]);
  
  // Pre-fill address with user data if available
  useEffect(() => {
    if (user) {
      // Try to get additional user profile data from localStorage
      const userProfile = localStorage.getItem('userProfile');
      const profileData = userProfile ? JSON.parse(userProfile) : null;
      
      setAddress(prev => ({
        ...prev,
        name: profileData?.name || user.name || user.username || '',
        phone: profileData?.phone || user.phone || '',
      }));
    }
  }, [user]);
  
  useEffect(() => {
    console.log('Checkout page - Current user:', user);
    console.log('User has JWT:', !!getAuthToken());
  }, [user]);
  
  const handlePincodeChange = (newPincode: string, newIsServiceable: boolean, newMessage: string) => {
    setPincode(newPincode);
    setIsServiceable(newIsServiceable);
    setDeliveryMessage(newMessage);
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add a helper function to get the token
  const getAuthToken = () => {
    // First try to get it from localStorage directly
    const token = localStorage.getItem('token');
    if (token) return token;
    
    // If not found, try to get it from the user object
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.jwt || null;
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
    
    return null;
  };

  // Then in your component:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Format cart items for the order
      const productIds = cartItems.map(item => item.id);
      
      console.log('productIds:', productIds);
      // Create order data object - only include fields that exist in Strapi
      const orderData = {
        name: address.name,
        email: user?.email || '',
        phone: address.phone,
        pincode: address.pincode,
        address: address.street,
        city: address.city,
        totalOrderValue: cartTotals.total,
        userid: user?.id ? Number(user.id) : undefined,
        DeliveryStatus: 'Pending',
        products: productIds,
        payment_id: paymentMethod === 'cod' ? 'COD' : 'ONLINE_PENDING',
        paymentMethod: paymentMethod // Add the missing property
      };
      
      console.log('Submitting order with user:', user);
      console.log('Payment method (stored locally):', paymentMethod);
      
      // Call the API to create the order
      const result = await createOrder(orderData);
      
      if (result.success) {
        // If it's a COD order, we can store that information locally
        if (paymentMethod === 'cod') {
          // Store the order with payment method in localStorage
          const myOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
          myOrders.push({
            orderId: result.order.id,
            paymentMethod: 'cod',
            date: new Date().toISOString(),
            amount: cartTotals.total
          });
          localStorage.setItem('myOrders', JSON.stringify(myOrders));
          
          toast('Cash on Delivery order placed successfully!');
        } else {
          // For online payment
          toast('Order placed successfully!');
        }
        
        // Clear cart
        clearCart();
        
        // Redirect to order confirmation or home
        router.push('/');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast('There was an error placing your order. Please try again.');
    }
  };


  // Render the component
  if (!isAuthenticated || cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>₹{cartTotals.subtotal}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Delivery</span>
                    <span>₹{cartTotals.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{cartTotals.total}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Checkout Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={address.name}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={address.phone}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={address.pincode}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="cod" className="ml-2 block text-sm font-medium text-gray-700">
                      Cash on Delivery
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="online"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="online" className="ml-2 block text-sm font-medium text-gray-700">
                      Online Payment (Credit/Debit Card, UPI, etc.)
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Place Order
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 