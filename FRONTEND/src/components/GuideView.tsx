import React, { useEffect, useMemo, useState } from 'react';
import ReservationModal from './ReservationModal';
import CalendarGrid from './CalendarGrid';
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
    () => reservations.filter((reservation) => guideRooms.includes(reservation.roomName)),
    [reservations, guideRooms]
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
    <div className="min-h-screen bg-black text-black">
      <div className="mx-auto w-full max-w-[1500px] px-3 pb-10 pt-4 sm:px-5 lg:px-8">
        <header className="bg-[#efeff2] px-5 py-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-6">
              <div className="flex items-center overflow-hidden border border-black/10">
                <div className="bg-[#f3113b] px-4 py-1 text-5xl font-black leading-none text-white">T</div>
                <div className="bg-[#8e48c8] px-4 py-1 text-5xl font-black leading-none text-white">FP</div>
              </div>
              <div className="flex items-center gap-4 text-sm uppercase tracking-wide sm:text-lg">
                <span className="font-semibold text-[#0083ad]">Reservations</span>
                <span className="text-2xl font-black">{'>'}</span>
                <span className="font-medium text-black">Global Schedule</span>
              </div>
            </div>
            <div className="hidden h-14 w-14 rounded-full border-4 border-[#b6b6b6] bg-white xl:block" />
          </div>
        </header>

        <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <h1 className="select-none text-[clamp(4.8rem,10vw,8.8rem)] font-black leading-[0.85] tracking-tight text-[#8e42be]">
              GUIDE
            </h1>

            <div className="mt-2 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
              <div className="max-w-[560px] rounded-full bg-[#efeff2] px-5 py-3">
                <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Select Room</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  disabled={!guideRooms.length}
                  className="mt-1 w-full bg-transparent text-xl font-semibold uppercase outline-none disabled:opacity-50 sm:text-2xl"
                >
                  {guideRooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-[2.4rem] bg-[#efeff2] p-5">
                <h2 className="text-4xl font-black uppercase leading-none">Rules</h2>
                <ul className="mt-3 space-y-2 text-[1.05rem] font-semibold leading-snug">
                  <li>Guide role can reserve only allowed rooms.</li>
                  <li>Reservation max length is 3 hours.</li>
                  <li>Higher priority booking can pre-empt lower.</li>
                </ul>
              </div>
            </div>

            <section className="mt-5 overflow-hidden rounded-[1.9rem] bg-[#efeff2]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 px-5 py-3">
                <h2 className="text-4xl font-black uppercase leading-none">Calendar</h2>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-medium sm:text-2xl xl:text-3xl">{'< 23.2.-1.3. >'}</span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!guideRooms.length}
                    className="rounded-full bg-[#7f3fc1] px-6 py-2 text-lg font-black uppercase text-white transition hover:brightness-105 disabled:opacity-50 sm:px-7 sm:text-2xl xl:text-[2.6rem]"
                  >
                    + New Booking
                  </button>
                </div>
              </div>
              <div className="min-h-[56vh] bg-[#b8b8ba] p-3">
                {guideRooms.length ? (
                  <CalendarGrid
                    rooms={guideRooms}
                    userStatus={guideStatus}
                    selectedRoomId={selectedRoomId || guideRooms[0]}
                  />
                ) : (
                  <p className="px-4 py-8 text-lg font-bold text-gray-700">No rooms are currently assigned to Guide role.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-5 xl:pb-28 xl:pt-24">
            <div className="overflow-hidden rounded-[2.6rem] bg-[#efeff2] p-0">
              <h3 className="px-4 py-4 text-center text-3xl font-medium uppercase leading-none sm:text-5xl xl:text-6xl">Upcoming</h3>
              <div className="mt-3 space-y-2 px-2 pb-4">
                {upcomingReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center gap-3 bg-[#e2d6e8] px-3 py-2">
                    <span className="h-4 w-4 rounded-full bg-[#67cf3f]" />
                    <span className="truncate text-sm font-medium">
                      {new Date(reservation.startTime).toLocaleDateString('cs-CZ')} - {reservation.roomName}
                    </span>
                  </div>
                ))}
                {!upcomingReservations.length && <p className="px-2 text-center text-sm text-black/50">No upcoming bookings</p>}
              </div>

              <h3 className="mt-2 bg-[#dddddf] px-4 py-4 text-center text-3xl font-medium uppercase leading-none sm:text-5xl xl:text-6xl">Canceled</h3>
              <div className="mt-3 space-y-2 px-2 pb-4">
                {canceledReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center gap-3 bg-[#e2d6e8] px-3 py-2">
                    <span className="h-4 w-4 rounded-full bg-[#f11422]" />
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
              className="rounded-full bg-[#efeff2] py-4 text-2xl font-medium uppercase sm:text-4xl xl:text-6xl"
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
