export type AdvisorySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface CTIAdvisory {
  id: string;
  source: 'CISA KEV' | 'CERT/CC' | 'Microsoft MSRC' | 'DFIR Labs' | 'Threat Research' | 'Ransomware Tracker' | 'Custom Feed';
  title: string;
  cveId: string;
  cvssScore: number;
  threatActor?: string;
  malwareFamily?: string;
  targetSectors: string[];
  summary: string;
  publishedAt: string;
  rawPayload?: string;
  mitreTtps: string[];
  cyberKillChainStage: 'Reconnaissance' | 'Weaponization' | 'Delivery' | 'Exploitation' | 'Installation' | 'Command and Control' | 'Actions on Objectives';
  detectionRules?: {
    sigma: string;
    kql: string;
    cql: string;
    spl: string;
  };
  recommendedMitigations: string[];
}

export interface SIEMLogEvent {
  _time: string;
  _raw: string;
  host: string;
  sourcetype: 'WinEventLog:Security' | 'sysmon' | 'cisco:asa' | 'crowdstrike:falcon' | 'aws:cloudtrail' | 'okta:system';
  source: string;
  user?: string;
  src_ip?: string;
  dest_ip?: string;
  dest_port?: number;
  process_name?: string;
  parent_process?: string;
  command_line?: string;
  event_id?: number;
  status?: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'SUSPICIOUS';
  action?: string;
  signature?: string;
  risk_score?: number;
}

export interface SPLQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  totalMatches: number;
  executionTimeMs: number;
  query: string;
  histogram?: { timeBucket: string; count: number }[];
}

export interface DetectionRule {
  id: string;
  name: string;
  category: 'Endpoint Security' | 'Identity & Access' | 'Network Threats' | 'Cloud Security' | 'Ransomware' | 'Zero-Day Exploits';
  severity: AdvisorySeverity;
  riskScore: number;
  description: string;
  mitreTechniques: string[];
  enabled: boolean;
  splQuery: string;
  sigmaRule: string;
  kqlQuery?: string;
  cqlQuery?: string;
  kql?: string;
  cql?: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface NotableIncident {
  id: string;
  title: string;
  severity: AdvisorySeverity;
  riskScore: number;
  status: 'NEW' | 'IN_PROGRESS' | 'MITIGATED' | 'FALSE_POSITIVE' | 'CLOSED';
  slaTargetMinutes: number;
  slaStartTime: string;
  assignedAnalyst: string;
  affectedHost: string;
  affectedUser: string;
  sourceIp?: string;
  mitreTechnique: string;
  detectionRuleId: string;
  description: string;
  rawEventsCount: number;
  analystNotes: { timestamp: string; author: string; text: string }[];
  aiHypothesis?: string;
}

export interface HECToken {
  id: string;
  name: string;
  token: string;
  index: string;
  sourcetype: string;
  status: 'ACTIVE' | 'DISABLED';
  eventsReceived: number;
  bytesReceived: number;
  createdAt: string;
}

export interface DailyBriefingReport {
  id: string;
  dispatchTimestamp: string;
  recipientEmail: string;
  scheduledTimeUtc: string;
  status: 'DELIVERED' | 'SCHEDULED' | 'FAILED';
  executiveSummary: string;
  topCriticalCVEs: string[];
  activeThreatActors: string[];
  slaComplianceRate: number;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  modelUsed?: 'gemini-3.8-flash' | 'gemini-3.1-pro-preview';
  text: string;
  timestamp: string;
  codeBlocks?: { language: string; code: string; label: string }[];
  suggestedActions?: string[];
}

// Vulnerability Management & Asset Inventory Interfaces
export interface ContactDetail {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  pagerDutyEscalation: string;
  shiftCoverage: '24/7 Primary' | 'APAC SOC' | 'EMEA SOC' | 'US East SOC' | 'On-Call Escalation';
  assignedAssets: string[]; // Asset IDs
  status: 'ACTIVE_ON_CALL' | 'AVAILABLE' | 'OFF_SHIFT';
  notes?: string;
}

export interface Asset {
  id: string;
  hostname: string;
  ipAddress: string;
  os: string;
  environment: 'Production' | 'Staging' | 'OT Infrastructure' | 'Cloud AWS/Azure' | 'DMZ Edge';
  tier: 'Tier 1 (Critical)' | 'Tier 2 (High)' | 'Tier 3 (Medium)';
  businessOwner: string;
  contactEmail?: string;
  contactPhone?: string;
  contactRole?: string;
  installedSoftware: { name: string; version: string; cpe?: string }[];
  lastScanTimestamp?: string;
  vulnerabilities: Vulnerability[];
}

export interface Vulnerability {
  cveId: string;
  title: string;
  cvssScore: number;
  severity: AdvisorySeverity;
  affectedSoftware: string;
  patchStatus: 'UNPATCHED' | 'PATCH_SCHEDULED' | 'MITIGATED' | 'PATCHED';
  cisaKevExploited: boolean;
  threatActorsExploiting?: string[];
  remediationGuide?: string;
}

export interface CorrelatedThreat {
  assetId: string;
  hostname: string;
  ipAddress: string;
  tier: string;
  cveId: string;
  cveTitle: string;
  cvssScore: number;
  ctiAdvisoryId: string;
  ctiSource: string;
  threatActor?: string;
  cisaKevStatus: boolean;
  riskPriorityScore: number; // 0-100 calculated score
  recommendedAction: string;
}

export interface IndustryThreatActor {
  id: string;
  actorName: string;
  aliases: string[];
  origin: string;
  targetIndustry: 'Financial Services' | 'Healthcare & Biotech' | 'Energy & OT Infrastructure' | 'Defense & Government' | 'Technology & Cloud' | 'Industrial & Manufacturing';
  motivation: 'Financial Gain' | 'Cyber Espionage' | 'Critical Infrastructure Disruption' | 'Data Exfiltration';
  primaryTTPs: string[];
  associatedMalware: string[];
  cveTargets: string[];
  activityLevel: 'HIGH' | 'MEDIUM' | 'ELEVATED';
  riskScore: number;
  description: string;
  recommendedDefenses: string[];
}

export interface OSINTIndicator {
  type: 'IP' | 'DOMAIN' | 'HASH' | 'CVE' | 'URL';
  value: string;
  threatScore: number;
}

export interface OSINTAdvisory {
  id: string;
  source: 'GitHub Security' | 'MalwareBazaar' | 'AlienVault OTX' | 'Twitter OSINT Feed' | 'Exploit-DB' | 'Abuse.ch ThreatFox';
  title: string;
  summary: string;
  publishedAt: string;
  confidence: 'HIGH' | 'MEDIUM' | 'EMERGING';
  indicators: OSINTIndicator[];
  correlatedReportsCount: number;
  matchedThreatReports: string[];
  matchedCveIds: string[];
  matchedAssetsCount: number;
  tags: string[];
  rawFeedUrl?: string;
}

export interface ThreatReportData {
  id: string;
  title: string;
  cveId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  cvssScore: number;
  threatActor: string;
  timeWindow: string;
  publishedAt: string;
  mitreTtp: string;
  killChainStage: string;
  executiveSummary: string;
  technicalSummary: string;
  assignedAnalyst?: string;
  reportType?: 'daily_24h' | 'on_demand' | 'custom';
  iocs: {
    ips: string[];
    domains: string[];
    hashes: string[];
    processes: string[];
  };
  recommendations: string[];
  references: { title: string; url: string; source: string }[];
}

export interface ThreatHuntRequest {
  id: string;
  actorId: string;
  actorName: string;
  targetIndustry: string;
  riskScore: number;
  hypothesis: string;
  selectedTTPs: string[];
  dataSources: string[];
  timeWindow: string;
  priority: 'CRITICAL (P1)' | 'HIGH (P2)' | 'MEDIUM (P3)';
  assignedHunter: string;
  scopeNotes: string;
  iocSeeds?: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'DISPATCHED_TO_SANDBOX' | 'COMPLETED';
  requestedAt: string;
}


