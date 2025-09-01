'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Calendar, X } from 'lucide-react';
import { useContractorStore } from '@/stores/contractorStore';
import { WeekView } from './WeekView';

interface CampaignDay {
  ready: number;
  scheduled: number;
  sent: number;
}

interface DayDetail {
  date: string;
  dayName: string;
  weekNumber: number;
  campaigns: {
    ready: Array<{
      id: string;
      name: string;
      businessId: string;
      location: string;
      completionScore: number;
      bestTime?: string;
      altTime?: string;
    }>;
    scheduled: Array<{
      id: string;
      name: string;
      businessId: string;
      location: string;
      emailNumber: number;
      time: string;
    }>;
    sent: Array<{
      id: string;
      name: string;
      businessId: string;
      location: string;
      emailNumber: number;
      sentDate: string;
    }>;
  };
}

// Real data generator based on contractors with campaigns
const generateRealCampaignData = (contractors: any[]): { [key: string]: CampaignDay } => {
  const data: { [key: string]: CampaignDay } = {};
  const today = new Date();
  
  // Get contractors with campaigns
  const contractorsWithCampaigns = contractors.filter(c => c.hasCampaign && c.campaignData);
  
  
  // Day name mapping
  const dayMap: { [key: string]: number } = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
    'thursday': 4, 'friday': 5, 'saturday': 6
  };
  
  // Generate data for current month's days
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Count contractors ready for this day
    let ready = 0;
    contractorsWithCampaigns.forEach(contractor => {
      const campaignData = contractor.campaignData;
      if (campaignData?.contact_timing?.best_day_email_1) {
        const bestDay = campaignData.contact_timing.best_day_email_1.toLowerCase();
        if (dayMap[bestDay] === dayOfWeek) {
          ready++;
        }
      }
    });
    
    // Mock scheduled and sent for now (will be real when we connect dossier)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const scheduled = isWeekend ? 0 : Math.floor(Math.random() * 8) + 2;
    const sent = isWeekend ? 0 : Math.floor(Math.random() * 6);
    
    data[dateKey] = { ready, scheduled, sent };
  }
  
  return data;
};

// Generate week data for WeekView
const generateWeekData = (selectedDate: Date, campaignData: { [key: string]: CampaignDay }) => {
  const weekData = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Find the start of the week (Sunday)
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const dateKey = day.toISOString().split('T')[0];
    const dayData = campaignData[dateKey] || { ready: 0, scheduled: 0, sent: 0 };
    
    weekData.push({
      day: dayNames[i],
      total: dayData.ready + dayData.scheduled + dayData.sent,
      ready: dayData.ready,
      scheduled: dayData.scheduled,
      sent: dayData.sent
    });
  }
  
  return weekData;
};

// Real detailed day data based on contractors
const generateRealDayDetail = (dateKey: string, campaignDay: CampaignDay, contractors: any[]): DayDetail => {
  const date = new Date(dateKey);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = date.getDay();
  
  // Day name mapping
  const dayMap: { [key: string]: number } = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
    'thursday': 4, 'friday': 5, 'saturday': 6
  };
  
  // Get contractors with campaigns ready for this day
  const contractorsWithCampaigns = contractors.filter(c => c.hasCampaign && c.campaignData);
  const readyContractors = contractorsWithCampaigns.filter(contractor => {
    const campaignData = contractor.campaignData;
    if (campaignData?.contact_timing?.best_day_email_1) {
      const bestDay = campaignData.contact_timing.best_day_email_1.toLowerCase();
      return dayMap[bestDay] === dayOfWeek;
    }
    return false;
  });
  
  return {
    date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
    dayName: dayNames[date.getDay()],
    weekNumber: Math.ceil(date.getDate() / 7) + 35,
    campaigns: {
      ready: readyContractors.map((contractor) => ({
        id: contractor.id,
        name: contractor.businessName,
        businessId: `#${contractor.id}`,
        location: `${contractor.city}, ${contractor.state}`,
        completionScore: contractor.completionScore,
        bestTime: contractor.campaignData?.contact_timing?.window_a_time || '9:00 AM',
        altTime: contractor.campaignData?.contact_timing?.window_b_time || '2:00 PM'
      })),
      scheduled: Array.from({ length: campaignDay.scheduled }, (_, i) => ({
        id: `scheduled-${i}`,
        name: ['Kaw Valley HVAC', 'SKY Engineering', 'Wilson Roofing Inc'][i % 3],
        businessId: `#${Math.floor(Math.random() * 5000)}`,
        location: ['Topeka, KS', 'Bowling Green, KY', 'Pocatello, ID'][i % 3],
        emailNumber: (i % 3) + 1,
        time: [`7:00 AM`, `9:30 AM`, `2:00 PM`, `4:15 PM`][i % 4]
      })),
      sent: Array.from({ length: campaignDay.sent }, (_, i) => ({
        id: `sent-${i}`,
        name: ['Crown Roofing', 'Elite Construction'][i % 2],
        businessId: `#${Math.floor(Math.random() * 5000)}`,
        location: ['Kansas', 'Oklahoma'][i % 2],
        emailNumber: (i % 3) + 1,
        sentDate: 'Today'
      }))
    }
  };
};

export function CampaignCalendar() {
  const { isCalendarMinimized, toggleCalendar, contractors, filteredContractors, setContractors } = useContractorStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  // Load contractors data if empty
  useEffect(() => {
    if (!contractors || contractors.length === 0) {
      const loadContractors = async () => {
        try {
          const response = await fetch('/api/simple-contractors?start=0&limit=200');
          const result = await response.json();
          setContractors(result.contractors || []);
        } catch (error) {
          console.error('Calendar failed to load contractors:', error);
        }
      };
      loadContractors();
    }
  }, [contractors, setContractors]);
  
  const campaignData = useMemo(() => generateRealCampaignData(contractors), [contractors]);
  
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

  // Calculate month statistics
  const monthStats = Object.values(campaignData).reduce(
    (acc: CampaignDay, day: CampaignDay) => ({
      ready: acc.ready + day.ready,
      scheduled: acc.scheduled + day.scheduled,
      sent: acc.sent + day.sent
    }),
    { ready: 0, scheduled: 0, sent: 0 }
  );

  const handleDayClick = (day: number) => {
    const dateKey = new Date(year, month, day).toISOString().split('T')[0];
    setSelectedDay(dateKey);
  };

  const selectedDayData = selectedDay ? campaignData[selectedDay] : null;
  const selectedDayDetail = selectedDay && selectedDayData ? generateRealDayDetail(selectedDay, selectedDayData, contractors) : null;
  
  // Generate week data if a day is selected
  const weekData = selectedDay ? generateWeekData(new Date(selectedDay), campaignData) : null;
  const selectedDate = selectedDay ? new Date(selectedDay) : null;

  if (isCalendarMinimized) {
    return (
      <div className="mb-6">
        <button
          onClick={toggleCalendar}
          className="w-full bg-[#0a0a0b] border border-white/[0.06] rounded-xl p-4 hover:bg-[#111113] hover:border-white/10 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-[14px] font-semibold text-white/95">Campaign Calendar</span>
              <span className="text-[11px] text-white/50">Click to expand</span>
              
              {/* Mini stats when collapsed */}
              <div className="flex items-center gap-3 text-[11px] ml-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <span className="text-white/70 font-medium">{monthStats.ready}</span>
                  <span className="text-white/40">ready</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-white/70 font-medium">{monthStats.scheduled}</span>
                  <span className="text-white/40">scheduled</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-white/70 font-medium">{monthStats.sent}</span>
                  <span className="text-white/40">sent</span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-white/70 transition-colors" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex gap-4">
        {/* Main Calendar */}
        <div className="flex-1">
          <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Collapsible Header */}
            <div 
              className="p-4 flex justify-between items-center cursor-pointer bg-gradient-to-b from-white/[0.02] to-transparent hover:from-white/[0.03] hover:to-white/[0.01] transition-all"
              onClick={toggleCalendar}
            >
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 flex items-center justify-center transition-transform">
                  <ChevronDown className="w-3 h-3 text-white/95" />
                </div>
                <h3 className="text-[14px] font-semibold text-white/95">Campaign Calendar</h3>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); previousMonth(); }}
                    className="w-7 h-7 rounded-md bg-[#050505] border border-white/[0.06] text-white/50 hover:bg-[#111113] hover:border-white/10 hover:text-white/70 flex items-center justify-center transition-all text-xs"
                  >
                    ←
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextMonth(); }}
                    className="w-7 h-7 rounded-md bg-[#050505] border border-white/[0.06] text-white/50 hover:bg-[#111113] hover:border-white/10 hover:text-white/70 flex items-center justify-center transition-all text-xs"
                  >
                    →
                  </button>
                </div>
                <span className="text-[13px] text-white/50">{monthNames[month]} {year}</span>
              </div>
              <div className="flex gap-5 text-[12px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#facc15] opacity-80"></div>
                  <span className="text-white/70 font-semibold">{monthStats.ready}</span>
                  <span className="text-white/30">ready</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] opacity-80"></div>
                  <span className="text-white/70 font-semibold">{monthStats.scheduled}</span>
                  <span className="text-white/30">scheduled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] opacity-80"></div>
                  <span className="text-white/70 font-semibold">{monthStats.sent}</span>
                  <span className="text-white/30">sent</span>
                </div>
              </div>
            </div>

            {/* Calendar Content */}
            <div className="p-px bg-[#050505]">
              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-px mb-px">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="bg-[#0a0a0b] p-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-white/30"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-px">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfWeek }, (_, index) => (
                  <div key={`empty-${index}`} className="bg-[#0a0a0b] h-[90px] p-2 opacity-30 pointer-events-none" />
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const dateKey = new Date(year, month, day).toISOString().split('T')[0];
                  const isToday = day === today.getDate() && 
                                 month === today.getMonth() && 
                                 year === today.getFullYear();
                  const dayData = campaignData[dateKey] || { ready: 0, scheduled: 0, sent: 0 };
                  const total = dayData.ready + dayData.scheduled + dayData.sent;
                  
                  return (
                    <div
                      key={day}
                      className={`bg-[#0a0a0b] h-[90px] p-2 transition-all cursor-pointer hover:bg-[#111113] relative flex flex-col ${
                        isToday ? 'before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[#3b82f6] before:opacity-60' : ''
                      }`}
                      onClick={() => handleDayClick(day)}
                    >
                      <div className={`text-[13px] font-semibold mb-2 ${isToday ? 'text-white/95' : 'text-white/70'}`}>
                        {day}
                      </div>
                      
                      {total > 0 && (
                        <div className="absolute top-2 right-2 text-[9px] font-semibold text-white/50 px-1.5 py-0.5 rounded-[10px] bg-[#050505] border border-white/[0.06]">
                          {total}
                        </div>
                      )}
                      
                      <div className="flex-1 flex flex-col justify-center gap-1">
                        {dayData.ready > 0 && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0"></div>
                            <span className="text-white/30 text-[9px] uppercase tracking-wider font-medium">RDY</span>
                            <span className="text-white/70 font-semibold ml-auto text-[11px]">{dayData.ready}</span>
                          </div>
                        )}
                        {dayData.scheduled > 0 && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                            <span className="text-white/30 text-[9px] uppercase tracking-wider font-medium">SCH</span>
                            <span className="text-white/70 font-semibold ml-auto text-[11px]">{dayData.scheduled}</span>
                          </div>
                        )}
                        {dayData.sent > 0 && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></div>
                            <span className="text-white/30 text-[9px] uppercase tracking-wider font-medium">SNT</span>
                            <span className="text-white/70 font-semibold ml-auto text-[11px]">{dayData.sent}</span>
                          </div>
                        )}
                        {total === 0 && (
                          <div className="flex-1 flex items-center justify-center text-white/30 text-[10px]">
                            —
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#0a0a0b] border-t border-white/[0.06] flex justify-between items-center text-[11px] text-white/50">
              <span>Click any day to filter contractors</span>
              <div className="flex gap-2">
                <button className="px-2.5 py-1 rounded-md bg-[#050505] border border-white/[0.06] text-white/70 hover:bg-[#111113] hover:border-white/10 font-medium transition-all">
                  Export CSV
                </button>
                <button className="px-2.5 py-1 rounded-md bg-[#050505] border border-white/[0.06] text-white/70 hover:bg-[#111113] hover:border-white/10 font-medium transition-all">
                  Bulk Actions
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Day Detail Panel */}
        {selectedDay && selectedDayDetail && (
          <div className="w-[420px] bg-[#0a0a0b] border border-white/[0.06] rounded-xl overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Panel Header */}
            <div className="p-4 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.06] flex justify-between items-center">
              <div className="flex flex-col gap-0.5">
                <div className="text-[18px] font-semibold text-white/95">{selectedDayDetail.date}</div>
                <div className="text-[11px] text-white/50 uppercase tracking-wider">
                  {selectedDayDetail.dayName} · Week {selectedDayDetail.weekNumber}
                </div>
              </div>
              <button 
                onClick={() => setSelectedDay(null)}
                className="w-7 h-7 rounded-md bg-[#050505] border border-white/[0.06] text-white/50 hover:bg-[#111113] hover:border-white/10 hover:text-white/95 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary */}
            <div className="p-4 bg-[#050505] flex justify-around border-b border-white/[0.06]">
              <div className="text-center">
                <div className="text-[24px] font-bold text-white/95 mb-1">{(selectedDayData?.ready || 0) + (selectedDayData?.scheduled || 0) + (selectedDayData?.sent || 0)}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Total</div>
              </div>
              <div className="text-center">
                <div className="text-[24px] font-bold text-white/95 mb-1">{selectedDayData?.ready || 0}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Ready</div>
              </div>
              <div className="text-center">
                <div className="text-[24px] font-bold text-white/95 mb-1">{selectedDayData?.scheduled || 0}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-[24px] font-bold text-white/95 mb-1">{selectedDayData?.sent || 0}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Sent</div>
              </div>
            </div>

            {/* Campaign Sections */}
            <div className="max-h-[400px] overflow-y-auto">
              {/* Ready Campaigns */}
              {selectedDayDetail.campaigns.ready.length > 0 && (
                <div>
                  <div className="px-5 py-3 bg-gradient-to-r from-white/[0.01] via-white/[0.02] to-white/[0.01] border-b border-white/[0.06] flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#facc15]"></div>
                      <span className="text-white/95">Ready to Schedule</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-[10px] bg-[#050505] text-[11px] font-semibold text-white/70">
                      {selectedDayDetail.campaigns.ready.length}
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {selectedDayDetail.campaigns.ready.slice(0, 8).map((campaign: any, index: number) => (
                      <div key={index} className="px-5 py-2.5 border-b border-white/[0.06] flex justify-between items-center hover:bg-[#111113] transition-all cursor-pointer">
                        <div className="flex flex-col gap-0.5 flex-1">
                          <div className="text-[13px] font-medium text-white/95">{campaign.name}</div>
                          <div className="text-[11px] text-white/50">{campaign.businessId} · {campaign.location} · {campaign.completionScore}% complete</div>
                          <div className="text-[10px] text-white/40 mt-1">
                            Best times: {campaign.bestTime} / {campaign.altTime}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button className="px-2.5 py-1.5 rounded bg-[#3b82f6] text-white text-[10px] font-medium hover:opacity-90 transition-opacity">
                            Schedule
                          </button>
                          <button className="px-2.5 py-1.5 rounded bg-[#050505] border border-white/[0.06] text-white/50 text-[10px] font-medium hover:bg-[#111113] hover:border-white/10 hover:text-white/95 transition-all">
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Campaigns */}
              {selectedDayDetail.campaigns.scheduled.length > 0 && (
                <div>
                  <div className="px-5 py-3 bg-gradient-to-r from-white/[0.01] via-white/[0.02] to-white/[0.01] border-b border-white/[0.06] flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></div>
                      <span className="text-white/95">Scheduled</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-[10px] bg-[#050505] text-[11px] font-semibold text-white/70">
                      {selectedDayDetail.campaigns.scheduled.length}
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {selectedDayDetail.campaigns.scheduled.map((campaign: any, index: number) => (
                      <div key={index} className="px-5 py-2.5 border-b border-white/[0.06] flex justify-between items-center hover:bg-[#111113] transition-all cursor-pointer">
                        <div className="flex flex-col gap-0.5">
                          <div className="text-[13px] font-medium text-white/95">{campaign.name}</div>
                          <div className="text-[11px] text-white/50">{campaign.businessId} · Email {campaign.emailNumber}/3 · {campaign.location}</div>
                        </div>
                        <div className="text-[11px] text-white/70 font-medium">{campaign.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#0a0a0b] border-t border-white/[0.06] flex justify-between items-center">
              <span className="text-[11px] text-white/50">
                {(selectedDayData?.ready || 0) + (selectedDayData?.scheduled || 0) + (selectedDayData?.sent || 0)} campaigns for this day
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-md bg-[#050505] border border-white/[0.06] text-white/70 hover:bg-[#111113] hover:border-white/10 text-[11px] font-medium transition-all">
                  Export Day
                </button>
                <button className="px-3 py-1.5 rounded-md bg-[#050505] border border-white/[0.06] text-white/70 hover:bg-[#111113] hover:border-white/10 text-[11px] font-medium transition-all">
                  Schedule All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Week View */}
      {weekData && selectedDate && (
        <WeekView 
          weekNumber={Math.ceil(selectedDate.getDate() / 7) + 35}
          weekRange={`${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate() - selectedDate.getDay()} - ${selectedDate.getDate() - selectedDate.getDay() + 6}, ${selectedDate.getFullYear()}`}
          weekData={weekData}
          onDayClick={(dayIndex) => {
            const weekStart = new Date(selectedDate);
            weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
            const clickedDay = new Date(weekStart);
            clickedDay.setDate(weekStart.getDate() + dayIndex);
            const dateKey = clickedDay.toISOString().split('T')[0];
            setSelectedDay(dateKey);
          }}
        />
      )}
    </div>
  );
}