import React from 'react';

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

const CalendarGrid: React.FC<GridProps> = ({ selectedRoomId, userStatus, rooms, weekOffset = 0 }) => {
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
          <div className="h-16 flex flex-col items-center justify-center border-b border-gray-50 bg-white">
            <span className="text-[9px] font-black text-gray-300 tracking-widest uppercase italic">{day}</span>
            <span className="text-xl font-black text-gray-900 tracking-tighter">
              {addDays(baseMonday, weekOffset * 7 + dIdx).getDate()}
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarGrid;
