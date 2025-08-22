import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth/signin');
          return;
        }

        if (data.session) {
          // Check if user has completed onboarding
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('onboarding_completed, role, business_id')
            .eq('id', data.session.user.id)
            .single();

          // Route users based on their role and onboarding status
          if (profile?.role === 'admin' && !profile?.onboarding_completed) {
            navigate('/onboarding');
          } else if (profile?.role === 'admin' && profile?.onboarding_completed) {
            navigate('/dashboard');
          } else if (profile?.role === 'manager') {
            navigate('/manager-dashboard');
          } else if (profile?.role === 'worker') {
            navigate('/worker-dashboard');
          } else {
            // Default fallback for unknown roles
            navigate('/dashboard');
          }
        } else {
          navigate('/auth/signin');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth/signin');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-sky to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
        <p className="text-gray-600 font-inter">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;