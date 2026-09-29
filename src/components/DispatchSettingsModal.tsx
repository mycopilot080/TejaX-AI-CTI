import React, { useState, useEffect } from 'react';
import { DailyBriefingReport } from '../types/cti';
import { Mail, Clock, Send, Sparkles, X, CheckCircle2, AlertTriangle, FileText, History, ExternalLink, LayoutTemplate } from 'lucide-react';
import { DailyThreatReportTemplate } from './DailyThreatReportTemplate';
import DOMPurify from 'dompurify';

interface DispatchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DispatchSettingsModal: React.FC<DispatchSettingsModalProps> = ({ isOpen, onClose }) => {
  const [recipientEmail, setRecipientEmail] = useState<string>('sharath.skt55@gmail.com');
  const [scheduledUtcTime, setScheduledUtcTime] = useState<string>('08:00 UTC');
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<any | null>(null);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState<boolean>(false);

  // Fetch dispatch history
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/dispatch-history');
      const data = await res.json();
      if (data.success) {
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Test Dispatch Alert Email
  const handleDispatchTestAlert = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dispatch-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          incidentTitle: 'Critical LSASS Memory Dump & Ransomware Shadow Purge',
          severity: 'CRITICAL',
          riskScore: 95,
          affectedHost: 'DC-GLOBAL-01.enterprise.local'
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveFeedback(`Critical Threat Alert dispatched successfully to ${recipientEmail}!`);
        fetchHistory();
      }
    } catch (e: any) {
      setActiveFeedback(`Dispatch failed: ${e.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setActiveFeedback(null), 4000);
    }
  };

  // Generate & Dispatch 24-Hour Briefing via Gemini AI
  const handleGenerateBriefing = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dispatch-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          scheduledTimeUtc: scheduledUtcTime
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveFeedback(`24-Hour Executive Briefing compiled and dispatched to ${recipientEmail}!`);
        fetchHistory();
      }
    } catch (e: any) {
      setActiveFeedback(`Briefing dispatch failed: ${e.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setActiveFeedback(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Alert Notification & Daily Briefing Dispatch Engine</span>
              </h3>
              <p className="text-xs text-slate-400">Automated dispatch configuration routed to primary analyst email.</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold">
            ✕
          </button>
        </div>

        {activeFeedback && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{activeFeedback}</span>
          </div>
        )}

        {/* Dispatch Settings Form */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-bold">Designated Analyst Email Address</label>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span>Select Contact Roster:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) setRecipientEmail(e.target.value);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-cyan-300 text-[10px] focus:outline-none focus:border-cyan-500 font-mono"
                  defaultValue=""
                >
                  <option value="" disabled>-- Quick Contact Select --</option>
                  <option value="sharath.skt55@gmail.com">Sharath Kumar (Lead SOC Manager)</option>
                  <option value="sysadmin@enterprise.com">Elena Rostova (Lead IAM Admin)</option>
                  <option value="ciso-office@enterprise.com">Marcus Vance (CISO)</option>
                  <option value="cloud-devsec@enterprise.com">Chen Wei (DevOps SecOps Lead)</option>
                  <option value="ot-sec@enterprise.com">David O'Connor (OT Security Lead)</option>
                  <option value="db-sec@enterprise.com">Aisha Patel (Lead DBA)</option>
                  <option value="finance-it@enterprise.com">Financial Systems SecOps Team</option>
                  <option value="dfir-tier2@enterprise.com">Sarah Jenkins (DFIR Lead)</option>
                </select>
              </div>
            </div>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Critical threats (Risk Score &gt;= 90) automatically route HTML alerts to this address.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Daily Briefing Scheduled Time</label>
              <select
                value={scheduledUtcTime}
                onChange={(e) => setScheduledUtcTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="08:00 UTC">08:00 UTC (Morning SOC Shift)</option>
                <option value="16:00 UTC">16:00 UTC (Midday SOC Briefing)</option>
                <option value="00:00 UTC">00:00 UTC (Midnight Handover)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Dispatch Trigger Mode</label>
              <span className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold block">
                AUTOMATIC & MANUAL
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleDispatchTestAlert}
              disabled={isLoading}
              className="w-full sm:w-1/3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs hover:bg-rose-500/30 transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Test Critical Alert Email</span>
            </button>

            <button
              onClick={() => setShowTemplateBuilder(!showTemplateBuilder)}
              className="w-full sm:w-1/3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs hover:bg-slate-700 transition-all"
            >
              <LayoutTemplate className="w-4 h-4 text-cyan-400" />
              <span>{showTemplateBuilder ? 'Hide Template Builder' : '24h Notification Template'}</span>
            </button>

            <button
              onClick={handleGenerateBriefing}
              disabled={isLoading}
              className="w-full sm:w-1/3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Generate 24h Briefing (Gemini)</span>
            </button>
          </div>
        </div>

        {/* Template Builder Section */}
        {showTemplateBuilder && (
          <div className="pt-2">
            <DailyThreatReportTemplate defaultEmail={recipientEmail} onClose={() => setShowTemplateBuilder(false)} />
          </div>
        )}

        {/* Dispatch History Log */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dispatch History & Email Logs ({history.length})</span>
          </h4>

          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {history.map((rec, idx) => (
              <div
                key={rec.id || idx}
                onClick={() => setSelectedPreview(rec)}
                className="bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {rec.id}
                    </span>
                    <span className="text-slate-200 font-bold">
                      {rec.incidentTitle || rec.executiveSummary?.slice(0, 45) || 'Daily Briefing Report'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Recipient: {rec.recipientEmail} • Sent: {new Date(rec.dispatchTimestamp).toLocaleString()}
                  </span>
                </div>

                <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Email HTML Preview Modal / Drawer */}
        {selectedPreview && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-300">HTML Dispatch Email Preview ({selectedPreview.id})</span>
              <button onClick={() => setSelectedPreview(null)} className="text-slate-400 hover:text-white text-xs font-bold">
                Close Preview
              </button>
            </div>

            {selectedPreview.htmlPreview ? (
              <div
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedPreview.htmlPreview) }}
                className="rounded-lg overflow-hidden border border-slate-800"
              />
            ) : (
              <div className="p-3 bg-slate-900 rounded text-slate-300 text-xs font-mono space-y-1">
                <p><strong>Executive Summary:</strong> {selectedPreview.executiveSummary}</p>
                <p><strong>Top CVEs:</strong> {selectedPreview.topCriticalCVEs?.join(', ')}</p>
                <p><strong>Threat Actors:</strong> {selectedPreview.activeThreatActors?.join(', ')}</p>
                <p><strong>SLA Compliance Rate:</strong> {selectedPreview.slaComplianceRate}%</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
