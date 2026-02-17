import React from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
        
        {/* Levý fialový panel */}
        <div className="bg-[#A855F7] w-full md:w-64 p-8 text-white flex flex-col justify-center items-start relative">
          <div className="bg-white/20 p-4 rounded-2xl mb-6">
            <span className="text-4xl">🎓</span>
          </div>
          <h2 className="text-2xl font-black mb-2 leading-tight">Student Access</h2>
          <p className="text-xs font-bold opacity-90 uppercase tracking-widest mb-4">Standard Priority Workshop</p>
          <p className="text-[10px] leading-relaxed opacity-70 italic">
            Student bookings are subject to displacement by CEO or Guide priority levels.
          </p>
        </div>

        {/* Pravý formulář */}
        <div className="flex-1 p-8 relative bg-white">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors">
            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center font-bold text-sm">✕</div>
          </button>

          <h3 className="text-2xl font-black text-gray-900 mb-1">New Reservation</h3>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-8">Thursday, Oct 26, 2023</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="col-span-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Reservation Title</label>
              <input type="text" defaultValue="Group Assignment Workshop" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-purple-300" />
            </div>
            <div className="col-span-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Date</label>
              <input type="text" defaultValue="Oct 26, 2023" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none" />
            </div>
            <div className="col-span-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Room Selection</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none appearance-none">
                <option>The Aquarium</option>
                <option>Meeting Room</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Status</label>
              <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-green-500">Available</div>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Start Time</label>
              <input type="text" defaultValue="14:00" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none" />
            </div>
            <div className="flex-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">End Time</label>
              <input type="text" defaultValue="16:30" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold border-purple-200" />
            </div>
          </div>

          {/* Varování */}
          <div className="space-y-3 mb-8">
            <div className="flex gap-3 items-start">
              <span className="text-red-500 text-xs">⚠️</span>
              <div>
                <p className="text-[9px] font-black text-red-500 uppercase tracking-tight leading-none mb-1">Validation Error: Duration Limit</p>
                <p className="text-[8px] text-gray-400 font-medium">Student bookings cannot exceed 3 hours. Please adjust your end time.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-orange-400 text-xs">⚠️</span>
              <div>
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-tight leading-none mb-1">Advanced Booking</p>
                <p className="text-[8px] text-gray-400 font-medium">Reservations must be made within 7 days of the current date.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-50 pt-6">
            <button onClick={onClose} className="text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-500">Cancel</button>
            <button className="bg-[#A855F7] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-purple-100 active:scale-95 transition-all">
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;