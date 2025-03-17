/**
 * vendor controller
 */

import { factories } from '@strapi/strapi'

// Define interfaces for better type safety
interface ProductAttributes {
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
  [key: string]: any; // Allow any other properties
}

interface Product {
  id: number;
  attributes: ProductAttributes;
}

interface Category {
  id: number;
  attributes?: {
    name?: string;
    slug?: string;
    image?: any;
    // Add other category properties as needed
  };
}

interface Vendor {
  id: number;
  name?: string;
  service_pincodes?: string[] | any;
  delivery_message?: string;
}

// Define a more flexible interface for the populated vendor data
interface PopulatedVendor {
  id: number;
  name?: string;
  service_pincodes?: string[] | any;
  delivery_message?: string;
  products?: any[];
  categories?: any[];
  [key: string]: any; // Allow any other properties
}

export default factories.createCoreController('api::vendor.vendor', ({ strapi }) => ({
  // Find vendors that service a specific pincode
  async findByPincode(ctx) {
    try {
      const { pincode } = ctx.params;
      
      if (!pincode) {
        return ctx.badRequest('Pincode is required');
      }

      // Get the server URL for constructing absolute image URLs
      const serverUrl = strapi.config.server.url || `http://${strapi.config.server.host}:${strapi.config.server.port}`;
      
      // Find all vendors with populated products and categories
      const vendorsData = await strapi.entityService.findMany('api::vendor.vendor', {
        populate: {
          products: {
            populate: ['image', 'category']
          },
          categories: {
            populate: ['image']
          }
        }
      });

      // Safety check
      if (!vendorsData || !Array.isArray(vendorsData)) {
        console.error('Invalid vendors data returned from Strapi:', vendorsData);
        return {
          serviceable: false,
          message: 'Error retrieving vendor data',
          vendors: []
        };
      }

      // Cast the vendors data to our flexible interface
      const vendors = vendorsData as unknown as PopulatedVendor[];

      // Filter vendors that service the pincode
      const serviceableVendors = vendors.filter(vendor => {
        try {
          // service_pincodes is already a JSON value, no need to parse
          const servicePincodes = vendor?.service_pincodes;
          // Check if it's an array and includes the pincode
          return Array.isArray(servicePincodes) && servicePincodes.includes(pincode);
        } catch (error) {
          // If there's any error processing service_pincodes
          console.error('Error checking service_pincodes for vendor:', vendor?.id, error);
          return false;
        }
      });

      if (!serviceableVendors || serviceableVendors.length === 0) {
        return {
          serviceable: false,
          message: 'No vendors service this pincode',
          vendors: []
        };
      }

      // Get all products and categories from serviceable vendors
      const allProducts: Product[] = [];
      const categoriesMap = new Map();
      
      // Helper function to ensure URL is absolute
      const ensureAbsoluteUrl = (url: string): string => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        // If it's a relative URL starting with /uploads, make it absolute
        if (url.startsWith('/uploads')) {
          return `${serverUrl}${url}`;
        }
        return url;
      };
      
      // Process products and categories
      serviceableVendors.forEach(vendor => {
        // Process products
        if (vendor.products && Array.isArray(vendor.products)) {
          vendor.products.forEach(product => {
            if (product && product.id) {
              // Format product for frontend
              const formattedProduct: Product = { 
                id: product.id,
                attributes: {
                  name: product.name || 'Product',
                  slug: product.slug || `product-${product.id}`,
                  mrp: product.mrp || 0,
                  sellingPrice: product.sellingPrice || 0,
                  description: product.description || ''
                }
              };
              
              // Ensure image is properly formatted for frontend
              if (product.image) {
                console.log('Raw product image data:', JSON.stringify(product.image, null, 2));
                
                // Case 1: Direct URL in product.image.url
                if (product.image.url) {
                  const absoluteUrl = ensureAbsoluteUrl(product.image.url);
                  (formattedProduct.attributes as any).image = {
                    data: {
                      attributes: {
                        url: absoluteUrl,
                        formats: {
                          thumbnail: { url: absoluteUrl }
                        }
                      }
                    }
                  };
                } 
                // Case 2: Nested data structure with documentId
                else if (product.image.documentId) {
                  const imageUrl = product.image.url || `/uploads/${product.image.hash}${product.image.ext}`;
                  const absoluteUrl = ensureAbsoluteUrl(imageUrl);
                  (formattedProduct.attributes as any).image = {
                    data: {
                      attributes: {
                        url: absoluteUrl,
                        formats: {
                          thumbnail: { url: absoluteUrl }
                        }
                      }
                    }
                  };
                }
                // Case 3: Already in Strapi format
                else if (product.image.data && product.image.data.attributes) {
                  // Make sure the URL is absolute
                  if (product.image.data.attributes.url) {
                    product.image.data.attributes.url = ensureAbsoluteUrl(product.image.data.attributes.url);
                    
                    // Also update thumbnail URL if it exists
                    if (product.image.data.attributes.formats?.thumbnail?.url) {
                      product.image.data.attributes.formats.thumbnail.url = 
                        ensureAbsoluteUrl(product.image.data.attributes.formats.thumbnail.url);
                    }
                  }
                  (formattedProduct.attributes as any).image = product.image;
                }
                // Case 4: Handle array of images (take the first one)
                else if (Array.isArray(product.image) && product.image.length > 0) {
                  const firstImage = product.image[0];
                  if (firstImage.url) {
                    const absoluteUrl = ensureAbsoluteUrl(firstImage.url);
                    (formattedProduct.attributes as any).image = {
                      data: {
                        attributes: {
                          url: absoluteUrl,
                          formats: {
                            thumbnail: { url: absoluteUrl }
                          }
                        }
                      }
                    };
                  } else if (firstImage.data && firstImage.data.attributes) {
                    // Make sure the URL is absolute
                    if (firstImage.data.attributes.url) {
                      firstImage.data.attributes.url = ensureAbsoluteUrl(firstImage.data.attributes.url);
                      
                      // Also update thumbnail URL if it exists
                      if (firstImage.data.attributes.formats?.thumbnail?.url) {
                        firstImage.data.attributes.formats.thumbnail.url = 
                          ensureAbsoluteUrl(firstImage.data.attributes.formats.thumbnail.url);
                      }
                    }
                    (formattedProduct.attributes as any).image = firstImage;
                  }
                }
              }
              
              // Log product data for debugging
              console.log('Formatted product data:', {
                id: formattedProduct.id,
                name: formattedProduct.attributes.name,
                slug: formattedProduct.attributes.slug,
                image: formattedProduct.attributes.image ? 
                  formattedProduct.attributes.image.data?.attributes?.url : 'No image'
              });
              
              allProducts.push(formattedProduct);
              
              // Get category from product if available
              if (product.category) {
                const category = product.category;
                    if (category && category.id) {
                      categoriesMap.set(category.id, category);
                }
              }
            }
          });
        }
        
        // Process categories directly from vendor
        if (vendor.categories && Array.isArray(vendor.categories)) {
          vendor.categories.forEach(category => {
            if (category && category.id) {
              categoriesMap.set(category.id, category);
            }
          });
        }
      });
      
      // Convert the categories map to an array and format for frontend
      const categories = Array.from(categoriesMap.values()).map(category => {
        // Format category to match the expected structure in the frontend
        const formattedCategory = { ...category };
        
        // Ensure category has attributes
        if (!formattedCategory.attributes) {
          formattedCategory.attributes = {
            name: category.name || 'Category',
            slug: category.slug || `category-${category.id}`
          };
        }
        
        // Make sure the image field is directly accessible
        if (category.image) {
          formattedCategory.image = category.image;
          
          // Also format image for icontype structure expected by frontend
          if (category.image.url) {
            const absoluteUrl = ensureAbsoluteUrl(category.image.url);
            formattedCategory.icontype = {
              data: {
                attributes: {
                  url: absoluteUrl
                }
              }
            };
          } else if (category.image.documentId) {
            const imageUrl = category.image.url || `/uploads/${category.image.hash}${category.image.ext}`;
            const absoluteUrl = ensureAbsoluteUrl(imageUrl);
            formattedCategory.icontype = {
              data: {
                attributes: {
                  url: absoluteUrl
                }
              }
            };
          }
        }
        
        // Log the category data for debugging
        console.log('Category data:', {
          id: category.id,
          name: formattedCategory.attributes.name,
          slug: formattedCategory.attributes.slug,
          image: category.image ? ensureAbsoluteUrl(category.image.url) || 
            (category.image.hash ? ensureAbsoluteUrl(`/uploads/${category.image.hash}${category.image.ext}`) : null) : null
        });
        
        return formattedCategory;
      });
      
      console.log(`Found ${categories.length} categories and ${allProducts.length} products for pincode ${pincode}`);

      // Safely create the response
      const response = {
        serviceable: true,
        message: serviceableVendors[0]?.delivery_message || 'Delivery available in your area',
        vendors: serviceableVendors.map(vendor => ({
          id: vendor?.id || 0,
          name: vendor?.name || '',
          delivery_message: vendor?.delivery_message || ''
        })),
        products: allProducts || [],
        categories: categories || []
      };

      return response;
    } catch (error) {
      console.error('Error checking pincode serviceability:', error);
      return ctx.badRequest('Error checking pincode serviceability: ' + error.message);
    }
  }
})); 