import React from 'react';
import type { ReservationRecord } from '../lib/api';

interface ReservationsListProps {
  reservations: ReservationRecord[];
}

const ReservationsList: React.FC<ReservationsListProps> = ({ reservations }) => {
  if (reservations.length === 0) {
    return <p className="text-xs font-bold text-slate-400">Zatím nejsou žádné rezervace.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
      <table className="min-w-full">
        <thead>
          <tr className="bg-slate-50 text-left text-[10px] uppercase tracking-widest text-slate-500">
            <th className="px-4 py-3">Room</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Start</th>
            <th className="px-4 py-3">End</th>
            <th className="px-4 py-3">Priority</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id} className="border-t border-slate-100 text-xs font-semibold text-slate-700">
              <td className="px-4 py-3">{reservation.roomName}</td>
              <td className="px-4 py-3">{reservation.user?.email || '-'}</td>
              <td className="px-4 py-3">{new Date(reservation.startTime).toLocaleString()}</td>
              <td className="px-4 py-3">{new Date(reservation.endTime).toLocaleString()}</td>
              <td className="px-4 py-3">{reservation.priorityLevel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationsList;
