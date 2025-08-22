/*
  # Storage Policies for Profile Pictures

  1. Storage Policies
    - `allow_authenticated_uploads` - Allow authenticated users to upload to avatars/ folder
    - `allow_public_avatar_access` - Allow public access to view profile pictures
    - `allow_authenticated_updates` - Allow users to update their own avatars
    - `allow_authenticated_deletes` - Allow users to delete their own avatars

  2. Security
    - Users can only upload to the avatars/ folder
    - Profile pictures are publicly viewable (necessary for display)
    - Users can only modify/delete their own uploaded files
*/

-- Policy 1: Allow authenticated users to upload profile pictures
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, target_roles)
VALUES (
  'allow_authenticated_uploads',
  'profile-pictures',
  'Allow authenticated uploads',
  '(bucket_id = ''profile-pictures'' AND auth.uid() IS NOT NULL)',
  '(bucket_id = ''profile-pictures'' AND auth.uid() IS NOT NULL)',
  'INSERT',
  '{authenticated}'
);

-- Policy 2: Allow public access to view profile pictures
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, target_roles)
VALUES (
  'allow_public_avatar_access',
  'profile-pictures',
  'Allow public avatar access',
  '(bucket_id = ''profile-pictures'')',
  '(bucket_id = ''profile-pictures'')',
  'SELECT',
  '{anon, authenticated}'
);

-- Policy 3: Allow authenticated users to update their own profile pictures
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, target_roles)
VALUES (
  'allow_authenticated_updates',
  'profile-pictures',
  'Allow authenticated updates',
  '(bucket_id = ''profile-pictures'' AND auth.uid()::text = (storage.foldername(name))[1])',
  '(bucket_id = ''profile-pictures'' AND auth.uid()::text = (storage.foldername(name))[1])',
  'UPDATE',
  '{authenticated}'
);

-- Policy 4: Allow authenticated users to delete their own profile pictures
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, target_roles)
VALUES (
  'allow_authenticated_deletes',
  'profile-pictures',
  'Allow authenticated deletes',
  '(bucket_id = ''profile-pictures'' AND auth.uid()::text = (storage.foldername(name))[1])',
  '(bucket_id = ''profile-pictures'' AND auth.uid()::text = (storage.foldername(name))[1])',
  'DELETE',
  '{authenticated}'
);