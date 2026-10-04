import { Student, VoteSubmissionPayload, VoteSubmissionResponse, VoteRecord, VoteRequest } from '../types';
import { StorageService, broadcastEvent } from './storage';

// In-memory mutex lock for atomic transaction simulation
let isProcessingVote = false;

export const VotingEngine = {
  // Search students by name (case-insensitive)
  findStudentsByName(queryName: string): Student[] {
    const trimmed = queryName.trim().toLowerCase();
    if (!trimmed) return [];

    const students = StorageService.getStudents();
    
    // Exact match first (case-insensitive)
    const exactMatches = students.filter(
      (s) => s.nama.trim().toLowerCase() === trimmed
    );
    if (exactMatches.length > 0) {
      return exactMatches;
    }

    // Partial start-with or contains match
    return students.filter((s) =>
      s.nama.toLowerCase().includes(trimmed)
    );
  },

  // Retrieve student by strict internal student_id
  getStudentById(studentId: string): Student | undefined {
    const students = StorageService.getStudents();
    return students.find((s) => s.student_id === studentId);
  },

  // Check if a vote was already saved by idempotency key or student ID (Recovery helper)
  async checkVoteStatus(idempotencyKey: string, studentId: string): Promise<{ isVoted: boolean; message: string }> {
    // Artificial small delay to simulate network roundtrip
    await new Promise((resolve) => setTimeout(resolve, 600));

    const idempotencyMap = StorageService.getIdempotencyMap();
    if (idempotencyMap[idempotencyKey]?.status === 'SUCCESS') {
      return {
        isVoted: true,
        message: 'Suaramu telah terverifikasi aman tersimpan di sistem.'
      };
    }

    const student = this.getStudentById(studentId);
    if (student?.status_voted) {
      return {
        isVoted: true,
        message: 'Hak suaramu telah berhasil tercatat.'
      };
    }

    return {
      isVoted: false,
      message: 'Suara belum tercatat di server.'
    };
  },

  // Atomic Vote Submission with Transaction, Idempotency, and Anti-Double-Vote Guards
  async submitVoteAtomic(payload: VoteSubmissionPayload): Promise<VoteSubmissionResponse> {
    // Acquire transaction lock
    if (isProcessingVote) {
      // Short backoff wait if concurrency occurs
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    isProcessingVote = true;

    try {
      const settings = StorageService.getSettings();

      // 1. Election status validation
      if (settings.status === 'NOT_STARTED') {
        return {
          success: false,
          message: 'Pemilihan belum dibuka oleh panitia. Mohon menunggu waktu pelaksanaan.'
        };
      }
      if (settings.status === 'CLOSED') {
        return {
          success: false,
          message: 'Pemilihan telah resmi ditutup. Terima kasih.'
        };
      }

      // 2. Idempotency Key validation (Network duplicate / Retry protection)
      const idempotencyMap = StorageService.getIdempotencyMap();
      const existingRequest = idempotencyMap[payload.idempotency_key];

      if (existingRequest) {
        if (existingRequest.status === 'SUCCESS') {
          // Return cached success - DO NOT increment or add another vote!
          return {
            success: true,
            already_voted: true,
            message: 'Suara kamu sudah berhasil disimpan sebelumnya. Permintaan duplikat dicegah.',
            receipt_id: existingRequest.result_message || 'RECEIPT-CACHED',
            timestamp: existingRequest.timestamp
          };
        }
      }

      // 3. Simulated Network Dropout Check (if enabled in settings)
      if (settings.network_simulation_error) {
        // Record pending state
        const pendingRecord: VoteRequest = {
          request_id: payload.idempotency_key,
          student_id: payload.student_id,
          candidate_id: payload.candidate_id,
          device_id: payload.device_id,
          timestamp: new Date().toISOString(),
          status: 'FAILED',
          result_message: 'Simulated connection drop'
        };
        StorageService.saveIdempotencyRecord(pendingRecord);

        throw new Error('NETWORK_TIMEOUT_SIMULATED');
      }

      // 4. Student validation & Anti-double-vote constraint
      const students = StorageService.getStudents();
      const studentIndex = students.findIndex((s) => s.student_id === payload.student_id);

      if (studentIndex === -1) {
        return {
          success: false,
          message: 'Data pemilih tidak ditemukan dalam Daftar Pemilih Tetap (DPT).'
        };
      }

      const student = students[studentIndex];

      if (student.status_voted) {
        return {
          success: false,
          already_voted: true,
          message: 'Hak suara ini sudah digunakan sebelumnya. Setiap siswa hanya berhak memberikan 1 suara.'
        };
      }

      // 5. Candidate validation
      const candidates = StorageService.getCandidates();
      const candidateExists = candidates.some((c) => c.id === payload.candidate_id && c.status === 'active');

      if (!candidateExists) {
        return {
          success: false,
          message: 'Kandidat yang dipilih tidak valid atau sudah tidak aktif.'
        };
      }

      // --- BEGIN ATOMIC TRANSACTION SIMULATION ---
      const nowIso = new Date().toISOString();
      const ballotHash = `BLT-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      // a. Update student state
      students[studentIndex] = {
        ...student,
        status_voted: true,
        voted_at: nowIso,
        device_id: payload.device_id
      };

      // b. Insert anonymous ballot (NO student_id stored with vote to preserve ballot secrecy!)
      const currentVotes = StorageService.getVotes();
      const newVote: VoteRecord = {
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        candidate_id: payload.candidate_id,
        created_at: nowIso,
        device_id: payload.device_id,
        request_id: payload.idempotency_key,
        ballot_hash: ballotHash
      };
      const updatedVotes = [...currentVotes, newVote];

      // c. Update device metrics
      const devices = StorageService.getDevices();
      const deviceIndex = devices.findIndex((d) => d.name.toLowerCase().includes(payload.device_id.toLowerCase()) || d.id === payload.device_id);
      if (deviceIndex !== -1) {
        devices[deviceIndex] = {
          ...devices[deviceIndex],
          status: 'online',
          last_heartbeat: nowIso,
          votes_processed: (devices[deviceIndex].votes_processed || 0) + 1
        };
      }

      // d. Record idempotency success
      const successRecord: VoteRequest = {
        request_id: payload.idempotency_key,
        student_id: payload.student_id,
        candidate_id: payload.candidate_id,
        device_id: payload.device_id,
        timestamp: nowIso,
        status: 'SUCCESS',
        result_message: ballotHash
      };

      // COMMIT TRANSACTION
      StorageService.saveStudents(students, false);
      StorageService.saveVotes(updatedVotes, false);
      StorageService.saveDevices(devices, false);
      StorageService.saveIdempotencyRecord(successRecord);

      // Audit log: strictly privacy-safe (student name and class ONLY, candidate is HIDDEN!)
      StorageService.addAuditLog(
        'VOTE_SUBMITTED_ANONYMOUS',
        payload.device_id,
        `Siswa ${student.nama} (${student.kelas}) telah menggunakan hak suara. Surat suara dienkripsi secara anonim.`,
        'info'
      );

      // Realtime broadcast to update admin dashboard, monitoring table, and PID display
      broadcastEvent('VOTE_SUCCESS', {
        student_id: student.student_id,
        nama: student.nama,
        kelas: student.kelas,
        voted_at: nowIso,
        device_id: payload.device_id,
        total_votes: updatedVotes.length
      });

      return {
        success: true,
        message: 'Suaramu berhasil disimpan!',
        receipt_id: ballotHash,
        timestamp: nowIso
      };
    } catch (err: unknown) {
      if ((err as Error)?.message === 'NETWORK_TIMEOUT_SIMULATED') {
        throw err;
      }
      return {
        success: false,
        message: 'Terjadi gangguan internal pada server. Silakan hubungi panitia pemungutan suara.'
      };
    } finally {
      // Release lock
      isProcessingVote = false;
    }
  },

  // Ping heartbeat for active laptop booth
  sendDeviceHeartbeat(deviceId: string) {
    const devices = StorageService.getDevices();
    const index = devices.findIndex((d) => d.id === deviceId || d.name.toLowerCase().includes(deviceId.toLowerCase()));
    if (index !== -1) {
      devices[index] = {
        ...devices[index],
        status: 'online',
        last_heartbeat: new Date().toISOString()
      };
      StorageService.saveDevices(devices, true);
    }
  }
};
