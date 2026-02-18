-- ============================================
-- Cafeteria Ordering System - Performance Indexes
-- ============================================
-- Indexes for optimizing query performance
-- Target: <50ms for simple queries, <200ms for complex queries
-- Expected load: 500+ concurrent users during peak hours

-- ============================================
-- PROFILES TABLE INDEXES
-- ============================================

-- Index on user_id for fast profile lookups by auth user
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
  ON profiles(user_id);

-- Index on student_id for university ID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_student_id 
  ON profiles(student_id) 
  WHERE student_id IS NOT NULL;

-- Index on role for filtering staff/admin users
CREATE INDEX IF NOT EXISTS idx_profiles_role 
  ON profiles(role);

COMMENT ON INDEX idx_profiles_user_id IS 'Fast lookup of profile by Supabase auth user ID';
COMMENT ON INDEX idx_profiles_student_id IS 'Lookup by university student ID (partial index)';
COMMENT ON INDEX idx_profiles_role IS 'Filter users by role (student, staff, admin)';

-- ============================================
-- MENU MANAGEMENT INDEXES
-- ============================================

-- Composite index for displaying active categories in order
CREATE INDEX IF NOT EXISTS idx_menu_categories_active_order 
  ON menu_categories(active, display_order);

COMMENT ON INDEX idx_menu_categories_active_order IS 'Efficiently fetch active categories in display order';

-- Index on category_id for joining menu items to categories
CREATE INDEX IF NOT EXISTS idx_menu_items_category 
  ON menu_items(category_id);

-- Composite index for fetching available items by category
CREATE INDEX IF NOT EXISTS idx_menu_items_available_category 
  ON menu_items(available, category_id) 
  WHERE available = TRUE;

-- GIN index for full-text search on menu item names
CREATE INDEX IF NOT EXISTS idx_menu_items_name_search 
  ON menu_items USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

COMMENT ON INDEX idx_menu_items_category IS 'Join menu items to their categories';
COMMENT ON INDEX idx_menu_items_available_category IS 'Fast fetch of available items per category (partial index)';
COMMENT ON INDEX idx_menu_items_name_search IS 'Full-text search on item names and descriptions';

-- ============================================
-- ORDERS TABLE INDEXES
-- ============================================

-- Index on user_id for user's order history
CREATE INDEX IF NOT EXISTS idx_orders_user_id 
  ON orders(user_id);

-- Index on status for filtering orders by current state
CREATE INDEX IF NOT EXISTS idx_orders_status 
  ON orders(status);

-- Composite index for user's orders by status (most common query)
CREATE INDEX IF NOT EXISTS idx_orders_user_status 
  ON orders(user_id, status);

-- Index on created_at for chronological order history (DESC for recent first)
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON orders(created_at DESC);

-- Composite index for staff order queue (active orders sorted by time)
CREATE INDEX IF NOT EXISTS idx_orders_status_created 
  ON orders(status, created_at) 
  WHERE status IN ('placed', 'confirmed', 'preparing', 'ready');

-- Index on pickup_time for scheduled order management
CREATE INDEX IF NOT EXISTS idx_orders_pickup_time 
  ON orders(pickup_time) 
  WHERE pickup_time IS NOT NULL;

-- Unique index on pickup_code for verification
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_pickup_code 
  ON orders(pickup_code);

COMMENT ON INDEX idx_orders_user_id IS 'Fetch all orders for a specific user';
COMMENT ON INDEX idx_orders_status IS 'Filter orders by status (preparing, ready, etc.)';
COMMENT ON INDEX idx_orders_user_status IS 'Most common: user viewing their active/past orders';
COMMENT ON INDEX idx_orders_created_at IS 'Order history sorted by recency';
COMMENT ON INDEX idx_orders_status_created IS 'Staff dashboard: active orders in chronological order';
COMMENT ON INDEX idx_orders_pickup_time IS 'Scheduled orders management (partial index)';
COMMENT ON INDEX idx_orders_pickup_code IS 'Fast pickup code verification';

-- ============================================
-- ORDER ITEMS TABLE INDEXES
-- ============================================

-- Index on order_id for fetching all items in an order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
  ON order_items(order_id);

-- Index on menu_item_id for analytics (popular items)
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id 
  ON order_items(menu_item_id);

-- Composite index for order item details with menu info
CREATE INDEX IF NOT EXISTS idx_order_items_order_menu 
  ON order_items(order_id, menu_item_id);

COMMENT ON INDEX idx_order_items_order_id IS 'Fetch all items for an order (JOIN optimization)';
COMMENT ON INDEX idx_order_items_menu_item_id IS 'Analytics: which items are most popular';
COMMENT ON INDEX idx_order_items_order_menu IS 'Composite for order details queries';

-- ============================================
-- ORDER STATUS HISTORY INDEXES
-- ============================================

-- Index on order_id for audit trail lookup
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id 
  ON order_status_history(order_id);

-- Index on changed_at for temporal queries
CREATE INDEX IF NOT EXISTS idx_order_status_history_changed_at 
  ON order_status_history(changed_at DESC);

-- Composite index for order audit trail sorted by time
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_time 
  ON order_status_history(order_id, changed_at DESC);

COMMENT ON INDEX idx_order_status_history_order_id IS 'Fetch status history for an order';
COMMENT ON INDEX idx_order_status_history_changed_at IS 'Recent status changes across all orders';
COMMENT ON INDEX idx_order_status_history_order_time IS 'Order audit trail in chronological order';

-- ============================================
-- PAYMENTS TABLE INDEXES
-- ============================================

-- Index on order_id (already unique, but explicit for performance)
CREATE INDEX IF NOT EXISTS idx_payments_order_id 
  ON payments(order_id);

-- Index on status for filtering payment states
CREATE INDEX IF NOT EXISTS idx_payments_status 
  ON payments(status);

-- Index on provider_transaction_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_payments_provider_txn 
  ON payments(provider_transaction_id) 
  WHERE provider_transaction_id IS NOT NULL;

COMMENT ON INDEX idx_payments_order_id IS 'Lookup payment by order ID';
COMMENT ON INDEX idx_payments_status IS 'Filter payments by status (pending, completed, etc.)';
COMMENT ON INDEX idx_payments_provider_txn IS 'Payment provider webhook lookups (partial index)';

-- ============================================
-- NOTIFICATIONS TABLE INDEXES
-- ============================================

-- Index on user_id for fetching user's notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
  ON notifications(user_id);

-- Composite index for unread notifications (common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, sent_at DESC) 
  WHERE read_at IS NULL;

-- Index on order_id for order-specific notifications
CREATE INDEX IF NOT EXISTS idx_notifications_order_id 
  ON notifications(order_id) 
  WHERE order_id IS NOT NULL;

-- Index on sent_at for chronological sorting
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at 
  ON notifications(sent_at DESC);

COMMENT ON INDEX idx_notifications_user_id IS 'Fetch all notifications for a user';
COMMENT ON INDEX idx_notifications_user_unread IS 'Most common: unread notifications for user';
COMMENT ON INDEX idx_notifications_order_id IS 'Notifications related to specific order';
COMMENT ON INDEX idx_notifications_sent_at IS 'Recent notifications across system';

-- ============================================
-- PUSH NOTIFICATION TOKENS INDEXES
-- ============================================

-- Index on user_id for user's registered devices
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id 
  ON push_notification_tokens(user_id);

-- Unique index on token for fast token lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_tokens_token 
  ON push_notification_tokens(token);

COMMENT ON INDEX idx_push_tokens_user_id IS 'Find all devices registered for a user';
COMMENT ON INDEX idx_push_tokens_token IS 'Fast lookup by device token';

-- ============================================
-- CAFETERIA SETTINGS INDEXES
-- ============================================

-- Unique index on key for settings lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_cafeteria_settings_key 
  ON cafeteria_settings(key);

COMMENT ON INDEX idx_cafeteria_settings_key IS 'Fast lookup of configuration values by key';

-- ============================================
-- INDEX MAINTENANCE NOTES
-- ============================================

-- Monitor index usage with:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan;

-- Identify missing indexes with:
-- SELECT schemaname, tablename, attname, n_distinct, correlation
-- FROM pg_stats
-- WHERE schemaname = 'public'
-- ORDER BY n_distinct DESC;

-- Rebuild indexes if needed:
-- REINDEX TABLE orders;
-- REINDEX TABLE order_items;

-- Analyze tables for query planner statistics:
-- ANALYZE profiles;
-- ANALYZE menu_items;
-- ANALYZE orders;
-- ANALYZE order_items;
