import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_AUTH_KEY = 'react-auth-state';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedAuth = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
    return storedAuth ? JSON.parse(storedAuth).isAuthenticated : false;
  });
  const [user, setUser] = useState<User | null>(() => {
    const storedAuth = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
    return storedAuth ? JSON.parse(storedAuth).user : null;
  });

  useEffect(() => {
    // This effect runs once on mount to try and load persisted state
    // The useState initializers above already handle the initial load.
    // This effect could be used for more complex scenarios like token validation.
    // For now, we ensure that if the state is somehow out of sync, it gets corrected.
    const storedAuth = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
    if (storedAuth) {
      const { isAuthenticated: storedIsAuthenticated, user: storedUser } = JSON.parse(storedAuth);
      if (isAuthenticated !== storedIsAuthenticated) setIsAuthenticated(storedIsAuthenticated);
      if (JSON.stringify(user) !== JSON.stringify(storedUser)) setUser(storedUser);
    }
  }, []); // Empty dependency array ensures this runs only once on mount


  const login = async (email: string, _pass?: string): Promise<{ success: boolean; error?: string }> => {
    console.log('Attempting magic link login with:', email);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email && email.includes('@')) {
          const mockUser: User = { id: Date.now().toString(), email: email, name: email.split('@')[0] };
          setUser(mockUser);
          setIsAuthenticated(true);
          localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify({ isAuthenticated: true, user: mockUser }));
          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'Please enter a valid email address.' });
        }
      }, 1000);
    });
  };

  const logout = async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
        resolve();
      }, 500);
    });
  };

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