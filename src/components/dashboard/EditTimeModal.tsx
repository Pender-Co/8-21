import React, { useState, useEffect } from 'react';
import { X, Clock, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TimeEntry {
  id: string;
  user_id: string;
  business_id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  break_start_time: string | null;
  break_end_time: string | null;
  total_break_minutes: number;
  location_clock_in: string | null;
  location_clock_out: string | null;
  job_site: string | null;
  notes: string | null;
  status: 'active' | 'on_break' | 'completed';
  created_at: string;
  updated_at: string;
  user_profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

interface EditTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeEntry: TimeEntry | null;
  onTimeUpdated: () => void;
}

const EditTimeModal: React.FC<EditTimeModalProps> = ({ 
  isOpen, 
  onClose, 
  timeEntry, 
  onTimeUpdated 
}) => {
  const [formData, setFormData] = useState({
    clockInDate: '',
    clockInTime: '',
    clockOutDate: '',
    clockOutTime: '',
    breakStartDate: '',
    breakStartTime: '',
    breakEndDate: '',
    breakEndTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Initialize form data when modal opens or timeEntry changes
  useEffect(() => {
    if (isOpen && timeEntry) {
      const clockInDate = new Date(timeEntry.clock_in_time);
      
      setFormData({
        clockInDate: clockInDate.toISOString().split('T')[0],
        clockInTime: clockInDate.toTimeString().slice(0, 5),
        clockOutDate: timeEntry.clock_out_time ? new Date(timeEntry.clock_out_time).toISOString().split('T')[0] : '',
        clockOutTime: timeEntry.clock_out_time ? new Date(timeEntry.clock_out_time).toTimeString().slice(0, 5) : '',
        breakStartDate: timeEntry.break_start_time ? new Date(timeEntry.break_start_time).toISOString().split('T')[0] : '',
        breakStartTime: timeEntry.break_start_time ? new Date(timeEntry.break_start_time).toTimeString().slice(0, 5) : '',
        breakEndDate: timeEntry.break_end_time ? new Date(timeEntry.break_end_time).toISOString().split('T')[0] : '',
        breakEndTime: timeEntry.break_end_time ? new Date(timeEntry.break_end_time).toTimeString().slice(0, 5) : ''
      });
      setError('');
    }
  }, [isOpen, timeEntry]);

  if (!isOpen || !timeEntry) return null;

  const getWorkerName = () => {
    if (!timeEntry.user_profiles) return 'Unknown Worker';
    
    if (timeEntry.user_profiles.first_name && timeEntry.user_profiles.last_name) {
      return `${timeEntry.user_profiles.first_name} ${timeEntry.user_profiles.last_name}`;
    }
    return timeEntry.user_profiles.email.split('@')[0];
  };

  const validateTimes = () => {
    const errors = [];

    // Clock in is required
    if (!formData.clockInDate || !formData.clockInTime) {
      errors.push('Clock in date and time are required');
    }

    // If clock out is provided, validate it's after clock in
    if (formData.clockOutDate && formData.clockOutTime) {
      const clockIn = new Date(`${formData.clockInDate}T${formData.clockInTime}`);
      const clockOut = new Date(`${formData.clockOutDate}T${formData.clockOutTime}`);
      
      if (clockOut <= clockIn) {
        errors.push('Clock out time must be after clock in time');
      }
    }

    // If break times are provided, validate them
    if (formData.breakStartDate && formData.breakStartTime) {
      const clockIn = new Date(`${formData.clockInDate}T${formData.clockInTime}`);
      const breakStart = new Date(`${formData.breakStartDate}T${formData.breakStartTime}`);
      
      if (breakStart < clockIn) {
        errors.push('Break start time must be after clock in time');
      }

      // If break end is provided, validate it's after break start
      if (formData.breakEndDate && formData.breakEndTime) {
        const breakEnd = new Date(`${formData.breakEndDate}T${formData.breakEndTime}`);
        
        if (breakEnd <= breakStart) {
          errors.push('Break end time must be after break start time');
        }

        // If clock out is provided, break end must be before clock out
        if (formData.clockOutDate && formData.clockOutTime) {
          const clockOut = new Date(`${formData.clockOutDate}T${formData.clockOutTime}`);
          if (breakEnd > clockOut) {
            errors.push('Break end time must be before clock out time');
          }
        }
      }
    }

    // If only break end is provided without break start
    if ((formData.breakEndDate || formData.breakEndTime) && (!formData.breakStartDate || !formData.breakStartTime)) {
      errors.push('Break start time is required when break end time is provided');
    }

    return errors;
  };

  const calculateBreakMinutes = () => {
    if (!formData.breakStartDate || !formData.breakStartTime || !formData.breakEndDate || !formData.breakEndTime) {
      return 0;
    }

    const breakStart = new Date(`${formData.breakStartDate}T${formData.breakStartTime}`);
    const breakEnd = new Date(`${formData.breakEndDate}T${formData.breakEndTime}`);
    
    return Math.max(0, Math.floor((breakEnd.getTime() - breakStart.getTime()) / (1000 * 60)));
  };

  const handleSave = async () => {
    const validationErrors = validateTimes();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const clockInDateTime = new Date(`${formData.clockInDate}T${formData.clockInTime}`).toISOString();
      const clockOutDateTime = (formData.clockOutDate && formData.clockOutTime) 
        ? new Date(`${formData.clockOutDate}T${formData.clockOutTime}`).toISOString()
        : null;
      const breakStartDateTime = (formData.breakStartDate && formData.breakStartTime)
        ? new Date(`${formData.breakStartDate}T${formData.breakStartTime}`).toISOString()
        : null;
      const breakEndDateTime = (formData.breakEndDate && formData.breakEndTime)
        ? new Date(`${formData.breakEndDate}T${formData.breakEndTime}`).toISOString()
        : null;

      const totalBreakMinutes = calculateBreakMinutes();

      // Determine status based on the times
      let status: 'active' | 'on_break' | 'completed' = 'active';
      if (clockOutDateTime) {
        status = 'completed';
      } else if (breakStartDateTime && !breakEndDateTime) {
        status = 'on_break';
      }

      const updateData = {
        clock_in_time: clockInDateTime,
        clock_out_time: clockOutDateTime,
        break_start_time: breakStartDateTime,
        break_end_time: breakEndDateTime,
        total_break_minutes: totalBreakMinutes,
        status,
        updated_at: new Date().toISOString()
      };

      console.log('🔵 Updating time entry:', timeEntry.id, updateData);

      const { error: updateError } = await supabase
        .from('time_entries')
        .update(updateData)
        .eq('id', timeEntry.id);

      if (updateError) {
        console.error('🔴 Error updating time entry:', updateError);
        throw updateError;
      }

      console.log('🟢 Time entry updated successfully');

      // Show success toast
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);

      // Refresh the time entries list
      onTimeUpdated();
      
      // Close modal
      onClose();

    } catch (error: any) {
      console.error('🔴 Error updating time entry:', error);
      setError(error.message || 'Failed to update time entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[70] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
          <span className="font-inter font-medium">✅ Time entry updated successfully</span>
        </div>
      )}

      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-dm-sans font-bold text-dark-slate">
                  Edit Time Entry
                </h2>
                <p className="text-sm text-gray-600 font-inter">
                  {getWorkerName()} • {new Date(timeEntry.clock_in_time).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(95vh-120px)]">
            <div className="space-y-4">
              {/* Clock In Section */}
              <div>
                <h3 className="text-base font-dm-sans font-semibold text-dark-slate mb-3 flex items-center">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  Clock In Time *
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.clockInDate}
                      onChange={(e) => handleInputChange('clockInDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.clockInTime}
                      onChange={(e) => handleInputChange('clockInTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Clock Out Section */}
              <div>
                <h3 className="text-base font-dm-sans font-semibold text-dark-slate mb-3 flex items-center">
                  <Clock className="h-5 w-5 text-red-600 mr-2" />
                  Clock Out Time
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.clockOutDate}
                      onChange={(e) => handleInputChange('clockOutDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.clockOutTime}
                      onChange={(e) => handleInputChange('clockOutTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-inter">
                  Leave empty if the worker is still clocked in
                </p>
              </div>

              {/* Break Start Section */}
              <div>
                <h3 className="text-base font-dm-sans font-semibold text-dark-slate mb-3 flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  Break Start Time
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.breakStartDate}
                      onChange={(e) => handleInputChange('breakStartDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.breakStartTime}
                      onChange={(e) => handleInputChange('breakStartTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Break End Section */}
              <div>
                <h3 className="text-base font-dm-sans font-semibold text-dark-slate mb-3 flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  Break End Time
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.breakEndDate}
                      onChange={(e) => handleInputChange('breakEndDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-inter font-medium text-dark-slate mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.breakEndTime}
                      onChange={(e) => handleInputChange('breakEndTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-inter">
                  Leave empty if the worker is currently on break
                </p>
              </div>

              {/* Break Duration Display */}
              {formData.breakStartDate && formData.breakStartTime && formData.breakEndDate && formData.breakEndTime && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-inter font-medium text-blue-800 text-sm">
                      Total Break Time: {calculateBreakMinutes()} minutes
                    </span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-600 text-xs font-inter font-medium">
                      Please fix the following errors:
                    </p>
                    <p className="text-red-600 text-xs font-inter mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-inter font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-inter font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-3 w-3" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTimeModal;