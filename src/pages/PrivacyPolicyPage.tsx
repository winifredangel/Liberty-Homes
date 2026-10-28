import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronLeft } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
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
          Legal & Compliance
        </span>
        <h1 className="text-3xl font-serif font-bold text-[#171717]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#6B6B6B]">
          Effective Date: October 2026 | Compliant with Nigeria Data Protection Regulation (NDPR)
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-[#E8DED3] space-y-6 text-sm text-[#4E342E]/90 leading-relaxed shadow-xs">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-lg text-[#171717]">1. Information We Collect</h2>
          <p>
            When you inquire about properties or submit viewing requests on the Liberty Homes website, we collect your name, email address, phone/WhatsApp number, and specific plot requirements. We also collect error reports and technical details when voluntarily submitted.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-lg text-[#171717]">2. How We Use Your Data</h2>
          <p>
            Your information is used exclusively to facilitate real estate advisory services, coordinate site inspections in Abuja, verify resale submissions, and respond to your direct inquiries. We do not sell, rent, or trade customer contact details with external third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-lg text-[#171717]">3. Data Security & Retention</h2>
          <p>
            Our systems utilize encrypted transmission protocols, strict Row Level Security (RLS) policies in PostgreSQL, and trusted administrative access controls to safeguard your data. We retain customer contact records only for the duration required to complete requested advisory and conveyancing services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-lg text-[#171717]">4. Your Privacy Rights</h2>
          <p>
            Under the NDPR and applicable Nigerian laws, you have the right to request access to, correction of, or deletion of your personal records stored by Liberty Homes. You may contact our Data Protection Officer at <strong>inquiries@libertyhomes.ng</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};
