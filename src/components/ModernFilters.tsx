'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronDown, Target, MapPin, Building2, Zap, Star, 
  Globe, Clock, Send, TrendingUp
} from 'lucide-react';
import { useContractorStore } from '@/stores/contractorStore';

interface FilterStats {
  total: number;
  completion: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  categories: {
    other: number;
    roofing: number;
    hvac: number;
    remodeling: number;
    specialty: number;
    plumbing: number;
    exterior: number;
    electrical: number;
    suppliers: number;
    windowDoor: number;
  };
  speed: {
    high: number;
    medium: number;
    low: number;
  };
  reviews: {
    highRating: number;
    lowRating: number;
    fewReviews: number;
    inactive: number;
    noReviews: number;
    active: number;
    manyReviews: number;
  };
  builders: {
    custom: number;
    squarespace: number;
    wix: number;
    godaddy: number;
  };
  domain: {
    established: number;
    new: number;
    expiring: number;
  };
  campaigns: {
    notSetup: number;
    ready: number;
    processing: number;
    failed: number;
  };
}

export default function ModernFilters() {
  const { filters, toggleFilter } = useContractorStore();
  const [stats, setStats] = useState<FilterStats | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    completion: true,
    location: false,
    industry: true,
    performance: true,
    reviews: true,
    builder: true,
    domain: true,
    campaign: true,
  });

  // Load filter stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/contractor-stats');
        const result = await response.json();
        setStats(result.stats);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterSection = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: keyof typeof expandedSections;
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <div className="filter-section border-b border-white/[0.06] last:border-b-0">
      <div 
        className="p-3 px-5 flex justify-between items-center cursor-pointer hover:bg-[#111113] transition-colors"
        onClick={() => toggleSection(id)}
      >
        <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
          <Icon className="w-[14px] h-[14px] text-white/30" />
          {title}
        </div>
        <ChevronDown 
          className={`w-[12px] h-[12px] text-white/30 transition-transform ${
            expandedSections[id] ? '' : '-rotate-90'
          }`} 
        />
      </div>
      {expandedSections[id] && (
        <div className="px-5 pb-3 max-h-48 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );

  const FilterOption = ({ 
    filterId, 
    label, 
    count,
    color
  }: { 
    filterId: string;
    label: string;
    count: number;
    color?: string;
  }) => {
    const isActive = filters.includes(filterId);
    
    return (
      <div 
        className="py-1.5 flex justify-between items-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => toggleFilter(filterId)}
      >
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-[14px] h-[14px] border border-white/[0.06] rounded-sm relative transition-all ${
            isActive ? 'bg-[#3b82f6] border-[#3b82f6]' : ''
          }`}>
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-[10px]">
                ✓
              </div>
            )}
          </div>
          <span className={`text-[12px] ${isActive ? 'text-white font-medium' : 'text-white/70'}`}>
            {label}
          </span>
        </div>
        <span className={`text-[11px] px-1.5 py-0.5 bg-[#050505] rounded-full ${
          color ? `text-${color}` : 'text-white/50'
        }`}>
          {(count || 0).toLocaleString()}
        </span>
      </div>
    );
  };

  if (!stats) {
    return (
      <div className="p-5 flex items-center justify-center">
        <div className="text-white/30 text-[12px]">Loading filters...</div>
      </div>
    );
  }

  return (
    <div className="filter-sections">
      {/* Completion Score */}
      <FilterSection id="completion" title="Completion Score" icon={Target}>
        <FilterOption 
          filterId="completion-80-100" 
          label="80-100% (Excellent)" 
          count={stats.completion.excellent}
        />
        <FilterOption 
          filterId="completion-60-79" 
          label="60-79% (Good)" 
          count={stats.completion.good}
        />
        <FilterOption 
          filterId="completion-35-59" 
          label="35-59% (Fair)" 
          count={stats.completion.fair}
        />
        <FilterOption 
          filterId="completion-0-34" 
          label="0-34% (Poor)" 
          count={stats.completion.poor}
        />
      </FilterSection>

      {/* Location */}
      <FilterSection id="location" title="Location" icon={MapPin}>
        <FilterOption filterId="alabama" label="Alabama" count={0} />
        <FilterOption filterId="arkansas" label="Arkansas" count={0} />
        <FilterOption filterId="idaho" label="Idaho" count={0} />
        <FilterOption filterId="kansas" label="Kansas" count={0} />
        <FilterOption filterId="kentucky" label="Kentucky" count={0} />
        <FilterOption filterId="mississippi" label="Mississippi" count={0} />
        <FilterOption filterId="montana" label="Montana" count={0} />
        <FilterOption filterId="newMexico" label="New Mexico" count={0} />
        <FilterOption filterId="oklahoma" label="Oklahoma" count={0} />
        <FilterOption filterId="southDakota" label="South Dakota" count={0} />
        <FilterOption filterId="utah" label="Utah" count={0} />
        <FilterOption filterId="westVirginia" label="West Virginia" count={0} />
      </FilterSection>

      {/* Industry */}
      <FilterSection id="industry" title="Industry (14)" icon={Building2}>
        <FilterOption 
          filterId="other" 
          label="Other" 
          count={stats.categories.other}
        />
        <FilterOption 
          filterId="roofing" 
          label="Roofing" 
          count={stats.categories.roofing}
        />
        <FilterOption 
          filterId="hvac" 
          label="HVAC" 
          count={stats.categories.hvac}
        />
        <FilterOption 
          filterId="remodeling" 
          label="Remodeling & Finishing" 
          count={stats.categories.remodeling}
        />
        <FilterOption 
          filterId="specialty" 
          label="Specialty Trades" 
          count={stats.categories.specialty}
        />
        <FilterOption 
          filterId="plumbing" 
          label="Plumbing" 
          count={stats.categories.plumbing}
        />
        <FilterOption 
          filterId="exterior" 
          label="Exterior & Landscaping" 
          count={stats.categories.exterior}
        />
        <FilterOption 
          filterId="electrical" 
          label="Electrical" 
          count={stats.categories.electrical}
        />
        <FilterOption 
          filterId="suppliers" 
          label="Suppliers & Materials" 
          count={stats.categories.suppliers}
        />
        <FilterOption 
          filterId="windowDoor" 
          label="Window & Door" 
          count={stats.categories.windowDoor}
        />
      </FilterSection>

      {/* Website Performance */}
      <FilterSection id="performance" title="Website Performance" icon={Zap}>
        <FilterOption 
          filterId="high-psi" 
          label="High Speed (85+)" 
          count={stats.speed.high}
        />
        <FilterOption 
          filterId="medium-psi" 
          label="Medium (60-84)" 
          count={stats.speed.medium}
        />
        <FilterOption 
          filterId="low-psi" 
          label="Low Speed (<60)" 
          count={stats.speed.low}
        />
      </FilterSection>

      {/* Review Quality */}
      <FilterSection id="reviews" title="Review Quality" icon={Star}>
        <FilterOption 
          filterId="high-rating" 
          label="High Rating (4.5+)" 
          count={stats.reviews.highRating}
        />
        <FilterOption 
          filterId="few-reviews" 
          label="Few Reviews (<20)" 
          count={stats.reviews.fewReviews}
        />
        <FilterOption 
          filterId="inactive-reviews" 
          label="Inactive (6mo+)" 
          count={stats.reviews.inactive}
        />
        <FilterOption 
          filterId="no-reviews" 
          label="No Reviews" 
          count={stats.reviews.noReviews}
        />
        <FilterOption 
          filterId="active-reviews" 
          label="Active (Recent)" 
          count={stats.reviews.active}
        />
        <FilterOption 
          filterId="many-reviews" 
          label="Many Reviews (50+)" 
          count={stats.reviews.manyReviews}
        />
        <FilterOption 
          filterId="low-rating" 
          label="Low Rating (<4.0)" 
          count={stats.reviews.lowRating}
        />
      </FilterSection>

      {/* Website Builder */}
      <FilterSection id="builder" title="Website Builder" icon={Globe}>
        <FilterOption 
          filterId="custom-site" 
          label="Custom/WordPress" 
          count={stats.builders.custom}
        />
        <FilterOption 
          filterId="squarespace-site" 
          label="Squarespace" 
          count={stats.builders.squarespace}
        />
        <FilterOption 
          filterId="wix-site" 
          label="Wix" 
          count={stats.builders.wix}
        />
        <FilterOption 
          filterId="godaddy-site" 
          label="GoDaddy" 
          count={stats.builders.godaddy}
        />
      </FilterSection>

      {/* Domain Age */}
      <FilterSection id="domain" title="Domain Age" icon={Clock}>
        <FilterOption 
          filterId="established-domain" 
          label="Established (5+ yrs)" 
          count={stats.domain.established}
        />
        <FilterOption 
          filterId="new-domain" 
          label="New Domain (<2 yrs)" 
          count={stats.domain.new}
        />
        <FilterOption 
          filterId="expiring-domain" 
          label="⚠️ Expiring Soon" 
          count={stats.domain.expiring}
          color="orange-400"
        />
      </FilterSection>

      {/* Campaign Status */}
      <FilterSection id="campaign" title="Campaign Status" icon={Send}>
        <FilterOption 
          filterId="campaign-not-setup" 
          label="Not Setup" 
          count={stats.campaigns.notSetup}
        />
        <FilterOption 
          filterId="campaign-ready" 
          label="Ready" 
          count={stats.campaigns.ready}
        />
        <FilterOption 
          filterId="campaign-processing" 
          label="Processing" 
          count={stats.campaigns.processing}
        />
        <FilterOption 
          filterId="campaign-failed" 
          label="Failed" 
          count={stats.campaigns.failed}
        />
      </FilterSection>
    </div>
  );
}