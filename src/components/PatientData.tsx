import React, { useState, useEffect, useRef } from 'react';
import { Patient, KibSettings } from '../types';
import { ArrowLeft, Save, Edit, Trash2, Printer, Plus, FileText, CreditCard, Search, Upload, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as xlsx from 'xlsx';

interface PatientDataProps {
  mode: 'input' | 'list' | 'printMenu';
  onBack: () => void;
  onPrint: (patient: Patient, format: 'card' | 'document') => void;
  kibSettings: KibSettings;
}

const initialPatientState: Patient = {
  noRm: '',
  nama: '',
  jenisKelamin: 'Laki-laki',
  tanggalLahir: '',
  umur: '',
  agama: '',
  alamat: '',
  pendidikan: '',
  pekerjaan: '',
  status: '',
  noTelepon: '',
  laporanDokter: '',
  ruangan: '',
  penanggungJawab: {
    nama: '',
    hubungan: '',
    alamat: '',
    noTelepon: '',
  }
};

const mapToPatient = (row: any): Patient => ({
  noRm: row.no_rm,
  nama: row.nama,
  jenisKelamin: row.jenis_kelamin,
  tanggalLahir: row.tanggal_lahir,
  umur: row.umur,
  agama: row.agama,
  alamat: row.alamat,
  pendidikan: row.pendidikan,
  pekerjaan: row.pekerjaan,
  status: row.status,
  noTelepon: row.no_telepon,
  laporanDokter: row.laporan_dokter || '',
  ruangan: row.ruangan || '',
  penanggungJawab: {
    nama: row.pj_nama,
    hubungan: row.pj_hubungan,
    alamat: row.pj_alamat,
    noTelepon: row.pj_no_telepon
  }
});

const mapToRow = (p: Patient) => ({
  no_rm: p.noRm,
  nama: p.nama,
  jenis_kelamin: p.jenisKelamin,
  tanggal_lahir: p.tanggalLahir,
  umur: p.umur,
  agama: p.agama,
  alamat: p.alamat,
  pendidikan: p.pendidikan,
  pekerjaan: p.pekerjaan,
  status: p.status,
  no_telepon: p.noTelepon,
  laporan_dokter: p.laporanDokter,
  ruangan: p.ruangan,
  pj_nama: p.penanggungJawab.nama,
  pj_hubungan: p.penanggungJawab.hubungan,
  pj_alamat: p.penanggungJawab.alamat,
  pj_no_telepon: p.penanggungJawab.noTelepon
});

export default function PatientData({ mode, onBack, onPrint, kibSettings }: PatientDataProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState<Patient>(initialPatientState);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState(mode);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allow internal switching (e.g. from list to edit)
  useEffect(() => {
    setViewMode(mode);
  }, [mode]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        if (data) {
          setPatients(data.map(mapToPatient));
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = xlsx.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          alert('File kosong atau format salah.');
          return;
        }

        let importedCount = 0;
        const newPatients: Patient[] = [...patients];

        for (const row of data as any[]) {
          // Mapping standard excel column names (can adjust based on expected format)
          const noRm = row['No RM'] || row['no_rm'] || row['noRm']?.toString();
          const nama = row['Nama'] || row['nama'] || row['Nama Pasien'];
          
          if (!noRm || !nama) continue; // Skip invalid rows
          
          // Check for duplicate in current state
          if (newPatients.some(p => p.noRm === noRm.toString())) continue;

          const importedPatient: Patient = {
            noRm: noRm.toString(),
            nama: nama.toString(),
            jenisKelamin: row['Jenis Kelamin'] || row['jenis_kelamin'] || 'Laki-laki',
            tanggalLahir: row['Tanggal Lahir'] || row['tanggal_lahir'] || '',
            umur: row['Umur']?.toString() || row['umur']?.toString() || '',
            agama: row['Agama'] || row['agama'] || '',
            alamat: row['Alamat'] || row['alamat'] || '',
            pendidikan: row['Pendidikan'] || row['pendidikan'] || '',
            pekerjaan: row['Pekerjaan'] || row['pekerjaan'] || '',
            status: row['Status'] || row['status'] || '',
            noTelepon: row['No Telepon'] || row['no_telepon']?.toString() || '',
            laporanDokter: row['Laporan Dokter'] || row['Keluhan'] || '',
            ruangan: row['Ruangan'] || row['ruangan'] || '',
            penanggungJawab: {
              nama: row['PJ Nama'] || row['Nama PJ'] || '',
              hubungan: row['PJ Hubungan'] || row['Hubungan PJ'] || '',
              alamat: row['PJ Alamat'] || row['Alamat PJ'] || '',
              noTelepon: row['PJ No Telepon'] || row['No Telepon PJ']?.toString() || ''
            }
          };

          const { error } = await supabase.from('patients').upsert(mapToRow(importedPatient));
          if (!error) {
            newPatients.unshift(importedPatient);
            importedCount++;
          }
        }

        setPatients(newPatients);
        alert(`Berhasil mengimpor ${importedCount} data pasien.`);
      } catch (error) {
        console.error('Error importing file:', error);
        alert('Terjadi kesalahan saat memproses file. Pastikan format CSV/Excel benar.');
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    if (patients.length === 0) {
      alert('Tidak ada data pasien untuk diekspor.');
      return;
    }

    const exportData = patients.map((p) => ({
      'No RM': p.noRm,
      'Nama Pasien': p.nama,
      'Jenis Kelamin': p.jenisKelamin,
      'Tanggal Lahir': p.tanggalLahir,
      'Umur': p.umur,
      'Agama': p.agama,
      'Alamat': p.alamat,
      'Pendidikan': p.pendidikan,
      'Pekerjaan': p.pekerjaan,
      'Status': p.status,
      'Ruangan': p.ruangan,
      'No Telepon': p.noTelepon,
      'Laporan Dokter': p.laporanDokter,
      'PJ Nama': p.penanggungJawab.nama,
      'PJ Hubungan': p.penanggungJawab.hubungan,
      'PJ Alamat': p.penanggungJawab.alamat,
      'PJ No Telepon': p.penanggungJawab.noTelepon,
    }));

    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Data Pasien");
    
    // Generate file name with current date
    const date = new Date().toISOString().split('T')[0];
    xlsx.writeFile(wb, `Data_Pasien_${date}.xlsx`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('pj_')) {
      const field = name.replace('pj_', '');
      setFormData(prev => ({
        ...prev,
        penanggungJawab: {
          ...prev.penanggungJawab,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!formData.noRm || !formData.nama) {
      alert('No RM dan Nama harus diisi!');
      return;
    }

    try {
      const { error } = await supabase
        .from('patients')
        .upsert(mapToRow(formData));

      if (error) throw error;

      if (isEditing) {
        setPatients(patients.map(p => p.noRm === formData.noRm ? formData : p));
        setIsEditing(false);
        setViewMode('list'); // Go back to list after edit
      } else {
        if (patients.some(p => p.noRm === formData.noRm)) {
          alert('No RM sudah ada di database!');
          return;
        }
        setPatients([formData, ...patients]);
        setFormData(initialPatientState);
      }
      alert('Data pasien berhasil disimpan!');
    } catch (error: any) {
      console.error('Error saving patient:', error);
      alert('Gagal menyimpan data ke database.');
    }
  };

  const handleEdit = (patient: Patient) => {
    setFormData(patient);
    setIsEditing(true);
    setViewMode('input');
  };

  const handleDelete = async (noRm: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        const { error } = await supabase
          .from('patients')
          .delete()
          .eq('no_rm', noRm);

        if (error) throw error;

        setPatients(patients.filter(p => p.noRm !== noRm));
        if (formData.noRm === noRm) {
          setFormData(initialPatientState);
          setIsEditing(false);
        }
      } catch (error: any) {
        console.error('Error deleting patient:', error);
        alert('Gagal menghapus data dari database.');
      }
    }
  };

  const handleNew = () => {
    setFormData(initialPatientState);
    setIsEditing(false);
  };

  const getTitle = () => {
    if (viewMode === 'input') return isEditing ? 'Edit Data Pasien' : 'Input Data Pasien';
    if (viewMode === 'list') return 'Daftar Data Pasien';
    if (viewMode === 'printMenu') return 'Cetak KIB & Dokumen';
    return '';
  };

  const getSubtitle = () => {
    if (viewMode === 'input') return 'Form registrasi data pasien baru';
    if (viewMode === 'list') return 'Kelola profil pasien';
    if (viewMode === 'printMenu') return 'Pilih pasien untuk mencetak kartu KIB atau laporan lengkap';
    return '';
  };

  const filteredPatients = patients.filter(p => 
    p.noRm.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      <nav className="bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-8 py-5 flex items-center space-x-4 sticky top-0 z-10">
        <button onClick={onBack} className="text-[#6B7280] hover:text-[#1F2937] transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <img 
            src={kibSettings.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lambang_Kabupaten_Buton_Selatan.png/600px-Lambang_Kabupaten_Buton_Selatan.png"} 
            alt="Logo" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-[20px] font-bold text-[#2563EB] tracking-tight">UPTD PUSKESMAS SAMPOLAWA</h1>
        </div>
      </nav>

      <main className="flex-1 p-8 lg:p-12 flex flex-col max-w-7xl mx-auto w-full">
        <header className="mb-8 flex justify-between items-start">
          <div className={`flex flex-col items-start ${kibSettings.backgroundUrl ? 'space-y-3' : ''}`}>
            <h1 className={kibSettings.backgroundUrl ? "text-[26px] font-bold text-[#2563EB] bg-[#E0E7FF]/95 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm border border-blue-100" : "text-[28px] font-semibold text-[#1F2937] mb-2"}>
              {getTitle()}
            </h1>
            <p className={kibSettings.backgroundUrl ? "text-[14px] font-medium text-[#4B5563] bg-white/95 px-5 py-2 rounded-full shadow-sm backdrop-blur-sm" : "text-[15px] text-[#6B7280]"}>
              {getSubtitle()}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E0E7FF] text-[#2563EB] shadow-sm">MODUL AKTIF</span>
        </header>

        <div className="bg-white border border-[#E5E7EB] rounded-xl flex-1 flex flex-col overflow-hidden">
          
          {viewMode === 'input' && (
            <div className="p-8 lg:p-10 flex-1 overflow-y-auto w-full max-w-4xl mx-auto">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">No RM <span className="text-red-500">*</span></label>
                  <input type="text" name="noRm" value={formData.noRm} onChange={handleInputChange} disabled={isEditing} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Nama Pasien <span className="text-red-500">*</span></label>
                  <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Jenis Kelamin</label>
                  <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Tanggal Lahir</label>
                  <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Umur</label>
                  <input type="text" name="umur" value={formData.umur} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Agama</label>
                  <select name="agama" value={formData.agama} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]">
                    <option value="">Pilih Agama</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Alamat</label>
                  <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} rows={2} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"></textarea>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Pendidikan</label>
                  <select name="pendidikan" value={formData.pendidikan} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]">
                    <option value="">Pilih Pendidikan</option>
                    <option value="SD/Sederajat">SD/Sederajat</option>
                    <option value="SMP/Sederajat">SMP/Sederajat</option>
                    <option value="SMA/Sederajat">SMA/Sederajat</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Pekerjaan</label>
                  <input type="text" name="pekerjaan" value={formData.pekerjaan} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]">
                    <option value="">Pilih Status</option>
                    <option value="Belum Menikah">Belum Menikah</option>
                    <option value="Menikah">Menikah</option>
                    <option value="Cerai">Cerai</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Ruangan <span className="text-red-500">*</span></label>
                  <input type="text" name="ruangan" value={formData.ruangan} onChange={handleInputChange} placeholder="Contoh: Poli Umum, IGD, dll." className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">No Telepon</label>
                  <input type="text" name="noTelepon" value={formData.noTelepon} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Laporan Dokter / Keluhan Utama</label>
                  <textarea name="laporanDokter" value={formData.laporanDokter} onChange={handleInputChange} rows={3} placeholder="Tuliskan keluhan atau laporan dokter di sini..." className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"></textarea>
                </div>
              </div>

              <h3 className="text-[18px] font-semibold text-[#1F2937] mt-8 mb-6 border-b pb-2">Penanggung Jawab</h3>
              <div className="grid grid-cols-2 gap-5 mb-8">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Nama</label>
                  <input type="text" name="pj_nama" value={formData.penanggungJawab.nama} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Hubungan</label>
                  <input type="text" name="pj_hubungan" value={formData.penanggungJawab.hubungan} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Alamat</label>
                  <textarea name="pj_alamat" value={formData.penanggungJawab.alamat} onChange={handleInputChange} rows={2} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"></textarea>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">No Telepon</label>
                  <input type="text" name="pj_noTelepon" value={formData.penanggungJawab.noTelepon} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                </div>
              </div>
            </div>
          )}

          {(viewMode === 'list' || viewMode === 'printMenu') && (
            <div className="p-8 lg:p-10 flex-1 overflow-y-auto flex flex-col">
              <div className="mb-6 relative w-full max-w-md">
                <Search className="absolute left-3.5 top-3 text-[#9CA3AF] w-5 h-5" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Cari No RM / Nama atau Scan Barcode di sini..."
                  className="w-full pl-11 pr-4 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg text-[14px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-shadow"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const query = searchQuery.trim().toLowerCase();
                      if (query) {
                        // Cari pasien dengan No RM yang persis sama dengan hasil scan
                        const exactMatch = patients.find(p => p.noRm.toLowerCase() === query);
                        if (exactMatch) {
                          if (viewMode === 'list') {
                            handleEdit(exactMatch);
                            setSearchQuery(''); // Kosongkan kembali pencarian
                          } else if (viewMode === 'printMenu') {
                            onPrint(exactMatch, 'document');
                            setSearchQuery('');
                          }
                        }
                      }
                    }
                  }}
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <p className="text-gray-500">Memuat data...</p>
                </div>
              ) : (
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="text-[#6B7280] border-b border-[#E5E7EB]">
                      <th className="pb-3 text-left font-medium">No RM</th>
                      <th className="pb-3 text-left font-medium">Nama Pasien</th>
                      <th className="pb-3 text-left font-medium hidden sm:table-cell">L/P</th>
                      <th className="pb-3 text-left font-medium hidden md:table-cell">Tanggal Lahir</th>
                      <th className="pb-3 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#6B7280]">
                          {searchQuery ? 'Data pasien tidak ditemukan.' : 'Belum ada data pasien terdaftar'}
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((p) => (
                        <tr key={p.noRm} className="border-b border-[#E5E7EB] last:border-0 hover:bg-gray-50 transition">
                          <td className="py-4 text-[#1F2937] font-semibold">{p.noRm}</td>
                          <td className="py-4 text-[#1F2937]">{p.nama}</td>
                          <td className="py-4 text-[#6B7280] hidden sm:table-cell">{p.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}</td>
                          <td className="py-4 text-[#6B7280] hidden md:table-cell">{p.tanggalLahir}</td>
                          <td className="py-4 text-right">
                            {viewMode === 'list' ? (
                              <div className="flex justify-end items-center space-x-3">
                                <button onClick={() => handleEdit(p)} className="flex items-center space-x-1 text-[#2563EB] hover:text-blue-800" title="Edit">
                                  <Edit className="w-4 h-4" />
                                  <span className="hidden sm:inline">Edit</span>
                                </button>
                                <button onClick={() => handleDelete(p.noRm)} className="flex items-center space-x-1 text-red-600 hover:text-red-800" title="Hapus">
                                  <Trash2 className="w-4 h-4" />
                                  <span className="hidden sm:inline">Hapus</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end items-center gap-2">
                                <button 
                                  onClick={() => onPrint(p, 'card')} 
                                  className="flex items-center space-x-2 text-[#2563EB] bg-[#DBEAFE] hover:bg-blue-200 px-3 py-2 rounded-md transition ml-auto font-medium"
                                  title="Cetak Kartu KIB"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  <span className="hidden sm:inline">Kartu</span>
                                </button>
                                <button 
                                  onClick={() => onPrint(p, 'document')} 
                                  className="flex items-center space-x-2 text-[#10B981] bg-[#D1FAE5] hover:bg-emerald-200 px-3 py-2 rounded-md transition font-medium"
                                  title="Cetak Laporan Lengkap"
                                >
                                  <FileText className="w-4 h-4" />
                                  <span className="hidden sm:inline">Dokumen</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="px-10 py-6 border-t border-[#E5E7EB] flex justify-between items-center gap-3 bg-white">
            <div className="flex items-center gap-3">
              {viewMode === 'list' && (
                <>
                  <input 
                    type="file" 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="px-4 py-2.5 rounded-md text-[14px] font-medium bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] transition flex items-center gap-2 border border-[#D1D5DB]"
                    title="Impor data dari CSV atau Excel"
                  >
                    <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Impor Data</span>
                  </button>
                  <button 
                    onClick={handleExport} 
                    className="px-4 py-2.5 rounded-md text-[14px] font-medium bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] transition flex items-center gap-2 border border-[#D1D5DB]"
                    title="Ekspor seluruh data ke Excel"
                  >
                    <Download className="w-4 h-4" /> <span className="hidden sm:inline">Ekspor Excel</span>
                  </button>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {viewMode === 'input' && (
                <>
                  <button onClick={handleNew} className="px-6 py-2.5 rounded-md text-[14px] font-semibold bg-white border border-[#E5E7EB] text-[#1F2937] hover:bg-gray-50 transition">
                    Kosongkan Form
                  </button>
                  <button onClick={handleSave} className="px-6 py-2.5 rounded-md text-[14px] font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition flex items-center gap-2">
                    <Save className="w-4 h-4" /> Simpan Data
                  </button>
                </>
              )}
              {viewMode === 'list' && (
                <button onClick={() => { handleNew(); setViewMode('input'); }} className="px-6 py-2.5 rounded-md text-[14px] font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Tambah Pasien Baru
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
