import { SplunkInstance } from '../components/SplunkSIEMConsole';

export interface SplunkUseCase {
  id: string;
  instance: SplunkInstance;
  title: string;
  category: 'Rule Validation' | 'Ransomware Response' | 'OT Infrastructure' | 'Cloud & Identity' | 'Credential Protection';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  targetIndex: string;
  splQuery: string;
  expectedAlertCount: number;
  mitreTechnique: string;
  automatedAction: string;
}

export const SPLUNK_USE_CASES: SplunkUseCase[] = [
  // DEV USE CASES (STAGING & REGRESSION TEST)
  {
    id: 'UC-DEV-01',
    instance: 'dev',
    title: 'Synthetic Mimikatz LSASS Injection Testing (Staging)',
    category: 'Rule Validation',
    severity: 'HIGH',
    description: 'Simulated memory dump execution against staging host DEV-WIN-HOST-01 to validate detection rule DET-EP-001 prior to production deployment.',
    targetIndex: 'dev-winlogs',
    splQuery: 'index=dev-winlogs sourcetype="sysmon" EventCode=10 GrantedAccess="0x1010" | stats count by host, SourceImage, user',
    expectedAlertCount: 3,
    mitreTechnique: 'T1003.001 - OS Credential Dumping',
    automatedAction: 'Triggers DEV SIEM Alert Notification & Rule Validation Pass'
  },
  {
    id: 'UC-DEV-02',
    instance: 'dev',
    title: 'HTTP Event Collector (HEC) Schema & Rate Limit Verification',
    category: 'Rule Validation',
    severity: 'MEDIUM',
    description: 'Automated test payload injection into staging HEC endpoint (hec-dev.internal) to test parser resilience under high EPS bursts.',
    targetIndex: 'dev-hec',
    splQuery: 'index=dev-hec sourcetype="hec:raw" | stats count by sourcetype, status',
    expectedAlertCount: 12,
    mitreTechnique: 'T1562 - Impair Defenses',
    automatedAction: 'Logs HEC EPS statistics to Developer Dashboard'
  },
  {
    id: 'UC-DEV-03',
    instance: 'dev',
    title: 'Modbus TCP Function Code Fuzzing on SCADA Simulator',
    category: 'OT Infrastructure',
    severity: 'HIGH',
    description: 'Fuzzing test sending malformed Modbus function code 0x0f (Force Multiple Coils) to staging PLC DEV-SCADA-PLC-01.',
    targetIndex: 'dev-netlogs',
    splQuery: 'index=dev-netlogs dest_port=502 | stats count by src_ip, dest_ip, action',
    expectedAlertCount: 5,
    mitreTechnique: 'T0855 - Unauthorized Command Message',
    automatedAction: 'Verifies Industrial Firewall Modbus filter rule activation'
  },
  {
    id: 'UC-DEV-04',
    instance: 'dev',
    title: 'OAuth Consent Grant Regression Test on Staging Okta',
    category: 'Cloud & Identity',
    severity: 'MEDIUM',
    description: 'Simulated user consent grant for unverified multi-tenant application on DEV-OKTA-STAGING to test CASB policy triggers.',
    targetIndex: 'dev-cloudlogs',
    splQuery: 'index=dev-cloudlogs sourcetype="okta:system" eventType="app.oauth2.as.grant_consent" | table _time, actor, client_id, status',
    expectedAlertCount: 2,
    mitreTechnique: 'T1528 - Applications Access Token',
    automatedAction: 'Simulates auto-revocation of OAuth grant in test tenant'
  },

  // PROD USE CASES (LIVE SOC INCIDENT RESPONSE)
  {
    id: 'UC-PROD-01',
    instance: 'prod',
    title: 'LockBit 3.0 Volume Shadow Copy Erasure & EDR Isolation',
    category: 'Ransomware Response',
    severity: 'CRITICAL',
    description: 'Live production detection of vssadmin.exe shadow copy deletion on FINANCE-WS-09 triggered by compromised admin credentials.',
    targetIndex: 'winlogs',
    splQuery: 'index=winlogs sourcetype="WinEventLog:Security" EventCode=4688 CommandLine="*vssadmin*delete*shadows*" | table _time, host, user, CommandLine',
    expectedAlertCount: 8,
    mitreTechnique: 'T1490 - Inhibit System Recovery',
    automatedAction: 'Executes EDR Host Isolation Playbook & Alerts On-Call SOC Manager'
  },
  {
    id: 'UC-PROD-02',
    instance: 'prod',
    title: 'Volt Typhoon Living-off-the-Land Cisco ASA OT Tunneling',
    category: 'OT Infrastructure',
    severity: 'CRITICAL',
    description: 'Real-time production alert for unauthorized outbound SSH port 22 tunnel created from Cisco ASA firewall into OT SCADA subnet.',
    targetIndex: 'netlogs',
    splQuery: 'index=netlogs sourcetype="cisco:asa" action="built" dest_port=22 | stats count by src_ip, dest_ip, action | where count > 0',
    expectedAlertCount: 4,
    mitreTechnique: 'T1572 - Protocol Tunneling',
    automatedAction: 'Applies ASA OS ACL blocking VPN source IP & Notifies OT Lead'
  },
  {
    id: 'UC-PROD-03',
    instance: 'prod',
    title: 'Scattered Spider Okta Identity Hijack & OAuth Token Abuse',
    category: 'Cloud & Identity',
    severity: 'HIGH',
    description: 'Production correlation of MFA fatigue failure spikes followed by high-privilege Graph API consent grants on OKTA-TENANT-PROXY.',
    targetIndex: 'cloudlogs',
    splQuery: 'index=cloudlogs sourcetype="okta:system" (eventType="app.oauth2.as.grant_consent" OR status="FAILURE") | stats count by user, src_ip, status',
    expectedAlertCount: 6,
    mitreTechnique: 'T1078.004 - Cloud Accounts',
    automatedAction: 'Revokes active Okta user session tokens & forces FIDO2 MFA'
  },
  {
    id: 'UC-PROD-04',
    instance: 'prod',
    title: 'Active Directory Kerberoasting & RC4 TGS Ticket Request',
    category: 'Credential Protection',
    severity: 'HIGH',
    description: 'Detects EventCode 4769 TGS requests specifying legacy RC4 encryption (0x17) targeting SPNs on DC-GLOBAL-01.',
    targetIndex: 'winlogs',
    splQuery: 'index=winlogs sourcetype="WinEventLog:Security" EventCode=4769 TicketEncryptionType="0x17" | stats count by ServiceName, TargetUserName, IpAddress',
    expectedAlertCount: 7,
    mitreTechnique: 'T1558.003 - Kerberoasting',
    automatedAction: 'Enforces automated password reset on targeted SPN service account'
  }
];
