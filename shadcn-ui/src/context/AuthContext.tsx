import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, apiKey?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  redirectTo?: string;
  setRedirectTo: (path: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check for stored user session
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate authentication
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser = {
        id: 1,
        email,
        name: email.split('@')[0],
        role: 'student'
      };

      setUser(mockUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, apiKey?: string): Promise<void> => {
    try {
      // In a real app, this would be an API call
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser = {
        id: Date.now(),
        email,
        name,
        role: 'student'
      };

      setUser(mockUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, logout, isLoading, redirectTo, setRedirectTo }}>
      {children}
    </AuthContext.Provider>
  );
};