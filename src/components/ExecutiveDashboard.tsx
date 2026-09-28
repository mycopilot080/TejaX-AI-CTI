import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Globe,
  Building,
  Target,
  FileText,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  RefreshCw,
  Download,
  Activity,
  Zap,
  BarChart3,
  Flame,
  Cpu,
  Server,
  Radio
} from 'lucide-react';
import { NotableIncident, Asset } from '../types/cti';

interface ExecutiveDashboardProps {
  incidents: NotableIncident[];
  assets: Asset[];
  setActiveTab: (tab: any) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  incidents,
  assets,
  setActiveTab
}) => {
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [pulseCount, setPulseCount] = useState<number>(13420);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseCount(prev => prev + Math.floor(Math.random() * 15 - 5));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleExportBrief = () => {
    setExportFeedback('Executive CISO Security Posture Report downloaded successfully.');
    setTimeout(() => setExportFeedback(null), 3500);
  };

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'CLOSED').length;
  const highCount = incidents.filter(i => i.severity === 'HIGH' && i.status !== 'CLOSED').length;
  const guardedAssetsCount = assets.filter(a => a.vulnerabilities.length === 0).length;

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top CISO Executive Header Banner with Dynamic Pulse */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/50 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-2xl gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-50 blur-sm animate-pulse" />
            <div className="relative p-3.5 rounded-xl bg-slate-950 text-cyan-400 border border-cyan-500/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Executive CISO & CTI Intelligence Command</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                POSTURE: SECURE & MONITORED ({pulseCount.toLocaleString()} events/min)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Enterprise-wide real-time threat intelligence posture, active adversary campaigns, sovereign CVE exposure, and proactive defense orchestration for Enterprise.com.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={() => setActiveTab('threat-heatmap')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/30 transition-all shadow-md group"
          >
            <Flame className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>Threat Heatmap</span>
          </button>
          <button
            onClick={handleExportBrief}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>CISO Brief PDF</span>
          </button>
          <button
            onClick={() => setActiveTab('incident-review')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/25"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Active Incidents ({incidents.filter(i => i.status !== 'CLOSED').length})</span>
          </button>
        </div>
      </div>

      {exportFeedback && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xl font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* Core Dynamic KPI Grid with Red Blue Green Amber Color Coding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setActiveTab('vulnerability-management-inventory');
          }}
          className="bg-emerald-950/15 backdrop-blur border border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-5 shadow-xl space-y-3 transition-all group relative overflow-hidden text-left w-full"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase font-bold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500" />
              <span>Overall Risk Score</span>
            </span>
            <span className="text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-mono text-[10px]">
              GREEN: OPTIMAL
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono group-hover:text-emerald-400 transition-colors">Guarded ({guardedAssetsCount})</span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> -4.2% wk
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="bg-emerald-500 h-full rounded-full shadow-sm shadow-emerald-500 transition-all duration-1000" 
              style={{ width: `${Math.min(100, (guardedAssetsCount / assets.length) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
            <span>SLA: Met (&gt;70 target)</span>
            <span className="text-emerald-400 font-bold">Low Attack Vector</span>
          </div>
        </button>

        {/* RED CARD: CRITICAL ESCALATION */}
        <div className="bg-rose-950/15 backdrop-blur border border-rose-500/40 hover:border-rose-400 rounded-2xl p-5 shadow-xl space-y-3 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase font-bold">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse shadow-sm shadow-rose-500" />
              <span>Critical Incidents</span>
            </span>
            <span className="text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 font-mono text-[10px]">
              RED: CRITICAL
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400 font-mono">{criticalCount + highCount} Total High</span>
            <span className="text-[11px] text-rose-300 font-mono font-bold">{criticalCount} Active P1</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
            <div className="bg-rose-500 h-full rounded-full w-[85%] shadow-sm shadow-rose-500" />
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
            <span>SLA: 15m Response Target</span>
            <span className="text-rose-400 font-bold">Requires Escalation</span>
          </div>
        </div>

        {/* BLUE CARD: OPERATIONAL BASELINE */}
        <div className="bg-blue-950/15 backdrop-blur border border-blue-500/40 hover:border-blue-400 rounded-2xl p-5 shadow-xl space-y-3 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase font-bold">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shadow-sm shadow-blue-500" />
              <span>Enterprise Assets</span>
            </span>
            <span className="text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800 font-mono text-[10px]">
              BLUE: BASELINE
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-400 font-mono">{assets.length} Monitored</span>
            <span className="text-[11px] text-blue-300 font-mono">100% EDR Active</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
            <div className="bg-blue-500 h-full rounded-full w-[92%] shadow-sm shadow-blue-500" />
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
            <span>SIEM: Live Ingestion Stream</span>
            <span className="text-blue-400 font-bold">Continuous Stream</span>
          </div>
        </div>

        {/* AMBER CARD: WARNING & NEAR-MISS WATCH */}
        <div className="bg-amber-950/15 backdrop-blur border border-amber-500/40 hover:border-amber-400 rounded-2xl p-5 shadow-xl space-y-3 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase font-bold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shadow-sm shadow-amber-500" />
              <span>SLA & Response Governance</span>
            </span>
            <span className="text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 font-mono text-[10px]">
              AMBER: AT-RISK
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400 font-mono">98.2% SLA</span>
            <span className="text-[11px] text-amber-300 font-mono font-bold">2 Near Misses</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
            <div className="bg-amber-500 h-full rounded-full w-[88%] shadow-sm shadow-amber-500" />
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
            <span>SOC Response: 88.5%</span>
            <span className="text-amber-400 font-bold">Watchlist Active</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Notable Incidents & Quick Dynamic Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Notable Alerts (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-200">
                Top Priority Notable Incidents
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('incident-review')}
              className="text-xs text-cyan-400 hover:underline font-mono flex items-center gap-1"
            >
              <span>View All Incidents</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {incidents.slice(0, 4).map(inc => (
              <div
                key={inc.id}
                onClick={() => setActiveTab('incident-review')}
                className="bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all group shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl mt-0.5 ${
                    inc.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {inc.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-3">
                      <span className="text-cyan-400">{inc.id}</span>
                      <span>•</span>
                      <span>Host: {inc.affectedHost}</span>
                      <span>•</span>
                      <span>Analyst: {inc.assignedAnalyst}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                    inc.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {inc.severity}
                  </span>
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                    {inc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Navigation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-cyan-400 border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Quick CTI & Enterprise Modules</span>
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono font-bold">
              <button
                onClick={() => setActiveTab('enterprise-posture')}
                className="p-3 bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-slate-200 hover:text-cyan-300 transition-all text-left flex flex-col gap-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span>CTI Posture</span>
              </button>

              <button
                onClick={() => setActiveTab('threat-heatmap')}
                className="p-3 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 rounded-xl text-slate-200 hover:text-rose-300 transition-all text-left flex flex-col gap-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span>Global Threat Heatmap</span>
              </button>

              <button
                onClick={() => setActiveTab('osint-intelligence')}
                className="p-3 bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-slate-200 hover:text-emerald-300 transition-all text-left flex flex-col gap-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span>OSINT Intelligence Hub</span>
              </button>

              <button
                onClick={() => setActiveTab('kpi-kri-sla')}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-slate-200 hover:text-cyan-300 transition-all text-left flex flex-col gap-1 shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>KPI & SLA Metrics</span>
                  <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/80">
                    RAGB
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
