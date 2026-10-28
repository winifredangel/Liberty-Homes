import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';

interface FooterProps {
  onOpenErrorReport?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenErrorReport }) => {
  return (
    <footer className="bg-[#171717] text-[#E8DED3] border-t border-[#4E342E]/40 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="https://i.ibb.co/F4f06vdS/logo.png"
                alt="Liberty Homes"
                referrerPolicy="no-referrer"
                className="h-10 w-auto object-contain brightness-0 invert opacity-95 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  e.currentTarget.src = '/src/assets/images/logo.png';
                }}
              />
            </Link>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#c9b3a0]">
              WHERE YOUR DREAM HOME BEGINS
            </p>
            <p className="text-sm text-[#E8DED3]/70 leading-relaxed">
              Specialists in verified land acquisitions, serviced plots, and strategic real estate investments across Abuja, Federal Capital Territory, Nigeria.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#E8DED3]/60">
              <ShieldCheck className="w-4 h-4 text-[#795548]" />
              <span>Verified Titles & Professional Due Diligence</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-white">
              Discover Abuja
            </h4>
            <ul className="space-y-2 text-sm text-[#E8DED3]/80">
              <li>
                <Link to="/properties" className="hover:text-white transition-colors">
                  All Properties
                </Link>
              </li>
              <li>
                <Link to="/properties?district=Katampe+Extension" className="hover:text-white transition-colors">
                  Katampe Extension Plots
                </Link>
              </li>
              <li>
                <Link to="/properties?district=Guzape" className="hover:text-white transition-colors">
                  Guzape Hillside Lands
                </Link>
              </li>
              <li>
                <Link to="/properties?district=Jahi" className="hover:text-white transition-colors">
                  Jahi Serviced Plots
                </Link>
              </li>
              <li>
                <Link to="/properties?district=Airport+Road+Corridor" className="hover:text-white transition-colors">
                  Airport Road Land Banking
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-white">
              Core Services
            </h4>
            <ul className="space-y-2 text-sm text-[#E8DED3]/80">
              <li>
                <Link to="/services#land-banking" className="hover:text-white transition-colors">
                  Land Banking
                </Link>
              </li>
              <li>
                <Link to="/services#property-resale" className="hover:text-white transition-colors">
                  Property Resale Assistance
                </Link>
              </li>
              <li>
                <Link to="/services#construction" className="hover:text-white transition-colors">
                  Construction & Building
                </Link>
              </li>
              <li>
                <Link to="/services#survey-planning" className="hover:text-white transition-colors">
                  Survey & Planning Coordination
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors text-xs text-[#c9b3a0]">
                  Administrator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-white">
              Abuja Headquarters
            </h4>
            <ul className="space-y-3 text-sm text-[#E8DED3]/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#795548] shrink-0 mt-0.5" />
                <span>No.17 Rufus Nduba Cresent, Dawaki, Abuja.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#795548] shrink-0" />
                <span>09160336411</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#795548] shrink-0" />
                <span>winifredmaduabuchi368@gmail.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#795548] shrink-0" />
                <a
                  href="https://wa.me/2349160336411"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c9b3a0] hover:underline"
                >
                  WhatsApp: 09160336411
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with legal & error report */}
        <div className="pt-8 border-t border-[#4E342E]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8DED3]/60">
          <p>© {new Date().getFullYear()} Liberty Homes. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/disclaimer" className="hover:text-white transition-colors">
              Property Disclaimer
            </Link>
            {onOpenErrorReport && (
              <button
                onClick={onOpenErrorReport}
                className="flex items-center gap-1.5 text-[#c9b3a0] hover:text-white transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Report Website Issue</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
