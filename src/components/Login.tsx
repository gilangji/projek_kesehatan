import React, { useState, useEffect } from 'react';
import { Lock, User, UserPlus, Fingerprint, Calendar, ScanLine, X } from 'lucide-react';
import { KibSettings, Patient } from '../types';
import { supabase } from '../lib/supabase';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

interface LoginProps {
  onLogin: (role: 'admin' | 'patient', patientData?: Patient) => void;
  kibSettings: KibSettings;
}

export default function Login({ onLogin, kibSettings }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'admin' | 'pasien'>('pasien');
  const [isScanning, setIsScanning] = useState(false);
  
  // Admin state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Patient login state
  const [loginRm, setLoginRm] = useState('');
  const [loginTglLahir, setLoginTglLahir] = useState('');
  
  // Patient registration state
  const [isRegistering, setIsRegistering] = useState(false);
  const [regData, setRegData] = useState({
    nama: '',
    jenisKelamin: 'Laki-laki',
    tanggalLahir: '',
    alamat: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(async (decodedText) => {
        // Stop scanner on success
        scanner.clear();
        setIsScanning(false);
        await loginWithBarcode(decodedText);
      }, () => {
        // handle scan failure (ignore)
      });

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [isScanning]);

  const loginWithBarcode = async (barcodeData: string) => {
    setLoading(true);
    setError('');
    try {
      // Tolerate case insensitive RM
      const formattedRm = barcodeData.trim().toUpperCase();
      const { data, error } = await supabase
        .from('Data_Pasien')
        .select('*')
        .ilike('no_rm', formattedRm)
        .single();
        
      if (error || !data) {
        throw new Error(`Data pasien dengan No RM ${barcodeData} tidak ditemukan.`);
      }
      
      onLogin('patient', mapToPatient(data));
    } catch (err: any) {
      console.error(err);
      setError('Gagal masuk via scan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin('admin');
    } else {
      setError('Username atau password admin salah!');
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
      nama: row.pj_nama || '',
      hubungan: row.pj_hubungan || '',
      alamat: row.pj_alamat || '',
      noTelepon: row.pj_no_telepon || ''
    }
  });

  const parseTglLahir = (input: string) => {
    // Toleransi berbagai format: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, YYYY/MM/DD
    const cleaned = input.replace(/\//g, '-').trim();
    const parts = cleaned.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return cleaned;
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY -> YYYY-MM-DD
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return input; // return as is if can't infer
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formattedInput = loginRm.trim();
      const formattedTgl = parseTglLahir(loginTglLahir);
      
      const { data, error } = await supabase
        .from('Data_Pasien')
        .select('*')
        .or(`no_rm.ilike.%${formattedInput}%,nama.ilike.%${formattedInput}%`)
        .eq('tanggal_lahir', formattedTgl)
        .limit(1);
        
      if (error || !data || data.length === 0) {
        throw new Error('Data pasien tidak ditemukan atau format tanggal lahir salah (Gunakan YYYY-MM-DD atau DD-MM-YYYY).');
      }
      
      onLogin('patient', mapToPatient(data[0]));
    } catch (err: any) {
      console.error(err);
      setError('Gagal masuk: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!regData.nama || !regData.tanggalLahir) {
      setError('Nama dan Tanggal Lahir wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      // Generate Auto RM (simple approach using timestamp)
      const autoRm = `RM-${Math.floor(Date.now() / 1000).toString().slice(-6)}`;
      const formattedTgl = parseTglLahir(regData.tanggalLahir);
      
      const newRow = {
        no_rm: autoRm,
        nama: regData.nama,
        jenis_kelamin: regData.jenisKelamin,
        tanggal_lahir: formattedTgl,
        alamat: regData.alamat,
        umur: '',
        agama: '',
        pendidikan: '',
        pekerjaan: '',
        status: '',
        no_telepon: '',
        laporan_dokter: '',
        ruangan: '',
        pj_nama: '',
        pj_hubungan: '',
        pj_alamat: '',
        pj_no_telepon: ''
      };

      const { error } = await supabase.from('Data_Pasien').insert([newRow]);

      if (error) throw error;

      alert(`Pendaftaran Berhasil!\n\nNo Rekam Medis (RM) Anda: ${autoRm}\nHarap catat No RM ini untuk login selanjutnya.`);
      
      onLogin('patient', mapToPatient(newRow));
    } catch (err: any) {
      console.error(err);
      setError('Gagal mendaftar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm w-full max-w-[450px]">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20">
            <img 
              src={kibSettings.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lambang_Kabupaten_Buton_Selatan.png/600px-Lambang_Kabupaten_Buton_Selatan.png"} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <h2 className="text-[20px] font-bold text-center text-[#1F2937] mb-6">UPTD Puskesmas Sampolawa</h2>

        {!isRegistering ? (
          <>
            <div className="flex border-b border-[#E5E7EB] mb-6">
              <button 
                className={`flex-1 pb-3 text-[14px] font-semibold transition ${activeTab === 'pasien' ? 'text-[#2563EB] border-b-2 border-[#2563EB]' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
                onClick={() => { setActiveTab('pasien'); setError(''); }}
              >
                Pasien
              </button>
              <button 
                className={`flex-1 pb-3 text-[14px] font-semibold transition ${activeTab === 'admin' ? 'text-[#2563EB] border-b-2 border-[#2563EB]' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
                onClick={() => { setActiveTab('admin'); setError(''); }}
              >
                Petugas
              </button>
            </div>

            {error && <p className="text-red-500 text-[13px] text-center mb-4">{error}</p>}

            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit}>
                <div className="mb-4 relative">
                  <User className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Username Admin"
                    className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[14px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-6 relative">
                  <Lock className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Password Admin"
                    className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[14px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1F2937] text-white py-3 rounded-md text-[14px] font-semibold hover:bg-gray-800 transition duration-200"
                >
                  Masuk sebagai Petugas
                </button>
              </form>
            )}

            {activeTab === 'pasien' && (
              <form onSubmit={handlePatientSubmit}>
                {isScanning ? (
                  <div className="mb-6 relative">
                    <div id="reader" className="w-full bg-[#f8f9fa] border border-[#e5e7eb] rounded-xl overflow-hidden"></div>
                    <button 
                      type="button" 
                      onClick={() => setIsScanning(false)}
                      className="w-full mt-3 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-md text-[13px] font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Batal Scan
                    </button>
                    <p className="text-center text-[12px] text-gray-500 mt-2">
                      Arahkan kode batang atau QR code kartu KIB Anda ke kamera.
                    </p>
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-[12px] text-amber-700 text-center">
                        <strong>Kamera lambat/tidak muncul?</strong><br/>Karena alasan keamanan *browser* saat di dalam mode *preview* (layar kecil), izin kamera bisa tertunda. Silakan buka aplikasi ini di <strong>Tab Baru</strong> (ikon kotak tanda panah di pojok kanan atas) agar lebih lancar.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-center text-[13px] text-[#4B5563] mb-4 font-medium">Buka Kartu Elektronik</h3>
                    <div className="mb-4 relative">
                      <Fingerprint className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                      <input
                        type="text"
                        placeholder="No Rekam Medis (RM) / Nama"
                        className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[14px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                        value={loginRm}
                        required
                        onChange={(e) => setLoginRm(e.target.value)}
                      />
                    </div>
                    <div className="mb-6 relative">
                      <Calendar className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Tgl Lahir (DD-MM-YYYY / YYYY-MM-DD)"
                        className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[14px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                        value={loginTglLahir}
                        required
                        onChange={(e) => setLoginTglLahir(e.target.value)}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#2563EB] text-white py-3 rounded-md text-[14px] font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-70 mb-3"
                    >
                      {loading ? 'Memeriksa...' : 'E-KIB'}
                    </button>

                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">ATAU</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsScanning(true)}
                      className="w-full bg-[#F3F4F6] text-[#1F2937] py-3 rounded-md text-[14px] font-semibold hover:bg-[#E5E7EB] transition flex items-center justify-center gap-2 border border-[#D1D5DB]"
                    >
                      <ScanLine className="w-5 h-5" /> Scan Kode Batang
                    </button>
                  </>
                )}

                <div className="mt-6 text-center border-t border-[#E5E7EB] pt-6">
                  <p className="text-[#6B7280] text-[13px] mb-3">Belum pernah berobat / belum punya No RM?</p>
                  <button
                    type="button"
                    onClick={() => { setIsRegistering(true); setError(''); }}
                    className="w-full flex items-center justify-center space-x-2 border border-[#2563EB] text-[#2563EB] bg-blue-50 py-2.5 rounded-md text-[13px] font-semibold hover:bg-blue-100 transition duration-200"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar / Isi Form Mandiri</span>
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div>
            <div className="mb-5 border-b border-[#E5E7EB] pb-3">
              <h3 className="text-[16px] font-bold text-[#1F2937]">Registrasi Pasien Baru</h3>
              <p className="text-[12px] text-[#6B7280]">Silakan lengkapi formulir pendaftaran diri Anda.</p>
            </div>

            {error && <p className="text-red-500 text-[13px] text-center mb-4">{error}</p>}

            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-4">
                <label className="block text-[12px] text-[#4B5563] mb-1.5 font-medium">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[14px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  value={regData.nama}
                  onChange={(e) => setRegData({...regData, nama: e.target.value})}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-[12px] text-[#4B5563] mb-1.5 font-medium">Jenis Kelamin</label>
                <select
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[14px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  value={regData.jenisKelamin}
                  onChange={(e) => setRegData({...regData, jenisKelamin: e.target.value})}
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-[12px] text-[#4B5563] mb-1.5 font-medium">Tanggal Lahir</label>
                <input
                  type="text"
                  required
                  placeholder="DD-MM-YYYY atau YYYY-MM-DD"
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[14px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  value={regData.tanggalLahir}
                  onChange={(e) => setRegData({...regData, tanggalLahir: e.target.value})}
                />
              </div>

              <div className="mb-6">
                <label className="block text-[12px] text-[#4B5563] mb-1.5 font-medium">Alamat Domisili</label>
                <textarea
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[14px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  rows={2}
                  value={regData.alamat}
                  onChange={(e) => setRegData({...regData, alamat: e.target.value})}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] text-white py-3 rounded-md text-[14px] font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-70 mb-3"
              >
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setError(''); }}
                className="w-full bg-[#F3F4F6] text-[#4B5563] py-2.5 rounded-md text-[13px] font-semibold hover:bg-[#E5E7EB] transition duration-200"
              >
                Batal / Kembali Log in
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
