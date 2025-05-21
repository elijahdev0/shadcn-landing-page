import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>; // Password will be ignored for magic link
  logout: () => Promise<void>;
  // Removed signup function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Mock login function - Magic Link Style (any email logs in)
  const login = async (email: string, _pass?: string): Promise<{ success: boolean; error?: string }> => { // Password (_pass) is ignored
    console.log('Attempting magic link login with:', email); // For testing
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email && email.includes('@')) { // Basic email validation
          const mockUser: User = { id: Date.now().toString(), email: email, name: email.split('@')[0] }; // Create user from email
          setUser(mockUser);
          setIsAuthenticated(true);
          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'Please enter a valid email address.' });
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

  // Removed signup function

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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