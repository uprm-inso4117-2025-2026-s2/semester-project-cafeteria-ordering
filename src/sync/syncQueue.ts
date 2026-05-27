// src/sync/syncQueue.ts
import AsyncStorage from "@react-native-async-storage/async-storage"
import { updateProfileName, updateProfilePhone } from "../lib/profiles"
import { CACHE_KEYS } from "../cache/cacheKeys"

export type SyncOperation = {
  id: string
  type: "updateName" | "updatePhone"
  userId: string
  payload: string
  timestamp: number
}

export async function enqueue(op: Omit<SyncOperation, "id" | "timestamp">) {
  const raw = await AsyncStorage.getItem(CACHE_KEYS.SYNC_QUEUE)
  const queue: SyncOperation[] = raw ? JSON.parse(raw) : []
  queue.push({ ...op, id: Math.random().toString(36).slice(2), timestamp: Date.now() })
  await AsyncStorage.setItem(CACHE_KEYS.SYNC_QUEUE, JSON.stringify(queue))
}

export async function flushSyncQueue() {
  const raw = await AsyncStorage.getItem(CACHE_KEYS.SYNC_QUEUE)
  if (!raw) return

  const queue: SyncOperation[] = JSON.parse(raw)
  const remaining: SyncOperation[] = []

  for (const op of queue) {
    try {
      if (op.type === "updateName") await updateProfileName(op.userId, op.payload)
      if (op.type === "updatePhone") await updateProfilePhone(op.userId, op.payload)
      // success — do not add back to remaining
    } catch {
      remaining.push(op)  // still offline — keep in queue
    }
  }

  await AsyncStorage.setItem(CACHE_KEYS.SYNC_QUEUE, JSON.stringify(remaining))
}