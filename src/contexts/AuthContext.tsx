import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { syncService } from '../services/syncService';

const TEACHER_CODE = 'GEO2025VN';
const LS_TEACHER_KEY = 'geo_pro_teacher_mode';
const LS_PROFILE_KEY = 'examGeoProfile';
const LS_ROLE_KEY = 'examGeoRole';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isTeacherMode: boolean;
  isSynced: boolean;         // true = Google user, data synced to Firestore
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithTeacherCode: (code: string) => boolean;
  logoutTeacherMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(
    () => localStorage.getItem(LS_TEACHER_KEY) === 'true'
  );

  const isSynced = !!user && !user.isAnonymous;

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      setUser(firebaseUser);

      if (firebaseUser && !firebaseUser.isAnonymous) {
        // ── Signed in with Google ──────────────────────────────────────────
        try {
          const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileSnap.exists()) {
            const existing = profileSnap.data() as UserProfile;

            // Auto-sync Firestore profile → localStorage (cross-device magic)
            if (existing.name && existing.className) {
              localStorage.setItem(LS_PROFILE_KEY, JSON.stringify({
                name: existing.name,
                className: existing.className,
                school: existing.school || '',
                targetScore: (existing as any).targetScore || '',
              }));
              localStorage.setItem(LS_ROLE_KEY, 'student');
            }

            // ── Auto-enable teacher mode if Firestore says so ────────────
            if (existing.role === 'teacher') {
              localStorage.setItem(LS_TEACHER_KEY, 'true');
              setIsTeacherMode(true);
              localStorage.setItem(LS_ROLE_KEY, 'teacher');
            }

            setProfile(existing);
          } else {
            // New Google user — check if they have a local profile to migrate
            const localProfile = (() => {
              try { return JSON.parse(localStorage.getItem(LS_PROFILE_KEY) || '{}'); } catch { return {}; }
            })();
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: localProfile.name || firebaseUser.displayName || 'Học sinh',
              role: 'student',
              className: localProfile.className || '',
              school: localProfile.school || '',
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile);

            // Migrate all local attempts to Firestore in background
            syncService.migrateLocalToCloud(firebaseUser.uid).catch(() => {});
          }
        } catch (e) {
          console.warn('Could not sync from Firestore:', e);
          // Fallback to localhost profile
          const lp = (() => { try { return JSON.parse(localStorage.getItem(LS_PROFILE_KEY) || '{}'); } catch { return {}; } })();
          setProfile({ name: lp.name || firebaseUser.displayName || 'Học sinh', className: lp.className || '' });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => { clearTimeout(timeout); unsub(); };
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user') {
        console.warn('Google login error:', e?.code);
      }
    }
  };

  const loginWithTeacherCode = (code: string): boolean => {
    if (code.trim().toUpperCase() === TEACHER_CODE) {
      localStorage.setItem(LS_TEACHER_KEY, 'true');
      setIsTeacherMode(true);
      // If Google user is signed in → save teacher role to Firestore for cross-device sync
      const currentUser = auth.currentUser;
      if (currentUser && !currentUser.isAnonymous) {
        setDoc(doc(db, 'users', currentUser.uid), {
          role: 'teacher',
          uid: currentUser.uid,
          email: currentUser.email || '',
          name: currentUser.displayName || 'Giáo viên',
          className: 'teacher',
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => {});
      }
      return true;
    }
    return false;
  };

  const logoutTeacherMode = () => {
    localStorage.removeItem(LS_TEACHER_KEY);
    setIsTeacherMode(false);
  };

  const logout = async () => {
    logoutTeacherMode();
    localStorage.removeItem(LS_ROLE_KEY);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isTeacherMode, isSynced, login, logout, loginWithTeacherCode, logoutTeacherMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
