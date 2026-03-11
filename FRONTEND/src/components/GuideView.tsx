import React, { useEffect, useMemo, useState } from 'react';
import { Bell, BellOff, UserCircle2 } from 'lucide-react';
import ReservationModal from './ReservationModal';
import CalendarGrid from './CalendarGrid';
import WeekNavigator from './WeekNavigator';
import MyReservationModal from './MyReservationModal';
import ProfileModal from './ProfileModal';
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
  const notificationStorageKey = `guide_notifications_${user.id}`;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [roomListOpen, setRoomListOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem(notificationStorageKey);
    return saved === null ? true : saved === 'true';
  });
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [activeReservation, setActiveReservation] = useState<ReservationRecord | null>(null);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(notificationStorageKey, JSON.stringify(notificationsEnabled));
  }, [notificationStorageKey, notificationsEnabled]);

  const handleReservationSelect = (reservation: ReservationRecord) => {
    setActiveReservation(reservation);
  };

  const closeReservationModal = () => {
    setActiveReservation(null);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
  };

  const handleRoomSelection = (room: string) => {
    setSelectedRoomId(room);
    setRoomListOpen(false);
  };

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
            <div className="relative mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <h1 className="pointer-events-none absolute -top-5 left-0 select-none text-[clamp(5.8rem,11vw,9.5rem)] font-black leading-[0.86] tracking-tight text-[#8e42be]/14">
                GUIDE
              </h1>

              <div className="relative z-10 pt-28">
                <div className="max-w-[500px] rounded-2xl border border-black/5 bg-[#f5f5f7] px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Select Room</p>
                      <p className="text-lg font-black uppercase tracking-tight text-[#151515]">
                        {selectedRoomId || guideRooms[0] || 'Žádná místnost'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRoomListOpen((prev) => !prev)}
                      className="rounded-2xl border border-black/10 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#7f3fc1] transition hover:bg-white"
                    >
                      {roomListOpen ? 'Zavřít výběr' : 'Výběr místnosti'}
                    </button>
                  </div>
                  {roomListOpen && (
                    <div className="mt-4 rounded-2xl border border-[#ece8ef] bg-white px-3 py-3 shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Role Guide • dostupné místnosti</p>
                      <div className="mt-3 space-y-2">
                        {guideRooms.map((room) => (
                          <button
                            key={room}
                            type="button"
                            onClick={() => handleRoomSelection(room)}
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                              selectedRoomId === room
                                ? 'border-[#7f3fc1] bg-[#f7f3ff] text-[#151515]'
                                : 'border-gray-100 bg-white text-gray-600 hover:border-[#7f3fc1]/40'
                            }`}
                          >
                            <span>{room}</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Vybrat</span>
                          </button>
                        ))}
                        {!guideRooms.length && (
                          <p className="text-xs font-semibold text-gray-500">Momentálně nejsou přiřazeny žádné místnosti.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10 pt-2">
                <div className="h-full min-h-[136px] rounded-3xl border border-black/5 bg-[#f5f5f7] p-4">
                  <h2 className="text-2xl font-black uppercase leading-none">Rules</h2>
                  <ul className="mt-2 space-y-1 text-base font-semibold leading-snug text-black/90">
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
                <div className="flex w-full items-center gap-3 md:flex-nowrap">
                  <WeekNavigator
                    weekOffset={weekOffset}
                    onPrevWeek={() => setWeekOffset((prev) => prev - 1)}
                    onNextWeek={() => setWeekOffset((prev) => prev + 1)}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleNotifications}
                      aria-pressed={notificationsEnabled}
                      className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition ${
                        notificationsEnabled
                          ? 'border-[#7f3fc1] bg-[#7f3fc1]/20 text-[#5c2a96]'
                          : 'border-gray-200 bg-white text-gray-500'
                      }`}
                    >
                      {notificationsEnabled ? (
                        <Bell className="text-[#7f3fc1]" size={16} />
                      ) : (
                        <BellOff className="text-gray-400" size={16} />
                      )}
                      <span>{notificationsEnabled ? 'Upozornění zapnuto' : 'Upozornění vypnuto'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileOpen(true)}
                      className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 transition hover:border-[#7f3fc1]/40"
                    >
                      <UserCircle2 size={16} />
                      <span>Profil</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!guideRooms.length}
                    className="ml-auto rounded-full bg-[#7f3fc1] px-5 py-2 text-lg font-bold uppercase tracking-wide text-white transition hover:brightness-105 disabled:opacity-50"
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
                    reservations={roomReservations}
                    onReservationClick={handleReservationSelect}
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
                  <div
                    key={reservation.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleReservationSelect(reservation)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleReservationSelect(reservation);
                      }
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg bg-[#e8deef] px-3 py-2 transition hover:bg-[#dcd3ff]"
                  >
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
                  <div
                    key={reservation.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleReservationSelect(reservation)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleReservationSelect(reservation);
                      }
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg bg-[#e8deef] px-3 py-2 transition hover:bg-[#f5dce7]"
                  >
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
      <MyReservationModal
        reservation={activeReservation}
        onClose={closeReservationModal}
        onCancel={closeReservationModal}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={toggleNotifications}
      />
    </div>
  );
};

export default GuideView;
