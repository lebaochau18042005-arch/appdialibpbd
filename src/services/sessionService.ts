import { rtdb } from '../firebase';
import {
  ref, set, onValue, off, serverTimestamp, remove, get
} from 'firebase/database';

export interface StudentSession {
  sessionId: string;
  name: string;
  className: string;
  school?: string;
  lastSeen: number; // Unix ms timestamp
  isOnline: boolean;
}

export interface LiveAlert {
  className: string;
  message: string;
  active: boolean;
  createdAt: number;
}

const ONLINE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes

export const sessionService = {

  // ─── Student: heartbeat on login & every 2 min ───────────────────────────

  async heartbeat(studentInfo: { name: string; className: string; school?: string }) {
    if (!studentInfo.name || !studentInfo.className) return;
    const sessionId = `${studentInfo.className}__${studentInfo.name.replace(/\s+/g, '_')}`;
    try {
      await set(ref(rtdb, `sessions/${sessionId}`), {
        sessionId,
        name: studentInfo.name,
        className: studentInfo.className,
        school: studentInfo.school || '',
        lastSeen: Date.now(),
        isOnline: true,
      });
    } catch (e) {
      console.warn('sessionService.heartbeat failed:', e);
    }
  },

  // ─── Teacher: subscribe to all sessions ──────────────────────────────────

  subscribeToSessions(callback: (sessions: StudentSession[]) => void): () => void {
    const sessionsRef = ref(rtdb, 'sessions');
    const handler = (snap: any) => {
      if (!snap.exists()) { callback([]); return; }
      const sessions: StudentSession[] = [];
      snap.forEach((child: any) => {
        const data = child.val() as StudentSession;
        const isOnline = Date.now() - (data.lastSeen || 0) < ONLINE_THRESHOLD_MS;
        sessions.push({ ...data, isOnline });
      });
      // Sort: online first, then by lastSeen desc
      sessions.sort((a, b) => {
        if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
        return (b.lastSeen || 0) - (a.lastSeen || 0);
      });
      callback(sessions);
    };
    onValue(sessionsRef, handler);
    return () => off(sessionsRef, 'value', handler);
  },

  // ─── Teacher: send live alert ─────────────────────────────────────────────

  async sendLiveAlert(className: string, message: string) {
    const key = className === 'all' ? 'all' : className.replace(/[.#$[\]]/g, '_');
    await set(ref(rtdb, `live_alerts/${key}`), {
      className,
      message,
      active: true,
      createdAt: Date.now(),
    });
  },

  async clearLiveAlert(className: string) {
    const key = className === 'all' ? 'all' : className.replace(/[.#$[\]]/g, '_');
    try { await remove(ref(rtdb, `live_alerts/${key}`)); } catch {}
  },

  // ─── Student: subscribe to alerts for their class ────────────────────────

  subscribeToAlerts(
    className: string,
    callback: (alert: LiveAlert | null) => void
  ): () => void {
    const classKey = className.replace(/[.#$[\]]/g, '_');
    const classRef = ref(rtdb, `live_alerts/${classKey}`);
    const allRef = ref(rtdb, 'live_alerts/all');

    let classAlert: LiveAlert | null = null;
    let allAlert: LiveAlert | null = null;

    const notify = () => callback(classAlert || allAlert || null);

    const h1 = (snap: any) => { classAlert = snap.exists() ? snap.val() : null; notify(); };
    const h2 = (snap: any) => { allAlert = snap.exists() ? snap.val() : null; notify(); };

    onValue(classRef, h1);
    onValue(allRef, h2);

    return () => { off(classRef, 'value', h1); off(allRef, 'value', h2); };
  },

  // ─── Format time helper ───────────────────────────────────────────────────

  formatLastSeen(lastSeen: number | undefined): string {
    if (!lastSeen) return 'Chưa xác định';
    const diff = Date.now() - lastSeen;
    if (diff < 60_000) return 'Vừa vào';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} phút trước`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} giờ trước`;
    return `${Math.floor(diff / 86_400_000)} ngày trước`;
  },
};
