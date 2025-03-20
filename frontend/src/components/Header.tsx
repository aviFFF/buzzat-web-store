'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PincodePopup from './PincodePopup';
import AuthPopup from './AuthPopup';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { CartItem, getCartItems, updateCartItemQuantity, getCartTotals } from '@/utils/cartUtils';
import SearchBar from './SearchBar';

interface Category {
  id: number;
  attributes: {
    name: string;
    slug: string;
    icon: string;
    description?: string;
  };
}

interface Vendor {
  id: number;
  attributes: {
    name: string;
    pincode: string;
    categories: {
      data: Category[];
    };
  };
}

interface HeaderProps {
  pincode: string | null;
  isServiceable: boolean;
  deliveryMessage: string;
  onPincodeChange: (pincode: string, isServiceable: boolean, message: string) => void;
}

export default function Header({ 
  pincode, 
  isServiceable, 
  deliveryMessage, 
  onPincodeChange 
}: HeaderProps) {
  const [showPincodePopup, setShowPincodePopup] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showCartSlider, setShowCartSlider] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get auth context
  const { user, isAuthenticated, login, logout } = useAuth();
  const router = useRouter();
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotals, setCartTotals] = useState({
    totalItems: 0,
    subtotal: 0,
    deliveryFee: 40,
    total: 0
  });
  const [lastAddedItem, setLastAddedItem] = useState<number | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const loadCart = () => {
      const items = getCartItems();
      setCartItems(items);
      setCartTotals(getCartTotals());
    };
    
    // Load cart initially
    loadCart();
    
    // Listen for cart updates
    const handleCartUpdate = (e: Event) => {
      loadCart();
      
      // Check if this is an add event with product details
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.action === 'add') {
        setLastAddedItem(customEvent.detail.product.id);
        setTimeout(() => {
          setLastAddedItem(null);
        }, 2000);
      }
    };
    
    window.addEventListener('cart-updated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  // Listen for auth popup events
  useEffect(() => {
    const handleOpenAuthPopup = () => {
      setShowAuthPopup(true);
    };
    
    window.addEventListener('open-auth-popup', handleOpenAuthPopup);
    
    return () => {
      window.removeEventListener('open-auth-popup', handleOpenAuthPopup);
    };
  }, []);
  
  // Handle user login
  const handleLogin = (userData: any) => {
    login(userData);
    setShowAuthPopup(false);
  };
  
  // Handle user logout
  const handleLogout = () => {
    logout();
  };
  
  // Close cart slider when clicking outside
  const cartSliderRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartSliderRef.current && !cartSliderRef.current.contains(event.target as Node)) {
        setShowCartSlider(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement search functionality
  };
  
  // Prevent body scroll when cart slider is open
  useEffect(() => {
    if (showCartSlider) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showCartSlider]);

  const pincodePopupRef = useRef<HTMLDivElement>(null);
  const loginPopupRef = useRef<HTMLDivElement>(null);
  
  // Update cart item quantity
  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    updateCartItemQuantity(id, newQuantity);
  };

  // Close user dropdown when clicking outside
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Custom pincode display for header
  const renderPincodeInfo = (isMobile = false) => {
    if (!pincode) {
      return (
        <button 
          onClick={() => setShowPincodePopup(true)}
          className={`text-sm bg-gray-50 hover:bg-gray-100 text-blue-600 hover:text-blue-800 flex items-center px-3 py-1.5 rounded-full border border-gray-200 transition-colors ${isMobile ? 'text-xs px-2 py-1' : ''}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`${isMobile ? 'h-3 w-3 mr-0.5' : 'h-4 w-4 mr-1'}`}
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Set Location
        </button>
      );
    }
    
    return (
      <div className="flex flex-col">
        <button 
          onClick={() => setShowPincodePopup(true)}
          className={`text-sm bg-gray-50 hover:bg-gray-100 flex items-center px-3 py-1.5 rounded-full border border-gray-200 transition-colors ${isMobile ? 'text-xs px-2 py-1' : ''}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`${isMobile ? 'h-3 w-3 mr-0.5' : 'h-4 w-4 mr-1'} text-blue-600`}
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className={`font-medium ${isServiceable ? 'text-gray-700' : 'text-red-600'}`}>
            {pincode}
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`${isMobile ? 'h-3 w-3 ml-0.5' : 'h-4 w-4 ml-1'} text-gray-400`}
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Add delivery message below pincode */}
        {isServiceable && deliveryMessage && (
          <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-green-600 mt-1 text-center`}>
            {deliveryMessage}
          </span>
        )}
      </div>
    );
  };

  // Cart Slider content
  const renderCartContent = () => {
    if (cartItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-4">Add items to get started</p>
          <button 
            onClick={() => setShowCartSlider(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {cartItems.map(item => {
          const isNewlyAdded = lastAddedItem === item.id;
          
          return (
            <div 
              key={item.id} 
              className={`flex items-center p-3 rounded-xl transition-colors ${
                isNewlyAdded 
                  ? 'bg-blue-50 border border-blue-200 animate-pulse' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="w-16 h-16 rounded-lg bg-white p-1 border border-gray-200 flex-shrink-0 overflow-hidden relative">
                {item.image ? (
                  <Image 
                    src={item.image} 
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-grow">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <p className="text-blue-600 font-medium">₹{item.price}</p>
              </div>
              
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button 
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  -
                </button>
                <span className="px-3 py-1 bg-white text-center w-8">{item.quantity}</span>
                <button 
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto md:px-4 px-2 py-3">
        {/* Desktop Layout */}
        <div className="hidden md:flex md:w-full flex-grow gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-2xl font-bold text-blue-600 flex items-center">
              <span className="text-3xl mr-1">🛒</span>
              buzzAt
            </div>
          </Link>
          
          {/* Pincode */}
          <div className="flex-shrink-0">
            {renderPincodeInfo()}
          </div>
          
          {/* Search Bar */}
         <SearchBar className='w-full '/>
          
          {/* Account & Cart */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden md:inline">{user?.name || 'Account'}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 ml-1 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200 animate-fade-in">
                    <Link 
                      href="/refer-and-earn"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Refer & Earn
                      </div>
                    </Link>
                    <Link 
                      href="/my-orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        My Orders
                      </div>
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setShowUserDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
            <button 
                onClick={() => setShowAuthPopup(true)}
              className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
                <span className="hidden md:inline">Login</span>
            </button>
            )}
            
            <button 
              onClick={() => setShowCartSlider(true)}
              className="cart-trigger flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors relative"
            >
              {cartTotals.totalItems > 0 && (
                <span className="absolute -top-3 right-0 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartTotals.totalItems}
                </span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="ml-1 text-sm font-medium"></span>
            </button>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex-shrink-0">
                <div className="text-xl font-bold text-blue-600 flex items-center">
                  <span className="text-2xl mr-1">🛒</span>
                  buzzAt
                </div>
              </Link>

                             {/* Pincode (Mobile) */}
              <div className="flex-shrink-0">
                {renderPincodeInfo(true)}
              </div>
              
              {/* Cart & Account */}
              <div className="flex items-center space-x-3">
                {isAuthenticated ? (
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="text-gray-700 hover:text-blue-600 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                    
                    {/* Mobile User Dropdown */}
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200 animate-fade-in">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="font-medium text-gray-800">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link 
                          href="/refer-and-earn"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Refer & Earn
                          </div>
                        </Link>
                        <Link 
                          href="/my-orders"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            My Orders
                          </div>
                        </Link>
                        <button 
                          onClick={() => {
                            handleLogout();
                            setShowUserDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                <button 
                    onClick={() => setShowAuthPopup(true)}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                )}
                
                <button 
                  onClick={() => setShowCartSlider(true)}
                  className="cart-trigger text-gray-700 hover:text-blue-600 transition-colors relative"
                >
                  {cartTotals.totalItems > 0 && (
                    <span className="absolute -top-3 right-0 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartTotals.totalItems}
                    </span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
 
              
              {/* Search Bar (Mobile) */}
              <div className="flex-grow">
                <SearchBar className='w-full '/>
                
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pincode Popup */}
      {showPincodePopup && (
        <PincodePopup 
          onClose={() => setShowPincodePopup(false)} 
          // onPincodeSet={(newPincode, newIsServiceable, newMessage) => {
          //   onPincodeChange(newPincode, newIsServiceable, newMessage);
          //   setShowPincodePopup(false);
          // }}
        />
      )}
      
      {/* Auth Popup */}
      {showAuthPopup && (
        <AuthPopup 
          onClose={() => setShowAuthPopup(false)} 
          onLogin={handleLogin}
          onLogout={handleLogout}
          redirectToCheckout={cartItems.length > 0}
        />
      )}
      
      {/* Cart Slider */}
      <AnimatePresence>
        {showCartSlider && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowCartSlider(false)}
            />
            
            {/* Cart Slider */}
            <motion.div 
              className="cart-slider fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-hidden flex flex-col"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              ref={cartSliderRef}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h2 className="text-lg font-bold">Your Cart ({cartTotals.totalItems} items)</h2>
                </div>
                <button 
                  onClick={() => setShowCartSlider(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Pull indicator */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full"></div>
              
              {/* Cart Items */}
              <div className="flex-grow overflow-y-auto p-4">
                {renderCartContent()}
              </div>
              
              {/* Footer with total and checkout button */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-medium">₹{cartTotals.subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">Delivery</span>
                    <span className="font-medium">₹{cartTotals.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 text-lg font-bold">
                    <span>Total</span>
                    <span>₹{cartTotals.total}</span>
                  </div>
                  {isAuthenticated ? (
                  <Link 
                    href="/checkout"
                    className="block w-full py-3 bg-blue-600 text-white text-center rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => setShowCartSlider(false)}
                  >
                    Proceed to Checkout
                  </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setShowCartSlider(false);
                        setShowAuthPopup(true);
                      }}
                      className="block w-full py-3 bg-blue-600 text-white text-center rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Login to Checkout
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
} 