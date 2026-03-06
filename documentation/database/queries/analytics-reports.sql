-- ============================================
-- Cafeteria Ordering System - Analytics Reports
-- ============================================
-- Business intelligence and reporting queries

-- ============================================
-- PEAK HOURS ANALYSIS
-- ============================================

-- Order volume by hour of day (last 7 days)
-- Expected Performance: <200ms
-- Used in: Admin dashboard, staffing decisions
SELECT 
  EXTRACT(HOUR FROM created_at) AS hour_of_day,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_revenue,
  AVG(total_amount) AS avg_order_value,
  COUNT(DISTINCT user_id) AS unique_customers
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
AND status != 'cancelled'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour_of_day;

-- Peak hours detailed breakdown (last 30 days)
-- Shows busiest times for capacity planning
SELECT 
  EXTRACT(DOW FROM created_at) AS day_of_week, -- 0=Sunday, 6=Saturday
  EXTRACT(HOUR FROM created_at) AS hour_of_day,
  COUNT(*) AS order_count,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60) AS avg_prep_time_minutes
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
AND status = 'completed'
GROUP BY EXTRACT(DOW FROM created_at), EXTRACT(HOUR FROM created_at)
ORDER BY order_count DESC
LIMIT 20;

-- ============================================
-- POPULAR ITEMS ANALYSIS
-- ============================================

-- Top 20 menu items by order frequency
-- Expected Performance: <200ms
-- Used in: Inventory planning, menu optimization
SELECT 
  mi.id,
  mi.name,
  mc.name AS category,
  COUNT(DISTINCT oi.order_id) AS times_ordered,
  SUM(oi.quantity) AS total_quantity,
  SUM(oi.quantity * oi.unit_price) AS total_revenue,
  AVG(oi.unit_price) AS avg_price,
  mi.price AS current_price
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
JOIN menu_categories mc ON mi.category_id = mc.id
JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
AND o.status != 'cancelled'
GROUP BY mi.id, mi.name, mc.name, mi.price
ORDER BY total_quantity DESC
LIMIT 20;

-- Item performance by category
SELECT 
  mc.name AS category,
  COUNT(DISTINCT mi.id) AS total_items,
  COUNT(DISTINCT oi.order_id) AS orders_containing_category,
  SUM(oi.quantity) AS total_items_sold,
  SUM(oi.quantity * oi.unit_price) AS category_revenue,
  AVG(oi.unit_price) AS avg_item_price
FROM menu_categories mc
JOIN menu_items mi ON mc.id = mi.category_id
LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days' OR o.id IS NULL
GROUP BY mc.id, mc.name, mc.display_order
ORDER BY mc.display_order;

-- Slow-moving items (candidates for removal)
SELECT 
  mi.id,
  mi.name,
  mc.name AS category,
  mi.price,
  COALESCE(COUNT(DISTINCT oi.order_id), 0) AS times_ordered,
  COALESCE(SUM(oi.quantity), 0) AS total_sold
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
LEFT JOIN orders o ON oi.order_id = o.id 
  AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND o.status != 'cancelled'
WHERE mi.available = TRUE
GROUP BY mi.id, mi.name, mc.name, mi.price
HAVING COALESCE(COUNT(DISTINCT oi.order_id), 0) < 5
ORDER BY total_sold ASC, mi.name;

-- ============================================
-- REVENUE ANALYSIS
-- ============================================

-- Daily revenue summary (last 30 days)
-- Expected Performance: <150ms
SELECT 
  DATE(created_at) AS order_date,
  COUNT(*) AS total_orders,
  COUNT(DISTINCT user_id) AS unique_customers,
  SUM(total_amount) AS daily_revenue,
  AVG(total_amount) AS avg_order_value,
  MIN(total_amount) AS min_order,
  MAX(total_amount) AS max_order
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
AND status != 'cancelled'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- Monthly revenue comparison
SELECT 
  TO_CHAR(created_at, 'YYYY-MM') AS month,
  COUNT(*) AS total_orders,
  COUNT(DISTINCT user_id) AS unique_customers,
  SUM(total_amount) AS monthly_revenue,
  AVG(total_amount) AS avg_order_value
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
AND status != 'cancelled'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month DESC;

-- Revenue by payment method
SELECT 
  p.payment_method,
  COUNT(*) AS transaction_count,
  SUM(p.amount) AS total_amount,
  AVG(p.amount) AS avg_transaction,
  COUNT(*) FILTER (WHERE p.status = 'completed') AS successful_transactions,
  COUNT(*) FILTER (WHERE p.status = 'failed') AS failed_transactions
FROM payments p
JOIN orders o ON p.order_id = o.id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.payment_method
ORDER BY total_amount DESC;

-- ============================================
-- CUSTOMER BEHAVIOR ANALYSIS
-- ============================================

-- Customer segmentation by order frequency
SELECT 
  CASE 
    WHEN order_count = 1 THEN '1 order'
    WHEN order_count BETWEEN 2 AND 5 THEN '2-5 orders'
    WHEN order_count BETWEEN 6 AND 10 THEN '6-10 orders'
    WHEN order_count BETWEEN 11 AND 20 THEN '11-20 orders'
    ELSE '20+ orders'
  END AS customer_segment,
  COUNT(*) AS customer_count,
  AVG(total_spent) AS avg_lifetime_value,
  SUM(total_spent) AS segment_revenue
FROM (
  SELECT 
    user_id,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_spent
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
) AS customer_stats
GROUP BY 
  CASE 
    WHEN order_count = 1 THEN '1 order'
    WHEN order_count BETWEEN 2 AND 5 THEN '2-5 orders'
    WHEN order_count BETWEEN 6 AND 10 THEN '6-10 orders'
    WHEN order_count BETWEEN 11 AND 20 THEN '11-20 orders'
    ELSE '20+ orders'
  END
ORDER BY 
  CASE customer_segment
    WHEN '1 order' THEN 1
    WHEN '2-5 orders' THEN 2
    WHEN '6-10 orders' THEN 3
    WHEN '11-20 orders' THEN 4
    ELSE 5
  END;

-- Top customers by spend
SELECT 
  p.full_name,
  p.student_id,
  COUNT(o.id) AS total_orders,
  SUM(o.total_amount) AS total_spent,
  AVG(o.total_amount) AS avg_order_value,
  MAX(o.created_at) AS last_order_date
FROM profiles p
JOIN orders o ON p.user_id = o.user_id
WHERE o.status = 'completed'
AND o.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY p.user_id, p.full_name, p.student_id
ORDER BY total_spent DESC
LIMIT 50;

-- Customer retention - repeat customers by month
SELECT 
  TO_CHAR(first_order, 'YYYY-MM') AS cohort_month,
  COUNT(DISTINCT user_id) AS new_customers,
  COUNT(DISTINCT user_id) FILTER (WHERE order_count > 1) AS repeat_customers,
  ROUND(100.0 * COUNT(DISTINCT user_id) FILTER (WHERE order_count > 1) / COUNT(DISTINCT user_id), 2) AS repeat_rate_pct
FROM (
  SELECT 
    user_id,
    MIN(created_at) AS first_order,
    COUNT(*) AS order_count
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
) AS customer_cohorts
GROUP BY TO_CHAR(first_order, 'YYYY-MM')
ORDER BY cohort_month DESC
LIMIT 12;

-- ============================================
-- OPERATIONAL METRICS
-- ============================================

-- Average preparation time by order size
SELECT 
  CASE 
    WHEN item_count = 1 THEN '1 item'
    WHEN item_count BETWEEN 2 AND 3 THEN '2-3 items'
    WHEN item_count BETWEEN 4 AND 5 THEN '4-5 items'
    ELSE '6+ items'
  END AS order_size,
  COUNT(*) AS order_count,
  AVG(prep_time_minutes) AS avg_prep_time,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY prep_time_minutes) AS median_prep_time,
  MIN(prep_time_minutes) AS min_prep_time,
  MAX(prep_time_minutes) AS max_prep_time
FROM (
  SELECT 
    o.id,
    COUNT(oi.id) AS item_count,
    EXTRACT(EPOCH FROM (o.updated_at - o.created_at)) / 60 AS prep_time_minutes
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  WHERE o.status = 'completed'
  AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY o.id, o.created_at, o.updated_at
) AS order_prep_stats
GROUP BY 
  CASE 
    WHEN item_count = 1 THEN '1 item'
    WHEN item_count BETWEEN 2 AND 3 THEN '2-3 items'
    WHEN item_count BETWEEN 4 AND 5 THEN '4-5 items'
    ELSE '6+ items'
  END
ORDER BY 
  CASE order_size
    WHEN '1 item' THEN 1
    WHEN '2-3 items' THEN 2
    WHEN '4-5 items' THEN 3
    ELSE 4
  END;

-- Order status distribution
SELECT 
  status,
  COUNT(*) AS order_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentage,
  AVG(total_amount) AS avg_order_value
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY status
ORDER BY order_count DESC;

-- Cancellation analysis
SELECT 
  DATE(created_at) AS cancellation_date,
  COUNT(*) AS cancelled_orders,
  SUM(total_amount) AS lost_revenue,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60) AS avg_time_to_cancel_minutes
FROM orders
WHERE status = 'cancelled'
AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY cancellation_date DESC;

-- ============================================
-- FORECASTING DATA
-- ============================================

-- Order volume forecast data (7-day moving average)
SELECT 
  order_date,
  daily_orders,
  AVG(daily_orders) OVER (
    ORDER BY order_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7day,
  daily_revenue,
  AVG(daily_revenue) OVER (
    ORDER BY order_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS revenue_moving_avg_7day
FROM (
  SELECT 
    DATE(created_at) AS order_date,
    COUNT(*) AS daily_orders,
    SUM(total_amount) AS daily_revenue
  FROM orders
  WHERE status != 'cancelled'
  AND created_at >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY DATE(created_at)
) AS daily_stats
ORDER BY order_date DESC;

-- ============================================
-- COMPARATIVE ANALYSIS
-- ============================================

-- Week-over-week comparison
WITH weekly_stats AS (
  SELECT 
    DATE_TRUNC('week', created_at) AS week_start,
    COUNT(*) AS order_count,
    SUM(total_amount) AS revenue,
    COUNT(DISTINCT user_id) AS unique_customers
  FROM orders
  WHERE status != 'cancelled'
  AND created_at >= CURRENT_DATE - INTERVAL '8 weeks'
  GROUP BY DATE_TRUNC('week', created_at)
)
SELECT 
  week_start,
  order_count,
  revenue,
  unique_customers,
  LAG(order_count) OVER (ORDER BY week_start) AS prev_week_orders,
  ROUND(100.0 * (order_count - LAG(order_count) OVER (ORDER BY week_start)) / 
        NULLIF(LAG(order_count) OVER (ORDER BY week_start), 0), 2) AS order_growth_pct,
  ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY week_start)) / 
        NULLIF(LAG(revenue) OVER (ORDER BY week_start), 0), 2) AS revenue_growth_pct
FROM weekly_stats
ORDER BY week_start DESC;

-- ============================================
-- PERFORMANCE BENCHMARKS
-- ============================================

-- System performance metrics
SELECT 
  'Total Orders (30 days)' AS metric,
  COUNT(*)::TEXT AS value
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  'Active Users (30 days)',
  COUNT(DISTINCT user_id)::TEXT
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  'Avg Orders Per Day',
  ROUND(COUNT(*) / 30.0)::TEXT
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  'Peak Hour Orders',
  MAX(hourly_count)::TEXT
FROM (
  SELECT COUNT(*) AS hourly_count
  FROM orders
  WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY DATE_TRUNC('hour', created_at)
) AS hourly_stats
UNION ALL
SELECT 
  'Avg Prep Time (minutes)',
  ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60))::TEXT
FROM orders
WHERE status = 'completed'
AND created_at >= CURRENT_DATE - INTERVAL '7 days';
