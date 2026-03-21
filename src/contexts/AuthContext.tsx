import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout: if Firebase takes too long, stop spinning and continue as guest
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 4000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      setUser(firebaseUser);
      if (firebaseUser && !firebaseUser.isAnonymous) {
        // Fetch or create profile for real (Google/Email) users
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            const existingProfile = profileDoc.data() as UserProfile;
            if (firebaseUser.email === 'binhanchau2000@gmail.com' && existingProfile.role !== 'teacher') {
              existingProfile.role = 'teacher';
              await setDoc(doc(db, 'users', firebaseUser.uid), existingProfile);
            }
            setProfile(existingProfile);
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Học sinh',
              role: firebaseUser.email === 'binhanchau2000@gmail.com' ? 'teacher' : 'student',
              className: '',
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile);
          }
        } catch (e) {
          console.warn('Could not load user profile from Firestore:', e);
          setProfile({ name: firebaseUser.displayName || 'Người dùng', className: '' });
        }
      } else {
        // Guest user — no auth needed, localStorage fallback handles storage
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  // Handle the result when returning from Google redirect
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      if (err?.code === 'auth/unauthorized-domain') {
        alert('Đăng nhập Google chưa được kích hoạt cho trang này (domain chưa được cấu hình). Bạn có thể tiếp tục dùng ứng dụng với tư cách khách.');
      } else {
        console.warn('Redirect login error:', err);
      }
    });
  }, []);


  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
