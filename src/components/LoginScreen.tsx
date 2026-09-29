import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, RefreshCw, Chrome } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';

interface LoginScreenProps {
  onLogin?: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const { signIn } = useFirebase();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* FLASHY BACKGROUND LAYERS */}
      
      {/* 1. Base Gradient Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15)_0,transparent_70%)] pointer-events-none" />

      {/* 2. Animated Moving Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="absolute inset-0 animate-grid-flow"
          style={{ 
            backgroundImage: `linear-gradient(to right, #083344 1px, transparent 1px), linear-gradient(to bottom, #083344 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* 3. Floating Technical Elements (Flashy Shapes) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        
        {/* Abstract SVG Nodes */}
        <svg className="absolute top-[20%] right-[25%] w-12 h-12 text-cyan-500/20 animate-float" style={{ animationDelay: '-1s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <svg className="absolute bottom-[15%] left-[20%] w-16 h-16 text-emerald-500/20 animate-float" style={{ animationDelay: '-4s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v20M2 12h20" />
        </svg>
      </div>

      {/* 4. Scanning Laser Line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent absolute top-0 animate-scan-line shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
      </div>

      {/* LOGIN CARD (Glassmorphic) */}
      <div className="relative w-full max-w-md">
        {/* Card Outer Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
        
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-lg animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl">
                <ShieldAlert className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                TejaX <span className="text-cyan-400">AI</span>
              </h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="h-[1px] w-4 bg-slate-700" />
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em]">Threat Intelligence and Hunt Portal</p>
                <div className="h-[1px] w-4 bg-slate-700" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 text-xs font-mono">
              <p>Secure Terminal Access Required.</p>
              <p className="mt-1">Please authenticate using your authorized Google workstation account.</p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group relative w-full overflow-hidden py-4 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl shadow-lg shadow-white/5 text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-950/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <div className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <Chrome className="w-5 h-5" />
                    <span>Initialize Google Session</span>
                  </>
                )}
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between text-[9px] text-slate-500 font-mono uppercase tracking-tighter">
            <span className="flex items-center gap-1.5 text-emerald-400/80">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SOC Connection Secured</span>
            </span>
            <span>Terminal V2.4.9-E</span>
          </div>
        </div>
        
        {/* Footer Technical Note */}
        <p className="text-center mt-6 text-[9px] text-slate-600 font-mono uppercase tracking-[0.3em] pointer-events-none">
          Proprietary Intelligence Environment // Authorized Access Only
        </p>
      </div>
    </div>
  );
};
