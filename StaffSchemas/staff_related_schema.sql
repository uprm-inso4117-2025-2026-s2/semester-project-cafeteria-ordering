-- Coordination note:
-- Based on feedback from the Authentication team, staff should be managed
-- in a separate table rather than being merged directly with users/auth records.
-- This schema therefore keeps staff as an independent entity.

create extension if not exists "pgcrypto";

create table if not exists staff (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    email text not null unique,
    role text not null check (role in ('admin', 'cashier', 'kitchen', 'manager', 'staff')),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists menu (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    category text not null,
    price numeric(10,2) not null check (price >= 0),
    is_available boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    status text not null check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    total_amount numeric(10,2) not null check (total_amount >= 0),
    handled_by_staff_id uuid,
    created_at timestamptz not null default now(),
    constraint fk_orders_staff
        foreign key (handled_by_staff_id)
        references staff(id)
        on delete set null
);

create table if not exists order_menu_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null,
    menu_id uuid not null,
    quantity integer not null check (quantity > 0),
    unit_price numeric(10,2) not null check (unit_price >= 0),
    constraint fk_order_menu_items_order
        foreign key (order_id)
        references orders(id)
        on delete cascade,
    constraint fk_order_menu_items_menu
        foreign key (menu_id)
        references menu(id)
        on delete restrict
);