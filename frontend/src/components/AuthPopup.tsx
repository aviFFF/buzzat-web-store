'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export interface AuthPopupProps {
  onClose: () => void;
  onLogin: (userData: any, token: string) => void;
  onLogout: () => void;
  redirectToCheckout?: boolean;
}

export default function AuthPopup({ onClose, onLogin, onLogout, redirectToCheckout = false }: AuthPopupProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { isAuthenticated, user, loginUser, registerUser } = useAuth();
  const router = useRouter();
  
  const validateForm = () => {
    setError('');
    
    if (isLoginMode) {
      if (!email) return 'Email is required';
      if (!password) return 'Password is required';
    } else {
      if (!name) return 'Name is required';
      if (!email) return 'Email is required';
      if (!phoneNumber) return 'Phone number is required';
      if (phoneNumber.length !== 10) return 'Phone number must be 10 digits';
      if (!password) return 'Password is required';
      if (password.length < 6) return 'Password must be at least 6 characters';
      if (password !== confirmPassword) return 'Passwords do not match';
    }
    
    return null;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      if (isLoginMode) {
        // Login with Strapi
        const result = await loginUser(email, password);
        
        console.log('Login result:', result);
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Login failed. Please check your credentials.');
        }
        
        // Call the onLogin callback with both user and token
        onLogin(result.user, result.token);
        
        if (redirectToCheckout) {
          router.push('/checkout');
        }
      } else {
        // Register with Strapi
        const result = await registerUser({
          name,
          email,
          phone: phoneNumber,
          password
        });
        
        console.log('Registration result:', result);
        
        if (!result.success) {
          // Check for specific error messages
          const errorMsg = result.error?.message || '';
          if (errorMsg.includes('Email or Username are already taken')) {
            throw new Error('This email is already registered. Please login instead.');
          } else {
            throw new Error(errorMsg || 'Registration failed. Please try again.');
          }
        }
        
        // Call the onLogin callback with both user and token
        onLogin(result.user, result.token);
        
        if (redirectToCheckout) {
          router.push('/checkout');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };
  
  const navigateToAccount = () => {
    router.push('/account');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isAuthenticated ? 'My Account' : (isLoginMode ? 'Login' : 'Sign Up')}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {isAuthenticated ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  {(() => {
                    // Get userProfile from localStorage
                    const userProfile = typeof window !== 'undefined' ? localStorage.getItem('userProfile') : null;
                    const profileData = userProfile ? JSON.parse(userProfile) : null;
                    
                    return (
                      <>
                        <p className="font-medium text-gray-800">{profileData?.name || user?.name || user?.username || 'User'}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        {(profileData?.phone || user?.phone) && (
                          <p className="text-sm text-gray-500">+91 {profileData?.phone || user?.phone}</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => {/* Navigate to orders */}}
                  className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mb-3 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  My Orders
                </button>
                
                <button
                  onClick={navigateToAccount}
                  className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mb-3 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </button>
                
                {redirectToCheckout && (
                  <button
                    onClick={() => {
                      router.push('/checkout');
                      onClose();
                    }}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-3 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Proceed to Checkout
                  </button>
                )}
                
                <button
                  onClick={handleLogoutClick}
                  className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginMode && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                
                {!isLoginMode && (
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                        +91
                      </span>
                      <input
                        type="tel"
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter your 10-digit number"
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={10}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={isLoginMode ? "Enter your password" : "Create a password"}
                  />
                </div>
                
                {!isLoginMode && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLoginMode ? 'Logging in...' : 'Signing up...'}
                    </span>
                  ) : (
                    <span>{isLoginMode ? 'Login' : 'Sign Up'}</span>
                  )}
                </button>
              </form>
              
              <div className="mt-4 text-center text-sm">
                {isLoginMode ? (
                  <p>
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setIsLoginMode(false)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsLoginMode(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Login
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 