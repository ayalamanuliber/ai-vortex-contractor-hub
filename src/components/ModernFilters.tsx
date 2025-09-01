'use client';

import { useState, useEffect } from 'react';
import { 
  Filter, X, ChevronDown, ChevronRight, Loader2,
  Target, MapPin, Building2, Zap, Star, Globe, TrendingUp, Calendar
} from 'lucide-react';
import { useContractorStore } from '@/stores/contractorStore';

interface FilterStats {
  total: number;
  completion: {
    high: number;
    medium: number;
    low: number;
    veryLow: number;
  };
  states: {
    alabama: number;
    arkansas: number;
    idaho: number;
    kansas: number;
    kentucky: number;
    mississippi: number;
    montana: number;
    newMexico: number;
    oklahoma: number;
    southDakota: number;
    utah: number;
    westVirginia: number;
  };
  categories: {
    roofing: number;
    hvac: number;
    plumbing: number;
    electrical: number;
    remodeling: number;
    exterior: number;
    heavyCivil: number;
    homeBuilding: number;
    specialty: number;
    suppliers: number;
    ancillary: number;
    construction: number;
    windowDoor: number;
    other: number;
  };
  speed: {
    high: number;
    medium: number;
    low: number;
  };
  rating: {
    high: number;
    good: number;
    average: number;
    low: number;
    noRating: number;
  };
  email: {
    professional: number;
    personal: number;
    unknown: number;
  };
  reviews: {
    highRating: number;
    lowRating: number;
    manyReviews: number;
    fewReviews: number;
    activeReviews: number;
    inactiveReviews: number;
    noReviews: number;
  };
  builders: {
    wix: number;
    godaddy: number;
    squarespace: number;
    custom: number;
  };
  domain: {
    expiringSoon: number;
    new: number;
    established: number;
  };
}

export function ModernFilters() {
  const { filters, toggleFilter, clearFilters, showingCount } = useContractorStore();
  const [stats, setStats] = useState<FilterStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    completion: true,
    location: false,
    category: false,
    performance: false,
    reviews: false,
    builders: false,
    domain: false,
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
      } finally {
        setIsLoading(false);
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
  
  const FilterButton = ({ 
    filter, 
    label, 
    count, 
    color = "default" 
  }: { 
    filter: string; 
    label: string; 
    count?: number;
    color?: "default" | "green" | "yellow" | "orange" | "red" | "blue" | "purple";
  }) => {
    const isActive = filters.includes(filter);
    
    const colorClasses = {
      default: isActive ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted',
      green: isActive ? 'bg-green-500 text-white' : 'bg-green-500/10 hover:bg-green-500/20 text-green-400',
      yellow: isActive ? 'bg-yellow-500 text-white' : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400',
      orange: isActive ? 'bg-orange-500 text-white' : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400',
      red: isActive ? 'bg-red-500 text-white' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400',
      blue: isActive ? 'bg-blue-500 text-white' : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400',
      purple: isActive ? 'bg-purple-500 text-white' : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400',
    };
    
    return (
      <button
        onClick={() => toggleFilter(filter)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${colorClasses[color]} border border-border/50`}
      >
        <span>{label}</span>
        {count !== undefined && (
          <span className="ml-2 px-1.5 py-0.5 bg-background/20 rounded text-xs font-medium">
            {count.toLocaleString()}
          </span>
        )}
      </button>
    );
  };
  
  const SectionHeader = ({ 
    section, 
    title, 
    icon 
  }: { 
    section: keyof typeof expandedSections; 
    title: string; 
    icon?: React.ReactNode;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2 font-medium text-sm">
        {icon}
        {title}
      </div>
      {expandedSections[section] ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading filters...</span>
        </div>
      </div>
    );
  }
  
  if (!stats) return null;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h2 className="font-semibold">Filters</h2>
        </div>
        {filters.length > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
      
      {/* Active filters count */}
      {showingCount < stats.total && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="text-sm text-center">
            <span className="font-medium text-primary">{showingCount.toLocaleString()}</span>
            <span className="text-muted-foreground"> of </span>
            <span className="font-medium">{stats.total.toLocaleString()}</span>
            <span className="text-muted-foreground"> contractors</span>
          </div>
        </div>
      )}
      
      {/* Completion Score */}
      <div className="space-y-2">
        <SectionHeader section="completion" title="Completion Score" icon={<Target className="h-4 w-4" />} />
        {expandedSections.completion && (
          <div className="space-y-1 pl-2">
            <FilterButton filter="completion-80-100" label="80-100% (Excellent)" count={stats.completion.high} color="green" />
            <FilterButton filter="completion-60-79" label="60-79% (Good)" count={stats.completion.medium} color="yellow" />
            <FilterButton filter="completion-35-59" label="35-59% (Fair)" count={stats.completion.low} color="orange" />
            <FilterButton filter="completion-0-34" label="0-34% (Poor)" count={stats.completion.veryLow} color="red" />
          </div>
        )}
      </div>
      
      {/* Location */}
      <div className="space-y-2">
        <SectionHeader section="location" title="Location" icon={<MapPin className="h-4 w-4" />} />
        {expandedSections.location && (
          <div className="space-y-1 pl-2 max-h-48 overflow-y-auto">
            <FilterButton filter="alabama" label="Alabama (AL)" count={stats.states.alabama} color="blue" />
            <FilterButton filter="arkansas" label="Arkansas (AR)" count={stats.states.arkansas} color="blue" />
            <FilterButton filter="idaho" label="Idaho (ID)" count={stats.states.idaho} color="blue" />
            <FilterButton filter="kansas" label="Kansas (KS)" count={stats.states.kansas} color="blue" />
            <FilterButton filter="kentucky" label="Kentucky (KY)" count={stats.states.kentucky} color="blue" />
            <FilterButton filter="mississippi" label="Mississippi (MS)" count={stats.states.mississippi} color="blue" />
            <FilterButton filter="montana" label="Montana (MT)" count={stats.states.montana} color="blue" />
            <FilterButton filter="newMexico" label="New Mexico (NM)" count={stats.states.newMexico} color="blue" />
            <FilterButton filter="oklahoma" label="Oklahoma (OK)" count={stats.states.oklahoma} color="blue" />
            <FilterButton filter="southDakota" label="South Dakota (SD)" count={stats.states.southDakota} color="blue" />
            <FilterButton filter="utah" label="Utah (UT)" count={stats.states.utah} color="blue" />
            <FilterButton filter="westVirginia" label="West Virginia (WV)" count={stats.states.westVirginia} color="blue" />
          </div>
        )}
      </div>
      
      {/* Category - 14 Real Mega Categories */}
      <div className="space-y-2">
        <SectionHeader section="category" title="Industry (14 Categories)" icon={<Building2 className="h-4 w-4" />} />
        {expandedSections.category && (
          <div className="space-y-1 pl-2 max-h-64 overflow-y-auto">
            <FilterButton filter="roofing" label="Roofing" count={stats.categories.roofing} color="purple" />
            <FilterButton filter="hvac" label="HVAC" count={stats.categories.hvac} color="purple" />
            <FilterButton filter="plumbing" label="Plumbing" count={stats.categories.plumbing} color="purple" />
            <FilterButton filter="electrical" label="Electrical" count={stats.categories.electrical} color="purple" />
            <FilterButton filter="remodeling" label="Remodeling & Finishing" count={stats.categories.remodeling} color="purple" />
            <FilterButton filter="exterior" label="Exterior & Landscaping" count={stats.categories.exterior} color="purple" />
            <FilterButton filter="heavyCivil" label="Heavy & Civil Work" count={stats.categories.heavyCivil} color="purple" />
            <FilterButton filter="homeBuilding" label="Home Building" count={stats.categories.homeBuilding} color="purple" />
            <FilterButton filter="specialty" label="Specialty Trades & Handyman" count={stats.categories.specialty} color="purple" />
            <FilterButton filter="suppliers" label="Suppliers & Materials" count={stats.categories.suppliers} color="purple" />
            <FilterButton filter="ancillary" label="Ancillary Services" count={stats.categories.ancillary} color="purple" />
            <FilterButton filter="construction" label="General Construction" count={stats.categories.construction} color="purple" />
            <FilterButton filter="windowDoor" label="Window & Door" count={stats.categories.windowDoor} color="purple" />
            <FilterButton filter="other" label="Other" count={stats.categories.other} color="purple" />
          </div>
        )}
      </div>
      
      {/* Performance */}
      <div className="space-y-2">
        <SectionHeader section="performance" title="Website Performance" icon={<Zap className="h-4 w-4" />} />
        {expandedSections.performance && (
          <div className="space-y-1 pl-2">
            <FilterButton filter="high-psi" label="High Speed (85+)" count={stats.speed.high} color="green" />
            <FilterButton filter="medium-psi" label="Medium Speed (60-84)" count={stats.speed.medium} color="yellow" />
            <FilterButton filter="low-psi" label="Low Speed (<60)" count={stats.speed.low} color="red" />
          </div>
        )}
      </div>
      
      {/* Reviews */}
      <div className="space-y-2">
        <SectionHeader section="reviews" title="Review Quality" icon={<Star className="h-4 w-4" />} />
        {expandedSections.reviews && (
          <div className="space-y-1 pl-2">
            <FilterButton filter="high-rating" label="High Rating (4.5+)" count={stats.reviews.highRating} color="green" />
            <FilterButton filter="low-rating" label="Low Rating (<4.0)" count={stats.reviews.lowRating} color="red" />
            <FilterButton filter="many-reviews" label="Many Reviews (50+)" count={stats.reviews.manyReviews} color="blue" />
            <FilterButton filter="few-reviews" label="Few Reviews (<20)" count={stats.reviews.fewReviews} color="orange" />
            <FilterButton filter="active-reviews" label="Active (Recent)" count={stats.reviews.activeReviews} color="green" />
            <FilterButton filter="inactive-reviews" label="Inactive (6mo+)" count={stats.reviews.inactiveReviews} color="yellow" />
            <FilterButton filter="no-reviews" label="No Reviews" count={stats.reviews.noReviews} color="red" />
          </div>
        )}
      </div>
      
      {/* Website Builders */}
      <div className="space-y-2">
        <SectionHeader section="builders" title="Website Builder" icon={<Globe className="h-4 w-4" />} />
        {expandedSections.builders && (
          <div className="space-y-1 pl-2">
            <FilterButton filter="custom-site" label="Custom/WordPress" count={stats.builders.custom} color="green" />
            <FilterButton filter="wix-site" label="Wix" count={stats.builders.wix} color="blue" />
            <FilterButton filter="godaddy-site" label="GoDaddy" count={stats.builders.godaddy} color="orange" />
            <FilterButton filter="squarespace-site" label="Squarespace" count={stats.builders.squarespace} color="purple" />
          </div>
        )}
      </div>
      
      {/* Domain Age */}
      <div className="space-y-2">
        <SectionHeader section="domain" title="Domain Age" icon={<Calendar className="h-4 w-4" />} />
        {expandedSections.domain && (
          <div className="space-y-1 pl-2">
            <FilterButton filter="established-domain" label="Established (5+ years)" count={stats.domain.established} color="green" />
            <FilterButton filter="new-domain" label="New Domain (<2 years)" count={stats.domain.new} color="blue" />
            <FilterButton filter="expiring-domain" label="Expiring Soon (3mo)" count={stats.domain.expiringSoon} color="red" />
          </div>
        )}
      </div>
    </div>
  );
}