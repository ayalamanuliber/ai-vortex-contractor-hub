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

  return (
    <div className="space-y-5">
      {/* Business Details */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-4 h-4 text-white/30" />
          <h3 className="text-[12px] font-semibold text-white/70 uppercase tracking-wider">Business Details</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Business Name</div>
            <div className="text-[13px] text-white font-medium">{currentProfile.businessName}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Industry</div>
            <div className="text-[13px] text-white font-medium">{currentProfile.category}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Address</div>
            <div className="text-[13px] text-white font-medium">{currentProfile.address}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Phone</div>
            <div className="text-[13px] text-white font-medium">{currentProfile.phone}</div>
          </div>
        </div>
      </div>

      {/* Website & Performance */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-white/30" />
          <h3 className="text-[12px] font-semibold text-white/70 uppercase tracking-wider">Website & Performance</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">PSI Mobile</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-white font-semibold">{currentProfile.intelligence?.websiteSpeed?.mobile || 'N/A'}</span>
              <div className={cn("w-1.5 h-1.5 rounded-full", getQualityDot(currentProfile.intelligence?.websiteSpeed?.mobile || 0))} />
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">PSI Desktop</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-white font-semibold">{currentProfile.intelligence?.websiteSpeed?.desktop || 'N/A'}</span>
              <div className={cn("w-1.5 h-1.5 rounded-full", getQualityDot(currentProfile.intelligence?.websiteSpeed?.desktop || 0))} />
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Builder</span>
            <span className="text-[13px] text-white font-semibold">{currentProfile.intelligence?.websiteBuilder || 'Unknown'}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Domain Age</span>
            <span className="text-[13px] text-white font-semibold">{currentProfile.intelligence?.domainAge || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-white/30" />
          <h3 className="text-[12px] font-semibold text-white/70 uppercase tracking-wider">Reviews & Reputation</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Google Rating</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[13px] text-white font-semibold">{currentProfile.googleRating?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Review Count</span>
            <span className="text-[13px] text-white font-semibold">{currentProfile.reviewsCount || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Review Freq</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-white font-semibold">Slow</span>
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[11px] text-white/50 uppercase tracking-wider">Email Type</span>
            <span className="text-[13px] text-white font-semibold">{currentProfile.intelligence?.emailType || 'Professional'}</span>
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

  if (!currentProfile) return null;

  const closeModal = () => setCurrentProfile(null);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'var(--green)';
    if (score >= 70) return 'var(--yellow)';
    if (score >= 50) return 'var(--orange)';
    return 'var(--red)';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-screen">
          {/* Header */}
          <div className="bg-[#0a0a0b] border-b border-white/[0.06] p-6 sticky top-0 z-10">
            <div className="flex justify-between items-center mb-5">
              <button 
                onClick={closeModal}
                className="flex items-center gap-2 text-white/50 text-sm hover:text-white/70 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </button>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0b] border border-white/[0.06] rounded-lg text-white/70 text-sm font-medium hover:text-white hover:border-white/10 transition-colors">
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
                <h1 className="text-2xl font-semibold text-white mb-2">{currentProfile.businessName}</h1>
                <div className="flex items-center gap-4 text-white/50 text-sm mb-5">
                  <span className="px-2 py-1 bg-[#050505] text-white/70 rounded text-xs font-semibold uppercase tracking-wider">
                    {currentProfile.category}
                  </span>
                  <span>•</span>
                  <span>#{currentProfile.id}</span>
                  <span>•</span>
                  <span>{currentProfile.address?.split(',').slice(-2).join(',').trim()}</span>
                  <span>•</span>
                  <span className="px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded text-xs font-semibold uppercase tracking-wider">
                    DOMAIN EXPIRES 34D
                  </span>
                </div>
                
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
                    <span className="text-white">
                      {currentProfile.googleRating?.toFixed(1) || 'N/A'} · {currentProfile.reviewsCount || 0} Reviews
                    </span>
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

              {/* Score Circle */}
              <div className="bg-[#050505] border border-white/[0.06] rounded-xl p-4 text-center">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center relative p-0.5"
                  style={{
                    background: `conic-gradient(from -90deg, ${getScoreColor(currentProfile.completionScore)} ${currentProfile.completionScore * 3.6}deg, rgba(255,255,255,0.06) ${currentProfile.completionScore * 3.6}deg)`
                  }}
                >
                  <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{currentProfile.completionScore}%</span>
                  </div>
                </div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">Data Complete</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-[#0a0a0b] border-b border-white/[0.06] px-6 sticky top-[200px] z-10">
            <div className="flex gap-8">
              {[
                { id: 'intelligence', label: 'Intelligence' },
                { id: 'campaign', label: 'Campaign' },
                { id: 'notes', label: 'Notes & Activity' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "py-4 text-sm font-medium uppercase tracking-wider transition-colors border-b-2",
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