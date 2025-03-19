'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getPincodeFromLocalStorage, checkPincodeServiceability, savePincodeToLocalStorage } from '@/services/pincode';

interface PincodeContextType {
  pincode: string | null;
  isServiceable: boolean;
  deliveryMessage: string;
  pincodeData: any;
  updatePincode: (newPincode: string, newIsServiceable: boolean, message: string) => void;
}

const PincodeContext = createContext<PincodeContextType | undefined>(undefined);

export const PincodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pincode, setPincode] = useState<string | null>(null);
  const [isServiceable, setIsServiceable] = useState<boolean>(false);
  const [deliveryMessage, setDeliveryMessage] = useState<string>('');
  const [pincodeData, setPincodeData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0); // Used to force re-render

  useEffect(() => {
    // Check if we have a pincode in localStorage
    const { pincode, isServiceable } = getPincodeFromLocalStorage();
    
    if (pincode) {
      setPincode(pincode);
      setIsServiceable(isServiceable);
      setDeliveryMessage(`Delivery available to ${pincode}`);
      
      if (isServiceable) {
        fetchPincodeData(pincode);
      }
    }
  }, []);

  const fetchPincodeData = async (pincodeToCheck: string) => {
    try {
      const response = await checkPincodeServiceability(pincodeToCheck);
      setPincodeData(response);
      if (response.serviceable) {
        setDeliveryMessage(response.message || 'Delivery available in your area');
      }
    } catch (error) {
      console.error('Error fetching data for pincode:', error);
    }
  };

  const updatePincode = (newPincode: string, newIsServiceable: boolean, message: string) => {
    // Only update if the pincode has changed
    if (newPincode !== pincode) {
      console.log('Pincode changed from', pincode, 'to', newPincode);
      setPincode(newPincode);
      setIsServiceable(newIsServiceable);
      setDeliveryMessage(message);
      
      // Save to localStorage
      savePincodeToLocalStorage(newPincode, newIsServiceable);
      
      // If pincode is serviceable, fetch data
      if (newIsServiceable) {
        fetchPincodeData(newPincode);
      }
      
      // Force a re-render of components that depend on this context
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <PincodeContext.Provider 
      value={{ 
        pincode, 
        isServiceable, 
        deliveryMessage,
        pincodeData,
        updatePincode
      }}
    >
      {/* The key prop forces a re-render when pincode changes */}
      <div key={refreshKey}>
        {children}
      </div>
    </PincodeContext.Provider>
  );
};

export const usePincode = () => {
  const context = useContext(PincodeContext);
  if (context === undefined) {
    throw new Error('usePincode must be used within a PincodeProvider');
  }
  return context;
};
