'use client';

import { TopNav } from '@/components/Navigation/TopNav';
import { FilterSidebar } from '@/components/Sidebar/FilterSidebar';
import { ContractorGrid } from '@/components/ContractorGrid';
import { CampaignCalendar } from '@/components/Calendar/CampaignCalendar';
import { ProfileModal } from '@/components/ProfileModal/ProfileModal';
import { useContractorStore } from '@/stores/contractorStore';
import { TrendingUp, Users, Mail, Target } from 'lucide-react';

export default function HomePage() {
  const { 
    showingCount, 
    filteredContractors, 
    currentMode 
  } = useContractorStore();

  // Calculate stats
  const stats = {
    total: showingCount,
    withCampaigns: filteredContractors.filter(c => c.hasCampaign).length,
    highCompletion: filteredContractors.filter(c => c.completionScore >= 85).length,
    avgCompletion: filteredContractors.length > 0 
      ? Math.round(filteredContractors.reduce((sum, c) => sum + c.completionScore, 0) / filteredContractors.length)
      : 0,
  };

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <TopNav />
      
      {/* Main Content */}
      <div className="pt-16 flex">
        {/* Left Sidebar - Filters */}
        <FilterSidebar />
        
        {/* Main Content Area */}
        <div className="ml-80 flex-1 p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {currentMode === 'intelligence' 
                  ? 'Final Dossier Intelligence Hub'
                  : 'Campaign Execution Center'
                }
              </h2>
              <p className="text-muted-foreground text-sm">
                {currentMode === 'intelligence'
                  ? 'Complete intelligence profiles • Performance analytics • Business insights'
                  : 'Campaign management • Email execution • Activity tracking'
                }
              </p>
            </div>

            {/* Operations Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card/20 border border-border/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Contractors</span>
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Active in database
                </div>
              </div>
              
              <div className="bg-card/20 border border-border/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">High Completion</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">{stats.highCompletion}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  85% or higher score
                </div>
              </div>
              
              <div className="bg-card/20 border border-border/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Active Campaigns</span>
                  <Mail className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-400">{stats.withCampaigns}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Campaign ready
                </div>
              </div>
              
              <div className="bg-card/20 border border-border/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Avg. Completion</span>
                  <Target className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400">{stats.avgCompletion}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Overall score
                </div>
              </div>
            </div>

            {/* Status Bar */}
            <div className="bg-card/20 border border-border/40 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">System Status: </span>
                    <span className="text-primary font-semibold">Operational</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Last Update:</span>
                    <span className="text-foreground font-semibold">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Mode:</span>
                    <span className={`font-semibold ${
                      currentMode === 'intelligence' ? 'text-primary' : 'text-green-400'
                    }`}>
                      {currentMode === 'intelligence' ? 'Intelligence' : 'Execution'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-2 bg-muted/20 px-3 py-2 rounded">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-400">Queue: 2</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/20 px-3 py-2 rounded">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-amber-400">Ready: {stats.withCampaigns}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/20 px-3 py-2 rounded">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Sent: 0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Calendar */}
          <CampaignCalendar />

          {/* Contractor Grid */}
          <ContractorGrid />
          
          {/* Stats Footer */}
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              Showing {showingCount} contractors with complete dossier intelligence
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">
                  {stats.highCompletion} High Completion Scores
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">
                  {stats.withCampaigns} Campaign Data Integrated
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-muted-foreground">Full Dossier Intelligence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Modal */}
      <ProfileModal />
    </div>
  );
}