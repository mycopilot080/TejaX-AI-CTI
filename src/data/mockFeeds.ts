import { CTIAdvisory } from '../types/cti';

export const INITIAL_FEEDS: CTIAdvisory[] = [
  {
    id: 'ADV-2026-8812',
    source: 'CISA KEV',
    title: 'CVE-2026-21840: Windows Kernel Privilege Escalation via LSASS Memory Injection',
    cveId: 'CVE-2026-21840',
    cvssScore: 9.8,
    threatActor: 'APT28 (Fancy Bear)',
    malwareFamily: 'LazarusStealer v4',
    targetSectors: ['Financial Services', 'Defense Contracting', 'Critical Infrastructure'],
    summary: 'Active zero-day exploitation of an unquoted buffer overflow in Windows Local Security Authority Subsystem Service (LSASS) enabling arbitrary Kernel-level code execution and immediate memory dumping.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    mitreTtps: ['T1003.001 - OS Credential Dumping', 'T1055 - Process Injection', 'T1068 - Exploitation for Privilege Escalation'],
    cyberKillChainStage: 'Exploitation',
    detectionRules: {
      sigma: `title: LSASS Process Tampering via Unquoted Buffer Overflow
id: 5b4d9a1e-81fa-4081-b219-cisa202601
status: experimental
description: Detects memory access requests to lsass.exe originating from non-system processes with privilege mask 0x1010.
logsource:
    category: process_access
    product: windows
detection:
    selection:
        TargetImage|endswith: '\\lsass.exe'
        GrantedAccess: '0x1010'
    filter:
        SourceImage|endswith: '\\csrss.exe'
    condition: selection and not filter
falsepositives:
    - Third-party Antivirus agents
level: critical`,
      kql: `SecurityEvent
| where EventID == 4688 or EventID == 10
| where TargetImage endswith @"\\lsass.exe" and GrantedAccess == "0x1010"
| summarize Count=count() by Computer, Account, SourceImage, bin(TimeGenerated, 5m)`,
      cql: `event_simpleName=ProcessRollup2 TargetFileName="*\\\\lsass.exe" GrantedAccess="0x1010" | table _time, ComputerName, UserName, ImageFileName`,
      spl: `index=winlogs sourcetype="sysmon" EventCode=10 TargetImage="*\\\\lsass.exe" GrantedAccess="0x1010" | stats count by host, SourceImage, GrantedAccess | where count > 1`
    },
    recommendedMitigations: [
      'Apply Microsoft Security Update KB5038912 immediately across domain controllers.',
      'Enforce Credential Guard on Windows 11 / Server 2022 endpoint fleets.',
      'Isolate compromised hosts using EDR containment playbooks.'
    ]
  },
  {
    id: 'ADV-2026-7491',
    source: 'Microsoft MSRC',
    title: 'CVE-2026-30114: Entra ID / Okta OAuth Token Hijacking via Malicious App Registrations',
    cveId: 'CVE-2026-30114',
    cvssScore: 9.1,
    threatActor: 'Scattered Spider (UNC3944)',
    malwareFamily: 'OAuthSnatcher',
    targetSectors: ['SaaS Platforms', 'Telecommunications', 'Healthcare'],
    summary: 'OAuth consent abuse targeting corporate Entra ID and Okta directories allowing threat actors to register rogue multitenant application proxies that bypass MFA and harvest API refresh tokens.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    mitreTtps: ['T1528 - Applications Access Token', 'T1550.001 - Application Access Token Reuse', 'T1078.004 - Cloud Accounts'],
    cyberKillChainStage: 'Command and Control',
    detectionRules: {
      sigma: `title: Rogue OAuth App Registration Consent Granted
id: a71b3e92-3341-4882-901e-msrc202602
status: production
description: Detects user consent granted to unverified multitenant OAuth apps with high-risk scopes (Directory.ReadWrite.All, Mail.ReadWrite).
logsource:
    product: azure
    service: auditlogs
detection:
    selection:
        OperationName: 'Consent to application'
        Result: 'success'
    condition: selection
level: high`,
      kql: `AuditLogs
| where OperationName == "Consent to application"
| extend AppName = tostring(TargetResources[0].displayName)
| extend Scopes = tostring(TargetResources[0].modifiedProperties)
| where Scopes has_any ("Directory.ReadWrite.All", "Mail.ReadWrite", "FullAccess")
| project TimeGenerated, InitiatedBy, AppName, Scopes`,
      cql: `event_platform=cloud vendor=okta legacy_event_type="user.authentication.oauth.grant" | table _time, actor_email, app_title`,
      spl: `index=cloudlogs sourcetype="okta:system" legacy_event_type="user.authentication.auth_via_mfa" OR legacy_event_type="app.oauth2.as.grant_consent" | stats count by actor.alternateId, target{}.displayName | where count > 3`
    },
    recommendedMitigations: [
      'Restrict user consent for unverified multitenant applications in Entra ID.',
      'Audit existing Enterprise Applications for privileged Graph API permissions.',
      'Require admin consent workflows for all OAuth application integrations.'
    ]
  },
  {
    id: 'ADV-2026-9032',
    source: 'DFIR Labs',
    title: 'LockBit 3.0 Blackout: Shadow Copy Deletion and Volume Encryption Campaign',
    cveId: 'CVE-2026-11099',
    cvssScore: 9.6,
    threatActor: 'LockBit Supporter Group',
    malwareFamily: 'LockBit 3.0 Blackout',
    targetSectors: ['Manufacturing', 'Logistics', 'Retail'],
    summary: 'Ransomware deployment utilizing hijacked PsExec and vssadmin.exe scripts to purge volume shadow copies, stop database services, and encrypt files with custom .lockbit extension.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    mitreTtps: ['T1490 - Inhibit System Recovery', 'T1486 - Data Encrypted for Impact', 'T1570 - Lateral Tool Transfer'],
    cyberKillChainStage: 'Actions on Objectives',
    detectionRules: {
      sigma: `title: Volume Shadow Copy Deletion via VSSAdmin or PowerShell
id: c92e1003-7721-4d1a-881e-dfir202603
status: production
description: Detects command line executions attempting to delete shadow copies using vssadmin, wmic, or PowerShell Get-WmiObject.
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        CommandLine|contains:
            - 'vssadmin.exe delete shadows'
            - 'wmic shadowcopy delete'
            - 'Resize-Partition'
    condition: selection
level: critical`,
      kql: `SecurityEvent
| where EventID == 4688
| where CommandLine has_any ("vssadmin.exe delete shadows", "wmic shadowcopy delete", "wbadmin delete catalog")
| project TimeGenerated, Computer, Account, CommandLine, ParentProcessName`,
      cql: `event_simpleName=ProcessRollup2 (CommandLine="*vssadmin*delete*shadows*" OR CommandLine="*wmic*shadowcopy*delete*") | table _time, ComputerName, UserName, CommandLine`,
      spl: `index=winlogs sourcetype="WinEventLog:Security" EventCode=4688 (CommandLine="*vssadmin*delete*shadows*" OR CommandLine="*wmic*shadowcopy*delete*") | stats count by host, User, CommandLine`
    },
    recommendedMitigations: [
      'Enable TAM / Immutable Offsite Backups immediately.',
      'Deploy EDR rules blocking non-system executions of vssadmin.exe.',
      'Isolate affected AD domain controllers to stop active lateral propagation.'
    ]
  },
  {
    id: 'ADV-2026-6102',
    source: 'CERT/CC',
    title: 'Volt Typhoon Living-off-the-Land (LotL) Cisco ASA VPN Session Hijacking',
    cveId: 'CVE-2026-4401',
    cvssScore: 8.8,
    threatActor: 'Volt Typhoon (BRONZE SILHOUETTE)',
    malwareFamily: 'TunnelSocks v2',
    targetSectors: ['Energy Grid', 'Water Utilities', 'Government Agencies'],
    summary: 'State-sponsored adversary leveraging stolen zero-trust credentials and custom web shells placed in Cisco ASA VPN appliance memory to proxy stealth SSH tunnels into operational technology (OT) networks.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    mitreTtps: ['T1021.004 - SSH Lateral Movement', 'T1133 - External Remote Services', 'T1572 - Protocol Tunneling'],
    cyberKillChainStage: 'Command and Control',
    detectionRules: {
      sigma: `title: Anomalous VPN Session SSH Tunneling to Internal OT Assets
id: e489012a-0012-4c81-aa11-cert202604
status: production
description: Detects VPN established sessions generating high-frequency outbound SSH connections directly toward SCADA or OT subnet ranges.
logsource:
    category: firewall
    product: cisco
detection:
    selection:
        action: 'built'
        dest_port: 22
        src_zone: 'VPN-SSL'
    condition: selection
level: high`,
      kql: `CiscoASA
| where Action == "Built" and DestPort == 22 and SrcZone == "VPN-SSL"
| summarize ConnectionCount=count() by SrcIP, DestIP, bin(TimeGenerated, 10m)
| where ConnectionCount > 20`,
      cql: `event_simpleName=NetworkConnect dest_port=22 src_ip_type="VPN" | stats count() by src_ip, dest_ip`,
      spl: `index=netlogs sourcetype="cisco:asa" action="built" dest_port=22 | stats count by src_ip, dest_ip | where count > 15`
    },
    recommendedMitigations: [
      'Enforce hardware FIDO2 key authentication for all VPN gateway accounts.',
      'Segment IT and OT network boundaries with strict unidirectional gateways.',
      'Perform memory forensic dumps of Cisco ASA firmware image integrity.'
    ]
  },
  {
    id: 'ADV-2026-5219',
    source: 'Threat Research',
    title: 'AWS CloudTrail Log Tampering & S3 Bucket Exfiltration via Compromised IAM Roles',
    cveId: 'CVE-2026-1088',
    cvssScore: 8.5,
    threatActor: 'FIN7 (Carbanak)',
    malwareFamily: 'CloudExfil360',
    targetSectors: ['FinTech', 'E-Commerce', 'Cloud Infrastructure'],
    summary: 'Cloud threat actor exploiting temporary STS credentials from leaked Lambda environment variables to disable AWS CloudTrail logging and execute bulk Amazon S3GetObject calls.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    mitreTtps: ['T1562.002 - Disable Cloud Logs', 'T1530 - Data from Cloud Storage Object', 'T1078.004 - Cloud Accounts'],
    cyberKillChainStage: 'Actions on Objectives',
    detectionRules: {
      sigma: `title: AWS CloudTrail Disabled or Logging Stopped
id: 112003fe-2201-4190-b99d-tr202605
status: production
description: Detects AWS API calls attempting to stop CloudTrail logging or delete trail configurations.
logsource:
    product: aws
    service: cloudtrail
detection:
    selection:
        eventName:
            - 'StopLogging'
            - 'DeleteTrail'
            - 'UpdateTrail'
    condition: selection
level: critical`,
      kql: `AWSCloudTrail
| where EventName in ("StopLogging", "DeleteTrail", "UpdateTrail")
| project TimeGenerated, UserIdentityArn, SourceIpAddress, EventName, RequestParameters`,
      cql: `event_platform=cloud vendor=aws event_name IN ("StopLogging", "DeleteTrail") | table _time, user_identity_arn, source_ip_address`,
      spl: `index=cloudlogs sourcetype="aws:cloudtrail" (eventName="StopLogging" OR eventName="DeleteTrail") | stats count by user, sourceIPAddress, eventName`
    },
    recommendedMitigations: [
      'Enable Service Control Policies (SCPs) preventing StopLogging API calls.',
      'Rotate AWS STS credentials and restrict IAM policy permissions.',
      'Enable S3 Object Lock and Object Versioning on core data buckets.'
    ]
  }
];
