import { supabase } from "./supabase";

export interface EditProfileData {
  full_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  avatar_url?: string;
}

/**
 * Update profile basic info
 */
export async function updateProfile(userId: string, updates: EditProfileData) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: updates.full_name,
      username: updates.username,
      email: updates.email,
      phone: updates.phone,
      avatar_url: updates.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating profile: ${error.message}`);
  }

  return data;
}

/**
 * Update user email (auth)
 */
export async function updateEmail(email: string) {
  const { data, error } = await supabase.auth.updateUser({
    email,
  });

  if (error) {
    throw new Error(`Error updating email: ${error.message}`);
  }

  return data;
}

/**
 * Update user password (auth)
 */
export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new Error(`Error updating password: ${error.message}`);
  }

  return data;
}

/**
 * Upload profile image to Supabase Storage
 */
export async function uploadProfileImage(userId: string, file: Blob | File) {
  const filePath = `avatars/${userId}-${Date.now()}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) {
    throw new Error(`Error uploading image: ${error.message}`);
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Simple validation (optional but useful)
 */
export function validateProfile(data: EditProfileData) {
  if (!data.full_name || data.full_name.trim() === "") {
    throw new Error("Full name is required");
  }

  if (!data.email || !data.email.includes("@")) {
    throw new Error("Valid email is required");
  }

  return true;
}