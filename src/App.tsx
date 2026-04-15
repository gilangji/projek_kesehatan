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

type ViewState = 'login' | 'main' | 'patientData' | 'printKIB' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const savedView = localStorage.getItem('currentView');
    // Jika di-refresh saat di halaman cetak, kembalikan ke data pasien agar tidak error karena data pasien kosong
    if (savedView === 'printKIB') return 'patientData';
    return (savedView as ViewState) || 'login';
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [kibSettings, setKibSettings] = useState<KibSettings>({ logoUrl: '', backgroundUrl: '' });

  // Simpan state halaman saat ini ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

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
            backgroundUrl: data.background_url || '' 
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

  const handleLogin = () => setCurrentView('main');
  const handleLogout = () => setCurrentView('login');
  
  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewState);
  };

  const handlePrint = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('printKIB');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'login' && <Login onLogin={handleLogin} kibSettings={kibSettings} />}
      {currentView === 'main' && <MainMenu onNavigate={handleNavigate} onLogout={handleLogout} kibSettings={kibSettings} />}
      {currentView === 'settings' && (
        <Settings 
          onBack={() => setCurrentView('main')} 
          kibSettings={kibSettings}
          onUpdateKibSettings={setKibSettings}
        />
      )}
      {currentView === 'patientData' && (
        <PatientData 
          onBack={() => setCurrentView('main')} 
          onPrint={handlePrint} 
          kibSettings={kibSettings}
        />
      )}
      {currentView === 'printKIB' && selectedPatient && (
        <KIBPrint 
          patient={selectedPatient} 
          onBack={() => setCurrentView('patientData')} 
          kibSettings={kibSettings}
        />
      )}
    </div>
  );
}

