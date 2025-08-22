/*
  # Update jobs table for scalability

  1. Database Schema Updates
    - Add status column with ENUM-style values if not exists
    - Add indexes for optimal filtering performance
    - Ensure proper foreign key relationships
    - Add fields for future scalability

  2. Status Management
    - Default status: 'scheduled'
    - Supported statuses: 'scheduled', 'in_progress', 'completed', 'cancelled', 'pending_approval', 'archived'
    - Constraint to ensure valid status values

  3. Performance Optimizations
    - Indexes on frequently queried columns
    - Foreign key constraints for data integrity
    - Optimized for status filtering and job lookups

  4. Future-Proofing
    - Additional columns for attachments, checklists, and metadata
    - JSON fields for flexible data storage
    - Audit trail fields
*/

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'status'
  ) THEN
    ALTER TABLE jobs ADD COLUMN status text DEFAULT 'scheduled';
  END IF;
END $$;

-- Update status constraint to include all future statuses
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'jobs' AND constraint_name = 'jobs_status_check'
  ) THEN
    ALTER TABLE jobs DROP CONSTRAINT jobs_status_check;
  END IF;
  
  -- Add updated constraint with all possible statuses
  ALTER TABLE jobs ADD CONSTRAINT jobs_status_check 
    CHECK (status = ANY (ARRAY[
      'scheduled'::text, 
      'in_progress'::text, 
      'completed'::text, 
      'cancelled'::text,
      'pending_approval'::text,
      'archived'::text,
      'on_hold'::text,
      'requires_approval'::text
    ]));
END $$;

-- Add additional columns for future scalability
DO $$
BEGIN
  -- Add assigned_worker_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'assigned_worker_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN assigned_worker_id uuid REFERENCES user_profiles(id);
  END IF;

  -- Add completion_date if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'completion_date'
  ) THEN
    ALTER TABLE jobs ADD COLUMN completion_date timestamptz;
  END IF;

  -- Add metadata JSON field for flexible data storage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE jobs ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;

  -- Add attachments JSON field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE jobs ADD COLUMN attachments jsonb DEFAULT '[]';
  END IF;

  -- Add checklist JSON field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'checklist'
  ) THEN
    ALTER TABLE jobs ADD COLUMN checklist jsonb DEFAULT '[]';
  END IF;

  -- Add invoice_id for future invoice linking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'invoice_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN invoice_id uuid;
  END IF;

  -- Add recurring job fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'is_recurring'
  ) THEN
    ALTER TABLE jobs ADD COLUMN is_recurring boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'parent_job_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN parent_job_id uuid REFERENCES jobs(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'recurrence_pattern'
  ) THEN
    ALTER TABLE jobs ADD COLUMN recurrence_pattern jsonb;
  END IF;
END $$;

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_jobs_status_business ON jobs(status, business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_worker ON jobs(assigned_worker_id) WHERE assigned_worker_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_completion_date ON jobs(completion_date) WHERE completion_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_recurring ON jobs(is_recurring, parent_job_id) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_jobs_metadata ON jobs USING gin(metadata) WHERE metadata != '{}';
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date_status ON jobs(scheduled_date, status);

-- Ensure job_service_items foreign key exists and is properly indexed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'job_service_items' AND constraint_name = 'fk_job_service_items_job'
  ) THEN
    ALTER TABLE job_service_items 
    ADD CONSTRAINT fk_job_service_items_job 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add composite index for job service items
CREATE INDEX IF NOT EXISTS idx_job_service_items_job_sort ON job_service_items(job_id, sort_order);

-- Update existing jobs to have proper status if they don't
UPDATE jobs SET status = 'scheduled' WHERE status IS NULL;

-- Add trigger to automatically set completion_date when status changes to completed
CREATE OR REPLACE FUNCTION update_job_completion_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Set completion_date when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completion_date = now();
  END IF;
  
  -- Clear completion_date if status changes away from completed
  IF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completion_date = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trigger_update_job_completion_date'
  ) THEN
    CREATE TRIGGER trigger_update_job_completion_date
      BEFORE UPDATE ON jobs
      FOR EACH ROW
      EXECUTE FUNCTION update_job_completion_date();
  END IF;
END $$;