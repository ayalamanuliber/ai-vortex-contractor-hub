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
  toggleFilter: (filter: string) => Promise<void>;
  clearFilters: () => Promise<void>;
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
  
  toggleFilter: async (filter) => {
    const { filters, searchQuery } = get();
    
    // Define mutually exclusive filter groups
    const mutuallyExclusiveGroups = [
      // Completion score ranges
      ['completion-85-100', 'completion-70-84', 'completion-50-69', 'completion-0-49'],
      // States (only one state at a time)
      ['alabama', 'arkansas', 'idaho', 'kansas', 'kentucky', 'mississippi', 'montana', 'newMexico', 'oklahoma', 'southDakota', 'utah', 'westVirginia'],
      // Categories (only one category at a time)
      ['roofing', 'hvac', 'plumbing', 'electrical', 'remodeling', 'exterior', 'heavyCivil', 'homeBuilding', 'specialty', 'suppliers', 'ancillary', 'construction', 'windowDoor', 'other'],
      // PSI performance ranges
      ['high-psi', 'medium-psi', 'low-psi'],
      // Rating ranges
      ['high-rating', 'low-rating'],
      // Review volume
      ['many-reviews', 'few-reviews', 'no-reviews'],
      // Review activity
      ['active-reviews', 'inactive-reviews'],
      // Website builders
      ['wix-site', 'godaddy-site', 'squarespace-site', 'custom-site'],
      // Email quality
      ['professional-email', 'personal-email']
    ];
    
    let newFilters;
    if (filters.includes(filter)) {
      // Remove filter
      newFilters = filters.filter(f => f !== filter);
    } else {
      // Add filter, but remove any conflicting filters from same group
      const conflictingGroup = mutuallyExclusiveGroups.find(group => group.includes(filter));
      if (conflictingGroup) {
        // Remove any existing filters from this group
        newFilters = filters.filter(f => !conflictingGroup.includes(f));
        // Add the new filter
        newFilters = [...newFilters, filter];
      } else {
        // No conflicts, just add
        newFilters = [...filters, filter];
      }
    }
    
    // Fetch filtered data from API
    try {
      set({ isLoading: true });
      
      let url = '/api/simple-contractors?start=0&limit=100';
      if (newFilters.length > 0) {
        url += `&filters=${newFilters.join(',')}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();
      
      set({ 
        filters: newFilters,
        contractors: result.contractors || [],
        filteredContractors: result.contractors || [],
        showingCount: result.total || 0,
        isLoading: false
      });
    } catch (error) {
      console.error('Filter error:', error);
      set({ isLoading: false });
    }
  },
  
  clearFilters: async () => {
    const { searchQuery } = get();
    
    try {
      set({ isLoading: true });
      
      let url = '/api/simple-contractors?start=0&limit=100';
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();
      
      set({ 
        filters: [],
        contractors: result.contractors || [],
        filteredContractors: result.contractors || [],
        showingCount: result.total || 0,
        isLoading: false
      });
    } catch (error) {
      console.error('Clear filters error:', error);
      set({ isLoading: false });
    }
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
          
          // State filters - Real states from data
          case 'alabama':
            return contractor.state === 'AL';
          case 'arkansas':
            return contractor.state === 'AR';
          case 'kansas':
            return contractor.state === 'KS';
          case 'kentucky':
            return contractor.state === 'KY';
          case 'idaho':
            return contractor.state === 'ID';
          case 'mississippi':
            return contractor.state === 'MS';
          case 'montana':
            return contractor.state === 'MT';
          case 'newMexico':
            return contractor.state === 'NM';
          case 'oklahoma':
            return contractor.state === 'OK';
          case 'southDakota':
            return contractor.state === 'SD';
          case 'utah':
            return contractor.state === 'UT';
          case 'westVirginia':
            return contractor.state === 'WV';
          
          // Category filters - 14 Real Mega Categories
          case 'roofing':
            return contractor.category.toLowerCase().includes('roofing');
          case 'hvac':
            return contractor.category.toLowerCase().includes('hvac');
          case 'plumbing':
            return contractor.category.toLowerCase().includes('plumbing');
          case 'electrical':
            return contractor.category.toLowerCase().includes('electrical');
          case 'remodeling':
            return contractor.category.toLowerCase().includes('remodeling') || contractor.category.toLowerCase().includes('finishing');
          case 'exterior':
            return contractor.category.toLowerCase().includes('exterior') || contractor.category.toLowerCase().includes('landscaping');
          case 'heavyCivil':
            return contractor.category.toLowerCase().includes('heavy') || contractor.category.toLowerCase().includes('civil');
          case 'homeBuilding':
            return contractor.category.toLowerCase().includes('home building') || contractor.category.toLowerCase().includes('builder');
          case 'specialty':
            return contractor.category.toLowerCase().includes('specialty') || contractor.category.toLowerCase().includes('handyman');
          case 'suppliers':
            return contractor.category.toLowerCase().includes('suppliers') || contractor.category.toLowerCase().includes('materials');
          case 'ancillary':
            return contractor.category.toLowerCase().includes('ancillary') || contractor.category.toLowerCase().includes('services');
          case 'construction':
            return contractor.category.toLowerCase().includes('construction') || contractor.category.toLowerCase().includes('contractor');
          case 'windowDoor':
            return contractor.category.toLowerCase().includes('window') || contractor.category.toLowerCase().includes('door');
          case 'other':
            return contractor.category.toLowerCase().includes('other') || contractor.category === '';
          
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
          
          // Review filters
          case 'many-reviews':
            return contractor.googleReviews >= 50;
          case 'few-reviews':
            return contractor.googleReviews > 0 && contractor.googleReviews < 10;
          case 'no-reviews':
            return contractor.googleReviews === 0;
          case 'active-reviews':
            if (!contractor.intelligence.lastReviewDate) return false;
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const lastReview = new Date(contractor.intelligence.lastReviewDate);
            return lastReview > sixMonthsAgo;
          case 'inactive-reviews':
            if (!contractor.intelligence.lastReviewDate) return false;
            const sixMonthsAgoInactive = new Date();
            sixMonthsAgoInactive.setMonth(sixMonthsAgoInactive.getMonth() - 6);
            const lastReviewInactive = new Date(contractor.intelligence.lastReviewDate);
            return lastReviewInactive <= sixMonthsAgoInactive;
          
          // Website builder filters
          case 'wix-site':
            return contractor.intelligence.websiteBuilder?.toLowerCase().includes('wix') || false;
          case 'godaddy-site':
            return contractor.intelligence.websiteBuilder?.toLowerCase().includes('godaddy') || false;
          case 'squarespace-site':
            return contractor.intelligence.websiteBuilder?.toLowerCase().includes('squarespace') || false;
          case 'custom-site':
            const builder = contractor.intelligence.websiteBuilder?.toLowerCase() || '';
            return !builder.includes('wix') && 
                   !builder.includes('godaddy') && 
                   !builder.includes('squarespace') &&
                   builder !== 'unknown' &&
                   builder !== '';
          
          default:
            return true;
        }
      });
    });
  }
  
  return filtered;
}