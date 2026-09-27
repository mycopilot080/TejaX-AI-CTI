import React, { useState, useEffect } from 'react';
import { Bot, Radio, Clock, Menu, Search, ShieldAlert, Database, FileText, Rows } from 'lucide-react';
import { NotableIncident, Asset } from '../types/cti';
import { ActiveTab } from './SidebarNavigation';

interface HeaderProps {
  activeTabTitle: string;
  onOpenAIAssistant: () => void;
  onOpenDispatchModal: () => void;
  activeIncidentsCount: number;
  onToggleSidebarMobile?: () => void;
  globalSearchQuery: string;
  onGlobalSearchChange: (query: string) => void;
  incidents: NotableIncident[];
  assets: Asset[];
  setActiveTab: (tab: ActiveTab) => void;
  isCompactView: boolean;
  onToggleCompactView: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTabTitle,
  onOpenAIAssistant,
  onOpenDispatchModal,
  activeIncidentsCount,
  onToggleSidebarMobile,
  globalSearchQuery,
  onGlobalSearchChange,
  incidents,
  assets,
  setActiveTab,
  isCompactView,
  onToggleCompactView
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(0, 19).replace('T', ' ') + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20 gap-4">
      {/* Zone 1: Current Section Title & Mobile Sidebar Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        {onToggleSidebarMobile && (
          <button
            onClick={onToggleSidebarMobile}
            className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-tight">
              {activeTabTitle}
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-cyan-400 border border-slate-800">
              ENTERPRISE CTI
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5">
            17 active indicators · Updated 2 hours ago
          </span>
        </div>
      </div>

      {/* Zone 2: Global Search Bar */}
      <div className="relative hidden xl:flex items-center flex-1 max-w-md mx-2">
        <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2 focus-within:border-cyan-500 transition-all">
          <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            placeholder="Global search alerts, assets, CVEs..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
          />
          {globalSearchQuery && (
            <button
              onClick={() => onGlobalSearchChange('')}
              className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {globalSearchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl space-y-3 z-50">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-b border-slate-800 pb-1.5">
              <span>Results for "<span className="text-cyan-300">{globalSearchQuery}</span>"</span>
              <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">Live Index</span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs max-h-64 overflow-y-auto">
              {/* Alerts */}
              {incidents.filter(i => i.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) || i.id.toLowerCase().includes(globalSearchQuery.toLowerCase())).length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-rose-400 font-mono uppercase">Alerts</div>
                  {incidents
                    .filter(i => i.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) || i.id.toLowerCase().includes(globalSearchQuery.toLowerCase()))
                    .slice(0, 3)
                    .map(inc => (
                      <div key={inc.id} onClick={() => { setActiveTab('incident-review'); onGlobalSearchChange(''); }} className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all">
                        <div className="font-bold text-slate-200 truncate">{inc.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{inc.id} • {inc.severity}</div>
                      </div>
                    ))}
                </div>
              )}

              {/* Assets */}
              {assets.filter(a => a.hostname.toLowerCase().includes(globalSearchQuery.toLowerCase()) || a.ipAddress.includes(globalSearchQuery)).length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-cyan-400 font-mono uppercase">Assets</div>
                  {assets
                    .filter(a => a.hostname.toLowerCase().includes(globalSearchQuery.toLowerCase()) || a.ipAddress.includes(globalSearchQuery))
                    .slice(0, 3)
                    .map(ast => (
                      <div key={ast.id} onClick={() => { setActiveTab('vulnerability-management'); onGlobalSearchChange(''); }} className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all">
                        <div className="font-bold text-slate-200">{ast.hostname}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ast.ipAddress} • {ast.environment}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Zone 3: Quick Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleCompactView}
          title={isCompactView ? "Switch to Normal View" : "Switch to Compact High-Density View"}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all whitespace-nowrap ${
            isCompactView
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow'
              : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
          }`}
        >
          <Rows className="w-3.5 h-3.5" />
          <span>{isCompactView ? 'Compact: On' : 'Compact View'}</span>
        </button>

        <button
          onClick={onOpenAIAssistant}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-pink-500 hover:bg-pink-400 rounded-lg shadow-md shadow-pink-500/20 transition-all whitespace-nowrap"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Copilot</span>
        </button>
      </div>
    </header>
  );
};
