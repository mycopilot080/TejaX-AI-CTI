import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  BarChart3, TrendingUp, ShieldAlert, PieChart as PieIcon, Globe, CheckCircle2, AlertTriangle, FileText,
  Building, Search, Shield, Zap, Target, ExternalLink, Filter, Crosshair,
  Calendar, Clock, Mail, Play, Send, Save, RefreshCw, Sliders, ToggleLeft, ToggleRight, Layers, FileCode
} from 'lucide-react';
import { GeospatialThreatMap } from './GeospatialThreatMap';

export const ThreatDashboard: React.FC = () => {
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'geo'>('overview');
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const threatTrendData = [
    { time: '00:00', events: 120, critical: 4 },
    { time: '04:00', events: 210, critical: 8 },
    { time: '08:00', events: 890, critical: 24 },
    { time: '12:00', events: 1450, critical: 42 },
    { time: '16:00', events: 1210, critical: 31 },
    { time: '20:00', events: 640, critical: 12 },
    { time: '24:00', events: 430, critical: 9 }
  ];

  const severityDistribution = [
    { name: 'Critical (Risk 90+)', value: 18, color: '#f43f5e' },
    { name: 'High (Risk 70-89)', value: 34, color: '#f59e0b' },
    { name: 'Medium (Risk 40-69)', value: 48, color: '#38bdf8' }
  ];

  const topTargetedHosts = [
    { host: 'DC-GLOBAL-01', incidents: 42 },
    { host: 'OKTA-PROXY-02', incidents: 31 },
    { host: 'FINANCE-WS-09', incidents: 25 },
    { host: 'AWS-IAM-ROLES', incidents: 19 },
    { host: 'FW-CORE-01', incidents: 14 }
  ];

  const attackVectorData = [
    { vector: 'LSASS Dump', count: 42 },
    { vector: 'Ransomware VSS', count: 35 },
    { vector: 'OAuth Consent', count: 28 },
    { vector: 'Kerberos Spray', count: 22 },
    { vector: 'SSH Tunnel', count: 16 }
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Enterprise Threat Dashboard & Telemetry Analytics</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                Real-Time CTI Telemetry
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated multi-vector telemetry, event volume trends, severity distribution, targeted host assets, and geospatial adversary mapping.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDashboardTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              dashboardTab === 'overview'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics & Charts</span>
          </button>
          <button
            onClick={() => setDashboardTab('geo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              dashboardTab === 'geo'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Geospatial Map</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-xs flex items-center gap-2 shadow-xl font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {dashboardTab === 'overview' ? (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow-md">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Total Ingested Events (24h)</div>
              <div className="text-2xl font-extrabold text-cyan-400 font-mono">4,120</div>
              <div className="text-[10px] text-emerald-400 font-mono">+12.4% vs previous 24h cycle</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow-md">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Critical Notables Triggered</div>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">130</div>
              <div className="text-[10px] text-rose-400 font-mono">Requires immediate SOAR playbook</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow-md">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Active Adversary Groups</div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">6 Groups</div>
              <div className="text-[10px] text-slate-400 font-mono">APT28, Lazarus, LockBit, Volt Typhoon</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow-md">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">SOC Automated Response Rate</div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">98.2%</div>
              <div className="text-[10px] text-emerald-400 font-mono">Average SLA response: 4.2 mins</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 24-Hour Threat Event Trend Area Chart (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>24-Hour Threat Event Volume & Critical Alert Trend</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Unit: Events / Hour</span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={threatTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="events" name="Total Ingested Events" stroke="#06b6d4" fillOpacity={1} fill="url(#colorEvents)" />
                    <Area type="monotone" dataKey="critical" name="Critical Notables" stroke="#f43f5e" fillOpacity={1} fill="url(#colorCritical)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Severity Distribution Donut Chart (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-rose-400" />
                  <span>Severity Breakdown</span>
                </h3>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {severityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Targeted Hostnames Bar Chart (6 cols) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                Top Targeted Hostnames & Cloud Assets
              </h3>
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topTargetedHosts} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis dataKey="host" type="category" stroke="#06b6d4" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="incidents" name="Incidents Triggered" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attack Vector Breakdown (6 cols) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                Top Attack Vector Breakdown
              </h3>
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attackVectorData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="vector" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" name="Detection Count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <GeospatialThreatMap />
        </div>
      )}

      {/* Official Source Intelligence References Footer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white">Active CTI Feeds & Source References:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 underline underline-offset-2"
          >
            <span>CISA KEV</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-600">|</span>
          <a
            href="https://attack.mitre.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 underline underline-offset-2"
          >
            <span>MITRE ATT&CK</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-600">|</span>
          <a
            href="https://nvd.nist.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 underline underline-offset-2"
          >
            <span>NIST NVD</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-600">|</span>
          <a
            href="https://otx.alienvault.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 underline underline-offset-2"
          >
            <span>AlienVault OTX</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
