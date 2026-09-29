import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, RefreshCw, Globe, Key, QrCode, ArrowLeft } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { QRCodeSVG } from 'qrcode.react';

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { signIn } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [loginMode, setLoginMode] = useState<'google' | 'custom'>('google');
  const [step, setStep] = useState<'credentials' | 'mfa' | 'mfa-setup'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  
  // Simulated TOTP state
  const [totpSecret, setTotpSecret] = useState<string>(localStorage.getItem('tejax_totp_secret') || '');
  const [otpauthUri, setOtpauthUri] = useState<string>('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn();
    } catch (err: any) {
      console.error("Login failed:", err);
      let errorMsg = "Google Login encountered an error.";
      
      if (err.code === 'auth/popup-blocked') {
        errorMsg = "Popup was blocked by your browser. Please enable popups for this site.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = "Login popup was closed before completion.";
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMsg = "This domain is not authorized for Google Sign-In. Please use the Manual Access fallback.";
      }
      
      setError(errorMsg);
      // Automatically show manual/custom fallback options if popup fails
      setShowManual(true);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/popup-blocked') {
        setLoginMode('custom');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      setLoading(true);
      setError(null);
      
      // Check if user needs TOTP setup
      if (!totpSecret) {
        try {
          const res = await fetch('/api/mfa/totp/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
          });
          const data = await res.json();
          if (data.success) {
            setTotpSecret(data.secret);
            setOtpauthUri(data.otpauth);
            setStep('mfa-setup');
          }
        } catch (err) {
          setError('Failed to initialize security setup.');
        } finally {
          setLoading(false);
        }
      } else {
        setStep('mfa');
        setLoading(false);
      }
    } else {
      setError('Invalid Analyst Credentials.');
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/mfa/totp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: mfaCode, secret: totpSecret })
      });
      const data = await res.json();
      
      if (data.success && data.isValid) {
        // Persist secret if it was a setup step
        if (step === 'mfa-setup') {
          localStorage.setItem('tejax_totp_secret', totpSecret);
        }
        onLogin(`${username.toLowerCase()}@tejax.ai`);
      } else {
        setError('Invalid Authenticator Code. Access Denied.');
      }
    } catch (err) {
      setError('Verification service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const resetMFASetup = () => {
    localStorage.removeItem('tejax_totp_secret');
    setTotpSecret('');
    setStep('credentials');
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualEmail.trim()) {
      setLoading(true);
      setTimeout(() => {
        onLogin(manualEmail);
        setLoading(false);
      }, 500);
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
            <div className="flex bg-slate-950/50 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setLoginMode('google')}
                className={`flex-1 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-md transition-all ${loginMode === 'google' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Workstation
              </button>
              <button
                onClick={() => setLoginMode('custom')}
                className={`flex-1 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-md transition-all ${loginMode === 'custom' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Analyst ID
              </button>
            </div>

            {loginMode === 'google' ? (
              <>
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
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Globe className="w-5 h-5" />
                        <span>Initialize Google Session</span>
                      </>
                    )}
                  </div>
                </button>
              </>
            ) : step === 'credentials' ? (
              <form onSubmit={handleCustomLogin} className="space-y-4 animate-fadeIn">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Analyst Username"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                    required
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Security Password"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-lg shadow-cyan-500/20 text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Establish Analyst Link'}
                </button>
              </form>
            ) : step === 'mfa-setup' ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-left">
                  <p className="text-cyan-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    Authenticator Setup
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Scan this QR code with Google Authenticator or any TOTP app to secure your analyst account.
                  </p>
                </div>
                
                <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-xl">
                  {otpauthUri && (
                    <QRCodeSVG 
                      value={otpauthUri} 
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  )}
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Manual Secret Key</p>
                    <code className="text-xs font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded select-all">
                      {totpSecret}
                    </code>
                  </div>
                </div>

                <form onSubmit={handleMFAVerify} className="space-y-4">
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit verification code"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] text-cyan-400 font-mono focus:outline-none focus:border-cyan-500/50"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('credentials')}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl text-[10px] uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-lg shadow-cyan-500/20 text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Complete Setup'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <form onSubmit={handleMFAVerify} className="space-y-6 animate-fadeIn">
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-left">
                  <p className="text-cyan-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    TOTP Challenge Active
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Enter the 6-digit security code from your **Google Authenticator** app to authorize this terminal session.
                  </p>
                </div>

                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-4 text-3xl text-center tracking-[0.5em] text-cyan-400 font-mono focus:outline-none focus:border-cyan-500/50"
                  required
                />

                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('credentials')}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-lg shadow-cyan-500/20 text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Verify & Establish Link'}
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={resetMFASetup}
                    className="text-[9px] text-slate-600 hover:text-cyan-500 font-mono uppercase tracking-widest transition-colors"
                  >
                    Lost Access? Reset Security Setup
                  </button>
                </div>
              </form>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono leading-relaxed text-left">
                <div className="flex items-start gap-2">
                  <span className="shrink-0 text-lg">⚠️</span>
                  <div>
                    <p className="font-bold uppercase tracking-wider mb-1">Authorization Fault Detected</p>
                    <p>{error}</p>
                    <p className="mt-2 text-slate-500 italic">Troubleshooting: Ensure popups are allowed or use the "Analyst ID" tab above for immediate manual access.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Fallback Option */}
            <div className="mt-4">
              {!showManual ? (
                <button 
                  onClick={() => setShowManual(true)}
                  className="text-[10px] text-slate-600 hover:text-cyan-500 font-mono uppercase tracking-widest transition-colors"
                >
                  Trouble signing in? Use Manual Analyst Access
                </button>
              ) : (
                <form onSubmit={handleManualLogin} className="space-y-3 animate-fadeIn">
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="Enter Analyst Email (sharathsmart3@gmail.com)"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500/50"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-slate-700 text-[10px] uppercase tracking-widest"
                  >
                    Confirm Access
                  </button>
                </form>
              )}
            </div>
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
