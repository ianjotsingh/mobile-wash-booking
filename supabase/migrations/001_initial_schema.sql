
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'company', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE company_status AS ENUM ('pending', 'approved', 'rejected');

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    description TEXT,
    experience TEXT,
    services TEXT[] DEFAULT '{}',
    status company_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL, -- Price in paise/cents
    duration INTEGER NOT NULL, -- Duration in minutes
    features TEXT[] DEFAULT '{}',
    popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    special_instructions TEXT,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    car_type TEXT,
    car_color TEXT,
    car_model TEXT,
    additional_notes TEXT,
    status booking_status DEFAULT 'pending',
    total_amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default services
INSERT INTO services (name, description, price, duration, features, popular) VALUES
('Basic Wash', 'Essential exterior cleaning', 29900, 30, '{"Exterior wash & rinse","Wheel cleaning","Basic interior vacuum","Window cleaning"}', false),
('Premium Wash', 'Complete interior & exterior', 59900, 60, '{"Everything in Basic","Interior deep cleaning","Dashboard & console wipe","Tire shine","Air freshener"}', true),
('Full Detailing', 'Professional detailing service', 129900, 180, '{"Everything in Premium","Paint protection wax","Engine bay cleaning","Leather conditioning","Steam cleaning"}', false);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Companies policies
CREATE POLICY "Companies can view their own data" ON companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Companies can update their own data" ON companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert company data" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Everyone can view approved companies" ON companies FOR SELECT USING (status = 'approved');

-- Services policies
CREATE POLICY "Everyone can view services" ON services FOR SELECT USING (true);

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Companies can view their bookings" ON bookings FOR SELECT USING (auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id));
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Companies can update their bookings" ON bookings FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id));

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, full_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'customer');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
