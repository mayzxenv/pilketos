export type ElectionStatus = 'NOT_STARTED' | 'ACTIVE' | 'CLOSED';
export type ElectionStage = 'PUTARAN_1' | 'PUTARAN_2_OPSIONAL';
export type VoterType = 'SISWA' | 'GURU';

export interface Student {
  student_id: string; // Internal unique primary key, e.g. STU-0001
  nama: string;      // Full name (can be duplicate!)
  kelas: string;     // Class for students; unit/role for teachers
  voter_type?: VoterType;
  voter_weight?: number;
  status_voted: boolean;
  voted_at: string | null; // ISO string
  device_id?: string | null;
}

export interface Candidate {
  id: string;
  nomorUrut: string; // '01', '02', '03', '04', '05'
  nama: string;
  kelas: string;
  foto: string;
  visi: string;
  misi: string[];
  motto?: string;
  status: 'active' | 'inactive';
}

export interface VoteRecord {
  id: string;
  candidate_id: string;
  created_at: string;
  device_id: string;
  request_id: string; // Idempotency key
  ballot_hash: string;
  vote_weight?: number;
  stage?: ElectionStage;
  // NOTE: student_id is intentionally OMITTED here to guarantee secret ballot
}

export interface VoteRequest {
  request_id: string; // Idempotency Key
  student_id: string;
  candidate_id: string;
  device_id: string;
  timestamp: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  result_message?: string;
}

export interface ElectionSettings {
  title: string;
  subtitle: string;
  school_name: string;
  status: ElectionStatus;
  stage: ElectionStage; // 'PUTARAN_1' (Default Utama) or 'PUTARAN_2_OPSIONAL' (Jika Seri)
  academic_year: string;
  start_time: string;
  end_time: string;
  network_simulation_error: boolean;
  banner_image_url?: string | null;
  spreadsheet_webhook_url?: string; // Google Spreadsheet Webhook / Apps Script
  spreadsheet_last_synced?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface VotingDevice {
  id: string;
  name: string;
  code: string; // 'LAPTOP-ADMIN', 'LAPTOP-01', 'LAPTOP-02', 'LAPTOP-03'
  location: string;
  status: 'online' | 'idle' | 'offline';
  last_heartbeat: string;
  votes_processed: number;
  is_admin_device?: boolean;
}

export interface VoteSubmissionPayload {
  student_id: string;
  candidate_id: string;
  idempotency_key: string;
  device_id: string;
}

export interface VoteSubmissionResponse {
  success: boolean;
  message: string;
  already_voted?: boolean;
  receipt_id?: string;
  timestamp?: string;
}
