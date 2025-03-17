'use client';

import { useState, useEffect, useCallback } from 'react';
import { checkPincodeServiceability } from '@/services/pincode';
import CategoriesSection from './CategoriesSection';

interface PincodeBasedCategoriesProps {
  pincode: string | null;
  isServiceable: boolean;
}

export default function PincodeBasedCategories({ pincode, isServiceable }: PincodeBasedCategoriesProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPincode, setCurrentPincode] = useState<string | null>(null);

  // Memoize the fetch function to avoid recreating it on every render
  const fetchCategoriesForPincode = useCallback(async (pincode: string) => {
    try {
      // Clear previous categories first
      setCategories([]);
      setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if pincode has changed
    if (pincode !== currentPincode) {
      console.log('Pincode changed from', currentPincode, 'to', pincode);
      setCurrentPincode(pincode);
      
      // Reset state when pincode changes
      setLoading(true);
      setError(null);
      setCategories([]);
      
      // Only fetch if we have a serviceable pincode
      if (pincode && isServiceable) {
        fetchCategoriesForPincode(pincode);
      } else {
        setLoading(false);
        console.log('No pincode or not serviceable:', { pincode, isServiceable });
      }
    }
  }, [pincode, isServiceable, currentPincode, fetchCategoriesForPincode]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((key) => (
          <div key={key} className="bg-gray-200 animate-pulse h-32 rounded-lg" />
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

  // Use the pincode as part of the key to force a re-render when it changes
  return <CategoriesSection key={`categories-${pincode}`} categories={categories} />;
} 