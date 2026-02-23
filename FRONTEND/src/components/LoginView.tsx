import React, { useState } from 'react';
import type { AppRole } from '../lib/api';

interface LoginViewProps {
  onLogin: (role: AppRole, email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onRegister, onForgotPassword }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<AppRole>('Student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const validateCredentials = () => {
    if (!email.includes('@vut.cz') && !email.includes('@vutbr.cz')) {
      setError('Zadejte prosím platný VUT e-mail (např. vut-id@vut.cz).');
      return false;
    }
    if (!password) {
      setError('Zadejte heslo k Supabase účtu.');
      return false;
    }
    return true;
  };

  const handleLoginAction = async () => {
    if (!validateCredentials()) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await onLogin(selectedRole, email, password);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Přihlášení selhalo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAction = async () => {
    if (!validateCredentials()) return;
    if (!firstName.trim() || !lastName.trim()) {
      setError('Vyplňte jméno i příjmení.');
      return;
    }
    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků.');
      return;
    }

    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await onRegister(email, password, firstName.trim(), lastName.trim());
      setInfo('Účet vytvořen. Pokud je vyžadováno ověření e-mailu, potvrďte ho a pak se přihlaste.');
      setMode('login');
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Registrace selhala.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.includes('@vut.cz') && !email.includes('@vutbr.cz')) {
      setError('Nejdřív zadejte VUT e-mail pro reset hesla.');
      return;
    }
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await onForgotPassword(email);
      setInfo('Odkaz na reset hesla byl odeslán na váš e-mail.');
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Reset hesla selhal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF2F8] flex flex-col items-center justify-center font-sans p-4">
      {/* Horní Logo bar s vut-logo.png */}
      <div className="flex items-center mb-8 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="bg-white px-4 py-2 flex items-center justify-center border-r border-gray-100">
           <img 
            src="/vut-logo.png" 
            alt="VUT Logo" 
            className="h-8 w-auto object-contain"
          />
        </div>
        <div className="bg-[#7C3AED] text-white px-6 py-3 font-black text-2xl uppercase italic">
          FP
        </div>
        <div className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white">
          reserVUT
        </div>
      </div>

      {/* Hlavní Login Card */}
      <div className="bg-white w-full max-w-[560px] rounded-[48px] shadow-2xl p-12 text-center border border-gray-50">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
        <p className="text-gray-400 text-sm font-medium mb-12">
          {mode === 'login' ? 'Select your role and enter your credentials' : 'Use your VUT e-mail and create a password'}
        </p>
        <div className="mb-6 flex gap-2 rounded-2xl bg-[#F9FAFB] p-2">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 rounded-xl py-2 text-xs font-black uppercase tracking-wider ${mode === 'login' ? 'bg-white text-gray-900' : 'text-gray-500'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-xl py-2 text-xs font-black uppercase tracking-wider ${mode === 'signup' ? 'bg-white text-gray-900' : 'text-gray-500'}`}
          >
            Sign Up
          </button>
        </div>

        {/* 1. Výběr Role */}
        {mode === 'login' && (
        <div className="text-left mb-8">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 block">
            1. Select Your Role
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['Student', 'CEO', 'Guide', 'Head Admin'] as AppRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group
                  ${selectedRole === role 
                    ? 'border-[#EF4444] bg-white ring-4 ring-red-50' 
                    : 'border-gray-50 bg-[#F9FAFB] hover:border-gray-200'}`}
              >
                <span className={`text-2xl mb-2 transition-transform group-hover:scale-110 
                  ${selectedRole === role ? 'grayscale-0' : 'grayscale opacity-40'}`}>
                  {role === 'Student' ? '🎓' : role === 'CEO' ? '🎖️' : role === 'Guide' ? '📖' : '🛡️'}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-tighter 
                  ${selectedRole === role ? 'text-gray-900' : 'text-gray-400'}`}>
                  {role}
                </span>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* 2. Pole pro E-mail */}
        <div className="text-left mb-8">
          {mode === 'signup' && (
            <>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">
                2. First Name
              </label>
              <input
                type="text"
                placeholder="Lucie"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#F9FAFB] border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#7C3AED] focus:outline-none transition-all placeholder:opacity-30"
              />
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 mt-4 block">
                3. Last Name
              </label>
              <input
                type="text"
                placeholder="Riederová"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#F9FAFB] border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#7C3AED] focus:outline-none transition-all placeholder:opacity-30"
              />
            </>
          )}
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">
            {mode === 'signup' ? '4. VUT E-mail Address' : '2. VUT E-mail Address'}
          </label>
          <input 
            type="email" 
            placeholder="vut-id@vut.cz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#F9FAFB] border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#7C3AED] focus:outline-none transition-all placeholder:opacity-30"
          />
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 mt-4 block">
            {mode === 'signup' ? '5. Supabase Password' : '3. Supabase Password'}
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#F9FAFB] border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#7C3AED] focus:outline-none transition-all placeholder:opacity-30"
          />
          
          {/* Info box pouze pro CEO/Guide (Verifikace) */}
          {mode === 'login' && (selectedRole === 'CEO' || selectedRole === 'Guide') && (
            <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-4 flex gap-4 text-left mt-4">
              <div className="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 italic">i</div>
              <p className="text-[11px] text-blue-700 leading-relaxed font-bold">
                Verification required after first login.
              </p>
            </div>
          )}
          {mode === 'login' && (
            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="mt-4 text-[11px] font-black uppercase tracking-wider text-[#7C3AED] hover:underline disabled:opacity-50"
            >
              Forgot Password
            </button>
          )}
        </div>
        {error && <p className="text-xs font-bold text-red-600 mb-4">{error}</p>}
        {info && <p className="text-xs font-bold text-emerald-600 mb-4">{info}</p>}

        {/* Hlavní Login Button */}
        <button 
          onClick={mode === 'login' ? handleLoginAction : handleRegisterAction}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#EF4444] to-[#7C3AED] hover:opacity-90 text-white py-5 rounded-3xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-purple-100 transition-transform active:scale-[0.98]"
        >
          {loading ? 'Working...' : mode === 'login' ? 'Authenticate & Continue' : 'Create Account'}
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center opacity-40">
        <p className="text-[9px] text-gray-500 font-medium tracking-tight">
          © 2024 Brno University of Technology. Faculty of Business and Management.
        </p>
      </footer>
    </div>
  );
};

export default LoginView;
