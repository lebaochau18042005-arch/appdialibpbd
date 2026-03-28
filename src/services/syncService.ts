import { db } from '../firebase';
import {
  doc, getDoc, setDoc, collection, addDoc,
  query, where, getDocs, updateDoc, orderBy, limit
} from 'firebase/firestore';

const LS_PROFILE_KEY = 'examGeoProfile';
const LS_ATTEMPTS_KEY = 'geo_pro_local_attempts';

export interface SyncProfile {
  name: string;
  className: string;
  school?: string;
  targetScore?: string;
  updatedAt: string;
}

export const syncService = {

  // ─── Profile ──────────────────────────────────────────────────────────────

  async saveProfile(uid: string, profile: SyncProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), {
        ...profile,
        uid,
        role: 'student',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('syncService.saveProfile failed:', e);
    }
  },

  async loadProfile(uid: string): Promise<SyncProfile | null> {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const d = snap.data() as any;
        if (d.name && d.className) {
          // Persist to localStorage as cache
          localStorage.setItem(LS_PROFILE_KEY, JSON.stringify({
            name: d.name, className: d.className, school: d.school || '', targetScore: d.targetScore || ''
          }));
          return d as SyncProfile;
        }
      }
    } catch (e) {
      console.warn('syncService.loadProfile failed:', e);
    }
    return null;
  },

  // ─── Attempts ─────────────────────────────────────────────────────────────

  async saveAttempt(uid: string, attempt: any): Promise<void> {
    try {
      const docRef = doc(db, 'attempts', `${uid}_${attempt.id || Date.now()}`);
      await setDoc(docRef, { ...attempt, uid, syncedAt: new Date().toISOString() });
    } catch (e) {
      console.warn('syncService.saveAttempt failed:', e);
    }
  },

  async loadAttempts(uid: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'attempts'),
        where('uid', '==', uid),
        orderBy('date', 'desc'),
        limit(100)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (e) {
      console.warn('syncService.loadAttempts failed:', e);
      return [];
    }
  },

  // ─── Migrate local data → Firestore ───────────────────────────────────────

  async migrateLocalToCloud(uid: string): Promise<void> {
    // Migrate profile
    const localProfile = (() => {
      try { return JSON.parse(localStorage.getItem(LS_PROFILE_KEY) || '{}'); } catch { return {}; }
    })();
    if (localProfile.name && localProfile.className) {
      await this.saveProfile(uid, { ...localProfile, updatedAt: new Date().toISOString() });
    }

    // Migrate attempts
    const localAttempts: any[] = (() => {
      try { return JSON.parse(localStorage.getItem(LS_ATTEMPTS_KEY) || '[]'); } catch { return []; }
    })();
    for (const attempt of localAttempts) {
      await this.saveAttempt(uid, attempt);
    }
    console.log(`syncService: migrated ${localAttempts.length} attempts to Firestore for uid=${uid}`);
  },

  // ─── Teacher comment update ────────────────────────────────────────────────

  async updateAttemptComment(attemptId: string, comment: string, progress: string): Promise<void> {
    // The attemptId in Firestore may use uid_localId format — try both
    try {
      await updateDoc(doc(db, 'attempts', attemptId), {
        teacherComment: comment,
        studentProgress: progress,
        commentedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('syncService.updateAttemptComment failed:', e);
    }
  },
};
