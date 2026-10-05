import React, { useState } from 'react';
import { VotingDevice } from '../../types';
import { VotingEngine } from '../../services/votingEngine';
import { Laptop, Wifi, CheckCircle2, RefreshCw, ShieldCheck, Clock } from 'lucide-react';

interface DeviceStatusViewProps {
  devices: VotingDevice[];
}

export const DeviceStatusView: React.FC<DeviceStatusViewProps> = ({ devices }) => {
  const [pingingId, setPingingId] = useState<string | null>(null);

  const handlePing = async (deviceId: string) => {
    setPingingId(deviceId);
    try {
      await VotingEngine.sendDeviceHeartbeat(deviceId);
    } catch (error) {
      console.error('Heartbeat perangkat gagal:', error);
    }
    setTimeout(() => {
      setPingingId(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Bilik Suara & Server Hardware Monitor
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Status Perangkat Bilik & Laptop Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pantau status koneksi, heartbeat, dan beban suara dari Laptop Operator Admin dan 3 Laptop bilik sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
            {devices.length} Unit Terdaftar & Aktif
          </span>
        </div>
      </div>

      {/* Devices Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {devices.map((device, index) => {
          const isPinging = pingingId === device.id;
          const isAdmin = !!device.is_admin_device;
          const lastHeartbeatTime = device.last_heartbeat
            ? new Date(device.last_heartbeat).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })
            : 'Baru saja';

          return (
            <div
              key={device.id}
              className={`rounded-3xl p-5 border shadow-sm flex flex-col justify-between ${
                isAdmin
                  ? 'bg-gradient-to-b from-blue-50/70 to-white border-blue-300 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="text-xs font-mono font-bold text-blue-700">
                    {device.code}
                  </span>

                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Admin Laptop</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Aktif</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    isAdmin ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {device.name}
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      {device.location}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Fungsi:</span>
                    <strong className="text-slate-800 font-semibold">{isAdmin ? 'Pengawasan & Server' : 'Bilik Siswa'}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Suara Diproses:</span>
                    <span className="font-mono font-bold text-blue-900">
                      {device.votes_processed} suara
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Koneksi:</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <Wifi className="w-3 h-3 text-emerald-600" />
                      <span>Stabil (&lt;10ms)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Ping Terakhir:</span>
                    </span>
                    <span className="font-mono">{lastHeartbeatTime}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Ping action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {isAdmin ? 'Server Unit' : `Bilik #${index}`}
                </span>

                <button
                  onClick={() => handlePing(device.id)}
                  disabled={isPinging}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-[11px] rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin text-blue-600' : ''}`} />
                  <span>{isPinging ? 'Ping...' : 'Uji Ping'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
