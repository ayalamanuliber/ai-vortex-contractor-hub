'use client';

import { Star, Brain } from 'lucide-react';
import type { MergedContractor } from '@/lib/types';

interface IntelligenceCardProps {
  contractor: MergedContractor;
  onClick: () => void;
}

export function IntelligenceCard({ contractor, onClick }: IntelligenceCardProps) {
  const campaignReady = contractor.hasFocusGroup && contractor.hasCampaign;
  
  // Debug for specific contractor
  if (contractor.id === '3993') {
    console.log('COMPONENT DEBUG 3993:', {
      id: contractor.id,
      completionScore: contractor.completionScore,
      type: typeof contractor.completionScore,
      businessName: contractor.businessName
    });
  }

  return (
    <div className="intelligence-card p-6 cursor-pointer" onClick={onClick}>
      {/* Header with Prominent Completion Score Circle - exact match to HTML */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Prominent Completion Score Circle */}
          <div className="relative">
            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-lg ${
              contractor.completionScore >= 85 
                ? "border-green-500/30 bg-green-500/10 shadow-green-500/20"
                : contractor.completionScore >= 70
                ? "border-yellow-500/30 bg-yellow-500/10 shadow-yellow-500/20" 
                : contractor.completionScore >= 50
                ? "border-orange-500/30 bg-orange-500/10 shadow-orange-500/20"
                : "border-red-500/30 bg-red-500/10 shadow-red-500/20"
            }`}>
              <span className={`text-2xl font-bold ${
                contractor.completionScore >= 85 ? "text-green-400"
                : contractor.completionScore >= 70 ? "text-yellow-400"
                : contractor.completionScore >= 50 ? "text-orange-400"
                : "text-red-400"
              }`}>
                {contractor.completionScore}
              </span>
            </div>
            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
              contractor.completionScore >= 85 ? "bg-green-500"
              : contractor.completionScore >= 70 ? "bg-yellow-500"
              : contractor.completionScore >= 50 ? "bg-orange-500"
              : "bg-red-500"
            }`}>
              <span className="text-sm font-bold text-white">%</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-lg mb-1">{contractor.businessName}</h3>
            <div className="flex items-center space-x-2 text-sm mb-2">
              <span className="text-muted-foreground">{contractor.category}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary font-medium">ID: {contractor.id}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1 font-medium">{contractor.googleRating}</span>
                <span className="text-muted-foreground ml-1">({contractor.reviewsCount})</span>
              </div>
              <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">Intelligence Ready</span>
              <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                campaignReady ? 'text-green-400 bg-green-400/10' : 'text-orange-400 bg-orange-400/10'
              }`}>
                {campaignReady ? 'Exec Ready' : 'Setup Req'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Intelligence Metrics Grid - exact match to HTML */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card/40 rounded-lg p-3 border border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Website Speed</span>
            <span className={`text-sm font-bold ${
              contractor.intelligence.websiteSpeed.mobile >= 80 ? 'text-green-400' 
              : contractor.intelligence.websiteSpeed.mobile >= 60 ? 'text-yellow-400' 
              : 'text-red-400'
            }`}>
              {contractor.intelligence.websiteSpeed.mobile}
            </span>
          </div>
          <div className="mt-1 w-full bg-muted/20 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${
                contractor.intelligence.websiteSpeed.mobile >= 80 ? 'bg-green-400' 
                : contractor.intelligence.websiteSpeed.mobile >= 60 ? 'bg-yellow-400' 
                : 'bg-red-400'
              }`}
              style={{ width: `${contractor.intelligence.websiteSpeed.mobile}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-card/40 rounded-lg p-3 border border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Reviews</span>
            <span className={`text-xs font-bold ${
              contractor.intelligence.reviewsRecency === 'ACTIVE' ? 'text-green-400' 
              : contractor.intelligence.reviewsRecency === 'MODERATE' ? 'text-yellow-400' 
              : 'text-red-400'
            }`}>
              {contractor.intelligence.reviewsRecency}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">{contractor.intelligence.platformDetection}</div>
        </div>
      </div>
      
      {/* Intelligence Insights - exact match to HTML */}
      <div className="bg-card/20 rounded-lg p-3 border border-border/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Key Insights</span>
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-foreground">• High completion score indicates strong digital presence</div>
          <div className="text-xs text-foreground">• {contractor.intelligence.reviewsRecency.toLowerCase()} review activity detected</div>
          <div className="text-xs text-primary">• Ready for intelligence analysis</div>
        </div>
      </div>
    </div>
  );
}