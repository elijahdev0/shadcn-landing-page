import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (email: string, pass: string, name?: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Mock login function
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    console.log('Attempting login with:', email, pass); // For testing
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'user@example.com' && pass === 'password') {
          const mockUser: User = { id: '1', email: 'user@example.com', name: 'Test User' };
          setUser(mockUser);
          setIsAuthenticated(true);
          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'Invalid email or password' });
        }
      }, 1000);
    });
  };

  // Mock logout function
  const logout = async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser(null);
        setIsAuthenticated(false);
        resolve();
      }, 500);
    });
  };

  // Mock signup function
  const signup = async (email: string, pass: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    console.log('Attempting signup with:', email, pass, name); // For testing
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate user already exists
        if (email === 'exists@example.com') {
          resolve({ success: false, error: 'User already exists with this email' });
        } else {
          const newUser: User = { id: Date.now().toString(), email, name };
          setUser(newUser);
          setIsAuthenticated(true);
          resolve({ success: true });
        }
      }, 1000);
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};