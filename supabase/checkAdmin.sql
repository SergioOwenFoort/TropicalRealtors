-- Check admin status for user
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->'is_admin' as is_admin_in_auth,
  p.role as profile_role,
  u.raw_app_meta_data->'provider' as provider,
  u.last_sign_in_at,
  u.created_at,
  u.updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 's.admin@bonairemakelaars.com';
