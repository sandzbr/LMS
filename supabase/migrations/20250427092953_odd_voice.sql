/*
  # Check and set admin user
  
  1. Check if user exists and set admin privileges
  2. Print current admin status
*/

-- Check and set admin for specific user
DO $$
DECLARE
  target_email TEXT := 'muley.sandeep@outlook.com';
  user_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Get user ID
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = target_email;

  IF user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found', target_email;
    RETURN;
  END IF;

  -- Check current admin status
  SELECT (raw_user_meta_data->>'is_admin')::boolean INTO is_admin
  FROM auth.users
  WHERE id = user_id;

  RAISE NOTICE 'Current admin status for %: %', target_email, COALESCE(is_admin, false);

  -- Set admin privileges if not already set
  IF NOT COALESCE(is_admin, false) THEN
    UPDATE auth.users
    SET raw_user_meta_data = 
      CASE 
        WHEN raw_user_meta_data IS NULL THEN jsonb_build_object('is_admin', true)
        ELSE raw_user_meta_data || jsonb_build_object('is_admin', true)
      END
    WHERE id = user_id;
    
    RAISE NOTICE 'Admin privileges granted to %', target_email;
  END IF;
END $$;