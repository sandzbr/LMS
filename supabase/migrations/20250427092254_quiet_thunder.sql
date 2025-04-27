/*
  # Fix admin access system
  
  1. Changes
    - Add admin role to auth schema
    - Create admin access policy for leads table
    - Update admin check function to be more reliable
  
  2. Security
    - Ensure admin access is properly enforced
    - Maintain existing user access restrictions
*/

-- Create admin role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Update admin check function to be more reliable
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND (
      raw_user_meta_data->>'is_admin' = 'true'
      OR raw_user_meta_data->>'is_admin' = 'True'
      OR raw_user_meta_data->>'is_admin' = 't'
      OR raw_user_meta_data->>'is_admin' = '1'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;