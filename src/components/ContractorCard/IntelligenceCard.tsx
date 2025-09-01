'use client';

import { Star } from 'lucide-react';
import type { MergedContractor } from '@/lib/types';

interface IntelligenceCardProps {
  contractor: MergedContractor;
  onClick: () => void;
}

// Helper function to get builder display name
function getBuilderDisplay(builder: string | undefined): string {
  if (!builder || builder === '' || builder === 'WordPress' || builder === 'Apache' || builder === 'Nginx' || builder === 'Unknown' || builder === 'ERROR') {
    return 'Custom';
  }
  return builder;
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

// Helper function to calculate days until domain expires
function getDaysUntilExpiration(expiringSoon: number): string {
  if (expiringSoon === 1) {
    return 'Expiring soon ⚠️';
  }
  // Placeholder - in real implementation you'd calculate from expiration date
  return '183 days left';
}

export function IntelligenceCard({ contractor, onClick }: IntelligenceCardProps) {
  const { intelligence, completionScore, googleRating, reviewsCount } = contractor;
  
  // Get PSI scores
  const mobileScore = intelligence.websiteSpeed.mobile || 0;
  const desktopScore = intelligence.websiteSpeed.desktop || 0;
  const avgScore = intelligence.websiteSpeed.average || 0;
  
  // Get review activity status
  const reviewStatus = intelligence.reviewsRecency === 'ACTIVE' ? 'ACTIVE' : 
                      intelligence.reviewsRecency === 'INACTIVE' ? 'INACTIVE' : 'UNKNOWN';
  
  // Get builder info
  const builderName = getBuilderDisplay(intelligence.websiteBuilder);
  const domainAge = intelligence.domainAge || 0;
  const domainExpiration = getDaysUntilExpiration(intelligence.expiringSoon || 0);
  
  // Get completion score color
  const getCompletionColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400'; 
    if (score >= 35) return 'text-orange-400';
    return 'text-red-400';
  };
  
  // Get PSI color indicator
  const getPSIColor = (avg: number) => {
    if (avg >= 85) return '🟢';
    if (avg >= 60) return '🟡';
    return '🔴';
  };

  return (
    <div 
      className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors space-y-3"
      onClick={onClick}
      data-contractor-id={contractor.id}
    >
      {/* Header Line: 55% #3092 Remodeling • KS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className={`text-xl font-bold ${getCompletionColor(completionScore)}`}>
            {completionScore}%
          </span>
          <span className="text-sm text-muted-foreground">
            #{contractor.id}
          </span>
          <span className="text-sm font-medium text-foreground">
            {getMegaCategory(contractor.category)}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm font-medium text-foreground">
            {contractor.state}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border"></div>

      {/* PSI Line: PSI: 45/73 (59 avg) 🟡 */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-muted-foreground">PSI:</span>
        <span className="text-sm text-foreground">
          {mobileScore}/{desktopScore} ({avgScore} avg)
        </span>
        <span className="text-base">{getPSIColor(avgScore)}</span>
      </div>

      {/* Reviews Line: Reviews: 3.7⭐(3) • ACTIVE */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-muted-foreground">Reviews:</span>
        <div className="flex items-center space-x-1">
          <span className="text-sm text-foreground">{googleRating}</span>
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-muted-foreground">({reviewsCount})</span>
        </div>
        <span className="text-muted-foreground">•</span>
        <span className={`text-sm font-medium ${
          reviewStatus === 'ACTIVE' ? 'text-green-400' : 
          reviewStatus === 'INACTIVE' ? 'text-orange-400' : 'text-muted-foreground'
        }`}>
          {reviewStatus}
        </span>
      </div>

      {/* Builder Line: Builder: Custom • 6.5yrs */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-muted-foreground">Builder:</span>
        <span className="text-sm text-foreground">{builderName}</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-sm text-foreground">{domainAge}yrs</span>
      </div>

      {/* Domain Line: Domain: 183 days left */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-muted-foreground">Domain:</span>
        <span className={`text-sm ${
          intelligence.expiringSoon === 1 ? 'text-red-400 font-medium' : 'text-foreground'
        }`}>
          {domainExpiration}
        </span>
      </div>

      {/* Location Line: Location: Tonganoxie, KS 66086 */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-muted-foreground">Location:</span>
        <span className="text-sm text-foreground">
          {contractor.city}, {contractor.state} {contractor.zipCode}
        </span>
      </div>
    </div>
  );
}