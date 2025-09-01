'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useContractorStore } from '@/stores/contractorStore';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setContractors, setSearchQuery, searchQuery } = useContractorStore();
  
  // Global search function
  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      // Clear search - reload initial data
      const response = await fetch('/api/simple-contractors?start=0&limit=99');
      const result = await response.json();
      setContractors(result.contractors || []);
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      // Search across ALL contractors
      const response = await fetch(`/api/simple-contractors?search=${encodeURIComponent(searchTerm)}&start=0&limit=50`);
      const result = await response.json();
      
      setResults(result.contractors || []);
      setContractors(result.contractors || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== searchQuery) {
        performSearch(query);
        setSearchQuery(query);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const clearSearch = () => {
    setQuery('');
    setSearchQuery('');
    performSearch('');
    setIsOpen(false);
  };
  
  return (
    <>
      {/* Search trigger */}
      <div 
        className="relative w-full max-w-sm cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-lg bg-background/60 border border-border/60 pl-10 pr-12 py-2 text-sm placeholder:text-muted-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
            placeholder="Search contractors... (⌘K)"
            value={query}
            readOnly
          />
          {query && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearSearch();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      
      {/* Search overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-20">
            <div className="mx-auto max-w-2xl">
              {/* Search input */}
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  className="w-full rounded-xl bg-card border border-border pl-12 pr-16 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  placeholder="Search contractors by name, ID, category, state..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                {isLoading && (
                  <Loader2 className="absolute right-12 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Search results */}
              {query && (
                <div className="rounded-xl bg-card border border-border shadow-lg overflow-hidden">
                  {results.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      {results.slice(0, 10).map((contractor) => (
                        <div
                          key={contractor.id}
                          className="flex items-center justify-between p-4 hover:bg-muted/50 border-b border-border/50 last:border-b-0 cursor-pointer"
                          onClick={() => {
                            setIsOpen(false);
                            // Focus on the contractor in main view
                            document.querySelector(`[data-contractor-id="${contractor.id}"]`)?.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center' 
                            });
                          }}
                        >
                          <div>
                            <div className="font-medium">{contractor.businessName}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {contractor.id} • {contractor.category} • {contractor.state}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              contractor.completionScore >= 85 ? 'bg-green-500/20 text-green-400' :
                              contractor.completionScore >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                              contractor.completionScore >= 50 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {contractor.completionScore}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Searching...
                        </div>
                      ) : (
                        'No contractors found'
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Search tips */}
              {!query && (
                <div className="text-center text-sm text-muted-foreground">
                  <p className="mb-2">Search across all 4,000+ contractors instantly</p>
                  <div className="flex justify-center gap-4 text-xs">
                    <span>Try: "3993", "Burris", "KY", "Roofing"</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}