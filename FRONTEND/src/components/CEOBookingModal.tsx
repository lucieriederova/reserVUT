import React from 'react';

interface CEOBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const CEOBookingModal: React.FC<CEOBookingModalProps> = ({ isOpen, onClose, userEmail }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
        
        {/* Levý panel s gradientem (Priority Booking) */}
        <div className="bg-gradient-to-b from-[#E11D48] to-[#9333EA] w-full md:w-64 p-8 text-white flex flex-col justify-between relative">
          <div>
            <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mb-6 border border-white/30">
              <span className="text-xl">⭐</span>
            </div>
            <h2 className="text-2xl font-black mb-3 leading-tight tracking-tight text-white">Priority Booking</h2>
            <p className="text-[11px] leading-relaxed opacity-90 font-medium">
              As a CEO, you have maximum priority. Your reservations override all standard and guide bookings.
            </p>
          </div>

          <div className="space-y-3 mt-8">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Your Role</p>
              <p className="text-xs font-black tracking-tight">Global Admin</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Privilege</p>
              <p className="text-xs font-black tracking-tight">Infinite Quota</p>
            </div>
          </div>
        </div>

        {/* Pravý formulář */}
        <div className="flex-1 p-8 relative bg-white">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors">
            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center font-bold text-sm">✕</div>
          </button>

          <h3 className="text-2xl font-black text-gray-900 mb-1">New Reservation</h3>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            {userEmail.split('@')[0].toUpperCase()} <span className="text-gray-200">•</span> FRIDAY, OCT 27, 2023
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Reservation Title</label>
              <input type="text" defaultValue="Emergency Strategic Meeting" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-purple-300" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Room Selection</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none appearance-none">
                  <option>Session Room</option>
                  <option>The Stage</option>
                  <option>Panda Room</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Date</label>
                <input type="text" defaultValue="10/27/2023" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Start Time</label>
                <input type="text" defaultValue="10:00 AM" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">End Time</label>
                <input type="text" defaultValue="11:30 AM" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none" />
              </div>
            </div>
          </div>

          {/* CEO Specifické upozornění */}
          <div className="space-y-4 mb-8">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-4">
              <div className="bg-red-500 text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0">!</div>
              <div>
                <p className="text-[10px] font-black text-red-600 uppercase mb-0.5 tracking-tight">Priority Override Active</p>
                <p className="text-[9px] text-red-700/70 font-medium leading-relaxed">
                  This slot is currently held by a <span className="font-bold">Guide Session</span>. Your CEO status will automatically displace the existing reservation. An automated notification will be sent to the current owner.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-1">
              <span className="text-gray-300 text-[10px]">ℹ️</span>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                Note: 3-day lead time validation waived for CEO accounts.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-50 pt-6">
            <button onClick={onClose} className="text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-500 transition-colors">Cancel</button>
            <button className="bg-gradient-to-r from-[#9333EA] to-[#E11D48] text-white px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-purple-100 active:scale-95 transition-all">
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEOBookingModal;