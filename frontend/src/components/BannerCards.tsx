'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Banner {
  id: number;
  title: string;
  link: string;
  imageUrl: string;
}

export default function BannerCards() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
        console.log('Fetching banners from:', `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/banners?populate=*`);
        
        const response = await fetch(
          `${API_URL}/api/banners?populate=*`
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Raw banner data:', data);
          
          if (!data.data || !Array.isArray(data.data)) {
            console.error('Unexpected data format:', data);
            setBanners([]);
            return;
          }
          
          const transformedBanners = data.data.map((item: any) => {
            // Extract image URL with careful validation
            let imageUrl = '';
            
            // Get image URL from all possible paths in the response data
            if (item.attributes?.image?.data?.attributes?.url) {
              imageUrl = item.attributes.image.data.attributes.url;
            } else if (item.attributes?.image?.url) {
              imageUrl = item.attributes.image.url;
            } else if (item.image?.data?.attributes?.url) {
              imageUrl = item.image.data.attributes.url;
            } else if (item.image?.url) {
              imageUrl = item.image.url;
            }
            
            try {
              // Ensure URL is valid
              if (imageUrl) {
                // Add base URL if it's a relative path
                if (!imageUrl.startsWith('http')) {
                  imageUrl = `${API_URL}${imageUrl}`;
                }
                
                // Validate URL is properly formed
                new URL(imageUrl);
              } else {
                // Use a placeholder if no valid image URL
                imageUrl = 'https://placehold.co/600x400?text=Banner';
              }
            } catch (err) {
              console.error('Invalid image URL:', imageUrl, err);
              // Fallback to placeholder
              imageUrl = 'https://placehold.co/600x400?text=Banner';
            }
            
            console.log('Final image URL for banner:', imageUrl);
            
            return {
              id: item.id,
              title: item.attributes?.title || item.title || 'Banner',
              link: item.attributes?.link || item.link || '/',
              imageUrl: imageUrl
            };
          });
          
          console.log('Transformed banners:', transformedBanners);
          setBanners(transformedBanners);
        } else {
          console.error('Failed to fetch banners:', response.status, response.statusText);
          setBanners([]);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((key) => (
              <div key={key} className="rounded-xl overflow-hidden shadow-md bg-gray-200 animate-pulse h-48" />
            ))}
          </div>
          <div className="md:hidden">
            <div className="rounded-xl overflow-hidden shadow-md bg-gray-200 animate-pulse h-48" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        {/* Desktop - Three Banner Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {banners.map(banner => (
            <Link 
              key={banner.id} 
              href={banner.link}
              className="block rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                  onError={(e) => {
                    // Replace with placeholder on error
                    const imgElement = e.currentTarget as HTMLImageElement;
                    imgElement.onerror = null; // Prevent infinite loop
                    imgElement.src = 'https://placehold.co/600x400?text=Banner';
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
        
        {/* Mobile - Single Banner Card */}
        {banners[0] && (
          <div className="hidden">
            <Link 
              href={banners[0].link}
              className="block rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={banners[0].imageUrl}
                  alt={banners[0].title}
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                  onError={(e) => {
                    // Replace with placeholder on error
                    const imgElement = e.currentTarget as HTMLImageElement;
                    imgElement.onerror = null; // Prevent infinite loop
                    imgElement.src = 'https://placehold.co/600x400?text=Banner';
                  }}
                />
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
} 