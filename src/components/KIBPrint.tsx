import React from 'react';
import { Patient, KibSettings } from '../types';
import Barcode from 'react-barcode';
import { ArrowLeft, Printer } from 'lucide-react';

interface KIBPrintProps {
  patient: Patient;
  onBack: () => void;
  kibSettings: KibSettings;
}

export default function KIBPrint({ patient, onBack, kibSettings }: KIBPrintProps) {
  const handlePrint = () => {
    window.print();
  };

  const defaultLogo = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lambang_Kabupaten_Buton_Selatan.png/600px-Lambang_Kabupaten_Buton_Selatan.png";

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-12 flex flex-col items-center">
      <div className="w-full max-w-3xl mb-8 flex justify-between items-center print:hidden">
        <button onClick={onBack} className="flex items-center space-x-2 text-[#6B7280] hover:text-[#1F2937] bg-white border border-[#E5E7EB] px-6 py-2.5 rounded-md text-[14px] font-semibold transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <button onClick={handlePrint} className="flex items-center space-x-2 bg-[#2563EB] text-white px-6 py-2.5 rounded-md text-[14px] font-semibold hover:bg-blue-700 transition">
          <Printer className="w-4 h-4" />
          <span>Cetak</span>
        </button>
      </div>

      {/* Card Container */}
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
           {kibSettings.backgroundUrl ? (
             <img 
               src={kibSettings.backgroundUrl}
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
    </div>
  );
}
