import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ChevronLeft, Building2 } from 'lucide-react';

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4E342E] hover:text-[#795548]"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-3 border-b border-[#E8DED3] pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
          Statutory Disclosure
        </span>
        <h1 className="text-3xl font-serif font-bold text-[#171717]">
          Property & Investment Disclaimer
        </h1>
        <p className="text-xs text-[#6B6B6B]">
          Mandatory disclosure regarding land titles, cadastral boundaries, and investment returns in Abuja, FCT.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-[#E8DED3] space-y-6 text-sm text-[#4E342E]/90 leading-relaxed shadow-xs">
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#795548] shrink-0 mt-0.5" />
          <p className="text-xs text-[#171717] leading-relaxed">
            <strong>Notice to All Buyers:</strong> Real estate acquisitions in the Federal Capital Territory require independent due diligence. Liberty Homes conducts rigorous preliminary reviews; however, all buyers are advised to conduct their own independent legal searches at the Abuja Geographic Information Systems (AGIS) and relevant Area Council departments.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-lg text-[#171717]">1. Documentation Verification</h2>
          <p>
            Documentation details displayed on property listings (such as Certificate of Occupancy, Right of Occupancy, or FCDA Direct Allocation) represent the status communicated by verified records. Prospective purchasers should engage qualified legal practitioners to review the title chain and root of title before completing payment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-lg text-[#171717]">2. Land Banking & Speculative Returns</h2>
          <p>
            Property values in Abuja historically appreciate, particularly across expanding infrastructure corridors. However, Liberty Homes does not make any guaranteed projections, rate-of-return promises, or speculative buyback warranties. Land banking involves holding property subject to market forces and broader economic factors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-lg text-[#171717]">3. Survey Beacons & Boundary Coordinates</h2>
          <p>
            Survey beacon identifiers and plot coordinates published on listings are obtained from official layout drawings. Buyers are encouraged to engage licensed registered surveyors (SURCON) during physical site inspections to confirm physical beacon positions in relation to cadastral boundary pillars.
          </p>
        </section>
      </div>
    </div>
  );
};
