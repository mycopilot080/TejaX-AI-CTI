import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ShieldAlert, Clock, RefreshCw } from 'lucide-react';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 120 seconds (2 minutes)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error; // Re-throw to handle in UI
    }
  };

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setShowWarning(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // Inactivity Timer logic
  useEffect(() => {
    if (!user) {
      setShowWarning(false);
      return;
    }

    let logoutTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
    const WARNING_THRESHOLD = 28 * 60 * 1000; // 28 minutes (2 minutes before limit)

    const resetTimers = () => {
      setShowWarning(false);
      setTimeLeft(120);
      
      if (logoutTimer) clearTimeout(logoutTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);

      warningTimer = setTimeout(() => {
        setShowWarning(true);
        // Start countdown
        countdownInterval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, WARNING_THRESHOLD);

      logoutTimer = setTimeout(() => {
        console.log('[TejaX Security] Inactivity limit reached. Terminating session.');
        logout();
      }, INACTIVITY_LIMIT);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      if (!showWarning) {
        resetTimers();
      }
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetTimers();

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, logout, showWarning]);

  const extendSession = () => {
    setShowWarning(false);
    setTimeLeft(120);
    // The resetTimers inside useEffect will trigger because of the showWarning change if we adjust it
    // Actually, we should just let the activity events or a manual call reset it.
    // By setting showWarning to false, the next activity or the current state change will trigger a refresh.
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, signIn, logout }}>
      {children}
      
      {/* Session Timeout Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-center overflow-hidden">
            {/* Warning Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-pulse">
                <Clock className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center justify-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  Session Expiring
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Your enterprise session will terminate in:
                </p>
                <div className="text-4xl font-black text-amber-500 font-mono tracking-tighter">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-[10px] text-slate-500 font-mono uppercase tracking-wider leading-relaxed">
                Due to SOC security protocols, inactive workstations are automatically locked.
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={extendSession}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-lg shadow-cyan-500/20 text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Extend Active Session
              </button>
              <button
                onClick={logout}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-colors"
              >
                Terminate Now
              </button>
            </div>
          </div>
        </div>
      )}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
