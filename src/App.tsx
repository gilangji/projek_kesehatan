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

type ViewState = 'login' | 'main' | 'patientInput' | 'patientList' | 'printMenu' | 'settings' | 'printPreview';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const savedView = localStorage.getItem('currentView');
    // Save safety check: if refreshed on print preview, return to main menu or list
    if (savedView === 'printPreview') return 'patientList';
    return (savedView as ViewState) || 'login';
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [printFormat, setPrintFormat] = useState<'card' | 'document'>('card');
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

  const handleLogin = () => setCurrentView('main');
  const handleLogout = () => setCurrentView('login');
  
  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewState);
  };

  const handlePrint = (patient: Patient, format: 'card' | 'document') => {
    setSelectedPatient(patient);
    setPrintFormat(format);
    setCurrentView('printPreview');
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
        {currentView === 'main' && <MainMenu onNavigate={handleNavigate} onLogout={handleLogout} kibSettings={kibSettings} />}
        {currentView === 'settings' && (
          <Settings 
            onBack={() => setCurrentView('main')} 
            kibSettings={kibSettings}
            onUpdateKibSettings={setKibSettings}
          />
        )}
        {currentView === 'patientInput' && (
          <PatientData 
            mode="input"
            onBack={() => setCurrentView('main')} 
            onPrint={handlePrint} 
            kibSettings={kibSettings}
          />
        )}
        {currentView === 'patientList' && (
          <PatientData 
            mode="list"
            onBack={() => setCurrentView('main')} 
            onPrint={handlePrint} 
            kibSettings={kibSettings}
          />
        )}
        {currentView === 'printMenu' && (
          <PatientData 
            mode="printMenu"
            onBack={() => setCurrentView('main')} 
            onPrint={handlePrint} 
            kibSettings={kibSettings}
          />
        )}
        {currentView === 'printPreview' && selectedPatient && (
          <KIBPrint 
            patient={selectedPatient} 
            onBack={() => setCurrentView('printMenu')} 
            kibSettings={kibSettings}
            initialFormat={printFormat}
          />
        )}
      </div>
    </div>
  );
}

