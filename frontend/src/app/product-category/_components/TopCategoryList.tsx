'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { checkPincodeServiceability } from '@/services/pincode';

interface Category {
  id: number;
  attributes: {
    name: string;
    slug: string;
    icon?: string;
    description?: string;
  };
}

interface TopCategoryListProps {
  selectedCategory: string;
  pincode?: string;
}

export default function TopCategoryList({ selectedCategory, pincode = '110001' }: TopCategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPincode, setCurrentPincode] = useState<string | null>(null);

  // Memoize the fetch function to avoid recreating it on every render
  const fetchCategoriesForPincode = useCallback(async (pincode: string) => {
    try {
      // Clear previous categories first
      setCategories([]);
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching categories for pincode:', pincode);
      const response = await checkPincodeServiceability(pincode);
      console.log('API response for pincode:', pincode, response);
      
      if (response.serviceable) {
        if (response.categories && Array.isArray(response.categories) && response.categories.length > 0) {
          console.log('Categories found for pincode:', response.categories.length);
          setCategories(response.categories);
        } else {
          console.log('No categories in response for pincode:', pincode);
          
          // Try to extract categories from products if available
          if (response.products && Array.isArray(response.products)) {
            const extractedCategories = new Map();
            
            response.products.forEach((product: any) => {
              if (product.categories && Array.isArray(product.categories)) {
                product.categories.forEach((category: any) => {
                  if (category && category.id) {
                    extractedCategories.set(category.id, category);
                  }
                });
              }
            });
            
            const categoriesArray = Array.from(extractedCategories.values());
            console.log('Extracted categories from products:', categoriesArray.length);
            
            if (categoriesArray.length > 0) {
              setCategories(categoriesArray);
            } else {
              setCategories([]);
              setError('No categories available for this pincode');
            }
          } else {
            setCategories([]);
            setError('No categories available for this pincode');
          }
        }
      } else {
        console.log('Pincode not serviceable:', pincode);
        setCategories([]);
        setError('No categories available for this pincode');
      }
    } catch (err) {
      console.error('Error fetching categories for pincode:', err);
      setError('Failed to load categories. Please try again.');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if pincode has changed
    if (pincode !== currentPincode) {
      console.log('Pincode changed from', currentPincode, 'to', pincode);
      setCurrentPincode(pincode);
      
      // Reset state when pincode changes
      setIsLoading(true);
      setError(null);
      setCategories([]);
      
      // Fetch categories for the pincode
      if (pincode) {
        fetchCategoriesForPincode(pincode);
      } else {
        setIsLoading(false);
        console.log('No pincode provided');
      }
    }
  }, [pincode, currentPincode, fetchCategoriesForPincode]);

  if (isLoading) {
    return (
      <div className="bg-white">
        <h2 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">
          Categories
        </h2>
        <div className="p-4 space-y-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white">
        <h2 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">
          Categories
        </h2>
        <div className="p-4 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white">
        <h2 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">
          Categories
        </h2>
        <div className="p-4 text-gray-500">
          No categories available for this location.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <h2 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">
        Categories
      </h2>
      <ul className="divide-y divide-gray-200">
        {categories.map((category) => {
          // Determine if this category is active
          const categorySlug = category.attributes?.slug || '';
          const categoryName = category.attributes?.name || '';
          const isActive = categorySlug === selectedCategory || categoryName === selectedCategory;
          
          return (
            <li key={category.id}>
              <Link 
                href={`/product-category/${encodeURIComponent(categorySlug || categoryName)}`}
                className={`block px-4 py-3 transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center">
                  {category.attributes?.icon && (
                    <span className="mr-3 text-lg">{category.attributes.icon}</span>
                  )}
                  <span>{categoryName}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 