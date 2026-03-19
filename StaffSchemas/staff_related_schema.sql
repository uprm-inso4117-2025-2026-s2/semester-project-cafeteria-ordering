-- =====================================
-- Edit Staff Database Schema
-- =====================================
-- This script updates the existing schema for menu_items, orders,
-- and order_items to match the requested structure while preserving
-- the current Supabase database design.

-- =====================================
-- MENU ITEMS
-- Existing columns found:
-- id, category_id, name, price, image_url, available,
-- allergens, prep_time_minutes, created_at, updated_at
-- Required additions/changes:
-- description, category, quantity, image, is_available
-- =====================================

alter table menu_items
add column if not exists description text,
add column if not exists category text,
add column if not exists quantity integer not null default 0 check (quantity >= 0);

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_name = 'menu_items'
          and column_name = 'available'
    ) and not exists (
        select 1
        from information_schema.columns
        where table_name = 'menu_items'
          and column_name = 'is_available'
    ) then
        alter table menu_items rename column available to is_available;
    end if;
end $$;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_name = 'menu_items'
          and column_name = 'image_url'
    ) and not exists (
        select 1
        from information_schema.columns
        where table_name = 'menu_items'
          and column_name = 'image'
    ) then
        alter table menu_items rename column image_url to image;
    end if;
end $$;


-- =====================================
-- ORDERS
-- Existing columns found:
-- order_id, user_id, order_status, total_amount, timestamp,
-- pickup_code, notes, created_at, updated_at, completed_at, user_name
-- Required additions/changes:
-- payment_method, payment_status, customer_note, placed_at
-- Notes:
-- Keep user_id instead of customer_id to preserve current schema.
-- Keep order_status instead of status.
-- Use notes as the existing customer note field.
-- =====================================

alter table orders
add column if not exists payment_method text,
add column if not exists payment_status text,
add column if not exists placed_at timestamptz;

update orders
set placed_at = "timestamp"
where placed_at is null;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_name = 'orders'
          and column_name = 'notes'
    ) and not exists (
        select 1
        from information_schema.columns
        where table_name = 'orders'
          and column_name = 'customer_note'
    ) then
        alter table orders rename column notes to customer_note;
    end if;
end $$;


-- =====================================
-- ORDER ITEMS
-- Existing columns found:
-- id, order_id, menu_item_id, quantity, unit_price,
-- special_instructions, created_at
-- Required additions/changes:
-- item_name, subtotal, special_request
-- =====================================

alter table order_items
add column if not exists item_name text,
add column if not exists subtotal numeric(10,2) check (subtotal >= 0);

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_name = 'order_items'
          and column_name = 'special_instructions'
    ) and not exists (
        select 1
        from information_schema.columns
        where table_name = 'order_items'
          and column_name = 'special_request'
    ) then
        alter table order_items rename column special_instructions to special_request;
    end if;
end $$;