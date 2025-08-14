-- Create the check_admin_credentials function
CREATE OR REPLACE FUNCTION check_admin_credentials(admin_email text, admin_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  user_role text;
  password_valid boolean := false;
BEGIN
  -- Check if user exists in profiles with admin role
  SELECT id, role INTO user_id, user_role
  FROM profiles 
  WHERE email = admin_email AND role = 'admin';
  
  IF user_id IS NULL THEN{
  "homepage": "https://SergioOwenFoort// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/tropicalrealtors.com/', // Replace with your repo name
  build: {
    outDir: 'dist'
  }
}).github.io/tropicalrealtors.com",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
    RETURN jsonb_build_object('success', false, 'message', 'Admin user not found');
  END IF;
  
  -- For now, we'll use a simple password check
  -- In production, you should hash passwords properly
  IF admin_password = 'admin123' OR admin_password = 'password' OR admin_password = 'bonaire123' THEN
    password_valid := true;
  END IF;
  
  IF password_valid THEN
    RETURN jsonb_build_object(
      'success', true, 
      'user_id', user_id,
      'message', 'Admin login successful'
    );
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Invalid password');
  END IF;
END;
$$;
