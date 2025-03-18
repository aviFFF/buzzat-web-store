'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { fetchCategories, fetchProductsByCategory, checkPincodeAvailability } from '@/services/api';
import { CartItem, getCartItems } from '@/utils/cartUtils';
import TopCategoryList from '../_components/TopCategoryList';
import ProductList from '../_components/ProductList';

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

interface Category {
  id: number;
  attributes: {
    name: string;
    slug: string;
    icon?: string;
    description?: string;
  };
}

// Note: In client components, we can't use generateMetadata
// Instead, we'll set the document title dynamically
export default function ProductCategoryPage() {
  const params = useParams();
  const categoryParam = decodeURIComponent(params.categoryName as string);
  const [categorySlug, setCategorySlug] = useState<string>(categoryParam);
  const [categoryName, setCategoryName] = useState<string>(categoryParam);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pincode state
  const [pincode, setPincode] = useState<string>('110001');
  const [isServiceable, setIsServiceable] = useState<boolean>(true);
  const [deliveryMessage, setDeliveryMessage] = useState<string>('Delivery available');
  
  // Set document title dynamically and resolve actual category name
  useEffect(() => {
    document.title = `${categoryParam} - Buzzat`;
    console.log('Current category from URL:', categoryParam);
    
    // Try to get the actual category info to have proper name and slug
    const fetchCategoryInfo = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
        
        // Try by slug first
        const slugUrl = `${API_URL}/api/categories?filters[slug][$eq]=${encodeURIComponent(categoryParam)}&populate=*`;
        console.log('Fetching category info by slug:', slugUrl);
        
        const slugResponse = await fetch(slugUrl);
        const slugData = await slugResponse.json();
        
        if (slugData.data && slugData.data.length > 0) {
          const category = slugData.data[0];
          setCategoryName(category?.attributes?.name || categoryParam);
          setCategorySlug(category?.attributes?.slug || categoryParam);
          document.title = `${category?.attributes?.name || categoryParam} - Buzzat`;
          console.log('Found category by slug:', category?.attributes?.name || categoryParam);
          return;
        }
        
        // If not found by slug, try by name
        const nameUrl = `${API_URL}/api/categories?filters[name][$eq]=${encodeURIComponent(categoryParam)}&populate=*`;
        console.log('Fetching category info by name:', nameUrl);
        
        const nameResponse = await fetch(nameUrl);
        const nameData = await nameResponse.json();
        
        if (nameData.data && nameData.data.length > 0) {
          const category = nameData.data[0];
          setCategoryName(category.attributes.name);
          setCategorySlug(category.attributes.slug);
          document.title = `${category.attributes.name} - Buzzat`;
          console.log('Found category by name:', category.attributes.name);
          return;
        }
        
        // If not found by exact match, we keep the original param value
        console.log('Category not found by exact match, using param as is:', categoryParam);
      } catch (error) {
        console.error('Error fetching category info:', error);
      }
    };
    
    fetchCategoryInfo();
  }, [categoryParam]);
  
  // Initialize pincode from localStorage
  useEffect(() => {
    // Get pincode from localStorage if available
    try {
      const savedPincode = localStorage.getItem('userPincode');
      if (savedPincode) {
        setPincode(savedPincode);
        
        // Check if pincode is serviceable
        checkPincodeAvailability(savedPincode).then(result => {
          setIsServiceable(result.available);
          setDeliveryMessage(result.deliveryMessage || 'Delivery status unknown');
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error getting pincode from localStorage:', error);
      setIsLoading(false);
    }
  }, []);
  
  // Handle pincode change from Header component
  const handlePincodeChange = (newPincode: string, newIsServiceable: boolean, newMessage: string) => {
    console.log(`Pincode changed to: ${newPincode}, serviceable: ${newIsServiceable}`);
    
    setPincode(newPincode);
    setIsServiceable(newIsServiceable);
    setDeliveryMessage(newMessage);
    
    // Save pincode to localStorage
    try {
      localStorage.setItem('userPincode', newPincode);
    } catch (error) {
      console.error('Error saving pincode to localStorage:', error);
    }
  };
  
  if (isLoading) {
    return (
      <>
        <Header 
          pincode={pincode}
          isServiceable={isServiceable}
          deliveryMessage={deliveryMessage}
          onPincodeChange={handlePincodeChange}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/4 h-64 bg-gray-200 rounded-lg"></div>
              <div className="w-full md:w-3/4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Header 
          pincode={pincode}
          isServiceable={isServiceable}
          deliveryMessage={deliveryMessage}
          onPincodeChange={handlePincodeChange}
        />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p>{error}</p>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Header 
        pincode={pincode}
        isServiceable={isServiceable}
        deliveryMessage={deliveryMessage}
        onPincodeChange={handlePincodeChange}
      />
      
      {/* Page Header */}
      <div className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">{categoryName}</h1>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar with Categories */}
        <div className="lg:w-64 bg-white shadow-md">
          <div className="sticky top-24 overflow-y-auto max-h-[calc(100vh-100px)]">
            <TopCategoryList 
              selectedCategory={categorySlug}
              pincode={pincode}
            />
          </div>
        </div>
        
        {/* Main Content with Products */}
        <div className="flex-grow p-4">
          <ProductList 
            categorySlug={categorySlug}
            pincode={pincode}
          />
        </div>
      </div>
    </>
  );
}