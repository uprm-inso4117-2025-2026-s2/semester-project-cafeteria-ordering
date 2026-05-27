// src/cache/profileCache.ts
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getProfileByUserId, updateProfileName, updateProfilePhone } from "../lib/profiles"
import { CACHE_KEYS } from "./cacheKeys"

export async function getCachedProfile(userId: string) {
  try {
    const fresh = await getProfileByUserId(userId)
    if (fresh) {
      await AsyncStorage.setItem(CACHE_KEYS.PROFILE_INFO, JSON.stringify({
        name: fresh.full_name ?? "",
        email: "",         // email comes from Supabase auth, not profiles table
        phone: fresh.phone ?? "",
      }))
      return fresh
    }
  } catch {
    // offline — fall back to cache
    const cached = await AsyncStorage.getItem(CACHE_KEYS.PROFILE_INFO)
    if (cached) return JSON.parse(cached)
  }
  return null
}

export async function updateCachedProfileName(userId: string, fullName: string) {
  // write to cache immediately
  const cached = await AsyncStorage.getItem(CACHE_KEYS.PROFILE_INFO)
  const current = cached ? JSON.parse(cached) : {}
  await AsyncStorage.setItem(CACHE_KEYS.PROFILE_INFO, JSON.stringify({
    ...current,
    name: fullName,
  }))

  // attempt live write — if offline, syncQueue handles it
  try {
    return await updateProfileName(userId, fullName)
  } catch {
    return null  // syncQueue will retry
  }
}

export async function updateCachedProfilePhone(userId: string, phone: string) {
  const cached = await AsyncStorage.getItem(CACHE_KEYS.PROFILE_INFO)
  const current = cached ? JSON.parse(cached) : {}
  await AsyncStorage.setItem(CACHE_KEYS.PROFILE_INFO, JSON.stringify({
    ...current,
    phone,
  }))

  try {
    return await updateProfilePhone(userId, phone)
  } catch {
    return null
  }
}