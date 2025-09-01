'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Minimize2, Maximize2 } from 'lucide-react';
import { useContractorStore } from '@/stores/contractorStore';
import { cn } from '@/lib/utils/cn';

export function CampaignCalendar() {
  const { isCalendarMinimized, toggleCalendar, filteredContractors } = useContractorStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  if (isCalendarMinimized) {
    return (
      <div className="mb-6">
        <button
          onClick={toggleCalendar}
          className="w-full glass-surface rounded-lg p-4 border border-border/40 hover:border-primary/40 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Campaign Calendar</span>
              <span className="text-xs text-muted-foreground">
                Click to expand
              </span>
            </div>
            <Maximize2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </button>
      </div>
    );
  }

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get campaign activities for each day (mock data for now)
  const getCampaignActivities = (day: number) => {
    const activities = [];
    
    // Mock some scheduled emails
    if (day === today.getDate() && month === today.getMonth()) {
      activities.push({ type: 'email', status: 'scheduled', count: 2 });
    }
    if (day === today.getDate() + 1 && month === today.getMonth()) {
      activities.push({ type: 'email', status: 'pending', count: 1 });
    }
    if (day === today.getDate() + 3 && month === today.getMonth()) {
      activities.push({ type: 'follow-up', status: 'scheduled', count: 3 });
    }
    
    return activities;
  };

  return (
    <div className="mb-6">
      <div className="glass-surface rounded-lg border border-border/40">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Campaign Calendar</h3>
          </div>
          <button
            onClick={toggleCalendar}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
            title="Minimize Calendar"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h4 className="text-xl font-bold text-foreground">
            {monthNames[month]} {year}
          </h4>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-4">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfWeek }, (_, index) => (
              <div key={`empty-${index}`} className="p-2 h-20" />
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const isToday = day === today.getDate() && 
                             month === today.getMonth() && 
                             year === today.getFullYear();
              const activities = getCampaignActivities(day);
              
              return (
                <div
                  key={day}
                  className={cn(
                    "p-2 h-20 border border-border/20 rounded-lg cursor-pointer transition-all duration-200 relative overflow-hidden",
                    isToday 
                      ? "bg-primary/20 border-primary/40" 
                      : "bg-card/20 hover:bg-card/40 hover:border-border/60"
                  )}
                >
                  <div className={cn(
                    "font-semibold text-sm mb-1",
                    isToday ? "text-primary" : "text-foreground"
                  )}>
                    {day}
                  </div>
                  
                  {/* Campaign activities */}
                  <div className="space-y-1">
                    {activities.map((activity, actIndex) => (
                      <div
                        key={actIndex}
                        className={cn(
                          "text-xs px-1 py-0.5 rounded text-center font-medium",
                          activity.type === 'email' 
                            ? "bg-blue-500/20 text-blue-300" 
                            : "bg-green-500/20 text-green-300"
                        )}
                      >
                        {activity.count} {activity.type}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Calendar Footer - Quick Stats */}
        <div className="flex items-center justify-between p-4 border-t border-border/20 bg-card/10">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500/40 rounded"></div>
              <span className="text-muted-foreground">Scheduled: <span className="text-blue-400">2</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500/40 rounded"></div>
              <span className="text-muted-foreground">Follow-ups: <span className="text-green-400">3</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500/40 rounded"></div>
              <span className="text-muted-foreground">Pending: <span className="text-yellow-400">1</span></span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {filteredContractors.filter(c => c.hasCampaign).length} active campaigns
          </div>
        </div>
      </div>
    </div>
  );
}