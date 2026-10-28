import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle2, ArrowUpRight, Scale } from 'lucide-react';
import { Property } from '../../types';
import { toggleSavedPropertyId, getSavedPropertyIds } from '../../lib/supabase';

interface PropertyCardProps {
  property: Property;
  onInquire?: (property: Property) => void;
  onToggleCompare?: (property: Property) => void;
  isCompared?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onInquire,
  onToggleCompare,
  isCompared = false,
}) => {
  const [isSaved, setIsSaved] = React.useState(getSavedPropertyIds().includes(property.id));

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const state = toggleSavedPropertyId(property.id);
    setIsSaved(state);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <article className="group bg-white rounded-xl border border-[#E8DED3] hover:border-[#795548]/40 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
      {/* Property Image Container */}
      <div className="relative aspect-[4/3] bg-[#E8DED3]/40 overflow-hidden">
        <img
          src={property.cover_image_path}
          alt={property.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Elegant CSS/SVG Fallback
            const target = e.currentTarget;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.classList.add(
                'bg-gradient-to-br',
                'from-[#E8DED3]',
                'to-[#c9b3a0]',
                'flex',
                'items-center',
                'justify-center'
              );
              const fallback = document.createElement('div');
              fallback.className = 'text-xs font-serif font-bold text-[#4E342E] tracking-wider uppercase';
              fallback.innerText = 'Liberty Homes • Abuja';
              target.parentElement.appendChild(fallback);
            }
          }}
        />

        {/* Status overlay (clean gradient scrim) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top bar over image */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white rounded">
            {property.district}
          </span>

          <div className="flex items-center gap-1.5">
            {onToggleCompare && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleCompare(property);
                }}
                className={`p-1.5 rounded backdrop-blur-sm transition-colors ${
                  isCompared
                    ? 'bg-[#795548] text-white'
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
                title={isCompared ? 'Remove from comparison' : 'Compare property'}
                aria-label="Compare property"
              >
                <Scale className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleSave}
              className={`p-1.5 rounded backdrop-blur-sm transition-colors ${
                isSaved
                  ? 'bg-[#795548] text-white'
                  : 'bg-black/50 hover:bg-black/70 text-white'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save property'}
              aria-label="Save property"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom price over image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
          <div className="font-semibold text-lg sm:text-xl font-sans tabular-nums tracking-tight">
            {formatPrice(property.price)}
          </div>
          <span className="text-xs uppercase tracking-wider text-[#E8DED3]">
            {property.availability_status === 'available'
              ? 'Available'
              : property.availability_status === 'under_offer'
              ? 'Under Offer'
              : 'Sold'}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Metadata without pills: clean unboxed typographic line */}
          <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
            <span className="font-medium text-[#4E342E]">{property.property_type}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-medium">
              {property.land_size} {property.land_size_unit}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{property.district}</span>
          </div>

          <h3 className="font-serif text-lg font-bold text-[#171717] group-hover:text-[#795548] transition-colors line-clamp-1 leading-snug">
            <Link to={`/properties/${property.slug}`}>{property.title}</Link>
          </h3>

          <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed">
            {property.description}
          </p>

          <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#2E7D32]">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium truncate">{property.documentation_status}</span>
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-3 border-t border-[#E8DED3]/60 flex items-center justify-between gap-2">
          <Link
            to={`/properties/${property.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4E342E] hover:text-[#795548] transition-colors py-1.5"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {onInquire && (
            <button
              onClick={() => onInquire(property)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#795548] hover:bg-[#4E342E] rounded transition-colors whitespace-nowrap"
            >
              Make Inquiry
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
