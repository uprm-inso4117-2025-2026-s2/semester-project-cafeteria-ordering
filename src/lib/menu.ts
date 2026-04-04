import { supabase } from './supabase';

export interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
  active: boolean;
}

export interface MenuItemData {
  id: string;
  category_id: string;
  name: string;
  price: number;
  image_url: string | null;
  available: boolean;
  allergens: string[] | null;
  prep_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export async function fetchMenuCategories(): Promise<MenuCategory[]> {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('id, name, display_order, active')
    .eq('active', true)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MenuCategory[];
}

export async function fetchAllMenuItems(): Promise<MenuItemData[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, category_id, name, price, image_url, available, allergens, prep_time_minutes, created_at, updated_at')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MenuItemData[];
}

export async function fetchMenuItemById(id: string): Promise<MenuItemData | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, category_id, name, price, image_url, available, allergens, prep_time_minutes, created_at, updated_at')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as MenuItemData | null;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

export interface CreateMenuItemInput {
  category_id: string;
  name: string;
  price: number;
  available?: boolean;
  allergens?: string[] | null;
  prep_time_minutes?: number | null;
  image_url?: string | null;
}

export async function createMenuItem(input: CreateMenuItemInput): Promise<MenuItemData> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      category_id: input.category_id,
      name: input.name.trim(),
      price: input.price,
      available: input.available ?? true,
      allergens: input.allergens ?? null,
      prep_time_minutes: input.prep_time_minutes ?? 10,
      image_url: input.image_url ?? null,
    })
    .select('id, category_id, name, price, image_url, available, allergens, prep_time_minutes, created_at, updated_at')
    .single();
  if (error) throw error;
  return data as MenuItemData;
}
