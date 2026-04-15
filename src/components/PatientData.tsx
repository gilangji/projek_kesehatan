import React, { useState } from 'react';
import { Patient } from '../types';
import { ArrowLeft, Save, Edit, Trash2, Printer, Plus } from 'lucide-react';

interface PatientDataProps {
  onBack: () => void;
  onPrint: (patient: Patient) => void;
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

export default function PatientData({ onBack, onPrint }: PatientDataProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState<Patient>(initialPatientState);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSave = () => {
    if (!formData.noRm || !formData.nama) {
      alert('No RM dan Nama harus diisi!');
      return;
    }

    if (isEditing) {
      setPatients(patients.map(p => p.noRm === formData.noRm ? formData : p));
      setIsEditing(false);
    } else {
      if (patients.some(p => p.noRm === formData.noRm)) {
        alert('No RM sudah ada!');
        return;
      }
      setPatients([...patients, formData]);
    }
    setFormData(initialPatientState);
  };

  const handleEdit = (patient: Patient) => {
    setFormData(patient);
    setIsEditing(true);
  };

  const handleDelete = (noRm: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      setPatients(patients.filter(p => p.noRm !== noRm));
      if (formData.noRm === noRm) {
        setFormData(initialPatientState);
        setIsEditing(false);
      }
    }
  };

  const handleNew = () => {
    setFormData(initialPatientState);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <nav className="bg-white border-b border-[#E5E7EB] px-8 py-5 flex items-center space-x-4">
        <button onClick={onBack} className="text-[#6B7280] hover:text-[#1F2937] transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="Logo Buton Selatan" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-[20px] font-bold text-[#2563EB] tracking-tight">RSKGM BUTON SELATAN</h1>
        </div>
      </nav>

      <main className="flex-1 p-8 lg:p-12 flex flex-col">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-[28px] font-semibold text-[#1F2937] mb-2">Data Pasien</h1>
            <p className="text-[15px] text-[#6B7280]">Manajemen data pasien dan pencetakan KIB</p>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E0E7FF] text-[#2563EB]">MODUL AKTIF</span>
        </header>

        <div className="bg-white border border-[#E5E7EB] rounded-xl flex-1 flex flex-col overflow-hidden">
          <div className="p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 flex-1 overflow-y-auto">
            {/* Form Section */}
            <div className="form-section">
              <h3 className="text-[18px] font-semibold text-[#1F2937] mb-6">Form Data Pasien</h3>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">No RM</label>
                  <input type="text" name="noRm" value={formData.noRm} onChange={handleInputChange} disabled={isEditing} className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-[14px] text-[#1F2937] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5">Nama Pasien</label>
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

              <h3 className="text-[18px] font-semibold text-[#1F2937] mt-8 mb-6">Penanggung Jawab</h3>
              <div className="grid grid-cols-2 gap-5">
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

            {/* Table Section */}
            <div className="summary-section">
              <div className="bg-[#F9FAFB] p-6 rounded-xl border border-[#E5E7EB] h-full flex flex-col">
                <h4 className="text-[14px] font-semibold text-[#1F2937] mb-5">Daftar Pasien</h4>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-[14px]">
                    <thead>
                      <tr className="text-[#6B7280] border-b border-[#E5E7EB]">
                        <th className="pb-3 text-left font-medium">No RM</th>
                        <th className="pb-3 text-left font-medium">Nama</th>
                        <th className="pb-3 text-right font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-[#6B7280]">Belum ada data</td>
                        </tr>
                      ) : (
                        patients.map((p) => (
                          <tr key={p.noRm} className="border-b border-[#E5E7EB] last:border-0">
                            <td className="py-3 text-[#1F2937] font-medium">{p.noRm}</td>
                            <td className="py-3 text-[#6B7280]">{p.nama}</td>
                            <td className="py-3 text-right">
                              <button onClick={() => handleEdit(p)} className="text-[#2563EB] hover:text-blue-800 mr-3">
                                <Edit className="w-4 h-4 inline" />
                              </button>
                              <button onClick={() => onPrint(p)} className="text-[#10B981] hover:text-emerald-700">
                                <Printer className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="px-10 py-6 border-t border-[#E5E7EB] flex justify-end gap-4 bg-white">
            <button onClick={handleNew} className="px-6 py-2.5 rounded-md text-[14px] font-semibold bg-white border border-[#E5E7EB] text-[#1F2937] hover:bg-gray-50 transition">
              Baru
            </button>
            {isEditing && (
              <button onClick={() => handleDelete(formData.noRm)} className="px-6 py-2.5 rounded-md text-[14px] font-semibold bg-white border border-[#E5E7EB] text-red-600 hover:bg-red-50 transition">
                Hapus
              </button>
            )}
            <button onClick={handleSave} className="px-6 py-2.5 rounded-md text-[14px] font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition">
              Simpan Data
            </button>
            {formData.noRm && (
              <button onClick={() => onPrint(formData)} className="px-6 py-2.5 rounded-md text-[14px] font-semibold bg-[#10B981] text-white hover:bg-emerald-600 transition">
                Cetak KIB
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
