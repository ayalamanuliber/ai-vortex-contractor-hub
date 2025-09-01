'use client';

interface WeekData {
  day: string;
  total: number;
  ready: number;
  scheduled: number;
  sent: number;
}

interface WeekViewProps {
  weekNumber: number;
  weekRange: string;
  weekData: WeekData[];
  onDayClick?: (dayIndex: number) => void;
}

export function WeekView({ weekNumber, weekRange, weekData, onDayClick }: WeekViewProps) {
  // Calculate week insights
  const totalCampaigns = weekData.reduce((sum, day) => sum + day.total, 0);
  const peakDay = weekData.reduce((peak, day) => day.total > peak.total ? day : peak, weekData[0]);
  const avgPerDay = Math.round(totalCampaigns / 7);
  const sentCampaigns = weekData.reduce((sum, day) => sum + day.sent, 0);
  const completionRate = totalCampaigns > 0 ? Math.round((sentCampaigns / totalCampaigns) * 100) : 0;
  
  // Find max total for scaling bars
  const maxTotal = Math.max(...weekData.map(d => d.total), 1);
  
  return (
    <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-xl overflow-hidden mt-4">
      {/* Week Header */}
      <div className="p-4 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/[0.06]">
        <div className="text-[14px] font-semibold text-white/95 mb-1">
          Week {weekNumber} Overview
        </div>
        <div className="text-[11px] text-white/50">
          {weekRange}
        </div>
      </div>

      {/* Week Graph */}
      <div className="p-5 flex items-end gap-2 h-[120px]">
        {weekData.map((day, index) => {
          const height = Math.max((day.total / maxTotal) * 80, day.total > 0 ? 20 : 0);
          const readyHeight = day.ready > 0 ? Math.max((day.ready / day.total) * height, 8) : 0;
          const scheduledHeight = day.scheduled > 0 ? Math.max((day.scheduled / day.total) * height, 8) : 0;
          const sentHeight = day.sent > 0 ? Math.max((day.sent / day.total) * height, 8) : 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar Total Label */}
              {day.total > 0 && (
                <div className="text-[10px] font-semibold text-white/70 mb-2">
                  {day.total}
                </div>
              )}
              
              {/* Bar Container */}
              <div 
                className="relative bg-[#050505] rounded-t cursor-pointer hover:-translate-y-0.5 transition-transform flex flex-col justify-end"
                style={{ height: `${Math.max(height, 20)}px`, width: '100%' }}
                onClick={() => onDayClick?.(index)}
              >
                {/* Segments stacked from bottom */}
                {day.sent > 0 && (
                  <div 
                    className="w-full bg-[#22c55e] opacity-80 transition-all duration-300 rounded-t"
                    style={{ height: `${sentHeight}px` }}
                  />
                )}
                {day.scheduled > 0 && (
                  <div 
                    className="w-full bg-[#3b82f6] opacity-80 transition-all duration-300"
                    style={{ height: `${scheduledHeight}px` }}
                  />
                )}
                {day.ready > 0 && (
                  <div 
                    className="w-full bg-[#facc15] opacity-80 transition-all duration-300"
                    style={{ height: `${readyHeight}px` }}
                  />
                )}
              </div>
              
              {/* Day Label */}
              <div className="text-[10px] text-white/50 font-medium">
                {day.day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Insights */}
      <div className="px-5 py-4 bg-[#050505] border-t border-white/[0.06]">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-white/50">Week Total</span>
            <span className="text-white/70 font-semibold">{totalCampaigns} campaigns</span>
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-white/50">Peak Day</span>
            <span className="text-white/70 font-semibold">{peakDay.day} ({peakDay.total})</span>
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-white/50">Avg per Day</span>
            <span className="text-white/70 font-semibold">{avgPerDay} campaigns</span>
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-white/50">Completion Rate</span>
            <span className="text-white/70 font-semibold">{completionRate}% sent</span>
          </div>
        </div>
      </div>
    </div>
  );
}