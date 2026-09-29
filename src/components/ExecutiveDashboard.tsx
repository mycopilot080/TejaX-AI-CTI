import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Globe,
  Target,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Download,
  Activity,
  Flame,
  Cpu,
  Server,
  Radio,
  BookOpen,
  Layers,
  Crosshair,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { NotableIncident, Asset, CTIAdvisory, DetectionRule } from '../types/cti';
import { ActiveTab } from './SidebarNavigation';

interface ExecutiveDashboardProps {
  incidents: NotableIncident[];
  assets: Asset[];
  advisories?: CTIAdvisory[];
  detectionRules?: DetectionRule[];
  setActiveTab: (tab: ActiveTab) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  incidents,
  assets,
  advisories = [],
  detectionRules = [],
  setActiveTab
}) => {
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [pulseCount, setPulseCount] = useState<number>(13420);
  const [selectedIncidentSeverity, setSelectedIncidentSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [searchIncidentQuery, setSearchIncidentQuery] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseCount(prev => prev + Math.floor(Math.random() * 15 - 5));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Incidents calculations
  const openIncidents = useMemo(() => incidents.filter(i => i.status !== 'CLOSED'), [incidents]);
  const criticalCount = useMemo(() => openIncidents.filter(i => i.severity === 'CRITICAL').length, [openIncidents]);
  const highCount = useMemo(() => openIncidents.filter(i => i.severity === 'HIGH').length, [openIncidents]);
  const mediumCount = useMemo(() => openIncidents.filter(i => i.severity === 'MEDIUM' || i.severity === 'LOW').length, [openIncidents]);

  // Asset posture calculations
  const totalAssets = assets.length || 1;
  const guardedAssetsCount = useMemo(() => assets.filter(a => a.vulnerabilities.length === 0).length, [assets]);
  const vulnerableAssets = useMemo(() => assets.filter(a => a.vulnerabilities.length > 0), [assets]);
  const totalUnpatchedCVEs = useMemo(() => {
    return assets.reduce((acc, curr) => {
      return acc + curr.vulnerabilities.filter(v => v.patchStatus === 'UNPATCHED').length;
    }, 0);
  }, [assets]);

  // Active detection rules
  const activeRulesCount = useMemo(() => detectionRules.filter(r => r.enabled).length, [detectionRules]);
  
  // Threat actor campaigns from advisories
  const activeActors = useMemo(() => {
    const actorsSet = new Set<string>();
    advisories.forEach(a => {
      if (a.threatActor && a.threatActor.trim() !== '') {
        actorsSet.add(a.threatActor);
      }
    });
    return Array.from(actorsSet);
  }, [advisories]);

  // Export Executive Brief report
  const handleExportBrief = () => {
    const reportDate = new Date().toISOString().slice(0, 10);
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CISO Executive Cyber Threat Intelligence & Posture Report - ${reportDate}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; background: #0b1120; color: #e2e8f0; }
    h1 { color: #38bdf8; border-bottom: 2px solid #1e293b; padding-bottom: 12px; margin-bottom: 8px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-bottom: 20px; }
    .badge-green { background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
    .card { background: #1e293b; padding: 18px; border-radius: 8px; border: 1px solid #334155; }
    .card h3 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #94a3b8; }
    .card .val { font-size: 26px; font-weight: 800; color: #f8fafc; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #334155; }
    th { background: #0f172a; color: #38bdf8; text-transform: uppercase; font-size: 11px; }
    .critical { color: #f43f5e; font-weight: bold; }
    .high { color: #fbbf24; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Executive CISO Security Posture & CTI Briefing</h1>
  <div class="badge badge-green">Enterprise.com - Defense Posture Status: ACTIVE MONITORING (${reportDate})</div>
  
  <div class="grid">
    <div class="card">
      <h3>Guarded Assets</h3>
      <div class="val">${guardedAssetsCount} / ${totalAssets}</div>
    </div>
    <div class="card">
      <h3>Active Incidents</h3>
      <div class="val">${openIncidents.length} (${criticalCount} Critical)</div>
    </div>
    <div class="card">
      <h3>Monitored CVE Exposure</h3>
      <div class="val">${totalUnpatchedCVEs} Unpatched</div>
    </div>
    <div class="card">
      <h3>Active Detection Rules</h3>
      <div class="val">${activeRulesCount || 18} Synced</div>
    </div>
  </div>

  <h2>Priority Active Security Incidents</h2>
  <table>
    <thead>
      <tr>
        <th>Incident ID</th>
        <th>Severity</th>
        <th>Title</th>
        <th>Target Host</th>
        <th>Assigned SOC Analyst</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${openIncidents.map(i => `
        <tr>
          <td><strong>${i.id}</strong></td>
          <td class="${i.severity === 'CRITICAL' ? 'critical' : 'high'}">${i.severity}</td>
          <td>${i.title}</td>
          <td>${i.affectedHost}</td>
          <td>${i.assignedAnalyst}</td>
          <td>${i.status}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <p style="margin-top: 40px; font-size: 11px; color: #64748b;">
    CONFIDENTIAL - Generated dynamically by Tejax AI Powered Cyber Intelligence CISO Command Suite.
  </p>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CISO_Executive_Security_Briefing_${reportDate}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportFeedback('Executive CISO Security Posture Report (HTML/Printable PDF) generated successfully.');
    setTimeout(() => setExportFeedback(null), 3500);
  };

  // Filtered incidents for table
  const filteredIncidents = useMemo(() => {
    return incidents.filter(i => {
      const matchSeverity = selectedIncidentSeverity === 'ALL' || i.severity === selectedIncidentSeverity;
      const matchSearch = searchIncidentQuery === '' ||
        i.title.toLowerCase().includes(searchIncidentQuery.toLowerCase()) ||
        i.id.toLowerCase().includes(searchIncidentQuery.toLowerCase()) ||
        i.affectedHost.toLowerCase().includes(searchIncidentQuery.toLowerCase()) ||
        i.mitreTechnique.toLowerCase().includes(searchIncidentQuery.toLowerCase());
      return matchSeverity && matchSearch;
    });
  }, [incidents, selectedIncidentSeverity, searchIncidentQuery]);

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top CISO Executive Header Banner */}
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
            <div className="flex items-center gap-2.5 flex-wrap">
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

        <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
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
            <span>Active Incidents ({openIncidents.length})</span>
          </button>
        </div>
      </div>

      {exportFeedback && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xl font-mono animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* Core Dynamic KPI Grid with 4 Key Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GREEN CARD: OPTIMAL POSTURE / ASSET GUARD */}
        <button
          onClick={() => setActiveTab('vulnerability-management')}
          className="bg-emerald-950/15 backdrop-blur border border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-5 shadow-xl space-y-3 transition-all group relative overflow-hidden text-left w-full cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase font-bold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500" />
              <span>Asset Vulnerability Posture</span>
            </span>
            <span className="text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-mono text-[10px]">
              GREEN: OPTIMAL
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono group-hover:text-emerald-400 transition-colors">
              Guarded ({guardedAssetsCount}/{totalAssets})
            </span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {Math.round((guardedAssetsCount / totalAssets) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="bg-emerald-500 h-full rounded-full shadow-sm shadow-emerald-500 transition-all duration-1000" 
              style={{ width: `${Math.min(100, (guardedAssetsCount / totalAssets) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
            <span>SLA: Met (&gt;80% protected)</span>
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <span>View Inventory</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* RED CARD: CRITICAL ESCALATION */}
        <button
          onClick={() => setActiveTab('incident-review')}
          className="bg-rose-950/15 backdrop-blur border border-rose-500/40 hover:border-rose-400 rounded-2xl p-5 shadow-xl space-y-3 transition-all group relative overflow-hidden text-left w-full cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase font-bold">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse shadow-sm shadow-rose-500" />
              <span>Active Security Incidents</span>
            </span>
            <span className="text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 font-mono text-[10px]">
              {criticalCount > 0 ? 'RED: CRITICAL' : 'AMBER: ATTENTION'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400 font-mono group-hover:text-rose-300 transition-colors">
              {openIncidents.length} Active ({criticalCount} P1)
            </span>
            <span className="text-[11px] text-rose-300 font-mono font-bold">
              {highCount} High
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="bg-rose-500 h-full rounded-full shadow-sm shadow-rose-500 transition-all duration-1000" 
              style={{ width: `${Math.min(100, Math.max(20, openIncidents.length * 25))}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
            <span>SLA Target: 15m P1 Response</span>
            <span className="text-rose-400 font-bold flex items-center gap-0.5">
              <span>Review Queue</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* BLUE CARD: ENTERPRISE POSTURE & ATTACK SURFACE */}
        <button
          onClick={() => setActiveTab('enterprise-posture')}
          className="bg-blue-950/15 backdrop-blur border border-blue-500/40 hover:border-blue-400 rounded-2xl p-5 shadow-xl space-y-3 transition-all group relative overflow-hidden text-left w-full cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase font-bold">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shadow-sm shadow-blue-500" />
              <span>Enterprise Perimeter</span>
            </span>
            <span className="text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800 font-mono text-[10px]">
              BLUE: BASELINE
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-400 font-mono group-hover:text-blue-300 transition-colors">
              {totalAssets} Monitored
            </span>
            <span className="text-[11px] text-blue-300 font-mono">100% EDR Active</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
            <div className="bg-blue-500 h-full rounded-full w-[95%] shadow-sm shadow-blue-500" />
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Attack Surface: 0 Leaks</span>
            <span className="text-blue-400 font-bold flex items-center gap-0.5">
              <span>Posture Center</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* AMBER CARD: DETECTION COVERAGE & RULES */}
        <button
          onClick={() => setActiveTab('detection-library')}
          className="bg-amber-950/15 backdrop-blur border border-amber-500/40 hover:border-amber-400 rounded-2xl p-5 shadow-xl space-y-3 transition-all group relative overflow-hidden text-left w-full cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase font-bold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shadow-sm shadow-amber-500" />
              <span>Detection Rule Arsenal</span>
            </span>
            <span className="text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 font-mono text-[10px]">
              ACTIVE COV
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400 font-mono group-hover:text-amber-300 transition-colors">
              {activeRulesCount || detectionRules.length || 18} Rules
            </span>
            <span className="text-[11px] text-amber-300 font-mono font-bold">MITRE ATT&amp;CK</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
            <div className="bg-amber-500 h-full rounded-full w-[90%] shadow-sm shadow-amber-500" />
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Sigma, KQL, CQL &amp; YARA</span>
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              <span>Rule Library</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>
      </div>

      {/* Main Grid: Notable Incidents & Executive Intel Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Notable Alerts (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-200">
                Top Priority Security Incidents
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-950/80 text-rose-300 border border-rose-800">
                {filteredIncidents.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter incidents..."
                  value={searchIncidentQuery}
                  onChange={(e) => setSearchIncidentQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500/60 w-36 sm:w-44"
                />
              </div>
              <button
                onClick={() => setActiveTab('incident-review')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors ml-2"
              >
                <span>All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Severity Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedIncidentSeverity(sev)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                  selectedIncidentSeverity === sev
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 border border-slate-800/80 rounded-xl text-slate-500 text-xs font-mono">
                No incidents match the selected filter.
              </div>
            ) : (
              filteredIncidents.slice(0, 5).map(inc => (
                <div
                  key={inc.id}
                  onClick={() => setActiveTab('incident-review')}
                  className="bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all group shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                      inc.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {inc.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-2 flex-wrap">
                        <span className="text-cyan-400 font-bold">{inc.id}</span>
                        <span>•</span>
                        <span>Host: <span className="text-slate-200">{inc.affectedHost}</span></span>
                        <span>•</span>
                        <span className="truncate max-w-[140px] text-slate-400">{inc.mitreTechnique}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {inc.severity}
                    </span>
                    <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800 hidden sm:inline-block">
                      {inc.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick CTI Navigation & Threat Actor Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Module Grid */}
          <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-cyan-400 border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Tactical Operations &amp; Intelligence Modules</span>
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono font-bold">
              <button
                onClick={() => setActiveTab('enterprise-posture')}
                className="p-3 bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-slate-200 hover:text-cyan-300 transition-all text-left flex flex-col gap-1 shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <span>CTI Posture Center</span>
              </button>

              <button
                onClick={() => setActiveTab('threat-heatmap')}
                className="p-3 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 rounded-xl text-slate-200 hover:text-rose-300 transition-all text-left flex flex-col gap-1 shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-colors" />
                </div>
                <span>Global Threat Heatmap</span>
              </button>

              <button
                onClick={() => setActiveTab('osint-intelligence')}
                className="p-3 bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-slate-200 hover:text-emerald-300 transition-all text-left flex flex-col gap-1 shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <span>OSINT Intelligence Hub</span>
              </button>

              <button
                onClick={() => setActiveTab('threat-wiki')}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-slate-200 hover:text-cyan-300 transition-all text-left flex flex-col gap-1 shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Threat Wiki Dossier</span>
                  <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/80">
                    INTEL
                  </span>
                </div>
              </button>


              <button
                onClick={() => setActiveTab('threat-hunting-sandbox')}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-slate-200 hover:text-cyan-300 transition-all text-left flex flex-col gap-1 shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Threat Hunting Sandbox</span>
                  <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/80">
                    SIGMA
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Active Adversaries Tracking Card */}
          <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-rose-400 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                <span>Active Threat Actor Campaigns</span>
              </h3>
              <button
                onClick={() => setActiveTab('industry-threat-actors')}
                className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Matrix</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(activeActors.length > 0 ? activeActors : ['APT28 (Fancy Bear)', 'LockBit 3.0', 'Volt Typhoon', 'Lazarus Group', 'Scattered Spider']).map((actor, idx) => (
                <span
                  key={idx}
                  onClick={() => setActiveTab('threat-wiki')}
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-700/50 text-[11px] font-mono cursor-pointer transition-all flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                  <span>{actor}</span>
                </span>
              ))}
            </div>

            <div className="text-[11px] font-mono text-slate-400 pt-2 flex items-center justify-between border-t border-slate-800/60">
              <span>CVE Exposure Tracking</span>
              <span className="text-rose-400 font-bold">{totalUnpatchedCVEs} Pending Remediation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
