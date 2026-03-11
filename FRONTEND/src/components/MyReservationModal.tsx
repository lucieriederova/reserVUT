import React, { useMemo } from 'react';
import type { ReservationRecord } from '../lib/api';

interface MyReservationModalProps {
  reservation: ReservationRecord | null;
  onClose: () => void;
  onCancel?: () => void;
}

const formatTime = (value: string) =>
  new Date(value).toLocaleString('cs-CZ', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const MyReservationModal: React.FC<MyReservationModalProps> = ({ reservation, onClose, onCancel }) => {
  const status = useMemo(() => {
    if (!reservation) return '';
    const now = Date.now();
    const start = new Date(reservation.startTime).getTime();
    if (start < now && new Date(reservation.endTime).getTime() < now) {
      return 'Dokončeno';
    }
    if (start > now) {
      return 'Plánováno';
    }
    return 'Probíhá';
  }, [reservation]);

  if (!reservation) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">My Reservation</p>
            <h3 className="text-2xl font-black text-gray-900">{reservation.type || 'Rezervace'}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close reservation detail"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-black text-gray-500 transition hover:bg-gray-50"
          >
            ✕
          </button>
        </header>
        <div className="mt-6 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Room</p>
            <p className="text-lg font-black text-gray-900">{reservation.roomName}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Owner</p>
            <p className="text-lg font-black text-gray-900">{reservation.user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Start</p>
            <p className="text-sm font-semibold text-gray-800">{formatTime(reservation.startTime)}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">End</p>
            <p className="text-sm font-semibold text-gray-800">{formatTime(reservation.endTime)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Priority</p>
            <p className="text-xs font-semibold text-gray-600">Level {reservation.priorityLevel}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status</p>
            <p className="text-xs font-semibold text-violet-600 tracking-wide">{status}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button
            onClick={() => (onCancel ? onCancel() : onClose())}
            className="flex-1 rounded-2xl border border-transparent bg-[#ec1380] px-6 py-2 text-xs font-black uppercase tracking-[0.3em] text-white transition hover:brightness-110"
          >
            Cancel reservation
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-600 transition hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyReservationModal;
