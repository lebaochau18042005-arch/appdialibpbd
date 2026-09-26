import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { syncService } from '../services/syncService';

const TEACHER_CODE = 'GEO2025VN';
const LS_TEACHER_KEY = 'geo_pro_teacher_mode';
const LS_PROFILE_KEY = 'examGeoProfile';
const LS_ROLE_KEY = 'examGeoRole';
const SUPER_ADMIN_EMAIL = 'lebaochau18042005@gmail.com';

interface AuthContextType {
  user: { uid: string; email: string | null; displayName: string | null; isAnonymous: boolean } | null;
  profile: UserProfile | null;
  loading: boolean;
  isTeacherMode: boolean;
  isAdmin: boolean;
  isSynced: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithTeacherCode: (code: string) => boolean;
  logoutTeacherMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { openSignIn, signOut: clerkSignOut } = useClerk();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(
    () => localStorage.getItem(LS_TEACHER_KEY) === 'true'
  );

  // Map Clerk user to a simple shape the rest of the app uses
  const user = clerkUser
    ? {
      uid: clerkUser.id,
      isAnonymous: false,
      email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
      displayName: clerkUser.fullName ?? clerkUser.firstName ?? null,
    }
    : null;

  const isSynced = !!user;

  useEffect(() => {
    if (!clerkLoaded) return;

    const run = async () => {
      if (!clerkUser) {
        // Not signed in
        setProfile(null);
        setIsAdmin(false);
        setIsTeacherMode(false);
        localStorage.removeItem(LS_TEACHER_KEY);
        setLoading(false);
        return;
      }

      const email = clerkUser.primaryEmailAddress?.emailAddress ?? '';
      const uid = clerkUser.id;

      try {
        const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
        setIsAdmin(isSuperAdmin);

        // Check publicMetadata set by admin in Clerk dashboard
        const meta = clerkUser.publicMetadata as Record<string, unknown>;
        const isApprovedTeacher =
          isSuperAdmin ||
          meta?.role === 'teacher' ||
          meta?.approved === true;

        if (isApprovedTeacher) {
          localStorage.setItem(LS_TEACHER_KEY, 'true');
          setIsTeacherMode(true);
          localStorage.setItem(LS_ROLE_KEY, 'teacher');
        } else {
          localStorage.removeItem(LS_TEACHER_KEY);
          setIsTeacherMode(false);
        }

        // Sync Firestore profile
        const profileSnap = await getDoc(doc(db, 'users', uid));
        if (profileSnap.exists()) {
          const existing = profileSnap.data() as UserProfile;
          if (existing.name && existing.className) {
            localStorage.setItem(LS_PROFILE_KEY, JSON.stringify({
              name: existing.name,
              className: existing.className,
              school: existing.school || '',
            }));
            if (!isApprovedTeacher) localStorage.setItem(LS_ROLE_KEY, 'student');
          }
          setProfile(existing);
        } else {
          const localProfile = (() => {
            try { return JSON.parse(localStorage.getItem(LS_PROFILE_KEY) || '{}'); } catch { return {}; }
          })();
          const newProfile: UserProfile = {
            uid,
            email,
            name: localProfile.name || clerkUser.fullName || (isApprovedTeacher ? 'Giáo viên' : 'Học sinh'),
            role: isApprovedTeacher ? 'teacher' : 'student',
            className: isApprovedTeacher ? 'teacher' : (localProfile.className || ''),
            school: localProfile.school || '',
          };
          await setDoc(doc(db, 'users', uid), newProfile);
          setProfile(newProfile);
          syncService.migrateLocalToCloud(uid).catch(() => { });
        }
      } catch (e) {
        console.warn('Firestore sync error:', e);
        const lp = (() => { try { return JSON.parse(localStorage.getItem(LS_PROFILE_KEY) || '{}'); } catch { return {}; } })();
        setProfile({ name: lp.name || 'Học sinh', className: lp.className || '' } as UserProfile);
      }

      setLoading(false);
    };

    run();
  }, [clerkLoaded, clerkUser]);

  const login = async () => {
    openSignIn({ redirectUrl: window.location.href });
  };

  const loginWithTeacherCode = (code: string): boolean => {
    if (code.trim().toUpperCase() === TEACHER_CODE) {
      localStorage.setItem(LS_TEACHER_KEY, 'true');
      setIsTeacherMode(true);
      if (user) {
        setDoc(doc(db, 'users', user.uid), {
          role: 'teacher',
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || 'Giáo viên',
          className: 'teacher',
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => { });
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
    await clerkSignOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading: loading || !clerkLoaded, isTeacherMode, isAdmin, isSynced, login, logout, loginWithTeacherCode, logoutTeacherMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
