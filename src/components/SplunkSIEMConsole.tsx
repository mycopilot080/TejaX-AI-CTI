import React, { useState, useEffect } from 'react';
import { SIEMLogEvent, SPLQueryResult } from '../types/cti';
import { executeSPLQuery } from '../services/splEngine';
import { DEV_SIEM_LOGS, PROD_SIEM_LOGS } from '../data/mockLogs';
import { SPLUNK_USE_CASES, SplunkUseCase } from '../data/mockSplunkUseCases';
import {
  Search,
  Play,
  Download,
  Bookmark,
  Clock,
  Terminal,
  BarChart2,
  Filter,
  FileSpreadsheet,
  BookOpen,
  CheckCircle2,
  Zap,
  ShieldAlert,
  Server,
  Globe,
  Activity,
  Layers,
  Settings,
  X,
  Radio,
  ExternalLink,
  ShieldCheck,
  Target,
  Workflow
} from 'lucide-react';

export type SplunkInstance = 'dev' | 'prod';

export interface SplunkInstanceConfig {
  id: SplunkInstance;
  name: string;
  clusterUrl: string;
  hecEndpoint: string;
  hecToken: string;
  indexers: string[];
  ingestionRateEps: number;
  licenseQuota: string;
  retentionPolicy: string;
  status: 'ACTIVE_HEALTHY' | 'SYNCING';
  defaultIndex: string;
  description: string;
}

export const SPLUNK_INSTANCES: Record<SplunkInstance, SplunkInstanceConfig> = {
  dev: {
    id: 'dev',
    name: 'Splunk DEV Instance (Staging & Test Cluster)',
    clusterUrl: 'https://splunk-dev-01.internal:8089',
    hecEndpoint: 'https://hec-dev.internal:8088/services/collector',
    hecToken: 'HEC-DEV-TOKEN-9942-8821',
    indexers: ['idx-dev-01.internal', 'idx-dev-02.internal'],
    ingestionRateEps: 120,
    licenseQuota: '50 GB / Day (Developer License)',
    retentionPolicy: '30 Days Hot/Warm (No Cold Storage)',
    status: 'ACTIVE_HEALTHY',
    defaultIndex: 'index=dev-winlogs OR index=dev-cloudlogs',
    description: 'Isolated staging environment for synthetic threat simulations, detection rule testing, and HEC log ingestion verification.'
  },
  prod: {
    id: 'prod',
    name: 'Splunk PROD Cluster (Enterprise SOC Production)',
    clusterUrl: 'https://splunk-prod-cluster.enterprise.com:8089',
    hecEndpoint: 'https://hec-prod.enterprise.com:8088/services/collector',
    hecToken: 'HEC-PROD-TOKEN-4411-0192',
    indexers: ['idx-prod-01.corp', 'idx-prod-02.corp', 'idx-prod-03.corp', 'idx-prod-04.corp', 'idx-prod-05.corp', 'idx-prod-06.corp'],
    ingestionRateEps: 1200,
    licenseQuota: '2.5 TB / Day (Enterprise License)',
    retentionPolicy: '90 Days Hot/Warm + 365 Days Cold S3 Glacier Backup',
    status: 'ACTIVE_HEALTHY',
    defaultIndex: 'index=winlogs OR index=cloudlogs OR index=netlogs',
    description: 'Primary production SIEM cluster processing real-time security events across enterprise endpoints, cloud identity, and firewalls.'
  }
};

export interface ThreatPlaybook {
  id: string;
  title: string;
  category: 'APT & Credential Theft' | 'Ransomware' | 'Cloud & Identity' | 'C2 & Lateral Movement' | 'OT Infrastructure' | 'Active Directory & Kerberos';
  mitreTtps: string[];
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  objective: string;
  multiStageSPL: string;
  expectedFindings: string;
}

export interface SplunkAlert {
  id: string;
  instance: SplunkInstance;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  triggerSchedule: string;
  splQuery: string;
  action: string;
  status: 'ENABLED' | 'DISABLED';
}

interface SplunkSIEMConsoleProps {
  logs: SIEMLogEvent[];
}

export const SplunkSIEMConsole: React.FC<SplunkSIEMConsoleProps> = ({ logs }) => {
  const [activeTab, setActiveTab] = useState<'console' | 'playbooks' | 'use-cases' | 'alerts'>('console');
  const [activeInstance, setActiveInstance] = useState<SplunkInstance>('prod');
  const [clusterModalOpen, setClusterModalOpen] = useState<boolean>(false);

  const currentInstanceConfig = SPLUNK_INSTANCES[activeInstance];
  const activeLogDataset = activeInstance === 'dev' ? DEV_SIEM_LOGS : (logs && logs.length > 0 ? logs : PROD_SIEM_LOGS);

  const [query, setQuery] = useState<string>(
    'index=winlogs sourcetype="sysmon" OR sourcetype="WinEventLog:Security" | stats count by host, sourcetype, user, status'
  );
  const [timeRangeHours, setTimeRangeHours] = useState<number>(24);
  const [queryResult, setQueryResult] = useState<SPLQueryResult | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'raw'>('table');
  const [executedNotice, setExecutedNotice] = useState<string | null>(null);

  const [savedQueries, setSavedQueries] = useState<string[]>([
    'index=winlogs sourcetype="sysmon" EventCode=10 GrantedAccess="0x1010" | stats count by host, SourceImage',
    'index=winlogs sourcetype="WinEventLog:Security" EventCode=4688 (CommandLine="*vssadmin*" OR CommandLine="*wmic*") | table _time, host, user, CommandLine',
    'index=cloudlogs sourcetype="aws:cloudtrail" eventName="StopLogging" | stats count by user, sourceIPAddress',
    'index=netlogs sourcetype="cisco:asa" action="built" dest_port=22 | stats count by src_ip, dest_ip | where count > 5'
  ]);

  const [useCases, setUseCases] = useState<SplunkUseCase[]>(SPLUNK_USE_CASES);
  const [alerts, setAlerts] = useState<SplunkAlert[]>([
    {
      id: 'ALT-DEV-01',
      instance: 'dev',
      title: 'Dev Staging Mimikatz LSASS Detector',
      severity: 'HIGH',
      triggerSchedule: 'Every 5 Minutes',
      splQuery: 'index=dev-winlogs sourcetype="sysmon" EventCode=10 GrantedAccess="0x1010" | stats count',
      action: 'Trigger Webhook & Log to Staging Dashboard',
      status: 'ENABLED'
    },
    {
      id: 'ALT-PROD-01',
      instance: 'prod',
      title: 'Prod Volume Shadow Copy Erasure Alert',
      severity: 'CRITICAL',
      triggerSchedule: 'Real-Time (Continuous Cron)',
      splQuery: 'index=winlogs sourcetype="WinEventLog:Security" EventCode=4688 CommandLine="*vssadmin*delete*" | stats count',
      action: 'Execute EDR Host Isolation & Notify On-Call SOC',
      status: 'ENABLED'
    },
    {
      id: 'ALT-PROD-02',
      instance: 'prod',
      title: 'Prod Kerberoasting TGS Ticket Spike',
      severity: 'HIGH',
      triggerSchedule: 'Hourly Schedule',
      splQuery: 'index=winlogs sourcetype="WinEventLog:Security" EventCode=4769 TicketEncryptionType="0x17" | stats count',
      action: 'Enforce Automated Password Reset on SPN Account',
      status: 'ENABLED'
    }
  ]);

  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [createType, setCreateType] = useState<'use-case' | 'alert'>('use-case');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Rule Validation');
  const [newSeverity, setNewSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetIndex, setNewTargetIndex] = useState('winlogs');
  const [newSplQuery, setNewSplQuery] = useState(query);
  const [newAction, setNewAction] = useState('Trigger SOAR Playbook & Notify SOC');
  const [newSchedule, setNewSchedule] = useState('Every 15 Minutes');

  // Filter Use Cases and Alerts for current Splunk Instance
  const instanceUseCases = useCases.filter((uc) => uc.instance === activeInstance);
  const instanceAlerts = alerts.filter((alt) => alt.instance === activeInstance);

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (createType === 'use-case') {
      const uc: SplunkUseCase = {
        id: `UC-${activeInstance.toUpperCase()}-${Date.now().toString().slice(-4)}`,
        instance: activeInstance,
        title: newTitle,
        category: newCategory as any,
        severity: newSeverity,
        description: newDescription || 'Custom use case created in Splunk SIEM console.',
        targetIndex: newTargetIndex,
        splQuery: newSplQuery || query,
        expectedAlertCount: Math.floor(Math.random() * 10) + 1,
        mitreTechnique: 'T1003 - Credential Access',
        automatedAction: newAction
      };
      setUseCases([uc, ...useCases]);
      setExecutedNotice(`Successfully created new Use Case "${uc.title}" in Splunk ${activeInstance.toUpperCase()}!`);
    } else {
      const alt: SplunkAlert = {
        id: `ALT-${activeInstance.toUpperCase()}-${Date.now().toString().slice(-4)}`,
        instance: activeInstance,
        title: newTitle,
        severity: newSeverity,
        triggerSchedule: newSchedule,
        splQuery: newSplQuery || query,
        action: newAction,
        status: 'ENABLED'
      };
      setAlerts([alt, ...alerts]);
      setExecutedNotice(`Successfully created new Alert Rule "${alt.title}" in Splunk ${activeInstance.toUpperCase()}!`);
    }

    setCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setTimeout(() => setExecutedNotice(null), 4000);
  };

  // Handle Instance Switch between DEV and PROD
  const handleSwitchInstance = (newInstance: SplunkInstance) => {
    setActiveInstance(newInstance);
    const cfg = SPLUNK_INSTANCES[newInstance];
    if (newInstance === 'dev') {
      setQuery('index=dev-winlogs sourcetype="sysmon" OR sourcetype="WinEventLog:Security" | stats count by host, sourcetype, user, status');
    } else {
      setQuery('index=winlogs sourcetype="sysmon" OR sourcetype="WinEventLog:Security" | stats count by host, sourcetype, user, status');
    }
    setExecutedNotice(`Switched active Splunk environment to ${cfg.name}! Connected to ${cfg.clusterUrl}`);
    setTimeout(() => setExecutedNotice(null), 4500);
  };

  // Pre-Defined Threat Hunting Playbooks
  const playbooks: ThreatPlaybook[] = [
    {
      id: 'PB-01',
      title: 'APT28 LSASS Credential Theft & Memory Handle Injection',
      category: 'APT & Credential Theft',
      severity: 'CRITICAL',
      mitreTtps: ['T1003.001 - OS Credential Dumping', 'T1055 - Process Injection'],
      objective:
        'Hunt for processes requesting elevated memory access masks (0x1010 / 0x1F0FFF) to lsass.exe combined with Kerberos ticket dumping anomalies.',
      multiStageSPL: `index=winlogs (sourcetype="sysmon" EventCode=10 TargetImage="*\\\\lsass.exe" GrantedAccess="0x1010") OR (sourcetype="WinEventLog:Security" EventCode=4624) | stats count by host, SourceImage, GrantedAccess, user, status`,
      expectedFindings:
        'Identifies unquoted binaries (mimikatz.exe, sekurlsa) attempting handle duplication against LSASS process space.'
    },
    {
      id: 'PB-02',
      title: 'LockBit 3.0 Ransomware Volume Shadow Purge & VSS Erasure',
      category: 'Ransomware',
      severity: 'CRITICAL',
      mitreTtps: ['T1490 - Inhibit System Recovery', 'T1486 - Data Encrypted'],
      objective:
        'Multi-stage hunt for process creation commands attempting shadow copy deletion via vssadmin, wmic, or wbadmin prior to ransomware encryption.',
      multiStageSPL: `index=winlogs sourcetype="WinEventLog:Security" EventCode=4688 (CommandLine="*vssadmin*delete*shadows*" OR CommandLine="*wmic*shadowcopy*delete*" OR CommandLine="*wbadmin*delete*") | table _time, host, user, process_name, CommandLine`,
      expectedFindings:
        'Pinpoints host instances where volume shadow copies were deleted in quiet mode by compromised administrator credentials.'
    },
    {
      id: 'PB-03',
      title: 'Scattered Spider OAuth Consent Hijack & MFA Token Fatigue',
      category: 'Cloud & Identity',
      severity: 'HIGH',
      mitreTtps: ['T1528 - Applications Access Token', 'T1078.004 - Cloud Accounts'],
      objective:
        'Correlate Okta/Entra ID authentication MFA failures with subsequent high-privilege multitenant OAuth application consent grants.',
      multiStageSPL: `index=cloudlogs sourcetype="okta:system" (legacy_event_type="app.oauth2.as.grant_consent" OR status="FAILURE") | stats count by user, src_ip, status | where count > 0`,
      expectedFindings:
        'Flags unverified third-party OAuth apps granted Mail.ReadWrite or Directory.ReadWrite.All access scopes.'
    },
    {
      id: 'PB-04',
      title: 'Cobalt Strike DNS Tunneling & Random Subdomain Beacons',
      category: 'C2 & Lateral Movement',
      severity: 'HIGH',
      mitreTtps: ['T1071.004 - DNS C2 Protocol', 'T1570 - Lateral Tool Transfer'],
      objective:
        'Hunt for Sysmon EventCode 22 DNS queries requesting high-entropy random subdomains pointing to known C2 darknet infrastructure.',
      multiStageSPL: `index=winlogs sourcetype="sysmon" EventCode=22 QueryName="*.darknet-nexus.ru*" | stats count by host, process_name, QueryName | sort - count`,
      expectedFindings:
        'Reveals infected internal endpoint hosts issuing high-frequency beacon requests to C2 DNS resolvers.'
    },
    {
      id: 'PB-05',
      title: 'Volt Typhoon Living-off-the-Land (LotL) Cisco ASA OT Tunneling',
      category: 'OT Infrastructure',
      severity: 'CRITICAL',
      mitreTtps: ['T1572 - Protocol Tunneling', 'T1021.004 - SSH Remote Services'],
      objective:
        'Filter firewall VPN connection logs for established SSL sessions creating persistent outbound SSH tunnels into OT/SCADA network subnets.',
      multiStageSPL: `index=netlogs sourcetype="cisco:asa" action="built" dest_port=22 | stats count by src_ip, dest_ip, action | where count > 0`,
      expectedFindings:
        'Detects unauthorized SSH port 22 connections bypassing IT/OT air gap boundaries from remote VPN clients.'
    }
  ];

  const handleRunSearch = (overrideQuery?: string) => {
    setIsSearching(true);
    const targetQuery = overrideQuery || query;
    setTimeout(() => {
      const res = executeSPLQuery(targetQuery, activeLogDataset, timeRangeHours);
      setQueryResult(res);
      setIsSearching(false);
    }, 150);
  };

  useEffect(() => {
    handleRunSearch();
  }, [timeRangeHours, activeInstance]);

  // Execute Playbook SPL
  const handleExecutePlaybook = (pb: ThreatPlaybook) => {
    setQuery(pb.multiStageSPL);
    setActiveTab('console');
    handleRunSearch(pb.multiStageSPL);
    setExecutedNotice(`Loaded & Executed Playbook "${pb.title}" on ${currentInstanceConfig.name}!`);
    setTimeout(() => setExecutedNotice(null), 4000);
  };

  // Execute Use Case SPL
  const handleExecuteUseCase = (uc: SplunkUseCase) => {
    setQuery(uc.splQuery);
    setActiveTab('console');
    handleRunSearch(uc.splQuery);
    setExecutedNotice(`Loaded Use Case "${uc.title}" on Splunk ${uc.instance.toUpperCase()} Instance!`);
    setTimeout(() => setExecutedNotice(null), 4000);
  };

  const handleInsertSnippet = (snippet: string) => {
    setQuery((prev) => `${prev.trim()} | ${snippet}`);
  };

  const handleExportCSV = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const headers = queryResult.columns.join(',');
    const csvRows = queryResult.rows.map((row) =>
      queryResult.columns.map((col) => `"${String(row[col] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const blob = new Blob([[headers, ...csvRows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `splunk_${activeInstance}_spl_results_${Date.now()}.csv`;
    a.click();
  };

  const handleBookmarkQuery = () => {
    if (!savedQueries.includes(query)) {
      setSavedQueries([query, ...savedQueries]);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Search Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Splunk Enterprise SIEM Console</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                SPL Engine v9.2
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Query indexed logs using Splunk Search Processing Language (SPL) across DEV & PROD Splunk clusters.
            </p>
          </div>
        </div>

        {/* Controls: DEV / PROD Switcher & View Tabs */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Splunk Instance Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => handleSwitchInstance('dev')}
              className={`px-3 py-1.5 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeInstance === 'dev'
                  ? 'bg-amber-500 text-slate-950 shadow shadow-amber-500/20 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Splunk DEV</span>
              <span className="px-1 py-0.2 rounded text-[9px] bg-slate-900 text-amber-300 font-sans">120 eps</span>
            </button>

            <button
              onClick={() => handleSwitchInstance('prod')}
              className={`px-3 py-1.5 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeInstance === 'prod'
                  ? 'bg-cyan-400 text-slate-950 shadow shadow-cyan-500/20 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Splunk PROD</span>
              <span className="px-1 py-0.2 rounded text-[9px] bg-slate-950 text-cyan-900 font-sans">1.2k eps</span>
            </button>
          </div>

          <button
            onClick={() => setClusterModalOpen(true)}
            className="p-1.5 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-mono flex items-center gap-1 transition-all"
            title="Inspect Splunk Cluster Topology"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline text-[11px]">Cluster Config</span>
          </button>

          {/* View Switcher: Console vs Playbooks vs Use Cases */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                activeTab === 'console'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Console Search
            </button>

            <button
              onClick={() => setActiveTab('use-cases')}
              className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'use-cases'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Workflow className="w-3.5 h-3.5 text-cyan-400" />
              <span>Use Cases ({instanceUseCases.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'alerts'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Alerts ({instanceAlerts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('playbooks')}
              className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'playbooks'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Playbooks ({playbooks.length})</span>
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="hidden lg:flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <select
              value={timeRangeHours}
              onChange={(e) => setTimeRangeHours(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value={0.25}>Last 15 Min</option>
              <option value={1}>Last 1 Hour</option>
              <option value={24}>Last 24 Hours</option>
              <option value={168}>Last 7 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Instance Connection Indicator Bar */}
      <div
        className={`px-4 py-2 rounded-xl border flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2 transition-all ${
          activeInstance === 'dev'
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full animate-ping ${
              activeInstance === 'dev' ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
          ></span>
          <span className="font-bold uppercase tracking-wider">
            Connected Splunk Cluster: {currentInstanceConfig.name}
          </span>
          <span className="text-slate-400 font-normal">({currentInstanceConfig.clusterUrl})</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span>Log Dataset: <strong className="text-white">{activeLogDataset.length} Events Ingested</strong></span>
          <span>•</span>
          <span>HEC Token: <strong className="text-white">{currentInstanceConfig.hecToken}</strong></span>
          <span>•</span>
          <span>Indexers: <strong className="text-white">{currentInstanceConfig.indexers.length} Nodes</strong></span>
        </div>
      </div>

      {executedNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-xs flex items-center gap-2 shadow-xl animate-fadeIn font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{executedNotice}</span>
        </div>
      )}

      {/* VIEW 1: SPL CONSOLE SEARCH */}
      {activeTab === 'console' && (
        <div className="space-y-6">
          {/* Quick Use Case Selector Dropdown Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">
                Execute {activeInstance.toUpperCase()} Use Case Query:
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                onChange={(e) => {
                  const uc = instanceUseCases.find((u) => u.id === e.target.value);
                  if (uc) handleExecuteUseCase(uc);
                }}
                defaultValue=""
                className="w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono font-medium focus:outline-none focus:border-cyan-500"
              >
                <option value="" disabled>
                  Select a Splunk {activeInstance.toUpperCase()} Use Case Scenario...
                </option>
                {instanceUseCases.map((uc) => (
                  <option key={uc.id} value={uc.id}>
                    [{uc.id}] {uc.title} ({uc.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Search Input & Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
            <div className="relative flex items-center">
              <div className="absolute left-3 text-cyan-400 font-mono font-bold text-sm">SPL &gt;</div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
                placeholder="search index=winlogs sourcetype=sysmon | stats count by host, user"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-14 pr-32 py-3 text-cyan-200 font-mono text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 shadow-inner"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  onClick={handleBookmarkQuery}
                  title="Bookmark Search"
                  className="p-2 rounded-md bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-700 transition-all"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRunSearch()}
                  disabled={isSearching}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{isSearching ? 'Executing...' : 'Search'}</span>
                </button>
              </div>
            </div>

            {/* SPL Helper Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] text-slate-400 shrink-0 font-medium flex items-center gap-1">
                <Filter className="w-3 h-3 text-cyan-400" />
                Quick Commands:
              </span>
              {[
                { label: 'stats count by host', cmd: 'stats count by host' },
                { label: 'where risk_score > 80', cmd: 'where risk_score > 80' },
                { label: 'table _time, host, user, status', cmd: 'table _time, host, user, status' },
                { label: 'dedup host', cmd: 'dedup host' },
                { label: 'top 5 user', cmd: 'top 5 user' },
                { label: 'sort - count', cmd: 'sort - count' },
                { label: 'rare status', cmd: 'rare status' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInsertSnippet(item.cmd)}
                  className="px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono text-[11px] shrink-0 transition-all"
                >
                  + {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bookmarked Queries */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1 text-[11px]">
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              Bookmarked SPLs:
            </span>
            {savedQueries.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(sq);
                  handleRunSearch(sq);
                }}
                className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 font-mono text-[11px] truncate max-w-[280px] shrink-0 transition-all text-left"
                title={sq}
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Query Results Display */}
          {queryResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-cyan-400" />
                    <span>
                      Matches: <strong>{queryResult.totalMatches} events</strong>
                    </span>
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Execution Time: {queryResult.executionTimeMs} ms ({activeInstance.toUpperCase()} Cluster)
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                        viewMode === 'table' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Table View
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                        viewMode === 'raw' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Raw Logs
                    </button>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {queryResult.histogram && queryResult.histogram.length > 0 && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-mono font-semibold uppercase tracking-wider block">
                    Event Timeline Distribution (Bucketed - {activeInstance.toUpperCase()})
                  </span>
                  <div className="grid grid-cols-6 gap-2 items-end h-16 pt-2">
                    {queryResult.histogram.map((bucket, idx) => {
                      const maxCount = Math.max(...queryResult.histogram!.map((h) => h.count), 1);
                      const heightPercent = Math.max((bucket.count / maxCount) * 100, 8);
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[10px] font-mono text-cyan-400">{bucket.count}</span>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-cyan-500/30 border-t-2 border-cyan-400 rounded-t transition-all hover:bg-cyan-500/50"
                          ></div>
                          <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                            {bucket.timeBucket}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewMode === 'table' ? (
                <div className="overflow-x-auto border border-slate-800 rounded-lg max-h-[480px]">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                        <th className="py-2.5 px-3 font-bold text-slate-300">#</th>
                        {queryResult.columns.map((col, idx) => (
                          <th key={idx} className="py-2.5 px-3 font-bold text-slate-300 truncate">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {queryResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-2 px-3 text-slate-500 font-bold">{rIdx + 1}</td>
                          {queryResult.columns.map((col, cIdx) => {
                            const val = row[col];
                            const isStatus = col === 'status';
                            const isSuspicious =
                              String(val).toUpperCase() === 'SUSPICIOUS' || String(val).toUpperCase() === 'CRITICAL';
                            return (
                              <td key={cIdx} className="py-2 px-3 text-slate-200 max-w-[280px] truncate">
                                {isStatus ? (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      isSuspicious
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    }`}
                                  >
                                    {String(val)}
                                  </span>
                                ) : (
                                  String(val !== undefined ? val : '')
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      {queryResult.rows.length === 0 && (
                        <tr>
                          <td colSpan={queryResult.columns.length + 1} className="py-8 text-center text-slate-500">
                            No matching log records found for this SPL search criteria in {activeInstance.toUpperCase()}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 max-h-[480px] overflow-y-auto font-mono text-xs">
                  {activeLogDataset.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-slate-900 border border-slate-800/80 text-cyan-200 leading-relaxed hover:border-slate-700"
                    >
                      <span className="text-slate-500 mr-2">[{log._time}]</span>
                      <span>{log._raw}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SPLUNK USE CASES & SCENARIOS */}
      {activeTab === 'use-cases' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" />
                <span>Splunk {activeInstance.toUpperCase()} Use Cases & Security Scenarios ({instanceUseCases.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted detection & response scenarios built specifically for Splunk {activeInstance.toUpperCase()} ({currentInstanceConfig.name}).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded text-xs font-mono bg-slate-900 text-slate-300 border border-slate-800">
                Target Index: <strong className="text-cyan-400">{currentInstanceConfig.defaultIndex}</strong>
              </span>
              <button
                onClick={() => {
                  setCreateType('use-case');
                  setCreateModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <span>+ Create Use Case</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {instanceUseCases.map((uc) => (
              <div
                key={uc.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {uc.id} • {uc.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        uc.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {uc.severity}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{uc.title}</h4>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    {uc.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 font-bold">
                      Index: {uc.targetIndex}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      MITRE: {uc.mitreTechnique}
                    </span>
                  </div>

                  {/* Target SPL Code Box */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Target SPL Search Query:
                    </span>
                    <pre className="p-3 rounded-lg bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800/80 leading-relaxed">
                      {uc.splQuery}
                    </pre>
                  </div>

                  <div className="text-[11px] text-slate-300 bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Automated Action:</strong> {uc.automatedAction}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleExecuteUseCase(uc)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Execute Use Case SPL on {activeInstance.toUpperCase()}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: SPLUNK ALERTS CONFIGURATION & TRIGGER RULES */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Splunk {activeInstance.toUpperCase()} Configured Alert Rules ({instanceAlerts.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Active scheduled and real-time alert rules monitoring Splunk {activeInstance.toUpperCase()} ({currentInstanceConfig.clusterUrl}).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded text-xs font-mono bg-slate-900 text-slate-300 border border-slate-800">
                Environment: <strong className="text-amber-400">{activeInstance.toUpperCase()}</strong>
              </span>
              <button
                onClick={() => {
                  setCreateType('alert');
                  setCreateModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <span>+ Create Alert Rule</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {instanceAlerts.map((alt) => (
              <div
                key={alt.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      {alt.id} • {alt.triggerSchedule}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {alt.severity}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{alt.title}</h4>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Trigger SPL Query:
                    </span>
                    <pre className="p-3 rounded-lg bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800/80 leading-relaxed">
                      {alt.splQuery}
                    </pre>
                  </div>

                  <div className="text-[11px] text-slate-300 bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-lg flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span><strong>Alert Action:</strong> {alt.action}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Status: {alt.status}
                  </span>
                  <button
                    onClick={() => {
                      setQuery(alt.splQuery);
                      setActiveTab('console');
                      handleRunSearch(alt.splQuery);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                  >
                    Test Alert SPL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: THREAT HUNTING PLAYBOOKS LIBRARY */}
      {activeTab === 'playbooks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Pre-Defined Multi-Stage Threat Hunting Playbooks ({playbooks.length})</span>
            </span>
            <span>Click 'Run Playbook SPL' to execute multi-stage search queries directly in the console.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {playbooks.map((pb) => (
              <div
                key={pb.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {pb.id} • {pb.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        pb.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {pb.severity}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{pb.title}</h3>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <strong>Hunting Objective:</strong> {pb.objective}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {pb.mitreTtps.map((ttp, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                        {ttp}
                      </span>
                    ))}
                  </div>

                  {/* Multi-Stage SPL Code Box */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Multi-Stage SPL Search Query:
                    </span>
                    <pre className="p-3 rounded-lg bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800/80 leading-relaxed">
                      {pb.multiStageSPL}
                    </pre>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
                    <strong className="text-slate-300 block mb-0.5">Expected Forensic Output:</strong>
                    <span>{pb.expectedFindings}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleExecutePlaybook(pb)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Run Playbook SPL on {activeInstance.toUpperCase()}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: SPLUNK CLUSTER TOPOLOGY & INSTANCE CONFIG */}
      {clusterModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Splunk Cluster Topology & Instance Configurations
                </h3>
              </div>
              <button
                onClick={() => setClusterModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(SPLUNK_INSTANCES).map((inst) => {
                const isCurrent = inst.id === activeInstance;

                return (
                  <div
                    key={inst.id}
                    className={`p-4 rounded-xl border space-y-3 font-mono text-xs transition-all ${
                      isCurrent
                        ? inst.id === 'dev'
                          ? 'bg-amber-950/20 border-amber-500/50 shadow-lg'
                          : 'bg-cyan-950/20 border-cyan-500/50 shadow-lg'
                        : 'bg-slate-950 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        <Server className="w-4 h-4 text-cyan-400" />
                        <span>{inst.id.toUpperCase()} INSTANCE</span>
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCurrent
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCurrent ? 'ACTIVE CONNECTED' : 'STANDBY'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-300">
                      <div>
                        <span className="text-slate-500">Name: </span>
                        <span>{inst.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Cluster REST API: </span>
                        <span className="text-cyan-300 font-mono">{inst.clusterUrl}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">HEC Endpoint: </span>
                        <span className="text-cyan-300 font-mono truncate block">{inst.hecEndpoint}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">HEC Token: </span>
                        <span className="text-amber-300 font-mono">{inst.hecToken}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Ingestion Rate: </span>
                        <span className="text-emerald-400 font-bold">{inst.ingestionRateEps} events / sec</span>
                      </div>
                      <div>
                        <span className="text-slate-500">License Quota: </span>
                        <span>{inst.licenseQuota}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Retention Policy: </span>
                        <span>{inst.retentionPolicy}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block mb-1">
                        Indexer Peer Nodes ({inst.indexers.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {inst.indexers.map((idx, iIdx) => (
                          <span key={iIdx} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-slate-300 border border-slate-800">
                            {idx}
                          </span>
                        ))}
                      </div>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => {
                          handleSwitchInstance(inst.id);
                          setClusterModalOpen(false);
                        }}
                        className="w-full py-1.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold transition-all text-center mt-2"
                      >
                        Switch to {inst.id.toUpperCase()} Environment
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
              <span>Both Splunk instances support native REST API authentication & HEC streaming.</span>
              <button
                onClick={() => setClusterModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USE CASE / ALERT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" />
                <span>Create New {createType === 'use-case' ? 'Use Case' : 'Alert Rule'} in Splunk {activeInstance.toUpperCase()}</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Rule / Scenario Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Suspicious PowerShell Download Cradle Execution"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Severity:</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>

                {createType === 'alert' ? (
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold">Trigger Schedule:</label>
                    <select
                      value={newSchedule}
                      onChange={(e) => setNewSchedule(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                    >
                      <option value="Real-Time (Continuous Cron)">Real-Time (Continuous Cron)</option>
                      <option value="Every 5 Minutes">Every 5 Minutes</option>
                      <option value="Every 15 Minutes">Every 15 Minutes</option>
                      <option value="Hourly Schedule">Hourly Schedule</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-slate-400 block font-bold">Category:</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                    >
                      <option value="Rule Validation">Rule Validation</option>
                      <option value="Ransomware Response">Ransomware Response</option>
                      <option value="OT Infrastructure">OT Infrastructure</option>
                      <option value="Cloud & Identity">Cloud & Identity</option>
                      <option value="Credential Protection">Credential Protection</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">SPL Search Query:</label>
                <textarea
                  rows={3}
                  value={newSplQuery}
                  onChange={(e) => setNewSplQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Automated Response Action:</label>
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Create in Splunk {activeInstance.toUpperCase()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
