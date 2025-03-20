'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchProducts } from '@/services/api';
import ProductsSection from '@/components/ProductsSection';
import { usePincode } from '@/context/PincodeContext';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { pincode, isServiceable } = usePincode();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get search term from URL query parameters
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
    } else {
      // If no query parameter, set empty products array and stop loading
      setProducts([]);
      setLoading(false);
    }
  }, [searchParams]);

  // Fetch products when search term or pincode changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use the pincode from context if available and serviceable
        const pincodeToUse = isServiceable ? pincode : null;
        
        const response = await searchProducts(searchTerm, pincodeToUse || undefined);
        
        if (response && response.data) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        setError('Failed to search products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm) {
      fetchSearchResults();
    }
  }, [searchTerm, pincode, isServiceable]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Results</h1>
        {pincode && isServiceable && (
          <p className="text-sm text-gray-600">
            Showing results for delivery to pincode: {pincode}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {searchTerm && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Results for "{searchTerm}"
              </h2>
              <p className="text-gray-600 mt-1">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
          )}

          {products.length > 0 ? (
            <ProductsSection products={products} />
          ) : searchTerm ? (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500">
                We couldn't find any products matching "{searchTerm}".
                {pincode && isServiceable && (
                  <span> Try a different search term or browse our categories.</span>
                )}
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Enter a search term to find products</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
