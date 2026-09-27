import React, { useState, useEffect } from 'react';
import { HECToken } from '../types/cti';
import { Database, Plus, Copy, Play, Activity, Terminal, CheckCircle2, RefreshCw, Key, ArrowUpRight } from 'lucide-react';

export const HECCollector: React.FC = () => {
  const [tokens, setTokens] = useState<HECToken[]>([
    {
      id: 'HEC-01',
      name: 'CrowdStrike Falcon Stream',
      token: 'hec-cs-88a19200-410a-4981-b102-392019840192',
      index: 'endpoint_logs',
      sourcetype: 'crowdstrike:falcon',
      status: 'ACTIVE',
      eventsReceived: 142090,
      bytesReceived: 42910000,
      createdAt: '2026-09-01T08:00:00Z'
    },
    {
      id: 'HEC-02',
      name: 'Palo Alto Network Gateway',
      token: 'hec-pan-9011abfe-3311-4890-aa11-881290319201',
      index: 'netlogs',
      sourcetype: 'pan:firewall',
      status: 'ACTIVE',
      eventsReceived: 89120,
      bytesReceived: 21800000,
      createdAt: '2026-09-10T12:00:00Z'
    }
  ]);

  const [selectedToken, setSelectedToken] = useState<HECToken>(tokens[0]);
  const [testPayload, setTestPayload] = useState<string>(
    JSON.stringify(
      {
        event: {
          action: 'user_login',
          user: 's_admin',
          src_ip: '10.0.4.12',
          host: 'DC-GLOBAL-01',
          status: 'SUCCESS'
        },
        sourcetype: 'sysmon',
        index: 'winlogs'
      },
      null,
      2
    )
  );
  const [ingestLogStream, setIngestLogStream] = useState<string[]>([]);
  const [eventsPerSec, setEventsPerSec] = useState<number>(1240);
  const [throughputKb, setThroughputKb] = useState<number>(340);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);

  // Generate new token
  const handleCreateToken = () => {
    const newToken: HECToken = {
      id: `HEC-0${tokens.length + 1}`,
      name: `Custom App Collector ${tokens.length + 1}`,
      token: `hec-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 10)}`,
      index: 'main',
      sourcetype: 'custom:json',
      status: 'ACTIVE',
      eventsReceived: 0,
      bytesReceived: 0,
      createdAt: new Date().toISOString()
    };
    setTokens([...tokens, newToken]);
    setSelectedToken(newToken);
  };

  // Simulate payload POST via curl tester
  const handleTestIngest = () => {
    const timeStr = new Date().toISOString();
    const logEntry = `[HTTP/1.1 200 OK] Token: ${selectedToken.token.slice(0, 16)}... | Ingested event at ${timeStr}`;
    setIngestLogStream((prev) => [logEntry, ...prev]);

    setSelectedToken((prev) => ({
      ...prev,
      eventsReceived: prev.eventsReceived + 1,
      bytesReceived: prev.bytesReceived + testPayload.length
    }));
  };

  const curlCommand = `curl -k -H "Authorization: Splunk ${selectedToken.token}" \\
  -d '${testPayload.replace(/\n/g, '')}' \\
  https://splunk-hec.enterprise.local:8088/services/collector/event`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Splunk HTTP Event Collector (HEC) Simulator</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                HEC PORT 8088 READY
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              High-throughput HTTP Event Collector token management, raw event payload ingest testing, and telemetry metrics.
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateToken}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-sm shadow-cyan-500/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New HEC Token</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Live Ingestion Rate</span>
          <div className="text-xl font-bold font-mono text-cyan-400 flex items-center gap-2">
            <span>{eventsPerSec} EPS</span>
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <span className="text-[10px] text-slate-500">Events per second across active tokens</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Ingestion Throughput</span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {throughputKb} KB/s
          </div>
          <span className="text-[10px] text-slate-500">Raw network throughput stream</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Ingested Events</span>
          <div className="text-xl font-bold font-mono text-slate-200">
            {tokens.reduce((a, b) => a + b.eventsReceived, 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">Persisted to indexed SIEM storage</span>
        </div>
      </div>

      {/* Main Grid: Token List (Left) & CURL Ingest Tester (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* HEC Tokens (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active HEC Tokens ({tokens.length})</span>
          </h3>

          <div className="space-y-2.5">
            {tokens.map((tok) => {
              const isSelected = selectedToken.id === tok.id;
              return (
                <div
                  key={tok.id}
                  onClick={() => setSelectedToken(tok)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{tok.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {tok.status}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800 my-2 truncate">
                    {tok.token}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Index: {tok.index}</span>
                    <span>Sourcetype: {tok.sourcetype}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CURL Tester & Log Console (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive CURL Ingest Execution Tester</span>
            </h3>

            <button
              onClick={copyCurl}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700 transition-all"
            >
              <Copy className="w-3 h-3 text-cyan-400" />
              <span>{copiedMessage ? 'Copied CURL!' : 'Copy CURL'}</span>
            </button>
          </div>

          {/* CURL command view */}
          <pre className="p-3.5 rounded-lg bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
            {curlCommand}
          </pre>

          {/* Test JSON Payload */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">HTTP Event JSON Payload</label>
            <textarea
              rows={6}
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 font-mono">
              Endpoint: https://splunk:8088/services/collector/event
            </span>
            <button
              onClick={handleTestIngest}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Execute Ingest Event Test</span>
            </button>
          </div>

          {/* Ingest Stream Log */}
          {ingestLogStream.length > 0 && (
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 max-h-[160px] overflow-y-auto font-mono text-xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Live HEC Ingest Log</span>
              {ingestLogStream.map((log, idx) => (
                <div key={idx} className="text-emerald-400 text-[11px]">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
