import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Users, 
  Target, 
  ShieldAlert, 
  Search, 
  Filter, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { 
  fetchHistoricalActors, 
  fetchHistoricalCampaigns, 
  fetchHistoricalVulnerabilities,
  saveHistoricalActor,
  saveHistoricalCampaign,
  saveHistoricalVulnerability
} from '../lib/firebase';
import { HistoricalActor, HistoricalCampaign, HistoricalVulnerability } from '../types/cti';
import { useFirebase } from '../contexts/FirebaseContext';

export const HistoricalIntelligenceView: React.FC = () => {
  const { user } = useFirebase();
  const [activeTab, setActiveTab] = useState<'actors' | 'campaigns' | 'vulnerabilities'>('actors');
  const [loading, setLoading] = useState(true);
  
  const [actors, setActors] = useState<HistoricalActor[]>([]);
  const [campaigns, setCampaigns] = useState<HistoricalCampaign[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<HistoricalVulnerability[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [a, c, v] = await Promise.all([
          fetchHistoricalActors(),
          fetchHistoricalCampaigns(),
          fetchHistoricalVulnerabilities()
        ]);
        
        if (a.length === 0 && user) {
          // Seed initial historical data for the first time
          const initialActors: HistoricalActor[] = [
            {
              id: 'HIST-ACT-001',
              name: 'Lazarus Group',
              aliases: ['APT38', 'Hidden Cobra'],
              firstObserved: '2009-01-01T00:00:00Z',
              lastObserved: '2026-09-24T00:00:00Z',
              evolutionSummary: 'Evolved from simple DDoS attacks in 2009 to highly sophisticated financial theft and cryptocurrency heists by 2026. Known for the Sony Pictures hack (2014) and WannaCry (2017).',
              pastCampaignIds: ['HIST-CAMP-001', 'HIST-CAMP-002'],
              userId: user.uid
            },
            {
              id: 'HIST-ACT-002',
              name: 'APT28',
              aliases: ['Fancy Bear', 'Sofacy'],
              firstObserved: '2004-01-01T00:00:00Z',
              lastObserved: '2026-09-20T00:00:00Z',
              evolutionSummary: 'Active for over two decades, focusing on geopolitical espionage. Transitioned from malware-heavy attacks to leveraging zero-days and living-off-the-land techniques.',
              pastCampaignIds: ['HIST-CAMP-003'],
              userId: user.uid
            }
          ];
          
          const initialCampaigns: HistoricalCampaign[] = [
            {
              id: 'HIST-CAMP-001',
              title: 'Operation FastCash (2018-2020)',
              actorId: 'HIST-ACT-001',
              startDate: '2018-10-01T00:00:00Z',
              endDate: '2020-12-31T00:00:00Z',
              targetIndustries: ['Banking', 'Financial Services'],
              ttpsUsed: ['T1059.001', 'T1003.001'],
              outcome: 'Successful theft of tens of millions from ATMs globally.',
              userId: user.uid
            },
            {
              id: 'HIST-CAMP-002',
              title: 'Cryptocurrency Exchange Targeted Campaign (2024-2026)',
              actorId: 'HIST-ACT-001',
              startDate: '2024-03-01T00:00:00Z',
              targetIndustries: ['Cryptocurrency', 'Web3'],
              ttpsUsed: ['T1566.002', 'T1574.002'],
              outcome: 'Ongoing. Large scale extraction of digital assets.',
              userId: user.uid
            }
          ];

          const initialVulnerabilities: HistoricalVulnerability[] = [
            {
              cveId: 'CVE-2017-0144',
              firstDisclosed: '2017-03-14T00:00:00Z',
              exploitEvolution: ['EternalBlue leaked by Shadow Brokers', 'Integrated into WannaCry ransomware', 'Widespread use by APT actors for lateral movement'],
              patchAdoptionRate: 85.5,
              userId: user.uid
            }
          ];

          await Promise.all([
            ...initialActors.map(saveHistoricalActor),
            ...initialCampaigns.map(saveHistoricalCampaign),
            ...initialVulnerabilities.map(saveHistoricalVulnerability)
          ]);
          
          setActors(initialActors);
          setCampaigns(initialCampaigns);
          setVulnerabilities(initialVulnerabilities);
        } else {
          setActors(a);
          setCampaigns(c);
          setVulnerabilities(v);
        }
      } catch (error) {
        console.error("Failed to load historical data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === 'actors') {
      return actors.filter(a => a.name.toLowerCase().includes(q) || a.evolutionSummary.toLowerCase().includes(q) || a.aliases.some(al => al.toLowerCase().includes(q)));
    } else if (activeTab === 'campaigns') {
      return campaigns.filter(c => c.title.toLowerCase().includes(q) || c.outcome.toLowerCase().includes(q) || c.targetIndustries.some(i => i.toLowerCase().includes(q)));
    } else {
      return vulnerabilities.filter(v => v.cveId.toLowerCase().includes(q) || v.exploitEvolution.some(e => e.toLowerCase().includes(q)));
    }
  }, [activeTab, searchQuery, actors, campaigns, vulnerabilities]);

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Historical Intelligence Archives</h2>
            <p className="text-sm text-slate-400">Past campaigns, threat actor evolution, and vulnerability exploit history.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              placeholder="Search historical archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 w-full md:w-64 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20">
            <Database className="w-4 h-4" />
            <span>Sync Global DB</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-max">
        {[
          { id: 'actors', label: 'Threat Actors', icon: Users },
          { id: 'campaigns', label: 'Past Campaigns', icon: Target },
          { id: 'vulnerabilities', label: 'Vuln History', icon: ShieldAlert }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-mono text-slate-400 animate-pulse">Accessing historical intelligence records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'actors' && (filteredData as HistoricalActor[]).map(actor => (
            <div key={actor.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Threat Actor Profile</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {actor.pastCampaignIds.length} Campaigns
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{actor.name}</h3>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    aka: {actor.aliases.join(', ')}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>Observed: {new Date(actor.firstObserved).getFullYear()} — {new Date(actor.lastObserved).getFullYear()}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                    {actor.evolutionSummary}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] font-mono text-indigo-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Evolution Path Active</span>
                </div>
                <button className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                  <span>Full Archive</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {activeTab === 'campaigns' && (filteredData as HistoricalCampaign[]).map(campaign => (
            <div key={campaign.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Campaign Record</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${campaign.endDate ? 'bg-slate-800 text-slate-400' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                    {campaign.endDate ? 'Archived' : 'Active'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">{campaign.title}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Actor</span>
                      <span className="text-xs font-bold text-slate-300">{actors.find(a => a.id === campaign.actorId)?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Timeline</span>
                      <span className="text-xs font-bold text-slate-300">{new Date(campaign.startDate).toLocaleDateString()} — {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Present'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Target Sectors</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {campaign.targetIndustries.map(sector => (
                        <span key={sector} className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-slate-400 border border-slate-800">{sector}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Key Outcome</span>
                    <p className="text-xs text-slate-300 mt-1">{campaign.outcome}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {campaign.ttpsUsed.slice(0, 3).map(ttp => (
                    <span key={ttp} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/20">{ttp}</span>
                  ))}
                </div>
                <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-750 transition-all">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {activeTab === 'vulnerabilities' && (filteredData as HistoricalVulnerability[]).map(vuln => (
            <div key={vuln.cveId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-rose-500/50 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Vulnerability Context</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Disclosed: {new Date(vuln.firstDisclosed).getFullYear()}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">{vuln.cveId}</h3>
                  <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${vuln.patchAdoptionRate}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Patch Adoption</span>
                    <span className="text-[10px] font-mono font-bold text-rose-400">{vuln.patchAdoptionRate}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Exploit Evolution Timeline</span>
                  <div className="relative space-y-3 pl-4 border-l border-slate-800 ml-1">
                    {vuln.exploitEvolution.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-rose-500/50 ring-4 ring-slate-950"></div>
                        <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[10px] font-mono text-slate-500 italic">
                  Critical legacy threat vector
                </div>
                <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  <span>Analyze Impact</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredData.length === 0 && (
        <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-3xl p-16 text-center">
          <Database className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">No matching archives found</h3>
          <p className="text-sm text-slate-500 mt-1">Try broadening your search or switching categories.</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
