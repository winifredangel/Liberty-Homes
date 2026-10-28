export type PropertyType =
  | 'Residential Land'
  | 'Commercial Land'
  | 'Serviced Plot'
  | 'Mixed Use'
  | 'Estate Plot';

export type AvailabilityStatus = 'available' | 'under_offer' | 'sold';

export type ListingStatus = 'draft' | 'pending_approval' | 'approved' | 'published' | 'archived';

export type DocumentationType =
  | 'C of O (Certificate of Occupancy)'
  | 'Right of Occupancy (R of O)'
  | 'Gazette / Allocation'
  | 'Gazette / FCDA Allocation'
  | 'Deed of Assignment'
  | 'Customary Title (Pending FCDA Regularization)';

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  district: string;
  land_size: number;
  land_size_unit: string;
  property_type: PropertyType;
  documentation_status: DocumentationType | string;
  availability_status: AvailabilityStatus;
  listing_status: ListingStatus;
  is_featured: boolean;
  cover_image_path: string;
  gallery_images?: string[];
  nearby_landmarks: string[];
  infrastructure_features: string[];
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  storage_path: string;
  alt_text: string;
  display_order: number;
  is_cover: boolean;
  created_at: string;
}

export type RequestType =
  | 'general'
  | 'property'
  | 'viewing'
  | 'land_banking'
  | 'resale'
  | 'construction'
  | 'survey_planning';

export type InquiryStatus = 'new' | 'in_review' | 'contacted' | 'scheduled' | 'resolved' | 'closed';

export type InquiryPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Inquiry {
  id: string;
  request_type: RequestType;
  customer_name: string;
  email: string;
  phone: string;
  related_property_id?: string | null;
  related_property_title?: string;
  message: string;
  preferred_viewing_date?: string;
  preferred_viewing_time?: string;
  resale_property_location?: string;
  resale_land_size?: string;
  resale_asking_price?: number;
  status: InquiryStatus;
  priority: InquiryPriority;
  assigned_admin_id?: string | null;
  resolution_details?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InquiryNote {
  id: string;
  inquiry_id: string;
  admin_id: string;
  admin_name: string;
  note: string;
  created_at: string;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorStatus = 'open' | 'investigating' | 'fixed' | 'closed';

export interface ErrorReport {
  id: string;
  reporter_name?: string;
  reporter_email?: string;
  page_url: string;
  issue_description: string;
  error_code: string;
  severity: ErrorSeverity;
  status: ErrorStatus;
  assigned_admin_id?: string | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'staff' | 'client';
  created_at: string;
}

export interface SiteSettings {
  id: string;
  data: {
    name: string;
    tagline: string;
    city: string;
    state: string;
    country: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
    working_hours: string;
    announcement?: string;
  };
  updated_at: string;
  updated_by?: string;
}

export interface PropertyFilterState {
  keyword: string;
  district: string;
  propertyType: string;
  minPrice: number | '';
  maxPrice: number | '';
  minLandSize: number | '';
  maxLandSize: number | '';
  availability: string;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'size_desc';
}
