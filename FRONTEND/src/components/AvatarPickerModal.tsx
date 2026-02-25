import React from 'react';
import { AVATAR_LIBRARY } from '../lib/avatarLibrary';

interface AvatarPickerModalProps {
  isOpen: boolean;
  currentAvatar: string;
  loading: boolean;
  onClose: () => void;
  onSelect: (avatarUrl: string) => Promise<void>;
}

const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({ isOpen, currentAvatar, loading, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-[560px] bg-white rounded-[36px] border border-gray-100 shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Choose Avatar</h2>
          <button onClick={onClose} className="text-sm font-black text-gray-500 hover:text-gray-900">X</button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {AVATAR_LIBRARY.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              disabled={loading}
              onClick={() => void onSelect(avatar.src)}
              className={`rounded-2xl border-2 p-2 transition ${currentAvatar === avatar.src ? 'border-[#ec1380]' : 'border-gray-100'} disabled:opacity-60`}
            >
              <img src={avatar.src} alt={avatar.label} className="h-16 w-16 mx-auto rounded-xl object-cover" />
              <p className="mt-2 text-[10px] font-black uppercase text-gray-500">{avatar.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarPickerModal;
