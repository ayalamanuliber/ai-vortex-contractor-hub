'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { IntelligenceCard } from './ContractorCard/IntelligenceCard';
import { ExecutionCard } from './ContractorCard/ExecutionCard';
import { contractorService } from '@/lib/services/ContractorService';
import { useContractorStore } from '@/stores/contractorStore';
import { Loader2 } from 'lucide-react';

export function ContractorGrid() {
  const [page, setPage] = useState(0);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });
  
  const { 
    filteredContractors, 
    currentMode, 
    setContractors, 
    addContractors,
    isLoading,
    setLoading,
    hasMore,
    setHasMore,
    setCurrentProfile
  } = useContractorStore();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load more when scrolling
  useEffect(() => {
    if (inView && hasMore && !isLoading && page > 0) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, page]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // SIMPLE DIRECT FETCH - NO SERVICE  
      const response = await fetch('/api/simple-contractors?start=0&limit=5000');
      const result = await response.json();
      const data = result.contractors || [];
      
      // Debug what comes from direct API
      const contractor3993 = data.find((c: any) => c.id === '3993');
      if (contractor3993) {
        console.log('DIRECT API - Contractor 3993:', {
          id: contractor3993.id,
          completionScore: contractor3993.completionScore,
          businessName: contractor3993.businessName
        });
      }
      
      setContractors(data);
      setHasMore(result.hasMore);
      setPage(1);
      
      // Check if there's more data
      if (data.length < 100) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    
    setLoading(true);
    try {
      const start = page * 5000; // page starts at 1, so page 1 = start 5000
      const response = await fetch(`/api/simple-contractors?start=${start}&limit=5000`);
      const result = await response.json();
      const newData = result.contractors || [];
      
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        addContractors(newData);
        setHasMore(result.hasMore);
        setPage(prev => prev + 1);
        if (newData.length < 99) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load more data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProfile = (contractor: any) => {
    setCurrentProfile(contractor);
  };

  if (!filteredContractors.length && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading contractors...</p>
        </div>
      </div>
    );
  }

  if (!filteredContractors.length && !isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center glass-surface p-8 rounded-lg border border-border/40">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No contractors found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query to find contractors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredContractors.map((contractor, index) => (
          <div key={contractor.id}>
            {currentMode === 'intelligence' ? (
              <IntelligenceCard 
                contractor={contractor} 
                onClick={() => openProfile(contractor)}
              />
            ) : (
              <ExecutionCard 
                contractor={contractor} 
                onClick={() => openProfile(contractor)}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Infinite scroll trigger */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isLoading && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading more contractors...</span>
          </div>
        )}
        {!hasMore && filteredContractors.length > 0 && (
          <div className="text-center">
            <p className="text-muted-foreground">
              Showing all {filteredContractors.length} contractors
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Use filters to narrow down results
            </p>
          </div>
        )}
      </div>
    </>
  );
}