'use client';

import { Star, Brain, TrendingUp, AlertCircle, MapPin, Clock, Globe } from 'lucide-react';
import type { MergedContractor } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

interface IntelligenceCardProps {
  contractor: MergedContractor;
  onClick: () => void;
}

export function IntelligenceCard({ contractor, onClick }: IntelligenceCardProps) {
  const campaignReady = contractor.hasFocusGroup && contractor.hasCampaign;
  
  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };
  
  const getSpeedColor = (speed: number) => {
    if (speed >= 85) return 'text-green-400';
    if (speed >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getReviewsColor = (recency: string) => {
    switch (recency) {
      case 'ACTIVE': return 'text-green-400';
      case 'MODERATE': return 'text-yellow-400';
      case 'INACTIVE': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="intelligence-card p-6 cursor-pointer" onClick={onClick}>
      {/* Header with Score Circle */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Prominent Completion Score Circle */}
          <div className="relative">
            <div 
              className={cn(
                "w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-lg",
                contractor.completionScore >= 85 
                  ? "border-green-500/30 bg-green-500/10 shadow-green-500/20"
                  : contractor.completionScore >= 70
                  ? "border-yellow-500/30 bg-yellow-500/10 shadow-yellow-500/20"  
                  : "border-orange-500/30 bg-orange-500/10 shadow-orange-500/20"
              )}
            >
              <span className={cn(
                "text-2xl font-bold",
                contractor.completionScore >= 85 ? "text-green-400" : 
                contractor.completionScore >= 70 ? "text-yellow-400" : 
                "text-orange-400"
              )}>
                {contractor.completionScore}
              </span>
            </div>
            <div className={cn(
              "absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
              contractor.completionScore >= 85 ? "bg-green-500" : 
              contractor.completionScore >= 70 ? "bg-yellow-500" : 
              "bg-orange-500"
            )}>
              <span className="text-sm font-bold text-white">%</span>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-1">
              {contractor.businessName}
            </h3>
            <div className="flex items-center space-x-2 text-sm mb-2">
              <span className="text-muted-foreground">{contractor.category}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary font-medium">ID: {contractor.id}</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1 font-medium">{contractor.googleRating.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">({contractor.reviewsCount})</span>
              </div>
              <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="text-xs">{contractor.state}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                Intelligence Ready
              </span>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                campaignReady 
                  ? "text-green-400 bg-green-400/10" 
                  : "text-orange-400 bg-orange-400/10"
              )}>
                {campaignReady ? 'Exec Ready' : 'Setup Req'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Intelligence Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card/40 rounded-lg p-3 border border-border/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Website Speed
            </span>
            <Globe className="w-3 h-3 text-muted-foreground" />
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn(
              "text-lg font-bold",
              getSpeedColor(contractor.intelligence.websiteSpeed.mobile)
            )}>
              {contractor.intelligence.websiteSpeed.mobile}
            </span>
            <div className="flex-1">
              <div className="w-full bg-muted/20 rounded-full h-1.5">
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    contractor.intelligence.websiteSpeed.mobile >= 80 ? 'bg-green-400' : 
                    contractor.intelligence.websiteSpeed.mobile >= 60 ? 'bg-yellow-400' : 
                    'bg-red-400'
                  )}
                  style={{ width: `${Math.min(contractor.intelligence.websiteSpeed.mobile, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-card/40 rounded-lg p-3 border border-border/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Reviews
            </span>
            <Clock className="w-3 h-3 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-xs font-bold uppercase",
              getReviewsColor(contractor.intelligence.reviewsRecency)
            )}>
              {contractor.intelligence.reviewsRecency}
            </span>
            <span className="text-xs text-muted-foreground">
              {contractor.intelligence.daysSinceLatest}d
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {contractor.intelligence.platformDetection}
          </div>
        </div>
      </div>
      
      {/* Intelligence Insights */}
      <div className="bg-card/20 rounded-lg p-3 border border-border/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Key Insights
          </span>
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-foreground flex items-center">
            <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
            {contractor.completionScore >= 85 ? 
              'High completion score indicates strong digital presence' :
              'Completion score shows room for digital improvement'
            }
          </div>
          <div className="text-xs text-foreground flex items-center">
            <AlertCircle className="w-3 h-3 mr-1 text-yellow-400" />
            {contractor.intelligence.reviewsRecency.toLowerCase()} review activity detected
          </div>
          <div className="text-xs text-primary flex items-center">
            <Brain className="w-3 h-3 mr-1" />
            Ready for intelligence analysis
          </div>
        </div>
      </div>
      
      {/* Footer with additional metrics */}
      <div className="mt-3 pt-3 border-t border-border/20">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <span className="text-muted-foreground">
              Health: <span className={getHealthScoreColor(contractor.healthScore)}>{contractor.healthScore}</span>
            </span>
            <span className="text-muted-foreground">
              Trust: <span className={getHealthScoreColor(contractor.trustScore)}>{contractor.trustScore}</span>
            </span>
          </div>
          <div className="text-muted-foreground">
            {contractor.sophisticationTier}
          </div>
        </div>
      </div>
    </div>
  );
}