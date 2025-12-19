-- Doctor Visit Translator Database Schema
-- Run this in your Supabase SQL Editor

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_text TEXT NOT NULL,
  target_language VARCHAR(10) NOT NULL CHECK (target_language IN ('english', 'tamil', 'hindi')),
  condition TEXT,
  medicines TEXT,
  daily_routine TEXT,
  dos TEXT,
  donts TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_translations_user_id ON translations(user_id);
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON translations(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_translations_updated_at ON translations;
CREATE TRIGGER update_translations_updated_at
    BEFORE UPDATE ON translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own translations
CREATE POLICY "Users can view own translations" ON translations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own translations
CREATE POLICY "Users can insert own translations" ON translations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own translations
CREATE POLICY "Users can update own translations" ON translations
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own translations
CREATE POLICY "Users can delete own translations" ON translations
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON translations TO authenticated;
GRANT SELECT ON translations TO anon;