-- GVD Plant Performance Dashboard - Full Supabase Setup Script
-- Application: GVD Portal
-- Instructions: Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- ==========================================
-- 0. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES
-- ==========================================

-- Users Table: Stores platform users and their role-based permissions
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Entry User', 'Viewer')),
  plant TEXT,
  category TEXT CHECK (category IN ('GRN', 'Dispatched', 'Waste', 'All')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Production Table: Stores monthly performance data for each plant
CREATE TABLE IF NOT EXISTS production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  grn NUMERIC DEFAULT 0,
  dispatched NUMERIC DEFAULT 0,
  waste NUMERIC DEFAULT 0,
  created_by TEXT, -- Stores the username of the creator
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(plant, year, month)
);

-- Logs Table: Activity feed for audit trails
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  plant TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. SECURITY (RLS)
-- ==========================================
-- For rapid prototyping and deployment, we disable RLS. 
-- In a high-security production environment, you would instead create specific policies.
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE production DISABLE ROW LEVEL SECURITY;
ALTER TABLE logs DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. REAL-TIME EMPOWERMENT
-- ==========================================
-- This allows the dashboard to update instantly when data is saved.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add relevant tables to the real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE production;
ALTER PUBLICATION supabase_realtime ADD TABLE logs;

-- ==========================================
-- 4. SEED DATA (Default Users)
-- ==========================================
-- This creates the initial accounts so you can log in immediately.
INSERT INTO users (username, role, plant, category) 
VALUES
  ('admin', 'Admin', 'Global', 'All'),
  ('viewer', 'Viewer', 'Global', 'All'),
  ('entry_str1_grn', 'Entry User', 'STR 1', 'GRN'),
  ('entry_str1_disp', 'Entry User', 'STR 1', 'Dispatched'),
  ('entry_str1_waste', 'Entry User', 'STR 1', 'Waste')
ON CONFLICT (username) DO UPDATE 
SET 
  role = EXCLUDED.role,
  plant = EXCLUDED.plant,
  category = EXCLUDED.category;
