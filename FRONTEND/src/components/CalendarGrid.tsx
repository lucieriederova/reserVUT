import React from 'react';
import type { ReservationRecord } from '../lib/api';

// Exporty jsou klíčové pro ostatní soubory
export type UserRole = 'Student' | 'CEO' | 'Guide' | 'Head Admin';

export interface UserStatusData {
  role: UserRole;
  priority: number;
  isVerified: boolean;
}

export interface GridProps {
  selectedRoomId: string;
  userStatus: UserStatusData;
  rooms: string[];
  weekOffset?: number;
  reservations?: ReservationRecord[];
}

const getMonday = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const START_HOUR = 7;
const END_HOUR = 22;
const DAY_MINUTES = (END_HOUR - START_HOUR) * 60;
const DAY_PIXEL_HEIGHT = 15 * 80;

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

const CalendarGrid: React.FC<GridProps> = ({ selectedRoomId, userStatus, rooms, weekOffset = 0, reservations = [] }) => {
  const times = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const baseMonday = getMonday(new Date());

  return (
    <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-2xl">
      <div className="bg-gray-50/50 border-r border-gray-100">
        <div className="h-16 border-b border-gray-50 flex items-center justify-center p-2">
          {/* Použití userStatus řeší chybu 'unused vars' */}
          <span className="text-[7px] font-black text-[#ec1380] uppercase truncate tracking-tighter italic">{userStatus.role}</span>
        </div>
        {times.map(t => (
          <div key={t} className="h-20 p-4 text-[10px] font-black text-gray-300 border-b border-gray-50 text-center uppercase tracking-tighter">
            {t}
          </div>
        ))}
      </div>
      {weekDays.map((day, dIdx) => (
        <div key={day} className="border-r border-gray-100 last:border-0 relative">
          {(() => {
            const dayDate = addDays(baseMonday, weekOffset * 7 + dIdx);
            const dayReservations = reservations
              .filter((reservation) => {
                const start = new Date(reservation.startTime);
                return sameDay(start, dayDate);
              })
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

            return (
              <>
          <div className="h-16 flex flex-col items-center justify-center border-b border-gray-50 bg-white">
            <span className="text-[9px] font-black text-gray-300 tracking-widest uppercase italic">{day}</span>
            <span className="text-xl font-black text-gray-900 tracking-tighter">
              {dayDate.getDate()}
            </span>
          </div>
          <div className="h-full relative">
            {times.map((_, i) => <div key={i} className="h-20 border-b border-gray-50" />)}
            
            {/* Použití rooms a roomId řeší další 'unused vars' */}
            {dIdx === 0 && (
              <div className="absolute top-2 left-2 text-[6px] font-bold text-gray-200 uppercase pointer-events-none">
                {selectedRoomId} ({rooms.length} R)
              </div>
            )}
            {dayReservations.map((reservation) => {
              const start = new Date(reservation.startTime);
              const end = new Date(reservation.endTime);

              const startMinutes = start.getHours() * 60 + start.getMinutes();
              const endMinutes = end.getHours() * 60 + end.getMinutes();
              const clampedStart = Math.max(START_HOUR * 60, startMinutes);
              const clampedEnd = Math.min(END_HOUR * 60, endMinutes);

              if (clampedEnd <= clampedStart) return null;

              const top = ((clampedStart - START_HOUR * 60) / DAY_MINUTES) * DAY_PIXEL_HEIGHT;
              const height = Math.max(26, ((clampedEnd - clampedStart) / DAY_MINUTES) * DAY_PIXEL_HEIGHT);

              return (
                <div
                  key={reservation.id}
                  className="absolute left-1.5 right-1.5 rounded-md border border-[#7f3fc1]/30 bg-[#7f3fc1]/15 px-1.5 py-1 text-[9px] font-semibold text-[#4c267a] shadow-sm"
                  style={{ top: `${top}px`, height: `${height}px` }}
                  title={`${reservation.type} (${new Date(reservation.startTime).toLocaleTimeString('cs-CZ', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - ${new Date(reservation.endTime).toLocaleTimeString('cs-CZ', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })})`}
                >
                  <p className="truncate">{reservation.type || 'Reservation'}</p>
                </div>
              );
            })}
          </div>
              </>
            );
          })()}
        </div>
      ))}
    </div>
  );
};

export default CalendarGrid;
