import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Repeat, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface SchedulingSectionProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

const SchedulingSection: React.FC<SchedulingSectionProps> = ({ formData, onChange }) => {
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Get calendar days for the current month
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Check if a date should be highlighted based on scheduling
  const isScheduledDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    if (formData.jobType === 'one-off') {
      return dateString === formData.startDate || 
             (formData.endDate && dateString >= formData.startDate && dateString <= formData.endDate);
    } else if (formData.jobType === 'recurring' && formData.startDate) {
      const startDate = new Date(formData.startDate);
      
      if (formData.repeatType === 'weekly') {
        const dayOfWeek = date.getDay();
        const targetDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          .indexOf(formData.weeklyDay);
        return dayOfWeek === targetDay && date >= startDate;
      } else if (formData.repeatType === 'monthly') {
        return date.getDate() === formData.monthlyDate && date >= startDate;
      }
    }
    
    return false;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentCalendarDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentCalendarDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentCalendarDate.getMonth();
  };

  const calendarDays = getCalendarDays(currentCalendarDate);
  const monthName = currentCalendarDate.toLocaleDateString([], { month: 'long', year: 'numeric' });

  // Auto-populate end date when start date changes for one-off jobs
  const handleStartDateChange = (value: string) => {
    onChange('startDate', value);
    if (formData.jobType === 'one-off' && !formData.endDate) {
      onChange('endDate', value);
    }
  };

  // Auto-populate weekly day when start date changes for recurring jobs
  const handleRecurringStartDateChange = (value: string) => {
    onChange('startDate', value);
    if (formData.repeatType === 'weekly' && value) {
      const date = new Date(value);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      onChange('weeklyDay', dayName);
    }
    if (formData.repeatType === 'monthly' && value) {
      const date = new Date(value);
      onChange('monthlyDate', date.getDate());
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Scheduling Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-dm-sans font-bold text-dark-slate mb-6 flex items-center">
            <Calendar className="h-6 w-6 text-forest mr-2" />
            Scheduling
          </h2>
          <div className="space-y-6">
          {/* Job Type Selection */}
          <div>
            <label className="block text-sm font-inter font-medium text-dark-slate mb-3">
              Job Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="jobType"
                  value="one-off"
                  checked={formData.jobType === 'one-off'}
                  onChange={(e) => onChange('jobType', e.target.value)}
                  className="mr-2 text-forest focus:ring-forest border-gray-300"
                />
                <span className="font-inter text-dark-slate">One-Off Job</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="jobType"
                  value="recurring"
                  checked={formData.jobType === 'recurring'}
                  onChange={(e) => onChange('jobType', e.target.value)}
                  className="mr-2 text-forest focus:ring-forest border-gray-300"
                />
                <span className="font-inter text-dark-slate">Recurring Job</span>
              </label>
            </div>
          </div>

          {/* One-Off Job Scheduling */}
          {formData.jobType === 'one-off' && (
            <div className="space-y-4">
              <h3 className="text-base font-dm-sans font-semibold text-dark-slate flex items-center">
                <CalendarDays className="h-5 w-5 text-forest mr-2" />
                Schedule
              </h3>

              {/* Date Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => onChange('endDate', e.target.value)}
                    min={formData.startDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                  />
                </div>
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Start Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => onChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    End Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => onChange('endTime', e.target.value)}
                    min={formData.startTime}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                  />
                </div>
              </div>

              {/* Schedule Later Option */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!formData.scheduleNow}
                    onChange={(e) => onChange('scheduleNow', !e.target.checked)}
                    className="mr-2 text-forest focus:ring-forest border-gray-300 rounded"
                  />
                  <span className="text-sm font-inter text-gray-700">Schedule Later</span>
                </label>
                {!formData.scheduleNow && (
                  <span className="text-xs text-gray-500 font-inter">
                    Job will be created without specific scheduling
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Recurring Job Scheduling */}
          {formData.jobType === 'recurring' && (
            <div className="space-y-4">
              <h3 className="text-base font-dm-sans font-semibold text-dark-slate flex items-center">
                <Repeat className="h-5 w-5 text-forest mr-2" />
                Recurring Schedule
              </h3>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleRecurringStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                  Duration
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    value={formData.duration}
                    onChange={(e) => onChange('duration', parseInt(e.target.value) || 1)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                    placeholder="1"
                  />
                  <select
                    value={formData.durationUnit}
                    onChange={(e) => onChange('durationUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              {/* Repeat Options */}
              <div>
                <label className="block text-sm font-inter font-medium text-dark-slate mb-3">
                  Repeats
                </label>
                <select
                  value={formData.repeatType}
                  onChange={(e) => onChange('repeatType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                >
                  <option value="as-needed">As Needed</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom Schedule Selector</option>
                </select>
              </div>

              {/* Weekly Day Selector - shown when weekly is selected */}
              {formData.repeatType === 'weekly' && (
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Weekly on
                  </label>
                  <select
                    value={formData.weeklyDay}
                    onChange={(e) => onChange('weeklyDay', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                  >
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
              )}

              {/* Monthly Date Selector - shown when monthly is selected */}
              {formData.repeatType === 'monthly' && (
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Monthly on the
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.monthlyDate}
                      onChange={(e) => onChange('monthlyDate', parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                    />
                    <span className="font-inter text-dark-slate">th of each month</span>
                  </div>
                </div>
              )}

              {/* Custom Schedule Button - shown when custom is selected */}
              {formData.repeatType === 'custom' && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(true)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors font-inter text-sm"
                  >
                    Configure Custom Schedule
                  </button>
                </div>
              )}

              {/* Time Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    Start Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => onChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-inter font-medium text-dark-slate mb-2">
                    End Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => onChange('endTime', e.target.value)}
                    min={formData.startTime}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent font-inter text-sm"
                  />
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Right Side - Calendar Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
          <h3 className="text-base font-dm-sans font-semibold text-dark-slate">
            Schedule Preview
          </h3>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="font-inter font-medium text-dark-slate text-sm">
                {monthName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center">
                  <div className="text-xs font-inter font-semibold text-gray-700">
                    {day}
                  </div>
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, index) => {
                const isCurrentMonthDay = isCurrentMonth(date);
                const isTodayDate = isToday(date);
                const isScheduled = isScheduledDate(date);
                
                return (
                  <div 
                    key={index} 
                    className={`min-h-[32px] border-r border-b border-gray-200 p-1 text-center ${
                      !isCurrentMonthDay ? 'bg-gray-50' : 'bg-white'
                    } ${isTodayDate ? 'bg-blue-50 ring-1 ring-blue-200' : ''} ${
                      isScheduled ? 'bg-forest/10 ring-1 ring-forest/30' : ''
                    }`}
                  >
                    <div className={`text-xs font-inter ${
                      !isCurrentMonthDay ? 'text-gray-400' : 
                      isTodayDate ? 'text-blue-600 font-bold' : 
                      isScheduled ? 'text-forest font-bold' : 'text-dark-slate'
                    }`}>
                      {date.getDate()}
                    </div>
                    {isScheduled && (
                      <div className="w-1 h-1 bg-forest rounded-full mx-auto mt-1"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 text-xs font-inter">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-forest/10 border border-forest/30 rounded"></div>
              <span className="text-gray-600">Scheduled</span>
            </div>
          </div>
          </div>

          {/* Schedule Summary */}
        </div>
      </div>

      {/* Custom Schedule Modal */}
      {showCustomModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowCustomModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-dm-sans font-bold text-dark-slate">
                  Custom Schedule
                </h3>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600 font-inter">
                  Custom scheduling patterns will be available in a future update. 
                  For now, please use the weekly or monthly options.
                </p>
                
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="w-full bg-forest text-white py-2 rounded-lg hover:bg-forest/90 transition-colors font-inter font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Summary - moved here and improved */}
          {(formData.startDate || formData.scheduleNow) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-blue-100 p-1.5 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-sm font-dm-sans font-bold text-blue-900">
                  Schedule Summary
                </h4>
              </div>
              <div className="text-xs text-blue-800 space-y-2 font-inter">
                {formData.jobType === 'one-off' ? (
                  <>
                    {formData.scheduleNow ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          <span><strong>Type:</strong> One-time job</span>
                        </div>
                        {formData.startDate && (
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                            <span><strong>Date:</strong> {new Date(formData.startDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                        )}
                        {formData.endDate && formData.endDate !== formData.startDate && (
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                            <span><strong>End:</strong> {new Date(formData.endDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                        )}
                        {formData.startTime && (
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                            <span><strong>Time:</strong> {formData.startTime}{formData.endTime ? ` - ${formData.endTime}` : ''}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        <span>Will be scheduled later</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      <span><strong>Type:</strong> Recurring job</span>
                    </div>
                    {formData.startDate && (
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        <span><strong>Starts:</strong> {new Date(formData.startDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      <span><strong>Duration:</strong> {formData.duration} {formData.durationUnit}</span>
                    </div>
                    {formData.repeatType === 'weekly' && (
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        <span><strong>Repeats:</strong> Every {formData.weeklyDay}</span>
                      </div>
                    )}
                    {formData.repeatType === 'monthly' && (
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        <span><strong>Repeats:</strong> {formData.monthlyDate}th of each month</span>
                      </div>
                    )}
                    {formData.repeatType === 'as-needed' && (
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        <span><strong>Repeats:</strong> As needed</span>
                      </div>
                    )}
                    {formData.startTime && (
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        <span><strong>Time:</strong> {formData.startTime}{formData.endTime ? ` - ${formData.endTime}` : ''}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SchedulingSection;