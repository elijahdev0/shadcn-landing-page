import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm as ShadcnLoginForm } from '@/components/login-form'; // Renamed import
import { Input } from '@/components/ui/input'; // Keep for controlled input
import { Label } from '@/components/ui/label'; // Keep for controlled input
import { Button } from '@/components/ui/button'; // Keep for controlled input
import { Link } from 'react-router-dom'; // For "Sign up" link

export function LoginPage() {
  const [email, setEmail] = useState('');
  // const [password, setPassword] = useState(''); // Password no longer needed
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      // For magic link, we pass a dummy password or modify login function to not expect it
      const result = await login(email, "magic-link"); // Pass a dummy password
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to login');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  // The ShadcnLoginForm is mostly presentational. We'll override its form and inputs
  // to connect to our state and logic.
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      {/* We use ShadcnLoginForm for the overall structure and styling */}
      {/* but we will manage the form submission and input states ourselves */}
      <div className="w-full max-w-md">
        <ShadcnLoginForm> {/* Pass children to replace parts of its internal form */}
          {/* This form replaces the one inside ShadcnLoginForm */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Replicate header part from ShadcnLoginForm or customize */}
             <div className="flex flex-col items-center gap-2">
              {/* Icon can be kept or removed */}
              {/* <div className="flex h-8 w-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div> */}
              <h1 className="text-xl font-bold">Enter your email to login</h1> {/* Updated title */}
              {/* Removed "Don't have an account" link */}
            </div>

            <div className="flex flex-col gap-6"> {/* This div matches structure in ShadcnLoginForm */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {/* Password field removed */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending login link...' : 'Continue with Email'}
              </Button>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            
            {/* Keep Google button for UI, but non-functional */}
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
            <div className="grid gap-4"> {/* Single column for Google button */}
              <Button variant="outline" className="w-full" disabled={true}> {/* Disabled for now */}
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                   <path
                     d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                     fill="currentColor"
                   />
                 </svg>
                Continue with Google
              </Button>
            </div>
          </form>
          {/* Terms of service can be kept or removed */}
           <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary mt-6">
            By clicking continue, you agree to our <Link to="/terms">Terms of Service</Link>{" "}
            and <Link to="/privacy">Privacy Policy</Link>.
          </div>
        </ShadcnLoginForm>
      </div>
    </div>
  );
}