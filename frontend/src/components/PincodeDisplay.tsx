'use client';

import { useState } from 'react';
import PincodePopup from './PincodePopup';

interface PincodeDisplayProps {
  pincode: string;
  isServiceable: boolean;
  deliveryMessage: string;
  onPincodeChange: (pincode: string, isServiceable: boolean, message: string) => void;
}

export default function PincodeDisplay({ 
  pincode, 
  isServiceable, 
  deliveryMessage, 
  onPincodeChange 
}: PincodeDisplayProps) {
  const [showPopup, setShowPopup] = useState(false);

  if (!pincode) {
    return null;
  }

  return (
    <>
      <div className="flex items-center">
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-blue-600 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-gray-700">Delivering to: </span>
          <span className="ml-1 text-sm font-bold text-blue-800">{pincode}</span>
          
          {isServiceable ? (
            <span className="ml-2 text-xs text-green-600">
              ✓ Available
            </span>
          ) : (
            <span className="ml-2 text-xs text-red-600">
              ✗ Not available
            </span>
          )}
        </div>
        
        <button 
          onClick={() => setShowPopup(true)}
          className="ml-2 text-xs text-blue-700 hover:text-blue-900 underline"
        >
          Change
        </button>
      </div>

      {showPopup && (
        <PincodePopup 
          onClose={() => setShowPopup(false)} 
          onPincodeSet={(newPincode, newIsServiceable, newMessage) => {
            onPincodeChange(newPincode, newIsServiceable, newMessage);
            if (newIsServiceable) {
              setShowPopup(false);
            }
          }}
        />
      )}
    </>
  );
} 