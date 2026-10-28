import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
          Terms of Engagement
        </span>
        <h1 className="text-3xl font-serif font-bold text-[#171717]">
          Terms and Conditions
        </h1>
        <p className="text-xs text-[#6B6B6B]">
          Governing Real Estate Advisory & Website Use | Federal Capital Territory, Nigeria
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-[#E8DED3] space-y-6 text-sm text-[#4E342E]/90 leading-relaxed shadow-xs">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-lg text-[#171717]">1. Website Purpose & Scope</h2>
          <p>
            The Liberty Homes website presents verified land, plot, and property investment opportunities located within the Federal Capital Territory, Abuja. Content published on this platform is for informational and advisory guidance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-lg text-[#171717]">2. Property Listings & Availability</h2>
          <p>
            Property listings are updated regularly. However, plot availability is subject to prior commitment, reservation, or formal contract closure. A listing's presence on the website does not constitute a legally binding contractual offer until formal documentation is finalized with Liberty Homes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-lg text-[#171717]">3. Site Inspection & Viewing Protocol</h2>
          <p>
            Physical site inspections must be scheduled and accompanied by an authorized Liberty Homes representative. Customers agree to respect perimeter boundary markers and obey safety directives during on-site visits.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-lg text-[#171717]">4. Independent Legal & Cadastral Verification</h2>
          <p>
            Prospective purchasers are responsible for satisfying themselves with respect to the title status, AGIS land registry records, and town-planning zonings prior to entering into contracts for sale.
          </p>
        </section>
      </div>
    </div>
  );
};
