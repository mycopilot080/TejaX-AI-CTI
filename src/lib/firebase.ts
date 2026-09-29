import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  CTIAdvisory, 
  Asset, 
  ContactDetail, 
  NotableIncident, 
  DetectionRule, 
  ThreatHuntRequest, 
  ThreatReportData,
  HistoricalActor,
  HistoricalCampaign,
  HistoricalVulnerability
} from '../types/cti';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection as per SKILL.md
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Operation types for error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- THREAT FEEDS (ADVISORIES) ---
export const subscribeThreatFeeds = (callback: (advisories: CTIAdvisory[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};
  const q = query(collection(db, 'threat_feeds'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const advisories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CTIAdvisory));
    callback(advisories);
  }, (error) => handleFirestoreError(error, OperationType.GET, 'threat_feeds'));
};

export const fetchThreatFeedsOnce = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];
  try {
    const q = query(collection(db, 'threat_feeds'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CTIAdvisory));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'threat_feeds');
    return [];
  }
};

export const saveThreatFeedAdvisory = async (advisory: CTIAdvisory) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  try {
    await setDoc(doc(db, 'threat_feeds', advisory.id), { ...advisory, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `threat_feeds/${advisory.id}`);
  }
};

// --- ASSETS ---
export const fetchAssetsOnce = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];
  try {
    const q = query(collection(db, 'assets'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Asset));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'assets');
    return [];
  }
};

export const saveAssetToFirestore = async (asset: Asset) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  try {
    await setDoc(doc(db, 'assets', asset.id), { ...asset, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `assets/${asset.id}`);
  }
};

// --- CONTACTS ---
export const fetchContactsOnce = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];
  try {
    const q = query(collection(db, 'contacts'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ContactDetail));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'contacts');
    return [];
  }
};

export const saveContactToFirestore = async (contact: ContactDetail) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  try {
    await setDoc(doc(db, 'contacts', contact.id), { ...contact, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `contacts/${contact.id}`);
  }
};

// --- INCIDENT TICKETS ---
export const subscribeIncidentTickets = (callback: (incidents: NotableIncident[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};
  const q = query(collection(db, 'incident_tickets'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const incidents = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as NotableIncident));
    callback(incidents);
  }, (error) => handleFirestoreError(error, OperationType.GET, 'incident_tickets'));
};

export const fetchIncidentTicketsOnce = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];
  try {
    const q = query(collection(db, 'incident_tickets'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as NotableIncident));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'incident_tickets');
    return [];
  }
};

export const saveIncidentTicketToFirestore = async (incident: NotableIncident) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  try {
    await setDoc(doc(db, 'incident_tickets', incident.id), { ...incident, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `incident_tickets/${incident.id}`);
  }
};

export const deleteIncidentTicketFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'incident_tickets', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `incident_tickets/${id}`);
  }
};

// --- DETECTION RULES ---
export const subscribeDetectionRules = (callback: (rules: DetectionRule[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};
  const q = query(collection(db, 'detection_rules'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const rules = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DetectionRule));
    callback(rules);
  }, (error) => handleFirestoreError(error, OperationType.GET, 'detection_rules'));
};

export const fetchDetectionRulesOnce = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];
  try {
    const q = query(collection(db, 'detection_rules'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DetectionRule));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'detection_rules');
    return [];
  }
};

export const saveDetectionRuleToFirestore = async (rule: DetectionRule) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  try {
    await setDoc(doc(db, 'detection_rules', rule.id), { ...rule, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `detection_rules/${rule.id}`);
  }
};

export const deleteDetectionRuleFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'detection_rules', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `detection_rules/${id}`);
  }
};

// --- THREAT HUNTS ---
export const subscribeThreatHuntRequests = (callback: (hunts: ThreatHuntRequest[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};
  const q = query(collection(db, 'threat_hunts'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const hunts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ThreatHuntRequest));
    callback(hunts);
  }, (error) => handleFirestoreError(error, OperationType.GET, 'threat_hunts'));
};

export const saveThreatHuntRequestToFirestore = async (hunt: ThreatHuntRequest) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  try {
    await setDoc(doc(db, 'threat_hunts', hunt.id), { ...hunt, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `threat_hunts/${hunt.id}`);
  }
};

// --- THREAT REPORTS ---
export const subscribeThreatReports = (callback: (reports: ThreatReportData[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};
  const q = query(collection(db, 'threat_reports'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ThreatReportData));
    callback(reports);
  }, (error) => handleFirestoreError(error, OperationType.GET, 'threat_reports'));
};

export const saveThreatReportToFirestore = async (report: ThreatReportData) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  try {
    await setDoc(doc(db, 'threat_reports', report.id), { ...report, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `threat_reports/${report.id}`);
  }
};

export const deleteThreatReportFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'threat_reports', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `threat_reports/${id}`);
  }
};

// --- HISTORICAL DATA ---
export const fetchHistoricalActors = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];
  try {
    const q = query(collection(db, 'historical_actors'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HistoricalActor));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'historical_actors');
    return [];
  }
};

export const saveHistoricalActor = async (actor: HistoricalActor) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  try {
    await setDoc(doc(db, 'historical_actors', actor.id), { ...actor, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `historical_actors/${actor.id}`);
  }
};

export const fetchHistoricalCampaigns = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];
  try {
    const q = query(collection(db, 'historical_campaigns'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HistoricalCampaign));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'historical_campaigns');
    return [];
  }
};

export const saveHistoricalCampaign = async (campaign: HistoricalCampaign) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  try {
    await setDoc(doc(db, 'historical_campaigns', campaign.id), { ...campaign, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `historical_campaigns/${campaign.id}`);
  }
};

export const fetchHistoricalVulnerabilities = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];
  try {
    const q = query(collection(db, 'historical_vulnerabilities'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() } as HistoricalVulnerability));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'historical_vulnerabilities');
    return [];
  }
};

export const saveHistoricalVulnerability = async (vuln: HistoricalVulnerability) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;
  try {
    await setDoc(doc(db, 'historical_vulnerabilities', vuln.cveId), { ...vuln, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `historical_vulnerabilities/${vuln.cveId}`);
  }
};
