'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name?: string;
  username?: string;
  phone?: string;
  email?: string;
  jwt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  registerUser: (userData: any) => Promise<any>;
  loginUser: (email: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  registerUser: async () => {},
  loginUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

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

      if (data.error) {
        throw new Error(data.error.message || 'Registration failed');
      }

      // Store the additional user data in localStorage
      // This is a workaround until we can properly update the user profile in Strapi
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
        jwt: data.jwt,
      };

      // Login the user after successful registration
      login(formattedUser);
      
      return { success: true, user: formattedUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error };
    }
  };

  // Login user with Strapi
  const loginUser = async (email: string, password: string) => {
    try {
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

      if (data.error) {
        throw new Error(data.error.message || 'Login failed');
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
        jwt: data.jwt,
      };

      // Login the user
      login(formattedUser);
      
      return { success: true, user: formattedUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    
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
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    
    // Dispatch event for components that need to know about auth changes
    window.dispatchEvent(new Event('auth-changed'));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout,
      registerUser,
      loginUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 