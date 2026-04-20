-- SQL Script for GVD Dashboard Supabase Setup

-- 1. Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Entry User', 'Viewer')),
  plant TEXT,
  category TEXT CHECK (category IN ('GRN', 'Dispatched', 'Waste', 'All')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Production Table
CREATE TABLE production (
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
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  plant TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Real-time
ALTER PUBLICATION supabase_realtime ADD TABLE production;
ALTER PUBLICATION supabase_realtime ADD TABLE logs;

-- 5. Insert Default Users
INSERT INTO users (username, role, plant, category) VALUES
('admin', 'Admin', 'Global', 'All'),
('viewer', 'Viewer', 'Global', 'All'),
('entry_str1_grn', 'Entry User', 'STR 1', 'GRN'),
('entry_str1_disp', 'Entry User', 'STR 1', 'Dispatched'),
('entry_str1_waste', 'Entry User', 'STR 1', 'Waste');
