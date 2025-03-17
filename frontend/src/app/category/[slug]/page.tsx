'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchCategoryBySlugAndPincode, fetchCategories } from '../../../services/api';

export default function CategoryPage({ params }: { params: any }) {
  // Unwrap params using React.use() as recommended by Next.js
  const resolvedParams = React.use(params) as { slug: string };
  const slug = resolvedParams.slug;
  
  const [category, setCategory] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [notification, setNotification] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [pincode, setPincode] = useState<string | null>(null);
  const [isServiceable, setIsServiceable] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);

  // Load pincode from localStorage
  useEffect(() => {
    const savedPincode = localStorage.getItem('pincode');
    if (savedPincode) {
      setPincode(savedPincode);
    }
  }, []);

  // Fetch category data when slug or pincode changes
  useEffect(() => {
    const getCategory = async () => {
      try {
        setIsLoading(true);
        
        if (!pincode) {
          // If no pincode is set, fetch all categories for the sidebar
          const categoriesData = await fetchCategories();
          setAllCategories(categoriesData.data || []);
          
          // Set error for no pincode
          setError('Please set your delivery location to see products in this category.');
          setIsLoading(false);
          return;
        }
        
        // Fetch category with products filtered by pincode
        const result = await fetchCategoryBySlugAndPincode(slug, pincode);
        
        if (!result.available) {
          setError(`Sorry, we don't deliver to ${pincode} yet.`);
          setIsServiceable(false);
        } else {
          setIsServiceable(true);
          setDeliveryMessage(result.deliveryMessage);
          
          if (!result.category) {
            setError('Category not found.');
          } else {
            setCategory(result.category);
            setError(null);
          }
        }
        
        // Fetch all categories for the sidebar
        const categoriesData = await fetchCategories();
        setAllCategories(categoriesData.data || []);
        
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    getCategory();
  }, [slug, pincode]);

  // Hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({show: false, message: ''});
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Function to show notification
  const showNotification = (message: string) => {
    setNotification({
      show: true,
      message
    });
  };

  // Function to handle pincode change
  const handlePincodeChange = (newPincode: string, newIsServiceable: boolean, newDeliveryMessage: string) => {
    setPincode(newPincode);
    setIsServiceable(newIsServiceable);
    setDeliveryMessage(newDeliveryMessage);
    localStorage.setItem('pincode', newPincode);
  };

  if (isLoading) {
    return (
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
    );
  }

  // If no pincode is set, show a message to set pincode
  if (!pincode) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Set Your Delivery Location</h2>
          <p className="text-yellow-700 mb-4">
            Please set your delivery location to see products available in your area.
          </p>
          <button
            onClick={() => {
              // Trigger pincode popup (you'll need to implement this)
              const event = new CustomEvent('open-pincode-popup');
              window.dispatchEvent(event);
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Set Location
          </button>
        </div>
        
        {/* Show all categories anyway */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Browse Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allCategories.map((cat) => (
              <Link 
                key={cat.id}
                href={`/category/${cat.attributes?.slug || ''}`}
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-800">{cat.attributes?.name || 'Category'}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If pincode is not serviceable, show a message
  if (!isServiceable) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Delivery Not Available</h2>
          <p className="text-red-700 mb-4">
            Sorry, we don't deliver to {pincode} yet. Please try a different pincode.
          </p>
          <button
            onClick={() => {
              // Trigger pincode popup (you'll need to implement this)
              const event = new CustomEvent('open-pincode-popup');
              window.dispatchEvent(event);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Change Location
          </button>
        </div>
        
        {/* Show all categories anyway */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Browse Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allCategories.map((cat) => (
              <Link 
                key={cat.id}
                href={`/category/${cat.attributes?.slug || ''}`}
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-800">{cat.attributes?.name || 'Category'}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p className="text-red-500 mb-4">{error || 'Category not found'}</p>
        <Link href="/" className="text-blue-600 hover:text-blue-500">
          Return to Home
        </Link>
      </div>
    );
  }

  // Safely access attributes and handle potential undefined values
  const attributes = category.attributes || {};
  const name = attributes.name || 'Category';
  const description = attributes.description || '';
  const productsList = attributes.products?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
          {notification.message}
        </div>
      )}
      
      {/* Delivery info */}
      {isServiceable && deliveryMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700 text-sm">
              <span className="font-medium">Delivering to {pincode}:</span> {deliveryMessage}
            </p>
          </div>
        </div>
      )}
      
      {/* Breadcrumb */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
          </li>
          <li>
            <span className="text-gray-500 mx-2">/</span>
          </li>
          <li>
            <span className="text-gray-900 font-medium">{name}</span>
          </li>
        </ol>
      </nav>

      {/* Mobile filter button */}
      <div className="md:hidden mb-4">
        <button
          type="button"
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Categories
        </button>
      </div>

      {/* Category title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar - Categories */}
        <div className={`${isMobileFiltersOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-gray-50 rounded-lg p-4 mb-4 md:mb-0`}>
          <h2 className="text-lg font-medium text-gray-900 mb-3">Categories</h2>
          <ul className="space-y-2">
            {allCategories.map((cat) => (
              <li key={cat.id}>
                <Link 
                  href={`/category/${cat.attributes?.slug || ''}`}
                  className={`block text-sm ${cat.id === category.id ? 'font-semibold text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                >
                  {cat.attributes?.name || 'Category'}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Products grid */}
        <div className="flex-1">
          {productsList.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No products found in this category for your location.</p>
              <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
                Browse other categories
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {productsList.map((product: any) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  showNotification={showNotification}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline ProductCard component to ensure it matches our current data structure
function ProductCard({ product, showNotification }: { product: any, showNotification: (message: string) => void }) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [quantity, setQuantity] = useState(0);
  
  // Get cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const existingItem = parsedCart.find((item: any) => item.id === product.id);
        if (existingItem) {
          setQuantity(existingItem.quantity);
        }
      } catch (e) {
        console.error('Error parsing saved cart:', e);
      }
    }
  }, [product.id]);
  
  const getProductImageUrl = (product: any): string | null => {
    // Check for image in attributes structure (from API)
    if (product.attributes?.image?.data?.attributes?.url) {
      return product.attributes.image.data.attributes.url;
    }
    
    // Check for direct image URL (from direct object)
    if (product.image?.url) {
      return product.image.url;
    }
    
    // Check for images array
    if (product.attributes?.images?.data?.[0]?.attributes?.url) {
      return product.attributes.images.data[0].attributes.url;
    }
    
    // If no image is found
    return null;
  };
  
  const handleImageLoad = () => {
    setImageStatus('loaded');
  };

  const handleImageError = () => {
    setImageStatus('error');
  };
  
  const addToCart = () => {
    const imageUrl = getProductImageUrl(product);
    const attributes = product.attributes || {};
    const productName = attributes.name || 'Product';
    
    // Get current cart
    const savedCart = localStorage.getItem('cart');
    let currentCart = [];
    if (savedCart) {
      try {
        currentCart = JSON.parse(savedCart);
      } catch (e) {
        console.error('Error parsing saved cart:', e);
      }
    }
    
    // Check if product is already in cart
    const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Product already in cart, increment quantity
      currentCart[existingItemIndex].quantity += 1;
      showNotification(`Added 1 more ${productName} to cart (${currentCart[existingItemIndex].quantity})`);
    } else {
      // Add new product to cart
      const newItem = {
        id: product.id,
        name: productName,
        price: attributes.sellingPrice || attributes.price || 0,
        quantity: 1,
        image: imageUrl || undefined,
        slug: attributes.slug || ''
      };
      currentCart.push(newItem);
      showNotification(`Added ${productName} to cart`);
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(currentCart));
    setQuantity(quantity + 1);
    
    // Dispatch custom event for cart update
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };
  
  const updateQuantity = (newQuantity: number) => {
    // Get current cart
    const savedCart = localStorage.getItem('cart');
    let currentCart = [];
    if (savedCart) {
      try {
        currentCart = JSON.parse(savedCart);
      } catch (e) {
        console.error('Error parsing saved cart:', e);
      }
    }
    
    const productName = product.attributes?.name || 'Product';
    
    if (newQuantity <= 0) {
      // Remove item from cart
      const updatedCart = currentCart.filter((item: any) => item.id !== product.id);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      showNotification(`Removed ${productName} from cart`);
    } else {
      // Update quantity
      const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id);
      if (existingItemIndex >= 0) {
        currentCart[existingItemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(currentCart));
        showNotification(`Updated ${productName} quantity (${newQuantity})`);
      }
    }
    
    setQuantity(newQuantity);
    
    // Dispatch custom event for cart update
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };
  
  const imageUrl = getProductImageUrl(product);
  const attributes = product.attributes || {};
  const price = attributes.sellingPrice || attributes.price || 0;
  const mrp = attributes.mrp || price;
  const productName = attributes.name || 'Product';
  const productSlug = attributes.slug || '';
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
      {/* Image section with link to product detail */}
      <Link href={`/product/${productSlug}`} className="block">
        <div className="relative h-28 sm:h-32 w-full bg-gray-200">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={productName}
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                className="object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
                unoptimized={true} // Skip Next.js image optimization for external URLs
              />
              {imageStatus === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-80">
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {imageStatus === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-2 sm:p-3">
        {/* Product name with link */}
        <Link href={`/product/${productSlug}`} className="block">
          <h3 className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 h-10">
            {productName}
          </h3>
        </Link>
        
        <div className="mt-1 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-gray-900">
              ₹{price}
            </span>
            {mrp > price && (
              <span className="ml-1 text-xs text-gray-500 line-through">
                ₹{mrp}
              </span>
            )}
          </div>
          {mrp > price && (
            <span className="text-xs text-green-600 font-medium">
              {Math.round((1 - price / mrp) * 100)}% off
            </span>
          )}
        </div>
        
        {/* Cart Controls */}
        <div className="mt-2">
          {quantity === 0 ? (
            // Add to Cart Button
            <button
              onClick={addToCart}
              className="w-full py-1 px-2 rounded-lg text-xs font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add
            </button>
          ) : (
            // Quantity Controls
            <div className="flex items-center justify-between border border-gray-300 rounded-lg overflow-hidden">
              <button 
                onClick={() => updateQuantity(quantity - 1)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm"
              >
                -
              </button>
              <span className="px-2 py-1 bg-white text-center text-sm w-full">
                {quantity}
              </span>
              <button 
                onClick={() => updateQuantity(quantity + 1)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 