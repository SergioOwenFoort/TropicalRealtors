-- Create vacation_properties table for Horo dashboard
CREATE TABLE IF NOT EXISTS public.vacation_properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude DECIMAL,
    longitude DECIMAL,
    bedrooms INTEGER DEFAULT 1,
    bathrooms DECIMAL DEFAULT 1,
    max_guests INTEGER DEFAULT 2,
    images TEXT[] DEFAULT '{}',
    description TEXT,
    property_type TEXT DEFAULT 'vacation_apartment',
    amenities TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    distance_from_center DECIMAL DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    check_in_time TEXT DEFAULT '15:00',
    check_out_time TEXT DEFAULT '11:00',
    minimum_stay INTEGER DEFAULT 1,
    maximum_stay INTEGER DEFAULT 30,
    cancellation_policy TEXT DEFAULT 'moderate',
    house_rules TEXT[] DEFAULT '{}',
    instant_booking BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'available',
    island TEXT NOT NULL,
    horo_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.vacation_properties ENABLE ROW LEVEL SECURITY;

-- Create policies for vacation_properties
CREATE POLICY "vacation_properties_select_policy" ON public.vacation_properties 
    FOR SELECT USING (true);

CREATE POLICY "vacation_properties_insert_policy" ON public.vacation_properties 
    FOR INSERT WITH CHECK (auth.uid() = horo_id);

CREATE POLICY "vacation_properties_update_policy" ON public.vacation_properties 
    FOR UPDATE USING (auth.uid() = horo_id);

CREATE POLICY "vacation_properties_delete_policy" ON public.vacation_properties 
    FOR DELETE USING (auth.uid() = horo_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vacation_properties_horo_id ON public.vacation_properties(horo_id);
CREATE INDEX IF NOT EXISTS idx_vacation_properties_island ON public.vacation_properties(island);
CREATE INDEX IF NOT EXISTS idx_vacation_properties_status ON public.vacation_properties(status);
CREATE INDEX IF NOT EXISTS idx_vacation_properties_featured ON public.vacation_properties(featured);
CREATE INDEX IF NOT EXISTS idx_vacation_properties_rating ON public.vacation_properties(rating);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_vacation_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vacation_properties_updated_at_trigger
    BEFORE UPDATE ON public.vacation_properties
    FOR EACH ROW
    EXECUTE FUNCTION update_vacation_properties_updated_at();

SELECT 'Vacation properties table created successfully with RLS policies and indexes!' as status;