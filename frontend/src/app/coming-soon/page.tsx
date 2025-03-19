'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPincodeFromLocalStorage } from '@/services/pincode';
import PincodePopup from '@/components/PincodePopup';
import Header from '@/components/Header';
import Image from 'next/image';

export default function ComingSoonPage() {
  const [pincode, setPincode] = useState<string | null>(null);
  const [isServiceable, setIsServiceable] = useState<boolean>(false);
  const [deliveryMessage, setDeliveryMessage] = useState<string>('');
  const [showPincodePopup, setShowPincodePopup] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    const { pincode, isServiceable } = getPincodeFromLocalStorage();
    setPincode(pincode);
    setIsServiceable(isServiceable);
    
    // If the pincode is serviceable, redirect to the original path or home
    if (pincode && isServiceable) {
      router.push(redirectPath);
    }
  }, [router, redirectPath]);

  const handlePincodeSet = (newPincode: string, newIsServiceable: boolean, newMessage: string) => {
    setPincode(newPincode);
    setIsServiceable(newIsServiceable);
    setDeliveryMessage(newMessage);
    
    if (newIsServiceable) {
      router.push(redirectPath);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-xl">
          <div className="text-center mb-8">
            <div className="relative h-32 w-32 mx-auto mb-6">
              <Image 
                src="/coming-soon.svg" 
                alt="Coming Soon" 
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">We're Coming Soon!</h1>
            
            <div className="mb-6">
              <p className="text-xl text-gray-600 mb-2">
                We're not yet available in your area
              </p>
              {pincode && (
                <p className="text-gray-500">
                  Pincode: <span className="font-medium">{pincode}</span>
                </p>
              )}
              <p className="text-gray-500 mt-4">
                We're expanding quickly! Check back soon or try another pincode.
          </p>
        </div>
      </div>

          <div className="mb-8">
            <button
              onClick={() => setShowPincodePopup(true)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium"
            >
              Try Another Pincode
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Get notified when we arrive in your area</h2>
            
          {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                      required
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Notify Me'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  We'll notify you as soon as we start delivering to your area. No spam, promise!
                </p>
              </form>
          ) : (
              <div className="text-center p-4 bg-green-50 rounded-lg">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12 text-green-500 mx-auto mb-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
                <h3 className="text-lg font-medium text-gray-900">Thank you!</h3>
                <p className="text-gray-600 mt-1">
                We'll notify you as soon as we start delivering to your area.
              </p>
              </div>
            )}
            </div>
        </div>
        
        {showPincodePopup && (
          <PincodePopup 
            onClose={() => setShowPincodePopup(false)} 
            onPincodeSet={handlePincodeSet}
          />
        )}
      </div>
    </>
  );
} 