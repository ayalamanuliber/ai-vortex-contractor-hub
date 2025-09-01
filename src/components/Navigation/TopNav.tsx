'use client';

import { Search, Filter, Calendar, Settings } from 'lucide-react';
import { useContractorStore } from '@/stores/contractorStore';

export function TopNav() {
  const { 
    currentMode, 
    setMode, 
    searchQuery, 
    setSearchQuery,
    toggleCalendar,
    isCalendarMinimized,
    showingCount
  } = useContractorStore();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 glass-surface border-b border-border/40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Logo and mode selector */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">AI Vortex</h1>
              <p className="text-xs text-muted-foreground">Intelligence Hub</p>
            </div>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center bg-muted/20 rounded-lg p-1">
            <button
              onClick={() => setMode('intelligence')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                currentMode === 'intelligence'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Intelligence
            </button>
            <button
              onClick={() => setMode('execution')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                currentMode === 'execution'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Execution
            </button>
          </div>
        </div>
        
        {/* Center - Search */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search contractors by name, ID, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border/40 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>
        
        {/* Right side - Actions and stats */}
        <div className="flex items-center space-x-4">
          {/* Stats */}
          <div className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-semibold">{showingCount}</span> contractors
          </div>
          
          {/* Calendar toggle */}
          <button
            onClick={toggleCalendar}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isCalendarMinimized
                ? 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                : 'text-primary bg-primary/10 hover:bg-primary/20'
            }`}
            title={isCalendarMinimized ? 'Show Calendar' : 'Hide Calendar'}
          >
            <Calendar className="w-4 h-4" />
          </button>
          
          {/* Filter indicator */}
          <div className="relative">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-50" />
          </div>
          
          {/* Settings */}
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all duration-200">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}