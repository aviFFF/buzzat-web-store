const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export interface PincodeCheckResponse {
  serviceable: boolean;
  message: string;
  vendors: Array<{
    id: number;
    name: string;
    delivery_message: string;
  }>;
  products?: any[];
  categories?: any[];
}

export async function checkPincodeServiceability(pincode: string): Promise<PincodeCheckResponse> {
  try {
    // Use the correct API URL - ensure it's the Strapi URL
    const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    console.log('Checking pincode serviceability at:', `${API_URL}/api/vendors/pincode/${pincode}`);
    
    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_URL}/api/vendors/pincode/${pincode}?_t=${timestamp}`);
    
    if (!response.ok) {
      console.error(`Pincode check failed with status: ${response.status}`);
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking pincode:', error);
    return {
      serviceable: false,
      message: 'Error checking pincode serviceability',
      vendors: []
    };
  }
}

export function savePincodeToLocalStorage(pincode: string, isServiceable: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userPincode', pincode);
    localStorage.setItem('isPincodeServiceable', String(isServiceable));
    
    document.cookie = `userPincode=${pincode}; path=/; max-age=2592000`; // 30 days
    document.cookie = `isPincodeServiceable=${isServiceable}; path=/; max-age=2592000`;
  }
}

export function getPincodeFromLocalStorage(): { pincode: string | null, isServiceable: boolean } {
  if (typeof window !== 'undefined') {
    const pincode = localStorage.getItem('userPincode');
    const isServiceable = localStorage.getItem('isPincodeServiceable') === 'true';
    return { pincode, isServiceable };
  }
  return { pincode: null, isServiceable: false };
}

export function clearPincodeFromLocalStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userPincode');
    localStorage.removeItem('isPincodeServiceable');
    
    document.cookie = 'userPincode=; path=/; max-age=0';
    document.cookie = 'isPincodeServiceable=; path=/; max-age=0';
  }
} 