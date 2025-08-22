import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireOnboarding = true 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    console.log('🔵 ProtectedRoute: Still loading auth state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-sky to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('🔵 ProtectedRoute: Auth state - User:', !!user, 'Profile:', !!profile, 'Location:', location.pathname);

  // If auth is required but user is not authenticated
  if (requireAuth && !user) {
    console.log('🔴 ProtectedRoute: Auth required but no user, redirecting to signin');
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // If user is authenticated but onboarding is required and not completed
  if (requireAuth && user && requireOnboarding) {
    // If we don't have profile data yet, show loading
    if (profile === null) {
      console.log('🔵 ProtectedRoute: Waiting for profile data...');
      return (
        <div className="min-h-screen bg-gradient-to-br from-soft-sky to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
            <p className="text-gray-600 font-inter">Loading profile...</p>
          </div>
        </div>
      );
    }
    
    // If profile exists but onboarding not completed (only for admin users, not invited users)
    if (profile && profile.role === 'admin' && !profile.onboarding_completed) {
      console.log('🔵 ProtectedRoute: Admin user needs onboarding');
      // Don't redirect if already on onboarding page
      if (location.pathname !== '/onboarding') {
        console.log('🔵 ProtectedRoute: Redirecting admin to onboarding');
        return <Navigate to="/onboarding" replace />;
      }
    }
    
    // Invited users (managers and workers) skip onboarding entirely
    // They are considered "onboarded" when their profile is created via invite acceptance
  }

  // If user is authenticated and onboarding is completed (for admin users), but trying to access onboarding
  if (user && profile?.role === 'admin' && profile?.onboarding_completed && location.pathname === '/onboarding') {
    console.log('🔵 ProtectedRoute: Admin completed onboarding, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated but trying to access auth pages (except callback)
  if (user && location.pathname.startsWith('/auth/') && location.pathname !== '/auth/callback') {
    if (profile) {
      // Determine redirect based on user role and onboarding status
      let redirectTo;
      if (profile.role === 'admin' && !profile.onboarding_completed) {
        redirectTo = '/onboarding';
      } else if (profile.role === 'admin') {
        redirectTo = '/dashboard';
      } else if (profile.role === 'manager') {
        redirectTo = '/manager-dashboard';
      } else if (profile.role === 'worker') {
        redirectTo = '/worker-dashboard';
      } else {
        redirectTo = '/dashboard'; // Default fallback
      }
      console.log('🔵 ProtectedRoute: Redirecting authenticated user from auth page to:', redirectTo);
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Handle role-based dashboard redirects
  if (user && profile && location.pathname === '/dashboard') {
    // If user is not admin but trying to access admin dashboard, redirect to their appropriate dashboard
    if (profile.role === 'manager') {
      console.log('🔵 ProtectedRoute: Manager trying to access admin dashboard, redirecting to manager dashboard');
      return <Navigate to="/manager-dashboard" replace />;
    } else if (profile.role === 'worker') {
      console.log('🔵 ProtectedRoute: Worker trying to access admin dashboard, redirecting to worker dashboard');
      return <Navigate to="/worker-dashboard" replace />;
    }
  }

  // Handle role-based access control for manager dashboard
  if (user && profile && location.pathname === '/manager-dashboard') {
    if (profile.role === 'admin') {
      // Admin can access manager dashboard
    } else if (profile.role === 'worker') {
      console.log('🔵 ProtectedRoute: Worker trying to access manager dashboard, redirecting to worker dashboard');
      return <Navigate to="/worker-dashboard" replace />;
    } else if (profile.role !== 'manager') {
      console.log('🔵 ProtectedRoute: Unauthorized role trying to access manager dashboard, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Handle role-based access control for worker dashboard
  if (user && profile && location.pathname === '/worker-dashboard') {
    if (profile.role === 'admin' || profile.role === 'manager') {
      // Admin and manager can access worker dashboard for oversight
    } else if (profile.role !== 'worker') {
      console.log('🔵 ProtectedRoute: Unauthorized role trying to access worker dashboard, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log('🟢 ProtectedRoute: Rendering protected content for:', user?.email);
  return <>{children}</>;
};

export default ProtectedRoute;