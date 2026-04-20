-- GVD Plant Performance Dashboard - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- 0. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Entry User', 'Viewer')),
  plant TEXT,
  category TEXT CHECK (category IN ('GRN', 'Dispatched', 'Waste', 'All')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Production Table
CREATE TABLE IF NOT EXISTS production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  grn NUMERIC DEFAULT 0,
  dispatched NUMERIC DEFAULT 0,
  waste NUMERIC DEFAULT 0,
  created_by TEXT REFERENCES users(username) ON UPDATE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(plant, year, month)
);

-- 3. Create Logs Table
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  plant TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Real-time for collections
-- (Check if publication already exists to avoid errors)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE production;
ALTER PUBLICATION supabase_realtime ADD TABLE logs;

-- 5. Insert Default Users (using ON CONFLICT to avoid errors on re-run)
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
