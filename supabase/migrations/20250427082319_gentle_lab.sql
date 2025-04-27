/*
  # Add target field to leads table

  1. Changes
    - Add `target_type` column to `leads` table with two possible values:
      - 'Target'
      - 'Non-Target'
    - Default value set to 'Non-Target'
*/

ALTER TABLE leads ADD COLUMN target_type text DEFAULT 'Non-Target' CHECK (target_type IN ('Target', 'Non-Target'));