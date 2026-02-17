import React, { useState } from 'react';
import { ShieldAlert, Zap, X } from 'lucide-react';

interface AdminBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminBookingModal: React.FC<AdminBookingModalProps> = ({ isOpen, onClose }) => {
  const [isOverrideEnabled, setIsOverrideEnabled] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-[#1a1416] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-pink-600/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Zap className="text-pink-600" size={20} fill="currentColor" />
            <h2 className="text-lg font-black uppercase text-white">Priority Booking</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>
        <div className="p-8">
           <div className="p-6 bg-pink-600/5 border border-pink-600/20 rounded-2xl flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-white mb-1">Priority Override [cite: 43]</p>
                <p className="text-[10px] text-gray-500 italic">Bypass existing student reservations.</p>
              </div>
              <button 
                onClick={() => setIsOverrideEnabled(!isOverrideEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${isOverrideEnabled ? 'bg-pink-600' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${isOverrideEnabled ? 'left-7' : 'left-1'}`} />
              </button>
           </div>
           {isOverrideEnabled && (
             <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-xl flex gap-3 animate-pulse">
               <ShieldAlert className="text-red-600 shrink-0" size={18} />
               <p className="text-[10px] text-red-600 font-bold leading-tight uppercase">Warning: Lower priority bookings will be cancelled[cite: 43, 89].</p>
             </div>
           )}
        </div>
        <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end gap-4">
           <button onClick={onClose} className="text-xs font-bold text-gray-500">Cancel</button>
           <button className="bg-pink-600 px-6 py-2 rounded-xl text-xs font-black uppercase text-white shadow-lg shadow-pink-600/20">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingModal;