import { DetectionRule } from '../types/cti';

export const INITIAL_DETECTION_RULES: DetectionRule[] = [
  {
    id: 'DET-EP-001',
    name: 'LSASS Memory Dumping via Process Injection or Direct Handle',
    category: 'Endpoint Security',
    severity: 'CRITICAL',
    riskScore: 95,
    description: 'Detects processes requesting elevated access masks (0x1010 or 0x1F0FFF) to lsass.exe process memory space typical of Mimikatz or Cobalt Strike sekurlsa module.',
    mitreTechniques: ['T1003.001 - OS Credential Dumping: LSASS Memory'],
    enabled: true,
    triggerCount: 14,
    lastTriggered: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    splQuery: `index=winlogs sourcetype="sysmon" EventCode=10 TargetImage="*\\\\lsass.exe" GrantedAccess="0x1010" OR GrantedAccess="0x1f0fff" | stats count by host, SourceImage, GrantedAccess, User`,
    sigmaRule: `title: LSASS Process Access
id: 5b4d9a1e-81fa-4081-b219-cisa202601
logsource:
    category: process_access
    product: windows
detection:
    selection:
        TargetImage|endswith: '\\lsass.exe'
        GrantedAccess:
            - '0x1010'
            - '0x1F0FFF'
    condition: selection
level: critical`,
    kql: `SecurityEvent
| where EventID == 10
| where TargetImage endswith @"\\lsass.exe" and GrantedAccess in ("0x1010", "0x1F0FFF")
| project TimeGenerated, Computer, SourceImage, GrantedAccess`,
    cql: `event_simpleName=ProcessRollup2 TargetFileName="*\\\\lsass.exe" (GrantedAccess="0x1010" OR GrantedAccess="0x1F0FFF") | table _time, ComputerName, UserName, ImageFileName`
  },
  {
    id: 'DET-ID-002',
    name: 'Kerberos Password Spraying Anomaly (Multiple EventID 4625 Failures)',
    category: 'Identity & Access',
    severity: 'HIGH',
    riskScore: 80,
    description: 'Detects single IP addresses generating > 5 failed Kerberos pre-authentication requests across distinct user accounts in a 5-minute window.',
    mitreTechniques: ['T1110.003 - Password Spraying', 'T1558 - Steal or Forge Kerberos Tickets'],
    enabled: true,
    triggerCount: 8,
    lastTriggered: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    splQuery: `index=winlogs sourcetype="WinEventLog:Security" EventCode=4625 | stats dc(user) as UniqueUsers count by src_ip, host | where UniqueUsers >= 3`,
    sigmaRule: `title: Password Spraying Detection
id: a801129e-2104-4b21-99a0-spray01
logsource:
    category: authentication
    product: windows
detection:
    selection:
        EventID: 4625
    condition: selection | count() by src_ip > 5
level: high`,
    kql: `SecurityEvent
| where EventID == 4625
| summarize UniqueUsers = dcount(TargetUserName), TotalFailures = count() by IpAddress, bin(TimeGenerated, 5m)
| where UniqueUsers >= 3`,
    cql: `event_platform=cloud legacy_event_type="user.session.start" status="FAILURE" | stats dc(actor_email) as Users by src_ip | where Users >= 3`
  },
  {
    id: 'DET-NET-003',
    name: 'Anomalous SSH Protocol Tunneling to OT Network Boundaries',
    category: 'Network Threats',
    severity: 'HIGH',
    riskScore: 88,
    description: 'Detects internal hosts or VPN clients generating high volumes of SSH port 22 connections toward isolated Operational Technology (SCADA/ICS) subnets.',
    mitreTechniques: ['T1572 - Protocol Tunneling', 'T1021.004 - SSH Remote Services'],
    enabled: true,
    triggerCount: 5,
    lastTriggered: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    splQuery: `index=netlogs sourcetype="cisco:asa" action="built" dest_port=22 | stats count by src_ip, dest_ip | where count > 10`,
    sigmaRule: `title: SSH Tunneling to OT Subnets
id: net-ssh-ot-001
logsource:
    category: firewall
    product: cisco
detection:
    selection:
        dest_port: 22
        action: 'built'
    condition: selection
level: high`,
    kql: `CiscoASA
| where Action == "Built" and DestPort == 22
| summarize ConnectionCount=count() by SrcIP, DestIP, bin(TimeGenerated, 10m)
| where ConnectionCount > 10`,
    cql: `event_simpleName=NetworkConnect dest_port=22 | stats count() by src_ip, dest_ip | where count > 10`
  },
  {
    id: 'DET-CLOUD-004',
    name: 'AWS CloudTrail Logging Interruption or Trail Deletion',
    category: 'Cloud Security',
    severity: 'CRITICAL',
    riskScore: 92,
    description: 'Detects StopLogging, DeleteTrail, or UpdateTrail AWS API invocations attempting to blind SOC visibility during an active intrusion.',
    mitreTechniques: ['T1562.002 - Impair Defenses: Disable Cloud Logs'],
    enabled: true,
    triggerCount: 3,
    lastTriggered: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    splQuery: `index=cloudlogs sourcetype="aws:cloudtrail" (eventName="StopLogging" OR eventName="DeleteTrail") | stats count by user, sourceIPAddress, eventName`,
    sigmaRule: `title: AWS CloudTrail Disabled
id: cloud-ct-stop-01
logsource:
    product: aws
    service: cloudtrail
detection:
    selection:
        eventName:
            - 'StopLogging'
            - 'DeleteTrail'
    condition: selection
level: critical`,
    kql: `AWSCloudTrail
| where EventName in ("StopLogging", "DeleteTrail")
| project TimeGenerated, UserIdentityArn, SourceIpAddress, EventName`,
    cql: `event_platform=cloud vendor=aws event_name IN ("StopLogging", "DeleteTrail") | table _time, user_identity_arn, source_ip_address`
  },
  {
    id: 'DET-RANSOM-005',
    name: 'Volume Shadow Copy Deletion (vssadmin / wmic / powershell)',
    category: 'Ransomware',
    severity: 'CRITICAL',
    riskScore: 96,
    description: 'Detects execution of shadow copy purge commands commonly executed prior to ransomware payload execution.',
    mitreTechniques: ['T1490 - Inhibit System Recovery'],
    enabled: true,
    triggerCount: 19,
    lastTriggered: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    splQuery: `index=winlogs sourcetype="WinEventLog:Security" EventCode=4688 (CommandLine="*vssadmin*delete*shadows*" OR CommandLine="*wmic*shadowcopy*delete*") | stats count by host, User, CommandLine`,
    sigmaRule: `title: Shadow Copy Deletion
id: rsm-vss-01
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        CommandLine|contains:
            - 'vssadmin.exe delete shadows'
            - 'wmic shadowcopy delete'
    condition: selection
level: critical`,
    kql: `SecurityEvent
| where EventID == 4688
| where CommandLine has_any ("vssadmin.exe delete shadows", "wmic shadowcopy delete")
| project TimeGenerated, Computer, Account, CommandLine`,
    cql: `event_simpleName=ProcessRollup2 (CommandLine="*vssadmin*delete*shadows*" OR CommandLine="*wmic*shadowcopy*delete*") | table _time, ComputerName, UserName, CommandLine`
  },
  {
    id: 'DET-ZERO-006',
    name: 'Unverified OAuth Application Consent Grant with Privileged Scopes',
    category: 'Zero-Day Exploits',
    severity: 'HIGH',
    riskScore: 84,
    description: 'Detects users consenting to multitenant cloud applications requesting full directory read/write or mail access token scopes.',
    mitreTechniques: ['T1528 - Applications Access Token', 'T1078.004 - Cloud Accounts'],
    enabled: true,
    triggerCount: 4,
    lastTriggered: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    splQuery: `index=cloudlogs sourcetype="okta:system" legacy_event_type="app.oauth2.as.grant_consent" | stats count by actor.alternateId, target{}.displayName | where count > 0`,
    sigmaRule: `title: OAuth Consent High Privilege
id: zero-oauth-01
logsource:
    product: okta
detection:
    selection:
        eventType: 'app.oauth2.as.grant_consent'
    condition: selection
level: high`,
    kql: `AuditLogs
| where OperationName == "Consent to application"
| project TimeGenerated, InitiatedBy, TargetResources`,
    cql: `event_platform=cloud legacy_event_type="app.oauth2.as.grant_consent" | table _time, actor_email, app_title`
  }
];
