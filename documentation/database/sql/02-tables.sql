-- ============================================
-- Cafeteria Ordering System - Table Definitions
-- ============================================
-- PostgreSQL DDL for Supabase backend
-- Supports: Online ordering, pickup verification, role-based access
-- Target: 500+ concurrent users during peak hours

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- Extended user profiles (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id VARCHAR(20) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Extended user profile information linked to Supabase authentication';
COMMENT ON COLUMN profiles.user_id IS 'Foreign key to auth.users table (Supabase managed)';
COMMENT ON COLUMN profiles.student_id IS 'University student ID number';
COMMENT ON COLUMN profiles.role IS 'User role: student (customer), staff (cafeteria), admin (manager)';

-- ============================================
-- MENU MANAGEMENT
-- ============================================

-- Menu categories for organization
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE menu_categories IS 'Categories for organizing menu items (Beverages, Entrees, Sides, Desserts)';
COMMENT ON COLUMN menu_categories.display_order IS 'Sort order for displaying categories in UI';
COMMENT ON COLUMN menu_categories.active IS 'Whether category is currently shown to users';

-- Menu items available for ordering
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  allergens TEXT[],
  prep_time_minutes INT DEFAULT 10 CHECK (prep_time_minutes > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE menu_items IS 'Menu items that can be ordered by customers';
COMMENT ON COLUMN menu_items.price IS 'Price in USD';
COMMENT ON COLUMN menu_items.available IS 'Whether item can currently be ordered';
COMMENT ON COLUMN menu_items.allergens IS 'Array of allergen information (e.g., {dairy, nuts, gluten})';
COMMENT ON COLUMN menu_items.prep_time_minutes IS 'Estimated preparation time for kitchen planning';

-- ============================================
-- ORDER PROCESSING
-- ============================================

-- Order status enum type for better constraint
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('placed', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Order header
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'placed' CHECK (
    status IN ('placed', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')
  ),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  pickup_time TIMESTAMP,
  pickup_code VARCHAR(4) UNIQUE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

COMMENT ON TABLE orders IS 'Order header containing overall order information and status';
COMMENT ON COLUMN orders.status IS 'Order lifecycle: placed -> confirmed -> preparing -> ready -> completed';
COMMENT ON COLUMN orders.pickup_time IS 'Scheduled pickup time (NULL means ASAP)';
COMMENT ON COLUMN orders.pickup_code IS 'Auto-generated 4-digit verification code for secure pickup';
COMMENT ON COLUMN orders.notes IS 'Special instructions from customer';
COMMENT ON COLUMN orders.completed_at IS 'Timestamp when order was picked up by customer';

-- Order items (junction table)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  special_instructions TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE order_items IS 'Individual line items within an order (many-to-many junction)';
COMMENT ON COLUMN order_items.unit_price IS 'Price at time of order (historical record)';
COMMENT ON COLUMN order_items.special_instructions IS 'Item-specific customization notes';

-- Order status audit trail
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  notes TEXT
);

COMMENT ON TABLE order_status_history IS 'Audit trail tracking all status changes for accountability';
COMMENT ON COLUMN order_status_history.changed_by IS 'Staff member who changed the status (NULL for system changes)';

-- ============================================
-- PAYMENT MANAGEMENT
-- ============================================

-- Payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  payment_method VARCHAR(50) NOT NULL CHECK (
    payment_method IN ('credit_card', 'debit_card', 'mobile_payment', 'university_account')
  ),
  provider_transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'refunded')
  ),
  processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE payments IS 'Payment transaction records (no card details stored for PCI compliance)';
COMMENT ON COLUMN payments.provider_transaction_id IS 'Transaction ID from payment provider (Stripe, PayPal, etc.)';
COMMENT ON COLUMN payments.processed_at IS 'Timestamp when payment was successfully processed';

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Notification history
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('order_placed', 'order_confirmed', 'order_ready', 'order_completed', 'order_cancelled', 'system_message')
  ),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
  read_at TIMESTAMP
);

COMMENT ON TABLE notifications IS 'Notification history for tracking messages sent to users';
COMMENT ON COLUMN notifications.read_at IS 'When user marked notification as read (NULL = unread)';

-- Push notification device tokens
CREATE TABLE IF NOT EXISTS push_notification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android')),
  registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP
);

COMMENT ON TABLE push_notification_tokens IS 'Device tokens for Expo push notifications';
COMMENT ON COLUMN push_notification_tokens.token IS 'Expo push notification token from device';
COMMENT ON COLUMN push_notification_tokens.last_used_at IS 'Last successful notification delivery';

-- ============================================
-- SYSTEM CONFIGURATION
-- ============================================

-- System settings
CREATE TABLE IF NOT EXISTS cafeteria_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE cafeteria_settings IS 'System configuration (operating hours, capacity limits, etc.)';
COMMENT ON COLUMN cafeteria_settings.value IS 'JSON value for flexible configuration storage';
COMMENT ON COLUMN cafeteria_settings.key IS 'Examples: operating_hours, peak_hours, max_orders_per_slot, avg_prep_time';

-- Insert default settings
INSERT INTO cafeteria_settings (key, value, description) VALUES
  ('operating_hours', '{"monday_friday": {"open": "07:00", "close": "16:00"}, "saturday_sunday": {"open": "09:00", "close": "14:00"}}', 'Cafeteria operating hours by day'),
  ('peak_hours', '{"start": "11:00", "end": "14:00"}', 'Peak hours for order volume'),
  ('max_concurrent_orders', '50', 'Maximum orders that can be in preparing status'),
  ('avg_prep_time_minutes', '10', 'Average preparation time for orders'),
  ('order_ready_notification_delay', '30', 'Seconds to wait before sending ready notification')
ON CONFLICT (key) DO NOTHING;
