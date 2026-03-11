import React from 'react';
import type { AppUser } from '../lib/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
}

const roleLabels: Record<AppUser['role'], string> = {
  STUDENT: 'Student',
  CEO: 'CEO',
  GUIDE: 'Guide',
  HEAD_ADMIN: 'Head Admin'
};

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, notificationsEnabled, onToggleNotifications }) => {
  if (!isOpen) return null;

  const displayName = user.email.split('@')[0];
  const statusText = notificationsEnabled ? 'Odesílat e-mailová upozornění' : 'Upozornění vypnuta';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Profile</p>
            <h3 className="text-2xl font-black text-gray-900">{displayName}</h3>
          </div>
          <button onClick={onClose} className="text-xs font-black uppercase text-gray-400 hover:text-gray-600">
            Close
          </button>
        </header>

        <div className="mt-6 space-y-3 text-sm text-gray-700">
          <p>
            <span className="font-black uppercase tracking-widest text-gray-500">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-black uppercase tracking-widest text-gray-500">Role:</span> {roleLabels[user.role]}
          </p>
          <p>
            <span className="font-black uppercase tracking-widest text-gray-500">Notifications:</span> {statusText}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onToggleNotifications}
            className={`flex-1 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.3em] transition ${
              notificationsEnabled ? 'border-[#7f3fc1] bg-[#7f3fc1]/10 text-[#5c2a96]' : 'border-gray-200 text-gray-500'
            }`}
          >
            {notificationsEnabled ? 'Upozornění zapnuto' : 'Upozornění vypnuto'}
          </button>
          <button onClick={onClose} className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-xs font-black uppercase tracking-[0.3em] text-gray-500">
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
