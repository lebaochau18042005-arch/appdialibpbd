import { db } from '../firebase';
import {
  doc, setDoc, collection, onSnapshot,
  query, orderBy, where, limit, serverTimestamp, Timestamp, getDoc, deleteDoc
} from 'firebase/firestore';

export interface StudentSession {
  sessionId: string;
  name: string;
  className: string;
  school?: string;
  lastSeen: any; // Firestore Timestamp
  isOnline: boolean;
}

export interface LiveAlert {
  className: string;  // 'all' or specific class
  message: string;
  active: boolean;
  createdAt: any;
}

const ONLINE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes = online

export const sessionService = {

  // ─── Student: send heartbeat on login & every 2 min ──────────────────────

  async heartbeat(studentInfo: { name: string; className: string; school?: string }) {
    if (!studentInfo.name || !studentInfo.className) return;
    const sessionId = `${studentInfo.className}_${studentInfo.name.replace(/\s+/g, '_')}`;
    try {
      await setDoc(doc(db, 'sessions', sessionId), {
        sessionId,
        name: studentInfo.name,
        className: studentInfo.className,
        school: studentInfo.school || '',
        lastSeen: serverTimestamp(),
        isOnline: true,
      }, { merge: true });
    } catch (e) {
      console.warn('sessionService.heartbeat failed:', e);
    }
  },

  // ─── Teacher: subscribe to all online sessions ────────────────────────────

  subscribeToSessions(callback: (sessions: StudentSession[]) => void): () => void {
    const q = query(
      collection(db, 'sessions'),
      orderBy('lastSeen', 'desc'),
      limit(200)
    );
    return onSnapshot(q, (snap) => {
      const sessions: StudentSession[] = snap.docs.map(d => {
        const data = d.data() as StudentSession;
        // Calculate isOnline based on lastSeen timestamp
        const lastSeenMs = data.lastSeen instanceof Timestamp
          ? data.lastSeen.toMillis()
          : Date.now();
        const isOnline = Date.now() - lastSeenMs < ONLINE_THRESHOLD_MS;
        return { ...data, isOnline };
      });
      callback(sessions);
    }, (err) => {
      console.warn('sessionService.subscribeToSessions error:', err);
    });
  },

  // ─── Teacher: send live alert to a class ─────────────────────────────────

  async sendLiveAlert(className: string, message: string) {
    const key = className === 'all' ? 'all' : className;
    await setDoc(doc(db, 'live_alerts', key), {
      className,
      message,
      active: true,
      createdAt: serverTimestamp(),
    });
  },

  async clearLiveAlert(className: string) {
    try {
      await deleteDoc(doc(db, 'live_alerts', className === 'all' ? 'all' : className));
    } catch {}
  },

  // ─── Student: subscribe to live alerts for their class ───────────────────

  subscribeToAlerts(
    className: string,
    callback: (alert: LiveAlert | null) => void
  ): () => void {
    // Check class-specific alert AND 'all' alert
    const classRef = doc(db, 'live_alerts', className);
    const allRef = doc(db, 'live_alerts', 'all');

    let latest: LiveAlert | null = null;
    let classAlert: LiveAlert | null = null;
    let allAlert: LiveAlert | null = null;

    const notify = () => {
      latest = classAlert || allAlert || null;
      callback(latest);
    };

    const unsub1 = onSnapshot(classRef, snap => {
      classAlert = snap.exists() ? (snap.data() as LiveAlert) : null;
      notify();
    });
    const unsub2 = onSnapshot(allRef, snap => {
      allAlert = snap.exists() ? (snap.data() as LiveAlert) : null;
      notify();
    });

    return () => { unsub1(); unsub2(); };
  },

  // ─── Format time helpers ──────────────────────────────────────────────────

  formatLastSeen(lastSeen: any): string {
    if (!lastSeen) return 'Chưa xác định';
    const ms = lastSeen instanceof Timestamp ? lastSeen.toMillis() : Date.now();
    const diff = Date.now() - ms;
    if (diff < 60_000) return 'Vừa vào';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} phút trước`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} giờ trước`;
    return `${Math.floor(diff / 86_400_000)} ngày trước`;
  },
};
