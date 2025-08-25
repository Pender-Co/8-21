// src/utils/recurrence.ts
export const weekdayToNum: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

export function addPeriod(start: string, kind: 'weeks'|'months'|'years', amount: number): string {
  const d = new Date(start + 'T00:00:00');
  if (kind === 'weeks') d.setDate(d.getDate() + amount * 7);
  if (kind === 'months') d.setMonth(d.getMonth() + amount);
  if (kind === 'years') d.setFullYear(d.getFullYear() + amount);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export type Repeat = 'daily'|'weekly'|'monthly'|'yearly';
export type DurationPreset = '1w'|'2w'|'1m'|'3m'|'6m'|'1y'|'none';

export function buildRecurrencePattern(params: {
  isRecurring: boolean;
  repeat: Repeat;
  interval: number;
  weeklyDays: string[];     // ['mon','wed']
  monthDay?: number | '';
  scheduledDate: string;    // 'YYYY-MM-DD'
  duration: DurationPreset;
  tz: string;
}) {
  const { isRecurring, repeat, interval, weeklyDays, monthDay, scheduledDate, duration, tz } = params;
  if (!isRecurring) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) throw new Error('Start date is required (YYYY-MM-DD)');

  let end_date: string | null = null;
  if (duration !== 'none') {
    if (duration.endsWith('w')) end_date = addPeriod(scheduledDate, 'weeks', parseInt(duration, 10));
    if (duration.endsWith('m')) end_date = addPeriod(scheduledDate, 'months', parseInt(duration, 10));
    if (duration.endsWith('y')) end_date = addPeriod(scheduledDate, 'years', parseInt(duration, 10));
  }

  const base: any = {
    freq: repeat,
    interval: interval || 1,
    start_date: scheduledDate,
    end_date,
    tz,
  };

  if (repeat === 'weekly') {
    const nums = weeklyDays.map(k => weekdayToNum[k]).filter(n => n !== undefined);
    if (nums.length === 0) throw new Error('Pick at least one weekday');
    base.byweekday = nums;
  } else if (repeat === 'monthly') {
    if (!monthDay || monthDay < 1 || monthDay > 31) throw new Error('Pick a day of month 1..31');
    base.bymonthday = monthDay;
  }

  return base;
}

export function ensureHHMMSS(t: string) {
  return t.length === 5 ? `${t}:00` : t;
}
