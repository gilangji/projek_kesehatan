import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { KibSettings } from '../types';

interface SettingsProps {
  onBack: () => void;
  kibSettings: KibSettings;
  onUpdateKibSettings: (settings: KibSettings) => void;
}

export default function Settings({ onBack, kibSettings, onUpdateKibSettings }: SettingsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [localSettings, setLocalSettings] = useState<KibSettings>(kibSettings);

  useEffect(() => {
    setLocalSettings(kibSettings);
  }, [kibSettings]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'secondaryLogo' | 'background') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('kib-assets')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage.from('kib-assets').getPublicUrl(fileName);
      
      const newSettings = { 
        ...localSettings, 
        [type === 'logo' ? 'logoUrl' : type === 'secondaryLogo' ? 'secondaryLogoUrl' : 'backgroundUrl']: data.publicUrl 
      };
      
      setLocalSettings(newSettings);

      // 3. Save to Supabase Database (Permanently)
      const { error: dbError } = await supabase.from('settings').upsert({
        id: 'global',
        logo_url: newSettings.logoUrl,
        secondary_logo_url: newSettings.secondaryLogoUrl,
        background_url: newSettings.backgroundUrl
      });

      if (dbError) throw dbError;

      onUpdateKibSettings(newSettings);
      alert(`Berhasil mengunggah dan menyimpan ${type} secara permanen!`);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMsg = error?.message || error?.error_description || JSON.stringify(error);
      if (errorMsg.includes('Failed to fetch')) {
        alert('Gagal mengunggah (Failed to fetch). Ini terjadi karena Kunci Supabase belum dimasukkan ke dalam aplikasi. Silakan berikan URL dan Anon Key Supabase Anda kepada AI, atau masukkan di Environment Variables Vercel.');
      } else {
        alert(`Gagal mengunggah. Detail Error: ${errorMsg}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const isLogoLocked = !!localSettings.logoUrl;
  const isBgLocked = !!localSettings.backgroundUrl;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <nav className="bg-white border-b border-[#E5E7EB] px-8 py-5 flex items-center space-x-4">
        <button onClick={onBack} className="text-[#6B7280] hover:text-[#1F2937] transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <img 
            src={localSettings.logoUrl || "/logo.png"} 
            alt="Logo" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-[20px] font-bold text-[#2563EB] tracking-tight">UPTD PUSKESMAS SAMPOLAWA</h1>
        </div>
      </nav>

      <main className="flex-1 p-8 lg:p-12 max-w-4xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-[28px] font-semibold text-[#1F2937] mb-2">Pengaturan KIB</h1>
          <p className="text-[15px] text-[#6B7280]">Atur logo dan latar belakang Kartu Identitas Berobat secara permanen.</p>
        </header>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start space-x-3">
            <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-blue-800 leading-relaxed">
              <strong>Mode Permanen Aktif:</strong> Logo dan latar belakang yang telah diunggah tidak dapat diubah lagi melalui halaman ini untuk mencegah modifikasi yang tidak sah. Jika ingin mengubahnya, Anda harus melakukannya langsung melalui database Supabase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo Upload */}
            <div className="border border-[#E5E7EB] rounded-lg p-6 bg-[#F9FAFB]">
              <h3 className="font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#2563EB]" />
                Logo Kiri (Utama)
              </h3>
              
              {localSettings.logoUrl ? (
                <div className="flex flex-col items-center justify-center p-6 bg-white border border-[#E5E7EB] rounded-md mb-4">
                  <img src={localSettings.logoUrl} alt="Logo Terkunci" className="h-24 object-contain mb-3" />
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                    <Lock className="w-3 h-3" /> Permanen
                  </span>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-[13px] text-[#6B7280] mb-2">Pilih file gambar (PNG/JPG)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    disabled={isUploading}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#E0E7FF] file:text-[#2563EB] hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
                  />
                </div>
              )}
            </div>

            {/* Secondary Logo Upload */}
            <div className="border border-[#E5E7EB] rounded-lg p-6 bg-[#F9FAFB]">
              <h3 className="font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#2563EB]" />
                Logo Kanan (Puskesmas/Lainnya)
              </h3>
              
              {localSettings.secondaryLogoUrl ? (
                <div className="flex flex-col items-center justify-center p-6 bg-white border border-[#E5E7EB] rounded-md mb-4">
                  <img src={localSettings.secondaryLogoUrl} alt="Logo Kanan Terkunci" className="h-24 object-contain mb-3" />
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                    <Lock className="w-3 h-3" /> Permanen
                  </span>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-[13px] text-[#6B7280] mb-2">Pilih file gambar (PNG/JPG)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'secondaryLogo')}
                    disabled={isUploading}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#E0E7FF] file:text-[#2563EB] hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
                  />
                </div>
              )}
            </div>

            {/* Background Upload */}
            <div className="border border-[#E5E7EB] rounded-lg p-6 bg-[#F9FAFB]">
              <h3 className="font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#2563EB]" />
                Latar Belakang (Background) KIB
              </h3>
              
              {localSettings.backgroundUrl ? (
                <div className="flex flex-col items-center justify-center p-6 bg-white border border-[#E5E7EB] rounded-md mb-4">
                  <div 
                    className="w-full h-24 bg-cover bg-center rounded border border-gray-200 mb-3"
                    style={{ backgroundImage: `url(${localSettings.backgroundUrl})` }}
                  ></div>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                    <Lock className="w-3 h-3" /> Permanen
                  </span>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-[13px] text-[#6B7280] mb-2">Pilih file gambar (PNG/JPG)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'background')}
                    disabled={isUploading}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#E0E7FF] file:text-[#2563EB] hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
                  />
                </div>
              )}
            </div>
          </div>

          {isUploading && (
            <div className="mt-6 text-center">
              <p className="text-[#2563EB] text-sm font-medium animate-pulse">Sedang mengunggah dan menyimpan ke database...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
