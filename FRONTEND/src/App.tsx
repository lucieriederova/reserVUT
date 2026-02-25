import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

import LoginView from './components/LoginView';
import StudentView from './components/StudentView';
import CEOView from './components/CEOView';
import GuideView from './components/GuideView';
import HeadAdminView from './components/HeadAdminView';
import AvatarPickerModal from './components/AvatarPickerModal';
import { fetchReservations, fetchRoomPolicies, login, logout, registerAccount, sendPasswordReset, updateRoomPolicies, type AppRole, type AppUser, type ReservationRecord } from './lib/api';
import { DEFAULT_ROOM_POLICIES, ROOM_POLICIES_STORAGE_KEY, sanitizeRoomPolicies, type RoomPolicy } from './lib/roomAccess';
import { AVATAR_LIBRARY } from './lib/avatarLibrary';
import { supabase } from './lib/supabase';

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
  const [avatarUrl, setAvatarUrl] = useState<string>(AVATAR_LIBRARY[0]?.src || '');
  const [profileName, setProfileName] = useState<string>('User');
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const extractNameFromProfileRecord = (record: Record<string, unknown> | null | undefined) => {
    if (!record) return '';

    const fullName = record.full_name;
    if (typeof fullName === 'string' && fullName.trim()) return fullName.trim();

    const firstName =
      (typeof record.first_name === 'string' && record.first_name) ||
      (typeof record.firstName === 'string' && record.firstName) ||
      (typeof record['first name'] === 'string' && record['first name']) ||
      '';

    const lastName =
      (typeof record.last_name === 'string' && record.last_name) ||
      (typeof record.lastName === 'string' && record.lastName) ||
      (typeof record['last name'] === 'string' && record['last name']) ||
      '';

    return [firstName, lastName].filter(Boolean).join(' ').trim();
  };

  const loadProfileIdentity = async (fallbackEmail?: string) => {
    try {
      const { data } = await supabase.auth.getUser();
      const authUser = data?.user;
      if (!authUser) return;

      const metadataAvatar = authUser.user_metadata?.avatar_url as string | undefined;
      const metadataFullName = authUser.user_metadata?.full_name as string | undefined;
      const metadataFirstName = authUser.user_metadata?.first_name as string | undefined;
      const metadataLastName = authUser.user_metadata?.last_name as string | undefined;
      const metadataName = metadataFullName || [metadataFirstName, metadataLastName].filter(Boolean).join(' ').trim();

      let profileName = '';
      try {
        const byId = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
        if (!byId.error) {
          profileName = extractNameFromProfileRecord(byId.data as Record<string, unknown> | null);
        }
      } catch {
        // ignore and continue fallback
      }

      if (!profileName && authUser.email) {
        try {
          const byEmail = await supabase.from('profiles').select('*').eq('email', authUser.email).maybeSingle();
          if (!byEmail.error) {
            profileName = extractNameFromProfileRecord(byEmail.data as Record<string, unknown> | null);
          }
        } catch {
          // ignore and continue fallback
        }
      }

      if (metadataAvatar) {
        setAvatarUrl(metadataAvatar);
        localStorage.setItem('inprofo_avatar_url', metadataAvatar);
      }
      setProfileName(profileName || metadataName || fallbackEmail?.split('@')[0] || 'User');
    } catch {
      if (fallbackEmail) {
        setProfileName(fallbackEmail.split('@')[0] || 'User');
      }
    }
  };

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
    const rawAvatar = localStorage.getItem('inprofo_avatar_url');
    if (rawAvatar) {
      setAvatarUrl(rawAvatar);
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
    void loadProfileIdentity();
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem(ROOM_POLICIES_STORAGE_KEY, JSON.stringify(roomPolicies));
  }, [roomPolicies]);

  useEffect(() => {
    if (avatarUrl) {
      localStorage.setItem('inprofo_avatar_url', avatarUrl);
    }
  }, [avatarUrl]);

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
    await loadProfileIdentity(email);
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

  const handleAvatarSelect = async (nextAvatarUrl: string) => {
    setAvatarSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: nextAvatarUrl
        }
      });
      if (error) {
        throw error;
      }
      setAvatarUrl(nextAvatarUrl);
      setAvatarPickerOpen(false);
    } catch {
      // Keep previous avatar if save fails.
    } finally {
      setAvatarSaving(false);
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
        {user && (
          <div className="fixed top-6 right-6 z-[9999] flex items-center gap-4 bg-white/95 p-4 rounded-2xl border border-slate-200 shadow-xl min-w-[320px]">
            <img src={avatarUrl} alt="User avatar" className="h-20 w-20 rounded-2xl object-cover border border-slate-200" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Profile</p>
              <p className="text-lg font-black text-slate-900 leading-tight">{profileName}</p>
              <p className="text-xs font-bold text-slate-500">{user.email}</p>
              <button
                onClick={() => setAvatarPickerOpen(true)}
                className="mt-1 text-[11px] font-black uppercase text-[#7C3AED] hover:underline"
              >
                Change Avatar
              </button>
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
        <AvatarPickerModal
          isOpen={avatarPickerOpen}
          currentAvatar={avatarUrl}
          loading={avatarSaving}
          onClose={() => setAvatarPickerOpen(false)}
          onSelect={handleAvatarSelect}
        />
      </div>
    </Router>
  );
};

export default App;
