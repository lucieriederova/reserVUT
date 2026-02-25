import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

import LoginView from './components/LoginView';
import StudentView from './components/StudentView';
import CEOView from './components/CEOView';
import GuideView from './components/GuideView';
import HeadAdminView from './components/HeadAdminView';
import { fetchReservations, fetchRoomPolicies, login, logout, registerAccount, sendPasswordReset, updateRoomPolicies, type AppRole, type AppUser, type ReservationRecord } from './lib/api';
import { DEFAULT_ROOM_POLICIES, ROOM_POLICIES_STORAGE_KEY, sanitizeRoomPolicies, type RoomPolicy } from './lib/roomAccess';

const roleToPath = (role: AppUser['role']) => {
  switch (role) {
    case 'STUDENT':
      return '/student';
    case 'CEO':
      return '/ceo';
    case 'GUIDE':
      return '/guide';
    case 'HEAD_ADMIN':
      return '/admin';
    default:
      return '/student';
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [roomPolicies, setRoomPolicies] = useState<RoomPolicy[]>(DEFAULT_ROOM_POLICIES);
  const [loading, setLoading] = useState(true);

  const refreshReservations = async () => {
    const data = await fetchReservations();
    setReservations(data);
  };

  useEffect(() => {
    const rawUser = localStorage.getItem('inprofo_user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser) as AppUser;
        setUser(parsed);
        void refreshReservations();
      } catch {
        localStorage.removeItem('inprofo_user');
      }
    }
    const rawPolicies = localStorage.getItem(ROOM_POLICIES_STORAGE_KEY);
    if (rawPolicies) {
      try {
        const parsedPolicies = JSON.parse(rawPolicies) as unknown;
        setRoomPolicies(sanitizeRoomPolicies(parsedPolicies));
      } catch {
        localStorage.removeItem(ROOM_POLICIES_STORAGE_KEY);
      }
    }
    void (async () => {
      try {
        const policiesFromApi = await fetchRoomPolicies();
        setRoomPolicies(sanitizeRoomPolicies(policiesFromApi));
      } catch {
        // Keep local defaults/localStorage when backend room policies API is unavailable.
      }
    })();
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem(ROOM_POLICIES_STORAGE_KEY, JSON.stringify(roomPolicies));
  }, [roomPolicies]);

  const handleRoomPoliciesChange = (policies: RoomPolicy[]) => {
    setRoomPolicies(policies);
    void updateRoomPolicies(policies).catch(() => {
      // Preserve local behavior if backend sync fails.
    });
  };

  const handleLogin = async (role: AppRole, email: string, password: string) => {
    const loggedIn = await login(email, password, role);
    setUser(loggedIn);
    localStorage.setItem('inprofo_user', JSON.stringify(loggedIn));
    await refreshReservations();
  };

  const handleRegister = async (email: string, password: string, firstName: string, lastName: string, avatarUrl: string) => {
    await registerAccount(email, password, firstName, lastName, avatarUrl);
  };

  const handleForgotPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Supabase sign-out failed, continuing local logout.', error);
    } finally {
      setUser(null);
      setReservations([]);
      localStorage.removeItem('inprofo_user');
    }
  };

  const homePath = useMemo(() => (user ? roleToPath(user.role) : '/login'), [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm font-black uppercase tracking-widest text-gray-500">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen relative font-sans">
        {user && (
          <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 bg-[#1a1416]/95 p-3 rounded-2xl border border-white/10 shadow-2xl">
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest text-center mb-1">Dev Mode</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/student" className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black rounded-lg uppercase tracking-tighter">Student</Link>
              <Link to="/ceo" className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black rounded-lg uppercase tracking-tighter">CEO</Link>
              <Link to="/guide" className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black rounded-lg uppercase tracking-tighter">Guide</Link>
              <Link to="/admin" className="px-3 py-2 bg-[#ec1380] hover:brightness-110 text-white text-[10px] font-black rounded-lg uppercase tracking-tighter">Head Admin</Link>
            </div>
          </div>
        )}

        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<LoginView onLogin={handleLogin} onRegister={handleRegister} onForgotPassword={handleForgotPassword} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to={homePath} replace />} />
              <Route
                path="/student"
                element={<StudentView user={user} reservations={reservations} roomPolicies={roomPolicies} onReservationCreated={refreshReservations} onLogout={handleLogout} />}
              />
              <Route
                path="/ceo"
                element={<CEOView user={user} onLogout={handleLogout} reservations={reservations} roomPolicies={roomPolicies} onReservationCreated={refreshReservations} />}
              />
              <Route
                path="/guide"
                element={<GuideView user={user} onLogout={handleLogout} reservations={reservations} roomPolicies={roomPolicies} onReservationCreated={refreshReservations} />}
              />
              <Route
                path="/admin"
                element={<HeadAdminView user={user} onLogout={handleLogout} reservations={reservations} roomPolicies={roomPolicies} onRoomPoliciesChange={handleRoomPoliciesChange} />}
              />
              <Route path="*" element={<Navigate to={homePath} replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
