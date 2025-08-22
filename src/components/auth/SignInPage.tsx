import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Leaf } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 Sign-in form submitted');
    setError('');
    setLoading(true);
    
    try {
      console.log('🔵 Attempting to sign in with email:', email);
      const { error, success } = await signIn(email, password);
      console.log('🔵 Sign-in response:', { error, success });
      
      if (error) {
        console.log('🔴 Sign-in error:', error);
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else {
          setError(error.message);
        }
      } else if (success) {
        // Sign-in successful - force navigation
        console.log('🟢 Sign-in successful, redirecting to dashboard...');
        // Navigate to dashboard - ProtectedRoute will handle role-based redirects
        console.log('🟢 Navigating to dashboard');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('🔴 Unexpected sign-in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      console.log('🔵 Setting loading to false');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    // Google OAuth will handle the redirect through the auth context
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-sky to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img 
                src="https://uquwbbuhabutqqblyybr.supabase.co/storage/v1/object/public/assets//TradoHQ.png" 
                alt="TradoHQ Logo" 
                className="h-10 w-auto"
              />
              <span className="text-2xl font-dm-sans font-bold text-dark-slate">TradoHQ</span>
            </div>
            <h1 className="text-2xl font-dm-sans font-bold text-dark-slate mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 font-inter">
              Sign in to your TradoHQ account
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-inter font-medium text-dark-slate mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-inter font-medium text-dark-slate mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-forest focus:ring-forest border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 font-inter">
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={() => navigate('/auth/forgot-password')}
                className="text-sm text-forest hover:text-forest/80 font-inter font-semibold"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-inter">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest text-white py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-inter">or</span>
              </div>
            </div>

            <GoogleAuthButton onSuccess={handleGoogleSuccess} />
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 font-inter">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/auth/signup')}
                className="text-forest hover:text-forest/80 font-semibold"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;