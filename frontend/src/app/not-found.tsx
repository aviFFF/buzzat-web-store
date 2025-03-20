import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Colorful illustration side */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-7xl md:text-9xl font-bold text-white mb-4">404</h1>
              <div className="relative h-40 w-40 mx-auto">
                <Image 
                  src="/images/404-illustration.svg" 
                  alt="Page not found illustration"
                  fill
                  className="object-contain"
                  unoptimized={true}
                  // If you don't have this image, replace with the SVG below
                />
                {/* Fallback SVG if image doesn't exist */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-40 w-40 text-white/80" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Content side */}
          <div className="w-full md:w-1/2 p-8">
            <div className="h-full flex flex-col">
              <div className="flex-grow">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Oops! Page Not Found</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  The page you're looking for doesn't exist or has been moved.
                </p>
                
                <div className="space-y-4 mb-8">
                  <Link href="/" className="flex items-center group">
                    <span className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Back to Homepage
                    </span>
                  </Link>
                  
                  <Link href="/product-category" className="flex items-center group">
                    <span className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      Browse Products
                    </span>
                  </Link>
                  
                  <Link href="/cart" className="flex items-center group">
                    <span className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      View Cart
                    </span>
                  </Link>
                </div>
              </div>
              
              {/* Search box */}
              <div className="mt-auto">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search for products..." 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 transition-colors">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Colorful footer */}
        <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-4 text-center text-white">
          <p className="text-sm font-medium">
            Need help? <a href="/contact" className="underline hover:text-white/80">Contact our support team</a>
          </p>
        </div>
      </div>
    </section>
  );
}
