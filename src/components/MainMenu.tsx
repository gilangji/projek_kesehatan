import React from 'react';
import { Users, LogOut, FileText, Settings } from 'lucide-react';
import { KibSettings } from '../types';

interface MainMenuProps {
  onNavigate: (view: string) => void;
  onLogout: () => void;
  kibSettings: KibSettings;
}

export default function MainMenu({ onNavigate, onLogout, kibSettings }: MainMenuProps) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <nav className="bg-white border-b border-[#E5E7EB] px-8 py-5 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img 
            src={kibSettings.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lambang_Kabupaten_Buton_Selatan.png/600px-Lambang_Kabupaten_Buton_Selatan.png"} 
            alt="Logo" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-[20px] font-bold text-[#2563EB] tracking-tight">RSKGM BUTON SELATAN</h1>
        </div>
        <button onClick={onLogout} className="flex items-center space-x-2 text-[#6B7280] hover:text-[#1F2937] font-medium text-[14px]">
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </nav>
      
      <main className="flex-1 p-12">
        <header className="mb-10">
          <h1 className="text-[28px] font-semibold text-[#1F2937] mb-2">Menu Utama</h1>
          <p className="text-[15px] text-[#6B7280]">Pilih modul untuk melanjutkan proses kerja.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => onNavigate('patientData')}
            className="bg-white p-8 rounded-xl border border-[#E5E7EB] hover:border-[#2563EB] transition flex flex-col items-start justify-center space-y-4 text-left"
          >
            <div className="bg-[#E0E7FF] p-3 rounded-full">
              <Users className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <span className="block text-[16px] font-semibold text-[#1F2937] mb-1">Data Pasien</span>
              <span className="text-[13px] text-[#6B7280]">Kelola data dan cetak KIB</span>
            </div>
          </button>
          
          <button
            className="bg-white p-8 rounded-xl border border-[#E5E7EB] opacity-60 cursor-not-allowed flex flex-col items-start justify-center space-y-4 text-left"
          >
            <div className="bg-[#E0E7FF] p-3 rounded-full">
              <FileText className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <span className="block text-[16px] font-semibold text-[#1F2937] mb-1">Laporan</span>
              <span className="text-[13px] text-[#6B7280]">Modul dalam pengembangan</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="bg-white p-8 rounded-xl border border-[#E5E7EB] hover:border-[#2563EB] transition flex flex-col items-start justify-center space-y-4 text-left"
          >
            <div className="bg-[#E0E7FF] p-3 rounded-full">
              <Settings className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <span className="block text-[16px] font-semibold text-[#1F2937] mb-1">Pengaturan KIB</span>
              <span className="text-[13px] text-[#6B7280]">Atur logo dan latar belakang kartu</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
