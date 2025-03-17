import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require pincode serviceability check
const PROTECTED_ROUTES = [
  '/cart',
  '/checkout',
  '/product/'
];

export function middleware(request: NextRequest) {
  // Check if the current path is in the protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Get pincode from cookies
    const isPincodeServiceable = request.cookies.get('isPincodeServiceable')?.value === 'true';
    const hasPincode = request.cookies.has('userPincode');

    // If no pincode or not serviceable, redirect to coming-soon
    if (!hasPincode || !isPincodeServiceable) {
      // Store the original URL to redirect back after pincode check
      const url = new URL('/coming-soon', request.url);
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     * - coming-soon page (to avoid redirect loops)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api|coming-soon).*)',
  ],
}; 