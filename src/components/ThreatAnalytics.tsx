import React, { useState, useEffect } from 'react';
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
  Calendar, Clock, Mail, Play, Send, Save, RefreshCw, Sliders, ToggleLeft, ToggleRight, Layers, FileCode, Share2,
  Terminal, X, Check, ChevronDown, Hash
} from 'lucide-react';
import { GeospatialThreatMap } from './GeospatialThreatMap';
import { ThreatReports } from './ThreatReports';
import { ThreatCorrelationGraph } from './ThreatCorrelationGraph';
import { INITIAL_INDUSTRY_THREAT_ACTORS } from '../data/mockThreatActors';
import { IndustryThreatActor } from '../types/cti';
import { 
  subscribeThreatHuntRequests, 
  saveThreatHuntRequestToFirestore 
} from '../lib/firebase';

interface ThreatAnalyticsProps {
  initialSection?: 'all' | 'reports' | 'geo' | 'industry' | 'schedule' | 'graph';
  onNavigateToHunting?: (technique?: string) => void;
  onNavigateToSIEM?: (query?: string) => void;
}

export interface ThreatHuntRequest {
  id: string;
  actorId: string;
  actorName: string;
  targetIndustry: string;
  riskScore: number;
  hypothesis: string;
  selectedTTPs: string[];
  dataSources: string[];
  timeWindow: string;
  priority: 'CRITICAL (P1)' | 'HIGH (P2)' | 'MEDIUM (P3)';
  assignedHunter: string;
  scopeNotes: string;
  iocSeeds?: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'DISPATCHED_TO_SANDBOX' | 'COMPLETED';
  requestedAt: string;
}

export const generateDefaultHypothesis = (actor: IndustryThreatActor): string => {
  if (actor.actorName.includes('Lazarus')) {
    return 'Proactive hunt for LSASS memory dumping handles (GrantedAccess 0x1010) and unapproved DLL side-loading payloads targeting SWIFT banking interfaces and cryptocurrency signing nodes.';
  }
  if (actor.actorName.includes('Scattered Spider')) {
    return 'Investigate Okta and Azure AD identity logs for anomalous SessionId reassignments, MFA push fatigue flooding, and rogue OAuth application consent grants.';
  }
  if (actor.actorName.includes('Volt Typhoon')) {
    return 'Sweep Windows endpoint event logs for Living-off-the-Land port proxying (netsh interface portproxy) and unauthorized NTDS.dit snapshot extraction targeting OT network perimeters.';
  }
  if (actor.actorName.includes('APT28')) {
    return 'Examine domain controller process execution trees for Mimikatz sekurlsa and suspicious outbound DNS queries indicating tunnel establishment.';
  }
  if (actor.actorName.includes('LockBit')) {
    return 'Hunt for precursor Volume Shadow Copy deletion commands (vssadmin delete shadows / bcdedit) and mass file renaming activity across SMB shares.';
  }
  if (actor.actorName.includes('FIN7')) {
    return 'Inspect CI/CD automation runner logs and AWS CloudTrail for unauthorized StopLogging events or tampering with endpoint EDR telemetry.';
  }
  return `Proactive hunt targeting ${actor.actorName} operational TTPs, searching for evidence of ${actor.primaryTTPs.join(', ')} across perimeter and endpoint telemetry.`;
};

const INITIAL_HUNT_REQUESTS: ThreatHuntRequest[] = [
  {
    id: 'HUNT-2026-081',
    actorId: 'ACTOR-001',
    actorName: 'Lazarus Group (UNC2891 / Hidden Cobra)',
    targetIndustry: 'Financial Services',
    riskScore: 96,
    hypothesis: 'Proactive hunt for LSASS memory dumping handles (GrantedAccess 0x1010) and unapproved DLL side-loading payloads targeting SWIFT banking interfaces.',
    selectedTTPs: ['T1003 - Credential Dumping (LSASS)', 'T1059 - Command & Scripting Execution'],
    dataSources: ['WinEventLog:Security (Sysmon EventCode 10)', 'CrowdStrike Falcon EDR Sensor'],
    timeWindow: 'Last 24 Hours',
    priority: 'CRITICAL (P1)',
    assignedHunter: 'sharath.skt55@gmail.com',
    scopeNotes: 'Focus on DC-GLOBAL-01 and SWIFT gateway jump hosts.',
    iocSeeds: 'FastCash, AppleJeus, CVE-2026-3912',
    status: 'IN_PROGRESS',
    requestedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
  },
  {
    id: 'HUNT-2026-079',
    actorId: 'ACTOR-003',
    actorName: 'Volt Typhoon (BRONZE SILHOUETTE)',
    targetIndustry: 'Energy & OT Infrastructure',
    riskScore: 92,
    hypothesis: 'Sweep Windows event logs for living-off-the-land portproxy creation (netsh interface portproxy) on OT jump boxes.',
    selectedTTPs: ['T1190 - Exploit Public-Facing Edge Application', 'T1021.004 - SSH & VPN Tunneling'],
    dataSources: ['Cisco ASA / Firewall Perimeter Egress', 'WinEventLog:Security (Sysmon)'],
    timeWindow: 'Last 7 Days',
    priority: 'HIGH (P2)',
    assignedHunter: 'sharath.skt55@gmail.com',
    scopeNotes: 'Inspect OT substation jump servers for unusual SSH tunnels.',
    iocSeeds: 'FastReverseProxy, CVE-2026-4401',
    status: 'QUEUED',
    requestedAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString()
  }
];

export interface ScheduledReportExecution {
  id: string;
  triggerSource: 'CRON_SCHEDULE' | 'MANUAL_RUN';
  timeWindow: string; // Fixed at "Last 24 Hours"
  executedAt: string;
  recipientEmail: string;
  status: 'DISPATCHED' | 'RUNNING' | 'FAILED';
  summaryPreview: string;
}

const INITIAL_SCHEDULED_RUNS: ScheduledReportExecution[] = [
  {
    id: 'SCH-RUN-2026-004',
    triggerSource: 'CRON_SCHEDULE',
    timeWindow: 'Last 24 Hours',
    executedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    recipientEmail: 'sharath.skt55@gmail.com',
    status: 'DISPATCHED',
    summaryPreview: 'Automated 24h Threat Briefing: 3 Critical Advisories (LSASS Dumping, LockBit 3.0, Scattered Spider OAuth).'
  },
  {
    id: 'SCH-RUN-2026-003',
    triggerSource: 'CRON_SCHEDULE',
    timeWindow: 'Last 24 Hours',
    executedAt: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
    recipientEmail: 'sharath.skt55@gmail.com',
    status: 'DISPATCHED',
    summaryPreview: 'Automated 24h Threat Briefing: Volt Typhoon OT Tunneling & CISA KEV Exploits.'
  }
];

export const ThreatAnalytics: React.FC<ThreatAnalyticsProps> = ({
  initialSection = 'all',
  onNavigateToHunting,
  onNavigateToSIEM
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'reports' | 'geo' | 'industry' | 'schedule' | 'graph'>(
    initialSection || 'all'
  );
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState<string>('ALL');
  const [actorSearchQuery, setActorSearchQuery] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Threat Hunt Request Modal & Queue State
  const [selectedActorForHunt, setSelectedActorForHunt] = useState<IndustryThreatActor | null>(null);
  const [huntHypothesis, setHuntHypothesis] = useState<string>('');
  const [huntSelectedTTPs, setHuntSelectedTTPs] = useState<string[]>([]);
  const [huntDataSources, setHuntDataSources] = useState<string[]>([
    'WinEventLog:Security (Sysmon EventCode 1, 10, 18)',
    'CrowdStrike Falcon EDR Sensor Telemetry'
  ]);
  const [huntTimeWindow, setHuntTimeWindow] = useState<string>('Last 24 Hours');
  const [huntPriority, setHuntPriority] = useState<'CRITICAL (P1)' | 'HIGH (P2)' | 'MEDIUM (P3)'>('CRITICAL (P1)');
  const [huntHunter, setHuntHunter] = useState<string>('sharath.skt55@gmail.com');
  const [huntScopeNotes, setHuntScopeNotes] = useState<string>('');
  const [huntIocSeeds, setHuntIocSeeds] = useState<string>('');
  const [showHuntQueue, setShowHuntQueue] = useState<boolean>(true);

  const [huntRequestsList, setHuntRequestsList] = useState<ThreatHuntRequest[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeThreatHuntRequests((firestoreHunts: ThreatHuntRequest[]) => {
      if (firestoreHunts && firestoreHunts.length > 0) {
        setHuntRequestsList(firestoreHunts);
      } else {
        // Seed initial hunt requests if empty
        INITIAL_HUNT_REQUESTS.forEach(h => saveThreatHuntRequestToFirestore(h));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenHuntModal = (actor: IndustryThreatActor) => {
    setSelectedActorForHunt(actor);
    setHuntHypothesis(generateDefaultHypothesis(actor));
    setHuntSelectedTTPs([...actor.primaryTTPs]);
    setHuntPriority(actor.riskScore >= 90 ? 'CRITICAL (P1)' : 'HIGH (P2)');
    setHuntIocSeeds([...actor.associatedMalware, ...actor.cveTargets].join(', '));
    setHuntScopeNotes(`Target Sector: ${actor.targetIndustry}. Focus on perimeter edges and privileged servers.`);
  };

  const handleSubmitHuntRequest = (launchSandbox = false) => {
    if (!selectedActorForHunt) return;

    const newRequest: ThreatHuntRequest = {
      id: `HUNT-2026-${Math.floor(100 + Math.random() * 900)}`,
      actorId: selectedActorForHunt.id,
      actorName: selectedActorForHunt.actorName,
      targetIndustry: selectedActorForHunt.targetIndustry,
      riskScore: selectedActorForHunt.riskScore,
      hypothesis: huntHypothesis.trim() || generateDefaultHypothesis(selectedActorForHunt),
      selectedTTPs: huntSelectedTTPs.length > 0 ? huntSelectedTTPs : selectedActorForHunt.primaryTTPs,
      dataSources: huntDataSources,
      timeWindow: huntTimeWindow,
      priority: huntPriority,
      assignedHunter: huntHunter || 'sharath.skt55@gmail.com',
      scopeNotes: huntScopeNotes,
      iocSeeds: huntIocSeeds,
      status: launchSandbox ? 'DISPATCHED_TO_SANDBOX' : 'QUEUED',
      requestedAt: new Date().toISOString()
    };

    const updated = [newRequest, ...huntRequestsList];
    setHuntRequestsList(updated);
    saveThreatHuntRequestToFirestore(newRequest);

    const missionMsg = `Threat Hunt Mission [${newRequest.id}] requested for ${selectedActorForHunt.actorName}! Dispatched to ${newRequest.assignedHunter}. Saved to Firestore.`;
    setActionFeedback(missionMsg);
    setTimeout(() => setActionFeedback(null), 5000);

    const firstTTP = newRequest.selectedTTPs[0] ? newRequest.selectedTTPs[0].split(' ')[0] : 'T1003';
    setSelectedActorForHunt(null);

    if (launchSandbox && onNavigateToHunting) {
      onNavigateToHunting(firstTTP);
    }
  };

  // Scheduled 24-Hour Threat Report State (EXCLUSIVELY UNDER THREAT ANALYTICS)
  const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(true);
  const [cronExpression, setCronExpression] = useState<string>('0 0 * * *'); // Daily at 00:00 UTC
  const [recipientEmails, setRecipientEmails] = useState<string>('sharath.skt55@gmail.com');
  const [includeHtml, setIncludeHtml] = useState<boolean>(true);
  const [includeStixJson, setIncludeStixJson] = useState<boolean>(true);
  const [includeIocsCsv, setIncludeIocsCsv] = useState<boolean>(true);
  const [isExecutingNow, setIsExecutingNow] = useState<boolean>(false);
  const [scheduleHistory, setScheduleHistory] = useState<ScheduledReportExecution[]>(INITIAL_SCHEDULED_RUNS);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // 24-Hour Event Volume Trend Data
  const threatTrendData = [
    { time: '00:00', events: 120, critical: 4 },
    { time: '04:00', events: 210, critical: 8 },
    { time: '08:00', events: 890, critical: 24 },
    { time: '12:00', events: 1450, critical: 42 },
    { time: '16:00', events: 1210, critical: 31 },
    { time: '20:00', events: 640, critical: 12 },
    { time: '24:00', events: 430, critical: 9 }
  ];

  // Severity Distribution Data
  const severityDistribution = [
    { name: 'Critical (Risk 90+)', value: 18, color: '#f43f5e' },
    { name: 'High (Risk 70-89)', value: 34, color: '#f59e0b' },
    { name: 'Medium (Risk 40-69)', value: 82, color: '#3b82f6' },
    { name: 'Low (Risk <40)', value: 240, color: '#10b981' }
  ];

  // Top Targeted Hosts Data
  const topTargetedHosts = [
    { host: 'DC-GLOBAL-01', incidents: 42 },
    { host: 'FINANCE-WS-09', incidents: 28 },
    { host: 'EXEC-LAPTOP-04', incidents: 19 },
    { host: 'AWS-PROD-CT', incidents: 15 },
    { host: 'FW-CORE-01', incidents: 12 }
  ];

  // Attack Vector Breakdown
  const attackVectorData = [
    { vector: 'LSASS Dump', count: 48 },
    { vector: 'Shadow Copy Purge', count: 32 },
    { vector: 'OAuth Consent Abuse', count: 24 },
    { vector: 'SSH Tunneling (OT)', count: 18 },
    { vector: 'CloudTrail Disabling', count: 14 }
  ];

  // Filter Industry Threat Actors
  const filteredThreatActors = INITIAL_INDUSTRY_THREAT_ACTORS.filter((actor) => {
    const q = actorSearchQuery.toLowerCase();
    const matchesQuery =
      actor.actorName.toLowerCase().includes(q) ||
      actor.origin.toLowerCase().includes(q) ||
      actor.targetIndustry.toLowerCase().includes(q) ||
      actor.aliases.some((a) => a.toLowerCase().includes(q)) ||
      actor.associatedMalware.some((m) => m.toLowerCase().includes(q)) ||
      actor.primaryTTPs.some((t) => t.toLowerCase().includes(q));

    const matchesIndustry = selectedIndustryFilter === 'ALL' || actor.targetIndustry === selectedIndustryFilter;
    return matchesQuery && matchesIndustry;
  });

  // Industry Risk Summary for Chart
  const industryRiskChartData = INITIAL_INDUSTRY_THREAT_ACTORS.map((a) => ({
    industry: a.targetIndustry.split(' ')[0], // short name
    fullIndustry: a.targetIndustry,
    riskScore: a.riskScore,
    actor: a.actorName.split(' ')[0]
  }));

  const handleActionClick = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Run Scheduled 24h Threat Report Now
  const handleRunScheduledReportNow = async () => {
    setIsExecutingNow(true);
    try {
      const res = await fetch('/api/dispatch-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipientEmails.split(',')[0].trim(),
          incidentTitle: '[SCHEDULED 24H REPORT] Executive Cyber Intelligence Threat Briefing',
          severity: 'CRITICAL',
          riskScore: 95,
          affectedHost: 'Last 24-Hour Telemetry & Threat Intelligence Evaluation',
          executiveSummary:
            'This automated 24-hour threat report compiles critical CTI advisories, LSASS memory handle dumps, ransomware shadow purges, and Okta OAuth consent abuse over the last 24 hours.',
          technicalSummary:
            'Automated 24h evaluation window: Analyzed 4,120 ingested events across Windows, Cisco ASA, AWS CloudTrail, and Okta tenant logs.',
          iocs: {
            ips: ['185.220.101.5', '198.51.100.41', '45.154.255.82'],
            domains: ['c2.darknet-nexus.ru', 'entra-auth-verify.com'],
            hashes: ['e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
            processes: ['lsass.exe', 'vssadmin.exe', 'powershell.exe']
          }
        })
      });

      const newRun: ScheduledReportExecution = {
        id: `SCH-RUN-${Date.now().toString().slice(-6)}`,
        triggerSource: 'MANUAL_RUN',
        timeWindow: 'Last 24 Hours',
        executedAt: new Date().toISOString(),
        recipientEmail: recipientEmails,
        status: 'DISPATCHED',
        summaryPreview: 'Executed 24h Threat Report: Dispatched executive summary & defanged IOCs to ' + recipientEmails
      };

      setScheduleHistory([newRun, ...scheduleHistory]);
      setActionFeedback(`Executed Scheduled 24-Hour Threat Report & Dispatched Email to ${recipientEmails}!`);
      setTimeout(() => setActionFeedback(null), 4500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecutingNow(false);
    }
  };

  const handleSaveScheduleConfig = () => {
    setActionFeedback('Saved Scheduled 24h Threat Report configuration! Schedule status: ' + (scheduleEnabled ? 'ACTIVE (Daily 00:00 UTC)' : 'PAUSED'));
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const renderHuntQueue = () => {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Crosshair className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Active Threat Hunt Missions Queue</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {huntRequestsList.length} Active Missions
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToHunting && (
              <button
                onClick={() => onNavigateToHunting()}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Go to Hunting Sandbox</span>
              </button>
            )}
            <button
              onClick={() => setShowHuntQueue(!showHuntQueue)}
              className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 transition-colors"
            >
              <span>{showHuntQueue ? 'Hide Queue' : 'Show Queue'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHuntQueue ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showHuntQueue && (
          <div className="space-y-2.5 pt-1">
            {huntRequestsList.map((hunt) => (
              <div
                key={hunt.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-cyan-300 text-xs px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800">
                      {hunt.id}
                    </span>
                    <span className="font-bold text-white text-xs">{hunt.actorName}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
                      {hunt.targetIndustry}
                    </span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                        hunt.priority.includes('CRITICAL')
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {hunt.priority}
                    </span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                        hunt.status === 'IN_PROGRESS'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : hunt.status === 'DISPATCHED_TO_SANDBOX'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {hunt.status}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                    <span className="text-slate-500 font-mono">Hypothesis: </span>
                    {hunt.hypothesis}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 flex-wrap">
                    <span className="text-slate-500">TTPs:</span>
                    {hunt.selectedTTPs.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                        {t.split(' - ')[0]}
                      </span>
                    ))}
                    <span>• Assigned: {hunt.assignedHunter}</span>
                    <span>• Window: {hunt.timeWindow}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center font-sans">
                  {onNavigateToHunting && (
                    <button
                      onClick={() => onNavigateToHunting(hunt.selectedTTPs[0]?.split(' ')[0] || 'T1003')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold transition-all"
                    >
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Hunt in Sandbox</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderHuntModal = () => {
    if (!selectedActorForHunt) return null;

    const availableSources = [
      'WinEventLog:Security (Sysmon EventCode 1, 10, 18)',
      'CrowdStrike Falcon EDR Sensor Telemetry',
      'Cisco ASA / Firewall Perimeter Egress',
      'Okta System Log / Identity Provider Audit',
      'AWS CloudTrail / Cloud IAM Logs'
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Crosshair className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">Request Threat Hunt Mission</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    ADVERSARY HUNT
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scope and dispatch a proactive threat hunting mission against {selectedActorForHunt.actorName}.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedActorForHunt(null)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitHuntRequest(false);
            }}
            className="p-5 overflow-y-auto space-y-4 text-xs font-sans"
          >
            {/* Target Adversary Profile Banner */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{selectedActorForHunt.actorName}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    RISK {selectedActorForHunt.riskScore}/100
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3 flex-wrap">
                  <span>Origin: <strong className="text-cyan-300">{selectedActorForHunt.origin}</strong></span>
                  <span>Sector: <strong className="text-slate-200">{selectedActorForHunt.targetIndustry}</strong></span>
                  <span>Motivation: <strong className="text-amber-300">{selectedActorForHunt.motivation}</strong></span>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-700 self-start sm:self-auto">
                {selectedActorForHunt.cveTargets.length} CVEs Targeted
              </span>
            </div>

            {/* Hunting Hypothesis */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-cyan-400 uppercase font-bold flex items-center justify-between">
                <span>1. Threat Hunting Hypothesis &amp; Objective *</span>
                <span className="text-[10px] text-slate-500 font-normal">Editable Hypothesis</span>
              </label>
              <textarea
                rows={3}
                required
                value={huntHypothesis}
                onChange={(e) => setHuntHypothesis(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans text-xs"
                placeholder="Enter proactive hypothesis to test in the environment..."
              />
            </div>

            {/* Target TTPs to Investigate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-cyan-400 uppercase font-bold">
                  2. Target MITRE ATT&amp;CK Techniques
                </label>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setHuntSelectedTTPs([...selectedActorForHunt.primaryTTPs])}
                    className="text-cyan-400 hover:underline"
                  >
                    Select All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setHuntSelectedTTPs([])}
                    className="text-slate-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {selectedActorForHunt.primaryTTPs.map((ttp, idx) => {
                  const isChecked = huntSelectedTTPs.includes(ttp);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setHuntSelectedTTPs((prev) =>
                          prev.includes(ttp) ? prev.filter((t) => t !== ttp) : [...prev, ttp]
                        );
                      }}
                      className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isChecked ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold' : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span>{ttp}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">ATT&amp;CK</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Telemetry Sources to Ingest */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-cyan-400 uppercase font-bold">
                3. Telemetry &amp; Log Sources to Scope
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableSources.map((source, idx) => {
                  const isChecked = huntDataSources.includes(source);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setHuntDataSources((prev) =>
                          prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
                        );
                      }}
                      className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-slate-900 border-cyan-500/40 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                          isChecked ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold' : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] font-mono truncate">{source}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scope Parameters: Time Window, Priority, Hunter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Investigation Window</label>
                <select
                  value={huntTimeWindow}
                  onChange={(e) => setHuntTimeWindow(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="Last 24 Hours">Last 24 Hours (Fast Triage)</option>
                  <option value="Last 7 Days">Last 7 Days (Standard Sweep)</option>
                  <option value="Last 14 Days">Last 14 Days (Extended Sweep)</option>
                  <option value="Last 30 Days">Last 30 Days (Deep Forensics)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Hunt Priority / SLA</label>
                <select
                  value={huntPriority}
                  onChange={(e) => setHuntPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="CRITICAL (P1)">CRITICAL (P1) - Immediate</option>
                  <option value="HIGH (P2)">HIGH (P2) - 4h Window</option>
                  <option value="MEDIUM (P3)">MEDIUM (P3) - Scheduled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Assigned Lead Hunter</label>
                <input
                  type="email"
                  required
                  value={huntHunter}
                  onChange={(e) => setHuntHunter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Seed IOCs & Scope Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Seed Malware &amp; CVE IOCs</label>
                <input
                  type="text"
                  value={huntIocSeeds}
                  onChange={(e) => setHuntIocSeeds(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="e.g. FastCash, CVE-2026-3912"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Scope Notes &amp; Target Assets</label>
                <input
                  type="text"
                  value={huntScopeNotes}
                  onChange={(e) => setHuntScopeNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Priority focus on DC-GLOBAL-01 and financial gateways"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedActorForHunt(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Submit to Hunt Queue</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmitHuntRequest(true)}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Submit &amp; Launch Sandbox</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (initialSection === 'industry') {
    return (
      <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Industry Threat Actor Intelligence</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Adversary Matrix
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Industry-wise adversary matrix, targeting sectors, TTPs, associated malware, and recommended SOC defenses.
              </p>
            </div>
          </div>
        </div>

        {actionFeedback && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-xs flex items-center gap-2 shadow-xl animate-fadeIn font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Active Threat Hunt Requests Queue */}
        {renderHuntQueue()}

        {/* Industry Threat Actor Matrix & Cards */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400" />
                  <span>Industry-Wise Threat Actor Intelligence Matrix</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    {INITIAL_INDUSTRY_THREAT_ACTORS.length} Active Threat Groups Tracked
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adversary targeting matrix mapped across critical infrastructure, financial services, healthcare, defense, and technology sectors.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search threat group, TTP, malware..."
                    value={actorSearchQuery}
                    onChange={(e) => setActorSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Industry Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { label: 'All Industries', value: 'ALL' },
                { label: 'Financial Services', value: 'Financial Services' },
                { label: 'Technology & Cloud', value: 'Technology & Cloud' },
                { label: 'Energy & OT', value: 'Energy & OT Infrastructure' },
                { label: 'Defense & Gov', value: 'Defense & Government' },
                { label: 'Healthcare & Biotech', value: 'Healthcare & Biotech' },
                { label: 'Industrial & Manufacturing', value: 'Industrial & Manufacturing' }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedIndustryFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedIndustryFilter === tab.value
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Threat Actor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredThreatActors.map((actor) => (
                <div
                  key={actor.id}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xl space-y-3.5 shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{actor.actorName}</span>
                        </h4>
                        <div className="text-[11px] text-cyan-400 font-mono font-medium mt-0.5">
                          Origin: {actor.origin}
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 shrink-0">
                        RISK {actor.riskScore}/100
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800 font-bold flex items-center gap-1">
                        <Building className="w-3 h-3 text-cyan-400" />
                        <span>{actor.targetIndustry}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                        {actor.motivation}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                      {actor.description}
                    </p>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                        Primary MITRE TTPs
                      </span>
                      <div className="space-y-1">
                        {actor.primaryTTPs.map((ttp, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] font-mono bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-800/80 truncate flex items-center gap-1.5"
                          >
                            <Crosshair className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate">{ttp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                        Associated Malware & Ransomware
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {actor.associatedMalware.map((m, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/30 font-semibold"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                        Target CVE Exploits
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {actor.cveTargets.map((cve, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                          >
                            {cve}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                        Recommended SOC Controls
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {actor.recommendedDefenses.map((def, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{def}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenHuntModal(actor)}
                      className="w-full py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 hover:border-cyan-400/60 text-xs font-bold text-center flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Request Threat Hunt</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredThreatActors.length === 0 && (
                <div className="col-span-full bg-slate-950 border border-slate-800 p-8 rounded-xl text-center text-slate-500 text-xs">
                  No industry threat actors found matching "{actorSearchQuery}" in {selectedIndustryFilter}.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request Threat Hunt Modal */}
        {renderHuntModal()}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Industry Threat Actor Intelligence</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                SOC Intelligence Suite
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Industry-wise adversary matrix, targeting sectors, TTPs, associated malware, and recommended SOC defenses.
            </p>
          </div>
        </div>

        {/* Section View Filters */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all ${
              activeSection === 'all' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Dashboards
          </button>

          <button
            onClick={() => setActiveSection('industry')}
            className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'industry' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Industry Threat Actors</span>
          </button>

          <button
            onClick={() => setActiveSection('schedule')}
            className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'schedule' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Schedule 24h Reports</span>
          </button>

          <button
            onClick={() => setActiveSection('reports')}
            className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'reports' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>24h Threat Reports</span>
          </button>

          <button
            onClick={() => setActiveSection('geo')}
            className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'geo' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Geospatial Map</span>
          </button>

          <button
            onClick={() => setActiveSection('graph')}
            className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'graph' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Correlation Graph</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-xs flex items-center gap-2 shadow-xl animate-fadeIn font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* SCHEDULED 24-HOUR THREAT REPORT MANAGER (KEPT EXCLUSIVELY UNDER THREAT ANALYTICS) */}
      {(activeSection === 'all' || activeSection === 'schedule') && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Scheduled 24-Hour Threat Report Automation</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    scheduleEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {scheduleEnabled ? 'SCHEDULE ACTIVE' : 'SCHEDULE PAUSED'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically evaluates telemetry over the last 24 hours, generates synthesized threat briefings, and dispatches email reports.
              </p>
            </div>

            <button
              onClick={handleRunScheduledReportNow}
              disabled={isExecutingNow}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 shrink-0"
            >
              {isExecutingNow ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Executing 24h Report...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Run Schedule Now (24h)</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Schedule Configuration Form (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>24-Hour Report Schedule Settings</span>
                </span>

                <button
                  onClick={() => setScheduleEnabled(!scheduleEnabled)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                    scheduleEnabled
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {scheduleEnabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-amber-400" />}
                  <span>{scheduleEnabled ? 'ENABLED' : 'DISABLED'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Fixed Time Window */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[11px] block">Report Evaluation Window:</label>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-cyan-300 font-mono font-bold flex items-center justify-between">
                    <span>Last 24 Hours (Fixed)</span>
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                </div>

                {/* Cron Schedule Interval */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[11px] block">Cron Recurrence Interval:</label>
                  <select
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="0 0 * * *">Daily at 00:00 UTC (0 0 * * *)</option>
                    <option value="0 */12 * * *">Every 12 Hours (0 */12 * * *)</option>
                    <option value="0 */6 * * *">Every 6 Hours (0 */6 * * *)</option>
                    <option value="0 * * * *">Every 1 Hour (0 * * * *)</option>
                  </select>
                </div>
              </div>

              {/* Recipient Email List */}
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[11px] block flex items-center justify-between">
                  <span>Target Dispatch Recipient Emails:</span>
                  <span className="text-slate-500 font-normal">Comma-separated for multiple analysts</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={recipientEmails}
                    onChange={(e) => setRecipientEmails(e.target.value)}
                    placeholder="sharath.skt55@gmail.com, soc-lead@enterprise.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Report Attachment Options */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Included 24h Report Artifacts:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <label className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeHtml}
                      onChange={(e) => setIncludeHtml(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span className="text-slate-200">HTML Briefing</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeStixJson}
                      onChange={(e) => setIncludeStixJson(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span className="text-slate-200">STIX 2.1 JSON</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeIocsCsv}
                      onChange={(e) => setIncludeIocsCsv(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span className="text-slate-200">Defanged IOCs CSV</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={handleSaveScheduleConfig}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
                >
                  <Save className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Save Schedule Configuration</span>
                </button>
              </div>
            </div>

            {/* Next Execution Status & History Log (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                  Next Scheduled Execution Status
                </span>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Recurrence Cron:</span>
                    <strong className="text-amber-400">{cronExpression}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Target Lookback:</span>
                    <strong className="text-cyan-400">Last 24 Hours</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Next Trigger Time:</span>
                    <strong className="text-emerald-400">00:00 UTC (In ~4h 20m)</strong>
                  </div>
                </div>
              </div>

              {/* Execution History List */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  24h Report Execution Log History ({scheduleHistory.length})
                </span>

                <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono text-xs pr-1">
                  {scheduleHistory.map((run) => (
                    <div
                      key={run.id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{run.id}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {run.status}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[10px] flex items-center justify-between">
                        <span>Source: {run.triggerSource}</span>
                        <span>{new Date(run.executedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-slate-300 truncate text-[10px]">
                        {run.summaryPreview}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 1: INDUSTRY-WISE THREAT ACTORS MATRIX */}
      {activeSection === 'industry' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400" />
                  <span>Industry-Wise Threat Actor Intelligence Matrix</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    {INITIAL_INDUSTRY_THREAT_ACTORS.length} Active Threat Groups Tracked
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adversary targeting matrix mapped across critical infrastructure, financial services, healthcare, defense, and technology sectors.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search threat group, TTP, malware..."
                    value={actorSearchQuery}
                    onChange={(e) => setActorSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Industry Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { label: 'All Industries', value: 'ALL' },
                { label: 'Financial Services', value: 'Financial Services' },
                { label: 'Technology & Cloud', value: 'Technology & Cloud' },
                { label: 'Energy & OT', value: 'Energy & OT Infrastructure' },
                { label: 'Defense & Gov', value: 'Defense & Government' },
                { label: 'Healthcare & Biotech', value: 'Healthcare & Biotech' },
                { label: 'Industrial & Manufacturing', value: 'Industrial & Manufacturing' }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedIndustryFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedIndustryFilter === tab.value
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Risk Distribution Chart by Industry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="lg:col-span-8 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Industry Threat Risk Score Comparison</span>
                </h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={industryRiskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="industry" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis domain={[80, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Bar dataKey="riskScore" name="Adversary Risk Score" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-2 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block mb-1">
                    Critical Threat Level Summary
                  </span>
                  <div className="text-xl font-extrabold text-white font-mono">
                    {filteredThreatActors.length} Threat Groups
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Highest concentration observed in Financial Services (Lazarus Group) and Technology Cloud infrastructure (Scattered Spider).
                  </p>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-300 font-bold flex items-center justify-between">
                    <span>Target Overlaps:</span>
                    <span className="text-cyan-400 font-mono">6 CVEs Active</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    CVE-2026-21840, CVE-2026-30114, CVE-2026-4401
                  </div>
                </div>
              </div>
            </div>

            {/* Active Threat Hunt Requests Queue */}
            {renderHuntQueue()}

            {/* Threat Actor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredThreatActors.map((actor) => (
                <div
                  key={actor.id}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xl space-y-3.5 shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{actor.actorName}</span>
                        </h4>
                        <div className="text-[11px] text-cyan-400 font-mono font-medium mt-0.5">
                          Origin: {actor.origin}
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 shrink-0">
                        RISK {actor.riskScore}/100
                      </span>
                    </div>

                    {/* Target Industry & Motivation */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800 font-bold flex items-center gap-1">
                        <Building className="w-3 h-3 text-cyan-400" />
                        <span>{actor.targetIndustry}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                        {actor.motivation}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                      {actor.description}
                    </p>

                    {/* TTPs */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                        Primary MITRE TTPs
                      </span>
                      <div className="space-y-1">
                        {actor.primaryTTPs.map((ttp, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] font-mono bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-800/80 truncate flex items-center gap-1.5"
                          >
                            <Crosshair className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate">{ttp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Associated Malware */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                        Associated Malware & Ransomware
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {actor.associatedMalware.map((m, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/30 font-semibold"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Target CVEs */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                        Target CVE Exploits
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {actor.cveTargets.map((cve, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                          >
                            {cve}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Defenses */}
                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                        Recommended SOC Controls
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {actor.recommendedDefenses.map((def, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{def}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenHuntModal(actor)}
                      className="w-full py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 hover:border-cyan-400/60 text-xs font-bold text-center flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Request Threat Hunt</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredThreatActors.length === 0 && (
                <div className="col-span-full bg-slate-950 border border-slate-800 p-8 rounded-xl text-center text-slate-500 text-xs">
                  No industry threat actors found matching "{actorSearchQuery}" in {selectedIndustryFilter}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* D3 FORCE-DIRECTED THREAT CORRELATION GRAPH MODULE */}
      {(activeSection === 'all' || activeSection === 'graph') && (
        <ThreatCorrelationGraph />
      )}

      {/* 24-HOUR THREAT REPORTS MODULE */}
      {(activeSection === 'all' || activeSection === 'reports') && (
        <ThreatReports />
      )}

      {/* Request Threat Hunt Modal */}
      {renderHuntModal()}
    </div>
  );
};
