-- Add 'name' column to agents table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor
ALTER TABLE agents ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Unnamed Agent';
