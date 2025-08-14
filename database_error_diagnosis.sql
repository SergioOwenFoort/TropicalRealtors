-- SQL Error Diagnostic Script
-- When you get "Database error querying schema" during login,
-- run this script to identify the exact error in the SQL Editor

-- 1. Check database error logs related to auth
DO $$
DECLARE
    log_record RECORD;
BEGIN
    FOR log_record IN 
        SELECT 
            event_time,
            message,
            context
        FROM 
            pg_catalog.pg_event_trigger_dropped_objects()
        WHERE 
            schema_name = 'auth' OR object_name LIKE 'auth%'
        ORDER BY 
            event_time DESC
        LIMIT 10
    LOOP
        RAISE NOTICE 'Time: %, Message: %', 
            log_record.event_time, 
            log_record.message;
    END LOOP;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error checking logs: %', SQLERRM;
END $$;

-- 2. Check for missing or corrupt auth functions
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_result(p.oid) AS result_type,
    pg_get_functiondef(p.oid) AS function_def
FROM 
    pg_proc p
JOIN 
    pg_namespace n ON p.pronamespace = n.oid
WHERE 
    n.nspname = 'auth' 
    AND p.proname IN ('uid', 'role', 'email', 'jwt');

-- 3. Check if we can manually simulate what happens during login
DO $$
BEGIN
    -- Test if we can generate a JWT token
    PERFORM set_config('request.jwt.claims', 
        '{"sub":"00000000-0000-0000-0000-000000000000","email":"test@example.com","role":"authenticated"}', 
        false);
    
    -- Now test the auth functions with this simulated JWT
    RAISE NOTICE 'Testing auth.uid() result: %', auth.uid();
    RAISE NOTICE 'Testing auth.role() result: %', auth.role();
    RAISE NOTICE 'Testing auth.email() result: %', auth.email();
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error testing JWT simulation: %', SQLERRM;
END $$;

-- 4. Check for unusual RLS policies that might be blocking login
SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    p.polname AS policy_name,
    p.polpermissive AS is_permissive,
    p.polcmd AS command,
    pg_catalog.pg_get_expr(p.polqual, p.polrelid) AS using_expression,
    pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid) AS with_check_expression
FROM
    pg_catalog.pg_policy p
JOIN
    pg_catalog.pg_class c ON c.oid = p.polrelid
JOIN
    pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE
    (n.nspname = 'public' AND c.relname IN ('profiles', 'users')) OR
    (n.nspname = 'auth' AND c.relname = 'users')
ORDER BY
    schema_name, table_name, policy_name;

-- 5. Check admin user and profile linkage
SELECT
    au.id AS auth_user_id,
    au.email AS auth_user_email,
    au.role AS auth_user_role,
    au.raw_app_meta_data AS auth_user_metadata,
    p.id AS profile_id,
    p.email AS profile_email,
    p.role AS profile_role
FROM
    auth.users au
LEFT JOIN
    public.profiles p ON au.id = p.id
WHERE
    au.email = 's.admin@bonairemakelaars.com';

-- 6. Simple fix to update or create admin user's profile
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- Get admin ID
    SELECT id INTO admin_id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';
    
    IF admin_id IS NOT NULL THEN
        -- Update or insert admin profile
        INSERT INTO public.profiles (id, email, role, display_name)
        VALUES (admin_id, 's.admin@bonairemakelaars.com', 'admin', 'Admin User')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'admin', display_name = 'Admin User';
        
        RAISE NOTICE 'Admin profile updated with ID: %', admin_id;
    ELSE
        RAISE NOTICE 'Admin user not found in auth.users table';
    END IF;
END $$;
