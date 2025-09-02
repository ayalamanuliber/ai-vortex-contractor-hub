'use client';

import React, { useState } from 'react';
import { 
  X, Globe, Mail, Phone, MapPin, Star, TrendingUp, 
  ArrowLeft, Printer, Edit, Calendar, Copy, Building,
  Clock, User, FileText, Activity, AlertCircle
} from 'lucide-react';
import { useContractorStore } from '@/stores/contractorStore';
import { cn } from '@/lib/utils/cn';

interface TabContentProps {
  currentProfile: any;
  activeTab: string;
}

const IntelligenceTab = ({ currentProfile }: TabContentProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#facc15';
    return '#f87171';
  };

  // Extract reviews from rawData
  const reviews = [];
  if (currentProfile.rawData) {
    for (let i = 1; i <= 5; i++) {
      const rating = currentProfile.rawData[`L1_review_${i}_rating`];
      const text = currentProfile.rawData[`L1_review_${i}_text`];
      const date = currentProfile.rawData[`L1_review_${i}_date`];
      const author = currentProfile.rawData[`L1_review_${i}_author`];
      const relativeTime = currentProfile.rawData[`L1_review_${i}_relative_time`];
      
      if (rating && author) {
        reviews.push({ rating: parseInt(rating), text, date, author, relativeTime });
      }
    }
  }

  const hasWhoisData = currentProfile.rawData?.L1_whois_domain_age_years || 
                       currentProfile.rawData?.L1_whois_days_until_expiry;
  
  const hasPSIData = currentProfile.rawData?.L1_psi_mobile_performance || 
                     currentProfile.rawData?.L1_psi_desktop_performance;

  return (
    <div className="space-y-4">
      {/* Google Reviews Intelligence */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.06] flex items-center gap-3">
          <Star className="w-4 h-4 opacity-50" style={{ color: '#3b82f6' }} />
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Google Reviews Intelligence</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-[70%_30%] gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-6 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-[28px] font-bold" style={{ color: '#facc15' }}>
                    {currentProfile.googleRating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-yellow-400 text-[16px]">★★★★★</span>
                </div>
                <div className="flex gap-5 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-white/30 uppercase">Total Reviews</span>
                    <span className="font-semibold text-white">{currentProfile.reviewsCount || 0}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-white/30 uppercase">Review Frequency</span>
                    <span className="font-semibold" style={{ 
                      color: currentProfile.intelligence?.reviewsRecency === 'ACTIVE' ? '#22c55e' : 
                             currentProfile.intelligence?.reviewsRecency === 'MODERATE' ? '#facc15' : '#f87171'
                    }}>
                      {currentProfile.intelligence?.reviewsRecency || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-white/30 uppercase">Days Since Latest</span>
                    <span className="font-semibold text-white">{currentProfile.intelligence?.daysSinceLatest || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={index} className="p-4 bg-[#050505] rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-[13px]">{review.author}</span>
                          <span className="text-yellow-400 text-xs">{'★'.repeat(review.rating)}</span>
                        </div>
                        <span className="text-[11px] text-white/30">{review.relativeTime || review.date}</span>
                      </div>
                      <div className="text-xs text-white/70 leading-relaxed">
                        {review.text || '[No review text]'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/30 text-sm">
                  No review details available
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-[#050505] rounded-md">
                <div className="text-[10px] text-white/30 uppercase mb-2">Business Hours</div>
                <div className="text-xs text-white leading-relaxed">
                  {currentProfile.rawData?.L1_weekday_hours ? 
                    currentProfile.rawData.L1_weekday_hours.split(';').map((hours: string, i: number) => (
                      <div key={i}>{hours}</div>
                    )) : 'Not available'
                  }
                </div>
              </div>
              <div className="p-3 bg-[#050505] rounded-md">
                <div className="text-[10px] text-white/30 uppercase mb-2">Business Status</div>
                <div className="text-xs text-white">{currentProfile.rawData?.L1_business_status || 'OPERATIONAL'}</div>
              </div>
              <div className="p-3 bg-[#050505] rounded-md">
                <div className="text-[10px] text-white/30 uppercase mb-2">Targeting Insights</div>
                <div className="text-xs text-white leading-relaxed">
                  Health: {currentProfile.rawData?.L1_targeting_business_health || 'EMERGING'}<br/>
                  Priority: {currentProfile.rawData?.L1_targeting_outreach_priority || 'MEDIUM'}<br/>
                  Approach: {currentProfile.rawData?.L1_targeting_best_approach || 'GENERAL'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHOIS Domain Intelligence */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.06] flex items-center gap-3">
          <Globe className="w-4 h-4 opacity-50" style={{ color: '#a855f7' }} />
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">WHOIS Domain Intelligence</span>
        </div>
        <div className="p-5">
          {hasWhoisData ? (
            <div className="grid grid-cols-3 gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/30 uppercase">Domain Age</span>
                <span className="text-[13px] text-white font-medium">
                  {currentProfile.rawData?.L1_whois_domain_age_years ? 
                    `${parseFloat(currentProfile.rawData.L1_whois_domain_age_years).toFixed(1)} yrs` : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/30 uppercase">Days Until Expiry</span>
                <span className="text-[13px] text-white font-medium">
                  {currentProfile.rawData?.L1_whois_days_until_expiry || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/30 uppercase">Registration Status</span>
                <span className="text-[13px] text-white font-medium">Active</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <AlertCircle className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <div className="text-white/30">WHOIS data not available</div>
              <div className="text-[11px] text-white/20 mt-1">Domain information could not be retrieved</div>
            </div>
          )}
        </div>
      </div>

      {/* PSI Performance Intelligence */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.06] flex items-center gap-3">
          <TrendingUp className="w-4 h-4 opacity-50" style={{ color: '#22c55e' }} />
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">PSI Performance Intelligence</span>
        </div>
        <div className="p-5">
          {hasPSIData ? (
            <>
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div className="p-4 bg-[#050505] rounded-md text-center">
                  <div className="text-[32px] font-bold mb-1" style={{ 
                    color: getScoreColor(parseInt(currentProfile.rawData?.L1_psi_mobile_performance) || 0)
                  }}>
                    {currentProfile.rawData?.L1_psi_mobile_performance || '—'}
                  </div>
                  <div className="text-[11px] text-white/50 uppercase">Mobile</div>
                </div>
                <div className="p-4 bg-[#050505] rounded-md text-center">
                  <div className="text-[32px] font-bold mb-1" style={{ 
                    color: getScoreColor(parseInt(currentProfile.rawData?.L1_psi_desktop_performance) || 0)
                  }}>
                    {currentProfile.rawData?.L1_psi_desktop_performance || '—'}
                  </div>
                  <div className="text-[11px] text-white/50 uppercase">Desktop</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 uppercase">Average Score</span>
                  <span className="text-[13px] text-white font-medium">
                    {currentProfile.rawData?.L1_psi_avg_performance || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 uppercase">Classification</span>
                  <span className="text-[13px] text-white font-medium">
                    {(currentProfile.rawData?.L1_psi_avg_performance >= 80) ? 'Excellent' :
                     (currentProfile.rawData?.L1_psi_avg_performance >= 60) ? 'Good' :
                     (currentProfile.rawData?.L1_psi_avg_performance >= 40) ? 'Fair' : 'Poor'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <TrendingUp className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <div className="text-white/30">PSI data not available</div>
              <div className="text-[11px] text-white/20 mt-1">Performance metrics could not be measured</div>
            </div>
          )}
        </div>
      </div>

      {/* Builder Intelligence */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.06] flex items-center gap-3">
          <Building className="w-4 h-4 opacity-50" style={{ color: '#fb923c' }} />
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Builder Intelligence</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/30 uppercase">Platform</span>
              <span className="text-[13px] text-white font-medium">
                {currentProfile.rawData?.L1_builder_platform || 'Not detected'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/30 uppercase">Detection Status</span>
              <span className="text-[13px] font-medium" style={{ color: '#fb923c' }}>
                {currentProfile.rawData?.L1_builder_status || 'ERROR'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/30 uppercase">Website</span>
              <span className="text-[13px] text-white font-medium">
                {currentProfile.rawData?.L2_normalized_domain || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/30 uppercase">Category</span>
              <span className="text-[13px] text-white font-medium">
                {currentProfile.rawData?.L1_builder_category || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignTab = ({ currentProfile }: TabContentProps) => {
  if (!currentProfile.hasCampaign) {
    return (
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="p-5">
          <div className="text-center py-10">
            <Calendar className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <div className="text-white/30">No campaign data available</div>
            <div className="text-[11px] text-white/20 mt-1">Generate a campaign to see email sequences here</div>
          </div>
        </div>
      </div>
    );
  }

  const emailSequences = currentProfile.campaignData?.emailSequences || [];

  return (
    <div className="space-y-4">
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.06] flex items-center gap-3">
          <Calendar className="w-4 h-4 opacity-50" style={{ color: '#22c55e' }} />
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Campaign Sequences</span>
        </div>
        <div className="p-5">
          {emailSequences.length > 0 ? (
            <div className="space-y-4">
              {emailSequences.map((email: any, index: number) => (
                <div key={index} className="p-4 bg-[#050505] rounded-lg border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#3b82f6] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        {email.email_number || index + 1}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{email.send_day || 'Day TBD'}</div>
                        <div className="text-white/50 text-xs">{email.send_time || '8:30 AM'}</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/30">{email.status || 'pending'}</div>
                  </div>
                  <div className="text-white font-medium text-sm mb-2 pb-2 border-b border-white/[0.06]">
                    {email.subject || 'Subject pending'}
                  </div>
                  <div className="text-white/70 text-xs leading-relaxed">
                    {email.body || 'Email content pending...'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/30 text-sm">
              No email sequences configured
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotesTab = ({ currentProfile }: TabContentProps) => {
  return (
    <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="text-center py-10">
          <FileText className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <div className="text-white/30">No activity recorded</div>
          <div className="text-[11px] text-white/20 mt-1">Notes and campaign activity will appear here</div>
        </div>
      </div>
    </div>
  );
};

export function ProfileModal() {
  const { currentProfile, setCurrentProfile } = useContractorStore();
  const [activeTab, setActiveTab] = useState('intelligence');

  // Block body scroll when modal is open
  React.useEffect(() => {
    if (currentProfile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [currentProfile]);

  if (!currentProfile) return null;

  const closeModal = () => setCurrentProfile(null);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'var(--green)';
    if (score >= 70) return 'var(--yellow)';
    if (score >= 50) return 'var(--orange)';
    return 'var(--red)';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-hidden">
      <div className="h-full overflow-y-auto" style={{ fontFamily: '-apple-system, "Inter", system-ui, sans-serif' }}>
        <div className="min-h-full">
          {/* Header */}
          <div className="bg-[#0a0a0b] border-b border-white/[0.06] p-6">
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={closeModal}
                className="flex items-center gap-2 text-white/50 text-[13px] hover:text-white/70 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#0a0a0b] border border-white/[0.06] rounded-lg text-white/70 text-xs font-medium hover:text-white hover:border-white/10 transition-all"
                >
                  Print
                </button>
                <button className="px-4 py-2 bg-[#0a0a0b] border border-white/[0.06] rounded-lg text-white/70 text-xs font-medium hover:text-white hover:border-white/10 transition-all">
                  Edit
                </button>
                <button className="px-4 py-2 bg-[#3b82f6] border border-[#3b82f6] text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity">
                  Schedule Campaign
                </button>
              </div>
            </div>

            {/* Header Grid */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-8 items-start">
              {/* Score Circle */}
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center relative mb-2"
                  style={{
                    background: `conic-gradient(from -90deg, ${getScoreColor(currentProfile.completionScore)} ${currentProfile.completionScore * 3.6}deg, rgba(255,255,255,0.06) ${currentProfile.completionScore * 3.6}deg)`,
                    padding: '3px'
                  }}
                >
                  <div className="w-full h-full bg-[#0a0a0b] rounded-full flex items-center justify-center relative z-10">
                    <span className="text-xl font-bold text-white">{currentProfile.completionScore}%</span>
                  </div>
                </div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider">DATA COMPLETE</div>
              </div>
              
              {/* Company Section */}
              <div className="flex-1">
                <h1 className="text-[22px] font-semibold text-white mb-2">{currentProfile.businessName}</h1>
                <div className="flex items-center gap-3 text-xs text-white/50 mb-5">
                  <span className="px-2 py-1 bg-[#050505] rounded text-[11px] font-semibold text-white/70 uppercase">
                    {currentProfile.category}
                  </span>
                  <span>•</span>
                  <span>#{currentProfile.id}</span>
                  <span>•</span>
                  <span>{currentProfile.address?.split(',').slice(-2).join(',').trim()}</span>
                </div>
                
                <div className="flex gap-6 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-white/70">{currentProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-white/70">{currentProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-white/30" />
                    <a href={currentProfile.website} target="_blank" rel="noopener noreferrer" 
                       className="text-white/70 hover:text-white transition-colors">
                      {currentProfile.rawData?.L2_normalized_domain || 'N/A'}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-white/30" />
                    <a 
                      href={`https://maps.google.com/?cid=${currentProfile.rawData?.L1_google_place_id || ''}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {currentProfile.googleRating?.toFixed(1) || '0.0'} • {currentProfile.reviewsCount || 0} Reviews
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-5 p-5 bg-[#050505] rounded-lg min-w-[260px]">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 uppercase">PSI Mobile</span>
                  <span className={cn("text-sm font-semibold", 
                    currentProfile.rawData?.L1_psi_mobile_performance ? 'text-white' : 'text-red-400'
                  )}>
                    {currentProfile.rawData?.L1_psi_mobile_performance || '—'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 uppercase">PSI Desktop</span>
                  <span className={cn("text-sm font-semibold", 
                    currentProfile.rawData?.L1_psi_desktop_performance ? 'text-white' : 'text-red-400'
                  )}>
                    {currentProfile.rawData?.L1_psi_desktop_performance || '—'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 uppercase">Domain Age</span>
                  <span className={cn("text-sm font-semibold", 
                    currentProfile.rawData?.L1_whois_domain_age_years ? 'text-white' : 'text-red-400'
                  )}>
                    {currentProfile.rawData?.L1_whois_domain_age_years ? 
                      `${parseFloat(currentProfile.rawData.L1_whois_domain_age_years).toFixed(1)} yrs` : '—'
                    }
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 uppercase">Days to Expiry</span>
                  <span className={cn("text-sm font-semibold", 
                    currentProfile.rawData?.L1_whois_days_until_expiry ? 'text-white' : 'text-red-400'
                  )}>
                    {currentProfile.rawData?.L1_whois_days_until_expiry || '—'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 uppercase">Builder</span>
                  <span className="text-sm font-semibold text-white">
                    {currentProfile.rawData?.L1_builder_platform || 'Unknown'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 uppercase">Email Type</span>
                  <span className={cn("text-sm font-semibold", 
                    currentProfile.emailQuality === 'PROFESSIONAL_DOMAIN' ? 'text-green-400' : 'text-white'
                  )}>
                    {currentProfile.emailQuality === 'PROFESSIONAL_DOMAIN' ? 'Professional' :
                     currentProfile.emailQuality === 'PERSONAL_DOMAIN' ? 'Personal' : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-[#0a0a0b] border-b border-white/[0.06] px-6 sticky top-0 z-10">
            <div className="flex">
              {[
                { id: 'intelligence', label: 'Intelligence' },
                { id: 'campaign', label: 'Campaign' },
                { id: 'notes', label: 'Notes & Activity' }
              ].map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "py-3.5 px-6 text-xs font-medium uppercase tracking-wider transition-all border-b-2 cursor-pointer",
                    activeTab === tab.id
                      ? "text-white border-[#3b82f6]"
                      : "text-white/50 border-transparent hover:text-white/70"
                  )}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'intelligence' && <IntelligenceTab currentProfile={currentProfile} activeTab={activeTab} />}
            {activeTab === 'campaign' && <CampaignTab currentProfile={currentProfile} activeTab={activeTab} />}
            {activeTab === 'notes' && <NotesTab currentProfile={currentProfile} activeTab={activeTab} />}
          </div>
        </div>
      </div>
    </div>
  );
}