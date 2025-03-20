'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPincodeFromLocalStorage, checkPincodeServiceability } from '@/services/pincode';
import { Suspense } from 'react';
import ProductsSection from '../components/ProductsSection';
import PincodeBasedCategories from '@/components/PincodeBasedCategories';
import PincodePopup from '@/components/PincodePopup';
import BannerCards from '@/components/BannerCards';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [showPincodePopup, setShowPincodePopup] = useState(false);
  const [pincode, setPincode] = useState<string | null>(null);
  const [isServiceable, setIsServiceable] = useState<boolean>(false);
  const [deliveryMessage, setDeliveryMessage] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const router = useRouter();

  // Get auth context
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Check if we have a pincode in localStorage
    const { pincode, isServiceable } = getPincodeFromLocalStorage();
    
    if (pincode) {
      setPincode(pincode);
      setIsServiceable(isServiceable);
      setDeliveryMessage(`Delivery available to ${pincode}`);
      
      // If pincode is not serviceable, redirect to coming-soon
      if (!isServiceable) {
        router.push('/coming-soon');
      } else {
        // Fetch products for this pincode
        fetchProductsForPincode(pincode);
      }
    } else {
      // Show pincode popup if no pincode is set
      setShowPincodePopup(true);
    }
  }, [router]);

  const fetchProductsForPincode = async (pincode: string) => {
    try {
      const response = await checkPincodeServiceability(pincode);
      if (response.serviceable) {
        setDeliveryMessage(response.message || 'Delivery available in your area');
        setProducts(response.products || []);
      }
    } catch (error) {
      console.error('Error fetching products for pincode:', error);
    }
  };

  const handlePincodeSet = (newPincode: string, newIsServiceable: boolean, message: string) => {
    // Only update if the pincode has changed
    if (newPincode !== pincode) {
      console.log('Pincode changed from', pincode, 'to', newPincode);
      setPincode(newPincode);
      setIsServiceable(newIsServiceable);
      setDeliveryMessage(message);
      
      // Force refresh of components that depend on pincode
      setRefreshKey(prev => prev + 1);
      
      // If pincode is serviceable, fetch products
      if (newIsServiceable) {
        fetchProductsForPincode(newPincode);
      } else {
        // Clear products if not serviceable
        setProducts([]);
        
        // Redirect to coming-soon page
        router.push('/coming-soon');
      }
    }
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* Banner Cards Section */}
          <section className="md:block hidden md:mb-8">
            <BannerCards />
          </section>
          
          {/* Categories Section */}
          <section id="categories" className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            </div>
            <Suspense fallback={<div className="p-8 text-center">Loading categories...</div>}>
              <PincodeBasedCategories 
                key={`categories-${pincode}-${refreshKey}`}
                pincode={pincode} 
                isServiceable={isServiceable} 
              />
            </Suspense>
          </section>

          {/* Products Section */}
          <section id="products" className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            </div>
            <Suspense fallback={<div className="p-8 text-center">Loading products...</div>}>
              <ProductsSection key={`products-${pincode}-${refreshKey}`} products={products} />
            </Suspense>
          </section>
        </div>
        
        {/* Pincode Popup */}
        {showPincodePopup && (
          <PincodePopup 
            onClose={() => setShowPincodePopup(false)} 
          />
        )}
      </main>
    </>
  );
}