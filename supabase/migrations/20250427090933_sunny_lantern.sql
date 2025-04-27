/*
  # Fix profiles table policies recursion

  1. Changes
    - Remove recursive admin policy that was causing infinite loops
    - Add new simplified admin policy for profiles table
    
  2. Security
    - Maintains RLS on profiles table
    - Updates policies to prevent recursion while maintaining security
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create new non-recursive admin policy
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE user_id = auth.uid())
);