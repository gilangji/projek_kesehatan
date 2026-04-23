import React, { useState, useEffect } from 'react';
import { Patient, KibSettings } from '../types';
import { ArrowLeft, Save, Edit, Trash2, Printer, Plus, FileText, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
          <div>
            <h1 className="text-[28px] font-semibold text-[#1F2937] mb-2">{getTitle()}</h1>
            <p className="text-[15px] text-[#6B7280]">{getSubtitle()}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E0E7FF] text-[#2563EB]">MODUL AKTIF</span>
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
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">No Telepon</label>
                  <input type="text" name="noTelepon" value={formData.noTelepon} onChange={handleInputChange} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
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
            <div className="p-8 lg:p-10 flex-1 overflow-y-auto">
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
                    {patients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#6B7280]">Belum ada data pasien terdaftar</td>
                      </tr>
                    ) : (
                      patients.map((p) => (
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

          <div className="px-10 py-6 border-t border-[#E5E7EB] flex justify-end gap-3 bg-white">
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
      </main>
    </div>
  );
}
