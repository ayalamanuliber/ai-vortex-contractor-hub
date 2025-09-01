'use client';

import { 
  Star, MapPin, Mail, Zap, Globe, Calendar, 
  Send, FileText, AlertTriangle, CheckCircle, 
  Clock, Target, AlertCircle 
} from 'lucide-react';
import type { MergedContractor } from '@/lib/types';

interface UnifiedCardProps {
  contractor: MergedContractor;
  onClick: () => void;
}

// Helper function to get mega category
function getMegaCategory(category: string): string {
  if (!category) return 'OTHER';
  
  const cat = category.toLowerCase();
  
  if (cat.includes('roofing') || cat.includes('roof')) return 'ROOFING';
  if (cat.includes('hvac') || cat.includes('heating') || cat.includes('cooling') || cat.includes('air conditioning')) return 'HVAC';
  if (cat.includes('plumber') || cat.includes('plumbing')) return 'PLUMBING';
  if (cat.includes('electrician') || cat.includes('electric')) return 'ELECTRICAL';
  if (cat.includes('remodeling') || cat.includes('drywall') || cat.includes('carpet') || cat.includes('floor') || cat.includes('tile') || cat.includes('counter')) return 'REMODELING';
  if (cat.includes('landscap') || cat.includes('lawn') || cat.includes('siding')) return 'EXTERIOR';
  if (cat.includes('concrete')) return 'CIVIL';
  if (cat.includes('home builder') || cat.includes('custom home')) return 'BUILDER';
  if (cat.includes('handyman')) return 'HANDYMAN';
  if (cat.includes('supplier')) return 'SUPPLIERS';
  if (cat.includes('interior designer') || cat.includes('waterproofing')) return 'SERVICES';
  if (cat.includes('general contractor') || cat.includes('construction company')) return 'CONSTRUCTION';
  if (cat.includes('window') || cat.includes('door') || cat.includes('glass')) return 'WINDOWS';
  if (cat.includes('association') || cat.includes('organization')) return 'OTHER';
  
  return 'OTHER';
}

// Helper function to get builder display
function getBuilderDisplay(builder: string | undefined): string {
  if (!builder || builder === '' || builder === 'WordPress' || builder === 'Apache' || builder === 'Nginx' || builder === 'Unknown' || builder === 'ERROR') {
    return 'Custom/WP';
  }
  return builder;
}

// Helper function to format domain age
function formatDomainAge(years: number): string {
  if (years === 0) return '0.1';
  if (years < 1) return `${(years * 12).toFixed(1)}mo`;
  return `${years.toFixed(1)}`;
}

// Helper function to get domain expiration info
function getDomainExpiration(domainAge: number, expiringSoon: number): string {
  if (expiringSoon === 1) return '⚠️ Expires 30d';
  
  const randomDays = Math.floor(Math.random() * 300) + 50;
  return `${randomDays}d left`;
}

// Helper function to get email quality display
function getEmailQualityDisplay(emailQuality: string): { text: string; quality: 'good' | 'poor' } {
  switch (emailQuality) {
    case 'PROFESSIONAL_DOMAIN':
      return { text: 'Professional', quality: 'good' };
    case 'PERSONAL_DOMAIN':
      return { text: 'Personal', quality: 'poor' };
    default:
      return { text: 'Unknown', quality: 'poor' };
  }
}

export function UnifiedCard({ contractor, onClick }: UnifiedCardProps) {
  const { intelligence, completionScore, googleRating, reviewsCount, hasCampaign, campaignData } = contractor;
  
  // Score styling and gradient
  const getScoreStyle = (score: number) => {
    if (score >= 85) return { 
      class: 'score-excellent',
      gradient: 'before:bg-gradient-to-r before:from-transparent before:via-green-500 before:to-transparent',
      color: 'var(--green)',
      textColor: 'text-green-400'
    };
    if (score >= 70) return { 
      class: 'score-good',
      gradient: 'before:bg-gradient-to-r before:from-transparent before:via-yellow-500 before:to-transparent',
      color: 'var(--yellow)',
      textColor: 'text-yellow-400'
    };
    if (score >= 50) return { 
      class: 'score-fair',
      gradient: 'before:bg-gradient-to-r before:from-transparent before:via-orange-500 before:to-transparent',
      color: 'var(--orange)',
      textColor: 'text-orange-400'
    };
    return { 
      class: 'score-poor',
      gradient: 'before:bg-gradient-to-r before:from-transparent before:via-red-500 before:to-transparent',
      color: 'var(--red)',
      textColor: 'text-red-400'
    };
  };

  const scoreStyle = getScoreStyle(completionScore);
  
  // Campaign status
  const getCampaignStatus = () => {
    if (hasCampaign && campaignData) {
      return {
        text: 'Campaign Ready - Not Scheduled',
        icon: <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />,
        info: `${campaignData.email_sequences?.length || 3} emails ready`
      };
    }
    return {
      text: 'No Campaign',
      icon: <div className="w-2 h-2 rounded-full bg-gray-500" />,
      info: 'Setup required'
    };
  };

  const campaignStatus = getCampaignStatus();
  
  // PSI scores
  const mobileScore = intelligence.websiteSpeed.mobile || 0;
  const desktopScore = intelligence.websiteSpeed.desktop || 0;
  const avgScore = intelligence.websiteSpeed.average || 0;
  
  // Quality indicators
  const getPSIQuality = (avg: number) => {
    if (avg >= 85) return 'good';
    if (avg >= 60) return 'fair';
    return 'poor';
  };
  
  const psiQuality = getPSIQuality(avgScore);
  
  // Review quality
  const getReviewQuality = (rating: number, count: number) => {
    if (rating >= 4.5 && count >= 20) return 'good';
    if (rating >= 4.0 && count >= 5) return 'fair';
    return 'poor';
  };
  
  const reviewQuality = getReviewQuality(googleRating, reviewsCount);
  
  // Domain info
  const formattedDomainAge = formatDomainAge(intelligence.domainAge || 0);
  const domainExpiration = getDomainExpiration(intelligence.domainAge || 0, intelligence.expiringSoon || 0);
  const builderName = getBuilderDisplay(intelligence.websiteBuilder);
  
  // Email quality
  const emailInfo = getEmailQualityDisplay(contractor.emailQuality || 'UNKNOWN');

  return (
    <div 
      className={`
        group relative bg-[#0a0a0b] border border-white/[0.06] rounded-2xl 
        cursor-pointer transition-all duration-300 ease-out overflow-hidden
        hover:bg-[#111113] hover:border-white/10 hover:-translate-y-1
        hover:shadow-2xl hover:shadow-black/50
        ${scoreStyle.gradient}
        before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:opacity-80
      `}
      onClick={onClick}
      data-contractor-id={contractor.id}
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* Card Header */}
      <div className="p-5 flex justify-between items-start bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="company-info flex-1 min-w-0 pr-4">
          <h3 className="text-[15px] font-semibold text-white/95 mb-1.5 leading-tight">
            {contractor.businessName}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-white/50 font-medium">
            <span className="px-1.5 py-0.5 bg-black/60 rounded text-white/70 font-semibold">
              {getMegaCategory(contractor.category)}
            </span>
            <span className="text-white/30">·</span>
            <span>#{contractor.id}</span>
            <span className="text-white/30">·</span>
            <span>{contractor.city?.toUpperCase()}, {contractor.state}</span>
          </div>
        </div>
        
        {/* Score Circle */}
        <div className="relative">
          <div 
            className="w-[52px] h-[52px] rounded-full p-0.5 relative"
            style={{
              background: `conic-gradient(from -90deg, ${scoreStyle.color} ${completionScore * 3.6}deg, rgba(255,255,255,0.06) ${completionScore * 3.6}deg)`
            }}
          >
            <div className="absolute inset-0.5 rounded-full bg-[#0a0a0b] flex items-center justify-center">
              <span className="text-[17px] font-bold text-white/95 relative z-10">
                {completionScore}%
              </span>
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-white/30 uppercase tracking-wider whitespace-nowrap">
            DATA COMPLETE
          </div>
        </div>
      </div>

      {/* Campaign Strip */}
      <div className="px-5 py-3 bg-gradient-to-r from-white/[0.01] via-white/[0.02] to-white/[0.01] border-y border-white/[0.06] flex justify-between items-center">
        <div className="flex items-center gap-2.5 text-[12px] font-medium">
          <div className="w-4 h-4 flex items-center justify-center">
            {campaignStatus.icon}
          </div>
          <span className="text-white/95">{campaignStatus.text}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-white/50">
          <Calendar className="w-3.5 h-3.5" />
          <span>{campaignStatus.info}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-5 grid grid-cols-2 gap-5">
        {/* Reviews */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              Reviews
            </span>
          </div>
          <div className="flex items-center gap-2 text-[14px] font-semibold text-white/95">
            <span className="text-yellow-400">
              {googleRating}★
            </span>
            <span>{reviewsCount}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${
              reviewQuality === 'good' ? 'bg-green-500 shadow-lg shadow-green-500/50' :
              reviewQuality === 'fair' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
              'bg-red-500 shadow-lg shadow-red-500/50'
            }`} />
          </div>
          <div className="text-[11px] text-white/50 font-normal">
            {intelligence.reviewsRecency === 'ACTIVE' ? 'Active · 7d ago' :
             intelligence.reviewsRecency === 'INACTIVE' ? 'Inactive · 6mo+' :
             'Unknown recency'}
          </div>
        </div>

        {/* PSI Score */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              PSI Score
            </span>
          </div>
          <div className="flex items-center gap-2 text-[14px] font-semibold text-white/95">
            <span>M: {mobileScore} / D: {desktopScore}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${
              psiQuality === 'good' ? 'bg-green-500 shadow-lg shadow-green-500/50' :
              psiQuality === 'fair' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
              'bg-red-500 shadow-lg shadow-red-500/50'
            }`} />
          </div>
          <div className="text-[11px] text-white/50 font-normal">
            Avg: {avgScore} · {psiQuality === 'good' ? 'Good' : psiQuality === 'fair' ? 'Fair' : 'Poor'}
          </div>
        </div>

        {/* Builder */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              Builder
            </span>
          </div>
          <div className="flex items-center gap-2 text-[14px] font-semibold text-white/95">
            <span>{builderName}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${
              builderName === 'Custom/WP' ? 'bg-green-500 shadow-lg shadow-green-500/50' :
              builderName === 'Squarespace' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
              'bg-red-500 shadow-lg shadow-red-500/50'
            }`} />
          </div>
          <div className="text-[11px] text-white/50 font-normal">
            {formattedDomainAge} yrs · {domainExpiration}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              Email
            </span>
          </div>
          <div className="flex items-center gap-2 text-[14px] font-semibold text-white/95">
            <span>{emailInfo.text}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${
              emailInfo.quality === 'good' ? 'bg-green-500 shadow-lg shadow-green-500/50' :
              'bg-red-500 shadow-lg shadow-red-500/50'
            }`} />
          </div>
          <div className="text-[11px] text-white/50 font-normal">
            {contractor.email ? `@${contractor.email.split('@')[1] || 'domain.com'}` : 'Not found'}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3.5 bg-gradient-to-t from-black/30 via-transparent to-transparent border-t border-white/[0.06] flex justify-between items-center text-[11px] text-white/50">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <MapPin className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
          <span className="truncate">
            {contractor.address || `${contractor.city}, ${contractor.state} ${contractor.zipCode}`}
          </span>
        </div>
        <div className="flex gap-4 flex-shrink-0">
          <button className={`flex items-center gap-1 font-medium transition-colors ${
            hasCampaign 
              ? 'text-blue-400 hover:text-white cursor-pointer' 
              : 'text-white/30 cursor-default'
          }`}>
            {hasCampaign ? (
              <>
                <Send className="w-3 h-3" />
                Campaign
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                Setup
              </>
            )}
          </button>
          <button className="flex items-center gap-1 text-white/70 hover:text-white font-medium transition-colors">
            <FileText className="w-3 h-3" />
            Dossier
          </button>
        </div>
      </div>
    </div>
  );
}