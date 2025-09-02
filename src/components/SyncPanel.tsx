'use client';

import { useState } from 'react';
import { RefreshCw, Database, Zap, Activity, CheckCircle, AlertCircle } from 'lucide-react';

interface SyncResult {
  success: boolean;
  message: string;
  action: string;
  output?: string;
  error?: string;
}

export function SyncPanel() {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const [showOutput, setShowOutput] = useState(false);

  const performSync = async (action: 'csv' | 'campaigns' | 'full' | 'status') => {
    setSyncing(action);
    setLastResult(null);
    
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const result = await response.json();
      
      setLastResult({
        success: result.success,
        message: result.message || result.error,
        action,
        output: result.output || result.status,
        error: result.error
      });
      
    } catch (error) {
      setLastResult({
        success: false,
        message: 'Network error occurred',
        action,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setSyncing(null);
    }
  };

  const getActionInfo = (action: string) => {
    switch (action) {
      case 'csv':
        return {
          icon: <Database className="w-4 h-4" />,
          title: 'Sync CSV',
          description: 'Sync manual CSV edits to app',
          color: 'text-blue-400 hover:text-blue-300'
        };
      case 'campaigns':
        return {
          icon: <Zap className="w-4 h-4" />,
          title: 'Sync Campaigns',
          description: 'Sync campaign JSON files',
          color: 'text-purple-400 hover:text-purple-300'
        };
      case 'full':
        return {
          icon: <RefreshCw className="w-4 h-4" />,
          title: 'Full Sync',
          description: 'Complete system synchronization',
          color: 'text-green-400 hover:text-green-300'
        };
      case 'status':
        return {
          icon: <Activity className="w-4 h-4" />,
          title: 'System Status',
          description: 'Check sync system health',
          color: 'text-yellow-400 hover:text-yellow-300'
        };
      default:
        return {
          icon: <RefreshCw className="w-4 h-4" />,
          title: action,
          description: '',
          color: 'text-white'
        };
    }
  };

  return (
    <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
          Sync Control Panel
        </h3>
        {lastResult && (
          <div className="flex items-center gap-2">
            {lastResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-xs font-medium ${
              lastResult.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {lastResult.success ? 'Success' : 'Failed'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {['csv', 'campaigns', 'full', 'status'].map((action) => {
          const info = getActionInfo(action);
          const isActive = syncing === action;
          
          return (
            <button
              key={action}
              onClick={() => performSync(action as any)}
              disabled={!!syncing}
              className={`
                flex items-center gap-2 p-3 rounded-lg border border-white/[0.06] 
                bg-[#050505] hover:bg-[#111113] transition-all duration-200
                ${isActive ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/10'}
                ${info.color}
              `}
            >
              <div className={isActive ? 'animate-spin' : ''}>
                {info.icon}
              </div>
              <div className="text-left">
                <div className="text-xs font-medium">{info.title}</div>
                <div className="text-[10px] text-white/50">{info.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {lastResult && (
        <div className="mt-4 p-3 rounded-lg bg-[#050505] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/70">
              {getActionInfo(lastResult.action).title} Result:
            </span>
            <button
              onClick={() => setShowOutput(!showOutput)}
              className="text-xs text-white/50 hover:text-white/70 transition-colors"
            >
              {showOutput ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          <div className={`text-xs ${
            lastResult.success ? 'text-green-400' : 'text-red-400'
          }`}>
            {lastResult.message}
          </div>
          
          {showOutput && lastResult.output && (
            <div className="mt-2 p-2 bg-black/50 rounded text-[10px] text-white/60 font-mono max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{lastResult.output}</pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-center">
        <div className="text-[10px] text-white/30 uppercase tracking-wider">
          Manual Sync • No Auto-Refresh
        </div>
        <div className="text-xs text-white/50 mt-1">
          Use "Sync CSV" after editing Master CSV manually
        </div>
      </div>
    </div>
  );
}