import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Leaf } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';

const SignUpPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= 8 && hasSymbol;
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setCurrentStep(2);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters and include 1 symbol');
      return;
    }

    setLoading(true);
    
    try {
      const { error, user } = await signUp(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        // Wait a moment for the database trigger to complete
        setTimeout(() => {
          navigate('/onboarding');
        }, 1000);
      }
    } catch (err) {
      setError('An unexpected error occurred: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    // Google OAuth will handle the redirect through the auth context
    navigate('/onboarding');
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
              Create Your Account
            </h1>
            <p className="text-gray-600 font-inter">
              Join 1,000+ service pros growing with TradoHQ
            </p>
          </div>

          {/* Step 1: Email */}
          {currentStep === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
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

              <button
                type="submit"
                className="w-full bg-forest text-white py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold flex items-center justify-center group"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
          )}

          {/* Step 2: Password */}
          {currentStep === 2 && (
            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-forest hover:text-forest/80 font-inter text-sm mb-4 flex items-center"
                >
                  ← Back to email
                </button>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-inter">Creating account for:</p>
                  <p className="font-inter font-semibold text-dark-slate">{email}</p>
                </div>

                <label htmlFor="password" className="block text-sm font-inter font-medium text-dark-slate mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                  placeholder="Create a password"
                  required
                />
                <p className="text-xs text-gray-500 font-inter mt-1">
                  Must be at least 8 characters and include 1 symbol
                </p>
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 font-inter">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/auth/signin')}
                className="text-forest hover:text-forest/80 font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;