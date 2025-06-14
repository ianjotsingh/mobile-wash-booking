
-- Create a table for company-specific service pricing
CREATE TABLE public.company_service_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    service_id TEXT NOT NULL, -- service identifier (e.g., 'basic-wash', 'premium-wash')
    service_name TEXT NOT NULL,
    base_price INTEGER NOT NULL, -- price in paise
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, service_id)
);

-- Enable RLS
ALTER TABLE public.company_service_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company service pricing
CREATE POLICY "Companies can view their own pricing" 
    ON company_service_pricing FOR SELECT 
    USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Companies can insert their own pricing" 
    ON company_service_pricing FOR INSERT 
    WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Companies can update their own pricing" 
    ON company_service_pricing FOR UPDATE 
    USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Companies can delete their own pricing" 
    ON company_service_pricing FOR DELETE 
    USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- Allow customers to view all available pricing
CREATE POLICY "Customers can view all available pricing" 
    ON company_service_pricing FOR SELECT 
    USING (is_available = true);

-- Insert some sample pricing data for existing companies
INSERT INTO company_service_pricing (company_id, service_id, service_name, base_price, is_available)
SELECT 
    c.id,
    'basic-wash',
    'Basic Wash',
    CASE 
        WHEN RANDOM() < 0.3 THEN 25900  -- ₹259
        WHEN RANDOM() < 0.6 THEN 29900  -- ₹299  
        ELSE 34900                      -- ₹349
    END,
    true
FROM companies c 
WHERE c.status = 'approved'
ON CONFLICT (company_id, service_id) DO NOTHING;

INSERT INTO company_service_pricing (company_id, service_id, service_name, base_price, is_available)
SELECT 
    c.id,
    'premium-wash',
    'Premium Wash',
    CASE 
        WHEN RANDOM() < 0.3 THEN 45900  -- ₹459
        WHEN RANDOM() < 0.6 THEN 49900  -- ₹499
        ELSE 54900                      -- ₹549
    END,
    true
FROM companies c 
WHERE c.status = 'approved'
ON CONFLICT (company_id, service_id) DO NOTHING;

INSERT INTO company_service_pricing (company_id, service_id, service_name, base_price, is_available)
SELECT 
    c.id,
    'full-detailing',
    'Full Detailing',
    CASE 
        WHEN RANDOM() < 0.3 THEN 79900  -- ₹799
        WHEN RANDOM() < 0.6 THEN 89900  -- ₹899
        ELSE 99900                      -- ₹999
    END,
    true
FROM companies c 
WHERE c.status = 'approved'
ON CONFLICT (company_id, service_id) DO NOTHING;

-- Add mechanic services too
INSERT INTO company_service_pricing (company_id, service_id, service_name, base_price, is_available)
SELECT 
    c.id,
    'emergency-roadside',
    'Emergency Roadside',
    CASE 
        WHEN RANDOM() < 0.3 THEN 39900  -- ₹399
        WHEN RANDOM() < 0.6 THEN 49900  -- ₹499
        ELSE 59900                      -- ₹599
    END,
    true
FROM companies c 
WHERE c.status = 'approved' AND c.has_mechanic = true
ON CONFLICT (company_id, service_id) DO NOTHING;

INSERT INTO company_service_pricing (company_id, service_id, service_name, base_price, is_available)
SELECT 
    c.id,
    'engine-diagnostics',
    'Engine Diagnostics',
    CASE 
        WHEN RANDOM() < 0.3 THEN 69900  -- ₹699
        WHEN RANDOM() < 0.6 THEN 79900  -- ₹799
        ELSE 89900                      -- ₹899
    END,
    true
FROM companies c 
WHERE c.status = 'approved' AND c.has_mechanic = true
ON CONFLICT (company_id, service_id) DO NOTHING;
