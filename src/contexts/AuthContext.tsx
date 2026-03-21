import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // Auto sign in anonymously so Firestore writes always have a valid uid
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error('Anonymous sign-in failed:', e);
          setLoading(false);
        }
        return; // onAuthStateChanged will fire again once anonymous user is set
      }

      setUser(firebaseUser);
      if (!firebaseUser.isAnonymous) {
        // Fetch or create profile for real (non-anonymous) users
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
      } else {
        // Anonymous user - set a basic guest profile
        setProfile({
          name: 'Khách',
          className: '',
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
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
