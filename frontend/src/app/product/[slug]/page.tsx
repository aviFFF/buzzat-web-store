/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { addToCart, getCartItems, updateCartItemQuantity, CartItem } from '@/utils/cartUtils';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  // Access params safely
  const slug: any = params?.slug ? decodeURIComponent(params.slug) : '';
  // const router = useRouter();

  const [product, setProduct] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [notification, setNotification] = useState<string | null>(null);
  const [pincode, setPincode] = useState<string | null>(null);
  const [isServiceable, setIsServiceable] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
  const [relatedCategories, setRelatedCategories] = useState<any[]>([]);

  // Load pincode from localStorage
  useEffect(() => {
    const savedPincode = localStorage.getItem('pincode');
    if (savedPincode) {
      setPincode(savedPincode);
      setIsServiceable(true);
      setDeliveryMessage('Delivery available in 30-60 minutes');
    }
  }, []);

  // Fetch product data when slug or pincode changes
  useEffect(() => {
    const getProduct = async () => {
      try {
        setIsLoading(true);

        // Fetch product with related categories directly from API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/products?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`);

        console.log('response data : ', response)

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }

        const data = await response.json();
        console.log("data as : ", data)
        const productData = data.data?.[0] || null;

        console.log('productData' , productData?.image?.[0]?.name)
        if (!productData) {
          setError('Product not found.');
        } else {
          console.log('Product data:', productData);
          setProduct(productData);
          setError(null);

          // Check if product is already in cart
          const cartItems = getCartItems();
          const existingItem = cartItems.find(item => item.id === productData.id);
          if (existingItem) {
            setCartQuantity(existingItem.quantity);
          }

          // Fetch all categories for the sidebar
          const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/categories?populate=*`);

          if (!categoriesResponse.ok) {
            throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`);
          }

          const categoriesData = await categoriesResponse.json();
          setRelatedCategories(categoriesData.data || []);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    getProduct();
  }, [slug]);

  // console.log('productImaegState' , product?.image?.[0]?.name)
  // Hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Function to handle pincode change
  const handlePincodeChange = (newPincode: string, newIsServiceable: boolean, newDeliveryMessage: string) => {
    setPincode(newPincode);
    setIsServiceable(newIsServiceable);
    setDeliveryMessage(newDeliveryMessage);
    localStorage.setItem('pincode', newPincode);
  };

  // Function to add product to cart
  // #bug3 fixed the add to cart 
  const handleAddToCart = () => {
    if (!product) return;

    const cartItem: CartItem = {
      id: product.id,
      name: product.name || 'Product',
      price: product.mrp || 0,
      quantity: cartQuantity || 1,
      image: product.image?.[0]?.url
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${product.image[0].url}`
        : '',
      slug: product.slug || slug
    };

    addToCart(cartItem);
    showNotification(`Added ${product.name || 'Product'} to cart`);
  };

  //#bug2 fixed the updating value when increase the item 
  const updateCartQuantityHandler = (productId: number, newQuantity: number) => {
    if (!product || !product.id) return;

    const cartItems = getCartItems();
    const existingItem = cartItems.find(item => item.id === productId);

    if (newQuantity === 0) {
      // Remove from cart
      updateCartItemQuantity(productId, 0);
      setCartQuantity(0);
      showNotification('Removed from cart');
    } else if (existingItem || newQuantity > 0) {
      // Update quantity only if item exists or adding new item
      updateCartItemQuantity(productId, newQuantity);
      setCartQuantity(newQuantity);
      showNotification(`Updated quantity (${newQuantity})`);
    }
  };

  // Function to show notification
  const showNotification = (message: string) => {
    setNotification(message);
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
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header
          pincode={pincode}
          isServiceable={isServiceable}
          deliveryMessage={deliveryMessage || ''}
          onPincodeChange={handlePincodeChange}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Product not found'}
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
            {product?.attributes?.category?.data && (
              <>
                <li>
                  <Link
                    href={`/products-category/${encodeURIComponent(product.attributes.category.data.attributes?.name || '')}`}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {product.attributes.category.data.attributes?.name || 'Category'}
                  </Link>
                </li>
                <li>
                  <span className="text-gray-500 mx-2">/</span>
                </li>
              </>
            )}
            <li>
              <span className="text-gray-900 font-medium">{product?.attributes?.name || 'Product'}</span>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row">
          {/* Categories Sidebar */}
          <div className="w-full md:w-1/4 md:pr-4">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <h2 className="text-lg font-semibold mb-3">Categories</h2>
              <ul className="space-y-2">
                {relatedCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products-category/${cat?.attributes?.name || ''}`}
                      className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100"
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
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : product ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col md:flex-row">
                  {/* Product Image */}
                  <div className="w-full md:w-1/2 md:pr-6">
                    <div className="relative h-80 w-full bg-gray-100 rounded-lg overflow-hidden">
                      {/* #bug1 fixed the images showing */}
                      {product ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${product.image[0].url}`}
                          alt={product?.image?.[0]?.name || 'Product image'}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">No image available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="w-full md:w-1/2 mt-6 md:mt-0">
                    <h1 className="text-2xl font-bold mb-2">{product?.name}</h1>
                    <p className="text-gray-600 mb-4">{product?.description}</p>

                    <div className="mb-6">
                      <span className="text-3xl font-bold">₹ {product?.mrp}</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <div className="flex items-center">
                        <button
                          onClick={() => updateCartQuantityHandler(product.id, Math.max(0, cartQuantity - 1))}
                          className="px-3 py-1 bg-gray-200 rounded-l-md hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 bg-gray-100 text-center">{cartQuantity}</span>
                        <button
                          onClick={() => updateCartQuantityHandler(product.id, cartQuantity + 1)}
                          className="px-3 py-1 bg-gray-200 rounded-r-md hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add to Cart
                    </button>

                    {/* Delivery Info */}
                    {pincode && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-md">
                        <h3 className="font-medium mb-2">Delivery Information</h3>
                        <p className="text-sm text-gray-600">
                          {isServiceable
                            ? deliveryMessage
                            : "Sorry, we don't deliver to this location yet."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
} 