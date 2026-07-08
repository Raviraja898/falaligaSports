import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLogin({ onSuccess, onCancel }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Ravi@445799') {
      setError('');
      onSuccess();
    } else {
      setError('Invalid administrative passcode. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-[#121212] border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white uppercase">
              Host Authorization
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Please enter the master passcode to open the Admin Control Panel.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Administrative Passcode
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter admin code"
                className={`w-full pl-4 pr-10 py-3 bg-black/40 border ${
                  error ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-amber-500'
                } rounded-xl text-sm font-mono text-white focus:outline-none transition-colors placeholder:text-slate-600`}
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 font-medium animate-shake">
                ⚠️ {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" /> Verify Credentials
          </button>
        </form>

        {/* Back Link */}
        <div className="pt-2 text-center relative z-10 border-t border-white/5 flex items-center justify-between text-xs">
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Lobby
          </button>
          <span className="text-[10px] text-slate-600 font-mono">
            Passcode: <span className="bg-white/5 px-1.5 py-0.5 rounded text-slate-400 border border-white/5">Ravi@445799</span>
          </span>
        </div>
      </div>
    </div>
  );
}
