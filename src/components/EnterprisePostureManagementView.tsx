import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Server,
  Lock,
  Search,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Database,
  Download,
  Zap,
  Terminal,
  Activity,
  Award,
  Filter,
  UserCheck,
  Mail,
  Send,
  Ticket,
  Check,
  Radio,
  Flame,
  XCircle,
  AlertCircle,
  Plus,
  Clock,
  FileText,
  Building,
  Tag
} from 'lucide-react';

export interface PostureRiskAsset {
  id: string;
  hostname: string;
  ipAddress: string;
  subdomain: string;
  tier: 'Tier 1 (Critical)' | 'Tier 2 (High)' | 'Tier 3 (Medium)';
  riskScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  primaryExposure: string;
  cveId?: string;
  cvssScore?: number;
  threatActors: string[];
  cisaKev: boolean;
  businessOwner: string;
  contactEmail: string;
  edrStatus: 'Protected' | 'Agent Missing' | 'Sensor Outdated';
  remediationAction: string;
  isIsolated?: boolean;
}

export interface ServiceRequestTicket {
  id: string;
  title: string;
  category: 'Vulnerability Patching' | 'EDR Agent Deployment' | 'TLS/SSL Certificate Renewal' | 'Perimeter Takedown' | 'WAF Hardening' | 'Access Control & MFA';
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
  affectedAsset: string;
  owner: string;
  ownerEmail: string;
  department: string;
  slaWindow: '4 Hours (P1 Critical SLA)' | '24 Hours (Standard SOC SLA)' | '72 Hours (Routine Review)';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'RESOLVED';
  requester: string;
  requesterEmail: string;
  justification: string;
  createdAt: string;
  syncedToSoar?: boolean;
}

export const EnterprisePostureManagementView: React.FC = () => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'risk-assets' | 'tickets' | 'subdomains' | 'vulnerabilities' | 'impersonation' | 'darkweb'>('risk-assets');

  // Search & Filter for Assets under risk
  const [assetSearchQuery, setAssetSearchQuery] = useState<string>('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'TIER1'>('ALL');

  // Service Request Ticket State & Filters
  const [ticketSearchQuery, setTicketSearchQuery] = useState<string>('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>('ALL');

  // Service Request Modal State
  const [serviceTicketModalOpen, setServiceTicketModalOpen] = useState<boolean>(false);
  const [ticketModalSelectedAssetId, setTicketModalSelectedAssetId] = useState<string>('');
  const [ticketModalTitle, setTicketModalTitle] = useState<string>('');
  const [ticketModalCategory, setTicketModalCategory] = useState<ServiceRequestTicket['category']>('Vulnerability Patching');
  const [ticketModalPriority, setTicketModalPriority] = useState<ServiceRequestTicket['priority']>('P1 - Critical');
  const [ticketModalAffectedAsset, setTicketModalAffectedAsset] = useState<string>('');
  const [ticketModalOwner, setTicketModalOwner] = useState<string>('');
  const [ticketModalOwnerEmail, setTicketModalOwnerEmail] = useState<string>('');
  const [ticketModalDepartment, setTicketModalDepartment] = useState<string>('');
  const [ticketModalSla, setTicketModalSla] = useState<ServiceRequestTicket['slaWindow']>('4 Hours (P1 Critical SLA)');
  const [ticketModalRequester, setTicketModalRequester] = useState<string>('Sharath Kumar (Lead SOC Manager)');
  const [ticketModalRequesterEmail, setTicketModalRequesterEmail] = useState<string>('sharath.skt55@gmail.com');
  const [ticketModalJustification, setTicketModalJustification] = useState<string>('');
  const [ticketModalNotifyOwner, setTicketModalNotifyOwner] = useState<boolean>(true);
  const [ticketModalSyncSoar, setTicketModalSyncSoar] = useState<boolean>(true);

  // Initial Service Request Tickets Queue
  const [tickets, setTickets] = useState<ServiceRequestTicket[]>([
    {
      id: 'SR-2026-8021',
      title: 'Emergency Apache Tomcat Security Patch Deployment (CVE-2026-3112)',
      category: 'Vulnerability Patching',
      priority: 'P1 - Critical',
      affectedAsset: 'api.enterprise.com (198.51.100.88) - Tier 1 (Critical)',
      owner: 'Aisha Patel (Lead DBA & API Security)',
      ownerEmail: 'db-sec@enterprise.com',
      department: 'Enterprise Gateway Engineering',
      slaWindow: '4 Hours (P1 Critical SLA)',
      status: 'IN_PROGRESS',
      requester: 'Sharath Kumar (Lead SOC Manager)',
      requesterEmail: 'sharath.skt55@gmail.com',
      justification: 'Critical RCE vulnerability actively targeted by FIN7 and Scattered Spider. WAF virtual patch applied, binary patch rollout required.',
      createdAt: '2026-09-26 14:15 UTC',
      syncedToSoar: true
    },
    {
      id: 'SR-2026-8019',
      title: 'CrowdStrike Falcon Sensor Deployment & Git Perimeter Hardening',
      category: 'EDR Agent Deployment',
      priority: 'P1 - Critical',
      affectedAsset: 'git.enterprise.com (203.0.113.99) - Tier 1 (Critical)',
      owner: 'Chen Wei (DevOps SecOps Lead)',
      ownerEmail: 'cloud-devsec@enterprise.com',
      department: 'Cloud DevOps SecOps',
      slaWindow: '4 Hours (P1 Critical SLA)',
      status: 'OPEN',
      requester: 'Sharath Kumar (Lead SOC Manager)',
      requesterEmail: 'sharath.skt55@gmail.com',
      justification: 'External git endpoint missing EDR sensor and exposed to Lazarus Group scanning. Deploy Falcon Linux agent immediately.',
      createdAt: '2026-09-26 16:30 UTC',
      syncedToSoar: true
    },
    {
      id: 'SR-2026-8014',
      title: 'Expiring Wildcard TLS Certificate Renewal & Key Pair Rotation',
      category: 'TLS/SSL Certificate Renewal',
      priority: 'P2 - High',
      affectedAsset: 'corp-vpn.enterprise.com (203.0.113.15) - Tier 1 (Critical)',
      owner: 'David O\'Connor (OT & Perimeter Sec Lead)',
      ownerEmail: 'ot-sec@enterprise.com',
      department: 'Perimeter Network Security',
      slaWindow: '24 Hours (Standard SOC SLA)',
      status: 'OPEN',
      requester: 'SecOps Automated PKI Monitor',
      requesterEmail: 'pki-bot@enterprise.com',
      justification: 'DigiCert Wildcard cert *.enterprise.com expires in 14 days. Reissue and bind to Cisco ASA perimeter cluster.',
      createdAt: '2026-09-26 09:10 UTC',
      syncedToSoar: true
    },
    {
      id: 'SR-2026-8008',
      title: 'Registrar DMCA Takedown for Phishing Mimic domain (enterprise-security.com)',
      category: 'Perimeter Takedown',
      priority: 'P2 - High',
      affectedAsset: 'enterprise-security.com (Phishing Harvester)',
      owner: 'Global SOC Operations',
      ownerEmail: 'soc@enterprise.com',
      department: 'Brand Protection & Anti-Fraud',
      slaWindow: '24 Hours (Standard SOC SLA)',
      status: 'IN_PROGRESS',
      requester: 'Sharath Kumar (Lead SOC Manager)',
      requesterEmail: 'sharath.skt55@gmail.com',
      justification: 'Domain hosting fake SSO login page targeting Enterprise employees. Abuse complaint submitted to NameCheap & Cloudflare.',
      createdAt: '2026-09-25 18:45 UTC',
      syncedToSoar: true
    },
    {
      id: 'SR-2026-7992',
      title: 'Restrict Staging Perimeter to Corporate VPN Whitelist (staging.enterprise.com)',
      category: 'WAF Hardening',
      priority: 'P2 - High',
      affectedAsset: 'staging.enterprise.com (198.51.100.204) - Tier 2 (High)',
      owner: 'Elena Rostova (Lead IAM Admin)',
      ownerEmail: 'sysadmin@enterprise.com',
      department: 'IT Infrastructure & Identity',
      slaWindow: '24 Hours (Standard SOC SLA)',
      status: 'RESOLVED',
      requester: 'Aisha Patel (Lead DBA)',
      requesterEmail: 'db-sec@enterprise.com',
      justification: 'Staging environment was publicly reachable on port 8080. Cloudflare firewall rule activated to restrict to corporate egress IP pool.',
      createdAt: '2026-09-24 11:20 UTC',
      syncedToSoar: true
    }
  ]);

  // Interactive Assets Under Risk Data
  const [riskAssets, setRiskAssets] = useState<PostureRiskAsset[]>([
    {
      id: 'RISK-01',
      hostname: 'git.enterprise.com',
      subdomain: 'git.enterprise.com',
      ipAddress: '203.0.113.99',
      tier: 'Tier 1 (Critical)',
      riskScore: 96,
      riskLevel: 'CRITICAL',
      primaryExposure: 'Self-Signed TLS Certificate with missing CrowdStrike Sensor and unauthenticated Git API endpoint exposure.',
      cveId: 'CVE-2026-1120',
      cvssScore: 9.8,
      threatActors: ['APT28 (Fancy Bear)', 'Lazarus Group'],
      cisaKev: true,
      businessOwner: 'Chen Wei (DevOps SecOps Lead)',
      contactEmail: 'cloud-devsec@enterprise.com',
      edrStatus: 'Agent Missing',
      remediationAction: 'Deploy CrowdStrike Falcon sensor, enforce enterprise SSO/MFA gateway, and rotate exposed API tokens.',
      isIsolated: false
    },
    {
      id: 'RISK-02',
      hostname: 'api.enterprise.com',
      subdomain: 'api.enterprise.com',
      ipAddress: '198.51.100.88',
      tier: 'Tier 1 (Critical)',
      riskScore: 92,
      riskLevel: 'CRITICAL',
      primaryExposure: 'Active exploit vulnerability: Apache Tomcat Remote Code Execution via malformed HTTP/2 Header Frame in Ingress Proxy.',
      cveId: 'CVE-2026-3112',
      cvssScore: 9.8,
      threatActors: ['FIN7 (Carbanak)', 'Scattered Spider'],
      cisaKev: true,
      businessOwner: 'Aisha Patel (Lead DBA & API Security)',
      contactEmail: 'db-sec@enterprise.com',
      edrStatus: 'Protected',
      remediationAction: 'Deploy Apache Tomcat security patch v10.1.25 and enable Cloudflare WAF virtual patching rule 942100.',
      isIsolated: false
    },
    {
      id: 'RISK-03',
      hostname: 'corp-vpn.enterprise.com',
      subdomain: 'corp-vpn.enterprise.com',
      ipAddress: '203.0.113.15',
      tier: 'Tier 1 (Critical)',
      riskScore: 84,
      riskLevel: 'HIGH',
      primaryExposure: 'Cisco ASA SSL-VPN memory leak & session hijacking vulnerability; DigiCert wildcard certificate expiring within 14 days.',
      cveId: 'CVE-2026-4401',
      cvssScore: 8.8,
      threatActors: ['Volt Typhoon (BRONZE SILHOUETTE)'],
      cisaKev: true,
      businessOwner: 'David O\'Connor (OT & Perimeter Sec Lead)',
      contactEmail: 'ot-sec@enterprise.com',
      edrStatus: 'Protected',
      remediationAction: 'Renew DigiCert TLS certificate and upgrade Cisco ASA OS firmware to version 9.18.4+ with memory integrity validation.',
      isIsolated: false
    },
    {
      id: 'RISK-04',
      hostname: 'staging.enterprise.com',
      subdomain: 'staging.enterprise.com',
      ipAddress: '198.51.100.204',
      tier: 'Tier 2 (High)',
      riskScore: 78,
      riskLevel: 'HIGH',
      primaryExposure: 'Publicly exposed development environment with default debug credentials and unencrypted telemetry webhook endpoint.',
      cveId: 'CVE-2026-5510',
      cvssScore: 8.2,
      threatActors: ['Anonymous Sudan', 'Automated CTI Scanners'],
      cisaKev: false,
      businessOwner: 'Elena Rostova (Lead IAM Admin)',
      contactEmail: 'sysadmin@enterprise.com',
      edrStatus: 'Protected',
      remediationAction: 'Restrict staging perimeter to corporate VPN IP whitelist and purge exposed test environment credentials.',
      isIsolated: false
    },
    {
      id: 'RISK-05',
      hostname: 'pay.enterprise.com',
      subdomain: 'pay.enterprise.com',
      ipAddress: '198.51.100.12',
      tier: 'Tier 1 (Critical)',
      riskScore: 68,
      riskLevel: 'MEDIUM',
      primaryExposure: 'Outdated libpq client library version and unthrottled external payment callback webhook listener.',
      cveId: 'CVE-2026-1049',
      cvssScore: 7.5,
      threatActors: ['LockBit Affiliates'],
      cisaKev: false,
      businessOwner: 'Financial Systems SecOps Team',
      contactEmail: 'finance-it@enterprise.com',
      edrStatus: 'Protected',
      remediationAction: 'Upgrade PostgreSQL client packages and enforce rate-limiting on payment callback endpoints.',
      isIsolated: false
    }
  ]);

  const handleRunPostureScan = () => {
    setIsScanning(true);
    setScanMessage('Initiating deep CTI reconnaissance scan across Enterprise.com perimeter, assets under risk, and external threat feeds...');
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('Scan complete: 5 assets analyzed, 2 critical vulnerability exposures verified, 1 takedown active, 0 new dark web leaks.');
      setTimeout(() => setScanMessage(null), 5000);
    }, 2500);
  };

  const handleTakedown = (domain: string) => {
    setScanMessage(`Automated DMCA & Registrar takedown request submitted for malicious domain: ${domain}`);
    setTimeout(() => setScanMessage(null), 4000);
  };

  // Toggle Isolation on an Asset Under Risk
  const handleToggleIsolation = (assetId: string) => {
    setRiskAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          const nextState = !a.isIsolated;
          setScanMessage(
            nextState
              ? `EDR Containment Playbook dispatched: Host ${a.hostname} (${a.ipAddress}) successfully ISOLATED from enterprise network.`
              : `EDR Containment Lifted: Host ${a.hostname} (${a.ipAddress}) restored to production network traffic.`
          );
          setTimeout(() => setScanMessage(null), 5000);
          return { ...a, isIsolated: nextState };
        }
        return a;
      })
    );
  };

  // Dispatch Remediation Alert
  const handleDispatchRemediation = (asset: PostureRiskAsset) => {
    setScanMessage(`Remediation advisory dispatched to ${asset.contactEmail} (${asset.businessOwner}) for ${asset.hostname}.`);
    setTimeout(() => setScanMessage(null), 4500);
  };

  const subdomains = [
    { name: 'auth.enterprise.com', ip: '198.51.100.42', status: 'Secure', ssl: 'Valid (DigiCert)', risk: 'Low', edr: 'Protected', isRisk: false },
    { name: 'api.enterprise.com', ip: '198.51.100.88', status: 'Vulnerable (CVE-2026-3112)', ssl: 'Valid (Let\'s Encrypt)', risk: 'Critical', edr: 'Protected', isRisk: true },
    { name: 'corp-vpn.enterprise.com', ip: '203.0.113.15', status: 'Expiring Cert & CVE', ssl: 'Valid (Expiring 14d)', risk: 'High', edr: 'Protected', isRisk: true },
    { name: 'pay.enterprise.com', ip: '198.51.100.12', status: 'Monitor (Outdated libpq)', ssl: 'Valid (DigiCert)', risk: 'Medium', edr: 'Protected', isRisk: true },
    { name: 'git.enterprise.com', ip: '203.0.113.99', status: 'Critical Exposure', ssl: 'Self-Signed (Warning)', risk: 'Critical', edr: 'Agent Missing', isRisk: true },
    { name: 'staging.enterprise.com', ip: '198.51.100.204', status: 'Exposed Dev Endpoint', ssl: 'Valid', risk: 'High', edr: 'Protected', isRisk: true },
  ];

  const impersonations = [
    { domain: 'enterprise-security.com', registrar: 'NameCheap', created: '2 days ago', status: 'Phishing Credential Harvester', action: 'Pending Takedown' },
    { domain: 'enterpr1se.com', registrar: 'GoDaddy', created: '5 days ago', status: 'Typosquatting / Brand Mimicry', action: 'Notice Sent' },
    { domain: 'enterprise-login-portal.net', registrar: 'Cloudflare', created: '1 week ago', status: 'Active Credential Harvesting', action: 'Blocked via WAF' },
  ];

  const vulnerabilities = [
    { cve: 'CVE-2026-3112', title: 'Apache Tomcat Remote Code Execution in Enterprise Gateway', cvss: 9.8, severity: 'CRITICAL', affectedAsset: 'api.enterprise.com', status: 'Patch Queued' },
    { cve: 'CVE-2025-4920', title: 'OpenSSL Cipher Suite Negotiation Bypass', cvss: 8.1, severity: 'HIGH', affectedAsset: 'corp-vpn.enterprise.com', status: 'Mitigated' },
    { cve: 'CVE-2026-1049', title: 'PostgreSQL Privilege Escalation in User Management DB', cvss: 7.5, severity: 'HIGH', affectedAsset: 'pay.enterprise.com', status: 'Patch Deployed' },
  ];

  const darkwebMentions = [
    { source: 'RansomHub Leak Site', date: 'Yesterday', snippet: 'Discussion thread referencing Enterprise.com vendor credentials found on underground forum.', threatActor: 'FIN7 / Carbanak', severity: 'HIGH' },
    { source: 'Telegram CTI Channel', date: '3 days ago', snippet: 'Database export sample claiming 45k corporate email records for enterprise.com.', threatActor: 'Unknown Broker', severity: 'MEDIUM' },
  ];

  const credentialLeaks = [
    { email: 'admin@enterprise.com', source: 'Breach-X Underground', date: '2026-09-24', severity: 'CRITICAL', leakType: 'Cleartext Password / Hash', status: 'Password Reset Forced' },
    { email: 'hr-lead@enterprise.com', source: 'RaidForums Export', date: '2026-09-22', severity: 'HIGH', leakType: 'Full Profile + PII', status: 'MFA Enforced' },
    { email: 'finance-manager@enterprise.com', source: 'Underground Marketplace', date: '2026-09-20', severity: 'HIGH', leakType: 'SSO Token / Session Cookie', status: 'Account Isolated' },
    { email: 'support-agent-04@enterprise.com', source: 'Github Public Secret Scan', date: '2026-09-18', severity: 'MEDIUM', leakType: 'API Key Leak', status: 'Key Rotated' },
  ];

  // Filtered Assets Under Risk
  const filteredRiskAssets = riskAssets.filter((asset) => {
    const q = assetSearchQuery.toLowerCase();
    const matchesSearch =
      asset.hostname.toLowerCase().includes(q) ||
      asset.ipAddress.toLowerCase().includes(q) ||
      asset.primaryExposure.toLowerCase().includes(q) ||
      asset.businessOwner.toLowerCase().includes(q) ||
      (asset.cveId && asset.cveId.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (riskLevelFilter === 'CRITICAL') return asset.riskLevel === 'CRITICAL';
    if (riskLevelFilter === 'HIGH') return asset.riskLevel === 'HIGH';
    if (riskLevelFilter === 'TIER1') return asset.tier.includes('Tier 1');

    return true;
  });

  const criticalCount = riskAssets.filter((a) => a.riskLevel === 'CRITICAL').length;
  const highCount = riskAssets.filter((a) => a.riskLevel === 'HIGH').length;

  // Open Create Service Request Modal with auto-prefill
  const handleOpenCreateTicketModal = (asset?: PostureRiskAsset) => {
    const target = asset || riskAssets[0];
    if (target) {
      setTicketModalSelectedAssetId(target.id);
      setTicketModalAffectedAsset(`${target.hostname} (${target.ipAddress}) - ${target.tier}`);
      setTicketModalOwner(target.businessOwner);
      setTicketModalOwnerEmail(target.contactEmail);
      setTicketModalDepartment('Perimeter & Infrastructure Engineering');
      setTicketModalTitle(
        target.cveId
          ? `Remediate ${target.cveId} & Patch Exposure on ${target.hostname}`
          : `Security Hardening & Posture Fix for ${target.hostname}`
      );
      setTicketModalCategory(
        target.edrStatus === 'Agent Missing'
          ? 'EDR Agent Deployment'
          : target.cveId
          ? 'Vulnerability Patching'
          : 'WAF Hardening'
      );
      setTicketModalPriority(target.riskLevel === 'CRITICAL' ? 'P1 - Critical' : 'P2 - High');
      setTicketModalSla(target.riskLevel === 'CRITICAL' ? '4 Hours (P1 Critical SLA)' : '24 Hours (Standard SOC SLA)');
      setTicketModalJustification(
        `Automated service request created for ${target.hostname} (${target.ipAddress}). Primary exposure: ${target.primaryExposure}. Action required: ${target.remediationAction}`
      );
    }
    setServiceTicketModalOpen(true);
  };

  const handleAssetSelectInModal = (assetId: string) => {
    setTicketModalSelectedAssetId(assetId);
    const target = riskAssets.find(a => a.id === assetId);
    if (target) {
      setTicketModalAffectedAsset(`${target.hostname} (${target.ipAddress}) - ${target.tier}`);
      setTicketModalOwner(target.businessOwner);
      setTicketModalOwnerEmail(target.contactEmail);
      setTicketModalDepartment('Perimeter & Infrastructure Engineering');
      setTicketModalTitle(
        target.cveId
          ? `Remediate ${target.cveId} & Patch Exposure on ${target.hostname}`
          : `Security Hardening & Posture Fix for ${target.hostname}`
      );
      setTicketModalCategory(
        target.edrStatus === 'Agent Missing'
          ? 'EDR Agent Deployment'
          : target.cveId
          ? 'Vulnerability Patching'
          : 'WAF Hardening'
      );
      setTicketModalPriority(target.riskLevel === 'CRITICAL' ? 'P1 - Critical' : 'P2 - High');
      setTicketModalSla(target.riskLevel === 'CRITICAL' ? '4 Hours (P1 Critical SLA)' : '24 Hours (Standard SOC SLA)');
      setTicketModalJustification(
        `Automated service request created for ${target.hostname} (${target.ipAddress}). Primary exposure: ${target.primaryExposure}. Action required: ${target.remediationAction}`
      );
    }
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicketId = `SR-2026-${Math.floor(8100 + Math.random() * 900)}`;
    const newTicket: ServiceRequestTicket = {
      id: newTicketId,
      title: ticketModalTitle || `Security Service Request for ${ticketModalAffectedAsset}`,
      category: ticketModalCategory,
      priority: ticketModalPriority,
      affectedAsset: ticketModalAffectedAsset,
      owner: ticketModalOwner,
      ownerEmail: ticketModalOwnerEmail,
      department: ticketModalDepartment,
      slaWindow: ticketModalSla,
      status: 'OPEN',
      requester: ticketModalRequester,
      requesterEmail: ticketModalRequesterEmail,
      justification: ticketModalJustification,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      syncedToSoar: ticketModalSyncSoar
    };

    setTickets([newTicket, ...tickets]);
    setServiceTicketModalOpen(false);
    setScanMessage(`Service Request Ticket ${newTicketId} successfully created for ${ticketModalAffectedAsset}! Dispatched to ${ticketModalOwner}.`);
    setTimeout(() => setScanMessage(null), 6000);
  };

  const handleUpdateTicketStatus = (ticketId: string, nextStatus: ServiceRequestTicket['status']) => {
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status: nextStatus } : t))
    );
    setScanMessage(`Service Request ${ticketId} status updated to ${nextStatus}.`);
    setTimeout(() => setScanMessage(null), 4000);
  };

  // Filtered Service Request Tickets
  const filteredTickets = tickets.filter(ticket => {
    const q = ticketSearchQuery.toLowerCase();
    const matchesSearch =
      ticket.id.toLowerCase().includes(q) ||
      ticket.title.toLowerCase().includes(q) ||
      ticket.affectedAsset.toLowerCase().includes(q) ||
      ticket.owner.toLowerCase().includes(q) ||
      ticket.requester.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (ticketStatusFilter !== 'ALL' && ticket.status !== ticketStatusFilter) return false;
    if (ticketCategoryFilter !== 'ALL' && ticket.category !== ticketCategoryFilter) return false;

    return true;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-[calc(100vh-100px)] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between shadow-xl gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Enterprise.com CTI Posture Management
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                DOMAIN: ENTERPRISE.COM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous external attack surface monitoring, assets under risk evaluation, brand protection, and sovereign vulnerability posture for Enterprise.com.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCreateTicketModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <Ticket className="w-3.5 h-3.5 fill-slate-950" />
            <span>Create Service Request</span>
          </button>

          <button
            onClick={handleRunPostureScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Run Posture Scan'}</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-lg text-xs flex items-center justify-between shadow-xl font-mono animate-fadeIn">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{scanMessage}</span>
          </div>
          <button onClick={() => setScanMessage(null)} className="text-cyan-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Posture Scorecards with Asset Under Risk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Posture Score */}
        <div 
          onClick={() => setActiveTab('subdomains')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-2 cursor-pointer hover:border-cyan-500/50 transition-all group"
        >
          <div className="text-[11px] font-mono text-slate-400 uppercase font-bold group-hover:text-cyan-300">Enterprise.com Posture Score</div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400 font-mono">89 / 100</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
              Low Risk
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-400 h-full w-[89%]" />
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex justify-between">
            <span>6 Subdomains Monitored</span>
            <span>+2 pts this week</span>
          </div>
        </div>

        {/* Assets Under Risk Card */}
        <div 
          onClick={() => setActiveTab('risk-assets')}
          className="bg-slate-900 border border-rose-900/60 rounded-xl p-4 shadow space-y-2 relative overflow-hidden cursor-pointer hover:border-rose-500 transition-all group"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full pointer-events-none" />
          <div className="text-[11px] font-mono text-rose-300 uppercase font-bold flex items-center gap-1.5 group-hover:text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Assets Under Risk</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400 font-mono">
              {riskAssets.length} Hosts
            </span>
            <span className="text-xs font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-900 animate-pulse">
              Elevated Risk
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div className="bg-rose-500 h-full w-[75%]" />
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex justify-between">
            <span className="text-rose-300 font-bold">{criticalCount} Critical</span>
            <span className="text-amber-300 font-bold">{highCount} High</span>
          </div>
        </div>

        {/* Active Impersonations */}
        <div 
          onClick={() => setActiveTab('impersonation')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-2 cursor-pointer hover:border-amber-500/50 transition-all group"
        >
          <div className="text-[11px] font-mono text-slate-400 uppercase font-bold group-hover:text-amber-300">Active Impersonations</div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400 font-mono">3 Domains</span>
            <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-900">
              Action Required
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-400 h-full w-[50%]" />
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex justify-between">
            <span>Takedown in progress</span>
            <span>WAF Blocked</span>
          </div>
        </div>

        {/* Unpatched CVE Exposure */}
        <div 
          onClick={() => setActiveTab('vulnerabilities')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-2 cursor-pointer hover:border-rose-500/50 transition-all group"
        >
          <div className="text-[11px] font-mono text-slate-400 uppercase font-bold group-hover:text-rose-300">Unpatched CVE Exposure</div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400 font-mono">1 Critical</span>
            <span className="text-xs font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-900">
              SLA 48h
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-rose-500 h-full w-[35%]" />
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex justify-between">
            <span>CVE-2026-3112</span>
            <span>Automated Playbook</span>
          </div>
        </div>

        {/* Dark Web Mentions */}
        <div 
          onClick={() => setActiveTab('darkweb')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-2 cursor-pointer hover:border-cyan-500 transition-all group"
        >
          <div className="text-[11px] font-mono text-slate-400 uppercase font-bold group-hover:text-cyan-300">Dark Web Credential Leaks</div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-400 font-mono">{credentialLeaks.length} Leaks</span>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900">
              Investigating
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-400 h-full w-[20%]" />
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex justify-between">
            <span>Critical Exposure</span>
            <span>SecOps Notified</span>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow overflow-hidden">
        <div className="flex items-center border-b border-slate-800 px-4 bg-slate-950/60 overflow-x-auto gap-1">
          {[
            { id: 'risk-assets', label: `Assets Under Risk (${riskAssets.length})`, icon: ShieldAlert, badge: `${criticalCount} Critical` },
            { id: 'tickets', label: `Service Requests (${tickets.length})`, icon: Ticket, badge: `${tickets.filter(t => t.status === 'OPEN').length} Open` },
            { id: 'subdomains', label: `Subdomains & Perimeter (${subdomains.length})`, icon: Server },
            { id: 'vulnerabilities', label: `CVE & Patch Posture (${vulnerabilities.length})`, icon: AlertTriangle },
            { id: 'impersonation', label: `Brand & Typosquatting (${impersonations.length})`, icon: Globe },
            { id: 'darkweb', label: `Dark Web & Threat Intel (${darkwebMentions.length})`, icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold font-mono border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {/* TAB 1: ASSETS UNDER RISK */}
          {activeTab === 'risk-assets' && (
            <div className="space-y-4">
              {/* Header and Filter Controls */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Enterprise.com Infrastructure Assets Under Active Cyber Risk</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time risk priority scoring, unpatched CVE exposure, missing EDR coverage, and designated SOC contact ownership.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {/* Filter chips */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                    <button
                      onClick={() => setRiskLevelFilter('ALL')}
                      className={`px-2.5 py-1 rounded transition-all font-bold ${
                        riskLevelFilter === 'ALL' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({riskAssets.length})
                    </button>
                    <button
                      onClick={() => setRiskLevelFilter('CRITICAL')}
                      className={`px-2.5 py-1 rounded transition-all font-bold ${
                        riskLevelFilter === 'CRITICAL' ? 'bg-rose-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Critical ({criticalCount})
                    </button>
                    <button
                      onClick={() => setRiskLevelFilter('HIGH')}
                      className={`px-2.5 py-1 rounded transition-all font-bold ${
                        riskLevelFilter === 'HIGH' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      High ({highCount})
                    </button>
                    <button
                      onClick={() => setRiskLevelFilter('TIER1')}
                      className={`px-2.5 py-1 rounded transition-all font-bold ${
                        riskLevelFilter === 'TIER1' ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tier 1
                    </button>
                  </div>

                  {/* Search box */}
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={assetSearchQuery}
                      onChange={(e) => setAssetSearchQuery(e.target.value)}
                      placeholder="Filter host, IP, CVE..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Risk Summary Quick Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-slate-400">Targeted Hosts:</span>
                  <strong className="text-rose-400 font-bold">{filteredRiskAssets.length}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">⚠️</span>
                  <span className="text-slate-400">CISA KEV Overlaps:</span>
                  <strong className="text-amber-300 font-bold">{riskAssets.filter(a => a.cisaKev).length}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-rose-400">🛡️</span>
                  <span className="text-slate-400">Missing EDR Sensor:</span>
                  <strong className="text-rose-400 font-bold">{riskAssets.filter(a => a.edrStatus === 'Agent Missing').length}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">📊</span>
                  <span className="text-slate-400">Avg Risk Priority:</span>
                  <strong className="text-cyan-300 font-bold">83.6 / 100</strong>
                </div>
              </div>

              {/* List of Assets Under Risk */}
              <div className="space-y-3">
                {filteredRiskAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`bg-slate-950 border rounded-xl p-4 space-y-3 shadow-md transition-all ${
                      asset.isIsolated
                        ? 'border-amber-500/60 bg-amber-950/10'
                        : asset.riskLevel === 'CRITICAL'
                        ? 'border-rose-900/80 hover:border-rose-700/80'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          asset.riskLevel === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          RISK SCORE: {asset.riskScore}/100
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                          {asset.tier}
                        </span>

                        {asset.cisaKev && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            ⚠️ CISA KEV EXPLOITED
                          </span>
                        )}

                        {asset.isIsolated && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-200 border border-amber-600">
                            🔒 HOST ISOLATED VIA EDR
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          asset.edrStatus === 'Protected'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-900'
                            : 'bg-rose-950 text-rose-300 border border-rose-900 animate-pulse'
                        }`}>
                          EDR: {asset.edrStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      <div className="md:col-span-8 space-y-1.5">
                        <div className="flex items-baseline gap-2">
                          <Globe className="w-4 h-4 text-cyan-400 shrink-0 self-center" />
                          <h4 className="text-sm font-bold text-white font-mono">
                            {asset.hostname}
                          </h4>
                          <span className="text-xs text-cyan-300 font-mono">({asset.ipAddress})</span>
                          {asset.cveId && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-rose-400 font-bold border border-rose-900/50">
                              {asset.cveId} (CVSS {asset.cvssScore})
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300">
                          {asset.primaryExposure}
                        </p>

                        <div className="text-[11px] text-slate-400 font-mono flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-slate-500 font-bold">Threat Actors Targeting:</span>
                          {asset.threatActors.map((actor, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/40 text-[10px]">
                              {actor}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-4 bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="font-bold truncate">{asset.businessOwner}</span>
                        </div>
                        <a
                          href={`mailto:${asset.contactEmail}`}
                          className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{asset.contactEmail}</span>
                        </a>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          Remediation: <span className="text-slate-300">{asset.remediationAction}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls for this asset */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleIsolation(asset.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold transition-all border ${
                            asset.isIsolated
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                          }`}
                        >
                          {asset.isIsolated ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-rose-400" />}
                          <span>{asset.isIsolated ? 'Restore Network Access' : 'Isolate Host via EDR'}</span>
                        </button>

                        <button
                          onClick={() => handleDispatchRemediation(asset)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold transition-all"
                        >
                          <Send className="w-3.5 h-3.5 text-slate-400" />
                          <span>Dispatch Alert</span>
                        </button>

                        <button
                          onClick={() => handleOpenCreateTicketModal(asset)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-[11px] font-bold transition-all"
                        >
                          <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Raise Service Ticket</span>
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-500">
                        Asset ID: <span className="text-slate-400 font-bold">{asset.id}</span> • Status: <span className={asset.isIsolated ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>{asset.isIsolated ? 'Contained' : 'Active Risk'}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredRiskAssets.length === 0 && (
                  <div className="bg-slate-950 border border-slate-800 p-8 rounded-xl text-center text-slate-500 text-xs font-mono">
                    No enterprise assets found matching the selected risk filter criteria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SERVICE REQUEST TICKETS MODULE */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              {/* Header and Action Controls */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase text-white flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-cyan-400" />
                    <span>Enterprise.com Security Service Requests & Remediation Queue</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Track security posture remediation tickets, SLA targets, and automated SOAR integrations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleOpenCreateTicketModal()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Service Request</span>
                  </button>
                </div>
              </div>

              {/* Quick Summary Chips Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Total Requests:</span>
                  <strong className="text-white font-bold">{tickets.length}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-slate-400">P1 Critical:</span>
                  <strong className="text-rose-400 font-bold">
                    {tickets.filter((t) => t.priority.includes('P1')).length}
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">⏳</span>
                  <span className="text-slate-400">In Progress:</span>
                  <strong className="text-amber-300 font-bold">
                    {tickets.filter((t) => t.status === 'IN_PROGRESS').length}
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✅</span>
                  <span className="text-slate-400">Resolved:</span>
                  <strong className="text-emerald-300 font-bold">
                    {tickets.filter((t) => t.status === 'RESOLVED').length}
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">⚡</span>
                  <span className="text-slate-400">SOAR Synced:</span>
                  <strong className="text-cyan-300 font-bold">100%</strong>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                  {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setTicketStatusFilter(status)}
                      className={`px-3 py-1 rounded transition-all font-bold ${
                        ticketStatusFilter === status
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {status === 'ALL' ? 'All' : status.replace('_', ' ')} (
                      {status === 'ALL'
                        ? tickets.length
                        : tickets.filter((t) => t.status === status).length}
                      )
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={ticketCategoryFilter}
                    onChange={(e) => setTicketCategoryFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Vulnerability Patching">Vulnerability Patching</option>
                    <option value="EDR Agent Deployment">EDR Agent Deployment</option>
                    <option value="TLS/SSL Certificate Renewal">TLS/SSL Certificate Renewal</option>
                    <option value="Perimeter Takedown">Perimeter Takedown</option>
                    <option value="WAF Hardening">WAF Hardening</option>
                    <option value="Access Control & MFA">Access Control & MFA</option>
                  </select>

                  <div className="relative flex-1 sm:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={ticketSearchQuery}
                      onChange={(e) => setTicketSearchQuery(e.target.value)}
                      placeholder="Search tickets, assets, owners..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-cyan-400 font-bold font-mono text-xs">
                          <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{ticket.id}</span>
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                          {ticket.category}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            ticket.priority.includes('P1')
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : ticket.priority.includes('P2')
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-900 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {ticket.priority}
                        </span>

                        {ticket.syncedToSoar && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-900 text-emerald-400 border border-emerald-900">
                            ⚡ SOAR Synced
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                            ticket.status === 'RESOLVED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : ticket.status === 'IN_PROGRESS'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                          }`}
                        >
                          {ticket.status === 'RESOLVED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{ticket.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                    </div>

                    {/* Title & Asset Details */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      <div className="md:col-span-8 space-y-1.5">
                        <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                          <span>{ticket.title}</span>
                        </h4>

                        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                          <Server className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="text-slate-400">Affected Asset:</span>
                          <span className="text-cyan-300 font-bold">{ticket.affectedAsset}</span>
                        </div>

                        <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                          {ticket.justification}
                        </p>
                      </div>

                      <div className="md:col-span-4 bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-mono">Assigned Owner:</span>
                          <span className="font-bold text-slate-200 truncate">{ticket.owner}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-mono">Department:</span>
                          <span className="text-slate-300">{ticket.department}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-mono">SLA Window:</span>
                          <span className="text-amber-400 font-bold font-mono">{ticket.slaWindow}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                          <span className="text-slate-500 font-mono">Requester:</span>
                          <span className="text-slate-300 font-mono truncate">{ticket.requester}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Update Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        {ticket.status !== 'IN_PROGRESS' && ticket.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'IN_PROGRESS')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-bold transition-all"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Mark In Progress</span>
                          </button>
                        )}

                        {ticket.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'RESOLVED')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-[11px] font-bold transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Resolve Ticket</span>
                          </button>
                        )}

                        {ticket.status === 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'OPEN')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                            <span>Reopen Ticket</span>
                          </button>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-500">
                        Created: <span className="text-slate-400">{ticket.createdAt}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTickets.length === 0 && (
                  <div className="bg-slate-950 border border-slate-800 p-8 rounded-xl text-center text-slate-500 text-xs font-mono">
                    No service request tickets found matching your filter criteria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SUBDOMAINS & PERIMETER */}
          {activeTab === 'subdomains' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono uppercase text-slate-300">
                  Monitored Enterprise.com Subdomain Inventory & EDR Health
                </h3>
                <span className="text-xs font-mono text-cyan-400">DNS Zone: enterprise.com (Cloudflare Managed)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Subdomain Host</th>
                      <th className="p-3">Resolved IP</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">SSL Certificate</th>
                      <th className="p-3">Risk Level</th>
                      <th className="p-3">EDR Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {subdomains.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/50">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{sub.name}</span>
                          {sub.isRisk && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-900">
                              Under Risk
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300">{sub.ip}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.status === 'Secure' ? 'bg-emerald-950 text-emerald-300 border border-emerald-900' :
                            sub.status.includes('Warning') || sub.status.includes('Monitor') ? 'bg-amber-950 text-amber-300 border border-amber-900' :
                            'bg-rose-950 text-rose-300 border border-rose-900'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{sub.ssl}</td>
                        <td className="p-3">
                          <span className={`font-bold ${
                            sub.risk === 'Low' ? 'text-emerald-400' : sub.risk === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {sub.risk}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{sub.edr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CVE & PATCH POSTURE */}
          {activeTab === 'vulnerabilities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono uppercase text-slate-300">
                  Enterprise.com Active CVE & Vulnerability Posture
                </h3>
                <span className="text-xs font-mono text-emerald-400">Automated Patch Orchestration: Enabled</span>
              </div>

              <div className="space-y-3">
                {vulnerabilities.map((v, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400 font-mono">{v.cve}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          v.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          CVSS {v.cvss} - {v.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                          Target: {v.affectedAsset}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-200">{v.title}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                        v.status === 'Patch Deployed' || v.status === 'Mitigated' ? 'bg-emerald-950 text-emerald-300 border border-emerald-900' : 'bg-cyan-950 text-cyan-300 border border-cyan-900'
                      }`}>
                        {v.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BRAND IMPERSONATION */}
          {activeTab === 'impersonation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono uppercase text-slate-300">
                  Brand Impersonation & Typosquatting Detection (Enterprise.com)
                </h3>
                <span className="text-xs font-mono text-cyan-400">Automated Registrar Takedown API Active</span>
              </div>

              <div className="space-y-3">
                {impersonations.map((imp, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-white font-mono">{imp.domain}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-900">
                          {imp.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Registrar: {imp.registrar} • Created: {imp.created}
                      </div>
                    </div>

                    <button
                      onClick={() => handleTakedown(imp.domain)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow"
                    >
                      Trigger Takedown
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DARK WEB MENTIONS */}
          {activeTab === 'darkweb' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Underground Mentions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>Dark Web Underground Mentions</span>
                    </h3>
                    <span className="text-[10px] font-mono text-amber-400">{darkwebMentions.length} Bulletins</span>
                  </div>

                  <div className="space-y-3">
                    {darkwebMentions.map((dw, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-cyan-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold text-white">{dw.source}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${dw.severity === 'HIGH' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'}`}>
                              Actor: {dw.threatActor}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{dw.date}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                          "{dw.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specific Credential Leaks */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-rose-400" />
                      <span>Exposed Enterprise Credentials</span>
                    </h3>
                    <span className="text-[10px] font-mono text-rose-400">{credentialLeaks.length} Exposed Accounts</span>
                  </div>

                  <div className="overflow-hidden border border-slate-800 rounded-xl shadow-lg">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-950 text-slate-400">
                        <tr>
                          <th className="px-4 py-2 border-b border-slate-800">Affected Identity</th>
                          <th className="px-4 py-2 border-b border-slate-800">Leak Source</th>
                          <th className="px-4 py-2 border-b border-slate-800">Severity</th>
                          <th className="px-4 py-2 border-b border-slate-800">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {credentialLeaks.map((leak, idx) => (
                          <tr key={idx} className="bg-slate-900/40 hover:bg-slate-900 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="text-white font-bold">{leak.email}</span>
                                <span className="text-[10px] text-slate-500 italic">{leak.leakType}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              <div className="flex flex-col">
                                <span>{leak.source}</span>
                                <span className="text-[10px] text-slate-500">{leak.date}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                leak.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-900' : 
                                leak.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-900' : 
                                'bg-blue-950 text-blue-400 border border-blue-900'
                              }`}>
                                {leak.severity}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-bold text-[10px]">{leak.status}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Service Request Ticket */}
      {serviceTicketModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Create Security Service Request</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      ENTERPRISE-SR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select an asset from Enterprise.com posture inventory to automatically pre-fill affected asset details and owner.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setServiceTicketModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5 text-xs">
              {/* Asset Selection Dropdown from Posture Inventory */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-cyan-300 font-bold flex items-center gap-1.5 text-xs">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Select Asset from Posture Inventory</span>
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900">
                    AUTO-PREFILL ACTIVE
                  </span>
                </div>
                <select
                  value={ticketModalSelectedAssetId}
                  onChange={(e) => handleAssetSelectInModal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                >
                  {riskAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.hostname} ({a.ipAddress}) | {a.tier} | Owner: {a.businessOwner}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Ticket Category</label>
                  <select
                    value={ticketModalCategory}
                    onChange={(e) => setTicketModalCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Vulnerability Patching">Vulnerability Patching</option>
                    <option value="EDR Agent Deployment">EDR Agent Deployment</option>
                    <option value="TLS/SSL Certificate Renewal">TLS/SSL Certificate Renewal</option>
                    <option value="Perimeter Takedown">Perimeter Takedown</option>
                    <option value="WAF Hardening">WAF Hardening</option>
                    <option value="Access Control & MFA">Access Control & MFA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Priority / Urgency</label>
                  <select
                    value={ticketModalPriority}
                    onChange={(e) => setTicketModalPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="P1 - Critical">P1 - Critical</option>
                    <option value="P2 - High">P2 - High</option>
                    <option value="P3 - Medium">P3 - Medium</option>
                    <option value="P4 - Low">P4 - Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Request Summary / Title</label>
                <input
                  type="text"
                  value={ticketModalTitle}
                  onChange={(e) => setTicketModalTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Pre-filled Affected Asset & Owner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Server className="w-3 h-3 text-cyan-400" />
                      <span>Affected Asset</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-950/60 px-1.5 py-0.5 rounded">Pre-filled</span>
                  </label>
                  <input
                    type="text"
                    value={ticketModalAffectedAsset}
                    onChange={(e) => setTicketModalAffectedAsset(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-cyan-400" />
                      <span>Owner</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-950/60 px-1.5 py-0.5 rounded">Pre-filled</span>
                  </label>
                  <input
                    type="text"
                    value={ticketModalOwner}
                    onChange={(e) => setTicketModalOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Owner Contact Email & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>Owner Contact Email</span>
                  </label>
                  <input
                    type="email"
                    value={ticketModalOwnerEmail}
                    onChange={(e) => setTicketModalOwnerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target SLA Window</label>
                  <select
                    value={ticketModalSla}
                    onChange={(e) => setTicketModalSla(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="4 Hours (P1 Critical SLA)">4 Hours (P1 Critical SLA)</option>
                    <option value="24 Hours (Standard SOC SLA)">24 Hours (Standard SOC SLA)</option>
                    <option value="72 Hours (Routine Review)">72 Hours (Routine Review)</option>
                  </select>
                </div>
              </div>

              {/* Requester Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Requester Name</label>
                  <input
                    type="text"
                    value={ticketModalRequester}
                    onChange={(e) => setTicketModalRequester(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Requester Email</label>
                  <input
                    type="email"
                    value={ticketModalRequesterEmail}
                    onChange={(e) => setTicketModalRequesterEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Ticket Justification & Remediation Scope</label>
                <textarea
                  rows={2}
                  value={ticketModalJustification}
                  onChange={(e) => setTicketModalJustification(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={ticketModalNotifyOwner}
                    onChange={(e) => setTicketModalNotifyOwner(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Dispatch ticket notification directly to Asset Owner ({ticketModalOwner || 'Owner'})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={ticketModalSyncSoar}
                    onChange={(e) => setTicketModalSyncSoar(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Sync ticket to Splunk SOAR / Enterprise SecOps Incident Queue</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setServiceTicketModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
