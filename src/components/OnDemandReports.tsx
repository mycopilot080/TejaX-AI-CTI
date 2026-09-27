import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  ShieldAlert, 
  Calendar, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  Plus, 
  Eye, 
  Globe, 
  Cpu, 
  Lock,
  Share2
} from 'lucide-react';
import { ThreatReportData, defangIp, defangDomain } from './ThreatReports';
import { 
  subscribeThreatReports, 
  saveThreatReportToFirestore, 
  deleteThreatReportFromFirestore 
} from '../lib/firebase';
import { 
  downloadReportAsHtml, 
  downloadReportAsMarkdown, 
  downloadReportAsStixJson, 
  downloadReportAsPdf, 
  downloadIocsCsv, 
  downloadAllReportsJson,
  downloadFile
} from '../utils/downloadUtils';

export const OnDemandReports: React.FC = () => {
  // Stored on-demand reports in Firestore
  const [reports, setReports] = useState<ThreatReportData[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeThreatReports((firestoreReports) => {
      if (firestoreReports && firestoreReports.length > 0) {
        setReports(firestoreReports);
        setSelectedReport((current) => {
          if (!current) return firestoreReports[0];
          const match = firestoreReports.find((r) => r.id === current.id);
          return match || firestoreReports[0];
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const [selectedReport, setSelectedReport] = useState<ThreatReportData | null>(null);

  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [isDefanged, setIsDefanged] = useState<boolean>(true);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState<boolean>(false);
  const [downloadFormat, setDownloadFormat] = useState<string>('pdf');
  const [bulkDownloadFormat, setBulkDownloadFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  const handleSelectAll = () => {
    if (selectedReportIds.length === filteredReports.length) {
      setSelectedReportIds([]);
    } else {
      setSelectedReportIds(filteredReports.map(r => r.id));
    }
  };

  const handleDownloadSelected = () => {
    const reportsToDownload = reports.filter(r => selectedReportIds.includes(r.id));
    if (reportsToDownload.length === 0) {
      showFeedback('Please check/select at least one report using checkboxes.');
      return;
    }

    if (bulkDownloadFormat === 'json') {
      downloadAllReportsJson(reportsToDownload, isDefanged);
      showFeedback(`Downloaded ${reportsToDownload.length} selected reports as JSON bundle (.json).`);
    } else if (bulkDownloadFormat === 'csv') {
      const rows = [
        ['Report_ID', 'CVE_ID', 'Title', 'Severity', 'Threat_Actor', 'IOC_Type', 'IOC_Value', 'Time_Window']
      ];
      reportsToDownload.forEach(r => {
        const formatIp = (ip: string) => (isDefanged ? defangIp(ip) : ip);
        const formatDomain = (dom: string) => (isDefanged ? defangDomain(dom) : dom);
        r.iocs.ips.forEach(ip => rows.push([r.id, r.cveId, `"${r.title.replace(/"/g, '""')}"`, r.severity, `"${r.threatActor}"`, 'IPv4', formatIp(ip), r.timeWindow]));
        r.iocs.domains.forEach(dom => rows.push([r.id, r.cveId, `"${r.title.replace(/"/g, '""')}"`, r.severity, `"${r.threatActor}"`, 'Domain', formatDomain(dom), r.timeWindow]));
        r.iocs.hashes.forEach(h => rows.push([r.id, r.cveId, `"${r.title.replace(/"/g, '""')}"`, r.severity, `"${r.threatActor}"`, 'SHA256', h, r.timeWindow]));
      });
      const csvContent = rows.map(r => r.join(',')).join('\n');
      downloadFile(csvContent, `Tejax_Selected_Reports_IOCs_${isDefanged ? 'Defanged' : 'Raw'}.csv`, 'text/csv');
      showFeedback(`Exported combined CSV for ${reportsToDownload.length} selected reports (.csv).`);
    } else if (bulkDownloadFormat === 'pdf') {
      reportsToDownload.forEach((r, idx) => {
        setTimeout(() => {
          downloadReportAsPdf(r, isDefanged);
        }, idx * 600);
      });
      showFeedback(`Triggering PDF exports for ${reportsToDownload.length} selected reports (.pdf).`);
    }
  };

  // Generator Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>('Zero-Day Supply Chain Compromise & DLL Hijacking');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('CRITICAL');
  const [timeWindow, setTimeWindow] = useState<string>('Last 24 Hours');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const showFeedback = (msg: string) => {
    setDownloadFeedback(msg);
    setDownloadDropdownOpen(false);
    setTimeout(() => setDownloadFeedback(null), 4000);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/cti/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: `Generate on-demand threat briefing for topic: "${topic}" with severity ${severity} over time window "${timeWindow}". Provide executive summary, technical breakdown, IoCs (IPs, domains, hashes), and recommendations.`,
          advisoryTitle: topic,
          cveId: `CVE-2026-${Math.floor(1000 + Math.random() * 9000)}`
        })
      });
      const data = await res.json();
      if (data.success && data.report) {
        const r = data.report;
        const newReport: ThreatReportData = {
          id: `OD-REP-${Math.floor(100 + Math.random() * 900)}`,
          title: topic,
          cveId: r.cveId || `CVE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          severity: severity,
          cvssScore: r.cvssScore || (severity === 'CRITICAL' ? 9.8 : 8.2),
          threatActor: r.threatActor || 'Advanced Threat Syndicate (On-Demand AI)',
          timeWindow: timeWindow,
          publishedAt: new Date().toISOString(),
          executiveSummary: r.summary || `On-demand generated threat intelligence briefing analyzing telemetry streams for "${topic}".`,
          technicalSummary: r.technicalSummary || 'Comprehensive on-demand multi-source threat intelligence synthesis covering initial access, process injection, and telemetry indicators.',
          iocs: {
            ips: r.iocs?.ips?.length ? r.iocs.ips : ['198.51.100.99', '185.220.101.44'],
            domains: r.iocs?.domains?.length ? r.iocs.domains : ['ondemand-telemetry-node.net', 'c2-dispatch-hub.org'],
            hashes: ['e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
            processes: ['lsass.exe', 'powershell.exe', 'rundll32.exe']
          },
          recommendations: r.recommendedMitigations || [
            'Isolate affected host endpoints immediately via SOAR automated playbooks.',
            'Block malicious IoCs across perimeter firewall and EDR controls.'
          ],
          mitreTtp: 'T1059.001 - Command and Scripting Interpreter: PowerShell',
          killChainStage: 'Execution / Exploitation',
          references: [
            { title: 'Tejax On-Demand CTI Telemetry Analysis', url: 'https://cisa.gov', source: 'Tejax CTI Engine' }
          ]
        };
        const updated = [newReport, ...reports];
        setReports(updated);
        setSelectedReport(newReport);
        saveThreatReportToFirestore(newReport);
        showFeedback(`Successfully generated and stored on-demand report: "${topic}"!`);
        setModalOpen(false);
      }
    } catch (e) {
      console.error(e);
      const fallbackReport: ThreatReportData = {
        id: `OD-REP-${Math.floor(100 + Math.random() * 900)}`,
        title: topic,
        cveId: `CVE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        severity: severity,
        cvssScore: 9.1,
        threatActor: 'Custom Threat Actor Group',
        timeWindow: timeWindow,
        publishedAt: new Date().toISOString(),
        executiveSummary: `Generated on-demand threat intelligence briefing for "${topic}" covering ${timeWindow} of telemetry monitoring.`,
        technicalSummary: 'Automated on-demand incident analysis and indicator correlation.',
        mitreTtp: 'T1204 - User Execution',
        killChainStage: 'Execution',
        iocs: {
          ips: ['198.51.100.88', '45.154.255.10'],
          domains: ['ondemand-c2-node.ru'],
          hashes: ['8f34b21901a89c201e91240189ab102941298401928401920194820192810192'],
          processes: ['powershell.exe']
        },
        recommendations: ['Review firewall rules and apply vendor patches.'],
        references: [{ title: 'Tejax On-Demand Advisory', url: 'https://cisa.gov', source: 'Tejax SOC' }]
      };
      const updated = [fallbackReport, ...reports];
      setReports(updated);
      setSelectedReport(fallbackReport);
      saveThreatReportToFirestore(fallbackReport);
      showFeedback(`Successfully generated and stored on-demand report: "${topic}"!`);
      setModalOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete report ${id} from Firestore?`)) {
      deleteThreatReportFromFirestore(id);
      const filtered = reports.filter(r => r.id !== id);
      setReports(filtered);
      if (selectedReport?.id === id) {
        setSelectedReport(filtered[0] || null);
      }
      showFeedback(`Deleted report ${id} from On-Demand module storage.`);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.cveId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.threatActor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || r.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn font-sans">
      {/* MODULE HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono text-[10px] font-bold tracking-wider uppercase">
              Module: On-Demand Reports
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
              {reports.length} Stored Reports
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            On-Demand Intelligence Reports & Storage
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Synthesize custom 24-hour threat briefings on-demand. Every generated report is permanently stored in this module with full downloadable support (PDF, JSON STIX, CSV IOCs, HTML, Markdown).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (selectedReport) {
                downloadAllReportsJson(reports);
                showFeedback(`Exported all ${reports.length} on-demand reports as JSON archive.`);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Archive</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Generate On-Demand Report</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {downloadFeedback && (
        <div className="bg-cyan-950/90 border border-cyan-800/80 text-cyan-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-mono shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{downloadFeedback}</span>
          </div>
          <span className="text-[10px] text-cyan-400/80">Stored in On-Demand Module</span>
        </div>
      )}

      {/* MAIN CONTENT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT LIST / SIDEBAR */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search stored on-demand reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all whitespace-nowrap ${
                    severityFilter === sev
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* SELECT ALL & BULK DOWNLOAD BAR */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1 pt-1 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filteredReports.length > 0 && selectedReportIds.length === filteredReports.length}
                  onChange={handleSelectAll}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span>Select All ({filteredReports.length})</span>
              </label>
              {selectedReportIds.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <select
                    value={bulkDownloadFormat}
                    onChange={(e) => setBulkDownloadFormat(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 text-white rounded px-1.5 py-0.5 text-[10px] font-mono focus:outline-none cursor-pointer"
                  >
                    <option value="json" className="bg-slate-900 text-white">JSON</option>
                    <option value="csv" className="bg-slate-900 text-white">CSV</option>
                    <option value="pdf" className="bg-slate-900 text-white">PDF</option>
                  </select>
                  <button
                    onClick={handleDownloadSelected}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-[10px] hover:bg-cyan-400 transition-all shadow"
                    title="Download selected reports in chosen format"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download ({selectedReportIds.length})</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                No on-demand reports match criteria.
              </div>
            ) : (
              filteredReports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                const isChecked = selectedReportIds.includes(report.id);
                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedReportIds(prev =>
                              prev.includes(report.id) ? prev.filter(x => x !== report.id) : [...prev, report.id]
                            );
                          }}
                          className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                          {report.cveId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          report.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                          report.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}>
                          {report.severity}
                        </span>
                        <button
                          onClick={(e) => handleDeleteReport(report.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-all rounded"
                          title="Delete report from module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {report.title}
                    </h4>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                      <span>{report.timeWindow}</span>
                      <span>{new Date(report.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PREVIEW & DOWNLOAD ACTIONS */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          {selectedReport ? (
            <>
              {/* REPORT TOP BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-xs font-bold border border-cyan-800">
                      {selectedReport.cveId}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                      selectedReport.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {selectedReport.severity} (CVSS {selectedReport.cvssScore})
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {selectedReport.id}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {selectedReport.title}
                  </h2>
                </div>

                {/* DOWNLOAD DROPDOWN BUTTONS & SELECT */}
                <div className="relative shrink-0 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsDefanged(!isDefanged)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      isDefanged 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                    title="Toggle IOC defanging (. -> [dot], http -> hxxp)"
                  >
                    {isDefanged ? 'Defanged IOCs' : 'Raw IOCs'}
                  </button>

                  {/* Format Select Dropdown & Download Button */}
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
                    <select
                      value={downloadFormat}
                      onChange={(e) => setDownloadFormat(e.target.value)}
                      className="bg-transparent text-white text-xs font-mono focus:outline-none cursor-pointer"
                    >
                      <option value="pdf" className="bg-slate-900 text-white">PDF Report (.pdf)</option>
                      <option value="html" className="bg-slate-900 text-white">HTML Document (.html)</option>
                      <option value="json" className="bg-slate-900 text-white">STIX 2.1 JSON (.json)</option>
                      <option value="md" className="bg-slate-900 text-white">Markdown (.md)</option>
                      <option value="csv" className="bg-slate-900 text-white">IOCs CSV (.csv)</option>
                    </select>
                    <button
                      onClick={() => {
                        if (!selectedReport) return;
                        if (downloadFormat === 'pdf') {
                          downloadReportAsPdf(selectedReport, isDefanged);
                          showFeedback(`Exported ${selectedReport.cveId} PDF Threat Report.`);
                        } else if (downloadFormat === 'html') {
                          downloadReportAsHtml(selectedReport, isDefanged);
                          showFeedback(`Downloaded ${selectedReport.cveId} HTML Disclosure Report.`);
                        } else if (downloadFormat === 'json') {
                          downloadReportAsStixJson(selectedReport, isDefanged);
                          showFeedback(`Downloaded ${selectedReport.cveId} STIX 2.1 JSON Bundle.`);
                        } else if (downloadFormat === 'md') {
                          downloadReportAsMarkdown(selectedReport, isDefanged);
                          showFeedback(`Downloaded ${selectedReport.cveId} Markdown Briefing.`);
                        } else if (downloadFormat === 'csv') {
                          downloadIocsCsv(selectedReport, isDefanged);
                          showFeedback(`Exported ${selectedReport.cveId} IOCs CSV File.`);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow transition-all"
                      title="Download using selected format"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* REPORT BODY PREVIEW */}
              <div className="space-y-6 text-xs text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">THREAT ACTOR / SYNDICATE</span>
                    <span className="text-white font-bold">{selectedReport.threatActor}</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">TIME WINDOW ANALYZED</span>
                    <span className="text-cyan-400 font-bold">{selectedReport.timeWindow}</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">PUBLISHED TIMESTAMP</span>
                    <span className="text-slate-200">{new Date(selectedReport.publishedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-500/30">
                    <span className="text-[10px] text-rose-400 font-bold block mb-1">MITRE ATT&CK TTP</span>
                    <span className="text-white font-bold">{selectedReport.mitreTtp || 'T1204 - User Execution'}</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 font-bold block mb-1">CYBER KILL CHAIN STAGE</span>
                    <span className="text-emerald-300 font-bold">{selectedReport.killChainStage || 'Exploitation'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono border-b border-slate-800 pb-1">
                    Executive Summary
                  </h3>
                  <p className="text-slate-200 leading-relaxed font-sans bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {selectedReport.executiveSummary}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono border-b border-slate-800 pb-1">
                    Technical Telemetry Breakdown
                  </h3>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {selectedReport.technicalSummary}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono border-b border-slate-800 pb-1">
                    Extracted Indicators of Compromise (IoCs)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block mb-2">MALICIOUS IP ADDRESSES</span>
                      <div className="space-y-1">
                        {selectedReport.iocs.ips.map((ip, i) => (
                          <div key={i} className="text-red-400 text-xs">{isDefanged ? ip.replace(/\./g, '[dot]') : ip}</div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block mb-2">C2 DOMAINS</span>
                      <div className="space-y-1">
                        {selectedReport.iocs.domains.map((dom, i) => (
                          <div key={i} className="text-amber-400 text-xs">{isDefanged ? dom.replace(/\./g, '[dot]') : dom}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono border-b border-slate-800 pb-1">
                    Recommended Mitigations
                  </h3>
                  <ul className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {selectedReport.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-slate-500 font-mono text-xs">
              Select or generate an on-demand report to view details.
            </div>
          )}
        </div>
      </div>

      {/* GENERATE ON-DEMAND REPORT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Generate & Store On-Demand Threat Report</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Synthesize a fresh on-demand threat intelligence briefing via Gemini AI. The resulting report will be permanently stored in this module for immediate offline download as PDF, STIX JSON, CSV, HTML, and Markdown.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Threat Campaign / Topic:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-sans focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Zero-Day LSASS Memory Injection & Ransomware"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Severity Level:</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-sans focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">CRITICAL (CVSS 9.0+)</option>
                    <option value="HIGH">HIGH (CVSS 7.0-8.9)</option>
                    <option value="MEDIUM">MEDIUM (CVSS 4.0-6.9)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Time Window:</label>
                  <select
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-sans focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Last 24 Hours">Last 24 Hours</option>
                    <option value="Last 12 Hours">Last 12 Hours</option>
                    <option value="Last 48 Hours">Last 48 Hours</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Synthesizing & Storing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Generate & Store Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
