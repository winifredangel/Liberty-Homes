import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Compass, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-4 border-b border-[#E8DED3] pb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
          Our Story & Principles
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#171717] leading-tight">
          Where Your Dream Home Begins in Abuja
        </h1>
        <p className="text-base sm:text-lg text-[#4E342E]/80 leading-relaxed">
          Liberty Homes was established in the Federal Capital Territory of Nigeria to resolve one of the most pressing challenges in real estate: lack of transparency and verifiable property data.
        </p>
      </div>

      {/* Narrative Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-5 text-sm text-[#4E342E]/90 leading-relaxed">
          <h2 className="font-serif font-bold text-2xl text-[#171717]">
            Committed to Cadastral Accuracy & Honest Transactions
          </h2>
          <p>
            Operating from our headquarters in Abuja's Central Business District, Liberty Homes specializes in land acquisitions, serviced residential parcels, and property investment opportunities throughout the FCT.
          </p>
          <p>
            We recognize that land acquisition is among the largest financial decisions an individual, diaspora Nigerian, or corporate entity will make. For this reason, we implement an uncompromising due diligence standard: every plot we present is cross-referenced with official survey beacons, layout plans, and land registry records before being offered to clients.
          </p>
          <p>
            We do not manufacture exaggerated claims or false guarantees. Instead, we provide clear, documented facts, enabling our clients to build their dream homes or grow their investment portfolios with absolute peace of mind.
          </p>
        </div>

        {/* Visual Callout */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8DED3] p-6 sm:p-8 space-y-6 shadow-xs">
          <h3 className="font-serif font-bold text-xl text-[#171717] border-b border-[#E8DED3] pb-3">
            Company Pillars
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#795548] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Due Diligence First
                </h4>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Physical beacon inspection and statutory title verification on all listed parcels.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Compass className="w-5 h-5 text-[#795548] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Cadastral Precision
                </h4>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Strict alignment with Abuja Geographic Information Systems (AGIS) standards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-[#795548] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Diaspora Concierge
                </h4>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Transparent video inspections, verified coordinates, and reliable representation for overseas buyers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#4E342E] text-white p-8 sm:p-10 rounded-2xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#c9b3a0]">
            Our Mission
          </span>
          <h3 className="font-serif font-bold text-2xl text-white">
            Demystifying Land Ownership in Abuja
          </h3>
          <p className="text-xs sm:text-sm text-[#E8DED3]/80 leading-relaxed">
            To provide transparent, verified, and unencumbered land and property opportunities in the Federal Capital Territory, empowering families, first-time land buyers, and strategic investors to own and build with confidence.
          </p>
        </div>

        <div className="bg-white border border-[#E8DED3] p-8 sm:p-10 rounded-2xl space-y-3 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#795548]">
            Our Vision
          </span>
          <h3 className="font-serif font-bold text-2xl text-[#171717]">
            The Most Trusted Property Brand in the FCT
          </h3>
          <p className="text-xs sm:text-sm text-[#4E342E]/80 leading-relaxed">
            To set the benchmark for integrity, title transparency, and professional due diligence across the Nigerian real estate landscape.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-white rounded-2xl border border-[#E8DED3] p-8 sm:p-10 space-y-6 shadow-xs">
        <div className="space-y-2 border-b border-[#E8DED3] pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
            What Defines Us
          </span>
          <h3 className="font-serif font-bold text-2xl text-[#171717]">
            Our Core Operating Values
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-base text-[#171717]">
              01. Integrity
            </h4>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              We present facts as they exist in cadastral records without embellishment or hidden encumbrances.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-base text-[#171717]">
              02. Transparency
            </h4>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Clear disclosure of documentation status, exact beacon locations, and applicable development fees.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-base text-[#171717]">
              03. Due Diligence
            </h4>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Every parcel is checked against floodplains, green verge reservations, and master plan alignments.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-base text-[#171717]">
              04. Client Partnership
            </h4>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              We support you through title transfers, physical site handover, and building consultations.
            </p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="font-serif font-bold text-2xl text-[#171717]">
          Connect With Our Property Advisors in Abuja
        </h3>
        <p className="text-sm text-[#6B6B6B] max-w-md mx-auto">
          Visit our Central Business District office or request an appointment for a guided site inspection.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors"
        >
          <span>Get in Touch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
