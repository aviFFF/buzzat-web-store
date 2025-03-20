/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { vendorLogin } from '@/services/api';
import { getToken } from '@/app(route)/vendor/page';
// import { createToken } from '@/lib/jwt';

// Define the vendor login form data type
interface VendorLoginFormData {
  phone: string;
  password: string;
}

export default function VendorLoginPage() {
  const [formData, setFormData] = useState<VendorLoginFormData>({
    phone: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if vendor is already logged in
  useEffect(() => {
    const vendorInfo = localStorage.getItem('vendorInfo');
    if (vendorInfo) {
      router.push('/vendor/orders');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      // Validate phone number format
      if (!/^\d{10}$/.test(formData.phone)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }
  
      // Call the vendor login API
      const loginResult = await vendorLogin(formData.phone, formData.password);
      
      if (!loginResult.success) {
        setError(loginResult.error || 'Login failed. Please try again.');
        toast.error(loginResult.error || 'Login failed. Please try again.');
        setIsLoading(false);
        return; // Return early instead of throwing
      }
      
      // Store vendor info in localStorage
      localStorage.setItem('vendorInfo', JSON.stringify(loginResult.vendor));

      // const token = createToken(loginResult.vendor);
      const token = await getToken(loginResult?.vendor);
      localStorage.setItem('token', token);
      
      // Show success message
      toast.success('Login successful!');
      
      // Redirect to vendor dashboard
      router.push('/vendor/orders');
      
    } catch (error) {
      console.error('Login error:', error);      
      let errorMessage = 'An unknown error occurred';
      if (typeof error === 'object' && error !== null) {
        if ('response' in error && error.response && typeof error.response === 'object' && error.response !== null && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && error.response.data !== null && 'error' in error.response.data && error.response.data.error && typeof error.response.data.error === 'object' && error.response.data.error !== null) {
          // Try to extract a more specific error message from Strapi's response
          if ('message' in error.response.data.error && typeof error.response.data.error.message === 'string') {
            errorMessage = error.response.data.error.message || errorMessage;
          }
          if ('details' in error.response.data.error && error.response.data.error.details && Array.isArray(error.response.data.error.details) && error.response.data.error.details.length > 0 && 'messages' in error.response.data.error.details[0] && Array.isArray(error.response.data.error.details[0].messages) && error.response.data.error.details[0].messages.length > 0 && 'id' in error.response.data.error.details[0].messages[0] && typeof error.response.data.error.details[0].messages[0].id === 'string') {
            errorMessage = error.response.data.error.details[0].messages[0].id || errorMessage;
          }
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Vendor Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your vendor dashboard to manage products and orders
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your 10-digit phone number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have a vendor account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link 
                href="/vendor/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register as a vendor
              </Link>
            </div>
          </div>
          
          {/* Add a development mode helper */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Development Mode</h3>
              <p className="text-xs text-gray-500 mb-2">
                For testing purposes, you can use any phone number that exists in the vendors database.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
