import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import PocketBase, { RecordModel } from 'pocketbase';

// Initialize PocketBase client
const pb = new PocketBase('http://127.0.0.1:8090');

interface User {
  id: string;
  email: string;
  name?: string;      // From PocketBase 'name' field, if it exists
  avatarUrl?: string; // URL for the avatar
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>; // Standard email/password login
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  requestOtp: (email: string) => Promise<{ success: boolean; otpId?: string; error?: string }>;
  loginWithOtp: (otpId: string, otpCode: string) => Promise<{ success: boolean; error?: string }>;
  checkUserExists: (email: string) => Promise<{ exists: boolean; isVerified?: boolean; error?: string }>;
  createAccount: (email: string, pass: string) => Promise<{ success: boolean; needsVerification?: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapPbRecordToUser = (record: RecordModel | null): User | null => {
  if (!record) return null;
  let avatarUrl;
  if (record.avatar) { // Assuming 'avatar' is the filename field for the avatar
    try {
        // Ensure collectionId and id are available on the record model for getUrl
        // For authStore.model, these should be present.
        avatarUrl = pb.files.getUrl(record, record.avatar as string, { thumb: '100x100' });
    } catch (e) {
        console.error("Error getting avatar URL:", e);
        avatarUrl = undefined;
    }
  }
  return {
    id: record.id,
    email: record.email as string,
    name: record.name as string || undefined,
    avatarUrl,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
      setUser(mapPbRecordToUser(pb.authStore.model));
    }, true); // fireImmediately to set initial state

    // Validate token with server if one exists from localStorage
    if (pb.authStore.isValid) {
      pb.collection('users').authRefresh().catch(() => {
        // If refresh fails, clear the store.
        // The onChange listener (already set up) will handle the state update.
        pb.authStore.clear();
      });
    }

    return () => {
      unsubscribe();
    };
  }, []); // Run once on mount

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await pb.collection('users').authWithPassword(email, pass);
      // State updates are handled by the pb.authStore.onChange listener
      return { success: true };
    } catch (err: any) {
      // It's good practice to check if err has a message property
      const errorMessage = err?.message || (err?.data?.message || 'Login failed. Please check your credentials.');
      if (err?.originalError) console.error('PocketBase login error:', err.originalError);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    pb.authStore.clear();
    // State updates are handled by the pb.authStore.onChange listener
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await pb.collection('users').authWithOAuth2({ provider: 'google' });
      // Auth state updates are handled by pb.authStore.onChange
      return { success: true };
    } catch (err: any) {
      console.error('PocketBase Google OAuth2 error:', err.originalError || err);
      const errorMessage = err?.message || (err?.data?.message || 'Google login failed. Please try again.');
      return { success: false, error: errorMessage };
    }
  };

  const requestOtp = async (email: string): Promise<{ success: boolean; otpId?: string; error?: string }> => {
    console.log('[AuthContext] Attempting to request OTP for email:', email);
    try {
      const result = await pb.collection('users').requestOTP(email);
      console.log('[AuthContext] OTP request successful. Result:', result);
      return { success: true, otpId: result.otpId };
    } catch (err: any) {
      console.error('[AuthContext] PocketBase OTP request error:', err);
      if (err.originalError) {
        console.error('[AuthContext] Original error details:', err.originalError);
      }
      if (err.data) {
        console.error('[AuthContext] Error data:', err.data);
      }
      const errorMessage = err?.message || (err?.data?.message || 'Failed to request OTP. Please check the email and try again.');
      console.log('[AuthContext] OTP request failed. Error message:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const loginWithOtp = async (otpId: string, otpCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await pb.collection('users').authWithOTP(otpId, otpCode);
      // Auth state updates are handled by pb.authStore.onChange
      return { success: true };
    } catch (err: any) {
      console.error('PocketBase OTP login error:', err.originalError || err);
      const errorMessage = err?.message || (err?.data?.message || 'OTP login failed. The code may be invalid or expired.');
      return { success: false, error: errorMessage };
    }
  };

  const checkUserExists = async (email: string): Promise<{ exists: boolean; isVerified?: boolean; error?: string }> => {
    const trimmedEmail = email.trim();
    console.log(`[AuthContext] checkUserExists (via API rule): Checking for email: "${trimmedEmail}"`);
    if (!trimmedEmail) {
      console.log('[AuthContext] checkUserExists (via API rule): Email is empty.');
      return { exists: false, error: "Email cannot be empty." };
    }

    try {
      // We only need to know if at least one record exists, so page 1, 1 record is enough.
      // We also only need the 'verified' field if it exists.
      console.log(`[AuthContext] Calling users.getList with filter: email = "${trimmedEmail}"`);
      const result = await pb.collection('users').getList(1, 1, {
        filter: `email = "${trimmedEmail}"`, // Using direct email string in filter
        fields: 'id,verified' // Request only id and verified status
      });

      if (result.items.length > 0) {
        console.log(`[AuthContext] User found. ID: ${result.items[0].id}, Verified: ${result.items[0].verified}`);
        return { exists: true, isVerified: result.items[0].verified };
      } else {
        console.log('[AuthContext] User not found via getList.');
        return { exists: false };
      }
    } catch (err: any) {
      console.error('[AuthContext] Error checking user existence via getList:', err);
      let errorMessage = 'Failed to check user status.';
      if (err.data && err.data.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.originalError?.message) { // PocketBase often wraps errors
        errorMessage = err.originalError.message;
      }
      
      // If it's a 403 or 401, it might mean API rules are not set up for public access
      if (err.status === 403 || err.status === 401) {
          const specificError = `Access to query users collection denied (Status: ${err.status}). Please ensure 'List access' API rule for 'users' collection allows public queries.`;
          console.warn("[AuthContext] Potential API rule issue: " + specificError, err.data || err);
          errorMessage = specificError;
      } else if (err.status === 404 && err.data?.message?.includes("collection")) {
          const collectionError = `Collection 'users' not found or not accessible (Status: ${err.status}). Please check collection name and API rules.`;
          console.warn("[AuthContext] Collection access issue: " + collectionError, err.data || err);
          errorMessage = collectionError;
      }
      
      console.log('[AuthContext] checkUserExists (via API rule): Error message determined:', errorMessage);
      return { exists: false, error: errorMessage };
    }
  };

  const createAccount = async (email: string, pass: string): Promise<{ success: boolean; needsVerification?: boolean; error?: string }> => {
    try {
      const newUser = await pb.collection('users').create({
        email: email,
        password: pass,
        passwordConfirm: pass,
        emailVisibility: true, // Or false, depending on your preference
      });
      // After successful creation, request email verification
      if (newUser && !newUser.verified) {
        await pb.collection('users').requestVerification(email);
        return { success: true, needsVerification: true };
      } else if (newUser && newUser.verified) {
        // Should ideally not happen for a brand new account, but handle defensively
        return { success: true, needsVerification: false };
      }
      return { success: false, error: 'Account created but verification status unclear.'};
    } catch (err: any) {
      console.error('[AuthContext] Error creating account:', err);
      const errorMessage = err?.data?.data?.email?.message || err?.message || 'Failed to create account.';
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loginWithGoogle, requestOtp, loginWithOtp, checkUserExists, createAccount }}>
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