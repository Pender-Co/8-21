import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, Leaf, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!token) {
      setValidationError('Invalid invite link - no token provided');
      setLoading(false);
      return;
    }

    validateInvite();
  }, [token]);

  const validateInvite = async () => {
    try {
      console.log('🔵 Validating invite with token:', token);
      
      // Log the raw token from URL
      const rawToken = searchParams.get('token');
      console.log('🔵 Raw token from URL:', rawToken);
      
      if (!token) {
        console.log('🔴 No token provided in URL');
        setValidationError('Invalid invite link - no token provided');
        setLoading(false);
        return;
      }
      
      // Clean the token - remove any spaces and ensure URL-safe
      const cleanToken = token.trim().replace(/\s+/g, '');
      console.log('🔵 Final cleaned token:', cleanToken);
      
      // Get the invite with this token
      console.log('🔵 Querying database with cleaned token...');
      let { data: inviteData, error: inviteError } = await supabase
        .from('user_invites')
        .select('*')
        .eq('token', cleanToken)
        .single();

      console.log('🔵 Database query result:', { inviteData, inviteError });
      
      // If the cleaned token fails, try the original token as fallback
      if (inviteError && inviteError.code === 'PGRST116') {
        console.log('🔵 Cleaned token failed, trying original token as fallback...');
        
        const result = await supabase
          .from('user_invites')
          .select('*')
          .eq('token', token)
          .single();
          
        inviteData = result.data;
        inviteError = result.error;
        console.log('🔵 Original token attempt result:', { inviteData, inviteError });
      }
      
      if (inviteError) {
        console.error('🔴 Database error:', inviteError);
        if (inviteError.code === 'PGRST116') {
          console.log('🔴 No invite found with this token');
          console.log('🔴 Tried tokens:', [cleanToken, token]);
          setValidationError('This invite link is invalid or has expired.');
        } else {
          setValidationError('Database error occurred. Please try again.');
        }
        setLoading(false);
        return;
      }
      
      if (!inviteData) {
        console.log('🔴 No invite data returned');
        setValidationError('This invite link is invalid.');
        setLoading(false);
        return;
      }

      console.log('🔵 Found invite:', inviteData);
      console.log('🔵 Invite status:', inviteData.status);
      console.log('🔵 Invite role:', inviteData.role);
      console.log('🔵 Invite expires at:', inviteData.expires_at);
      console.log('🔵 Current time:', new Date().toISOString());
      console.log('🔵 Is expired?', new Date(inviteData.expires_at) <= new Date());

      // Check invite status and expiration
      if (inviteData.status !== 'pending') {
        console.log('🔴 Invite status is not pending:', inviteData.status);
        setValidationError(`This invite has already been ${inviteData.status}.`);
        setLoading(false);
        return;
      }

      if (new Date(inviteData.expires_at) <= new Date()) {
        console.log('🔴 Invite has expired');
        setValidationError('This invite link has expired.');
        setLoading(false);
        return;
      }

      // If we get here, the invite is valid
      console.log('🟢 Invite is valid, setting up form');
      setInvite(inviteData);
      setEmail(inviteData.email);
      setPhoneNumber(inviteData.phone_number || '');
      
      if (inviteData.name) {
        const nameParts = inviteData.name.split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
      }
      
      setLoading(false);

    } catch (error) {
      console.error('🔴 Unexpected error validating invite:', error);
      setValidationError('Failed to validate invite. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      console.log('🔵 Starting account creation process');
      
      // STEP 1: Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            email: email.toLowerCase().trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone_number: phoneNumber.trim() || null
          }
        }
      });

      if (authError) {
        console.error('🔴 Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        console.error('🔴 No user returned from signup');
        throw new Error('Failed to create user account');
      }

      console.log('🟢 User account created:', authData.user.id);
      console.log('🔵 Step 2: Creating/updating user profile');

      // Upsert user profile for invited user with business_id from invite
      const profileData = {
        id: authData.user.id, // Include ID for upsert
        email: email.toLowerCase().trim(), // Include email for upsert
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        phone_number: phoneNumber.trim() || null,
        role: invite.role,
        business_id: invite.business_id,
        onboarding_completed: true
      };

      console.log('🔵 Updating profile with data:', profileData);

      // Use upsert instead of update to handle any race conditions
      const { data: profileResult, error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (profileError) {
        console.error('🔴 Profile upsert error:', profileError);
        console.error('🔴 Profile upsert error details:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
        throw profileError;
      }

      console.log('🟢 Profile upserted successfully:', profileResult);
      
      // Manually update the invite status to accepted
      console.log('🔵 Step 3: Updating invite status to accepted');
      const { error: inviteUpdateError } = await supabase
        .from('user_invites')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invite.id);

      if (inviteUpdateError) {
        console.error('🔴 Invite update error:', inviteUpdateError);
        // Don't throw - profile is created, this is just status update
      } else {
        console.log('🟢 Invite status updated to accepted');
      }

      console.log('🔵 Step 4: Verifying profile creation');

      // Verify the profile was created/updated correctly
      console.log('🔵 Verifying profile creation...');
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (verifyError) {
        console.error('🔴 Profile verification error:', verifyError);
      } else {
        console.log('🟢 Profile verification successful:', verifyProfile);
      }

      console.log('🟢 Account creation complete, redirecting to dashboard');
      // Redirect to dashboard - ProtectedRoute will handle role-based redirects
      navigate('/dashboard');

    } catch (error: any) {
      console.error('🔴 Error accepting invite:', error);
      if (error.message.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Failed to sign in after account creation. Please try signing in manually.');
      } else {
        setError(`Failed to accept invite: ${error.message || 'Unknown error'}. Please try again.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-sky to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Validating invite...</p>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-sky to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <img 
                src="https://uquwbbuhabutqqblyybr.supabase.co/storage/v1/object/public/assets//TradoHQ.png" 
                alt="TradoHQ Logo" 
                className="h-10 w-auto"
              />
              <span className="text-2xl font-dm-sans font-bold text-dark-slate">TradoHQ</span>
            </div>

            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-dm-sans font-bold text-dark-slate mb-4">
              Invalid Invite
            </h1>
            
            <p className="text-gray-600 font-inter mb-6">
              {validationError}
            </p>

            <button
              onClick={() => navigate('/auth/signin')}
              className="w-full bg-forest text-white py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              Join {invite?.company_name}
            </h1>
            <p className="text-gray-600 font-inter">
              Complete your account setup as a <span className="font-semibold text-forest">{invite?.role}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (locked) */}
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-inter text-gray-600"
                  disabled
                />
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-inter font-medium text-dark-slate mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-inter font-medium text-dark-slate mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                  placeholder="Smith"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-inter font-medium text-dark-slate mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-inter font-medium text-dark-slate mb-2">
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-inter">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !firstName.trim() || !lastName.trim() || password.length < 6}
              className="w-full bg-forest text-white py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Join {invite?.company_name}
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <p className="text-xs text-gray-500 text-center mt-4 font-inter">
            By joining, you agree to TradoHQ's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitePage;