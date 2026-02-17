import React, { useState } from 'react';
import CalendarGrid from './CalendarGrid';
import type { UserStatusData } from './CalendarGrid';
import ReservationModal from './ReservationModal';
import ReservationsList from './ReservationsList';
import type { AppUser, ReservationRecord } from '../lib/api';
import { createReservation, rolePriority } from '../lib/api';

// 1. Definice Interface pro Props (toto vyřeší tu chybu)
interface GuideViewProps {
  user: AppUser;
  onLogout: () => void;
  reservations: ReservationRecord[];
  onReservationCreated: () => Promise<void>;
}

// 2. Použití Interface v definici komponenty
const GuideView: React.FC<GuideViewProps> = ({ user, onLogout, reservations, onReservationCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const guideRooms = ['Session Room', 'Meeting Room', 'The Stage'];
  const guideStatus: UserStatusData = {
    role: 'Guide',
    priority: 3,
    isVerified: true
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans text-[#111827]">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Global Schedule — Guide View
          </h1>
          <p className="text-gray-400 text-sm mt-1 italic font-medium">
            All rooms are available for Guide-level session scheduling.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-widest italic shadow-sm shadow-blue-100">
              Guide Mode
            </span>
            <span className="text-[10px] font-bold text-gray-400">{user.email}</span>
            <button 
              onClick={onLogout} 
              className="text-[10px] font-black text-gray-300 uppercase hover:text-red-500 underline decoration-dotted transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Guide Quota Card */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm w-72">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Guide Quota</span>
            <span className="text-blue-500 text-lg">🛡️</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Unlimited</span>
            <span className="text-[8px] font-bold uppercase text-gray-400 leading-tight text-wrap w-20">
              Sessions / Week
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-blue-500 w-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
          </div>
          <p className="text-[8px] font-black mt-3 text-blue-500 uppercase tracking-tighter italic flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Priority Booking Enabled
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Lead Time Alert Banner */}
        <div className="bg-[#FFF7ED] border-b border-orange-100 p-3 text-center text-[10px] font-black text-orange-600 uppercase italic tracking-tight">
          🕒 Lead Time Alert: Sessions require a 3-day minimum planning window. Pre-emptive override active.
        </div>
        
        <div className="p-5 border-b border-gray-50 flex justify-between items-center px-10">
          <span className="text-xs font-black text-gray-800 uppercase tracking-widest italic">
            23 Oct — 29 Oct 2023
          </span>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            + New Session
          </button>
        </div>
        
        <CalendarGrid rooms={guideRooms} userStatus={guideStatus} selectedRoomId="Session Room" />
      </div>
      <div className="mt-8">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-3">Live Reservations</h2>
        <ReservationsList reservations={reservations} />
      </div>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rooms={guideRooms}
        defaultTitle="Guide Session"
        submitLabel="Confirm Session"
        onSubmit={async ({ roomName, type, startTime, endTime }) => {
          await createReservation({
            userId: user.id,
            roomName,
            type,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            priorityLevel: rolePriority.Guide
          });
          await onReservationCreated();
        }}
      />
    </div>
  );
};

// 3. Export default pro App.tsx
export default GuideView;
