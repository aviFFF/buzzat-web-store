'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePincode } from '@/context/PincodeContext';
import { searchProducts } from '@/services/api';
import Image from 'next/image';
import Link from 'next/link';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  placeholder = 'Search for products...', 
  className = '',
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const { pincode, isServiceable } = usePincode();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch search results when search term changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        
        // Use the pincode from context if available and serviceable
        const pincodeToUse = isServiceable ? pincode : null;
        
        const response = await searchProducts(searchTerm, pincodeToUse || undefined);
        
        if (response && response.data) {
          console.log('Search results:', response.data);
          setSearchResults(response.data);
          setShowResults(true);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (searchTerm.trim()) {
      searchTimeout.current = setTimeout(() => {
        fetchResults();
      }, 300); // 300ms debounce
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm, pincode, isServiceable]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim() && searchResults.length > 0) {
      // Navigate to the first result
      const firstResult = searchResults[0];
      const slug = firstResult.slug;
      if (slug) {
        router.push(`/product/${slug}`);
        setShowResults(false);
      }
    }
  };

  const getProductImageUrl = (product: any): string | null => {
    // Check if image is an array (from the provided data structure)
    if (Array.isArray(product.image) && product.image.length > 0) {
      const firstImage = product.image[0];
      
      // Try to get thumbnail first for faster loading
      if (firstImage.formats?.thumbnail?.url) {
        return `${process.env.NEXT_PUBLIC_STRAPI_URL || ''}${firstImage.formats.thumbnail.url}`;
      }
      
      // Fall back to full image
      if (firstImage.url) {
        return `${process.env.NEXT_PUBLIC_STRAPI_URL || ''}${firstImage.url}`;
      }
    }
    
    // Legacy format checks
    if (product.attributes?.image?.data?.attributes?.url) {
      return `${process.env.NEXT_PUBLIC_STRAPI_URL || ''}${product.attributes.image.data.attributes.url}`;
    }
    
    return null;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.trim() && setShowResults(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
          {isSearching ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>
      
      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto border border-gray-200">
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{searchTerm}"
              {pincode && isServiceable && (
                <span className="ml-1 text-xs text-gray-500">in {pincode}</span>
              )}
            </p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {searchResults.map((product) => {
              // Direct access to properties based on the actual API response
              const productName = product.name || 'Product';
              const productSlug = product.slug || `product-${product.id}`;
              const productPrice = product.sellingPrice || 0;
              const productMrp = product.mrp || productPrice;
              const imageUrl = getProductImageUrl(product);
              
              return (
                <Link 
                  key={product.id} 
                  href={`/product/${productSlug}`}
                  onClick={() => setShowResults(false)}
                  className="flex items-center p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-3">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={productName}
                        fill
                        className="object-cover"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{productName}</h4>
                    <div className="flex items-center mt-1">
                      <span className="text-sm font-bold text-gray-900">₹{productPrice}</span>
                      {productMrp > productPrice && (
                        <span className="ml-1 text-xs text-gray-500 line-through">₹{productMrp}</span>
                      )}
                      {productMrp > productPrice && (
                        <span className="ml-2 text-xs text-green-600 font-medium">
                          {Math.round((1 - productPrice / productMrp) * 100)}% off
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* View all results link */}
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <Link 
              href={`/product-search?q=${encodeURIComponent(searchTerm)}${pincode ? `&pincode=${pincode}` : ''}`}
              onClick={() => setShowResults(false)}
              className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all results
            </Link>
          </div>
        </div>
      )}
      
      {/* No results message */}
      {showResults && searchTerm.trim() && searchResults.length === 0 && !isSearching && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center">
          <p className="text-gray-600">No products found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
