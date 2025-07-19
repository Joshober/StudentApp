import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  openrouter_api_key?: string;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, apiKey?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  redirectTo?: string;
  setRedirectTo: (path: string) => void;
  validateSession: () => Promise<boolean>;
  checkOAuthCookies: () => void;
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

  // Check for OAuth cookies and integrate with localStorage
  const checkOAuthCookies = () => {
    if (typeof window === 'undefined') return;
    
    // Check if there's a user_data cookie from OAuth
    const cookies = document.cookie.split(';');
    const userDataCookie = cookies.find(cookie => cookie.trim().startsWith('user_data='));
    
    if (userDataCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Clear the cookie after reading it
        document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } catch (error) {
        console.error('Error parsing OAuth cookie:', error);
      }
    }
  };

  // Validate if stored user still exists in database
  const validateSession = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/auth/validate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        // User no longer exists, clear session
        logout();
        return false;
      }

      const data = await response.json();
      if (data.valid) {
        // Update user data if needed
        setUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      logout();
      return false;
    }
  };

  useEffect(() => {
    // Check for OAuth cookies first
    checkOAuthCookies();
    
    // Check for stored user session
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Validate the session in the background
          validateSession().catch(error => {
            console.error('Session validation failed:', error);
            logout();
          });
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
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed');
      }

      setUser(data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, apiKey?: string): Promise<void> => {
    try {
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          openrouterApiKey: apiKey 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed');
      }

      setUser(data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
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
    <AuthContext.Provider value={{ user, signIn, signUp, logout, isLoading, redirectTo, setRedirectTo, validateSession, checkOAuthCookies }}>
      {children}
    </AuthContext.Provider>
  );
};