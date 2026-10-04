import { Candidate, ElectionSettings, VotingDevice, AuditLog } from '../types';

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
  spreadsheet_webhook_url: '',
  spreadsheet_last_synced: ''
};

export const INITIAL_DEVICES: VotingDevice[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
