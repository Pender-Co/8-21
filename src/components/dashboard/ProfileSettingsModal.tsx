import React, { useState } from 'react';
import { X, User, Lock, Bell, Settings, AlertTriangle, Save, Eye, EyeOff, Camera, Mail, Phone, MapPin, RotateCcw } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileAvatar from '../ProfileAvatar';
import { supabase } from '../../lib/supabase';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'profile' | 'security' | 'notifications' | 'preferences' | 'danger';

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { user, profile, refreshProfile } = useAuth();

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: profile?.email || '',
    phoneNumber: profile?.phone_number || '',
    location: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    jobUpdates: true,
    scheduleChanges: true,
    paymentReminders: true,
    marketingEmails: false
  });

  // App preferences state
  const [appPrefs, setAppPrefs] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    autoLogout: '30'
  });

  // Danger zone state
  const [deactivateConfirm, setDeactivateConfirm] = useState('');

  // Mock location suggestions - in a real app, you'd use a geocoding API like Google Places
  const mockLocationSuggestions = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA',
    'Dallas, TX',
    'San Jose, CA',
    'Austin, TX',
    'Jacksonville, FL',
    'Fort Worth, TX',
    'Columbus, OH',
    'Charlotte, NC',
    'San Francisco, CA',
    'Indianapolis, IN',
    'Seattle, WA',
    'Denver, CO',
    'Boston, MA'
  ];

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'security' as TabType, label: 'Password & Security', icon: Lock },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'preferences' as TabType, label: 'Preferences', icon: Settings },
    { id: 'danger' as TabType, label: 'Danger Zone', icon: AlertTriangle }
  ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: profileData.firstName.trim(),
          last_name: profileData.lastName.trim(),
          phone_number: profileData.phoneNumber.trim() || null
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setSuccess('Profile updated successfully!');
      
      // Show toast notification
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (value: string) => {
    setProfileData(prev => ({ ...prev, location: value }));
    
    if (value.length > 0) {
      const filtered = mockLocationSuggestions.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  const handleLocationSelect = (location: string) => {
    setProfileData(prev => ({ ...prev, location }));
    setShowLocationSuggestions(false);
  };

  const handleResetPassword = async () => {
    if (!profile?.email) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      setSuccess('Password reset email sent! Check your inbox for instructions.');
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password updated successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (deactivateConfirm !== 'DEACTIVATE') {
      setError('Please type "DEACTIVATE" to confirm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real app, you'd call an API to deactivate the account
      // For now, we'll just show a success message
      setSuccess('Account deactivation request submitted. You will receive an email confirmation.');
      setDeactivateConfirm('');
    } catch (error: any) {
      setError('Failed to deactivate account');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.email?.split('@')[0] || 'User';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[60] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle className="h-5 w-5" />
          <span className="font-inter font-medium">Changes saved</span>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-dm-sans font-bold text-dark-slate">
            Account Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setError('');
                    setSuccess('');
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-inter font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-forest text-white'
                      : tab.id === 'danger'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="mr-3 h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Success/Error Messages */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <p className="text-green-600 text-sm font-inter">{success}</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                  <p className="text-red-600 text-sm font-inter">{error}</p>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4">
                      Profile Information
                    </h3>
                    
                    {/* Profile Picture Section */}
                    <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="relative">
                        {profile?.avatar_url ? (
                          <ProfileAvatar 
                            filePath={profile.avatar_url} 
                            alt="Profile"
                            className="w-16 h-16"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-forest rounded-full flex items-center justify-center">
                            <span className="text-xl font-semibold text-white">
                              {getInitials(displayName)}
                            </span>
                          </div>
                        )}
                        <button className="absolute bottom-0 right-0 bg-forest text-white p-1 rounded-full hover:bg-forest/90 transition-colors">
                          <Camera className="h-3 w-3" />
                        </button>
                      </div>
                      <div>
                        <h4 className="font-dm-sans font-semibold text-dark-slate">{displayName}</h4>
                        <p className="text-sm text-gray-600 font-inter capitalize">{profile?.role}</p>
                        <button className="text-sm text-forest hover:text-forest/80 font-inter font-medium mt-1">
                          Change photo
                        </button>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
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
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                          placeholder="Smith"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-inter text-gray-600"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-inter">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                        Member ID
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={user?.id || ''}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-inter text-gray-600"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-inter">
                        Your unique member identifier for support purposes.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phoneNumber}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                        Location
                      </label>
                      <div className="relative" onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}>
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => handleLocationChange(e.target.value)}
                          onFocus={() => profileData.location && setShowLocationSuggestions(true)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                          placeholder="City, State"
                        />
                        
                        {/* Location Suggestions Dropdown */}
                        {showLocationSuggestions && locationSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {locationSuggestions.map((location, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleLocationSelect(location)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm font-inter"
                              >
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                  {location}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4">
                      Password & Security
                    </h3>
                  </div>

                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-inter font-semibold text-blue-800 mb-2">Password Requirements</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• At least 6 characters long</li>
                        <li>• Include at least one symbol</li>
                        <li>• Different from your current password</li>
                      </ul>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={loading}
                        className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Password
                      </button>
                      
                      <button
                        type="submit"
                        disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4">
                      Notification Preferences
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-inter font-semibold text-dark-slate mb-4">Communication Preferences</h4>
                      <div className="space-y-4">
                        {[
                          { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                          { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications in your browser' },
                          { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via text message' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h5 className="font-inter font-medium text-dark-slate">{item.label}</h5>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationPrefs[item.key as keyof typeof notificationPrefs]}
                                onChange={(e) => setNotificationPrefs(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-forest/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-inter font-semibold text-dark-slate mb-4">Content Preferences</h4>
                      <div className="space-y-4">
                        {[
                          { key: 'jobUpdates', label: 'Job Updates', description: 'Notifications about job status changes' },
                          { key: 'scheduleChanges', label: 'Schedule Changes', description: 'Alerts when your schedule is updated' },
                          { key: 'paymentReminders', label: 'Payment Reminders', description: 'Reminders about upcoming payments' },
                          { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates and promotional content' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h5 className="font-inter font-medium text-dark-slate">{item.label}</h5>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationPrefs[item.key as keyof typeof notificationPrefs]}
                                onChange={(e) => setNotificationPrefs(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-forest/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => setSuccess('Notification preferences saved!')}
                        className="bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold flex items-center"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-dm-sans font-semibold text-dark-slate mb-4">
                      App Preferences
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                          Theme
                        </label>
                        <select
                          value={appPrefs.theme}
                          onChange={(e) => setAppPrefs(prev => ({ ...prev, theme: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                          Language
                        </label>
                        <select
                          value={appPrefs.language}
                          onChange={(e) => setAppPrefs(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                          Date Format
                        </label>
                        <select
                          value={appPrefs.dateFormat}
                          onChange={(e) => setAppPrefs(prev => ({ ...prev, dateFormat: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                          Time Format
                        </label>
                        <select
                          value={appPrefs.timeFormat}
                          onChange={(e) => setAppPrefs(prev => ({ ...prev, timeFormat: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                        >
                          <option value="12h">12 Hour</option>
                          <option value="24h">24 Hour</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                        Timezone
                      </label>
                      <select
                        value={appPrefs.timezone}
                        onChange={(e) => setAppPrefs(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                        Auto Logout (minutes)
                      </label>
                      <select
                        value={appPrefs.autoLogout}
                        onChange={(e) => setAppPrefs(prev => ({ ...prev, autoLogout: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="never">Never</option>
                      </select>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => setSuccess('App preferences saved!')}
                        className="bg-forest text-white px-6 py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold flex items-center"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-dm-sans font-semibold text-red-600 mb-4">
                      Danger Zone
                    </h3>
                    <p className="text-gray-600 font-inter">
                      These actions are permanent and cannot be undone. Please proceed with caution.
                    </p>
                  </div>

                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start space-x-4">
                      <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-dm-sans font-semibold text-red-800 mb-1">
                          Deactivate Account
                        </h4>
                        <p className="text-red-700 font-inter text-sm mb-3">
                          This will disable access to all features. Data preserved for 30 days, then permanently deleted.
                        </p>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-inter font-medium text-red-800 mb-1">
                              Type "DEACTIVATE" to confirm
                            </label>
                            <input
                              type="text"
                              value={deactivateConfirm}
                              onChange={(e) => setDeactivateConfirm(e.target.value)}
                              className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-inter text-sm"
                              placeholder="DEACTIVATE"
                            />
                          </div>
                          
                          <button
                            onClick={handleDeactivateAccount}
                            disabled={loading || deactivateConfirm !== 'DEACTIVATE'}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="mr-2 h-3 w-3" />
                                Deactivate Account
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;