import React, { useState, useMemo } from 'react';
import {
  Globe,
  Flame,
  Activity,
  ShieldAlert,
  Target,
  ArrowUpRight,
  RefreshCw,
  Zap,
  Filter,
  BarChart3,
  MapPin,
  AlertTriangle,
  Layers,
  Terminal,
  Cpu
} from 'lucide-react';

export const ThreatHeatmapView: React.FC = () => {
  const [selectedKillChainStage, setSelectedKillChainStage] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Cyber Kill Chain stages combined with MITRE ATT&CK Tactics
  const killChainMatrix = [
    {
      stage: 'Reconnaissance',
      mitreTactic: 'Reconnaissance (TA0043)',
      color: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
      techniques: [
        { id: 'T1595', name: 'Active Scanning', risk: 'MEDIUM', detections: 142, actor: 'APT29 / Cozy Bear' },
        { id: 'T1589', name: 'Gather Victim Identity Info', risk: 'LOW', detections: 89, actor: 'FIN7' },
        { id: 'T1592', name: 'Gather Victim Host Information', risk: 'MEDIUM', detections: 112, actor: 'LockBit Affiliates' }
      ]
    },
    {
      stage: 'Weaponization',
      mitreTactic: 'Resource Development (TA0042)',
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
      techniques: [
        { id: 'T1588', name: 'Obtain Capabilities (Exploits)', risk: 'HIGH', detections: 64, actor: 'Lazarus Group' },
        { id: 'T1587', name: 'Develop Capabilities', risk: 'MEDIUM', detections: 45, actor: 'APT28' }
      ]
    },
    {
      stage: 'Delivery',
      mitreTactic: 'Initial Access (TA0001)',
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
      techniques: [
        { id: 'T1190', name: 'Exploit Public-Facing Application', risk: 'CRITICAL', detections: 310, actor: 'Various APTs' },
        { id: 'T1566', name: 'Phishing (Spearphishing Link)', risk: 'HIGH', detections: 245, actor: 'FIN7' },
        { id: 'T1133', name: 'External Remote Services', risk: 'HIGH', detections: 188, actor: 'LockBit 4.0' }
      ]
    },
    {
      stage: 'Exploitation',
      mitreTactic: 'Execution (TA0002)',
      color: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
      techniques: [
        { id: 'T1059', name: 'Command and Scripting Interpreter', risk: 'CRITICAL', detections: 520, actor: 'APT29' },
        { id: 'T1203', name: 'Exploitation for Client Execution', risk: 'HIGH', detections: 175, actor: 'Volt Typhoon' }
      ]
    },
    {
      stage: 'Installation',
      mitreTactic: 'Persistence & Privilege Escalation (TA0003/TA0004)',
      color: 'border-orange-500/40 bg-orange-950/20 text-orange-300',
      badgeColor: 'bg-orange-950 text-orange-300 border-orange-800',
      techniques: [
        { id: 'T1098', name: 'Account Manipulation', risk: 'CRITICAL', detections: 210, actor: 'UNC3886' },
        { id: 'T1547', name: 'Boot or Logon Autostart Execution', risk: 'HIGH', detections: 165, actor: 'LockBit' }
      ]
    },
    {
      stage: 'Command and Control',
      mitreTactic: 'Command and Control (TA0011)',
      color: 'border-pink-500/40 bg-pink-950/20 text-pink-300',
      badgeColor: 'bg-pink-950 text-pink-300 border-pink-800',
      techniques: [
        { id: 'T1071', name: 'Application Layer Protocol (HTTPS C2)', risk: 'HIGH', detections: 390, actor: 'APT29' },
        { id: 'T1573', name: 'Encrypted Channel', risk: 'MEDIUM', detections: 280, actor: 'FIN7' }
      ]
    },
    {
      stage: 'Actions on Objectives',
      mitreTactic: 'Exfiltration & Impact (TA0010/TA0040)',
      color: 'border-red-600/50 bg-red-950/30 text-red-300',
      badgeColor: 'bg-red-950 text-red-300 border-red-800',
      techniques: [
        { id: 'T1486', name: 'Data Encrypted for Impact (Ransomware)', risk: 'CRITICAL', detections: 85, actor: 'LockBit 4.0' },
        { id: 'T1567', name: 'Exfiltration Over Web Service', risk: 'HIGH', detections: 130, actor: 'Lazarus Group' }
      ]
    }
  ];

  // Compute dynamic metrics based on selected stage
  const currentMetrics = useMemo(() => {
    const activeTechniques = selectedKillChainStage === 'ALL' 
      ? killChainMatrix.flatMap(s => s.techniques)
      : killChainMatrix.find(s => s.stage === selectedKillChainStage)?.techniques || [];
    
    const totalDetections = activeTechniques.reduce((sum, t) => sum + t.detections, 0);
    const criticalTechs = activeTechniques.filter(t => t.risk === 'CRITICAL');
    const peakActor = activeTechniques.sort((a, b) => b.detections - a.detections)[0]?.actor || 'N/A';
    
    return {
      techCount: activeTechniques.length,
      totalDetections,
      criticalCount: criticalTechs.length,
      peakActor,
      topTech: activeTechniques.sort((a, b) => b.detections - a.detections)[0]
    };
  }, [selectedKillChainStage]);

  const filteredStages = killChainMatrix.filter(stage => {
    if (selectedKillChainStage !== 'ALL' && stage.stage !== selectedKillChainStage) return false;
    return true;
  });

  const handleStageClick = (stageName: string) => {
    setSelectedKillChainStage(prev => prev === stageName ? 'ALL' : stageName);
    setSelectedTechnique(null);
  };

  const selectedTechniqueData = useMemo(() => {
    if (!selectedTechnique) return null;
    return killChainMatrix.flatMap(s => s.techniques).find(t => t.id === selectedTechnique);
  }, [selectedTechnique]);

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between shadow-xl gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Flame className="w-6 h-6 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                MITRE ATT&CK & Cyber Kill Chain Threat Heatmap
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                FRAMEWORK: MITRE v16.1 & LOCKHEED MARTIN KILL CHAIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Heatmap matrix correlating active Enterprise.com adversary tactics, techniques, and procedures (TTPs) across the 7-stage Cyber Kill Chain.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedKillChainStage}
            onChange={(e) => {
              setSelectedKillChainStage(e.target.value);
              setSelectedTechnique(null);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Kill Chain Stages</option>
            {killChainMatrix.map(s => (
              <option key={s.stage} value={s.stage}>{s.stage}</option>
            ))}
          </select>
        </div>
      </div>

      {refreshMessage && (
        <div className="bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-lg text-xs flex items-center justify-between shadow-xl font-mono animate-fadeIn">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{refreshMessage}</span>
          </div>
          <button onClick={() => setRefreshMessage(null)} className="text-cyan-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Dynamic Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-2 transition-all">
          <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Active Techniques ({selectedKillChainStage})</div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-400 font-mono">{currentMetrics.techCount} TTPs</span>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900">Mapped</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-400 h-full" style={{ width: `${(currentMetrics.techCount / 15) * 100}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-2 transition-all">
          <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Risk Concentration</div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400 font-mono">{currentMetrics.topTech?.id || 'N/A'}</span>
            <span className="text-xs font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-900">{currentMetrics.topTech?.detections || 0} Hits</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-rose-500 h-full" style={{ width: `${(currentMetrics.totalDetections / 2000) * 100}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-2 transition-all">
          <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Top Threat Actor</div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-400 font-mono truncate max-w-[180px]">{currentMetrics.peakActor}</span>
            <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-900">Peak Active</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-400 h-full w-[70%]" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-2 transition-all">
          <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Detection Coverage</div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400 font-mono">94.2%</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">Sigma & KQL Active</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-400 h-full w-[94%]" />
          </div>
        </div>
      </div>

      {/* Technique Intelligence Dashboard (Appears when a technique is clicked) */}
      {selectedTechniqueData && (
        <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Terminal className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span className="text-cyan-400">{selectedTechniqueData.id}</span>
                  <span>—</span>
                  <span>{selectedTechniqueData.name}</span>
                </h3>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Technique Intelligence Drill-Down</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedTechnique(null)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Detection Analytics</label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">24h Hit Count</span>
                    <span className="text-white font-mono font-bold">{selectedTechniqueData.detections}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Primary Actor</span>
                    <span className="text-amber-400 font-mono font-bold">{selectedTechniqueData.actor}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Risk Severity</span>
                    <span className={`font-mono font-bold ${
                      selectedTechniqueData.risk === 'CRITICAL' ? 'text-rose-400' : 
                      selectedTechniqueData.risk === 'HIGH' ? 'text-amber-400' : 'text-blue-400'
                    }`}>{selectedTechniqueData.risk}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Detection Coverage</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Active monitoring via **CrowdStrike EDR**, **Splunk SIEM**, and **Palo Alto Cortex**. 12 custom Sigma rules deployed to correlate this TTP.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Targeted Enterprise Assets</label>
                <div className="mt-2 space-y-2">
                  {[
                    { asset: 'api.enterprise.com', status: 'Blocked', time: '12m ago' },
                    { asset: 'git.enterprise.com', status: 'Alerted', time: '1h ago' },
                    { asset: 'auth.enterprise.com', status: 'Blocked', time: '3h ago' }
                  ].map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-950/50 rounded-lg border border-slate-800/50 text-[11px]">
                      <span className="text-slate-300 font-mono">{a.asset}</span>
                      <div className="flex items-center gap-2">
                        <span className={a.status === 'Blocked' ? 'text-emerald-400' : 'text-amber-400'}>{a.status}</span>
                        <span className="text-slate-500 font-mono text-[9px]">{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Automated Playbooks</label>
                <div className="mt-2 space-y-2">
                  <div className="p-3 bg-cyan-950/20 border border-cyan-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                      <Zap className="w-3.5 h-3.5" />
                      <span>EDR Containment Alpha</span>
                    </div>
                    <p className="text-[10px] text-cyan-400/80 mt-1">Status: **ACTIVE**. Automatically isolates endpoint upon 3+ detections in 60 seconds.</p>
                  </div>
                  <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold transition-all border border-slate-700">
                    Dispatch SOAR Remediation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cyber Kill Chain & MITRE Heatmap Matrix Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono uppercase text-slate-300">
            Cyber Kill Chain Progression & MITRE ATT&CK Mapping Heatmap
          </h3>
          <span className="text-xs font-mono text-cyan-400">Showing {filteredStages.length} Kill Chain Stages</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 overflow-x-auto pb-4">
          {filteredStages.map((stageObj, idx) => {
            const originalIndex = killChainMatrix.findIndex(s => s.stage === stageObj.stage);
            return (
              <div
                key={idx}
                className={`border rounded-xl p-4 flex flex-col justify-between space-y-3 bg-slate-900 transition-all duration-300 ${
                  selectedKillChainStage === stageObj.stage ? 'ring-2 ring-cyan-500/50' : ''
                } ${stageObj.color}`}
              >
                <div className="space-y-1.5">
                  <div 
                    onClick={() => handleStageClick(stageObj.stage)}
                    className="flex items-center justify-between cursor-pointer hover:opacity-80"
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-400">STAGE {originalIndex + 1}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${stageObj.badgeColor}`}>
                      {stageObj.stage}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-white">{stageObj.stage}</div>
                  <div className="text-[10px] font-mono text-cyan-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {stageObj.mitreTactic}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Techniques & TTPs:</div>
                  <div className="space-y-2">
                    {stageObj.techniques.map((tech, tIdx) => (
                      <div
                        key={tIdx}
                        onClick={() => setSelectedTechnique(prev => prev === tech.id ? null : tech.id)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                          selectedTechnique === tech.id
                            ? 'bg-cyan-500/30 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-cyan-400">{tech.id}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            tech.risk === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-900' :
                            tech.risk === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-900' :
                            'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}>
                            {tech.risk}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-white mt-1 leading-snug">{tech.name}</div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-900">
                          <span>{tech.detections} hits</span>
                          <span className="text-amber-400 font-bold">{tech.actor}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
