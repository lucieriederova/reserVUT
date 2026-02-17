import React from 'react';
import { Timer, Group, ShieldCheck, Save, RotateCcw } from 'lucide-react';

const AdminSettings: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
            <span className="w-8 h-px bg-primary"></span>
            System Configuration
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">Rules & Hierarchy</h2>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-dark border border-border-dark text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-border-dark">
            <RotateCcw size={18} /> Reset Defaults
          </button>
          <button className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
            <Save size={18} /> Save All Changes
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Constraints */}
          <div className="bg-surface-dark/40 border border-border-dark rounded-xl overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-border-dark flex items-center gap-3 bg-surface-dark/60">
              <Timer className="text-primary" />
              <h3 className="font-bold text-white">Session Constraints</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Min Lead Time (Hours)</label>
                <input type="number" defaultValue={24} className="w-full bg-surface-dark/60 border border-border-dark rounded-lg p-2 text-white outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Max Advance Booking (Days)</label>
                <input type="number" defaultValue={14} className="w-full bg-surface-dark/60 border border-border-dark rounded-lg p-2 text-white outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Quotas */}
          <div className="bg-surface-dark/40 border border-border-dark rounded-xl overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-border-dark flex items-center gap-3 bg-surface-dark/60">
              <Group className="text-secondary" />
              <h3 className="font-bold text-white">Booking Quotas</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center p-4 bg-surface-dark/30 rounded-lg border border-border-dark/50">
                <span className="text-white text-sm font-bold tracking-tight">Student Weekly Cap</span>
                <span className="text-primary font-black">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hierarchy Visualization */}
        <div className="bg-surface-dark/40 border border-border-dark rounded-xl p-6">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2 italic underline underline-offset-4 decoration-primary">
            <ShieldCheck size={18} /> Role Hierarchy
          </h3>
          <div className="space-y-6 relative pl-4 border-l border-white/10">
            <div className="relative pl-6">
              <div className="absolute -left-[21px] top-1 size-4 bg-primary rounded-full border-4 border-surface-dark"></div>
              <p className="text-[10px] font-black uppercase text-primary">Level 1</p>
              <h4 className="font-bold text-white text-sm">Head Admin</h4>
            </div>
            <div className="relative pl-6">
              <div className="absolute -left-[21px] top-1 size-4 bg-secondary rounded-full border-4 border-surface-dark"></div>
              <p className="text-[10px] font-black uppercase text-secondary">Level 2</p>
              <h4 className="font-bold text-white text-sm text-white/70">CEO / Project Lead</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;