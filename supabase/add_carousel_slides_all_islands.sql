-- Add carousel slides for all islands (Aruba and Curacao)

-- First, let's add some slides for Aruba
INSERT INTO carousel_slides (
    title,
    description,
    image_url,
    external_link,
    island,
    year,
    period_number,
    always_visible,
    is_active,
    sort_order,
    created_by
) VALUES 
-- Aruba slides
(
    'Welkom in Aruba',
    'One Happy Island - Ontdek luxe villa''s en penthouses',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
    null,
    'aruba',
    2025,
    1,
    true,
    true,
    1,
    'system'
),
(
    'Eagle Beach Villa''s',
    'Exclusieve woningen aan een van de mooiste stranden ter wereld',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
    null,
    'aruba',
    2025,
    1,
    true,
    true,
    2,
    'system'
),
(
    'Palm Beach High-Rise',
    'Moderne appartementen met ongeëvenaard uitzicht',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
    null,
    'aruba',
    2025,
    1,
    true,
    true,
    3,
    'system'
),

-- Curacao slides
(
    'Welkom in Curaçao',
    'Prachtig Curaçao - Ontdek authentieke woningen in het hart van de Caribbean',
    'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
    null,
    'curacao',
    2025,
    1,
    true,
    true,
    1,
    'system'
),
(
    'Willemstad Monumentaal',
    'Historische panden in de UNESCO Werelderfgoed stad',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
    null,
    'curacao',
    2025,
    1,
    true,
    true,
    2,
    'system'
),
(
    'Mambo Beach Resorts',
    'Luxe appartementen met directe toegang tot het strand',
    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
    null,
    'curacao',
    2025,
    1,
    true,
    true,
    3,
    'system'
),
(
    'Jan Thiel Villas',
    'Moderne villa''s in een van de populairste wijken',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
    null,
    'curacao',
    2025,
    1,
    true,
    true,
    4,
    'system'
);

-- Verify the inserts
SELECT island, title, sort_order, is_active 
FROM carousel_slides 
ORDER BY island, sort_order;
