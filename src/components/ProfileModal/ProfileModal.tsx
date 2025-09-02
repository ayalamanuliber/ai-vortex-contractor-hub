'use client';

import React, { useState } from 'react';
import { 
  X, Globe, Mail, Phone, MapPin, Star, TrendingUp, 
  ArrowLeft, Printer, Edit, Calendar, Copy, Building,
  Clock, User, FileText, Activity
} from 'lucide-react';
import { useContractorStore } from '@/stores/contractorStore';
import { cn } from '@/lib/utils/cn';

interface TabContentProps {
  currentProfile: any;
  activeTab: string;
}

const IntelligenceTab = ({ currentProfile }: TabContentProps) => {
  const getQualityDot = (score: number) => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 60) return 'bg-yellow-400'; 
    return 'bg-red-400';
  };

  // Extract reviews from rawData if available
  const reviews = [];
  if (currentProfile.rawData) {
    for (let i = 1; i <= 5; i++) {
      const review = {
        rating: currentProfile.rawData[`L1_review_${i}_rating`],
        text: currentProfile.rawData[`L1_review_${i}_text`],
        date: currentProfile.rawData[`L1_review_${i}_date`],
        author: currentProfile.rawData[`L1_review_${i}_author`],
      };
      if (review.rating && review.text) {
        reviews.push(review);
      }
    }
  }

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Google Reviews Intelligence */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl p-5 col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-blue-400" />
          <h3 className="text-[12px] font-semibold text-white uppercase tracking-wider">Google Reviews Intelligence</h3>
        </div>
        
        {/* Stats row */}
        <div className="grid grid-cols-6 gap-4 mb-6 pb-4 border-b border-white/[0.06]">
          <a 
            href={`https://www.google.com/maps/search/${encodeURIComponent(currentProfile.businessName + ' ' + currentProfile.address)}`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex flex-col items-center py-2 hover:bg-white/[0.02] transition-colors cursor-pointer rounded px-2 -mx-2"
          >
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[14px] text-white font-semibold">{currentProfile.googleRating?.toFixed(1) || 'N/A'}</span>
            </div>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Google Rating</span>
          </a>
          
          <div className="flex flex-col items-center py-2">
            <span className="text-[14px] text-white font-semibold mb-1">{currentProfile.reviewsCount || 0}</span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Total Reviews</span>
          </div>
          
          <div className="flex flex-col items-center py-2">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[14px] text-white font-semibold">{currentProfile.intelligence?.reviewsRecency || 'Unknown'}</span>
              <div className={cn("w-1.5 h-1.5 rounded-full", 
                currentProfile.intelligence?.reviewsRecency === 'ACTIVE' ? 'bg-green-400' :
                currentProfile.intelligence?.reviewsRecency === 'MODERATE' ? 'bg-yellow-400' : 'bg-red-400'
              )} />
            </div>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Review Frequency</span>
          </div>
          
          <div className="flex flex-col items-center py-2">
            <span className="text-[14px] text-white font-semibold mb-1">{currentProfile.intelligence?.daysSinceLatest || 'N/A'}</span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Days Since Latest</span>
          </div>
          
          <div className="flex flex-col items-center py-2">
            <span className="text-[14px] text-white font-semibold mb-1">{currentProfile.intelligence?.lastReviewDate || 'N/A'}</span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Last Review</span>
          </div>
          
          <div className="flex flex-col items-center py-2">
            <span className="text-[14px] text-white font-semibold mb-1">{currentProfile.intelligence?.businessHours ? 'Available' : 'N/A'}</span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Business Hours</span>
          </div>
        </div>

        {/* Reviews content */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-3">Recent Reviews</h4>
            {reviews.map((review, index) => (
              <div key={index} className="bg-[#050505] border border-white/[0.04] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn("w-3 h-3", 
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"
                          )} 
                        />
                      ))}
                    </div>
                    <span className="text-[12px] text-white font-semibold">{review.author}</span>
                  </div>
                  <span className="text-[11px] text-white/50">{review.date}</span>
                </div>
                <p className="text-[13px] text-white/80 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-white/30 text-sm">No detailed reviews available from CSV data</div>
          </div>
        )}
      </div>

      {/* WHOIS Intelligence */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-purple-400" />
          <h3 className="text-[12px] font-semibold text-white uppercase tracking-wider">WHOIS Domain Intelligence</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Domain Age</span>
            <span className="text-[13px] text-white font-semibold">
              {currentProfile.rawData?.L1_whois_domain_age_years ? `${parseFloat(currentProfile.rawData.L1_whois_domain_age_years).toFixed(1)} yrs` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Days Until Expiry</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-white font-semibold">
                {currentProfile.rawData?.L1_whois_days_until_expiry ? `${currentProfile.rawData.L1_whois_days_until_expiry} days` : 'N/A'}
              </span>
              {currentProfile.rawData?.L1_whois_days_until_expiry && parseInt(currentProfile.rawData.L1_whois_days_until_expiry) < 60 && (
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              )}
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Registration Status</span>
            <span className="text-[13px] text-white font-semibold">Active</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Domain Confidence</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-white font-semibold">High</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* PSI Intelligence */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <h3 className="text-[12px] font-semibold text-white uppercase tracking-wider">PSI Performance Intelligence</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Mobile Performance</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-white font-semibold">{currentProfile.intelligence?.websiteSpeed?.mobile || 'N/A'}</span>
              <div className={cn("w-1.5 h-1.5 rounded-full", getQualityDot(currentProfile.intelligence?.websiteSpeed?.mobile || 0))} />
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Desktop Performance</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-white font-semibold">{currentProfile.intelligence?.websiteSpeed?.desktop || 'N/A'}</span>
              <div className={cn("w-1.5 h-1.5 rounded-full", getQualityDot(currentProfile.intelligence?.websiteSpeed?.desktop || 0))} />
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Average Score</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-white font-semibold">{currentProfile.intelligence?.websiteSpeed?.average || 'N/A'}</span>
              <div className={cn("w-1.5 h-1.5 rounded-full", getQualityDot(currentProfile.intelligence?.websiteSpeed?.average || 0))} />
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Classification</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-white font-semibold">
                {currentProfile.intelligence?.websiteSpeed?.average >= 80 ? 'Excellent' :
                 currentProfile.intelligence?.websiteSpeed?.average >= 60 ? 'Good' : 
                 currentProfile.intelligence?.websiteSpeed?.average >= 40 ? 'Fair' : 'Poor'}
              </span>
              <div className={cn("w-1.5 h-1.5 rounded-full", getQualityDot(currentProfile.intelligence?.websiteSpeed?.average || 0))} />
            </div>
          </div>
        </div>
      </div>

      {/* Builder Intelligence */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-4 h-4 text-orange-400" />
          <h3 className="text-[12px] font-semibold text-white uppercase tracking-wider">Website Builder Intelligence</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Platform Detected</span>
            <span className="text-[13px] text-white font-semibold">{currentProfile.rawData?.L1_builder_platform || 'Unknown'}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Builder Category</span>
            <span className="text-[13px] text-white font-semibold">{currentProfile.rawData?.L1_builder_category || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Sophistication Tier</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-white font-semibold">{currentProfile.rawData?.L3_sophistication_intelligence_tier || 'Unknown'}</span>
              <div className={cn("w-1.5 h-1.5 rounded-full", 
                currentProfile.rawData?.L3_sophistication_intelligence_tier === 'Professional' ? 'bg-green-400' :
                currentProfile.rawData?.L3_sophistication_intelligence_tier === 'Growing' ? 'bg-yellow-400' : 'bg-red-400'
              )} />
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Email Quality</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-white font-semibold">
                {currentProfile.emailQuality === 'PROFESSIONAL_DOMAIN' ? 'Professional' :
                 currentProfile.emailQuality === 'PERSONAL_DOMAIN' ? 'Personal' : 'Unknown'}
              </span>
              <div className={cn("w-1.5 h-1.5 rounded-full", 
                currentProfile.emailQuality === 'PROFESSIONAL_DOMAIN' ? 'bg-green-400' : 'bg-orange-400'
              )} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignTab = ({ currentProfile }: TabContentProps) => {
  const [emailStatuses, setEmailStatuses] = useState<{ [key: number]: string }>({});
  
  const updateCampaignStatus = useContractorStore(state => state.updateCampaignStatus);
  
  const handleStatusUpdate = (emailNumber: number, status: string) => {
    setEmailStatuses(prev => ({ ...prev, [emailNumber]: status }));
    updateCampaignStatus(currentProfile.id, emailNumber, status);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const emailSequences = currentProfile.campaignData?.emailSequences || [];

  if (!currentProfile.hasCampaign) {
    return (
      <div className="text-center py-12">
        <div className="text-white/30 text-sm mb-4">No campaign data available</div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Generate Campaign
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Campaign Status Header */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-white text-sm font-medium">Campaign Ready - Not Scheduled</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[#050505] border border-white/[0.06] rounded-lg text-white/70 text-xs font-medium hover:text-white hover:border-white/10 transition-colors">
            Copy All
          </button>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
            Schedule All
          </button>
        </div>
      </div>

      {/* Email Sequences */}
      {emailSequences.map((email: any, index: number) => (
        <div key={email.email_number} className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl overflow-hidden">
          {/* Email Header */}
          <div className="px-4 py-3 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.06] flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {email.email_number}
              </div>
              <div>
                <div className="text-white font-semibold text-sm mb-0.5">
                  {email.timing?.day || 'Day TBD'}
                </div>
                <div className="text-white/50 text-xs">
                  {email.timing?.time || '8:30 AM CST'}
                </div>
              </div>
              <div className="flex gap-2">
                {['Scheduled', 'Sent', 'Opened', 'Replied'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(email.email_number, status.toLowerCase())}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium transition-colors",
                      emailStatuses[email.email_number] === status.toLowerCase()
                        ? "bg-green-400 text-black"
                        : "bg-[#050505] border border-white/[0.06] text-white/50 hover:text-white/70 hover:border-white/10"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => copyToClipboard(email.subject)}
                className="px-3 py-1 bg-[#050505] border border-white/[0.06] rounded text-xs text-white/50 hover:text-white hover:border-white/10 transition-colors"
              >
                Copy Subject
              </button>
              <button 
                onClick={() => copyToClipboard(email.body)}
                className="px-3 py-1 bg-[#050505] border border-white/[0.06] rounded text-xs text-white/50 hover:text-white hover:border-white/10 transition-colors"
              >
                Copy Body
              </button>
            </div>
          </div>

          {/* Email Content */}
          <div className="p-5">
            <div className="text-white font-semibold text-sm mb-3 pb-3 border-b border-white/[0.06]">
              {email.subject}
            </div>
            <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
              {email.body}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const NotesTab = ({ currentProfile }: TabContentProps) => {
  const [newNote, setNewNote] = useState('');

  const handleSaveNote = () => {
    if (newNote.trim()) {
      // TODO: Implement note saving
      console.log('Saving note:', newNote);
      setNewNote('');
    }
  };

  return (
    <div className="space-y-5">
      {/* Activity Timeline */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-white/30" />
          <h3 className="text-[12px] font-semibold text-white/70 uppercase tracking-wider">Activity Timeline</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-3 py-3 border-b border-white/[0.06] last:border-b-0">
            <div className="w-8 h-8 bg-[#050505] rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-white/50" />
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-semibold mb-1">Campaign Generated</div>
              <div className="text-white/70 text-xs mb-1">3 emails created focusing on domain expiry and mobile speed</div>
              <div className="text-white/30 text-xs">2 hours ago</div>
            </div>
          </div>

          <div className="flex gap-3 py-3 border-b border-white/[0.06] last:border-b-0">
            <div className="w-8 h-8 bg-[#050505] rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white/50" />
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-semibold mb-1">Profile Created</div>
              <div className="text-white/70 text-xs mb-1">Contractor added to intelligence database</div>
              <div className="text-white/30 text-xs">1 day ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Note */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-white/30" />
          <h3 className="text-[12px] font-semibold text-white/70 uppercase tracking-wider">Add Note</h3>
        </div>
        
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full min-h-[100px] bg-[#050505] border border-white/[0.06] rounded-lg p-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/10 resize-vertical"
          placeholder="Add a note about this contractor..."
        />
        <button
          onClick={handleSaveNote}
          className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newNote.trim()}
        >
          Save Note
        </button>
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
      <div className="h-full overflow-y-auto">
        <div className="min-h-full">
          {/* Header */}
          <div className="bg-[#0a0a0b] border-b border-white/[0.06] p-6">
            <div className="flex justify-between items-center mb-5">
              <button 
                onClick={closeModal}
                className="flex items-center gap-2 text-white/50 text-sm hover:text-white/70 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0b] border border-white/[0.06] rounded-lg text-white/70 text-sm font-medium hover:text-white hover:border-white/10 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0b] border border-white/[0.06] rounded-lg text-white/70 text-sm font-medium hover:text-white hover:border-white/10 transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Calendar className="w-4 h-4" />
                  Schedule Campaign
                </button>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-4 mb-5">
                  {/* Score Circle */}
                  <div className="bg-[#050505] border border-white/[0.06] rounded-xl p-3 text-center">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-1 flex items-center justify-center relative p-0.5"
                      style={{
                        background: `conic-gradient(from -90deg, ${getScoreColor(currentProfile.completionScore)} ${currentProfile.completionScore * 3.6}deg, rgba(255,255,255,0.06) ${currentProfile.completionScore * 3.6}deg)`
                      }}
                    >
                      <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{currentProfile.completionScore}%</span>
                      </div>
                    </div>
                    <div className="text-[9px] text-white/30 uppercase tracking-wider">Data Complete</div>
                  </div>
                  
                  {/* 3-line layout next to score */}
                  <div className="flex-1">
                    {/* Line 1: Company Name */}
                    <h1 className="text-2xl font-semibold text-white mb-2">{currentProfile.businessName}</h1>
                    
                    {/* Line 2: Category */}
                    <div className="flex items-center gap-4 text-white/50 text-sm mb-2">
                      <span className="px-2 py-1 bg-[#050505] text-white/70 rounded text-xs font-semibold uppercase tracking-wider">
                        {currentProfile.category}
                      </span>
                      <span>•</span>
                      <span>{currentProfile.address?.split(',').slice(-2).join(',').trim()}</span>
                      <span>•</span>
                      <span className="px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded text-xs font-semibold uppercase tracking-wider">
                        DOMAIN EXPIRES {currentProfile.rawData?.L1_whois_days_until_expiry || 34}D
                      </span>
                    </div>
                    
                    {/* Line 3: ID */}
                    <div className="text-white/50 text-sm">
                      <span>#{currentProfile.id}</span>
                    </div>
                  </div>
                </div>
                
                {/* 4 contact points in a row */}
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-white/30" />
                    <span className="text-white cursor-pointer hover:text-blue-400 transition-colors" 
                          onClick={() => navigator.clipboard.writeText(currentProfile.email)}>
                      {currentProfile.email}
                    </span>
                    <Copy className="w-3 h-3 text-white/30 opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                          onClick={() => navigator.clipboard.writeText(currentProfile.email)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-white/30" />
                    <span className="text-white cursor-pointer hover:text-blue-400 transition-colors"
                          onClick={() => navigator.clipboard.writeText(currentProfile.phone)}>
                      {currentProfile.phone}
                    </span>
                    <Copy className="w-3 h-3 text-white/30 opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                          onClick={() => navigator.clipboard.writeText(currentProfile.phone)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-white/30" />
                    <a href={currentProfile.website} target="_blank" rel="noopener noreferrer" 
                       className="text-white hover:text-blue-400 transition-colors">
                      {currentProfile.website?.replace(/https?:\/\/(www\.)?/, '')}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-white/30" />
                    <a 
                      href={`https://www.google.com/maps/search/${encodeURIComponent(currentProfile.businessName + ' ' + currentProfile.address)}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-white hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {currentProfile.googleRating?.toFixed(1) || 'N/A'} · {currentProfile.reviewsCount || 0} Reviews on Google
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-[#050505] border border-white/[0.06] rounded-xl p-4 min-w-[200px]">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                    <span className="text-white/50 uppercase tracking-wider">PSI Mobile</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-semibold">{currentProfile.intelligence?.websiteSpeed?.mobile || 'N/A'}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                    <span className="text-white/50 uppercase tracking-wider">PSI Desktop</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-semibold">{currentProfile.intelligence?.websiteSpeed?.desktop || 'N/A'}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                    <span className="text-white/50 uppercase tracking-wider">Builder</span>
                    <span className="text-white font-semibold">{currentProfile.intelligence?.websiteBuilder || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                    <span className="text-white/50 uppercase tracking-wider">Domain Age</span>
                    <span className="text-white font-semibold">26.9 yrs</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                    <span className="text-white/50 uppercase tracking-wider">Review Freq</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-semibold">Slow</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/50 uppercase tracking-wider">Email Type</span>
                    <span className="text-white font-semibold">Professional</span>
                  </div>
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
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 py-4 text-sm font-medium uppercase tracking-wider transition-colors border-b-2 text-center",
                    activeTab === tab.id
                      ? "text-white border-blue-500"
                      : "text-white/50 border-transparent hover:text-white/70"
                  )}
                >
                  {tab.label}
                </button>
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