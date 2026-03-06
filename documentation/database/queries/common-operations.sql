-- ============================================
-- Cafeteria Ordering System - Common Operations
-- ============================================
-- Frequently used queries with performance notes

-- ============================================
-- MENU BROWSING
-- ============================================

-- Get all available menu items grouped by category
-- Expected Performance: <50ms
-- Used in: Main menu screen
SELECT 
  mc.id AS category_id,
  mc.name AS category_name,
  mc.description AS category_description,
  json_agg(
    json_build_object(
      'id', mi.id,
      'name', mi.name,
      'description', mi.description,
      'price', mi.price,
      'image_url', mi.image_url,
      'allergens', mi.allergens,
      'prep_time_minutes', mi.prep_time_minutes
    ) ORDER BY mi.name
  ) AS items
FROM menu_categories mc
LEFT JOIN menu_items mi ON mc.id = mi.category_id AND mi.available = TRUE
WHERE mc.active = TRUE
GROUP BY mc.id, mc.name, mc.description, mc.display_order
ORDER BY mc.display_order;

-- Search menu items by name (fuzzy search)
-- Expected Performance: <100ms
-- Used in: Search functionality
SELECT 
  mi.id,
  mi.name,
  mi.description,
  mi.price,
  mc.name AS category,
  ts_rank(to_tsvector('english', mi.name || ' ' || COALESCE(mi.description, '')), 
          plainto_tsquery('english', 'chicken')) AS relevance
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.available = TRUE
AND to_tsvector('english', mi.name || ' ' || COALESCE(mi.description, '')) 
    @@ plainto_tsquery('english', 'chicken')
ORDER BY relevance DESC, mi.name
LIMIT 20;

-- ============================================
-- ORDER PLACEMENT
-- ============================================

-- Create new order with items (transaction)
-- Expected Performance: <100ms
-- Used in: Checkout process

BEGIN;

-- Insert order
INSERT INTO orders (user_id, status, total_amount, pickup_time, notes)
VALUES (
  'user-uuid-here',  -- Replace with actual user ID
  'placed',
  24.50,
  NOW() + INTERVAL '30 minutes',  -- Or NULL for ASAP
  'Extra napkins please'
)
RETURNING id, pickup_code;

-- Insert order items (using order ID from above)
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, special_instructions)
VALUES 
  ('order-uuid-here', (SELECT id FROM menu_items WHERE name = 'Cheeseburger'), 1, 9.00, 'No onions'),
  ('order-uuid-here', (SELECT id FROM menu_items WHERE name = 'French Fries'), 2, 3.50, NULL),
  ('order-uuid-here', (SELECT id FROM menu_items WHERE name = 'Latte'), 1, 4.00, 'Extra shot'),
  ('order-uuid-here', (SELECT id FROM menu_items WHERE name = 'Brownie'), 1, 3.50, NULL);

-- Insert payment record
INSERT INTO payments (order_id, amount, payment_method, status)
VALUES ('order-uuid-here', 24.50, 'credit_card', 'pending');

COMMIT;

-- ============================================
-- ORDER RETRIEVAL
-- ============================================

-- Get user's order history with pagination
-- Expected Performance: <100ms
-- Used in: Order history screen
SELECT 
  o.id,
  o.status,
  o.total_amount,
  o.pickup_code,
  o.created_at,
  o.completed_at,
  json_agg(
    json_build_object(
      'name', mi.name,
      'quantity', oi.quantity,
      'unit_price', oi.unit_price,
      'special_instructions', oi.special_instructions
    ) ORDER BY oi.created_at
  ) AS items
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.user_id = 'user-uuid-here'
ORDER BY o.created_at DESC
LIMIT 20 OFFSET 0;

-- Get specific order details
-- Expected Performance: <50ms
-- Used in: Order details screen
SELECT 
  o.id,
  o.status,
  o.total_amount,
  o.pickup_code,
  o.pickup_time,
  o.notes,
  o.created_at,
  o.updated_at,
  o.completed_at,
  p.full_name AS customer_name,
  json_agg(
    json_build_object(
      'item_id', mi.id,
      'item_name', mi.name,
      'quantity', oi.quantity,
      'unit_price', oi.unit_price,
      'subtotal', oi.quantity * oi.unit_price,
      'special_instructions', oi.special_instructions
    )
  ) AS items,
  (SELECT status FROM payments WHERE order_id = o.id) AS payment_status
FROM orders o
JOIN profiles p ON o.user_id = p.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.id = 'order-uuid-here'
GROUP BY o.id, p.full_name;

-- ============================================
-- ORDER MANAGEMENT (STAFF)
-- ============================================

-- Get active orders queue for staff dashboard
-- Expected Performance: <100ms
-- Used in: Staff order queue screen
SELECT 
  o.id,
  o.status,
  o.pickup_time,
  o.pickup_code,
  o.created_at,
  EXTRACT(EPOCH FROM (NOW() - o.created_at)) / 60 AS age_minutes,
  p.full_name AS customer_name,
  p.phone AS customer_phone,
  COUNT(oi.id) AS item_count,
  o.total_amount,
  o.notes
FROM orders o
JOIN profiles p ON o.user_id = p.user_id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status IN ('placed', 'confirmed', 'preparing', 'ready')
GROUP BY o.id, o.status, o.pickup_time, o.pickup_code, o.created_at, p.full_name, p.phone, o.total_amount, o.notes
ORDER BY 
  CASE o.status
    WHEN 'placed' THEN 1
    WHEN 'confirmed' THEN 2
    WHEN 'preparing' THEN 3
    WHEN 'ready' THEN 4
  END,
  o.created_at ASC;

-- Update order status (with audit trail via trigger)
-- Expected Performance: <50ms
-- Used in: Staff status update action
UPDATE orders
SET status = 'ready'
WHERE id = 'order-uuid-here'
AND status = 'preparing'
RETURNING id, status, pickup_code;

-- ============================================
-- PICKUP VERIFICATION
-- ============================================

-- Verify pickup code and get order details
-- Expected Performance: <50ms
-- Used in: Pickup verification
SELECT 
  o.id,
  o.user_id,
  o.status,
  o.pickup_code,
  p.full_name AS customer_name,
  o.total_amount,
  json_agg(
    json_build_object(
      'name', mi.name,
      'quantity', oi.quantity
    )
  ) AS items
FROM orders o
JOIN profiles p ON o.user_id = p.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.pickup_code = '1234'
AND o.status = 'ready'
GROUP BY o.id, p.full_name;

-- Complete order after pickup
-- Expected Performance: <50ms
UPDATE orders
SET status = 'completed',
    completed_at = NOW()
WHERE pickup_code = '1234'
AND status = 'ready'
RETURNING id, user_id;

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Get unread notifications for user
-- Expected Performance: <50ms
-- Used in: Notification bell/badge
SELECT 
  id,
  type,
  title,
  message,
  sent_at,
  order_id
FROM notifications
WHERE user_id = 'user-uuid-here'
AND read_at IS NULL
ORDER BY sent_at DESC
LIMIT 50;

-- Mark notifications as read
-- Expected Performance: <50ms
UPDATE notifications
SET read_at = NOW()
WHERE user_id = 'user-uuid-here'
AND id = ANY(ARRAY['notif-uuid-1', 'notif-uuid-2']::UUID[]);

-- ============================================
-- USER PROFILE
-- ============================================

-- Get user profile with order statistics
-- Expected Performance: <100ms
-- Used in: Profile screen
SELECT 
  p.full_name,
  p.student_id,
  p.phone,
  p.role,
  COUNT(o.id) AS total_orders,
  COUNT(o.id) FILTER (WHERE o.status = 'completed') AS completed_orders,
  COALESCE(SUM(o.total_amount) FILTER (WHERE o.status = 'completed'), 0) AS total_spent,
  MAX(o.created_at) AS last_order_date
FROM profiles p
LEFT JOIN orders o ON p.user_id = o.user_id
WHERE p.user_id = 'user-uuid-here'
GROUP BY p.user_id, p.full_name, p.student_id, p.phone, p.role;

-- ============================================
-- PERFORMANCE TESTING QUERIES
-- ============================================

-- Explain analyze for menu query
EXPLAIN ANALYZE
SELECT mi.id, mi.name, mi.price, mc.name AS category
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
WHERE mi.available = TRUE
ORDER BY mc.display_order, mi.name;

-- Explain analyze for order queue
EXPLAIN ANALYZE
SELECT o.id, o.status, o.created_at, p.full_name
FROM orders o
JOIN profiles p ON o.user_id = p.user_id
WHERE o.status IN ('placed', 'confirmed', 'preparing', 'ready')
ORDER BY o.created_at ASC;

-- ============================================
-- BULK OPERATIONS
-- ============================================

-- Cancel multiple orders (admin operation)
UPDATE orders
SET status = 'cancelled'
WHERE id = ANY(ARRAY['order-uuid-1', 'order-uuid-2']::UUID[])
AND status IN ('placed', 'confirmed')
RETURNING id, user_id, status;

-- Batch update menu item availability
UPDATE menu_items
SET available = FALSE
WHERE id = ANY(ARRAY['item-uuid-1', 'item-uuid-2']::UUID[])
RETURNING id, name, available;
