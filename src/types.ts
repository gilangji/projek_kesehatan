export interface Patient {
  noRm: string;
  nama: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tanggalLahir: string;
  umur: string;
  agama: string;
  alamat: string;
  pendidikan: string;
  pekerjaan: string;
  status: string;
  noTelepon: string;
  penanggungJawab: {
    nama: string;
    hubungan: string;
    alamat: string;
    noTelepon: string;
  };
}
