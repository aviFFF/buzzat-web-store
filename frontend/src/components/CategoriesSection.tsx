'use client';

import Image from 'next/image';
import Link from 'next/link';

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
  // For direct objects (not from Strapi API)
  name?: string;
  slug?: string;
  icontype?: {
    url?: string;
  };
  image?: {
    url?: string;
  };
}

interface CategoriesSectionProps {
  categories: Category[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No categories available for your location.</p>
        <p className="text-gray-500 mt-2">Please check another pincode or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {categories.map((category) => {
        // Get name and slug from either attributes or direct properties
        const name = category.attributes?.name || category.name || '';
        const slug = category.attributes?.slug || category.slug || '';
        console.log('category', category);
        
        // Skip categories without a slug
        if (!slug) {
          console.warn('Category missing slug:', category.id);
          return null;
        }
        
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
        // If the category already has icontype, keep it
        const formattedCategory = {
          ...category,
          icontype: category.attributes?.icontype || category.icontype || {
            data: {
              attributes: {
                url: iconUrl
              }
            }
          }
        };
        
        return (  
          <Link 
            href={`/product-category/${encodeURIComponent(category?.attributes?.slug || category?.attributes?.name || '')}`} 
            key={category.id}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden text-center p-2 md:p-4 transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="relative h-24 w-24 mx-auto mb-3">
                {iconUrl ? (
                  <Image
                    src={iconUrl}
                    alt={name}
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-full">
                    <span className="text-3xl text-gray-400">
                      {name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-nowrap text-gray-800 group-hover:text-blue-600 transition-colors">
                {name}
              </h3>
            </div>
          </Link>
        );
      })}
    </div>
  );
} 