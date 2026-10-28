import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, Clock, MapPin, Building2, Send } from 'lucide-react';
import { Property, RequestType } from '../../types';
import { submitInquiry } from '../../lib/supabase';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  initialRequestType?: RequestType;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  property,
  initialRequestType = 'property',
}) => {
  const [requestType, setRequestType] = useState<RequestType>(initialRequestType);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg('Please enter a valid phone or WhatsApp number.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please provide a short message or specific request.');
      return;
    }
    if (!consent) {
      setErrorMsg('Please agree to allow Liberty Homes representatives to contact you.');
      return;
    }

    setLoading(true);
    try {
      await submitInquiry({
        request_type: requestType,
        customer_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        related_property_id: property?.id || null,
        related_property_title: property?.title || undefined,
        message: message.trim(),
        preferred_viewing_date: requestType === 'viewing' ? preferredDate : undefined,
        preferred_viewing_time: requestType === 'viewing' ? preferredTime : undefined,
        priority: requestType === 'viewing' ? 'high' : 'medium',
      });

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setErrorMsg('');
    setFullName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setPreferredDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#F8F6F3] rounded-2xl border border-[#E8DED3] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-1.5 text-[#6B6B6B] hover:text-[#171717] hover:bg-[#E8DED3]/50 rounded-lg transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-[#2E7D32]/10 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#171717]">
              Inquiry Received
            </h3>
            <p className="text-sm text-[#4E342E]/80 leading-relaxed max-w-md mx-auto">
              Thank you for contacting Liberty Homes. Our Abuja property advisory team has received your request and will reach out to you within one business day via phone or email.
            </p>
            {requestType === 'viewing' && (
              <p className="text-xs text-[#6B6B6B] bg-[#E8DED3]/50 p-3 rounded-lg text-left">
                <strong>Site Inspection Notice:</strong> Viewing appointments are subject to scheduling confirmation by a Liberty Homes representative prior to site visit.
              </p>
            )}
            <div className="pt-4">
              <button
                onClick={handleResetAndClose}
                className="w-full px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-[#E8DED3] pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
                Liberty Homes Abuja
              </span>
              <h3 className="text-xl font-serif font-bold text-[#171717]">
                {property ? 'Inquire About Property' : 'Property Consultation Request'}
              </h3>
            </div>

            {/* Selected Property preview if any */}
            {property && (
              <div className="bg-white p-3 rounded-lg border border-[#E8DED3] flex items-center gap-3">
                <img
                  src={property.cover_image_path}
                  alt={property.title}
                  className="w-12 h-12 rounded object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-[#171717] truncate">{property.title}</h4>
                  <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#795548]" />
                    <span className="truncate">{property.district}, Abuja</span>
                  </p>
                  <p className="text-xs font-bold text-[#4E342E] tabular-nums">
                    ₦{property.price.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Tab selector for request type */}
            <div className="flex rounded-lg bg-[#E8DED3]/60 p-1 gap-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setRequestType('property')}
                className={`flex-1 py-1.5 rounded transition-colors whitespace-nowrap ${
                  requestType === 'property'
                    ? 'bg-white text-[#4E342E] shadow-xs font-semibold'
                    : 'text-[#6B6B6B] hover:text-[#171717]'
                }`}
              >
                Property Details
              </button>
              <button
                type="button"
                onClick={() => setRequestType('viewing')}
                className={`flex-1 py-1.5 rounded transition-colors whitespace-nowrap flex items-center justify-center gap-1 ${
                  requestType === 'viewing'
                    ? 'bg-white text-[#4E342E] shadow-xs font-semibold'
                    : 'text-[#6B6B6B] hover:text-[#171717]'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>Site Viewing</span>
              </button>
              <button
                type="button"
                onClick={() => setRequestType('land_banking')}
                className={`flex-1 py-1.5 rounded transition-colors whitespace-nowrap ${
                  requestType === 'land_banking'
                    ? 'bg-white text-[#4E342E] shadow-xs font-semibold'
                    : 'text-[#6B6B6B] hover:text-[#171717]'
                }`}
              >
                Land Banking
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#4E342E] mb-1">
                  Full Name <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ibrahim Danjuma"
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548] focus:ring-1 focus:ring-[#795548]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">
                    Email Address <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548] focus:ring-1 focus:ring-[#795548]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">
                    Phone / WhatsApp <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    required
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548] focus:ring-1 focus:ring-[#795548]"
                  />
                </div>
              </div>

              {requestType === 'viewing' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-[#E8DED3]">
                  <div>
                    <label className="block text-xs font-medium text-[#4E342E] mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#795548]" />
                      <span>Preferred Date</span>
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-2.5 py-1.5 text-xs border border-[#E8DED3] rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4E342E] mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#795548]" />
                      <span>Preferred Time</span>
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-[#E8DED3] rounded"
                    >
                      <option value="10:00 AM">Morning (10:00 AM)</option>
                      <option value="12:00 PM">Midday (12:00 PM)</option>
                      <option value="02:30 PM">Afternoon (2:30 PM)</option>
                      <option value="04:30 PM">Late Afternoon (4:30 PM)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#4E342E] mb-1">
                  Message or Specific Inquiries <span className="text-[#C62828]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    requestType === 'viewing'
                      ? 'Please let us know how many attendees will be joining or if transport coordination from town is requested...'
                      : 'Please outline your investment budget, preferred size or questions regarding land titles...'
                  }
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548] focus:ring-1 focus:ring-[#795548]"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#E8DED3] text-[#795548] focus:ring-[#795548]"
                />
                <label htmlFor="modal-consent" className="text-xs text-[#6B6B6B] leading-relaxed">
                  I consent to Liberty Homes contacting me regarding this property inquiry and understand that title documents should be independently verified before closing.
                </label>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 text-xs text-[#C62828] bg-red-50 border border-red-200 rounded-lg">
                {errorMsg}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] disabled:opacity-50 rounded-lg transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
