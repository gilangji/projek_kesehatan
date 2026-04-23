import React, { useState } from 'react';
import { Patient, KibSettings } from '../types';
import Barcode from 'react-barcode';
import { ArrowLeft, Printer, CreditCard, FileText } from 'lucide-react';

interface KIBPrintProps {
  patient: Patient;
  onBack: () => void;
  kibSettings: KibSettings;
  initialFormat?: 'card' | 'document';
}

export default function KIBPrint({ patient, onBack, kibSettings, initialFormat = 'card' }: KIBPrintProps) {
  const [printFormat, setPrintFormat] = useState<'card' | 'document'>(initialFormat);

  const handlePrint = () => {
    window.print();
  };

  const defaultLogo = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lambang_Kabupaten_Buton_Selatan.png/600px-Lambang_Kabupaten_Buton_Selatan.png";

  return (
    <div className="flex-1 p-8 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-3xl mb-8 flex justify-between items-center print:hidden">
        <button onClick={onBack} className="flex items-center space-x-2 text-[#6B7280] hover:text-[#1F2937] bg-white border border-[#E5E7EB] px-6 py-2.5 rounded-md text-[14px] font-semibold transition shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        
        <div className="flex bg-white rounded-md border border-[#E5E7EB] shadow-sm p-1">
          <button 
            onClick={() => setPrintFormat('card')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-[13px] font-semibold transition ${printFormat === 'card' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Format Kartu</span>
          </button>
          <button 
            onClick={() => setPrintFormat('document')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-[13px] font-semibold transition ${printFormat === 'document' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Format Dokumen</span>
          </button>
        </div>

        <button onClick={handlePrint} className="flex items-center space-x-2 bg-[#2563EB] text-white px-6 py-2.5 rounded-md text-[14px] font-semibold hover:bg-blue-700 transition shadow-sm">
          <Printer className="w-4 h-4" />
          <span>Cetak</span>
        </button>
      </div>

      {printFormat === 'card' ? (
        /* Card Container */
        <div className="bg-white p-10 rounded-xl border border-[#E5E7EB] shadow-sm max-w-2xl w-full print:shadow-none print:border-none print:p-0 print:bg-transparent">
          <div className="border border-[#E5E7EB] rounded-xl overflow-hidden relative bg-white shadow-sm" style={{ width: '85.6mm', height: '53.98mm', margin: '0 auto' }}>
            {/* Background Gradient */}
            {kibSettings.frontBackgroundUrl ? (
              <img 
                src={kibSettings.frontBackgroundUrl}
                alt="Background Depan"
                className="absolute inset-0 w-full h-full object-cover opacity-90 z-0" 
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 opacity-90 z-0"></div>
            )}
            
            {/* Decorative Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] z-20"></div>

            {/* Header */}
            <div className="bg-white/80 border-b border-[#E5E7EB]/50 text-[#1F2937] p-2 flex items-center justify-between relative z-10 pt-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 shrink-0">
                  <img 
                    src={kibSettings.logoUrl || defaultLogo} 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-[10px] font-bold leading-tight text-[#1F2937]">UPTD PUSKESMAS SAMPOLAWA</h1>
                  <h2 className="text-[8px] font-semibold tracking-wide leading-tight text-[#1F2937]">BUTON SELATAN</h2>
                </div>
              </div>
              {kibSettings.secondaryLogoUrl && (
                <div className="w-8 h-8 shrink-0 ml-2">
                  <img 
                    src={kibSettings.secondaryLogoUrl} 
                    alt="Logo Kanan" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-3 relative z-10 text-[10px] text-[#1F2937]">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="font-semibold w-24 pb-1 text-[#4B5563]">No Rekam Medis</td>
                    <td className="pb-1 font-bold text-[#1F2937]">: {patient.noRm}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pb-1 text-[#4B5563]">Nama</td>
                    <td className="pb-1 font-bold text-[#1F2937]">: {patient.nama}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pb-1 text-[#4B5563]">Jenis Kelamin</td>
                    <td className="pb-1 font-medium text-[#1F2937]">: {patient.jenisKelamin}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pb-1 text-[#4B5563]">Tanggal Lahir</td>
                    <td className="pb-1 font-medium text-[#1F2937]">: {patient.tanggalLahir}</td>
                  </tr>
                </tbody>
              </table>
              
              <div className="mt-2 flex justify-center bg-white/80 p-1.5 rounded-md border border-white/50 inline-block mx-auto w-fit">
                <Barcode 
                  value={patient.noRm} 
                  width={1.5} 
                  height={28} 
                  fontSize={10} 
                  margin={0}
                  displayValue={true}
                  lineColor="#1F2937"
                  background="transparent"
                />
              </div>
            </div>
          </div>

          {/* Instructions Card (Back of card or separate info) */}
          <div className="mt-8 border border-[#E5E7EB] rounded-xl overflow-hidden relative bg-white shadow-sm" style={{ width: '85.6mm', height: '53.98mm', margin: '20px auto 0' }}>
             {/* Background Gradient or Custom Image */}
             {kibSettings.frontBackgroundUrl ? (
               <img 
                 src={kibSettings.frontBackgroundUrl}
                 alt="Background Belakang"
                 className="absolute inset-0 w-full h-full object-cover opacity-90 z-0" 
               />
             ) : (
               <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 opacity-90 z-0"></div>
             )}
             
             {/* Decorative Top Accent */}
             <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9CA3AF] to-[#D1D5DB] z-20"></div>

             <div className="p-5 relative z-10 flex flex-col h-full justify-center">
                <h3 className="text-center font-bold text-[12px] mb-3 text-[#1F2937] tracking-wide">KARTU IDENTITAS BEROBAT</h3>
                <p className="text-[9px] font-semibold mb-1.5 text-[#4B5563]">Perhatian:</p>
                <ul className="list-disc pl-4 text-[8px] text-[#4B5563] space-y-1.5 leading-relaxed">
                  <li>Kartu ini berlaku bagi nama yang tercantum dalam kartu.</li>
                  <li>Harap dibawa setiap kali berobat dan jangan sampai hilang.</li>
                  <li>Setiap pencetakan kartu baru akan dikenakan biaya sesuai ketentuan.</li>
                  <li>Bagi yang menemukan kartu ini harap mengembalikan ke UPTD Puskesmas Sampolawa.</li>
                </ul>
             </div>
          </div>
        </div>
      ) : (
        /* Document Container */
        <div className="bg-white p-12 print:p-0 print:border-none border border-[#E5E7EB] shadow-sm max-w-3xl w-full mx-auto" style={{ minHeight: '297mm' }}>
          {/* Document Header */}
          <div className="flex items-center justify-between border-b-[3px] border-black pb-4 mb-6">
            <div className="w-20 h-20">
              <img src={kibSettings.logoUrl || defaultLogo} alt="Logo Kiri" className="w-full h-full object-contain" />
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="text-[20px] font-bold text-[#1F2937]">PEMERINTAH KABUPATEN BUTON SELATAN</h1>
              <h2 className="text-[18px] font-bold text-[#1F2937]">DINAS KESEHATAN</h2>
              <h3 className="text-[22px] font-black text-[#1F2937]">UPTD PUSKESMAS SAMPOLAWA</h3>
              <p className="text-[12px] text-[#4B5563] mt-1">Sistem Informasi Rekam Medis Pasien</p>
            </div>
            <div className="w-20 h-20">
              {kibSettings.secondaryLogoUrl ? (
                <img src={kibSettings.secondaryLogoUrl} alt="Logo Kanan" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full"></div> /* Placeholder to keep text centered */
              )}
            </div>
          </div>

          <h4 className="text-center font-bold items-center justify-center text-[18px] underline text-[#1F2937] mb-8">
            PROFIL DATA PASIEN
          </h4>

          {/* Document Body */}
          <div className="grid grid-cols-[1fr,max-content] gap-8">
            <div>
              <table className="w-full text-[14px]">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-[#4B5563] w-48">No Rekam Medis</td>
                    <td className="py-3 font-bold text-black">: {patient.noRm}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-[#4B5563]">Ruangan</td>
                    <td className="py-3 font-bold text-black">: {patient.ruangan || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-[#4B5563]">Nama Lengkap</td>
                    <td className="py-3 text-black">: {patient.nama}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-[#4B5563]">Jenis Kelamin</td>
                    <td className="py-3 text-black">: {patient.jenisKelamin}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-[#4B5563]">Tanggal Lahir / Umur</td>
                    <td className="py-3 text-black">: {patient.tanggalLahir} ({patient.umur})</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-[#4B5563]">Agama</td>
                    <td className="py-3 text-black">: {patient.agama}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-[#4B5563]">Pendidikan</td>
                    <td className="py-3 text-black">: {patient.pendidikan}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-[#4B5563]">Pekerjaan</td>
                    <td className="py-3 text-black">: {patient.pekerjaan}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-[#4B5563]">Status Pernikahan</td>
                    <td className="py-3 text-black">: {patient.status}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-[#4B5563]">No. Telepon</td>
                    <td className="py-3 text-black">: {patient.noTelepon}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-[#4B5563] align-top">Alamat Domisili</td>
                    <td className="py-3 text-black align-top">: {patient.alamat}</td>
                  </tr>
                  {patient.laporanDokter && (
                    <tr className="border-b border-gray-100">
                      <td className="py-3 font-semibold text-[#4B5563] align-top">Laporan Dokter / Keluhan</td>
                      <td className="py-3 text-black align-top">: {patient.laporanDokter}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <h5 className="font-bold text-[15px] mt-8 mb-4 text-[#1F2937]">Data Penanggung Jawab</h5>
              <table className="w-full text-[14px]">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-semibold text-[#4B5563] w-48">Nama</td>
                    <td className="py-2 text-black">: {patient.penanggungJawab.nama}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-semibold text-[#4B5563]">Hubungan dengan Pasien</td>
                    <td className="py-2 text-black">: {patient.penanggungJawab.hubungan}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-semibold text-[#4B5563]">No. Telepon</td>
                    <td className="py-2 text-black">: {patient.penanggungJawab.noTelepon}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-semibold text-[#4B5563] align-top">Alamat</td>
                    <td className="py-2 text-black align-top">: {patient.penanggungJawab.alamat}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-end">
              <div className="bg-white p-2 inline-block border border-gray-200 rounded">
                <Barcode 
                  value={patient.noRm} 
                  width={2} 
                  height={50} 
                  fontSize={14} 
                  margin={0}
                  displayValue={true}
                  lineColor="#000000"
                  background="transparent"
                />
              </div>
            </div>
          </div>
          
          {/* Document Footer */}
          <div className="mt-16 flex justify-end">
            <div className="text-center">
              <p className="text-[14px] text-black mb-16">Petugas Registrasi / RM</p>
              <p className="text-[14px] text-black font-semibold border-b border-black inline-block px-4">_______________________</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
