/**
 * libraryService — manages Library items:
 *   - Video links stored in RTDB at /library_videos
 *   - Files (PDF/Word/PPT) uploaded to Cloudinary, metadata in RTDB at /library_files
 */
import { rtdb } from '../firebase';
import { ref as rtdbRef, push, onValue, remove } from 'firebase/database';

// ── Cloudinary config ─────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = 'dahaer5kb';
const CLOUDINARY_UPLOAD_PRESET = 'geo_uploads'; // unsigned preset

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

  // Teacher: upload file to Cloudinary + save metadata to RTDB
  async uploadFile(
    file: File,
    title: string,
    onProgress?: (pct: number) => void
  ): Promise<void> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const fileType = ['pdf'].includes(ext) ? 'pdf'
      : ['doc', 'docx'].includes(ext) ? 'word'
      : ['ppt', 'pptx'].includes(ext) ? 'ppt'
      : 'other';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', 'raw'); // for non-image files (PDF, Word, PPT)

    const fileUrl = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          onProgress?.(pct);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          resolve(res.secure_url);
        } else {
          reject(new Error(`Cloudinary upload failed: ${xhr.status} ${xhr.responseText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });

    await push(rtdbRef(rtdb, 'library_files'), {
      title: title || file.name,
      fileUrl,
      fileName: file.name,
      fileType,
      fileSize: file.size,
      storagePath: fileUrl, // store URL as storagePath for compatibility
      createdAt: new Date().toISOString(),
    });
  },

  // Teacher: delete file metadata from RTDB (Cloudinary file remains but won't be shown)
  async deleteFile(item: LibraryFile): Promise<void> {
    await remove(rtdbRef(rtdb, `library_files/${item.id}`));
  },
};

