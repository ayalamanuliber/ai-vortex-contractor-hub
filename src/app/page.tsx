'use client';

import { TrendingUp, Users, Mail, Target } from 'lucide-react';

export default function HomePage() {
  const stats = {
    total: 100,
    withCampaigns: 10,
    highCompletion: 25,
    avgCompletion: 75,
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="p-6">
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              AI Vortex - Contractor Intelligence Hub
            </h2>
            <p className="text-muted-foreground text-sm">
              Complete intelligence profiles • Campaign execution • Activity tracking
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

          {/* Status */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              System ready - {stats.total} contractors loaded
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Intelligence Mode</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">Campaign Integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-muted-foreground">Data Processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}