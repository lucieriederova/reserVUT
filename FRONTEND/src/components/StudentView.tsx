import React, { useMemo, useState } from 'react';
import CalendarGrid from './CalendarGrid';
import type { UserStatusData } from './CalendarGrid';
import ReservationModal from './ReservationModal';
import ReservationsList from './ReservationsList';
import type { AppUser, ReservationRecord } from '../lib/api';
import { createReservation, rolePriority } from '../lib/api';

const STUDENT_ROOMS = ["Meeting Room", "The Aquarium"];

interface StudentViewProps {
  user: AppUser;
  reservations: ReservationRecord[];
  onReservationCreated: () => Promise<void>;
  onLogout: () => void;
}

const StudentView: React.FC<StudentViewProps> = ({ user, reservations, onReservationCreated, onLogout }) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(STUDENT_ROOMS[0]);
  const [isModalOpen, setModalOpen] = useState(false);

  const studentStatus: UserStatusData = {
    role: "Student",
    priority: 1,
    isVerified: true
  };
  const visibleReservations = useMemo(
    () => reservations.filter((reservation) => STUDENT_ROOMS.includes(reservation.roomName)),
    [reservations]
  );

  return (
    <div className="min-h-screen bg-[#f8f6f7] text-slate-900 p-10 relative">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Student Dashboard</h1>
            <p className="text-slate-500 text-xs mt-2 uppercase font-bold tracking-widest italic">Max 3h per booking • Max 5 days ahead</p>
            <p className="text-slate-400 text-[10px] font-bold mt-2">{user.email}</p>
            <div className="flex gap-2 mt-6">
              {STUDENT_ROOMS.map(room => (
                <button key={room} onClick={() => setSelectedRoomId(room)} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedRoomId === room ? 'bg-[#ec1380] text-white shadow-lg shadow-[#ec1380]/20' : 'bg-white text-slate-400 border border-slate-200'}`}>{room}</button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <button onClick={onLogout} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500">Logout</button>
             <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Quota</p>
                <p className="text-xl font-black text-[#ec1380]">{visibleReservations.length}</p>
             </div>
             <button onClick={() => setModalOpen(true)} className="bg-[#ec1380] text-white px-8 py-4 rounded-2xl font-black uppercase text-sm shadow-xl shadow-[#ec1380]/20 hover:scale-105 transition-transform">New Booking</button>
          </div>
        </header>

        <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-xl shadow-slate-200/50">
          <CalendarGrid rooms={STUDENT_ROOMS} selectedRoomId={selectedRoomId} userStatus={studentStatus} />
        </div>
        <div className="mt-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">Live Reservations</h2>
          <ReservationsList reservations={visibleReservations} />
        </div>
      </div>
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        rooms={STUDENT_ROOMS}
        defaultTitle="Student Workshop"
        submitLabel="Confirm Booking"
        onSubmit={async ({ roomName, type, startTime, endTime }) => {
          await createReservation({
            userId: user.id,
            roomName,
            type,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            priorityLevel: rolePriority.Student
          });
          await onReservationCreated();
        }}
      />
    </div>
  );
};

export default StudentView;
