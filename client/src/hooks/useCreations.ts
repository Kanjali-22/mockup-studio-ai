import { useState, useEffect, useCallback } from 'react';
import type { Creation } from '../types';

const DB_NAME = 'mockup-studio-db';
const DB_VERSION = 1;
const STORE_NAME = 'creations';
const MAX_CREATIONS = 50; // Keep reasonable limit

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCreation(creation: Omit<Creation, 'id' | 'createdAt'>): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const fullCreation: Creation = {
      ...creation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    store.add(fullCreation);

    // Trim to MAX_CREATIONS
    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result > MAX_CREATIONS) {
        const index = store.index('createdAt');
        const cursorReq = index.openCursor(null, 'next');
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor && countReq.result > MAX_CREATIONS) {
            cursor.delete();
          }
        };
      }
    };

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    db.close();
  } catch (err) {
    console.warn('Failed to save creation to IndexedDB:', err);
  }
}

export async function getAllCreations(): Promise<Creation[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('createdAt');

    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => {
        const results = (request.result as Creation[]).reverse(); // newest first
        db.close();
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function deleteCreation(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.warn('Failed to delete creation:', err);
  }
}

export function useCreations() {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const all = await getAllCreations();
    setCreations(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = useCallback(
    async (id: string) => {
      await deleteCreation(id);
      setCreations((prev) => prev.filter((c) => c.id !== id));
    },
    []
  );

  return { creations, loading, refresh, remove };
}
