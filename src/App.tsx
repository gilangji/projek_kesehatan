/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Login from './components/Login';
import MainMenu from './components/MainMenu';
import PatientData from './components/PatientData';
import KIBPrint from './components/KIBPrint';
import { Patient } from './types';

type ViewState = 'login' | 'main' | 'patientData' | 'printKIB';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

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
      {currentView === 'login' && <Login onLogin={handleLogin} />}
      {currentView === 'main' && <MainMenu onNavigate={handleNavigate} onLogout={handleLogout} />}
      {currentView === 'patientData' && (
        <PatientData 
          onBack={() => setCurrentView('main')} 
          onPrint={handlePrint} 
        />
      )}
      {currentView === 'printKIB' && selectedPatient && (
        <KIBPrint 
          patient={selectedPatient} 
          onBack={() => setCurrentView('patientData')} 
        />
      )}
    </div>
  );
}

