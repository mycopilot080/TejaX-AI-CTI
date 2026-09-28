import React, { useState, useEffect } from 'react';
import { NotableIncident } from '../types/cti';
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Cpu, 
  User, 
  Play, 
  ChevronRight, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles, 
  X, 
  FileSearch,
  Plus,
  Trash2,
  Database,
  Terminal,
  Server,
  RefreshCw
} from 'lucide-react';

interface IncidentReviewProps {
  incidents: NotableIncident[];
  onUpdateStatus: (id: string, status: NotableIncident['status']) => void;
  onAddNote: (incidentId: string, noteText: string) => void;
  onCreateTicket?: (newTicket: NotableIncident) => void;
  onDeleteTicket?: (ticketId: string) => void;
}

export const IncidentReview: React.FC<IncidentReviewProps> = ({
  incidents,
  onUpdateStatus,
  onAddNote,
  onCreateTicket,
  onDeleteTicket
}) => {
  const [selectedIncident, setSelectedIncident] = useState<NotableIncident | null>(incidents[0] || null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [newNoteInput, setNewNoteInput] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State for New Ticket Creation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [ticketTitle, setTicketTitle] = useState<string>('');
  const [ticketSeverity, setTicketSeverity] = useState<NotableIncident['severity']>('CRITICAL');
  const [ticketRiskScore, setTicketRiskScore] = useState<number>(92);
  const [ticketHost, setTicketHost] = useState<string>('FINANCE-DB-02');
  const [ticketUser, setTicketUser] = useState<string>('GLOBAL\\svc_database');
  const [ticketSourceIp, setTicketSourceIp] = useState<string>('185.220.101.45');
  const [ticketTechnique, setTicketTechnique] = useState<string>('T1003.001 - OS Credential Dumping');
  const [ticketDescription, setTicketDescription] = useState<string>('Suspicious process injection into LSASS memory space detected by endpoint EDR sensor.');
  const [ticketSlaMinutes, setTicketSlaMinutes] = useState<number>(15);
  const [ticketAnalyst, setTicketAnalyst] = useState<string>('sharath.skt55@gmail.com');

  // Sync selected incident if current gets deleted or list updates
  useEffect(() => {
    if (selectedIncident && !incidents.find(i => i.id === selectedIncident.id)) {
      setSelectedIncident(incidents[0] || null);
    } else if (!selectedIncident && incidents.length > 0) {
      setSelectedIncident(incidents[0]);
    }
  }, [incidents, selectedIncident]);

  // Live SLA Timer component
  const SLATimer: React.FC<{ startTimeIso: string; targetMinutes: number }> = ({ startTimeIso, targetMinutes }) => {
    const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

    useEffect(() => {
      const calculate = () => {
        const elapsedSeconds = Math.floor((Date.now() - new Date(startTimeIso).getTime()) / 1000);
        const targetSeconds = targetMinutes * 60;
        setSecondsRemaining(targetSeconds - elapsedSeconds);
      };
      calculate();
      const interval = setInterval(calculate, 1000);
      return () => clearInterval(interval);
    }, [startTimeIso, targetMinutes]);

    const isBreached = secondsRemaining <= 0;
    const mins = Math.floor(Math.abs(secondsRemaining) / 60);
    const secs = Math.abs(secondsRemaining) % 60;
    const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
        isBreached
          ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
          : secondsRemaining < 300
          ? 'bg-amber-950 text-amber-300 border border-amber-800'
          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
      }`}>
        <Clock className="w-3.5 h-3.5" />
        <span>{isBreached ? `SLA BREACHED (+${display})` : `SLA: ${display}`}</span>
      </div>
    );
  };

  const handleNoteSubmit = () => {
    if (!selectedIncident || !newNoteInput.trim()) return;
    onAddNote(selectedIncident.id, newNoteInput.trim());
    setNewNoteInput('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim()) return;

    const newTicket: NotableIncident = {
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: ticketTitle.trim(),
      severity: ticketSeverity,
      riskScore: ticketRiskScore,
      status: 'NEW',
      slaTargetMinutes: ticketSlaMinutes,
      slaStartTime: new Date().toISOString(),
      assignedAnalyst: ticketAnalyst,
      affectedHost: ticketHost.trim() || 'HOST-UNKNOWN-01',
      affectedUser: ticketUser.trim() || 'GLOBAL\\analyst',
      sourceIp: ticketSourceIp.trim() || '10.0.0.1',
      mitreTechnique: ticketTechnique,
      detectionRuleId: `DET-SOC-${Math.floor(100 + Math.random() * 900)}`,
      description: ticketDescription.trim(),
      rawEventsCount: 1,
      analystNotes: [
        {
          timestamp: new Date().toISOString(),
          author: ticketAnalyst,
          text: 'Ticket manually filed into Firebase Firestore notable incident queue.'
        }
      ],
      aiHypothesis: `Suspicious activity registered for ${ticketHost}. Automated triage initiated.`
    };

    if (onCreateTicket) {
      onCreateTicket(newTicket);
    }
    setSelectedIncident(newTicket);
    setActionFeedback(`Created Incident Ticket ${newTicket.id} & saved to Firebase Firestore!`);
    setIsCreateModalOpen(false);
    setTicketTitle('');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleDeleteCurrentTicket = () => {
    if (!selectedIncident) return;
    if (window.confirm(`Are you sure you want to permanently delete ticket ${selectedIncident.id} from Firestore?`)) {
      if (onDeleteTicket) {
        onDeleteTicket(selectedIncident.id);
      }
      setActionFeedback(`Deleted ticket ${selectedIncident.id} from Firebase Firestore.`);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filterStatus === 'ALL') return true;
    return inc.status === filterStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Incident Review & Notable Events Dashboard</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800/60">
                P1 15-Min SLA Active
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Firebase Firestore Backend ({incidents.length} Tickets)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Active notable security events stored in Firestore collection: <span className="font-mono text-cyan-400">incident_tickets</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Status Filters */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Incident Ticket</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'NEW', 'IN_PROGRESS', 'MITIGATED', 'CLOSED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-xs flex items-center gap-2 shadow-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3 h-[680px] overflow-y-auto pr-1">
          {filteredIncidents.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              No incident tickets matching filter "{filterStatus}".
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-950/30 border-rose-500/60 shadow-md shadow-rose-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {inc.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inc.status === 'NEW'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : inc.status === 'IN_PROGRESS'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {inc.status}
                      </span>
                    </div>

                    <SLATimer startTimeIso={inc.slaStartTime} targetMinutes={inc.slaTargetMinutes} />
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1.5 leading-snug">
                    {inc.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {inc.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800/80 text-slate-400">
                    <span className="text-cyan-400 font-bold">Asset: {inc.affectedHost}</span>
                    <span className="text-slate-400">Risk: {inc.riskScore}/100</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Incident Deep-Dive Forensics Drawer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 h-[680px] overflow-y-auto">
          {selectedIncident ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-800 pb-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      {selectedIncident.id} • {selectedIncident.severity}
                    </span>
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300">
                      Risk Score: {selectedIncident.riskScore}/100
                    </span>
                  </div>

                  {/* Status Dropdown & Delete Button */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <select
                      value={selectedIncident.status}
                      onChange={(e) => onUpdateStatus(selectedIncident.id, e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                    >
                      <option value="NEW">NEW</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="MITIGATED">MITIGATED</option>
                      <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>

                    {onDeleteTicket && (
                      <button
                        onClick={handleDeleteCurrentTicket}
                        title="Delete Ticket from Firestore"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white">
                  {selectedIncident.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Asset Details Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Affected Asset / Host:</span>
                  <span className="font-semibold text-cyan-300 font-mono mt-0.5 block truncate">
                    {selectedIncident.affectedHost}
                  </span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">User Account:</span>
                  <span className="font-semibold text-slate-200 font-mono mt-0.5 block truncate">
                    {selectedIncident.affectedUser}
                  </span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">MITRE Technique:</span>
                  <span className="font-semibold text-amber-300 font-mono mt-0.5 block truncate">
                    {selectedIncident.mitreTechnique}
                  </span>
                </div>
              </div>

              {/* Gemini AI Threat Hypothesis */}
              <div className="bg-cyan-950/20 border border-cyan-800/50 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Gemini AI Root Cause Forensic Hypothesis</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedIncident.aiHypothesis ||
                    `High-confidence match for APT28 / Lazarus TTPs. The compromised host ${selectedIncident.affectedHost} exhibited unauthorized LSASS handle access (0x1010) followed by shadow copy deletion scripts. Immediate host network isolation recommended.`}
                </p>
              </div>

              {/* Analyst Notes Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Analyst Investigation Log ({selectedIncident.analystNotes.length})</span>
                </h4>

                <div className="space-y-2 max-h-[140px] overflow-y-auto">
                  {selectedIncident.analystNotes.map((note, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                        <span className="text-cyan-400 font-bold">{note.author}</span>
                        <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-300">{note.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Note Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add forensic notes or hypothesis updates..."
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNoteSubmit()}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleNoteSubmit}
                    className="px-3.5 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all cursor-pointer"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Select an incident from the list to review deep-dive forensics and execute SOAR playbooks.
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW INCIDENT TICKET MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Create SOC Incident Ticket</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Firestore Storage
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">File a new security event directly into Firebase Firestore</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Incident Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical LSASS Memory Injection via Mimikatz"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Severity</label>
                  <select
                    value={ticketSeverity}
                    onChange={(e) => setTicketSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">CRITICAL (P1)</option>
                    <option value="HIGH">HIGH (P2)</option>
                    <option value="MEDIUM">MEDIUM (P3)</option>
                    <option value="LOW">LOW (P4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Risk Score (1 - 100)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={ticketRiskScore}
                    onChange={(e) => setTicketRiskScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Affected Host / Asset</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DC-GLOBAL-01"
                    value={ticketHost}
                    onChange={(e) => setTicketHost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Affected User</label>
                  <input
                    type="text"
                    placeholder="e.g. GLOBAL\s_admin"
                    value={ticketUser}
                    onChange={(e) => setTicketUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Source IP Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 185.220.101.45"
                    value={ticketSourceIp}
                    onChange={(e) => setTicketSourceIp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">SLA Target (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    value={ticketSlaMinutes}
                    onChange={(e) => setTicketSlaMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">MITRE ATT&CK Technique</label>
                <input
                  type="text"
                  placeholder="e.g. T1003.001 - OS Credential Dumping"
                  value={ticketTechnique}
                  onChange={(e) => setTicketTechnique(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description / Incident Scope</label>
                <textarea
                  rows={3}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Provide forensic context, process names, and containment objectives..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <Database className="w-4 h-4" />
                  <span>Save Ticket to Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
