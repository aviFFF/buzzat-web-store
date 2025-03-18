'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem, addToCart, updateCartItemQuantity, getCartItems } from '@/utils/cartUtils';
import { checkPincodeServiceability } from '@/services/pincode';

interface Product {
  id: number;
  attributes: {
    name: string;
    description?: string;
    mrp: number;
    sellingPrice: number;
    slug?: string;
    image?: {
      data?: {
        attributes?: {
          url: string;
          formats?: {
            thumbnail?: { url: string };
          };
        };
      };
    };
    images?: {
      data?: Array<{
        attributes?: {
          url: string;
          formats?: {
            thumbnail?: { url: string };
          };
        };
      }>;
    };
  };
}

interface ProductListProps {
  categorySlug: string;
  pincode?: string;
}

export default function ProductList({ categorySlug, pincode = '110001' }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPincode, setCurrentPincode] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [cartQuantities, setCartQuantities] = useState<{[key: number]: number}>(() => {
    // Initialize quantities from saved cart
    const savedCart = getCartItems();
    const quantities: {[key: number]: number} = {};
    savedCart.forEach((item: CartItem) => {
      quantities[item.id] = item.quantity;
    });
    return quantities;
  });
  
  const [imageStatus, setImageStatus] = useState<{[key: number]: 'loading' | 'loaded' | 'error'}>({});
  const [addedToCartId, setAddedToCartId] = useState<number | null>(null);

  // Memoize the fetch function to avoid recreating it on every render
  const fetchProductsForPincodeAndCategory = useCallback(async (pincode: string, categorySlug: string) => {
    try {
      // Clear previous products first
      setProducts([]);
      setLoading(true);
      setError(null);
      
      console.log(`Fetching products for pincode: ${pincode} and category: ${categorySlug}`);
      const response = await checkPincodeServiceability(pincode);
      console.log('API response for pincode:', pincode, response);
      
      if (response.serviceable) {
        // If we have products in the response
        if (response.products && Array.isArray(response.products) && response.products.length > 0) {
          console.log('Products found for pincode:', response.products.length);
          
          // Filter products by category
          const filteredProducts = response.products.filter((product: any) => {
            // Check if product has categories
            if (product.categories && Array.isArray(product.categories)) {
              // Check if any category matches the categorySlug
              return product.categories.some((category: any) => 
                category.attributes?.slug === categorySlug || 
                category.slug === categorySlug
              );
            }
            return false;
          });
          
          console.log(`Found ${filteredProducts.length} products for category: ${categorySlug}`);
          setProducts(filteredProducts);
          
          if (filteredProducts.length === 0) {
            setError('No products available in this category for your location');
          }
        } else {
          console.log('No products in response for pincode:', pincode);
          setProducts([]);
          setError('No products available for this pincode');
        }
      } else {
        console.log('Pincode not serviceable:', pincode);
        setProducts([]);
        setError('Delivery not available for this location');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if pincode or category has changed
    if (pincode !== currentPincode || categorySlug !== currentCategory) {
      console.log('Pincode or category changed:', { 
        fromPincode: currentPincode, 
        toPincode: pincode,
        fromCategory: currentCategory,
        toCategory: categorySlug
      });
      
      setCurrentPincode(pincode);
      setCurrentCategory(categorySlug);
      
      // Reset state when pincode or category changes
      setLoading(true);
      setError(null);
      setProducts([]);
      
      // Only fetch if we have both pincode and category
      if (pincode && categorySlug) {
        fetchProductsForPincodeAndCategory(pincode, categorySlug);
      } else {
        setLoading(false);
        console.log('Missing pincode or category slug');
      }
    }
  }, [pincode, categorySlug, currentPincode, currentCategory, fetchProductsForPincodeAndCategory]);

  const getProductImageUrl = (product: Product): string | null => {
    // Check for image in attributes structure
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

  const handleImageLoad = (productId: number) => {
    setImageStatus(prev => ({
      ...prev,
      [productId]: 'loaded'
    }));
  };

  const handleImageError = (productId: number) => {
    setImageStatus(prev => ({
      ...prev,
      [productId]: 'error'
    }));
  };

  const handleAddToCart = (product: Product) => {
    const imageUrl = getProductImageUrl(product);
    
    // Create cart item
    const newItem: CartItem = {
      id: product.id,
      name: product.attributes.name,
      price: product.attributes.sellingPrice,
      quantity: 1,
      image: imageUrl || undefined,
      slug: product.attributes.slug
    };
    
    // Add to cart using utility function
    addToCart(newItem);
    
    // Update local state
    setCartQuantities(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
    
    // Show visual feedback
    setAddedToCartId(product.id);
    setTimeout(() => {
      setAddedToCartId(null);
    }, 1500);
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    // Update cart using utility function
    updateCartItemQuantity(productId, newQuantity);
    
    // Update local state
    if (newQuantity <= 0) {
      setCartQuantities(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } else {
      setCartQuantities(prev => ({
        ...prev,
        [productId]: newQuantity
      }));
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((key) => (
          <div key={key} className="bg-gray-200 animate-pulse h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <p className="text-gray-500 mt-2">Please try another pincode or check back later.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
        <p className="text-gray-500 mb-4">There are no products in this category for your location.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        // Check if product has valid attributes and slug
        if (!product.attributes || !product.attributes.slug) {
          return null;
        }
        
        const imageUrl = getProductImageUrl(product);
        const quantity = cartQuantities[product.id] || 0;
        const imgStatus = imageStatus[product.id] || 'loading';
        const isAddedToCart = addedToCartId === product.id;
        
        return (
          <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
            {/* Image section with link to product detail */}
            <Link href={`/product/${product.attributes.slug}`} className="block">
              <div className="relative h-40 sm:h-48 w-full bg-gray-200">
                {imageUrl ? (
                  <>
                    <Image
                      src={imageUrl}
                      alt={product.attributes.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      className="object-cover"
                      onLoad={() => handleImageLoad(product.id)}
                      onError={() => handleImageError(product.id)}
                      unoptimized={true} // Skip Next.js image optimization for external URLs
                    />
                    {imgStatus === 'loading' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-80">
                        <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {imgStatus === 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {isAddedToCart && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in">
                        <div className="bg-white rounded-full p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
            
            <div className="p-3 sm:p-4">
              {/* Product name with link */}
              <Link href={`/product/${product.attributes.slug}`} className="block">
                <h3 className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 h-10">
                  {product.attributes.name}
                </h3>
              </Link>
              
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-gray-900">
                    ₹{product.attributes.sellingPrice}
                  </span>
                  {product.attributes.mrp > product.attributes.sellingPrice && (
                    <span className="ml-1 text-xs text-gray-500 line-through">
                      ₹{product.attributes.mrp}
                    </span>
                  )}
                </div>
                {product.attributes.mrp > product.attributes.sellingPrice && (
                  <span className="text-xs text-green-600 font-medium">
                    {Math.round((1 - product.attributes.sellingPrice / product.attributes.mrp) * 100)}% off
                  </span>
                )}
              </div>
              
              {/* Cart Controls */}
              <div className="mt-3">
                {quantity === 0 ? (
                  // Add to Cart Button
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-1.5 px-3 rounded-lg text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add to Cart
                  </button>
                ) : (
                  // Quantity Controls
                  <div className="flex items-center justify-between border border-gray-300 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => handleUpdateQuantity(product.id, quantity - 1)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 bg-white text-center text-sm w-full">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => handleUpdateQuantity(product.id, quantity + 1)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 