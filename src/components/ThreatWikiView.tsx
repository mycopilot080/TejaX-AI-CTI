import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Download,
  ExternalLink,
  Copy,
  Plus,
  X,
  Layers,
  Terminal,
  Code2,
  Database,
  Sparkles,
  Globe,
  Building,
  Crosshair,
  Activity,
  FileText,
  Check,
  ChevronRight,
  Grid,
  List,
  Flame,
  FileCode,
  Tag,
  Clock,
  User,
  Hash,
  ArrowUpRight
} from 'lucide-react';
import {
  INITIAL_WIKI_ARTICLES,
  ThreatWikiArticle,
  WikiCategory,
  WikiSeverity,
  WikiIOC,
  WikiMitreTechnique
} from '../data/mockThreatWiki';
import { ActiveTab } from './SidebarNavigation';

interface ThreatWikiViewProps {
  onNavigateTab?: (tab: ActiveTab) => void;
  onNavigateToSIEM?: (query: string) => void;
  onNavigateToHunting?: (technique: string) => void;
}

export const ThreatWikiView: React.FC<ThreatWikiViewProps> = ({
  onNavigateTab,
  onNavigateToSIEM,
  onNavigateToHunting
}) => {
  // Articles state with localStorage persistence
  const [articles, setArticles] = useState<ThreatWikiArticle[]>(() => {
    const saved = localStorage.getItem('tejax_threat_wiki_articles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved threat wiki articles', e);
      }
    }
    return INITIAL_WIKI_ARTICLES;
  });

  // Bookmarks state with localStorage persistence
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('tejax_threat_wiki_bookmarks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }
    return ['WIKI-ACT-001', 'WIKI-TTP-001', 'WIKI-CVE-001'];
  });

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'matrix' | 'iocs'>('cards');

  // Selected Article for Dossier Modal/Drawer
  const [selectedArticle, setSelectedArticle] = useState<ThreatWikiArticle | null>(null);
  const [activeDossierTab, setActiveDossierTab] = useState<'overview' | 'technical' | 'mitre' | 'iocs' | 'detection' | 'mitigation'>('overview');

  // Interactive Checklist state for mitigation items
  const [verifiedMitigations, setVerifiedMitigations] = useState<Record<string, boolean>>({});

  // Add Article Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<WikiCategory>('actor');
  const [newSeverity, setNewSeverity] = useState<WikiSeverity>('HIGH');
  const [newRiskScore, setNewRiskScore] = useState<number>(85);
  const [newAliases, setNewAliases] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newTargetSectors, setNewTargetSectors] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newTechnicalDetails, setNewTechnicalDetails] = useState('');
  const [newIocValues, setNewIocValues] = useState('');
  const [newSplQuery, setNewSplQuery] = useState('');
  const [newMitigationNotes, setNewMitigationNotes] = useState('');

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, key: string, label?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(label ? `Copied ${label} to clipboard!` : 'Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('tejax_threat_wiki_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  // Save articles to localStorage on change
  useEffect(() => {
    localStorage.setItem('tejax_threat_wiki_articles', JSON.stringify(articles));
  }, [articles]);

  // Filtered articles logic
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.aliases.some((a) => a.toLowerCase().includes(q)) ||
        art.tags.some((t) => t.toLowerCase().includes(q)) ||
        (art.origin && art.origin.toLowerCase().includes(q)) ||
        art.mitreTechniques.some((m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)) ||
        art.iocs.some((i) => i.value.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
      const matchesSev = selectedSeverity === 'all' || art.severity === selectedSeverity;
      const matchesInd =
        selectedIndustry === 'all' ||
        art.targetSectors.some((sec) => sec.toLowerCase().includes(selectedIndustry.toLowerCase()));
      const matchesBookmark = !onlyBookmarks || bookmarkedIds.includes(art.id);

      return matchesSearch && matchesCat && matchesSev && matchesInd && matchesBookmark;
    });
  }, [articles, searchQuery, selectedCategory, selectedSeverity, selectedIndustry, onlyBookmarks, bookmarkedIds]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = articles.length;
    const actors = articles.filter((a) => a.category === 'actor').length;
    const malware = articles.filter((a) => a.category === 'malware').length;
    const ttps = articles.filter((a) => a.category === 'ttp').length;
    const cves = articles.filter((a) => a.category === 'cve').length;
    const frameworks = articles.filter((a) => a.category === 'framework' || a.category === 'tool').length;
    const criticals = articles.filter((a) => a.severity === 'CRITICAL').length;
    const totalIocs = articles.reduce((acc, a) => acc + a.iocs.length, 0);
    return { total, actors, malware, ttps, cves, frameworks, criticals, totalIocs };
  }, [articles]);

  // All IOCs flat catalog
  const allIocs = useMemo(() => {
    const list: { articleId: string; articleTitle: string; ioc: WikiIOC }[] = [];
    articles.forEach((art) => {
      art.iocs.forEach((ioc) => {
        list.push({
          articleId: art.id,
          articleTitle: art.title,
          ioc
        });
      });
    });
    return list;
  }, [articles]);

  // Export full catalog as JSON
  const handleExportFullJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(articles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Tejax_Threat_Wiki_Catalog_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported complete Threat Wiki intelligence catalog as JSON.');
  };

  // Export single article as Markdown
  const handleExportArticleMarkdown = (art: ThreatWikiArticle) => {
    let md = `# Threat Wiki Intelligence Dossier: ${art.title}\n\n`;
    md += `**Category:** ${art.category.toUpperCase()} | **Severity:** ${art.severity} | **Risk Score:** ${art.riskScore}/100\n`;
    md += `**Author:** ${art.author} | **Version:** ${art.version} | **Last Updated:** ${art.lastUpdated}\n\n`;
    if (art.aliases.length > 0) md += `**Aliases:** ${art.aliases.join(', ')}\n\n`;
    if (art.origin) md += `**Attribution / Origin:** ${art.origin}\n\n`;
    if (art.motivation) md += `**Motivation:** ${art.motivation}\n\n`;
    if (art.targetSectors.length > 0) md += `**Targeted Sectors:** ${art.targetSectors.join(', ')}\n\n`;
    md += `## Executive Summary\n${art.summary}\n\n`;
    md += `## Technical Details\n`;
    art.technicalDetails.forEach((line) => {
      md += `- ${line}\n`;
    });
    md += `\n## MITRE ATT&CK Mappings\n`;
    art.mitreTechniques.forEach((m) => {
      md += `- **${m.id}** (${m.name}) - Tactic: ${m.tactic}\n`;
    });
    md += `\n## Indicators of Compromise (IOCs)\n`;
    art.iocs.forEach((i) => {
      md += `- \`[${i.type}]\` ${i.value} (${i.description})\n`;
    });
    if (art.detectionQueries.spl) {
      md += `\n## Detection Queries\n### Splunk SPL\n\`\`\`spl\n${art.detectionQueries.spl}\n\`\`\`\n`;
    }
    if (art.detectionQueries.sigma) {
      md += `### Sigma YAML Rule\n\`\`\`yaml\n${art.detectionQueries.sigma}\n\`\`\`\n`;
    }
    md += `\n## Recommended Mitigations\n`;
    art.mitigations.forEach((mit) => {
      md += `- [ ] ${mit}\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ThreatWiki_${art.id}_${art.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Exported ${art.title} as Markdown.`);
  };

  // Add custom article submission handler
  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please provide a title for the Threat Wiki article.');
      return;
    }

    const createdArticle: ThreatWikiArticle = {
      id: `WIKI-CUSTOM-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      category: newCategory,
      severity: newSeverity,
      riskScore: Number(newRiskScore) || 80,
      lastUpdated: new Date().toISOString(),
      author: 'Tejax SOC Analyst',
      version: '1.0',
      aliases: newAliases.split(',').map((s) => s.trim()).filter(Boolean),
      tags: newTags.split(',').map((s) => s.trim()).filter(Boolean),
      origin: newOrigin.trim() || undefined,
      targetSectors: newTargetSectors.split(',').map((s) => s.trim()).filter(Boolean),
      summary: newSummary.trim() || 'Custom Threat Intelligence Wiki Article documented by SOC analyst.',
      technicalDetails: newTechnicalDetails.split('\n').map((s) => s.trim()).filter(Boolean),
      mitreTechniques: [
        { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access' }
      ],
      iocs: newIocValues
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((val) => ({
          type: val.includes('.') && !val.includes('/') ? 'IP' : val.length === 64 ? 'HASH_SHA256' : 'DOMAIN',
          value: val,
          description: 'Documented observable IOC',
          confidence: 'HIGH'
        })),
      detectionQueries: {
        spl: newSplQuery.trim() || `index=sec_endpoint sourcetype=sysmon | stats count by host, process_name`
      },
      mitigations: newMitigationNotes.split('\n').map((s) => s.trim()).filter(Boolean),
      references: [{ title: 'Tejax Internal SOC Incident Analysis', source: 'SOC Internal' }],
      relatedArticleIds: []
    };

    setArticles((prev) => [createdArticle, ...prev]);
    setIsAddModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewAliases('');
    setNewTags('');
    setNewOrigin('');
    setNewTargetSectors('');
    setNewSummary('');
    setNewTechnicalDetails('');
    setNewIocValues('');
    setNewSplQuery('');
    setNewMitigationNotes('');
    showToast(`Created Threat Wiki Article: "${createdArticle.title}"`);
    setSelectedArticle(createdArticle);
  };

  const getCategoryBadge = (cat: WikiCategory) => {
    switch (cat) {
      case 'actor':
        return { label: 'Threat Actor (APT)', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/40', icon: Crosshair };
      case 'malware':
        return { label: 'Malware / C2', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/40', icon: Flame };
      case 'ttp':
        return { label: 'MITRE ATT&CK', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/40', icon: Layers };
      case 'cve':
        return { label: 'Vulnerability (CVE)', bg: 'bg-red-500/15 text-red-300 border-red-500/40', icon: ShieldAlert };
      case 'framework':
        return { label: 'SOC Framework', bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40', icon: BookOpen };
      case 'tool':
        return { label: 'Defense Tooling', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', icon: Terminal };
      default:
        return { label: 'Intelligence', bg: 'bg-slate-500/15 text-slate-300 border-slate-500/40', icon: FileText };
    }
  };

  const getSeverityBadge = (sev: WikiSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-800/80';
      case 'HIGH':
        return 'bg-amber-950 text-amber-300 border-amber-800/80';
      case 'MEDIUM':
        return 'bg-blue-950 text-blue-300 border-blue-800/80';
      case 'INFORMATIONAL':
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Threat Wiki</span>
                  <span className="text-cyan-400 font-mono text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                    CTI ENCYCLOPEDIA
                  </span>
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  v4.8 SOC Standard
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REAL-TIME SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
                Centralized knowledgebase and adversary intelligence catalog for SOC operations. Comprehensive dossiers
                covering nation-state threat actors (APTs), weaponized malware families, active CVE zero-days, MITRE
                ATT&amp;CK techniques, and production-ready Splunk/Sigma detection signatures.
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Threat Entry</span>
            </button>
            <button
              onClick={handleExportFullJson}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Catalog JSON</span>
            </button>
          </div>
        </div>

        {/* Counter Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Entries</div>
            <div className="text-lg font-bold text-white mt-0.5 font-mono">{stats.total}</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono tracking-wider text-rose-400 flex items-center gap-1">
              <Crosshair className="w-3 h-3" />
              <span>Threat Actors</span>
            </div>
            <div className="text-lg font-bold text-rose-300 mt-0.5 font-mono">{stats.actors}</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono tracking-wider text-amber-400 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>Malware / C2</span>
            </div>
            <div className="text-lg font-bold text-amber-300 mt-0.5 font-mono">{stats.malware}</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono tracking-wider text-purple-400 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>MITRE TTPs</span>
            </div>
            <div className="text-lg font-bold text-purple-300 mt-0.5 font-mono">{stats.ttps}</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono tracking-wider text-red-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Active CVEs</span>
            </div>
            <div className="text-lg font-bold text-red-300 mt-0.5 font-mono">{stats.cves}</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span>Observable IOCs</span>
            </div>
            <div className="text-lg font-bold text-cyan-300 mt-0.5 font-mono">{stats.totalIocs}</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1">
              <Bookmark className="w-3 h-3" />
              <span>Pinned in SOC</span>
            </div>
            <div className="text-lg font-bold text-emerald-300 mt-0.5 font-mono">{bookmarkedIds.length}</div>
          </div>
        </div>
      </div>

      {/* Filter and View Switcher Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search threat wiki by actor, malware, CVE (e.g. CVE-2026-3912), technique (T1003), or IOC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="all">All Categories</option>
              <option value="actor">Threat Actors (APTs)</option>
              <option value="malware">Malware Families & C2</option>
              <option value="ttp">MITRE ATT&amp;CK TTPs</option>
              <option value="cve">Vulnerabilities (CVEs)</option>
              <option value="framework">SOC Concepts &amp; Standards</option>
              <option value="tool">Detection Tools &amp; Engines</option>
            </select>

            {/* Severity Select */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical (90+)</option>
              <option value="HIGH">High (70-89)</option>
              <option value="MEDIUM">Medium (40-69)</option>
              <option value="INFORMATIONAL">Informational</option>
            </select>

            {/* Industry Select */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="all">All Target Industries</option>
              <option value="Financial">Financial Services</option>
              <option value="Cloud">Technology &amp; Cloud</option>
              <option value="Energy">Energy &amp; OT</option>
              <option value="Defense">Defense &amp; Government</option>
              <option value="Healthcare">Healthcare</option>
            </select>

            {/* Bookmark Toggle */}
            <button
              onClick={() => setOnlyBookmarks(!onlyBookmarks)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                onlyBookmarks
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Pinned ({bookmarkedIds.length})</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('cards')}
                title="Card Grid View"
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'cards' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                title="MITRE ATT&CK Matrix View"
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'matrix' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('iocs')}
                title="Observable IOCs Directory"
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'iocs' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Hash className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Category Badges Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: `All Knowledge (${articles.length})` },
            { id: 'actor', label: `Threat Actors (${stats.actors})` },
            { id: 'malware', label: `Malware & C2 (${stats.malware})` },
            { id: 'ttp', label: `MITRE TTPs (${stats.ttps})` },
            { id: 'cve', label: `Active CVEs (${stats.cves})` },
            { id: 'framework', label: `Frameworks (${stats.frameworks})` }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW MODE 1: CARD GRID */}
      {viewMode === 'cards' && (
        <>
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <span className="text-white font-mono font-bold">{filteredArticles.length}</span> matching threat
              wiki articles
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <X className="w-3 h-3" /> Clear search filter
              </button>
            )}
          </div>

          {filteredArticles.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Threat Wiki Entries Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No intelligence articles match your filter criteria. Try adjusting your search query, category, or
                severity filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedSeverity('all');
                  setSelectedIndustry('all');
                  setOnlyBookmarks(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredArticles.map((art) => {
                const catMeta = getCategoryBadge(art.category);
                const CatIcon = catMeta.icon;
                const isPinned = bookmarkedIds.includes(art.id);

                return (
                  <div
                    key={art.id}
                    onClick={() => {
                      setSelectedArticle(art);
                      setActiveDossierTab('overview');
                    }}
                    className="group bg-slate-900 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top Ribbon & Pinned Status */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border flex items-center gap-1.5 ${catMeta.bg}`}
                          >
                            <CatIcon className="w-3 h-3" />
                            {catMeta.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border ${getSeverityBadge(
                              art.severity
                            )}`}
                          >
                            {art.severity}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Risk Score Pill */}
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                            Risk {art.riskScore}
                          </span>
                          {/* Bookmark Toggle */}
                          <button
                            onClick={(e) => toggleBookmark(art.id, e)}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-400 transition-colors"
                            title={isPinned ? 'Remove Pin' : 'Pin to SOC'}
                          >
                            <Bookmark
                              className={`w-4 h-4 ${isPinned ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Title & Aliases */}
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {art.title}
                        </h3>
                        {art.aliases.length > 0 && (
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 font-mono">
                            <span className="text-slate-500">aka: </span>
                            {art.aliases.slice(0, 3).join(', ')}
                            {art.aliases.length > 3 ? '...' : ''}
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-slate-300/90 line-clamp-3 leading-relaxed">{art.summary}</p>
                    </div>

                    {/* Footer metadata & actions */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                      {/* MITRE Tags preview */}
                      {art.mitreTechniques.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {art.mitreTechniques.slice(0, 3).map((m) => (
                            <span
                              key={m.id}
                              className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-950 text-cyan-300 border border-slate-800"
                            >
                              {m.id}
                            </span>
                          ))}
                          {art.mitreTechniques.length > 3 && (
                            <span className="text-[10px] font-mono text-slate-500">
                              +{art.mitreTechniques.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-cyan-400" />
                          <span>{art.iocs.length} IOCs</span>
                        </span>
                        <div className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                          <span>View Dossier</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* VIEW MODE 2: MITRE ATT&CK MATRIX */}
      {viewMode === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Enterprise MITRE ATT&amp;CK Matrix Mapping</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tactics and techniques cataloged across active threat actors, malware families, and critical CVEs. Click
                any technique to inspect its dossier.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
              MITRE v14 Enterprise
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 overflow-x-auto">
            {[
              {
                tactic: 'Initial Access',
                techniques: [
                  { id: 'T1190', name: 'Exploit Public-Facing App', severity: 'CRITICAL', articles: ['WIKI-CVE-001', 'WIKI-CVE-003', 'WIKI-ACT-003'] },
                  { id: 'T1566.002', name: 'Spearphishing Link', severity: 'HIGH', articles: ['WIKI-ACT-001', 'WIKI-ACT-004'] }
                ]
              },
              {
                tactic: 'Execution',
                techniques: [
                  { id: 'T1059.001', name: 'Command & Script: PowerShell', severity: 'CRITICAL', articles: ['WIKI-ACT-001', 'WIKI-TOOL-001'] },
                  { id: 'T1059.003', name: 'Command & Script: Windows CMD', severity: 'HIGH', articles: ['WIKI-ACT-003', 'WIKI-MAL-003'] }
                ]
              },
              {
                tactic: 'Defense Evasion',
                techniques: [
                  { id: 'T1574.002', name: 'DLL Side-Loading', severity: 'HIGH', articles: ['WIKI-ACT-001', 'WIKI-MAL-001'] },
                  { id: 'T1070', name: 'Living off the Land (LotL)', severity: 'CRITICAL', articles: ['WIKI-ACT-003'] },
                  { id: 'T1562.001', name: 'Disable Security Tools', severity: 'CRITICAL', articles: ['WIKI-ACT-002', 'WIKI-MAL-003'] }
                ]
              },
              {
                tactic: 'Credential Access',
                techniques: [
                  { id: 'T1003.001', name: 'OS Credential Dumping: LSASS', severity: 'CRITICAL', articles: ['WIKI-TTP-001', 'WIKI-MAL-002', 'WIKI-ACT-004'] },
                  { id: 'T1556', name: 'MFA Fatigue & Push Abuse', severity: 'CRITICAL', articles: ['WIKI-ACT-002'] },
                  { id: 'T1558.001', name: 'Kerberos Golden Ticket', severity: 'CRITICAL', articles: ['WIKI-MAL-002'] }
                ]
              },
              {
                tactic: 'Lateral Movement',
                techniques: [
                  { id: 'T1021.002', name: 'SMB / Admin Shares', severity: 'HIGH', articles: ['WIKI-MAL-001'] },
                  { id: 'T1021.004', name: 'SSH & VPN Tunneling', severity: 'CRITICAL', articles: ['WIKI-ACT-003', 'WIKI-CVE-003'] },
                  { id: 'T1550.002', name: 'Pass the Hash', severity: 'HIGH', articles: ['WIKI-MAL-002'] }
                ]
              },
              {
                tactic: 'Impact',
                techniques: [
                  { id: 'T1490', name: 'Inhibit System Recovery (VSS)', severity: 'CRITICAL', articles: ['WIKI-TTP-002', 'WIKI-MAL-003'] },
                  { id: 'T1486', name: 'Data Encrypted for Impact', severity: 'CRITICAL', articles: ['WIKI-MAL-003', 'WIKI-ACT-002'] }
                ]
              }
            ].map((col) => (
              <div key={col.tactic} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col space-y-2.5">
                <div className="text-[11px] font-bold font-mono text-cyan-400 border-b border-slate-800 pb-1.5 uppercase">
                  {col.tactic}
                </div>
                <div className="space-y-2 flex-1">
                  {col.techniques.map((tech) => (
                    <div
                      key={tech.id}
                      onClick={() => {
                        // find matching article or technique article
                        const match = articles.find((a) => a.mitreTechniques.some((m) => m.id === tech.id)) || articles[0];
                        setSelectedArticle(match);
                        setActiveDossierTab('mitre');
                      }}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] ${
                        tech.severity === 'CRITICAL'
                          ? 'bg-rose-950/40 border-rose-800/80 hover:border-rose-500'
                          : 'bg-amber-950/40 border-amber-800/80 hover:border-amber-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-white">{tech.id}</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-950 text-slate-300 border border-slate-800">
                          {tech.articles.length} actors
                        </span>
                      </div>
                      <div className="text-xs text-slate-200 mt-1 font-semibold line-clamp-2">{tech.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: ALL OBSERVABLE IOCS DIRECTORY */}
      {viewMode === 'iocs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />
                <span>Aggregated Threat IOC Directory</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {allIocs.length} Indicators
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized observables extracted from all wiki dossiers. Ready for bulk export or direct execution in
                Splunk SIEM.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const iocListText = allIocs.map((item) => `${item.ioc.type},${item.ioc.value},"${item.ioc.description}","${item.articleTitle}"`).join('\n');
                  const header = 'Type,IndicatorValue,Description,AssociatedThreat\n';
                  const blob = new Blob([header + iocListText], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ThreatWiki_IOC_Master_${new Date().toISOString().slice(0, 10)}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                  showToast('Downloaded Master IOC CSV file.');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export IOCs CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Observable Indicator Value</th>
                  <th className="py-2.5 px-3">Context / Description</th>
                  <th className="py-2.5 px-3">Associated Threat Dossier</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {allIocs.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-cyan-400 border border-slate-800">
                        {item.ioc.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200 select-all">{item.ioc.value}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-xs">{item.ioc.description}</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => {
                          const art = articles.find((a) => a.id === item.articleId);
                          if (art) {
                            setSelectedArticle(art);
                            setActiveDossierTab('iocs');
                          }
                        }}
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-sans font-medium text-xs"
                      >
                        <span>{item.articleTitle}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1 font-sans">
                      <button
                        onClick={() => copyToClipboard(item.ioc.value, `ioc-${idx}`, 'IOC Value')}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Copy Indicator"
                      >
                        {copiedKey === `ioc-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {onNavigateTab && (
                        <button
                          onClick={() => {
                            if (onNavigateToSIEM) {
                              onNavigateToSIEM(`index=* "${item.ioc.value}"`);
                            }
                            onNavigateTab('siem-console');
                          }}
                          className="px-2 py-0.5 text-[11px] font-semibold rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
                          title="Search in Splunk SIEM"
                        >
                          SIEM
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL DOSSIER DETAIL MODAL / DRAWER */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                      getCategoryBadge(selectedArticle.category).bg
                    }`}
                  >
                    {getCategoryBadge(selectedArticle.category).label}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getSeverityBadge(
                      selectedArticle.severity
                    )}`}
                  >
                    {selectedArticle.severity}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Risk Score: {selectedArticle.riskScore}/100
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    TLP:AMBER+STRICT
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{selectedArticle.title}</span>
                </h2>

                {selectedArticle.aliases.length > 0 && (
                  <div className="text-xs text-slate-400 font-mono">
                    <span className="text-slate-500">Known Aliases: </span>
                    {selectedArticle.aliases.join(' • ')}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(selectedArticle.id)}
                  className={`p-2 rounded-xl border transition-all ${
                    bookmarkedIds.includes(selectedArticle.id)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Bookmark"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      bookmarkedIds.includes(selectedArticle.id) ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>

                <button
                  onClick={() => handleExportArticleMarkdown(selectedArticle)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  title="Download Markdown Dossier"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Export MD</span>
                </button>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dossier Tabs Navigation */}
            <div className="bg-slate-950 border-b border-slate-800 px-5 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Executive Overview', icon: FileText },
                { id: 'technical', label: 'Technical Analysis', icon: Code2 },
                { id: 'mitre', label: `MITRE ATT&CK (${selectedArticle.mitreTechniques.length})`, icon: Layers },
                { id: 'iocs', label: `Observables & IOCs (${selectedArticle.iocs.length})`, icon: Hash },
                { id: 'detection', label: 'Detection Engineering', icon: Terminal },
                { id: 'mitigation', label: `Defenses (${selectedArticle.mitigations.length})`, icon: Shield }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeDossierTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDossierTab(tab.id as any)}
                    className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                      isActive
                        ? 'border-cyan-400 text-cyan-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dossier Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs">
              {/* TAB 1: OVERVIEW */}
              {activeDossierTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Box */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400">
                      Executive Intelligence Briefing
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-200 font-sans">{selectedArticle.summary}</p>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedArticle.origin && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                        <div className="text-[10px] font-mono uppercase text-slate-500">Origin / Attribution</div>
                        <div className="text-xs font-semibold text-white mt-1 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{selectedArticle.origin}</span>
                        </div>
                      </div>
                    )}

                    {selectedArticle.motivation && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                        <div className="text-[10px] font-mono uppercase text-slate-500">Primary Motivation</div>
                        <div className="text-xs font-semibold text-white mt-1 flex items-center gap-1.5">
                          <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                          <span>{selectedArticle.motivation}</span>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                      <div className="text-[10px] font-mono uppercase text-slate-500">Intelligence Source / Lab</div>
                      <div className="text-xs font-semibold text-white mt-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{selectedArticle.author}</span>
                      </div>
                    </div>
                  </div>

                  {/* Target Sectors */}
                  {selectedArticle.targetSectors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
                        Targeted Industry Sectors
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedArticle.targetSectors.map((sector) => (
                          <span
                            key={sector}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1.5"
                          >
                            <Building className="w-3 h-3 text-cyan-400" />
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* References */}
                  {selectedArticle.references.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
                        Source Authorities &amp; Advisory Citations
                      </h4>
                      <ul className="space-y-1.5 font-mono text-[11px]">
                        {selectedArticle.references.map((ref, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-slate-300">
                            <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="font-semibold text-white">{ref.title}</span>
                            <span className="text-slate-500">({ref.source})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TECHNICAL DETAILS */}
              {activeDossierTab === 'technical' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400 mb-3">
                      Adversary Tradecraft &amp; Technical Capabilities
                    </h4>
                    <div className="space-y-3 font-sans leading-relaxed text-slate-200">
                      {selectedArticle.technicalDetails.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                          <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center justify-center font-mono text-[11px] font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-slate-300 mt-0.5">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kill Chain Stage */}
                  {selectedArticle.killChainStage && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-slate-500">Lockheed Martin Cyber Kill Chain Stage</div>
                        <div className="text-xs font-bold text-white mt-0.5">{selectedArticle.killChainStage}</div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        ACTIVE STAGE
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MITRE ATT&CK */}
              {activeDossierTab === 'mitre' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-purple-400">
                      Mapped MITRE ATT&amp;CK Techniques
                    </h4>
                    {onNavigateTab && (
                      <button
                        onClick={() => {
                          if (onNavigateToHunting) {
                            onNavigateToHunting(selectedArticle.mitreTechniques[0]?.id || 'T1003');
                          }
                          onNavigateTab('threat-hunting-sandbox');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Hunt in Sigma Sandbox</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedArticle.mitreTechniques.map((tech) => (
                      <div
                        key={tech.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2 hover:border-purple-500/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-cyan-300 text-xs">{tech.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                            {tech.tactic}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">{tech.name}</div>
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>Enterprise ATT&amp;CK</span>
                          <button
                            onClick={() => {
                              copyToClipboard(tech.id, `tech-${tech.id}`, 'Technique ID');
                            }}
                            className="text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy ID</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: IOCS & OBSERVABLES */}
              {activeDossierTab === 'iocs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400">
                      Dossier Observable Indicators ({selectedArticle.iocs.length})
                    </h4>
                    <button
                      onClick={() => {
                        const values = selectedArticle.iocs.map((i) => i.value).join('\n');
                        copyToClipboard(values, 'all-article-iocs', 'All Indicators');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Copy All IOCs</span>
                    </button>
                  </div>

                  {selectedArticle.iocs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                      No atomic IOCs cataloged for this conceptual dossier.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedArticle.iocs.map((ioc, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-cyan-400 border border-slate-800">
                                {ioc.type}
                              </span>
                              <span className="text-xs font-bold text-white select-all">{ioc.value}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-sans">{ioc.description}</div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto font-sans">
                            <button
                              onClick={() => copyToClipboard(ioc.value, `dossier-ioc-${idx}`, 'IOC')}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
                            >
                              {copiedKey === `dossier-ioc-${idx}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>Copy</span>
                            </button>

                            {onNavigateTab && (
                              <button
                                onClick={() => {
                                  if (onNavigateToSIEM) {
                                    onNavigateToSIEM(`index=* "${ioc.value}"`);
                                  }
                                  onNavigateTab('siem-console');
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
                              >
                                Search SIEM
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: DETECTION ENGINEERING */}
              {activeDossierTab === 'detection' && (
                <div className="space-y-6">
                  {/* Splunk SPL Block */}
                  {selectedArticle.detectionQueries.spl && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                          <h4 className="text-xs font-bold font-mono uppercase text-white">Splunk SPL Detection Query</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              copyToClipboard(selectedArticle.detectionQueries.spl!, 'spl-query', 'Splunk SPL')
                            }
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 font-mono"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy SPL</span>
                          </button>
                          {onNavigateTab && (
                            <button
                              onClick={() => {
                                if (onNavigateToSIEM) {
                                  onNavigateToSIEM(selectedArticle.detectionQueries.spl!);
                                }
                                onNavigateTab('siem-console');
                              }}
                              className="px-3 py-1 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-mono shadow-sm flex items-center gap-1"
                            >
                              <Terminal className="w-3.5 h-3.5" />
                              <span>Execute in SIEM</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-200 overflow-x-auto selection:bg-cyan-500/30">
                        {selectedArticle.detectionQueries.spl}
                      </pre>
                    </div>
                  )}

                  {/* Sigma Rule Block */}
                  {selectedArticle.detectionQueries.sigma && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                          <h4 className="text-xs font-bold font-mono uppercase text-white">Sigma Generic Detection Rule</h4>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(selectedArticle.detectionQueries.sigma!, 'sigma-query', 'Sigma YAML')
                          }
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 font-mono"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Sigma</span>
                        </button>
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-purple-200 overflow-x-auto selection:bg-purple-500/30 whitespace-pre-wrap">
                        {selectedArticle.detectionQueries.sigma}
                      </pre>
                    </div>
                  )}

                  {/* Microsoft KQL Block */}
                  {selectedArticle.detectionQueries.kql && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                          <h4 className="text-xs font-bold font-mono uppercase text-white">Microsoft Sentinel KQL</h4>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(selectedArticle.detectionQueries.kql!, 'kql-query', 'Sentinel KQL')
                          }
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 font-mono"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy KQL</span>
                        </button>
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-blue-200 overflow-x-auto selection:bg-blue-500/30">
                        {selectedArticle.detectionQueries.kql}
                      </pre>
                    </div>
                  )}

                  {/* YARA Signature Block */}
                  {selectedArticle.detectionQueries.yara && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <h4 className="text-xs font-bold font-mono uppercase text-white">YARA Pattern Matching Rule</h4>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(selectedArticle.detectionQueries.yara!, 'yara-query', 'YARA Rule')
                          }
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 font-mono"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy YARA</span>
                        </button>
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-200 overflow-x-auto selection:bg-emerald-500/30 whitespace-pre-wrap">
                        {selectedArticle.detectionQueries.yara}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: MITIGATION & DEFENSES CHECKLIST */}
              {activeDossierTab === 'mitigation' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
                        Recommended SOC Defensive Controls &amp; Mitigations
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Interactive verification checklist for SOC hardening and posture remediation.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {selectedArticle.mitigations.map((mit, idx) => {
                      const key = `${selectedArticle.id}-mit-${idx}`;
                      const isChecked = !!verifiedMitigations[key];
                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            setVerifiedMitigations((prev) => ({
                              ...prev,
                              [key]: !prev[key]
                            }))
                          }
                          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                : 'border-slate-600 bg-slate-900'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="flex-1 text-xs leading-relaxed">
                            <span className={isChecked ? 'line-through text-slate-400' : ''}>{mit}</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              isChecked
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}
                          >
                            {isChecked ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Dossier Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>ID: {selectedArticle.id}</span>
                <span>•</span>
                <span>Version: {selectedArticle.version}</span>
                <span>•</span>
                <span>Updated: {new Date(selectedArticle.lastUpdated).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD THREAT WIKI ENTRY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Threat Wiki Intelligence Entry</h3>
                  <p className="text-xs text-slate-400">
                    Document a new adversary threat group, zero-day CVE, malware signature, or SOC detection.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Black Basta Ransomware Syndicate"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as WikiCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                  >
                    <option value="actor">Threat Actor (APT)</option>
                    <option value="malware">Malware Family &amp; C2</option>
                    <option value="ttp">MITRE ATT&amp;CK Technique</option>
                    <option value="cve">Vulnerability &amp; Zero-Day (CVE)</option>
                    <option value="framework">SOC Concept &amp; Standard</option>
                    <option value="tool">Security Tool &amp; Engine</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as WikiSeverity)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="INFORMATIONAL">Informational</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    Risk Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newRiskScore}
                    onChange={(e) => setNewRiskScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    Attribution / Origin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Russian-speaking Cybercrime Syndicate"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    Known Aliases (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UNC7799, Bitwise Gang"
                    value={newAliases}
                    onChange={(e) => setNewAliases(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    Target Sectors (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Healthcare, Defense, Finance"
                    value={newTargetSectors}
                    onChange={(e) => setNewTargetSectors(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                  Executive Intelligence Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Concise overview of the threat group, exploit, or malware family..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                  Technical Details (one observation per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Living-off-the-land techniques used...&#10;In-memory reflective injection mechanics...&#10;Egress C2 channel details..."
                  value={newTechnicalDetails}
                  onChange={(e) => setNewTechnicalDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    Observable IOCs (one IP, domain, or SHA256 per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="185.193.64.12&#10;c2.threat-node.com&#10;8a9c1e7f3b508f77e6d2bc4a51199cb502c3ef39c87893214878a9c8b74619d0"
                    value={newIocValues}
                    onChange={(e) => setNewIocValues(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    Splunk SPL Detection Query
                  </label>
                  <textarea
                    rows={3}
                    placeholder='index=sec_endpoint sourcetype=sysmon EventCode=1 Image="*\\payload.exe" | stats count by host'
                    value={newSplQuery}
                    onChange={(e) => setNewSplQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                  Defensive Mitigations (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Enforce multi-factor authentication with FIDO2 hardware keys&#10;Enable LSA RunAsPPL on all domain controllers"
                  value={newMitigationNotes}
                  onChange={(e) => setNewMitigationNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                >
                  Save to Threat Wiki
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
