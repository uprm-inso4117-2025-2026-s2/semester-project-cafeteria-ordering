// src/sync/syncManager.ts
import { AppState, AppStateStatus } from "react-native"
import { flushSyncQueue } from "./syncQueue"

let listener: ReturnType<typeof AppState.addEventListener> | null = null

export function startSyncManager() {
  if (listener) return  // prevent duplicate listeners

  listener = AppState.addEventListener("change", (state: AppStateStatus) => {
    if (state === "active") {
      flushSyncQueue()
    }
  })
}

export function stopSyncManager() {
  listener?.remove()
  listener = null
}