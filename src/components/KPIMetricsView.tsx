import React, { useState, useMemo } from 'react';
import {
  Activity,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Target,
  BarChart3,
  Layers,
  Award,
  Lock,
  ArrowUpRight,
  RefreshCw,
  Download,
  ShieldCheck,
  AlertCircle,
  Info,
  Sliders,
  Filter,
  Sparkles,
  Cpu,
  FileSpreadsheet,
  Check,
  Flame,
  Zap,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

export type ColorCode = 'RED' | 'BLUE' | 'GREEN' | 'AMBER';

export interface KPIMetric {
  id: string;
  name: string;
  category: 'OPERATIONAL' | 'INCIDENT' | 'DETECTION' | 'VULNERABILITY';
  colorCode: ColorCode;
  colorLabel: string;
  value: string;
  target: string;
  percentage: number;
  trend: string;
  trendPositive: boolean;
  statusText: string;
  description: string;
  details: string;
  thresholdGuide: string;
}

export interface SLAMetric {
  id: string;
  title: string;
  tier: 'Tier 1 - Critical' | 'Tier 2 - High' | 'Tier 3 - Operational' | 'Tier 4 - Governance';
  colorCode: ColorCode;
  colorLabel: string;
  slaTarget: string;
  achievedValue: string;
  compliancePercent: number;
  breachesCount: number;
  nearMissCount: number;
  status: 'OPTIMAL' | 'BASELINE' | 'WARNING' | 'BREACHED';
  owner: string;
  lastUpdated: string;
  description: string;
  remediationAction: string;
}

export interface KRIMetric {
  id: string;
  title: string;
  colorCode: ColorCode;
  colorLabel: string;
  riskScore: number;
  value: string;
  target: string;
  description: string;
  mitigation: string;
}

export const KPIMetricsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [activeColorFilter, setActiveColorFilter] = useState<'ALL' | ColorCode>('ALL');
  const [activeTab, setActiveTab] = useState<'kpi' | 'sla' | 'kri' | 'simulator'>('sla');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState<'normal' | 'surge' | 'hardening'>('normal');
  const [selectedSLAModal, setSelectedSLAModal] = useState<SLAMetric | null>(null);

  // Core KPI Data with strict RED, BLUE, GREEN, AMBER classification
  const kpiData: KPIMetric[] = useMemo(() => {
    const isSurge = simulationMode === 'surge';
    const isHardened = simulationMode === 'hardening';

    return [
      {
        id: 'kpi-mtta',
        name: 'MTTA (Mean Time to Acknowledge)',
        category: 'INCIDENT',
        colorCode: isSurge ? 'AMBER' : 'GREEN',
        colorLabel: isSurge ? 'AMBER - WARNING' : 'GREEN - SLA ACHIEVED',
        value: isSurge ? '4.8 min' : isHardened ? '2.1 min' : '3.4 min',
        target: '< 5.0 min target',
        percentage: isSurge ? 96 : isHardened ? 42 : 68,
        trend: isSurge ? '+22% latency' : '-14% response time',
        trendPositive: !isSurge,
        statusText: isSurge ? 'Approaching 5m SLA threshold' : 'Optimal SOC response',
        description: 'Average time between SIEM event correlation and human analyst triage acknowledgment.',
        details: '18 detection rules correlated. 98% of P1 incidents acknowledged under 3 minutes.',
        thresholdGuide: 'Green: <4.0m | Blue: 4.0-4.5m | Amber: 4.5-5.0m | Red: >5.0m'
      },
      {
        id: 'kpi-mttr',
        name: 'MTTR (Mean Time to Resolve / Contain)',
        category: 'INCIDENT',
        colorCode: isSurge ? 'RED' : 'AMBER',
        colorLabel: isSurge ? 'RED - BREACH RISK' : 'AMBER - NEAR THRESHOLD',
        value: isSurge ? '48.2 min' : isHardened ? '26.4 min' : '41.8 min',
        target: '< 45.0 min target',
        percentage: isSurge ? 100 : isHardened ? 58 : 92.8,
        trend: isSurge ? '+15% containment time' : '+6% investigation time',
        trendPositive: false,
        statusText: isSurge ? 'Exceeding 45m SLA target' : 'Within 3.2m safety margin',
        description: 'Total elapsed duration from initial detection to full threat neutralization and endpoint isolation.',
        details: 'Investigative overhead recorded on DC-GLOBAL-01 credential forensics. Remediation playbook initiated.',
        thresholdGuide: 'Green: <35m | Blue: 35-40m | Amber: 40-45m | Red: >45m'
      },
      {
        id: 'kpi-cve-window',
        name: 'Critical CVE Exposure & Patch Window',
        category: 'VULNERABILITY',
        colorCode: isHardened ? 'BLUE' : 'RED',
        colorLabel: isHardened ? 'BLUE - STABILIZED' : 'RED - ACTION REQUIRED',
        value: isHardened ? '2.8 Days' : isSurge ? '7.9 Days' : '6.4 Days',
        target: '< 3.0 Days SLA',
        percentage: isHardened ? 93 : 100,
        trend: isHardened ? '-3.6d improvement' : '+2.4d breach gap',
        trendPositive: isHardened,
        statusText: isHardened ? 'Within patch window' : 'SLA Target Exceeded',
        description: 'Average days elapsed between CISA Known Exploited Vulnerabilities (KEV) disclosure and enterprise-wide patch deployment.',
        details: 'CVE-2026-2144 awaiting staging reboot on 2 perimeter web gateways. Maintenance window approved for tonight.',
        thresholdGuide: 'Green: <2.0d | Blue: 2.0-3.0d | Amber: 3.0-4.0d | Red: >4.0d'
      }
    ];
  }, [simulationMode]);

  // SLA Performance Governance Matrix with RED, BLUE, GREEN, AMBER coding
  const slaData: SLAMetric[] = useMemo(() => {
    const isSurge = simulationMode === 'surge';
    const isHardened = simulationMode === 'hardening';

    return [
      {
        id: 'SLA-001',
        title: 'P1 Critical Incident Triage & Containment',
        tier: 'Tier 1 - Critical',
        colorCode: isSurge ? 'AMBER' : 'GREEN',
        colorLabel: isSurge ? 'AMBER - NEAR MISS' : 'GREEN - FULLY COMPLIANT',
        slaTarget: '15 Minutes',
        achievedValue: isSurge ? '13.9 min avg' : '4.1 min avg',
        compliancePercent: isSurge ? 93.4 : 99.8,
        breachesCount: isSurge ? 1 : 0,
        nearMissCount: isSurge ? 4 : 0,
        status: isSurge ? 'WARNING' : 'OPTIMAL',
        owner: 'SOC Tier-3 Escalation Team',
        lastUpdated: '5 mins ago',
        description: 'Mandatory containment SLA for active ransomware, Mimikatz credential dumping, and lateral movement.',
        remediationAction: 'Manual EDR host quarantine executes via CrowdStrike/SentinelOne API.'
      },
      {
        id: 'SLA-002',
        title: 'Splunk SIEM Real-Time HEC Log Ingestion Latency',
        tier: 'Tier 3 - Operational',
        colorCode: 'BLUE',
        colorLabel: 'BLUE - OPERATIONAL BASELINE',
        slaTarget: '< 60 Seconds Latency',
        achievedValue: '14.2 sec avg',
        compliancePercent: 99.2,
        breachesCount: 0,
        nearMissCount: 1,
        status: 'BASELINE',
        owner: 'SIEM Engineering & Infra',
        lastUpdated: '1 min ago',
        description: 'End-to-end pipeline latency from edge firewall and Sysmon collectors into Splunk Indexer.',
        remediationAction: 'Dual indexer clustering with auto-scaling HEC buffer prevents backpressure.'
      },
      {
        id: 'SLA-003',
        title: 'P2 High Incident Initial Investigation',
        tier: 'Tier 2 - High',
        colorCode: isSurge ? 'RED' : 'AMBER',
        colorLabel: isSurge ? 'RED - SLA BREACHED' : 'AMBER - AT RISK (NEAR MISS)',
        slaTarget: '60 Minutes',
        achievedValue: isSurge ? '68.5 min avg' : '51.4 min avg',
        compliancePercent: isSurge ? 86.2 : 91.2,
        breachesCount: isSurge ? 3 : 0,
        nearMissCount: isSurge ? 7 : 2,
        status: isSurge ? 'BREACHED' : 'WARNING',
        owner: 'SOC Shift Leads (Team Alpha)',
        lastUpdated: '12 mins ago',
        description: 'Triage, IOC extraction, and affected user communication for High severity security alerts.',
        remediationAction: 'Reallocated 2 analysts from routine queue to High triage to clear backlogged tickets.'
      },
      {
        id: 'SLA-004',
        title: 'CISA KEV Critical Vulnerability Patching',
        tier: 'Tier 1 - Critical',
        colorCode: isHardened ? 'BLUE' : 'RED',
        colorLabel: isHardened ? 'BLUE - RESOLVING' : 'RED - CRITICAL BREACH',
        slaTarget: '72 Hours (3 Days)',
        achievedValue: isHardened ? '48.0 hrs avg' : '94.6 hrs avg',
        compliancePercent: isHardened ? 96.0 : 82.4,
        breachesCount: isHardened ? 0 : 3,
        nearMissCount: isHardened ? 1 : 4,
        status: isHardened ? 'BASELINE' : 'BREACHED',
        owner: 'Infrastructure SecOps & DevOps',
        lastUpdated: '25 mins ago',
        description: 'Enterprise mandate to remediate actively weaponized vulnerabilities listed on the CISA KEV catalog.',
        remediationAction: 'Emergency maintenance window scheduled for tonight; staging verification complete.'
      },
      {
        id: 'SLA-005',
        title: 'Threat Feed IOC Ingestion & Hash Matching',
        tier: 'Tier 3 - Operational',
        colorCode: 'GREEN',
        colorLabel: 'GREEN - SLA ACHIEVED',
        slaTarget: '< 5 Minutes',
        achievedValue: '1.1 min avg',
        compliancePercent: 100.0,
        breachesCount: 0,
        nearMissCount: 0,
        status: 'OPTIMAL',
        owner: 'CTI Threat Intel Team',
        lastUpdated: 'Live Feed Active',
        description: 'Continuous ingestion of AlienVault OTX, CISA alerts, and TAXII/STIX streams into local detection cache.',
        remediationAction: 'Microservice polling at 30-second cycles guarantees immediate hash matching.'
      },
      {
        id: 'SLA-006',
        title: 'Sigma Detection Rule Compilation & SIEM Deploy',
        tier: 'Tier 3 - Operational',
        colorCode: 'BLUE',
        colorLabel: 'BLUE - OPERATIONAL BASELINE',
        slaTarget: '< 1 Hour',
        achievedValue: '18.4 min avg',
        compliancePercent: 97.5,
        breachesCount: 0,
        nearMissCount: 1,
        status: 'BASELINE',
        owner: 'Detection Engineering',
        lastUpdated: '40 mins ago',
        description: 'Converting newly identified adversary TTPs into validated Splunk SPL and Sigma search queries.',
        remediationAction: 'CI/CD pipeline automatically executes pySigma syntax verification before deployment.'
      },
      {
        id: 'SLA-007',
        title: 'High-Privilege Domain Admin Credential Rotation',
        tier: 'Tier 4 - Governance',
        colorCode: isHardened ? 'GREEN' : 'AMBER',
        colorLabel: isHardened ? 'GREEN - ROTATED' : 'AMBER - WATCHLIST',
        slaTarget: '30-Day Mandatory Cycle',
        achievedValue: isHardened ? '14 Days avg' : '29.2 Days avg',
        compliancePercent: isHardened ? 99.0 : 90.0,
        breachesCount: 0,
        nearMissCount: isHardened ? 0 : 3,
        status: isHardened ? 'OPTIMAL' : 'WARNING',
        owner: 'Identity & Access Governance',
        lastUpdated: '1 hour ago',
        description: 'Enforcing time-based key and password rotation for all service accounts with Active Directory admin privileges.',
        remediationAction: 'CyberArk PAM workflow automated; 3 flagged legacy accounts scheduled for rotation.'
      },
      {
        id: 'SLA-008',
        title: 'Daily Threat Intelligence Briefing Delivery',
        tier: 'Tier 4 - Governance',
        colorCode: 'GREEN',
        colorLabel: 'GREEN - SLA ACHIEVED',
        slaTarget: 'Daily 08:00 UTC Delivery',
        achievedValue: '07:45 UTC (15m ahead)',
        compliancePercent: 100.0,
        breachesCount: 0,
        nearMissCount: 0,
        status: 'OPTIMAL',
        owner: 'Principal Threat Intelligence Officer',
        lastUpdated: 'Today 07:45 UTC',
        description: 'Automated synthesis and dispatch of executive cyber threat briefing to CISO, VP SecOps, and IT Leadership.',
        remediationAction: 'AI automated digest generator synthesizes last 24h telemetry without human latency.'
      }
    ];
  }, [simulationMode]);

  // Key Risk Indicators (KRIs) with RED, BLUE, GREEN, AMBER classification
  const kriData: KRIMetric[] = useMemo(() => {
    return [
      {
        id: 'kri-red',
        title: 'High-Privilege Service Account Risk',
        colorCode: 'RED',
        colorLabel: 'RED - CRITICAL RISK',
        riskScore: 92,
        value: '3 Unrotated Accounts',
        target: '0 Accounts Allowed',
        description: 'Service accounts with Domain Admin privileges that have unrotated credentials for > 180 days, vulnerable to Kerberoasting.',
        mitigation: 'Automated CyberArk credential check initiated. Forced rotation scheduled within 4 hours.'
      },
      {
        id: 'kri-amber',
        title: 'Internet-Exposed Perimeter Gateways',
        colorCode: 'AMBER',
        colorLabel: 'AMBER - ELEVATED EXPOSURE',
        riskScore: 68,
        value: '4 Exposed Endpoints',
        target: '< 1 Protected Gateway',
        description: 'Public-facing management ports (RDP 3389, SSH 22) flagged during external OSINT and Shodan attack surface scans.',
        mitigation: 'Edge firewall policy updated. Cloudflare Zero Trust tunnel policy enforcing IP-allowlisting.'
      },
      {
        id: 'kri-blue',
        title: 'Perimeter IOC Blocking Throughput',
        colorCode: 'BLUE',
        colorLabel: 'BLUE - OPERATIONAL TELEMETRY',
        riskScore: 45,
        value: '14,820 IOCs Blocked',
        target: 'Continuous Streaming',
        description: 'Dynamic blocklist feed synchronized to Palo Alto firewalls and AWS WAF with zero dropouts.',
        mitigation: 'Threat intelligence telemetry feed running at 100% health across all edge regions.'
      },
      {
        id: 'kri-green',
        title: 'False Positive Alert Ratio',
        colorCode: 'GREEN',
        colorLabel: 'GREEN - OPTIMAL TUNING',
        riskScore: 14,
        value: '2.1% False Positives',
        target: '< 5.0% Benchmark',
        description: 'SOC alert signal-to-noise ratio. Demonstrates high-fidelity detection rules with minimal alert fatigue.',
        mitigation: '18 active Sigma rules continuously tuned against benign internal enterprise baseline traffic.'
      }
    ];
  }, []);

  // Filter metrics based on color code selection
  const filteredKPIs = useMemo(() => {
    if (activeColorFilter === 'ALL') return kpiData;
    return kpiData.filter(k => k.colorCode === activeColorFilter);
  }, [kpiData, activeColorFilter]);

  const filteredSLAs = useMemo(() => {
    if (activeColorFilter === 'ALL') return slaData;
    return slaData.filter(s => s.colorCode === activeColorFilter);
  }, [slaData, activeColorFilter]);

  const filteredKRIs = useMemo(() => {
    if (activeColorFilter === 'ALL') return kriData;
    return kriData.filter(k => k.colorCode === activeColorFilter);
  }, [kriData, activeColorFilter]);

  // Overall counts for Red, Blue, Green, Amber
  const counts = useMemo(() => {
    const all = [...kpiData, ...slaData, ...kriData];
    return {
      all: all.length,
      red: all.filter(x => x.colorCode === 'RED').length,
      blue: all.filter(x => x.colorCode === 'BLUE').length,
      green: all.filter(x => x.colorCode === 'GREEN').length,
      amber: all.filter(x => x.colorCode === 'AMBER').length
    };
  }, [kpiData, slaData, kriData]);

  // SLA Compliance summary score
  const overallSlaScore = useMemo(() => {
    const sum = slaData.reduce((acc, curr) => acc + curr.compliancePercent, 0);
    return (sum / slaData.length).toFixed(1);
  }, [slaData]);

  // Export Audit Report
  const handleExportAudit = () => {
    const reportTimestamp = new Date().toISOString();
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CTI & SOC KPI, KRI, SLA Governance Audit Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #020617; color: #f8fafc; padding: 32px; }
    h1 { color: #38bdf8; border-bottom: 2px solid #1e293b; padding-bottom: 12px; margin-bottom: 8px; }
    .subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
    .ragb-banner { display: flex; gap: 16px; margin-bottom: 24px; }
    .ragb-pill { padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 13px; }
    .red { background: #450a0a; color: #f87171; border: 1px solid #dc2626; }
    .blue { background: #082f49; color: #38bdf8; border: 1px solid #0284c7; }
    .green { background: #022c22; color: #4ade80; border: 1px solid #16a34a; }
    .amber { background: #451a03; color: #fbbf24; border: 1px solid #d97706; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 32px; }
    th, td { border: 1px solid #1e293b; padding: 10px 14px; text-align: left; font-size: 13px; }
    th { background: #0f172a; color: #cbd5e1; }
    tr:nth-child(even) { background: #0b1120; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Executive CTI & SOC Performance Governance Audit</h1>
  <div class="subtitle">Generated on ${reportTimestamp} | Scope: ${timeRange} | Simulation: ${simulationMode.toUpperCase()} | Overall SLA Compliance: ${overallSlaScore}%</div>

  <div class="ragb-banner">
    <div class="ragb-pill red">🔴 RED (Critical / Breached): ${counts.red}</div>
    <div class="ragb-pill amber">🟠 AMBER (At Risk / Warning): ${counts.amber}</div>
    <div class="ragb-pill green">🟢 GREEN (SLA Achieved): ${counts.green}</div>
    <div class="ragb-pill blue">🔵 BLUE (Operational Baseline): ${counts.blue}</div>
  </div>

  <h2>Service Level Agreements (SLAs) Status Matrix</h2>
  <table>
    <thead>
      <tr>
        <th>SLA ID</th>
        <th>SLA Title & Tier</th>
        <th>Color Code</th>
        <th>Target SLA</th>
        <th>Achieved Value</th>
        <th>Compliance %</th>
        <th>Breaches</th>
        <th>Owner</th>
      </tr>
    </thead>
    <tbody>
      ${slaData.map(s => `
        <tr>
          <td><b>${s.id}</b></td>
          <td>${s.title}<br><small style="color:#64748b">${s.tier}</small></td>
          <td><span class="badge ${s.colorCode.toLowerCase()}">${s.colorLabel}</span></td>
          <td>${s.slaTarget}</td>
          <td><b>${s.achievedValue}</b></td>
          <td>${s.compliancePercent}%</td>
          <td>${s.breachesCount}</td>
          <td>${s.owner}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Key Performance Indicators (KPIs)</h2>
  <table>
    <thead>
      <tr>
        <th>KPI Name</th>
        <th>Color Code</th>
        <th>Current Value</th>
        <th>Target</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${kpiData.map(k => `
        <tr>
          <td><b>${k.name}</b></td>
          <td><span class="badge ${k.colorCode.toLowerCase()}">${k.colorLabel}</span></td>
          <td><b>${k.value}</b></td>
          <td>${k.target}</td>
          <td>${k.statusText}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Key Risk Indicators (KRIs)</h2>
  <table>
    <thead>
      <tr>
        <th>Risk Indicator</th>
        <th>Color Code</th>
        <th>Measured Value</th>
        <th>Target Benchmark</th>
        <th>Mitigation Plan</th>
      </tr>
    </thead>
    <tbody>
      ${kriData.map(r => `
        <tr>
          <td><b>${r.title}</b></td>
          <td><span class="badge ${r.colorCode.toLowerCase()}">${r.colorLabel}</span></td>
          <td><b>${r.value}</b></td>
          <td>${r.target}</td>
          <td>${r.mitigation}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CTI_SOC_KPI_SLA_Audit_Report_${timeRange}_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportFeedback(`SLA & KPI Audit Report (${counts.red} Red, ${counts.amber} Amber, ${counts.green} Green, ${counts.blue} Blue) successfully exported!`);
    setTimeout(() => setExportFeedback(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Executive Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Subtle color ambient aura */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-500/5 via-blue-500/5 to-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-cyan-400 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>CTI & SOC Performance Governance</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm">
                  RAGB COLOR CODED
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  ISO/IEC 27001 & SOC 2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                Continuous measurement of Cyber Threat Intelligence efficiency, adversary risk exposure, and Service Level Agreement (SLA) compliance under standard 
                <strong className="text-rose-400 ml-1">Red</strong>, 
                <strong className="text-blue-400 ml-1">Blue</strong>, 
                <strong className="text-emerald-400 ml-1">Green</strong>, and 
                <strong className="text-amber-400 ml-1">Amber</strong> operational color coding.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-end lg:self-center">
            {/* Time Window Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              {(['24h', '7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-lg font-bold uppercase transition-all ${
                    timeRange === r 
                      ? 'bg-slate-700 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Audit Report Export */}
            <button
              onClick={handleExportAudit}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold border border-slate-700 hover:border-cyan-500/50 transition-all shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Audit HTML</span>
            </button>
          </div>
        </div>

        {/* Global SLA Overall Score bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">{overallSlaScore}%</span>
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">Overall SLA Compliance</span>
            </div>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div className="text-xs text-slate-400 font-mono hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Target Benchmark: &gt; 98.0%</span>
            </div>
          </div>

          {/* Quick Simulation Mode Switcher */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulation Load:</span>
            </span>
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setSimulationMode('normal')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  simulationMode === 'normal' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-white'
                }`}
                title="Normal Steady State Baseline"
              >
                Normal
              </button>
              <button
                onClick={() => setSimulationMode('surge')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  simulationMode === 'surge' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-slate-400 hover:text-white'
                }`}
                title="Simulate High Incident Surge (Threat Spike)"
              >
                Threat Surge (1.5x)
              </button>
              <button
                onClick={() => setSimulationMode('hardening')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  simulationMode === 'hardening' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'text-slate-400 hover:text-white'
                }`}
                title="Simulate Active Response Hardening & Patch Window"
              >
                Hardened
              </button>
            </div>
          </div>
        </div>
      </div>

      {exportFeedback && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 shadow-xl font-mono animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* RAGB COLOR CODING LEGEND & INTERACTIVE FILTER BAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Color Coding Filter & Governance Classification
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Click any color tier to isolate associated SLA & KPI telemetry
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
          {/* ALL METRICS */}
          <button
            onClick={() => setActiveColorFilter('ALL')}
            className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
              activeColorFilter === 'ALL'
                ? 'bg-slate-800 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>ALL METRICS</span>
              <Award className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-white mt-1">{counts.all}</div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">Full CTI & SOC Governance</div>
          </button>

          {/* RED: CRITICAL / BREACHED */}
          <button
            onClick={() => setActiveColorFilter('RED')}
            className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
              activeColorFilter === 'RED'
                ? 'bg-rose-950/50 border-rose-500 text-rose-200 shadow-md shadow-rose-500/20'
                : 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700 text-rose-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-rose-300 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse shadow-sm shadow-rose-500" />
                <span>RED</span>
              </span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-black text-rose-400 mt-1">{counts.red}</div>
            <div className="text-[10px] text-rose-300/80 mt-1 truncate font-semibold">Critical / SLA Breached</div>
          </button>

          {/* BLUE: OPERATIONAL BASELINE */}
          <button
            onClick={() => setActiveColorFilter('BLUE')}
            className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
              activeColorFilter === 'BLUE'
                ? 'bg-blue-950/50 border-blue-500 text-blue-200 shadow-md shadow-blue-500/20'
                : 'bg-blue-950/20 border-blue-900/50 hover:border-blue-700 text-blue-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-blue-300 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm shadow-blue-500" />
                <span>BLUE</span>
              </span>
              <Layers className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-black text-blue-400 mt-1">{counts.blue}</div>
            <div className="text-[10px] text-blue-300/80 mt-1 truncate font-semibold">Operational Baseline</div>
          </button>

          {/* GREEN: SLA ACHIEVED / OPTIMAL */}
          <button
            onClick={() => setActiveColorFilter('GREEN')}
            className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
              activeColorFilter === 'GREEN'
                ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/20'
                : 'bg-emerald-950/20 border-emerald-900/50 hover:border-emerald-700 text-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500" />
                <span>GREEN</span>
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400 mt-1">{counts.green}</div>
            <div className="text-[10px] text-emerald-300/80 mt-1 truncate font-semibold">SLA Met / Optimal</div>
          </button>

          {/* AMBER: WARNING / NEAR-MISS */}
          <button
            onClick={() => setActiveColorFilter('AMBER')}
            className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
              activeColorFilter === 'AMBER'
                ? 'bg-amber-950/50 border-amber-500 text-amber-200 shadow-md shadow-amber-500/20'
                : 'bg-amber-950/20 border-amber-900/50 hover:border-amber-700 text-amber-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm shadow-amber-500" />
                <span>AMBER</span>
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-400 mt-1">{counts.amber}</div>
            <div className="text-[10px] text-amber-300/80 mt-1 truncate font-semibold">Warning / At Risk</div>
          </button>
        </div>

        {/* Detailed Color Criteria Guidance Accordion */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-[11px] font-mono grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-start gap-2 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
            <div>
              <strong className="text-rose-400">RED CRITERIA:</strong> SLA compliance &lt; 90%, response time exceeding SLA threshold, or active SLA breach requiring executive escalation.
            </div>
          </div>

          <div className="flex items-start gap-2 text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
            <div>
              <strong className="text-blue-400">BLUE CRITERIA:</strong> Operational standard (95% - 98%), automated background pipelines, and telemetry running at steady-state.
            </div>
          </div>

          <div className="flex items-start gap-2 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <strong className="text-emerald-400">GREEN CRITERIA:</strong> SLA compliance &gt; 98%, target performance exceeded, 0 breaches, optimal containment velocity.
            </div>
          </div>

          <div className="flex items-start gap-2 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
            <div>
              <strong className="text-amber-400">AMBER CRITERIA:</strong> At risk (90% - 95%), within 10% of SLA expiry limit, near-misses recorded, or watchlists pending review.
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS: KPI SPOTLIGHT, SLA MATRIX, KRI METRICS, SIMULATOR */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('sla')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'sla'
              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Target className="w-4 h-4 text-cyan-400" />
          <span>SLA Governance Matrix</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
            {filteredSLAs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('kpi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'kpi'
              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Key Performance Indicators (KPIs)</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
            {filteredKPIs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('kri')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'kri'
              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Key Risk Indicators (KRIs)</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
            {filteredKRIs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: SERVICE LEVEL AGREEMENTS (SLAs) GOVERNANCE MATRIX */}
      {activeTab === 'sla' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Enterprise Service Level Agreements (SLAs) Status</span>
                {activeColorFilter !== 'ALL' && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    activeColorFilter === 'RED' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    activeColorFilter === 'BLUE' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    activeColorFilter === 'GREEN' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    Filtered: {activeColorFilter}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking of contractual and internal SOC performance thresholds across triage, response, containment, and patch windows.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Telemetry Synchronized</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSLAs.map((sla) => {
              // Color styles based on RAGB code
              const isRed = sla.colorCode === 'RED';
              const isBlue = sla.colorCode === 'BLUE';
              const isGreen = sla.colorCode === 'GREEN';
              const isAmber = sla.colorCode === 'AMBER';

              return (
                <div
                  key={sla.id}
                  onClick={() => setSelectedSLAModal(sla)}
                  className={`rounded-2xl border p-5 transition-all cursor-pointer relative overflow-hidden group shadow-lg flex flex-col justify-between space-y-4 ${
                    isRed
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500 hover:shadow-rose-500/10'
                      : isBlue
                      ? 'bg-blue-950/20 border-blue-500/40 hover:border-blue-500 hover:shadow-blue-500/10'
                      : isGreen
                      ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500 hover:shadow-emerald-500/10'
                      : 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500 hover:shadow-amber-500/10'
                  }`}
                >
                  {/* Color Accent Top Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isRed ? 'bg-rose-500' : isBlue ? 'bg-blue-500' : isGreen ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800">
                          {sla.id}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {sla.tier}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {sla.title}
                      </h4>
                    </div>

                    {/* Color status badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 border ${
                      isRed ? 'bg-rose-950 text-rose-300 border-rose-800 shadow-sm shadow-rose-950' :
                      isBlue ? 'bg-blue-950 text-blue-300 border-blue-800 shadow-sm shadow-blue-950' :
                      isGreen ? 'bg-emerald-950 text-emerald-300 border-emerald-800 shadow-sm shadow-emerald-950' :
                      'bg-amber-950 text-amber-300 border-amber-800 shadow-sm shadow-amber-950'
                    }`}>
                      {sla.colorLabel}
                    </span>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">TARGET SLA</div>
                      <div className="font-bold text-slate-200 mt-0.5">{sla.slaTarget}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">ACHIEVED</div>
                      <div className={`font-black mt-0.5 ${
                        isRed ? 'text-rose-400' : isBlue ? 'text-blue-400' : isGreen ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {sla.achievedValue}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">COMPLIANCE</div>
                      <div className={`font-black mt-0.5 ${
                        sla.compliancePercent >= 98 ? 'text-emerald-400' : sla.compliancePercent >= 90 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {sla.compliancePercent}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar with Color System */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">SLA Achievement Gauge</span>
                      <span className={`font-bold ${
                        isRed ? 'text-rose-400' : isBlue ? 'text-blue-400' : isGreen ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {sla.compliancePercent}% compliant
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isRed ? 'bg-rose-500 shadow-sm shadow-rose-500' :
                          isBlue ? 'bg-blue-500 shadow-sm shadow-blue-500' :
                          isGreen ? 'bg-emerald-500 shadow-sm shadow-emerald-500' :
                          'bg-amber-500 shadow-sm shadow-amber-500'
                        }`}
                        style={{ width: `${Math.min(sla.compliancePercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer details */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span>Breaches: <strong className={sla.breachesCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{sla.breachesCount}</strong></span>
                      <span>•</span>
                      <span>Near-Misses: <strong className={sla.nearMissCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-300'}>{sla.nearMissCount}</strong></span>
                    </div>

                    <div className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                      <span>View Audit</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: KEY PERFORMANCE INDICATORS (KPIs) */}
      {activeTab === 'kpi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Key Performance Indicators (KPIs) - 4-Color Spotlight</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every KPI is mapped into Red, Blue, Green, or Amber status depending on active velocity, automated coverage, and SLA threshold budgets.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Updated across last {timeRange}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredKPIs.map((kpi) => {
              const isRed = kpi.colorCode === 'RED';
              const isBlue = kpi.colorCode === 'BLUE';
              const isGreen = kpi.colorCode === 'GREEN';
              const isAmber = kpi.colorCode === 'AMBER';

              return (
                <div
                  key={kpi.id}
                  className={`rounded-2xl border p-5 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between space-y-4 ${
                    isRed
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                      : isBlue
                      ? 'bg-blue-950/20 border-blue-500/40 hover:border-blue-500'
                      : isGreen
                      ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500'
                      : 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500'
                  }`}
                >
                  {/* Top accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isRed ? 'bg-rose-500' : isBlue ? 'bg-blue-500' : isGreen ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />

                  {/* Header */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        isRed ? 'bg-rose-950 text-rose-300 border-rose-800' :
                        isBlue ? 'bg-blue-950 text-blue-300 border-blue-800' :
                        isGreen ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                        'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        {kpi.colorLabel}
                      </span>

                      <span className="text-[10px] font-mono text-slate-500">{kpi.category}</span>
                    </div>

                    <div className="text-xs font-bold text-slate-200">
                      {kpi.name}
                    </div>
                  </div>

                  {/* Big Value Display */}
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className={`text-3xl font-black font-mono tracking-tight ${
                        isRed ? 'text-rose-400' : isBlue ? 'text-blue-400' : isGreen ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {kpi.value}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {kpi.target}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono flex items-center justify-between text-slate-400">
                      <span>{kpi.statusText}</span>
                      <span className={kpi.trendPositive ? 'text-emerald-400' : 'text-amber-400'}>
                        {kpi.trend}
                      </span>
                    </div>
                  </div>

                  {/* Progress gauge */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80 p-0.5">
                      <div
                        className={`h-full rounded-full ${
                          isRed ? 'bg-rose-500' : isBlue ? 'bg-blue-500' : isGreen ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(kpi.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono text-right">
                      {kpi.thresholdGuide}
                    </div>
                  </div>

                  {/* Description & Details */}
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed font-sans">
                    {kpi.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: KEY RISK INDICATORS (KRIs) */}
      {activeTab === 'kri' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Key Risk Indicators (KRIs) - RAGB Exposure Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Proactive leading risk indicators identifying emerging exposure vectors before security incident escalations occur.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Evaluated against NIST CSF & CISA KEV
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKRIs.map((kri) => {
              const isRed = kri.colorCode === 'RED';
              const isBlue = kri.colorCode === 'BLUE';
              const isGreen = kri.colorCode === 'GREEN';
              const isAmber = kri.colorCode === 'AMBER';

              return (
                <div
                  key={kri.id}
                  className={`rounded-2xl border p-5 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between space-y-3.5 ${
                    isRed
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                      : isBlue
                      ? 'bg-blue-950/20 border-blue-500/40 hover:border-blue-500'
                      : isGreen
                      ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500'
                      : 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500'
                  }`}
                >
                  {/* Top accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isRed ? 'bg-rose-500' : isBlue ? 'bg-blue-500' : isGreen ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />

                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">
                        {kri.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {kri.description}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 border ${
                      isRed ? 'bg-rose-950 text-rose-300 border-rose-800' :
                      isBlue ? 'bg-blue-950 text-blue-300 border-blue-800' :
                      isGreen ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {kri.colorLabel}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">MEASURED VALUE</div>
                      <div className={`text-base font-black mt-0.5 ${
                        isRed ? 'text-rose-400' : isBlue ? 'text-blue-400' : isGreen ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {kri.value}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">TARGET BENCHMARK</div>
                      <div className="text-slate-300 font-bold mt-0.5">{kri.target}</div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    <strong className="text-cyan-400">Mitigation: </strong>{kri.mitigation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SLA DRILLDOWN MODAL */}
      {selectedSLAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-200">
                    {selectedSLAModal.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    selectedSLAModal.colorCode === 'RED' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                    selectedSLAModal.colorCode === 'BLUE' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                    selectedSLAModal.colorCode === 'GREEN' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                    'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {selectedSLAModal.colorLabel}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{selectedSLAModal.title}</h3>
              </div>

              <button
                onClick={() => setSelectedSLAModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400">TARGET SLA</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">{selectedSLAModal.slaTarget}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">ACHIEVED</div>
                  <div className="text-sm font-bold text-cyan-400 mt-1">{selectedSLAModal.achievedValue}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">COMPLIANCE</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">{selectedSLAModal.compliancePercent}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">BREACHES</div>
                  <div className={`text-sm font-bold mt-1 ${selectedSLAModal.breachesCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {selectedSLAModal.breachesCount} Breaches
                  </div>
                </div>
              </div>

              <div className="space-y-2 font-sans">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Governance Scope</div>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {selectedSLAModal.description}
                </p>
              </div>

              <div className="space-y-2 font-sans">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Remediation & Action Plan</div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {selectedSLAModal.remediationAction}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800">
                <span>Accountable Owner: <strong className="text-slate-200">{selectedSLAModal.owner}</strong></span>
                <span>Last Telemetry Sync: <strong className="text-slate-200">{selectedSLAModal.lastUpdated}</strong></span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSLAModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold font-mono transition-colors"
              >
                Close Audit Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
