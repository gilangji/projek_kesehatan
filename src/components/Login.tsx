import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { KibSettings } from '../types';

interface LoginProps {
  onLogin: () => void;
  kibSettings: KibSettings;
}

export default function Login({ onLogin, kibSettings }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('Username atau password salah!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
      <div className="bg-white p-10 rounded-xl border border-[#E5E7EB] shadow-sm w-[400px]">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24">
            <img 
              src={kibSettings.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lambang_Kabupaten_Buton_Selatan.png/600px-Lambang_Kabupaten_Buton_Selatan.png"} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <h2 className="text-[24px] font-semibold text-center text-[#1F2937] mb-8">Login Puskesmas</h2>
        {error && <p className="text-red-500 text-[13px] text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-5 relative">
            <User className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
            <input
              type="text"
              placeholder="Username"
              className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[14px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-8 relative">
            <Lock className="absolute left-3.5 top-3.5 text-[#6B7280] w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[14px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#2563EB] text-white py-3 rounded-md text-[14px] font-semibold hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
