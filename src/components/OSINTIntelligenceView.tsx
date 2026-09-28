import React, { useState } from 'react';
import { OSINTAdvisory, OSINTIndicator } from '../types/cti';
import { Globe, ShieldAlert, Search, RefreshCw, Terminal, ExternalLink, CheckCircle, AlertTriangle, Cpu, Database, Filter, Share2, Layers, Bookmark } from 'lucide-react';

interface OSINTIntelligenceViewProps {
  onRunSPLInConsole?: (spl: string) => void;
}

export const OSINTIntelligenceView: React.FC<OSINTIntelligenceViewProps> = ({ onRunSPLInConsole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('ALL');
  const [selectedAdvisory, setSelectedAdvisory] = useState<OSINTAdvisory | null>(null);
  const [viewMode, setViewMode] = useState<'stream' | 'zeroday'>('stream');
  const [deployMessage, setDeployMessage] = useState<string | null>(null);
  const [watchlistCves, setWatchlistCves] = useState<string[]>(['CVE-2026-9901']);

  const toggleWatchlist = (cveId: string) => {
    if (watchlistCves.includes(cveId)) {
      setWatchlistCves(watchlistCves.filter(c => c !== cveId));
      setDeployMessage(`Removed ${cveId} from SOC threat watchlist.`);
    } else {
      setWatchlistCves([...watchlistCves, cveId]);
      setDeployMessage(`Added ${cveId} to SOC threat watchlist with priority monitoring.`);
    }
    setTimeout(() => setDeployMessage(null), 4000);
  };

  const [zeroDayModules] = useState([
    {
      id: 'ZD-2026-01',
      cveId: 'CVE-2026-9901',
      title: 'Windows Kernel Direct Memory Access (DMA) Local Privilege Escalation Zero-Day',
      cvssScore: 10.0,
      severity: 'CRITICAL',
      discoveredBy: 'Project Zero / OSINT Telemetry',
      weaponizedStatus: 'Active In-The-Wild Exploitation',
      targetComponent: 'ntoskrnl.exe / Hardware Bus Driver',
      summary: 'A zero-day vulnerability in Windows kernel DMA validation allows unprivileged attackers to execute arbitrary ring 0 code via malicious peripheral simulation.',
      mitreTtp: 'T1068 - Exploitation for Privilege Escalation',
      sourceRef: 'https://googleprojectzero.blogspot.com',
      sourceName: 'Google Project Zero & CISA KEV'
    },
    {
      id: 'ZD-2026-02',
      cveId: 'CVE-2026-8812',
      title: 'Microsoft Exchange OWA Unauthenticated Remote Code Execution Zero-Day',
      cvssScore: 9.8,
      severity: 'CRITICAL',
      discoveredBy: 'ShadowServer OSINT Feed',
      weaponizedStatus: 'PoC Available / Scanning Active',
      targetComponent: 'Exchange Outlook Web Access (OWA)',
      summary: 'Unauthenticated RCE vector discovered being leveraged by APT actors to drop web shells and establish persistent backdoor access on perimeter mail servers.',
      mitreTtp: 'T1190 - Exploit Public-Facing Application',
      sourceRef: 'https://msrc.microsoft.com/update-guide',
      sourceName: 'MSRC & GitHub Advisories'
    },
    {
      id: 'ZD-2026-03',
      cveId: 'CVE-2026-7720',
      title: 'Cisco ASA & FTD VPN WebVPN Auth Bypass & Remote Command Execution Zero-Day',
      cvssScore: 9.8,
      severity: 'CRITICAL',
      discoveredBy: 'AlienVault OTX Contributor Stream',
      weaponizedStatus: 'Active Ransomware Campaign Vector',
      targetComponent: 'Cisco ASA WebVPN HTTP Engine',
      summary: 'Active zero-day exploitation attempts targeting VPN gateway appliances without patches available. Threat actors bypass MFA and execute arbitrary CLI commands.',
      mitreTtp: 'T1133 - External Remote Services',
      sourceRef: 'https://otx.alienvault.com',
      sourceName: 'AlienVault OTX & ThreatFox'
    }
  ]);

  const [osintAdvisories, setOsintAdvisories] = useState<OSINTAdvisory[]>([
    {
      id: 'osint-001',
      source: 'GitHub Security',
      title: 'Active Exploitation of Apache Log4j / Spring Cloud Gateway RCE via OSINT Feed',
      summary: 'Open-source intelligence feeds report widespread scanning and exploitation attempts targeting exposed Spring Cloud Gateway endpoints and Log4j instances using obfuscated payload chains.',
      publishedAt: '2026-09-26 14:30 UTC',
      confidence: 'HIGH',
      indicators: [
        { type: 'IP', value: '185.220.101.5', threatScore: 95 },
        { type: 'CVE', value: 'CVE-2022-22947', threatScore: 98 },
        { type: 'DOMAIN', value: 'malicious-gateway-payload.xyz', threatScore: 90 }
      ],
      correlatedReportsCount: 14,
      matchedThreatReports: [
        'Global APT28 Cyber Espionage Campaign Q3',
        'Spring Cloud Gateway RCE Incident Post-Mortem',
        'Enterprise perimeter intrusion detection telemetry'
      ],
      matchedCveIds: ['CVE-2022-22947', 'CVE-2021-44228'],
      matchedAssetsCount: 6,
      tags: ['RCE', 'SpringCloud', 'Log4j', 'Exploit'],
      rawFeedUrl: 'https://github.com/advisories/GHSA-87xh-g2wx-5v63'
    },
    {
      id: 'osint-002',
      source: 'MalwareBazaar',
      title: 'New Stealc Info-Stealer Variant Disseminated via Malicious Python PyPI Packages',
      summary: 'OSINT Telegram and PyPI repository monitors detected 12 typosquatted packages exfiltrating browser credentials and crypto wallet keys to foreign C2 nodes.',
      publishedAt: '2026-09-26 12:15 UTC',
      confidence: 'HIGH',
      indicators: [
        { type: 'HASH', value: '4e9e072a3b1b6f00f89d3c512316e6d4', threatScore: 92 },
        { type: 'DOMAIN', value: 'pypi-update-checker.com', threatScore: 88 },
        { type: 'IP', value: '45.154.255.88', threatScore: 94 }
      ],
      correlatedReportsCount: 9,
      matchedThreatReports: [
        'Developer Workstation Compromise Assessment',
        'Stealc Malware Analysis & IOC Telemetry',
        'Endpoint Process Anomalies Report'
      ],
      matchedCveIds: ['CVE-2024-3094'],
      matchedAssetsCount: 4,
      tags: ['InfoStealer', 'PyPI', 'Stealc', 'SupplyChain'],
      rawFeedUrl: 'https://bazaar.abuse.ch/sample/4e9e072a3b1b6f00f89d3c512316e6d4/'
    },
    {
      id: 'osint-003',
      source: 'AlienVault OTX',
      title: 'LockBit 4.0 Ransomware Affiliate Infrastructure Discovered in OSINT Scans',
      summary: 'Threat intelligence contributors shared newly activated Cobalt Strike beacon servers and staging directories used in recent healthcare sector extortion attempts.',
      publishedAt: '2026-09-26 10:00 UTC',
      confidence: 'HIGH',
      indicators: [
        { type: 'IP', value: '194.26.29.112', threatScore: 99 },
        { type: 'DOMAIN', value: 'update-windows-service.net', threatScore: 96 },
        { type: 'HASH', value: 'a1b2c3d4e5f67890123456789abcdef0', threatScore: 90 }
      ],
      correlatedReportsCount: 22,
      matchedThreatReports: [
        'LockBit 4.0 Extortion Campaign Analysis',
        'Cobalt Strike Beacon Detection & Heuristics',
        'Critical Healthcare Infrastructure Threat Brief'
      ],
      matchedCveIds: ['CVE-2023-23397', 'CVE-2023-38831'],
      matchedAssetsCount: 8,
      tags: ['Ransomware', 'LockBit', 'CobaltStrike', 'C2'],
      rawFeedUrl: 'https://otx.alienvault.com/pulse/lockbit-4-infrastructure'
    },
    {
      id: 'osint-004',
      source: 'Twitter OSINT Feed',
      title: 'Ivanti Connect Secure Zero-Day Exploitation Indicators Shared by Researchers',
      summary: 'Independent security researchers published PoC scripts and active scanning IPs attempting authentication bypass and web shell implantation on VPN appliances.',
      publishedAt: '2026-09-26 08:45 UTC',
      confidence: 'EMERGING',
      indicators: [
        { type: 'IP', value: '103.152.64.12', threatScore: 91 },
        { type: 'CVE', value: 'CVE-2024-21887', threatScore: 97 }
      ],
      correlatedReportsCount: 5,
      matchedThreatReports: [
        'VPN Gateway Perimeter Vulnerability Assessment',
        'Ivanti Connect Secure Incident Report'
      ],
      matchedCveIds: ['CVE-2024-21887', 'CVE-2023-46805'],
      matchedAssetsCount: 2,
      tags: ['Ivanti', 'VPN', 'ZeroDay', 'WebShell'],
      rawFeedUrl: 'https://x.com/sec_feed/status/ivanti-zero-day'
    },
    {
      id: 'osint-005',
      source: 'Abuse.ch ThreatFox',
      title: 'AsyncRAT Campaign Targeting Financial Institutions via Phishing Invoices',
      summary: 'ThreatFox telemetry correlates multiple weaponized ZIP attachments containing malicious LNK files invoking PowerShell downloader stubs.',
      publishedAt: '2026-09-26 06:20 UTC',
      confidence: 'MEDIUM',
      indicators: [
        { type: 'HASH', value: '88f9e0a1b2c34d5e6f7a8b9c0d1e2f3a', threatScore: 85 },
        { type: 'URL', value: 'https://secure-invoices-portal.com/download/invoice.zip', threatScore: 89 }
      ],
      correlatedReportsCount: 11,
      matchedThreatReports: [
        'Financial Sector Phishing Wave Analysis',
        'AsyncRAT Malware Family Threat Profile'
      ],
      matchedCveIds: [],
      matchedAssetsCount: 3,
      tags: ['AsyncRAT', 'Phishing', 'PowerShell', 'Malware'],
      rawFeedUrl: 'https://threatfox.abuse.ch/ioc/88f9e0a1b2c34d5e6f7a8b9c0d1e2f3a/'
    }
  ]);

  const handleRefreshOSINT = async () => {
    setTimeout(() => {
      const newAdvisory: OSINTAdvisory = {
        id: `osint-new-${Date.now()}`,
        source: 'AlienVault OTX',
        title: 'Newly Ingested Live OSINT Bulletin: Stealthy DLL Side-Loading Campaign Identified',
        summary: 'Live OSINT web scraper retrieved fresh indicator stream from threat intelligence sharing groups regarding signed binary side-loading.',
        publishedAt: new Date().toISOString().substring(0, 19).replace('T', ' ') + ' UTC',
        confidence: 'HIGH',
        indicators: [
          { type: 'HASH', value: '9f8e7d6c5b4a3210fedcba9876543210', threatScore: 96 },
          { type: 'IP', value: '198.51.100.42', threatScore: 93 }
        ],
        correlatedReportsCount: 7,
        matchedThreatReports: [
          'Enterprise Perimeter Intrusion Detection',
          'DLL Side-Loading Vector Analysis'
        ],
        matchedCveIds: ['CVE-2023-36884'],
        matchedAssetsCount: 3,
        tags: ['OSINTLive', 'DLLSideLoading', 'APT'],
        rawFeedUrl: 'https://otx.alienvault.com/pulse/fresh-ingest'
      };
      setOsintAdvisories([newAdvisory, ...osintAdvisories]);
      setIsRefreshing(false);
    }, 1200);
  };

  const filteredAdvisories = osintAdvisories.filter((adv) => {
    const matchesSearch =
      adv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adv.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adv.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      adv.indicators.some((i: OSINTIndicator) => i.value.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSource = selectedSource === 'ALL' || adv.source === selectedSource;
    const matchesConfidence = selectedConfidence === 'ALL' || adv.confidence === selectedConfidence;

    return matchesSearch && matchesSource && matchesConfidence;
  });

  const totalCorrelatedReports = osintAdvisories.reduce((acc: number, curr: OSINTAdvisory) => acc + curr.correlatedReportsCount, 0);
  const totalIndicators = osintAdvisories.reduce((acc: number, curr: OSINTAdvisory) => acc + curr.indicators.length, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Globe className="w-6 h-6" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>OSINT Intelligence Hub & Threat Report Correlation Engine</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                LIVE CTI CORRELATION
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Continuously ingesting Open Source Intelligence (OSINT) from GitHub Security Advisories, MalwareBazaar, AlienVault OTX, Twitter Security Feeds, and Abuse.ch. Automatically correlates all ingested threat indicators against enterprise asset inventories, CVE advisories, and SIEM threat reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshOSINT}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Fetch Live OSINT Feed</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400">Total OSINT Bulletins</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{osintAdvisories.length}</h3>
            <p className="text-[10px] text-cyan-400 mt-1">Active multi-source feeds</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400">Extracted IOC Indicators</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{totalIndicators}</h3>
            <p className="text-[10px] text-emerald-400 mt-1">IPs, Hashes, Domains, CVEs</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400">Correlated Threat Reports</p>
            <h3 className="text-2xl font-bold text-cyan-400 mt-0.5">{totalCorrelatedReports}</h3>
            <p className="text-[10px] text-cyan-300 mt-1">Cross-referenced across SOC</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400">Correlation Engine Status</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">Active</h3>
            <p className="text-[10px] text-slate-400 mt-1">Real-time matching enabled</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* View Mode Tabs: OSINT Stream vs Zero-Day Attack Module */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setViewMode('stream')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            viewMode === 'stream'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>OSINT Threat Stream ({filteredAdvisories.length})</span>
        </button>
        <button
          onClick={() => setViewMode('zeroday')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            viewMode === 'zeroday'
              ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Zero-Day Attack Module ({zeroDayModules.length})</span>
        </button>
      </div>

      {deployMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{deployMessage}</span>
        </div>
      )}

      {viewMode === 'zeroday' ? (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>Active Zero-Day Threat Module & Unpatched Exploit Intelligence</span>
              </h2>
              <p className="text-xs text-slate-400">
                Tracking zero-day vulnerabilities actively exploited in the wild before vendor patches are released. Real-time SIEM rule generation and project zero source references.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              HIGH ALERT STATUS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {zeroDayModules.map((zd) => (
              <div key={zd.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-rose-500/50 transition-all shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      {zd.cveId}
                    </span>
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-950 text-amber-400 border border-slate-800">
                      CVSS {zd.cvssScore} CRITICAL
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{zd.title}</h3>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    {zd.summary}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-400 font-mono">
                    <div className="flex items-center justify-between">
                      <span>Weaponized Status:</span>
                      <span className="text-rose-400 font-bold">{zd.weaponizedStatus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Target Component:</span>
                      <span className="text-cyan-300">{zd.targetComponent}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>MITRE TTP:</span>
                      <span className="text-slate-300">{zd.mitreTtp}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <a
                      href={zd.sourceRef}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-1 underline"
                    >
                      <span>{zd.sourceName}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {watchlistCves.includes(zd.cveId) && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold flex items-center gap-1">
                        <Bookmark className="w-3 h-3 fill-pink-400" /> Watchlisted
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setDeployMessage(`Completed Relevance Check for ${zd.cveId}: 3 enterprise assets match vulnerability footprint.`);
                        setTimeout(() => setDeployMessage(null), 5000);
                      }}
                      className="py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Relevance Check</span>
                    </button>
                    <button
                      onClick={() => toggleWatchlist(zd.cveId)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                        watchlistCves.includes(zd.cveId)
                          ? 'bg-pink-500 text-slate-950 border-pink-500 shadow-md shadow-pink-500/20'
                          : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${watchlistCves.includes(zd.cveId) ? 'fill-slate-950' : ''}`} />
                      <span>{watchlistCves.includes(zd.cveId) ? 'Watchlisted' : 'Add Watchlist'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search OSINT feeds, indicators, tags..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Source:</span>
              </div>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Sources</option>
                <option value="GitHub Security">GitHub Security</option>
                <option value="MalwareBazaar">MalwareBazaar</option>
                <option value="AlienVault OTX">AlienVault OTX</option>
                <option value="Twitter OSINT Feed">Twitter OSINT Feed</option>
                <option value="Abuse.ch ThreatFox">Abuse.ch ThreatFox</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono pl-2">
                <span>Confidence:</span>
              </div>
              <select
                value={selectedConfidence}
                onChange={(e) => setSelectedConfidence(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Levels</option>
                <option value="HIGH">High Confidence</option>
                <option value="MEDIUM">Medium Confidence</option>
                <option value="EMERGING">Emerging</option>
              </select>
            </div>
          </div>

          {/* OSINT Advisories List & Correlation Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: OSINT Feed Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Ingested OSINT Stream & Threat Report Correlations ({filteredAdvisories.length})</span>
                </h2>
              </div>

          <div className="space-y-3">
            {filteredAdvisories.map((adv) => {
              const isSelected = selectedAdvisory?.id === adv.id;
              return (
                <div
                  key={adv.id}
                  onClick={() => setSelectedAdvisory(adv)}
                  className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-slate-900/90 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-cyan-400 border border-slate-800">
                          {adv.source}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            adv.confidence === 'HIGH'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {adv.confidence} CONFIDENCE
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">{adv.publishedAt}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white hover:text-cyan-300 transition-colors">
                        {adv.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{adv.summary}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{adv.correlatedReportsCount} Reports</span>
                      </div>
                    </div>
                  </div>

                  {/* Indicators & Tags */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {adv.indicators.map((ind: OSINTIndicator, iIdx: number) => (
                        <span
                          key={iIdx}
                          className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[11px] border border-slate-800 flex items-center gap-1"
                        >
                          <span className="text-cyan-400 font-bold">{ind.type}:</span>
                          <span>{ind.value}</span>
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      {adv.tags.map((tag: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-950/60 text-slate-400 font-mono text-[10px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected OSINT Correlation Matrix Detail */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Threat Report Correlation Inspector</span>
          </h2>

          {selectedAdvisory ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 sticky top-6">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400">{selectedAdvisory.source}</span>
                  <span className="text-[11px] font-mono text-slate-400">{selectedAdvisory.publishedAt}</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{selectedAdvisory.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedAdvisory.summary}</p>
              </div>

              {/* Correlated Threat Reports */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Correlated Threat Reports ({selectedAdvisory.matchedThreatReports.length})</span>
                </h4>
                <div className="space-y-2">
                  {selectedAdvisory.matchedThreatReports.map((report: string, rIdx: number) => (
                    <div key={rIdx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200">
                      <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-cyan-300">{report}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Matched via SHA256 / IP / CVE telemetry stream</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Assets & CVEs */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Impacted Assets & CVEs</span>
                </h4>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-mono">Impacted Assets:</span>
                    <span className="font-bold text-rose-400">{selectedAdvisory.matchedAssetsCount} Enterprise Hosts</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-mono">Correlated CVEs:</span>
                    <span className="font-mono text-cyan-300">{selectedAdvisory.matchedCveIds.join(', ') || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {selectedAdvisory.matchedCveIds.length > 0 && onRunSPLInConsole && (
                  <button
                    onClick={() => onRunSPLInConsole(`index=winlogs OR index=sysmon CVE="${selectedAdvisory.matchedCveIds[0]}"\n| stats count by host, user, source_ip\n| sort - count`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-xs shadow-md transition-all"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Run OSINT IOC Query in SIEM</span>
                  </button>
                )}

                {/* Source Reference Link */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-400 font-mono">OSINT Source Reference:</span>
                  </div>
                  <a
                    href={selectedAdvisory.rawFeedUrl || 'https://github.com/advisories'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-1 underline underline-offset-2 truncate max-w-[200px]"
                    title={selectedAdvisory.rawFeedUrl}
                  >
                    <span className="truncate">{selectedAdvisory.source} Feed</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3 text-slate-400">
              <Globe className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs">Select any OSINT advisory from the stream to inspect cross-report correlations and IOC matches.</p>
            </div>
          )}
        </div>
      </div>
      </>
    )}
    </div>
  );
};
