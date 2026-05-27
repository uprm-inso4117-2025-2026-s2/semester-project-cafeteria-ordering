// src/sync/conflictDetector.ts
export function detectConflict(local: unknown, remote: unknown): boolean {
  const conflict = JSON.stringify(local) !== JSON.stringify(remote)
  if (conflict) {
    console.warn("[ConflictDetector] Local and remote state differ", { local, remote })
    // TODO: implement resolution strategy in future issue
  }
  return conflict
}