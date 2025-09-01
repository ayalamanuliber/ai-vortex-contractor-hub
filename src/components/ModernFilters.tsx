'use client';

import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
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
    kansas: number;
    texas: number;
    colorado: number;
    idaho: number;
    california: number;
    florida: number;
  };
  categories: {
    roofing: number;
    hvac: number;
    electrical: number;
    plumbing: number;
    construction: number;
    contractor: number;
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
  health: {
    healthy: number;
    emerging: number;
    needsAttention: number;
    struggling: number;
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
    quality: false,
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
        <SectionHeader section="completion" title="Completion Score" />
        {expandedSections.completion && (
          <div className="space-y-1 pl-2">
            <FilterButton filter="completion-85-100" label="85-100% (Excellent)" count={stats.completion.high} color="green" />
            <FilterButton filter="completion-70-84" label="70-84% (Good)" count={stats.completion.medium} color="yellow" />
            <FilterButton filter="completion-50-69" label="50-69% (Fair)" count={stats.completion.low} color="orange" />
            <FilterButton filter="completion-0-49" label="0-49% (Poor)" count={stats.completion.veryLow} color="red" />
          </div>
        )}
      </div>
      
      {/* Location */}
      <div className="space-y-2">
        <SectionHeader section="location" title="Location" />
        {expandedSections.location && (
          <div className="space-y-1 pl-2">
            <FilterButton filter="kansas" label="Kansas" count={stats.states.kansas} color="blue" />
            <FilterButton filter="texas" label="Texas" count={stats.states.texas} color="blue" />
            <FilterButton filter="colorado" label="Colorado" count={stats.states.colorado} color="blue" />
            <FilterButton filter="idaho" label="Idaho" count={stats.states.idaho} color="blue" />
            <FilterButton filter="california" label="California" count={stats.states.california} color="blue" />
            <FilterButton filter="florida" label="Florida" count={stats.states.florida} color="blue" />
          </div>
        )}
      </div>
      
      {/* Category */}
      <div className="space-y-2">
        <SectionHeader section="category" title="Category" />
        {expandedSections.category && (
          <div className="space-y-1 pl-2">
            <FilterButton filter="roofing" label="Roofing" count={stats.categories.roofing} color="purple" />
            <FilterButton filter="hvac" label="HVAC" count={stats.categories.hvac} color="purple" />
            <FilterButton filter="electrical" label="Electrical" count={stats.categories.electrical} color="purple" />
            <FilterButton filter="plumbing" label="Plumbing" count={stats.categories.plumbing} color="purple" />
            <FilterButton filter="construction" label="Construction" count={stats.categories.construction} color="purple" />
            <FilterButton filter="contractor" label="General Contractor" count={stats.categories.contractor} color="purple" />
          </div>
        )}
      </div>
      
      {/* Performance */}
      <div className="space-y-2">
        <SectionHeader section="performance" title="Website Performance" />
        {expandedSections.performance && (
          <div className="space-y-1 pl-2">
            <FilterButton filter="high-psi" label="High Speed (85+)" count={stats.speed.high} color="green" />
            <FilterButton filter="medium-psi" label="Medium Speed (60-84)" count={stats.speed.medium} color="yellow" />
            <FilterButton filter="low-psi" label="Low Speed (<60)" count={stats.speed.low} color="red" />
          </div>
        )}
      </div>
      
      {/* Quality */}
      <div className="space-y-2">
        <SectionHeader section="quality" title="Quality Indicators" />
        {expandedSections.quality && (
          <div className="space-y-1 pl-2">
            <FilterButton filter="high-rating" label="High Rating (4.5+)" count={stats.rating.high} color="green" />
            <FilterButton filter="professional-email" label="Professional Email" count={stats.email.professional} color="blue" />
            <FilterButton filter="personal-email" label="Personal Email" count={stats.email.personal} color="orange" />
          </div>
        )}
      </div>
    </div>
  );
}