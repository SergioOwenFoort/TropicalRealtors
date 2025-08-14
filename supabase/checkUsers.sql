-- Check users and roles
SELECT au.id, au.email, au.role, au.raw_user_meta_data, p.role as profile_role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;
