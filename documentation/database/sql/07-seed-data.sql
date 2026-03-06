-- ============================================
-- Cafeteria Ordering System - Seed Data
-- ============================================
-- Test data for development and testing
-- WARNING: Do NOT use in production with real user data

-- ============================================
-- MENU CATEGORIES
-- ============================================

INSERT INTO menu_categories (id, name, description, display_order, active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Beverages', 'Hot and cold drinks', 1, TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Entrees', 'Main dishes and meals', 2, TRUE),
  ('33333333-3333-3333-3333-333333333333', 'Sides', 'Side dishes and accompaniments', 3, TRUE),
  ('44444444-4444-4444-4444-444444444444', 'Desserts', 'Sweet treats and desserts', 4, TRUE),
  ('55555555-5555-5555-5555-555555555555', 'Snacks', 'Quick bites and snacks', 5, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MENU ITEMS - BEVERAGES
-- ============================================

INSERT INTO menu_items (id, category_id, name, description, price, available, allergens, prep_time_minutes) VALUES
  -- Beverages
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Coffee', 'Freshly brewed coffee', 2.50, TRUE, NULL, 2),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Latte', 'Espresso with steamed milk', 4.00, TRUE, ARRAY['dairy'], 3),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Cappuccino', 'Espresso with foamed milk', 4.00, TRUE, ARRAY['dairy'], 3),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Iced Tea', 'Cold brewed tea', 2.00, TRUE, NULL, 1),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Orange Juice', 'Fresh squeezed orange juice', 3.50, TRUE, NULL, 2),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Smoothie - Berry Blast', 'Mixed berries smoothie', 5.50, TRUE, ARRAY['dairy'], 4),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Hot Chocolate', 'Rich hot chocolate', 3.50, TRUE, ARRAY['dairy'], 3),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Water Bottle', 'Bottled water 16oz', 1.50, TRUE, NULL, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MENU ITEMS - ENTREES
-- ============================================

INSERT INTO menu_items (id, category_id, name, description, price, available, allergens, prep_time_minutes) VALUES
  -- Entrees
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Hamburger', 'Classic beef burger with lettuce and tomato', 8.50, TRUE, ARRAY['gluten', 'dairy'], 12),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Cheeseburger', 'Beef burger with cheese', 9.00, TRUE, ARRAY['gluten', 'dairy'], 12),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Grilled Chicken Sandwich', 'Grilled chicken breast with mayo', 8.00, TRUE, ARRAY['gluten', 'dairy'], 10),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Veggie Burger', 'Plant-based patty with veggies', 8.50, TRUE, ARRAY['gluten', 'soy'], 10),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Caesar Salad', 'Romaine lettuce with caesar dressing', 7.50, TRUE, ARRAY['dairy', 'fish'], 5),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Chicken Caesar Wrap', 'Grilled chicken caesar in tortilla', 9.50, TRUE, ARRAY['gluten', 'dairy'], 8),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Pizza Slice - Pepperoni', 'Pepperoni pizza slice', 4.50, TRUE, ARRAY['gluten', 'dairy'], 6),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Pizza Slice - Cheese', 'Classic cheese pizza slice', 4.00, TRUE, ARRAY['gluten', 'dairy'], 6),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Pasta Alfredo', 'Fettuccine with creamy alfredo sauce', 10.00, TRUE, ARRAY['gluten', 'dairy'], 15),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Tacos (3)', 'Three soft tacos with beef or chicken', 8.00, TRUE, ARRAY['gluten', 'dairy'], 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MENU ITEMS - SIDES
-- ============================================

INSERT INTO menu_items (id, category_id, name, description, price, available, allergens, prep_time_minutes) VALUES
  -- Sides
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'French Fries', 'Crispy golden fries', 3.50, TRUE, NULL, 8),
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'Sweet Potato Fries', 'Crispy sweet potato fries', 4.00, TRUE, NULL, 8),
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'Onion Rings', 'Beer-battered onion rings', 4.50, TRUE, ARRAY['gluten'], 10),
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'Side Salad', 'Mixed greens with dressing', 3.00, TRUE, NULL, 3),
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'Coleslaw', 'Creamy coleslaw', 2.50, TRUE, ARRAY['dairy'], 2),
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'Fruit Cup', 'Fresh seasonal fruit', 3.50, TRUE, NULL, 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MENU ITEMS - DESSERTS
-- ============================================

INSERT INTO menu_items (id, category_id, name, description, price, available, allergens, prep_time_minutes) VALUES
  -- Desserts
  (uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 'Chocolate Chip Cookie', 'Warm chocolate chip cookie', 2.50, TRUE, ARRAY['gluten', 'dairy'], 2),
  (uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 'Brownie', 'Fudgy chocolate brownie', 3.50, TRUE, ARRAY['gluten', 'dairy', 'eggs'], 2),
  (uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 'Ice Cream Cup', 'Vanilla or chocolate ice cream', 3.00, TRUE, ARRAY['dairy'], 2),
  (uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 'Apple Pie Slice', 'Classic apple pie', 4.00, TRUE, ARRAY['gluten'], 3),
  (uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 'Cheesecake Slice', 'New York style cheesecake', 5.00, TRUE, ARRAY['gluten', 'dairy', 'eggs'], 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MENU ITEMS - SNACKS
-- ============================================

INSERT INTO menu_items (id, category_id, name, description, price, available, allergens, prep_time_minutes) VALUES
  -- Snacks
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 'Chips - Regular', 'Potato chips', 2.00, TRUE, NULL, 1),
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 'Chips - BBQ', 'BBQ flavored chips', 2.00, TRUE, NULL, 1),
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 'Pretzels', 'Salted pretzels', 2.50, TRUE, ARRAY['gluten'], 1),
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 'Granola Bar', 'Healthy granola bar', 2.50, TRUE, ARRAY['nuts'], 1),
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 'Trail Mix', 'Mixed nuts and dried fruit', 3.00, TRUE, ARRAY['nuts'], 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TEST USER PROFILES
-- ============================================
-- Note: These profiles should be created AFTER auth.users are created
-- In practice, users will sign up through Supabase Auth

-- Sample student user IDs (replace with actual UUIDs after user creation)
-- INSERT INTO profiles (user_id, student_id, full_name, phone, role) VALUES
--   ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'S12345', 'John Student', '787-555-0001', 'student'),
--   ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'S12346', 'Jane Doe', '787-555-0002', 'student'),
--   ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'S12347', 'Mike Smith', '787-555-0003', 'student'),
--   ('dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, 'Maria Garcia', '787-555-0100', 'staff'),
--   ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, 'Admin User', '787-555-0200', 'admin')
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- SAMPLE ORDERS (for testing)
-- ============================================
-- Note: Replace user_ids with actual authenticated user IDs

-- Sample completed order
-- INSERT INTO orders (id, user_id, status, total_amount, pickup_code, created_at, completed_at) VALUES
--   ('f0000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'completed', 15.50, '1234', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour')
-- ON CONFLICT (id) DO NOTHING;

-- Sample order items for above order
-- INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES
--   ('f0000000-0000-0000-0000-000000000001', (SELECT id FROM menu_items WHERE name = 'Cheeseburger' LIMIT 1), 1, 9.00),
--   ('f0000000-0000-0000-0000-000000000001', (SELECT id FROM menu_items WHERE name = 'French Fries' LIMIT 1), 1, 3.50),
--   ('f0000000-0000-0000-0000-000000000001', (SELECT id FROM menu_items WHERE name = 'Coffee' LIMIT 1), 1, 2.50)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DATA VERIFICATION QUERIES
-- ============================================

-- Count menu items by category
SELECT 
  mc.name AS category,
  COUNT(mi.id) AS item_count,
  AVG(mi.price) AS avg_price
FROM menu_categories mc
LEFT JOIN menu_items mi ON mc.id = mi.category_id
GROUP BY mc.name, mc.display_order
ORDER BY mc.display_order;

-- List all available menu items
SELECT 
  mc.name AS category,
  mi.name AS item,
  mi.price,
  mi.allergens
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.available = TRUE
ORDER BY mc.display_order, mi.name;

-- ============================================
-- SEED DATA NOTES
-- ============================================
-- This seed data provides a realistic menu for testing the application.
-- Prices are in USD and represent typical cafeteria pricing.
-- 
-- To reset seed data:
-- 1. Delete all order-related data first (order_items, orders, payments)
-- 2. Delete menu items
-- 3. Delete menu categories
-- 4. Re-run this script
--
-- For production deployment:
-- - Remove all test user profiles
-- - Remove sample orders and order items
-- - Keep only menu categories and menu items (customize as needed)
-- - Update prices and descriptions to match actual cafeteria menu
