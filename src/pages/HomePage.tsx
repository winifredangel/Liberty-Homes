import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  ShieldCheck,
  MapPin,
  Layers,
  ArrowRight,
  Building,
  CheckCircle2,
  TrendingUp,
  Users,
  Film,
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { PropertyCard } from '../components/property/PropertyCard';
import { Property } from '../types';
import { getProperties } from '../lib/supabase';

export interface LuxuryHouseTour {
  id: string;
  name: string;
  district: string;
  specs: string;
  tagline: string;
  youtubeId: string;
}

export const LUXURY_HOUSE_TOURS: LuxuryHouseTour[] = [
  {
    id: 'house-1',
    name: 'Katampe Glass Pavilion',
    district: 'Katampe Extension, Abuja',
    specs: '6 Beds • 7 Baths • Private Infinity Pool • 1,200 SQM Plot',
    tagline: 'Modern Architectural Villa with Panoramic Abuja Valley Views',
    youtubeId: 'RPfkwSTkOBk',
  },
  {
    id: 'house-2',
    name: 'Guzape Mediterranean Grand Villa',
    district: 'Guzape Diplomatic Zone, Abuja',
    specs: '7 Beds • 8 Baths • Multi-Level Terraces • 1,500 SQM Plot',
    tagline: 'European-Inspired Luxury Estate Crafted with Hand-Chiseled Stone',
    youtubeId: 'WALPs_3gkUg',
  },
  {
    id: 'house-3',
    name: 'Maitama Biophilic Modern Mansion',
    district: 'Maitama District, Abuja',
    specs: '5 Beds • 6 Baths • Glass Courtyard & Smart Automation',
    tagline: 'Ultra-Contemporary Architecture with Indoor-Outdoor Zen Courtyard',
    youtubeId: 'kUg-rhX84QE',
  },
  {
    id: 'house-4',
    name: 'Asokoro Horizon Hilltop Estate',
    district: 'Asokoro Extension, Abuja',
    specs: '8 Beds • 10 Baths • Private Helipad Access & Rooftop Lounge',
    tagline: 'High-Elevation Presidential Luxury Residence with Unobstructed Vistas',
    youtubeId: '0NRxMHHjGpQ',
  },
];

interface HomePageProps {
  onInquire: (property?: Property) => void;
  onToggleCompare: (property: Property) => void;
  comparedIds: string[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onInquire,
  onToggleCompare,
  comparedIds,
}) => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedHouseIndex, setSelectedHouseIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [heroMode, setHeroMode] = useState<'video' | 'aerial'>('video');
  const navigate = useNavigate();

  const currentHouse = LUXURY_HOUSE_TOURS[selectedHouseIndex];

  useEffect(() => {
    async function loadFeatured() {
      setLoading(true);
      try {
        const props = await getProperties();
        // Public users only see published
        const published = props.filter(
          (p) => p.listing_status === 'published' && p.is_featured
        );
        setFeaturedProperties(published.length > 0 ? published : props.slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured properties:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (district !== 'all') params.set('district', district);
    if (propertyType !== 'all') params.set('type', propertyType);
    if (maxPrice) params.set('maxPrice', maxPrice);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden border-b border-[#E8DED3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Search Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-semibold tracking-widest uppercase text-[#795548] block">
                  Abuja Prime Land & Property Investment
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-serif font-bold text-[#171717] tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
                  WHERE YOUR DREAM HOME BEGINS
                </h1>
                <p className="text-base sm:text-lg text-[#4E342E]/80 leading-relaxed max-w-xl">
                  Discover land opportunities in Abuja and take the next step toward building, owning, or investing in property with Liberty Homes.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/properties"
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  Explore Properties
                </Link>
                <button
                  onClick={() => onInquire()}
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#4E342E] bg-white border border-[#E8DED3] hover:border-[#795548] rounded-lg transition-colors whitespace-nowrap"
                >
                  Talk to Our Team
                </button>
              </div>

              {/* Real Search Form querying Supabase records */}
              <div className="pt-4">
                <form
                  onSubmit={handleHeroSearch}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DED3] shadow-sm space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4E342E] mb-1">
                        District / Location
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
                      >
                        <option value="all">All Abuja Districts</option>
                        <option value="Katampe Extension">Katampe Extension</option>
                        <option value="Guzape">Guzape</option>
                        <option value="Jahi">Jahi</option>
                        <option value="Airport Road Corridor">Airport Road Corridor</option>
                        <option value="Maitama">Maitama</option>
                        <option value="Wuye">Wuye</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4E342E] mb-1">
                        Property Type
                      </label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
                      >
                        <option value="all">All Types</option>
                        <option value="Residential Land">Residential Land</option>
                        <option value="Commercial Land">Commercial Land</option>
                        <option value="Serviced Plot">Serviced Plot</option>
                        <option value="Mixed Use">Mixed Use</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4E342E] mb-1">
                        Max Budget (NGN)
                      </label>
                      <select
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
                      >
                        <option value="">Any Budget</option>
                        <option value="50000000">Up to ₦50 Million</option>
                        <option value="100000000">Up to ₦100 Million</option>
                        <option value="150000000">Up to ₦150 Million</option>
                        <option value="250000000">Up to ₦250 Million</option>
                        <option value="400000000">Up to ₦400 Million</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#6B6B6B]">
                      Verified FCDA allocations & cadastral surveys only
                    </span>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search Plots</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Hero Video Showcase of Different Luxurious Houses */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-[#E8DED3] overflow-hidden shadow-lg">
                {/* Header bar with Mode Toggles */}
                <div className="px-4 py-3 bg-[#171717] text-white flex items-center justify-between border-b border-[#4E342E]/50">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8DED3] flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-[#c9b3a0]" />
                      <span>Luxury House Tour</span>
                    </span>
                    <span className="text-[10px] text-[#E8DED3]/60 hidden sm:inline">
                      ({selectedHouseIndex + 1}/4)
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setHeroMode('video')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                        heroMode === 'video'
                          ? 'bg-[#795548] text-white shadow-xs'
                          : 'text-[#E8DED3]/80 hover:text-white'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroMode('aerial')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                        heroMode === 'aerial'
                          ? 'bg-[#795548] text-white shadow-xs'
                          : 'text-[#E8DED3]/80 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Aerial Plot</span>
                    </button>
                  </div>
                </div>

                {/* Main Media Player Viewport */}
                {heroMode === 'video' ? (
                  <div className="relative aspect-video w-full bg-black overflow-hidden group">
                    <iframe
                      key={currentHouse.id}
                      src={`https://www.youtube-nocookie.com/embed/${currentHouse.youtubeId}?autoplay=1&mute=${
                        isMuted ? '1' : '0'
                      }&loop=1&playlist=${currentHouse.youtubeId}&controls=1&rel=0&modestbranding=1`}
                      title={currentHouse.name}
                      className="w-full h-full object-cover"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />

                    {/* Quick Sound Toggle overlay */}
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute top-3 right-3 bg-black/75 hover:bg-black text-white p-2 rounded-full text-xs transition-colors backdrop-blur-xs flex items-center gap-1.5 shadow-md border border-white/20"
                      title={isMuted ? 'Click to Unmute Audio' : 'Mute Audio'}
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-[10px] pr-1">Muted</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-[10px] pr-1">Sound On</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src="/src/assets/images/hero_abuja_land_1793003669625.jpg"
                      alt="Scenic Abuja hillside land development and villas"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 inset-x-4 text-white">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#E8DED3] block">
                        Cadastral Zone Development
                      </span>
                      <h4 className="text-sm font-serif font-bold">
                        Verified Hillside & Valley Enclaves in Abuja
                      </h4>
                    </div>
                  </div>
                )}

                {/* House Details & Specs */}
                <div className="p-4 sm:p-5 space-y-3 bg-[#F8F6F3]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#795548] font-semibold">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{currentHouse.district}</span>
                      </div>
                      <h3 className="text-base font-serif font-bold text-[#171717] mt-0.5 leading-snug">
                        {currentHouse.name}
                      </h3>
                      <p className="text-xs text-[#6B6B6B] mt-0.5">
                        {currentHouse.specs}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onInquire()}
                      className="shrink-0 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors whitespace-nowrap"
                    >
                      Build This
                    </button>
                  </div>

                  <p className="text-xs text-[#4E342E]/90 italic border-l-2 border-[#795548] pl-2.5 py-0.5">
                    "{currentHouse.tagline}"
                  </p>

                  {/* House Switcher Tabs: Browse 4 Different Luxurious Houses */}
                  <div className="pt-2 border-t border-[#E8DED3]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#171717] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#795548]" />
                        <span>Select Luxury House Design:</span>
                      </span>
                      <span className="text-[10px] text-[#6B6B6B]">
                        Click to view walkthrough
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {LUXURY_HOUSE_TOURS.map((house, idx) => {
                        const isSelected = selectedHouseIndex === idx;
                        return (
                          <button
                            key={house.id}
                            type="button"
                            onClick={() => {
                              setSelectedHouseIndex(idx);
                              setHeroMode('video');
                            }}
                            className={`text-left p-2 rounded-lg border text-xs transition-all ${
                              isSelected
                                ? 'bg-white border-[#795548] shadow-xs ring-1 ring-[#795548]'
                                : 'bg-white/60 border-[#E8DED3] hover:bg-white hover:border-[#795548]/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider ${
                                  isSelected ? 'text-[#795548]' : 'text-[#6B6B6B]'
                                }`}
                              >
                                House {idx + 1}
                              </span>
                              {isSelected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#795548]" />
                              )}
                            </div>
                            <div className="font-semibold text-[#171717] truncate text-[11px] mt-0.5">
                              {house.name}
                            </div>
                            <div className="text-[10px] text-[#6B6B6B] truncate">
                              {house.district.split(',')[0]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E8DED3] p-8 sm:p-12 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#795548]">
                About Liberty Homes
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717] leading-snug">
                Transparent Land Acquisitions Across the Federal Capital Territory
              </h2>
            </div>
            <div className="md:col-span-7 space-y-4 text-sm text-[#4E342E]/80 leading-relaxed border-t md:border-t-0 md:border-l border-[#E8DED3] md:pl-8 pt-4 md:pt-0">
              <p>
                At Liberty Homes, we assist individuals, corporate investors, and Nigerians in the diaspora to secure verifiable land opportunities in Abuja. We focus exclusively on vetted parcels free from customary encumbrances, backed by transparent cadastral documentation.
              </p>
              <p>
                Whether you are acquiring a serviced plot for immediate residential construction in Katampe Extension or seeking strategic land banking along the emerging Airport Road growth corridor, our advisory team provides verified facts and clear guidance at every step.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#171717] font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                  <span>Verified FCDA & Cadastral Records</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                  <span>Physical Beacon Inspections</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                  <span>Transparent Transaction Guidance</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8DED3] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#795548] block">
              Curated Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
              Featured Abuja Properties
            </h2>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#4E342E] hover:text-[#795548] transition-colors py-1"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-[#E8DED3] h-96 animate-pulse p-4 space-y-4">
                <div className="bg-[#E8DED3]/60 aspect-video rounded-lg" />
                <div className="h-4 bg-[#E8DED3]/60 rounded w-3/4" />
                <div className="h-4 bg-[#E8DED3]/60 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-[#E8DED3] p-8">
            <p className="text-sm text-[#6B6B6B]">No featured properties currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.slice(0, 3).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onInquire={(p) => onInquire(p)}
                onToggleCompare={onToggleCompare}
                isCompared={comparedIds.includes(property.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* CORE SERVICES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#795548] block">
            Comprehensive Real Estate Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
            Our Four Dedicated Pillars
          </h2>
          <p className="text-sm text-[#4E342E]/80">
            Professional real estate advisory, resale coordination, and development management tailored to the Abuja property landscape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Service 1: Land Banking */}
          <div className="bg-white rounded-xl border border-[#E8DED3] p-6 flex flex-col justify-between space-y-4 hover:border-[#795548]/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#E8DED3]/50 text-[#795548] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#171717]">
                Land Banking
              </h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Help clients explore land acquisition opportunities for potential long-term capital appreciation, without guaranteeing returns.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onInquire()}
                className="w-full py-2 text-xs font-semibold text-[#4E342E] bg-[#F8F6F3] hover:bg-[#E8DED3] rounded transition-colors"
              >
                Inquire on Land Banking
              </button>
            </div>
          </div>

          {/* Service 2: Property Resale */}
          <div className="bg-white rounded-xl border border-[#E8DED3] p-6 flex flex-col justify-between space-y-4 hover:border-[#795548]/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#E8DED3]/50 text-[#795548] rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#171717]">
                Property Resale
              </h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Allow eligible property owners to submit their properties for review, cadastral verification, and structured resale marketing.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/services#property-resale"
                className="block text-center w-full py-2 text-xs font-semibold text-[#4E342E] bg-[#F8F6F3] hover:bg-[#E8DED3] rounded transition-colors"
              >
                Submit Plot for Resale
              </Link>
            </div>
          </div>

          {/* Service 3: Construction & Building */}
          <div className="bg-white rounded-xl border border-[#E8DED3] p-6 flex flex-col justify-between space-y-4 hover:border-[#795548]/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#E8DED3]/50 text-[#795548] rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#171717]">
                Construction & Building
              </h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Provide a channel for customers to request construction consultations, architectural design reviews, and building project management.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/services#construction"
                className="block text-center w-full py-2 text-xs font-semibold text-[#4E342E] bg-[#F8F6F3] hover:bg-[#E8DED3] rounded transition-colors"
              >
                Request Consultation
              </Link>
            </div>
          </div>

          {/* Service 4: Survey & Planning */}
          <div className="bg-white rounded-xl border border-[#E8DED3] p-6 flex flex-col justify-between space-y-4 hover:border-[#795548]/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#E8DED3]/50 text-[#795548] rounded-lg flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#171717]">
                Survey & Planning
              </h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Provide a channel for surveying coordination and town-planning inquiries, subject to the direct involvement of licensed surveying professionals.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/services#survey-planning"
                className="block text-center w-full py-2 text-xs font-semibold text-[#4E342E] bg-[#F8F6F3] hover:bg-[#E8DED3] rounded transition-colors"
              >
                Inquire on Surveying
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE LIBERTY HOMES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#4E342E] text-white rounded-2xl p-8 sm:p-12 lg:p-16 space-y-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#c9b3a0] block">
              Professional Integrity
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-snug">
              Why Discerning Buyers Choose Liberty Homes
            </h2>
            <p className="text-sm text-[#E8DED3]/80 leading-relaxed">
              We eliminate ambiguity in Nigerian real estate transactions with rigorous verification protocols, direct cadastral checks, and dedicated client service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            <div className="space-y-2 border-t border-[#795548] pt-4">
              <h4 className="font-serif font-semibold text-base text-white">
                01. Rigorous Due Diligence
              </h4>
              <p className="text-xs text-[#E8DED3]/70 leading-relaxed">
                Every listed property undergoes physical beacon verification and statutory documentation examination to ensure unencumbered freehold or leasehold status.
              </p>
            </div>

            <div className="space-y-2 border-t border-[#795548] pt-4">
              <h4 className="font-serif font-semibold text-base text-white">
                02. Transparent Title Information
              </h4>
              <p className="text-xs text-[#E8DED3]/70 leading-relaxed">
                We clearly disclose whether a parcel carries a Certificate of Occupancy (C of O), Right of Occupancy (R of O), or FCDA allocation before any commitment is made.
              </p>
            </div>

            <div className="space-y-2 border-t border-[#795548] pt-4">
              <h4 className="font-serif font-semibold text-base text-white">
                03. Comprehensive Client Support
              </h4>
              <p className="text-xs text-[#E8DED3]/70 leading-relaxed">
                From guided physical site inspections in Abuja to legal conveyancing assistance and diaspora coordination, our team stays with you throughout the journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="bg-white rounded-2xl border border-[#E8DED3] p-8 sm:p-12 space-y-4 shadow-xs max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#795548] block">
            Take The Next Step
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
            Ready to Inspect Prime Land in Abuja?
          </h2>
          <p className="text-sm text-[#4E342E]/80 max-w-xl mx-auto leading-relaxed">
            Schedule an accompanied site inspection with our land advisory specialists or request cadastral survey coordinates today.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onInquire()}
              className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors shadow-sm"
            >
              Book Physical Viewing
            </button>
            <Link
              to="/contact"
              className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#4E342E] bg-[#F8F6F3] border border-[#E8DED3] hover:border-[#795548] rounded-lg transition-colors"
            >
              Contact Abuja Office
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
