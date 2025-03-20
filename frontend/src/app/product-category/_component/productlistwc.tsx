'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetchProductsByCategory } from '@/services/api';
import { CartItem, getCartItems, addToCart as addItemToCart, updateCartItemQuantity } from '@/utils/cartUtils';
import { toast } from 'sonner';

interface Product {
  id: number;
  attributes?: {
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
    categories?: {
      data: {
        id: number;
        attributes: {
          name: string;
          slug: string;
        };
      }[];
    };
  };
  // Direct properties for alternative data structure
  name?: string;
  description?: string;
  mrp?: number;
  sellingPrice?: number;
  price?: number;
  slug?: string;
  image?: {
    url?: string;
    data?: {
      attributes?: {
        url: string;
      };
    };
  };
}

interface ProductListProps {
  categorySlug: string | null;
  categoryName?: string;
}

export default function ProductListWithCategory({ categorySlug, categoryName }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartQuantities, setCartQuantities] = useState<{ [key: number]: number }>({});
  const [imageStatus, setImageStatus] = useState<{ [key: number]: 'loading' | 'loaded' | 'error' }>({});
  const [addedToCartId, setAddedToCartId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products when selected category changes
  useEffect(() => {
    const loadProducts = async () => {
      if (!categorySlug) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching products for category:', categorySlug);
        const response = await fetchProductsByCategory(categorySlug);
        
        if (response && response.data) {
          console.log('Products received:', response.data.length);
          if (response.data.length > 0) {
            console.log('First product example:', response.data[0]);
          }
          setProducts(response.data);
        } else {
          console.log('No products returned from API');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products for category:', error);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [categorySlug]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const loadCart = () => {
      const items = getCartItems();
      setCartItems(items);

      // Initialize quantities from saved cart
      const quantities: { [key: number]: number } = {};
      items.forEach((item: CartItem) => {
        quantities[item.id] = item.quantity;
      });
      setCartQuantities(quantities);
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
  }, []);

  const getProductImageUrl = (product: Product): string | null => {
    const strapiUrl = 'http://localhost:1337'; // Hardcode for testing
    
    // Handle image as array (from the provided data structure)
    if (Array.isArray(product.image) && product.image.length > 0) {
      const firstImage = product.image[0];
      console.log('First image in array:', firstImage);
      if (firstImage.url) {
        return `${strapiUrl}${firstImage.url}`;
      }
    }
    
    // Log the product structure to understand what we're working with
    console.log('Getting image URL for product:', product.id);
    
    // Check for image in attributes structure (from API)
    if (product?.image?.data?.attributes?.url) {
      return product?.image?.data?.attributes?.url;
    }
    
    // Check for direct image property (alternative structure)
    if (product.image?.url) {
      return product.image.url;
    }
    
    // Check for nested image data without attributes wrapper
    if (product.image?.data?.attributes?.url) {
      return product.image.data.attributes.url;
    }
    
    // If no image is found
    console.log('No image found for product:', product.id);
    return null;
  };

  const handleImageLoad = (productId: number) => {
    setImageStatus(prev => ({
      ...prev,
      [productId]: 'loaded'
    }));
  };

  const handleImageError = (productId: number) => {
    console.error(`Failed to load image for product ${productId}`);
    setImageStatus(prev => ({
      ...prev,
      [productId]: 'error'
    }));
  };

  const addToCart = (product: Product) => {
    const imageUrl = getProductImageUrl(product);
    
    // Get product properties, handling different data structures
    const productId = product.id;
    const productName = product.attributes?.name || product.name || 'Product';
    const productSlug = product.attributes?.slug || product.slug || `product-${productId}`;
    const productPrice = product.attributes?.sellingPrice || product.sellingPrice || product.price || 0;

    // Create cart item
    const newItem: CartItem = {
      id: productId,
      name: productName,
      price: productPrice,
      quantity: 1,
      image: imageUrl || undefined,
      slug: productSlug
    };

    // Add to cart using utility function
    addItemToCart(newItem);
    toast.success(`Added ${product.name || 'Product'} to cart`);

    // Update local state
    setCartQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0)
    }));

    // Show visual feedback
    setAddedToCartId(productId);
    setTimeout(() => {
      setAddedToCartId(null);
    }, 1500);
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    // Update cart using utility function
    updateCartItemQuantity(productId, newQuantity);

    // Update local state
    if (newQuantity <= 0) {
      setCartQuantities(prev => {
        const updated = { ...prev };
        delete updated[productId];
        toast.success(`Removed ${products.find(p => p.id === productId)?.name || 'Product'} from cart`);

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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
            { ' Products'}
        
        </h1>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {products.map((product) => {
          // Log the product to see its structure
          console.log('Rendering product:', product);
          
          // Check if product has valid structure for rendering
          const hasValidStructure = product && product.id && (product.attributes?.slug || product.slug || product.attributes?.name || product.name);
          if (!hasValidStructure) {
            console.warn('Product missing required data:', product);
            return null;
          }

          // Get product properties, handling different data structures
          const productId = product.id;
          const productName = product.attributes?.name || product.name || 'Product';
          const productSlug = product.attributes?.slug || product.slug || `product-${productId}`;
          const productPrice = product.attributes?.sellingPrice || product.sellingPrice || product.price || 0;
          const productMrp = product.attributes?.mrp || product.mrp || productPrice;
          
          const imageUrl = getProductImageUrl(product);
          const quantity = cartQuantities[productId] || 0;
          const imgStatus = imageStatus[productId] || 'loading';
          const isAddedToCart = addedToCartId === productId;

          return (
            <div key={productId} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
              {/* Image section with link to product detail */}
              <Link href={`/product/${productSlug}`} className="block">
                <div className="relative h-28 sm:h-32 w-full bg-gray-200">
                  {imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt={productName}
                        fill
                        className="object-center"
                        onLoad={() => handleImageLoad(productId)}
                        onError={() => handleImageError(productId)}
                        unoptimized={true}
                      />

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

              <div className="p-2 sm:p-3">
                {/* Product name with link */}
                <Link href={`/product/${productSlug}`} className="block">
                  <h3 className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 h-10">
                    {productName}
                  </h3>
                </Link>

                <div className="mt-1 flex flex-col items-center justify-between">
                  <div className='flex text-left'>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{productPrice}
                    </span>
                    {productMrp > productPrice && (
                      <span className="ml-1 text-xs text-gray-500 line-through">
                        ₹{productMrp}
                      </span>
                    )}
                  </div>
                  {productMrp > productPrice && (
                    <span className="text-xs text-green-600 font-medium">
                      {Math.round((1 - productPrice / productMrp) * 100)}% off
                    </span>
                  )}
                </div>

                {/* Cart Controls */}
                <div className="mt-2">
                  {quantity === 0 ? (
                    // Add to Cart Button
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full py-1 px-2 rounded-lg text-xs font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add
                    </button>
                  ) : (
                    // Quantity Controls
                    <div className="flex items-center justify-between border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(productId, quantity - 1)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="px-2 py-1 bg-white text-center text-sm w-full">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(productId, quantity + 1)}
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
        })}
      </div>
      
      {/* Show "No products found" message if no products */}
      {products.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500">
            We couldn't find any products in this category.
          </p>
        </div>
      )}
    </div>
  );
}
