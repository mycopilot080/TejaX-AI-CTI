import React, { useState } from 'react';
import { Globe, Crosshair, MapPin, Zap, Shield, AlertTriangle, Activity, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';

interface AttackerOrigin {
  id: string;
  country: string;
  city: string;
  ip: string;
  threatActor: string;
  targetAsset: string;
  targetIp: string;
  attackVector: string;
  riskScore: number;
  coordinates: { x: number; y: number }; // SVG map coordinates
  targetCoordinates: { x: number; y: number };
}

interface AssetNode {
  id: string;
  name: string;
  location: string;
  ip: string;
  tier: string;
  coordinates: { x: number; y: number };
}

export const GeospatialThreatMap: React.FC = () => {
  const [selectedThreat, setSelectedThreat] = useState<AttackerOrigin | null>(null);
  const [activeSubnetFilter, setActiveTab] = useState<'map' | 'heatmap'>('map');
  const [firewallActionMessage, setFirewallActionMessage] = useState<string | null>(null);

  const assetNodes: AssetNode[] = [
    {
      id: 'NYC-DC',
      name: 'DC-GLOBAL-01 (Active Directory)',
      location: 'New York, USA',
      ip: '10.0.4.12',
      tier: 'Tier 1 Critical',
      coordinates: { x: 220, y: 130 }
    },
    {
      id: 'LON-PROXY',
      name: 'OKTA-TENANT-PROXY (Identity)',
      location: 'London, UK',
      ip: '198.51.100.41',
      tier: 'Tier 1 Critical',
      coordinates: { x: 440, y: 100 }
    },
    {
      id: 'FRA-FIN',
      name: 'FINANCE-WS-09 (Finance LAN)',
      location: 'Frankfurt, Germany',
      ip: '192.168.1.104',
      tier: 'Tier 2 High',
      coordinates: { x: 470, y: 110 }
    },
    {
      id: 'TYO-OT',
      name: 'FW-CORE-01 (OT SCADA Grid)',
      location: 'Tokyo, Japan',
      ip: '10.100.2.14',
      tier: 'Tier 1 Critical',
      coordinates: { x: 780, y: 150 }
    }
  ];

  const attackerOrigins: AttackerOrigin[] = [
    {
      id: 'THREAT-RU',
      country: 'Russia',
      city: 'Moscow',
      ip: '185.220.101.5',
      threatActor: 'APT28 (Fancy Bear)',
      targetAsset: 'DC-GLOBAL-01',
      targetIp: '10.0.4.12',
      attackVector: 'LSASS Process Handle Buffer Overflow',
      riskScore: 98,
      coordinates: { x: 530, y: 95 },
      targetCoordinates: { x: 220, y: 130 }
    },
    {
      id: 'THREAT-KP',
      country: 'North Korea',
      city: 'Pyongyang',
      ip: '175.45.176.8',
      threatActor: 'Lazarus Group',
      targetAsset: 'DC-GLOBAL-01',
      targetIp: '10.0.4.12',
      attackVector: 'Credential Dumping & Kerberos Spray',
      riskScore: 92,
      coordinates: { x: 750, y: 140 },
      targetCoordinates: { x: 220, y: 130 }
    },
    {
      id: 'THREAT-CN',
      country: 'China',
      city: 'Zhengzhou',
      ip: '202.108.22.5',
      threatActor: 'Volt Typhoon (BRONZE SILHOUETTE)',
      targetAsset: 'FW-CORE-01',
      targetIp: '10.100.2.14',
      attackVector: 'Cisco ASA SSL VPN LotL SSH Tunnel',
      riskScore: 88,
      coordinates: { x: 710, y: 160 },
      targetCoordinates: { x: 780, y: 150 }
    },
    {
      id: 'THREAT-NL',
      country: 'Netherlands',
      city: 'Amsterdam Proxy',
      ip: '45.154.255.82',
      threatActor: 'Scattered Spider (UNC3944)',
      targetAsset: 'OKTA-TENANT-PROXY',
      targetIp: '198.51.100.41',
      attackVector: 'OAuth Token Hijacking Consent Abuse',
      riskScore: 91,
      coordinates: { x: 450, y: 95 },
      targetCoordinates: { x: 440, y: 100 }
    },
    {
      id: 'THREAT-RO',
      country: 'Romania',
      city: 'Bucharest',
      ip: '185.220.101.88',
      threatActor: 'LockBit Ransomware Affiliates',
      targetAsset: 'FINANCE-WS-09',
      targetIp: '192.168.1.104',
      attackVector: 'vssadmin Shadow Copy Purge',
      riskScore: 96,
      coordinates: { x: 500, y: 110 },
      targetCoordinates: { x: 470, y: 110 }
    }
  ];

  // Network Subnet Heatmap Grid Data
  const subnets = [
    { name: '10.0.4.0/24 (Identity AD Core)', tier: 'Tier 1' },
    { name: '192.168.1.0/24 (Finance LAN)', tier: 'Tier 2' },
    { name: '198.51.100.0/24 (Cloud Okta)', tier: 'Tier 1' },
    { name: '10.100.2.0/24 (OT SCADA Grid)', tier: 'Tier 1' },
    { name: '45.154.255.0/24 (AWS CloudTrail)', tier: 'Tier 1' }
  ];

  const attackCategories = [
    'LSASS Dump',
    'Shadow Copy Purge',
    'OAuth Consent Abuse',
    'OT SSH Tunnel',
    'CloudTrail Disable'
  ];

  // Intensity matrix lookup
  const heatmapValues: Record<string, Record<string, { count: number; level: number }>> = {
    '10.0.4.0/24 (Identity AD Core)': {
      'LSASS Dump': { count: 42, level: 4 },
      'Shadow Copy Purge': { count: 8, level: 2 },
      'OAuth Consent Abuse': { count: 3, level: 1 },
      'OT SSH Tunnel': { count: 0, level: 0 },
      'CloudTrail Disable': { count: 1, level: 1 }
    },
    '192.168.1.0/24 (Finance LAN)': {
      'LSASS Dump': { count: 12, level: 2 },
      'Shadow Copy Purge': { count: 28, level: 4 },
      'OAuth Consent Abuse': { count: 2, level: 1 },
      'OT SSH Tunnel': { count: 0, level: 0 },
      'CloudTrail Disable': { count: 0, level: 0 }
    },
    '198.51.100.0/24 (Cloud Okta)': {
      'LSASS Dump': { count: 0, level: 0 },
      'Shadow Copy Purge': { count: 0, level: 0 },
      'OAuth Consent Abuse': { count: 24, level: 4 },
      'OT SSH Tunnel': { count: 1, level: 1 },
      'CloudTrail Disable': { count: 5, level: 2 }
    },
    '10.100.2.0/24 (OT SCADA Grid)': {
      'LSASS Dump': { count: 0, level: 0 },
      'Shadow Copy Purge': { count: 2, level: 1 },
      'OAuth Consent Abuse': { count: 0, level: 0 },
      'OT SSH Tunnel': { count: 18, level: 4 },
      'CloudTrail Disable': { count: 0, level: 0 }
    },
    '45.154.255.0/24 (AWS CloudTrail)': {
      'LSASS Dump': { count: 0, level: 0 },
      'Shadow Copy Purge': { count: 0, level: 0 },
      'OAuth Consent Abuse': { count: 6, level: 2 },
      'OT SSH Tunnel': { count: 0, level: 0 },
      'CloudTrail Disable': { count: 14, level: 4 }
    }
  };

  const handleDispatchFirewallRule = (ip: string) => {
    setFirewallActionMessage(`Dispatched Automated Edge ACL Rule: Blocked Attacker IP ${ip} on Core Firewalls.`);
    setTimeout(() => setFirewallActionMessage(null), 4000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Globe className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Geospatial Threat Map & Subnet Attack Heatmap</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                5 Active Attacker Origins
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live threat vector arcs mapping active adversary origin points against enterprise asset targets.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
              activeSubnetFilter === 'map' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Geospatial Threat Map
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
              activeSubnetFilter === 'heatmap' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Subnet Threat Heatmap Grid
          </button>
        </div>
      </div>

      {firewallActionMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-xs flex items-center gap-2 shadow-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{firewallActionMessage}</span>
        </div>
      )}

      {/* VIEW 1: GEOSPATIAL THREAT MAP */}
      {activeSubnetFilter === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Vector Canvas (8 cols) */}
          <div className="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between min-h-[420px]">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2 z-10">
              <span className="flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                <span>ACTIVE THREAT TRAJECTORY ARCS</span>
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
                  <span>Attacker Origin</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                  <span>Target Company Asset</span>
                </span>
              </div>
            </div>

            {/* SVG Interactive Map */}
            <div className="relative w-full h-[340px] flex items-center justify-center">
              <svg viewBox="0 0 900 240" className="w-full h-full select-none">
                {/* Background Grid Lines */}
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                  <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.8} />
                  </linearGradient>
                </defs>

                <rect width="100%" height="100%" fill="url(#grid)" opacity="0.6" />

                {/* Stylized World Continents Landmass Shapes */}
                {/* North America */}
                <path d="M 120,50 Q 180,40 240,70 Q 220,120 160,110 Q 100,80 120,50 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                {/* South America */}
                <path d="M 230,130 Q 270,140 250,210 Q 210,180 230,130 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                {/* Europe */}
                <path d="M 420,50 Q 510,40 520,90 Q 450,110 420,50 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                {/* Africa */}
                <path d="M 430,110 Q 520,110 500,190 Q 420,160 430,110 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                {/* Asia */}
                <path d="M 530,40 Q 750,30 820,100 Q 700,160 530,100 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                {/* Australia */}
                <path d="M 720,170 Q 800,170 780,220 Q 710,210 720,170 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />

                {/* Trajectory Arcs from Attackers to Targets */}
                {attackerOrigins.map((orig) => {
                  const startX = orig.coordinates.x;
                  const startY = orig.coordinates.y;
                  const endX = orig.targetCoordinates.x;
                  const endY = orig.targetCoordinates.y;
                  const midX = (startX + endX) / 2;
                  const midY = Math.min(startY, endY) - 35; // Curve control point

                  const isSelected = selectedThreat?.id === orig.id;

                  return (
                    <g key={orig.id}>
                      <path
                        d={`M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`}
                        fill="none"
                        stroke={isSelected ? '#f43f5e' : 'url(#arcGradient)'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        strokeDasharray={isSelected ? 'none' : '4,4'}
                        className="transition-all"
                      />
                      {/* Animated Pulse Particle Along Arc */}
                      <circle r="3" fill="#f43f5e">
                        <animateMotion
                          path={`M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`}
                          dur={`${Math.floor(Math.random() * 2 + 2)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}

                {/* Target Company Asset Nodes (Cyan) */}
                {assetNodes.map((ast) => (
                  <g key={ast.id} transform={`translate(${ast.coordinates.x}, ${ast.coordinates.y})`}>
                    <circle r="8" fill="#0284c7" opacity="0.3" className="animate-ping" />
                    <circle r="5" fill="#38bdf8" stroke="#f0f9ff" strokeWidth="1.5" />
                    <text x="8" y="3" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      {ast.id}
                    </text>
                  </g>
                ))}

                {/* Attacker Origin Nodes (Crimson) */}
                {attackerOrigins.map((orig) => {
                  const isSelected = selectedThreat?.id === orig.id;
                  return (
                    <g
                      key={orig.id}
                      transform={`translate(${orig.coordinates.x}, ${orig.coordinates.y})`}
                      onClick={() => setSelectedThreat(orig)}
                      className="cursor-pointer"
                    >
                      <circle r={isSelected ? '12' : '8'} fill="#f43f5e" opacity="0.4" className="animate-pulse" />
                      <circle r={isSelected ? '6' : '4'} fill="#f43f5e" stroke="#fff" strokeWidth="1.5" />
                      <text x="8" y="3" fill="#fca5a5" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        {orig.country} ({orig.threatActor.split(' ')[0]})
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2 z-10">
              <span>Click on any threat origin marker to inspect threat actor details.</span>
              <span className="text-cyan-400">Target Assets: 4 Global Gateways</span>
            </div>
          </div>

          {/* Selected Threat Detail Inspector (4 cols) */}
          <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-rose-400" />
              <span>Attacker Origin Inspector</span>
            </h4>

            {selectedThreat ? (
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    RISK SCORE: {selectedThreat.riskScore}/100
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{selectedThreat.country}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Attacker Origin IP & City:</span>
                  <span className="font-bold text-rose-300 font-mono text-sm block mt-0.5">
                    {selectedThreat.ip} ({selectedThreat.city}, {selectedThreat.country})
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Attributed Threat Actor:</span>
                  <span className="font-bold text-amber-300 font-mono block mt-0.5">
                    {selectedThreat.threatActor}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Targeted Company Asset:</span>
                  <span className="font-bold text-cyan-300 font-mono block mt-0.5">
                    {selectedThreat.targetAsset} ({selectedThreat.targetIp})
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Active Attack Vector:</span>
                  <span className="text-slate-200 block mt-0.5 bg-slate-900 p-2 rounded border border-slate-800 font-mono text-[11px]">
                    {selectedThreat.attackVector}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => handleDispatchFirewallRule(selectedThreat.ip)}
                    className="w-full py-2 px-3 rounded-lg bg-rose-500 text-slate-950 font-bold text-xs hover:bg-rose-400 transition-all shadow-md shadow-rose-500/20"
                  >
                    Block Attacker IP on Edge Firewalls
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-56 text-slate-500 text-xs text-center space-y-2">
                <Globe className="w-8 h-8 text-slate-700 animate-pulse" />
                <p>Click on any threat origin node on the map above to inspect adversary details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SUBNET THREAT HEATMAP GRID */}
      {activeSubnetFilter === 'heatmap' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-300">Enterprise Subnet vs Attack Vector Heatmap Matrix</span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-800 rounded"></span> None (0)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded"></span> Medium (1-10)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded"></span> High (11-20)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-500 rounded"></span> Critical (20+)</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950 p-4">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="py-3 px-4 text-slate-400 font-bold">Subnet / Environment</th>
                  {attackCategories.map((cat, idx) => (
                    <th key={idx} className="py-3 px-4 text-slate-300 font-bold text-center">
                      {cat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {subnets.map((s, sIdx) => (
                  <tr key={sIdx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-200 font-bold">
                      <div>{s.name}</div>
                      <span className="text-[10px] text-cyan-400">{s.tier}</span>
                    </td>
                    {attackCategories.map((cat, cIdx) => {
                      const data = heatmapValues[s.name]?.[cat] || { count: 0, level: 0 };
                      const bgClass =
                        data.level === 4
                          ? 'bg-rose-500/80 text-rose-950 font-extrabold border border-rose-400 shadow-md shadow-rose-500/20'
                          : data.level === 3
                          ? 'bg-amber-500/80 text-amber-950 font-bold border border-amber-400'
                          : data.level === 2
                          ? 'bg-blue-600/60 text-blue-100 font-bold border border-blue-500'
                          : data.level === 1
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-slate-900/40 text-slate-600';

                      return (
                        <td key={cIdx} className="py-3 px-4 text-center">
                          <div
                            className={`py-2 px-3 rounded-lg text-xs transition-all ${bgClass}`}
                            title={`${cat} on ${s.name}: ${data.count} Events`}
                          >
                            {data.count}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Attacker Origin Summary Table */}
      <div className="pt-2 border-t border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>Top Adversary Origin Metrics Summary</span>
          <span className="text-cyan-400 font-mono text-[11px]">Real-Time Ingestion</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {attackerOrigins.slice(0, 3).map((orig) => (
            <div key={orig.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">{orig.country} ({orig.ip})</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{orig.threatActor}</span>
              </div>
              <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                Risk {orig.riskScore}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
