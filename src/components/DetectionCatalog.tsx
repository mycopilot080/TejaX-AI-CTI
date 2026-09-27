import React, { useState } from 'react';
import { DetectionRule, AdvisorySeverity } from '../types/cti';
import { ShieldCheck, ToggleLeft, ToggleRight, Play, Code, Search, Filter, AlertTriangle, Layers, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DetectionCatalogProps {
  rules: DetectionRule[];
  onToggleRule: (ruleId: string) => void;
  onSimulateAlert: (rule: DetectionRule) => void;
}

export const DetectionCatalog: React.FC<DetectionCatalogProps> = ({
  rules,
  onToggleRule,
  onSimulateAlert
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRule, setSelectedRule] = useState<DetectionRule | null>(rules[0] || null);
  const [activeCodeTab, setActiveCodeTab] = useState<'spl' | 'sigma' | 'kql' | 'cql'>('spl');
  const [simulatedFeedback, setSimulatedFeedback] = useState<string | null>(null);

  const categories = [
    'ALL',
    'Endpoint Security',
    'Identity & Access',
    'Network Threats',
    'Cloud Security',
    'Ransomware',
    'Zero-Day Exploits'
  ];

  const filteredRules = rules.filter((r) => {
    const matchesCat = selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mitreTechniques.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSimulate = (rule: DetectionRule) => {
    onSimulateAlert(rule);
    setSimulatedFeedback(`Simulated Threat Event triggered for rule "${rule.name}"! Created Notable Incident in SIEM.`);
    setTimeout(() => setSimulatedFeedback(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Production Detection Engineering Catalog</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                {rules.filter((r) => r.enabled).length} / {rules.length} Active Rules
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Enterprise detection rules translated into Splunk SPL, Sigma YAML, Microsoft Sentinel KQL, and CrowdStrike CQL.
            </p>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter rules by name, technique..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {simulatedFeedback && (
        <div className="bg-amber-950/60 border border-amber-500/50 text-amber-200 px-4 py-3 rounded-lg text-xs flex items-center gap-2 animate-fadeIn shadow-lg">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{simulatedFeedback}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all shrink-0 whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rules Grid (Left) & Selected Rule Code Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rule List (6 cols) */}
        <div className="lg:col-span-6 space-y-3 h-[680px] overflow-y-auto pr-1">
          {filteredRules.map((rule) => {
            const isSelected = selectedRule?.id === rule.id;
            const isCritical = rule.severity === 'CRITICAL';
            return (
              <div
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRule(rule.id);
                      }}
                      className="text-cyan-400 hover:text-cyan-300"
                      title={rule.enabled ? 'Disable Detection' : 'Enable Detection'}
                    >
                      {rule.enabled ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-600" />
                      )}
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-300">{rule.id}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {rule.severity} ({rule.riskScore})
                    </span>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-white mb-1.5 leading-snug">
                  {rule.name}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                  {rule.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-500 font-mono">{rule.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">Triggers: {rule.triggerCount}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulate(rule);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 font-bold text-[10px] transition-all"
                    >
                      <Play className="w-3 h-3" />
                      <span>Simulate Alert</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Rule Code Inspector (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 h-[680px] overflow-y-auto">
          {selectedRule ? (
            <>
              <div className="border-b border-slate-800 pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                    {selectedRule.id} • {selectedRule.category}
                  </span>
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    selectedRule.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    Risk Score: {selectedRule.riskScore}/100
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">
                  {selectedRule.name}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  {selectedRule.description}
                </p>
              </div>

              {/* MITRE ATT&CK Mapping */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mapped MITRE ATT&CK Techniques</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRule.mitreTechniques.map((tech, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Query Language Inspector Tabs */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Rule Query Representation</span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                    {(['spl', 'sigma', 'kql', 'cql'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveCodeTab(tab)}
                        className={`px-2.5 py-1 rounded uppercase font-mono text-[11px] font-bold transition-all ${
                          activeCodeTab === tab
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab === 'spl' ? 'Splunk SPL' : tab === 'sigma' ? 'Sigma' : tab === 'kql' ? 'KQL' : 'CQL'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Query Display */}
                <pre className="p-3.5 rounded-lg bg-slate-900/90 text-cyan-300 font-mono text-xs overflow-x-auto max-h-[220px] border border-slate-800/80 leading-relaxed">
                  {activeCodeTab === 'spl' && selectedRule.splQuery}
                  {activeCodeTab === 'sigma' && selectedRule.sigmaRule}
                  {activeCodeTab === 'kql' && selectedRule.kqlQuery}
                  {activeCodeTab === 'cql' && selectedRule.cqlQuery}
                </pre>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Status: {selectedRule.enabled ? 'ACTIVE IN SIEM' : 'DISABLED'}
                  </span>
                  <button
                    onClick={() => handleSimulate(selectedRule)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Simulate Live Event Trigger</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Select a detection rule to view queries and simulate alerts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
