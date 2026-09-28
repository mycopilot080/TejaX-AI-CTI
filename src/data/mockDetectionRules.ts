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
    kqlQuery: `SecurityEvent\n| where EventID == 10\n| where TargetImage endswith @"\\lsass.exe" and GrantedAccess in ("0x1010", "0x1F0FFF")\n| project TimeGenerated, Computer, SourceImage, GrantedAccess`,
    cqlQuery: `event_simpleName=ProcessRollup2 TargetFileName="*\\\\lsass.exe" (GrantedAccess="0x1010" OR GrantedAccess="0x1F0FFF") | table _time, ComputerName, UserName, ImageFileName`,
    elkQuery: `process where process.target.name == "lsass.exe" and process.thread.ext.call_stack_summary : "*mimikatz*"`,
    yaraRule: `rule Detect_LSASS_Dump {\n    meta:\n        description = "Detects LSASS dump tools"\n    strings:\n        $s1 = "lsass.exe"\n        $s2 = "sekurlsa"\n    condition:\n        all of them\n}`
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
    sigmaRule: `title: Password Spraying Detection\nid: a801129e-2104-4b21-99a0-spray01\nlogsource:\n    category: authentication\n    product: windows\ndetection:\n    selection:\n        EventID: 4625\n    condition: selection | count() by src_ip > 5\nlevel: high`,
    kqlQuery: `SecurityEvent\n| where EventID == 4625\n| summarize UniqueUsers = dcount(TargetUserName), TotalFailures = count() by IpAddress, bin(TimeGenerated, 5m)\n| where UniqueUsers >= 3`,
    cqlQuery: `event_platform=cloud legacy_event_type="user.session.start" status="FAILURE" | stats dc(actor_email) as Users by src_ip | where Users >= 3`,
    elkQuery: `authentication where event.code == "4625" | stats count(user.name) as users by source.ip | filter users >= 3`,
    yaraRule: `// N/A - Network/Log based detection`
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
    sigmaRule: `title: SSH Tunneling to OT Subnets\nid: net-ssh-ot-001\nlogsource:\n    category: firewall\n    product: cisco\ndetection:\n    selection:\n        dest_port: 22\n        action: 'built'\n    condition: selection\nlevel: high`,
    kqlQuery: `CiscoASA\n| where Action == "Built" and DestPort == 22\n| summarize ConnectionCount=count() by SrcIP, DestIP, bin(TimeGenerated, 10m)\n| where ConnectionCount > 10`,
    cqlQuery: `event_simpleName=NetworkConnect dest_port=22 | stats count() by src_ip, dest_ip | where count > 10`,
    elkQuery: `network where destination.port == 22 and event.action == "connection_attempted"`,
    yaraRule: `// N/A - Network based detection`
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
    sigmaRule: `title: AWS CloudTrail Disabled\nid: cloud-ct-stop-01\nlogsource:\n    product: aws\n    service: cloudtrail\ndetection:\n    selection:\n        eventName:\n            - 'StopLogging'\n            - 'DeleteTrail'\n    condition: selection\nlevel: critical`,
    kqlQuery: `AWSCloudTrail\n| where EventName in ("StopLogging", "DeleteTrail")\n| project TimeGenerated, UserIdentityArn, SourceIpAddress, EventName`,
    cqlQuery: `event_platform=cloud vendor=aws event_name IN ("StopLogging", "DeleteTrail") | table _time, user_identity_arn, source_ip_address`,
    elkQuery: `aws.cloudtrail where event.name : ("StopLogging", "DeleteTrail")`,
    yaraRule: `// N/A - Cloud API detection`
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
    sigmaRule: `title: Shadow Copy Deletion\nid: rsm-vss-01\nlogsource:\n    category: process_creation\n    product: windows\ndetection:\n    selection:\n        CommandLine|contains:\n            - 'vssadmin.exe delete shadows'\n            - 'wmic shadowcopy delete'\n    condition: selection\nlevel: critical`,
    kqlQuery: `SecurityEvent\n| where EventID == 4688\n| where CommandLine has_any ("vssadmin.exe delete shadows", "wmic shadowcopy delete")\n| project TimeGenerated, Computer, Account, CommandLine`,
    cqlQuery: `event_simpleName=ProcessRollup2 (CommandLine="*vssadmin*delete*shadows*" OR CommandLine="*wmic*shadowcopy*delete*") | table _time, ComputerName, UserName, CommandLine`,
    elkQuery: `process where process.command_line : ("*vssadmin.exe delete shadows*", "*wmic shadowcopy delete*")`,
    yaraRule: `rule Ransomware_Shadow_Delete {\n    strings:\n        $s1 = "vssadmin.exe delete shadows"\n        $s2 = "wmic shadowcopy delete"\n    condition:\n        any of them\n}`
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
    sigmaRule: `title: OAuth Consent High Privilege\nid: zero-oauth-01\nlogsource:\n    product: okta\ndetection:\n    selection:\n        eventType: 'app.oauth2.as.grant_consent'\n    condition: selection\nlevel: high`,
    kqlQuery: `AuditLogs\n| where OperationName == "Consent to application"\n| project TimeGenerated, InitiatedBy, TargetResources`,
    cqlQuery: `event_platform=cloud legacy_event_type="app.oauth2.as.grant_consent" | table _time, actor_email, app_title`,
    elkQuery: `okta.system where event_type == "app.oauth2.as.grant_consent"`,
    yaraRule: `// N/A - Identity detection`
  }
];
