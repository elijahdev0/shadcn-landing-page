import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient, Session, User as SupabaseUser } from '@supabase/supabase-js';

// Supabase Client Initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const appRedirectUrl = import.meta.env.VITE_APP_REDIRECT_URL as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file."
  );
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  session: Session | null;
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUserToProfile = (supabaseUser: SupabaseUser | null): UserProfile | null => {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    // Assuming 'full_name' and 'avatar_url' might be in user_metadata
    // Adjust these based on your Supabase user_metadata structure
    name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
    avatarUrl: supabaseUser.user_metadata?.avatar_url,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start with loading true

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(mapSupabaseUserToProfile(session?.user ?? null));
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(mapSupabaseUserToProfile(session?.user ?? null));
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true, // Creates user if they don't exist
          emailRedirectTo: appRedirectUrl || window.location.origin + '/dashboard', // Fallback if VITE_APP_REDIRECT_URL is not set
        },
      });
      if (error) throw error;
      // No direct user/session update here, onAuthStateChange will handle it.
      // Inform the user to check their email.
      return { success: true };
    } catch (err: any) {
      console.error('Supabase Magic Link error:', err);
      return { success: false, error: err.message || 'Failed to send magic link.' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: appRedirectUrl || window.location.origin,
        }
      });
      if (error) throw error;
      // onAuthStateChange will handle the session and user state update
      return { success: true };
    } catch (err: any) {
      console.error('Supabase Google OAuth error:', err);
      return { success: false, error: err.message || 'Google login failed.' };
    } finally {
      setLoading(false); // May not be hit if redirect happens, but good for error cases
    }
  };

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // User and session will be set to null by onAuthStateChange
      return { success: true };
    } catch (err: any) {
      console.error('Supabase logout error:', err);
      return { success: false, error: err.message || 'Logout failed.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, session, signInWithMagicLink, loginWithGoogle, logout, loading }}>
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