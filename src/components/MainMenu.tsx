import React from 'react';
import { Users, LogOut, FileText, Settings, UserPlus, CreditCard, Printer } from 'lucide-react';
import { KibSettings } from '../types';

interface MainMenuProps {
  onNavigate: (view: string) => void;
  onLogout: () => void;
  kibSettings: KibSettings;
}

export default function MainMenu({ onNavigate, onLogout, kibSettings }: MainMenuProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      {kibSettings.backgroundUrl ? (
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: `url(${kibSettings.backgroundUrl})` }}
        >
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-[#F8F9FA] z-0"></div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-8 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src={kibSettings.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lambang_Kabupaten_Buton_Selatan.png/600px-Lambang_Kabupaten_Buton_Selatan.png"} 
              alt="Logo" 
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-[20px] font-bold text-[#2563EB] tracking-tight">UPTD PUSKESMAS SAMPOLAWA</h1>
          </div>
          <button onClick={onLogout} className="flex items-center space-x-2 text-[#6B7280] hover:text-[#1F2937] font-medium text-[14px]">
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </nav>
        
        <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
          <header className="mb-10">
            <h1 className="text-[28px] font-semibold text-[#1F2937] mb-2">Menu Utama</h1>
            <p className="text-[15px] text-[#6B7280]">Pilih modul untuk melanjutkan proses kerja.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => onNavigate('patientInput')}
              className="bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm hover:border-[#2563EB] hover:shadow-md transition flex flex-col items-start justify-center space-y-4 text-left group"
            >
              <div className="bg-[#E0E7FF] group-hover:bg-[#DBEAFE] p-3 rounded-full transition">
                <UserPlus className="w-6 h-6 text-[#2563EB]" />
              </div>
              <div>
                <span className="block text-[16px] font-semibold text-[#1F2937] mb-1">Input Data Pasien</span>
                <span className="text-[13px] text-[#6B7280]">Registrasi form pasien baru</span>
              </div>
            </button>
            
            <button
              onClick={() => onNavigate('patientList')}
              className="bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm hover:border-[#2563EB] hover:shadow-md transition flex flex-col items-start justify-center space-y-4 text-left group"
            >
              <div className="bg-[#E0E7FF] group-hover:bg-[#DBEAFE] p-3 rounded-full transition">
                <Users className="w-6 h-6 text-[#2563EB]" />
              </div>
              <div>
                <span className="block text-[16px] font-semibold text-[#1F2937] mb-1">Daftar Pasien</span>
                <span className="text-[13px] text-[#6B7280]">Lihat, edit, dan hapus data</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('printMenu')}
              className="bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm hover:border-[#2563EB] hover:shadow-md transition flex flex-col items-start justify-center space-y-4 text-left group"
            >
              <div className="bg-[#E0E7FF] group-hover:bg-[#DBEAFE] p-3 rounded-full transition">
                <Printer className="w-6 h-6 text-[#2563EB]" />
              </div>
              <div>
                <span className="block text-[16px] font-semibold text-[#1F2937] mb-1">Cetak KIB & Laporan</span>
                <span className="text-[13px] text-[#6B7280]">Cetak kartu berobat dan dokumen A4</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className="bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm hover:border-[#2563EB] hover:shadow-md transition flex flex-col items-start justify-center space-y-4 text-left group"
            >
              <div className="bg-[#E0E7FF] group-hover:bg-[#DBEAFE] p-3 rounded-full transition">
                <Settings className="w-6 h-6 text-[#2563EB]" />
              </div>
              <div>
                <span className="block text-[16px] font-semibold text-[#1F2937] mb-1">Pengaturan KIB</span>
                <span className="text-[13px] text-[#6B7280]">Atur logo dan latar belakang</span>
              </div>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
