'use client';

import { Mail, Clock, CheckCircle, AlertCircle, Calendar, DollarSign, MapPin } from 'lucide-react';
import type { MergedContractor } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

interface ExecutionCardProps {
  contractor: MergedContractor;
  onClick: () => void;
}

export function ExecutionCard({ contractor, onClick }: ExecutionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-400 bg-green-400/10';
      case 'opened': return 'text-blue-400 bg-blue-400/10';
      case 'responded': return 'text-purple-400 bg-purple-400/10';
      case 'scheduled': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-3 h-3" />;
      case 'opened': return <Mail className="w-3 h-3" />;
      case 'responded': return <CheckCircle className="w-3 h-3" />;
      case 'scheduled': return <Clock className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const emailSequences = contractor.campaignData?.emailSequences || [];
  const completedEmails = emailSequences.filter((e: any) => e.status === 'sent').length;
  const totalEmails = emailSequences.length;
  const progressPercentage = totalEmails > 0 ? (completedEmails / totalEmails) * 100 : 0;

  return (
    <div className="execution-card p-6 cursor-pointer" onClick={onClick}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-1">
            {contractor.businessName}
          </h3>
          <div className="flex items-center space-x-2 text-sm mb-2">
            <span className="text-muted-foreground">{contractor.category}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-green-400 font-medium">ID: {contractor.id}</span>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="text-xs">{contractor.state}</span>
            </div>
            <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="w-3 h-3 mr-1" />
              <span className="text-xs">${contractor.cost.toFixed(3)}</span>
            </div>
            <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              <span className="text-xs">{contractor.sessionDuration.toFixed(1)}m</span>
            </div>
          </div>
        </div>
        
        {/* Campaign Progress Circle */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-green-500/30 bg-green-500/10 flex items-center justify-center shadow-lg shadow-green-500/20">
            <span className="text-lg font-bold text-green-400">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <Mail className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
      
      {/* Campaign Status */}
      <div className="mb-4">
        {contractor.hasCampaign ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Campaign Progress</span>
              <span className="text-xs text-muted-foreground">
                {completedEmails}/{totalEmails} emails sent
              </span>
            </div>
            <div className="w-full bg-muted/20 rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4 border-2 border-dashed border-muted/40 rounded-lg">
            <div className="text-center">
              <AlertCircle className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <span className="text-sm text-muted-foreground">No Campaign Setup</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Email Sequence Status */}
      {contractor.hasCampaign && emailSequences.length > 0 && (
        <div className="space-y-2 mb-4">
          <span className="text-sm font-medium text-foreground">Email Sequence</span>
          <div className="space-y-1">
            {emailSequences.slice(0, 3).map((email: any, index: number) => (
              <div
                key={email.email_number}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg border",
                  email.status === 'sent' 
                    ? "bg-green-400/10 border-green-400/30"
                    : email.status === 'scheduled'
                    ? "bg-yellow-400/10 border-yellow-400/30"
                    : "bg-muted/10 border-muted/30"
                )}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-foreground">
                    Email {email.email_number}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {email.send_day}
                  </span>
                </div>
                <div className={cn(
                  "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                  getStatusColor(email.status)
                )}>
                  {getStatusIcon(email.status)}
                  <span className="capitalize">{email.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Campaign Timing */}
      {contractor.campaignData?.contactTiming && (
        <div className="bg-card/20 rounded-lg p-3 border border-border/30 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Optimal Timing
            </span>
            <Calendar className="w-4 h-4 text-green-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-foreground">
              <span className="text-muted-foreground">Best Days:</span><br />
              <span className="font-medium">
                {contractor.campaignData.contactTiming.best_day_email_1}, {contractor.campaignData.contactTiming.best_day_email_2}
              </span>
            </div>
            <div className="text-foreground">
              <span className="text-muted-foreground">Time Windows:</span><br />
              <span className="font-medium">
                {contractor.campaignData.contactTiming.window_a_time} - {contractor.campaignData.contactTiming.window_b_time}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer Stats */}
      <div className="pt-3 border-t border-border/20">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <span className="text-muted-foreground">
              Tokens: <span className="text-green-400">{contractor.tokensUsed.toLocaleString()}</span>
            </span>
            <span className="text-muted-foreground">
              Focus: <span className={contractor.hasFocusGroup ? "text-green-400" : "text-gray-400"}>
                {contractor.hasFocusGroup ? "Generated" : "Pending"}
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}