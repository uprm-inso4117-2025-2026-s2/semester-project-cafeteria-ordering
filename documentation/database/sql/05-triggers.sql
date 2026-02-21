-- ============================================
-- Cafeteria Ordering System - Database Triggers
-- ============================================
-- Automated triggers for business logic

-- ============================================
-- TIMESTAMP TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 
  'Automatically updates the updated_at timestamp on row modification';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_menu_categories
  BEFORE UPDATE ON menu_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_menu_items
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_cafeteria_settings
  BEFORE UPDATE ON cafeteria_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PICKUP CODE GENERATION TRIGGER
-- ============================================

-- Function to auto-generate pickup code on order creation
CREATE OR REPLACE FUNCTION set_pickup_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if pickup_code is null or empty
  IF NEW.pickup_code IS NULL OR NEW.pickup_code = '' THEN
    NEW.pickup_code := generate_pickup_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_pickup_code() IS 
  'Automatically generates unique pickup code when order is created';

CREATE TRIGGER generate_pickup_code_on_insert
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_pickup_code();

-- ============================================
-- ORDER STATUS HISTORY TRIGGER
-- ============================================

-- Function to log status changes to audit trail
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO order_status_history (
      order_id,
      previous_status,
      new_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NEW.user_id, -- This should be updated to actual staff user in application
      'Status changed from ' || OLD.status || ' to ' || NEW.status
    );
    
    -- Set completed_at timestamp when order is marked completed
    IF NEW.status = 'completed' THEN
      NEW.completed_at := NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_order_status_change() IS 
  'Logs order status changes to audit trail and sets completed_at timestamp';

CREATE TRIGGER track_order_status_changes
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- ============================================
-- ORDER TOTAL VALIDATION TRIGGER
-- ============================================

-- Function to validate order total matches sum of items
CREATE OR REPLACE FUNCTION validate_order_total()
RETURNS TRIGGER AS $$
DECLARE
  calculated_total DECIMAL(10,2);
BEGIN
  -- Calculate total from order items
  SELECT COALESCE(SUM(quantity * unit_price), 0)
  INTO calculated_total
  FROM order_items
  WHERE order_id = NEW.id;
  
  -- Allow small rounding differences (< $0.05)
  IF ABS(NEW.total_amount - calculated_total) > 0.05 THEN
    RAISE EXCEPTION 'Order total (%) does not match sum of items (%)', 
      NEW.total_amount, calculated_total;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_order_total() IS 
  'Validates that order total_amount matches the sum of order items';

-- Note: This trigger is commented out by default as it may cause issues during order creation
-- Enable only if strict validation is required
-- CREATE TRIGGER validate_order_total_on_update
--   BEFORE UPDATE ON orders
--   FOR EACH ROW
--   WHEN (OLD.total_amount IS DISTINCT FROM NEW.total_amount)
--   EXECUTE FUNCTION validate_order_total();

-- ============================================
-- NOTIFICATION CREATION TRIGGERS
-- ============================================

-- Function to create notification when order is ready
CREATE OR REPLACE FUNCTION notify_order_ready()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'ready') THEN
    INSERT INTO notifications (
      user_id,
      order_id,
      type,
      title,
      message
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'order_ready',
      'Your Order is Ready!',
      'Order #' || SUBSTRING(NEW.id::TEXT, 1, 8) || ' is ready for pickup. Your pickup code is: ' || NEW.pickup_code
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION notify_order_ready() IS 
  'Creates notification when order status changes to ready';

CREATE TRIGGER create_order_ready_notification
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_ready();

-- Function to create notification when order is placed
CREATE OR REPLACE FUNCTION notify_order_placed()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    order_id,
    type,
    title,
    message
  ) VALUES (
    NEW.user_id,
    NEW.id,
    'order_placed',
    'Order Confirmed',
    'Your order has been received and is being prepared. We''ll notify you when it''s ready!'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION notify_order_placed() IS 
  'Creates confirmation notification when order is placed';

CREATE TRIGGER create_order_placed_notification
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_placed();

-- ============================================
-- MENU ITEM AVAILABILITY VALIDATION
-- ============================================

-- Function to prevent ordering unavailable items
CREATE OR REPLACE FUNCTION validate_menu_item_availability()
RETURNS TRIGGER AS $$
DECLARE
  item_available BOOLEAN;
BEGIN
  SELECT available INTO item_available
  FROM menu_items
  WHERE id = NEW.menu_item_id;
  
  IF NOT item_available THEN
    RAISE EXCEPTION 'Cannot order unavailable menu item %', NEW.menu_item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_menu_item_availability() IS 
  'Prevents adding unavailable menu items to orders';

CREATE TRIGGER check_menu_item_available
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_menu_item_availability();

-- ============================================
-- PROFILE CREATION TRIGGER
-- ============================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'student'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_profile_for_new_user() IS 
  'Automatically creates profile when new user signs up via Supabase Auth';

-- Note: This trigger is on auth.users which is managed by Supabase
-- May need to be created via Supabase Dashboard or SQL Editor
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();

-- ============================================
-- CLEANUP TRIGGERS
-- ============================================

-- Function to clean up old completed orders (optional)
CREATE OR REPLACE FUNCTION archive_old_orders()
RETURNS TRIGGER AS $$
BEGIN
  -- This is a placeholder for order archival logic
  -- Could move orders older than X days to archive table
  -- Or mark them for deletion after retention period
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION archive_old_orders() IS 
  'Placeholder for archiving old completed orders (implement as needed)';

-- ============================================
-- TRIGGER MANAGEMENT NOTES
-- ============================================

-- List all triggers:
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- ORDER BY event_object_table, trigger_name;

-- Disable a trigger:
-- ALTER TABLE orders DISABLE TRIGGER track_order_status_changes;

-- Enable a trigger:
-- ALTER TABLE orders ENABLE TRIGGER track_order_status_changes;

-- Drop a trigger:
-- DROP TRIGGER IF EXISTS track_order_status_changes ON orders;
