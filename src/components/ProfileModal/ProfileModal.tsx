'use client';

import { X, Globe, Mail, Phone, MapPin, Star, TrendingUp, DollarSign } from 'lucide-react';
import { useContractorStore } from '@/stores/contractorStore';
import { cn } from '@/lib/utils/cn';

export function ProfileModal() {
  const { currentProfile, setCurrentProfile } = useContractorStore();

  if (!currentProfile) return null;

  const closeModal = () => setCurrentProfile(null);

  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const emailSequences = currentProfile.campaignData?.emailSequences || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={closeModal}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-surface rounded-lg border border-border/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/20">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-lg",
              currentProfile.completionScore >= 85 
                ? "border-green-500/30 bg-green-500/10"
                : currentProfile.completionScore >= 70
                ? "border-yellow-500/30 bg-yellow-500/10"  
                : "border-orange-500/30 bg-orange-500/10"
            )}>
              <span className={cn(
                "text-xl font-bold",
                getHealthScoreColor(currentProfile.completionScore)
              )}>
                {currentProfile.completionScore}
              </span>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {currentProfile.businessName}
              </h2>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <span>{currentProfile.category}</span>
                <span>•</span>
                <span>ID: {currentProfile.id}</span>
                <span>•</span>
                <span className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {currentProfile.googleRating.toFixed(1)} ({currentProfile.reviewsCount})
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={closeModal}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card/20 rounded-lg p-4 border border-border/30">
                <h3 className="font-semibold text-foreground mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{currentProfile.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{currentProfile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{currentProfile.address}</span>
                  </div>
                  {currentProfile.website && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Globe className="w-4 h-4 text-primary" />
                      <a 
                        href={currentProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {currentProfile.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Intelligence Scores */}
              <div className="bg-card/20 rounded-lg p-4 border border-border/30">
                <h3 className="font-semibold text-foreground mb-3">Intelligence Scores</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completion Score</span>
                    <span className={cn("font-semibold", getHealthScoreColor(currentProfile.completionScore))}>
                      {currentProfile.completionScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Health Score</span>
                    <span className={cn("font-semibold", getHealthScoreColor(currentProfile.healthScore))}>
                      {currentProfile.healthScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trust Score</span>
                    <span className={cn("font-semibold", getHealthScoreColor(currentProfile.trustScore))}>
                      {currentProfile.trustScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Website Speed</span>
                    <span className={cn("font-semibold", getHealthScoreColor(currentProfile.intelligence.websiteSpeed.mobile))}>
                      {currentProfile.intelligence.websiteSpeed.mobile}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Campaign Information */}
            {currentProfile.hasCampaign && (
              <div className="bg-card/20 rounded-lg p-4 border border-border/30">
                <h3 className="font-semibold text-foreground mb-3">Campaign Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                      <span className="text-sm text-muted-foreground">Cost</span>
                    </div>
                    <span className="text-lg font-bold text-green-400">
                      ${currentProfile.cost.toFixed(3)}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-400 mr-1" />
                      <span className="text-sm text-muted-foreground">Tokens</span>
                    </div>
                    <span className="text-lg font-bold text-blue-400">
                      {currentProfile.tokensUsed.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Mail className="w-4 h-4 text-purple-400 mr-1" />
                      <span className="text-sm text-muted-foreground">Emails</span>
                    </div>
                    <span className="text-lg font-bold text-purple-400">
                      {emailSequences.length}
                    </span>
                  </div>
                </div>
                
                {/* Email Sequences */}
                {emailSequences.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Email Sequences</h4>
                    <div className="space-y-2">
                      {emailSequences.map((email: any) => (
                        <div 
                          key={email.email_number}
                          className="bg-muted/10 rounded-lg p-3 border border-border/20"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">
                              Email {email.email_number}: {email.subject}
                            </span>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              email.status === 'sent' ? "bg-green-400/20 text-green-400" :
                              email.status === 'scheduled' ? "bg-yellow-400/20 text-yellow-400" :
                              "bg-gray-400/20 text-gray-400"
                            )}>
                              {email.status}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {email.send_day} at {email.send_time}
                          </div>
                          <div className="text-sm text-foreground line-clamp-2">
                            {email.body}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Intelligence Details */}
            <div className="bg-card/20 rounded-lg p-4 border border-border/30">
              <h3 className="font-semibold text-foreground mb-3">Intelligence Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Website Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mobile Speed:</span>
                      <span className="text-foreground">{currentProfile.intelligence.websiteSpeed.mobile}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Desktop Speed:</span>
                      <span className="text-foreground">{currentProfile.intelligence.websiteSpeed.desktop}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Domain Age:</span>
                      <span className="text-foreground">{currentProfile.intelligence.domainAge} years</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-2">Business Profile</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Business Health:</span>
                      <span className="text-foreground">{currentProfile.businessHealth}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sophistication:</span>
                      <span className="text-foreground">{currentProfile.sophisticationTier}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email Quality:</span>
                      <span className="text-foreground">
                        {currentProfile.emailQuality.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}