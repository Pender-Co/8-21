import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle, Leaf } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface OnboardingData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  companyName: string;
  industry: string;
  website: string;
  teamSize: string;
  timeInBusiness: string;
  estimatedRevenue: string;
}

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    companyName: '',
    industry: '',
    website: '',
    teamSize: '',
    timeInBusiness: '',
    estimatedRevenue: ''
  });

  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Initialize component and check for existing data
  useEffect(() => {
    const initializeOnboarding = async () => {
      if (!user || !profile) {
        setInitializing(false);
        return;
      }

      // If user is not admin, redirect to dashboard
      if (profile.role !== 'admin') {
        navigate('/dashboard');
        return;
      }

      // If onboarding is already completed, redirect to dashboard
      if (profile.onboarding_completed) {
        navigate('/dashboard');
        return;
      }

      // Pre-fill form with existing profile data
      if (profile.first_name || profile.last_name || profile.phone_number) {
        setData(prev => ({
          ...prev,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          phoneNumber: profile.phone_number || ''
        }));
      }

      // If user has business data, pre-fill and advance to appropriate step
      if (profile.business_id) {
        try {
          const { data: businessData } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', profile.business_id)
            .single();

          if (businessData) {
            setData(prev => ({
              ...prev,
              companyName: businessData.company_name || '',
              industry: businessData.industry || '',
              website: businessData.website || '',
              teamSize: businessData.team_size || '',
              timeInBusiness: businessData.time_in_business || '',
              estimatedRevenue: businessData.estimated_revenue || ''
            }));

            // Determine which step to start on based on completed data
            // Only advance if user has completed personal info (step 1)
            const hasPersonalInfo = profile.first_name && profile.last_name && profile.phone_number;
            
            if (!hasPersonalInfo) {
              setCurrentStep(1); // Start at personal info if not completed
            } else if (businessData.estimated_revenue) {
              setCurrentStep(5); // All data complete, on final step
            } else if (businessData.time_in_business) {
              setCurrentStep(5); // On revenue step
            } else if (businessData.team_size) {
              setCurrentStep(4); // On time in business step
            } else if (businessData.company_name && businessData.industry) {
              setCurrentStep(3); // On team size step
            } else {
              setCurrentStep(2); // On business info step
            }
          }
        } catch (error) {
          console.error('Error fetching business data:', error);
        }
      } else {
        // No business data exists, check if personal info is complete
        const hasPersonalInfo = profile.first_name && profile.last_name && profile.phone_number;
        setCurrentStep(hasPersonalInfo ? 2 : 1);
      }

      setInitializing(false);
    };

    initializeOnboarding();
  }, [user, profile, navigate]);

  const industries = [
    'Landscaping',
    'Lawn Care',
    'Snow Removal',
    'Tree Services',
    'Hardscaping',
    'Irrigation',
    'Pest Control',
    'Other'
  ];

  const teamSizes = [
    'Just me',
    '2–5',
    '5–10',
    '11–29',
    '30+'
  ];

  const timeInBusinessOptions = [
    '<1 year',
    '1–2',
    '3–5',
    '6–10',
    '10+'
  ];

  const revenueOptions = [
    '0–50k',
    '50k–150k',
    '150k–500k',
    '500k–2M',
    '2M+',
    'Prefer not to say'
  ];

  const updateData = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      // Get the user's existing business_id from their profile
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('business_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      let businessId = existingProfile.business_id;

      // Create business record if it doesn't exist
      if (!businessId) {
  console.log('🔵 Creating new business record...');
  const businessPayload = {
    company_name: data.companyName,
    industry: data.industry,
    website: data.website || null,
    team_size: data.teamSize,
    time_in_business: data.timeInBusiness,
    estimated_revenue: data.estimatedRevenue,
    created_by: user.id, // ✅ this is REQUIRED to satisfy your RLS policy
  };

  console.log('🧾 Payload being inserted:', businessPayload);

  const { data: newBusiness, error: businessCreateError } = await supabase
    .from('businesses')
    .insert([businessPayload]); // ✅ Removed `.select().single()` for now

  if (businessCreateError) {
    console.error('🔴 Error creating business:', businessCreateError);
    throw businessCreateError;
  }

  // Fetch the business record after insert (optional, only if needed)
  const { data: createdBusiness, error: fetchError } = await supabase
    .from('businesses')
    .select('id')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !createdBusiness) {
    console.error('🔴 Error fetching created business:', fetchError);
    throw fetchError;
  }

  businessId = createdBusiness.id;
  console.log('🟢 Business created with ID:', businessId);
}
        // Update the existing business record if it exists
        console.log('🔵 Updating existing business record:', businessId);
        const { error: businessError } = await supabase
          .from('businesses')
          .update({
            company_name: data.companyName,
            industry: data.industry,
            website: data.website || null,
            team_size: data.teamSize,
            time_in_business: data.timeInBusiness,
            estimated_revenue: data.estimatedRevenue
          })
          .eq('id', businessId);

        if (businessError) {
          console.error('🔴 Error updating business:', businessError);
          throw businessError;
        }
        console.log('🟢 Business updated successfully');

      // Update user profile with onboarding data and business_id
      console.log('🔵 Updating user profile with business_id:', businessId);
      const { error: updateProfileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber,
          business_id: businessId,
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (updateProfileError) {
        console.error('🔴 Error updating user profile:', updateProfileError);
        throw updateProfileError;
      }
      console.log('🟢 User profile updated successfully');

      // Refresh profile data
      await refreshProfile();
      console.log('🟢 Profile refreshed, navigating to dashboard');

      // Navigate to dashboard - ProtectedRoute will handle role-based redirects
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.firstName && data.lastName && data.phoneNumber;
      case 2:
        return data.companyName && data.industry;
      case 3:
        return data.teamSize;
      case 4:
        return data.timeInBusiness;
      case 5:
        return data.estimatedRevenue;
      default:
        return false;
    }
  };

  // Show loading while initializing
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-sky to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Loading your onboarding progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-sky to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
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
              Let's Set Up Your Account
            </h1>
            <p className="text-gray-600 font-inter">
              Step {currentStep} of 5
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep
                      ? 'bg-forest text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-forest h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {/* Step 1: User Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-dm-sans font-bold text-dark-slate mb-4">
                  Tell us about yourself
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={data.firstName}
                      onChange={(e) => updateData('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={data.lastName}
                      onChange={(e) => updateData('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      placeholder="Smith"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={data.phoneNumber}
                    onChange={(e) => updateData('phoneNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Business Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-dm-sans font-bold text-dark-slate mb-4">
                  About your business
                </h2>
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={data.companyName}
                    onChange={(e) => updateData('companyName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                    placeholder="Green Thumb Landscaping"
                  />
                </div>
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Industry
                  </label>
                  <select
                    value={data.industry}
                    onChange={(e) => updateData('industry', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                  >
                    <option value="">Select your industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={data.website}
                    onChange={(e) => updateData('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Team Size */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-dm-sans font-bold text-dark-slate mb-4">
                  How big is your team?
                </h2>
                <div className="space-y-3">
                  {teamSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => updateData('teamSize', size)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 font-inter ${
                        data.teamSize === size
                          ? 'border-forest bg-forest/5 text-forest'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Time in Business */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-dm-sans font-bold text-dark-slate mb-4">
                  How long have you been in business?
                </h2>
                <div className="space-y-3">
                  {timeInBusinessOptions.map((time) => (
                    <button
                      key={time}
                      onClick={() => updateData('timeInBusiness', time)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 font-inter ${
                        data.timeInBusiness === time
                          ? 'border-forest bg-forest/5 text-forest'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {time} {time.includes('year') ? '' : 'years'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Revenue */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-dm-sans font-bold text-dark-slate mb-4">
                  What's your estimated annual revenue?
                </h2>
                <div className="space-y-3">
                  {revenueOptions.map((revenue) => (
                    <button
                      key={revenue}
                      onClick={() => updateData('estimatedRevenue', revenue)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 font-inter ${
                        data.estimatedRevenue === revenue
                          ? 'border-forest bg-forest/5 text-forest'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                     {revenue === 'Prefer not to say' ? revenue : `$${revenue}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              <p className="text-red-600 text-sm font-inter">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </button>

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center px-6 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!isStepValid() || loading}
                className="flex items-center px-6 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
                <CheckCircle className="ml-2 h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;