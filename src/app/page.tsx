'use client';

import ModernFilters from '@/components/ModernFilters';
import ContractorGrid from '@/components/ContractorGrid';
import { CampaignCalendar } from '@/components/Calendar/CampaignCalendar';
import { ProfileModal } from '@/components/ProfileModal/ProfileModal';
import { SyncPanel } from '@/components/SyncPanel';
import { useContractorStore } from '@/stores/contractorStore';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { 
  Search, Download, Plus, Filter, LayoutGrid, List, 
  ChevronDown, ArrowUp, RefreshCw
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

export default function HomePage() {
  const { 
    showingCount, 
    filteredContractors,
    filters,
    clearFilters,
    setContractors,
    setSearchMode
  } = useContractorStore();

  // Check auth on mount and load user info
  useEffect(() => {
    const isAuthorized = localStorage.getItem('authorized') === 'true'
    if (!isAuthorized) {
      window.location.href = '/simple-login'
      return
    }
    
    // Load user info from localStorage
    const email = localStorage.getItem('userEmail') || ''
    const name = localStorage.getItem('userName') || ''
    const picture = localStorage.getItem('userPicture') || ''
    
    if (email) {
      setUserInfo({ email, name, picture })
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('authorized')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('userPicture')
    window.location.href = '/simple-login'
  };
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('score-high-low');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const syncPanelRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userInfo, setUserInfo] = useState<{email: string, name: string, picture: string} | null>(null);

  // Global search function that searches ALL contractors
  const performGlobalSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      // Clear search - reload initial data
      setSearchMode(false);
      const response = await fetchWithAuth('/api/simple-contractors?start=0&limit=200');
      if (!response) return;
      const result = await response.json();
      setContractors(result.contractors || []);
      return;
    }

    setIsSearching(true);
    setSearchMode(true);
    try {
      // Search across ALL contractors but limit to reasonable amount for display
      const response = await fetchWithAuth(`/api/simple-contractors?search=${encodeURIComponent(query)}&start=0&limit=1000`);
      if (!response) return;
      const result = await response.json();
      setContractors(result.contractors || []);
    } catch (error) {
      console.error('Global search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [setContractors, setSearchMode]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performGlobalSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, performGlobalSearch]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Close sync panel on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (syncPanelRef.current && !syncPanelRef.current.contains(event.target as Node)) {
        setShowSyncPanel(false);
      }
    };

    if (showSyncPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSyncPanel]);

  // Calculate stats
  const stats = {
    total: showingCount,
    withCampaigns: filteredContractors.filter(c => c.hasCampaign).length,
    ready: filteredContractors.filter(c => c.hasCampaign && c.campaignData).length,
    scheduled: 12, // Mock data
    sent: 8 // Mock data
  };

  return (
    <div className="min-h-screen flex bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0a0a0b] border-r border-white/[0.06] flex flex-col overflow-hidden fixed h-full z-30">
        <div className="p-5 border-b border-white/[0.06]">
          <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">
            Filters
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#3b82f6] text-white rounded-full text-[11px] font-semibold">
                {filters.length}
              </span>
              <span className="text-white/50">Active filters</span>
            </div>
            {filters.length > 0 && (
              <button 
                onClick={clearFilters}
                className="text-white/30 hover:text-white/50 text-[11px] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ModernFilters />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden ml-60">
        {/* Header */}
        <header className="bg-[#0a0a0b] border-b border-white/[0.06] px-6 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <div className="text-[16px] font-bold text-white tracking-tight">
                AI VORTEX
              </div>
              <div className="text-[11px] text-white/50 font-medium">
                {currentTime.toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  timeZoneName: 'short'
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-white/30" />
              <input
                type="text"
                className="w-full bg-[#050505] border border-white/[0.06] rounded-lg pl-10 pr-10 py-2 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-white/10"
                placeholder="Search contractors by name, ID, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-center border-l border-white/[0.06] pl-4">
              <div>
                <div className="text-[18px] font-bold text-white">{showingCount}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Showing</div>
              </div>
              <div>
                <div className="text-[18px] font-bold text-white">4,107</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Total</div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative" ref={syncPanelRef}>
                <button 
                  onClick={() => setShowSyncPanel(!showSyncPanel)}
                  className="px-3 py-2 bg-[#050505] border border-white/[0.06] text-white/70 text-[12px] font-medium rounded-md hover:bg-[#111113] hover:border-white/10 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-[14px] h-[14px]" />
                  Sync
                </button>
                
                {showSyncPanel && (
                  <div className="absolute right-0 top-full mt-2 w-80 z-50">
                    <SyncPanel />
                  </div>
                )}
              </div>
              
              <button className="px-3 py-2 bg-[#050505] border border-white/[0.06] text-white/70 text-[12px] font-medium rounded-md hover:bg-[#111113] hover:border-white/10 transition-colors flex items-center gap-2">
                <Download className="w-[14px] h-[14px]" />
                Export
              </button>
              
              {userInfo && (
                <div className="flex items-center gap-3 border-l border-white/[0.06] pl-4">
                  <div className="flex items-center gap-2">
                    {userInfo.picture && (
                      <img 
                        src={userInfo.picture} 
                        alt={userInfo.name}
                        className="w-7 h-7 rounded-full border border-white/[0.06]"
                      />
                    )}
                    <div className="text-[12px]">
                      <div className="text-white/70 font-medium">{userInfo.name}</div>
                      <div className="text-white/40 text-[10px]">{userInfo.email}</div>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="px-2 py-1 bg-[#050505] border border-white/[0.06] text-white/70 text-[11px] font-medium rounded hover:bg-[#111113] hover:border-white/10 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Calendar */}
          <div className="p-6 pb-0">
            <CampaignCalendar />
          </div>

          {/* Action Bar */}
          <div className="bg-[#0a0a0b] border-t border-b border-white/[0.06] px-6 py-2.5 flex justify-between items-center">
            <div className="flex items-center gap-6">
              {/* View Toggle */}
              <div className="flex bg-[#050505] border border-white/[0.06] rounded-md p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all flex items-center gap-1 ${
                    viewMode === 'grid' 
                      ? 'bg-[#0a0a0b] text-white' 
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <LayoutGrid className="w-[12px] h-[12px]" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all flex items-center gap-1 ${
                    viewMode === 'list' 
                      ? 'bg-[#0a0a0b] text-white' 
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <List className="w-[12px] h-[12px]" />
                  List
                </button>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-white/50 uppercase tracking-wider">Sort</span>
                <select 
                  className="bg-[#050505] border border-white/[0.06] text-white/70 px-2 py-1 rounded text-[11px] font-medium cursor-pointer appearance-none pr-6"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center'
                  }}
                >
                  <option value="score-high-low">Score: High → Low</option>
                  <option value="score-low-high">Score: Low → High</option>
                  <option value="reviews-recent">Reviews: Recent First</option>
                  <option value="domain-expiring">Domain: Expiring Soon</option>
                  <option value="campaign-ready">Campaign: Ready First</option>
                  <option value="recently-added">Recently Added</option>
                </select>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#facc15]"></div>
                <span className="text-white/70 font-semibold">{stats.ready}</span>
                <span className="text-white/30">ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></div>
                <span className="text-white/70 font-semibold">{stats.scheduled}</span>
                <span className="text-white/30">today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></div>
                <span className="text-white/70 font-semibold">{stats.sent}</span>
                <span className="text-white/30">sent</span>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-2">
              <button className="px-2.5 py-1 bg-[#050505] border border-white/[0.06] text-white/70 text-[11px] font-medium rounded hover:bg-[#111113] transition-colors">
                Select Mode
              </button>
              <button className="px-2.5 py-1 bg-[#3b82f6] text-white text-[11px] font-medium rounded hover:opacity-90 transition-opacity">
                Quick Schedule
              </button>
            </div>
          </div>

          {/* Cards Container */}
          <div className="flex-1 overflow-y-auto p-6">
            <ContractorGrid />
          </div>

          {/* Pagination */}
          <div className="bg-[#0a0a0b] border-t border-white/[0.06] px-6 py-4 flex justify-between items-center">
            <div className="text-[12px] text-white/50">
              Showing <strong className="text-white/70">1-{showingCount}</strong> of <strong className="text-white/70">4,107</strong> contractors
            </div>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center bg-[#050505] border border-white/[0.06] text-white/70 text-[12px] font-medium rounded hover:bg-[#111113] transition-colors disabled:opacity-30" disabled>
                ←
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#3b82f6] border border-[#3b82f6] text-white text-[12px] font-medium rounded">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#050505] border border-white/[0.06] text-white/70 text-[12px] font-medium rounded hover:bg-[#111113] transition-colors">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#050505] border border-white/[0.06] text-white/70 text-[12px] font-medium rounded hover:bg-[#111113] transition-colors">
                3
              </button>
              <span className="w-8 h-8 flex items-center justify-center text-white/30 text-[12px]">...</span>
              <button className="w-8 h-8 flex items-center justify-center bg-[#050505] border border-white/[0.06] text-white/70 text-[12px] font-medium rounded hover:bg-[#111113] transition-colors">
                21
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#050505] border border-white/[0.06] text-white/70 text-[12px] font-medium rounded hover:bg-[#111113] transition-colors">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar Footer */}
        <footer className="bg-[#0a0a0b] border-t border-white/[0.06] px-6 py-3 flex justify-between items-center text-[11px] text-white/50">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></div>
              <span>System Operational</span>
            </div>
            <div>Last Update: {new Date().toLocaleDateString()}</div>
            <div className="text-white/70">Queue: 2 campaigns processing</div>
          </div>
          <div className="flex gap-4">
            <span>Ready: {stats.ready}</span>
            <span>Scheduled: {stats.scheduled}</span>
            <span>Sent Today: {stats.sent}</span>
          </div>
        </footer>
      </main>

      {/* Profile Modal */}
      <ProfileModal />
    </div>
  );
}