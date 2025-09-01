'use client';

import { X } from 'lucide-react';
import { useContractorStore } from '@/stores/contractorStore';
import { cn } from '@/lib/utils/cn';

export function FilterSidebar() {
  const { filters, toggleFilter, clearFilters } = useContractorStore();

  const filterGroups = [
    {
      title: 'Completion Score',
      filters: [
        { id: 'completion-85-100', label: '85-100%', color: 'text-green-400' },
        { id: 'completion-70-84', label: '70-84%', color: 'text-yellow-400' },
        { id: 'completion-50-69', label: '50-69%', color: 'text-orange-400' },
      ]
    },
    {
      title: 'Location',
      filters: [
        { id: 'kansas', label: 'Kansas', color: 'text-blue-400' },
        { id: 'texas', label: 'Texas', color: 'text-blue-400' },
        { id: 'colorado', label: 'Colorado', color: 'text-blue-400' },
        { id: 'idaho', label: 'Idaho', color: 'text-blue-400' },
      ]
    },
    {
      title: 'Category',
      filters: [
        { id: 'roofing', label: 'Roofing', color: 'text-purple-400' },
        { id: 'hvac', label: 'HVAC', color: 'text-purple-400' },
        { id: 'electrical', label: 'Electrical', color: 'text-purple-400' },
        { id: 'plumbing', label: 'Plumbing', color: 'text-purple-400' },
      ]
    },
    {
      title: 'Campaign Status',
      filters: [
        { id: 'campaign-ready', label: 'Has Campaign', color: 'text-green-400' },
        { id: 'no-campaign', label: 'No Campaign', color: 'text-gray-400' },
        { id: 'focus-group', label: 'Focus Group', color: 'text-primary' },
      ]
    },
    {
      title: 'Website Speed (PSI)',
      filters: [
        { id: 'high-psi', label: 'High (85+)', color: 'text-green-400' },
        { id: 'medium-psi', label: 'Medium (60-84)', color: 'text-yellow-400' },
        { id: 'low-psi', label: 'Low (<60)', color: 'text-red-400' },
      ]
    },
    {
      title: 'Reviews',
      filters: [
        { id: 'active-reviews', label: 'Active (<30 days)', color: 'text-green-400' },
        { id: 'inactive-reviews', label: 'Inactive (>90 days)', color: 'text-red-400' },
        { id: 'high-rating', label: 'High Rating (4.5+)', color: 'text-yellow-400' },
        { id: 'low-rating', label: 'Low Rating (<4.0)', color: 'text-orange-400' },
      ]
    },
    {
      title: 'Email Quality',
      filters: [
        { id: 'professional-email', label: 'Professional Domain', color: 'text-green-400' },
        { id: 'personal-email', label: 'Personal Domain', color: 'text-orange-400' },
      ]
    },
  ];

  return (
    <div className="fixed left-0 top-16 bottom-0 w-80 glass-surface border-r border-border/40 overflow-y-auto custom-scrollbar">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          {filters.length > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Filters</h3>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const filterConfig = filterGroups
                  .flatMap(g => g.filters)
                  .find(f => f.id === filter);
                
                return (
                  <button
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-primary/20 text-primary border border-primary/40 rounded-md hover:bg-primary/30 transition-colors"
                  >
                    <span>{filterConfig?.label || filter}</span>
                    <X className="w-3 h-3" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Groups */}
        <div className="space-y-6">
          {filterGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-foreground mb-3">{group.title}</h3>
              <div className="space-y-2">
                {group.filters.map((filter) => {
                  const isActive = filters.includes(filter.id);
                  
                  return (
                    <button
                      key={filter.id}
                      onClick={() => toggleFilter(filter.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200',
                        'filter-pill',
                        isActive && 'active'
                      )}
                    >
                      <span className={cn(
                        'font-medium',
                        isActive ? 'text-primary-foreground' : filter.color
                      )}>
                        {filter.label}
                      </span>
                      {isActive && (
                        <div className="w-2 h-2 bg-current rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 p-4 bg-card/20 rounded-lg border border-border/30">
          <p className="text-xs text-muted-foreground">
            Use filters to narrow down contractors based on intelligence data, campaign status, and performance metrics.
          </p>
        </div>
      </div>
    </div>
  );
}