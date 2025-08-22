/*
  # Recurring Jobs Generation System

  1. New Functions
    - `generate_recurring_jobs(job_id uuid)` - Generates future job instances based on recurrence pattern
    - `calculate_next_occurrence(start_date date, pattern jsonb, occurrence_number integer)` - Helper function to calculate specific occurrence dates

  2. New Triggers
    - `trigger_generate_recurring_jobs` - Automatically generates recurring jobs when a new recurring job is created

  3. Features
    - Supports weekly and monthly recurrence patterns
    - Generates up to 12 future occurrences by default
    - Preserves all job details from parent job
    - Links generated jobs to parent via `parent_job_id`
    - Handles edge cases like month-end dates for monthly recurrence
*/

-- Helper function to calculate the next occurrence date
CREATE OR REPLACE FUNCTION calculate_next_occurrence(
  start_date date,
  pattern jsonb,
  occurrence_number integer
) RETURNS date AS $$
DECLARE
  repeat_type text;
  weekly_day text;
  monthly_date integer;
  target_day_of_week integer;
  next_date date;
  days_to_add integer;
  target_month_date integer;
BEGIN
  repeat_type := pattern->>'repeatType';
  
  IF repeat_type = 'weekly' THEN
    weekly_day := pattern->>'weeklyDay';
    
    -- Convert day name to day of week number (0 = Sunday, 6 = Saturday)
    target_day_of_week := CASE weekly_day
      WHEN 'Sunday' THEN 0
      WHEN 'Monday' THEN 1
      WHEN 'Tuesday' THEN 2
      WHEN 'Wednesday' THEN 3
      WHEN 'Thursday' THEN 4
      WHEN 'Friday' THEN 5
      WHEN 'Saturday' THEN 6
      ELSE EXTRACT(DOW FROM start_date)::integer
    END;
    
    -- Calculate the date for this occurrence
    next_date := start_date + (occurrence_number * 7);
    
    -- Adjust to the correct day of week if needed
    days_to_add := (target_day_of_week - EXTRACT(DOW FROM next_date)::integer + 7) % 7;
    next_date := next_date + days_to_add;
    
    RETURN next_date;
    
  ELSIF repeat_type = 'monthly' THEN
    monthly_date := COALESCE((pattern->>'monthlyDate')::integer, EXTRACT(DAY FROM start_date)::integer);
    
    -- Calculate target month
    next_date := start_date + (occurrence_number || ' months')::interval;
    
    -- Set to the target day of month, handling month-end edge cases
    target_month_date := LEAST(monthly_date, EXTRACT(DAY FROM (date_trunc('month', next_date) + interval '1 month - 1 day'))::integer);
    next_date := date_trunc('month', next_date) + (target_month_date - 1 || ' days')::interval;
    
    RETURN next_date::date;
    
  ELSE
    -- For 'as-needed' or other types, don't generate automatic occurrences
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Main function to generate recurring jobs
CREATE OR REPLACE FUNCTION generate_recurring_jobs(parent_job_id uuid)
RETURNS void AS $$
DECLARE
  parent_job record;
  pattern jsonb;
  repeat_type text;
  duration_value integer;
  duration_unit text;
  max_occurrences integer;
  occurrence_count integer;
  next_date date;
  new_job_data jsonb;
  scheduled_time time;
BEGIN
  -- Get the parent job details
  SELECT * INTO parent_job
  FROM jobs
  WHERE id = parent_job_id AND is_recurring = true;
  
  -- Exit if job not found or not recurring
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  pattern := parent_job.recurrence_pattern;
  repeat_type := pattern->>'repeatType';
  
  -- Exit early for 'as-needed' jobs - they don't auto-generate
  IF repeat_type = 'as-needed' THEN
    RETURN;
  END IF;
  
  duration_value := COALESCE((pattern->>'duration')::integer, 1);
  duration_unit := COALESCE(pattern->>'durationUnit', 'months');
  
  -- Calculate maximum occurrences based on duration
  max_occurrences := CASE duration_unit
    WHEN 'days' THEN LEAST(duration_value, 30) -- Max 30 daily occurrences
    WHEN 'weeks' THEN LEAST(duration_value, 52) -- Max 52 weekly occurrences  
    WHEN 'months' THEN LEAST(duration_value * 4, 48) -- Max 48 monthly occurrences (4 per month)
    WHEN 'years' THEN LEAST(duration_value * 12, 60) -- Max 60 yearly occurrences (12 per year)
    ELSE 12 -- Default fallback
  END;
  
  -- Cap at reasonable maximum to prevent database overload
  max_occurrences := LEAST(max_occurrences, 100);
  
  -- Extract scheduled time if available
  scheduled_time := NULL;
  IF pattern ? 'startTime' AND (pattern->>'startTime') != '' THEN
    scheduled_time := (pattern->>'startTime')::time;
  ELSIF parent_job.scheduled_time IS NOT NULL THEN
    scheduled_time := parent_job.scheduled_time;
  END IF;
  
  -- Generate future occurrences
  FOR occurrence_count IN 1..max_occurrences LOOP
    -- Calculate the next occurrence date
    next_date := calculate_next_occurrence(
      COALESCE(parent_job.scheduled_date, CURRENT_DATE),
      pattern,
      occurrence_count
    );
    
    -- Skip if we couldn't calculate a valid date
    IF next_date IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Skip if the date is too far in the past (more than 1 day ago)
    IF next_date < CURRENT_DATE - interval '1 day' THEN
      CONTINUE;
    END IF;
    
    -- Create the new job record
    INSERT INTO jobs (
      title,
      description,
      client_id,
      business_id,
      created_by,
      status,
      priority,
      scheduled_date,
      scheduled_time,
      estimated_duration,
      estimated_cost,
      notes,
      metadata,
      attachments,
      checklist,
      is_recurring,
      parent_job_id,
      recurrence_pattern
    ) VALUES (
      parent_job.title,
      parent_job.description,
      parent_job.client_id,
      parent_job.business_id,
      parent_job.created_by,
      'scheduled', -- All generated jobs start as scheduled
      parent_job.priority,
      next_date,
      scheduled_time,
      parent_job.estimated_duration,
      parent_job.estimated_cost,
      parent_job.notes,
      parent_job.metadata,
      parent_job.attachments,
      parent_job.checklist,
      true, -- Generated jobs are also marked as recurring
      parent_job_id, -- Link back to the parent job
      pattern -- Copy the same recurrence pattern
    );
    
    -- Copy service items from parent job if they exist
    INSERT INTO job_service_items (
      job_id,
      business_id,
      item_name,
      quantity,
      unit_cost,
      unit_price,
      description,
      sort_order
    )
    SELECT 
      (SELECT id FROM jobs WHERE parent_job_id = parent_job_id ORDER BY created_at DESC LIMIT 1), -- Get the just-inserted job ID
      business_id,
      item_name,
      quantity,
      unit_cost,
      unit_price,
      description,
      sort_order
    FROM job_service_items
    WHERE job_id = parent_job_id;
    
  END LOOP;
  
  RAISE NOTICE 'Generated % recurring job occurrences for job %', max_occurrences, parent_job_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to automatically generate recurring jobs
CREATE OR REPLACE FUNCTION trigger_generate_recurring_jobs()
RETURNS trigger AS $$
BEGIN
  -- Only generate for new recurring jobs that are not themselves generated from a parent
  IF NEW.is_recurring = true AND NEW.parent_job_id IS NULL THEN
    -- Use pg_notify to trigger async job generation to avoid blocking the insert
    PERFORM pg_notify('generate_recurring_jobs', NEW.id::text);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_generate_recurring_jobs ON jobs;
CREATE TRIGGER trigger_generate_recurring_jobs
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_recurring_jobs();

-- Create a function to handle the async job generation
CREATE OR REPLACE FUNCTION handle_recurring_job_generation()
RETURNS void AS $$
DECLARE
  job_id_text text;
  job_id_uuid uuid;
BEGIN
  -- Listen for notifications
  LOOP
    -- This would typically be called by a background worker
    -- For now, we'll call generate_recurring_jobs directly in the trigger
    EXIT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Alternative: Direct trigger approach (simpler, but blocks the insert briefly)
CREATE OR REPLACE FUNCTION trigger_generate_recurring_jobs_direct()
RETURNS trigger AS $$
BEGIN
  -- Only generate for new recurring jobs that are not themselves generated from a parent
  IF NEW.is_recurring = true AND NEW.parent_job_id IS NULL THEN
    -- Generate recurring jobs immediately
    PERFORM generate_recurring_jobs(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace the trigger with the direct approach for simplicity
DROP TRIGGER IF EXISTS trigger_generate_recurring_jobs ON jobs;
CREATE TRIGGER trigger_generate_recurring_jobs
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_recurring_jobs_direct();

-- Add helpful indexes for recurring job queries
CREATE INDEX IF NOT EXISTS idx_jobs_recurring_parent ON jobs (parent_job_id) WHERE parent_job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_is_recurring ON jobs (is_recurring) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date_status ON jobs (scheduled_date, status) WHERE scheduled_date IS NOT NULL;

-- Add a function to clean up old recurring jobs (optional utility)
CREATE OR REPLACE FUNCTION cleanup_old_recurring_jobs(days_old integer DEFAULT 365)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete completed recurring jobs older than specified days
  DELETE FROM jobs 
  WHERE is_recurring = true 
    AND parent_job_id IS NOT NULL 
    AND status = 'completed'
    AND completion_date < CURRENT_DATE - (days_old || ' days')::interval;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;