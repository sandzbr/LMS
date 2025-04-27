/*
  # Fix admin recursion issues
  
  1. Changes
    - Drop existing admin policies and functions
    - Create new admin check function using auth.users metadata
    - Create new admin policies using metadata check
    
  2. Security
    - Maintain existing security model
    - Use more efficient admin checking
*/

-- Drop existing policies and functions
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP FUNCTION IF EXISTS auth.is_admin();

-- Create new admin check function using metadata
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'is_admin', 'false')::boolean
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new admin policy using metadata check
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (auth.is_admin());

-- Create admin update policy
CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.is_admin())
WITH CHECK (auth.is_admin());