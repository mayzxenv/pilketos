import {
  AuditLog,
  Candidate,
  ElectionSettings,
  Student,
  VotingDevice,
  VoteRecord,
  VoteRequest
} from '../types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CANDIDATES,
  INITIAL_DEVICES,
  INITIAL_SETTINGS
} from '../data/initialData';

const STORAGE_KEYS = {
  STUDENTS: 'sivot_students_v4',
  CANDIDATES: 'sivot_candidates_v2',
  VOTES: 'sivot_votes_v3',
  SETTINGS: 'sivot_settings_v3',
  DEVICES: 'sivot_devices_v3',
  AUDIT: 'sivot_audit_logs_v3',
  IDEMPOTENCY: 'sivot_idempotency_v3',
  ACTIVE_DEVICE_ID: 'sivot_active_device_id_v3'
};

// Cross-tab broadcast channel
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('sivot_realtime_events');
  }
} catch {
  // Graceful fallback for environments where BroadcastChannel is blocked
}

export type StorageListener = (eventType: string, payload?: unknown) => void;
const listeners: Set<StorageListener> = new Set();

export function subscribeToRealtimeEvents(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function broadcastEvent(eventType: string, payload?: unknown) {
  listeners.forEach((listener) => {
    try {
      listener(eventType, payload);
    } catch {
      // Ignore listener error
    }
  });

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ eventType, payload, timestamp: Date.now() });
    } catch {
      // Ignore
    }
  }
}

// Hook up incoming broadcast messages to local listeners
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    const { eventType, payload } = event.data || {};
    if (eventType) {
      listeners.forEach((listener) => {
        try {
          listener(eventType, payload);
        } catch {
          // Ignore
        }
      });
    }
  };
}

// Storage helpers
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to localStorage for key ${key}`, err);
  }
}

export const StorageService = {
  // Students
  getStudents(): Student[] {
    const stored = getItem<Student[] | null>(STORAGE_KEYS.STUDENTS, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      setItem(STORAGE_KEYS.STUDENTS, []);
      return [];
    }
    return stored;
  },

  saveStudents(students: Student[], triggerBroadcast = true): void {
    setItem(STORAGE_KEYS.STUDENTS, students);
    if (triggerBroadcast) {
      broadcastEvent('STUDENTS_UPDATED', { count: students.length });
    }
  },

  // Candidates
  getCandidates(): Candidate[] {
    const stored = getItem<Candidate[] | null>(STORAGE_KEYS.CANDIDATES, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      setItem(STORAGE_KEYS.CANDIDATES, INITIAL_CANDIDATES);
      return INITIAL_CANDIDATES;
    }
    return stored;
  },

  saveCandidates(candidates: Candidate[], triggerBroadcast = true): void {
    setItem(STORAGE_KEYS.CANDIDATES, candidates);
    if (triggerBroadcast) {
      broadcastEvent('CANDIDATES_UPDATED', candidates);
    }
  },

  // Anonymous Votes
  getVotes(): VoteRecord[] {
    const stored = getItem<VoteRecord[] | null>(STORAGE_KEYS.VOTES, null);
    if (!stored || !Array.isArray(stored)) {
      setItem(STORAGE_KEYS.VOTES, []);
      return [];
    }
    return stored;
  },

  saveVotes(votes: VoteRecord[], triggerBroadcast = true): void {
    setItem(STORAGE_KEYS.VOTES, votes);
    if (triggerBroadcast) {
      broadcastEvent('VOTES_UPDATED', { count: votes.length });
    }
  },

  // Settings
  getSettings(): ElectionSettings {
    const stored = getItem<ElectionSettings | null>(STORAGE_KEYS.SETTINGS, null);
    if (!stored) {
      setItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return stored;
  },

  saveSettings(settings: ElectionSettings, triggerBroadcast = true): void {
    setItem(STORAGE_KEYS.SETTINGS, settings);
    if (triggerBroadcast) {
      broadcastEvent('SETTINGS_UPDATED', settings);
    }
  },

  // Devices
  getDevices(): VotingDevice[] {
    const stored = getItem<VotingDevice[] | null>(STORAGE_KEYS.DEVICES, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      setItem(STORAGE_KEYS.DEVICES, INITIAL_DEVICES);
      return INITIAL_DEVICES;
    }
    return stored;
  },

  saveDevices(devices: VotingDevice[], triggerBroadcast = true): void {
    setItem(STORAGE_KEYS.DEVICES, devices);
    if (triggerBroadcast) {
      broadcastEvent('DEVICES_UPDATED', devices);
    }
  },

  getActiveDeviceId(): string {
    return getItem<string>(STORAGE_KEYS.ACTIVE_DEVICE_ID, 'laptop-1');
  },

  setActiveDeviceId(id: string): void {
    setItem(STORAGE_KEYS.ACTIVE_DEVICE_ID, id);
    broadcastEvent('ACTIVE_DEVICE_CHANGED', id);
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    const stored = getItem<AuditLog[] | null>(STORAGE_KEYS.AUDIT, null);
    if (!stored || !Array.isArray(stored)) {
      setItem(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    return stored;
  },

  addAuditLog(action: string, actor: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info'): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      details,
      severity
    };
    const updated = [newLog, ...logs].slice(0, 300); // keep last 300 logs
    setItem(STORAGE_KEYS.AUDIT, updated);
    broadcastEvent('AUDIT_LOG_ADDED', newLog);
  },

  // Idempotency records
  getIdempotencyMap(): Record<string, VoteRequest> {
    return getItem<Record<string, VoteRequest>>(STORAGE_KEYS.IDEMPOTENCY, {});
  },

  saveIdempotencyRecord(record: VoteRequest): void {
    const map = this.getIdempotencyMap();
    map[record.request_id] = record;
    setItem(STORAGE_KEYS.IDEMPOTENCY, map);
  },

  // Wipe all voting results to start a pristine fresh election session
  clearElectionDataOnly(): void {
    const students = this.getStudents().map((s) => ({
      ...s,
      status_voted: false,
      voted_at: null,
      device_id: null
    }));
    this.saveStudents(students, false);
    setItem(STORAGE_KEYS.VOTES, []);
    setItem(STORAGE_KEYS.IDEMPOTENCY, {});
    const devices = this.getDevices().map((d) => ({
      ...d,
      votes_processed: 0
    }));
    this.saveDevices(devices, false);
    this.addAuditLog('ELECTION_CLEARED', 'Admin', 'Seluruh suara dan riwayat voting direset menjadi 0 untuk pemungutan suara baru.', 'critical');
    broadcastEvent('DATASET_RESET', null);
  }
};
