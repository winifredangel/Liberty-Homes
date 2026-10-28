import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Building,
  Mail,
  AlertTriangle,
  History,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Search,
  Filter,
  Check,
  Eye,
  FileText,
  AlertCircle,
  Database,
  ArrowUpRight,
  TrendingUp,
  Layers,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  Property,
  Inquiry,
  InquiryNote,
  ErrorReport,
  AuditLog,
  SiteSettings,
  ListingStatus,
  AvailabilityStatus,
  PropertyType
} from '../../types';
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getInquiries,
  updateInquiry,
  getInquiryNotes,
  addInquiryNote,
  getErrorReports,
  updateErrorReport,
  getAuditLogs,
  getSiteSettings,
  updateSiteSettings,
  isSupabaseConfigured,
  TARGET_ADMIN_USER_ID,
  logAuditAction
} from '../../lib/supabase';

type AdminTab = 'overview' | 'properties' | 'requests' | 'errors' | 'logs' | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);

  // Core Data Collections
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Property Modals
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Property Form State
  const [propTitle, setPropTitle] = useState('');
  const [propSlug, setPropSlug] = useState('');
  const [propPrice, setPropPrice] = useState<number | ''>('');
  const [propDistrict, setPropDistrict] = useState('Katampe Extension');
  const [propLocation, setPropLocation] = useState('');
  const [propLandSize, setPropLandSize] = useState<number | ''>('');
  const [propType, setPropType] = useState<PropertyType>('Residential Land');
  const [propDocStatus, setPropDocStatus] = useState('C of O (Certificate of Occupancy)');
  const [propAvailStatus, setPropAvailStatus] = useState<AvailabilityStatus>('available');
  const [propListingStatus, setPropListingStatus] = useState<ListingStatus>('draft');
  const [propIsFeatured, setPropIsFeatured] = useState(false);
  const [propCoverImage, setPropCoverImage] = useState('/src/assets/images/property_katampe_hills_1793003670114.jpg');
  const [propDescription, setPropDescription] = useState('');
  const [propLandmarks, setPropLandmarks] = useState('10 mins to Maitama, Paved Road Access');
  const [propFeatures, setPropFeatures] = useState('Electricity Connected, Survey Beacons Verified, Drainage System');

  // Inquiry Note Modal
  const [activeInquiryForNotes, setActiveInquiryForNotes] = useState<Inquiry | null>(null);
  const [currentNotes, setCurrentNotes] = useState<InquiryNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [resolutionDetailsText, setResolutionDetailsText] = useState('');

  // Search & Filter within Admin Tables
  const [propertyFilterStatus, setPropertyFilterStatus] = useState<string>('all');
  const [inquiryFilterType, setInquiryFilterType] = useState<string>('all');
  const [inquiryFilterStatus, setInquiryFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    loadAllData();
  }, [isAdmin]);

  async function loadAllData() {
    setLoading(true);
    try {
      const [props, inqs, errs, logs, sets] = await Promise.all([
        getProperties(),
        getInquiries(),
        getErrorReports(),
        getAuditLogs(),
        getSiteSettings(),
      ]);
      setProperties(props);
      setInquiries(inqs);
      setErrorReports(errs);
      setAuditLogs(logs);
      setSiteSettings(sets);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // Property Form Handling
  const handleOpenCreateProperty = () => {
    setEditingProperty(null);
    setPropTitle('');
    setPropSlug('');
    setPropPrice('');
    setPropDistrict('Katampe Extension');
    setPropLocation('Diplomatic Zone, Katampe Extension, Abuja');
    setPropLandSize(1000);
    setPropType('Residential Land');
    setPropDocStatus('C of O (Certificate of Occupancy)');
    setPropAvailStatus('available');
    setPropListingStatus('draft');
    setPropIsFeatured(false);
    setPropCoverImage('/src/assets/images/property_katampe_hills_1793003670114.jpg');
    setPropDescription('');
    setPropLandmarks('10 mins to Maitama, Paved Access');
    setPropFeatures('Tarred Road, Underground Drainage, Street Lighting');
    setIsPropertyModalOpen(true);
  };

  const handleOpenEditProperty = (prop: Property) => {
    setEditingProperty(prop);
    setPropTitle(prop.title);
    setPropSlug(prop.slug);
    setPropPrice(prop.price);
    setPropDistrict(prop.district);
    setPropLocation(prop.location);
    setPropLandSize(prop.land_size);
    setPropType(prop.property_type);
    setPropDocStatus(prop.documentation_status);
    setPropAvailStatus(prop.availability_status);
    setPropListingStatus(prop.listing_status);
    setPropIsFeatured(prop.is_featured);
    setPropCoverImage(prop.cover_image_path);
    setPropDescription(prop.description);
    setPropLandmarks(prop.nearby_landmarks.join(', '));
    setPropFeatures(prop.infrastructure_features.join(', '));
    setIsPropertyModalOpen(true);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle.trim() || !propPrice || !propLandSize) return;

    const slug = propSlug.trim() || propTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const landmarks = propLandmarks.split(',').map((s) => s.trim()).filter(Boolean);
    const features = propFeatures.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingProperty) {
      await updateProperty(editingProperty.id, {
        title: propTitle.trim(),
        slug,
        price: Number(propPrice),
        district: propDistrict,
        location: propLocation.trim(),
        land_size: Number(propLandSize),
        property_type: propType,
        documentation_status: propDocStatus,
        availability_status: propAvailStatus,
        listing_status: propListingStatus,
        is_featured: propIsFeatured,
        cover_image_path: propCoverImage,
        description: propDescription.trim(),
        nearby_landmarks: landmarks,
        infrastructure_features: features,
      });
    } else {
      await createProperty({
        title: propTitle.trim(),
        slug,
        price: Number(propPrice),
        currency: 'NGN',
        district: propDistrict,
        location: propLocation.trim(),
        land_size: Number(propLandSize),
        land_size_unit: 'sqm',
        property_type: propType,
        documentation_status: propDocStatus,
        availability_status: propAvailStatus,
        listing_status: propListingStatus,
        is_featured: propIsFeatured,
        cover_image_path: propCoverImage,
        description: propDescription.trim(),
        nearby_landmarks: landmarks,
        infrastructure_features: features,
        created_by: TARGET_ADMIN_USER_ID,
      });
    }

    setIsPropertyModalOpen(false);
    await loadAllData();
  };

  // Workflow transitions
  const handleWorkflowTransition = async (prop: Property, newStatus: ListingStatus) => {
    const updates: Partial<Property> = { listing_status: newStatus };
    if (newStatus === 'approved') {
      updates.approved_by = TARGET_ADMIN_USER_ID;
      updates.approved_at = new Date().toISOString();
    }
    if (newStatus === 'published') {
      updates.published_at = new Date().toISOString();
    }
    await updateProperty(prop.id, updates);
    await logAuditAction('PROPERTY_WORKFLOW_CHANGED', 'properties', prop.id, { old: prop.listing_status, new: newStatus });
    await loadAllData();
  };

  const handleDeleteProp = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteProperty(id);
      await loadAllData();
    }
  };

  // Inquiries Note Handling
  const handleOpenInquiryNotes = async (inq: Inquiry) => {
    setActiveInquiryForNotes(inq);
    setResolutionDetailsText(inq.resolution_details || '');
    const notes = await getInquiryNotes(inq.id);
    setCurrentNotes(notes);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeInquiryForNotes) return;
    await addInquiryNote(activeInquiryForNotes.id, newNoteText.trim(), user?.email || 'Administrator');
    setNewNoteText('');
    const notes = await getInquiryNotes(activeInquiryForNotes.id);
    setCurrentNotes(notes);
  };

  const handleSaveInquiryResolution = async (status: Inquiry['status']) => {
    if (!activeInquiryForNotes) return;
    await updateInquiry(activeInquiryForNotes.id, {
      status,
      resolution_details: resolutionDetailsText.trim() || undefined,
      resolved_at: status === 'resolved' || status === 'closed' ? new Date().toISOString() : undefined,
    });
    setActiveInquiryForNotes(null);
    await loadAllData();
  };

  // Export Inquiries to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Request Type', 'Customer Name', 'Email', 'Phone', 'Property ID', 'Status', 'Priority', 'Created At'];
    const rows = inquiries.map((i) => [
      i.id,
      i.request_type,
      `"${i.customer_name}"`,
      i.email,
      i.phone,
      i.related_property_id || '',
      i.status,
      i.priority,
      i.created_at,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `liberty_homes_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistics Calculation
  const totalProps = properties.length;
  const publishedProps = properties.filter((p) => p.listing_status === 'published').length;
  const draftProps = properties.filter((p) => p.listing_status === 'draft').length;
  const pendingProps = properties.filter((p) => p.listing_status === 'pending_approval').length;
  const soldOrUnavailableProps = properties.filter((p) => p.availability_status === 'sold' || p.availability_status === 'under_offer').length;

  const newInquiries = inquiries.filter((i) => i.status === 'new').length;
  const openRequests = inquiries.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length;
  const resolvedRequests = inquiries.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
  const pendingResaleCount = inquiries.filter((i) => i.request_type === 'resale' && i.status === 'new').length;
  const openErrorReports = errorReports.filter((e) => e.status === 'open' || e.status === 'investigating').length;

  return (
    <div className="min-h-screen bg-[#F8F6F3] text-[#171717] pb-16">
      {/* Top Admin Navigation Header */}
      <div className="bg-[#4E342E] text-white border-b border-[#795548]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#795548] flex items-center justify-center font-serif font-bold text-sm">
                LH
              </div>
              <div>
                <span className="font-serif font-bold text-base tracking-tight block">
                  Liberty Homes Desk
                </span>
                <span className="text-[10px] text-[#E8DED3]/70 font-mono">
                  Admin UUID: {TARGET_ADMIN_USER_ID.substring(0, 8)}...
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#E8DED3]/80">
                <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                <span>{user?.email || 'winifredmaduabuchi368@gmail.com'}</span>
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#795548]/60 hover:bg-[#795548] rounded-lg transition-colors"
                title="Sign out of Admin Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tab Bar */}
      <div className="bg-white border-b border-[#E8DED3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-6 overflow-x-auto py-2.5 text-xs font-semibold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'text-[#795548] border-b-2 border-[#795548]'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              Overview & Metrics
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-1.5 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'properties'
                  ? 'text-[#795548] border-b-2 border-[#795548]'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              <span>Properties</span>
              <span className="tabular-nums px-1.5 py-0.2 bg-[#F8F6F3] rounded text-[10px]">
                {totalProps}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-1.5 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'text-[#795548] border-b-2 border-[#795548]'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              <span>Customer Requests</span>
              {newInquiries > 0 && (
                <span className="tabular-nums px-1.5 py-0.2 bg-[#795548] text-white rounded text-[10px]">
                  {newInquiries} new
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('errors')}
              className={`py-1.5 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'errors'
                  ? 'text-[#795548] border-b-2 border-[#795548]'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              <span>Error Reports</span>
              {openErrorReports > 0 && (
                <span className="tabular-nums px-1.5 py-0.2 bg-[#C62828] text-white rounded text-[10px]">
                  {openErrorReports}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'logs'
                  ? 'text-[#795548] border-b-2 border-[#795548]'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              Audit Log
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'settings'
                  ? 'text-[#795548] border-b-2 border-[#795548]'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              Settings & RLS
            </button>
          </nav>
        </div>
      </div>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ==================================================================== */}
        {/* TAB 1: OVERVIEW & REAL DATABASE METRICS                               */}
        {/* ==================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
                  Operational Dashboard
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
                  Real-time Database Activity
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenCreateProperty}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Property</span>
                </button>
                <button
                  onClick={loadAllData}
                  className="px-3 py-2 text-xs font-medium text-[#4E342E] bg-white border border-[#E8DED3] rounded-lg hover:bg-[#F8F6F3]"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            {/* 10 Real Metric KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#E8DED3] space-y-1">
                <span className="text-[11px] font-semibold uppercase text-[#6B6B6B]">Total Properties</span>
                <p className="text-2xl font-bold font-sans text-[#171717] tabular-nums">{totalProps}</p>
                <p className="text-[11px] text-[#6B6B6B]">All records</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E8DED3] space-y-1">
                <span className="text-[11px] font-semibold uppercase text-[#2E7D32]">Published</span>
                <p className="text-2xl font-bold font-sans text-[#2E7D32] tabular-nums">{publishedProps}</p>
                <p className="text-[11px] text-[#6B6B6B]">Publicly visible</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E8DED3] space-y-1">
                <span className="text-[11px] font-semibold uppercase text-amber-700">Pending Approval</span>
                <p className="text-2xl font-bold font-sans text-amber-800 tabular-nums">{pendingProps}</p>
                <p className="text-[11px] text-[#6B6B6B]">Awaiting review</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E8DED3] space-y-1">
                <span className="text-[11px] font-semibold uppercase text-[#6B6B6B]">Draft Listings</span>
                <p className="text-2xl font-bold font-sans text-[#171717] tabular-nums">{draftProps}</p>
                <p className="text-[11px] text-[#6B6B6B]">Unpublished</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E8DED3] space-y-1">
                <span className="text-[11px] font-semibold uppercase text-[#4E342E]">Sold / Unavailable</span>
                <p className="text-2xl font-bold font-sans text-[#4E342E] tabular-nums">{soldOrUnavailableProps}</p>
                <p className="text-[11px] text-[#6B6B6B]">Under offer or closed</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E8DED3] space-y-1">
                <span className="text-[11px] font-semibold uppercase text-[#795548]">New Inquiries</span>
                <p className="text-2xl font-bold font-sans text-[#795548] tabular-nums">{newInquiries}</p>
                <p className="text-[11px] text-[#6B6B6B]">Unread submissions</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E8DED3] space-y-1">
                <span className="text-[11px] font-semibold uppercase text-blue-700">Open Requests</span>
                <p className="text-2xl font-bold font-sans text-blue-900 tabular-nums">{openRequests}</p>
                <p className="text-[11px] text-[#6B6B6B]">In progress</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E8DED3] space-y-1">
                <span className="text-[11px] font-semibold uppercase text-[#2E7D32]">Resolved Requests</span>
                <p className="text-2xl font-bold font-sans text-[#2E7D32] tabular-nums">{resolvedRequests}</p>
                <p className="text-[11px] text-[#6B6B6B]">Completed leads</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E8DED3] space-y-1">
                <span className="text-[11px] font-semibold uppercase text-purple-700">Resale Submissions</span>
                <p className="text-2xl font-bold font-sans text-purple-900 tabular-nums">{pendingResaleCount}</p>
                <p className="text-[11px] text-[#6B6B6B]">Owner plots for review</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E8DED3] space-y-1">
                <span className="text-[11px] font-semibold uppercase text-[#C62828]">Open Error Reports</span>
                <p className="text-2xl font-bold font-sans text-[#C62828] tabular-nums">{openErrorReports}</p>
                <p className="text-[11px] text-[#6B6B6B]">Technical triage</p>
              </div>
            </div>

            {/* Split row: Recent Inquiries & Recent Audit Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Inquiries */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8DED3] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8DED3] pb-3">
                  <h3 className="font-serif font-bold text-lg text-[#171717]">
                    Recent Customer Inquiries
                  </h3>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs text-[#795548] font-medium hover:underline"
                  >
                    View All ({inquiries.length})
                  </button>
                </div>

                {inquiries.length === 0 ? (
                  <p className="text-xs text-[#6B6B6B] py-6 text-center">No inquiries logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {inquiries.slice(0, 5).map((inq) => (
                      <div
                        key={inq.id}
                        onClick={() => handleOpenInquiryNotes(inq)}
                        className="p-3 bg-[#F8F6F3] rounded-xl hover:bg-[#E8DED3]/40 cursor-pointer transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#171717]">{inq.customer_name}</span>
                          <span className="text-[11px] uppercase tracking-wider font-bold text-[#795548]">
                            {inq.request_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B6B6B] line-clamp-1">{inq.message}</p>
                        <div className="flex items-center justify-between text-[11px] text-[#6B6B6B] pt-1">
                          <span>{inq.phone}</span>
                          <span className="capitalize font-medium text-[#4E342E]">Status: {inq.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Audit History */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8DED3] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8DED3] pb-3">
                  <h3 className="font-serif font-bold text-lg text-[#171717]">
                    Administrative Audit Trail
                  </h3>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-xs text-[#795548] font-medium hover:underline"
                  >
                    Full Log ({auditLogs.length})
                  </button>
                </div>

                {auditLogs.length === 0 ? (
                  <p className="text-xs text-[#6B6B6B] py-6 text-center">No audit records yet.</p>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="p-3 bg-[#F8F6F3] rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#795548]">{log.action}</span>
                          <span className="text-[10px] text-[#6B6B6B] tabular-nums">
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-[#171717]">
                          Resource: <code className="font-mono text-[#4E342E]">{log.resource_type}</code> ({log.resource_id?.slice(0, 8)})
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: PROPERTY MANAGEMENT & APPROVAL WORKFLOW                        */}
        {/* ==================================================================== */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
                  Catalog Management
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
                  Abuja Land & Plots Inventory
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={propertyFilterStatus}
                  onChange={(e) => setPropertyFilterStatus(e.target.value)}
                  className="px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg focus:outline-hidden"
                >
                  <option value="all">All Statuses ({properties.length})</option>
                  <option value="published">Published ({properties.filter((p) => p.listing_status === 'published').length})</option>
                  <option value="pending_approval">Pending Approval ({properties.filter((p) => p.listing_status === 'pending_approval').length})</option>
                  <option value="approved">Approved / Ready ({properties.filter((p) => p.listing_status === 'approved').length})</option>
                  <option value="draft">Drafts ({properties.filter((p) => p.listing_status === 'draft').length})</option>
                  <option value="archived">Archived ({properties.filter((p) => p.listing_status === 'archived').length})</option>
                </select>

                <button
                  onClick={handleOpenCreateProperty}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Property</span>
                </button>
              </div>
            </div>

            {/* Properties Table */}
            <div className="bg-white rounded-2xl border border-[#E8DED3] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8F6F3] border-b border-[#E8DED3] text-[#4E342E] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Property / District</th>
                      <th className="p-3.5">Price & Size</th>
                      <th className="p-3.5">Title Document</th>
                      <th className="p-3.5">Workflow Status</th>
                      <th className="p-3.5">Availability</th>
                      <th className="p-3.5 text-right">Workflow & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DED3]">
                    {properties
                      .filter((p) => propertyFilterStatus === 'all' || p.listing_status === propertyFilterStatus)
                      .map((prop) => (
                        <tr key={prop.id} className="hover:bg-[#F8F6F3]/50 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={prop.cover_image_path}
                                alt={prop.title}
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="font-serif font-bold text-xs text-[#171717] truncate max-w-xs">
                                  {prop.title}
                                </h4>
                                <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-[#795548]" />
                                  <span>{prop.district}</span>
                                  {prop.is_featured && (
                                    <span className="text-[10px] font-bold text-[#795548] ml-1">★ Featured</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-semibold text-[#4E342E] tabular-nums">
                              ₦{prop.price.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-[#6B6B6B] tabular-nums">
                              {prop.land_size} {prop.land_size_unit}
                            </div>
                          </td>

                          <td className="p-3.5 text-[#2E7D32] font-medium">
                            {prop.documentation_status}
                          </td>

                          {/* Workflow status badge with state indicator */}
                          <td className="p-3.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                prop.listing_status === 'published'
                                  ? 'bg-emerald-100 text-[#2E7D32]'
                                  : prop.listing_status === 'approved'
                                  ? 'bg-blue-100 text-blue-800'
                                  : prop.listing_status === 'pending_approval'
                                  ? 'bg-amber-100 text-amber-800'
                                  : prop.listing_status === 'archived'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {prop.listing_status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <select
                              value={prop.availability_status}
                              onChange={async (e) => {
                                await updateProperty(prop.id, { availability_status: e.target.value as any });
                                await loadAllData();
                              }}
                              className="px-2 py-1 text-[11px] bg-[#F8F6F3] border border-[#E8DED3] rounded"
                            >
                              <option value="available">Available</option>
                              <option value="under_offer">Under Offer</option>
                              <option value="sold">Sold</option>
                            </select>
                          </td>

                          {/* Approval Pipeline Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {prop.listing_status === 'draft' && (
                                <button
                                  onClick={() => handleWorkflowTransition(prop, 'pending_approval')}
                                  className="px-2 py-1 text-[10px] font-semibold uppercase bg-amber-50 text-amber-900 border border-amber-200 rounded hover:bg-amber-100"
                                  title="Submit for Approval"
                                >
                                  Submit
                                </button>
                              )}

                              {prop.listing_status === 'pending_approval' && (
                                <button
                                  onClick={() => handleWorkflowTransition(prop, 'approved')}
                                  className="px-2 py-1 text-[10px] font-semibold uppercase bg-blue-50 text-blue-900 border border-blue-200 rounded hover:bg-blue-100"
                                  title="Approve Listing"
                                >
                                  Approve
                                </button>
                              )}

                              {prop.listing_status === 'approved' && (
                                <button
                                  onClick={() => handleWorkflowTransition(prop, 'published')}
                                  className="px-2 py-1 text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-900 border border-emerald-200 rounded hover:bg-emerald-100"
                                  title="Publish to public site"
                                >
                                  Publish
                                </button>
                              )}

                              {prop.listing_status === 'published' && (
                                <button
                                  onClick={() => handleWorkflowTransition(prop, 'draft')}
                                  className="px-2 py-1 text-[10px] font-semibold uppercase bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100"
                                  title="Unpublish to draft"
                                >
                                  Unpublish
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEditProperty(prop)}
                                className="p-1.5 text-[#4E342E] hover:bg-[#E8DED3] rounded"
                                title="Edit Property"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteProp(prop.id, prop.title)}
                                className="p-1.5 text-[#C62828] hover:bg-red-50 rounded"
                                title="Delete Property"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: CUSTOMER REQUESTS & PRIVATE NOTES                             */}
        {/* ==================================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
                  Lead Management
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
                  Customer Requests & Inspections
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={inquiryFilterType}
                  onChange={(e) => setInquiryFilterType(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#E8DED3] rounded-lg"
                >
                  <option value="all">All Request Types</option>
                  <option value="viewing">Site Viewings</option>
                  <option value="property">Property Inquiries</option>
                  <option value="resale">Resale Submissions</option>
                  <option value="land_banking">Land Banking</option>
                  <option value="construction">Construction</option>
                  <option value="survey_planning">Survey Coordination</option>
                </select>

                <select
                  value={inquiryFilterStatus}
                  onChange={(e) => setInquiryFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#E8DED3] rounded-lg"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="in_review">In Review</option>
                  <option value="contacted">Contacted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4E342E] bg-white border border-[#E8DED3] hover:bg-[#F8F6F3] rounded-lg"
                  title="Export to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="bg-white rounded-2xl border border-[#E8DED3] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8F6F3] border-b border-[#E8DED3] text-[#4E342E] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Customer / Contact</th>
                      <th className="p-3.5">Type & Property</th>
                      <th className="p-3.5">Message / Details</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Private Notes & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DED3]">
                    {inquiries
                      .filter((i) => inquiryFilterType === 'all' || i.request_type === inquiryFilterType)
                      .filter((i) => inquiryFilterStatus === 'all' || i.status === inquiryFilterStatus)
                      .map((inq) => (
                        <tr key={inq.id} className="hover:bg-[#F8F6F3]/50 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-[#171717]">{inq.customer_name}</div>
                            <div className="text-[11px] text-[#6B6B6B]">{inq.email}</div>
                            <div className="text-[11px] text-[#4E342E] font-medium">{inq.phone}</div>
                          </td>

                          <td className="p-3.5">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E8DED3] text-[#4E342E]">
                              {inq.request_type.replace('_', ' ')}
                            </span>
                            {inq.related_property_title && (
                              <p className="text-[11px] text-[#6B6B6B] truncate max-w-xs mt-1">
                                {inq.related_property_title}
                              </p>
                            )}
                            {inq.preferred_viewing_date && (
                              <p className="text-[11px] text-[#2E7D32] font-semibold mt-0.5">
                                Viewing: {inq.preferred_viewing_date} ({inq.preferred_viewing_time})
                              </p>
                            )}
                          </td>

                          <td className="p-3.5 max-w-xs">
                            <p className="text-xs text-[#171717] line-clamp-2">{inq.message}</p>
                            <span className="text-[10px] text-[#6B6B6B] tabular-nums">
                              {new Date(inq.created_at).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <select
                              value={inq.priority}
                              onChange={async (e) => {
                                await updateInquiry(inq.id, { priority: e.target.value as any });
                                await loadAllData();
                              }}
                              className="px-2 py-1 text-[11px] bg-[#F8F6F3] border border-[#E8DED3] rounded"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </td>

                          <td className="p-3.5">
                            <select
                              value={inq.status}
                              onChange={async (e) => {
                                await updateInquiry(inq.id, { status: e.target.value as any });
                                await loadAllData();
                              }}
                              className="px-2 py-1 text-[11px] bg-[#F8F6F3] border border-[#E8DED3] rounded"
                            >
                              <option value="new">New</option>
                              <option value="in_review">In Review</option>
                              <option value="contacted">Contacted</option>
                              <option value="scheduled">Scheduled</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleOpenInquiryNotes(inq)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#4E342E] bg-[#E8DED3]/60 hover:bg-[#E8DED3] rounded-lg transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#795548]" />
                              <span>Notes & Review</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: ERROR REPORT MANAGEMENT                                       */}
        {/* ==================================================================== */}
        {activeTab === 'errors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
                  Diagnostic Reports
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
                  Reported Website Issues ({errorReports.length})
                </h1>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8DED3] overflow-hidden shadow-xs">
              {errorReports.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#6B6B6B]">
                  No technical errors or issue reports logged.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F8F6F3] border-b border-[#E8DED3] text-[#4E342E] font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">Reporter</th>
                        <th className="p-3.5">Severity</th>
                        <th className="p-3.5">Page URL</th>
                        <th className="p-3.5">Issue Description</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DED3]">
                      {errorReports.map((err) => (
                        <tr key={err.id} className="hover:bg-[#F8F6F3]/50">
                          <td className="p-3.5">
                            <span className="font-semibold text-[#171717]">
                              {err.reporter_name || 'Anonymous Visitor'}
                            </span>
                            <p className="text-[11px] text-[#6B6B6B]">{err.reporter_email || 'No email'}</p>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                err.severity === 'critical'
                                  ? 'bg-red-100 text-[#C62828]'
                                  : err.severity === 'high'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {err.severity}
                            </span>
                          </td>

                          <td className="p-3.5 max-w-xs truncate text-[11px] text-[#6B6B6B]">
                            {err.page_url}
                          </td>

                          <td className="p-3.5 max-w-sm">
                            <p className="text-xs text-[#171717]">{err.issue_description}</p>
                            {err.resolution_notes && (
                              <p className="text-[11px] text-[#2E7D32] mt-1">
                                Resolved: {err.resolution_notes}
                              </p>
                            )}
                          </td>

                          <td className="p-3.5">
                            <select
                              value={err.status}
                              onChange={async (e) => {
                                await updateErrorReport(err.id, { status: e.target.value as any });
                                await loadAllData();
                              }}
                              className="px-2 py-1 text-[11px] bg-[#F8F6F3] border border-[#E8DED3] rounded"
                            >
                              <option value="open">Open</option>
                              <option value="investigating">Investigating</option>
                              <option value="fixed">Fixed</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              onClick={async () => {
                                const note = prompt('Enter resolution details for this issue:');
                                if (note) {
                                  await updateErrorReport(err.id, {
                                    status: 'fixed',
                                    resolution_notes: note,
                                    resolved_at: new Date().toISOString(),
                                  });
                                  await loadAllData();
                                }
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#2E7D32] bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100"
                            >
                              Resolve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: AUDIT LOG VIEWER                                              */}
        {/* ==================================================================== */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
                Security Audit
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
                System Audit History (Append-Only)
              </h1>
              <p className="text-xs text-[#6B6B6B] mt-1">
                Records sensitive property modifications, listing approvals, administrative role checks, and customer status updates.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8DED3] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8F6F3] border-b border-[#E8DED3] text-[#4E342E] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Actor</th>
                      <th className="p-3.5">Resource Target</th>
                      <th className="p-3.5">Metadata Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DED3] font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F8F6F3]/50">
                        <td className="p-3.5 tabular-nums text-[#6B6B6B] whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-bold text-[#795548] whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="p-3.5 text-[#171717]">{log.actor_email}</td>
                        <td className="p-3.5 text-[#4E342E]">
                          {log.resource_type} {log.resource_id ? `(${log.resource_id.slice(0, 8)})` : ''}
                        </td>
                        <td className="p-3.5 max-w-md truncate text-[#6B6B6B]">
                          {JSON.stringify(log.metadata || {})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: SETTINGS & RLS BOOTSTRAP STATUS                               */}
        {/* ==================================================================== */}
        {activeTab === 'settings' && siteSettings && (
          <div className="space-y-8 max-w-4xl">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
                Configuration
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
                Site Settings & Administrator Authorization
              </h1>
            </div>

            {/* Admin Authorization Security Status Box */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8DED3] space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#E8DED3] pb-3">
                <Shield className="w-5 h-5 text-[#795548]" />
                <h3 className="font-serif font-bold text-lg text-[#171717]">
                  Designated Administrator Role Verification
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#F8F6F3] rounded-xl space-y-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6B6B6B]">
                    Authorized Target User ID (UUID)
                  </span>
                  <p className="font-mono font-bold text-sm text-[#171717]">{TARGET_ADMIN_USER_ID}</p>
                  <p className="text-[11px] text-[#2E7D32] flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Exact UUID matches Section 2 requirements</span>
                  </p>
                </div>

                <div className="p-3 bg-[#F8F6F3] rounded-xl space-y-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6B6B6B]">
                    Row Level Security (RLS)
                  </span>
                  <p className="font-mono font-bold text-sm text-[#171717]">is_admin() DEFINER</p>
                  <p className="text-[11px] text-[#2E7D32] flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Non-recursive security policy active</span>
                  </p>
                </div>
              </div>

              <div className="text-xs text-[#6B6B6B] leading-relaxed">
                Ordinary users cannot elevate privileges. RLS prevents public reads of unapproved drafts, customer inquiries, private notes, and audit trails.
              </div>
            </div>

            {/* Editable Company Info Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateSiteSettings(siteSettings.data);
                alert('Site settings updated successfully!');
              }}
              className="bg-white p-6 rounded-2xl border border-[#E8DED3] space-y-4 shadow-xs"
            >
              <h3 className="font-serif font-bold text-lg text-[#171717] border-b border-[#E8DED3] pb-3">
                Company Information & Homepage Banner
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4E342E] mb-1">Company Name</label>
                  <input
                    type="text"
                    value={siteSettings.data.name}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        data: { ...siteSettings.data, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4E342E] mb-1">Brand Tagline</label>
                  <input
                    type="text"
                    value={siteSettings.data.tagline}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        data: { ...siteSettings.data, tagline: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4E342E] mb-1">Abuja Physical Address</label>
                <input
                  type="text"
                  value={siteSettings.data.address}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      data: { ...siteSettings.data, address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4E342E] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={siteSettings.data.phone}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        data: { ...siteSettings.data, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4E342E] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={siteSettings.data.email}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        data: { ...siteSettings.data, email: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4E342E] mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={siteSettings.data.whatsapp}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        data: { ...siteSettings.data, whatsapp: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4E342E] mb-1">Top Announcement Banner</label>
                <input
                  type="text"
                  value={siteSettings.data.announcement || ''}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      data: { ...siteSettings.data, announcement: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors"
              >
                Save Site Settings
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: CREATE / EDIT PROPERTY                                        */}
      {/* ==================================================================== */}
      {isPropertyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#F8F6F3] rounded-2xl border border-[#E8DED3] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPropertyModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-[#6B6B6B] hover:text-[#171717] rounded-lg"
            >
              ✕
            </button>

            <form onSubmit={handleSaveProperty} className="space-y-4">
              <div className="border-b border-[#E8DED3] pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
                  Property Management
                </span>
                <h3 className="font-serif font-bold text-xl text-[#171717]">
                  {editingProperty ? 'Edit Property Listing' : 'Create New Land Listing'}
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4E342E] mb-1">Property Title *</label>
                <input
                  type="text"
                  required
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  placeholder="e.g. Hilltop Serenity: Premium Residential Plot"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">Price (NGN) *</label>
                  <input
                    type="number"
                    required
                    value={propPrice}
                    onChange={(e) => setPropPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="120000000"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">Land Size (sqm) *</label>
                  <input
                    type="number"
                    required
                    value={propLandSize}
                    onChange={(e) => setPropLandSize(e.target.value ? Number(e.target.value) : '')}
                    placeholder="1200"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">District</label>
                  <select
                    value={propDistrict}
                    onChange={(e) => setPropDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  >
                    <option value="Katampe Extension">Katampe Extension</option>
                    <option value="Guzape">Guzape</option>
                    <option value="Jahi">Jahi</option>
                    <option value="Airport Road Corridor">Airport Road Corridor</option>
                    <option value="Maitama">Maitama</option>
                    <option value="Wuye">Wuye</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">Exact Location Address</label>
                  <input
                    type="text"
                    value={propLocation}
                    onChange={(e) => setPropLocation(e.target.value)}
                    placeholder="Sector Centre Axis, Katampe Extension, Abuja"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">Property Type</label>
                  <select
                    value={propType}
                    onChange={(e) => setPropType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  >
                    <option value="Residential Land">Residential Land</option>
                    <option value="Commercial Land">Commercial Land</option>
                    <option value="Serviced Plot">Serviced Plot</option>
                    <option value="Mixed Use">Mixed Use</option>
                    <option value="Estate Plot">Estate Plot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">Title Documentation</label>
                  <select
                    value={propDocStatus}
                    onChange={(e) => setPropDocStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  >
                    <option value="C of O (Certificate of Occupancy)">C of O (Certificate of Occupancy)</option>
                    <option value="Right of Occupancy (R of O)">Right of Occupancy (R of O)</option>
                    <option value="Gazette / Allocation">Gazette / Allocation</option>
                    <option value="Gazette / FCDA Allocation">Gazette / FCDA Allocation</option>
                    <option value="Deed of Assignment">Deed of Assignment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">Workflow Status</label>
                  <select
                    value={propListingStatus}
                    onChange={(e) => setPropListingStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">Availability</label>
                  <select
                    value={propAvailStatus}
                    onChange={(e) => setPropAvailStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  >
                    <option value="available">Available</option>
                    <option value="under_offer">Under Offer</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4E342E] mb-1">Cover Image Asset</label>
                <select
                  value={propCoverImage}
                  onChange={(e) => setPropCoverImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                >
                  <option value="/src/assets/images/property_katampe_hills_1793003670114.jpg">
                    Katampe Extension Villa & Land
                  </option>
                  <option value="/src/assets/images/property_guzape_luxury_1793003671295.jpg">
                    Guzape Hilltop Luxury Enclave
                  </option>
                  <option value="/src/assets/images/property_jahi_district_1793003670944.jpg">
                    Jahi Serviced Plots & Infrastructure
                  </option>
                  <option value="/src/assets/images/hero_abuja_land_1793003669625.jpg">
                    Panoramic Abuja Rolling Hills & Plots
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4E342E] mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  value={propDescription}
                  onChange={(e) => setPropDescription(e.target.value)}
                  placeholder="Outline plot elevation, proximity to main arterial expressway, zoning density..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">Nearby Landmarks (comma separated)</label>
                  <input
                    type="text"
                    value={propLandmarks}
                    onChange={(e) => setPropLandmarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">Infrastructure Features (comma separated)</label>
                  <input
                    type="text"
                    value={propFeatures}
                    onChange={(e) => setPropFeatures(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prop-featured"
                  checked={propIsFeatured}
                  onChange={(e) => setPropIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E8DED3] text-[#795548]"
                />
                <label htmlFor="prop-featured" className="text-xs font-medium text-[#4E342E]">
                  Feature on Homepage Hero & Curated Showcase
                </label>
              </div>

              <div className="pt-3 border-t border-[#E8DED3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPropertyModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#6B6B6B] hover:text-[#171717]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors"
                >
                  {editingProperty ? 'Save Changes' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: INQUIRY PRIVATE NOTES & RESOLUTION REVIEW                     */}
      {/* ==================================================================== */}
      {activeInquiryForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#F8F6F3] rounded-2xl border border-[#E8DED3] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveInquiryForNotes(null)}
              className="absolute top-5 right-5 p-1.5 text-[#6B6B6B] hover:text-[#171717] rounded-lg"
            >
              ✕
            </button>

            <div className="space-y-4">
              <div className="border-b border-[#E8DED3] pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
                  Internal Administrative Dossier
                </span>
                <h3 className="font-serif font-bold text-xl text-[#171717]">
                  {activeInquiryForNotes.customer_name}
                </h3>
                <p className="text-xs text-[#6B6B6B]">
                  {activeInquiryForNotes.email} · {activeInquiryForNotes.phone}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E8DED3] text-xs space-y-2">
                <div className="flex items-center justify-between text-[#6B6B6B]">
                  <span>Request Type: <strong className="text-[#171717] uppercase">{activeInquiryForNotes.request_type}</strong></span>
                  <span className="tabular-nums">{new Date(activeInquiryForNotes.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-[#171717] leading-relaxed italic bg-[#F8F6F3] p-3 rounded-lg border border-[#E8DED3]">
                  "{activeInquiryForNotes.message}"
                </p>
                {activeInquiryForNotes.preferred_viewing_date && (
                  <p className="text-[#2E7D32] font-semibold">
                    Requested Viewing Date: {activeInquiryForNotes.preferred_viewing_date} at {activeInquiryForNotes.preferred_viewing_time}
                  </p>
                )}
                {activeInquiryForNotes.resale_property_location && (
                  <div className="text-[#4E342E] space-y-0.5">
                    <p>Resale Location: <strong>{activeInquiryForNotes.resale_property_location}</strong></p>
                    <p>Size: {activeInquiryForNotes.resale_land_size} | Asking: ₦{activeInquiryForNotes.resale_asking_price?.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Private Notes Section */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#171717]">
                  Confidential Administrative Notes ({currentNotes.length})
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentNotes.length === 0 ? (
                    <p className="text-xs text-[#6B6B6B]">No internal notes added yet.</p>
                  ) : (
                    currentNotes.map((note) => (
                      <div key={note.id} className="p-2.5 bg-white rounded-lg border border-[#E8DED3] text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#6B6B6B]">
                          <span className="font-semibold text-[#4E342E]">{note.admin_name}</span>
                          <span className="tabular-nums">{new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[#171717]">{note.note}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add private note (e.g. Called client; sent AGIS survey map)..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold uppercase bg-[#795548] text-white rounded-lg hover:bg-[#4E342E]"
                  >
                    Add Note
                  </button>
                </form>
              </div>

              {/* Resolution Form */}
              <div className="pt-3 border-t border-[#E8DED3] space-y-3">
                <label className="block text-xs font-semibold text-[#4E342E]">
                  Resolution Summary / Outcome
                </label>
                <textarea
                  rows={2}
                  value={resolutionDetailsText}
                  onChange={(e) => setResolutionDetailsText(e.target.value)}
                  placeholder="Record final outcome (e.g. Site viewing conducted successfully; deed drafted)..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveInquiryForNotes(null)}
                    className="text-xs text-[#6B6B6B]"
                  >
                    Close
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveInquiryResolution('scheduled')}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-900 rounded-lg hover:bg-blue-200"
                    >
                      Mark Scheduled
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveInquiryResolution('resolved')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2E7D32] rounded-lg hover:bg-[#256828]"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
