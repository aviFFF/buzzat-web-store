'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { fetchProductBySlug, getStrapiMedia, fetchCategories, checkPincodeAvailability } from '../../../services/api';

export default function ProductPage({ params }: { params: any }) {
  // Unwrap params using React.use() as recommended by Next.js
  const resolvedParams = React.use(params) as { slug: string };
  const slug = resolvedParams.slug;
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [relatedCategories, setRelatedCategories] = useState<any[]>([]);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [notification, setNotification] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [pincode, setPincode] = useState<string | null>(null);
  const [isServiceable, setIsServiceable] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
  const [isProductAvailable, setIsProductAvailable] = useState(false);

  // Load pincode from localStorage
  useEffect(() => {
    const savedPincode = localStorage.getItem('pincode');
    if (savedPincode) {
      setPincode(savedPincode);
    }
  }, []);

  useEffect(() => {
    const getProduct = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProductBySlug(slug);
        setProduct(data);
        
        // Fetch categories for sidebar
        const categoriesData = await fetchCategories();
        setRelatedCategories(categoriesData.data || []);
        
        // Check if product is available for the selected pincode
        if (pincode && data) {
          const vendor = data.attributes?.vendor?.data;
          if (vendor && vendor.attributes?.service_pincodes) {
            try {
              const servicePincodes = JSON.parse(vendor.attributes.service_pincodes);
              const isAvailable = servicePincodes.includes(pincode);
              setIsProductAvailable(isAvailable);
              
              if (isAvailable) {
                const pincodeCheck = await checkPincodeAvailability(pincode);
                setIsServiceable(pincodeCheck.available);
                setDeliveryMessage(pincodeCheck.deliveryMessage);
              } else {
                setIsServiceable(false);
              }
            } catch (e) {
              console.error('Error parsing service pincodes:', e);
              setIsProductAvailable(false);
              setIsServiceable(false);
            }
          } else {
            setIsProductAvailable(false);
            setIsServiceable(false);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    getProduct();
  }, [slug, pincode]);

  // Check if product is in cart
  useEffect(() => {
    if (!product) return;
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const existingItem = parsedCart.find((item: any) => item.id === product.id);
        if (existingItem) {
          setCartQuantity(existingItem.quantity);
        }
      } catch (e) {
        console.error('Error parsing saved cart:', e);
      }
    }
  }, [product]);

  // Hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({show: false, message: ''});
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Function to handle pincode change
  const handlePincodeChange = (newPincode: string, newIsServiceable: boolean, newDeliveryMessage: string) => {
    setPincode(newPincode);
    setIsServiceable(newIsServiceable);
    setDeliveryMessage(newDeliveryMessage);
    localStorage.setItem('pincode', newPincode);
  };

  const handleImageLoad = () => {
    setImageStatus('loaded');
  };

  const handleImageError = () => {
    setImageStatus('error');
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
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
    
    const attributes = product.attributes || {};
    const imageUrl = getProductImageUrl(product);
    
    // Check if product is already in cart
    const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Product already in cart, update quantity
      currentCart[existingItemIndex].quantity = cartQuantity + quantity;
      setNotification({
        show: true, 
        message: `Updated quantity in cart (${cartQuantity + quantity})`
      });
    } else {
      // Add new product to cart
      const newItem = {
        id: product.id,
        name: attributes.name,
        price: attributes.sellingPrice || attributes.price,
        quantity: quantity,
        image: imageUrl || undefined,
        slug: attributes.slug
      };
      currentCart.push(newItem);
      setNotification({
        show: true, 
        message: `Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart`
      });
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(currentCart));
    setCartQuantity(cartQuantity + quantity);
    
    // Reset quantity input
    setQuantity(1);
    
    // Dispatch custom event for cart update
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };
  
  const updateCartQuantity = (newQuantity: number) => {
    if (!product) return;
    
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
    
    if (newQuantity <= 0) {
      // Remove item from cart
      const updatedCart = currentCart.filter((item: any) => item.id !== product.id);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setCartQuantity(0);
      setNotification({
        show: true, 
        message: 'Removed from cart'
      });
    } else {
      // Update quantity
      const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id);
      if (existingItemIndex >= 0) {
        currentCart[existingItemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(currentCart));
        setCartQuantity(newQuantity);
        setNotification({
          show: true, 
          message: `Updated quantity (${newQuantity})`
        });
      }
    }
    
    // Dispatch custom event for cart update
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };
  
  const getProductImageUrl = (product: any): string | null => {
    // Check for image in attributes structure (from API)
    if (product.attributes?.image?.data?.attributes?.url) {
      return product.attributes.image.data.attributes.url;
    }
    
    // Check for images array
    if (product.attributes?.images?.data?.[0]?.attributes?.url) {
      return product.attributes.images.data[0].attributes.url;
    }
    
    // If no image is found
    return null;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 aspect-square bg-gray-200 rounded-lg"></div>
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3 mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no pincode is set, show a message to set pincode
  if (!pincode && product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Set Your Delivery Location</h2>
          <p className="text-yellow-700 mb-4">
            Please set your delivery location to see if this product is available in your area.
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
        
        {/* Show product details anyway */}
        {renderProductDetails(false)}
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
        <Link href="/" className="text-blue-600 hover:text-blue-500">
          Return to Home
        </Link>
      </div>
    );
  }

  // If product is not available in the selected pincode
  if (pincode && !isProductAvailable) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Product Not Available</h2>
          <p className="text-red-700 mb-4">
            Sorry, this product is not available for delivery to {pincode}.
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
        
        {/* Show product details anyway */}
        {renderProductDetails(false)}
      </div>
    );
  }

  return renderProductDetails(true);

  // Helper function to render product details
  function renderProductDetails(canAddToCart: boolean) {
    // Safely access attributes and handle potential undefined values
    const attributes = product.attributes || {};
    const name = attributes.name || 'Product';
    const description = attributes.description || '';
    const category = attributes.category || {};
    const price = attributes.sellingPrice || attributes.price || 0;
    const mrp = attributes.mrp || price;
    const stock = attributes.stock || 10; // Default to 10 if not specified
    const discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

    // Get the image URL
    const imageUrl = getProductImageUrl(product);

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
          {category?.data && (
            <>
              <li>
                <Link 
                    href={`/category/${category.data.attributes?.slug || ''}`} 
                  className="text-gray-500 hover:text-gray-700"
                >
                    {category.data.attributes?.name || 'Category'}
                </Link>
              </li>
              <li>
                <span className="text-gray-500 mx-2">/</span>
              </li>
            </>
          )}
          <li>
            <span className="text-gray-900 font-medium">{name}</span>
          </li>
        </ol>
      </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content: Image and Product Details */}
          <div className="flex-1 flex flex-col md:flex-row gap-6">
        {/* Product Image */}
        <div className="w-full md:w-1/2">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                {imageUrl ? (
                  <>
              <Image
                src={imageUrl}
                alt={name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-center"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      unoptimized={true}
                    />
                    {imageStatus === 'loading' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-80">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {imageStatus === 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-gray-500">Image unavailable</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-500">No image</span>
                    </div>
                  </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              
              <div className="mt-4 flex items-center">
                <span className="text-2xl font-semibold text-gray-900">₹{price}</span>
                {discount > 0 && (
                  <>
                    <span className="ml-2 text-lg text-gray-500 line-through">₹{mrp}</span>
                    <span className="ml-2 text-sm text-green-600 font-medium">{discount}% off</span>
                  </>
                )}
              </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900">Description</h3>
                <div className="mt-2 text-sm text-gray-600 space-y-2">
                  {description ? (
                    <p>{description}</p>
                  ) : (
                    <p>No description available for this product.</p>
                  )}
                </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-gray-900 mr-2">Availability:</h3>
                {canAddToCart ? (
                    <span className="text-green-600">In Stock</span>
              ) : (
                  <span className="text-red-600">Not Available</span>
              )}
            </div>
          </div>

              {/* Cart section */}
              <div className="mt-8 space-y-4">
                {canAddToCart ? (
                  cartQuantity > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 mr-4">In your cart:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => updateCartQuantity(cartQuantity - 1)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                          >
                            -
                          </button>
                          <span className="px-4 py-2 bg-white text-center min-w-[40px]">
                            {cartQuantity}
                          </span>
                          <button 
                            onClick={() => updateCartQuantity(cartQuantity + 1)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <Link 
                        href="/cart" 
                        className="w-full flex items-center justify-center py-3 px-8 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Go to Cart
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center">
                          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mr-3">
                            Quantity:
                </label>
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                            >
                              -
                            </button>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  max={stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                              className="w-12 py-2 text-center border-0 focus:ring-0"
                            />
                            <button 
                              onClick={() => setQuantity(quantity + 1)}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                            >
                              +
                            </button>
                          </div>
              </div>
                        
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stock === 0}
                          className={`flex-1 bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Add to Cart
              </button>
            </div>
                    </div>
                  )
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">
                      This product is not available for delivery to your location.
                    </p>
                    <button
                      onClick={() => {
                        // Trigger pincode popup
                        const event = new CustomEvent('open-pincode-popup');
                        window.dispatchEvent(event);
                      }}
                      className="mt-2 text-sm text-red-600 font-medium hover:text-red-800"
                    >
                      Change delivery location
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar - Related Categories */}
          <div className="w-full lg:w-64 mt-8 lg:mt-0">
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Categories</h2>
              <ul className="space-y-2">
                {relatedCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link 
                      href={`/category/${cat.attributes?.slug || ''}`}
                      className={`block text-sm ${
                        category?.data?.id === cat.id 
                          ? 'font-semibold text-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      {cat.attributes?.name || 'Category'}
                    </Link>
                  </li>
                ))}
              </ul>
          </div>
        </div>
      </div>
    </div>
  );
  }
} 