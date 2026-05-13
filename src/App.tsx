/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import MainMenu from './components/MainMenu';
import PatientData from './components/PatientData';
import KIBPrint from './components/KIBPrint';
import Settings from './components/Settings';
import { Patient, KibSettings } from './types';
import { supabase } from './lib/supabase';

type ViewState = 'login' | 'main' | 'patientInput' | 'patientList' | 'printMenu' | 'settings' | 'printPreview' | 'patientSelfPortal' | 'patientSelfPrintPreview';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const savedView = localStorage.getItem('currentView');
    if (savedView === 'printPreview') return 'patientList';
    if (savedView === 'patientSelfPrintPreview') return 'patientSelfPortal';
    return (savedView as ViewState) || 'login';
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    const saved = localStorage.getItem('selectedPatient');
    return saved ? JSON.parse(saved) : null;
  });
  const [userRole, setUserRole] = useState<'admin' | 'patient'>(() => {
    const savedRole = localStorage.getItem('userRole');
    return (savedRole as 'admin' | 'patient') || 'admin';
  });
  const [printFormat, setPrintFormat] = useState<'card' | 'document'>('card');
  const [kibSettings, setKibSettings] = useState<KibSettings>({ logoUrl: '', backgroundUrl: '' });

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('userRole', userRole);
  }, [userRole]);

  useEffect(() => {
    if (selectedPatient) {
      localStorage.setItem('selectedPatient', JSON.stringify(selectedPatient));
    } else {
      localStorage.removeItem('selectedPatient');
    }
  }, [selectedPatient]);

  // Fetch settings from Supabase on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'global')
          .single();
          
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
        
        if (data) {
          setKibSettings({ 
            logoUrl: data.logo_url || '', 
            secondaryLogoUrl: data.secondary_logo_url || '',
            backgroundUrl: data.background_url || '',
            frontBackgroundUrl: data.front_background_url || ''
          });
        }
      } catch (error) {
        console.error('Error fetching settings from Supabase:', error);
        // Fallback to local storage if Supabase fails
        const saved = localStorage.getItem('kibSettings');
        if (saved) setKibSettings(JSON.parse(saved));
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('kibSettings', JSON.stringify(kibSettings));
  }, [kibSettings]);

  const handleLogin = (role: 'admin' | 'patient', patientData?: Patient) => {
    setUserRole(role);
    if (role === 'admin') {
      setCurrentView('main');
    } else if (role === 'patient' && patientData) {
      setSelectedPatient(patientData);
      setPrintFormat('card'); // Automatically assume they want card, not document
      setCurrentView('patientSelfPrintPreview');
    }
  };

  const handleLogout = () => {
    setUserRole('admin');
    setSelectedPatient(null);
    setCurrentView('login');
  };
  
  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewState);
  };

  const handlePrint = (patient: Patient, format: 'card' | 'document') => {
    setSelectedPatient(patient);
    setPrintFormat(format);
    if (userRole === 'patient') {
      setCurrentView('patientSelfPrintPreview');
    } else {
      setCurrentView('printPreview');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-[#F8F9FA] print:bg-white">
      {/* Global Unified Background */}
      {kibSettings.backgroundUrl ? (
        <div 
          className="fixed inset-0 bg-cover bg-center z-0 print:hidden" 
          style={{ backgroundImage: `url(${kibSettings.backgroundUrl})` }}
        >
          <div className="absolute inset-0 bg-white/[0.03]"></div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-[#F8F9FA] z-0 print:hidden"></div>
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        {currentView === 'login' && <Login onLogin={handleLogin} kibSettings={kibSettings} />}
        {currentView === 'main' && userRole === 'admin' && <MainMenu onNavigate={handleNavigate} onLogout={handleLogout} kibSettings={kibSettings} />}
        {currentView === 'settings' && userRole === 'admin' && (
          <Settings 
            onBack={() => setCurrentView('main')} 
            kibSettings={kibSettings}
            onUpdateKibSettings={setKibSettings}
          />
        )}
        {currentView === 'patientInput' && userRole === 'admin' && (
          <PatientData 
            mode="input"
            onBack={() => setCurrentView('main')} 
            onPrint={handlePrint} 
            kibSettings={kibSettings}
          />
        )}
        {currentView === 'patientList' && userRole === 'admin' && (
          <PatientData 
            mode="list"
            onBack={() => setCurrentView('main')} 
            onPrint={handlePrint} 
            kibSettings={kibSettings}
          />
        )}
        {currentView === 'printMenu' && userRole === 'admin' && (
          <PatientData 
            mode="printMenu"
            onBack={() => setCurrentView('main')} 
            onPrint={handlePrint} 
            kibSettings={kibSettings}
          />
        )}
        {currentView === 'printPreview' && selectedPatient && userRole === 'admin' && (
          <KIBPrint 
            patient={selectedPatient} 
            onBack={() => setCurrentView('printMenu')} 
            kibSettings={kibSettings}
            initialFormat={printFormat}
          />
        )}
        {currentView === 'patientSelfPortal' && selectedPatient && userRole === 'patient' && (
          <div className="flex-1 p-8 lg:p-12 flex flex-col max-w-4xl mx-auto w-full">
             <div className="bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm mb-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <img src={kibSettings.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lambang_Kabupaten_Buton_Selatan.png/600px-Lambang_Kabupaten_Buton_Selatan.png"} alt="Logo" className="w-12 h-12 object-contain" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Portal Pasien Mandiri</h1>
                    <p className="text-sm text-gray-500">Selamat datang, {selectedPatient.nama}!</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-md text-sm font-semibold transition">
                  Keluar
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col items-center text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Kartu KIB Anda</h3>
                  <p className="text-sm text-gray-500 mb-6">Cetak atau simpan Kartu Identitas Berobat Anda</p>
                  <button onClick={() => handlePrint(selectedPatient, 'card')} className="w-full bg-blue-600 text-white rounded-md py-3 font-semibold hover:bg-blue-700 transition shadow-sm">
                    Lihat & Cetak Kartu
                  </button>
               </div>
               <div className="bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col items-center text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Laporan Rekam Medis</h3>
                  <p className="text-sm text-gray-500 mb-6">Cetak dokumen A4 berisi profil lengkap Anda</p>
                  <button onClick={() => handlePrint(selectedPatient, 'document')} className="w-full bg-emerald-600 text-white rounded-md py-3 font-semibold hover:bg-emerald-700 transition shadow-sm">
                    Lihat & Cetak Laporan
                  </button>
               </div>
             </div>
          </div>
        )}
        {currentView === 'patientSelfPrintPreview' && selectedPatient && userRole === 'patient' && (
          <KIBPrint 
            patient={selectedPatient} 
            onBack={handleLogout} 
            kibSettings={kibSettings}
            initialFormat={printFormat}
          />
        )}
      </div>
    </div>
  );
}

