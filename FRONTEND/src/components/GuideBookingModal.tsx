import React from 'react';

interface GuideBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const GuideBookingModal: React.FC<GuideBookingModalProps> = ({ isOpen, onClose, userEmail }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
        
        {/* Levý modrý panel */}
        <div className="bg-[#2563EB] w-full md:w-64 p-8 text-white flex flex-col justify-between relative">
          <div>
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-6">
              <span className="text-xl">🛡️</span>
            </div>
            <h2 className="text-2xl font-black mb-2 leading-tight">Guide Status</h2>
            <p className="text-[11px] leading-relaxed opacity-90">
              As a Guide, you hold Level 3 Priority. You can schedule group sessions and override student bookings.
            </p>
          </div>

          <div className="space-y-3 mt-8">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Priority</p>
              <p className="text-xs font-black">High (Level 3)</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Booking Type</p>
              <p className="text-xs font-black">Session</p>
            </div>
          </div>
        </div>

        {/* Pravý formulář */}
        <div className="flex-1 p-8 relative bg-white">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors">
            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center font-bold text-sm">✕</div>
          </button>

          <h3 className="text-2xl font-black text-gray-900 mb-1">New Reservation</h3>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-8">
            {userEmail.split('@')[0].toUpperCase()} • FRIDAY, OCT 27, 2023
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Session Title</label>
              <input type="text" defaultValue="Weekly Mentorship Session" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-blue-300" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Room Selection</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none appearance-none">
                  <option>Session Room</option>
                  <option>The Stage</option>
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
                <input type="text" defaultValue="02:00 PM" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">End Time</label>
                <input type="text" defaultValue="04:00 PM" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Guide Specifické Informace */}
          <div className="space-y-3 mb-8">
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3">
              <span className="text-orange-500 text-xs">⚠️</span>
              <div>
                <p className="text-[9px] font-black text-orange-600 uppercase mb-0.5">Lead Time Requirement</p>
                <p className="text-[8px] text-gray-500 font-medium">
                  Sessions require a 3-day lead time. Selecting a date sooner than Oct 30 may require administrative approval.
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
              <span className="text-blue-500 text-xs">🔄</span>
              <div>
                <p className="text-[9px] font-black text-blue-600 uppercase mb-0.5">Student Displacement</p>
                <p className="text-[8px] text-gray-500 font-medium">
                  This booking will <span className="font-bold">displace</span> any existing Student reservations in the selected time slot. Students will be notified automatically.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-50 pt-6">
            <button onClick={onClose} className="text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-500">Cancel</button>
            <button className="bg-[#2563EB] text-white px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-blue-100 active:scale-95 transition-all">
              Confirm Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideBookingModal;