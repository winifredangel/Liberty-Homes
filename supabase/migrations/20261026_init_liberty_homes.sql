-- ==============================================================================
-- LIBERTY HOMES ABUJA - FULL SUPABASE DATABASE MIGRATION & RLS POLICIES
-- Target Admin User ID: 70f6038d-7ffd-4a9f-945b-8ee450d0ba71
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER ROLES TABLE (Controlled Administrative Access)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role)
);

-- Index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup ON public.user_roles(user_id, role);

-- 3. FUNCTION TO CHECK IF AUTHENTICATED USER IS ADMIN (SECURITY DEFINER TO PREVENT RLS RECURSION)
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

-- 4. PROPERTIES TABLE
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

-- 5. PROPERTY IMAGES TABLE
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

-- 6. INQUIRIES & CUSTOMER REQUESTS TABLE
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

-- 7. INQUIRY NOTES (Internal Admin Notes)
CREATE TABLE IF NOT EXISTS public.inquiry_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL,
    admin_name VARCHAR(100) NOT NULL DEFAULT 'Administrator',
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry ON public.inquiry_notes(inquiry_id);

-- 8. ERROR REPORTS TABLE
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

-- 9. AUDIT LOGS TABLE
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

-- 10. SAVED PROPERTIES TABLE (User favorites)
CREATE TABLE IF NOT EXISTS public.saved_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_saved_properties_user_property UNIQUE (user_id, property_id)
);

-- 11. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id VARCHAR(100) PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_by UUID
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- USER ROLES POLICIES
-- ------------------------------------------------------------------------------
-- Admins can view roles, and users can see their own role
CREATE POLICY "Admins or owners can read user roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

-- Only admins can manage roles (insert/update/delete)
CREATE POLICY "Only admins can modify user roles"
ON public.user_roles FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- PROPERTIES POLICIES
-- ------------------------------------------------------------------------------
-- Public can view ONLY published properties
CREATE POLICY "Public can view published properties"
ON public.properties FOR SELECT
USING (listing_status = 'published' OR public.is_admin());

-- Only admins can insert, update, or delete properties
CREATE POLICY "Admins can insert properties"
ON public.properties FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update properties"
ON public.properties FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete properties"
ON public.properties FOR DELETE
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- PROPERTY IMAGES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view images of published properties or admins"
ON public.property_images FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id = property_images.property_id
        AND (p.listing_status = 'published' OR public.is_admin())
    )
);

CREATE POLICY "Admins can manage property images"
ON public.property_images FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- INQUIRIES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone (authenticated or anonymous) can submit an inquiry
CREATE POLICY "Anyone can submit an inquiry"
ON public.inquiries FOR INSERT
WITH CHECK (true);

-- Only admins can read customer inquiries
CREATE POLICY "Only admins can view inquiries"
ON public.inquiries FOR SELECT
USING (public.is_admin());

-- Only admins can update inquiries (change status, assign admin, resolution)
CREATE POLICY "Only admins can update inquiries"
ON public.inquiries FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only admins can delete inquiries
CREATE POLICY "Only admins can delete inquiries"
ON public.inquiries FOR DELETE
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- INQUIRY NOTES POLICIES (Internal admin notes)
-- ------------------------------------------------------------------------------
CREATE POLICY "Only admins can manage inquiry notes"
ON public.inquiry_notes FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- ERROR REPORTS POLICIES
-- ------------------------------------------------------------------------------
-- Anyone can submit an error report
CREATE POLICY "Anyone can submit an error report"
ON public.error_reports FOR INSERT
WITH CHECK (true);

-- Only admins can view, update or resolve error reports
CREATE POLICY "Only admins can view error reports"
ON public.error_reports FOR SELECT
USING (public.is_admin());

CREATE POLICY "Only admins can update error reports"
ON public.error_reports FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- AUDIT LOGS POLICIES
-- ------------------------------------------------------------------------------
-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_admin());

-- Log creation can be inserted by authenticated admin or system functions
CREATE POLICY "Admins or system can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (public.is_admin() OR auth.uid() IS NOT NULL);

-- Audit logs cannot be updated or deleted (append-only)
-- No UPDATE or DELETE policies are granted!

-- ------------------------------------------------------------------------------
-- SAVED PROPERTIES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own saved properties"
ON public.saved_properties FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved properties"
ON public.saved_properties FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved properties"
ON public.saved_properties FOR DELETE
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- SITE SETTINGS POLICIES
-- ------------------------------------------------------------------------------
-- Public can view site settings
CREATE POLICY "Public can view site settings"
ON public.site_settings FOR SELECT
USING (true);

-- Only admins can update site settings
CREATE POLICY "Only admins can modify site settings"
ON public.site_settings FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- BOOTSTRAP INITIAL ADMINISTRATOR ACCOUNT (EXACT UUID)
-- User ID: 70f6038d-7ffd-4a9f-945b-8ee450d0ba71
-- ==============================================================================
INSERT INTO public.user_roles (user_id, role)
VALUES ('70f6038d-7ffd-4a9f-945b-8ee450d0ba71', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Initial Audit Log entry recording administrator configuration
INSERT INTO public.audit_logs (actor_id, actor_email, action, resource_type, resource_id, metadata)
VALUES (
    '70f6038d-7ffd-4a9f-945b-8ee450d0ba71',
    'winifredmaduabuchi368@gmail.com',
    'ROLE_INITIALIZED',
    'user_roles',
    '70f6038d-7ffd-4a9f-945b-8ee450d0ba71',
    '{"role": "admin", "note": "Assigned designated initial administrator role to authorized UUID"}'::JSONB
);

-- Initial Site Settings
INSERT INTO public.site_settings (id, data)
VALUES (
    'company_info',
    '{
        "name": "Liberty Homes",
        "tagline": "WHERE YOUR DREAM HOME BEGINS",
        "city": "Abuja",
        "state": "Federal Capital Territory",
        "country": "Nigeria",
        "address": "No.17 Rufus Nduba Cresent, Dawaki, Abuja.",
        "phone": "09160336411",
        "email": "winifredmaduabuchi368@gmail.com",
        "whatsapp": "09160336411",
        "working_hours": "Monday - Saturday: 8:00 AM - 5:30 PM (WAT)",
        "announcement": "Verified Title Deeds & Instant Beacon Verification in Katampe, Guzape & Jahi"
    }'::JSONB
)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;
