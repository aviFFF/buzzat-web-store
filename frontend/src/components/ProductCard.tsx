'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, getStrapiMedia } from '../services/api';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const { attributes } = product;
  const { name, price, images, slug } = attributes;
  
  // Get the first image or use a placeholder
  const imageUrl = images?.data?.[0]?.attributes?.url
    ? getStrapiMedia(images.data[0].attributes.url)
    : '/placeholder-product.png';
  
  return (
    <Link href={`/product/${slug}`}>
      <div 
        className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={name}
              width={300}
              height={300}
              className={`w-full h-full object-cover object-center transition-transform duration-300 ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">₹{price}</p>
            <button 
              className="inline-flex items-center justify-center p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none"
              onClick={(e) => {
                e.preventDefault();
                // Add to cart functionality
                console.log('Add to cart:', product);
              }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
} 