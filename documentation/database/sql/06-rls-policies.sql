-- ============================================
-- Cafeteria Ordering System - Row-Level Security Policies
-- ============================================
-- Supabase RLS policies for role-based access control
-- Security enforced at database level

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafeteria_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND role = (SELECT role FROM profiles WHERE user_id = auth.uid()));

-- Staff and admins can view all profiles
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (is_staff(auth.uid()));

-- Admins can update user roles
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- MENU CATEGORIES POLICIES
-- ============================================

-- Everyone (authenticated users) can view active categories
CREATE POLICY "Anyone can view active menu categories"
  ON menu_categories FOR SELECT
  USING (auth.role() = 'authenticated' AND active = TRUE);

-- Staff can view all categories (including inactive)
CREATE POLICY "Staff can view all menu categories"
  ON menu_categories FOR SELECT
  USING (is_staff(auth.uid()));

-- Admins can manage categories
CREATE POLICY "Admins can insert menu categories"
  ON menu_categories FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update menu categories"
  ON menu_categories FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete menu categories"
  ON menu_categories FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- MENU ITEMS POLICIES
-- ============================================

-- Everyone can view available menu items
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  USING (auth.role() = 'authenticated' AND available = TRUE);

-- Staff can view all menu items (including unavailable)
CREATE POLICY "Staff can view all menu items"
  ON menu_items FOR SELECT
  USING (is_staff(auth.uid()));

-- Admins can manage menu items
CREATE POLICY "Admins can insert menu items"
  ON menu_items FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update menu items"
  ON menu_items FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete menu items"
  ON menu_items FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders (only if not completed/cancelled)
CREATE POLICY "Users can update own pending orders"
  ON orders FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND status NOT IN ('completed', 'cancelled')
  );

-- Staff can view all orders
CREATE POLICY "Staff can view all orders"
  ON orders FOR SELECT
  USING (is_staff(auth.uid()));

-- Staff can update order status
CREATE POLICY "Staff can update order status"
  ON orders FOR UPDATE
  USING (is_staff(auth.uid()));

-- ============================================
-- ORDER ITEMS TABLE POLICIES
-- ============================================

-- Users can view items in their own orders
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can insert items into their own pending orders
CREATE POLICY "Users can add items to own orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
      AND orders.status = 'placed'
    )
  );

-- Staff can view all order items
CREATE POLICY "Staff can view all order items"
  ON order_items FOR SELECT
  USING (is_staff(auth.uid()));

-- ============================================
-- ORDER STATUS HISTORY POLICIES
-- ============================================

-- Users can view history of their own orders
CREATE POLICY "Users can view own order history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Staff can view all order history
CREATE POLICY "Staff can view all order history"
  ON order_status_history FOR SELECT
  USING (is_staff(auth.uid()));

-- System can insert history (through triggers)
CREATE POLICY "System can insert order history"
  ON order_status_history FOR INSERT
  WITH CHECK (true);

-- ============================================
-- PAYMENTS TABLE POLICIES
-- ============================================

-- Users can view payments for their own orders
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can create payments for their own orders
CREATE POLICY "Users can create payments for own orders"
  ON payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Staff can view all payments
CREATE POLICY "Staff can view all payments"
  ON payments FOR SELECT
  USING (is_staff(auth.uid()));

-- Staff can update payment status (for refunds, etc.)
CREATE POLICY "Staff can update payments"
  ON payments FOR UPDATE
  USING (is_staff(auth.uid()));

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System/Staff can create notifications for users
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Staff can view all notifications
CREATE POLICY "Staff can view all notifications"
  ON notifications FOR SELECT
  USING (is_staff(auth.uid()));

-- ============================================
-- PUSH NOTIFICATION TOKENS POLICIES
-- ============================================

-- Users can view their own tokens
CREATE POLICY "Users can view own push tokens"
  ON push_notification_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tokens
CREATE POLICY "Users can register push tokens"
  ON push_notification_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own tokens
CREATE POLICY "Users can update own push tokens"
  ON push_notification_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
  ON push_notification_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Staff can view all tokens (for system notifications)
CREATE POLICY "Staff can view all push tokens"
  ON push_notification_tokens FOR SELECT
  USING (is_staff(auth.uid()));

-- ============================================
-- CAFETERIA SETTINGS POLICIES
-- ============================================

-- Everyone can view settings (read-only for customers)
CREATE POLICY "Anyone can view cafeteria settings"
  ON cafeteria_settings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can modify settings
CREATE POLICY "Admins can insert cafeteria settings"
  ON cafeteria_settings FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update cafeteria settings"
  ON cafeteria_settings FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete cafeteria settings"
  ON cafeteria_settings FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- TESTING RLS POLICIES
-- ============================================

-- Test as student user:
-- SET LOCAL role TO authenticated;
-- SET LOCAL request.jwt.claim.sub TO '<student_user_id>';
-- SELECT * FROM orders; -- Should only see own orders

-- Test as staff user:
-- SET LOCAL role TO authenticated;
-- SET LOCAL request.jwt.claim.sub TO '<staff_user_id>';
-- SELECT * FROM orders; -- Should see all orders

-- Reset:
-- RESET role;

-- ============================================
-- POLICY MANAGEMENT NOTES
-- ============================================

-- List all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Drop a policy:
-- DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Disable RLS on a table (not recommended for production):
-- ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Check if RLS is enabled:
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
