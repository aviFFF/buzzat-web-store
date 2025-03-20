'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  checkPincodeServiceability, 
  savePincodeToLocalStorage, 
  getPincodeFromLocalStorage 
} from '@/services/pincode';
import { usePincode } from '@/context/PincodeContext';

interface PincodePopupProps {
  onClose: () => void;
}

export default function PincodePopup({ onClose }: PincodePopupProps) {
  const [pincode, setPincode] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Use the pincode context
  const { updatePincode } = usePincode();

  // Initialize with saved pincode if available
  useEffect(() => {
    const { pincode: savedPincode } = getPincodeFromLocalStorage();
    if (savedPincode) {
      setPincode(savedPincode);
    }
  }, []);

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
      
      // Update the context with the new pincode information
      updatePincode(
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
        </div>
      </div>
    </div>
  );
}
