// src/components/jobs/RecurrenceEditor.tsx
import { useState } from 'react';
import type { Repeat, DurationPreset } from '@/utils/recurrence';

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
