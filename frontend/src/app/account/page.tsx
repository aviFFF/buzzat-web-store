// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import Header from '@/components/Header';

// export default function AccountPage() {
//   const { user, isAuthenticated, logout } = useAuth();
//   const router = useRouter();
  
//   // Redirect to home if not authenticated
//   useEffect(() => {
//     if (!isAuthenticated) {
//       // Dispatch event to open auth popup
//       window.dispatchEvent(new Event('open-auth-popup'));
//       // Redirect to home
//       router.push('/');
//     }
//   }, [isAuthenticated, router]);
  
//   // Default pincode state for Header
//   const [pincode, setPincode] = useState<string | null>('110001');
//   const [isServiceable, setIsServiceable] = useState(true);
//   const [deliveryMessage, setDeliveryMessage] = useState('Delivery available');
  
//   const handlePincodeChange = (newPincode: string, newIsServiceable: boolean, newMessage: string) => {
//     setPincode(newPincode);
//     setIsServiceable(newIsServiceable);
//     setDeliveryMessage(newMessage);
//   };
  
//   if (!isAuthenticated) {
//     return null; // Will redirect in useEffect
//   }
  
//   return (
//     <>
//       <Header 
//         pincode={pincode}
//         isServiceable={isServiceable}
//         deliveryMessage={deliveryMessage}
//         onPincodeChange={handlePincodeChange}
//       />
      
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
//           <h1 className="text-2xl font-bold mb-6">My Account</h1>
          
//           <div className="mb-8">
//             <div className="flex items-center space-x-4 mb-4">
//               <div className="bg-blue-100 rounded-full p-4">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold">{user?.name || 'User'}</h2>
//                 <p className="text-gray-600">+91 {user?.phone}</p>
//                 {user?.email && <p className="text-gray-600">{user.email}</p>}
//               </div>
//             </div>
//           </div>
          
//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="border border-gray-200 rounded-lg p-4">
//               <h3 className="text-lg font-semibold mb-4">My Orders</h3>
//               <p className="text-gray-500">You haven't placed any orders yet.</p>
//               <button 
//                 onClick={() => router.push('/products')}
//                 className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 Start Shopping
//               </button>
//             </div>
            
//             <div className="border border-gray-200 rounded-lg p-4">
//               <h3 className="text-lg font-semibold mb-4">Saved Addresses</h3>
//               <p className="text-gray-500">You haven't saved any addresses yet.</p>
//               <button 
//                 className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 Add New Address
//               </button>
//             </div>
//           </div>
          
//           <div className="mt-8 pt-6 border-t border-gray-200">
//             <button 
//               onClick={logout}
//               className="text-red-600 hover:text-red-800 font-medium flex items-center"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//               </svg>
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// } 