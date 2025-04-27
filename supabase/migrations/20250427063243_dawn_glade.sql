/*
  # Create leads table

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `name` (text, not null)
      - `email` (text, not null)
      - `phone` (text, not null)
      - `address` (text, not null)
      - `is_active` (boolean, default true)
      - `status` (text, default 'Open')
      - `last_followup_remarks` (text, nullable)
      - `next_steps` (text, nullable)
      - `priority` (text, default 'normal')
      - `user_id` (uuid, foreign key to auth.users)
  
  2. Security
    - Enable RLS on `leads` table
    - Add policies for authenticated users to:
      - Read their own leads
      - Insert new leads
      - Update their own leads
      - Delete their own leads
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  is_active boolean DEFAULT true,
  status text DEFAULT 'Open' CHECK (status IN ('Open', 'Close', 'Pending')),
  last_followup_remarks text,
  next_steps text,
  priority text DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads"
  ON leads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
  ON leads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads (user_id);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);
CREATE INDEX IF NOT EXISTS leads_priority_idx ON leads (priority);
CREATE INDEX IF NOT EXISTS leads_is_active_idx ON leads (is_active);