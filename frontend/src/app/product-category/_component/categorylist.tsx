'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { checkPincodeServiceability } from '@/services/pincode';
import { getPincodeFromLocalStorage } from '@/services/pincode';

interface Category {
  id: number;
  attributes?: {
    name: string;
    slug?: string;
    icontype?: {
      data?: {
        attributes?: {
          url: string;
        };
      };
    };
  };
  name?: string;
  slug?: string;
  icontype?: {
    url?: string;
  };
  image?: {
    url?: string;
  };
}

interface CategoryListProps {
  selectedCategory: string | null;
  onCategorySelect: (slug: string) => void;
}

export default function CategoryList({ 
  selectedCategory, 
  onCategorySelect 
}: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pincode, setPincode] = useState<string | null>(null);
  const [isServiceable, setIsServiceable] = useState<boolean>(false);

  useEffect(() => {
    // Get pincode from localStorage
    const { pincode, isServiceable } = getPincodeFromLocalStorage();
    setPincode(pincode);
    setIsServiceable(isServiceable);

    if (pincode && isServiceable) {
      fetchCategoriesForPincode(pincode);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCategoriesForPincode = async (pincode: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching categories for pincode:', pincode);
      const response = await checkPincodeServiceability(pincode);
      
      if (response.serviceable) {
        // Extract categories
        if (response.categories && Array.isArray(response.categories)) {
          console.log('Categories found:', response.categories.length);
          setCategories(response.categories);
        } else if (response.products && Array.isArray(response.products)) {
          // Extract categories from products if direct categories not available
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
          setCategories(categoriesArray);
        } else {
          console.log('No categories found in response');
          setCategories([]);
        }
      } else {
        console.log('Pincode not serviceable:', pincode);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories for pincode:', error);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Get category icon URL
  const getCategoryIconUrl = (category: Category): string | null => {
    // Get icon URL from either attributes or direct properties
    let iconUrl = '';
    if (category.attributes?.icontype?.data?.attributes?.url) {
      iconUrl = category.attributes.icontype.data.attributes.url;
    } else if (category.icontype?.url) {
      iconUrl = category.icontype.url;
    } else if (category.image?.url) {
      iconUrl = category.image.url;
    }
    
    // Add base URL if needed
    if (iconUrl && !iconUrl.startsWith('http') && !iconUrl.startsWith('/uploads/')) {
      iconUrl = `/uploads/${iconUrl}`;
    }
    
    // Add full URL if it's a relative path
    if (iconUrl && iconUrl.startsWith('/uploads/')) {
      const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
      iconUrl = `${baseUrl}${iconUrl}`;
    }
    
    return iconUrl || null;
  };

  // Get category name
  const getCategoryName = (category: Category): string => {
    return category.attributes?.name || category.name || '';
  };

  // Get category slug
  const getCategorySlug = (category: Category): string => {
    return category.attributes?.slug || category.slug || '';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Categories</h2>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center p-2 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Categories</h2>
        <p className="text-red-500 text-center p-4">{error}</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Categories</h2>
        <p className="text-gray-500 text-center p-4">No categories available for your location</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 items-center justify-center sticky top-24">
      <h2 className="text-xs text-center md:text-lg justify-center items-center font-bold text-gray-900 mb-4 border-b pb-2">Categories</h2>
      <div className="space-y-2">
        {categories.map((category) => {
          const slug = getCategorySlug(category);
          const name = getCategoryName(category);
          const iconUrl = getCategoryIconUrl(category);
          const isActive = selectedCategory === slug;
          
          if (!slug) return null;
          
          return (
            <Link 
              href={`/product-category/${encodeURIComponent(slug)}`}
              key={category.id}
              className={`flex flex-col md:flex-row text-xs text-center items-center p-2 rounded-full md:rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
              onClick={(e) => {
                e.preventDefault();
                onCategorySelect(slug);
              }}
            >
              <div className="w-8 h-8 relative mr-3 flex-shrink-0">
                {iconUrl ? (
                  <Image
                    src={iconUrl}
                    alt={name}
                    fill
                    sizes="32px"
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-100 rounded-full ">
                    <span className="text-gray-500">{name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <span className="text-xs">{name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
