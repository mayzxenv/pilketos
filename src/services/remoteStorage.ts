import {
  AuditLog,
  Candidate,
  ElectionSettings,
  Student,
  VoteRecord,
  VotingDevice
} from '../types';
import { requireSupabase } from '../lib/supabase';

const supabase = () => requireSupabase();

export const RemoteStorageService = {
  async getStudents(): Promise<Student[]> {
    const result = await supabase()
      .from('students')
      .select('student_id,nama,kelas,voter_type,voter_weight,status_voted,voted_at,device_id')
      .order('nama');
    if (!result.error) return (result.data ?? []) as Student[];

    // Keep the admin DPT usable while an existing Supabase project is being
    // migrated to the optional weighted-voter columns.
    const legacyResult = await supabase()
      .from('students')
      .select('student_id,nama,kelas,voter_type,status_voted,voted_at,device_id')
      .order('nama');
    if (!legacyResult.error) {
      return (legacyResult.data ?? []).map((student) => ({
        ...student,
        voter_type: student.voter_type === 'GURU' ? 'GURU' : 'SISWA',
        voter_weight: student.voter_type === 'GURU' ? 3 : 1
      })) as Student[];
    }

    const originalResult = await supabase()
      .from('students')
      .select('student_id,nama,kelas,status_voted,voted_at,device_id')
      .order('nama');
    if (originalResult.error) {
      throw new Error(`Gagal memuat DPT: ${originalResult.error.message}`);
    }
    return (originalResult.data ?? []).map((student) => ({
      ...student,
      voter_type: 'SISWA',
      voter_weight: 1
    })) as Student[];
  },

  async saveStudents(students: Student[]): Promise<void> {
    const { error } = await supabase().from('students').upsert(students, { onConflict: 'student_id' });
    if (error) throw new Error(`Gagal menyimpan DPT: ${error.message}`);
  },

  async replaceStudents(students: Student[]): Promise<void> {
    const existing = await this.getStudents();
    const importedIds = new Set(students.map((student) => student.student_id));
    const removedIds = existing
      .map((student) => student.student_id)
      .filter((studentId) => !importedIds.has(studentId));
    for (const studentId of removedIds) {
      await this.deleteStudent(studentId);
    }
    await this.saveStudents(students);
  },

  async deleteStudent(studentId: string): Promise<void> {
    const { error } = await supabase().from('students').delete().eq('student_id', studentId);
    if (error) throw new Error(`Gagal menghapus pemilih: ${error.message}`);
  },

  async getCandidates(): Promise<Candidate[]> {
    const { data, error } = await supabase()
      .from('candidates')
      .select('*')
      .eq('status', 'active')
      .order('nomor_urut');
    if (error) throw new Error(`Gagal memuat kandidat: ${error.message}`);
    return (data ?? []).map((candidate) => ({
      ...candidate,
      nomorUrut: candidate.nomor_urut
    })) as Candidate[];
  },

  async saveCandidates(candidates: Candidate[]): Promise<void> {
    const rows = candidates.map(({ nomorUrut, ...candidate }) => ({
      id: candidate.id,
      nomor_urut: nomorUrut,
      nama: candidate.nama,
      kelas: candidate.kelas,
      foto: candidate.foto,
      visi: candidate.visi,
      misi: candidate.misi,
      motto: candidate.motto,
      status: candidate.status || 'active'
    }));
    const { error } = await supabase().from('candidates').upsert(rows, { onConflict: 'id' });
    if (error) throw new Error(`Gagal menyimpan kandidat: ${error.message}`);
  },

  async deleteCandidate(candidateId: string): Promise<void> {
    const { error } = await supabase().from('candidates').delete().eq('id', candidateId);
    if (error) {
      if (error.code === '23503') {
        throw new Error('Kandidat tidak dapat dihapus permanen karena sudah memiliki suara.');
      }
      throw new Error(`Gagal menghapus kandidat secara permanen: ${error.message}`);
    }
  },

  async getSettings(): Promise<ElectionSettings> {
    const { data, error } = await supabase().from('election_settings').select('*').eq('id', true).single();
    if (error) throw new Error(`Gagal memuat pengaturan pemilu: ${error.message}`);
    return {
      ...data,
      banner_image_url: data.banner_image_url ?? null
    } as ElectionSettings;
  },

  async saveSettings(settings: ElectionSettings): Promise<void> {
    const { error } = await supabase()
      .from('election_settings')
      .update({
        title: settings.title,
        subtitle: settings.subtitle,
        school_name: settings.school_name,
        status: settings.status,
        stage: settings.stage,
        academic_year: settings.academic_year,
        start_time: settings.start_time,
        end_time: settings.end_time,
        network_simulation_error: settings.network_simulation_error,
        banner_image_url: settings.banner_image_url ?? null,
        spreadsheet_webhook_url: settings.spreadsheet_webhook_url ?? null,
        spreadsheet_last_synced: settings.spreadsheet_last_synced ?? null
      })
      .eq('id', true);
    if (error) throw new Error(`Gagal menyimpan pengaturan pemilu: ${error.message}`);
  },

  async getDevices(): Promise<VotingDevice[]> {
    const { data, error } = await supabase().from('voting_devices').select('*').order('name');
    if (error) throw new Error(`Gagal memuat perangkat: ${error.message}`);
    return (data ?? []) as VotingDevice[];
  },

  async heartbeat(deviceId: string): Promise<void> {
    const { error } = await supabase()
      .from('voting_devices')
      .update({ status: 'online', last_heartbeat: new Date().toISOString() })
      .eq('id', deviceId);
    if (error) throw new Error(`Gagal memperbarui status perangkat: ${error.message}`);
  },

  async getVotes(): Promise<VoteRecord[]> {
    const { data, error } = await supabase().from('votes').select('*').order('created_at');
    if (error) throw new Error(`Gagal memuat suara: ${error.message}`);
    return (data ?? []) as VoteRecord[];
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await supabase().from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(300);
    if (error) throw new Error(`Gagal memuat audit log: ${error.message}`);
    return (data ?? []) as AuditLog[];
  },

  async addAuditLog(
    action: string,
    actor: string,
    details: string,
    severity: 'info' | 'warning' | 'critical' = 'info'
  ): Promise<void> {
    const { error } = await supabase().from('audit_logs').insert({
      id: `log-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      details,
      severity
    });
    if (error) throw new Error(`Gagal menyimpan audit log: ${error.message}`);
  },

  async clearElectionDataOnly(): Promise<void> {
    const { error } = await supabase().rpc('reset_election_data');
    if (error) throw new Error(`Gagal mereset data pemilu: ${error.message}`);
  },

  async clearVoteResultsOnly(): Promise<void> {
    const { error } = await supabase().rpc('reset_vote_results');
    if (error) throw new Error(`Gagal mereset hasil suara: ${error.message}`);
  }
};
