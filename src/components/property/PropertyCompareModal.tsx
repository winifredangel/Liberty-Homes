import React from 'react';
import { X, ArrowRight, Check, Trash2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Property } from '../../types';

interface PropertyCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const PropertyCompareModal: React.FC<PropertyCompareModalProps> = ({
  isOpen,
  onClose,
  properties,
  onRemove,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#F8F6F3] rounded-2xl border border-[#E8DED3] max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DED3]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
              Liberty Homes Comparison
            </span>
            <h3 className="text-xl font-serif font-bold text-[#171717]">
              Compare Abuja Land Plots ({properties.length}/3)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {properties.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-[#C62828] hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#6B6B6B] hover:text-[#171717] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-sm text-[#6B6B6B]">
              No properties selected for comparison yet. Click the comparison icon on any property card to compare features.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] rounded-lg"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="pt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-xs uppercase tracking-wider text-[#6B6B6B] font-semibold w-1/4">
                    Specification
                  </th>
                  {properties.map((prop) => (
                    <th key={prop.id} className="p-3 w-1/4 align-top">
                      <div className="space-y-2">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-[#E8DED3]">
                          <img
                            src={prop.cover_image_path}
                            alt={prop.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => onRemove(prop.id)}
                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-xs font-serif font-bold text-[#171717] line-clamp-1">
                          {prop.title}
                        </h4>
                        <Link
                          to={`/properties/${prop.slug}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#795548] hover:underline"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DED3] text-xs text-[#171717]">
                <tr>
                  <td className="p-3 font-medium text-[#6B6B6B]">Price (NGN)</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-3 font-bold text-[#4E342E] tabular-nums">
                      {formatPrice(p.price)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[#6B6B6B]">District</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-3">
                      <div className="flex items-center gap-1 text-[#4E342E]">
                        <MapPin className="w-3 h-3 text-[#795548]" />
                        <span>{p.district}</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[#6B6B6B]">Land Size</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-3 tabular-nums font-medium">
                      {p.land_size} {p.land_size_unit}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[#6B6B6B]">Price / Sqm</td>
                  {properties.map((p) => {
                    const pricePerSqm = Math.round(p.price / p.land_size);
                    return (
                      <td key={p.id} className="p-3 tabular-nums text-[#6B6B6B]">
                        ₦{pricePerSqm.toLocaleString()} / sqm
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[#6B6B6B]">Property Type</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-3 font-medium">
                      {p.property_type}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[#6B6B6B]">Title Documentation</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-3 text-[#2E7D32] font-medium">
                      {p.documentation_status}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-medium text-[#6B6B6B]">Key Infrastructure</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-3 space-y-1">
                      {p.infrastructure_features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-1 text-[11px] text-[#4E342E]">
                          <Check className="w-3 h-3 text-[#2E7D32] shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
