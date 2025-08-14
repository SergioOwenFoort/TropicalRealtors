-- Simple seed data for testing
-- Note: This assumes the tables have already been created by migrations

-- Insert sample carousel slide
INSERT INTO public.carousel_slides (title, description, image_url, external_link, sort_order) 
VALUES (
    'Welcome to Bonaire Real Estate',
    'Find your dream home in paradise',
    'https://via.placeholder.com/800x400?text=Welcome+to+Bonaire',
    'https://bonairemakelaars.com',
    1
)
ON CONFLICT DO NOTHING;

-- Insert sample realtor
INSERT INTO public.realtors (name, email, phone, bio) 
VALUES (
    'John Doe', 
    'john@bonairemakelaars.com', 
    '+599-123-4567',
    'Experienced real estate agent specializing in Bonaire properties.'
)
ON CONFLICT DO NOTHING;
