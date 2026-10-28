import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, MessageSquare, Send, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { Property, RequestType } from '../types';
import { submitInquiry, getProperties } from '../lib/supabase';

interface ContactPageProps {
  onOpenErrorReport: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenErrorReport }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<RequestType>('general');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadProps() {
      try {
        const list = await getProperties();
        setProperties(list.filter((p) => p.listing_status === 'published'));
      } catch (e) {
        console.error(e);
      }
    }
    loadProps();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (!consent) {
      setErrorMsg('Please confirm consent to be contacted regarding this inquiry.');
      return;
    }

    setLoading(true);
    try {
      const selectedProp = properties.find((p) => p.id === selectedPropertyId);
      await submitInquiry({
        request_type: category,
        customer_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        related_property_id: selectedPropertyId || undefined,
        related_property_title: selectedProp?.title || undefined,
        message: message.trim(),
        priority: category === 'viewing' ? 'high' : 'medium',
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Title */}
      <div className="max-w-2xl space-y-2 border-b border-[#E8DED3] pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
          Connect With Us
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171717]">
          Contact Liberty Homes Abuja
        </h1>
        <p className="text-sm text-[#4E342E]/80 leading-relaxed">
          Reach our property advisory and survey coordination team in the Federal Capital Territory. We are ready to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Contact Cards & Office Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8DED3] p-6 sm:p-8 space-y-6 shadow-xs">
            <h3 className="font-serif font-bold text-xl text-[#171717]">
              Abuja Corporate Office
            </h3>

            <div className="space-y-4 text-sm text-[#4E342E]/90">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#795548] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#171717]">
                    Headquarters Address
                  </h4>
                  <p className="text-xs text-[#6B6B6B] mt-0.5 leading-relaxed">
                    Suite 304, Millennium Builders Plaza, Plot 251 Herbert Macaulay Way, Central Business District, Abuja, Nigeria
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#795548] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#171717]">
                    Direct Phone Line
                  </h4>
                  <p className="text-xs text-[#6B6B6B] mt-0.5 font-sans tabular-nums">
                    09160336411
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#795548] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#171717]">
                    Email Inquiries
                  </h4>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    winifredmaduabuchi368@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#795548] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#171717]">
                    Office Hours
                  </h4>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Monday to Saturday: 8:00 AM – 5:30 PM (WAT)
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8DED3]">
              <a
                href="https://wa.me/2349160336411"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#2E7D32] hover:bg-[#256828] rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Directly on WhatsApp (09160336411)</span>
              </a>
            </div>
          </div>

          <div className="bg-[#4E342E] text-white p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#c9b3a0]" />
              <h4 className="font-serif font-bold text-base">In-Person Inspections</h4>
            </div>
            <p className="text-xs text-[#E8DED3]/80 leading-relaxed">
              We arrange accompanied site viewings from Monday to Saturday. Please schedule at least 24 hours in advance to coordinate vehicle logistics and cadastral beacon verification.
            </p>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onOpenErrorReport}
              className="text-xs text-[#6B6B6B] hover:text-[#795548] underline"
            >
              Notice a technical issue with our website? Report it here.
            </button>
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8DED3] p-6 sm:p-8 shadow-xs">
          {success ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 bg-[#2E7D32]/10 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-[#171717]">
                Message Received
              </h3>
              <p className="text-sm text-[#4E342E]/80 max-w-md mx-auto leading-relaxed">
                Thank you for reaching out to Liberty Homes. An advisory officer from our Abuja office will contact you promptly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] rounded-lg mt-3"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif font-bold text-xl text-[#171717] border-b border-[#E8DED3] pb-3">
                Send an Inquiry or Schedule a Consultation
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">
                    Full Name <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Babatunde Adeleke"
                    className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4E342E] mb-1">
                      Email Address <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4E342E] mb-1">
                      Phone Number (WhatsApp Preferred) <span className="text-[#C62828]">*</span>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4E342E] mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as RequestType)}
                      className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden"
                    >
                      <option value="general">General Inquiries</option>
                      <option value="property">Specific Plot Inquiry</option>
                      <option value="viewing">Site Viewing / Inspection</option>
                      <option value="land_banking">Land Banking Advisory</option>
                      <option value="resale">Property Resale Assistance</option>
                      <option value="construction">Construction Consultation</option>
                      <option value="survey_planning">Survey & Planning Coordination</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4E342E] mb-1">
                      Related Property (Optional)
                    </label>
                    <select
                      value={selectedPropertyId}
                      onChange={(e) => setSelectedPropertyId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden"
                    >
                      <option value="">-- None / General Inquiry --</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.district})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4E342E] mb-1">
                    Message <span className="text-[#C62828]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your interest, budget, timeline, or preferred viewing date..."
                    className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="contact-consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-3.5 w-3.5 rounded border-[#E8DED3] text-[#795548]"
                  />
                  <label htmlFor="contact-consent" className="text-xs text-[#6B6B6B] leading-tight">
                    I agree to be contacted by Liberty Homes Abuja regarding my real estate inquiry.
                  </label>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 text-xs text-[#C62828] bg-red-50 border border-red-200 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] disabled:opacity-50 rounded-lg transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Submitting...' : 'Send Inquiry to Liberty Homes'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
