'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  checkPincodeServiceability, 
  savePincodeToLocalStorage, 
  getPincodeFromLocalStorage 
} from '@/services/pincode';

interface PincodeCheckProps {
  onServiceabilityChange?: (isServiceable: boolean, message: string) => void;
  redirectOnNotServiceable?: boolean;
}

export default function PincodeCheck({ 
  onServiceabilityChange, 
  redirectOnNotServiceable = true 
}: PincodeCheckProps) {
  const [pincode, setPincode] = useState('');
  const [savedPincode, setSavedPincode] = useState<string | null>(null);
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { pincode, isServiceable } = getPincodeFromLocalStorage();
    if (pincode) {
      setSavedPincode(pincode);
      setIsServiceable(isServiceable);
    }
  }, []);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setPincode(value);
    }
  };

  const checkPincode = async () => {
    if (pincode.length !== 6) {
      setMessage('Please enter a valid 6-digit pincode');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await checkPincodeServiceability(pincode);
      
      setIsServiceable(response.serviceable);
      setMessage(response.message || (response.serviceable ? 'Delivery available in your area' : 'No delivery available in your area'));
      
      // Save to localStorage
      savePincodeToLocalStorage(pincode, response.serviceable);
      setSavedPincode(pincode);
      
      // Notify parent component
      if (onServiceabilityChange) {
        onServiceabilityChange(response.serviceable, response.message || '');
      }
      
      // Redirect if not serviceable
      if (!response.serviceable && redirectOnNotServiceable) {
        router.push('/coming-soon');
      }
    } catch (error) {
      console.error('Error checking pincode:', error);
      setMessage('Error checking pincode. Please try again.');
      setIsServiceable(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full max-w-md mx-auto p-4 border rounded-lg shadow-sm">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={pincode}
          onChange={handlePincodeChange}
          placeholder="Enter pincode"
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={6}
        />
        <button
          onClick={checkPincode}
          disabled={isLoading || pincode.length !== 6}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isLoading ? 'Checking...' : 'Check'}
        </button>
      </div>
      
      {savedPincode && (
        <div className="text-sm">
          <span className="font-medium">Current pincode:</span> {savedPincode}
          {isServiceable !== null && (
            <span className={`ml-2 ${isServiceable ? 'text-green-600' : 'text-red-600'}`}>
              {isServiceable ? '(Serviceable)' : '(Not serviceable)'}
            </span>
          )}
        </div>
      )}
      
      {message && (
        <div className={`text-sm ${isServiceable ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </div>
      )}
    </div>
  );
} 