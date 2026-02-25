import React, { useEffect, useMemo, useState } from 'react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: string[];
  submitLabel: string;
  defaultTitle: string;
  onSubmit: (payload: { roomName: string; type: string; startTime: string; endTime: string }) => Promise<void>;
}

const toLocalInputValue = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, rooms, submitLabel, defaultTitle, onSubmit }) => {
  const now = useMemo(() => new Date(), []);
  const defaultStart = useMemo(() => {
    const start = new Date(now);
    start.setHours(start.getHours() + 1, 0, 0, 0);
    return toLocalInputValue(start);
  }, [now]);
  const defaultEnd = useMemo(() => {
    const end = new Date(now);
    end.setHours(end.getHours() + 2, 0, 0, 0);
    return toLocalInputValue(end);
  }, [now]);

  const [type, setType] = useState(defaultTitle);
  const [roomName, setRoomName] = useState(rooms[0] || '');
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRoomName(rooms[0] || '');
  }, [rooms]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!roomName) {
      setError('No room is available for your role.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ roomName, type, startTime, endTime });
      onClose();
    } catch (err: any) {
      const backendError = err?.response?.data?.error;
      setError(backendError || 'Rezervaci se nepodařilo uložit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-black text-slate-900">New Reservation</h3>
        <p className="text-xs text-slate-500 mt-1">Vyplň data a potvrď rezervaci.</p>

        <div className="space-y-4 mt-6">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Title</label>
            <input value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Room</label>
            <select value={roomName} onChange={(e) => setRoomName(e.target.value)} disabled={!rooms.length} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-60">
              {rooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500">Start</label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500">End</label>
              <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" />
            </div>
          </div>
          {error && <p className="text-xs font-bold text-red-600">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button onClick={onClose} className="text-xs font-black uppercase text-slate-400">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !rooms.length}
            className="rounded-xl bg-slate-900 px-6 py-2 text-xs font-black uppercase text-white disabled:opacity-50"
          >
            {submitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
