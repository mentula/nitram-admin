import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/database.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, profile, loading, hasRole } = useAuth();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only run the check once when loading completes
    if (!loading && !hasChecked) {
      setHasChecked(true);
      
      // Not authenticated
      if (!user) {
        navigate({ to: redirectTo, replace: true });
        return;
      }

      // Check role requirement
      if (requiredRole && !hasRole(requiredRole)) {
        navigate({ to: '/unauthorized', replace: true });
        return;
      }

      // Check if account is active
      if (profile && !profile.is_active) {
        navigate({ to: '/unauthorized', replace: true });
        return;
      }
    }
  }, [loading, hasChecked, user, profile, requiredRole, redirectTo, hasRole]); // Depend on auth/profile state too

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated or wrong role
  if (!user || (requiredRole && !hasRole(requiredRole))) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
