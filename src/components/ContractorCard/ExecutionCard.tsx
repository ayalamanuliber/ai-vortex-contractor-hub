'use client';

import { Mail, Clock, CheckCircle, AlertCircle, Calendar, DollarSign, Target } from 'lucide-react';
import type { MergedContractor } from '@/lib/types';

interface ExecutionCardProps {
  contractor: MergedContractor;
  onClick: () => void;
}

// Helper function to get mega category
function getMegaCategory(category: string): string {
  if (!category) return 'Other';
  
  const cat = category.toLowerCase();
  
  if (cat.includes('roofing') || cat.includes('roof')) return 'Roofing';
  if (cat.includes('hvac') || cat.includes('heating') || cat.includes('cooling') || cat.includes('air conditioning')) return 'HVAC';
  if (cat.includes('plumber') || cat.includes('plumbing')) return 'Plumbing';
  if (cat.includes('electrician') || cat.includes('electric')) return 'Electrical';
  if (cat.includes('remodeling') || cat.includes('drywall') || cat.includes('carpet') || cat.includes('floor') || cat.includes('tile') || cat.includes('counter')) return 'Remodeling';
  if (cat.includes('landscap') || cat.includes('lawn') || cat.includes('siding')) return 'Exterior';
  if (cat.includes('concrete')) return 'Heavy Civil';
  if (cat.includes('home builder') || cat.includes('custom home')) return 'Home Building';
  if (cat.includes('handyman')) return 'Handyman';
  if (cat.includes('supplier')) return 'Suppliers';
  if (cat.includes('interior designer') || cat.includes('waterproofing')) return 'Services';
  if (cat.includes('general contractor') || cat.includes('construction company')) return 'Construction';
  if (cat.includes('window') || cat.includes('door') || cat.includes('glass')) return 'Windows';
  if (cat.includes('association') || cat.includes('organization')) return 'Other';
  
  return 'Other';
}

// Helper function to format cost
function formatCost(cost: number): string {
  if (cost < 0.01) return `$${(cost * 1000).toFixed(1)}k`;
  return `$${cost.toFixed(4)}`;
}

// Helper function to format tokens
function formatTokens(tokens: number): string {
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}K`;
  return tokens.toString();
}

// Helper function to format duration
function formatDuration(minutes: number): string {
  if (minutes < 1) return `${Math.round(minutes * 60)}s`;
  return `${Math.round(minutes * 10) / 10}min`;
}

export function ExecutionCard({ contractor, onClick }: ExecutionCardProps) {
  // Get campaign data
  const campaignData = contractor.campaignData;
  const hasCampaign = contractor.hasCampaign && campaignData;
  const emailSequences = campaignData?.email_sequences || [];
  const completedEmails = emailSequences.filter((e: any) => e.status === 'sent').length;
  const totalEmails = emailSequences.length || 3; // Default to 3 emails expected

  // Get completion score styling (same as IntelligenceCard)
  const getCompletionStyle = (score: number) => {
    if (score >= 80) return {
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
      shadowColor: 'shadow-emerald-500/20'
    };
    if (score >= 60) return {
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/30',
      bgColor: 'bg-yellow-500/10',
      shadowColor: 'shadow-yellow-500/20'
    };
    if (score >= 35) return {
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500/30',
      bgColor: 'bg-orange-500/10',
      shadowColor: 'shadow-orange-500/20'
    };
    return {
      textColor: 'text-red-400',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/10',
      shadowColor: 'shadow-red-500/20'
    };
  };

  const completionStyle = getCompletionStyle(contractor.completionScore);

  return (
    <div 
      className="group bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-lg hover:shadow-black/5 hover:border-border/60 transition-all duration-200"
      onClick={onClick}
      data-contractor-id={contractor.id}
    >
      {/* Header with Completion Circle and Business Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Elegant Completion Circle */}
          <div className="relative">
            <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${completionStyle.borderColor} ${completionStyle.bgColor} ${completionStyle.shadowColor} shadow-sm`}>
              <span className={`text-lg font-bold ${completionStyle.textColor}`}>
                {contractor.completionScore}%
              </span>
            </div>
          </div>
          
          {/* Business Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base mb-1 truncate">
              {contractor.businessName}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
              <span>{getMegaCategory(contractor.category)}</span>
              <span>•</span>
              <span className="text-primary font-medium">#{contractor.id}</span>
              <span>•</span>
              <span>{contractor.state}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Campaign Status */}
      <div className="mb-4">
        <div className="bg-muted/20 rounded-lg p-3 border border-border/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">CAMPAIGN READY</span>
            </div>
            {hasCampaign ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-400" />
            )}
          </div>
          <div className="space-y-1">
            <div className={`text-sm font-semibold ${hasCampaign ? 'text-emerald-400' : 'text-orange-400'}`}>
              Status: {hasCampaign ? 'Completed' : 'Setup Required'}
            </div>
            <div className="text-xs text-foreground">
              Emails: {hasCampaign ? `${totalEmails}/3 Personalized` : '0/3 Pending'}
            </div>
          </div>
        </div>
      </div>
      
      {hasCampaign && (
        <>
          {/* Timing and Processing Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-muted/20 rounded-lg p-3 border border-border/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Timing</span>
                <Calendar className="w-3 h-3 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">
                  Days: {campaignData?.contact_timing?.best_day_email_1?.slice(0,3)} › {campaignData?.contact_timing?.best_day_email_2?.slice(0,3)} › {campaignData?.contact_timing?.best_day_email_3?.slice(0,3)}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {campaignData?.contact_timing?.window_a_time} / {campaignData?.contact_timing?.window_b_time}
                </div>
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-3 border border-border/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Processing</span>
                <DollarSign className="w-3 h-3 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-foreground">
                  Cost: {formatCost(contractor.cost)} • {formatTokens(contractor.tokensUsed)} tokens
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {formatDuration(contractor.sessionDuration)} • Aug 28
                </div>
              </div>
            </div>
          </div>
          
          {/* Targeting Info */}
          <div className="bg-muted/20 rounded-lg p-3 border border-border/40 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Targeting</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-foreground">
                Approach: Reviews + Email
              </div>
              <div className="text-sm font-semibold text-foreground">
                Priority: Medium
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3" />
          <span>{hasCampaign ? 'Campaign Ready' : 'Setup Required'}</span>
        </div>
        <div className="truncate max-w-[200px]">
          {contractor.city}, {contractor.state} {contractor.zipCode}
        </div>
      </div>
    </div>
  );
}