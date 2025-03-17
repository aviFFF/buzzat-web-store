'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { addToCart, getCartItems, CartItem } from '@/utils/cartUtils';

export default function ProductCategoryPage({ params }: { params: { categoryName: string } }) {
  // Access params safely
  const categoryName = params?.categoryName ? decodeURIComponent(params.categoryName) : '';
  const router = useRouter();
  
  const [category, setCategory] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [pincode, setPincode] = useState<string | null>(null);
  const [isServiceable, setIsServiceable] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load pincode from localStorage
  useEffect(() => {
    const savedPincode = localStorage.getItem('pincode');
    if (savedPincode) {
      setPincode(savedPincode);
    }
    
    // Load cart items
    setCartItems(getCartItems());
  }, []);

  // Hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch category data when slug or pincode changes
  useEffect(() => {
    const getCategory = async () => {
      try {
        setIsLoading(true);
        
        if (!pincode) {
          // If no pincode is set, fetch all categories for the sidebar
          const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/categories?populate=*`);
          
          if (!categoriesResponse.ok) {
            throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`);
          }
          
          const categoriesData = await categoriesResponse.json();
          setAllCategories(categoriesData.data || []);
          
          // Set error for no pincode
          setError('Please set your delivery location to see products in this category.');
          setIsLoading(false);
          return;
        }
        
        // Fetch category with products directly from API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/categories?filters[name][$eq]=${encodeURIComponent(categoryName)}&populate[products][populate]=*`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch category: ${response.status}`);
        }
        
        const data = await response.json();
        const categoryData = data.data?.[0] || null;
        
        if (!categoryData) {
          setError('Category not found.');
        } else {
          console.log('Category data:', categoryData);
          setCategory(categoryData);
          setError(null);
          
          // Check if the area is serviceable
          setIsServiceable(true);
          setDeliveryMessage('Delivery available in 30-60 minutes');
        }
        
        // Fetch all categories for the sidebar
        const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/categories?populate=*`);
        
        if (!categoriesResponse.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`);
        }
        
        const categoriesData = await categoriesResponse.json();
        setAllCategories(categoriesData.data || []);
        
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    getCategory();
  }, [categoryName, pincode]);

  // Function to show notification
  const showNotification = (message: string) => {
    setNotification(message);
  };

  // Function to handle pincode change
  const handlePincodeChange = (newPincode: string, newIsServiceable: boolean, newDeliveryMessage: string) => {
    setPincode(newPincode);
    setIsServiceable(newIsServiceable);
    setDeliveryMessage(newDeliveryMessage);
    localStorage.setItem('pincode', newPincode);
  };

  // Function to add product to cart
  const handleAddToCart = (product: any) => {
    if (!product || !product.attributes) return;
    
    const cartItem: CartItem = {
      id: product.id,
      name: product?.attributes?.name || 'Product',
      price: product?.attributes?.price || 0,
      quantity: 1,
      image: product?.attributes?.image?.data?.attributes?.url 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${product.attributes.image.data.attributes.url}`
        : '',
      slug: product?.attributes?.slug || ''
    };

    addToCart(cartItem);
    setCartItems(getCartItems());
    showNotification(`Added ${product?.attributes?.name || 'Product'} to cart`);
  };

  if (isLoading) {
    return (
      <>
        <Header 
          pincode={pincode}
          isServiceable={isServiceable}
          deliveryMessage={deliveryMessage || ''}
          onPincodeChange={handlePincodeChange}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar skeleton */}
              <div className="hidden md:block w-full md:w-64 bg-gray-100 rounded-lg p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                ))}
              </div>
              
              {/* Products grid skeleton */}
              <div className="flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-gray-100 rounded-lg overflow-hidden">
                      <div className="h-32 bg-gray-200"></div>
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        pincode={pincode}
        isServiceable={isServiceable}
        deliveryMessage={deliveryMessage || ''}
        onPincodeChange={handlePincodeChange}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Notification */}
        {notification && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out">
            {notification}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row">
          {/* Categories Sidebar */}
          <div className="w-full md:w-1/4 md:pr-4">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <h2 className="text-lg font-semibold mb-3">Categories</h2>
              <ul className="space-y-2">
                {allCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link 
                      href={`/products-category/${cat?.attributes?.name || ''}`}
                      className={`block px-3 py-2 rounded-md text-sm ${
                        cat?.attributes?.name === categoryName 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {cat?.attributes?.name || 'Category'}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <h1 className="text-2xl font-bold mb-4">{categoryName}</h1>
            
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : category && category.attributes?.products?.data?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.attributes.products.data.map((product: any) => (
                  <div key={product.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <Link href={`/product/${product?.attributes?.slug || ''}`}>
                      <div className="relative h-48 mb-2">
                        {product?.attributes?.image?.data?.attributes?.url ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${product.attributes.image.data.attributes.url}`}
                            alt={product?.attributes?.name || 'Product'}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{product?.attributes?.name || 'Product'}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product?.attributes?.description?.substring(0, 100) || ''}...</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">₹{product?.attributes?.price || 0}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No products found in this category.</p>
                <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
                  Browse other categories
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 