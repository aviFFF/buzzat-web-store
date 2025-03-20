/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

// Log the API URL on initialization
console.log("Using API URL:", API_URL);

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
          service_pincodes: string; // JSON string of pincodes
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
    service_pincodes: string; // JSON string of pincodes
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
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${API_URL}${url}`;
};

// API functions
export const fetchProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      populate: "*",
      ...filters,
    }).toString();

    const response = await fetch(`${API_URL}/api/products?${queryParams}`);

    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const fetchProductBySlug = async (slug: string) => {
  try {
    const response = await fetch(
      `${API_URL}/api/products?filters[slug][$eq]=${slug}&populate=*`
    );

    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0] || null;
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/api/categories?populate=*`);

    if (!response.ok) {
      throw new Error(`Error fetching categories: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const fetchCategoryBySlug = async (slug: string) => {
  try {
    const response = await fetch(
      `${API_URL}/api/categories?filters[slug][$eq]=${slug}&populate[products][populate]=*`
    );

    if (!response.ok) {
      throw new Error(`Error fetching category: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0] || null;
  } catch (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
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
    console.error("Error fetching vendors:", error);
    throw error;
  }
};

// Add this function to your existing api.ts file

/* export const vendorLogin = async (phone: string, password: string) => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

    console.log("Attempting login with:", {
      phone,
      passwordLength: password.length,
    });

    // Try the dedicated login endpoint first
    try {
      const response = await fetch(`${API_URL}/api/vendor-auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login response error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        // Continue with fallback method
        throw new Error("API endpoint failed");
      }

      const data = await response.json();
      console.log("Login successful, received data:", data);

      return {
        success: true,
        jwt: data.jwt,
        vendor: data.vendor,
      };
    } catch (apiError) {
      console.warn("API endpoint error, trying fallback method:", apiError);

      // Fallback: Use the fetchVendors method
      const vendorsResponse = await fetchVendors();

      if (
        !vendorsResponse ||
        !vendorsResponse.data ||
        !Array.isArray(vendorsResponse.data)
      ) {
        throw new Error("Failed to fetch vendors data");
      }

      const vendors = vendorsResponse.data;
      console.log("Fetched vendors:", vendors);

      // Find vendor with matching phone number - UPDATED to match the actual data structure
      const vendor = vendors.find((v: any) => v && v.phone === phone);

      console.log("Found vendor:", vendor);

      if (!vendor) {
        throw new Error("No vendor found with this phone number");
      }

      // In a real app, you would NEVER do this - this is just for demonstration
      console.warn(
        "Using simulated login - in production, use a proper authentication API"
      );

      // Create a simplified vendor data object from the fetched vendor
      const vendorData = {
        id: vendor.id,
        name: vendor.name,
        phone: vendor.phone,
        email: vendor.email || "",
        address: vendor.address || "",
        pincode: vendor.pincode || "",
      };

      return {
        success: true,
        jwt: "demo-token",
        vendor: vendorData,
      };
    }
  } catch (error) {
    console.error("Vendor login error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}; */

export const vendorLogin = async (phone: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/api/vendor-auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || response.statusText);
    }

    const data = await response.json();
    console.log("Login successful, received data:", data);
    return { success: true, jwt: data.jwt, vendor: data.vendor };
  } catch (error) {
    console.error("Vendor login error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

// Check if a pincode is available for delivery
export const checkPincodeAvailability = async (pincode: string) => {
  try {
    console.log(`Checking availability for pincode: ${pincode}`);

    // First check if the pincode exists in our database
    const pincodeResponse = await fetch(
      `${API_URL}/api/pincodes?filters[code][$eq]=${pincode}`
    );

    if (!pincodeResponse.ok) {
      console.log(
        `Error response from pincode API: ${pincodeResponse.status} || Pincode Error`
      );
      return {
        available: false,
        deliveryMessage:
          "Unable to check delivery availability. Please try again later.",
      };
    }

    const pincodeData = await pincodeResponse.json();

    // If pincode doesn't exist in our database
    if (!pincodeData.data || pincodeData.data.length === 0) {
      console.log(`Pincode ${pincode} not found in database`);
      return {
        available: false,
        deliveryMessage: `Sorry, we don't deliver to ${pincode} yet`,
      };
    }

    // Check if any vendor services this pincode
    const vendorsResponse = await fetch(
      `${API_URL}/api/vendors?filters[serviceable_pincodes][code][$eq]=${pincode}&populate=*`
    );

    if (!vendorsResponse.ok) {
      console.error(
        `Error response from vendors API: ${vendorsResponse.status} ${vendorsResponse.statusText}`
      );
      return {
        available: false,
        deliveryMessage:
          "Unable to check vendor availability. Please try again later.",
      };
    }

    const vendorsData = await vendorsResponse.json();
    const vendors = vendorsData.data || [];

    if (vendors.length === 0) {
      console.log(`No vendors found for pincode ${pincode}`);
      return {
        available: false,
        deliveryMessage: `Sorry, no vendors deliver to ${pincode} yet`,
      };
    }

    // Get the first vendor that services this pincode
    const vendor = vendors[0];

    return {
      available: true,
      vendor,
      deliveryMessage: `Delivery available to ${pincode}`,
    };
  } catch (error) {
    console.error(`Error checking pincode availability:`, error);
    return {
      available: false,
      deliveryMessage:
        "Unable to check delivery availability. Please try again later.",
    };
  }
};

// Fetch categories with products by pincode
export const fetchCategoriesWithProductsByPincode = async (pincode: string) => {
  try {
    console.log(`Fetching categories with products for pincode: ${pincode}`);

    // First check if the pincode is serviceable
    const pincodeCheck = await checkPincodeAvailability(pincode);

    if (!pincodeCheck.available) {
      console.log(`Pincode ${pincode} is not serviceable`);
      return {
        available: false,
        categories: [],
        message: `No delivery available to ${pincode}`,
      };
    }

    // Fetch all categories
    const categoriesResponse = await fetch(
      `${API_URL}/api/categories?populate=*`
    );

    if (!categoriesResponse.ok) {
      console.error(
        `Error response from categories API: ${categoriesResponse.status} ${categoriesResponse.statusText}`
      );
      throw new Error(
        `Error fetching categories: ${categoriesResponse.statusText}`
      );
    }

    const categoriesData = await categoriesResponse.json();
    const allCategories = categoriesData.data || [];

    // Fetch vendors that service this pincode
    const vendorsResponse = await fetch(
      `${API_URL}/api/vendors?filters[serviceable_pincodes][code][$eq]=${pincode}&populate=*`
    );

    if (!vendorsResponse.ok) {
      console.error(
        `Error response from vendors API: ${vendorsResponse.status} ${vendorsResponse.statusText}`
      );
      throw new Error(`Error fetching vendors: ${vendorsResponse.statusText}`);
    }

    const vendorsData = await vendorsResponse.json();
    const vendors = vendorsData.data || [];

    if (vendors.length === 0) {
      console.log(`No vendors found for pincode ${pincode}`);
      return {
        available: false,
        categories: [],
        message: `No vendors available for ${pincode}`,
      };
    }

    // Get vendor IDs
    const vendorIds = vendors.map((vendor: any) => vendor.id);

    // Fetch products from these vendors
    const productsUrl = `${API_URL}/api/products?populate=category,vendor&filters[vendor][id][$in]=${vendorIds.join(
      ","
    )}&pagination[pageSize]=100`;
    const productsResponse = await fetch(productsUrl);

    if (!productsResponse.ok) {
      console.error(
        `Error response from products API: ${productsResponse.status} ${productsResponse.statusText}`
      );
      throw new Error(
        `Error fetching products: ${productsResponse.statusText}`
      );
    }

    const productsData = await productsResponse.json();
    const products = productsData.data || [];

    if (products.length === 0) {
      console.log(`No products found for pincode ${pincode}`);
      return {
        available: true,
        categories: allCategories,
        message: `No products available for ${pincode}`,
      };
    }

    // Extract category IDs from products
    const categoryIds = new Set<number>();
    products.forEach((product: any) => {
      const categoryId = product.attributes?.category?.data?.id;
      if (categoryId) {
        categoryIds.add(categoryId);
      }
    });

    // Filter categories to only include those with products
    const availableCategories = allCategories.filter((category: any) =>
      categoryIds.has(category.id)
    );

    console.log(
      `Found ${availableCategories.length} categories with products for pincode ${pincode}`
    );

    return {
      available: true,
      categories: availableCategories,
      message: `Found ${availableCategories.length} categories for ${pincode}`,
    };
  } catch (error) {
    console.error(
      `Error fetching categories with products for pincode ${pincode}:`,
      error
    );
    throw error;
  }
};

// New function to fetch a specific category with products filtered by pincode
export const fetchCategoryBySlugAndPincode = async (
  slug: string,
  pincode: string
) => {
  try {
    // First check if the pincode is serviceable
    const pincodeCheck = await checkPincodeAvailability(pincode);

    if (!pincodeCheck.available) {
      return {
        available: false,
        category: null,
      };
    }

    // Fetch the category by slug
    const categoryResponse = await fetch(
      `${API_URL}/api/categories?filters[slug][$eq]=${slug}&populate[products][populate]=*`
    );

    if (!categoryResponse.ok) {
      throw new Error(
        `Error fetching category: ${categoryResponse.statusText}`
      );
    }

    const categoryData = await categoryResponse.json();
    const category = categoryData.data?.[0] || null;

    if (!category) {
      return {
        available: true,
        category: null,
        vendor: pincodeCheck.vendor,
        deliveryMessage: pincodeCheck.deliveryMessage,
      };
    }

    // Filter products to only include those from vendors that service the pincode
    const products = category.attributes?.products?.data || [];
    const filteredProducts = products.filter((product: any) => {
      const vendor = product.attributes?.vendor?.data;
      if (!vendor) return false;

      try {
        const vendorServicePincodes = JSON.parse(
          vendor.attributes.service_pincodes || "[]"
        );
        return vendorServicePincodes.includes(pincode);
      } catch (error) {
        console.error("Error parsing vendor service areas:", error);
        return false;
      }
    });

    // Return category with filtered products
    const filteredCategory = {
      ...category,
      attributes: {
        ...category.attributes,
        products: {
          data: filteredProducts,
        },
      },
    };

    return {
      available: true,
      category: filteredCategory,
      vendor: pincodeCheck.vendor,
      deliveryMessage: pincodeCheck.deliveryMessage,
    };
  } catch (error) {
    console.error(
      `Error fetching category with slug ${slug} and pincode ${pincode}:`,
      error
    );
    throw error;
  }
};

// New function to fetch products by category name
export const fetchProductsByCategory = async (categoryName: string) => {
  try {
    console.log(`Fetching products for category: ${categoryName}`);

    // Try to find category by name first
    const nameFilter = encodeURIComponent(categoryName);
    let categoryResponse = await fetch(
      `${API_URL}/api/categories?filters[name][$eq]=${nameFilter}&populate=*`
    );

    console.log(
      `Category by name API URL: ${API_URL}/api/categories?filters[name][$eq]=${nameFilter}&populate=*`
    );

    if (!categoryResponse.ok) {
      console.error(
        `Error response from category API: ${categoryResponse.status} ${categoryResponse.statusText}`
      );
      throw new Error(
        `Error fetching category: ${categoryResponse.statusText}`
      );
    }

    let categoryData = await categoryResponse.json();
    console.log("Category data by name response:", categoryData);

    // If no category found by name, try by slug
    if (!categoryData.data || categoryData.data.length === 0) {
      console.log("No category found with name, trying slug:", categoryName);

      const slugFilter = encodeURIComponent(categoryName);
      categoryResponse = await fetch(
        `${API_URL}/api/categories?filters[slug][$eq]=${slugFilter}&populate=*`
      );

      console.log(
        `Category by slug API URL: ${API_URL}/api/categories?filters[slug][$eq]=${slugFilter}&populate=*`
      );

      if (!categoryResponse.ok) {
        console.error(
          `Error response from category slug API: ${categoryResponse.status} ${categoryResponse.statusText}`
        );
        throw new Error(
          `Error fetching category by slug: ${categoryResponse.statusText}`
        );
      }

      categoryData = await categoryResponse.json();
      console.log("Category data by slug response:", categoryData);
    }

    const category = categoryData.data?.[0];

    if (!category) {
      console.log("No category found with name or slug:", categoryName);
      return { data: [] };
    }

    console.log("Found category:", category.id, category.attributes?.name);

    // Then fetch products with that category ID
    const productsUrl = `${API_URL}/api/products?filters[category][id][$eq]=${category.id}&populate=*`;
    console.log("Products API URL:", productsUrl);

    const productsResponse = await fetch(productsUrl);

    if (!productsResponse.ok) {
      console.error(
        `Error response from products API: ${productsResponse.status} ${productsResponse.statusText}`
      );
      throw new Error(
        `Error fetching products: ${productsResponse.statusText}`
      );
    }

    const productsData = await productsResponse.json();
    console.log(
      `Found ${productsData.data?.length || 0} products for category ${
        category.attributes?.name
      }`
    );

    return productsData;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryName}:`, error);
    throw error;
  }
};

// Add this function to your existing api.ts file

export const searchProducts = async (searchTerm: string, pincode?: string) => {
  try {
    console.log(`Searching for products with term: "${searchTerm}"${pincode ? ` in pincode: ${pincode}` : ''}`);
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Add populate parameter to get all related data
    queryParams.append('populate', '*');
    
    // Add search filter - search in both name and description
    if (searchTerm) {
      // Using containsi for case-insensitive search
      queryParams.append('filters[$or][0][name][$containsi]', searchTerm);
      queryParams.append('filters[$or][1][description][$containsi]', searchTerm);
    }
    
    // Make the API request
    const url = `${API_URL}/api/products?${queryParams.toString()}`;
    console.log('Search API URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Error searching products: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Found ${data.data?.length || 0} products before pincode filtering`);
    
    // If pincode is provided, filter products by vendor service area
    if (pincode && data.data && data.data.length > 0) {
      console.log(`Filtering products for pincode: ${pincode}`);
      
      try {
        // First, get all vendors that service this pincode
        const vendorsUrl = `${API_URL}/api/vendors?filters[service_pincodes][$contains]=${pincode}`;
        console.log('Vendors API URL:', vendorsUrl);
        
        const vendorsResponse = await fetch(vendorsUrl);
        
        if (!vendorsResponse.ok) {
          console.error('Vendor API Error:', await vendorsResponse.text());
          // If vendor filtering fails, return all products
          return data;
        }
        
        const vendorsData = await vendorsResponse.json();
        console.log(`Found ${vendorsData.data?.length || 0} vendors for pincode ${pincode}`);
        
        if (!vendorsData.data || vendorsData.data.length === 0) {
          // No vendors for this pincode, return empty results
          return { ...data, data: [] };
        }
        
        const vendorIds = vendorsData.data.map((vendor: any) => vendor.id);
        console.log('Vendor IDs:', vendorIds);
        
        // Filter products to only include those from vendors that service the pincode
        const filteredProducts = data.data.filter((product: any) => {
          // Check if the product has vendors array
          if (Array.isArray(product.vendors) && product.vendors.length > 0) {
            // Check if any of the product's vendors service this pincode
            const hasServiceableVendor = product.vendors.some((vendor: any) => 
              vendorIds.includes(vendor.id)
            );
            
            if (!hasServiceableVendor) {
              console.log(`Product ${product.id} excluded - no vendor services pincode ${pincode}`);
            }
            
            return hasServiceableVendor;
          }
          
          // Legacy format check (for attributes.vendor structure)
          const vendorId = product.attributes?.vendor?.data?.id;
          const isAvailable = vendorIds.includes(vendorId);
          
          if (!isAvailable) {
            console.log(`Product ${product.id} excluded - vendor ${vendorId || 'undefined'} doesn't service pincode ${pincode}`);
          }
          
          return isAvailable;
        });
        
        console.log(`Returning ${filteredProducts.length} products after pincode filtering`);
        return { ...data, data: filteredProducts };
      } catch (filterError) {
        console.error('Error during pincode filtering:', filterError);
        // If filtering fails, return all products
        return data;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};



// Add this interface to define the order structure
export interface OrderData {
  name: string;
  email: string;
  phone: string;
  pincode: string;
  address: string;
  totalOrderValue: number;
  userid?: number;
  city: string;
  DeliveryStatus?: string;
  paymentMethod: string; // Add payment method
  codToken?: string;     // Add COD token
  vendor?: number;
  products: number[];
}

// Add this helper function to get the JWT token
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // First try to get it directly
  const token = localStorage.getItem('token');
  if (token) return token;
  
  // If not found, try to get it from the user object
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.jwt || null;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  
  return null;
};

// Add this helper function to generate a COD token
const generateCODToken = (): string => {
  // Generate a random string of 8 characters
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Add a timestamp component for uniqueness
  const timestamp = Date.now().toString(36).toUpperCase();
  
  // Combine them with a prefix
  return `COD-${randomPart}-${timestamp}`;
};

// Add this function to create an order
export const createOrder = async (orderData: OrderData) => {
  try {
    console.log('Creating order with data:', orderData);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token is available
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Using JWT token for order creation:', token);
    } else {
      console.warn('No JWT token available for order creation');
    }
    
    // Format the data according to Strapi's structure
    // The format for relationships depends on your Strapi version
    const formattedProducts = orderData.products.map((productId) => ({ id: productId }));

    console.log('Formatted products:', formattedProducts);
    const formattedData: {
      data: {
        name: string;
        email: string;
        phone: string;
        pincode: string;
        address: string;
        totalOrderValue: number;
        userid?: number;
        city: string;
        DeliveryStatus: string;
        products: { id: number }[];
        payment_id?: string;
        vendor?: number;
      };
    } = {
      data: {
        name: orderData.name,
        email: orderData.email,
        phone: orderData.phone,
        pincode: orderData.pincode,
        address: orderData.address,
        totalOrderValue: orderData.totalOrderValue,
        userid: orderData.userid,
        city: orderData.city,
        DeliveryStatus: orderData.DeliveryStatus || 'Pending',
        // For Strapi v4, use this format for products relationship
        products: formattedProducts,
        // Use payment_id instead of paymentMethod
        // payment_id: orderData.payment_id,
        vendor: orderData.vendor
      }
    };
    console.log('Sending formatted data to API:', JSON.stringify(formattedData));
    
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formattedData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Order creation error response:', errorText);
      throw new Error(`Error creating order: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Order created successfully:', data);
    
    return {
      success: true,
      order: data.data
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

export default {
  createOrder,
  fetchProducts,
  fetchProductBySlug,
  fetchCategories,
  fetchCategoryBySlug,
  fetchVendors,
  checkPincodeAvailability,
  getStrapiMedia,
  fetchCategoriesWithProductsByPincode,
  fetchCategoryBySlugAndPincode,
  fetchProductsByCategory,
  vendorLogin,
  searchProducts,
  getAuthToken,
  generateCODToken,
};
