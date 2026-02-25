import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, Shield } from 'lucide-react';
import CalendarGrid from './CalendarGrid';
import type { UserStatusData } from './CalendarGrid'; // Oprava importu
import AdminDashboard from './AdminDashboard';
import VerificationPortal from './VerificationPortal';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';
import ReservationsList from './ReservationsList';
import type { AppUser, ReservationRecord } from '../lib/api';
import type { RoleCode, RoomPolicy } from '../lib/roomAccess';

const ROLE_OPTIONS: Array<{ code: RoleCode; label: string }> = [
  { code: 'STUDENT', label: 'Student' },
  { code: 'CEO', label: 'CEO' },
  { code: 'GUIDE', label: 'Guide' },
  { code: 'HEAD_ADMIN', label: 'Head Admin' }
];

interface HeadAdminViewProps {
  user: AppUser;
  onLogout: () => void;
  reservations: ReservationRecord[];
  roomPolicies: RoomPolicy[];
  onRoomPoliciesChange: (policies: RoomPolicy[]) => void;
}

const HeadAdminView: React.FC<HeadAdminViewProps> = ({ user, onLogout, reservations, roomPolicies, onRoomPoliciesChange }) => {
  const [currentModule, setCurrentModule] = useState<'overview' | 'verifications' | 'reports' | 'settings' | 'matrix'>('overview');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState('');

  const allRooms = useMemo(() => roomPolicies.map((policy) => policy.name), [roomPolicies]);
  const visibleReservations = useMemo(
    () => reservations.filter((reservation) => allRooms.includes(reservation.roomName)),
    [reservations, allRooms]
  );

  useEffect(() => {
    if (allRooms.length && !allRooms.includes(selectedRoomId)) {
      setSelectedRoomId(allRooms[0]);
    }
    if (!allRooms.length) {
      setSelectedRoomId('');
    }
  }, [allRooms, selectedRoomId]);

  const toggleRoleAccess = (roomName: string, role: RoleCode) => {
    onRoomPoliciesChange(
      roomPolicies.map((policy) => {
        if (policy.name !== roomName) return policy;
        const hasRole = policy.allowedRoles.includes(role);
        const nextRoles = hasRole
          ? policy.allowedRoles.filter((existingRole) => existingRole !== role)
          : [...policy.allowedRoles, role];
        return {
          ...policy,
          allowedRoles: nextRoles.length ? nextRoles : ['HEAD_ADMIN']
        };
      })
    );
  };

  const handleAddRoom = () => {
    const normalizedName = newRoomName.trim();
    if (!normalizedName) return;
    if (roomPolicies.some((policy) => policy.name.toLowerCase() === normalizedName.toLowerCase())) return;

    onRoomPoliciesChange([
      ...roomPolicies,
      {
        name: normalizedName,
        allowedRoles: ['HEAD_ADMIN', 'CEO']
      }
    ]);
    setNewRoomName('');
  };

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
              <span className="font-black text-xl italic uppercase tracking-tighter block">reserVUT Admin</span>
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
                  {allRooms.map(room => (
                    <button key={room} onClick={() => setSelectedRoomId(room)} className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${selectedRoomId === room ? 'bg-[#ec1380] border-[#ec1380]' : 'border-white/10 text-gray-500'}`}>{room}</button>
                  ))}
                </div>
              </div>
              <button className="bg-red-600 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/20 text-white">
                <ShieldAlert size={18} /> Emergency Override
              </button>
            </header>
            {allRooms.length ? (
              <CalendarGrid rooms={allRooms} selectedRoomId={selectedRoomId} userStatus={adminStatus} />
            ) : (
              <div className="rounded-3xl border border-white/10 bg-[#1a1416] p-8 text-sm font-bold text-gray-400">No rooms defined yet. Add your first room below.</div>
            )}

            <section className="mt-8 rounded-3xl border border-white/10 bg-[#1a1416] p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#ec1380]">Room Access Control</h2>
              <p className="mt-2 text-xs text-gray-400">Add rooms and define which roles are allowed to reserve each room.</p>

              <div className="mt-4 flex gap-3">
                <input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="New room name"
                  className="flex-1 rounded-xl border border-white/10 bg-[#0f0a0c] px-4 py-2 text-sm font-semibold text-white placeholder:text-gray-600"
                />
                <button
                  onClick={handleAddRoom}
                  className="rounded-xl bg-[#ec1380] px-5 py-2 text-xs font-black uppercase tracking-wider text-white"
                >
                  Add Room
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {roomPolicies.map((policy) => (
                  <div key={policy.name} className="rounded-2xl border border-white/10 bg-[#0f0a0c] p-4">
                    <p className="text-sm font-black text-white">{policy.name}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {ROLE_OPTIONS.map((roleOption) => {
                        const checked = policy.allowedRoles.includes(roleOption.code);
                        return (
                          <label key={roleOption.code} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[11px] font-bold text-gray-300">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleRoleAccess(policy.name, roleOption.code)}
                            />
                            {roleOption.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <div className="mt-8">
              <ReservationsList reservations={visibleReservations} />
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
