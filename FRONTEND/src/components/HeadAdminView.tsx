import React, { useState } from 'react';
import { ShieldAlert, Shield } from 'lucide-react';
import CalendarGrid from './CalendarGrid';
import type { UserStatusData } from './CalendarGrid'; // Oprava importu
import AdminDashboard from './AdminDashboard';
import VerificationPortal from './VerificationPortal';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';
import ReservationsList from './ReservationsList';
import type { AppUser, ReservationRecord } from '../lib/api';

const ALL_ROOMS = ["Meeting Room", "Session Room", "The Stage", "The Aquarium", "Panda Room", "P159"];

interface HeadAdminViewProps {
  user: AppUser;
  onLogout: () => void;
  reservations: ReservationRecord[];
}

const HeadAdminView: React.FC<HeadAdminViewProps> = ({ user, onLogout, reservations }) => {
  const [currentModule, setCurrentModule] = useState<'overview' | 'verifications' | 'reports' | 'settings' | 'matrix'>('overview');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(ALL_ROOMS[0]);

  const adminStatus: UserStatusData = {
    role: "Head Admin",
    priority: 4,
    isVerified: true
  };

  return (
    <div className="flex min-h-screen bg-[#0f0a0c] text-white font-sans">
      <aside className="w-64 bg-[#1a1416] border-r border-white/5 flex flex-col fixed h-full z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 text-white">
            <div className="size-10 bg-[#ec1380] rounded-xl flex items-center justify-center shadow-lg shadow-[#ec1380]/20 text-white">
              <Shield size={20} />
            </div>
            <div>
              <span className="font-black text-xl italic uppercase tracking-tighter block">ESBD Admin</span>
              <span className="text-[10px] font-bold text-gray-400">{user.email}</span>
            </div>
          </div>
          <nav className="space-y-1">
            <button onClick={() => setCurrentModule('overview')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm ${currentModule === 'overview' ? 'bg-[#ec1380]/10 text-[#ec1380]' : 'text-gray-500'}`}>Dashboard</button>
            <button onClick={() => setCurrentModule('matrix')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm ${currentModule === 'matrix' ? 'bg-[#ec1380]/10 text-[#ec1380]' : 'text-gray-500'}`}>Resource Matrix</button>
            <button onClick={() => setCurrentModule('verifications')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm ${currentModule === 'verifications' ? 'bg-[#ec1380]/10 text-[#ec1380]' : 'text-gray-500'}`}>Verifications</button>
            <button onClick={() => setCurrentModule('reports')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm ${currentModule === 'reports' ? 'bg-[#ec1380]/10 text-[#ec1380]' : 'text-gray-500'}`}>Reports</button>
            <button onClick={() => setCurrentModule('settings')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm ${currentModule === 'settings' ? 'bg-[#ec1380]/10 text-[#ec1380]' : 'text-gray-500'}`}>Settings</button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-10">
        {/* Přepínač modulů řeší chyby 'defined but never used' */}
        {currentModule === 'overview' && <AdminDashboard />}
        {currentModule === 'verifications' && <VerificationPortal />}
        {currentModule === 'reports' && <AdminReports />}
        {currentModule === 'settings' && <AdminSettings />}
        {currentModule === 'matrix' && (
          <div className="animate-in fade-in duration-500">
            <header className="flex justify-between items-end mb-10">
              <div>
                <h1 className="text-4xl font-black italic uppercase tracking-tight text-white">Resource Matrix</h1>
                <div className="flex gap-2 mt-4 text-white">
                  {ALL_ROOMS.map(room => (
                    <button key={room} onClick={() => setSelectedRoomId(room)} className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${selectedRoomId === room ? 'bg-[#ec1380] border-[#ec1380]' : 'border-white/10 text-gray-500'}`}>{room}</button>
                  ))}
                </div>
              </div>
              <button className="bg-red-600 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/20 text-white">
                <ShieldAlert size={18} /> Emergency Override
              </button>
            </header>
            <CalendarGrid rooms={ALL_ROOMS} selectedRoomId={selectedRoomId} userStatus={adminStatus} />
            <div className="mt-8">
              <ReservationsList reservations={reservations} />
            </div>
          </div>
        )}
        <div className="mt-10">
          <button onClick={onLogout} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-400">
            Logout
          </button>
        </div>
      </main>
    </div>
  );
};

export default HeadAdminView;
