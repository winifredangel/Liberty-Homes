import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { submitErrorReport } from '../../lib/supabase';
import { ErrorSeverity } from '../../types';

interface ErrorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ErrorReportModal: React.FC<ErrorReportModalProps> = ({ isOpen, onClose }) => {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<ErrorSeverity>('medium');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pageUrl] = useState(window.location.href);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe the issue or error you encountered.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await submitErrorReport({
        page_url: pageUrl,
        issue_description: description.trim(),
        error_code: 'CLIENT_USER_REPORT',
        severity,
        reporter_name: name.trim() || undefined,
        reporter_email: email.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not submit error report.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#F8F6F3] rounded-2xl border border-[#E8DED3] max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-[#6B6B6B] hover:text-[#171717] rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-[#2E7D32]/10 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#171717]">
              Report Filed
            </h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Thank you for letting us know. The Liberty Homes technical team has logged this issue for investigation.
            </p>
            <div className="pt-3">
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E8DED3] pb-3">
              <AlertCircle className="w-5 h-5 text-[#C62828]" />
              <h3 className="text-lg font-serif font-bold text-[#171717]">
                Report Website Issue
              </h3>
            </div>

            <p className="text-xs text-[#6B6B6B]">
              Found a broken link, visual glitch, or inquiry form issue? Please describe it below so we can resolve it immediately.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#4E342E] mb-1">
                  Issue Description <span className="text-[#C62828]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened or what page element was not working..."
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4E342E] mb-1">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as ErrorSeverity)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DED3] rounded-lg focus:outline-hidden"
                >
                  <option value="low">Low (Cosmetic, minor typo)</option>
                  <option value="medium">Medium (Layout glitch, slow response)</option>
                  <option value="high">High (Broken button, submission failed)</option>
                  <option value="critical">Critical (Page crashed, inaccessible)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E8DED3] rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#4E342E] mb-1">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E8DED3] rounded"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2 text-xs text-[#C62828] bg-red-50 rounded">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors"
            >
              {loading ? 'Submitting...' : 'Send Error Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
