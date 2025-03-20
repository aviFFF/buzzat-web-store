'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CartItem, getCartItems, addToCart as addItemToCart, updateCartItemQuantity } from '@/utils/cartUtils';

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
  };
  // For direct objects (not from Strapi API)
  name?: string;
  slug?: string;
  mrp?: number;
  sellingPrice?: number;
  description?: string;
  image?: {
    url?: string;
  };
}

interface ProductsSectionProps {
  products: Product[];
}

export default function ProductsSection({ products }: ProductsSectionProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartQuantities, setCartQuantities] = useState<{ [key: number]: number }>({});
  const [imageStatus, setImageStatus] = useState<{ [key: number]: 'loading' | 'loaded' | 'error' }>({});
  const [addedToCartId, setAddedToCartId] = useState<number | null>(null);

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

  console.log('cartStateItem : ', cartItems)

  const getProductImageUrl = (product: Product): string | null => {
    // Check for image in attributes structure (from API)
    if (product.attributes?.image?.data?.attributes?.url) {
      return product.attributes.image.data.attributes.url;
    }

    // Check for direct image URL (from direct object)
    if (product.image?.url) {
      return product.image.url;
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

    // Create cart item
    const newItem: CartItem = {
      id: product.id,
      name: product.attributes.name,
      price: product.attributes.sellingPrice,
      quantity: 1, //#bug1 fixing the cart add quantity by 2 to 1
      image: imageUrl || undefined,
      slug: product.attributes.slug
    };

    // Add to cart using utility function
    addItemToCart(newItem);

    // Update local state
    setCartQuantities(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0)
    }));

    // Show visual feedback
    setAddedToCartId(product.id);
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
        return updated;
      });
    } else {
      setCartQuantities(prev => ({
        ...prev,
        [productId]: newQuantity
      }));
    }
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
      {products.map((product) => {
        // Check if product has valid attributes and slug
        if (!product.attributes || !product.attributes.slug) {
          console.warn('Product missing slug:', product.id);
          console.log('Product:', product);
          return null;
        }

        const imageUrl = getProductImageUrl(product);
        const quantity = cartQuantities[product.id] || 0;
        const imgStatus = imageStatus[product.id] || 'loading';
        const isAddedToCart = addedToCartId === product.id;

        return (
          <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
            {/* Image section with link to product detail */}
            <Link href={`/product/${product?.attributes?.slug}`} className="block">
              <div className="relative h-28 sm:h-32 w-full bg-gray-200">
                {imageUrl ? (
                  <>
                  <Image
                      src={imageUrl}
                    alt={product.attributes.name}
                    fill
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
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

            <div className="p-2 sm:p-3">
              {/* Product name with link */}
              <Link href={`/product/${product.attributes.slug}`} className="block">
                <h3 className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 h-10">
                  {product.attributes.name}
                </h3>
              </Link>

              <div className="mt-1 flex items-center justify-between">
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
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="px-2 py-1 bg-white text-center text-sm w-full">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity +1)}
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
  );
} 