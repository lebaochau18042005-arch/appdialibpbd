/**
 * libraryService — manages Library items:
 *   - Video links stored in RTDB at /library_videos
 *   - Files (PDF/Word/PPT) uploaded to Firebase Storage, metadata in RTDB at /library_files
 */
import { rtdb, storage } from '../firebase';
import { ref as rtdbRef, push, onValue, remove, set } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export interface LibraryVideo {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string;
  createdAt: string;
}

export interface LibraryFile {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileType: string; // 'pdf' | 'word' | 'ppt'
  fileSize: number;
  storagePath: string;
  createdAt: string;
}

// ── Videos ────────────────────────────────────────────────────────────────────
export const libraryService = {
  // Subscribe to all videos
  subscribeToVideos(callback: (items: LibraryVideo[]) => void): () => void {
    const ref = rtdbRef(rtdb, 'library_videos');
    const unsub = onValue(ref, (snap) => {
      if (!snap.exists()) { callback([]); return; }
      const items: LibraryVideo[] = [];
      snap.forEach((child) => {
        items.push({ id: child.key!, ...child.val() });
      });
      callback(items.reverse()); // newest first
    }, () => callback([]));
    return () => unsub();
  },

  // Teacher: add video link
  async addVideo(title: string, url: string, description: string, tags: string): Promise<void> {
    await push(rtdbRef(rtdb, 'library_videos'), {
      title, url, description, tags,
      createdAt: new Date().toISOString(),
    });
  },

  // Teacher: delete video
  async deleteVideo(id: string): Promise<void> {
    await remove(rtdbRef(rtdb, `library_videos/${id}`));
  },

  // ── Files ───────────────────────────────────────────────────────────────────
  // Subscribe to all files
  subscribeToFiles(callback: (items: LibraryFile[]) => void): () => void {
    const ref = rtdbRef(rtdb, 'library_files');
    const unsub = onValue(ref, (snap) => {
      if (!snap.exists()) { callback([]); return; }
      const items: LibraryFile[] = [];
      snap.forEach((child) => {
        items.push({ id: child.key!, ...child.val() });
      });
      callback(items.reverse());
    }, () => callback([]));
    return () => unsub();
  },

  // Teacher: upload file to Storage + save metadata to RTDB
  async uploadFile(
    file: File,
    title: string,
    onProgress?: (pct: number) => void
  ): Promise<void> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const ts = Date.now();
    const storagePath = `library_files/${ts}_${file.name}`;
    const sRef = storageRef(storage, storagePath);

    await new Promise<void>((resolve, reject) => {
      const task = uploadBytesResumable(sRef, file);
      task.on('state_changed',
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress?.(pct);
        },
        reject,
        async () => {
          const fileUrl = await getDownloadURL(task.snapshot.ref);
          const fileType = ['pdf'].includes(ext) ? 'pdf'
            : ['doc', 'docx'].includes(ext) ? 'word'
            : ['ppt', 'pptx'].includes(ext) ? 'ppt'
            : 'other';
          await push(rtdbRef(rtdb, 'library_files'), {
            title: title || file.name,
            fileUrl,
            fileName: file.name,
            fileType,
            fileSize: file.size,
            storagePath,
            createdAt: new Date().toISOString(),
          });
          resolve();
        }
      );
    });
  },

  // Teacher: delete file from Storage + RTDB
  async deleteFile(item: LibraryFile): Promise<void> {
    try {
      await deleteObject(storageRef(storage, item.storagePath));
    } catch (_) {
      // May already be deleted
    }
    await remove(rtdbRef(rtdb, `library_files/${item.id}`));
  },
};
