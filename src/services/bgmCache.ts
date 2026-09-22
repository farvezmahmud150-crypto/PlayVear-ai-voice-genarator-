/**
 * Service for caching Background Music tracks in local browser storage (Cache API & IndexedDB)
 * When a user plays a track once, it gets cached locally so subsequent plays are instant and offline-ready.
 */

import { generateNatureSoundBlob } from '../utils/natureSynth.ts';

const CACHE_NAME = 'playvear-bgm-cache-v5';
const CACHED_IDS_STORAGE_KEY = 'playvear_cached_bgm_ids';

// Track active Object URLs to revoke them when no longer needed
const activeObjectUrls = new Map<string, string>();

/**
 * Get all cached BGM track IDs from localStorage
 */
export function getCachedTrackIds(): Set<string> {
  try {
    const raw = localStorage.getItem(CACHED_IDS_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/**
 * Save cached track ID
 */
function recordCachedTrackId(id: string) {
  try {
    const current = getCachedTrackIds();
    current.add(id);
    localStorage.setItem(CACHED_IDS_STORAGE_KEY, JSON.stringify(Array.from(current)));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Check if Cache API is available in the current environment
 */
function isCacheApiAvailable(): boolean {
  return typeof window !== 'undefined' && 'caches' in window;
}

/**
 * Get the cache request key for a track
 */
function getCacheKey(trackId: string): string {
  return `/bgm-offline-cache/${encodeURIComponent(trackId)}.mp3`;
}

/**
 * Check if a specific track is cached in local storage
 */
export async function isTrackCached(trackId: string): Promise<boolean> {
  const localSet = getCachedTrackIds();
  if (localSet.has(trackId)) return true;

  if (!isCacheApiAvailable()) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(getCacheKey(trackId));
    if (match) {
      recordCachedTrackId(trackId);
      return true;
    }
  } catch (err) {
    console.warn('Error checking cache:', err);
  }
  return false;
}

/**
 * Fetches the audio file, caches it in browser local storage, and returns an Object URL
 */
export async function cacheAndGetAudioUrl(
  trackId: string,
  audioUrl: string,
  onProgress?: (progress: number) => void
): Promise<{ objectUrl: string; wasCached: boolean; blob: Blob }> {
  // 1. Check if we already have an active Object URL in memory
  if (activeObjectUrls.has(trackId)) {
    const existingUrl = activeObjectUrls.get(trackId)!;
    // Verify it's still valid by retrieving blob if possible
    if (isCacheApiAvailable()) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const match = await cache.match(getCacheKey(trackId));
        if (match) {
          const blob = await match.blob();
          return { objectUrl: existingUrl, wasCached: true, blob };
        }
      } catch {
        // Continue to fresh fetch if error
      }
    }
  }

  // 2. Check if it's already in Cache API
  if (isCacheApiAvailable()) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(getCacheKey(trackId));
      if (match) {
        const blob = await match.blob();
        const objectUrl = URL.createObjectURL(blob);
        activeObjectUrls.set(trackId, objectUrl);
        recordCachedTrackId(trackId);
        return { objectUrl, wasCached: true, blob };
      }
    } catch (err) {
      console.warn('Cache match failed, falling back to network fetch:', err);
    }
  }

  // 3. Not in cache yet -> Generate or Download
  let blob: Blob;
  if (audioUrl.startsWith('synth:')) {
    blob = await generateNatureSoundBlob(trackId, 120);
  } else {
    const streamProxyUrl = `/api/bgm-stream?url=${encodeURIComponent(audioUrl)}`;
    const response = await fetch(streamProxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio stream (Status: ${response.status})`);
    }
    blob = await response.blob();
  }

  const objectUrl = URL.createObjectURL(blob);
  activeObjectUrls.set(trackId, objectUrl);

  // Store in Cache API asynchronously
  if (isCacheApiAvailable()) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cacheResponse = new Response(blob, {
        headers: {
          'Content-Type': blob.type || 'audio/mpeg',
          'Content-Length': blob.size.toString(),
          'X-PlayVear-Cached-At': new Date().toISOString(),
        },
      });
      await cache.put(getCacheKey(trackId), cacheResponse);
      recordCachedTrackId(trackId);
    } catch (err) {
      console.warn('Failed to put audio into Cache API:', err);
    }
  }

  return { objectUrl, wasCached: false, blob };
}

/**
 * Get direct Blob for downloading
 */
export async function getTrackBlob(trackId: string, audioUrl: string): Promise<Blob> {
  if (isCacheApiAvailable()) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(getCacheKey(trackId));
      if (match) {
        return await match.blob();
      }
    } catch {
      // Ignore and fetch fresh
    }
  }

  // Fetch via synth or stream proxy
  let blob: Blob;
  if (audioUrl.startsWith('synth:')) {
    blob = await generateNatureSoundBlob(trackId, 120);
  } else {
    const streamProxyUrl = `/api/bgm-stream?url=${encodeURIComponent(audioUrl)}&download=1`;
    const response = await fetch(streamProxyUrl);
    if (!response.ok) {
      throw new Error('Download failed from stream endpoint');
    }
    blob = await response.blob();
  }

  // Also cache it
  if (isCacheApiAvailable()) {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(
        getCacheKey(trackId),
        new Response(blob, {
          headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': blob.size.toString() },
        })
      );
      recordCachedTrackId(trackId);
    } catch {
      // Ignore
    }
  }

  return blob;
}

/**
 * Clear all cached audio files
 */
export async function clearAllCachedBgm(): Promise<void> {
  if (isCacheApiAvailable()) {
    try {
      await caches.delete(CACHE_NAME);
    } catch {
      // Ignore
    }
  }
  localStorage.removeItem(CACHED_IDS_STORAGE_KEY);
  activeObjectUrls.clear();
}
