// src/components/jobs/RecurrenceEditor.tsx
import { useState } from 'react';
import type { Repeat, DurationPreset } from '@/utils/recurrence';

// === Recurrence helpers (inline for now) ===
const weekdayToNum: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

function ensureHHMMSS(t: string) {
  if (!t) return null;
  return t.length === 5 ? `${t}:00` : t; // "09:00" -> "09:00:00"
}

function addPeriod(start: string, kind: 'weeks'|'months'|'years', amount: number): string {
  const d = new Date(`${start}T00:00:00`);
  if (kind === 'weeks') d.setDate(d.getDate() + amount * 7);
  if (kind === 'months') d.setMonth(d.getMonth() + amount);
  if (kind === 'years') d.setFullYear(d.getFullYear() + amount);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Map your formData into the JSON `recurrence_pattern` your SQL expects.
 * Supports your current fields: jobType, repeatType, duration(+Unit), weeklyDay, monthlyDate, startDate.
 */
function buildRecurrencePattern(formData: EditJobFormData) {
  if (formData.jobType !== 'recurring') return null;

  const start_date = formData.startDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
    throw new Error('Start date is required for recurring jobs.');
  }

  // Duration -> end_date
  let end_date: string | null = null;
  const { duration, durationUnit } = formData; // 1 + 'weeks' | 'months' | 'years'
  if (duration && durationUnit) {
    end_date = addPeriod(start_date, durationUnit === 'days' ? 'weeks' : (durationUnit as any), durationUnit === 'days' ? Math.ceil(duration/7) : duration);
  }

  const base: any = {
    interval: 1,
    start_date,
    end_date,
    tz: 'America/Denver', // or read from profile
  };

  // Map repeatType to freq + specifics
  if (formData.repeatType === 'weekly') {
    base.freq = 'weekly';
    // Your form has a single `weeklyDay` string like "Monday"
    const dayNum = weekdayToNum[formData.weeklyDay] ?? 1; // default Monday
    base.byweekday = [dayNum];
  } else if (formData.repeatType === 'monthly') {
    base.freq = 'monthly';
    base.bymonthday = formData.monthlyDate || 1;
  } else if (formData.repeatType === 'as-needed') {
    // No real recurrence rule → treat as one-off
    return null;
  } else {
    // 'custom' not yet modeled → you can extend later
    base.freq = 'weekly';
    base.byweekday = [weekdayToNum['Monday']];
  }

  return base;
}


export type RecurrenceState = {
  isRecurring: boolean;
  repeat: Repeat;
  interval: number;
  weeklyDays: string[];      // ['mon','wed']
  monthDay: number | '';
  duration: DurationPreset;
  tz: string;
};

export default function RecurrenceEditor(props: {
  value: RecurrenceState;
  onChange: (v: RecurrenceState) => void;
}) {
  const { value, onChange } = props;

  const toggleDay = (k: string) =>
    onChange({
      ...value,
      weeklyDays: value.weeklyDays.includes(k)
        ? value.weeklyDays.filter(x => x !== k)
        : [...value.weeklyDays, k],
    });

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.isRecurring}
          onChange={e => onChange({ ...value, isRecurring: e.target.checked })}
        />
        <span>Make recurring</span>
      </label>

      {value.isRecurring && (
        <>
          <div className="flex gap-3">
            <label className="flex flex-col">
              <span>Repeats</span>
              <select
                value={value.repeat}
                onChange={e => onChange({ ...value, repeat: e.target.value as Repeat })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span>Interval</span>
              <input
                type="number"
                min={1}
                value={value.interval}
                onChange={e => onChange({ ...value, interval: parseInt(e.target.value || '1', 10) })}
              />
            </label>

            <label className="flex flex-col">
              <span>Duration</span>
              <select
                value={value.duration}
                onChange={e => onChange({ ...value, duration: e.target.value as DurationPreset })}
              >
                <option value="1w">1 week</option>
                <option value="2w">2 weeks</option>
                <option value="1m">1 month</option>
                <option value="3m">3 months</option>
                <option value="6m">6 months</option>
                <option value="1y">1 year</option>
                <option value="none">No end date</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span>Timezone</span>
              <input
                value={value.tz}
                onChange={e => onChange({ ...value, tz: e.target.value })}
              />
            </label>
          </div>

          {value.repeat === 'weekly' && (
            <div className="flex items-center gap-3">
              <span>Weekly on</span>
              {['sun','mon','tue','wed','thu','fri','sat'].map(k => (
                <label key={k} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={value.weeklyDays.includes(k)}
                    onChange={() => toggleDay(k)}
                  />
                  <span className="uppercase">{k}</span>
                </label>
              ))}
            </div>
          )}

          {value.repeat === 'monthly' && (
            <label className="flex items-center gap-2">
              <span>Day of month</span>
              <input
                type="number"
                min={1}
                max={31}
                value={value.monthDay}
                onChange={e => onChange({ ...value, monthDay: Number(e.target.value) })}
              />
            </label>
          )}
        </>
      )}
    </div>
  );
}
