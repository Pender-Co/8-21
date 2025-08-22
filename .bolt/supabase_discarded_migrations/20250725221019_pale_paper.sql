/*
  # Create Storage Policies for Profile Pictures

  1. Storage Policies
    - `allow_authenticated_uploads` - Allow authenticated users to upload to avatars/ folder
    - `allow_public_avatar_access` - Allow public access to view profile pictures
    - `allow_authenticated_updates` - Allow users to update their own files
    - `allow_authenticated_deletes` - Allow users to delete their own files

  2. Security
    - Users can only upload/modify/delete their own files
    - Profile pictures are publicly viewable for display purposes
    - All operations are scoped to the avatars/ folder
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to upload files to avatars/ folder
CREATE POLICY "allow_authenticated_uploads" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND name LIKE 'avatars/%'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 2: Allow public access to view profile pictures
CREATE POLICY "allow_public_avatar_access" ON storage.objects
  FOR SELECT 
  TO public
  USING (
    bucket_id = 'profile-pictures' 
    AND name LIKE 'avatars/%'
  );

-- Policy 3: Allow authenticated users to update their own files
CREATE POLICY "allow_authenticated_updates" ON storage.objects
  FOR UPDATE 
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' 
    AND name LIKE 'avatars/%'
    AND auth.uid()::text = owner
  )
  WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND name LIKE 'avatars/%'
    AND auth.uid()::text = owner
  );

-- Policy 4: Allow authenticated users to delete their own files
CREATE POLICY "allow_authenticated_deletes" ON storage.objects
  FOR DELETE 
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' 
    AND name LIKE 'avatars/%'
    AND auth.uid()::text = owner
  );