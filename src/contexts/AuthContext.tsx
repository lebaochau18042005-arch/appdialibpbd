import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';
import { syncService } from '../services/syncService';

const TEACHER_CODE = 'GEO2025VN';
const LS_TEACHER_KEY = 'geo_pro_teacher_mode';
const LS_PROFILE_KEY = 'examGeoProfile';
const LS_ROLE_KEY = 'examGeoRole';
const SUPER_ADMIN_EMAIL = 'lebaochau18042005@gmail.com';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isTeacherMode: boolean;
  isAdmin: boolean;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(
    () => localStorage.getItem(LS_TEACHER_KEY) === 'true'
  );

  const isSynced = !!user && !user.isAnonymous;

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      setUser(firebaseUser);

      if (firebaseUser) {
        if (!firebaseUser.isAnonymous) {
          // ── Signed in with Google ──────────────────────────────────────────
          try {
            const isSuperAdmin = firebaseUser.email === SUPER_ADMIN_EMAIL;
            setIsAdmin(isSuperAdmin);

            let hasTeacherAccess = isSuperAdmin;

            // Check if user is in approved_teachers
            if (!isSuperAdmin && firebaseUser.email) {
              const q = query(collection(db, 'approved_teachers'), where('email', '==', firebaseUser.email));
              const approvedSnap = await getDocs(q);
              if (!approvedSnap.empty) {
                hasTeacherAccess = true;
              }
            }

            if (hasTeacherAccess) {
              localStorage.setItem(LS_TEACHER_KEY, 'true');
              setIsTeacherMode(true);
              localStorage.setItem(LS_ROLE_KEY, 'teacher');
            } else {
              localStorage.removeItem(LS_TEACHER_KEY);
              setIsTeacherMode(false);
            }

            const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (profileSnap.exists()) {
              const existing = profileSnap.data() as UserProfile;

              // Auto-sync Firestore profile → localStorage
              if (existing.name && existing.className) {
                localStorage.setItem(LS_PROFILE_KEY, JSON.stringify({
                  name: existing.name,
                  className: existing.className,
                  school: existing.school || '',
                  targetScore: (existing as any).targetScore || '',
                }));
                if (!hasTeacherAccess) localStorage.setItem(LS_ROLE_KEY, 'student');
              }

              // Update role in DB if it changed
              if (hasTeacherAccess && existing.role !== 'teacher') {
                await setDoc(doc(db, 'users', firebaseUser.uid), { role: 'teacher' }, { merge: true });
                existing.role = 'teacher';
              } else if (!hasTeacherAccess && existing.role === 'teacher') {
                await setDoc(doc(db, 'users', firebaseUser.uid), { role: 'student' }, { merge: true });
                existing.role = 'student';
              }
              setProfile(existing);
            } else {
              // New Google user
              const localProfile = (() => {
                try { return JSON.parse(localStorage.getItem(LS_PROFILE_KEY) || '{}'); } catch { return {}; }
              })();
              const newProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: localProfile.name || firebaseUser.displayName || (hasTeacherAccess ? 'Giáo viên' : 'Học sinh'),
                role: hasTeacherAccess ? 'teacher' : 'student',
                className: hasTeacherAccess ? 'teacher' : (localProfile.className || ''),
                school: localProfile.school || '',
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
              setProfile(newProfile);

              // Migrate local attempts to Firestore in background
              syncService.migrateLocalToCloud(firebaseUser.uid).catch(() => { });
            }
          } catch (e) {
            console.warn('Could not sync from Firestore:', e);
            const lp = (() => { try { return JSON.parse(localStorage.getItem(LS_PROFILE_KEY) || '{}'); } catch { return {}; } })();
            setProfile({ name: lp.name || firebaseUser.displayName || 'Học sinh', className: lp.className || '' } as UserProfile);
          }
        } else {
          // ── Anonymous User ─────────────────────────────────────────────────
          const lp = (() => { try { return JSON.parse(localStorage.getItem(LS_PROFILE_KEY) || '{}'); } catch { return {}; } })();
          setProfile({ name: lp.name || 'Học sinh', className: lp.className || '' } as UserProfile);
          setIsAdmin(false);
          if (!localStorage.getItem(LS_TEACHER_KEY)) {
            setIsTeacherMode(false);
          }
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsTeacherMode(false);
        localStorage.removeItem(LS_TEACHER_KEY);
        // Automatically sign in anonymously
        signInAnonymously(auth).catch(e => console.error("Anonymous auth failed", e));
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
    // Keep it just in case, but prefer Gmail
    if (code.trim().toUpperCase() === TEACHER_CODE) {
      localStorage.setItem(LS_TEACHER_KEY, 'true');
      setIsTeacherMode(true);
      const currentUser = auth.currentUser;
      if (currentUser && !currentUser.isAnonymous) {
        setDoc(doc(db, 'users', currentUser.uid), {
          role: 'teacher',
          uid: currentUser.uid,
          email: currentUser.email || '',
          name: currentUser.displayName || 'Giáo viên',
          className: 'teacher',
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => { });
        // Automatically approve them since they have the code
        setDoc(doc(db, 'approved_teachers', currentUser.uid), {
          email: currentUser.email,
          approvedAt: new Date().toISOString()
        }).catch(() => { });
      }
      return true;
    }
    return false;
  };

  const logoutTeacherMode = () => {
    localStorage.removeItem(LS_TEACHER_KEY);
    setIsTeacherMode(false);
    setIsAdmin(false);
  };

  const logout = async () => {
    logoutTeacherMode();
    localStorage.removeItem(LS_ROLE_KEY);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isTeacherMode, isAdmin, isSynced, login, logout, loginWithTeacherCode, logoutTeacherMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
