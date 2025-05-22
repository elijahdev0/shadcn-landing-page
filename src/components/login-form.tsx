import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { GalleryVerticalEnd } from "lucide-react";

type AuthStep = 'initial' | 'awaitingMagicLink';

export function LoginForm({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { children?: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<AuthStep>('initial');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { signInWithMagicLink, loginWithGoogle, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Effect to navigate if user becomes authenticated and is not on dashboard
  // This handles the case after magic link click or Google OAuth redirect
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated && (currentStep === 'awaitingMagicLink' || window.location.pathname.includes('login'))) {
      // Small delay to ensure any pending state updates from AuthContext complete
      setTimeout(() => navigate('/dashboard'), 100);
    }
  }, [isAuthenticated, navigate, currentStep]);


  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setIsSubmittingEmail(true);
    setError('');
    setInfoMessage('');

    const result = await signInWithMagicLink(email);

    if (result.success) {
      setInfoMessage(`Magic link sent to ${email}! Please check your inbox (and spam folder) to complete sign-in.`);
      setCurrentStep('awaitingMagicLink');
    } else {
      setError(result.error || 'Failed to send magic link. Please try again.');
      setCurrentStep('initial'); // Stay on initial if error
    }
    setIsSubmittingEmail(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setInfoMessage('');
    setIsGoogleLoading(true);
    const result = await loginWithGoogle();
    if (result.success) {
      // Navigation will be handled by onAuthStateChange or if already authenticated
      // For Google OAuth, Supabase handles the redirect and then onAuthStateChange picks it up.
      // We might not even reach here if redirect happens immediately.
    } else {
      setError(result.error || 'Google login failed. Please try again.');
    }
    setIsGoogleLoading(false); // May not be hit if redirect happens
  };

  const resetForm = () => {
    setEmail('');
    setError('');
    setInfoMessage('');
    setCurrentStep('initial');
    setIsSubmittingEmail(false);
    setIsGoogleLoading(false);
  };


  const getSubtitle = () => {
    if (currentStep === 'initial') return "Sign in or create an account with your email or Google.";
    if (currentStep === 'awaitingMagicLink' && infoMessage) return infoMessage;
    if (currentStep === 'awaitingMagicLink') return `A magic link was sent to ${email}. Check your inbox.`;
    return "Access Your Account";
  };

  const isLoading = authLoading || isSubmittingEmail || isGoogleLoading;

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
          
          {currentStep === 'initial' && (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  className="h-10"
                />
              </div>
              <Button type="submit" className="w-full h-10" disabled={isLoading}>
                {isSubmittingEmail ? 'Sending Link...' : 'Sign up / Sign in with Email'}
              </Button>
            </form>
          )}

          {currentStep === 'awaitingMagicLink' && (
            <div className="flex flex-col gap-4 items-center">
              {/* Info message is shown in subtitle */}
              <Button onClick={resetForm} className="w-full h-10" disabled={isLoading}>
                Use a different email
              </Button>
            </div>
          )}
          
          {currentStep !== 'awaitingMagicLink' && (
            <>
              <div className="relative text-center text-sm mt-4 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">Or</span>
              </div>
              <div className="grid gap-4 mt-4">
                <Button variant="outline" className="w-full h-10" onClick={handleGoogleLogin} disabled={isLoading}>
                  {isGoogleLoading ? (
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
