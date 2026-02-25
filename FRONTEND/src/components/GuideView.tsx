import React, { useEffect, useMemo, useState } from 'react';
import ReservationModal from './ReservationModal';
import CalendarGrid from './CalendarGrid';
import WeekNavigator from './WeekNavigator';
import type { UserStatusData } from './CalendarGrid';
import type { AppUser, ReservationRecord } from '../lib/api';
import { createReservation, rolePriority } from '../lib/api';
import { getRoomsForRole, type RoomPolicy } from '../lib/roomAccess';

interface GuideViewProps {
  user: AppUser;
  onLogout: () => void;
  reservations: ReservationRecord[];
  roomPolicies: RoomPolicy[];
  onReservationCreated: () => Promise<void>;
}

const GuideView: React.FC<GuideViewProps> = ({ user, onLogout, reservations, roomPolicies, onReservationCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  const guideRooms = useMemo(() => getRoomsForRole(roomPolicies, 'GUIDE'), [roomPolicies]);

  useEffect(() => {
    if (!guideRooms.length) {
      setSelectedRoomId('');
      return;
    }
    if (!selectedRoomId || !guideRooms.includes(selectedRoomId)) {
      setSelectedRoomId(guideRooms[0]);
    }
  }, [guideRooms, selectedRoomId]);

  const roomReservations = useMemo(
    () =>
      reservations.filter((reservation) =>
        selectedRoomId ? reservation.roomName === selectedRoomId : guideRooms.includes(reservation.roomName)
      ),
    [reservations, guideRooms, selectedRoomId]
  );

  const upcomingReservations = useMemo(() => {
    const now = Date.now();
    return roomReservations
      .filter((reservation) => new Date(reservation.startTime).getTime() >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 4);
  }, [roomReservations]);

  const canceledReservations = useMemo(() => {
    const now = Date.now();
    return roomReservations
      .filter((reservation) => new Date(reservation.endTime).getTime() < now)
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
      .slice(0, 4);
  }, [roomReservations]);

  const guideStatus: UserStatusData = {
    role: 'Guide',
    priority: 3,
    isVerified: true
  };

  return (
    <div className="min-h-screen bg-[#e7e7ea] text-[#151515]">
      <div className="mx-auto w-full max-w-[1380px] px-4 pb-28 pt-4 lg:px-6">
        <header className="rounded-xl border border-black/5 bg-[#f4f4f6] px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-6">
              <div className="flex items-center overflow-hidden rounded-md border border-black/10">
                <div className="bg-[#f3113b] px-3 py-1 text-3xl font-black leading-none text-white">T</div>
                <div className="bg-[#8e48c8] px-3 py-1 text-3xl font-black leading-none text-white">FP</div>
              </div>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.08em] sm:text-sm">
                <span className="font-semibold text-[#007ba0]">Reservations</span>
                <span className="text-base font-black">{'>'}</span>
                <span className="font-medium text-black">Global Schedule</span>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
          <div>
            <div className="relative mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_430px]">
              <h1 className="pointer-events-none absolute -top-5 left-0 select-none text-[clamp(5.8rem,11vw,9.5rem)] font-black leading-[0.86] tracking-tight text-[#8e42be]/14">
                GUIDE
              </h1>

              <div className="relative z-10 pt-28">
                <div className="max-w-[500px] rounded-2xl border border-black/5 bg-[#f5f5f7] px-5 py-3">
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Select Room</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    disabled={!guideRooms.length}
                    className="mt-1 w-full bg-transparent text-lg font-semibold uppercase outline-none disabled:opacity-50"
                  >
                    {guideRooms.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative z-10 pt-2">
                <div className="h-full min-h-[170px] rounded-3xl border border-black/5 bg-[#f5f5f7] p-5">
                  <h2 className="text-3xl font-black uppercase leading-none">Rules</h2>
                  <ul className="mt-3 space-y-2 text-lg font-semibold leading-snug text-black/90">
                    <li>Guide role can reserve only allowed rooms.</li>
                    <li>Reservation max length is 3 hours.</li>
                    <li>Higher priority booking can pre-empt lower.</li>
                  </ul>
                </div>
              </div>
            </div>

            <section className="mt-3 overflow-hidden rounded-3xl border border-black/5 bg-[#f5f5f7]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 px-5 py-3">
                <h2 className="text-3xl font-black uppercase leading-none">Calendar</h2>
                <div className="flex items-center gap-4">
                  <WeekNavigator
                    weekOffset={weekOffset}
                    onPrevWeek={() => setWeekOffset((prev) => prev - 1)}
                    onNextWeek={() => setWeekOffset((prev) => prev + 1)}
                  />
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!guideRooms.length}
                    className="rounded-full bg-[#7f3fc1] px-5 py-2 text-lg font-bold uppercase tracking-wide text-white transition hover:brightness-105 disabled:opacity-50"
                  >
                    + New Booking
                  </button>
                </div>
              </div>
              <div className="min-h-[58vh] bg-[#b8b8bc] p-3">
                {guideRooms.length ? (
                  <CalendarGrid
                    rooms={guideRooms}
                    userStatus={guideStatus}
                    selectedRoomId={selectedRoomId || guideRooms[0]}
                    weekOffset={weekOffset}
                  />
                ) : (
                  <p className="px-4 py-8 text-lg font-bold text-gray-700">No rooms are currently assigned to Guide role.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-5 pb-24 xl:pt-40">
            <div className="overflow-hidden rounded-3xl border border-black/5 bg-[#f5f5f7] p-0">
              <h3 className="border-b border-black/5 px-4 py-4 text-center text-2xl font-medium uppercase tracking-wide">Upcoming</h3>
              <div className="min-h-[190px] space-y-2 px-2 py-3">
                {upcomingReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center gap-3 rounded-lg bg-[#e8deef] px-3 py-2">
                    <span className="h-3 w-3 rounded-full bg-[#67cf3f]" />
                    <span className="truncate text-sm font-medium">
                      {new Date(reservation.startTime).toLocaleDateString('cs-CZ')} - {reservation.roomName}
                    </span>
                  </div>
                ))}
                {!upcomingReservations.length && <p className="px-2 text-center text-sm text-black/50">No upcoming bookings</p>}
              </div>

              <h3 className="border-y border-black/5 bg-black/[0.03] px-4 py-4 text-center text-2xl font-medium uppercase tracking-wide">Canceled</h3>
              <div className="min-h-[190px] space-y-2 px-2 py-3">
                {canceledReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center gap-3 rounded-lg bg-[#e8deef] px-3 py-2">
                    <span className="h-3 w-3 rounded-full bg-[#f11422]" />
                    <span className="truncate text-sm font-medium">
                      {new Date(reservation.endTime).toLocaleDateString('cs-CZ')} - {reservation.roomName}
                    </span>
                  </div>
                ))}
                {!canceledReservations.length && <p className="px-2 text-center text-sm text-black/50">No canceled bookings</p>}
              </div>
            </div>

            <button
              onClick={onLogout}
              className="rounded-2xl border border-black/5 bg-[#f5f5f7] py-3 text-xl font-medium uppercase tracking-wide transition hover:bg-[#efeff2]"
            >
              Log Out
            </button>
          </aside>
        </div>
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

export default GuideView;
