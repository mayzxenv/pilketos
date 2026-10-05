import { Candidate, ElectionSettings, VotingDevice, AuditLog } from '../types';

export const HERO_IMAGE = '';
export const INITIAL_CANDIDATES: Candidate[] = [];

export const INITIAL_SETTINGS: ElectionSettings = {
  title: 'Pemilihan Ketua OSIS DIGIVOS7',
  subtitle: 'Digital Voting OSIS',
  school_name: 'SMPN 7 Bangkalan',
  status: 'NOT_STARTED',
  stage: 'PUTARAN_1',
  academic_year: '2026/2027',
  start_time: '',
  end_time: '',
  network_simulation_error: false,
  spreadsheet_webhook_url: '',
  spreadsheet_last_synced: ''
};

export const INITIAL_DEVICES: VotingDevice[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
