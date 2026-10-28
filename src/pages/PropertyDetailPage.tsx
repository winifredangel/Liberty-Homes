import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  Share2,
  Calendar,
  Send,
  Bookmark,
  Check,
  ChevronLeft,
  ArrowRight,
  ShieldAlert,
  Building2,
  PhoneCall,
  Scale
} from 'lucide-react';
import { Property } from '../types';
import { getPropertyBySlug, getProperties, submitInquiry, toggleSavedPropertyId, getSavedPropertyIds } from '../lib/supabase';
import { PropertyCard } from '../components/property/PropertyCard';

interface PropertyDetailPageProps {
  onInquire: (property: Property) => void;
  onToggleCompare: (property: Property) => void;
  comparedIds: string[];
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  onInquire,
  onToggleCompare,
  comparedIds,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Form states for inline inquiry / viewing
  const [formMode, setFormMode] = useState<'inquiry' | 'viewing'>('viewing');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function loadProperty() {
      if (!slug) return;
      setLoading(true);
      try {
        const found = await getPropertyBySlug(slug);
        setProperty(found);
        if (found) {
          setIsSaved(getSavedPropertyIds().includes(found.id));
          const allProps = await getProperties();
          const similar = allProps.filter(
            (p) => p.id !== found.id && p.listing_status === 'published'
          );
          setSimilarProperties(similar.slice(0, 3));
        }
      } catch (e) {
        console.error('Error loading property details:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
  }, [slug]);

  const handleToggleSave = () => {
    if (!property) return;
    const res = toggleSavedPropertyId(property.id);
    setIsSaved(res);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setFormError('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setFormError('Please complete all required fields.');
      return;
    }
    if (!consent) {
      setFormError('Please check the confirmation box before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await submitInquiry({
        request_type: formMode === 'viewing' ? 'viewing' : 'property',
        customer_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        related_property_id: property.id,
        related_property_title: property.title,
        message: message.trim(),
        preferred_viewing_date: formMode === 'viewing' ? preferredDate : undefined,
        preferred_viewing_time: formMode === 'viewing' ? preferredTime : undefined,
        priority: formMode === 'viewing' ? 'high' : 'medium',
      });
      setSubmitSuccess(true);
    } catch (err: any) {
      setFormError(err.message || 'Could not submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl border border-[#E8DED3] p-8 h-96 animate-pulse space-y-4">
          <div className="h-6 bg-[#E8DED3]/60 rounded w-1/3" />
          <div className="h-64 bg-[#E8DED3]/40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#171717]">
          Property Listing Not Found
        </h2>
        <p className="text-sm text-[#6B6B6B]">
          The property plot you requested may have been relocated or is currently unpublished.
        </p>
        <Link
          to="/properties"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Properties</span>
        </Link>
      </div>
    );
  }

  const gallery = property.gallery_images && property.gallery_images.length > 0
    ? property.gallery_images
    : [property.cover_image_path];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4E342E] hover:text-[#795548] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Listings</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleCompare(property)}
            className={`p-2 rounded-lg border border-[#E8DED3] text-xs font-medium flex items-center gap-1.5 transition-colors ${
              comparedIds.includes(property.id)
                ? 'bg-[#795548] text-white'
                : 'bg-white text-[#4E342E] hover:bg-[#F8F6F3]'
            }`}
            title="Compare Plot"
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
          </button>

          <button
            onClick={handleToggleSave}
            className={`p-2 rounded-lg border border-[#E8DED3] text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isSaved
                ? 'bg-[#795548] text-white'
                : 'bg-white text-[#4E342E] hover:bg-[#F8F6F3]'
            }`}
            title="Save Property"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-lg border border-[#E8DED3] bg-white text-[#4E342E] hover:bg-[#F8F6F3] text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Share Property Link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{shareCopied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Details & Gallery on Left, Request Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column (8 cols): Media Gallery & Specs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Title & Key Header Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
              <span className="font-semibold text-[#795548] uppercase tracking-wider">{property.district}</span>
              <span aria-hidden="true">·</span>
              <span>{property.property_type}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{property.availability_status.replace('_', ' ')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#171717] leading-tight">
              {property.title}
            </h1>

            <p className="flex items-center gap-1.5 text-sm text-[#4E342E]/80">
              <MapPin className="w-4 h-4 text-[#795548] shrink-0" />
              <span>{property.location}, {property.district}, Abuja</span>
            </p>
          </div>

          {/* Interactive Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#E8DED3] bg-[#E8DED3]/40 shadow-sm">
              <img
                src={gallery[activeImageIndex] || property.cover_image_path}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded">
                Photo {activeImageIndex + 1} of {gallery.length}
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-[#795548] scale-102' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Metric Highlights Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-xl border border-[#E8DED3]">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-[#6B6B6B]">Price (NGN)</span>
              <p className="text-base sm:text-lg font-bold text-[#4E342E] tabular-nums">
                {formatPrice(property.price)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-[#6B6B6B]">Land Size</span>
              <p className="text-base sm:text-lg font-bold text-[#171717] tabular-nums">
                {property.land_size} {property.land_size_unit}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-[#6B6B6B]">Price / Sqm</span>
              <p className="text-base sm:text-lg font-bold text-[#171717] tabular-nums">
                ₦{Math.round(property.price / property.land_size).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-[#6B6B6B]">Availability</span>
              <p className="text-base sm:text-lg font-bold text-[#2E7D32] capitalize">
                {property.availability_status.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Verified Title Status & Independent Legal Due Diligence Disclaimer */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#171717]">
                  Verified Documentation: {property.documentation_status}
                </h4>
                <p className="text-xs text-[#4E342E]/80 mt-1 leading-relaxed">
                  Cadastral survey beacons have been confirmed against FCDA coordinate records.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/60 flex items-start gap-2.5 text-[11px] text-[#6B6B6B] leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-[#795548] shrink-0 mt-0.5" />
              <span>
                <strong>Buyer Notice:</strong> In line with Liberty Homes transparency standards, prospective buyers are strongly advised to conduct independent verification of title documents and land registry files at the Abuja Geographic Information Systems (AGIS) prior to contract execution.
              </span>
            </div>
          </div>

          {/* Full Description */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-xl text-[#171717]">
              Detailed Plot Description
            </h3>
            <div className="text-sm text-[#4E342E]/90 leading-relaxed whitespace-pre-line bg-white p-6 rounded-xl border border-[#E8DED3]">
              {property.description}
            </div>
          </div>

          {/* Infrastructure & Nearby Landmarks Bento Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-[#E8DED3] space-y-3">
              <h4 className="font-serif font-bold text-base text-[#171717]">
                Infrastructure & Site Features
              </h4>
              <ul className="space-y-2 text-xs text-[#4E342E]/80">
                {property.infrastructure_features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E8DED3] space-y-3">
              <h4 className="font-serif font-bold text-base text-[#171717]">
                Proximity & Nearby Landmarks
              </h4>
              <ul className="space-y-2 text-xs text-[#4E342E]/80">
                {property.nearby_landmarks.map((lm, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#795548] shrink-0" />
                    <span>{lm}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Sticky Lead Capture Form */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-white rounded-2xl border border-[#E8DED3] p-6 shadow-sm space-y-5">
            <div className="border-b border-[#E8DED3] pb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#795548] block">
                Direct Inquiry
              </span>
              <h3 className="font-serif font-bold text-xl text-[#171717]">
                Schedule Site Inspection
              </h3>
            </div>

            {submitSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#2E7D32] mx-auto" />
                <h4 className="font-serif font-bold text-lg text-[#171717]">Request Sent</h4>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Your viewing request for <strong>{property.title}</strong> has been logged. Our Abuja team will contact you to confirm the time and meeting point.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="text-xs text-[#795548] font-semibold hover:underline pt-2"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleInlineSubmit} className="space-y-3.5">
                {/* Form Mode Selector */}
                <div className="grid grid-cols-2 bg-[#F8F6F3] p-1 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setFormMode('viewing')}
                    className={`py-1.5 rounded transition-colors ${
                      formMode === 'viewing'
                        ? 'bg-white text-[#4E342E] shadow-xs font-semibold'
                        : 'text-[#6B6B6B]'
                    }`}
                  >
                    Book Site Inspection
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMode('inquiry')}
                    className={`py-1.5 rounded transition-colors ${
                      formMode === 'inquiry'
                        ? 'bg-white text-[#4E342E] shadow-xs font-semibold'
                        : 'text-[#6B6B6B]'
                    }`}
                  >
                    General Inquiry
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                    Your Name <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Fatima Bello"
                    className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                    Email Address <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                    Phone / WhatsApp <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
                  />
                </div>

                {formMode === 'viewing' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                        Time Slot
                      </label>
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded"
                      >
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="02:30 PM">02:30 PM</option>
                        <option value="04:30 PM">04:30 PM</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                    Inquiry Notes <span className="text-[#C62828]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Specify your interest, number of attendees for viewing, or title documentation questions..."
                    className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="detail-consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-3.5 w-3.5 rounded border-[#E8DED3] text-[#795548]"
                  />
                  <label htmlFor="detail-consent" className="text-[11px] text-[#6B6B6B] leading-tight">
                    I agree to be contacted by Liberty Homes Abuja regarding this property inspection.
                  </label>
                </div>

                {formError && (
                  <p className="text-xs text-[#C62828] bg-red-50 p-2 rounded">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                >
                  {submitting ? 'Submitting...' : formMode === 'viewing' ? 'Request Site Inspection' : 'Send Inquiry'}
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-[#E8DED3] space-y-2 text-xs text-[#6B6B6B]">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-[#795548]" />
                <span>Direct line: 09160336411</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#795548]" />
                <span>CBD Head Office, Abuja FCT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <div className="pt-12 border-t border-[#E8DED3] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-2xl text-[#171717]">
              Other Available Plots in Abuja
            </h3>
            <Link
              to="/properties"
              className="text-xs font-semibold uppercase tracking-wider text-[#795548] hover:text-[#4E342E]"
            >
              View All Listings →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                onInquire={onInquire}
                onToggleCompare={onToggleCompare}
                isCompared={comparedIds.includes(p.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
