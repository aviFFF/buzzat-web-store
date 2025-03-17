'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  checkPincodeServiceability, 
  savePincodeToLocalStorage, 
  getPincodeFromLocalStorage 
} from '@/services/pincode';

interface PincodePopupProps {
  onClose: () => void;
  onPincodeSet: (pincode: string, isServiceable: boolean, message: string) => void;
}

// Sample pincodes for demonstration - replace with your actual pincodes
const SAMPLE_PINCODES = ['110001', '110002', '110003', '400001', '400002', '500001', '600001'];

export default function PincodePopup({ onClose, onPincodeSet }: PincodePopupProps) {
  const [pincode, setPincode] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Filter suggestions as user types
  useEffect(() => {
    if (pincode.length >= 3) {
      const filtered = SAMPLE_PINCODES.filter(p => p.startsWith(pincode));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [pincode]);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setPincode(value);
      setError('');
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setPincode(suggestion);
    setSuggestions([]);
  };

  const checkPincode = async () => {
    if (pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await checkPincodeServiceability(pincode);
      
      // Save to localStorage
      savePincodeToLocalStorage(pincode, response.serviceable);
      
      // Notify parent component
      onPincodeSet(
        pincode, 
        response.serviceable, 
        response.message || (response.serviceable ? 'Delivery available in your area' : 'No delivery available in your area')
      );
      
      // Close popup if serviceable
      if (response.serviceable) {
        onClose();
      } else {
        setError(response.message || 'Delivery not available in your area');
      }
    } catch (error) {
      console.error('Error checking pincode:', error);
      setError('Error checking pincode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={popupRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all"
        style={{ 
          backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Enter Your Pincode</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Enter your pincode to check if we deliver to your area
          </p>
          
          <div className="relative mb-4">
            <div className="flex items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={pincode}
                  onChange={handlePincodeChange}
                  placeholder="Enter pincode"
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  maxLength={6}
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                        onClick={() => selectSuggestion(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={checkPincode}
                disabled={isLoading || pincode.length !== 6}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-r-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium transition-all"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Check'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            <p>We deliver to select areas. Enter your pincode to check availability.</p>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Pincodes</h3>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PINCODES.slice(0, 5).map((code) => (
              <button
                key={code}
                onClick={() => selectSuggestion(code)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 