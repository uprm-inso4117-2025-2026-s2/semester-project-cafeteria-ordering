-- ============================================
-- Cafeteria Ordering System - PostgreSQL Extensions
-- ============================================
-- Enable required PostgreSQL extensions for Supabase
-- Run this first before creating tables

-- UUID generation for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Case-insensitive text search
CREATE EXTENSION IF NOT EXISTS "citext";

-- Trigram similarity for fuzzy text search (optional, for menu search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Comments
COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions for primary keys';
COMMENT ON EXTENSION "citext" IS 'Case-insensitive text type for emails';
COMMENT ON EXTENSION "pg_trgm" IS 'Trigram matching for fuzzy text search';
