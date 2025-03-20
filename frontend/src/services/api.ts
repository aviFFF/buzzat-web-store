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
    console.error(
      `Error fetching products for category ${categoryName}:`,
      error
    );
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
  fetchCategoryBySlugAndPincode,
  fetchProductsByCategory,
  vendorLogin,
};
