import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { GalleryVerticalEnd } from "lucide-react";

type AuthStep = 'initial' | 'existingUserOptions' | 'newUserCreation' | 'otpLogin' | 'awaitingVerification';

export function LoginForm({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { children?: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<AuthStep>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [userVerified, setUserVerified] = useState<boolean | undefined>(undefined);

  const {
    login,
    requestOtp,
    loginWithOtp,
    loginWithGoogle,
    checkUserExists,
    createAccount,
  } = useAuth();
  const navigate = useNavigate();

  const resetToInitial = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtpCode('');
    setOtpId(null);
    setError('');
    setInfoMessage('');
    setCurrentStep('initial');
    setEmailSubmitted(false);
    setUserVerified(undefined);
    setLoading(false);
    setGoogleLoading(false);
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError('');
    setInfoMessage('');
    console.log(`[LoginForm] handleInitialSubmit: Email entered: "${email}"`);
    try {
      const result = await checkUserExists(email);
      console.log('[LoginForm] handleInitialSubmit: Result from checkUserExists:', result);

      if (result.error) {
        console.log('[LoginForm] handleInitialSubmit: Error from checkUserExists:', result.error);
        setError(result.error);
        setCurrentStep('initial'); // Stay on initial if error checking
      } else if (result.exists) {
        console.log(`[LoginForm] handleInitialSubmit: User exists. Verified: ${result.isVerified}. Setting step to 'existingUserOptions'.`);
        setUserVerified(result.isVerified);
        setCurrentStep('existingUserOptions');
        if (result.isVerified === false) {
          setInfoMessage("Your email is not verified. You can log in, but some features might be limited.");
        }
      } else {
        console.log("[LoginForm] handleInitialSubmit: User does not exist. Setting step to 'newUserCreation'.");
        setCurrentStep('newUserCreation');
      }
    } catch (err: any) {
      console.error('[LoginForm] handleInitialSubmit: Exception caught:', err);
      setError('An unexpected error occurred. Please try again.');
      setCurrentStep('initial'); // Reset to initial on unexpected error
    }
    setLoading(false);
    setEmailSubmitted(true); // Mark email as processed
    console.log(`[LoginForm] handleInitialSubmit: Finished. Current step: ${currentStep}, Email submitted: ${emailSubmitted}`);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred during login. Please try again.');
    }
    setLoading(false);
  };

  const handleOtpRequestForExistingUser = async () => {
    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const result = await requestOtp(email);
      if (result.success && result.otpId) {
        setOtpId(result.otpId);
        setCurrentStep('otpLogin');
        setInfoMessage(`An OTP has been sent to ${email}. Please enter it below.`);
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred while sending OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const result = await createAccount(email, password);
      if (result.success) {
        if (result.needsVerification) {
          setInfoMessage(`Verification email sent to ${email}. Please check your inbox to complete registration.`);
          setCurrentStep('awaitingVerification');
        } else {
          // Should not happen if new user, but handle defensively
          setInfoMessage('Account created successfully! You can now sign in.');
          setCurrentStep('initial'); // Or existingUserOptions if you want them to log in immediately
        }
      } else {
        setError(result.error || 'Failed to create account.');
      }
    } catch (err) {
      setError('An unexpected error occurred during account creation. Please try again.');
    }
    setLoading(false);
  };

  const handleOtpCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpId || !otpCode) {
      setError("Please enter the OTP code.");
      return;
    }
    setLoading(true);
    setError('');
    // Keep infoMessage about OTP sent
    try {
      const result = await loginWithOtp(otpId, otpCode);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to login with OTP. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred during OTP login. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setInfoMessage('');
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Google login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred during Google login. Please try again.');
    }
    setGoogleLoading(false);
  };

  const getSubtitle = () => {
    if (currentStep === 'initial') return "Sign in or create an account with your email or Google.";
    if (currentStep === 'existingUserOptions') return `Welcome back! Sign in to ${email} with your password or an OTP.`;
    if (currentStep === 'newUserCreation') return `Create your account for ${email}.`;
    if (currentStep === 'otpLogin' && infoMessage) return infoMessage;
    if (currentStep === 'otpLogin') return `An OTP was sent to ${email}. Enter it below.`;
    if (currentStep === 'awaitingVerification' && infoMessage) return infoMessage;
    return "Access Your Account";
  };

  const renderInitialStep = () => (
    <form onSubmit={handleInitialSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || googleLoading}
          autoComplete="email"
          className="h-10"
        />
      </div>
      <Button type="submit" className="w-full h-10" disabled={loading || googleLoading}>
        {loading ? 'Processing...' : 'Sign up / Sign in'}
      </Button>
    </form>
  );

  const renderExistingUserOptionsStep = () => (
    <div className="flex flex-col gap-4">
      {infoMessage && <p className="text-sm text-blue-600 text-center">{infoMessage}</p>}
      <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || googleLoading}
            autoComplete="current-password"
            className="h-10"
          />
        </div>
        <Button type="submit" className="w-full h-10" disabled={loading || googleLoading}>
          {loading ? 'Signing In...' : 'Login with Password'}
        </Button>
      </form>
      <Button variant="outline" onClick={handleOtpRequestForExistingUser} className="w-full h-10" disabled={loading || googleLoading}>
        {loading ? 'Sending OTP...' : 'Send OTP to Sign In'}
      </Button>
      <Button variant="link" size="sm" className="text-sm text-muted-foreground" onClick={resetToInitial} disabled={loading || googleLoading}>
        Use a different email
      </Button>
    </div>
  );

  const renderNewUserCreationStep = () => (
    <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="new-password">Password</Label>
        <Input
          id="new-password"
          type="password"
          placeholder="Choose a strong password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading || googleLoading}
          autoComplete="new-password"
          className="h-10"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Confirm your password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading || googleLoading}
          autoComplete="new-password"
          className="h-10"
        />
      </div>
      <Button type="submit" className="w-full h-10" disabled={loading || googleLoading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
      <Button variant="link" size="sm" className="text-sm text-muted-foreground" onClick={resetToInitial} disabled={loading || googleLoading}>
        Use a different email
      </Button>
    </form>
  );

  const renderOtpLoginStep = () => (
    <form onSubmit={handleOtpCodeSubmit} className="flex flex-col gap-4">
      {/* infoMessage is shown in subtitle */}
      <div className="grid gap-2">
        <Label htmlFor="otpCode">OTP Code</Label>
        <Input
          id="otpCode"
          type="text"
          placeholder="123456"
          required
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          disabled={loading || googleLoading}
          autoComplete="one-time-code"
          className="h-10"
        />
      </div>
      <Button type="submit" className="w-full h-10" disabled={loading || googleLoading}>
        {loading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
      </Button>
      <div className="flex justify-between items-center">
        <Button variant="link" size="sm" className="text-sm text-muted-foreground" onClick={() => setCurrentStep('existingUserOptions')} disabled={loading || googleLoading}>
          Use Password Instead
        </Button>
        <Button variant="link" size="sm" className="text-sm text-muted-foreground" onClick={resetToInitial} disabled={loading || googleLoading}>
          Use a different email
        </Button>
      </div>
    </form>
  );

  const renderAwaitingVerificationStep = () => (
    <div className="flex flex-col gap-4 items-center">
      {/* infoMessage is shown in subtitle */}
      <Button onClick={resetToInitial} className="w-full h-10" disabled={googleLoading}>
        Back to Sign In
      </Button>
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-6 p-6 border rounded-lg shadow-md", className)} {...props}>
      {children ? children : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 mb-4">
            <Link to="/" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GalleryVerticalEnd className="size-6" />
              </div>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">Access Your Account</h1>
            <p className="text-sm text-muted-foreground text-center px-4">
              {getSubtitle()}
            </p>
          </div>

          {error && <p className="text-sm text-destructive text-center -mt-2 mb-2">{error}</p>}
          
          {currentStep === 'initial' && renderInitialStep()}
          {currentStep === 'existingUserOptions' && renderExistingUserOptionsStep()}
          {currentStep === 'newUserCreation' && renderNewUserCreationStep()}
          {currentStep === 'otpLogin' && renderOtpLoginStep()}
          {currentStep === 'awaitingVerification' && renderAwaitingVerificationStep()}

          {currentStep !== 'awaitingVerification' && (
            <>
              <div className="relative text-center text-sm mt-4 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">Or</span>
              </div>
              <div className="grid gap-4 mt-4">
                <Button variant="outline" className="w-full h-10" onClick={handleGoogleLogin} disabled={loading || googleLoading}>
                  {googleLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                     <path
                       d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                       fill="currentColor"
                     />
                   </svg>
                  )}
                  Continue with Google
                </Button>
              </div>
            </>
          )}
           <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary mt-6">
            By clicking continue, you agree to our <Link to="/terms">Terms of Service</Link>{" "}
            and <Link to="/privacy">Privacy Policy</Link>.
          </div>
        </div>
      )}
    </div>
  );
}
