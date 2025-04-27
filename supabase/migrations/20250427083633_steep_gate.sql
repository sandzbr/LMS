/*
  # Add admin system capabilities
  
  1. Changes
    - Add admin role and policy for accessing all leads
    - Add view for admin dashboard that includes user details
  
  2. Security
    - Only admin users can access all leads data
    - Regular users' access remains restricted to their own leads
*/

-- Create admin role
CREATE ROLE admin;

-- Create a view for admin dashboard that includes user details
CREATE VIEW admin_leads_view AS
SELECT 
  l.*,
  u.email as sp_email,
  u.phone as sp_phone,
  CASE 
    WHEN u.email IS NOT NULL THEN split_part(u.email, '@', 1)
    WHEN u.phone IS NOT NULL THEN 'User ' || substr(u.phone, -4)
    ELSE 'Unknown'
  END as sales_partner_name
FROM leads l
LEFT JOIN auth.users u ON l.user_id = u.id;

-- Grant access to admin role
GRANT SELECT ON admin_leads_view TO admin;

-- Create policy for admin access to all leads
CREATE POLICY "Admins can access all leads" 
ON leads
FOR ALL
TO admin
USING (true)
WITH CHECK (true);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'is_admin' = 'true'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;