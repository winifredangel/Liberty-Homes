import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Bookmark, PhoneCall } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSavedPropertyIds } from '../../lib/supabase';

interface NavbarProps {
  onOpenSavedModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSavedModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const savedCount = getSavedPropertyIds().length;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F3]/95 backdrop-blur-md border-b border-[#E8DED3] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Zone 1: Brand Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0 hover:opacity-95 transition-opacity"
            aria-label="Liberty Homes - Where Your Dream Home Begins"
          >
            <img
              src="https://i.ibb.co/F4f06vdS/logo.png"
              alt="Liberty Homes"
              referrerPolicy="no-referrer"
              className="h-11 sm:h-12 w-auto object-contain"
              onError={(e) => {
                // Resilient local asset fallback
                e.currentTarget.src = '/src/assets/images/logo.png';
              }}
            />
          </Link>

          {/* Zone 2: Navigation Links (Single-line prose, clean typographic hover) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4E342E]/80">
            <Link
              to="/"
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                isActive('/') && location.pathname === '/'
                  ? 'text-[#4E342E] font-semibold border-b-2 border-[#795548]'
                  : 'hover:text-[#4E342E]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/properties"
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                isActive('/properties')
                  ? 'text-[#4E342E] font-semibold border-b-2 border-[#795548]'
                  : 'hover:text-[#4E342E]'
              }`}
            >
              Properties
            </Link>
            <Link
              to="/services"
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                isActive('/services')
                  ? 'text-[#4E342E] font-semibold border-b-2 border-[#795548]'
                  : 'hover:text-[#4E342E]'
              }`}
            >
              Services
            </Link>
            <Link
              to="/about"
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                isActive('/about')
                  ? 'text-[#4E342E] font-semibold border-b-2 border-[#795548]'
                  : 'hover:text-[#4E342E]'
              }`}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                isActive('/contact')
                  ? 'text-[#4E342E] font-semibold border-b-2 border-[#795548]'
                  : 'hover:text-[#4E342E]'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Zone 3: Actions (Saved properties, Admin access & Primary CTA) */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {onOpenSavedModal && (
              <button
                onClick={onOpenSavedModal}
                className="relative p-2 text-[#4E342E] hover:text-[#795548] hover:bg-[#E8DED3]/40 rounded-lg transition-colors"
                title="Saved Properties"
                aria-label="View saved properties"
              >
                <Bookmark className="w-5 h-5" />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#795548] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                    {savedCount}
                  </span>
                )}
              </button>
            )}

            <Link
              to={user && isAdmin ? '/admin' : '/admin/login'}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                user && isAdmin
                  ? 'bg-[#E8DED3] text-[#4E342E] hover:bg-[#d8cdc1]'
                  : 'text-[#6B6B6B] hover:text-[#4E342E] hover:bg-[#E8DED3]/40'
              }`}
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{user && isAdmin ? 'Admin Desk' : 'Admin'}</span>
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Schedule Inspection</span>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/admin/login"
              className="p-2 text-[#4E342E] hover:bg-[#E8DED3]/50 rounded-lg"
              title="Admin Login"
            >
              <Shield className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#4E342E] hover:bg-[#E8DED3]/50 rounded-lg transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DED3] bg-[#F8F6F3] px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
              isActive('/') && location.pathname === '/'
                ? 'bg-[#E8DED3] text-[#4E342E]'
                : 'text-[#4E342E]/90 hover:bg-[#E8DED3]/50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
              isActive('/properties') ? 'bg-[#E8DED3] text-[#4E342E]' : 'text-[#4E342E]/90 hover:bg-[#E8DED3]/50'
            }`}
          >
            Properties in Abuja
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
              isActive('/services') ? 'bg-[#E8DED3] text-[#4E342E]' : 'text-[#4E342E]/90 hover:bg-[#E8DED3]/50'
            }`}
          >
            Our Services
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
              isActive('/about') ? 'bg-[#E8DED3] text-[#4E342E]' : 'text-[#4E342E]/90 hover:bg-[#E8DED3]/50'
            }`}
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
              isActive('/contact') ? 'bg-[#E8DED3] text-[#4E342E]' : 'text-[#4E342E]/90 hover:bg-[#E8DED3]/50'
            }`}
          >
            Contact & Location
          </Link>

          <div className="pt-3 border-t border-[#E8DED3] flex flex-col gap-2">
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors"
            >
              Schedule Site Viewing
            </Link>
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2 text-xs font-medium text-[#4E342E] bg-[#E8DED3]/60 rounded-lg hover:bg-[#E8DED3] transition-colors"
            >
              Administrator Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
