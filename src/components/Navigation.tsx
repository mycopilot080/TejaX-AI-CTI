import React from 'react';
import { Activity, Search, ShieldCheck, AlertCircle, Database, BarChart3, ShieldAlert, Sparkles, Globe } from 'lucide-react';

export type ActiveTab = 'cti-feed' | 'vulnerability-management' | 'threat-reports' | 'on-demand-reports' | 'siem-console' | 'detection-catalog' | 'incident-review' | 'hec-collector' | 'threat-analytics' | 'osint-intelligence';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  incidentsBadgeCount: number;
  correlatedThreatsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  incidentsBadgeCount,
  correlatedThreatsCount = 5
}) => {
  const tabs = [
    {
      id: 'cti-feed' as ActiveTab,
      label: 'Live CTI Feed Collector',
      icon: Activity,
      badge: 'LIVE'
    },
    {
      id: 'osint-intelligence' as ActiveTab,
      label: 'OSINT Intelligence Hub',
      icon: Globe,
      badge: 'NEW'
    },
    {
      id: 'vulnerability-management' as ActiveTab,
      label: 'Asset CTI Correlation Matrix',
      icon: ShieldAlert,
      count: correlatedThreatsCount
    },
    {
      id: 'incident-review' as ActiveTab,
      label: 'Incidents',
      icon: AlertCircle,
      count: incidentsBadgeCount
    },
    {
      id: 'hec-collector' as ActiveTab,
      label: 'HTTP Event Collector (HEC)',
      icon: Database,
    },
    {
      id: 'threat-analytics' as ActiveTab,
      label: 'Threat Analytics',
      icon: BarChart3,
    },
    {
      id: 'on-demand-reports' as ActiveTab,
      label: 'On-Demand Reports',
      icon: Sparkles,
      badge: 'AI'
    }
  ];

  return (
    <nav className="bg-slate-950 border-b border-slate-800/80 px-6 py-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded">
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full animate-pulse">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
