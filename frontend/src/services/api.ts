const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

// Types
export interface Product {
  id: number;
  attributes: {
    name: string;
    description: string;
    price: number;
    stock: number;
    images: {
      data: Array<{
        id: number;
        attributes: {
          url: string;
          formats: {
            thumbnail: { url: string };
            small: { url: string };
            medium: { url: string };
          };
        };
      }>;
    };
    category: {
      data: {
        id: number;
        attributes: {
          name: string;
          slug: string;
        };
      };
    };
    vendor: {
      data: {
        id: number;
        attributes: {
          name: string;
          service_areas: string; // JSON string of pincodes
          delivery_message: string;
        };
      };
    };
    slug: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Category {
  id: number;
  attributes: {
    name: string;
    description: string;
    slug: string;
    products: {
      data: Product[];
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface Vendor {
  id: number;
  attributes: {
    name: string;
    email: string;
    phone: string;
    address: string;
    service_areas: string; // JSON string of pincodes
    delivery_message: string;
    logo: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}

// Helper function to format image URLs
export const getStrapiMedia = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('//')) return url;
  return `${API_URL}${url}`;
};

// API functions
export const fetchProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      populate: '*',
      ...filters,
    }).toString();
    
    const response = await fetch(`${API_URL}/api/products?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductBySlug = async (slug: string) => {
  try {
    const response = await fetch(`${API_URL}/api/products?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/api/categories?populate=*`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchCategoryBySlug = async (categoryName: string) => {
  try {
    const response = await fetch(`${API_URL}/api/categories?filters[name][$eq]=${encodeURIComponent(categoryName)}&populate[products][populate]=*`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    throw error;
  }
};

export const fetchVendors = async () => {
  try {
    const response = await fetch(`${API_URL}/api/vendors?populate=*`);
    
    if (!response.ok) {
      throw new Error(`Error fetching vendors: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
};

export const checkPincodeAvailability = async (pincode: string) => {
  try {
    const response = await fetch(`${API_URL}/api/vendors?populate=*`);
    
    if (!response.ok) {
      throw new Error(`Error checking pincode: ${response.statusText}`);
    }
    
    const data = await response.json();
    const vendors = data.data || [];
    
    // Check if any vendor serves this pincode
    const matchingVendor = vendors.find((vendor: any) => {
      if (vendor.attributes.service_areas) {
        try {
          const vendorPincodes = JSON.parse(vendor.attributes.service_areas);
          return vendorPincodes.includes(pincode);
        } catch (error) {
          console.error('Error parsing vendor service areas:', error);
          return false;
        }
      }
      return false;
    });
    
    if (matchingVendor) {
      return {
        available: true,
        vendor: matchingVendor,
        deliveryMessage: matchingVendor.attributes.delivery_message || null
      };
    }
    
    return { available: false, vendor: null, deliveryMessage: null };
  } catch (error) {
    console.error('Error checking pincode availability:', error);
    throw error;
  }
};

// New function to fetch categories with products filtered by pincode
export const fetchCategoriesWithProductsByPincode = async (pincode: string) => {
  try {
    // First check if the pincode is serviceable
    const pincodeCheck = await checkPincodeAvailability(pincode);
    
    if (!pincodeCheck.available) {
      return { 
        available: false, 
        categories: [] 
      };
    }
    
    // Fetch all categories
    const categoriesResponse = await fetch(`${API_URL}/api/categories?populate[products][populate]=*`);
    
    if (!categoriesResponse.ok) {
      throw new Error(`Error fetching categories: ${categoriesResponse.statusText}`);
    }
    
    const categoriesData = await categoriesResponse.json();
    const categories = categoriesData.data || [];
    
    // Filter products in each category based on vendor service areas
    const filteredCategories = categories.map((category: any) => {
      const products = category.attributes?.products?.data || [];
      
      // Filter products to only include those from vendors that service the pincode
      const filteredProducts = products.filter((product: any) => {
        const vendor = product.attributes?.vendor?.data;
        if (!vendor) return false;
        
        try {
          const vendorServiceAreas = JSON.parse(vendor.attributes.service_areas || '[]');
          return vendorServiceAreas.includes(pincode);
        } catch (error) {
          console.error('Error parsing vendor service areas:', error);
          return false;
        }
      });
      
      // Return category with filtered products
      return {
        ...category,
        attributes: {
          ...category.attributes,
          products: {
            data: filteredProducts
          }
        }
      };
    });
    
    // Filter out categories with no products
    const categoriesWithProducts = filteredCategories.filter(
      (category: any) => category.attributes.products.data.length > 0
    );
    
    return { 
      available: true, 
      categories: categoriesWithProducts,
      vendor: pincodeCheck.vendor,
      deliveryMessage: pincodeCheck.deliveryMessage
    };
  } catch (error) {
    console.error('Error fetching categories with products by pincode:', error);
    throw error;
  }
};

// New function to fetch a specific category with products filtered by pincode
export const fetchCategoryBySlugAndPincode = async (slug: string, pincode: string) => {
  try {
    // First check if the pincode is serviceable
    const pincodeCheck = await checkPincodeAvailability(pincode);
    
    if (!pincodeCheck.available) {
      return { 
        available: false, 
        category: null 
      };
    }
    
    // Fetch the category by slug
    const categoryResponse = await fetch(
      `${API_URL}/api/categories?filters[slug][$eq]=${slug}&populate[products][populate]=*`
    );
    
    if (!categoryResponse.ok) {
      throw new Error(`Error fetching category: ${categoryResponse.statusText}`);
    }
    
    const categoryData = await categoryResponse.json();
    const category = categoryData.data?.[0] || null;
    
    if (!category) {
      return {
        available: true,
        category: null,
        vendor: pincodeCheck.vendor,
        deliveryMessage: pincodeCheck.deliveryMessage
      };
    }
    
    // Filter products to only include those from vendors that service the pincode
    const products = category.attributes?.products?.data || [];
    const filteredProducts = products.filter((product: any) => {
      const vendor = product.attributes?.vendor?.data;
      if (!vendor) return false;
      
      try {
        const vendorServiceAreas = JSON.parse(vendor.attributes.service_areas || '[]');
        return vendorServiceAreas.includes(pincode);
      } catch (error) {
        console.error('Error parsing vendor service areas:', error);
        return false;
      }
    });
    
    // Return category with filtered products
    const filteredCategory = {
      ...category,
      attributes: {
        ...category.attributes,
        products: {
          data: filteredProducts
        }
      }
    };
    
    return { 
      available: true, 
      category: filteredCategory,
      vendor: pincodeCheck.vendor,
      deliveryMessage: pincodeCheck.deliveryMessage
    };
  } catch (error) {
    console.error(`Error fetching category with slug ${slug} and pincode ${pincode}:`, error);
    throw error;
  }
};

export default {
  fetchProducts,
  fetchProductBySlug,
  fetchCategories,
  fetchCategoryBySlug,
  fetchVendors,
  checkPincodeAvailability,
  getStrapiMedia,
  fetchCategoriesWithProductsByPincode,
  fetchCategoryBySlugAndPincode
}; 