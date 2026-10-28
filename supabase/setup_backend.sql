-- ==============================================================================
-- LIBERTY HOMES ABUJA - COMPLETE SUPABASE BACKEND SETUP SCRIPT
-- Copy and paste this entire script into your Supabase SQL Editor and click RUN.
-- 
-- Target Admin User ID: 70f6038d-7ffd-4a9f-945b-8ee450d0ba71
-- WhatsApp / Phone: 09160336411
-- Email: winifredmaduabuchi368@gmail.com
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. USER ROLES TABLE (Controlled Administrative Access)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_lookup ON public.user_roles(user_id, role);

-- ------------------------------------------------------------------------------
-- 3. FUNCTION TO CHECK IF AUTHENTICATED USER IS ADMIN (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- ------------------------------------------------------------------------------
-- 4. PROPERTIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    location VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    land_size NUMERIC(10, 2) NOT NULL CHECK (land_size > 0),
    land_size_unit VARCHAR(50) NOT NULL DEFAULT 'sqm',
    property_type VARCHAR(100) NOT NULL DEFAULT 'Residential Land',
    documentation_status VARCHAR(150) NOT NULL DEFAULT 'C of O (Certificate of Occupancy)',
    availability_status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'under_offer', 'sold')),
    listing_status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (listing_status IN ('draft', 'pending_approval', 'approved', 'published', 'archived')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    cover_image_path TEXT NOT NULL,
    nearby_landmarks TEXT[] DEFAULT ARRAY[]::TEXT[],
    infrastructure_features TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(listing_status, availability_status);
CREATE INDEX IF NOT EXISTS idx_properties_district ON public.properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_featured);

-- ------------------------------------------------------------------------------
-- 5. PROPERTY IMAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    alt_text VARCHAR(255) DEFAULT '',
    display_order INT NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_property_images_prop ON public.property_images(property_id, display_order);

-- ------------------------------------------------------------------------------
-- 6. INQUIRIES & CUSTOMER REQUESTS TABLE (Clean - No dummy data)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (request_type IN (
        'general', 'property', 'viewing', 'land_banking', 'resale', 'construction', 'survey_planning'
    )),
    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    related_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    preferred_viewing_date DATE,
    preferred_viewing_time VARCHAR(50),
    resale_property_location VARCHAR(255),
    resale_land_size VARCHAR(100),
    resale_asking_price NUMERIC(15, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'contacted', 'scheduled', 'resolved', 'closed')),
    priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_admin_id UUID,
    resolution_details TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status, request_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON public.inquiries(related_property_id);

-- ------------------------------------------------------------------------------
-- 7. INQUIRY NOTES (Confidential Administrative Notes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inquiry_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL,
    admin_name VARCHAR(100) NOT NULL DEFAULT 'Administrator',
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry ON public.inquiry_notes(inquiry_id);

-- ------------------------------------------------------------------------------
-- 8. ERROR REPORTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.error_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_name VARCHAR(150),
    reporter_email VARCHAR(255),
    page_url TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    error_code VARCHAR(100) DEFAULT 'CLIENT_REPORTED',
    severity VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'fixed', 'closed')),
    assigned_admin_id UUID,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_error_reports_status ON public.error_reports(status, severity);

-- ------------------------------------------------------------------------------
-- 9. AUDIT LOGS TABLE (Append-Only)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID,
    actor_email VARCHAR(255) NOT NULL DEFAULT 'system',
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 10. SAVED PROPERTIES TABLE (Favorites)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_saved_properties_user_property UNIQUE (user_id, property_id)
);

-- ------------------------------------------------------------------------------
-- 11. SITE SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id VARCHAR(100) PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_by UUID
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- USER ROLES POLICIES
DROP POLICY IF EXISTS "Admins or owners can read user roles" ON public.user_roles;
CREATE POLICY "Admins or owners can read user roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can modify user roles" ON public.user_roles;
CREATE POLICY "Only admins can modify user roles"
ON public.user_roles FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- PROPERTIES POLICIES (Public only sees published; Admins manage all)
DROP POLICY IF EXISTS "Public can view published properties" ON public.properties;
CREATE POLICY "Public can view published properties"
ON public.properties FOR SELECT
USING (listing_status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert properties" ON public.properties;
CREATE POLICY "Admins can insert properties"
ON public.properties FOR INSERT
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update properties" ON public.properties;
CREATE POLICY "Admins can update properties"
ON public.properties FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;
CREATE POLICY "Admins can delete properties"
ON public.properties FOR DELETE
USING (public.is_admin());

-- PROPERTY IMAGES POLICIES
DROP POLICY IF EXISTS "Public can view images of published properties or admins" ON public.property_images;
CREATE POLICY "Public can view images of published properties or admins"
ON public.property_images FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id = property_images.property_id
        AND (p.listing_status = 'published' OR public.is_admin())
    )
);

DROP POLICY IF EXISTS "Admins can manage property images" ON public.property_images;
CREATE POLICY "Admins can manage property images"
ON public.property_images FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- INQUIRIES POLICIES
DROP POLICY IF EXISTS "Anyone can submit an inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit an inquiry"
ON public.inquiries FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view inquiries" ON public.inquiries;
CREATE POLICY "Only admins can view inquiries"
ON public.inquiries FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can update inquiries" ON public.inquiries;
CREATE POLICY "Only admins can update inquiries"
ON public.inquiries FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete inquiries" ON public.inquiries;
CREATE POLICY "Only admins can delete inquiries"
ON public.inquiries FOR DELETE
USING (public.is_admin());

-- INQUIRY NOTES POLICIES (Strictly Admin Private)
DROP POLICY IF EXISTS "Only admins can manage inquiry notes" ON public.inquiry_notes;
CREATE POLICY "Only admins can manage inquiry notes"
ON public.inquiry_notes FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ERROR REPORTS POLICIES
DROP POLICY IF EXISTS "Anyone can submit an error report" ON public.error_reports;
CREATE POLICY "Anyone can submit an error report"
ON public.error_reports FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view error reports" ON public.error_reports;
CREATE POLICY "Only admins can view error reports"
ON public.error_reports FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can update error reports" ON public.error_reports;
CREATE POLICY "Only admins can update error reports"
ON public.error_reports FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins or system can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins or system can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (public.is_admin() OR auth.uid() IS NOT NULL);

-- SAVED PROPERTIES POLICIES
DROP POLICY IF EXISTS "Users can view their own saved properties" ON public.saved_properties;
CREATE POLICY "Users can view their own saved properties"
ON public.saved_properties FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved properties" ON public.saved_properties;
CREATE POLICY "Users can insert their own saved properties"
ON public.saved_properties FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved properties" ON public.saved_properties;
CREATE POLICY "Users can delete their own saved properties"
ON public.saved_properties FOR DELETE
USING (auth.uid() = user_id);

-- SITE SETTINGS POLICIES
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
ON public.site_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Only admins can modify site settings" ON public.site_settings;
CREATE POLICY "Only admins can modify site settings"
ON public.site_settings FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 12. ASSIGN ADMINISTRATOR ROLE TO EXISTING USER ID
-- Target User ID: 70f6038d-7ffd-4a9f-945b-8ee450d0ba71
-- ==============================================================================
INSERT INTO public.user_roles (user_id, role)
VALUES ('70f6038d-7ffd-4a9f-945b-8ee450d0ba71', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- ==============================================================================
-- 13. CONFIGURE REAL SITE SETTINGS & CONTACT INFO
-- Phone & WhatsApp: 09160336411
-- Email: winifredmaduabuchi368@gmail.com
-- ==============================================================================
INSERT INTO public.site_settings (id, data)
VALUES (
    'company_info',
    '{
        "name": "Liberty Homes",
        "tagline": "WHERE YOUR DREAM HOME BEGINS",
        "city": "Abuja",
        "state": "Federal Capital Territory",
        "country": "Nigeria",
        "address": "Suite 304, Millennium Builders Plaza, Central Business District, Abuja, FCT",
        "phone": "09160336411",
        "email": "winifredmaduabuchi368@gmail.com",
        "whatsapp": "09160336411",
        "working_hours": "Monday - Saturday: 8:00 AM - 5:30 PM (WAT)",
        "announcement": "Verified Title Deeds & Instant Beacon Verification in Katampe, Guzape & Jahi"
    }'::JSONB
)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

-- ==============================================================================
-- 14. SEED VERIFIED ABUJA LAND PARCELS (No dummy inquiries)
-- ==============================================================================
INSERT INTO public.properties (
    id, title, slug, description, price, currency, location, district, land_size, land_size_unit,
    property_type, documentation_status, availability_status, listing_status, is_featured,
    cover_image_path, nearby_landmarks, infrastructure_features, created_by, approved_by, approved_at, published_at
) VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'Hillside Serenity: Premium Residential Plot',
    'hillside-serenity-katampe-extension',
    'Spectacular elevated plot in the prestigious Katampe Extension diplomatic enclave. Features panoramic hill views of Abuja, gentle slope ideal for a modern split-level mansion, and complete infrastructure including asphalt road access, underground power, and drainage conduits. Close to top international schools and diplomatic residencies.',
    120000000.00,
    'NGN',
    'Diplomatic Zone, Off Murtala Muhammed Expressway',
    'Katampe Extension',
    1200.00,
    'sqm',
    'Residential Land',
    'C of O (Certificate of Occupancy)',
    'available',
    'published',
    true,
    '/src/assets/images/property_katampe_hills_1793003670114.jpg',
    ARRAY['8 mins to Maitama', '15 mins to Central Business District', 'Close to Ministers Hill'],
    ARRAY['Tarred Access Road', 'Underground Storm Drainage', 'Street Lighting', 'Electricity Grid Connected', 'Perimeter Survey Beacons in Place'],
    '70f6038d-7ffd-4a9f-945b-8ee450d0ba71',
    '70f6038d-7ffd-4a9f-945b-8ee450d0ba71',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
),
(
    'a2000000-0000-0000-0000-000000000002',
    'The Ridge Estate: Luxury Residential Serviced Plot',
    'the-ridge-estate-guzape-hills',
    'Exceptional cliffside residential plot in high-brow Guzape District. Situated in an upscale neighborhood with high-profile residences. Offers breathtaking views overlooking Asokoro and the National Stadium corridor. Direct dual-carriage access with verified FCDA allocation and ready for immediate building plan submission.',
    165000000.00,
    'NGN',
    'Hilltop Crescent, Guzape Phase 1',
    'Guzape',
    1500.00,
    'sqm',
    'Residential Land',
    'C of O (Certificate of Occupancy)',
    'available',
    'published',
    true,
    '/src/assets/images/property_guzape_luxury_1793003671295.jpg',
    ARRAY['10 mins to Asokoro', '12 mins to National Assembly', 'Guzape Police Station nearby'],
    ARRAY['Paved Dual-Carriage Road', 'Piped Water Network', 'Perimeter Estate Gate', 'Clear Topographical Survey', 'FCDA Beacon Numbers Verified'],
    '70f6038d-7ffd-4a9f-945b-8ee450d0ba71',
    '70f6038d-7ffd-4a9f-945b-8ee450d0ba71',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
),
(
    'a3000000-0000-0000-0000-000000000003',
    'Urban Prime: Fully Serviced Commercial/Residential Plot',
    'urban-prime-serviced-plot-jahi',
    'Fully dry flat land plot situated in the fast-growing Jahi District, right beside the Gwarinpa expressway node. Ideal for multi-unit luxury terraced duplexes or an executive boutique residence. Features immediate access to water and national grid power with zero sand-filling required.',
    85000000.00,
    'NGN',
    'Sector Centre Axis, Jahi Phase 2',
    'Jahi',
    800.00,
    'sqm',
    'Serviced Plot',
    'Right of Occupancy (R of O)',
    'available',
    'published',
    true,
    '/src/assets/images/property_jahi_district_1793003670944.jpg',
    ARRAY['5 mins to Next Cash and Carry', '7 mins to Mabushi', '15 mins to Wuse II'],
    ARRAY['Dual Access Gates', 'Interlocked Internal Roads', 'Solar Street Lights', 'Clear Boundary Demarcation', 'Pre-approved 4-Bedroom Duplex Density'],
    '70f6038d-7ffd-4a9f-945b-8ee450d0ba71',
    '70f6038d-7ffd-4a9f-945b-8ee450d0ba71',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
),
(
    'a4000000-0000-0000-0000-000000000004',
    'Heritage Green: Land Banking & Residential Investment Parcel',
    'heritage-green-airport-road-corridor',
    'High-growth land banking opportunity positioned along the prominent Airport Road corridor near Centenary City master development. Ideal for forward-looking real estate investors seeking capital appreciation or phased private development. Flat topography, well-documented title, and direct main highway connectivity.',
    32000000.00,
    'NGN',
    'Centenary City Bypass, Lugbe Expansion Axis',
    'Airport Road Corridor',
    600.00,
    'sqm',
    'Residential Land',
    'Gazette / FCDA Allocation',
    'available',
    'published',
    true,
    '/src/assets/images/hero_abuja_land_1793003669625.jpg',
    ARRAY['20 mins to Nnamdi Azikiwe International Airport', '20 mins to City Gate', 'Adjacent to Centenary City Project'],
    ARRAY['Wide Access Road Reserves', 'Survey Pillar Registered', 'Free from Customary Encumbrances', 'Rapidly Appreciating Commercial Corridor'],
    '70f6038d-7ffd-4a9f-945b-8ee450d0ba71',
    '70f6038d-7ffd-4a9f-945b-8ee450d0ba71',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
),
(
    'a5000000-0000-0000-0000-000000000005',
    'Maitama Hills: Ultra-Exclusive Panoramic Villa Plot',
    'maitama-hills-panoramic-villa-plot',
    'A rare jewel in the most exclusive residential belt of Abuja. Perched on a quiet cul-de-sac overlooking the city lights with pristine air quality and ultimate security. Accommodates expansive ambassadorial mansion designs with pool, tennis court, and lush private gardens.',
    380000000.00,
    'NGN',
    'Highland Ridge Way, Maitama Extension',
    'Maitama',
    2400.00,
    'sqm',
    'Residential Land',
    'C of O (Certificate of Occupancy)',
    'under_offer',
    'published',
    false,
    '/src/assets/images/hero_abuja_land_1793003669625.jpg',
    ARRAY['3 mins to Transcorp Hilton', '5 mins to European Union Delegation', 'Supreme Court & Federal Secretariat nearby'],
    ARRAY['Heavy-duty Security Checkpoint', 'Paved Underground Ducts', 'Fiber Optic Ready', 'Exclusive Diplomatic Zoning'],
    '70f6038d-7ffd-4a9f-945b-8ee450d0ba71',
    '70f6038d-7ffd-4a9f-945b-8ee450d0ba71',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (slug) DO NOTHING;
