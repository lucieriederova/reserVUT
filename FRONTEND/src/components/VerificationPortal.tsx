import React from 'react';
import { CheckCircle, XCircle, ListFilter, Download } from 'lucide-react';

interface VerificationRowProps {
  name: string;
  email: string;
  vutId: string;
  role: "CEO" | "GUIDE";
}

const VerificationRow: React.FC<VerificationRowProps> = ({ name, email, vutId, role }) => (
  <tr className="hover:bg-white/[0.01] transition-all group">
    <td className="p-8">
      <div className="flex items-center gap-4">
        <div className="size-10 bg-pink-600/20 rounded-xl flex items-center justify-center font-black text-pink-600 text-xs">{name.charAt(0)}</div>
        <div>
          <div className="font-bold text-white text-sm">{name}</div>
          <div className="text-[10px] text-gray-500 font-medium italic">{email}</div>
        </div>
      </div>
    </td>
    <td className="p-8 font-mono text-xs text-pink-500/80 tracking-tighter font-bold">{vutId}</td>
    <td className="p-8">
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${role === 'CEO' ? 'bg-pink-600 text-white border-pink-500' : 'bg-surface-dark border-border-dark text-white'}`}>
        {role}
      </span>
    </td>
    <td className="p-8 text-right">
       <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all"><CheckCircle size={16} /></button>
          <button className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><XCircle size={16} /></button>
       </div>
    </td>
  </tr>
);

const VerificationPortal: React.FC = () => {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end mb-12">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">Pending Verifications</h2>
        <div className="flex gap-3">
           <button className="bg-surface-dark border border-border-dark text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2"><ListFilter size={16}/> Filter</button>
           <button className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-600/30"><Download size={16}/> Export Log</button>
        </div>
      </header>
      <div className="bg-[#1a1416] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] font-black uppercase text-gray-500">
            <tr><th className="p-8">User Details</th><th className="p-8">VUT ID</th><th className="p-8">Requested Role</th><th className="p-8 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
             <VerificationRow name="Johnathan Doe" email="john.doe@vut.edu" vutId="VUT-12345-X" role="CEO" />
             <VerificationRow name="Jane Smith" email="j.smith@vut.edu" vutId="VUT-98765-Z" role="GUIDE" />
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerificationPortal;