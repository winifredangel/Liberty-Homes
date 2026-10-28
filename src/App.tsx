/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { InquiryModal } from './components/common/InquiryModal';
import { ErrorReportModal } from './components/common/ErrorReportModal';
import { PropertyCompareModal } from './components/property/PropertyCompareModal';
import { SavedPropertiesModal } from './components/property/SavedPropertiesModal';
import { AuthProvider } from './context/AuthContext';
import { Property } from './types';
import { getProperties, getSavedPropertyIds, initLocalStore } from './lib/supabase';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  // Global Modals State
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedPropertyForInquiry, setSelectedPropertyForInquiry] = useState<Property | null>(null);
  const [errorReportModalOpen, setErrorReportModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [savedModalOpen, setSavedModalOpen] = useState(false);

  // Compare and Saved lists
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);

  useEffect(() => {
    initLocalStore();
    async function loadProps() {
      const list = await getProperties();
      setAllProperties(list);
    }
    loadProps();
  }, []);

  const handleOpenInquiry = (prop?: Property) => {
    setSelectedPropertyForInquiry(prop || null);
    setInquiryModalOpen(true);
  };

  const handleToggleCompare = (property: Property) => {
    setComparedProperties((prev) => {
      const exists = prev.some((p) => p.id === property.id);
      if (exists) {
        return prev.filter((p) => p.id !== property.id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 properties at a time.');
          return prev;
        }
        return [...prev, property];
      }
    });
  };

  const savedPropertyIds = getSavedPropertyIds();
  const savedPropertiesList = allProperties.filter((p) => savedPropertyIds.includes(p.id));

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#F8F6F3] text-[#171717]">
          {/* Top Navbar */}
          <Navbar onOpenSavedModal={() => setSavedModalOpen(true)} />

          {/* Floating Comparison Drawer Indicator when items selected */}
          {comparedProperties.length > 0 && (
            <div className="fixed bottom-6 right-6 z-40 bg-[#4E342E] text-white px-4 py-3 rounded-xl shadow-xl border border-[#795548] flex items-center gap-3">
              <span className="text-xs font-medium">
                Comparing <strong className="text-white">{comparedProperties.length}</strong> plot{comparedProperties.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setCompareModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#795548] hover:bg-[#68483d] rounded-lg transition-colors"
              >
                View Comparison
              </button>
            </div>
          )}

          {/* Main Routing View */}
          <main className="flex-1">
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    onInquire={handleOpenInquiry}
                    onToggleCompare={handleToggleCompare}
                    comparedIds={comparedProperties.map((p) => p.id)}
                  />
                }
              />
              <Route
                path="/properties"
                element={
                  <PropertiesPage
                    onInquire={handleOpenInquiry}
                    onToggleCompare={handleToggleCompare}
                    comparedIds={comparedProperties.map((p) => p.id)}
                  />
                }
              />
              <Route
                path="/properties/:slug"
                element={
                  <PropertyDetailPage
                    onInquire={handleOpenInquiry}
                    onToggleCompare={handleToggleCompare}
                    comparedIds={comparedProperties.map((p) => p.id)}
                  />
                }
              />
              <Route path="/services" element={<ServicesPage onInquire={() => handleOpenInquiry()} />} />
              <Route path="/about" element={<AboutPage />} />
              <Route
                path="/contact"
                element={<ContactPage onOpenErrorReport={() => setErrorReportModalOpen(true)} />}
              />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer onOpenErrorReport={() => setErrorReportModalOpen(true)} />

          {/* Interactive Modals */}
          <InquiryModal
            isOpen={inquiryModalOpen}
            onClose={() => setInquiryModalOpen(false)}
            property={selectedPropertyForInquiry}
          />

          <ErrorReportModal
            isOpen={errorReportModalOpen}
            onClose={() => setErrorReportModalOpen(false)}
          />

          <PropertyCompareModal
            isOpen={compareModalOpen}
            onClose={() => setCompareModalOpen(false)}
            properties={comparedProperties}
            onRemove={(id) => setComparedProperties((prev) => prev.filter((p) => p.id !== id))}
            onClearAll={() => setComparedProperties([])}
          />

          <SavedPropertiesModal
            isOpen={savedModalOpen}
            onClose={() => setSavedModalOpen(false)}
            properties={savedPropertiesList}
            onRemove={(id) => {
              setAllProperties([...allProperties]);
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
