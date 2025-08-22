import React, { useState, useRef } from 'react';
import { X, Camera, Upload, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileAvatar from '../ProfileAvatar';
import { supabase } from '../../lib/supabase';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({ isOpen, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile, refreshProfile } = useAuth();

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      // Create unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh profile data
      await refreshProfile();
      
      // Close modal and reset state
      onClose();
      setPreviewUrl(null);
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!user) return;

    setUploading(true);
    try {
      // Remove avatar URL from profile
      const { error } = await supabase
        .from('user_profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Refresh profile data
      await refreshProfile();
      onClose();
      
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert('Failed to remove profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.email?.split('@')[0] || 'User';

  const getInitials = (name: string) => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-dm-sans font-bold text-dark-slate">
            Profile Picture
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Current/Preview Picture */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            ) : profile?.avatar_url ? (
              <div className="border-4 border-gray-200 rounded-full">
                <ProfileAvatar 
                  filePath={profile.avatar_url} 
                  alt="Current profile"
                  className="w-24 h-24"
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-forest rounded-full flex items-center justify-center border-4 border-gray-200">
                <span className="text-2xl font-semibold text-white">
                  {getInitials(displayName)}
                </span>
              </div>
            )}
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-forest text-white p-2 rounded-full hover:bg-forest/90 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mt-3 font-inter">
            {displayName}
          </p>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="space-y-3">
          {selectedFile ? (
            <>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-forest text-white py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Save New Picture
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-forest text-white py-3 rounded-lg hover:bg-forest/90 transition-all duration-200 font-inter font-semibold flex items-center justify-center"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New Picture
              </button>
              
              {profile?.avatar_url && (
                <button
                  onClick={handleRemovePicture}
                  disabled={uploading}
                  className="w-full border border-red-300 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      Removing...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Remove Picture
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center mt-4 font-inter">
          Supported formats: JPG, PNG, GIF. Max size: 5MB
        </p>
      </div>
    </div>
  );
};

export default ProfilePictureModal;