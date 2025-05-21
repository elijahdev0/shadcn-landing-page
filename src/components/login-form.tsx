import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjusted path
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom'; // For policy links
import { GalleryVerticalEnd } from "lucide-react"; // Re-added for icon

export function LoginForm({
  className,
  children, // Added children prop
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { children?: React.ReactNode }) { // Added children to props type
  const [email, setEmail] = useState('');
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
      const result = await login(email, "magic-link");
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to login. Please try again.');
      }
    } catch (err) {
      console.error('[LoginForm] Error during login:', err);
      setError('An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-6 p-6 border rounded-lg shadow-md", className)} {...props}>
      {children ? children : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 mb-4">
            <Link
              to="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GalleryVerticalEnd className="size-6" />
              </div>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">Access Your Account</h1>
            <p className="text-sm text-muted-foreground text-center">
              Enter your email below to receive a magic link to sign in.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                className="h-10"
              />
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? 'Sending Link...' : 'Send Magic Link'}
            </Button>
          </div>

          {error && <p className="text-sm text-destructive text-center mt-2">{error}</p>}

          <div className="relative text-center text-sm mt-4 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
          <div className="grid gap-4 mt-4">
            <Button variant="outline" className="w-full h-10" disabled={true}>
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                 <path
                   d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                   fill="currentColor"
                 />
               </svg>
              Continue with Google
            </Button>
          </div>
           <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary mt-6">
            By clicking continue, you agree to our <Link to="/terms">Terms of Service</Link>{" "}
            and <Link to="/privacy">Privacy Policy</Link>.
          </div>
        </form>
      )}
    </div>
  );
}
