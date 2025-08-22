/*
  # Fix Recurring Jobs System

  1. Database Functions
    - `calculate_next_occurrence` - Calculates next occurrence date for recurring jobs
    - `generate_recurring_jobs` - Generates future job instances for recurring jobs
    - `trigger_generate_recurring_jobs_direct` - Trigger function to auto-generate recurring jobs

  2. Database Trigger
    - `trigger_generate_recurring_jobs` - Automatically generates recurring jobs after insert

  3. Performance Optimizations
    - Indexes for efficient querying of recurring jobs
    - Cleanup utility function for old completed jobs

  This migration fixes the ambiguous column reference error and implements
  automatic recurring job generation.
*/

-- Helper function to calculate the next occurrence date for recurring jobs
CREATE OR REPLACE FUNCTION calculate_next_occurrence(
  base_date DATE,
  occurrence_number INTEGER,
  repeat_type TEXT,
  weekly_day TEXT DEFAULT NULL,
  monthly_date INTEGER DEFAULT NULL
) RETURNS DATE AS $$
DECLARE
  next_date DATE;
  target_day_of_week INTEGER;
  days_to_add INTEGER;
BEGIN
  CASE repeat_type
    WHEN 'weekly' THEN
      -- Convert day name to day of week number (0 = Sunday, 6 = Saturday)
      target_day_of_week := CASE weekly_day
        WHEN 'Sunday' THEN 0
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        ELSE EXTRACT(DOW FROM base_date)::INTEGER
      END;
      
      -- Calculate days to add to get to the target day of week
      days_to_add := (target_day_of_week - EXTRACT(DOW FROM base_date)::INTEGER + 7) % 7;
      IF days_to_add = 0 AND occurrence_number > 0 THEN
        days_to_add := 7; -- If it's the same day, move to next week for subsequent occurrences
      END IF;
      
      next_date := base_date + (days_to_add + (occurrence_number * 7))::INTEGER;
      
    WHEN 'monthly' THEN
      -- Add months and set to specific date
      next_date := (base_date + INTERVAL '1 month' * occurrence_number)::DATE;
      
      -- Handle month-end edge cases
      IF monthly_date IS NOT NULL THEN
        -- Try to set to the target date
        BEGIN
          next_date := DATE_TRUNC('month', next_date)::DATE + (monthly_date - 1)::INTEGER;
        EXCEPTION WHEN OTHERS THEN
          -- If the date doesn't exist in that month (e.g., Feb 31), use last day of month
          next_date := (DATE_TRUNC('month', next_date) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
        END;
      END IF;
      
    WHEN 'as-needed' THEN
      -- For as-needed jobs, don't auto-generate
      RETURN NULL;
      
    ELSE
      -- Default case or unknown repeat type
      RETURN NULL;
  END CASE;
  
  RETURN next_date;
END;
$$ LANGUAGE plpgsql;

-- Main function to generate recurring job instances
CREATE OR REPLACE FUNCTION generate_recurring_jobs(parent_job_id UUID)
RETURNS VOID AS $$
DECLARE
  parent_job RECORD;
  recurrence_data JSONB;
  repeat_type TEXT;
  duration_value INTEGER;
  duration_unit TEXT;
  weekly_day TEXT;
  monthly_date INTEGER;
  start_time TIME;
  end_time TIME;
  max_occurrences INTEGER;
  occurrence_count INTEGER;
  next_date DATE;
  new_job_data RECORD;
  service_item RECORD;
BEGIN
  -- Get the parent job details
  SELECT * INTO parent_job
  FROM jobs 
  WHERE id = parent_job_id AND is_recurring = true;
  
  -- Exit if parent job not found or not recurring
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Parse recurrence pattern
  recurrence_data := parent_job.recurrence_pattern;
  IF recurrence_data IS NULL THEN
    RETURN;
  END IF;
  
  -- Extract recurrence parameters
  repeat_type := recurrence_data->>'repeatType';
  duration_value := COALESCE((recurrence_data->>'duration')::INTEGER, 1);
  duration_unit := COALESCE(recurrence_data->>'durationUnit', 'weeks');
  weekly_day := recurrence_data->>'weeklyDay';
  monthly_date := (recurrence_data->>'monthlyDate')::INTEGER;
  start_time := (recurrence_data->>'startTime')::TIME;
  end_time := (recurrence_data->>'endTime')::TIME;
  
  -- Calculate maximum number of occurrences based on duration
  max_occurrences := CASE duration_unit
    WHEN 'days' THEN LEAST(duration_value, 365) -- Cap at 1 year
    WHEN 'weeks' THEN LEAST(duration_value, 52) -- Cap at 1 year
    WHEN 'months' THEN LEAST(duration_value * 4, 52) -- Approximate weekly occurrences, cap at 1 year
    WHEN 'years' THEN LEAST(duration_value * 52, 104) -- Approximate weekly occurrences, cap at 2 years
    ELSE 12 -- Default fallback
  END;
  
  -- Cap at reasonable maximum to prevent database overload
  max_occurrences := LEAST(max_occurrences, 52);
  
  -- Generate recurring job instances
  FOR occurrence_count IN 1..max_occurrences LOOP
    -- Calculate next occurrence date
    next_date := calculate_next_occurrence(
      COALESCE(parent_job.scheduled_date, CURRENT_DATE),
      occurrence_count,
      repeat_type,
      weekly_day,
      monthly_date
    );
    
    -- Skip if no valid date calculated
    IF next_date IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Stop if date is too far in the future (safety check)
    IF next_date > CURRENT_DATE + INTERVAL '2 years' THEN
      EXIT;
    END IF;
    
    -- Insert the new recurring job instance
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
      COALESCE(start_time, parent_job.scheduled_time),
      parent_job.estimated_duration,
      parent_job.estimated_cost,
      parent_job.notes,
      parent_job.metadata,
      parent_job.attachments,
      parent_job.checklist,
      true, -- Mark as recurring
      parent_job_id, -- Link to parent job
      parent_job.recurrence_pattern -- Copy recurrence pattern
    ) RETURNING * INTO new_job_data;
    
    -- Copy service items from parent job to the new job instance
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
      new_job_data.id,
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
  
  RAISE NOTICE 'Generated % recurring job instances for job %', max_occurrences, parent_job_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function that calls the recurring job generator
CREATE OR REPLACE FUNCTION trigger_generate_recurring_jobs_direct()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate recurring jobs for new recurring jobs that aren't themselves generated
  IF NEW.is_recurring = true AND NEW.parent_job_id IS NULL THEN
    PERFORM generate_recurring_jobs(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (drop first if it exists)
DROP TRIGGER IF EXISTS trigger_generate_recurring_jobs ON jobs;

CREATE TRIGGER trigger_generate_recurring_jobs
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_recurring_jobs_direct();

-- Add indexes for better performance on recurring job queries
CREATE INDEX IF NOT EXISTS idx_jobs_recurring ON jobs (is_recurring, parent_job_id) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_jobs_recurring_parent ON jobs (parent_job_id) WHERE parent_job_id IS NOT NULL;

-- Utility function to clean up old completed recurring jobs (optional)
CREATE OR REPLACE FUNCTION cleanup_old_recurring_jobs(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete completed recurring jobs older than specified days
  DELETE FROM jobs 
  WHERE is_recurring = true 
    AND parent_job_id IS NOT NULL 
    AND status = 'completed'
    AND completion_date < CURRENT_DATE - INTERVAL '1 day' * days_old;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;