'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // You'll need to install this package

interface User {
  id: string;
  name?: string;
  username?: string;
  phone?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  registerUser: (userData: any) => Promise<any>;
  loginUser: (email: string, password: string) => Promise<any>;
  isTokenExpired: () => boolean;
  getAuthHeader: () => Record<string, string> | undefined;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  registerUser: async () => {},
  loginUser: async () => {},
  isTokenExpired: () => true,
  getAuthHeader: () => undefined,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user and token from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Check if token is expired
        try {
          const decodedToken = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp && decodedToken.exp < currentTime) {
            // Token is expired, log out
            console.log('Token expired, logging out');
            logout();
            return;
          }
        } catch (tokenError) {
          console.error('Error decoding token:', tokenError);
          logout();
          return;
        }
        
        // Token is valid
        setUser(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Check if token is expired
  const isTokenExpired = (): boolean => {
    if (!token) return true;
    
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      return decodedToken.exp ? decodedToken.exp < currentTime : true;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  // Get authorization header for API requests
  const getAuthHeader = (): Record<string, string> | undefined => {
    if (!token || isTokenExpired()) return undefined;
    return { Authorization: `Bearer ${token}` };
  };

  // Register a new user with Strapi
  const registerUser = async (userData: any) => {
    try {
      // Register the user with Strapi's default fields
      const response = await fetch(`${API_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.email,
          email: userData.email,
          password: userData.password,
        }),
      });

      const data = await response.json();
      
      // Log the full response to see what we're getting
      console.log('Registration API response:', data);

      if (data.error) {
        throw new Error(data.error.message || 'Registration failed');
      }

      // Extract the JWT token
      const jwtToken = data.jwt;
      if (!jwtToken) {
        console.error('No JWT token in registration response:', data);
        throw new Error('Authentication failed: No token received');
      }

      // Store the additional user data in localStorage
      const userProfile = {
        name: userData.name,
        phone: userData.phone,
      };
      
      localStorage.setItem('userProfile', JSON.stringify(userProfile));

      // Format user data
      const formattedUser = {
        id: data.user.id,
        username: data.user.username,
        name: userData.name,
        email: data.user.email,
        phone: userData.phone,
      };

      // Login the user after successful registration
      login(formattedUser, jwtToken);
      
      return { 
        success: true, 
        user: formattedUser, 
        token: jwtToken 
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error };
    }
  };

  // Login user with Strapi
  const loginUser = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', email);
      
      const response = await fetch(`${API_URL}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password: password,
        }),
      });

      const data = await response.json();
      
      // Log the full response to see what we're getting
      console.log('Login API response:', data);

      if (data.error) {
        throw new Error(data.error.message || 'Login failed');
      }

      // Extract the JWT token
      const jwtToken = data.jwt;
      if (!jwtToken) {
        console.error('No JWT token in login response:', data);
        throw new Error('Authentication failed: No token received');
      }

      // Check if we have additional user data in localStorage
      let name = data.user.username;
      let phone = '';
      
      try {
        const userProfile = localStorage.getItem('userProfile');
        if (userProfile) {
          const profile = JSON.parse(userProfile);
          name = profile.name || name;
          phone = profile.phone || phone;
        }
      } catch (e) {
        console.error('Error parsing user profile:', e);
      }

      // Format user data
      const formattedUser = {
        id: data.user.id,
        username: data.user.username,
        name: name,
        email: data.user.email,
        phone: phone,
      };

      // Login the user with the token
      login(formattedUser, jwtToken);
      
      return { 
        success: true, 
        user: formattedUser, 
        token: jwtToken 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  const login = (userData: User, jwtToken?: string) => {
    console.log('Login function called with user data:', userData);
    
    // Use the token from the parameter or from the user object
    const tokenToUse = jwtToken;
    console.log('JWT token present:', !!tokenToUse);
    
    if (!tokenToUse) {
      console.warn('No JWT token provided during login');
    }
    
    setUser(userData);
    setToken(tokenToUse || null);
    setIsAuthenticated(true);
    
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Store token separately for easier access
    if (tokenToUse) {
      localStorage.setItem('token', tokenToUse);
    }
    
    // Also store the profile data separately
    const userProfile = {
      name: userData.name,
      phone: userData.phone,
    };
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Dispatch event for components that need to know about auth changes
    window.dispatchEvent(new Event('auth-changed'));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    
    // Dispatch event for components that need to know about auth changes
    window.dispatchEvent(new Event('auth-changed'));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      isAuthenticated, 
      login, 
      logout,
      registerUser,
      loginUser,
      isTokenExpired,
      getAuthHeader
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
