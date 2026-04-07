export interface Profile {
  id?: string
  user_id: string
  student_id?: string
  full_name?: string
  phone?: string
  role?: string
  expo_push_token?: string
  created_at?: string
  updated_at?: string
}

async function resolveClient(client?: any) {
  if (client) return client;
  const { supabase } = await import("./supabase");
  return supabase;
}

//Create a new profile
export async function createProfile(profile: Profile, client?: any) {
  const supabase = await resolveClient(client)
  const { data, error } = await supabase.from("profiles").insert([profile]).select().single()
  if (error) {
    throw new Error(`Error creating profile: ${error.message}`)
  }
  return data
}

//Use the user_id to find a profile
export async function getProfileByUserId(userId: string, client?: any) {
  const supabase = await resolveClient(client)
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle()
  if (error) {
    throw new Error(`Error finding profile: ${error.message}`)
  }
  return data
}

//Update the name of a profile
export async function updateProfileName(userId: string, fullName: string, client?: any) {
  const supabase = await resolveClient(client)
  const { data, error } = await supabase.from("profiles").update({ full_name: fullName }).eq("user_id", userId).select().single()
  if (error) {
    throw new Error(`Error updating name: ${error.message}`)
  }
  return data
}

//Update the phone of a profile
export async function updateProfilePhone(userId: string, phone: string, client?: any) {
  const supabase = await resolveClient(client)
  const { data, error } = await supabase.from("profiles").update({ phone: phone }).eq("user_id", userId).select().single()
  if (error) {
    throw new Error(`Error updating phone: ${error.message}`)
  }
  return data
}

//Delete a profile
export async function deleteProfile(userId: string, client?: any) {
  const supabase = await resolveClient(client)
  const { error } = await supabase.from("profiles").delete().eq("user_id", userId)
  if (error) {
    throw new Error(`Error deleting profile: ${error.message}`)
  }
  return { success: true }
}
