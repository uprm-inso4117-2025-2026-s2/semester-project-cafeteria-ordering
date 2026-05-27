import { supabase } from '@/lib/supabase'; // adjust path to your supabase client
import { IngredientItem, MenuItem, MenuItemRow } from '@/models/food-item-class';

export async function fetchMenuItems(): Promise<MenuItem[]> {
  // Fetch all menu item rows
  const { data: rows, error: rowsError } = await supabase
    .from('menu_items')
    .select('*');

  console.log("Raw supa row:", JSON.stringify(rows?.[0], null, 2));

  if (rowsError) throw rowsError;
  if (!rows || rows.length === 0) return [];

  // For each item, fetch its ingredients via the relationship table
  const menuItems = await Promise.all(
    (rows as MenuItemRow[]).map(async (row) => {
      const { data: relRows, error: relError } = await supabase
        .from('menu_items_ingredients_relationship')
        .select('ingredients_table(*)')
        .eq('menu_item_id', row.id);

      if (relError) {
        console.warn(`Failed to fetch ingredients for item ${row.id}:`, relError);
        return MenuItem.fromDatabaseRow(row, []);
      }

      const ingredients: IngredientItem[] = (relRows ?? []).map(
        (r: any) => r.ingredients_table
      );

      return MenuItem.fromDatabaseRow(row, ingredients);
    })
  );

  return menuItems;
}

export async function fetchMenuItemById(id: string): Promise<MenuItem | undefined> {
  const { data: row, error: rowError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single();

  if (rowError || !row) {
    console.warn(`Failed to fetch menu item ${id}:`, rowError);
    return undefined;
  }

  const { data: relRows, error: relError } = await supabase
    .from('menu_items_ingredients_relationship')
    .select('ingredients_table(*)')
    .eq('menu_item_id', id);

  if (relError) {
    console.warn(`Failed to fetch ingredients for item ${id}:`, relError);
    return MenuItem.fromDatabaseRow(row as MenuItemRow, []);
  }

  const ingredients: IngredientItem[] = (relRows ?? []).map(
    (r: any) => r.ingredients_table
  );

  return MenuItem.fromDatabaseRow(row as MenuItemRow, ingredients);
}