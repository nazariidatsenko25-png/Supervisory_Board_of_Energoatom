-- Migration: Add missing JSONB columns to agents table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor
-- These columns store builder block configurations

ALTER TABLE agents ADD COLUMN IF NOT EXISTS knowledge_sources JSONB DEFAULT '[]'::jsonb;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS output_format JSONB DEFAULT NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS api_integrations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS memory_config JSONB DEFAULT NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '[]'::jsonb;
