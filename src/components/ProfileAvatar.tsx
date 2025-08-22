import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfileAvatarProps {
  filePath: string;
  alt?: string;
  className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  filePath, 
  alt = 'Profile picture',
  className = ''
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSignedUrl = async () => {
      if (!filePath) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setImageError(false);

        // Extract the bucket-relative path from the full URL
        let bucketPath = filePath;
        
        // If filePath is a full URL, extract just the path within the bucket
        if (filePath.includes('supabase.co/storage/v1/object/public/profile-pictures/')) {
          const parts = filePath.split('/profile-pictures/');
          if (parts.length > 1) {
            bucketPath = parts[1];
          }
        }

        const { data, error } = await supabase.storage
          .from('profile-pictures')
          .createSignedUrl(bucketPath, 60 * 60); // 1 hour expiry

        if (error) {
          console.error('Failed to create signed URL:', error);
          setImageError(true);
        } else if (data?.signedUrl) {
          setSignedUrl(data.signedUrl);
        } else {
          console.error('No signed URL returned from Supabase');
          setImageError(true);
        }
      } catch (error) {
        console.error('Error generating signed URL:', error);
        setImageError(true);
      } finally {
        setLoading(false);
      }
    };

    generateSignedUrl();
  }, [filePath]);

  const handleImageError = () => {
    setImageError(true);
  };

  // Show placeholder if loading, no filePath, error, or no signed URL
  if (loading || !filePath || imageError || !signedUrl) {
    return (
      <div className={`w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center ${className}`}>
        <User className="h-5 w-5 text-gray-500" />
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={`w-10 h-10 rounded-full object-cover ${className}`}
      onError={handleImageError}
    />
  );
};

export default ProfileAvatar;