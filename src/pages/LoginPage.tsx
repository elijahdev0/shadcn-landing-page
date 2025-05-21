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
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
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
              <h1 className="text-xl font-bold">Login to your Account</h1> {/* Custom title */}
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="underline underline-offset-4 hover:text-primary">
                  Sign up
                </Link>
              </div>
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
              {/* Password field is missing in login-05, adding it here */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            
            {/* Optional: Keep or remove social login buttons from ShadcnLoginForm */}
            {/* For now, we'll omit them to keep it simple */}
            {/* <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button variant="outline" className="w-full" disabled={loading}>
                Continue with Apple
              </Button>
              <Button variant="outline" className="w-full" disabled={loading}>
                Continue with Google
              </Button>
            </div> */}
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