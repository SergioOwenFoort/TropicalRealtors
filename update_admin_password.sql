-- Update the admin password for s.admin@bonairemakelaars.com
-- This assumes the password is stored in plain text in the 'profiles' table under the 'password' column.
-- If you use a different table/column or hash the password, adjust accordingly.

UPDATE auth.users
SET 
	encrypted_password = crypt('IHaveDoneIt!', gen_salt('bf')),
	email_confirmed_at = now(),
	updated_at = now(),
	is_sso_user = false,
	raw_user_meta_data = jsonb_set(
		COALESCE(raw_user_meta_data, '{}'::jsonb),
		'{isAdmin}', 
		'true'::jsonb
	),
	raw_app_meta_data = raw_app_meta_data - 'mfa_enabled',
	confirmation_token = NULL,
	recovery_token = NULL
WHERE email = 's.admin@bonairemakelaars.com';

-- If your password is stored in a different table (e.g., 'users'), change 'profiles' to 'users'.
-- If you hash passwords, use the appropriate hash function.
-- Run this in the Supabase SQL editor or psql.
