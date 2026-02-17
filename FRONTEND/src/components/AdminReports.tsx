import React from 'react';
import { BarChart3, PieChart, FileText, Gavel } from 'lucide-react';

const AdminReports: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
            <span className="w-8 h-px bg-primary"></span>
            System Analytics
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">Admin Reports & Audit</h2>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
          <FileText size={18} /> Generate PDF
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Occupancy Chart */}
        <div className="lg:col-span-2 bg-surface-dark/30 border border-border-dark rounded-xl p-6">
          <h3 className="font-bold text-white flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-primary" /> Hourly Room Occupancy
          </h3>
          <div className="h-48 flex items-end justify-between gap-2 border-b border-border-dark/50 pb-2">
            {[40, 65, 85, 95, 100, 80, 60, 55, 30].map((h, i) => (
              <div key={i} className="w-full bg-primary/40 rounded-t hover:bg-primary transition-all" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span>08am</span><span>12pm</span><span>04pm</span><span>08pm</span>
          </div>
        </div>

        {/* Roles Pie */}
        <div className="bg-surface-dark/30 border border-border-dark rounded-xl p-6 flex flex-col items-center justify-center">
          <PieChart size={40} className="text-secondary mb-4" />
          <div className="text-center">
            <span className="text-3xl font-black text-white">452</span>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total Bookings</p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-surface-dark/20 rounded-xl border border-border-dark overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border-dark bg-surface-dark/40 flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
            <Gavel size={20} />
          </div>
          <h3 className="font-bold text-white italic">Audit Log: Override & Cancellation</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-dark/60 text-gray-500 text-[10px] uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Room</th>
              <th className="px-6 py-4">Action Taken By</th>
              <th className="px-6 py-4 text-right">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark text-sm">
            <tr className="hover:bg-primary/5 transition-colors group border-l-4 border-l-transparent hover:border-l-primary">
              <td className="px-6 py-4 text-white">Oct 24, 2023 <span className="block text-[10px] text-gray-500">14:22:15 GMT</span></td>
              <td className="px-6 py-4 font-bold">Main Conference A</td>
              <td className="px-6 py-4 text-secondary font-black text-[10px] uppercase tracking-tighter">Alex Rivera (Head Admin)</td>
              <td className="px-6 py-4 text-right font-mono text-primary">#PRE-9921</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;