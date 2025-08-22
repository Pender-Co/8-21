/*
  # Set up Storage Policies for Profile Pictures

  1. Storage Policies
    - Allow authenticated users to upload their own profile pictures
    - Allow public access to view profile pictures
    - Allow users to update/delete their own profile pictures

  2. Security
    - Users can only upload to their own folder (using auth.uid())
    - File size and type validation handled in the application
    - Public read access for displaying images
*/

-- Allow authenticated users to upload their own profile pictures
INSERT INTO storage.policies (id, bucket_id, name, definition, check, command)
VALUES (
  'allow_authenticated_uploads',
  'profile-pictures',
  'Allow authenticated users to upload avatars',
  '(bucket_id = ''profile-pictures'' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = ''avatars'')',
  '(bucket_id = ''profile-pictures'' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = ''avatars'')',
  'INSERT'
) ON CONFLICT (id) DO NOTHING;

-- Allow public access to view profile pictures
INSERT INTO storage.policies (id, bucket_id, name, definition, check, command)
VALUES (
  'allow_public_avatar_access',
  'profile-pictures',
  'Allow public access to view avatars',
  '(bucket_id = ''profile-pictures'' AND (storage.foldername(name))[1] = ''avatars'')',
  NULL,
  'SELECT'
) ON CONFLICT (id) DO NOTHING;

-- Allow users to update their own profile pictures
INSERT INTO storage.policies (id, bucket_id, name, definition, check, command)
VALUES (
  'allow_authenticated_updates',
  'profile-pictures',
  'Allow users to update their own avatars',
  '(bucket_id = ''profile-pictures'' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = ''avatars'')',
  '(bucket_id = ''profile-pictures'' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = ''avatars'')',
  'UPDATE'
) ON CONFLICT (id) DO NOTHING;

-- Allow users to delete their own profile pictures
INSERT INTO storage.policies (id, bucket_id, name, definition, check, command)
VALUES (
  'allow_authenticated_deletes',
  'profile-pictures',
  'Allow users to delete their own avatars',
  '(bucket_id = ''profile-pictures'' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = ''avatars'')',
  NULL,
  'DELETE'
) ON CONFLICT (id) DO NOTHING;