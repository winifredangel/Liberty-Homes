import React from 'react';
import { X, Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Property } from '../../types';
import { toggleSavedPropertyId } from '../../lib/supabase';

interface SavedPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onRemove: (id: string) => void;
}

export const SavedPropertiesModal: React.FC<SavedPropertiesModalProps> = ({
  isOpen,
  onClose,
  properties,
  onRemove,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
      <div className="bg-[#F8F6F3] w-full max-w-md h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DED3]">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#795548]" />
            <h3 className="font-serif font-bold text-lg text-[#171717]">
              Saved Properties ({properties.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B6B6B] hover:text-[#171717] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <Bookmark className="w-12 h-12 text-[#c9b3a0]" />
            <p className="text-sm font-medium text-[#4E342E]">No saved properties yet</p>
            <p className="text-xs text-[#6B6B6B]">
              Bookmark plots you want to compare or review later as you explore Abuja listings.
            </p>
          </div>
        ) : (
          <div className="flex-1 py-4 space-y-3 overflow-y-auto">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white p-3 rounded-xl border border-[#E8DED3] flex items-center gap-3 relative group"
              >
                <img
                  src={prop.cover_image_path}
                  alt={prop.title}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-serif font-bold text-[#171717] truncate">
                    {prop.title}
                  </h4>
                  <p className="text-[11px] text-[#6B6B6B] truncate">{prop.district}, Abuja</p>
                  <p className="text-xs font-semibold text-[#4E342E] tabular-nums">
                    ₦{prop.price.toLocaleString()}
                  </p>
                  <Link
                    to={`/properties/${prop.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[11px] text-[#795548] font-medium hover:underline mt-1"
                  >
                    <span>View Plot</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <button
                  onClick={() => {
                    toggleSavedPropertyId(prop.id);
                    onRemove(prop.id);
                  }}
                  className="p-1.5 text-[#6B6B6B] hover:text-[#C62828] rounded transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-[#E8DED3]">
          <Link
            to="/properties"
            onClick={onClose}
            className="w-full block text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors"
          >
            Explore More Properties
          </Link>
        </div>
      </div>
    </div>
  );
};
