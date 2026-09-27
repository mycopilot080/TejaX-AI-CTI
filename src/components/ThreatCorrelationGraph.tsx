import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Share2, RefreshCw, ZoomIn, ZoomOut, Info, Shield, Target, Cpu } from 'lucide-react';

interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  group: 'actor' | 'malware' | 'cve';
  details: string;
  severity?: string;
  val?: number;
}

interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: string | NodeData;
  target: string | NodeData;
  relationship: string;
}

export const ThreatCorrelationGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [filterGroup, setFilterGroup] = useState<string>('ALL');

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll('*').remove();

    const width = svgRef.current.clientWidth || 800;
    const height = 540;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .attr('width', '100%')
      .attr('height', '100%');

    // Add zoom behavior
    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Nodes and Links Dataset
    const nodes: NodeData[] = [
      // Threat Actors
      { id: 'actor-1', name: 'Volt Typhoon', group: 'actor', details: 'State-sponsored APT focusing on critical infrastructure OT tunneling.' },
      { id: 'actor-2', name: 'LockBit 4.0', group: 'actor', details: 'Ransomware-as-a-service affiliate network targeting healthcare & finance.' },
      { id: 'actor-3', name: 'Scattered Spider', group: 'actor', details: 'Extortion syndicate specializing in OAuth consent abuse and social engineering.' },
      { id: 'actor-4', name: 'APT29 (Cozy Bear)', group: 'actor', details: 'Advanced espionage group targeting diplomatic and cloud identities.' },
      { id: 'actor-5', name: 'Lazarus Group', group: 'actor', details: 'Financial threat group utilizing supply-chain and crypto exploits.' },

      // Malware Families
      { id: 'mal-1', name: 'Cobalt Strike', group: 'malware', details: 'Commercial adversary simulation framework widely used for C2 beaconing.' },
      { id: 'mal-2', name: 'Mimikatz', group: 'malware', details: 'Credential dumper extracting plaintext passwords and Kerberos tickets.' },
      { id: 'mal-3', name: 'Stealc Info-Stealer', group: 'malware', details: 'Malicious info-stealer targeting browser sessions and crypto wallets.' },
      { id: 'mal-4', name: 'BlackCat / ALPHV', group: 'malware', details: 'Rust-based ransomware encryptor with advanced evasion capabilities.' },
      { id: 'mal-5', name: 'PlugX RAT', group: 'malware', details: 'Modular remote access trojan used for persistent backdoor access.' },

      // Targeted CVEs
      { id: 'cve-1', name: 'CVE-2026-9901', group: 'cve', details: 'Critical RCE in enterprise identity broker (CVSS 9.8)', severity: 'CRITICAL' },
      { id: 'cve-2', name: 'CVE-2023-23397', group: 'cve', details: 'Outlook Privilege Escalation / NTLM theft zero-day', severity: 'CRITICAL' },
      { id: 'cve-3', name: 'CVE-2024-3094', group: 'cve', details: 'XZ Utils malicious backdoor supply chain injection', severity: 'CRITICAL' },
      { id: 'cve-4', name: 'CVE-2023-38831', group: 'cve', details: 'WinRAR Archive code execution vulnerability', severity: 'HIGH' },
      { id: 'cve-5', name: 'CVE-2024-21412', group: 'cve', details: 'Windows SmartScreen bypass zero-day exploit', severity: 'HIGH' }
    ];

    const links: LinkData[] = [
      { source: 'actor-1', target: 'mal-1', relationship: 'Deploys C2' },
      { source: 'actor-1', target: 'cve-1', relationship: 'Exploits' },
      { source: 'actor-2', target: 'mal-4', relationship: 'Deploys Ransomware' },
      { source: 'actor-2', target: 'cve-2', relationship: 'Exploits' },
      { source: 'actor-3', target: 'mal-3', relationship: 'Disseminates' },
      { source: 'actor-3', target: 'cve-5', relationship: 'Exploits' },
      { source: 'actor-4', target: 'mal-1', relationship: 'Utilizes' },
      { source: 'actor-4', target: 'cve-3', relationship: 'Targeted Supply Chain' },
      { source: 'actor-5', target: 'mal-5', relationship: 'Deploys RAT' },
      { source: 'actor-5', target: 'cve-3', relationship: 'Compromises' },
      { source: 'mal-1', target: 'cve-1', relationship: 'Triggered via' },
      { source: 'mal-3', target: 'cve-5', relationship: 'Leverages' },
      { source: 'mal-2', target: 'cve-2', relationship: 'Post-Exploitation' }
    ];

    const filteredNodes = filterGroup === 'ALL' ? nodes : nodes.filter(n => n.group === filterGroup || (n.group === 'cve' && filterGroup === 'cve'));
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = links.filter(l => {
      const sId = typeof l.source === 'object' ? (l.source as NodeData).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as NodeData).id : l.target;
      return filteredNodeIds.has(sId) && filteredNodeIds.has(tId);
    });

    // Force Simulation
    const simulation = d3.forceSimulation(filteredNodes)
      .force('link', d3.forceLink<NodeData, LinkData>(filteredLinks).id(d => d.id).distance(110))
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(35));

    // Draw Links
    const link = g.append('g')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('stroke-width', 1.5);

    // Draw Link Labels (Relationship)
    const linkText = g.append('g')
      .selectAll('text')
      .data(filteredLinks)
      .join('text')
      .attr('class', 'text-[9px] font-mono fill-slate-500 pointer-events-none')
      .text(d => d.relationship);

    // Draw Node Groups
    const node = g.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .join('g')
      .call(d3.drag<any, NodeData>()
        .on('start', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('click', (event, d) => {
        setSelectedNode(d);
      });

    // Node Circles
    node.append('circle')
      .attr('r', d => d.group === 'actor' ? 24 : d.group === 'malware' ? 20 : 18)
      .attr('fill', d => d.group === 'actor' ? '#f43f5e' : d.group === 'malware' ? '#3b82f6' : '#a855f7')
      .attr('stroke', '#090d16')
      .attr('stroke-width', 2.5)
      .attr('class', 'cursor-pointer hover:opacity-80 transition-all shadow-xl');

    // Node Icons / Labels inside circle
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('class', 'text-[10px] font-bold fill-white pointer-events-none')
      .text(d => d.group === 'actor' ? 'ACT' : d.group === 'malware' ? 'MAL' : 'CVE');

    // Node Name Labels below circle
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 34)
      .attr('class', 'text-[11px] font-mono font-bold fill-slate-200 pointer-events-none drop-shadow-md')
      .text(d => d.name);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NodeData).x || 0)
        .attr('y1', d => (d.source as NodeData).y || 0)
        .attr('x2', d => (d.target as NodeData).x || 0)
        .attr('y2', d => (d.target as NodeData).y || 0);

      linkText
        .attr('x', d => ((d.source as NodeData).x! + (d.target as NodeData).x!) / 2)
        .attr('y', d => ((d.source as NodeData).y! + (d.target as NodeData).y!) / 2);

      node
        .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

  }, [filterGroup]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Share2 className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Threat Intelligence Correlation Graph (D3 Force-Directed)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                LIVE TOPOLOGY
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Interactive network graph visualizing correlations between Threat Actors (<span className="text-rose-400 font-bold">Red</span>), Malware Families (<span className="text-blue-400 font-bold">Blue</span>), and Targeted CVEs (<span className="text-purple-400 font-bold">Purple</span>). Drag nodes or click for details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterGroup('ALL')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${filterGroup === 'ALL' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              All Nodes
            </button>
            <button
              onClick={() => setFilterGroup('actor')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${filterGroup === 'actor' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Actors
            </button>
            <button
              onClick={() => setFilterGroup('malware')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${filterGroup === 'malware' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Malware
            </button>
            <button
              onClick={() => setFilterGroup('cve')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${filterGroup === 'cve' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              CVEs
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[540px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 flex items-center gap-4 text-xs font-mono shadow-xl pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-slate-300">Threat Actors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-300">Malware</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-slate-300">Targeted CVEs</span>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl p-4 shadow-2xl space-y-3 z-30 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${selectedNode.group === 'actor' ? 'bg-rose-500' : selectedNode.group === 'malware' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                <h4 className="font-bold text-white text-xs uppercase font-mono">{selectedNode.group} Node</h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-1.5 font-mono">
              <div className="text-sm font-bold text-cyan-300">{selectedNode.name}</div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedNode.details}</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Node ID: {selectedNode.id}</span>
              <span className="text-cyan-400 font-bold">Correlated Active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
