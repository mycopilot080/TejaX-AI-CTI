import React, { useState } from 'react';
import { ThreatReportData, DetectionRule } from '../types/cti';
import { ALL_INITIAL_REPORTS } from '../data/mockReports';
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  Cpu, 
  Sparkles, 
  Code, 
  Terminal, 
  Database, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  Plus,
  Play,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface DetectionCatalogProps {
  onAddRuleToLibrary: (rule: DetectionRule) => void;
}

export const DetectionCatalog: React.FC<DetectionCatalogProps> = ({ onAddRuleToLibrary }) => {
  const [reports] = useState<ThreatReportData[]>(ALL_INITIAL_REPORTS);
  const [selectedReport, setSelectedRule] = useState<ThreatReportData | null>(reports[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRules, setGeneratedRules] = useState<{
    yara?: string;
    kql?: string;
    spl?: string;
    cql?: string;
    elk?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'yara' | 'kql' | 'spl' | 'cql' | 'elk'>('spl');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cveId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.threatActor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateRules = async (report: ThreatReportData) => {
    setIsGenerating(true);
    setGeneratedRules(null);
    try {
      const res = await fetch('/api/chat/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              sender: 'user',
              text: `Based on the following threat intelligence report, generate high-fidelity detection rules for Yara, Microsoft Sentinel KQL, Splunk SPL, CrowdStrike CQL, and Elasticsearch EQL/Lucene.
              
              Report Title: ${report.title}
              CVE: ${report.cveId}
              Technical Summary: ${report.technicalSummary}
              IOCs: ${JSON.stringify(report.iocs)}
              MITRE Technique: ${report.mitreTtp}
              
              Return the rules in a structured format with clearly labeled code blocks for each platform.`
            }
          ],
          model: 'gemini-3.8-flash'
        })
      });
      const data = await res.json();
      if (data.success && data.codeBlocks) {
        const rules: any = {};
        data.codeBlocks.forEach((block: any) => {
          const lang = block.label?.toLowerCase() || block.language?.toLowerCase();
          if (lang.includes('yara')) rules.yara = block.code;
          else if (lang.includes('kql') || lang.includes('sentinel')) rules.kql = block.code;
          else if (lang.includes('spl') || lang.includes('splunk')) rules.spl = block.code;
          else if (lang.includes('cql') || lang.includes('crowdstrike')) rules.cql = block.code;
          else if (lang.includes('elk') || lang.includes('elastic') || lang.includes('eql')) rules.elk = block.code;
        });

        // Fallback for demo if AI output is sparse
        setGeneratedRules({
          yara: rules.yara || `rule Detect_${report.cveId.replace(/-/g, '_')} {\n    meta:\n        description = "Detects ${report.title}"\n        author = "TejaX AI"\n    strings:\n        $s1 = "${report.iocs.hashes[0] || 'malicious_pattern'}"\n    condition:\n        any of them\n}`,
          kql: rules.kql || `SecurityEvent\n| where EventID == 4688\n| where CommandLine has_any ("${report.iocs.processes.join('", "')}")\n| project TimeGenerated, Computer, Account, CommandLine`,
          spl: rules.spl || `index=sysmon EventCode=1 OR EventCode=10\n| search Image="*${report.iocs.processes[0] || 'lsass.exe'}*"\n| stats count by host, user, Image, CommandLine`,
          cql: rules.cql || `DeviceProcessEvents\n| where FileName in~ ("${report.iocs.processes.join('", "')}")\n| summarize count() by DeviceName, UserPrincipalName`,
          elk: rules.elk || `process where process.name == "${report.iocs.processes[0] || 'cmd.exe'}" and process.command_line : "*${report.iocs.processes[1] || ''}*"`
        });
      }
    } catch (err) {
      console.error('Error generating rules:', err);
      setFeedback('Failed to synthesize rules via AI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeployToLibrary = () => {
    if (!selectedReport || !generatedRules) return;
    
    const newRule: DetectionRule = {
      id: `DET-${selectedReport.cveId}-${Math.floor(100 + Math.random() * 900)}`,
      name: `AI Generated: ${selectedReport.title}`,
      category: 'Endpoint Security',
      severity: selectedReport.severity as any,
      riskScore: selectedReport.cvssScore * 10,
      description: `Detection logic synthesized from threat report ${selectedReport.id}.`,
      mitreTechniques: [selectedReport.mitreTtp],
      enabled: true,
      splQuery: generatedRules.spl || '',
      sigmaRule: `title: ${selectedReport.title}\nlogsource:\n  product: windows\ndetection:\n  selection:\n    CommandLine: '*mimikatz*'`,
      kqlQuery: generatedRules.kql,
      cqlQuery: generatedRules.cql,
      elkQuery: generatedRules.elk,
      yaraRule: generatedRules.yara,
      triggerCount: 0
    };

    onAddRuleToLibrary(newRule);
    setFeedback(`Rule successfully deployed to Enterprise Detection Library!`);
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100 font-sans">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Detection Engineering Intelligence Catalog</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                AI Synthesis Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Browse latest threat intelligence reports and synthesize cross-platform detection rules using Gemini AI.
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reports by title, CVE, actor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reports Selection (4 cols) */}
        <div className="lg:col-span-4 space-y-3 h-[720px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 px-1 mb-2 flex items-center gap-2">
            <FileText className="w-3 h-3" /> Latest Threat Intelligence Reports
          </h3>
          {filteredReports.map((report) => {
            const isSelected = selectedReport?.id === report.id;
            return (
              <div
                key={report.id}
                onClick={() => {
                  setSelectedRule(report);
                  setGeneratedRules(null);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-cyan-950/20 border-cyan-500/60 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    report.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {report.severity}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">{report.id}</span>
                </div>
                <h4 className={`text-xs font-bold transition-colors ${isSelected ? 'text-cyan-400' : 'text-slate-200 group-hover:text-white'}`}>
                  {report.title}
                </h4>
                <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-mono">
                  <span className="text-cyan-500/80">{report.cveId}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="truncate">{report.threatActor}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Workspace (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-[720px]">
          {selectedReport ? (
            <>
              <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      CVE: {selectedReport.cveId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      CVSS: {selectedReport.cvssScore}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {selectedReport.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{selectedReport.severity} SEVERITY</span>
                    </div>
                    <span className="text-slate-600">|</span>
                    <span>Tactic: {selectedReport.killChainStage}</span>
                  </div>
                </div>

                {!generatedRules && !isGenerating && (
                  <button
                    onClick={() => handleGenerateRules(selectedReport)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Detection Rules</span>
                  </button>
                )}
              </div>

              {isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-cyan-300 font-mono">TejaX AI Synthesis in Progress...</p>
                    <p className="text-xs text-slate-500">Analyzing report indicators and technical surface for cross-platform signatures.</p>
                  </div>
                </div>
              ) : generatedRules ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['spl', 'kql', 'cql', 'elk', 'yara'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            activeTab === tab
                              ? 'bg-cyan-500 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {tab === 'spl' ? 'Splunk' : tab === 'elk' ? 'ELK' : tab}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleDeployToLibrary}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[10px] transition-all shadow-md shadow-emerald-500/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Deploy to Library</span>
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                          {activeTab === 'spl' ? 'Splunk Search Processing Language' : 
                           activeTab === 'kql' ? 'Kusto Query Language' : 
                           activeTab === 'cql' ? 'CrowdStrike Query Language' : 
                           activeTab === 'yara' ? 'YARA Malware Signature' : 'Elasticsearch Query Language'}
                        </span>
                      </div>
                    </div>
                    <pre className="flex-1 p-5 overflow-auto text-xs font-mono text-cyan-300 selection:bg-cyan-500/30 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                      {activeTab === 'spl' && generatedRules.spl}
                      {activeTab === 'kql' && generatedRules.kql}
                      {activeTab === 'cql' && generatedRules.cql}
                      {activeTab === 'elk' && generatedRules.elk}
                      {activeTab === 'yara' && generatedRules.yara}
                    </pre>
                  </div>

                  <div className="mt-4 p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-slate-300 leading-relaxed">
                      <strong className="text-cyan-400">AI Context:</strong> These rules were generated by correlating the 
                      <strong className="text-white ml-1">{selectedReport.mitreTtp}</strong> technique against the reported technical artifacts. 
                      Human validation is recommended before full production deployment.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                          <Layers className="w-3 h-3" /> Technical Analysis
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                          {selectedReport.technicalSummary}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> Mitigation Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {selectedReport.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 mt-1.5 shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                          <Database className="w-3 h-3" /> Extracted Indicators (IOCs)
                        </h4>
                        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                          {selectedReport.iocs.ips.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-slate-500 font-bold uppercase">Malicious IPs</span>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedReport.iocs.ips.map(ip => (
                                  <span key={ip} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-rose-300 font-mono rounded">{ip}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedReport.iocs.hashes.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-slate-500 font-bold uppercase">File Hashes</span>
                              <div className="space-y-1">
                                {selectedReport.iocs.hashes.map(hash => (
                                  <div key={hash} className="px-2 py-1 bg-slate-900 border border-slate-800 text-[9px] text-slate-400 font-mono rounded truncate">{hash}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                          <ExternalLink className="w-3 h-3" /> Intelligence Sources
                        </h4>
                        <div className="space-y-2">
                          {selectedReport.references.map((ref, i) => (
                            <a 
                              key={i} 
                              href={ref.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-xl hover:bg-slate-800/40 transition-colors group"
                            >
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-slate-900 group-hover:bg-cyan-500/10 text-slate-500 group-hover:text-cyan-400 transition-colors">
                                  <ExternalLink className="w-3 h-3" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-300 group-hover:text-white">{ref.source}</span>
                                  <span className="text-[10px] text-slate-500">{ref.title}</span>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-500 transition-transform group-hover:translate-x-0.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/50">
                <ShieldCheck className="w-12 h-12 text-slate-600" />
              </div>
              <div className="max-w-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-300">No Intelligence Selected</h3>
                <p className="text-xs text-slate-500">Select a threat report from the left panel to begin technical analysis and rule synthesis.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
