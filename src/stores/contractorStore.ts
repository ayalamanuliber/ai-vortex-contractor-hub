import { create } from 'zustand';
import type { MergedContractor } from '@/lib/types';

interface ContractorStore {
  // State
  contractors: MergedContractor[];
  filteredContractors: MergedContractor[];
  currentMode: 'intelligence' | 'execution';
  filters: string[];
  currentProfile: MergedContractor | null;
  showingCount: number;
  isCalendarMinimized: boolean;
  isLoading: boolean;
  hasMore: boolean;
  searchQuery: string;
  
  // Actions
  setContractors: (contractors: MergedContractor[]) => void;
  addContractors: (contractors: MergedContractor[]) => void;
  setMode: (mode: 'intelligence' | 'execution') => void;
  toggleFilter: (filter: string) => void;
  clearFilters: () => void;
  setCurrentProfile: (contractor: MergedContractor | null) => void;
  toggleCalendar: () => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setSearchQuery: (query: string) => void;
  updateCampaignStatus: (
    businessId: string, 
    emailNumber: number, 
    status: string
  ) => void;
  addNote: (businessId: string, note: any) => void;
}

export const useContractorStore = create<ContractorStore>((set, get) => ({
  // Initial state
  contractors: [],
  filteredContractors: [],
  currentMode: 'intelligence',
  filters: [],
  currentProfile: null,
  showingCount: 0,
  isCalendarMinimized: true,
  isLoading: false,
  hasMore: true,
  searchQuery: '',
  
  // Actions
  setContractors: (contractors) => {
    const { filters, searchQuery } = get();
    
    // Debug contractor 3993
    const contractor3993 = contractors.find(c => c.id === '3993');
    if (contractor3993) {
      console.log('STORE DEBUG - setContractors 3993:', {
        id: contractor3993.id,
        completionScore: contractor3993.completionScore,
        businessName: contractor3993.businessName
      });
    }
    
    const filtered = applyFiltersAndSearch(contractors, filters, searchQuery);
    
    // Debug after filtering
    const filtered3993 = filtered.find(c => c.id === '3993');
    if (filtered3993) {
      console.log('STORE DEBUG - after filtering 3993:', {
        id: filtered3993.id,
        completionScore: filtered3993.completionScore,
        businessName: filtered3993.businessName
      });
    }
    
    set({ 
      contractors, 
      filteredContractors: filtered,
      showingCount: filtered.length 
    });
  },
  
  addContractors: (newContractors) => {
    const { contractors, filters, searchQuery } = get();
    const updatedContractors = [...contractors, ...newContractors];
    const filtered = applyFiltersAndSearch(updatedContractors, filters, searchQuery);
    
    set({
      contractors: updatedContractors,
      filteredContractors: filtered,
      showingCount: filtered.length
    });
  },
  
  setMode: (mode) => set({ currentMode: mode }),
  
  toggleFilter: (filter) => {
    const { filters, contractors } = get();
    const newFilters = filters.includes(filter)
      ? filters.filter(f => f !== filter)
      : [...filters, filter];
    
    const filtered = applyFiltersAndSearch(contractors, newFilters, get().searchQuery);
    
    set({ 
      filters: newFilters,
      filteredContractors: filtered,
      showingCount: filtered.length
    });
  },
  
  clearFilters: () => {
    const { contractors, searchQuery } = get();
    const filtered = applyFiltersAndSearch(contractors, [], searchQuery);
    
    set({ 
      filters: [],
      filteredContractors: filtered,
      showingCount: filtered.length
    });
  },
  
  setCurrentProfile: (contractor) => set({ currentProfile: contractor }),
  
  toggleCalendar: () => set((state) => ({ 
    isCalendarMinimized: !state.isCalendarMinimized 
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setHasMore: (hasMore) => set({ hasMore }),
  
  setSearchQuery: (query) => {
    const { contractors, filters } = get();
    const filtered = applyFiltersAndSearch(contractors, filters, query);
    
    set({
      searchQuery: query,
      filteredContractors: filtered,
      showingCount: filtered.length
    });
  },
  
  updateCampaignStatus: async (businessId, emailNumber, status) => {
    // Update local state
    set((state) => {
      const contractors = [...state.contractors];
      const contractor = contractors.find(c => c.id === businessId);
      
      if (contractor?.campaignData?.emailSequences) {
        const email = contractor.campaignData.emailSequences.find(
          (e: any) => e.email_number === emailNumber
        );
        if (email) {
          email.status = status;
          
          // Update timestamps
          const today = new Date().toISOString().split('T')[0];
          switch(status) {
            case 'sent':
              email.sentDate = today;
              break;
            case 'opened':
              email.openedDate = today;
              break;
            case 'responded':
              email.respondedDate = today;
              break;
          }
        }
      }
      
      const filtered = applyFiltersAndSearch(contractors, state.filters, state.searchQuery);
      
      return { 
        contractors,
        filteredContractors: filtered,
        showingCount: filtered.length
      };
    });
    
    // Call API to persist changes
    try {
      await fetch('/api/campaigns/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          emailNumber,
          status,
          date: new Date().toISOString().split('T')[0]
        })
      });
    } catch (error) {
      console.error('Failed to update campaign status:', error);
    }
  },
  
  addNote: (businessId, note) => {
    set((state) => {
      const contractors = [...state.contractors];
      const contractor = contractors.find(c => c.id === businessId);
      
      if (contractor) {
        contractor.notes = [...(contractor.notes || []), {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          type: note.type || 'manual',
          content: note.content
        }];
      }
      
      const filtered = applyFiltersAndSearch(contractors, state.filters, state.searchQuery);
      
      return { 
        contractors,
        filteredContractors: filtered
      };
    });
  },
}));

// Helper function to apply filters and search
function applyFiltersAndSearch(
  contractors: MergedContractor[], 
  filters: string[], 
  searchQuery: string
): MergedContractor[] {
  let filtered = [...contractors];
  
  // Apply search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(contractor => 
      contractor.businessName.toLowerCase().includes(query) ||
      contractor.category.toLowerCase().includes(query) ||
      contractor.state.toLowerCase().includes(query) ||
      contractor.id.includes(query)
    );
  }
  
  // Apply filters
  if (filters.length > 0) {
    filtered = filtered.filter(contractor => {
      return filters.every(filter => {
        switch (filter) {
          // Completion score filters
          case 'completion-85-100':
            return contractor.completionScore >= 85;
          case 'completion-70-84':
            return contractor.completionScore >= 70 && contractor.completionScore < 85;
          case 'completion-50-69':
            return contractor.completionScore >= 50 && contractor.completionScore < 70;
          case 'completion-0-49':
            return contractor.completionScore < 50;
          
          // State filters
          case 'kansas':
            return contractor.state === 'KS';
          case 'texas':
            return contractor.state === 'TX';
          case 'colorado':
            return contractor.state === 'CO';
          case 'idaho':
            return contractor.state === 'ID';
          
          // Category filters
          case 'roofing':
            return contractor.category.toLowerCase().includes('roofing');
          case 'hvac':
            return contractor.category.toLowerCase().includes('hvac');
          case 'electrical':
            return contractor.category.toLowerCase().includes('electrical');
          case 'plumbing':
            return contractor.category.toLowerCase().includes('plumbing');
          
          // Campaign filters
          case 'campaign-ready':
            return contractor.hasCampaign;
          case 'no-campaign':
            return !contractor.hasCampaign;
          case 'focus-group':
            return contractor.hasFocusGroup;
          
          // Website speed filters
          case 'high-psi':
            return contractor.intelligence.websiteSpeed.mobile >= 85;
          case 'medium-psi':
            return contractor.intelligence.websiteSpeed.mobile >= 60 && 
                   contractor.intelligence.websiteSpeed.mobile < 85;
          case 'low-psi':
            return contractor.intelligence.websiteSpeed.mobile < 60;
          
          // Review filters
          case 'inactive-reviews':
            return contractor.intelligence.reviewsRecency === 'INACTIVE';
          case 'active-reviews':
            return contractor.intelligence.reviewsRecency === 'ACTIVE';
          
          // Rating filters
          case 'high-rating':
            return contractor.googleRating >= 4.5;
          case 'low-rating':
            return contractor.googleRating < 4.0;
          
          // Email quality filters
          case 'professional-email':
            return contractor.emailQuality === 'PROFESSIONAL_DOMAIN';
          case 'personal-email':
            return contractor.emailQuality === 'PERSONAL_DOMAIN';
          
          default:
            return true;
        }
      });
    });
  }
  
  return filtered;
}