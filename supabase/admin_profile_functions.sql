-- Additional profile management functions for admin use

-- Function to get all profiles
CREATE OR REPLACE FUNCTION public.get_all_profiles()
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  email TEXT,
  role TEXT,
  company TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_sign_in TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.display_name,
    p.email,
    p.role,
    p.company,
    p.phone,
    p.address,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    u.last_sign_in_at AS last_sign_in FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update a profile by admin
CREATE OR REPLACE FUNCTION public.admin_update_profile(
  profile_id UUID,
  display_name_param TEXT,
  role_param TEXT,
  company_param TEXT,
  phone_param TEXT,
  address_param TEXT,
  avatar_url_param TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update profiles';
    RETURN FALSE;
  END IF;

  -- Update the profile
  UPDATE public.profiles
  SET
    display_name = COALESCE(display_name_param, display_name),
    role = COALESCE(role_param, role),
    company = company_param,
    phone = phone_param,
    address = address_param,
    avatar_url = avatar_url_param,
    updated_at = NOW()
  WHERE id = profile_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Update admin email reference in this function
CREATE OR REPLACE FUNCTION public.set_admin_email(new_email TEXT DEFAULT 's.admin@bonairemakelaars.com')
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 's.foort@bonairemakelaars.com';
  
  -- If admin exists with old email, update to new email
  IF admin_user_id IS NOT NULL THEN
    -- Update email in auth.users table
    UPDATE auth.users
    SET email = new_email
    WHERE id = admin_user_id;
    
    -- Update email in profiles table
    UPDATE public.profiles
    SET email = new_email
    WHERE id = admin_user_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to verify admin policies exist
CREATE OR REPLACE FUNCTION public.verify_admin_policies()
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Check if the admin policy exists for properties table
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'properties' 
  AND policyname = 'Admins can do anything';
  
  -- If policy doesn't exist, create it
  IF policy_count = 0 THEN
    EXECUTE '
      CREATE POLICY "Admins can do anything" 
      ON public.properties 
      AS PERMISSIVE
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() 
          AND role = ''admin''
        )
      )
    ';
  END IF;
  
  -- Check if the admin policy exists for profiles table
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'profiles' 
  AND policyname = 'Admins can update any profile';
  
  -- If policy doesn't exist, create it
  IF policy_count = 0 THEN
    EXECUTE '
      CREATE POLICY "Admins can update any profile" 
      ON public.profiles 
      AS PERMISSIVE
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() 
          AND role = ''admin''
        )
      )
    ';
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check admin access for the current user
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure the admin account exists and has proper privileges
CREATE OR REPLACE FUNCTION public.ensure_admin_account(
  admin_email TEXT DEFAULT 's.admin@bonairemakelaars.com',
  admin_password TEXT DEFAULT 'Admin@BonaireMakelaars2025!'
)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_hash TEXT := '$2a$10$zHFcFEeGkA6TI9XtLQJ8wePUnyCU4RvRHHZMjedoz3vCTzgW03nzy'; -- Pre-generated bcrypt hash
BEGIN
  -- Check if admin user exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = admin_email;
  
  IF v_user_id IS NULL THEN
    -- Create admin user if not exists
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      raw_app_meta_data
    ) VALUES (
      admin_email,
      v_hash,
      now(),
      jsonb_build_object('is_admin', true, 'name', 'Admin User'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::text[])
    )
    RETURNING id INTO v_user_id;
    
    -- Create profile for admin user
    INSERT INTO public.profiles (
      id,
      email,
      display_name,
      role
    ) VALUES (
      v_user_id,
      admin_email,
      'Admin User',
      'admin'
    );
  ELSE
    -- Ensure existing user has admin privileges
    UPDATE auth.users
    SET 
      encrypted_password = v_hash,
      raw_user_meta_data = jsonb_build_object('is_admin', true, 'name', 'Admin User')
    WHERE id = v_user_id;
    
    -- Update or create profile
    INSERT INTO public.profiles (
      id, 
      email,
      display_name,
      role
    ) VALUES (
      v_user_id,
      admin_email,
      'Admin User',
      'admin'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      display_name = EXCLUDED.display_name,
      role = EXCLUDED.role;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get the appropriate dashboard path based on user role
CREATE OR REPLACE FUNCTION public.get_user_dashboard()
RETURNS TEXT
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
  dashboard_path TEXT;
BEGIN
  -- Get the current user's role
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Determine which dashboard to show based on role
  CASE user_role
    WHEN 'admin' THEN
      dashboard_path := '/admin';
    WHEN 'realtor' THEN
      dashboard_path := '/makelaar';
    WHEN 'business' THEN
      dashboard_path := '/business';  
    WHEN 'owner' THEN
      dashboard_path := '/owner';
    ELSE
      dashboard_path := '/user'; -- Default dashboard for regular users
  END CASE;
  
  RETURN dashboard_path;
END;
$$ LANGUAGE plpgsql;

-- Function to set a user's role
CREATE OR REPLACE FUNCTION public.set_user_role(
  user_id UUID,
  new_role TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the current user is an admin
  IF NOT (SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )) THEN
    RAISE EXCEPTION 'Only admin users can change roles';
    RETURN FALSE;
  END IF;

  -- Validate the role is one of the allowed values
  IF new_role NOT IN ('admin', 'realtor', 'business', 'owner', 'user') THEN
    RAISE EXCEPTION 'Invalid role: must be admin, realtor, business, owner, or user';
    RETURN FALSE;
  END IF;

  -- Update the user's role
  UPDATE public.profiles
  SET 
    role = new_role,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
