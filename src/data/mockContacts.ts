import { ContactDetail } from '../types/cti';

export const INITIAL_CONTACTS: ContactDetail[] = [
  {
    id: 'CTC-001',
    name: 'Sharath Kumar',
    title: 'Lead SOC & Threat Intelligence Manager',
    department: 'Global Security Operations Center',
    email: 'sharath.skt55@gmail.com',
    phone: '+1 (555) 019-2834',
    pagerDutyEscalation: 'PAGER-SOC-TIER3-01',
    shiftCoverage: '24/7 Primary',
    assignedAssets: ['AST-001', 'AST-003', 'AST-007'],
    status: 'ACTIVE_ON_CALL',
    notes: 'Primary point of contact for P1/P2 Incident Response & CTI Dispatch.'
  },
  {
    id: 'CTC-002',
    name: 'Elena Rostova',
    title: 'Senior Active Directory & Identity Admin',
    department: 'Identity & Access Management (IAM)',
    email: 'sysadmin@enterprise.com',
    phone: '+1 (555) 018-9942',
    pagerDutyEscalation: 'PAGER-IAM-ESC-02',
    shiftCoverage: 'US East SOC',
    assignedAssets: ['AST-001', 'AST-003'],
    status: 'AVAILABLE',
    notes: 'Handles Domain Controller Kerberos & Okta Tenant MFA escalations.'
  },
  {
    id: 'CTC-003',
    name: 'Marcus Vance',
    title: 'VP & Chief Information Security Officer (CISO)',
    department: 'Executive Risk & Compliance',
    email: 'ciso-office@enterprise.com',
    phone: '+1 (555) 010-4411',
    pagerDutyEscalation: 'PAGER-EXEC-CRISIS',
    shiftCoverage: 'On-Call Escalation',
    assignedAssets: ['AST-001', 'AST-004', 'AST-011'],
    status: 'AVAILABLE',
    notes: 'Requires daily 24-hour CTI executive summary reports.'
  },
  {
    id: 'CTC-004',
    name: 'Chen Wei',
    title: 'Cloud Infrastructure & DevOps SecOps Lead',
    department: 'Cloud Platform Engineering',
    email: 'cloud-devsec@enterprise.com',
    phone: '+1 (555) 014-8833',
    pagerDutyEscalation: 'PAGER-AWS-AZURE-OPS',
    shiftCoverage: 'APAC SOC',
    assignedAssets: ['AST-005', 'AST-006', 'AST-010'],
    status: 'ACTIVE_ON_CALL',
    notes: 'Leads AWS SCP policies, Terraform state auditing, and K8s ingress.'
  },
  {
    id: 'CTC-005',
    name: 'David O\'Connor',
    title: 'OT & Industrial Control System Security Lead',
    department: 'OT Field Operations & SCADA Tech',
    email: 'ot-sec@enterprise.com',
    phone: '+1 (555) 017-3390',
    pagerDutyEscalation: 'PAGER-OT-PLANT-04',
    shiftCoverage: 'EMEA SOC',
    assignedAssets: ['AST-004', 'AST-009'],
    status: 'AVAILABLE',
    notes: 'Manages firewall rules, Modbus/DNP3 protocols, and Cisco ASA ASA OS.'
  },
  {
    id: 'CTC-006',
    name: 'Aisha Patel',
    title: 'Lead Database Administrator & Data Governance',
    department: 'Core Data Engineering',
    email: 'db-sec@enterprise.com',
    phone: '+1 (555) 012-7721',
    pagerDutyEscalation: 'PAGER-DBA-CRITICAL',
    shiftCoverage: 'US East SOC',
    assignedAssets: ['AST-007', 'AST-008'],
    status: 'AVAILABLE',
    notes: 'Manages PostgreSQL encryption, audit logging, and SAP ERP databases.'
  },
  {
    id: 'CTC-007',
    name: 'Financial Systems SecOps Team',
    title: 'Core Treasury & Payment Operations',
    department: 'Financial Technology Ops',
    email: 'finance-it@enterprise.com',
    phone: '+1 (555) 019-5500',
    pagerDutyEscalation: 'PAGER-FIN-SWIFT',
    shiftCoverage: '24/7 Primary',
    assignedAssets: ['AST-002', 'AST-011'],
    status: 'ACTIVE_ON_CALL',
    notes: 'Responsible for SWIFT gateway & corporate finance workstation security.'
  },
  {
    id: 'CTC-008',
    name: 'Sarah Jenkins',
    title: 'Incident Response & Forensic Handler',
    department: 'Digital Forensics & Incident Response (DFIR)',
    email: 'dfir-tier2@enterprise.com',
    phone: '+1 (555) 016-6644',
    pagerDutyEscalation: 'PAGER-DFIR-HOTLINE',
    shiftCoverage: 'EMEA SOC',
    assignedAssets: ['AST-001', 'AST-002', 'AST-012'],
    status: 'OFF_SHIFT',
    notes: 'Specializes in memory forensics, PCAP analysis, and ransomware remediation.'
  }
];
