-- ============================================
-- Cafeteria Ordering System - Database Functions
-- ============================================
-- Helper functions for business logic and calculations

-- ============================================
-- PICKUP CODE GENERATION
-- ============================================

-- Generate a unique 4-digit pickup code
CREATE OR REPLACE FUNCTION generate_pickup_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 4-digit code (0000-9999)
    new_code := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if code already exists in active orders
    SELECT EXISTS (
      SELECT 1 FROM orders 
      WHERE pickup_code = new_code 
      AND status NOT IN ('completed', 'cancelled')
    ) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_pickup_code() IS 
  'Generates a unique 4-digit pickup code for order verification';

-- ============================================
-- ORDER CALCULATIONS
-- ============================================

-- Calculate total amount for an order based on its items
CREATE OR REPLACE FUNCTION calculate_order_total(p_order_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(quantity * unit_price), 0)
  INTO total
  FROM order_items
  WHERE order_id = p_order_id;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_order_total(UUID) IS 
  'Calculates total amount for an order by summing all order items';

-- ============================================
-- ROLE CHECKING
-- ============================================

-- Check if a user is staff (for RLS policies)
CREATE OR REPLACE FUNCTION is_staff(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE user_id = p_user_id;
  
  RETURN user_role IN ('staff', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_staff(UUID) IS 
  'Returns true if user is staff or admin (used in RLS policies)';

-- Check if a user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE user_id = p_user_id;
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin(UUID) IS 
  'Returns true if user is admin (used in RLS policies)';

-- ============================================
-- ORDER VALIDATION
-- ============================================

-- Verify pickup code matches order and return order details
CREATE OR REPLACE FUNCTION verify_pickup_code(p_pickup_code TEXT)
RETURNS TABLE (
  order_id UUID,
  user_id UUID,
  status TEXT,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.status::TEXT,
    o.total_amount,
    o.created_at
  FROM orders o
  WHERE o.pickup_code = p_pickup_code
  AND o.status = 'ready';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION verify_pickup_code(TEXT) IS 
  'Verifies pickup code and returns order details if order is ready';

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

-- Get peak hours statistics for a date range
CREATE OR REPLACE FUNCTION get_peak_hours_stats(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  hour_of_day INT,
  order_count BIGINT,
  total_revenue DECIMAL(10,2),
  avg_order_value DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM created_at)::INT AS hour_of_day,
    COUNT(*)::BIGINT AS order_count,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS avg_order_value
  FROM orders
  WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date
  AND status NOT IN ('cancelled')
  GROUP BY EXTRACT(HOUR FROM created_at)
  ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_peak_hours_stats(DATE, DATE) IS 
  'Returns order statistics grouped by hour for a date range';

-- Get popular menu items ranking
CREATE OR REPLACE FUNCTION get_popular_items(
  p_start_date DATE,
  p_end_date DATE,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  menu_item_id UUID,
  item_name TEXT,
  category_name TEXT,
  times_ordered BIGINT,
  total_quantity BIGINT,
  total_revenue DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mi.id AS menu_item_id,
    mi.name AS item_name,
    mc.name AS category_name,
    COUNT(DISTINCT oi.order_id)::BIGINT AS times_ordered,
    SUM(oi.quantity)::BIGINT AS total_quantity,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
  FROM order_items oi
  JOIN menu_items mi ON oi.menu_item_id = mi.id
  JOIN menu_categories mc ON mi.category_id = mc.id
  JOIN orders o ON oi.order_id = o.id
  WHERE DATE(o.created_at) BETWEEN p_start_date AND p_end_date
  AND o.status NOT IN ('cancelled')
  GROUP BY mi.id, mi.name, mc.name
  ORDER BY total_quantity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_popular_items(DATE, DATE, INT) IS 
  'Returns top menu items by order frequency and revenue for date range';

-- Calculate average preparation time
CREATE OR REPLACE FUNCTION get_avg_prep_time(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  avg_prep_minutes DECIMAL(10,2),
  median_prep_minutes DECIMAL(10,2),
  min_prep_minutes INT,
  max_prep_minutes INT,
  total_orders BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH prep_times AS (
    SELECT 
      EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 AS prep_minutes
    FROM orders
    WHERE status = 'completed'
    AND DATE(created_at) BETWEEN p_start_date AND p_end_date
  )
  SELECT 
    AVG(prep_minutes)::DECIMAL(10,2),
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY prep_minutes)::DECIMAL(10,2),
    MIN(prep_minutes)::INT,
    MAX(prep_minutes)::INT,
    COUNT(*)::BIGINT
  FROM prep_times;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_avg_prep_time(DATE, DATE) IS 
  'Calculates preparation time statistics for completed orders';

-- ============================================
-- USER ACTIVITY FUNCTIONS
-- ============================================

-- Get user order statistics
CREATE OR REPLACE FUNCTION get_user_order_stats(p_user_id UUID)
RETURNS TABLE (
  total_orders BIGINT,
  completed_orders BIGINT,
  cancelled_orders BIGINT,
  total_spent DECIMAL(10,2),
  avg_order_value DECIMAL(10,2),
  favorite_item TEXT,
  last_order_date TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      COUNT(*) AS total_orders,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed_orders,
      COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,
      COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) AS total_spent,
      AVG(total_amount) FILTER (WHERE status = 'completed') AS avg_order_value,
      MAX(created_at) AS last_order_date
    FROM orders
    WHERE user_id = p_user_id
  ),
  favorite AS (
    SELECT mi.name
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE o.user_id = p_user_id
    AND o.status = 'completed'
    GROUP BY mi.id, mi.name
    ORDER BY SUM(oi.quantity) DESC
    LIMIT 1
  )
  SELECT 
    us.total_orders::BIGINT,
    us.completed_orders::BIGINT,
    us.cancelled_orders::BIGINT,
    us.total_spent,
    us.avg_order_value,
    f.name,
    us.last_order_date
  FROM user_stats us
  CROSS JOIN favorite f;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_order_stats(UUID) IS 
  'Returns comprehensive order statistics for a specific user';

-- ============================================
-- NOTIFICATION HELPERS
-- ============================================

-- Mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  rows_updated INT;
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Mark all unread notifications
    UPDATE notifications
    SET read_at = NOW()
    WHERE user_id = p_user_id
    AND read_at IS NULL;
  ELSE
    -- Mark specific notifications
    UPDATE notifications
    SET read_at = NOW()
    WHERE user_id = p_user_id
    AND id = ANY(p_notification_ids)
    AND read_at IS NULL;
  END IF;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION mark_notifications_read(UUID, UUID[]) IS 
  'Marks notifications as read for a user (all or specific IDs)';
