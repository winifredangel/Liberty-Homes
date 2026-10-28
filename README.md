# Liberty Homes — Complete Real Estate Platform & Supabase Administration

**Brand Tagline:** *WHERE YOUR DREAM HOME BEGINS*  
**Location:** Abuja, Federal Capital Territory, Nigeria  
**Designated Administrator Account UUID:** `70f6038d-7ffd-4a9f-945b-8ee450d0ba71`

---

## 1. Executive Summary

**Liberty Homes** is a modern, responsive, full-stack real estate web platform engineered specifically for land sales, serviced plots, and strategic property investments across prime districts in Abuja, Nigeria (including Katampe Extension, Guzape Hills, Jahi, Maitama, and the Airport Road growth corridor).

The platform features:
- A high-polish public-facing web experience with real-time plot discovery, filtering, side-by-side comparison, and viewing bookings.
- An end-to-end Supabase-backed persistence architecture with PostgreSQL and Supabase Auth.
- Strict PostgreSQL Row Level Security (RLS) guaranteeing that public visitors can only read published listings, while administrative dossiers, private customer notes, error reports, and audit logs remain strictly protected.
- A secure administrative desk under `/admin` supporting listing creation, image galleries, an approval workflow (`Draft` → `Pending Approval` → `Approved` → `Published`), customer lead triage, private internal notes, website error tracking, and append-only audit logging.

---

## 2. Administrator Access & Authorization

The system is configured around the existing Supabase Auth administrator account:

- **Target Administrator UUID:** `70f6038d-7ffd-4a9f-945b-8ee450d0ba71`
- **Role Assignment:** Assigned the `admin` role in the protected `public.user_roles` table via idempotent database migrations.
- **Access Route:** `/admin/login` (with protected redirect to `/admin`).
- **Security Guarantee:** Privilege checks are enforced at both the server/database layer via Supabase RLS (`public.is_admin()`) and client-side session evaluation. Unauthenticated or non-admin users cannot read private records or mutate property states.

---

## 3. Brand Identity & Color System

- **Earth Brown (`#795548`):** Primary brand accent, primary CTA buttons, active state badges.
- **Deep Brown (`#4E342E`):** Navigational wordmark, section headers, footer accents.
- **Warm Off-White (`#F8F6F3`):** Canvas background providing contrast and readability.
- **Pure White (`#FFFFFF`):** High-clarity cards, modals, and container surfaces.
- **Black (`#171717`):** Editorial headings, footer body background, high-contrast text.
- **Light Beige (`#E8DED3`):** Subtle hairline borders and dividers.
- **Success Green (`#2E7D32`):** Verified title documents, resolved leads.
- **Error Red (`#C62828`):** Error flags, urgent ticket statuses.
- **Typography:** Display headlines set in *Playfair Display*; interface prose set in *Plus Jakarta Sans*; financial and cadastral numbers set in tabular figures (`tabular-nums`).

---

## 4. Connecting Your Live Supabase Project

If you have already created a Supabase project for Liberty Homes:

### Step 1: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the values with your Supabase project keys (found under **Supabase Dashboard → Project Settings → API**):
```env
VITE_SUPABASE_URL="https://<YOUR-PROJECT-ID>.supabase.co"
VITE_SUPABASE_ANON_KEY="<YOUR-ANON-PUBLIC-KEY>"
SUPABASE_SERVICE_ROLE_KEY="<YOUR-SERVICE-ROLE-KEY>"
ADMIN_TARGET_USER_ID="70f6038d-7ffd-4a9f-945b-8ee450d0ba71"
```

### Step 2: Run Database Migration & Assign Admin Role
Open the **SQL Editor** in your Supabase Dashboard and execute the SQL file located at:
```
/supabase/migrations/20261026_init_liberty_homes.sql
```
This script will:
1. Create all 9 tables (`user_roles`, `properties`, `property_images`, `inquiries`, `inquiry_notes`, `error_reports`, `audit_logs`, `saved_properties`, `site_settings`).
2. Establish indexes on district, price, and status.
3. Configure non-recursive Row Level Security (RLS) policies.
4. Safely assign the `admin` role to `70f6038d-7ffd-4a9f-945b-8ee450d0ba71`.
5. Seed initial site settings and administrative audit log entries.

*(Optional)* Run `/supabase/seed.sql` to populate initial verified Abuja listings (Katampe Extension, Guzape, Jahi, Airport Road, Maitama).

---

## 5. Public Website Features

1. **Homepage (`/`)**:
   - Hero section featuring *"WHERE YOUR DREAM HOME BEGINS"* headline and search filter querying real Abuja districts, property types, and price ranges.
   - Curated featured properties with prices in Nigerian Naira (₦).
   - 4 Core Services:
     * **Land Banking:** Strategic long-term acquisitions without speculative guarantees.
     * **Property Resale:** Direct owner intake and cadastral verification form.
     * **Construction & Building:** Architectural and Development Control building consultation request.
     * **Survey & Planning:** Boundary redelineation and cadastral survey coordination.
   - Why Discerning Buyers Choose Liberty Homes.

2. **Properties Catalog (`/properties`)**:
   - Real-time keyword search, district filter, property type filter, price range (min/max), and availability status.
   - Sorting by newest, price (low-to-high, high-to-low), and land size.
   - Grid and list view toggling.
   - Side-by-side plot comparison (compare up to 3 plots).
   - Favorites bookmarking persisted across visits.

3. **Property Detail Page (`/properties/:slug`)**:
   - High-resolution gallery with thumbnail switcher.
   - Full plot specs: price, size, price/sqm, availability.
   - **Verified Documentation Notice:** Clear disclosure of title status (e.g. C of O, R of O, FCDA allocation) with prominent independent legal due diligence advisory.
   - Inline site viewing appointment booking form.
   - Similar recommended properties.

4. **Dedicated Inquiry Channels & Error Reporting**:
   - Resale property intake form for property owners.
   - Site viewing inspection booking with date/time preference.
   - Global Error Report dialog accessible from the footer to log broken links or UI glitches.

---

## 6. Protected Administrative Dashboard (`/admin`)

Access via `/admin/login`:
- Real-time 10-stat KPI overview (Total, Published, Draft, Pending, Sold, Inquiries, Open, Resolved, Resale, Error tickets).
- **Property Lifecycle Workflow:**
  * `Draft` → `Pending Approval` → `Approved` → `Published`
  * Action controls to Unpublish, Mark Sold, Archive, or Delete.
- **Customer Request Management:**
  * Filter leads by category (viewing, property, resale, land banking, etc.) and status.
  * Adjust ticket priority (Low, Medium, High, Urgent).
  * Record **private internal administrative notes** stored securely in `inquiry_notes`.
  * Log resolution details and close tickets.
  * One-click CSV export of customer inquiries.
- **Website Error Management:**
  * Review visitor-reported issues, assign severity, update resolution status.
- **Audit History:**
  * Real-time append-only security log tracking actor email, action, resource, and timestamp.
- **Site Settings & Diagnostics:**
  * Edit company contact address, phone, WhatsApp number, and top announcement banner.
  * Diagnostic verification that the target UUID `70f6038d-7ffd-4a9f-945b-8ee450d0ba71` possesses the active admin role.

---

## 7. Verification & Testing

To test the application locally:
1. Start the server:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:3000` to inspect the public website, search plots, book inspections, and test property comparisons.
3. Navigate to `http://localhost:3000/admin/login` to access the administrator portal.
4. Verify that non-admin accounts cannot access `/admin` or view draft listings.
5. In the admin desk, test the property lifecycle: create a plot in Draft status, submit for review, approve it, and publish it to confirm it renders on the public `/properties` page.
