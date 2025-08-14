-- Clear existing data to avoid conflicts
TRUNCATE public.profiles, public.realtors, public.properties, public.carousel_slides RESTART IDENTITY CASCADE;

-- Import production data
-- Profiles (3 records)
INSERT INTO public.profiles (id, email, display_name, avatar_url, role, created_at, updated_at, favorites) VALUES ('c651beb8-fc30-427e-b96e-a15664a414fb', 'sergiofoort@hotmail.com', 'Sergio Foort', NULL, 'realtor', '2025-06-16T11:19:54.602876+00:00', '2025-06-16T11:19:54.602876+00:00', '{}') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, email, display_name, avatar_url, role, created_at, updated_at, favorites) VALUES ('893e3c6a-5a5d-46b5-92f5-b3b4a379a6ec', 's.foort@bonairemakelaars.com', 'Admin User', NULL, 'admin', '2025-06-23T08:46:54.930652+00:00', '2025-06-23T09:22:12.327728+00:00', '{}') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, email, display_name, avatar_url, role, created_at, updated_at, favorites) VALUES ('b0ed5212-1c14-4186-aa01-2d98ac0a5fc3', 's.admin@bonairemakelaars.com', 'Admin User', NULL, 'admin', '2025-06-23T09:41:55.906938+00:00', '2025-06-23T09:41:55.906938+00:00', '{}') ON CONFLICT DO NOTHING;
