import React, { useState } from 'react';
import {
  TrendingUp,
  Layers,
  Building,
  Compass,
  CheckCircle2,
  Send,
  HelpCircle,
  FileCheck2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { submitInquiry } from '../lib/supabase';

interface ServicesPageProps {
  onInquire: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onInquire }) => {
  // Resale submission form state
  const [resaleOwnerName, setResaleOwnerName] = useState('');
  const [resaleEmail, setResaleEmail] = useState('');
  const [resalePhone, setResalePhone] = useState('');
  const [resaleLocation, setResaleLocation] = useState('');
  const [resaleLandSize, setResaleLandSize] = useState('');
  const [resaleAskingPrice, setResaleAskingPrice] = useState('');
  const [resaleTitleType, setResaleTitleType] = useState('C of O');
  const [resaleDetails, setResaleDetails] = useState('');
  const [resaleSubmitting, setResaleSubmitting] = useState(false);
  const [resaleSuccess, setResaleSuccess] = useState(false);
  const [resaleError, setResaleError] = useState('');

  // General service modal consultation form state
  const [activeServiceInquiry, setActiveServiceInquiry] = useState<string | null>(null);
  const [svcName, setSvcName] = useState('');
  const [svcEmail, setSvcEmail] = useState('');
  const [svcPhone, setSvcPhone] = useState('');
  const [svcMessage, setSvcMessage] = useState('');
  const [svcSubmitting, setSvcSubmitting] = useState(false);
  const [svcSuccess, setSvcSuccess] = useState(false);

  const handleResaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResaleError('');

    if (!resaleOwnerName.trim() || !resaleEmail.trim() || !resalePhone.trim() || !resaleLocation.trim()) {
      setResaleError('Please fill in all required property information.');
      return;
    }

    setResaleSubmitting(true);
    try {
      await submitInquiry({
        request_type: 'resale',
        customer_name: resaleOwnerName.trim(),
        email: resaleEmail.trim(),
        phone: resalePhone.trim(),
        resale_property_location: resaleLocation.trim(),
        resale_land_size: resaleLandSize.trim(),
        resale_asking_price: resaleAskingPrice ? Number(resaleAskingPrice) : undefined,
        message: `[Title Type: ${resaleTitleType}] ${resaleDetails.trim()}`,
        priority: 'high',
      });
      setResaleSuccess(true);
    } catch (err: any) {
      setResaleError(err.message || 'Could not submit resale request.');
    } finally {
      setResaleSubmitting(false);
    }
  };

  const handleServiceInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!svcName.trim() || !svcEmail.trim() || !svcPhone.trim() || !svcMessage.trim()) {
      return;
    }

    setSvcSubmitting(true);
    try {
      await submitInquiry({
        request_type: activeServiceInquiry as any || 'general',
        customer_name: svcName.trim(),
        email: svcEmail.trim(),
        phone: svcPhone.trim(),
        message: svcMessage.trim(),
        priority: 'medium',
      });
      setSvcSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSvcSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-3 border-b border-[#E8DED3] pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
          Professional Property Services
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171717]">
          End-to-End Real Estate Solutions in Abuja
        </h1>
        <p className="text-sm sm:text-base text-[#4E342E]/80 leading-relaxed">
          From strategic land acquisition and rigorous cadastral surveys to building consultations and property resale marketing, Liberty Homes provides transparent support across the Federal Capital Territory.
        </p>
      </div>

      {/* Service 1: Land Banking */}
      <section id="land-banking" className="scroll-mt-24 bg-white rounded-2xl border border-[#E8DED3] p-8 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="w-12 h-12 bg-[#E8DED3]/60 text-[#795548] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#171717]">
              01. Land Banking
            </h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
              Strategic Capital Allocation
            </p>
            <button
              onClick={() => {
                setActiveServiceInquiry('land_banking');
                setSvcSuccess(false);
              }}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors whitespace-nowrap"
            >
              Request Land Banking Brief
            </button>
          </div>

          <div className="lg:col-span-8 space-y-4 text-sm text-[#4E342E]/90 leading-relaxed border-t lg:border-t-0 lg:border-l border-[#E8DED3] lg:pl-8 pt-4 lg:pt-0">
            <p>
              Liberty Homes assists clients in identifying and acquiring strategic parcels situated along verified growth corridors in the Federal Capital Territory, such as the Airport Road expansion axis, Kuje arterial bypass, and Idu industrial corridor.
            </p>
            <div className="bg-[#F8F6F3] p-4 rounded-xl border border-[#E8DED3] space-y-2">
              <h4 className="font-semibold text-xs text-[#171717] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#795548]" />
                <span>Statutory Investment Disclaimer</span>
              </h4>
              <p className="text-xs text-[#6B6B6B]">
                Land banking involves holding real property for potential medium-to-long term appreciation as infrastructure matures. Liberty Homes does not promise or guarantee speculative percentage returns; historical appreciation in Abuja does not guarantee future performance.
              </p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-[#171717] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Cadastral coordinate mapping</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Verification against green belts & waterways</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Phased acquisition structures</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Title clearance before transfer</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Service 2: Property Resale Assistance with Working Submission Form */}
      <section id="property-resale" className="scroll-mt-24 bg-white rounded-2xl border border-[#E8DED3] p-8 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="w-12 h-12 bg-[#E8DED3]/60 text-[#795548] rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#171717]">
              02. Property Resale
            </h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
              Owner Listing & Title Review
            </p>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Are you an Abuja land owner looking to divest or liquidate a verified parcel? Submit your property details for our review and potential listing across our investor network.
            </p>
          </div>

          <div className="lg:col-span-8 border-t lg:border-t-0 lg:border-l border-[#E8DED3] lg:pl-8 pt-4 lg:pt-0">
            {resaleSuccess ? (
              <div className="bg-[#2E7D32]/10 border border-[#2E7D32]/30 rounded-xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-[#2E7D32] mx-auto" />
                <h4 className="font-serif font-bold text-lg text-[#171717]">
                  Resale Submission Received
                </h4>
                <p className="text-xs text-[#4E342E]/80 max-w-md mx-auto leading-relaxed">
                  Our acquisitions team will review your property documentation and schedule a surveyor preliminary check. You will be contacted within 48 hours.
                </p>
                <button
                  onClick={() => setResaleSuccess(false)}
                  className="text-xs text-[#795548] font-semibold hover:underline"
                >
                  Submit another property
                </button>
              </div>
            ) : (
              <form onSubmit={handleResaleSubmit} className="space-y-4">
                <h3 className="font-serif font-bold text-base text-[#171717]">
                  Owner Resale Intake Form
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                      Owner Name <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={resaleOwnerName}
                      onChange={(e) => setResaleOwnerName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                      Email Address <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={resaleEmail}
                      onChange={(e) => setResaleEmail(e.target.value)}
                      placeholder="owner@domain.com"
                      className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                      Phone Number <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={resalePhone}
                      onChange={(e) => setResalePhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                      Plot Location / District <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={resaleLocation}
                      onChange={(e) => setResaleLocation(e.target.value)}
                      placeholder="e.g. Katampe Ext, Cadastral Zone B19"
                      className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                      Land Size
                    </label>
                    <input
                      type="text"
                      value={resaleLandSize}
                      onChange={(e) => setResaleLandSize(e.target.value)}
                      placeholder="e.g. 1000 sqm / 2 plots"
                      className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                      Title Document
                    </label>
                    <select
                      value={resaleTitleType}
                      onChange={(e) => setResaleTitleType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                    >
                      <option value="C of O">Certificate of Occupancy (C of O)</option>
                      <option value="R of O">Right of Occupancy (R of O)</option>
                      <option value="FCDA Allocation">FCDA Direct Allocation</option>
                      <option value="Gazette">Gazette / Regularized</option>
                      <option value="Other">Other Verified Title</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                    Asking Price (NGN) & Additional Details
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                    <input
                      type="number"
                      value={resaleAskingPrice}
                      onChange={(e) => setResaleAskingPrice(e.target.value)}
                      placeholder="Net Asking Price (₦)"
                      className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg tabular-nums"
                    />
                    <div className="sm:col-span-2 text-[11px] text-[#6B6B6B] flex items-center">
                      Only direct owners or authorized mandate holders with power of attorney may submit.
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={resaleDetails}
                    onChange={(e) => setResaleDetails(e.target.value)}
                    placeholder="Provide beacon numbers, topography notes, or reason for divestment..."
                    className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
                  />
                </div>

                {resaleError && (
                  <p className="text-xs text-[#C62828] bg-red-50 p-2 rounded">
                    {resaleError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={resaleSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors"
                >
                  {resaleSubmitting ? 'Submitting Property...' : 'Submit Property for Resale Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Service 3: Construction & Building */}
      <section id="construction" className="scroll-mt-24 bg-white rounded-2xl border border-[#E8DED3] p-8 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="w-12 h-12 bg-[#E8DED3]/60 text-[#795548] rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#171717]">
              03. Construction & Building
            </h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
              Architectural & Building Consultations
            </p>
            <button
              onClick={() => {
                setActiveServiceInquiry('construction');
                setSvcSuccess(false);
              }}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors whitespace-nowrap"
            >
              Request Building Consultation
            </button>
          </div>

          <div className="lg:col-span-8 space-y-4 text-sm text-[#4E342E]/90 leading-relaxed border-t lg:border-t-0 lg:border-l border-[#E8DED3] lg:pl-8 pt-4 lg:pt-0">
            <p>
              Once your plot is secured, Liberty Homes connects land owners with qualified, registered structural engineers and architects to design and construct residential villas, duplexes, or commercial units that comply with Abuja Master Plan and Development Control building codes.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium text-[#171717] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Development Control approval support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Soil testing & geotechnical assessments</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Turnkey construction oversight</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Bill of quantities & materials budgeting</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Service 4: Survey & Planning */}
      <section id="survey-planning" className="scroll-mt-24 bg-white rounded-2xl border border-[#E8DED3] p-8 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="w-12 h-12 bg-[#E8DED3]/60 text-[#795548] rounded-xl flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#171717]">
              04. Survey & Planning
            </h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
              Cadastral Coordination & Demarcation
            </p>
            <button
              onClick={() => {
                setActiveServiceInquiry('survey_planning');
                setSvcSuccess(false);
              }}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors whitespace-nowrap"
            >
              Request Survey Coordination
            </button>
          </div>

          <div className="lg:col-span-8 space-y-4 text-sm text-[#4E342E]/90 leading-relaxed border-t lg:border-t-0 lg:border-l border-[#E8DED3] lg:pl-8 pt-4 lg:pt-0">
            <p>
              We coordinate surveying operations, beacon plantings, boundary verifications, and topographical contours exclusively through appropriately qualified, SURCON-licensed surveyors.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium text-[#171717] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>SURCON registered surveyor coordination</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>AGIS coordinate cross-checks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Topographical slope surveys</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Perimeter boundary redelineation</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Modal for Service Consultations */}
      {activeServiceInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#F8F6F3] rounded-2xl border border-[#E8DED3] max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveServiceInquiry(null)}
              className="absolute top-4 right-4 p-1.5 text-[#6B6B6B] hover:text-[#171717] rounded-lg"
            >
              ✕
            </button>

            {svcSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#2E7D32] mx-auto" />
                <h3 className="font-serif font-bold text-lg text-[#171717]">
                  Consultation Request Logged
                </h3>
                <p className="text-xs text-[#6B6B6B]">
                  Our specialist advisor for this service will contact you to discuss your requirements.
                </p>
                <button
                  onClick={() => setActiveServiceInquiry(null)}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] rounded-lg mt-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleServiceInquirySubmit} className="space-y-3">
                <h3 className="font-serif font-bold text-lg text-[#171717] capitalize">
                  Request {activeServiceInquiry.replace('_', ' ')} Consultation
                </h3>

                <div>
                  <label className="block text-[11px] font-medium text-[#4E342E] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={svcName}
                    onChange={(e) => setSvcName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#4E342E] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={svcEmail}
                    onChange={(e) => setSvcEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#4E342E] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={svcPhone}
                    onChange={(e) => setSvcPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#4E342E] mb-1">Consultation Details</label>
                  <textarea
                    rows={3}
                    required
                    value={svcMessage}
                    onChange={(e) => setSvcMessage(e.target.value)}
                    placeholder="Tell us about your timeline, plot location, or questions..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={svcSubmitting}
                  className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors"
                >
                  {svcSubmitting ? 'Submitting...' : 'Send Consultation Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
