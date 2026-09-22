import { CharacterId, CHARACTERS } from '../types.ts';

export interface HistoryVoiceItem {
  id: string;
  timestamp: number;
  formattedDate: string;
  character: CharacterId;
  characterName: string;
  script: string;
  audioBase64: string;
  mimeType: string;
  format: 'mp3' | 'wav';
}

const DB_NAME = 'PlayVearVoiceStudio';
const DB_VERSION = 1;
const STORE_NAME = 'voice_history';

/**
 * Open persistent IndexedDB storage on the device
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this device'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Format timestamp into human-readable date & time
 */
export function formatHistoryTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

/**
 * Save a newly generated voice to the device local storage
 */
export async function saveVoiceToDevice(params: {
  character: CharacterId;
  script: string;
  audioBase64: string;
  mimeType?: string;
  format?: 'mp3' | 'wav';
}): Promise<HistoryVoiceItem> {
  const timestamp = Date.now();
  const characterObj = CHARACTERS.find((c) => c.id === params.character);
  const characterName = characterObj ? characterObj.name : params.character;

  const newItem: HistoryVoiceItem = {
    id: `voice_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp,
    formattedDate: formatHistoryTimestamp(timestamp),
    character: params.character,
    characterName,
    script: params.script,
    audioBase64: params.audioBase64,
    mimeType: params.mimeType || 'audio/mpeg',
    format: params.format || 'mp3',
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(newItem);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => resolve();
    });
  } catch (err) {
    console.warn('IndexedDB write failed, falling back to localStorage metadata:', err);
    // Fallback: store in localStorage (trim audioBase64 if too large to avoid quota error)
    try {
      const raw = localStorage.getItem('playvear_voice_history') || '[]';
      const list = JSON.parse(raw);
      list.unshift(newItem);
      // Keep last 15 items in fallback
      localStorage.setItem('playvear_voice_history', JSON.stringify(list.slice(0, 15)));
    } catch (e) {
      console.error('Fallback localStorage failed:', e);
    }
  }

  return newItem;
}

/**
 * Retrieve all saved voices from device storage, sorted newest first
 */
export async function getAllVoicesFromDevice(): Promise<HistoryVoiceItem[]> {
  try {
    const db = await openDB();
    return await new Promise<HistoryVoiceItem[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const items = (req.result as HistoryVoiceItem[]) || [];
        // Sort descending by timestamp
        items.sort((a, b) => b.timestamp - a.timestamp);
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read failed, trying localStorage fallback:', err);
    try {
      const raw = localStorage.getItem('playvear_voice_history');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed reading fallback localStorage:', e);
    }
    return [];
  }
}

/**
 * Delete a specific voice from device local storage
 */
export async function deleteVoiceFromDevice(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => resolve();
    });
  } catch (err) {
    console.warn('IndexedDB delete failed, updating localStorage fallback:', err);
  }

  // Also clean up fallback if present
  try {
    const raw = localStorage.getItem('playvear_voice_history');
    if (raw) {
      const list: HistoryVoiceItem[] = JSON.parse(raw);
      const filtered = list.filter((item) => item.id !== id);
      localStorage.setItem('playvear_voice_history', JSON.stringify(filtered));
    }
  } catch {
    // Ignore fallback errors
  }
}

/**
 * Clear all voice history from device local storage
 */
export async function clearAllVoicesFromDevice(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => resolve();
    });
  } catch (err) {
    console.warn('IndexedDB clear failed:', err);
  }

  try {
    localStorage.removeItem('playvear_voice_history');
  } catch {
    // Ignore fallback errors
  }
}

/**
 * Trigger download of voice MP3 directly into device Downloads storage
 */
export function downloadVoiceMP3(item: HistoryVoiceItem): void {
  try {
    const byteCharacters = atob(item.audioBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: item.mimeType || 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    const safeDate = new Date(item.timestamp).toISOString().slice(0, 10);
    const fileName = `PlayVear-${item.characterName.toLowerCase()}-${safeDate}-${item.id.slice(-4)}.mp3`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (err) {
    console.error('Failed downloading MP3 from history item:', err);
  }
}
