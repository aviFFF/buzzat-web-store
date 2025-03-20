'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CategoryList from '../_component/categorylist';
import ProductListWithCategory from '../_component/productlistwc';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params?.slug as string;
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Update selected category when URL param changes
  useEffect(() => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    }
  }, [categorySlug]);

  // Handle category selection from sidebar
  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-row gap-6">
        {/* Categories Sidebar */}
        <div className="w-[30%] md:w-1/4 lg:w-1/5">
          <CategoryList 
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>
        
        {/* Products Grid */}
        <div className="w-[70%] md:w-3/4 lg:w-4/5">
          <ProductListWithCategory 
            categorySlug={selectedCategory}
            categoryName={selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'All Products'}
          />
        </div>
      </div>
    </div>
  );
}
