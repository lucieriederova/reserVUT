// FRONTEND/src/components/AdminDashboard.tsx
import React from 'react';
import { Activity, Users, Clock, AlertTriangle, Zap } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
          <span className="w-8 h-px bg-primary"></span>
          Admin Console
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">System Overview</h1>
      </header>

      {/* Hlavní statistiky */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Reservations" value="124" trend="+12%" icon={<Activity size={20} />} />
        <StatCard title="Peak Occupancy" value="88%" trend="+5%" icon={<Users size={20} />} />
        <StatCard title="Avg. Duration" value="1.5 Hours" icon={<Clock size={20} />} />
        <StatCard title="Priority Issues" value="02" alert icon={<AlertTriangle size={20} />} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Status místností v reálném čase */}
        <div className="col-span-12 lg:col-span-8 bg-surface-dark/40 border border-border-dark rounded-[2.5rem] p-8 backdrop-blur-md">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white">
              <span className="size-2 bg-green-500 rounded-full animate-ping"></span>
              Live Room Status
            </h2>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Real-time tracking active</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RoomStatusCard name="Panda Room" capacity={12} status="AVAILABLE" />
            <RoomStatusCard name="Stage" capacity={50} status="OCCUPIED" user="Guide Sarah" />
            <RoomStatusCard name="The Aquarium" capacity={8} status="OCCUPIED" user="CEO Michael" />
            <RoomStatusCard name="The Hub" capacity={20} status="AVAILABLE" />
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-dark/40 border border-border-dark rounded-[2.5rem] p-8">
            <h3 className="text-sm font-black uppercase text-gray-500 mb-6 italic">Priority Breakdown</h3>
            <div className="space-y-4 text-white">
              <ProgressItem label="Events (Admin)" value={45} color="bg-primary" />
              <ProgressItem label="Sessions (Guide)" value={30} color="bg-secondary" />
              <ProgressItem label="Meetings (Student)" value={25} color="bg-gray-600" />
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6">
             <div className="flex items-center gap-2 text-primary mb-2 font-black text-[10px] uppercase">
               <Zap size={14} fill="currentColor" /> System Alerts
             </div>
             <p className="text-xs text-white/70 italic">"New CEO Verification: Marcus V. is awaiting role authorization." [cite: 145]</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Pomocné komponenty pro čistotu kódu */

const StatCard = ({ title, value, trend, alert, icon }: { title: string, value: string, trend?: string, alert?: boolean, icon: React.ReactNode }) => (
  <div className="bg-surface-dark/40 border border-border-dark p-6 rounded-3xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${alert ? 'bg-red-500/20 text-red-500' : 'bg-primary/10 text-primary'}`}>{icon}</div>
      {trend && <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">{trend}</span>}
    </div>
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
    <p className="text-2xl font-black text-white">{value}</p>
  </div>
);

const RoomStatusCard = ({ name, status, user }: { name: string, capacity: number, status: 'AVAILABLE' | 'OCCUPIED', user?: string }) => (
  <div className="bg-background-dark/40 border border-border-dark p-4 rounded-2xl flex justify-between items-center group hover:border-primary/50 transition-all">
    <div>
      <h4 className="font-bold text-sm text-white">{name}</h4>
      {user && <p className="text-[10px] text-gray-500 italic">Reserved by {user}</p>}
    </div>
    <span className={`text-[9px] font-black px-2 py-1 rounded ${status === 'AVAILABLE' ? 'text-green-500 bg-green-500/10' : 'text-primary bg-primary/10'}`}>
      {status}
    </span>
  </div>
);

const ProgressItem = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div>
    <div className="flex justify-between text-[10px] font-black uppercase mb-1">
      <span className="text-gray-500 tracking-widest">{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default AdminDashboard;