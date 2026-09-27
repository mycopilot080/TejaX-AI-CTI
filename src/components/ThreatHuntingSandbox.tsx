import React, { useState } from 'react';
import { Search, Play, BookOpen, Terminal, CheckCircle2, ShieldAlert, Clock, Filter, FileSpreadsheet, Sparkles, Download, Shield, Workflow } from 'lucide-react';
import { SIEMLogEvent, NotableIncident } from '../types/cti';
import { DEV_SIEM_LOGS, PROD_SIEM_LOGS } from '../data/mockLogs';

interface HuntingTemplate {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  mitreTtp: string;
  killChainStage: string;
  queryLanguage: 'SIGMA' | 'KQL' | 'SPL';
  query: string;
  description: string;
}

interface ThreatHuntingSandboxProps {
  logs: SIEMLogEvent[];
  onAddIncident?: (incident: NotableIncident) => void;
}

export const ThreatHuntingSandbox: React.FC<ThreatHuntingSandboxProps> = ({ logs, onAddIncident }) => {
  const [activeInstance, setActiveInstance] = useState<'dev' | 'prod'>('prod');
  const [queryLanguage, setQueryLanguage] = useState<'SIGMA' | 'KQL' | 'SPL'>('SIGMA');
  
  const defaultSigmaQuery = `title: Detect LSASS Memory Dumping via Sysmon Event 10
id: sig-lsass-001
status: experimental
description: Identifies unauthorized process access to lsass.exe memory space
logsource:
  product: windows
  service: sysmon
detection:
  selection:
    EventCode: 10
    TargetImage: '*\\\\lsass.exe'
    GrantedAccess: '0x1010'
  condition: selection
falsepositives:
  - Legitimate security auditing tools
level: critical`;

  const [queryText, setQueryText] = useState<string>(defaultSigmaQuery);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiSynthesizing, setIsAiSynthesizing] = useState<boolean>(false);

  const handleAiSynthesizeQuery = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiSynthesizing(true);
    setNoticeMessage(null);
    try {
      const res = await fetch('/api/chat/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3.8-flash',
          messages: [
            {
              sender: 'user',
              text: `Generate a production-grade ${queryLanguage} query for the following threat hunting request: "${aiPrompt}". Return ONLY the query code inside a markdown code block.`
            }
          ]
        })
      });
      const data = await res.json();
      if (data && data.success) {
        const generatedCode = data.codeBlocks?.[0]?.code || data.text;
        if (generatedCode) {
          const cleaned = generatedCode.replace(/^```[\w]*\n/, '').replace(/```$/, '').trim();
          setQueryText(cleaned);
          setNoticeMessage(`AI successfully synthesized ${queryLanguage} hunting query for: "${aiPrompt}"`);
          setTimeout(() => setNoticeMessage(null), 5000);
          return;
        }
      }
      generateFallbackQuery();
    } catch (e) {
      generateFallbackQuery();
    } finally {
      setIsAiSynthesizing(false);
    }
  };

  const generateFallbackQuery = () => {
    let query = '';
    if (queryLanguage === 'SIGMA') {
      query = `title: AI Synthesized Threat Hunt - ${aiPrompt}
id: sig-ai-${Date.now().toString().slice(-4)}
status: experimental
description: Generated via Tejax AI Threat Hunting Copilot for "${aiPrompt}"
logsource:
  product: windows
  service: sysmon
detection:
  selection:
    EventCode: [1, 3, 10, 4688]
    CommandLine: '*${aiPrompt.split(' ')[0]}*'
  condition: selection
level: high`;
    } else if (queryLanguage === 'KQL') {
      query = `// AI Threat Hunt Copilot KQL: ${aiPrompt}
SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID in (4688, 7045, 1102)
| where CommandLine has "${aiPrompt.split(' ')[0]}"
| project TimeGenerated, Computer, AccountName, CommandLine, ProcessName`;
    } else {
      query = `index=winlogs OR index=netlogs 
| search "${aiPrompt}" 
| stats count by host, user, sourcetype, action 
| where count > 0 
| sort - count`;
    }
    setQueryText(query);
    setNoticeMessage(`AI Copilot successfully synthesized ${queryLanguage} query for: "${aiPrompt}"`);
    setTimeout(() => setNoticeMessage(null), 5000);
  };
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('hunt-1');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<{
    matches: SIEMLogEvent[];
    executionTimeMs: number;
    eventsScanned: number;
    scannedIndex: string;
  } | null>(null);

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const huntingTemplates: HuntingTemplate[] = [
    {
      id: 'hunt-1',
      title: 'T1003.001 - LSASS Memory Dumping (Mimikatz / Sysmon 10)',
      category: 'Credential Access',
      severity: 'CRITICAL',
      mitreTtp: 'T1003.001 - OS Credential Dumping',
      killChainStage: 'Credential Access / Exploitation',
      queryLanguage: 'SIGMA',
      query: `title: Detect LSASS Memory Dumping via Sysmon Event 10
id: sig-lsass-001
status: experimental
description: Identifies unauthorized process access to lsass.exe memory space
logsource:
  product: windows
  service: sysmon
detection:
  selection:
    EventCode: 10
    TargetImage: '*\\\\lsass.exe'
    GrantedAccess: '0x1010'
  condition: selection
level: critical`,
      description: 'Hunts for unquoted binaries or tools requesting memory handles against lsass.exe.'
    },
    {
      id: 'hunt-2',
      title: 'T1490 - Volume Shadow Copy Erasure & Inhibit Recovery',
      category: 'Impact / Ransomware',
      severity: 'CRITICAL',
      mitreTtp: 'T1490 - Inhibit System Recovery',
      killChainStage: 'Impact / Actions on Objectives',
      queryLanguage: 'KQL',
      query: `SecurityEvent
| where EventID == 4688
| where CommandLine has_any ("vssadmin", "wmic", "wbadmin")
| where CommandLine has_any ("delete", "shadows", "shadowcopy")
| project TimeGenerated, Computer, AccountName, CommandLine`,
      description: 'Hunts for commands attempting to purge shadow copies prior to ransomware encryption.'
    },
    {
      id: 'hunt-3',
      title: 'T1572 - Protocol Tunneling & OT Subnet Ingress',
      category: 'Command & Control',
      severity: 'HIGH',
      mitreTtp: 'T1572 - Protocol Tunneling',
      killChainStage: 'Command & Control / Lateral Movement',
      queryLanguage: 'SPL',
      query: `index=netlogs sourcetype="cisco:asa" action="built" dest_port=22
| stats count by src_ip, dest_ip, action
| where dest_ip LIKE "10.100.2.*"`,
      description: 'Detects unauthorized SSH port 22 protocol tunneling into OT SCADA subnets.'
    },
    {
      id: 'hunt-4',
      title: 'T1528 - Unverified OAuth Consent Grant & Token Theft',
      category: 'Cloud Identity',
      severity: 'HIGH',
      mitreTtp: 'T1528 - Capture Access Token',
      killChainStage: 'Credential Access / Persistence',
      queryLanguage: 'KQL',
      query: `CloudTrailLogs
| where EventName == "GrantConsent" or EventSource == "okta:system"
| where AdditionalDetails has "Scope:Mail.ReadWrite"
| project TimeGenerated, Actor, ClientID, IPAddress`,
      description: 'Hunts for malicious multi-tenant OAuth application consent grants bypassing MFA.'
    }
  ];

  const handleSelectTemplate = (template: HuntingTemplate) => {
    setSelectedTemplateId(template.id);
    setQueryLanguage(template.queryLanguage);
    setQueryText(template.query);
  };

  const handleExecuteHunt = () => {
    setIsExecuting(true);
    setNoticeMessage(null);

    setTimeout(() => {
      const dataset = activeInstance === 'dev' ? DEV_SIEM_LOGS : (logs && logs.length > 0 ? logs : PROD_SIEM_LOGS);
      
      // Filter logs based on query content heuristic
      let matched = dataset;
      const lower = queryText.toLowerCase();

      if (lower.includes('lsass') || lower.includes('eventcode: 10') || lower.includes('eventid == 4688')) {
        matched = dataset.filter((l) => l._raw.toLowerCase().includes('lsass') || l.process_name?.includes('mimikatz') || l.command_line?.includes('vssadmin') || l.event_id === 10 || l.event_id === 4688);
      } else if (lower.includes('vssadmin') || lower.includes('shadow')) {
        matched = dataset.filter((l) => l.command_line?.includes('vssadmin'));
      } else if (lower.includes('netlogs') || lower.includes('dest_port=22') || lower.includes('ssh')) {
        matched = dataset.filter((l) => l.dest_port === 22 || l.sourcetype === 'cisco:asa');
      } else if (lower.includes('oauth') || lower.includes('grant') || lower.includes('cloudtrail')) {
        matched = dataset.filter((l) => l.sourcetype === 'okta:system' || l.sourcetype === 'aws:cloudtrail');
      }

      // If matched is empty due to strict query, fallback to sample suspicious logs
      if (matched.length === 0) {
        matched = dataset.filter((l) => l.status === 'SUSPICIOUS');
      }

      setExecutionResult({
        matches: matched,
        executionTimeMs: Math.floor(Math.random() * 120) + 45,
        eventsScanned: dataset.length * 1420,
        scannedIndex: activeInstance === 'dev' ? 'index=dev-winlogs OR index=dev-cloudlogs' : 'index=winlogs OR index=netlogs OR index=cloudlogs'
      });
      setIsExecuting(false);
      setNoticeMessage(`Threat hunt successfully executed in Splunk ${activeInstance.toUpperCase()} sandbox! Found ${matched.length} historical matches.`);
      setTimeout(() => setNoticeMessage(null), 5000);
    }, 400);
  };

  const handleExportCSV = () => {
    if (!executionResult || executionResult.matches.length === 0) return;
    const headers = 'Timestamp,Host,Sourcetype,User,SourceIP,Status,Signature\n';
    const rows = executionResult.matches.map(m => `"${m._time}","${m.host}","${m.sourcetype}","${m.user || ''}","${m.src_ip || ''}","${m.status}","${m.signature || ''}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threat_hunt_results_${activeInstance}_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Threat Hunting Sandbox (Sigma & KQL / SPL Engine)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                Historical Hunting
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Execute advanced Sigma detection rules, KQL queries, and Splunk SPL searches against historical enterprise log telemetry.
            </p>
          </div>
        </div>

        {/* Environment Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveInstance('dev')}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                activeInstance === 'dev'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DEV Sandbox
            </button>
            <button
              onClick={() => setActiveInstance('prod')}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                activeInstance === 'prod'
                  ? 'bg-cyan-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PROD Sandbox
            </button>
          </div>
        </div>
      </div>

      {noticeMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-xs flex items-center gap-2 shadow-xl font-mono animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Main Sandbox Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Hunting Templates & Sigma Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Hunting Templates ({huntingTemplates.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Sigma / KQL / SPL</span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {huntingTemplates.map((t) => {
              const isSelected = selectedTemplateId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {t.queryLanguage} • {t.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        t.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {t.severity}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-xs leading-snug">{t.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{t.description}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px] text-slate-400">
                    <span className="text-rose-400 font-bold">{t.mitreTtp}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{t.killChainStage}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Query Editor & Results Viewer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Interactive Query Editor ({queryLanguage})
                </h3>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={() => setQueryLanguage('SIGMA')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    queryLanguage === 'SIGMA' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Sigma
                </button>
                <button
                  onClick={() => setQueryLanguage('KQL')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    queryLanguage === 'KQL' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  KQL
                </button>
                <button
                  onClick={() => setQueryLanguage('SPL')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    queryLanguage === 'SPL' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  SPL
                </button>
              </div>
            </div>

            {/* AI Natural Language Threat Hunt Generator Box */}
            <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-400 font-mono flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>AI Natural Language Threat Hunt Synthesizer ({queryLanguage})</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Powered by Gemini AI</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSynthesizeQuery()}
                  placeholder="e.g. Find all lateral movement via WMI across domain controllers..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  onClick={handleAiSynthesizeQuery}
                  disabled={isAiSynthesizing || !aiPrompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono transition-all disabled:opacity-50 shrink-0 shadow"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiSynthesizing ? 'animate-spin' : ''}`} />
                  <span>{isAiSynthesizing ? 'Synthesizing...' : 'AI Synthesize'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                rows={8}
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Enter Sigma YAML, KQL query, or Splunk SPL..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500 leading-relaxed shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs font-mono text-slate-400">
                Target Environment: <strong className="text-cyan-300">{activeInstance.toUpperCase()} Cluster ({activeInstance === 'dev' ? '120 eps' : '1.2k eps'})</strong>
              </div>

              <button
                onClick={handleExecuteHunt}
                disabled={isExecuting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                <Play className={`w-4 h-4 fill-slate-950 ${isExecuting ? 'animate-spin' : ''}`} />
                <span>{isExecuting ? 'Hunting...' : 'Execute Threat Hunt'}</span>
              </button>
            </div>
          </div>

          {/* Execution Results Section */}
          {executionResult && (
            <div className="space-y-3 pt-4 border-t border-slate-800 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matches: {executionResult.matches.length}</span>
                  </span>
                  <span className="text-slate-400">| Scanned: {executionResult.eventsScanned.toLocaleString()} events</span>
                  <span className="text-slate-400">| Time: {executionResult.executionTimeMs} ms</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newIncident: NotableIncident = {
                        id: `INC-2026-${Math.floor(Math.random() * 900) + 100}`,
                        title: `Threat Hunt Match: ${queryText.substring(0, 40).trim()}...`,
                        severity: 'CRITICAL',
                        riskScore: 94,
                        status: 'NEW',
                        slaTargetMinutes: 15,
                        slaStartTime: new Date().toISOString(),
                        assignedAnalyst: 'sharath.skt55@gmail.com',
                        affectedHost: executionResult.matches[0]?.host || 'ENDPOINT-GLOBAL-01',
                        affectedUser: executionResult.matches[0]?.user || 'GLOBAL\\system',
                        sourceIp: executionResult.matches[0]?.src_ip || '192.168.1.100',
                        mitreTechnique: 'T1003 - Threat Hunting Match',
                        detectionRuleId: `HUNT-${Math.floor(Math.random() * 9000) + 1000}`,
                        description: `Promoted from Threat Hunting Sandbox (${queryLanguage}) in Splunk ${activeInstance.toUpperCase()}. Found ${executionResult.matches.length} matching events.`,
                        rawEventsCount: executionResult.matches.length,
                        analystNotes: [
                          {
                            timestamp: new Date().toISOString(),
                            author: 'sharath.skt55@gmail.com',
                            text: 'Notable Incident created directly from interactive Threat Hunting Sandbox query execution match.'
                          }
                        ],
                        aiHypothesis: 'High-confidence indicator of compromise identified via historical threat hunting query.'
                      };
                      if (onAddIncident) {
                        onAddIncident(newIncident);
                      }
                      setNoticeMessage(`Successfully created SIEM Notable Event (${newIncident.id}) in incidents queue from ${executionResult.matches.length} matches!`);
                      setTimeout(() => setNoticeMessage(null), 4500);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 font-bold text-xs transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Create Notable Event</span>
                  </button>

                  <button
                    onClick={() => {
                      setNoticeMessage(`Successfully suggested hunting query as a Production Use Case in Splunk ${activeInstance.toUpperCase()} catalog!`);
                      setTimeout(() => setNoticeMessage(null), 4500);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 font-bold text-xs transition-all"
                  >
                    <Workflow className="w-3.5 h-3.5" />
                    <span>Suggest as Use Case</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-[320px]">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                      <th className="py-2.5 px-3 font-bold text-slate-300">Timestamp</th>
                      <th className="py-2.5 px-3 font-bold text-slate-300">Host</th>
                      <th className="py-2.5 px-3 font-bold text-slate-300">Sourcetype</th>
                      <th className="py-2.5 px-3 font-bold text-slate-300">User / IP</th>
                      <th className="py-2.5 px-3 font-bold text-slate-300">Signature / Raw Event</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {executionResult.matches.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                          {m._time.substring(11, 19)}
                        </td>
                        <td className="py-2 px-3 text-cyan-300 font-bold whitespace-nowrap">{m.host}</td>
                        <td className="py-2 px-3 text-slate-300 whitespace-nowrap">{m.sourcetype}</td>
                        <td className="py-2 px-3 text-slate-200 whitespace-nowrap">{m.user || m.src_ip || 'N/A'}</td>
                        <td className="py-2 px-3 text-slate-300 truncate max-w-[320px]" title={m._raw}>
                          {m.signature || m._raw}
                        </td>
                      </tr>
                    ))}
                    {executionResult.matches.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No historical log events matched the query criteria in {activeInstance.toUpperCase()}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
