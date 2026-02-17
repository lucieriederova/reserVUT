import React, { useState } from 'react';
import CalendarGrid from './CalendarGrid';
import type { UserStatusData } from './CalendarGrid';
import ReservationModal from './ReservationModal';
import ReservationsList from './ReservationsList';
import type { AppUser, ReservationRecord } from '../lib/api';
import { createReservation, rolePriority } from '../lib/api';

interface CEOViewProps {
  user: AppUser;
  onLogout: () => void;
  reservations: ReservationRecord[];
  onReservationCreated: () => Promise<void>;
}

const CEOView: React.FC<CEOViewProps> = ({ user, onLogout, reservations, onReservationCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ceoRooms = ['Meeting Room', 'Session Room', 'The Stage', 'The Aquarium', 'Panda Room', 'P159'];
  const ceoStatus: UserStatusData = {
    role: 'CEO',
    priority: 2,
    isVerified: true
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 font-sans text-[#111827]">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Global Schedule</h1>
          <p className="text-gray-400 text-sm mt-1 italic font-medium">Privileged view: All rooms are enabled. Unlimited concurrent bookings active.</p>
          <div className="flex items-center gap-3 mt-3">
             <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded uppercase tracking-widest italic shadow-sm shadow-purple-50">CEO Access</span>
             <span className="text-[10px] font-bold text-gray-400">{user.email}</span>
             <button onClick={onLogout} className="text-[10px] font-black text-gray-300 uppercase hover:text-red-500 underline decoration-dotted transition-colors">Logout</button>
          </div>
        </div>
        
        {/* CEO Quota Card */}
        <div className="bg-[#9333EA] text-white rounded-[32px] p-6 shadow-xl shadow-purple-100 w-72">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-black uppercase opacity-60 tracking-widest">My Booking Status</span>
            <span className="text-lg">✨</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-black tracking-tighter">∞</span>
            <span className="text-[10px] font-bold uppercase opacity-80">Unlimited Quota</span>
          </div>
          <div className="h-1.5 w-full bg-purple-400 rounded-full mt-2">
            <div className="h-full bg-white w-full rounded-full" />
          </div>
          <p className="text-[9px] font-black mt-3 text-purple-100 uppercase tracking-tighter italic tracking-tight">⭐ Verified CEO Account</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center px-10">
          <span className="text-xs font-black text-gray-800 uppercase tracking-widest italic tracking-[0.1em]">23 Oct — 29 Oct 2023</span>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95"
          >
            + New Booking
          </button>
        </div>
        <CalendarGrid rooms={ceoRooms} userStatus={ceoStatus} selectedRoomId="Meeting Room" />
      </div>
      <div className="mt-8">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-3">Live Reservations</h2>
        <ReservationsList reservations={reservations} />
      </div>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rooms={ceoRooms}
        defaultTitle="CEO Strategic Booking"
        submitLabel="Confirm Booking"
        onSubmit={async ({ roomName, type, startTime, endTime }) => {
          await createReservation({
            userId: user.id,
            roomName,
            type,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            priorityLevel: rolePriority.CEO
          });
          await onReservationCreated();
        }}
      />
    </div>
  );
};

export default CEOView;
