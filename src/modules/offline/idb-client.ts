"use client";

import { openDB, deleteDB, type DBSchema } from "idb";

export interface OfflineLessonBundle {
  lessonId: string;
  slug: string;
  titleVi: string;
  titleZh?: string | null;
  contentVersion: number;
  downloadedAt: string;
  bundleData: Record<string, unknown>;
}

export interface OfflineSyncQueueItem {
  clientMutationId: string;
  entityType: "flashcard_review" | "lesson_progress" | "exercise_attempt" | "study_session";
  operationType: string;
  clientTimestamp: string;
  payload: Record<string, unknown>;
  retryCount: number;
}

interface HanLearnOfflineSchema extends DBSchema {
  lesson_bundles: {
    key: string;
    value: OfflineLessonBundle;
  };
  flashcards: {
    key: string;
    value: Record<string, unknown> & { id: string };
  };
  sync_queue: {
    key: string;
    value: OfflineSyncQueueItem;
  };
  sync_meta: {
    key: string;
    value: { key: string; value: string };
  };
}

const DB_NAME = "hanlearn_offline_db";
const DB_VERSION = 1;

async function getOfflineDb() {
  return openDB<HanLearnOfflineSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("lesson_bundles")) {
        db.createObjectStore("lesson_bundles", { keyPath: "lessonId" });
      }
      if (!db.objectStoreNames.contains("flashcards")) {
        db.createObjectStore("flashcards", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sync_queue")) {
        db.createObjectStore("sync_queue", { keyPath: "clientMutationId" });
      }
      if (!db.objectStoreNames.contains("sync_meta")) {
        db.createObjectStore("sync_meta", { keyPath: "key" });
      }
    },
  });
}

export async function saveOfflineLessonBundle(bundle: OfflineLessonBundle) {
  const db = await getOfflineDb();
  await db.put("lesson_bundles", bundle);
}

export async function listOfflineLessonBundles(): Promise<OfflineLessonBundle[]> {
  const db = await getOfflineDb();
  return db.getAll("lesson_bundles");
}

export async function removeOfflineLessonBundle(lessonId: string) {
  const db = await getOfflineDb();
  await db.delete("lesson_bundles", lessonId);
}

export async function enqueueOfflineMutation(
  mutation: Omit<OfflineSyncQueueItem, "clientMutationId" | "clientTimestamp" | "retryCount">
) {
  const db = await getOfflineDb();
  const item: OfflineSyncQueueItem = {
    ...mutation,
    clientMutationId: crypto.randomUUID(),
    clientTimestamp: new Date().toISOString(),
    retryCount: 0,
  };
  await db.put("sync_queue", item);
  return item;
}

export async function getPendingSyncMutations(): Promise<OfflineSyncQueueItem[]> {
  const db = await getOfflineDb();
  return db.getAll("sync_queue");
}

export async function flushOfflineSyncQueue() {
  const db = await getOfflineDb();
  const queue = await db.getAll("sync_queue");
  if (queue.length === 0) {
    return { synced: 0, remaining: 0, syncedAt: new Date().toISOString() };
  }

  const res = await fetch("/api/v1/offline/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mutations: queue }),
  });

  if (!res.ok) {
    throw new Error(`Sync HTTP ${res.status}`);
  }

  const json = await res.json();
  const acks = (json?.data?.results ?? []) as Array<{
    clientMutationId: string;
    status: string;
  }>;

  let synced = 0;
  for (const ack of acks) {
    if (ack.status === "APPLIED" || ack.status === "CONFLICT_RESOLVED") {
      await db.delete("sync_queue", ack.clientMutationId);
      synced++;
    }
  }

  const syncedAt = json?.data?.syncedAt ?? new Date().toISOString();
  await db.put("sync_meta", { key: "lastSyncedAt", value: syncedAt });

  const remaining = (await db.getAll("sync_queue")).length;
  return { synced, remaining, syncedAt };
}

export async function getOfflineSyncMeta() {
  const db = await getOfflineDb();
  const last = await db.get("sync_meta", "lastSyncedAt");
  const queue = await db.getAll("sync_queue");
  const lessons = await db.getAll("lesson_bundles");
  return {
    lastSyncedAt: last?.value ?? null,
    pendingCount: queue.length,
    downloadedLessonsCount: lessons.length,
  };
}

/**
 * Security hygiene: never store auth tokens in IndexedDB, and clear offline
 * user study cache cleanly on sign-out.
 */
export async function clearOfflineDatabase() {
  await deleteDB(DB_NAME);
}
