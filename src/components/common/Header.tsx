import React from 'react';
import { VotingDevice } from '../../types';
import { BallotBoxIllustration } from './SchoolDecorations';
import { Laptop, Monitor, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentView: 'student' | 'admin' | 'display';
  onNavigate: (view: 'student' | 'admin' | 'display') => void;
  activeDeviceId: string;
  onDeviceChange: (deviceId: string) => void;
  devices: VotingDevice[];
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  activeDeviceId,
  onDeviceChange,
  devices
}) => {
  const currentDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('student')}
            className="flex items-center gap-2.5 text-left group transition-transform focus:outline-none"
          >
            <BallotBoxIllustration className="w-12 h-12 transform group-hover:scale-105 transition-transform" />
            <div>
              <span className="text-xl font-bold tracking-tight text-blue-900 block leading-tight">
                DIGIVOS7
              </span>
              <span className="text-[11px] font-medium text-slate-500 block leading-tight">
                Digital Voting OSIS · SMPN 7 Bangkalan
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('student')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'student'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Bilik Voting</span>
          </button>

          <button
            onClick={() => onNavigate('display')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'display'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Papan Display</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'admin'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Panel Admin</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions & Device Selection for Voting Booths */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentView === 'student' && (
            <div className="flex items-center gap-2 bg-slate-100/90 rounded-lg p-1 border border-slate-200">
              <span className="text-[11px] text-slate-500 pl-2 hidden md:inline font-medium">
                Bilik:
              </span>
              {devices.length > 0 ? (
                <select
                  value={activeDeviceId}
                  onChange={(e) => onDeviceChange(e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  title="Pilih Laptop Bilik Voting"
                >
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[11px] text-slate-500 px-2">
                  Bilik belum dikonfigurasi
                </span>
              )}
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 pr-1.5" title="Koneksi laptop aktif">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden lg:inline">Aktif</span>
              </div>
            </div>
          )}

          {currentView === 'admin' && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sistem Terenkripsi</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
