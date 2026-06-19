-- SQL migration for Agentic AI Financial Copilot Upgrade

-- 1. Upgrade AI Memory: Add memory_type if it doesn't exist
ALTER TABLE ai_memory ADD COLUMN IF NOT EXISTS memory_type text DEFAULT 'general';

-- 2. Upgrade Agent Logs: Add execution_time if it doesn't exist
ALTER TABLE agent_logs ADD COLUMN IF NOT EXISTS execution_time integer DEFAULT 0;

-- 3. Create Daily Briefs Table
CREATE TABLE IF NOT EXISTS daily_briefs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brief jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on daily_briefs
ALTER TABLE daily_briefs ENABLE ROW LEVEL SECURITY;

-- Add RLS Policy for daily_briefs if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'daily_briefs' AND policyname = 'Users can perform CRUD actions on their own daily briefs'
    ) THEN
        CREATE POLICY "Users can perform CRUD actions on their own daily briefs"
        ON daily_briefs FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;
