import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Property,
  Inquiry,
  InquiryNote,
  ErrorReport,
  AuditLog,
  SiteSettings,
  PropertyFilterState,
} from '../types';
import { INITIAL_PROPERTIES, INITIAL_SITE_SETTINGS } from './seedData';

// TARGET ADMINISTRATOR UUID SPECIFIED BY PROJECT REQUIREMENTS
export const TARGET_ADMIN_USER_ID = '70f6038d-7ffd-4a9f-945b-8ee450d0ba71';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project-id') &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Local persistent storage keys for fallback demo mode
const LOCAL_STORAGE_PROPERTIES = 'liberty_properties_store';
const LOCAL_STORAGE_INQUIRIES = 'liberty_inquiries_store';
const LOCAL_STORAGE_NOTES = 'liberty_notes_store';
const LOCAL_STORAGE_ERRORS = 'liberty_errors_store';
const LOCAL_STORAGE_LOGS = 'liberty_logs_store';
const LOCAL_STORAGE_SETTINGS = 'liberty_settings_store';
const LOCAL_STORAGE_ROLES = 'liberty_roles_store';

function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
}

// Initialize Local Store if empty and ensure NO dummy/fake data
export function initLocalStore() {
  if (!localStorage.getItem(LOCAL_STORAGE_PROPERTIES)) {
    setLocal(LOCAL_STORAGE_PROPERTIES, INITIAL_PROPERTIES);
  }

  // Update settings with real contact information
  const existingSettings = getLocal<SiteSettings | null>(LOCAL_STORAGE_SETTINGS, null);
  if (!existingSettings || existingSettings.data.phone.includes('803 000')) {
    setLocal(LOCAL_STORAGE_SETTINGS, INITIAL_SITE_SETTINGS);
  }

  // Remove any previously stored dummy inquiries
  const existingInquiries = getLocal<Inquiry[]>(LOCAL_STORAGE_INQUIRIES, []);
  const hasDummyInquiries = existingInquiries.some(
    (i) => i.customer_name?.includes('Chidi Okafor') || i.customer_name?.includes('Amina Bello') || i.id?.startsWith('inq-00')
  );
  if (hasDummyInquiries || !localStorage.getItem(LOCAL_STORAGE_INQUIRIES)) {
    setLocal(LOCAL_STORAGE_INQUIRIES, []);
  }

  // Remove any previously stored dummy logs
  const existingLogs = getLocal<AuditLog[]>(LOCAL_STORAGE_LOGS, []);
  const hasDummyLogs = existingLogs.some((l) => l.id === 'log-001' || l.id === 'log-002');
  if (hasDummyLogs || !localStorage.getItem(LOCAL_STORAGE_LOGS)) {
    setLocal(LOCAL_STORAGE_LOGS, []);
  }

  if (!localStorage.getItem(LOCAL_STORAGE_NOTES)) {
    setLocal(LOCAL_STORAGE_NOTES, []);
  }
  if (!localStorage.getItem(LOCAL_STORAGE_ERRORS)) {
    setLocal(LOCAL_STORAGE_ERRORS, []);
  }

  if (!localStorage.getItem(LOCAL_STORAGE_ROLES)) {
    setLocal(LOCAL_STORAGE_ROLES, [
      {
        id: 'role-001',
        user_id: TARGET_ADMIN_USER_ID,
        role: 'admin',
        created_at: new Date().toISOString(),
      },
    ]);
  }
}

// -----------------------------------------------------------------------------
// PROPERTIES API
// -----------------------------------------------------------------------------

export async function getProperties(filter?: Partial<PropertyFilterState>): Promise<Property[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('properties').select('*');

      if (filter?.district && filter.district !== 'all') {
        query = query.eq('district', filter.district);
      }
      if (filter?.propertyType && filter.propertyType !== 'all') {
        query = query.eq('property_type', filter.propertyType);
      }
      if (filter?.availability && filter.availability !== 'all') {
        query = query.eq('availability_status', filter.availability);
      }
      if (filter?.minPrice) {
        query = query.gte('price', filter.minPrice);
      }
      if (filter?.maxPrice) {
        query = query.lte('price', filter.maxPrice);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Property[];
      }
    } catch (e) {
      console.warn('Supabase query failed, falling back to local dataset', e);
    }
  }

  // Local fallback
  initLocalStore();
  let list = getLocal<Property[]>(LOCAL_STORAGE_PROPERTIES, INITIAL_PROPERTIES);

  if (filter?.district && filter.district !== 'all') {
    list = list.filter((p) => p.district.toLowerCase() === filter.district!.toLowerCase());
  }
  if (filter?.propertyType && filter.propertyType !== 'all') {
    list = list.filter((p) => p.property_type === filter.propertyType);
  }
  if (filter?.availability && filter.availability !== 'all') {
    list = list.filter((p) => p.availability_status === filter.availability);
  }
  if (filter?.minPrice) {
    list = list.filter((p) => p.price >= Number(filter.minPrice));
  }
  if (filter?.maxPrice) {
    list = list.filter((p) => p.price <= Number(filter.maxPrice));
  }
  if (filter?.keyword) {
    const kw = filter.keyword.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        p.location.toLowerCase().includes(kw) ||
        p.district.toLowerCase().includes(kw) ||
        p.description.toLowerCase().includes(kw)
    );
  }

  // Sorting
  if (filter?.sortBy === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (filter?.sortBy === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (filter?.sortBy === 'size_desc') {
    list.sort((a, b) => b.land_size - a.land_size);
  } else {
    // newest
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return list;
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('slug', slug)
        .single();
      if (!error && data) {
        return data as Property;
      }
    } catch (e) {
      console.warn('Supabase getPropertyBySlug failed', e);
    }
  }

  initLocalStore();
  const list = getLocal<Property[]>(LOCAL_STORAGE_PROPERTIES, INITIAL_PROPERTIES);
  return list.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function createProperty(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
  const newProperty: Property = {
    ...propertyData,
    id: 'prop-' + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('properties').insert([newProperty]).select().single();
      if (!error && data) {
        await logAuditAction('PROPERTY_CREATED', 'properties', data.id, { title: data.title });
        return data as Property;
      }
    } catch (e) {
      console.warn('Supabase createProperty error, saving to local store', e);
    }
  }

  initLocalStore();
  const list = getLocal<Property[]>(LOCAL_STORAGE_PROPERTIES, INITIAL_PROPERTIES);
  list.unshift(newProperty);
  setLocal(LOCAL_STORAGE_PROPERTIES, list);
  await logAuditAction('PROPERTY_CREATED', 'properties', newProperty.id, { title: newProperty.title });
  return newProperty;
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
  const updatedTimestamp = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({ ...updates, updated_at: updatedTimestamp })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        await logAuditAction('PROPERTY_UPDATED', 'properties', id, updates);
        return data as Property;
      }
    } catch (e) {
      console.warn('Supabase updateProperty error', e);
    }
  }

  initLocalStore();
  const list = getLocal<Property[]>(LOCAL_STORAGE_PROPERTIES, INITIAL_PROPERTIES);
  const index = list.findIndex((p) => p.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...updates, updated_at: updatedTimestamp };
    setLocal(LOCAL_STORAGE_PROPERTIES, list);
    await logAuditAction('PROPERTY_UPDATED', 'properties', id, updates);
    return list[index];
  }
  return null;
}

export async function deleteProperty(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (!error) {
        await logAuditAction('PROPERTY_DELETED', 'properties', id);
        return true;
      }
    } catch (e) {
      console.warn('Supabase deleteProperty error', e);
    }
  }

  initLocalStore();
  let list = getLocal<Property[]>(LOCAL_STORAGE_PROPERTIES, INITIAL_PROPERTIES);
  list = list.filter((p) => p.id !== id);
  setLocal(LOCAL_STORAGE_PROPERTIES, list);
  await logAuditAction('PROPERTY_DELETED', 'properties', id);
  return true;
}

// -----------------------------------------------------------------------------
// INQUIRIES & REQUESTS API
// -----------------------------------------------------------------------------

export async function submitInquiry(data: Omit<Inquiry, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Inquiry> {
  const newInquiry: Inquiry = {
    ...data,
    id: 'inq-' + Date.now(),
    status: 'new',
    priority: data.priority || 'medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: inserted, error } = await supabase.from('inquiries').insert([newInquiry]).select().single();
      if (!error && inserted) {
        return inserted as Inquiry;
      }
    } catch (e) {
      console.warn('Supabase submitInquiry error', e);
    }
  }

  initLocalStore();
  const list = getLocal<Inquiry[]>(LOCAL_STORAGE_INQUIRIES, []);
  list.unshift(newInquiry);
  setLocal(LOCAL_STORAGE_INQUIRIES, list);
  return newInquiry;
}

export async function getInquiries(): Promise<Inquiry[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data as Inquiry[];
      }
    } catch (e) {
      console.warn('Supabase getInquiries error', e);
    }
  }

  initLocalStore();
  return getLocal<Inquiry[]>(LOCAL_STORAGE_INQUIRIES, []);
}

export async function updateInquiry(id: string, updates: Partial<Inquiry>): Promise<Inquiry | null> {
  const updatedTimestamp = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .update({ ...updates, updated_at: updatedTimestamp })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        await logAuditAction('INQUIRY_STATUS_CHANGED', 'inquiries', id, updates);
        return data as Inquiry;
      }
    } catch (e) {
      console.warn('Supabase updateInquiry error', e);
    }
  }

  initLocalStore();
  const list = getLocal<Inquiry[]>(LOCAL_STORAGE_INQUIRIES, []);
  const index = list.findIndex((i) => i.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...updates, updated_at: updatedTimestamp };
    setLocal(LOCAL_STORAGE_INQUIRIES, list);
    await logAuditAction('INQUIRY_STATUS_CHANGED', 'inquiries', id, updates);
    return list[index];
  }
  return null;
}

export async function addInquiryNote(inquiryId: string, noteText: string, adminName: string = 'Administrator'): Promise<InquiryNote> {
  const newNote: InquiryNote = {
    id: 'note-' + Date.now(),
    inquiry_id: inquiryId,
    admin_id: TARGET_ADMIN_USER_ID,
    admin_name: adminName,
    note: noteText,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('inquiry_notes').insert([newNote]).select().single();
      if (!error && data) {
        return data as InquiryNote;
      }
    } catch (e) {
      console.warn('Supabase addInquiryNote error', e);
    }
  }

  initLocalStore();
  const notes = getLocal<InquiryNote[]>(LOCAL_STORAGE_NOTES, []);
  notes.push(newNote);
  setLocal(LOCAL_STORAGE_NOTES, notes);
  return newNote;
}

export async function getInquiryNotes(inquiryId: string): Promise<InquiryNote[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('inquiry_notes')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .order('created_at', { ascending: true });
      if (!error && data) {
        return data as InquiryNote[];
      }
    } catch (e) {
      console.warn('Supabase getInquiryNotes error', e);
    }
  }

  initLocalStore();
  const notes = getLocal<InquiryNote[]>(LOCAL_STORAGE_NOTES, []);
  return notes.filter((n) => n.inquiry_id === inquiryId);
}

// -----------------------------------------------------------------------------
// ERROR REPORTS API
// -----------------------------------------------------------------------------

export async function submitErrorReport(data: Omit<ErrorReport, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ErrorReport> {
  const newReport: ErrorReport = {
    ...data,
    id: 'err-' + Date.now(),
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: inserted, error } = await supabase.from('error_reports').insert([newReport]).select().single();
      if (!error && inserted) {
        return inserted as ErrorReport;
      }
    } catch (e) {
      console.warn('Supabase submitErrorReport error', e);
    }
  }

  initLocalStore();
  const errors = getLocal<ErrorReport[]>(LOCAL_STORAGE_ERRORS, []);
  errors.unshift(newReport);
  setLocal(LOCAL_STORAGE_ERRORS, errors);
  return newReport;
}

export async function getErrorReports(): Promise<ErrorReport[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('error_reports').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data as ErrorReport[];
      }
    } catch (e) {
      console.warn('Supabase getErrorReports error', e);
    }
  }

  initLocalStore();
  return getLocal<ErrorReport[]>(LOCAL_STORAGE_ERRORS, []);
}

export async function updateErrorReport(id: string, updates: Partial<ErrorReport>): Promise<ErrorReport | null> {
  const updatedTimestamp = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('error_reports')
        .update({ ...updates, updated_at: updatedTimestamp })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        await logAuditAction('ERROR_REPORT_UPDATED', 'error_reports', id, updates);
        return data as ErrorReport;
      }
    } catch (e) {
      console.warn('Supabase updateErrorReport error', e);
    }
  }

  initLocalStore();
  const errors = getLocal<ErrorReport[]>(LOCAL_STORAGE_ERRORS, []);
  const index = errors.findIndex((e) => e.id === id);
  if (index !== -1) {
    errors[index] = { ...errors[index], ...updates, updated_at: updatedTimestamp };
    setLocal(LOCAL_STORAGE_ERRORS, errors);
    await logAuditAction('ERROR_REPORT_UPDATED', 'error_reports', id, updates);
    return errors[index];
  }
  return null;
}

// -----------------------------------------------------------------------------
// AUDIT LOGGING API
// -----------------------------------------------------------------------------

export async function logAuditAction(action: string, resourceType: string, resourceId?: string | null, metadata?: Record<string, any>): Promise<void> {
  const log: AuditLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    actor_id: TARGET_ADMIN_USER_ID,
    actor_email: 'admin@libertyhomes.ng',
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('audit_logs').insert([log]);
      return;
    } catch (e) {
      console.warn('Supabase logAuditAction error', e);
    }
  }

  initLocalStore();
  const logs = getLocal<AuditLog[]>(LOCAL_STORAGE_LOGS, []);
  logs.unshift(log);
  setLocal(LOCAL_STORAGE_LOGS, logs);
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
      if (!error && data) {
        return data as AuditLog[];
      }
    } catch (e) {
      console.warn('Supabase getAuditLogs error', e);
    }
  }

  initLocalStore();
  return getLocal<AuditLog[]>(LOCAL_STORAGE_LOGS, []);
}

// -----------------------------------------------------------------------------
// SITE SETTINGS API
// -----------------------------------------------------------------------------

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'company_info').single();
      if (!error && data) {
        return data as SiteSettings;
      }
    } catch (e) {
      console.warn('Supabase getSiteSettings error', e);
    }
  }

  initLocalStore();
  return getLocal<SiteSettings>(LOCAL_STORAGE_SETTINGS, INITIAL_SITE_SETTINGS);
}

export async function updateSiteSettings(newData: SiteSettings['data']): Promise<SiteSettings> {
  const updatedSettings: SiteSettings = {
    id: 'company_info',
    data: newData,
    updated_at: new Date().toISOString(),
    updated_by: TARGET_ADMIN_USER_ID,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert(updatedSettings)
        .select()
        .single();
      if (!error && data) {
        await logAuditAction('SETTINGS_UPDATED', 'site_settings', 'company_info', { updated_fields: Object.keys(newData) });
        return data as SiteSettings;
      }
    } catch (e) {
      console.warn('Supabase updateSiteSettings error', e);
    }
  }

  initLocalStore();
  setLocal(LOCAL_STORAGE_SETTINGS, updatedSettings);
  await logAuditAction('SETTINGS_UPDATED', 'site_settings', 'company_info', { updated_fields: Object.keys(newData) });
  return updatedSettings;
}

// -----------------------------------------------------------------------------
// FAVORITES / SAVED PROPERTIES
// -----------------------------------------------------------------------------
const LOCAL_STORAGE_SAVED = 'liberty_saved_properties';

export function getSavedPropertyIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SAVED);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function toggleSavedPropertyId(propertyId: string): boolean {
  const list = getSavedPropertyIds();
  const idx = list.indexOf(propertyId);
  if (idx !== -1) {
    list.splice(idx, 1);
    localStorage.setItem(LOCAL_STORAGE_SAVED, JSON.stringify(list));
    return false; // removed
  } else {
    list.push(propertyId);
    localStorage.setItem(LOCAL_STORAGE_SAVED, JSON.stringify(list));
    return true; // added
  }
}
