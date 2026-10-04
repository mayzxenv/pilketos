import { Candidate, ElectionSettings, Student, VotingDevice, VoteRecord, AuditLog } from '../types';

export const HERO_IMAGE = '/src/assets/images/sivot_school_hero_1791114588754.jpg';

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-01',
    nomorUrut: '01',
    nama: 'Aditya Pratama',
    kelas: '8A',
    foto: '/src/assets/images/candidate_01_aditya_1791114605130.jpg',
    visi: 'Mewujudkan OSIS yang aspiratif, berakhlak mulia, adaptif teknologi digital, dan menjadi wadah kreativitas seluruh siswa SMP.',
    motto: 'Maju Bersama, Berani Bersuara!',
    misi: [
      'Meningkatkan kegiatan ekstrakurikuler berbasis minat bakat dan teknologi terkini.',
      'Menampung aspirasi siswa secara terbuka melalui kotak saran digital dan forum kelas mingguan.',
      'Mengadakan program kepedulian lingkungan sekolah bersih, hijau, dan asri (Green Campus).',
      'Menjalin solidaritas dan bimbingan persahabatan antar kelas 7, 8, dan 9 tanpa perundungan.'
    ],
    status: 'active'
  },
  {
    id: 'cand-02',
    nomorUrut: '02',
    nama: 'Siti Zahra Khairunnisa',
    kelas: '8C',
    foto: '/src/assets/images/candidate_02_zahra_1791114618711.jpg',
    visi: 'Menciptakan lingkungan sekolah yang cerdas, berkarakter, inklusif, dan berprestasi unggul di bidang akademik maupun seni budaya.',
    motto: 'Santun Berakhlak, Hebat Berkarya!',
    misi: [
      'Menyelenggarakan pekan literasi interaktif dan workshop keterampilan praktis antar siswa.',
      'Memperkuat program bimbingan belajar teman sebaya (Peer Tutoring) yang suportif.',
      'Mengoptimalkan festival pentas seni, olahraga ceria, dan pameran karya siswa berkala.',
      'Mewujudkan program sekolah ramah anak dan anti-bullying yang tegas dan bersahabat.'
    ],
    status: 'active'
  },
  {
    id: 'cand-03',
    nomorUrut: '03',
    nama: 'Kenji Raditya Putra',
    kelas: '8B',
    foto: '/src/assets/images/candidate_03_kenji_1791114631201.jpg',
    visi: 'Membangun OSIS yang aktif, solutif, peduli sesama, dan berwawasan global dengan tetap menjunjung tinggi budaya santun.',
    motto: 'Aksi Nyata untuk Sekolah Juara!',
    misi: [
      'Memfasilitasi kompetisi sains, robotika, dan esport edukatif sehat antar kelas.',
      'Mengembangkan aksi bakti sosial kepedulian masyarakat dan pelestarian lingkungan sekitar.',
      'Menghidupkan mading digital dan podcast suara siswa seputar cerita inspiratif sekolah.',
      'Meningkatkan kedisiplinan dan rasa tanggung jawab siswa lewat teladan pengurus OSIS.'
    ],
    status: 'active'
  },
  {
    id: 'cand-04',
    nomorUrut: '04',
    nama: 'Nayla Salsabila Putri',
    kelas: '8D',
    foto: '/src/assets/images/candidate_04_nayla_1791118980922.jpg',
    visi: 'Mewujudkan OSIS yang responsif, peduli sesama, berwawasan lingkungan, dan mempererat tali persaudaraan seluruh warga sekolah.',
    motto: 'Cerdas Berpikir, Peduli Bertindak!',
    misi: [
      'Menggalakkan gerakan peduli sampah dan green campus di setiap kelas.',
      'Membuat program pelatihan kepemimpinan dan public speaking bagi siswa.',
      'Menyelenggarakan pekan olahraga dan kesenian antarkelas yang sportif.',
      'Menyediakan kotak aspirasi digital untuk menampung ide dan saran siswa.'
    ],
    status: 'active'
  }
];

export const INITIAL_SETTINGS: ElectionSettings = {
  title: 'Pemilihan Ketua OSIS',
  subtitle: 'Masa Bakti 2026/2027',
  school_name: 'SMP Negeri Terpadu 1',
  status: 'ACTIVE',
  stage: 'PUTARAN_1', // Putaran 1 (Utama), Putaran 2 Opsional jika terjadi persamaan suara
  academic_year: '2026/2027',
  start_time: '2026-10-04T07:30:00',
  end_time: '2026-10-04T14:00:00',
  network_simulation_error: false,
  spreadsheet_webhook_url: 'https://script.google.com/macros/s/AKfycbx_sivot_demo/exec',
  spreadsheet_last_synced: new Date().toISOString()
};

export const INITIAL_DEVICES: VotingDevice[] = [
  {
    id: 'laptop-admin',
    name: 'Laptop Operator / Server Admin',
    code: 'LAPTOP-ADMIN',
    location: 'Meja Panitia & Server Pusat',
    status: 'online',
    last_heartbeat: new Date().toISOString(),
    votes_processed: 0,
    is_admin_device: true
  },
  {
    id: 'laptop-1',
    name: 'Laptop 1 (Bilik A)',
    code: 'LAPTOP-01',
    location: 'Bilik A - Pintu Utama',
    status: 'online',
    last_heartbeat: new Date().toISOString(),
    votes_processed: 78
  },
  {
    id: 'laptop-2',
    name: 'Laptop 2 (Bilik B)',
    code: 'LAPTOP-02',
    location: 'Bilik B - Tengah Aula',
    status: 'online',
    last_heartbeat: new Date().toISOString(),
    votes_processed: 65
  },
  {
    id: 'laptop-3',
    name: 'Laptop 3 (Bilik C)',
    code: 'LAPTOP-03',
    location: 'Bilik C - Sayap Kanan',
    status: 'online',
    last_heartbeat: new Date().toISOString(),
    votes_processed: 52
  }
];

// Helper to generate 327 realistic student records
// IMPORTANT: Demo names (Ahmad 9A, Ahmad 8B, Ahmad 7C, Budi, Siti, etc.) MUST HAVE status_voted: false
// so that testing login and voting works seamlessly without "Hak suara sudah digunakan" error!
export function generateInitialStudents(): Student[] {
  const classes = ['7A', '7B', '7C', '7D', '8A', '8B', '8C', '8D', '9A', '9B', '9C'];
  
  // Specific duplicated names required by brief - all active to vote!
  const duplicateStudents: Array<{ id: string; nama: string; kelas: string }> = [
    { id: 'STU-0001', nama: 'Ahmad', kelas: '9A' },
    { id: 'STU-0042', nama: 'Ahmad', kelas: '8B' },
    { id: 'STU-0147', nama: 'Ahmad', kelas: '7C' },
    { id: 'STU-0002', nama: 'Budi', kelas: '9A' },
    { id: 'STU-0089', nama: 'Budi', kelas: '8C' },
    { id: 'STU-0003', nama: 'Citra', kelas: '9B' },
    { id: 'STU-0199', nama: 'Citra', kelas: '7A' },
    { id: 'STU-0015', nama: 'Rizky', kelas: '9C' },
    { id: 'STU-0056', nama: 'Rizky', kelas: '8A' },
    { id: 'STU-0220', nama: 'Rizky', kelas: '7D' },
    { id: 'STU-0007', nama: 'Siti', kelas: '9A' },
    { id: 'STU-0063', nama: 'Siti', kelas: '8B' },
    { id: 'STU-0023', nama: 'Dwi', kelas: '9D' },
    { id: 'STU-0071', nama: 'Dwi', kelas: '8B' },
    { id: 'STU-0045', nama: 'Fajar', kelas: '8A' },
    { id: 'STU-0240', nama: 'Fajar', kelas: '7C' },
    { id: 'STU-0012', nama: 'Putri', kelas: '9B' },
    { id: 'STU-0081', nama: 'Putri', kelas: '8C' },
    { id: 'STU-0210', nama: 'Putri', kelas: '7B' }
  ];

  const firstNames = [
    'Aditya', 'Alif', 'Anisa', 'Arya', 'Bayu', 'Bagas', 'Chelsea', 'Danu', 'Dimas',
    'Doni', 'Eka', 'Fadli', 'Farhan', 'Gita', 'Gilang', 'Hafiz', 'Indah', 'Intan',
    'Kevin', 'Laras', 'Mega', 'Maulana', 'Nabila', 'Naufal', 'Pratama', 'Rafi',
    'Rangga', 'Rian', 'Rina', 'Salma', 'Taufik', 'Tiara', 'Wahyu', 'Yoga', 'Zulfa',
    'Aris', 'Bella', 'Cahya', 'Dewi', 'Erlangga', 'Fina', 'Galih', 'Hana', 'Ilham',
    'Joko', 'Kartika', 'Lukman', 'Mira', 'Nanda', 'Oki', 'Pandu', 'Qori', 'Riko',
    'Sari', 'Tri', 'Umar', 'Vina', 'Wawan', 'Yuni', 'Zaki'
  ];

  const lastNames = [
    'Santoso', 'Wijaya', 'Saputra', 'Kusuma', 'Prasetyo', 'Nugroho', 'Hidayat',
    'Permana', 'Lestari', 'Wulandari', 'Utami', 'Setiawan', 'Rahmawati', 'Anggraini',
    'Ramadhan', 'Firmansyah', 'Syahputra', 'Mahendra', 'Kurniawan', 'Gunawan'
  ];

  const studentMap = new Map<string, Student>();

  // Add duplicates with status_voted: FALSE so testers can always vote with them!
  duplicateStudents.forEach((item) => {
    studentMap.set(item.id, {
      student_id: item.id,
      nama: item.nama,
      kelas: item.kelas,
      status_voted: false,
      voted_at: null,
      device_id: null
    });
  });

  // Fill up to 327 students
  let count = duplicateStudents.length;
  let idNumber = 1;

  while (count < 327) {
    const id = `STU-${String(idNumber).padStart(4, '0')}`;
    if (!studentMap.has(id)) {
      const fName = firstNames[(count * 7) % firstNames.length];
      const lName = lastNames[(count * 11) % lastNames.length];
      const cls = classes[count % classes.length];
      
      // Have some later students voted so attendance stats look realistic (~195 voted)
      const isVoted = count > 132;
      const minutesAgo = Math.max(8, 240 - Math.floor(count * 0.7));
      const deviceAssigned = count % 3 === 0 ? 'Laptop 1' : count % 3 === 1 ? 'Laptop 2' : 'Laptop 3';

      studentMap.set(id, {
        student_id: id,
        nama: `${fName} ${lName}`,
        kelas: cls,
        status_voted: isVoted,
        voted_at: isVoted ? new Date(Date.now() - minutesAgo * 60000).toISOString() : null,
        device_id: isVoted ? deviceAssigned : null
      });
      count++;
    }
    idNumber++;
  }

  return Array.from(studentMap.values()).sort((a, b) => a.student_id.localeCompare(b.student_id));
}

// Generate anonymous initial votes matching the 195 voted students
export function generateInitialVotes(votedCount = 195): VoteRecord[] {
  const votes: VoteRecord[] = [];
  const candidateIds = ['cand-01', 'cand-02', 'cand-03', 'cand-04'];
  const devices = ['Laptop 1', 'Laptop 2', 'Laptop 3'];

  // Weighted realistic distribution: Calon 01 (Ketos #1), Calon 02 (Waketos #2), Calon 03 (#3), Calon 04 (#4)
  for (let i = 0; i < votedCount; i++) {
    let chosenId = candidateIds[0];
    const rand = (i * 37) % 100;
    if (rand < 44) chosenId = 'cand-01'; // 44% (Ketos)
    else if (rand < 75) chosenId = 'cand-02'; // 31% (Waketos)
    else if (rand < 90) chosenId = 'cand-03'; // 15% (Dipertimbangkan)
    else chosenId = 'cand-04'; // 10% (Dipertimbangkan)

    const minutesAgo = Math.max(8, 240 - Math.floor(i * 1.1));
    votes.push({
      id: `vote-${String(i + 1).padStart(4, '0')}`,
      candidate_id: chosenId,
      created_at: new Date(Date.now() - minutesAgo * 60000).toISOString(),
      device_id: devices[i % 3],
      request_id: `REQ-INIT-${String(i + 1).padStart(4, '0')}`,
      ballot_hash: `sha256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      stage: 'PUTARAN_1'
    });
  }

  return votes;
}

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
    action: 'ELECTION_INITIALIZED',
    actor: 'Panitia SIVOT',
    details: 'Sistem diinisialisasi untuk Tahap Utama (Putaran 1) dengan 4 kandidat dan 327 DPT pemilih.',
    severity: 'info'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 210 * 60000).toISOString(),
    action: 'DEVICES_SYNCED',
    actor: 'Operator IT',
    details: 'Laptop Admin dan 3 Laptop bilik suara (Bilik A, Bilik B, Bilik C) terverifikasi terhubung.',
    severity: 'info'
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 190 * 60000).toISOString(),
    action: 'ELECTION_OPENED',
    actor: 'Admin SIVOT',
    details: 'Status pemilihan Putaran 1 resmi diubah menjadi "Sedang Berlangsung". Bilik suara dibuka.',
    severity: 'warning'
  }
];
