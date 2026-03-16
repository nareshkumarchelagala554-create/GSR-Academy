"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, X } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [dob, setDob] = useState('15-Nov-2008');
  const [error, setError] = useState('');
  const [isAttendanceConfirmed, setIsAttendanceConfirmed] = useState(true);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId) {
      setError('This field is required.');
      return;
    }
    // Simulate login
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">10.201.0.22</h1>
      
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
        {/* Error Banner */}
        <div className="bg-[#F9EBEB] border-b border-[#E6C2C2] p-3 flex items-center justify-between">
          <p className="text-[#A94442] text-sm font-medium">Invalid Username/Password. Please try again</p>
          <button className="text-[#A94442] hover:opacity-70">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSignIn} className="p-12 space-y-8">
          <div className="flex items-center gap-8">
            <label className="w-32 text-right font-bold text-slate-700">Login ID</label>
            <div className="flex-1">
              <input
                type="text"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  if (e.target.value) setError('');
                }}
                className={`w-full p-2 border ${error ? 'border-red-500' : 'border-slate-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Login ID"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <label className="w-32 text-right font-bold text-slate-700">Date Of Birth</label>
            <div className="flex-1 relative">
              <input
                type="text"
                value={dob}
                readOnly
                className="w-full p-2 border border-slate-300 rounded bg-slate-50"
              />
              <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="w-32"></div>
            <p className="text-slate-600 text-sm italic">• Your DOB is your password</p>
          </div>

          <div className="flex items-center gap-8">
            <div className="w-32"></div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAttendanceConfirmed}
                onChange={(e) => setIsAttendanceConfirmed(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-slate-700 text-sm font-medium">I confirm my attendance by logging in</span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-32"></div>
            <button
              type="submit"
              className="px-8 py-2 bg-[#0056B3] text-white font-bold rounded hover:bg-[#004494] transition-colors"
            >
              Sign in
            </button>
            <button
              type="button"
              className="px-8 py-2 bg-[#4A90E2] text-white font-bold rounded hover:bg-[#357ABD] transition-colors"
            >
              Register
            </button>
          </div>
        </form>
      </div>

      <p className="mt-8 text-slate-400 text-sm font-mono">2026.01.31 08:53</p>
    </div>
  );
}
