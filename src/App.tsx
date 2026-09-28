import React, { useState, useEffect } from 'react';
import { ActiveTab, SidebarNavigation } from './components/SidebarNavigation';
import { Header } from './components/Header';
import { CTIFeedCollector } from './components/CTIFeedCollector';
import { SplunkSIEMConsole } from './components/SplunkSIEMConsole';
import { DetectionCatalog } from './components/DetectionCatalog';
import { DetectionRuleLibrary } from './components/DetectionRuleLibrary';
import { IncidentReview } from './components/IncidentReview';
import { HECCollector } from './components/HECCollector';
import { ThreatAnalytics } from './components/ThreatAnalytics';
import { ThreatDashboard } from './components/ThreatDashboard';
import { ThreatReports } from './components/ThreatReports';
import { OnDemandReports } from './components/OnDemandReports';
import { VulnerabilityManagement } from './components/VulnerabilityManagement';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { DispatchSettingsModal } from './components/DispatchSettingsModal';
import { ThreatHuntingSandbox } from './components/ThreatHuntingSandbox';
import { OSINTIntelligenceView } from './components/OSINTIntelligenceView';
import { KPIMetricsView } from './components/KPIMetricsView';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { EnterprisePostureManagementView } from './components/EnterprisePostureManagementView';
import { ThreatHeatmapView } from './components/ThreatHeatmapView';
import { ThreatWikiView } from './components/ThreatWikiView';
import { LoginScreen } from './components/LoginScreen';
import { Search, ShieldAlert, Database, FileText } from 'lucide-react';

import { INITIAL_FEEDS } from './data/mockFeeds';
import { INITIAL_SIEM_LOGS } from './data/mockLogs';
import { INITIAL_DETECTION_RULES } from './data/mockDetectionRules';
import { INITIAL_ASSETS } from './data/mockAssets';
import { INITIAL_CONTACTS } from './data/mockContacts';
import { CTIAdvisory, SIEMLogEvent, DetectionRule, NotableIncident, Asset, Vulnerability } from './types/cti';
import { 
  subscribeThreatFeeds, 
  saveThreatFeedAdvisory, 
  saveAssetToFirestore, 
  saveContactToFirestore, 
  fetchAssetsOnce, 
  fetchContactsOnce,
  fetchThreatFeedsOnce,
  subscribeIncidentTickets,
  saveIncidentTicketToFirestore,
  deleteIncidentTicketFromFirestore,
  fetchIncidentTicketsOnce,
  subscribeDetectionRules,
  saveDetectionRuleToFirestore,
  deleteDetectionRuleFromFirestore,
  fetchDetectionRulesOnce
} from './lib/firebase';



export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('executive-dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('Sharath@Tejax.ai');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const [advisories, setAdvisories] = useState<CTIAdvisory[]>(INITIAL_FEEDS);
  const [siemLogs, setSiemLogs] = useState<SIEMLogEvent[]>(INITIAL_SIEM_LOGS);
  const [detectionRules, setDetectionRules] = useState<DetectionRule[]>(INITIAL_DETECTION_RULES);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  
  const [isFeedActive, setIsFeedActive] = useState<boolean>(true);
  const [feedRateMultiplier, setFeedRateMultiplier] = useState<number>(1);

  const [aiAssistantOpen, setAiAssistantOpen] = useState<boolean>(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState<boolean>(false);
  const [isCompactView, setIsCompactView] = useState<boolean>(false);
  const [vulnerabilityTab, setVulnerabilityTab] = useState<'correlation' | 'inventory' | 'contacts'>('correlation');

  // Notable Incidents State
  const [incidents, setIncidents] = useState<NotableIncident[]>([
    {
      id: 'INC-2026-901',
      title: 'Critical LSASS Memory Dumping Handle (Mimikatz sekurlsa)',
      severity: 'CRITICAL',
      riskScore: 95,
      status: 'NEW',
      slaTargetMinutes: 15,
      slaStartTime: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      assignedAnalyst: 'sharath.skt55@gmail.com',
      affectedHost: 'DC-GLOBAL-01',
      affectedUser: 'GLOBAL\\s_admin',
      sourceIp: '10.0.4.12',
      mitreTechnique: 'T1003.001 - OS Credential Dumping',
      detectionRuleId: 'DET-EP-001',
      description: 'System process lsass.exe accessed with GrantedAccess 0x1010 by unquoted binary mimikatz.exe.',
      rawEventsCount: 14,
      analystNotes: [
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
          author: 'System SOC Ingestion',
          text: 'Notable Event generated from Sysmon EventCode=10 detection rule DET-EP-001.'
        }
      ],
      aiHypothesis: 'High-confidence match for APT28 credential harvesting. The host DC-GLOBAL-01 requires immediate EDR host isolation.'
    },
    {
      id: 'INC-2026-812',
      title: 'LockBit 3.0 Volume Shadow Copy Purge Attempt',
      severity: 'CRITICAL',
      riskScore: 92,
      status: 'IN_PROGRESS',
      slaTargetMinutes: 15,
      slaStartTime: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
      assignedAnalyst: 'sharath.skt55@gmail.com',
      affectedHost: 'FINANCE-WS-09',
      affectedUser: 'GLOBAL\\m_chen',
      sourceIp: '192.168.1.104',
      mitreTechnique: 'T1490 - Inhibit System Recovery',
      detectionRuleId: 'DET-RANSOM-005',
      description: 'vssadmin.exe executed command "delete shadows /all /quiet" from PowerShell execution tree.',
      rawEventsCount: 8,
      analystNotes: [
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
          author: 'sharath.skt55@gmail.com',
          text: 'Initiated host quarantine playbook. Checking backup snapshots.'
        }
      ]
    }
  ]);

  // Firestore Realtime Subscription & Auto-seeding Initial Data
  useEffect(() => {
    // Seed initial contacts & assets to Firestore
    fetchAssetsOnce().then((dbAssets) => {
      if (!dbAssets || dbAssets.length === 0) {
        INITIAL_ASSETS.forEach((a) => saveAssetToFirestore(a));
      } else {
        setAssets(dbAssets);
      }
    });

    fetchContactsOnce().then((dbContacts) => {
      if (!dbContacts || dbContacts.length === 0) {
        INITIAL_CONTACTS.forEach((c) => saveContactToFirestore(c));
      }
    });

    // Subscribe to Firestore Threat Feeds Collection
    const unsubscribeFeeds = subscribeThreatFeeds((firestoreAdvisories) => {
      if (firestoreAdvisories && firestoreAdvisories.length > 0) {
        setAdvisories(firestoreAdvisories);
      } else {
        // Seed initial threat feeds to Firestore if collection is empty
        INITIAL_FEEDS.forEach((feed) => saveThreatFeedAdvisory(feed));
      }
    });

    // Subscribe to Firestore Incident Tickets Collection
    const unsubscribeTickets = subscribeIncidentTickets((firestoreTickets) => {
      if (firestoreTickets && firestoreTickets.length > 0) {
        setIncidents(firestoreTickets);
      } else {
        // Seed initial notable incidents tickets to Firestore
        incidents.forEach((ticket) => saveIncidentTicketToFirestore(ticket));
      }
    });

    // Subscribe to Firestore Detection Rules Collection
    const unsubscribeRules = subscribeDetectionRules((firestoreRules) => {
      if (firestoreRules && firestoreRules.length > 0) {
        setDetectionRules(firestoreRules);
      } else {
        // Seed initial detection rules to Firestore if collection is empty
        INITIAL_DETECTION_RULES.forEach((rule) => saveDetectionRuleToFirestore(rule));
      }
    });

    return () => {
      unsubscribeFeeds();
      unsubscribeTickets();
      unsubscribeRules();
    };
  }, []);

  // Live feed generator loop - writes generated feeds to Firestore
  useEffect(() => {
    if (!isFeedActive) return;

    const intervalTime = Math.max(10000 / feedRateMultiplier, 1500);

    const interval = setInterval(() => {
      const randomAdv = INITIAL_FEEDS[Math.floor(Math.random() * INITIAL_FEEDS.length)];
      const newAdv: CTIAdvisory = {
        ...randomAdv,
        id: `ADV-${Date.now().toString().slice(-6)}`,
        publishedAt: new Date().toISOString()
      };
      setAdvisories((prev) => [newAdv, ...prev.slice(0, 24)]);
      // Save ingested threat feed directly to Firebase Firestore
      saveThreatFeedAdvisory(newAdv);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isFeedActive, feedRateMultiplier]);

  const handleAddCustomFeedAdvisory = (adv: CTIAdvisory) => {
    setAdvisories((prev) => [adv, ...prev]);
    saveThreatFeedAdvisory(adv);
  };

  const handleAddAsset = (newAsset: Asset) => {
    setAssets((prev) => [newAsset, ...prev]);
    saveAssetToFirestore(newAsset);
  };

  const handleAddRuleToLibrary = (rule: DetectionRule) => {
    setDetectionRules((prev) => [rule, ...prev]);
    saveDetectionRuleToFirestore(rule);
  };

  const handleUpdateAssetVulnerabilityStatus = (assetId: string, cveId: string, newStatus: Vulnerability['patchStatus']) => {
    setAssets((prev) =>
      prev.map((ast) => {
        if (ast.id === assetId) {
          const updatedAsset: Asset = {
            ...ast,
            vulnerabilities: ast.vulnerabilities.map((v) =>
              v.cveId.toLowerCase() === cveId.toLowerCase() ? { ...v, patchStatus: newStatus } : v
            )
          };
          saveAssetToFirestore(updatedAsset);
          return updatedAsset;
        }
        return ast;
      })
    );
  };

  const handleDeployRuleToSIEM = (rule: { name: string; spl: string; category: string; severity: any }) => {
    const newRule: DetectionRule = {
      id: `DET-CTI-${Date.now().toString().slice(-4)}`,
      name: rule.name,
      category: rule.category as any,
      severity: rule.severity,
      riskScore: rule.severity === 'CRITICAL' ? 95 : 80,
      description: `Auto-deployed rule from live CTI feed ingestion stream.`,
      mitreTechniques: ['T1059 - Command Execution'],
      enabled: true,
      triggerCount: 0,
      splQuery: rule.spl,
      sigmaRule: `title: ${rule.name}\nlogsource:\n  category: process_creation`,
      kqlQuery: `SecurityEvent | where EventCode == 10`,
      cqlQuery: `event_simpleName=ProcessRollup2`,
      elkQuery: `process where event.action == "start"`,
      yaraRule: `// Signature for ${rule.name}`
    };
    setDetectionRules((prev) => [newRule, ...prev]);
    saveDetectionRuleToFirestore(newRule);
  };

  const handleToggleRule = (ruleId: string) => {
    setDetectionRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleCreateIncidentFromHunt = (incident: NotableIncident) => {
    setIncidents((prev) => [incident, ...prev]);
    saveIncidentTicketToFirestore(incident);
  };

  const handleCreateTicket = (newTicket: NotableIncident) => {
    setIncidents((prev) => [newTicket, ...prev]);
    saveIncidentTicketToFirestore(newTicket);
  };

  const handleDeleteTicket = (ticketId: string) => {
    setIncidents((prev) => prev.filter((t) => t.id !== ticketId));
    deleteIncidentTicketFromFirestore(ticketId);
  };

  const handleSimulateAlert = (rule: DetectionRule) => {
    const newIncident: NotableIncident = {
      id: `INC-${Date.now().toString().slice(-6)}`,
      title: `Simulated Alert: ${rule.name}`,
      severity: rule.severity,
      riskScore: rule.riskScore,
      status: 'NEW',
      slaTargetMinutes: rule.severity === 'CRITICAL' ? 15 : 60,
      slaStartTime: new Date().toISOString(),
      assignedAnalyst: 'sharath.skt55@gmail.com',
      affectedHost: `HOST-SIM-${Math.floor(Math.random() * 80 + 10)}`,
      affectedUser: 'GLOBAL\\sim_user',
      mitreTechnique: rule.mitreTechniques[0] || 'T1059',
      detectionRuleId: rule.id,
      description: rule.description,
      rawEventsCount: 1,
      analystNotes: [
        {
          timestamp: new Date().toISOString(),
          author: 'Simulation Trigger',
          text: `Manual alert simulation triggered for detection rule ${rule.id}.`
        }
      ],
      aiHypothesis: `Simulated event match for ${rule.name}. Recommended SOAR response.`
    };

    setIncidents((prev) => [newIncident, ...prev]);

    const newLog: SIEMLogEvent = {
      _time: new Date().toISOString(),
      _raw: `2026-09-24T09:22:00Z host=${newIncident.affectedHost} sourcetype=sysmon EventCode=10 signature="${rule.name}" user="GLOBAL\\sim_user" status="SUSPICIOUS" risk_score=${rule.riskScore}`,
      host: newIncident.affectedHost,
      sourcetype: 'sysmon',
      source: 'XmlWinEventLog:Simulated',
      user: 'GLOBAL\\sim_user',
      status: 'SUSPICIOUS',
      risk_score: rule.riskScore,
      signature: rule.name
    };
    setSiemLogs((prev) => [newLog, ...prev]);

    if (rule.riskScore >= 90) {
      fetch('/api/dispatch-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: 'sharath.skt55@gmail.com',
          incidentTitle: newIncident.title,
          severity: newIncident.severity,
          riskScore: newIncident.riskScore,
          affectedHost: newIncident.affectedHost
        })
      }).catch(console.error);
    }
    // Save new simulated or hunted incident to Firestore
    saveIncidentTicketToFirestore(newIncident);
  };

  const handleUpdateIncidentStatus = (id: string, status: NotableIncident['status']) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const updated = { ...inc, status };
          saveIncidentTicketToFirestore(updated);
          return updated;
        }
        return inc;
      })
    );
  };

  const handleAddAnalystNote = (incidentId: string, noteText: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const updated: NotableIncident = {
            ...inc,
            analystNotes: [
              ...inc.analystNotes,
              {
                timestamp: new Date().toISOString(),
                author: currentUserEmail || 'sharath.skt55@gmail.com',
                text: noteText
              }
            ]
          };
          saveIncidentTicketToFirestore(updated);
          return updated;
        }
        return inc;
      })
    );
  };

  const correlatedCount = assets.reduce((acc, a) => {
    return acc + a.vulnerabilities.filter((v) => v.patchStatus === 'UNPATCHED').length;
  }, 0);

  const getTabTitle = (tab: ActiveTab): string => {
    switch (tab) {
      case 'cti-feed': return 'Live CTI Advisory Stream Collector';
      case 'vulnerability-management': return 'Asset CTI Correlation Matrix';
      case 'threat-reports': return '24-Hour Threat Intelligence Summary Reports';
      case 'on-demand-reports': return 'On-Demand Intelligence Reports & Storage';
      case 'siem-console': return 'Splunk SIEM';
      case 'detection-catalog': return 'Detection Intelligence Forge (AI Synthesis)';
      case 'detection-library': return 'Enterprise Detection Rule Library';
      case 'incident-review': return 'Incidents';
      case 'hec-collector': return 'HTTP Event Collector (HEC) Simulator';
      case 'threat-dashboard': return 'Enterprise Threat Dashboard & Telemetry Analytics';
      case 'threat-analytics': return 'Threat Analytics & Visualizations';
      case 'industry-threat-actors': return 'Industry-Wise Threat Actor Intelligence Matrix';
      case 'threat-hunting-sandbox': return 'Threat Hunting Sandbox (Sigma & KQL / SPL)';
      case 'osint-intelligence': return 'OSINT Intelligence Hub & Threat Report Correlation Engine';
      case 'kpi-kri-sla': return 'SOC KPI, KRI & SLA Performance Governance (RAGB Color Coded)';
      case 'executive-dashboard': return 'Executive CISO & CTI Dashboard';
      case 'enterprise-posture': return 'Enterprise.com CTI Posture Management';
      case 'threat-heatmap': return 'Global Threat Heatmap & Attack Vector Intelligence';
      case 'threat-wiki': return 'Threat Wiki: Adversary & CTI Knowledgebase';
      default: return 'Tejax AI SOC & Cyber Threat Intelligence Platform';
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={(email) => { setIsAuthenticated(true); setCurrentUserEmail(email); }} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Navigation */}
      <SidebarNavigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        incidentsBadgeCount={incidents.filter((i) => i.status === 'NEW').length}
        correlatedThreatsCount={correlatedCount}
        detectionRulesCount={detectionRules.length}
        isFeedActive={isFeedActive}
        onToggleFeed={() => setIsFeedActive(!isFeedActive)}
        onOpenAIAssistant={() => setAiAssistantOpen(true)}
        onOpenDispatchModal={() => setDispatchModalOpen(true)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userEmail={currentUserEmail}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* Main Content Workspace */}
      <div className={`flex-1 flex flex-col min-w-0 ${isCompactView ? 'compact-view' : ''}`}>
        <Header
          activeTabTitle={getTabTitle(activeTab)}
          onOpenAIAssistant={() => setAiAssistantOpen(true)}
          onOpenDispatchModal={() => setDispatchModalOpen(true)}
          activeIncidentsCount={incidents.filter((i) => i.status !== 'CLOSED' && i.status !== 'FALSE_POSITIVE').length}
          onToggleSidebarMobile={() => setSidebarCollapsed(!sidebarCollapsed)}
          globalSearchQuery={globalSearchQuery}
          onGlobalSearchChange={setGlobalSearchQuery}
          incidents={incidents}
          assets={assets}
          setActiveTab={setActiveTab}
          isCompactView={isCompactView}
          onToggleCompactView={() => setIsCompactView(!isCompactView)}
        />

        <main className="flex-1 overflow-y-auto">

          {activeTab === 'cti-feed' && (
            <CTIFeedCollector
              advisories={advisories}
              isFeedActive={isFeedActive}
              feedRateMultiplier={feedRateMultiplier}
              onToggleFeed={() => setIsFeedActive(!isFeedActive)}
              onChangeFeedRate={setFeedRateMultiplier}
              onDeployRuleToSIEM={handleDeployRuleToSIEM}
              onAddCustomFeedAdvisory={handleAddCustomFeedAdvisory}
            />
          )}

          {activeTab === 'vulnerability-management' && (
            <VulnerabilityManagement
              assets={assets}
              advisories={advisories}
              onAddAsset={handleAddAsset}
              onUpdateAssetVulnerabilityStatus={handleUpdateAssetVulnerabilityStatus}
            />
          )}

          {activeTab === 'threat-reports' && (
            <div className="p-6">
              <ThreatReports />
            </div>
          )}

          {activeTab === 'on-demand-reports' && (
            <div className="p-6">
              <OnDemandReports />
            </div>
          )}

          {activeTab === 'siem-console' && (
            <SplunkSIEMConsole logs={siemLogs} />
          )}

          {activeTab === 'detection-catalog' && (
            <DetectionCatalog
              onAddRuleToLibrary={handleAddRuleToLibrary}
            />
          )}

          {activeTab === 'detection-library' && (
            <DetectionRuleLibrary
              rules={detectionRules}
              onToggleRule={handleToggleRule}
              onSimulateAlert={handleSimulateAlert}
            />
          )}

          {activeTab === 'incident-review' && (
            <IncidentReview
              incidents={incidents}
              onUpdateStatus={handleUpdateIncidentStatus}
              onAddNote={handleAddAnalystNote}
              onCreateTicket={handleCreateTicket}
              onDeleteTicket={handleDeleteTicket}
            />
          )}

          {activeTab === 'hec-collector' && (
            <HECCollector />
          )}

          {activeTab === 'threat-dashboard' && (
            <ThreatDashboard />
          )}

          {activeTab === 'threat-analytics' && (
            <ThreatAnalytics
              initialSection="all"
              onNavigateToHunting={(_technique) => {
                setActiveTab('threat-hunting-sandbox');
              }}
              onNavigateToSIEM={(_query) => {
                setActiveTab('siem-console');
              }}
            />
          )}

          {activeTab === 'industry-threat-actors' && (
            <ThreatAnalytics
              initialSection="industry"
              onNavigateToHunting={(_technique) => {
                setActiveTab('threat-hunting-sandbox');
              }}
              onNavigateToSIEM={(_query) => {
                setActiveTab('siem-console');
              }}
            />
          )}

          {activeTab === 'threat-hunting-sandbox' && (
            <ThreatHuntingSandbox logs={siemLogs} onAddIncident={handleCreateIncidentFromHunt} />
          )}

          {activeTab === 'osint-intelligence' && (
            <OSINTIntelligenceView onRunSPLInConsole={(spl) => { setActiveTab('siem-console'); }} />
          )}

          {activeTab === 'kpi-kri-sla' && (
            <KPIMetricsView />
          )}

          {activeTab === 'executive-dashboard' && (
            <ExecutiveDashboard
              incidents={incidents}
              assets={assets}
              setActiveTab={(tab) => {
                setActiveTab(tab);
              }}
            />
          )}

          {activeTab === 'enterprise-posture' && (
            <EnterprisePostureManagementView />
          )}

          {activeTab === 'threat-heatmap' && (
            <ThreatHeatmapView />
          )}

          {activeTab === 'threat-wiki' && (
            <ThreatWikiView
              onNavigateTab={(tab) => setActiveTab(tab)}
              onNavigateToSIEM={(_query) => {
                setActiveTab('siem-console');
              }}
              onNavigateToHunting={(_technique) => {
                setActiveTab('threat-hunting-sandbox');
              }}
            />
          )}
        </main>
      </div>

      {/* Multi-Turn AI CTI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />

      {/* Alert Notification & Briefing Modal */}
      <DispatchSettingsModal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
      />
    </div>
  );
}
