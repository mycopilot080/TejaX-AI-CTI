import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Search,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  ShieldAlert,
  Shield,
  Bot,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Radio,
  FileText,
  Building,
  Layers,
  Sparkles,
  Globe,
  Terminal,
  User,
  LogOut,
  Award,
  Flame,
  BookOpen
} from 'lucide-react';

export type ActiveTab =
  | 'cti-feed'
  | 'vulnerability-management'
  | 'threat-reports'
  | 'on-demand-reports'
  | 'siem-console'
  | 'detection-catalog'
  | 'detection-library'
  | 'incident-review'
  | 'hec-collector'
  | 'threat-dashboard'
  | 'threat-analytics'
  | 'industry-threat-actors'
  | 'threat-hunting-sandbox'
  | 'osint-intelligence'
  | 'kpi-kri-sla'
  | 'executive-dashboard'
  | 'enterprise-posture'
  | 'threat-heatmap'
  | 'threat-wiki';

interface SidebarNavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  incidentsBadgeCount: number;
  correlatedThreatsCount?: number;
  detectionRulesCount?: number;
  isFeedActive: boolean;
  onToggleFeed: () => void;
  onOpenAIAssistant: () => void;
  onOpenDispatchModal: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userEmail: string;
  onLogout: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  onChangeTab,
  incidentsBadgeCount,
  correlatedThreatsCount = 5,
  detectionRulesCount = 18,
  isFeedActive,
  onToggleFeed,
  onOpenAIAssistant,
  onOpenDispatchModal,
  collapsed,
  onToggleCollapse,
  userEmail,
  onLogout
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'EXECUTIVE OVERVIEW': true,
    'THREAT INTEL & ASSETS': true,
    'SIEM & DETECTION': true,
    'THREAT ANALYTICS': true
  });
  const [activeFlyoutGroup, setActiveFlyoutGroup] = useState<string | null>(null);
  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const navGroups = [
    {
      groupName: 'EXECUTIVE OVERVIEW',
      icon: ShieldCheck,
      items: [
        {
          id: 'executive-dashboard' as ActiveTab,
          label: 'Executive CISO Dashboard',
          icon: ShieldCheck,
          badge: 'CISO'
        },
        {
          id: 'enterprise-posture' as ActiveTab,
          label: 'CTI Posture',
          icon: Globe,
          badge: 'POSTURE'
        },
        {
          id: 'threat-heatmap' as ActiveTab,
          label: 'Global Threat Heatmap',
          icon: Flame,
          badge: 'LIVE'
        },
        {
          id: 'vulnerability-management' as ActiveTab,
          label: 'Asset CTI Matrix',
          icon: ShieldAlert,
          count: correlatedThreatsCount
        }
      ]
    },
    {
      groupName: 'OSINT INTEGRATION',
      icon: Globe,
      items: [
        {
          id: 'osint-intelligence' as ActiveTab,
          label: 'OSINT Intelligence Hub',
          icon: Globe,
          badge: 'API'
        },
        {
          id: 'cti-feed' as ActiveTab,
          label: 'Live CTI Feed Collector',
          icon: Activity,
          badge: 'LIVE'
        }
      ]
    },
    {
      groupName: 'DETECTION HUB',
      icon: Search,
      items: [
        {
          id: 'siem-console' as ActiveTab,
          label: 'Splunk SIEM',
          icon: Search
        },
        {
          id: 'detection-catalog' as ActiveTab,
          label: 'Intelligence Forge',
          icon: Sparkles,
          badge: 'AI'
        },
        {
          id: 'detection-library' as ActiveTab,
          label: 'Rule Library',
          icon: ShieldCheck,
          badge: `${detectionRulesCount} Rules`
        },
        {
          id: 'incident-review' as ActiveTab,
          label: 'Incidents',
          icon: AlertCircle,
          count: incidentsBadgeCount
        },
        {
          id: 'threat-hunting-sandbox' as ActiveTab,
          label: 'Threat Hunting Sandbox',
          icon: Terminal,
          badge: 'SIGMA'
        }
      ]
    },
    {
      groupName: 'THREAT ANALYTICS',
      icon: BarChart3,
      items: [
        {
          id: 'threat-dashboard' as ActiveTab,
          label: 'Threat Dashboard',
          icon: BarChart3,
          badge: 'NEW'
        },
        {
          id: 'threat-reports' as ActiveTab,
          label: 'Threat Reports',
          icon: FileText
        },
        {
          id: 'on-demand-reports' as ActiveTab,
          label: 'On-Demand Reports',
          icon: Sparkles,
          badge: 'AI'
        },
        {
          id: 'industry-threat-actors' as ActiveTab,
          label: 'Industry Threat Actors',
          icon: Building
        },
        {
          id: 'threat-wiki' as ActiveTab,
          label: 'Threat Wiki',
          icon: BookOpen,
          badge: 'WIKI'
        },
        {
          id: 'kpi-kri-sla' as ActiveTab,
          label: 'KPI, KRI & SLA Metrics',
          icon: Award,
          badge: 'RAGB'
        }
      ]
    },
  ];

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleMouseEnterGroup = (groupName: string) => {
    if (!collapsed) return;
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
    setActiveFlyoutGroup(groupName);
  };

  const handleMouseLeaveGroup = () => {
    if (!collapsed) return;
    flyoutTimeoutRef.current = setTimeout(() => {
      setActiveFlyoutGroup(null);
    }, 200);
  };

  return (
    <aside
      className={`bg-slate-950 border-r border-slate-800/90 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 h-screen sticky top-0 font-sans ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header: Brand Lockup & Collapse Toggle */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-pink-600 via-rose-600 to-cyan-500 text-white shrink-0 shadow-md shadow-pink-600/20">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
          </div>

          {!collapsed && (
            <div className="flex flex-col truncate">
              <a href="/" className="text-xs font-extrabold tracking-tight text-white whitespace-nowrap leading-none flex items-center gap-1">
                <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent font-extrabold">TejaX AI</span>
              </a>
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider truncate mt-0.5">
                CYBER INTELLIGENCE
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80 transition-all shrink-0"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Categorized Collapsible Accordion & Pop-up List */}
      <div className="flex-1 py-3 px-2 overflow-y-auto space-y-3 no-scrollbar">
        {navGroups.map((group, gIdx) => {
          const GroupIcon = group.icon;
          const isGroupExpanded = expandedGroups[group.groupName] ?? true;
          const hasActiveChild = group.items.some((i) => i.id === activeTab);
          const isFlyoutOpen = activeFlyoutGroup === group.groupName;

          return (
            <div
              key={gIdx}
              className="relative space-y-1"
              onMouseEnter={() => handleMouseEnterGroup(group.groupName)}
              onMouseLeave={handleMouseLeaveGroup}
            >
              {/* Category Header (Expanded Mode) */}
              {!collapsed ? (
                <button
                  onClick={() => toggleGroup(group.groupName)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-md transition-all ${
                    hasActiveChild ? 'text-cyan-400 bg-cyan-950/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <GroupIcon className={`w-3.5 h-3.5 shrink-0 ${hasActiveChild ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{group.groupName}</span>
                  </div>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${
                      isGroupExpanded ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </button>
              ) : (
                /* Category Icon Trigger (Collapsed Mode) */
                <button
                  onClick={() => onChangeTab(group.items[0].id)}
                  className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all ${
                    hasActiveChild
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
                  }`}
                  title={group.groupName}
                >
                  <GroupIcon className={`w-4 h-4 ${hasActiveChild ? 'text-cyan-400' : 'text-slate-400'}`} />
                </button>
              )}

              {/* Collapsed Mode Pop-up / Flyout Sub-menu */}
              {collapsed && isFlyoutOpen && (
                <div
                  className="absolute left-full top-0 ml-2.5 w-60 bg-slate-900 border border-slate-800 rounded-xl p-2.5 shadow-2xl z-50 space-y-1 animate-fadeIn"
                  onMouseEnter={() => handleMouseEnterGroup(group.groupName)}
                  onMouseLeave={handleMouseLeaveGroup}
                >
                  <div className="px-2 py-1 border-b border-slate-800 text-[10px] font-mono font-bold uppercase text-cyan-400 flex items-center justify-between">
                    <span>{group.groupName}</span>
                    <span className="text-slate-500 font-normal">{group.items.length} Modules</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onChangeTab(item.id);
                            setActiveFlyoutGroup(null);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-lg transition-all text-left ${
                            isActive
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {item.badge && (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded">
                                {item.badge}
                              </span>
                            )}
                            {item.count !== undefined && item.count > 0 && (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full">
                                {item.count}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-item List (Expanded Mode) */}
              {!collapsed && isGroupExpanded && (
                <div className="space-y-0.5 pl-1 transition-all">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onChangeTab(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          isActive
                            ? 'bg-cyan-500/15 text-cyan-300 border-l-2 border-l-cyan-400 border-y border-r border-cyan-500/20 shadow-sm shadow-cyan-500/10 font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {item.badge && (
                            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded">
                              {item.badge}
                            </span>
                          )}
                          {item.count !== undefined && item.count > 0 && (
                            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full animate-pulse">
                              {item.count}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer Actions */}
      <div className="p-3 border-t border-slate-800/80 space-y-2.5 bg-slate-950/90">
        {!collapsed && (
          <div className="space-y-2 text-[10px] font-mono text-slate-500 pb-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Time:</span>
              </span>
              <span className="text-slate-300 font-bold">{utcTime}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Radio className={`w-3 h-3 ${isFeedActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                <span>CTI Stream:</span>
              </span>
              <button onClick={onToggleFeed} className={`font-bold hover:underline ${isFeedActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isFeedActive ? 'LIVE' : 'PAUSED'}
              </button>
            </div>
          </div>
        )}

        {/* Logged User & Logout */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-mono font-bold text-slate-200 truncate max-w-[130px]">{userEmail}</span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Threat Lead
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-900/60 transition-all shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
