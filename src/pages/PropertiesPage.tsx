import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, LayoutGrid, List, SlidersHorizontal, MapPin } from 'lucide-react';
import { PropertyCard } from '../components/property/PropertyCard';
import { Property, PropertyFilterState } from '../types';
import { getProperties } from '../lib/supabase';

interface PropertiesPageProps {
  onInquire: (property: Property) => void;
  onToggleCompare: (property: Property) => void;
  comparedIds: string[];
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({
  onInquire,
  onToggleCompare,
  comparedIds,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters State initialized from search params if present
  const [filters, setFilters] = useState<PropertyFilterState>({
    keyword: searchParams.get('kw') || '',
    district: searchParams.get('district') || 'all',
    propertyType: searchParams.get('type') || 'all',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : '',
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : '',
    minLandSize: '',
    maxLandSize: '',
    availability: 'all',
    sortBy: 'newest',
  });

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        const data = await getProperties(filters);
        // Public users only see published properties
        const publishedOnly = data.filter((p) => p.listing_status === 'published');
        setProperties(publishedOnly);
      } catch (err) {
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      district: 'all',
      propertyType: 'all',
      minPrice: '',
      maxPrice: '',
      minLandSize: '',
      maxLandSize: '',
      availability: 'all',
      sortBy: 'newest',
    });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 border-b border-[#E8DED3] pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
          Abuja Real Estate Portfolio
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171717]">
            Available Land & Properties
          </h1>
          <p className="text-xs text-[#6B6B6B]">
            Showing <strong className="text-[#171717] tabular-nums">{properties.length}</strong> published parcels in Abuja
          </p>
        </div>
      </div>

      {/* Main Filter Bar & Controls */}
      <div className="bg-white rounded-xl border border-[#E8DED3] p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input & Quick Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, location, landmark, or description..."
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#795548]" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="size_desc">Land Size: Largest First</option>
            </select>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-1 bg-[#F8F6F3] p-1 rounded-lg border border-[#E8DED3]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-[#4E342E]' : 'text-[#6B6B6B]'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-xs text-[#4E342E]' : 'text-[#6B6B6B]'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Filters (Always visible on desktop, toggleable on mobile) */}
        <div className={`${showMobileFilters ? 'block' : 'hidden sm:block'} pt-3 border-t border-[#E8DED3]`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* District */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#4E342E] mb-1">
                Abuja District
              </label>
              <select
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
              >
                <option value="all">All Districts</option>
                <option value="Katampe Extension">Katampe Extension</option>
                <option value="Guzape">Guzape</option>
                <option value="Jahi">Jahi</option>
                <option value="Airport Road Corridor">Airport Road Corridor</option>
                <option value="Maitama">Maitama</option>
                <option value="Wuye">Wuye</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#4E342E] mb-1">
                Property Type
              </label>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="Residential Land">Residential Land</option>
                <option value="Commercial Land">Commercial Land</option>
                <option value="Serviced Plot">Serviced Plot</option>
                <option value="Mixed Use">Mixed Use</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#4E342E] mb-1">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg"
              >
                <option value="all">All Availability</option>
                <option value="available">Available Now</option>
                <option value="under_offer">Under Offer</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#4E342E] mb-1">
                Min Price (NGN)
              </label>
              <input
                type="number"
                placeholder="e.g. 30,000,000"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : '' })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg tabular-nums"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#4E342E] mb-1">
                Max Price (NGN)
              </label>
              <input
                type="number"
                placeholder="e.g. 200,000,000"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : '' })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg tabular-nums"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-3">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-[#795548] hover:text-[#4E342E] font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Property Results List / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E8DED3] h-80 animate-pulse p-4 space-y-4">
              <div className="bg-[#E8DED3]/60 aspect-video rounded-lg" />
              <div className="h-4 bg-[#E8DED3]/60 rounded w-2/3" />
              <div className="h-3 bg-[#E8DED3]/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E8DED3] p-8 space-y-4 max-w-lg mx-auto">
          <Filter className="w-10 h-10 text-[#c9b3a0] mx-auto" />
          <h3 className="text-lg font-serif font-bold text-[#171717]">
            No Matching Properties Found
          </h3>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            We could not find any active listings matching your current filter criteria. Try adjusting the district or price parameters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] rounded-lg"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onInquire={onInquire}
              onToggleCompare={onToggleCompare}
              isCompared={comparedIds.includes(property.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
