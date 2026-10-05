import { Student, VoteSubmissionPayload, VoteSubmissionResponse } from '../types';
import { requireSupabase } from '../lib/supabase';

let isProcessingVote = false;

type SubmitVoteResult = {
  success?: boolean;
  already_voted?: boolean;
  receipt_id?: string;
  timestamp?: string;
};

function serverMessage(error: { message: string }): VoteSubmissionResponse | null {
  if (error.message.includes('ELECTION_NOT_ACTIVE')) {
    return { success: false, message: 'Pemilihan belum dibuka atau sudah ditutup oleh panitia.' };
  }
  if (error.message.includes('ALREADY_VOTED')) {
    return { success: false, already_voted: true, message: 'Hak suara ini sudah digunakan sebelumnya.' };
  }
  if (error.message.includes('STUDENT_NOT_FOUND')) {
    return { success: false, message: 'Data pemilih tidak ditemukan dalam DPT.' };
  }
  if (error.message.includes('CANDIDATE_NOT_FOUND')) {
    return { success: false, message: 'Kandidat yang dipilih tidak valid atau sudah tidak aktif.' };
  }
  return null;
}

export const VotingEngine = {
  async findStudentsByName(queryName: string): Promise<Student[]> {
    const trimmed = queryName.trim().toLowerCase();
    if (!trimmed) return [];

    const { data, error } = await requireSupabase().rpc('search_students_by_name', {
      p_query: trimmed
    });

    if (error) throw new Error(`Gagal memuat data pemilih: ${error.message}`);

    const students = (data ?? []) as Student[];
    const exactMatches = students.filter((student) => student.nama.trim().toLowerCase() === trimmed);
    return exactMatches.length > 0 ? exactMatches : students;
  },

  async getStudentById(studentId: string): Promise<Student | undefined> {
    const { data, error } = await requireSupabase()
      .from('students')
      .select('student_id,nama,kelas,status_voted,voted_at,device_id')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw new Error(`Gagal memuat status pemilih: ${error.message}`);
    return (data as Student | null) ?? undefined;
  },

  async checkVoteStatus(_idempotencyKey: string, studentId: string): Promise<{ isVoted: boolean; message: string }> {
    const student = await this.getStudentById(studentId);
    if (student?.status_voted) {
      return { isVoted: true, message: 'Hak suaramu telah berhasil tercatat di server.' };
    }
    return { isVoted: false, message: 'Suara belum tercatat di server.' };
  },

  async submitVoteAtomic(payload: VoteSubmissionPayload): Promise<VoteSubmissionResponse> {
    if (isProcessingVote) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    isProcessingVote = true;

    try {
      const { data, error } = await requireSupabase().rpc('submit_vote', {
        p_student_id: payload.student_id,
        p_candidate_id: payload.candidate_id,
        p_device_id: payload.device_id,
        p_request_id: payload.idempotency_key,
        p_ballot_hash: `BLT-${crypto.randomUUID()}`,
        p_stage: 'PUTARAN_1'
      });

      if (error) {
        const knownResponse = serverMessage(error);
        if (knownResponse) return knownResponse;
        throw new Error(`Gagal menyimpan suara: ${error.message}`);
      }

      const result = data as SubmitVoteResult;
      return {
        success: result.success === true,
        already_voted: result.already_voted,
        message: result.already_voted
          ? 'Permintaan duplikat dicegah; suara sudah tersimpan sebelumnya.'
          : 'Suaramu berhasil disimpan!',
        receipt_id: result.receipt_id,
        timestamp: result.timestamp
      };
    } finally {
      isProcessingVote = false;
    }
  },

  async sendDeviceHeartbeat(deviceId: string): Promise<void> {
    const { error } = await requireSupabase()
      .from('voting_devices')
      .update({ status: 'online', last_heartbeat: new Date().toISOString() })
      .eq('id', deviceId);
    if (error) throw new Error(`Gagal memperbarui status perangkat: ${error.message}`);
  }
};
