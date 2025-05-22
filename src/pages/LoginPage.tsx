import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { LoginForm } from '@/components/login-form';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // If authenticated, this component will redirect, so rendering LoginForm is fine
  // as it will be quickly replaced by the dashboard. Or return null while redirecting.
  if (isAuthenticated) {
    return null; // Or a loading spinner, or just let the redirect happen
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}