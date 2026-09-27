import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { CTIAdvisory, Asset, ContactDetail, NotableIncident, ThreatReportData, ThreatHuntRequest } from '../types/cti';
import { INITIAL_FEEDS } from '../data/mockFeeds';
import { INITIAL_ASSETS } from '../data/mockAssets';
import { INITIAL_CONTACTS } from '../data/mockContacts';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection on boot as required by skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    console.warn('Firestore connection test bypassed or offline mode active.');
  }
}
testConnection();

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
  };
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
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice (Falling back to local state): ', JSON.stringify(errInfo));
}

// Threat Feeds Firestore API
const THREAT_FEEDS_PATH = 'threat_feeds';

export function subscribeThreatFeeds(
  onData: (advisories: CTIAdvisory[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, THREAT_FEEDS_PATH), orderBy('publishedAt', 'desc'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onData(INITIAL_FEEDS);
          return;
        }
        const advisories: CTIAdvisory[] = snapshot.docs.map((doc) => doc.data() as CTIAdvisory);
        onData(advisories);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, THREAT_FEEDS_PATH);
        onData(INITIAL_FEEDS);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    onData(INITIAL_FEEDS);
    return () => {};
  }
}

export async function saveThreatFeedAdvisory(advisory: CTIAdvisory): Promise<void> {
  const sanitizeId = advisory.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `${THREAT_FEEDS_PATH}/${sanitizeId}`;
  try {
    const docRef = doc(db, THREAT_FEEDS_PATH, sanitizeId);
    const payload = JSON.parse(JSON.stringify(advisory));
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchThreatFeedsOnce(): Promise<CTIAdvisory[]> {
  try {
    const snapshot = await getDocs(collection(db, THREAT_FEEDS_PATH));
    if (snapshot.empty) return INITIAL_FEEDS;
    return snapshot.docs.map((doc) => doc.data() as CTIAdvisory);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, THREAT_FEEDS_PATH);
    return INITIAL_FEEDS;
  }
}

// Assets Firestore API
const ASSETS_PATH = 'assets';

export async function saveAssetToFirestore(asset: Asset): Promise<void> {
  const sanitizeId = asset.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `${ASSETS_PATH}/${sanitizeId}`;
  try {
    const docRef = doc(db, ASSETS_PATH, sanitizeId);
    const payload = JSON.parse(JSON.stringify(asset));
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchAssetsOnce(): Promise<Asset[]> {
  try {
    const snapshot = await getDocs(collection(db, ASSETS_PATH));
    if (snapshot.empty) return INITIAL_ASSETS;
    return snapshot.docs.map((doc) => doc.data() as Asset);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ASSETS_PATH);
    return INITIAL_ASSETS;
  }
}

// Contacts Firestore API
const CONTACTS_PATH = 'contacts';

export async function saveContactToFirestore(contact: ContactDetail): Promise<void> {
  const sanitizeId = contact.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `${CONTACTS_PATH}/${sanitizeId}`;
  try {
    const docRef = doc(db, CONTACTS_PATH, sanitizeId);
    const payload = JSON.parse(JSON.stringify(contact));
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchContactsOnce(): Promise<ContactDetail[]> {
  try {
    const snapshot = await getDocs(collection(db, CONTACTS_PATH));
    if (snapshot.empty) return INITIAL_CONTACTS;
    return snapshot.docs.map((doc) => doc.data() as ContactDetail);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CONTACTS_PATH);
    return INITIAL_CONTACTS;
  }
}

// ============================================================================
// INCIDENT TICKETS FIRESTORE API
// ============================================================================
const INCIDENT_TICKETS_PATH = 'incident_tickets';

export async function saveIncidentTicketToFirestore(incident: NotableIncident): Promise<void> {
  const sanitizeId = incident.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `${INCIDENT_TICKETS_PATH}/${sanitizeId}`;
  try {
    const docRef = doc(db, INCIDENT_TICKETS_PATH, sanitizeId);
    const payload = JSON.parse(JSON.stringify(incident));
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeIncidentTickets(
  onData: (incidents: NotableIncident[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, INCIDENT_TICKETS_PATH), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const tickets: NotableIncident[] = snapshot.docs.map((d) => d.data() as NotableIncident);
          onData(tickets);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, INCIDENT_TICKETS_PATH);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function fetchIncidentTicketsOnce(): Promise<NotableIncident[]> {
  try {
    const snapshot = await getDocs(collection(db, INCIDENT_TICKETS_PATH));
    if (snapshot.empty) return [];
    return snapshot.docs.map((doc) => doc.data() as NotableIncident);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, INCIDENT_TICKETS_PATH);
    return [];
  }
}

export async function deleteIncidentTicketFromFirestore(incidentId: string): Promise<void> {
  const sanitizeId = incidentId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `${INCIDENT_TICKETS_PATH}/${sanitizeId}`;
  try {
    const docRef = doc(db, INCIDENT_TICKETS_PATH, sanitizeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// THREAT REPORTS FIRESTORE API (24-Hour & On-Demand Reports)
// ============================================================================
const THREAT_REPORTS_PATH = 'threat_reports';

export async function saveThreatReportToFirestore(report: ThreatReportData): Promise<void> {
  const sanitizeId = report.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `${THREAT_REPORTS_PATH}/${sanitizeId}`;
  try {
    const docRef = doc(db, THREAT_REPORTS_PATH, sanitizeId);
    const payload = JSON.parse(JSON.stringify(report));
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeThreatReports(
  onData: (reports: ThreatReportData[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, THREAT_REPORTS_PATH), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const reports: ThreatReportData[] = snapshot.docs.map((d) => d.data() as ThreatReportData);
          onData(reports);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, THREAT_REPORTS_PATH);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function fetchThreatReportsOnce(): Promise<ThreatReportData[]> {
  try {
    const snapshot = await getDocs(collection(db, THREAT_REPORTS_PATH));
    if (snapshot.empty) return [];
    return snapshot.docs.map((doc) => doc.data() as ThreatReportData);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, THREAT_REPORTS_PATH);
    return [];
  }
}

export async function deleteThreatReportFromFirestore(reportId: string): Promise<void> {
  const sanitizeId = reportId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `${THREAT_REPORTS_PATH}/${sanitizeId}`;
  try {
    const docRef = doc(db, THREAT_REPORTS_PATH, sanitizeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// THREAT HUNT REQUESTS FIRESTORE API
// ============================================================================
const HUNT_REQUESTS_PATH = 'hunt_requests';

export async function saveThreatHuntRequestToFirestore(hunt: ThreatHuntRequest): Promise<void> {
  const sanitizeId = hunt.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `${HUNT_REQUESTS_PATH}/${sanitizeId}`;
  try {
    const docRef = doc(db, HUNT_REQUESTS_PATH, sanitizeId);
    const payload = JSON.parse(JSON.stringify(hunt));
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeThreatHuntRequests(
  onData: (hunts: ThreatHuntRequest[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, HUNT_REQUESTS_PATH), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const hunts: ThreatHuntRequest[] = snapshot.docs.map((d) => d.data() as ThreatHuntRequest);
          onData(hunts);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, HUNT_REQUESTS_PATH);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function fetchThreatHuntRequestsOnce(): Promise<ThreatHuntRequest[]> {
  try {
    const snapshot = await getDocs(collection(db, HUNT_REQUESTS_PATH));
    if (snapshot.empty) return [];
    return snapshot.docs.map((doc) => doc.data() as ThreatHuntRequest);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, HUNT_REQUESTS_PATH);
    return [];
  }
}

export const FIRESTORE_CONFIG_INFO = {
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId,
  appName: 'Tejax Cyber Threat Intelligence Platform',
  collections: {
    threatReports: THREAT_REPORTS_PATH,
    incidentTickets: INCIDENT_TICKETS_PATH,
    threatFeeds: THREAT_FEEDS_PATH,
    assets: ASSETS_PATH,
    contacts: CONTACTS_PATH,
    huntRequests: HUNT_REQUESTS_PATH
  }
};


