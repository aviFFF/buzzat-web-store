'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkPincodeAvailability } from '../services/api';

interface PincodeSelectorProps {
  onPincodeSelect: (pincode: string) => void;
  selectedPincode: string;
  isMobile?: boolean;
}

export default function PincodeSelector({ onPincodeSelect, selectedPincode, isMobile = false }: PincodeSelectorProps) {
  const router = useRouter();
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch delivery message for selected pincode
  useEffect(() => {
    const fetchDeliveryMessage = async () => {
      if (!selectedPincode) return;
      
      try {
        const result = await checkPincodeAvailability(selectedPincode);
        if (result.available && result.deliveryMessage) {
          setDeliveryMessage(result.deliveryMessage);
        } else {
          setDeliveryMessage('');
        }
      } catch (error) {
        console.error('Error fetching delivery message:', error);
        setDeliveryMessage('');
      }
    };
    
    fetchDeliveryMessage();
  }, [selectedPincode]);

  const handlePincodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input
    if (value === '' || /^[0-9]+$/.test(value)) {
      setPincodeInput(value);
      setPincodeError('');
    }
  };

  const checkPincode = async () => {
    // Validate pincode
    if (!pincodeInput) {
      setPincodeError('Please enter a pincode');
      return;
    }
    
    if (pincodeInput.length !== 6) {
      setPincodeError('Pincode must be 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      // Check if the pincode is available
      const result = await checkPincodeAvailability(pincodeInput);
      
      if (result.available) {
        // Pincode is available
        onPincodeSelect(pincodeInput);
        localStorage.setItem('selectedPincode', pincodeInput);
        
        // Set delivery message
        if (result.deliveryMessage) {
          setDeliveryMessage(result.deliveryMessage);
        }
        
        setIsPincodeModalOpen(false);
        router.push('/'); // Go to homepage
      } else {
        // Pincode is not available
        localStorage.setItem('tempPincode', pincodeInput); // Store the unavailable pincode
        router.push('/coming-soon'); // Go to coming soon page
        setIsPincodeModalOpen(false);
      }
    } catch (error) {
      console.error('Error checking pincode:', error);
      setPincodeError('Error checking pincode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Pincode Button */}
      <button
        type="button"
        className={`inline-flex items-center ${isMobile 
          ? 'px-2 py-1 text-xs' 
          : 'px-4 py-2 text-base'} border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        onClick={() => setIsPincodeModalOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-5 w-5 mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {selectedPincode ? selectedPincode : isMobile ? 'Pincode' : 'Select Pincode'}
      </button>

      {/* Delivery Message */}
      {deliveryMessage && selectedPincode && (
        <div className={`flex items-center text-green-600 font-medium ${isMobile ? 'text-xs mt-1' : 'mt-2'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-5 w-5 mr-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {deliveryMessage}
        </div>
      )}

      {/* Pincode Modal */}
      {isPincodeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setIsPincodeModalOpen(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Enter your Pincode
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Please enter your pincode to check if we deliver to your area.
                      </p>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="pincode"
                          id="pincode"
                          className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${pincodeError ? 'border-red-300' : ''}`}
                          placeholder="Enter pincode"
                          value={pincodeInput}
                          onChange={handlePincodeInputChange}
                          maxLength={6}
                        />
                        {pincodeError && (
                          <p className="mt-2 text-sm text-red-600">{pincodeError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={checkPincode}
                  disabled={isLoading}
                >
                  {isLoading ? 'Checking...' : 'Check Pincode'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsPincodeModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 